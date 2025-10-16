import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumb from '../components/Breadcrumb';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const baseURL = process.env.REACT_APP_API_BASE_URL;

function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-96">
        <p className="mb-4 text-gray-800 dark:text-gray-200">{message}</p>
        <div className="flex justify-end space-x-2">
          <button
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
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

const userId = localStorage.getItem('userid');

export default function UserMasterPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [confirmation, setConfirmation] = useState({ show: false, message: '', onConfirm: () => {} });
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState({
    CompId: '',
    UserName: '',
    EmailId: '',
    ContNumber: '',
    ProfileId: '',
    RequestBy: userId,
    block: false
  });
  const [error, setError] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${baseURL}/GetUserList`);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching users', err);
      toast.error('Failed to fetch');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter((user) => {
    const name = (user?.user_name ?? '').toLowerCase();
    const email = (user?.email_id ?? '').toLowerCase();
    const blocked = (user?.block ? 'yes' : 'no').toLowerCase();
    const q = (searchTerm ?? '').toLowerCase();
    return name.includes(q) || email.includes(q) || blocked.includes(q);
  });

  const sorted = useMemo(() => {
    const items = [...filtered];
    if (sortConfig.key) {
      items.sort((a, b) => {
        const aVal = (a?.[sortConfig.key] ?? '').toString().toLowerCase();
        const bVal = (b?.[sortConfig.key] ?? '').toString().toLowerCase();
        if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [filtered, sortConfig]);

  const totalPages = Math.ceil(sorted.length / entriesPerPage) || 0;
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentUsers = sorted.slice(indexOfFirst, indexOfLast);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const startEditing = (user) => {
    setEditId(user.user_id);
    setEditData({
      UserId: user.user_id,
      CompId: user.comp_id ?? '',
      UserName: user.user_name ?? '',
      EmailId: user.email_id ?? '',
      ContNumber: user.cont_number ?? '',
      ProfileId: user.profile_id ?? '',
      RequestBy: userId,
      block: !!user.block
    });
  };

  const cancelEditing = () => {
    setEditId(null);
    setEditData({});
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

const confirmSave = () => {
  setConfirmation({
    show: true,
    message: 'Are you sure you want to save changes?',
    onConfirm: async () => {
      try {
        // Build form-data for the EditUser API
        const formData = new FormData();
        Object.entries(editData).forEach(([k, v]) =>
          formData.append(k, k === 'block' ? (v ? '1' : '0') : v)
        );

        // Call EditUser
        const res = await axios.post(`${baseURL}/EditUser`, formData);

        // If the block status has changed, toggle it via BlockUser API
        const original = users.find((u) => u.user_id === editData.UserId);
        if (original && original.block !== editData.block) {
          await axios.get(
            `${baseURL}/BlockUser/${userId}/${editData.UserId}/${editData.block ? 1 : 0}`
          );
        }

        if (res.data === 'success') {
                                                          fetchUsers();
                                                          cancelEditing();
                                                          toast.success('Updated successfully!');
                                                        } else {
                                                          toast.error(res.data === 'alreadyexists' ? 'User already exists!' : `Error: ${res.data}`);
                                                        }
                                                      } catch (err) {
                                                        console.error('Edit failed', err);
                                                        toast.error('Error saving size');
                                                      }
      setConfirmation((prev) => ({ ...prev, show: false }));
    }
  });
};

  const confirmDelete = (id, blockStatus) => {
    setConfirmation({
      show: true,
      message: 'Are you sure you want to delete this user?',
      onConfirm: async () => {
       try {
          await axios.get(`${baseURL}/BlockUser/${userId}/${id}/1`);
          fetchUsers();
          toast.success('Deleted successfully!');
        } catch (err) {
          console.error('Delete failed', err);
          toast.error('Error deleting user');
        }
        setConfirmation((prev) => ({ ...prev, show: false }));
      }
    });
  };

  const startAdding = () => setIsAdding(true);

  const cancelAdding = () => {
    setIsAdding(false);
    setNewData({
      CompId: '',
      UserName: '',
      EmailId: '',
      ContNumber: '',
      ProfileId: '',
      RequestBy: userId,
      block: false
    });
  };

  const saveAdding = () => {
    if (!newData.UserName || !newData.EmailId) {
      toast.error('Please enter a name');
      return;
    }
    setConfirmation({
      show: true,
      message: 'Are you sure you want to save this new user?',
      onConfirm: async () => {
        try {
          const formData = new FormData();
          Object.entries(newData).forEach(([k, v]) =>
            formData.append(k, k === 'block' ? (v ? '1' : '0') : v)
          );
          const res = await axios.post(`${baseURL}/AddUser`, formData);
          if (res.data === 'success') {
                    fetchUsers(); 
                    cancelAdding();
                    toast.success('Added successfully!');
                  } else {
                    toast.error(
                      res.data === 'alreadyexists'
                        ? 'User already exists!'
                        : `Error: ${res.data}`
                    );
                  }
                } catch (err) {
                  console.error('Add failed', err);
                  toast.error('Error adding user');
                }
        setConfirmation((prev) => ({ ...prev, show: false }));
      }
    });
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar theme="light" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar theme="light" />

        <div className="flex flex-col flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-400">User</h2>
            <Breadcrumb />
          </div>

          <div className="w-full max-w-screen-xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col max-h-[75vh] overflow-hidden">
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded">
                {error}
                <button className="float-right font-bold" onClick={() => setError('')}>×</button>
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
                  {[5, 10, 25, 50, 100].map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2 whitespace-nowrap">entries</span>
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 dark:border-gray-600 rounded px-5 py-0.5 focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:text-gray-200"
                />
              </div>

              {!isAdding && (
                <div className="w-full sm:w-auto ml-auto">
                  <button
                    className="bg-green-700 text-white px-4 py-1.5 rounded hover:bg-green-800 flex items-center text-sm font-medium"
                    onClick={startAdding}
                  >
                    <FaPlus className="mr-2" /> Add New User
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead className="bg-green-100 dark:bg-green-900 text-gray-800 dark:text-gray-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 font-semibold text-left cursor-pointer" onClick={() => handleSort('user_name')}>User Name</th>
                    <th className="px-4 py-2 font-semibold text-left">Email</th>
                    <th className="px-4 py-2 font-semibold text-left">Contact</th>

                    <th className="px-4 py-2 font-semibold text-left">Updated By</th>
                    <th className="px-4 py-2 font-semibold text-left">Updated Date</th>
                    <th className="px-4 py-2 font-semibold text-left">Block</th>
                    <th className="px-4 py-2 font-semibold text-left">Actions</th>
                  </tr>
                </thead>

                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 text-gray-800 dark:text-gray-200">
                  {isAdding && (
                    <tr>
                      <td className="px-4 py-2"><input value={newData.UserName} onChange={(e) => setNewData({ ...newData, UserName: e.target.value })} className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:text-gray-200" /></td>
                      <td className="px-4 py-2"><input value={newData.EmailId} onChange={(e) => setNewData({ ...newData, EmailId: e.target.value })} className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:text-gray-200" /></td>
                      <td className="px-4 py-2"><input value={newData.ContNumber} onChange={(e) => setNewData({ ...newData, ContNumber: e.target.value })} className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:text-gray-200" /></td>
                      <td className="px-4 py-2"><input value={newData.CompId} onChange={(e) => setNewData({ ...newData, CompId: e.target.value })} className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:text-gray-200" /></td>
                      <td className="px-4 py-2"><input value={newData.ProfileId} onChange={(e) => setNewData({ ...newData, ProfileId: e.target.value })} className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:text-gray-200" /></td>
                      <td className="px-4 py-2">--</td>
                      <td className="px-4 py-2">--</td>
                      <td className="px-4 py-2">--</td>
                      <td className="px-4 py-2 space-x-2 flex">
                        <button onClick={saveAdding} className="text-green-600"><FaSave size={20} /></button>
                        <button onClick={cancelAdding} className="text-gray-600"><FaTimes size={20} /></button>
                      </td>
                    </tr>
                  )}

                  {currentUsers.map((user) => (
                    <tr key={user.user_id}>
                      <td className="px-4 py-2">
                        {editId === user.user_id ? (
                          <input value={editData.UserName} onChange={(e) => handleEditChange('UserName', e.target.value)} className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:text-gray-200" />
                        ) : user.user_name}
                      </td>
                      <td className="px-4 py-2">{editId === user.user_id ? <input value={editData.EmailId} onChange={(e) => handleEditChange('EmailId', e.target.value)} className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:text-gray-200" /> : user.email_id}</td>
                      <td className="px-4 py-2">{editId === user.user_id ? <input value={editData.ContNumber} onChange={(e) => handleEditChange('ContNumber', e.target.value)} className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:text-gray-200" /> : user.cont_number}</td>

                      <td className="px-4 py-2">{user.updated_by ?? '--'}</td>
                      <td className="px-4 py-2">{user.updated_date ? new Date(user.updated_date).toLocaleDateString() : '--'}</td>
                      <td className="px-4 py-2">
                        {editId === user.user_id ? (
                          <span onClick={() => handleEditChange('block', !editData.block)} className={`px-3 py-1 rounded-full cursor-pointer text-white text-xs ${editData.block ? 'bg-red-600' : 'bg-green-600'}`}>
                            {editData.block ? 'Yes' : 'No'}
                          </span>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-white text-xs ${user.block ? 'bg-red-600' : 'bg-green-600'}`}>
                            {user.block ? 'Yes' : 'No'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 space-x-2 flex">
                        {editId === user.user_id ? (
                          <>
                            <button onClick={confirmSave} className="text-green-600"><FaSave size={22} /></button>
                            <button onClick={cancelEditing} className="text-gray-600"><FaTimes size={22} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEditing(user)} className="text-yellow-500"><FaEdit size={18} /></button>
                            <button onClick={() => confirmDelete(user.user_id, user.block)} className="text-red-500"><FaTrash size={18} /></button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between mt-4 text-sm items-center text-gray-800 dark:text-gray-200">
              <span>Showing {sorted.length === 0 ? 0 : indexOfFirst + 1} to {Math.min(indexOfLast, sorted.length)} of {sorted.length} entries</span>
              <div className="flex gap-1">
                <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600 dark:text-gray-200">Previous</button>
                {[...Array(totalPages).keys()].map((num) => (
                  <button key={num + 1} onClick={() => setCurrentPage(num + 1)} className={`px-3 py-1 border rounded ${currentPage === num + 1 ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>{num + 1}</button>
                ))}
                <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600 dark:text-gray-200">Next</button>
              </div>
            </div>
          </div>
        </div>

        {confirmation.show && (
          <ConfirmationModal message={confirmation.message} onConfirm={confirmation.onConfirm} onCancel={() => setConfirmation((prev) => ({ ...prev, show: false }))} />
        )}
      </div>
    </div>
  );
}
