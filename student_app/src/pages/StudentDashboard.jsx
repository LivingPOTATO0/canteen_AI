import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Clock, Bell, Search, Star, MapPin } from 'lucide-react';
import socket from '../socket';
import FoodImage from '../components/FoodImage';
import SupportChatbot from '../components/SupportChatbot';

const StudentDashboard = () => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({});
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState('');
  const [isOrderViewOpen, setIsOrderViewOpen] = useState(false);
  const [kitchenUpdate, setKitchenUpdate] = useState("Order received by the kitchen...");
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get User from LocalStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const STUDENT_ID = user ? user.id : null;

  // Kitchen Updates Ticker
  useEffect(() => {
    if (orderStatus && orderStatus.status !== 'ready') {
        const messages = [
            "Chef is reviewing your order...",
            "Gathering fresh ingredients...",
            "Firing up the stove...",
            "Chopping vegetables with precision...",
            "Grilling to perfection...",
            "Adding the secret sauce...",
            "Plating your dish...",
            "Almost ready to serve!"
        ];
        let i = 0;
        const interval = setInterval(() => {
            setKitchenUpdate(messages[i % messages.length]);
            i++;
        }, 4000);
        return () => clearInterval(interval);
    } else if (orderStatus && orderStatus.status === 'ready') {
        setKitchenUpdate("Order is ready! Please pick it up.");
    }
  }, [orderStatus]);

  useEffect(() => {
    if (!user) {
        window.location.href = '/login';
        return;
    }
    fetchVendors();
    
    // Initial join
    socket.emit('join_student', STUDENT_ID);

    // Re-join on reconnect
    const handleConnect = () => {
        console.log("Reconnected to server, joining room...");
        socket.emit('join_student', STUDENT_ID);
    };

    socket.on('connect', handleConnect);

    socket.on('order_status_update', (data) => {
        if (orderStatus && orderStatus.id === data.orderId) {
             setOrderStatus(prev => ({
                 ...prev,
                 status: data.status,
                 predictedTime: new Date(data.predicted_pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
             }));
             if (data.status === 'ready') {
                 new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(e => console.log(e));
                 setIsOrderViewOpen(true); // Auto-open when ready
             }
        }
    });

    return () => socket.off('order_status_update');
  }, [orderStatus]);

  const fetchVendors = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/vendor');
      setVendors(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleVendorSelect = async (vendor) => {
    setSelectedVendor(vendor);
    setCart({});
    // setOrderStatus(null); // Don't clear active order status if browsing
    setAiInsight("Analyzing kitchen traffic...");
    try {
      const [menuRes, insightRes] = await Promise.all([
          axios.get(`http://localhost:3000/api/vendor/menu?vendorId=${vendor.id}`),
          axios.get(`http://localhost:3000/api/vendor/${vendor.id}/insight`)
      ]);
      setMenu(menuRes.data);
      setAiInsight(insightRes.data.insight);
    } catch (err) {
      console.error(err);
      setAiInsight("Standard wait times apply.");
    }
  };

  const addToCart = (itemId) => {
    setCart(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) newCart[itemId]--;
      else delete newCart[itemId];
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
        id: res.data.id,
        token: res.data.token,
        predictedTime: new Date(res.data.predicted_pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: res.data.status
      });
      setCart({});
      setIsOrderViewOpen(true); // Open the overlay
      window.scrollTo(0, 0);
    } catch (err) {
      alert('Failed to place order.');
    }
  };

  if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-tomato-50 text-tomato-600">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tomato-600"></div>
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative">
      
      {/* Hero Header */}
      <div className="bg-tomato-600 pb-32">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
                Hungry, Student?
            </h1>
            <p className="text-tomato-100 text-lg">
                Skip the lines. Order smart.
            </p>
            <div className="mt-6 relative max-w-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-tomato-300" />
                </div>
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border-none rounded-full leading-5 bg-tomato-500 text-tomato-100 placeholder-tomato-200 focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 sm:text-sm transition-colors shadow-inner" 
                    placeholder="Search for food, drinks, or vendors..." 
                />
            </div>
        </div>
      </div>

      <main className="-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Full Screen Order Overlay */}
        {orderStatus && isOrderViewOpen && (
            <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative animate-scale-up">
                    <button 
                        onClick={() => setIsOrderViewOpen(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
                    >
                        ✕ Close
                    </button>
                    
                    <div className="text-center mb-8">
                        <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${orderStatus.status === 'ready' ? 'bg-green-100 text-green-600' : 'bg-tomato-100 text-tomato-600'}`}>
                            {orderStatus.status === 'ready' ? <Bell className="w-10 h-10 animate-dance" /> : <Clock className="w-10 h-10 animate-pulse" />}
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900">Token {orderStatus.token}</h2>
                        <p className="text-gray-500 mt-2">Expected at {orderStatus.predictedTime}</p>
                    </div>

                    {/* Progress Stepper */}
                    <div className="flex items-center justify-between mb-8 relative">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10"></div>
                        <div className="absolute top-1/2 left-0 h-1 bg-tomato-500 -z-10 transition-all duration-500" style={{ width: orderStatus.status === 'ready' ? '100%' : orderStatus.status === 'preparing' ? '50%' : '10%' }}></div>
                        
                        {['pending', 'preparing', 'ready'].map((step, index) => (
                             <div key={step} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white ${
                                 (orderStatus.status === step || (orderStatus.status === 'ready' && step !== 'ready') || (orderStatus.status === 'preparing' && step === 'pending')) 
                                 ? 'bg-tomato-600 text-white' 
                                 : 'bg-gray-200 text-gray-500'
                             }`}>
                                 {index + 1}
                             </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 font-bold uppercase tracking-wider mb-8">
                        <span>Received</span>
                        <span>Preparing</span>
                        <span>Ready</span>
                    </div>

                    {/* Live Fun Ticker */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-8 flex items-center space-x-3">
                         <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
                         <p className="text-sm font-medium text-gray-700 italic">
                             "{kitchenUpdate}"
                         </p>
                    </div>

                    <div className="space-y-4">
                        {orderStatus.status === 'ready' ? (
                             <button onClick={() => { setOrderStatus(null); setIsOrderViewOpen(false); }} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 shadow-lg hover:shadow-green-500/30 transition-all">
                                Pick Up Order
                             </button>
                        ) : (
                            <button onClick={() => { setIsOrderViewOpen(false); setSelectedVendor(null); }} className="w-full bg-white border-2 border-tomato-600 text-tomato-600 py-3 rounded-xl font-bold text-lg hover:bg-tomato-50 transition-all">
                                Browse Other Stalls
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Vendors Grid (Always visible unless vendor selected) */}
        {!selectedVendor && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vendors.filter(vendor => {
                    const query = searchQuery.toLowerCase();
                    const nameMatch = vendor.name.toLowerCase().includes(query);
                    const menuMatch = vendor.MenuItems?.some(item => item.name.toLowerCase().includes(query));
                    return nameMatch || menuMatch;
                }).map(vendor => (
                    <div 
                        key={vendor.id}
                        onClick={() => handleVendorSelect(vendor)}
                        className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
                    >
                        <div className="h-32 bg-gray-200 relative overflow-hidden">
                             <FoodImage 
                                query={`restaurant ${vendor.name} food`} 
                                alt={vendor.name} 
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                             />
                             <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-gray-700 shadow-sm flex items-center">
                                 <Star className="w-3 h-3 text-yellow-500 mr-1" /> 4.8
                             </div>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-tomato-600 transition-colors">{vendor.name}</h3>
                                    <p className="text-sm text-gray-500 flex items-center mt-1">
                                        <MapPin className="w-3 h-3 mr-1" /> Campus Court
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    vendor.status === 'open' ? 'bg-green-100 text-green-700' :
                                    vendor.status === 'busy' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {vendor.status}
                                </span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                                <span>Wait: ~10-15 min</span>
                                <span className="text-tomato-600 font-medium group-hover:underline">View Menu &rarr;</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Menu View */}
        {selectedVendor && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden min-h-[60vh] flex flex-col md:flex-row">
                
                {/* Menu Sidebar/Header */}
                <div className="md:w-1/3 bg-gray-50 p-6 border-r border-gray-100">
                    <button 
                        onClick={() => setSelectedVendor(null)}
                        className="text-gray-500 hover:text-tomato-600 font-medium mb-6 flex items-center"
                    >
                        &larr; All Vendors
                    </button>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{selectedVendor.name}</h2>
                    
                    {/* AI Insight Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-2xl shadow-indigo-500/30 mb-8 relative overflow-hidden border border-indigo-400/30 transform hover:scale-[1.02] transition-all duration-500">
                        <div className="relative z-10">
                            <div className="flex items-center space-x-2 mb-3">
                                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wider flex items-center shadow-sm border border-white/10">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2 shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
                                    LIVE AI PREDICTION
                                </span>
                            </div>
                            <p className="font-bold text-2xl leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-100 filter drop-shadow-md">
                                "{aiInsight}"
                            </p>
                        </div>
                        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-purple-500/30 rounded-full blur-2xl animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-24 h-24 bg-indigo-500/30 rounded-full blur-2xl animate-pulse delay-700"></div>
                    </div>

                    <div className="hidden md:block">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Categories</h3>
                        <ul className="space-y-2">
                             <li className="text-tomato-600 font-bold bg-tomato-50 px-3 py-2 rounded-lg cursor-pointer">All Items</li>
                             <li className="text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg cursor-pointer">Best Sellers</li>
                             <li className="text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg cursor-pointer">Beverages</li>
                        </ul>
                    </div>
                </div>

                {/* Items List */}
                <div className="flex-1 p-6 overflow-y-auto max-h-[80vh]">
                    <h3 className="text-xl font-bold mb-6">Menu</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {menu.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
                            <div key={item.id} className="group flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-tomato-200 hover:shadow-md transition-all">
                                <div className="flex items-center space-x-4">
                                     <FoodImage 
                                        query={item.name} 
                                        alt={item.name} 
                                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                                     />
                                     <div>
                                         <h4 className="font-bold text-gray-900 group-hover:text-tomato-600 transition-colors">{item.name}</h4>
                                         <p className="text-sm text-gray-500">₹{item.price} • {item.base_prep_time} min</p>
                                     </div>
                                </div>
                                <div className="flex items-center">
                                     {item.is_available ? (
                                         cart[item.id] ? (
                                             <div className="flex items-center bg-tomato-50 rounded-lg p-1">
                                                 <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 flex items-center justify-center text-tomato-600 hover:bg-tomato-100 rounded-md">-</button>
                                                 <span className="mx-3 font-bold text-gray-900">{cart[item.id]}</span>
                                                 <button onClick={() => addToCart(item.id)} className="w-8 h-8 flex items-center justify-center text-tomato-600 hover:bg-tomato-100 rounded-md">+</button>
                                             </div>
                                         ) : (
                                             <button onClick={() => addToCart(item.id)} className="bg-gray-100 hover:bg-tomato-600 hover:text-white text-gray-600 px-4 py-2 rounded-lg font-medium transition-colors">
                                                 Add
                                             </button>
                                         )
                                     ) : (
                                         <span className="text-xs font-bold text-red-400 bg-red-50 px-2 py-1 rounded">SOLD OUT</span>
                                     )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </main>

      {/* Floating Cart Bar (Bottom) */}
      {selectedVendor && Object.keys(cart).length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] p-4 border-t border-gray-100 animate-slide-up bg-opacity-95 backdrop-blur-md z-40">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                       <div className="bg-tomato-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                           {Object.values(cart).reduce((a, b) => a + b, 0)}
                       </div>
                       <div className="flex flex-col">
                           <span className="text-sm text-gray-500">Total</span>
                           <span className="text-xl font-bold text-gray-900">₹{calculateTotal().total}</span>
                       </div>
                  </div>
                  <button 
                    onClick={handlePlaceOrder}
                    className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-800 transform hover:scale-105 transition-all shadow-lg flex items-center"
                  >
                      Place Order <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-sm">{calculateTotal().prepTime}m</span>
                  </button>
              </div>
          </div>
      )}

      {/* Minimized Order Widget (Floating) */}
      {orderStatus && !isOrderViewOpen && (
          <div 
             onClick={() => setIsOrderViewOpen(true)}
             className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-2xl shadow-2xl cursor-pointer hover:scale-105 transition-transform z-50 flex items-center space-x-3 border-2 border-tomato-500 animate-bounce-subtle"
             style={{ bottom: '90px' }} // Adjust position to not overlap chatbot or cart
          >
              <div className="relative">
                  <Clock className={`w-6 h-6 ${orderStatus.status === 'ready' ? 'text-green-400' : 'text-tomato-500'}`} />
                  {orderStatus.status === 'ready' && <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>}
              </div>
              <div>
                  <h4 className="font-bold text-sm">Token {orderStatus.token}</h4>
                  <p className="text-xs text-gray-400">{orderStatus.status.toUpperCase()}</p>
              </div>
          </div>
      )}

      <SupportChatbot />

    </div>
  );
};

export default StudentDashboard;
