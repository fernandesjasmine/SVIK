import React, { useEffect, useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumb from '../components/Breadcrumb';
import { FaSortUp, FaSortDown } from 'react-icons/fa';
import axios from 'axios';
import { DateTime } from 'luxon';
import { useTheme } from '../context/ThemeContext';


const baseURL = process.env.REACT_APP_API_BASE_URL;

export default function LoginHistory() {
  const { darkMode } = useTheme();
  const userId = localStorage.getItem('userid');
  const userName = localStorage.getItem('username');

  const [searchTerm, setSearchTerm] = useState('');
  const [loginHistory, setLoginHistory] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
  const [fadeIn, setFadeIn] = useState(false);

  const headers = [
    { key: 'name', label: 'Name' },
    { key: 'loginDate', label: 'Login Date' },
    { key: 'logoutDate', label: 'Logout Date' },
  ];

  const fetchLoginHistory = async () => {
    try {
      const res = await axios.post(`${baseURL}/GetLoginHistory`, {
        userId: parseInt(userId),
      });

      const history = res.data.map((entry) => ({
        loginDate: entry.login_date,
        logoutDate:
          entry.logout_date && typeof entry.logout_date === 'string' && entry.logout_date.trim() !== ''
            ? entry.logout_date
            : null,
        name: userName,
      }));

      setLoginHistory(history);
    } catch (err) {
      console.error('Error fetching login history:', err);
      alert('Failed to fetch login history');
    }
  };

  useEffect(() => {
    setFadeIn(true);
    fetchLoginHistory();
  }, []);

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return DateTime.fromISO(dateString, { zone: 'America/Los_Angeles' })
      .setZone('Asia/Kolkata')
      .toFormat('yyyy-MM-dd hh:mm a');
  };

  const filtered = loginHistory.filter(
    (log) =>
      log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.loginDate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.logoutDate || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = useMemo(() => {
    let sortableItems = [...filtered];
    if (sortConfig.key !== '') {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key] || '';
        const bVal = b[sortConfig.key] || '';
        if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filtered, sortConfig]);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />;
    }
    return null;
  };

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentLogs = sorted.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / entriesPerPage);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar />

        <div className={`flex flex-col flex-1 overflow-hidden p-5 transition duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex justify-between items-center mb-4 mt-2">
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-500">Login History</h2>
            <Breadcrumb />
          </div>

          <div className="w-full max-w-screen-xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col max-h-[75vh] overflow-hidden">
            <div className="mb-4 flex justify-between items-center">
              <input
                type="text"
                placeholder="Search ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded px-5 py-0.5 focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:text-gray-200"
              />
              <div className="flex items-center space-x-2 text-sm">
                <span>Show</span>
                <select
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white dark:bg-gray-700"
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  {[10, 25, 50, 100].map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
                <span>entries</span>
              </div>
            </div>

            <div className="overflow-x-auto overflow-y-auto max-h-[60vh] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md">
              <table className="min-w-full text-sm text-gray-800 dark:text-gray-200">
                <thead className="bg-green-100 dark:bg-green-900 sticky top-0 z-10">
                  <tr>
                    {headers.map((header) => (
                      <th
                        key={header.key}
                        className="px-4 py-2 font-semibold text-left cursor-pointer"
                        onClick={() => handleSort(header.key)}
                      >
                        <div className="flex items-center">
                          {header.label}
                          {getSortIcon(header.key)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentLogs.length === 0 ? (
                    <tr className="border-b dark:border-gray-700">
                      <td colSpan={headers.length} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 italic">
                        No records found.
                      </td>
                    </tr>
                  ) : (
                    currentLogs.map((log, index) => (
                      <tr key={index} className="border-b dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-700 transition duration-150">
                        <td className="px-4 py-2">{log.name}</td>
                        <td className="px-4 py-2">{formatDateTime(log.loginDate)}</td>
                        <td className="px-4 py-2">{log.logoutDate ? formatDateTime(log.logoutDate) : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between mt-4 text-sm items-center text-gray-800 dark:text-gray-200">
              <span>
                Showing {filtered.length === 0 ? 0 : indexOfFirst + 1} to {Math.min(indexOfLast, filtered.length)} of {filtered.length} entries
              </span>
              <div className="flex gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600"
                >
                  Previous
                </button>
                {[...Array(totalPages).keys()].map((num) => (
                  <button
                    key={num + 1}
                    onClick={() => setCurrentPage(num + 1)}
                    className={`px-3 py-1 border rounded ${
                      currentPage === num + 1 ? 'bg-green-600 text-white dark:bg-green-500' : 'dark:border-gray-600 dark:text-gray-200'
                    }`}
                  >
                    {num + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
