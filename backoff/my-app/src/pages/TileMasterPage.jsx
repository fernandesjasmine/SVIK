import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumb from '../components/Breadcrumb';
import axios from 'axios';
import {
  FaPlus,
  FaEdit,
  FaCheck,
  FaAngleLeft,
  FaAngleRight,
  FaTrash,
  FaInfoCircle,
  FaTimes,
  FaFileImport,
  FaFolderOpen,
  FaSpinner,
  FaFileExport,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://vyr.svikinfotech.in/api';
const imageBaseURL = process.env.REACT_APP_API_IMG_URL || 'https://vyr.svikinfotech.in/assets/media';

function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-96">
        <p className="mb-4 text-gray-800 dark:text-gray-200">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-100 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
            onClick={onConfirm}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

// ErrorBoundary example (wrap your component with this in App.js or parent)
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    // log error if needed
  }
  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong.</h2>;
    }
    return this.props.children;
  }
}

function ImportModal({
  isOpen,
  onClose,
  selectedImportType,
  setSelectedImportType,
  fileInputRef,
  folderInputRef,
  handleExcelChange,
  handleFolderChange,
  isLoading,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Import Options</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <FaTimes size={20} />
          </button>
        </div>
        <div className="p-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            {[
              { key: 'excel', icon: FaFileImport, label: 'Excel Import' },
              { key: 'folder', icon: FaFolderOpen, label: 'Folder Upload' },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setSelectedImportType(key)}
                className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 ${
                  selectedImportType === key
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            ))}
          </div>
          {selectedImportType === 'excel' && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Excel File</label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  ref={fileInputRef}
                  onChange={handleExcelChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-white"
                  disabled={isLoading}
                />
              </div>
              {isLoading && <FaSpinner className="animate-spin mx-auto text-blue-500" size={24} />}
            </div>
          )}
          {selectedImportType === 'folder' && (
            <div className="space-y-4">
              <input
                type="file"
                multiple
                webkitdirectory
                accept="image/*"
                ref={folderInputRef}
                onChange={handleFolderChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-gray-600 dark:file:text-white"
                disabled={isLoading}
              />
              {isLoading && <FaSpinner className="animate-spin mx-auto text-blue-500" size={24} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const userId = localStorage.getItem('userid');

export default function TileMasterPage() {
  const [tiles, setTiles] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => {});
  const [confirmMessage, setConfirmMessage] = useState('');
  const [columnSearches, setColumnSearches] = useState({
    sku_name: '',
    image: '',
    sku_code: '',
    cat_name: '',
    app_name: '',
    space_name: '',
    size_name: '',
    finish_name: '',
    color_name: '',
  });
  const [globalSearch, setGlobalSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedImportType, setSelectedImportType] = useState('excel');
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      toast.error('User not authenticated. Please log in.');
      navigate('/login');
      return;
    }
    fetchTiles();
  }, []);

  const fetchTiles = async () => {
    setIsLoading(true);
    try {
      const normalizedBaseURL = baseURL.replace(/\/+$/, '');
      const res = await axios.get(`${normalizedBaseURL}/GetTileList`);
      setTiles(Array.isArray(res.data) ? res.data : res.data.tiles || res.data.data?.tiles || []);
    } catch (err) {
      toast.error('Failed to fetch tiles');
      setError('Failed to fetch tiles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (tile) => {
    toast.info(`Editing tile: ${tile.sku_name}`);
    navigate(`/edit-tile/${tile.tile_id}`);
  };

  const handleViewDetails = (tile) => {
    toast.info(`Viewing details for tile: ${tile.sku_name}`);
    navigate(`/view-tile/${tile.sku_code}`);
  };

  const handleBlockToggle = (tileId, currentStatus) => {
    setConfirmMessage(`Are you sure you want to ${currentStatus ? 'unblock' : 'block'} this tile?`);
    setConfirmAction(() => async () => {
      try {
        setIsLoading(true);
        const normalizedBaseURL = baseURL.replace(/\/+$/, '');
        const res = await axios.get(`${normalizedBaseURL}/BlockTile/${userId}/${tileId}/${currentStatus ? 0 : 1}`);
        if (res.data === 'success') {
          toast.success(`Tile ${currentStatus ? 'unblocked' : 'blocked'} successfully`);
          fetchTiles();
        } else {
          toast.error('Failed to update block status');
        }
      } catch (err) {
        toast.error('Error while toggling block status');
      } finally {
        setIsLoading(false);
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  const handleSearchChange = (key, value) => {
    setColumnSearches((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleGlobalSearchChange = (e) => {
    setGlobalSearch(e.target.value.toLowerCase());
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending',
    }));
    setCurrentPage(1);
  };

  const getSortedAndFilteredTiles = () => {
    let filteredTiles = [...tiles];

    if (globalSearch) {
      filteredTiles = filteredTiles.filter((tile) =>
        Object.values(tile).some((value) =>
          String(value).toLowerCase().includes(globalSearch)
        )
      );
    }

    filteredTiles = filteredTiles.filter((tile) =>
      Object.entries(columnSearches).every(([key, value]) =>
        !value || String(tile[key]).toLowerCase().includes(value.toLowerCase())
      )
    );

    if (sortConfig.key) {
      filteredTiles.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (!isNaN(aVal) && !isNaN(bVal)) {
          return sortConfig.direction === 'ascending' ? aVal - bVal : bVal - aVal;
        }
        return sortConfig.direction === 'ascending'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }

    return filteredTiles;
  };

  const filteredTiles = getSortedAndFilteredTiles();
  const totalPages = Math.ceil(filteredTiles.length / entriesPerPage);
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentTiles = filteredTiles.slice(indexOfFirst, indexOfLast);

  const handleExportExcel = async () => {
    try {
      const normalizedBaseURL = baseURL.replace(/\/+$/, '');
      const res = await axios.get(`${normalizedBaseURL}/ExportToExcel`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '');
      link.href = url;
      link.setAttribute('download', `TileList_${timestamp}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Excel file exported successfully');
    } catch (err) {
      toast.error('Error exporting Excel: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleImportClick = () => {
    setShowImportModal(true);
  };

  const handleImportClose = () => {
    setShowImportModal(false);
    setSelectedImportType('excel');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  const handleExcelChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error('No file selected');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      setIsLoading(true);
      const normalizedBaseURL = baseURL.replace(/\/+$/, '');
      const res = await axios.post(`${normalizedBaseURL}/ImportFromExcel`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.message && res.data.message.includes('Error')) {
        toast.error(res.data.message);
      } else {
        toast.success(res.data.message || 'Excel imported successfully');
        fetchTiles();
      }
    } catch (err) {
      toast.error('Error importing Excel: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFolderChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) {
      toast.error('No files selected');
      return;
    }
    try {
      setIsLoading(true);
      const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '');
      const folderName = `tiles_${timestamp}`;
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      formData.append('folderName', folderName);
      const normalizedBaseURL = baseURL.replace(/\/+$/, '');
      const resizeRes = await axios.post(`${normalizedBaseURL}/resize-folder`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (resizeRes.data && Array.isArray(resizeRes.data)) {
        const errors = resizeRes.data.filter((item) => item.error);
        if (errors.length > 0) {
          errors.forEach((item) => toast.error(`Failed to process ${item.FileName}: ${item.error}`));
        } else {
          resizeRes.data.forEach((item) =>
            toast.success(`Resized: ${item.FileName} - Big: ${item.BigUrl}, Thumb: ${item.ThumbUrl}`)
          );
        }
      } else {
        toast.error('Unexpected response from resize-folder');
      }
      const bluePatchFormData = new FormData();
      bluePatchFormData.append('excelFile', new File([], 'SizeListFormat.xlsx'));
      bluePatchFormData.append('folderName', folderName);
      await axios.post(`${normalizedBaseURL}/process-folder-faces-with-bluepatch`, bluePatchFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Faces processed and blue patch applied, images in /vyr');
      fetchTiles();
    } catch (err) {
      toast.error('Error processing folder: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
      if (folderInputRef.current) folderInputRef.current.value = '';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar theme="light" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar theme="light" />
        <div className="flex flex-col flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-400">Products</h2>
            <Breadcrumb />
          </div>

          <div className="w-full max-w-screen-xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col max-h-[100vh] overflow-hidden">
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded">
                {error}
                <button className="float-right font-bold" onClick={() => setError('')}>
                  ×
                </button>
              </div>
            )}

            {message && (
              <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 rounded">
                {message}
                <button className="float-right font-bold" onClick={() => setMessage('')}>
                  ×
                </button>
              </div>
            )}

            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
              <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1">
                <span className="text-sm text-gray-600 dark:text-gray-400 mr-2 whitespace-nowrap">Show</span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border-none focus:ring-2 focus:ring-green-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                >
                  {[5, 10, 25, 50, 100].map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2 whitespace-nowrap">entries</span>
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search..."
                  value={globalSearch}
                  onChange={handleGlobalSearchChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-0.5 pl-10 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex gap-2 w-full sm:w-auto ml-auto">
                <Link
                  to="/add-tile"
                  className="bg-green-700 text-white px-4 py-1.5 rounded hover:bg-green-800 flex items-center text-sm font-medium"
                >
                  <FaPlus className="mr-2" /> Add Product
                </Link>
                <button
                  onClick={handleImportClick}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 flex items-center text-sm font-medium"
                  disabled={isLoading}
                >
                  <FaFileImport className="mr-2" /> Import
                </button>
                <button
                  onClick={handleExportExcel}
                  className="bg-indigo-600 text-white px-4 py-1.5 rounded hover:bg-indigo-700 flex items-center text-sm font-medium"
                  disabled={isLoading}
                >
                  <FaFileExport className="mr-2" /> Export Excel
                </button>
              </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead className="bg-green-100 dark:bg-green-900 text-gray-800 dark:text-gray-200 sticky top-0">
                  <tr>
                    {['sku_code', 'image', 'sku_name', 'app_name', 'space_name', 'size_name', 'finish_name', 'color_name', 'actions'].map((key) => (
                      <th
                        key={key}
                        className="px-4 py-2 font-semibold text-left cursor-pointer"
                        onClick={() => key !== 'actions' && handleSort(key)}
                      >
                        <div className="flex items-center">
                          {key === 'actions' ? 'Actions' : key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          {key !== 'actions' && (
                            <span className="ml-1">
                              {sortConfig.key === key && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                            </span>
                          )}
                        </div>
                        {key !== 'actions' && (
                          <input
                            type="text"
                            placeholder="Search..."
                            value={columnSearches[key]}
                            onChange={(e) => handleSearchChange(key, e.target.value)}
                            className="mt-1 w-full border rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 text-gray-800 dark:text-gray-200">
                  {currentTiles.map((tile, index) => (
                    <tr key={index} className="border-b hover:bg-green-50 dark:hover:bg-gray-700 transition duration-150">
                      <td className="px-4 py-2">
                        <span
                          onClick={() => handleViewDetails(tile)}
                          className="text-black-600 hover:underline cursor-pointer"
                        >
                          {tile.sku_code}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {tile.sku_code ? (
                          <img
                            src={`${imageBaseURL}/${tile.sku_code}.jpg`}
                            alt={tile.sku_name || 'Tile Image'}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'https://vyr.svikinfotech.in/assets/media/no-image.jpg';
                              e.target.alt = 'No Image';
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center">
                            <img
                              src="https://vyr.svikinfotech.in/assets/media/no-image.jpg"
                              alt="No Image"
                              className="w-12 h-12 object-cover rounded"
                            />
                            <span className="text-gray-500 dark:text-gray-400 text-xs mt-1">No Image</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2">{tile.sku_name}</td>
                      <td className="px-4 py-2">{tile.app_name}</td>
                      <td className="px-4 py-2">{tile.space_name}</td>
                      <td className="px-4 py-2">{tile.size_name}</td>
                      <td className="px-4 py-2">{tile.finish_name}</td>
                      <td className="px-4 py-2">{tile.color_name}</td>
                      <td className="px-4 py-2 space-x-2 flex">
                        <button
                          onClick={() => handleEditClick(tile)}
                          className="text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
                          disabled={isLoading}
                        >
                          <FaEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleBlockToggle(tile.tile_id, tile.block)}
                          className={`${tile.block ? 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300' : 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'}`}
                          disabled={isLoading}
                        >
                          {tile.block ? <FaCheck size={18} /> : <FaTrash size={18} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex justify-between mt-4 text-sm items-center text-gray-800 dark:text-gray-200">
              <span>
                Showing {filteredTiles.length === 0 ? 0 : indexOfFirst + 1} to{' '}
                {Math.min(indexOfLast, filteredTiles.length)} of {filteredTiles.length} entries
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600 dark:text-gray-200"
                >
                  <FaAngleLeft />
                </button>
                {[...Array(totalPages).keys()].map((num) => (
                  <button
                    key={num + 1}
                    onClick={() => setCurrentPage(num + 1)}
                    className={`px-3 py-1 border rounded ${
                      currentPage === num + 1
                        ? 'bg-green-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {num + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600 dark:text-gray-200"
                >
                  <FaAngleRight />
                </button>
              </div>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <div>
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded border border-gray-300 dark:border-gray-600"
                >
                  <FaAngleLeft />
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded border border-gray-300 dark:border-gray-600"
                >
                  <FaAngleRight />
                </button>
              </div>
            </div>
            {isLoading && (
              <div className="mt-2 text-gray-700 dark:text-gray-300">
                Processing, please wait...
              </div>
            )}
            {showConfirm && (
              <ConfirmationModal
                message={confirmMessage}
                onConfirm={confirmAction}
                onCancel={() => setShowConfirm(false)}
              />
            )}
            <ImportModal
              isOpen={showImportModal}
              onClose={handleImportClose}
              selectedImportType={selectedImportType}
              setSelectedImportType={setSelectedImportType}
              fileInputRef={fileInputRef}
              folderInputRef={folderInputRef}
              handleExcelChange={handleExcelChange}
              handleFolderChange={handleFolderChange}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}