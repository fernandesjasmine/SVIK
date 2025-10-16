import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { FaSortUp, FaSortDown } from 'react-icons/fa';
import Breadcrumb from '../components/Breadcrumb';

export default function UserActivityLog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
  const [fadeIn, setFadeIn] = useState(false);

  // Sample data to simulate API response
  const activityLogs = [
    { id: 1, name: 'Admin John', action: 'Created User', logDate: '2024-07-01 09:00' },
    { id: 2, name: 'Admin Jane', action: 'Deleted Product', logDate: '2024-07-02 10:30' },
    { id: 3, name: 'Admin Alice', action: 'Updated Settings', logDate: '2024-07-02 11:45' },
    { id: 4, name: 'Admin Bob', action: 'Viewed Reports', logDate: '2024-07-03 12:15' },
    { id: 5, name: 'Admin Charlie', action: 'Approved Order', logDate: '2024-07-03 14:20' },
    { id: 6, name: 'Admin John', action: 'Created User', logDate: '2024-07-01 09:00' },
    { id: 7, name: 'Admin Jane', action: 'Deleted Product', logDate: '2024-07-02 10:30' },
    { id: 8, name: 'Admin Alice', action: 'Updated Settings', logDate: '2024-07-02 11:45' },
    { id: 9, name: 'Admin Bob', action: 'Viewed Reports', logDate: '2024-07-03 12:15' },
    { id: 10, name: 'Admin Charlie', action: 'Approved Order', logDate: '2024-07-03 14:20' },
    { id: 11, name: 'Admin John', action: 'Created User', logDate: '2024-07-01 09:00' },
    { id: 12, name: 'Admin Jane', action: 'Deleted Product', logDate: '2024-07-02 10:30' },
    { id: 13, name: 'Admin Alice', action: 'Updated Settings', logDate: '2024-07-02 11:45' },
    { id: 14, name: 'Admin Bob', action: 'Viewed Reports', logDate: '2024-07-03 12:15' },
    { id: 15, name: 'Admin Charlie', action: 'Approved Order', logDate: '2024-07-03 14:20' },
  ];

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const headers = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Source' },
    { key: 'action', label: 'Action' },
    { key: 'logDate', label: 'Log Date' },
  ];

  const filtered = activityLogs.filter(
    (log) =>
      log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.logDate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = useMemo(() => {
    let sortableItems = [...filtered];
    if (sortConfig.key !== '') {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
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
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />;
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
        <div className={`flex flex-col flex-1 p-6 overflow-auto transition duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-green-800 dark:text-green-200">Admin Activity Log</h1>
            <Breadcrumb />
          </div>

          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center space-x-2 text-sm text-gray-800 dark:text-gray-200">
              <span>Show</span>
              <select
                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-800 dark:text-gray-200"
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

            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded px-5 py-1 focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md">
            <table className="min-w-full text-sm text-gray-800 dark:text-gray-200">
              <thead className="bg-green-100 dark:bg-green-900 sticky top-0 z-10">
                <tr>
                  {headers.map(({ key, label }) => (
                    <th
                      key={key}
                      className="px-4 py-2 font-semibold text-left cursor-pointer"
                      onClick={() => handleSort(key)}
                    >
                      <div className="flex items-center">
                        {label}
                        {getSortIcon(key)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentLogs.length === 0 ? (
                  <tr className="border-b dark:border-gray-700">
                    <td colSpan={headers.length} className="px-4 py-6 text-center text-gray-500 italic">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  currentLogs.map((log) => (
                    <tr key={log.id} className="border-b dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-700 transition duration-150">
                      <td className="px-4 py-2">{log.id}</td>
                      <td className="px-4 py-2">{log.name}</td>
                      <td className="px-4 py-2">{log.action}</td>
                      <td className="px-4 py-2">{log.logDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between mt-4 text-sm items-center text-gray-800 dark:text-gray-200">
            <span>
              Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filtered.length)} of {filtered.length} entries
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border dark:border-gray-700 rounded disabled:opacity-50"
              >
                Previous
              </button>
              {[...Array(totalPages).keys()].map((num) => (
                <button
                  key={num + 1}
                  onClick={() => setCurrentPage(num + 1)}
                  className={`px-3 py-1 border dark:border-gray-700 rounded ${
                    currentPage === num + 1 ? 'bg-green-600 text-white' : 'dark:text-gray-200'
                  }`}
                >
                  {num + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border dark:border-gray-700 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}