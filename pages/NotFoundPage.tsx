import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800 rounded-lg shadow-xl min-h-[70vh]">
      <h1 className="text-5xl font-extrabold text-white mb-4">404</h1>
      <h2 className="text-2xl font-bold text-indigo-400 mb-6">Page Not Found</h2>
      <p className="text-gray-300 text-lg mb-8">
        Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-300"
      >
        Go to Home Page
      </Link>
    </div>
  );
};