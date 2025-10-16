import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumbs from '../components/Breadcrumb';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus } from 'react-icons/fa';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-96">
        <p className="mb-4 text-gray-800 dark:text-gray-100">{message}</p>
        <div className="flex justify-end space-x-2">
          <button
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            onClick={onCancel}
            aria-label="Cancel action"
          >
            Cancel
          </button>
          <button
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
            onClick={onConfirm}
            aria-label="Confirm action"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CompanyMasterPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [companies, setCompanies] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState({
    PlanId: 0,
    CompName: '',
    Address: '',
    Address1: '',
    PinCode: 0,
    City: '',
    State: '',
    Country: '',
    RequestBy: 0,
    block: false,
  });
  const [confirmation, setConfirmation] = useState({
    show: false,
    message: '',
    onConfirm: () => {},
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking'); // 'checking', 'connected', 'disconnected'

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      console.log('Debounced Search Term:', searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Ensure search term is empty on initial render to avoid filtering out data
  useEffect(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  }, []);

  const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) return response;
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  const fetchCompanies = async () => {
    setIsLoading(true);
    setConnectionStatus('checking');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const response = await fetchWithRetry(
        `${baseURL}/GetCompanyList`,
        {
          signal: controller.signal,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        3,
        1000
      );
      clearTimeout(timeoutId);

      const data = await response.json();
      console.log('API Response:', data, 'at', new Date().toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }));

      if (Array.isArray(data)) {
        const mappedCompanies = data.map(comp => ({
          comp_id: comp.CompId || 0,
          plan_id: comp.PlanId || 0,
          comp_name: comp.CompName || '',
          comp_address: comp.Address || '',
          comp_address1: comp.Address1 || '',
          pin_code: comp.PinCode || 0,
          city: comp.City || '',
          state: comp.State || '',
          country: comp.Country || '',
          created_by: comp.CreatedBy || 0,
          created_date: comp.CreatedDate || new Date().toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
          modify_by: comp.ModifyBy || 0,
          modify_date: comp.ModifyDate || new Date().toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
          block: comp.Block || false,
        }));

        setCompanies(mappedCompanies);
        console.log('Companies State:', mappedCompanies); // Debug: Verify state
        setConnectionStatus('connected');
        console.log('Mapped Companies:', mappedCompanies);
      } else {
        setCompanies([]);
        setError('Invalid response from server (not an array).');
        setConnectionStatus('connected');
      }
    } catch (err) {
      console.error('Fetch Error Details:', err, 'at', new Date().toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }));
      setError(`Failed to load companies: ${err.name === 'AbortError' ? 'Request timeout - backend slow/unreachable' : err.message}. Check console for details.`);
      setCompanies([]);
      setConnectionStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const validateData = (data) => {
    if (!data.CompName || !data.PlanId || !data.RequestBy) {
      return 'Please fill all required fields (Company Name, Plan ID, Created By)';
    }
    if (data.PinCode < 0) {
      return 'Pin Code must be a positive number';
    }
    if (!/^[a-zA-Z0-9\s]+$/.test(data.CompName)) {
      return 'Company Name must contain only letters, numbers, and spaces';
    }
    return null;
  };

  const startEditing = (comp) => {
    setEditId(comp.comp_id);
    setEditData({
      CompId: comp.comp_id,
      PlanId: comp.plan_id,
      CompName: comp.comp_name,
      Address: comp.comp_address,
      Address1: comp.comp_address1,
      PinCode: comp.pin_code,
      City: comp.city,
      State: comp.state,
      Country: comp.country,
      created_by: comp.created_by,
      block: comp.block,
    });
  };

  const cancelEditing = () => {
    setEditId(null);
    setEditData({});
  };

  const handleEditChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const saveEdit = async () => {
    const validationError = validateData(editData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetchWithRetry(
        `${baseURL}/EditCompany`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editData),
        },
        3,
        1000
      );
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        setCompanies(companies.map(comp =>
          comp.comp_id === editId
            ? {
                ...comp,
                plan_id: editData.PlanId || comp.plan_id,
                comp_name: editData.CompName || comp.comp_name,
                comp_address: editData.Address || comp.comp_address,
                comp_address1: editData.Address1 || comp.comp_address1,
                pin_code: editData.PinCode || comp.pin_code,
                city: editData.City || comp.city,
                state: editData.State || comp.state,
                country: editData.Country || comp.country,
                created_by: editData.created_by || comp.created_by,
                modify_date: new Date().toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
                block: editData.block || comp.block,
              }
            : comp
        ));
        setEditId(null);
        setEditData({});
        setConfirmation({ show: false, message: '', onConfirm: () => {} });
      } else {
        setError(result.message || 'Error editing company');
      }
    } catch (err) {
      setError('Error editing company: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmSave = () => {
    setConfirmation({
      show: true,
      message: 'Are you sure you want to save changes?',
      onConfirm: saveEdit,
    });
  };

  const confirmDelete = (id) => {
    setConfirmation({
      show: true,
      message: 'Are you sure you want to delete this company?',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const response = await fetchWithRetry(
            `${baseURL}/DeleteCompany/${id}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            },
            3,
            1000
          );
          const result = await response.json();
          if (response.ok && result.status === 'success') {
            setCompanies(companies.filter(comp => comp.comp_id !== id));
            setConfirmation({ show: false, message: '', onConfirm: () => {} });
          } else {
            setError(result.message || 'Error deleting company');
          }
        } catch (err) {
          setError('Error deleting company: ' + err.message);
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const startAdding = () => {
    setIsAdding(true);
    setNewData({
      PlanId: 0,
      CompName: '',
      Address: '',
      Address1: '',
      PinCode: 0,
      City: '',
      State: '',
      Country: '',
      RequestBy: 0,
      block: false,
    });
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewData({
      PlanId: 0,
      CompName: '',
      Address: '',
      Address1: '',
      PinCode: 0,
      City: '',
      State: '',
      Country: '',
      RequestBy: 0,
      block: false,
    });
  };

  const saveAdding = async () => {
    const validationError = validateData(newData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetchWithRetry(
        `${baseURL}/AddCompany`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newData),
        },
        3,
        1000
      );
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        await fetchCompanies();
        cancelAdding();
        setConfirmation({ show: false, message: '', onConfirm: () => {} });
      } else {
        setError(result.message || 'Error adding company');
      }
    } catch (err) {
      setError('Error adding company: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmAdd = () => {
    setConfirmation({
      show: true,
      message: 'Are you sure you want to save this new company?',
      onConfirm: saveAdding,
    });
  };

  const toggleBlock = async (comp) => {
    const status = comp.block ? 0 : 1;
    setIsLoading(true);
    try {
      const response = await fetchWithRetry(
        `${baseURL}/BlockCompany/${comp.created_by || 0}/${comp.comp_id}/${status}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        3,
        1000
      );
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        setCompanies(companies.map(c =>
          c.comp_id === comp.comp_id
            ? { ...c, block: status === 1, modify_date: new Date().toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }) }
            : c
        ));
      } else {
        setError(result.message || 'Error toggling block status');
      }
    } catch (err) {
      setError('Error toggling block status: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCompanies = useMemo(() => {
    const filtered = companies.filter(comp =>
      ['comp_name', 'city', 'state', 'country'].some(field =>
        (comp[field] || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
    );
    console.log('Filtered Companies:', filtered, 'Search Term:', debouncedSearchTerm);
    return filtered;
  }, [companies, debouncedSearchTerm]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Company</h2>
            <div className="flex items-center space-x-4">
              <Breadcrumbs currentPage="Company Master" />
              <span className={`px-2 py-1 rounded text-xs ${connectionStatus === 'connected' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                {connectionStatus === 'checking' ? 'Checking...' : connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900 dark:border-red-700 dark:text-red-300">
              {error}
              <button
                className="ml-4 text-red-700 hover:text-red-900 dark:text-red-300 dark:hover:text-red-100"
                onClick={() => setError('')}
                aria-label="Close error message"
              >
                Close
              </button>
            </div>
          )}
          {isLoading && (
            <div className="text-center text-gray-500 dark:text-gray-400">Loading companies...</div>
          )}
          {connectionStatus === 'disconnected' && !isLoading && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-300">
              <strong>Connection Issue:</strong> Cannot reach backend at {baseURL}. Please ensure the server is running.
              <button
                onClick={fetchCompanies}
                className="ml-4 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
                aria-label="Retry connection"
              >
                Retry
              </button>
            </div>
          )}
          <div className="w-full max-w-screen-xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col max-h-[75vh] overflow-hidden">
            <div className="mb-4 flex justify-between items-center">
              <input
                type="text"
                placeholder="Search by Company Name, City, State, or Country..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value || '')}
                className="border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-600 w-1/3 dark:bg-gray-800 dark:text-gray-100"
                aria-label="Search companies"
                disabled={connectionStatus === 'disconnected'}
              />
              {!isAdding && (
                <button
                  className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 flex items-center disabled:opacity-50"
                  onClick={startAdding}
                  disabled={isLoading || connectionStatus === 'disconnected'}
                  aria-label="Add new company"
                >
                  <FaPlus className="mr-2" /> Add New Company
                </button>
              )}
            </div>
            <div className="overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
              <table className="min-w-full text-sm">
                <thead className="bg-green-100 text-gray-800 dark:bg-green-900 dark:text-gray-100">
                  <tr>
                    <th scope="col" className="px-4 py-2 font-semibold text-left">Comp ID</th>
                    <th scope="col" className="px-4 py-2 font-semibold text-left">Plan ID</th>
                    <th scope="col" className="px-4 py-2 font-semibold text-left">Company Name</th>
                    <th scope="col" className="px-4 py-2 font-semibold text-left">Address</th>
                    <th scope="col" className="px-4 py-2 font-semibold text-left">Address 2</th>
                    <th scope="col" className="px-4 py-2 font-semibold text-left">Pin Code</th>
                    <th scope="col" className="px-4 py-2 font-semibold text-left">City</th>
                    <th scope="col" className="px-4 py-2 font-semibold text-left">State</th>
                    <th scope="col" className="px-4 py-2 font-semibold text-left">Country</th>
                    <th scope="col" className="px-4 py-2 font-semibold text-left">Created By</th>
                    <th scope="col" className="px-4 py-2 font-semibold text-left">Block</th>
                    <th scope="col" className="px-4 py-2 font-semibold text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {isAdding && (
                    <tr className="border-b border-gray-200 dark:border-gray-700" key="new-row-0">
                      <td className="px-4 py-3">New</td>
                      {[
                        { field: 'PlanId' },
                        { field: 'CompName' },
                        { field: 'Address' },
                        { field: 'Address1' },
                        { field: 'PinCode' },
                        { field: 'City' },
                        { field: 'State' },
                        { field: 'Country' },
                      ].map(({ field }) => (
                        <td key={`new-0-${field}`} className="px-4 py-3">
                          <input
                            value={newData[field]}
                            onChange={e =>
                              setNewData({
                                ...newData,
                                [field]: (field === 'PinCode' || field === 'PlanId') ? Number(e.target.value) : e.target.value,
                              })
                            }
                            className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                            type={(field === 'PinCode' || field === 'PlanId') ? 'number' : 'text'}
                            aria-label={field}
                            disabled={connectionStatus === 'disconnected'}
                          />
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={newData.RequestBy}
                          onChange={e => setNewData({ ...newData, RequestBy: Number(e.target.value) })}
                          className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                          aria-label="Created By"
                          disabled={connectionStatus === 'disconnected'}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={newData.block}
                          onChange={e => setNewData({ ...newData, block: e.target.checked })}
                          aria-label="Block status"
                        />
                      </td>
                      <td className="px-4 py-3 flex space-x-2">
                        <button
                          onClick={confirmAdd}
                          className="text-green-600 hover:text-green-800 disabled:opacity-50"
                          disabled={isLoading || connectionStatus === 'disconnected'}
                          aria-label="Save new company"
                        >
                          <FaSave size={22} />
                        </button>
                        <button
                          onClick={cancelAdding}
                          className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                          disabled={isLoading || connectionStatus === 'disconnected'}
                          aria-label="Cancel adding company"
                        >
                          <FaTimes size={22} />
                        </button>
                      </td>
                    </tr>
                  )}
                  {filteredCompanies.map((comp, index) => {
                    console.log('Rendering Company:', comp); // Debug: Verify each company being rendered
                    return (
                      <tr
                        key={comp.comp_id !== 0 ? comp.comp_id : `temp-${index}`}
                        className="border-b border-gray-200 dark:border-gray-700"
                      >
                        <td className="px-4 py-3">{comp.comp_id}</td>
                        {[
                          { field: 'PlanId', display: 'plan_id' },
                          { field: 'CompName', display: 'comp_name' },
                          { field: 'Address', display: 'comp_address' },
                          { field: 'Address1', display: 'comp_address1' },
                          { field: 'PinCode', display: 'pin_code' },
                          { field: 'City', display: 'city' },
                          { field: 'State', display: 'state' },
                          { field: 'Country', display: 'country' },
                        ].map(({ field, display }) => (
                          <td key={`${comp.comp_id !== 0 ? comp.comp_id : `temp-${index}`}-${field}`} className="px-4 py-3">
                            {editId === comp.comp_id ? (
                              <input
                                value={editData[field] || ''}
                                onChange={e =>
                                  handleEditChange(field, field === 'PinCode' || field === 'PlanId' ? Number(e.target.value) : e.target.value)
                                }
                                className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                                type={field === 'PinCode' || field === 'PlanId' ? 'number' : 'text'}
                                aria-label={field}
                                disabled={connectionStatus === 'disconnected'}
                              />
                            ) : (
                              comp[display] || ''
                            )}
                          </td>
                        ))}
                        <td className="px-4 py-3">
                          {editId === comp.comp_id ? (
                            <input
                              type="number"
                              value={editData.created_by || 0}
                              onChange={e => handleEditChange('created_by', Number(e.target.value))}
                              className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                              aria-label="Created By"
                              disabled={connectionStatus === 'disconnected'}
                            />
                          ) : (
                            comp.created_by || 0
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editId === comp.comp_id ? (
                            <input
                              type="checkbox"
                              checked={editData.block || false}
                              onChange={e => handleEditChange('block', e.target.checked)}
                              className="dark:bg-gray-800 dark:border-gray-600"
                              aria-label="Block status"
                              disabled={connectionStatus === 'disconnected'}
                            />
                          ) : (
                            <button
                              onClick={() => toggleBlock(comp)}
                              className={`px-2 py-1 rounded ${comp.block ? 'bg-red-600' : 'bg-green-600'} text-white disabled:opacity-50`}
                              disabled={isLoading || connectionStatus === 'disconnected'}
                              aria-label={`Toggle block status to ${comp.block ? 'unblock' : 'block'}`}
                            >
                              {comp.block ? 'Yes' : 'No'}
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 flex space-x-2">
                          {editId === comp.comp_id ? (
                            <>
                              <button
                                onClick={confirmSave}
                                className="text-green-600 hover:text-green-800 disabled:opacity-50"
                                disabled={isLoading || connectionStatus === 'disconnected'}
                                aria-label="Save changes"
                              >
                                <FaSave size={22} />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                                disabled={isLoading || connectionStatus === 'disconnected'}
                                aria-label="Cancel editing"
                              >
                                <FaTimes size={22} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditing(comp)}
                                className="text-yellow-500 hover:text-yellow-700 disabled:opacity-50"
                                disabled={isLoading || connectionStatus === 'disconnected'}
                                aria-label="Edit company"
                              >
                                <FaEdit size={22} />
                              </button>
                              <button
                                onClick={() => confirmDelete(comp.comp_id)}
                                className="text-red-500 hover:text-red-700 disabled:opacity-50"
                                disabled={isLoading || connectionStatus === 'disconnected'}
                                aria-label="Delete company"
                              >
                                <FaTrash size={22} />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredCompanies.length === 0 && !isAdding && companies.length === 0 && connectionStatus === 'connected' && (
                <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                  No companies found in database
                </div>
              )}
              {filteredCompanies.length === 0 && !isAdding && companies.length > 0 && (
                <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                  No companies match search
                </div>
              )}
            </div>
          </div>
        </div>
        {confirmation.show && (
          <ConfirmationModal
            message={confirmation.message}
            onConfirm={confirmation.onConfirm}
            onCancel={() => setConfirmation({ show: false, message: '', onConfirm: () => {} })}
          />
        )}
      </div>
    </div>
  );
}