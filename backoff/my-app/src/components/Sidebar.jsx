import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBoxOpen } from 'react-icons/fa';
import { FiGrid, FiActivity, FiChevronLeft, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import { useSidebar } from '../context/SidebarContext';
import BrandLogo from '../assets/brand_logo.PNG';
import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL;

export default function Sidebar({ darkMode }) {
  const { sidebarCollapsed, toggleSidebar } = useSidebar();
  const [userData, setUserData] = useState(null);
  const [productDropdown, setProductDropdown] = useState(false);
  const [hoverFlyout, setHoverFlyout] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem('userid');
        if (!userId) return;

        const res = await axios.get(`${baseURL}/GetUserList`);
        if (res.data && Array.isArray(res.data)) {
          const user = res.data.find(u => String(u.user_id) === String(userId));
          if (user) {
            setUserData(user);
          }
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchUser();
  }, []);

  const getInitial = (name) => {
    if (!name) return '';
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <div className="relative overflow-visible z-50">
      <div
        className={`${
          sidebarCollapsed ? 'w-16' : 'w-60'
        } h-screen bg-white dark:bg-gray-900 shadow-2xl border-r border-gray-200 dark:border-gray-700 
        rounded-br-3xl flex flex-col justify-between p-3 transition-all duration-300 ease-in-out`}
        style={{ borderTopLeftRadius: '0px' }}
      >
        {/* Header: Logo + Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img
              src={BrandLogo}
              alt="Brand Logo"
              className="w-10 h-10 object-contain rounded-sm"
            />
            {!sidebarCollapsed && (
              <span className="text-2xl font-semibold text-gray-800 dark:text-gray-100 tracking-wide font-sans">
                TiVi
              </span>
            )}
          </div>

          {/* User card */}
          {!sidebarCollapsed && (
            <>
              <div className="flex flex-col items-center text-center mb-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-md">
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-700 dark:from-green-600 dark:to-green-800 flex items-center justify-center shadow-lg mb-3">
                  <span className="text-3xl font-bold text-white">
                    {getInitial(userData?.user_name)}
                  </span>
                </div>
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                  {userData?.user_name || ''}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Super Admin Department
                </p>
              </div>

              {/* Divider */}
              <hr className="border-t border-gray-300 dark:border-gray-700 mb-4" />
            </>
          )}

          {/* Navigation */}
          <nav className="space-y-2 mt-2">
            {/* Products Dropdown / Flyout */}
            <div
              className="relative"
              onMouseEnter={() => sidebarCollapsed && setHoverFlyout(true)}
              onMouseLeave={() => sidebarCollapsed && setHoverFlyout(false)}
            >
              {/* Main Button */}
              <button
                onClick={() => !sidebarCollapsed && setProductDropdown(!productDropdown)}
                className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-green-700 hover:text-white transition"
              >
                <div className="flex items-center gap-3">
                  <FaBoxOpen className="text-xl" />
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium">Products</span>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <FiChevronDown
                    className={`text-sm transition-transform duration-200 ${
                      productDropdown ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>

              {/* Expanded Dropdown (when sidebar open) */}
              {!sidebarCollapsed && productDropdown && (
                <div className="ml-8 mt-1 flex flex-col space-y-1">
                  <Link
                    to="/tileMaster"
                    className="px-3 py-1 text-sm rounded-md text-gray-700 dark:text-gray-200 hover:bg-green-600 hover:text-white transition"
                  >
                    Products Info
                  </Link>
                  <Link
                    to="/tileImage"
                    className="px-3 py-1 text-sm rounded-md text-gray-700 dark:text-gray-200 hover:bg-green-600 hover:text-white transition"
                  >
                    Images
                  </Link>
                </div>
              )}

              {/* Flyout (when sidebar collapsed) */}
              {sidebarCollapsed && hoverFlyout && (
                <div className="absolute top-0 left-full bg-white dark:bg-gray-800 shadow-lg rounded-xl py-2 w-48 animate-fade-in">
                  <p className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                    Products
                  </p>
                  <Link
                    to="/tileMaster"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-600 hover:text-white"
                  >
                    Products Info
                  </Link>
                  <Link
                    to="/tileImage"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-600 hover:text-white"
                  >
                    Images
                  </Link>
                </div>
              )}
            </div>

            {/* Masters */}
            <Link
              to="/masterTables"
              title="Masters"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-green-700 hover:text-white transition"
            >
              <FiGrid className="text-xl" />
              {!sidebarCollapsed && <span className="text-sm font-medium">Masters</span>}
            </Link>

            {/* Logs */}
            <Link
              to="/reportsPage"
              title="Logs"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-green-700 hover:text-white transition"
            >
              <FiActivity className="text-xl" />
              {!sidebarCollapsed && <span className="text-sm font-medium">Logs</span>}
            </Link>
          </nav>
        </div>
      </div>

      {/* Floating Toggle Button */}
      <button
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute top-8 -right-5 z-[999] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
          shadow-md p-1.5 rounded-full hover:bg-green-600 hover:text-white transition"
        title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {sidebarCollapsed ? (
          <FiChevronRight className="text-lg text-gray-800 dark:text-gray-100" />
        ) : (
          <FiChevronLeft className="text-lg text-gray-800 dark:text-gray-100" />
        )}
      </button>
    </div>
  );
}
