import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import leftImage from '../assets/left_image.jpg';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    if (username && email && phone && company && password && confirmPassword) {
      if (password === confirmPassword) {
        navigate('/dashboard');
      } else {
        alert('Passwords do not match');
      }
    } else {
      alert('Please fill in all fields');
    }
  };

  const loginAccount = () => {
    navigate('/');
  };

  const headingContainer = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.05 },
    },
  };
  const letter = {
    hidden: { opacity: 0, y: `0.25em` },
    visible: {
      opacity: 1,
      y: `0em`,
      transition: { duration: 0.4, ease: [0.2, 0.65, 0.3, 0.9] },
    },
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-sans bg-gray-100 overflow-hidden">
      {/* LEFT SECTION */}
      <div className="relative md:w-[55%] h-64 md:h-auto overflow-hidden rounded-br-[40px] rounded-tr-[40px]">
        <motion.img
          src={leftImage}
          alt="Decorative"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 5, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        <motion.div
          className="relative z-10 flex flex-col justify-center h-full p-8 md:p-12 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-md flex flex-wrap"
            variants={headingContainer}
            initial="hidden"
            animate="visible"
          >
            {'Welcome to TiVi'.split('').map((char, index) => (
              <motion.span key={index} variants={letter}>
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </motion.h2>

          <motion.p
            className="max-w-md text-sm md:text-base drop-shadow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            Discover unique handmade tiles that transform your spaces with natural charm.
          </motion.p>
        </motion.div>
      </div>

      {/* RIGHT SECTION */}
      <div className="relative md:w-[45%] flex justify-center items-center p-4 md:p-6 overflow-hidden">
        {/* Soft blurred blobs */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-300 rounded-full filter blur-[140px] opacity-40 z-0"></div>
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-teal-300 rounded-full filter blur-[140px] opacity-30 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white opacity-20 z-0"></div>

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 70, damping: 12 }}
          className="w-full max-w-lg p-6 md:p-6 bg-white rounded-2xl shadow-2xl relative z-10"
        >
          <h1 className="text-2xl font-bold mb-1 text-emerald-800">Create Account</h1>
          <p className="text-gray-600 mb-3 text-xs">
            Quick registration to get started.
          </p>

          <form onSubmit={handleRegister} className="flex flex-col gap-y-2">
            <div>
              <label className="block text-xs font-semibold mb-1">Username</label>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Phone</label>
              <input
                type="tel"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Company Name</label>
              <input
                type="text"
                placeholder="Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold mb-1">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-7 text-emerald-600 cursor-pointer text-xs"
              >
                {showPassword ? 'Hide' : 'Show'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-700 text-white py-2 text-xs rounded-md hover:bg-emerald-800"
            >
              Sign Up
            </button>
          </form>

          <p className="text-center text-xs mt-3">
            Already registered?{' '}
            <span className="text-emerald-700 hover:underline cursor-pointer" onClick={loginAccount}>
              Sign In
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}