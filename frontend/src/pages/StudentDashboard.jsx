import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Clock } from 'lucide-react';

const StudentDashboard = () => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({}); // { itemId: quantity }
  const [orderStatus, setOrderStatus] = useState(null); // { token, predictedTime, status }
  const [loading, setLoading] = useState(true);

  // Hardcoded for Phase 3 MVP
  const STUDENT_ID = 1; 

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/vendor');
      setVendors(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setLoading(false);
    }
  };

  const handleVendorSelect = async (vendor) => {
    setSelectedVendor(vendor);
    setCart({}); // Clear cart when switching vendors
    setOrderStatus(null);
    try {
      const res = await axios.get(`http://localhost:3000/api/vendor/menu?vendorId=${vendor.id}`);
      setMenu(res.data);
    } catch (err) {
      console.error('Error fetching menu:', err);
    }
  };

  const addToCart = (itemId) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId]--;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const calculateTotal = () => {
    let total = 0;
    let prepTime = 0;
    Object.entries(cart).forEach(([itemId, qty]) => {
      const item = menu.find(i => i.id === parseInt(itemId));
      if (item) {
        total += parseFloat(item.price) * qty;
        prepTime += item.base_prep_time * qty;
      }
    });
    return { total, prepTime };
  };

  const handlePlaceOrder = async () => {
    if (!selectedVendor) return;

    const items = Object.entries(cart).map(([itemId, qty]) => ({
      menu_item_id: parseInt(itemId),
      quantity: qty
    }));

    try {
      const res = await axios.post('http://localhost:3000/api/orders', {
        studentId: STUDENT_ID,
        vendorId: selectedVendor.id,
        items
      });
      
      setOrderStatus({
        token: res.data.token,
        predictedTime: new Date(res.data.predicted_pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: res.data.status
      });
      setCart({}); // Clear cart
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Failed to place order. Please try again.');
    }
  };

  if (loading) return <div className="text-center py-10">Loading vendors...</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      
      {/* 1. Vendor Selection */}
      {!selectedVendor && (
        <div>
          <h2 className="text-2xl font-bold mb-6 px-4">Available Vendors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
            {vendors.map(vendor => (
              <div 
                key={vendor.id} 
                onClick={() => handleVendorSelect(vendor)}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg cursor-pointer transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{vendor.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                      vendor.status === 'open' ? 'bg-green-100 text-green-800' : 
                      vendor.status === 'busy' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {vendor.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Menu & Ordering */}
      {selectedVendor && !orderStatus && (
        <div className="flex flex-col md:flex-row gap-6 px-4">
          <div className="flex-1">
            <button 
              onClick={() => setSelectedVendor(null)}
              className="mb-4 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              &larr; Back to Vendors
            </button>
            <h2 className="text-2xl font-bold mb-4">{selectedVendor.name} Menu</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {menu.map(item => (
                  <li key={item.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">₹{item.price} • {item.base_prep_time} min prep</p>
                    </div>
                    {item.is_available ? (
                      <div className="flex items-center space-x-3">
                         {cart[item.id] > 0 && (
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300"
                            >
                              -
                            </button>
                         )}
                         <span className="font-medium w-4 text-center">{cart[item.id] || 0}</span>
                         <button 
                           onClick={() => addToCart(item.id)}
                           className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-200"
                         >
                           +
                         </button>
                      </div>
                    ) : (
                      <span className="text-red-500 text-sm">Sold Out</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Cart Sidebar */}
          {Object.keys(cart).length > 0 && (
            <div className="w-full md:w-80">
              <div className="bg-white p-6 rounded-lg shadow sticky top-6">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" /> Your Cart
                </h3>
                <div className="space-y-2 mb-4">
                  {Object.entries(cart).map(([itemId, qty]) => {
                    const item = menu.find(i => i.id === parseInt(itemId));
                    return (
                      <div key={itemId} className="flex justify-between text-sm">
                        <span>{qty}x {item?.name}</span>
                        <span>₹{item?.price * qty}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg mb-2">
                    <span>Total</span>
                    <span>₹{calculateTotal().total}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-6">
                     <span className="flex items-center"><Clock className="w-4 h-4 mr-1"/> Est. Wait</span>
                     {/* Gross estimate: Sum of prep times. Real prediction happens on backend */}
                     <span>~{calculateTotal().prepTime} mins + queue</span>
                  </div>
                  <button
                    onClick={handlePlaceOrder}
                    className="w-full bg-indigo-600 text-white py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Place Pre-order
                  </button>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Pickup time calculated at checkout
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Order Success */}
      {orderStatus && (
        <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-600 mb-6">Your order has been sent to the kitchen.</p>
          
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">Pickup Token</p>
            <p className="text-3xl font-mono font-bold text-indigo-600">{orderStatus.token}</p>
          </div>

          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-1">Estimated Pickup Time</p>
            <p className="text-4xl font-bold text-gray-900">{orderStatus.predictedTime}</p>
          </div>

          <button 
            onClick={() => { setSelectedVendor(null); setOrderStatus(null); }}
            className="text-indigo-600 font-medium hover:text-indigo-800"
          >
            Place Another Order
          </button>
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;
