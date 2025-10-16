import React from 'react'
import { HiDatabase, HiOutlineCube, HiOutlineChat, HiOutlineUserAdd } from 'react-icons/hi';

export default function StatsSection() {
     const stats = [
        { title: 'Earnings', value: '9856', icon: <HiDatabase size={32} />, bg: 'bg-green-700', overlay: 'bg-green-600/30' },
        { title: 'Products', value: '9856', icon: <HiOutlineCube size={32} />, bg: 'bg-yellow-700', overlay: 'bg-yellow-600/30' },
        { title: 'Messages', value: '893', icon: <HiOutlineChat size={32} />, bg: 'bg-emerald-700', overlay: 'bg-emerald-600/30' },
        { title: 'New User', value: '4531', icon: <HiOutlineUserAdd size={32} />, bg: 'bg-teal-700', overlay: 'bg-teal-600/30' },
      ];
    
  return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className={`relative ${stat.bg} rounded-lg p-6 text-white overflow-hidden`}>
            <div className="relative z-10">
              <div className="mb-2">{stat.icon}</div>
              <h3 className="text-md font-semibold">{stat.title}</h3>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
            <div className={`absolute right-4 bottom-4 w-24 h-24 rounded-full ${stat.overlay} z-0`}></div>
          </div>
        ))}
      </div>
      
  )
}
