import React, { useState, useEffect } from 'react';
import axios from 'axios';
import socket from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, TrendingUp, DollarSign, Package } from 'lucide-react';

const VendorDashboard = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [status, setStatus] = useState('closed');
  const [vendorName, setVendorName] = useState('');
  const [newItem, setNewItem] = useState({ name: '', price: '', base_prep_time: '' });
  
  // Get Vendor from LocalStorage
  const vendorUser = JSON.parse(localStorage.getItem('vendorUser'));
  const VENDOR_ID = vendorUser ? vendorUser.vendorId : null;

  useEffect(() => {
    if (!vendorUser || !VENDOR_ID) {
        window.location.href = '/login';
        return;
    }
    fetchMenu();
    fetchVendorDetails();
    fetchActiveOrders();
    fetchActiveOrders();
    
    // Initial Join
    socket.emit('join_vendor', VENDOR_ID);

    // Re-join on reconnect
    const handleConnect = () => {
        console.log("Reconnected to server, joining vendor room...");
        socket.emit('join_vendor', VENDOR_ID);
    };

    socket.on('connect', handleConnect);

    socket.on('new_order', (order) => {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => console.log(e));
      setActiveOrders(prev => [order, ...prev]);
    });

    return () => socket.off('new_order');
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/vendor/menu?vendorId=${VENDOR_ID}`);
      setMenuItems(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchActiveOrders = async () => {
    try {
        const res = await axios.get(`http://localhost:3000/api/orders/vendor/${VENDOR_ID}`);
        setActiveOrders(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchVendorDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/vendor`);
      const myVendor = res.data.find(v => v.id === VENDOR_ID);
      if (myVendor) {
        setVendorName(myVendor.name);
        setStatus(myVendor.status);
      }
    } catch (err) { console.error(err); }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.put('http://localhost:3000/api/vendor/status', { vendorId: VENDOR_ID, status: newStatus });
      setStatus(newStatus);
    } catch (err) { console.error(err); }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
      try {
          await axios.put(`http://localhost:3000/api/orders/${orderId}/status`, { status: newStatus });
          setActiveOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      } catch (err) { console.error(err); }
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
      fetchMenu(); 
    } catch (err) { console.error(err); }
  };

  const getStatusColor = (s) => {
      switch(s) {
          case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
          case 'preparing': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
          case 'ready': return 'bg-green-500/20 text-green-400 border-green-500/50';
          default: return 'bg-gray-700 text-gray-400 border-gray-600';
      }
  };

  const stats = {
      totalOrders: activeOrders.length,
      revenue: activeOrders.reduce((acc, order) => acc + parseFloat(order.total_price), 0),
      pending: activeOrders.filter(o => o.status === 'pending').length
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans pb-20">
      
      {/* Header & Stats */}
      <div className="bg-gray-800 border-b border-gray-700 pb-8 pt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="md:flex md:items-center md:justify-between">
                  <div className="flex-1 min-w-0">
                      <h2 className="text-3xl font-bold leading-7 text-white sm:text-4xl sm:truncate">
                          {vendorName || 'Vendor Dashboard'}
                      </h2>
                      <p className="mt-1 text-gray-400">Manage orders and menu in real-time.</p>
                  </div>
                  <div className="mt-4 flex md:mt-0 md:ml-4 bg-gray-700 p-1 rounded-lg">
                      {['open', 'busy', 'closed'].map((s) => (
                          <button
                              key={s}
                              onClick={() => handleStatusChange(s)}
                              className={`px-4 py-2 rounded-md text-sm font-bold capitalize transition-all ${
                                  status === s 
                                  ? s === 'open' ? 'bg-green-600 text-white shadow-lg' 
                                  : s === 'busy' ? 'bg-yellow-600 text-white shadow-lg' 
                                  : 'bg-red-600 text-white shadow-lg'
                                  : 'text-gray-400 hover:text-white hover:bg-gray-600'
                              }`}
                          >
                              {s}
                          </button>
                      ))}
                  </div>
              </div>

              {/* Stats Grid */}
              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div className="bg-gray-900 border border-gray-700 overflow-hidden shadow rounded-xl">
                      <div className="p-5">
                          <div className="flex items-center">
                              <div className="flex-shrink-0 bg-indigo-500/20 rounded-md p-3">
                                  <Package className="h-6 w-6 text-indigo-400" />
                              </div>
                              <div className="ml-5 w-0 flex-1">
                                  <dl>
                                      <dt className="text-sm font-medium text-gray-400 truncate">Total Active Orders</dt>
                                      <dd className="text-2xl font-bold text-white">{stats.totalOrders}</dd>
                                  </dl>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="bg-gray-900 border border-gray-700 overflow-hidden shadow rounded-xl">
                      <div className="p-5">
                          <div className="flex items-center">
                              <div className="flex-shrink-0 bg-green-500/20 rounded-md p-3">
                                  <DollarSign className="h-6 w-6 text-green-400" />
                              </div>
                              <div className="ml-5 w-0 flex-1">
                                  <dl>
                                      <dt className="text-sm font-medium text-gray-400 truncate">Est. Revenue (Session)</dt>
                                      <dd className="text-2xl font-bold text-white">₹{stats.revenue}</dd>
                                  </dl>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="bg-gray-900 border border-gray-700 overflow-hidden shadow rounded-xl">
                      <div className="p-5">
                          <div className="flex items-center">
                              <div className="flex-shrink-0 bg-yellow-500/20 rounded-md p-3">
                                  <AlertCircle className="h-6 w-6 text-yellow-400" />
                              </div>
                              <div className="ml-5 w-0 flex-1">
                                  <dl>
                                      <dt className="text-sm font-medium text-gray-400 truncate">Pending Action</dt>
                                      <dd className="text-2xl font-bold text-white">{stats.pending}</dd>
                                  </dl>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Live Orders */}
          <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                  <TrendingUp className="mr-2 text-tomato-500" /> Live Kitchen Feed
              </h3>
              
              <div className="space-y-4">
                  <AnimatePresence>
                  {activeOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length === 0 ? (
                       <div className="text-center py-20 bg-gray-800 rounded-2xl border border-gray-700 border-dashed">
                           <p className="text-gray-400">No active orders. Waiting for hungry students...</p>
                       </div>
                  ) : (
                      activeOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').map((order) => (
                      <motion.div 
                          key={order.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`bg-gray-800 rounded-xl p-6 border-l-4 shadow-lg ${
                              order.status === 'pending' ? 'border-yellow-500' : 
                              order.status === 'preparing' ? 'border-blue-500' : 'border-green-500'
                          }`}
                      >
                          <div className="flex justify-between items-start">
                              <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                      <span className="text-3xl font-mono font-bold text-white tracking-widest">{order.token}</span>
                                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(order.status)}`}>
                                          {order.status}
                                      </span>
                                  </div>
                                  <div className="space-y-1 mb-4">
                                      {order.OrderItems && order.OrderItems.map(item => (
                                          <div key={item.id} className="text-gray-300 flex justify-between max-w-xs">
                                              <span><span className="text-white font-bold">{item.quantity}x</span> {item.MenuItem?.name}</span>
                                          </div>
                                      ))}
                                  </div>
                                  <p className="text-xs text-gray-500 flex items-center">
                                      <Clock className="w-3 h-3 mr-1" /> Pickup: {new Date(order.predicted_pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                              </div>

                              <div className="flex flex-col space-y-2 ml-4">
                                  {order.status === 'pending' && (
                                      <button 
                                          onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                                          className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/30"
                                      >
                                          Start Cook
                                      </button>
                                  )}
                                  {order.status === 'preparing' && (
                                      <button 
                                          onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                                          className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-bold rounded-lg text-white bg-green-600 hover:bg-green-500 transition-colors shadow-lg shadow-green-500/30"
                                      >
                                          Mark Ready
                                      </button>
                                  )}
                                  {order.status === 'ready' && (
                                      <button 
                                          onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                                          className="flex items-center justify-center px-4 py-3 border border-gray-600 text-sm font-bold rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
                                      >
                                          Complete
                                      </button>
                                  )}
                              </div>
                          </div>
                      </motion.div>
                  )))}
                  </AnimatePresence>
              </div>
          </div>

          {/* Right Column: Menu Actions */}
          <div className="space-y-6">
              <div className="bg-gray-800 shadow-xl rounded-2xl border border-gray-700 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/50">
                      <h3 className="text-lg font-bold text-white">Quick Menu Add</h3>
                  </div>
                  <div className="p-6">
                      <form onSubmit={handleAddItem} className="space-y-4">
                      <div>
                          <input type="text" placeholder="Item Name" required className="block w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-tomato-500 focus:border-transparent" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <input type="number" placeholder="Price (₹)" required className="block w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-tomato-500 focus:border-transparent" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} />
                          <input type="number" placeholder="Time (min)" required className="block w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-tomato-500 focus:border-transparent" value={newItem.base_prep_time} onChange={(e) => setNewItem({ ...newItem, base_prep_time: e.target.value })} />
                      </div>
                      <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-tomato-600 hover:bg-tomato-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tomato-500 transition-colors">
                          Add to Menu
                      </button>
                      </form>
                  </div>
              </div>

               <div className="bg-gray-800 shadow-xl rounded-2xl border border-gray-700 overflow-hidden flex-1">
                  <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/50">
                     <h3 className="text-lg font-bold text-white">Active Menu</h3>
                  </div>
                  <ul className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
                  {menuItems.map((item) => (
                      <li key={item.id} className="px-6 py-4 hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center justify-between">
                          <div>
                              <p className="text-sm font-bold text-white">{item.name}</p>
                              <p className="text-xs text-gray-500">{item.base_prep_time} min prep</p>
                          </div>
                          <span className="px-2 py-1 text-xs font-bold rounded bg-gray-700 text-tomato-400 border border-gray-600">
                          ₹{item.price}
                          </span>
                      </div>
                      </li>
                  ))}
                  </ul>
              </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default VendorDashboard;
