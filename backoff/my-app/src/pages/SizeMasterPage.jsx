import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumb from '../components/Breadcrumb';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const baseURL = process.env.REACT_APP_API_BASE_URL;
const userId  = localStorage.getItem('userid');

function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-96">
        <p className="mb-4 text-gray-800 dark:text-gray-200">{message}</p>
        <div className="flex justify-end space-x-2">
          <button className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-600" onClick={onCancel}>Cancel</button>
          <button className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800" onClick={onConfirm}>Yes</button>
        </div>
      </div>
    </div>
  );
}

export default function SizeMasterPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sizes, setSizes] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [confirmation, setConfirmation] = useState({ show:false,message:'',onConfirm:()=>{} });
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState({ size_name:'', created_by:'' });

  const [entriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key:'', direction:'ascending' });
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
    fetchSizes();
  }, []);

  const fetchSizes = async () => {
    try {
          const res = await axios.get(`${baseURL}/GetSizeList`);
          setSizes(res.data);
        } catch (error) {
          console.error('Error fetching sizes:', error);
           toast.error('Failed to fetch sizes');
        }
      };

  const filtered = sizes.filter(
    sz => sz.size_name.toLowerCase().includes(searchTerm.toLowerCase()) || (sz.block?'yes':'no').includes(searchTerm.toLowerCase())
  );

  const sorted = React.useMemo(()=>{
    let sortableItems = [...filtered];
    if (sortConfig.key !== '') {
      sortableItems.sort((a,b)=>{
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction==='ascending'? -1:1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction==='ascending'? 1:-1;
        return 0;
      });
    }
    return sortableItems;
  },[filtered,sortConfig]);

  const indexOfLast  = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentSizes = sorted.slice(indexOfFirst,indexOfLast);
  const totalPages   = Math.ceil(sorted.length/entriesPerPage);

  const handleSort = (key)=>{
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') direction='descending';
    setSortConfig({key,direction});
  };

  const startEditing = (sz)=>{ setEditId(sz.size_id); setEditData({...sz}); };
  const cancelEditing = ()=>{ setEditId(null); setEditData({}); };
  const handleEditChange = (field,val)=> setEditData({...editData,[field]:val});

  const confirmSave=()=>{
    setConfirmation({
      show:true,
      message:'Are you sure you want to save changes?',
      onConfirm:async()=>{
      try {        
        const formData = new FormData();
        formData.append('SizeId', editData.size_id);
        formData.append('SizeName', editData.size_name);
        formData.append('RequestBy', userId);
        const res=await axios.post(`${baseURL}/EditSize`,formData);
        const original = sizes.find((a) => a.size_id === editData.size_id);
        if (original.block !== editData.block) {
          await axios.get(`${baseURL}/BlockSize/${userId}/${editData.size_id}/${editData.block ? 1 : 0}`);
        }
        if (res.data === 'success') {
                                        fetchSizes();
                                        cancelEditing();
                                        toast.success('Updated successfully!');
                                      } else {
                                        toast.error(res.data === 'alreadyexists' ? 'Size already exists!' : `Error: ${res.data}`);
                                      }
                                    } catch (err) {
                                      console.error('Edit failed', err);
                                      toast.error('Error saving size');
                                    }
        
        setConfirmation({...confirmation,show:false});
      }
    });
  };

  const confirmDelete=(id)=>{
    setConfirmation({
      show:true,
      message:'Are you sure you want to delete this size?',
      onConfirm:async()=>{
        try {
          await axios.get(`${baseURL}/BlockSize/${userId}/${id}/1`);
          fetchSizes();
          toast.success('Deleted successfully!');
        } catch (err) {
          console.error('Delete failed', err);
          toast.error('Error deleting size');
        }
        setConfirmation({...confirmation,show:false});
      }
    });
  };

  const toggleBlock = async (sz)=>{
    await axios.get(`${baseURL}/BlockSize/${userId}/${sz.size_id}/${sz.block?0:1}`);
    fetchSizes();
  };

  const startAdding=()=>{ setIsAdding(true); };
  const cancelAdding=()=>{ setIsAdding(false); setNewData({size_name:'',created_by:''}); };

  const saveAdding = () => {
  if (!newData.size_name) {
    toast.error('Please enter size');
    return;
  }

  setConfirmation({
    show: true,
    message: 'Are you sure you want to add this size?',
    onConfirm: async () => {
      try {
        const formData = new FormData();
        formData.append('SizeName', newData.size_name);
        formData.append('RequestBy', userId);

        const res = await axios.post(`${baseURL}/AddSize`, formData); 

        if (res.data === 'success') {
          fetchSizes(); 
          cancelAdding();
          toast.success('Added successfully!');
        } else {
          toast.error(
            res.data === 'alreadyexists'
              ? 'Size already exists!'
              : `Error: ${res.data}`
          );
        }
      } catch (err) {
        console.error('Add failed', err);
        toast.error('Error adding size');
      }

      setConfirmation((prev) => ({ ...prev, show: false }));
    },
  });
};

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar />

        <div className={`flex flex-col flex-1 overflow-hidden p-5 transition duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex justify-between items-center mb-4 mt-2">
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-500">Size</h2>
            <Breadcrumb />
          </div>

          <div className="w-full max-w-screen-xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col  max-h-[75vh] overflow-hidden">
            <div className="mb-4 flex justify-between items-center">
              <input
                type="text"
                placeholder="Search ..."
                value={searchTerm}
                onChange={(e)=>setSearchTerm(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded px-5 py-0.5 focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:text-gray-200"
              />
              {!isAdding && (
                <button onClick={startAdding} className="bg-green-700 text-white px-4 py-1.5 rounded hover:bg-green-800 flex items-center text-sm font-medium">
                  <FaPlus className="mr-2"/> Add New Size
                </button>
              )}
            </div>

            <div className="overflow-x-auto overflow-y-auto max-h-[60vh] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md">
              <table className="min-w-full text-sm text-gray-800 dark:text-gray-200">
                <thead className="bg-green-100 dark:bg-green-900 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 font-semibold text-left">Size Name</th>
                    <th className="px-4 py-2 font-semibold text-left">Updated By</th>
                    <th className="px-4 py-2 font-semibold text-left">Updated Date</th>
                    <th className="px-4 py-2 font-semibold text-left">Block</th>
                    <th className="px-4 py-2 font-semibold text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isAdding && (
                    <tr className="border-b dark:border-gray-700">
                      <td className="px-4 py-2"><input value={newData.size_name} onChange={(e)=>setNewData({...newData,size_name:e.target.value})} className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:text-gray-200"/></td>
                      <td className="px-4 py-2">--</td>
                      <td className="px-4 py-2">--</td>
                      <td className="px-4 py-2">--</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button onClick={saveAdding}   className="text-green-600"><FaSave size={22}/></button>
                        <button onClick={cancelAdding} className="text-gray-600"><FaTimes size={22}/></button>
                      </td>
                    </tr>
                  )}

                  {currentSizes.map((sz)=>(
                    <tr key={sz.size_id} className="border-b dark:border-gray-700">
                      <td className="px-4 py-2">
                        {editId===sz.size_id ? (
                          <input value={editData.size_name} onChange={(e)=>handleEditChange('size_name',e.target.value)} className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:text-gray-200"/>
                        ) : (
                          sz.size_name
                        )}
                      </td>
                      <td className="px-4 py-2">{sz.updated_by}</td>
                      <td className="px-4 py-2">{new Date(sz.updated_date).toLocaleDateString()}</td>
                      <td className="px-4 py-2">
                        {editId===sz.size_id ? (
                          <span onClick={()=>setEditData({...editData,block:!editData.block})} className={`px-3 py-1 rounded-full cursor-pointer text-white text-xs ${editData.block?'bg-red-600':'bg-green-600'}`}>{editData.block?'Yes':'No'}</span>
                        ) : (
                          <span  className={`px-3 py-1 rounded-full cursor-pointer text-white text-xs ${sz.block?'bg-red-600':'bg-green-600'}`}>{sz.block?'Yes':'No'}</span>
                        )}
                      </td>
                      <td className="px-4 py-2 flex gap-2">
                        {editId===sz.size_id ? (
                          <>
                            <button onClick={confirmSave}   className="text-green-600"><FaSave size={22}/></button>
                            <button onClick={cancelEditing} className="text-gray-600"><FaTimes size={22}/></button>
                          </>
                        ) : (
                          <>
                            <button onClick={()=>startEditing(sz)}            className="text-yellow-500"><FaEdit size={18}/></button>
                            <button onClick={()=>confirmDelete(sz.size_id)}  className="text-red-500"><FaTrash size={18}/></button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between mt-4 text-sm items-center text-gray-800 dark:text-gray-200">
              <span>Showing {indexOfFirst+1} to {Math.min(indexOfLast, sorted.length)} of {sorted.length} entries</span>
              <div className="flex gap-1">
                <button disabled={currentPage===1} onClick={()=>setCurrentPage(Math.max(currentPage-1,1))} className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600">Previous</button>
                {[...Array(totalPages).keys()].map((num)=>(
                  <button key={num+1} onClick={()=>setCurrentPage(num+1)} className={`px-3 py-1 border rounded ${currentPage===num+1?'bg-green-600 text-white dark:bg-green-500':'dark:border-gray-600 dark:text-gray-200'}`}>
                    {num+1}
                  </button>
                ))}
                <button disabled={currentPage===totalPages} onClick={()=>setCurrentPage(Math.min(currentPage+1,totalPages))} className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600">Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {confirmation.show && (
        <ConfirmationModal
          message={confirmation.message}
          onConfirm={confirmation.onConfirm}
          onCancel={() => setConfirmation({ ...confirmation, show:false })}
        />
      )}
    </div>
  );
}
