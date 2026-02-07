import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation(); // Hook to trigger re-render on route change
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-tomato-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-extrabold text-tomato-600 tracking-tight">
                Tomato<span className="text-gray-900">.</span>
              </Link>
            </div>
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/dashboard"
                  className="border-transparent text-gray-500 hover:text-tomato-600 hover:border-tomato-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
                >
                  Food Court
                </Link>
              </div>
            )}
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {user ? (
               <div className="flex items-center space-x-4">
                  <span className="text-gray-700 text-sm font-medium">Hi, {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-tomato-600 font-medium text-sm transition-colors"
                  >
                    Log out
                  </button>
               </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-tomato-600 font-medium text-sm transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-tomato-600 hover:bg-tomato-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tomato-500 transition-all transform hover:scale-105"
                >
                  Sign Up
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
