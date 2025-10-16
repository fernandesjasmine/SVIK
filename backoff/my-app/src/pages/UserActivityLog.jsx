import React, { useState, useEffect } from 'react';
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
  const [collapsed, setCollapsed] = useState(false); // Add collapsed state

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const userLogs = [
    { id: 1, xsource: 'Web', ip: '192.168.0.1', url: '/home', tileId: 101, created: '2024-07-01 10:00', block: 0 },
    { id: 2, xsource: 'API', ip: '192.168.0.2', url: '/api/data', tileId: 102, created: '2024-07-01 11:30', block: 1 },
    { id: 3, xsource: 'Web', ip: '192.168.0.3', url: '/about', tileId: 103, created: '2024-07-02 09:15', block: 1 },
    { id: 4, xsource: 'Mobile', ip: '192.168.0.4', url: '/login', tileId: 104, created: '2024-07-02 14:00', block: 0 },
    { id: 5, xsource: 'Web', ip: '192.168.0.5', url: '/contact', tileId: 105, created: '2024-07-03 12:45', block: 1 },
    { id: 6, xsource: 'API', ip: '192.168.0.6', url: '/api/user', tileId: 106, created: '2024-07-03 15:30', block: 0 },
    { id: 7, xsource: 'API', ip: '192.168.0.7', url: '/api/admin', tileId: 107, created: '2024-07-04 11:00', block: 1 },
    { id: 8, xsource: 'Web', ip: '192.168.0.8', url: '/dashboard', tileId: 108, created: '2024-07-05 09:30', block: 0 },
    { id: 9, xsource: 'Mobile', ip: '192.168.0.9', url: '/profile', tileId: 109, created: '2024-07-06 16:20', block: 1 },
    { id: 10, xsource: 'API', ip: '192.168.0.10', url: '/api/settings', tileId: 110, created: '2024-07-07 12:10', block: 1 },
    { id: 11, xsource: 'Web', ip: '192.168.0.11', url: '/support', tileId: 111, created: '2024-07-08 10:45', block: 0 },
    { id: 12, xsource: 'API', ip: '192.168.0.12', url: '/api/help', tileId: 112, created: '2024-07-09 14:15', block: 1 },
    { id: 13, xsource: 'Mobile', ip: '192.168.0.13', url: '/mobile/home', tileId: 113, created: '2024-07-10 08:30', block: 0 },
    { id: 14, xsource: 'Web', ip: '192.168.0.14', url: '/news', tileId: 114, created: '2024-07-11 17:00', block: 1 },
    { id: 15, xsource: 'API', ip: '192.168.0.15', url: '/api/newuser', tileId: 115, created: '2024-07-12 19:25', block: 0 },
  ];

  const headers = [
    { key: 'id', label: 'ID' },
    { key: 'xsource', label: 'Source' },
    { key: 'ip', label: 'IP Address' },
    { key: 'url', label: 'URL' },
    { key: 'tileId', label: 'Tile ID' },
    { key: 'created', label: 'Created At' },
  ];

  const filtered = userLogs.filter(
    (log) =>
      log.xsource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = React.useMemo(() => {
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

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentLogs = sorted.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / entriesPerPage);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={`flex flex-col flex-1 overflow-y-auto p-6 transition duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex justify-between mb-4 items-center">
            <h1 className="text-2xl font-bold text-green-800 dark:text-green-200">User Activity Log</h1>
            <Breadcrumb/>
          </div>

          <div className="flex flex-col md:flex-row md:justify-between mb-4 gap-4">
            <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <span>Show</span>
              <select
                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-200"
                value={entriesPerPage}
                onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
              >
                {[10, 25, 50, 100].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
              <span>entries</span>
            </div>
            <input
              type="text"
              placeholder="Search Source, IP, URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded w-full max-w-xs dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md">
            <table className="min-w-full text-sm text-gray-800 dark:text-gray-200">
              <thead className="bg-green-100 dark:bg-green-900 sticky top-0 z-10">
                <tr>
                  {headers.map(({ key, label }) => (
                    <th key={key} className="px-4 py-2 font-semibold cursor-pointer text-left" onClick={() => handleSort(key)}>
                      <div className="flex items-center gap-1">
                        {label}
                        {sortConfig.key === key && (
                          sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-2 font-semibold text-left">Block</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentLogs.map((log) => (
                  <tr key={log.id} className="border-b dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-700 transition duration-150">
                    <td className="px-4 py-2">{log.id}</td>
                    <td className="px-4 py-2">{log.xsource}</td>
                    <td className="px-4 py-2">{log.ip}</td>
                    <td className="px-4 py-2">{log.url}</td>
                    <td className="px-4 py-2">{log.tileId}</td>
                    <td className="px-4 py-2">{log.created}</td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${log.block ? 'bg-green-600' : 'bg-red-500'}`}></span>
                        {log.block ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between mt-4 text-sm items-center text-gray-800 dark:text-gray-200">
            <span>
              Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filtered.length)} of {filtered.length} entries
            </span>
            <div className="flex gap-1">
              <button onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border dark:border-gray-700 rounded disabled:opacity-50">
                Previous
              </button>
              {[...Array(totalPages).keys()].map(num => (
                <button key={num + 1} onClick={() => setCurrentPage(num + 1)} className={`px-3 py-1 border dark:border-gray-700 rounded ${currentPage === num + 1 ? 'bg-green-600 text-white' : ''}`}>
                  {num + 1}
                </button>
              ))}
              <button onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border dark:border-gray-700 rounded disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}