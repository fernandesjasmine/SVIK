import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Breadcrumb from "../components/Breadcrumb";
import { FaPlus, FaAngleLeft, FaAngleRight } from "react-icons/fa"; // Keep only the needed icons
// import axios from "axios"; // API integration commented as APIs not yet created
// import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// const baseURL = process.env.REACT_APP_API_BASE_URL; // API base URL commented

export default function ProductsImagePage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [columnSearches, setColumnSearches] = useState({
    product_name: "",
    sku_code: "",
    faces: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

   useEffect(() => {
     fetchProducts();
   }, []);

   const fetchProducts = async () => {
     setIsLoading(true);
     try {
       const res = await axios.get(`${baseURL}/root/assets/media/thumb/imagename.jpg
`);
       setProducts(res.data || []);
     } catch (err) {
       toast.error("Failed to fetch products");
     } finally {
       setIsLoading(false);
     }
  };

  const handleGlobalSearchChange = (e) => {
    setGlobalSearch(e.target.value.toLowerCase());
    setCurrentPage(1);
  };

  const handleSearchChange = (key, value) => {
    setColumnSearches((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "ascending" ? "descending" : "ascending",
    }));
    setCurrentPage(1);
  };

  const getSortedAndFilteredProducts = () => {
    let filtered = [...products];

    if (globalSearch) {
      filtered = filtered.filter((p) =>
        Object.values(p).some((val) => String(val).toLowerCase().includes(globalSearch))
      );
    }

    filtered = filtered.filter((p) =>
      Object.entries(columnSearches).every(([key, val]) =>
        !val || String(p[key]).toLowerCase().includes(val.toLowerCase())
      )
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (!isNaN(aVal) && !isNaN(bVal)) {
          return sortConfig.direction === "ascending" ? aVal - bVal : bVal - aVal;
        }
        return sortConfig.direction === "ascending"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }

    return filtered;
  };

  const filteredProducts = getSortedAndFilteredProducts();
  const totalPages = Math.ceil(filteredProducts.length / entriesPerPage);
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar theme="light" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar theme="light" />

        <div className="flex flex-col flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-400">Products Images</h2>
            <Breadcrumb />
          </div>

          <div className="w-full max-w-screen-xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col max-h-[75vh] overflow-hidden">
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded">
                {error}
                <button className="float-right font-bold" onClick={() => setError("")}>
                  ×
                </button>
              </div>
            )}

            {message && (
              <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 rounded">
                {message}
                <button className="float-right font-bold" onClick={() => setMessage("")}>
                  ×
                </button>
              </div>
            )}

            {/* Top Controls */}
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
              {/* Show Entries */}
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
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2 whitespace-nowrap">entries</span>
              </div>

              {/* Global Search */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search..."
                  value={globalSearch}
                  onChange={handleGlobalSearchChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-0.5 pl-10 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400 dark:text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {/* Upload Excel or Folder */}
              <div className="w-full sm:w-auto ml-auto">
                <button
                  className="bg-green-700 text-white px-4 py-1.5 rounded hover:bg-green-800 flex items-center text-sm font-medium"
                >
                  <FaPlus className="mr-2" /> Upload Excel or Folder
                </button>
              </div>
            </div>

            {/* Table */}
            <div
              className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow"
              style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
            >
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead className="bg-green-100 dark:bg-green-900 text-gray-800 dark:text-gray-200 sticky top-0">
                  <tr>
                    {["product_name", "sku_code", "images", "faces"].map((key) => (
                      <th
                        key={key}
                        className="px-4 py-2 font-semibold text-left cursor-pointer"
                        onClick={() => handleSort(key)}
                      >
                        <div className="flex items-center">
                          {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          <span className="ml-1">
                            {sortConfig.key === key && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                          </span>
                        </div>
                        {key !== "images" && (
                          <input
                            type="text"
                            placeholder="Search..."
                            value={columnSearches[key] || ""}
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
                  {currentProducts.map((product, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-green-50 dark:hover:bg-gray-700 transition duration-150"
                    >
                      <td className="px-4 py-2">{product.product_name}</td>
                      <td className="px-4 py-2">{product.sku_code}</td>
                      <td className="px-4 py-2">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt="Product"
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          "No Image"
                        )}
                      </td>
                      <td className="px-4 py-2">{product.faces}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between mt-4 text-sm items-center text-gray-800 dark:text-gray-200">
              <span>
                Showing {filteredProducts.length === 0 ? 0 : indexOfFirst + 1} to{" "}
                {Math.min(indexOfLast, filteredProducts.length)} of {filteredProducts.length} entries
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
                        ? "bg-green-600 text-white"
                        : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
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
          </div>
        </div>
      </div>
    </div>
  );
}
