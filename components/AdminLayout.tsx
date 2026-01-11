import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Branding } from '../types';
import { Button } from './Button';

interface AdminLayoutProps {
  branding: Branding;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ branding, onLogout, children }) => {
  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6 flex flex-col shadow-lg">
        <div className="flex items-center space-x-3 mb-8">
          <img
            src={branding.logoUrl || 'https://picsum.photos/50/50?random=adminlogo'}
            alt={`${branding.appName} Logo`}
            className="w-10 h-10 rounded-full"
          />
          <h2 className="text-xl font-bold text-white">{branding.appName} Admin</h2>
        </div>

        <nav className="flex-grow">
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md transition duration-200 ${
                    isActive ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700 text-gray-300'
                  }`
                }
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/pages"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md transition duration-200 ${
                    isActive ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700 text-gray-300'
                  }`
                }
              >
                Manage Pages
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/ads"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md transition duration-200 ${
                    isActive ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700 text-gray-300'
                  }`
                }
              >
                Manage Ads
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/branding"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md transition duration-200 ${
                    isActive ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700 text-gray-300'
                  }`
                }
              >
                Manage Branding
              </NavLink>
            </li>
            {/* Additional admin links */}
          </ul>
        </nav>

        <div className="mt-8">
          <Button fullWidth variant="secondary" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-8 bg-gray-950 overflow-auto custom-scrollbar">
        {children}
      </main>
    </div>
  );
};