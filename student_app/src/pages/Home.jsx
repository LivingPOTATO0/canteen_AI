import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Clock, Smartphone } from 'lucide-react';

const Home = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-tomato-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-tomato-50 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Good food,</span>{' '}
                  <span className="block text-tomato-600 xl:inline">no waiting.</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Pre-order from your favorite campus canteens. Skip the long lines and enjoy your break. Smart AI predictions included.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/register"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-tomato-600 hover:bg-tomato-700 md:py-4 md:text-lg transition-transform transform hover:scale-105"
                    >
                      Get Started
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-tomato-700 bg-tomato-100 hover:bg-tomato-200 md:py-4 md:text-lg"
                    >
                      Log In
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-gray-100">
             {/* Abstract Food Pattern/Image */}
             <div className="h-full w-full bg-gradient-to-br from-orange-100 to-tomato-100 flex items-center justify-center">
                 <span className="text-9xl opacity-20 transform rotate-12">🍔</span>
             </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-tomato-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to lunch
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-tomato-500 text-white">
                    <Clock className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Skip the Queue</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Order ahead and pick up exactly when your food is ready. Our AI predicts wait times.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-tomato-500 text-white">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Mobile Ordering</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Browse menus, customize orders, and pay directly from your phone.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-tomato-500 text-white">
                    <Star className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Live Updates</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Get real-time notifications when your food is preparing and ready to collect.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
