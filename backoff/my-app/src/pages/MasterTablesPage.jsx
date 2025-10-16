// src/pages/MasterTablesPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumbs from '../components/Breadcrumb';

export default function MasterTablesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const masterTables = [
    { name: "Space", path: "/spaceMaster" },
    { name: "Color", path: "/colorMaster" },
    { name: "Category", path: "/categoryMaster" },
    { name: "Size", path: "/sizeMaster" },
    { name: "Profile", path: "/profileMaster" },
    { name: "Application", path: "/applicationMaster" },
    { name: "Finish", path: "/finishMaster" },
    { name: "User", path: "/userMaster" },
    { name: "Company", path: "/companyMaster" },
 
    { name: "Plan", path: "/planMaster" }
  ];

  // Sort alphabetically (case-insensitive)
  const sortedTables = [...masterTables].sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );

  const filteredTables = sortedTables.filter((table) =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      <Sidebar />

      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <Topbar />

        <div className="p-5 flex-1 overflow-hidden">
          {/* Breadcrumb same as Reports page */}
          <Breadcrumbs currentPage="Masters" />

          <div className="flex justify-center items-center px-4 py-6 h-full">
            <div className="w-full max-w-screen-xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col h-full">
              <h2 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-4">
                Masters
              </h2>

              {/* Search Bar */}
              <input
                type="text"
                placeholder="Search masters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full mb-4 px-4 py-1.5 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-500 dark:scrollbar-thumb-green-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-700 rounded-md">
                <ul className="space-y-4">
                  {filteredTables.map((table, index) => (
                    <li
                      key={index}
                      className={`text-sm font-light px-4 py-[4px] border-b border-gray-200 dark:border-gray-700 
                               hover:bg-green-100 dark:hover:bg-gray-700 transition duration-150
                               ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}`}
                    >
                      <Link
                        to={table.path}
                        className="text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 block w-full"
                      >
                        {table.name}
                      </Link>
                    </li>
                  ))}

                  {filteredTables.length === 0 && (
                    <li className="text-gray-500 dark:text-gray-400 text-center mt-4">
                      No matching tables found.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}