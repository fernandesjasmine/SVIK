import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import leftImage from '../assets/left_image.jpg';

const baseURL = process.env.REACT_APP_API_BASE_URL;

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.warn('Please enter both username and password');
      return;
    }

    const toastId = toast.loading('Signing in...', {
      style: {
        fontSize: '14px',
        padding: '10px 20px',
        borderRadius: '10px',
      },
    });

    try {
      const response = await axios.post(`${baseURL}/Login`, {
        username,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (typeof response.data === 'string') {
        toast.update(toastId, {
          render: 'Invalid Credentials',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
          style: {
            fontSize: '14px',
            padding: '10px 20px',
            borderRadius: '10px',
          },
        });
      } else {
        const { pgatoken, userid } = response.data;
        localStorage.setItem('token', pgatoken);
        localStorage.setItem('userid', userid);
        localStorage.setItem('username', username);

        toast.update(toastId, {
          render: 'Login successful!',
          type: 'success',
          isLoading: false,
          autoClose: 2000,
          style: {
            fontSize: '14px',
            padding: '10px 20px',
            borderRadius: '10px',
          },
        });

        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (error) {
      console.error(error);
      toast.update(toastId, {
        render: 'Server error. Please try again.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
        style: {
          fontSize: '14px',
          padding: '10px 20px',
          borderRadius: '10px',
        },
      });
    }
  };

  const registerAccount = () => navigate('/register');

  const headingContainer = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.05 }
    }
  };

  const letter = {
    hidden: { opacity: 0, y: `0.25em` },
    visible: {
      opacity: 1,
      y: `0em`,
      transition: { duration: 0.4, ease: [0.2, 0.65, 0.3, 0.9] }
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen h-screen w-screen overflow-hidden font-sans bg-gray-100">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        transition={Slide}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastClassName="text-sm"
      />

      {/* LEFT SECTION */}
      <div className="relative md:w-[55%] h-64 md:h-auto overflow-hidden rounded-br-[40px] rounded-tr-[40px]">
        <motion.img
          src={leftImage}
          alt="Decorative"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 5, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        <motion.div
          className="relative z-10 flex flex-col justify-center h-full p-8 md:p-12 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md flex flex-wrap"
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
            className="max-w-md text-lg md:text-xl drop-shadow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            Discover unique handmade tiles that transform your spaces with natural charm.
          </motion.p>
        </motion.div>
      </div>

      {/* RIGHT SECTION */}
      <div className="relative md:w-[45%] flex items-center justify-center p-4 md:p-8 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-300 rounded-full filter blur-[160px] opacity-40 z-0"></div>
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-teal-300 rounded-full filter blur-[160px] opacity-30 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white opacity-20 z-0"></div>

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 70, damping: 12 }}
          className="w-full max-w-sm p-6 md:p-8 bg-white rounded-2xl shadow-2xl relative z-10"
        >
          <h1 className="text-3xl font-bold mb-2 text-emerald-800 text-center">Sign In</h1>
          <p className="text-gray-600 mb-6 text-center text-sm">Welcome back! Please log in.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-emerald-600 cursor-pointer text-xs"
              >
                {showPassword ? 'Hide' : 'Show'}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Remember me
              </label>
              <a href="#" className="text-emerald-700 hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-700 text-white py-2 rounded-lg hover:bg-emerald-800 transition text-sm font-semibold"
            >
              Sign In
            </button>
          </form>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="px-2 text-gray-500 text-xs">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <p className="text-center text-sm">
            Don’t have an account?{' '}
            <a href="#" className="text-emerald-700 hover:underline" onClick={registerAccount}>
              Create an Account
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}