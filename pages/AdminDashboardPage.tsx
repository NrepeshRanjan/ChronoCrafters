import React from 'react';
import { Link } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-xl min-h-[80vh]">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>

      <p className="text-gray-300 mb-8 text-lg">
        Welcome to the ChronoCrafters admin panel. Use the navigation on the left to manage various aspects of your game.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/pages" className="block p-6 bg-indigo-700 hover:bg-indigo-800 rounded-lg shadow-md transition duration-300">
          <h2 className="text-xl font-semibold text-white mb-2">Manage Pages</h2>
          <p className="text-indigo-200">Create, edit, or delete static content pages (e.g., Privacy Policy, About Us).</p>
        </Link>

        <Link to="/admin/ads" className="block p-6 bg-purple-700 hover:bg-purple-800 rounded-lg shadow-md transition duration-300">
          <h2 className="text-xl font-semibold text-white mb-2">Manage Ads</h2>
          <p className="text-purple-200">Configure in-game and footer advertisements, including types and frequency.</p>
        </Link>

        <Link to="/admin/branding" className="block p-6 bg-green-700 hover:bg-green-800 rounded-lg shadow-md transition duration-300">
          <h2 className="text-xl font-semibold text-white mb-2">Manage Branding</h2>
          <p className="text-green-200">Update the app's name, logo, and primary color scheme.</p>
        </Link>

        {/* Add more cards for other admin functionalities */}
        <div className="p-6 bg-gray-700 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-200 mb-2">Game Settings (Future)</h2>
          <p className="text-gray-400">Manage game levels, difficulty, and more.</p>
        </div>
      </div>
    </div>
  );
};