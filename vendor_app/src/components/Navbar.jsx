import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation(); // Hook to trigger re-render on route change
  const user = JSON.parse(localStorage.getItem('vendorUser'));

  const handleLogout = () => {
    localStorage.removeItem('vendorUser');
    localStorage.removeItem('vendorToken');
    window.location.href = '/login';
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-extrabold text-white tracking-tight">
                Tomato<span className="text-tomato-500">.Partner</span>
              </Link>
            </div>
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/dashboard"
                  className="border-transparent text-gray-300 hover:text-white hover:border-tomato-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
                >
                  Dashboard
                </Link>
              </div>
            )}
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {user ? (
               <div className="flex items-center space-x-4">
                  <span className="text-gray-300 text-sm font-medium">Hi, {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-white font-medium text-sm transition-colors"
                  >
                    Log out
                  </button>
               </div>
            ) : (
              <>
                 <Link
                  to="/login"
                  className="text-gray-300 hover:text-white font-medium text-sm transition-colors"
                >
                  Log in
                </Link>
                 <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-tomato-600 hover:bg-tomato-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tomato-500 transition-all font-bold"
                >
                  Become a Partner
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
