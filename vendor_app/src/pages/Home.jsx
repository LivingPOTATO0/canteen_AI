import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, Zap } from 'lucide-react';

const Home = () => {
  return (
    <div className="bg-gray-900 min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-gray-900 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Grow your</span>{' '}
                  <span className="block text-tomato-500 xl:inline">food business.</span>
                </h1>
                <p className="mt-3 text-base text-gray-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Manage orders efficiently, reduce chaos, and serve more students with the Tomato Partner dashboard.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/register"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-tomato-600 hover:bg-tomato-700 md:py-4 md:text-lg transition-transform transform hover:scale-105"
                    >
                      Begine Partner
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center px-8 py-3 border border-gray-600 text-base font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 md:py-4 md:text-lg"
                    >
                      Vendor Login
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-gray-800">
             <div className="h-full w-full flex items-center justify-center">
                 <span className="text-9xl opacity-10 transform -rotate-12 text-white">🥗</span>
             </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                  <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
                      <div className="flex items-center">
                          <TrendingUp className="h-8 w-8 text-green-500" />
                          <h3 className="ml-3 text-xl font-bold text-white">Increase Revenue</h3>
                      </div>
                      <p className="mt-2 text-gray-400">Streamlined ordering means more customers served.</p>
                  </div>
                  <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
                      <div className="flex items-center">
                          <Users className="h-8 w-8 text-blue-500" />
                          <h3 className="ml-3 text-xl font-bold text-white">Happy Students</h3>
                      </div>
                      <p className="mt-2 text-gray-400">Reduce wait times and improve customer satisfaction.</p>
                  </div>
                  <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
                      <div className="flex items-center">
                          <Zap className="h-8 w-8 text-yellow-500" />
                          <h3 className="ml-3 text-xl font-bold text-white">Real-time Insights</h3>
                      </div>
                      <p className="mt-2 text-gray-400">Track orders and kitchen load instantly.</p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Home;
