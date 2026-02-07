import React, { useEffect, useState } from 'react';

const Home = () => {
  const [healthStatus, setHealthStatus] = useState('Loading...');

  useEffect(() => {
    fetch('http://localhost:3000/api/health')
      .then((res) => res.json())
      .then((data) => setHealthStatus(data.message))
      .catch((err) => setHealthStatus('Error connecting to backend'));
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block xl:inline">Beat the Queue at</span>{' '}
          <span className="block text-indigo-600 xl:inline">Canteen Rush</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Pre-order your meals, get precise pickup times, and never wait in line again.
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          <div className="rounded-md shadow">
            <a
              href="#"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
            >
              Order Now
            </a>
          </div>
        </div>
        <div className="mt-10 p-4 border rounded bg-gray-50">
          <p className="text-sm text-gray-600">Backend Status: <span className="font-semibold">{healthStatus}</span></p>
        </div>
      </div>
    </div>
  );
};

export default Home;
