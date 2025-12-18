import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft, FaInfoCircle } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumb from '../components/Breadcrumb';

// Fallback base URL for API
const baseURL = process.env.REACT_APP_API_BASE_URL 
// Base URLs for images
const bigImageBaseURL = 'https://vyr.svikinfotech.in/assets/media/big/';
const thumbImageBaseURL = 'https://vyr.svikinfotech.in/assets/media/thumb/';
const fallbackImageURL = 'https://vyr.svikinfotech.in/assets/media/no-image.jpg';

export default function ViewTilePage() {
  const { tileId } = useParams(); // tileId is expected to be the sku_code
  const [tile, setTile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 'auto', height: 'auto' });
  const [availableVariants, setAvailableVariants] = useState([]);

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
  useEffect(() => {
  if (!tile?.sku_code) return;

  let isMounted = true;
  const detectedVariants = [];

  const checkVariant = (index) => {
    const variantName = `${tile.sku_code}-f${index}`;
    const img = new Image();

    img.src = `${thumbImageBaseURL}${variantName}.jpg`;

    img.onload = () => {
      if (!isMounted) return;

      detectedVariants.push(variantName);
      checkVariant(index + 1); // check next variant
    };

    img.onerror = () => {
      // stop checking when a variant does not exist
      if (isMounted) {
        setAvailableVariants(detectedVariants);
      }
    };
  };

  checkVariant(1);

  return () => {
    isMounted = false;
  };
}, [tile]);


  // Load natural dimensions of the lightbox image, prioritizing actual square size
  useEffect(() => {
    if (lightboxImage) {
      const img = new Image();
      img.src = lightboxImage;
      img.onload = () => {
        const { naturalWidth, naturalHeight } = img;
        // Use the smaller dimension to ensure square shape (should be equal for square images)
        const size = Math.min(naturalWidth, naturalHeight);
        // Constrain to 90% of the smaller viewport dimension to ensure it fits
        const maxSize = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9);
        // Use natural size unless it exceeds the viewport
        const finalSize = Math.min(size, maxSize);

        setImageDimensions({ width: `${finalSize}px`, height: `${finalSize}px` });
      };
      img.onerror = () => {
        console.error(`Failed to load lightbox image: ${lightboxImage}`);
        setImageDimensions({ width: '150px', height: '150px' }); // Fallback to square placeholder size
      };
    }
  }, [lightboxImage]);

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
    setImageDimensions({ width: 'auto', height: 'auto' });
  };

  

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-green-1000 text-gray-800 dark:text-gray-200 sticky top-0">
      <Sidebar theme="light" className="fixed top-0 left-0 h-screen w-64 bg-white dark:bg-gray-800 shadow-lg z-30" />
      <div className="flex-1 ml-0 md:ml-0">
        <Topbar theme="light" className="sticky top-0 z-20 bg-white dark:bg-gray-800 shadow-lg h-16" />
        <div className="pt-16 pb-6 px-6 sm:px-8 md:px-10 lg:px-12 overflow-y-auto h-[calc(100vh-64px)] scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-Black-700 dark:text-green-100 tracking-tight">Product Details</h2>
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

            {/* Details Container */}
            <div className="bg-gradient-to-br from-white to-teal-50 dark:from-gray-800 dark:to-teal-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in-up">
              <h3 className="text-2xl font-semibold text-teal-800 dark:text-teal-200 mb-5">Tile Information</h3>
              {tile ? (
                <div className="space-y-4 text-gray-700 dark:text-gray-200">
                  <p className="flex items-center">
                    <span className="font-medium w-36 text-teal-600 dark:text-teal-300">SKU Name:</span>
                    <span>{tile.sku_name || 'N/A'}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium w-36 text-teal-600 dark:text-teal-300">SKU Code:</span>
                    <span>{tile.sku_code || 'N/A'}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium w-36 text-teal-600 dark:text-teal-300">Category:</span>
                    <span>{tile.cat_name || 'N/A'}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium w-36 text-teal-600 dark:text-teal-300">Application:</span>
                    <span>{tile.app_name || 'N/A'}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium w-36 text-teal-600 dark:text-teal-300">Space:</span>
                    <span>{tile.space_name || 'N/A'}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium w-36 text-teal-600 dark:text-teal-300">Size:</span>
                    <span>{tile.size_name || 'N/A'}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium w-36 text-teal-600 dark:text-teal-300">Finish:</span>
                    <span>{tile.finish_name || 'N/A'}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium w-36 text-teal-600 dark:text-teal-300">Color:</span>
                    <span>{tile.color_name || 'N/A'}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium w-36 text-teal-600 dark:text-teal-300">Status:</span>
                    <span className={tile.block ? 'text-red-600 dark:text-red-400' : 'text-amber-500 dark:text-amber-400'}>
                      {tile.block ? 'Blocked' : 'Active'}
                    </span>
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">No tile data available</p>
              )}
            </div>
              
            {/* Images Container */}
            <div className="mt-8 bg-gradient-to-br from-white to-teal-50 dark:from-gray-800 dark:to-teal-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-2xl font-semibold text-teal-800 dark:text-teal-200 mb-2">Images</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
                {availableVariants.map((variant, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      openLightbox(`${bigImageBaseURL}${variant}.jpg`);
                    }}
                  >
                    <p className="text-sm font-medium text-teal-600 dark:text-teal-300 mb-2">Variant {index + 1}</p>
                    <img
                      src={`${thumbImageBaseURL}${variant}.jpg`}
                      alt={tile?.sku_name ? `${tile.sku_name} Variant ${index + 1}` : `Variant ${index + 1}`}
                      className="w-50 h-48 object-cover border border-teal-200 dark:border-teal-700 group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        console.error(`Variant image failed to load: ${thumbImageBaseURL}${variant}.jpg`);
                        e.target.src = fallbackImageURL;
                        e.target.alt = 'Variant image not found';
                      }}
                    />
                    <div className="absolute w-48 h-50 inset-0 bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-500 flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">Click to enlarge</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/tilemaster"
                className="flex items-center justify-center bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 text-gray-800 dark:text-gray-100 px-6 py-3 rounded-lg font-medium shadow-md hover:from-gray-400 hover:to-gray-500 dark:hover:from-gray-500 dark:hover:to-gray-600 transition-all duration-300 disabled:opacity-50"
                aria-label="Back to products list"
                onClick={() => console.log('Link clicked for /tilemaster')}
              >
                <FaArrowLeft className="mr-2" />
                Back to Products
              </Link>
            </div>
          </div>

          {/* Lightbox */}
          {lightboxImage && (
            <div
              className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in-up"
              onClick={closeLightbox}
            >
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <img
                  src={lightboxImage}
                  alt="Enlarged tile image"
                  style={{
                    width: imageDimensions.width,
                    height: imageDimensions.height,
                    objectFit: 'contain', // Ensures no distortion, preserves square shape
                  }}
                  onError={(e) => {
                    console.error(`Lightbox image failed to load: ${lightboxImage}`);
                    e.target.src = fallbackImageURL;
                    e.target.alt = 'Image not found';
                  }}
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
