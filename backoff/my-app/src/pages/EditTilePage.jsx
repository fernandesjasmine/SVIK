import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumbs from '../components/Breadcrumb';
import axios from 'axios';
import { FaArrowRight } from 'react-icons/fa'; // Added for arrow icon
import { toast } from 'react-toastify';

const baseURL = process.env.REACT_APP_API_BASE_URL;

export default function EditTilePage() {
  const [formData, setFormData] = useState({
    TileId: '',
    SkuName: '',
    SkuCode: '',
    CatName: '', // Changed to CatName instead of CatId
    AppName: '', // Changed to AppName instead of AppId
    SpaceName: '', // Changed to SpaceName instead of SpaceId
    SizeName: '', // Changed to SizeName instead of SizeId
    FinishName: '', // Changed to FinishName instead of FinishId
    ColorName: '', // Changed to ColorName instead of ColorId
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(() => {});
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const userId = localStorage.getItem('userid');
  const navigate = useNavigate();
  const { tileId } = useParams();

  useEffect(() => {
    if (!baseURL) {
      setAlertMessage('API base URL is not configured.');
      setShowAlert(true);
      return;
    }
    const loadData = async () => {
      await fetchTileData();
    };
    loadData();
  }, [tileId]);

  const fetchTileData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${baseURL}/GetTileList`);
      const tile = res.data.find(t => t.tile_id === parseInt(tileId));
      if (!tile) {
        throw new Error('Tile not found');
      }

      console.log('Fetched Tile Data:', tile); // Debug log

      setFormData({
        TileId: tile.tile_id || '',
        SkuName: tile.sku_name || '',
        SkuCode: tile.sku_code || '',
        CatName: tile.cat_name || '',
        AppName: tile.app_name || '',
        SpaceName: tile.space_name || '',
        SizeName: tile.size_name || '',
        FinishName: tile.finish_name || '',
        ColorName: tile.color_name || '',
      });
    } catch (err) {
      console.error('Tile Data Fetch Error:', err);
      setAlertMessage(err.message === 'Tile not found' ? 'Tile not found.' : 'Failed to fetch tile data. Please try again later.');
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = [
      { name: 'SkuName', label: 'SKU Name' },
      { name: 'SkuCode', label: 'SKU Code' },
      { name: 'CatName', label: 'Category' },
      { name: 'AppName', label: 'Application' },
      { name: 'SpaceName', label: 'Space' },
      { name: 'SizeName', label: 'Size' },
      { name: 'FinishName', label: 'Finish' },
      { name: 'ColorName', label: 'Color' }
    ];

    requiredFields.forEach(field => {
      const value = formData[field.name];
      if (!value || value.trim() === '') {
        errors[field.name] = `${field.label} is required.`;
      } else if (field.name === 'SkuCode' && !/^[a-zA-Z0-9-]+$/.test(value)) {
        errors[field.name] = 'SKU Code must contain only letters, numbers, and hyphens.';
      } else if (field.name === 'SkuName' && value.length < 2) {
        errors[field.name] = 'SKU Name must be at least 2 characters long.';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (validateForm()) {
      setConfirmMessage('Are you sure you want to save changes to this tile?');
      setConfirmAction(() => () => editTile());
      setShowConfirm(true);
    }
  };

  const editTile = async () => {
    try {
      const payload = new FormData();
      payload.append('TileId', formData.TileId);
      payload.append('SkuName', formData.SkuName);
      payload.append('SkuCode', formData.SkuCode);
      payload.append('CatName', formData.CatName);
      payload.append('AppName', formData.AppName);
      payload.append('SpaceName', formData.SpaceName);
      payload.append('SizeName', formData.SizeName);
      payload.append('FinishName', formData.FinishName);
      payload.append('ColorName', formData.ColorName);
      payload.append('RequestBy', userId || '');

      setIsLoading(true);
      const res = await axios.post(`${baseURL}/EditTile`, payload);
      const responseText = res.data;

      if (responseText === 'success') {
        toast.success('Updated successfully!');
        // setShowAlert(true);
      } else if (responseText === 'alreadyexists') {
        toast.error('Tile already exists!');
        // setShowAlert(true);
      } else {
        setAlertMessage(responseText);
        setShowAlert(true);
      }
    } catch (err) {
      console.error('Edit Error:', err);
      toast.error('An error occurred while updating tile.');
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const closeAlert = () => {
    setShowAlert(false);
    setAlertMessage('');
    if (alertMessage === 'Tile updated successfully!') {
      navigate(-1);
    }
  };

  const closeConfirm = (confirm) => {
    if (confirm && confirmAction) confirmAction();
    setShowConfirm(false);
    setConfirmMessage('');
    setConfirmAction(() => {});
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-5">
          <Breadcrumbs currentPage="Edit Tile" />

          <div className="flex justify-center items-start px-4 py-4">
            <div className="w-full max-w-screen-xl bg-white dark:bg-gray-800 rounded-xl shadow-lg 
                            p-6 flex flex-col border border-gray-200 dark:border-gray-700 
                            overflow-y-auto max-h-[calc(100vh-150px)]">
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                Edit Tile
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Update the details below to edit the tile record. All fields are required.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* SKU Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      SKU Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="SkuName"
                      value={formData.SkuName}
                      onChange={handleChange}
                      placeholder="Enter SKU Name"
                      className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md 
                                 text-gray-900 dark:text-white bg-white dark:bg-gray-700 
                                 focus:ring-2 focus:ring-green-500"
                      required
                    />
                    {isSubmitted && validationErrors.SkuName && (
                      <p className="mt-1 text-xs text-orange-600">{validationErrors.SkuName}</p>
                    )}
                  </div>

                  {/* SKU Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      SKU Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="SkuCode"
                      value={formData.SkuCode}
                      onChange={handleChange}
                      placeholder="Enter SKU Code"
                      className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md 
                                 text-gray-900 dark:text-white bg-white dark:bg-gray-700 
                                 focus:ring-2 focus:ring-green-500"
                      required
                    />
                    {isSubmitted && validationErrors.SkuCode && (
                      <p className="mt-1 text-xs text-orange-600">{validationErrors.SkuCode}</p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="CatName"
                      value={formData.CatName}
                      onChange={handleChange}
                      placeholder="Enter Category"
                      className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md 
                                 text-gray-900 dark:text-white bg-white dark:bg-gray-700 
                                 focus:ring-2 focus:ring-green-500"
                      required
                    />
                    {isSubmitted && validationErrors.CatName && (
                      <p className="mt-1 text-xs text-orange-600">{validationErrors.CatName}</p>
                    )}
                  </div>

                  {/* Application */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Application <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="AppName"
                      value={formData.AppName}
                      onChange={handleChange}
                      placeholder="Enter Application"
                      className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md 
                                 text-gray-900 dark:text-white bg-white dark:bg-gray-700 
                                 focus:ring-2 focus:ring-green-500"
                      required
                    />
                    {isSubmitted && validationErrors.AppName && (
                      <p className="mt-1 text-xs text-orange-600">{validationErrors.AppName}</p>
                    )}
                  </div>

                  {/* Space */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Space <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="SpaceName"
                      value={formData.SpaceName}
                      onChange={handleChange}
                      placeholder="Enter Space"
                      className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md 
                                 text-gray-900 dark:text-white bg-white dark:bg-gray-700 
                                 focus:ring-2 focus:ring-green-500"
                      required
                    />
                    {isSubmitted && validationErrors.SpaceName && (
                      <p className="mt-1 text-xs text-orange-600">{validationErrors.SpaceName}</p>
                    )}
                  </div>

                  {/* Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Size <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="SizeName"
                      value={formData.SizeName}
                      onChange={handleChange}
                      placeholder="Enter Size"
                      className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md 
                                 text-gray-900 dark:text-white bg-white dark:bg-gray-700 
                                 focus:ring-2 focus:ring-green-500"
                      required
                    />
                    {isSubmitted && validationErrors.SizeName && (
                      <p className="mt-1 text-xs text-orange-600">{validationErrors.SizeName}</p>
                    )}
                  </div>

                  {/* Finish */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Finish <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="FinishName"
                      value={formData.FinishName}
                      onChange={handleChange}
                      placeholder="Enter Finish"
                      className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md 
                                 text-gray-900 dark:text-white bg-white dark:bg-gray-700 
                                 focus:ring-2 focus:ring-green-500"
                      required
                    />
                    {isSubmitted && validationErrors.FinishName && (
                      <p className="mt-1 text-xs text-orange-600">{validationErrors.FinishName}</p>
                    )}
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Color <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="ColorName"
                      value={formData.ColorName}
                      onChange={handleChange}
                      placeholder="Enter Color"
                      className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md 
                                 text-gray-900 dark:text-white bg-white dark:bg-gray-700 
                                 focus:ring-2 focus:ring-green-500"
                      required
                    />
                    {isSubmitted && validationErrors.ColorName && (
                      <p className="mt-1 text-xs text-orange-600">{validationErrors.ColorName}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-4 py-1 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-md 
                               text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 
                               hover:bg-gray-50 dark:hover:bg-gray-600"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm 
                               focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                    <FaArrowRight className="ml-2" /> {/* Added arrow icon */}
                    
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Alert */}
        {showAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center w-[90%] max-w-md">
              <p className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">{alertMessage}</p>
              <button
                onClick={closeAlert}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Confirm */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center w-[90%] max-w-md">
              <p className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">{confirmMessage}</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => closeConfirm(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Yes
                </button>
                <button
                  onClick={() => closeConfirm(false)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loader */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="text-white text-lg font-semibold animate-pulse">Loading...</div>
          </div>
        )}
      </div>
    </div>
  );
}