import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumb from '../components/Breadcrumb';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaSortUp, FaSortDown } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const baseURL = process.env.REACT_APP_API_BASE_URL;

function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-96">
        <p className="mb-4 text-gray-800 dark:text-gray-200">{message}</p>
        <div className="flex justify-end space-x-2">
          <button className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500" onClick={onCancel}>
            Cancel
          </button>
          <button className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800" onClick={onConfirm}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfileMasterPage() {
  const userId = localStorage.getItem('userid');
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [confirmation, setConfirmation] = useState({ show: false, message: '', onConfirm: () => { } });
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState({ name: '', created_by: userId });
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const res = await axios.get(`${baseURL}/GetProfileList`);
      setProfiles(res.data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Failed to fetch profiles');
    }
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (profile.block ? 'yes' : 'no').includes(searchTerm.toLowerCase())
  );

  const sorted = React.useMemo(() => {
    let sortableItems = [...filteredProfiles];
    if (sortConfig.key !== '') {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredProfiles, sortConfig]);

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentProfiles = sorted.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProfiles.length / entriesPerPage);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const startEditing = (profile) => {
    setEditId(profile.profile_id);
    setEditData({ profile_id: profile.profile_id, name: profile.name });
  };

  const cancelEditing = () => {
    setEditId(null);
    setEditData({});
  };

  const handleEditChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const confirmSave = () => {
    setConfirmation({
      show: true,
      message: 'Are you sure you want to save changes?',
      onConfirm: async () => {
        try {
          const formData = new FormData();
          formData.append('ProfileID', editData.profile_id);
          formData.append('Name', editData.name);
          formData.append('RequestBy', userId);

          const res = await axios.post(`${baseURL}/EditProfile`, formData);

          if (res.data === 'success') {
                                          fetchProfiles();
                                          cancelEditing();
                                          toast.success('Updated successfully!');
                                        } else {
                                          toast.error(res.data === 'alreadyexists' ? 'Profile already exists!' : `Error: ${res.data}`);
                                        }
                                      } catch (err) {
                                        console.error('Edit failed', err);
                                        toast.error('Error saving profile');
                                      }
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const confirmDelete = (profileId) => {
    setConfirmation({
      show: true,
      message: 'Are you sure you want to delete this profile?',
      onConfirm: async () => {
        try {
                  await axios.get(`${baseURL}/BlockProfile/${userId}/${profileId}/1`);
                  fetchProfiles();
                  toast.success('Deleted successfully!');
                } catch (err) {
                  console.error('Delete failed', err);
                  toast.error('Error deleting profile');
                }
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const toggleBlock = async (profile) => {
    try {
      await axios.get(`${baseURL}/BlockProfile/${userId}/${profile.profile_id}/${profile.block ? 0 : 1}`);
      fetchProfiles();
    } catch (err) {
      console.error(err);
      alert('Error toggling block status');
    }
  };

  const startAdding = () => {
    setIsAdding(true);
    setNewData({ name: '', created_by: userId });
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewData({ name: '', created_by: '' });
  };

  const saveAdding = () => {
    if (!newData.name) {
      toast.error('Please enter a name');
      return;
    }
    setConfirmation({
      show: true,
      message: 'Are you sure you want to add this profile?',
      onConfirm: async () => {
        try {
          const formData = new FormData();
          formData.append('Name', newData.name);
          formData.append('RequestBy', newData.created_by);
          const res = await axios.post(`${baseURL}/AddProfile`, formData);
          if (res.data === 'success') {
                            fetchProfiles();
                            cancelAdding();
                            toast.success('Added successfully!');
                          } else {
                            toast.error(res.data === 'alreadyexists' ? 'Profile already exists!' : `Error: ${res.data}`);
                          }
                        } catch (err) {
                          console.error('Add failed', err);
                          toast.error('Error adding profile');
                        } 
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const headers = [
    { key: 'profile_id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'updated_by', label: 'Updated By' },
    { key: 'updated_date', label: 'Updated Date' },
    { key: 'block', label: 'Block' },
  ];

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />;
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar />
        <div className={`flex flex-col flex-1 p-6 overflow-auto transition duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-400">Profile</h2>
            <Breadcrumb />
          </div>

          <div className="mb-4 flex justify-between items-center">
            <input
              type="text"
              placeholder="Search ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded px-5 py-1 focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:text-white"
            />
            {!isAdding && (
              <button
                className="bg-green-700 text-white px-4 py-1 rounded hover:bg-green-800 flex items-center"
                onClick={startAdding}
              >
                <FaPlus className="mr-2" /> Add New Profile
              </button>
            )}
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md">
            <table className="min-w-full text-sm text-gray-800 dark:text-gray-200">
              <thead className="bg-green-100 dark:bg-green-900 sticky top-0 z-10">
                <tr>
                  {headers.map(header => (
                    <th
                      key={header.key}
                      className="px-4 py-2 font-semibold text-left cursor-pointer"
                      onClick={() => handleSort(header.key)}
                    >
                      <div className="flex items-center">
                        {header.label}
                        {getSortIcon(header.key)}
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-2 font-semibold text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isAdding && (
                  <tr className="border-b dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-950 transition duration-150">
                    <td className="px-4 py-2">New</td>
                    <td className="px-4 py-2">
                      <input
                        value={newData.name}
                        onChange={(e) => setNewData({ ...newData, name: e.target.value })}
                        className="border dark:border-gray-600 rounded px-2 py-1 w-full bg-white dark:bg-gray-700"
                      />
                    </td>
                    <td className="px-4 py-2">{userId}</td>
                    <td className="px-4 py-2">-</td>
                    <td className="px-4 py-2">
                      <span className="px-3 py-1 rounded-full text-white text-xs bg-green-600">No</span>
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <button onClick={saveAdding} className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"><FaSave size={18} /></button>
                      <button onClick={cancelAdding} className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"><FaTimes size={18} /></button>
                    </td>
                  </tr>
                )}
                {currentProfiles.map((profile) => (
                  <tr key={profile.profile_id} className="border-b dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-950 transition duration-150">
                    <td className="px-4 py-2">{profile.profile_id}</td>
                    <td className="px-4 py-2">
                      {editId === profile.profile_id ? (
                        <input
                          value={editData.name}
                          onChange={(e) => handleEditChange('name', e.target.value)}
                          className="border dark:border-gray-600 rounded px-2 py-1 w-full bg-white dark:bg-gray-700"
                        />
                      ) : (
                        profile.name
                      )}
                    </td>
                    <td className="px-4 py-2">{profile.updated_by}</td>
                    <td className="px-4 py-2">{new Date(profile.updated_date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      <span
                        onClick={() => toggleBlock(profile)}
                        className={`px-3 py-1 rounded-full cursor-pointer text-white text-xs ${
                          profile.block ? 'bg-red-600' : 'bg-green-600'
                        }`}
                      >
                        {profile.block ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      {editId === profile.profile_id ? (
                        <>
                          <button onClick={confirmSave} className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"><FaSave size={18} /></button>
                          <button onClick={cancelEditing} className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"><FaTimes size={18} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEditing(profile)} className="text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"><FaEdit size={18} /></button>
                          <button onClick={() => confirmDelete(profile.profile_id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"><FaTrash size={18} /></button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-between mt-4 text-sm items-center text-gray-700 dark:text-gray-300">
            <span>
              Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredProfiles.length)} of {filteredProfiles.length} entries
            </span>
            <div className="flex gap-1">
              <button onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                Previous
              </button>
              {[...Array(totalPages).keys()].map(num => (
                <button key={num + 1} onClick={() => setCurrentPage(num + 1)} className={`px-3 py-1 border rounded dark:border-gray-600 dark:bg-gray-700 dark:text-white ${currentPage === num + 1 ? 'bg-green-600 text-white dark:bg-green-700' : ''}`}>
                  {num + 1}
                </button>
              ))}
              <button onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
      {confirmation.show && (
        <ConfirmationModal
          message={confirmation.message}
          onConfirm={confirmation.onConfirm}
          onCancel={() => setConfirmation({ ...confirmation, show: false })}
        />
      )}
    </div>
  );
}