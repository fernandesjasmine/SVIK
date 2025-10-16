import React, { useState, useEffect } from 'react';
import { HiDatabase, HiOutlineCube, HiOutlineChat, HiOutlineUserAdd } from 'react-icons/hi';
import StatsSection from '../components/StatsSection';
import axios from 'axios'
//import Breadcrumbs from '../components/Breadcrumb';
const baseURL = process.env.REACT_APP_API_BASE_URL;

export default function MainContent() {
  const [fadeIn, setFadeIn] = useState(false);
  const [userData,setUserData]=useState(null)

  useEffect(() => {
    setFadeIn(true)
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

    const getName = (name) => {
    if (!name) return '';
    return name;
  };
  const stats = [
    { title: 'Earnings', value: '9856', icon: <HiDatabase size={32} />, bg: 'bg-green-700', overlay: 'bg-green-600/30' },
    { title: 'Products', value: '9856', icon: <HiOutlineCube size={32} />, bg: 'bg-yellow-700', overlay: 'bg-yellow-600/30' },
    { title: 'Messages', value: '893', icon: <HiOutlineChat size={32} />, bg: 'bg-emerald-700', overlay: 'bg-emerald-600/30' },
    { title: 'New User', value: '4531', icon: <HiOutlineUserAdd size={32} />, bg: 'bg-teal-700', overlay: 'bg-teal-600/30' },
  ];

  return (
    <div
      className={`flex flex-col flex-1 p-6 overflow-auto transform transition-all duration-700 ${
        fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="bg-green-700 text-white rounded-lg p-6 flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Welcome Back, {getName(userData?.user_name)}</h2>
          <p className="text-sm md:text-base max-w-xl">
            Welcome to the Viho Family! We are glad that you are visiting this dashboard.
            We will be happy to help you grow your business.
          </p>
        </div>
        <button className="mt-4 md:mt-0 bg-white text-green-700 px-4 py-2 rounded-md font-semibold hover:bg-green-100 transition">
          Update
        </button>
      </div>

      <StatsSection />
<div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
  <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
    Project Progress
  </h3>
  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
    <div
      className="bg-green-600 h-4 rounded-full transition-all duration-1000 ease-in-out"
      style={{ width: '70%' }}
    ></div>
  </div>
  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
    70% Completed
  </p>
</div>
        
      <footer className="mt-auto py-4 text-center text-sm text-gray-500">
        © 2025 TiVi Dashboard. All rights reserved.
      </footer>
    </div>
  );
}
