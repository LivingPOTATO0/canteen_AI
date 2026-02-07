import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VendorDashboard = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [status, setStatus] = useState('closed');
  const [vendorName, setVendorName] = useState('');
  const [newItem, setNewItem] = useState({ name: '', price: '', base_prep_time: '' });
  
  // Hardcoded for Phase 2 MVP
  const VENDOR_ID = 1;

  useEffect(() => {
    fetchMenu();
    fetchVendorDetails(); // In a real app, we'd get this from context/auth
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/vendor/menu?vendorId=${VENDOR_ID}`);
      setMenuItems(res.data);
    } catch (err) {
      console.error('Error fetching menu:', err);
    }
  };

  const fetchVendorDetails = async () => {
    // In a real app we would have a specific endpoint for vendor details
    // For now, let's assume the first vendor in the list is us, or just fetch all and filter
    try {
      const res = await axios.get(`http://localhost:3000/api/vendor`);
      const myVendor = res.data.find(v => v.id === VENDOR_ID);
      if (myVendor) {
        setVendorName(myVendor.name);
        setStatus(myVendor.status);
      }
    } catch (err) {
      console.error('Error fetching vendor details:', err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.put('http://localhost:3000/api/vendor/status', {
        vendorId: VENDOR_ID,
        status: newStatus
      });
      setStatus(newStatus);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/vendor/menu', {
        vendorId: VENDOR_ID,
        name: newItem.name,
        price: parseFloat(newItem.price),
        base_prep_time: parseInt(newItem.base_prep_time) || 5
      });
      setNewItem({ name: '', price: '', base_prep_time: '' });
      fetchMenu(); // Refresh list
    } catch (err) {
      console.error('Error adding item:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* Header & Status Toggle */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {vendorName || 'Vendor Dashboard'}
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <span className="mr-3 self-center text-sm text-gray-500">Shop Status:</span>
          <div className="relative inline-flex shadow-sm rounded-md">
            <button
              onClick={() => handleStatusChange('open')}
              className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 text-sm font-medium focus:z-10 focus:outline-none ${
                status === 'open' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => handleStatusChange('busy')}
              className={`relative -ml-px inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium focus:z-10 focus:outline-none ${
                status === 'busy' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Busy
            </button>
            <button
              onClick={() => handleStatusChange('closed')}
              className={`relative -ml-px inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 text-sm font-medium focus:z-10 focus:outline-none ${
                status === 'closed' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Closed
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Menu List */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Current Menu</h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {menuItems.map((item) => (
                <li key={item.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-indigo-600 truncate">{item.name}</p>
                      <p className="text-sm text-gray-500">Prep: {item.base_prep_time} mins</p>
                    </div>
                    <div className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      ₹{item.price}
                    </div>
                  </div>
                </li>
              ))}
              {menuItems.length === 0 && (
                <li className="px-4 py-8 text-center text-gray-500">No items found. Add one!</li>
              )}
            </ul>
          </div>
        </div>

        {/* Add New Item Form */}
        <div className="bg-white shadow sm:rounded-lg h-fit">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Item</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Item Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                <input
                  type="number"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Prep Time (mins)</label>
                <input
                  type="number"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newItem.base_prep_time}
                  onChange={(e) => setNewItem({ ...newItem, base_prep_time: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Item
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
