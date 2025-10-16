import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft, FaInfoCircle, FaImages, FaInfo } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumb from '../components/Breadcrumb';

// Fallback base URL for API
const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://svikinfotech.com/clients/visualizer/api';
// Base URLs for images
const bigImageBaseURL = 'http://svikinfotech-001-site25.jtempurl.com/assets/media/big/';
const thumbImageBaseURL = 'http://svikinfotech-001-site25.jtempurl.com/assets/media/thumb/';
const fallbackImageURL = 'https://via.placeholder.com/150';

export default function ViewTilePage() {
  const { tileId } = useParams(); // tileId is expected to be the sku_code
  const [tile, setTile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [activeTab, setActiveTab] = useState('images');

  useEffect(() => {
    let isMounted = true;
    const source = axios.CancelToken.source();

    const fetchTileDetails = async () => {
      if (!tileId || !/^[a-zA-Z0-9-]+$/.test(tileId)) {
        if (isMounted) {
          setError('Invalid SKU code');
          toast.error('Invalid SKU code', { autoClose: 5000 });
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError('');
      try {
        const normalizedBaseURL = baseURL.replace(/\/+$/, '');
        const url = `${normalizedBaseURL}/GetTileList`;
        console.log('Fetching from URL:', url);
        console.log('Looking for sku_code:', tileId);

        const res = await axios.get(url, {
          headers: { 'Content-Type': 'application/json' },
          timeout: Number(process.env.REACT_APP_API_TIMEOUT) || 10000,
          cancelToken: source.token,
        });

        if (isMounted) {
          console.log('API Response:', JSON.stringify(res.data, null, 2));
          let tileData = [];
          if (Array.isArray(res.data)) {
            tileData = res.data;
          } else if (res.data?.tiles) {
            tileData = res.data.tiles;
          } else if (res.data?.data?.tiles) {
            tileData = res.data.data.tiles;
          } else if (res.data?.data) {
            tileData = Array.isArray(res.data.data) ? res.data.data : [];
          } else {
            throw new Error('Unexpected API response structure');
          }
          console.log('Parsed tileData:', JSON.stringify(tileData, null, 2));

          const matchingTile = tileData.find((tile) => {
            const match = String(tile.sku_code).trim() === String(tileId).trim();
            console.log(`Checking tile with sku_code: ${tile.sku_code}, Match: ${match}`);
            return match;
          });

          if (matchingTile) {
            console.log('Tile found:', JSON.stringify(matchingTile, null, 2));
            console.log('Image URLs:', {
              tileImage: matchingTile.image ? `${bigImageBaseURL}${matchingTile.image}` : `${bigImageBaseURL}${matchingTile.sku_code}.jpg`,
              thumbImage: matchingTile.thumb_image ? `${thumbImageBaseURL}${matchingTile.thumb_image}` : `${thumbImageBaseURL}${matchingTile.sku_code}.jpg`,
              facesImage: matchingTile.faces_image ? `${bigImageBaseURL}${matchingTile.faces_image}` : `${bigImageBaseURL}${matchingTile.sku_code}.jpg`,
            });
            setTile(matchingTile);
          } else {
            console.warn(`No tile found with sku_code: ${tileId}`);
            setError(`No tile found with SKU code ${tileId}.`);
            toast.error(`No tile found with SKU code ${tileId}`, { autoClose: 5000 });
          }
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        if (!isMounted) return;

        let errorMessage = 'Failed to fetch tile list';
        if (err.code === 'ERR_NETWORK') {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (err.response?.status === 404) {
          errorMessage = 'Tile list endpoint not found.';
        } else {
          errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred';
        }
        console.error('API Error:', err);
        setError(errorMessage);
        toast.error(errorMessage, { autoClose: 5000 });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchTileDetails();

    return () => {
      isMounted = false;
      source.cancel('Request canceled due to component unmount');
    };
  }, [tileId]);

  // Placeholder for POST API call
  const handlePostAction = async () => {
    if (!tile) return;

    setIsLoading(true);
    setError('');
    try {
      const normalizedBaseURL = baseURL.replace(/\/+$/, '');
      const url = `${normalizedBaseURL}/TileDetails`; // Replace with actual endpoint
      const payload = {
        sku_code: tileId,
        userId: localStorage.getItem('userid'),
      };
      console.log('POST Payload:', payload);
      const res = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: Number(process.env.REACT_APP_API_TIMEOUT) || 10000,
      });
      console.log('POST Response:', res.data);
      toast.success('POST action successful', { autoClose: 5000 });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to perform POST action';
      console.error('POST Error:', err);
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  // Lightbox handlers
  const openLightbox = (imageSrc) => {
    setLightboxImage(imageSrc);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 to-cyan-100 dark:from-green-900 dark:to-gray-900 scroll-smooth font-poppins">
      <Sidebar theme="light" className="fixed top-0 left-0 h-full w-84 bg-white dark:bg-gray-800 shadow-lg" />
      <div className="flex flex-col flex-1 ml-0 md:ml-0">
        <Topbar theme="light" className="sticky top-0 z-20 bg-white dark:bg-gray-800 shadow-lg" />
        <div className="flex flex-col flex-1 p-6 sm:p-8 md:p-10 lg:p-12 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-teal-700 dark:text-teal-300 tracking-tight">Product Details</h2>
            <Breadcrumb className="animate-fade-in-up" />
          </div>

          <div className="w-full max-w-8xl mx-auto">
            {error && (
              <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 rounded-xl flex justify-between items-center animate-slide-in-left">
                {error}
                <button
                  className="text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-red-400 font-bold"
                  onClick={() => setError('')}
                  aria-label="Close error message"
                >
                  ×
                </button>
              </div>
            )}

            {isLoading && (
              <div className="text-center text-gray-600 dark:text-gray-300 py-10 animate-fade-in-up">
                <svg
                  className="animate-spin h-10 w-10 mx-auto text-teal-600 dark:text-teal-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                <p className="mt-3 text-base font-medium">Loading product details...</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
              {/* Hero Image Section */}
              <div className="bg-gradient-to-br from-white to-teal-50 dark:from-gray-800 dark:to-teal-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in-up">
                <h3 className="text-2xl font-semibold text-teal-800 dark:text-teal-200 mb-5">Main Image</h3>
                <div className="relative group cursor-pointer" onClick={() => openLightbox(tile?.image ? `${bigImageBaseURL}${tile.image}` : `${bigImageBaseURL}${tile?.sku_code}.jpg` || fallbackImageURL)}>
                  <img
                    src={tile?.image ? `${bigImageBaseURL}${tile.image}` : `${bigImageBaseURL}${tile?.sku_code}.jpg` || fallbackImageURL}
                    alt={tile?.sku_name || 'Tile Image'}
                    className="w-full h-96 object-cover rounded-xl border border-teal-200 dark:border-teal-700 group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      console.error('Tile image failed to load:', tile?.image ? `${bigImageBaseURL}${tile.image}` : `${bigImageBaseURL}${tile?.sku_code}.jpg` || fallbackImageURL);
                      e.target.src = fallbackImageURL;
                      e.target.alt = 'Image not found';
                    }}
                  />
                  <div className="absolute inset-0 bg-teal-500 bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-500 rounded-xl flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">Click to enlarge</span>
                  </div>
                </div>
              </div>

              {/* Details and Tabs Section */}
              <div className="bg-gradient-to-br from-white to-teal-50 dark:from-gray-800 dark:to-teal-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in-up">
                <h3 className="text-2xl font-semibold text-teal-800 dark:text-teal-200 mb-5">Product Details</h3>
                {/* Tabs */}
                <div className="mb-6">
                  <div className="flex border-b border-teal-200 dark:border-teal-700">
                    <button
                      className={`flex-1 py-2 text-center font-medium ${activeTab === 'details' ? 'text-teal-600 dark:text-teal-300 border-b-2 border-teal-600' : 'text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-300'}`}
                      onClick={() => setActiveTab('details')}
                    >
                      <FaInfo className="inline-block mr-2" /> Details
                    </button>
                    <button
                      className={`flex-1 py-2 text-center font-medium ${activeTab === 'images' ? 'text-teal-600 dark:text-teal-300 border-b-2 border-teal-600' : 'text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-300'}`}
                      onClick={() => setActiveTab('images')}
                    >
                      <FaImages className="inline-block mr-2" /> Images
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'details' && (
                  <div className="space-y-4 text-gray-700 dark:text-gray-200">
                    <p className="flex items-center">
                      <span className="font-medium w-36 text-teal-600 dark:text-teal-300">SKU Name:</span>
                      <span>{tile?.sku_name || 'N/A'}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium w-36 text-teal-600 dark:text-teal-300">SKU Code:</span>
                      <span>{tile?.sku_code || 'N/A'}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium w-36 text-teal-600 dark:text-teal-300">Category:</span>
                      <span>{tile?.cat_name || 'N/A'}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium w-36 text-teal-600 dark:text-teal-300">Application:</span>
                      <span>{tile?.app_name || 'N/A'}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium w-36 text-teal-600 dark:text-teal-300">Space:</span>
                      <span>{tile?.space_name || 'N/A'}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium w-36 text-teal-600 dark:text-teal-300">Size:</span>
                      <span>{tile?.size_name || 'N/A'}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium w-36 text-teal-600 dark:text-teal-300">Finish:</span>
                      <span>{tile?.finish_name || 'N/A'}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium w-36 text-teal-600 dark:text-teal-300">Color:</span>
                      <span>{tile?.color_name || 'N/A'}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium w-36 text-teal-600 dark:text-teal-300">Status:</span>
                      <span className={tile?.block ? 'text-red-600 dark:text-red-400' : 'text-amber-500 dark:text-amber-400'}>
                        {tile?.block ? 'Blocked' : 'Active'}
                      </span>
                    </p>
                  </div>
                )}

                {activeTab === 'images' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="relative group cursor-pointer" onClick={() => openLightbox(tile?.thumb_image ? `${thumbImageBaseURL}${tile.thumb_image}` : `${thumbImageBaseURL}${tile?.sku_code}.jpg` || fallbackImageURL)}>
                      <p className="text-sm font-medium text-teal-600 dark:text-teal-300 mb-2">Thumb Image</p>
                      <img
                        src={tile?.thumb_image ? `${thumbImageBaseURL}${tile.thumb_image}` : `${thumbImageBaseURL}${tile?.sku_code}.jpg` || fallbackImageURL}
                        alt={tile?.sku_name ? `${tile.sku_name} Thumb` : 'Thumb Image'}
                        className="w-48 h-48 object-cover rounded-xl border border-teal-200 dark:border-teal-700 group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          console.error('Thumb image failed to load:', tile?.thumb_image ? `${thumbImageBaseURL}${tile.thumb_image}` : `${thumbImageBaseURL}${tile?.sku_code}.jpg` || fallbackImageURL);
                          e.target.src = fallbackImageURL;
                          e.target.alt = 'Thumb image not found';
                        }}
                      />
                      <div className="absolute inset-0 bg-teal-500 bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-500 rounded-xl flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">Click to enlarge</span>
                      </div>
                    </div>
                    <div className="relative group cursor-pointer" onClick={() => openLightbox(tile?.faces_image ? `${bigImageBaseURL}${tile.faces_image}` : `${bigImageBaseURL}${tile?.sku_code}.jpg` || fallbackImageURL)}>
                      <p className="text-sm font-medium text-teal-600 dark:text-teal-300 mb-2">Faces Image</p>
                      <img
                        src={tile?.faces_image ? `${bigImageBaseURL}${tile.faces_image}` : `${bigImageBaseURL}${tile?.sku_code}.jpg` || fallbackImageURL}
                        alt={tile?.sku_name ? `${tile.sku_name} Faces` : 'Faces Image'}
                        className="w-48 h-48 object-cover rounded-xl border border-teal-200 dark:border-teal-700 group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          console.error('Faces image failed to load:', tile?.faces_image ? `${bigImageBaseURL}${tile.faces_image}` : `${bigImageBaseURL}${tile?.sku_code}.jpg` || fallbackImageURL);
                          e.target.src = fallbackImageURL;
                          e.target.alt = 'Faces image not found';
                        }}
                      />
                      <div className="absolute inset-0 bg-teal-500 bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-500 rounded-xl flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">Click to enlarge</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/tilemaster"
                className="flex items-center justify-center bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-gray-800 dark:text-gray-100 px-6 py-3 rounded-xl font-medium shadow-md hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-700 animate-pulse-hover transition-all duration-300 disabled:opacity-50"
                aria-label="Back to products list"
                onClick={() => console.log('Link clicked for /tilemaster')}
              >
                <FaArrowLeft className="mr-2" />
                Back to Products
              </Link>
              <button
                onClick={handlePostAction}
                className="flex items-center justify-center bg-gradient-to-r from-teal-600 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:from-teal-700 hover:to-cyan-600 animate-pulse-hover transition-all duration-300 disabled:opacity-50"
                disabled={isLoading || !tile}
                aria-label="Perform POST action"
              >
                <FaInfoCircle className="mr-2" />
                Fetch Additional Details
              </button>
            </div>
          </div>

          {/* Lightbox */}
          {lightboxImage && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in-up" onClick={closeLightbox}>
              <div className="relative max-w-4xl w-full">
                <img
                  src={lightboxImage}
                  alt="Enlarged tile image"
                  className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
                />
                <button
                  className="absolute top-4 right-4 text-white text-2xl font-bold bg-gray-800 bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 transition-all duration-300"
                  onClick={closeLightbox}
                  aria-label="Close lightbox"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'''jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumb from '../components/Breadcrumb';

// Fallback base URL for API
const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://svikinfotech.com/clients/visualizer/api';
// Base URLs for images
const bigImageBaseURL = 'http://svikinfotech-001-site25.jtempurl.com/assets/media/big/';
const thumbImageBaseURL = 'http://svikinfotech-001-site25.jtempurl.com/assets/media/thumb/';
const fallbackImageURL = 'https://via.placeholder.com/150';

export default function ViewTilePage() {
  const { tileId } = useParams(); // tileId is expected to be the sku_code
  const [tile, setTile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const source = axios.CancelToken.source();

    const fetchTileDetails = async () => {
      if (!tileId || !/^[a-zA-Z0-9-]+$/.test(tileId)) {
        if (isMounted) {
          setError('Invalid SKU code');
          toast.error('Invalid SKU code', { autoClose: 5000 });
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError('');
      try {
        const normalizedBaseURL = baseURL.replace(/\/+$/, '');
        const url = `${normalizedBaseURL}/GetTileList`;
        console.log('Fetching from URL:', url);
        console.log('Looking for sku_code:', tileId);

        const res = await axios.get(url, {
          headers: { 'Content-Type': 'application/json' },
          timeout: Number(process.env.REACT_APP_API_TIMEOUT) || 10000,
          cancelToken: source.token,
        });

        if (isMounted) {
          console.log('API Response:', JSON.stringify(res.data, null, 2));
          let tileData = [];
          if (Array.isArray(res.data)) {
            tileData = res.data;
          } else if (res.data?.tiles) {
            tileData = res.data.tiles;
          } else if (res.data?.data?.tiles) {
            tileData = res.data.data.tiles;
          } else if (res.data?.data) {
            tileData = Array.isArray(res.data.data) ? res.data.data : [];
          } else {
            throw new Error('Unexpected API response structure');
          }
          console.log('Parsed tileData:', JSON.stringify(tileData, null, 2));

          const matchingTile = tileData.find((tile) => {
            const match = String(tile.sku_code).trim() === String(tileId).trim();
            console.log(`Checking tile with sku_code: ${tile.sku_code}, Match: ${match}`);
            return match;
          });

          if (matchingTile) {
            console.log('Tile found:', JSON.stringify(matchingTile, null, 2));
            console.log('Image URLs:', {
              tileImage: matchingTile.image ? `${bigImageBaseURL}${matchingTile.image}` : `${bigImageBaseURL}${matchingTile.sku_code}.jpg`,
              thumbImage: matchingTile.thumb_image ? `${thumbImageBaseURL}${matchingTile.thumb_image}` : `${thumbImageBaseURL}${matchingTile.sku_code}.jpg`,
              facesImage: matchingTile.faces_image ? `${bigImageBaseURL}${matchingTile.faces_image}` : `${bigImageBaseURL}${matchingTile.sku_code}.jpg`,
            });
            setTile(matchingTile);
          } else {
            console.warn(`No tile found with sku_code: ${tileId}`);
            setError(`No tile found with SKU code ${tileId}.`);
            toast.error(`No tile found with SKU code ${tileId}`, { autoClose: 5000 });
          }
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        if (!isMounted) return;

        let errorMessage = 'Failed to fetch tile list';
        if (err.code === 'ERR_NETWORK') {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (err.response?.status === 404) {
          errorMessage = 'Tile list endpoint not found.';
        } else {
          errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred';
        }
        console.error('API Error:', err);
        setError(errorMessage);
        toast.error(errorMessage, { autoClose: 5000 });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchTileDetails();

    return () => {
      isMounted = false;
      source.cancel('Request canceled due to component unmount');
    };
  }, [tileId]);

  // Placeholder for POST API call
  const handlePostAction = async () => {
    if (!tile) return;

    setIsLoading(true);
    setError('');
    try {
      const normalizedBaseURL = baseURL.replace(/\/+$/, '');
      const url = `${normalizedBaseURL}/TileDetails`; // Replace with actual endpoint
      const payload = {
        sku_code: tileId,
        userId: localStorage.getItem('userid'),
      };
      console.log('POST Payload:', payload);
      const res = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: Number(process.env.REACT_APP_API_TIMEOUT) || 10000,
      });
      console.log('POST Response:', res.data);
      toast.success('POST action successful', { autoClose: 5000 });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to perform POST action';
      console.error('POST Error:', err);
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900 scroll-smooth">
      <Sidebar theme="light" />
      <div className="flex flex-col flex-1">
        <Topbar theme="light" />
        <div className="flex flex-col flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-3xl font-bold text-green-700 dark:text-green-400 tracking-tight">
              Product Details
            </h2>
            <Breadcrumb />
          </div>

          <div className="w-full max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 rounded-lg flex justify-between items-center transition-all duration-300">
                {error}
                <button
                  className="text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-red-400 font-bold"
                  onClick={() => setError('')}
                  aria-label="Close error message"
                >
                  ×
                </button>
              </div>
            )}

            {isLoading && (
              <div className="text-center text-gray-600 dark:text-gray-300 py-8">
                <svg
                  className="animate-spin h-8 w-8 mx-auto text-green-600 dark:text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                <p className="mt-2 text-sm font-medium">Loading product details...</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Tile Image Section */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Tile Image</h3>
                <div className="relative group">
                  <img
                    src={tile?.image ? `${bigImageBaseURL}${tile.image}` : `${bigImageBaseURL}${tile?.sku_code}.jpg` || fallbackImageURL}
                    alt={tile?.sku_name || 'Tile Image'}
                    className="w-full max-w-sm h-80 object-cover rounded-lg border border-gray-200 dark:border-gray-600 group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      console.error('Tile image failed to load:', tile?.image ? `${bigImageBaseURL}${tile.image}` : `${bigImageBaseURL}${tile?.sku_code}.jpg` || fallbackImageURL);
                      e.target.src = fallbackImageURL;
                      e.target.alt = 'Image not found';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300 rounded-lg"></div>
                </div>
              </div>

              {/* Tile Information Section */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Tile Information</h3>
                {tile ? (
                  <div className="space-y-3 text-gray-700 dark:text-gray-200">
                    <p className="flex items-center">
                      <span className="font-medium w-32">SKU Name:</span>
                      <span>{tile.sku_name || 'N/A'}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium w-32">SKU Code:</span>
                      <span>{tile.sku_code || 'N/A'}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium w-32">Category:</span>
                      <span>{tile.cat_name || 'N/A'}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium w-32">Application:</span>
                      <span>{tile.app_name || 'N/A'}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium w-32">Space:</span>
                      <span>{tile.space_name || 'N/A'}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium w-32">Size:</span>
                      <span>{tile.size_name || 'N/A'}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium w-32">Finish:</span>
                      <span>{tile.finish_name || 'N/A'}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium w-32">Color:</span>
                      <span>{tile.color_name || 'N/A'}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium w-32">Status:</span>
                      <span className={tile.block ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                        {tile.block ? 'Blocked' : 'Active'}
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">No tile data available</p>
                )}
              </div>

              {/* Additional Images Section */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Additional Images</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative group">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Thumb Image</p>
                    <img
                      src={tile?.thumb_image ? `${thumbImageBaseURL}${tile.thumb_image}` : `${thumbImageBaseURL}${tile?.sku_code}.jpg` || fallbackImageURL}
                      alt={tile?.sku_name ? `${tile.sku_name} Thumb` : 'Thumb Image'}
                      className="w-40 h-40 object-cover rounded-lg border border-gray-200 dark:border-gray-600 group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        console.error('Thumb image failed to load:', tile?.thumb_image ? `${thumbImageBaseURL}${tile.thumb_image}` : `${thumbImageBaseURL}${tile?.sku_code}.jpg` || fallbackImageURL);
                        e.target.src = fallbackImageURL;
                        e.target.alt = 'Thumb image not found';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300 rounded-lg"></div>
                  </div>
                  <div className="relative group">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Faces Image</p>
                    <img
                      src={tile?.faces_image ? `${bigImageBaseURL}${tile.faces_image}` : `${bigImageBaseURL}${tile?.sku_code}.jpg` || fallbackImageURL}
                      alt={tile?.sku_name ? `${tile.sku_name} Faces` : 'Faces Image'}
                      className="w-40 h-40 object-cover rounded-lg border border-gray-200 dark:border-gray-600 group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        console.error('Faces image failed to load:', tile?.faces_image ? `${bigImageBaseURL}${tile.faces_image}` : `${bigImageBaseURL}${tile?.sku_code}.jpg` || fallbackImageURL);
                        e.target.src = fallbackImageURL;
                        e.target.alt = 'Faces image not found';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/tilemaster"
                className="bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 text-gray-800 dark:text-gray-100 px-6 py-3 rounded-lg font-medium shadow-md hover:from-gray-400 hover:to-gray-500 dark:hover:from-gray-500 dark:hover:to-gray-600 transition-all duration-300 disabled:opacity-50"
                aria-label="Back to products list"
                onClick={() => console.log('Link clicked for /tilemaster')}
              >
                Back to Products
              </Link>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'''