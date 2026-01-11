import React from 'react';
import { Link } from 'react-router-dom';
import { Branding } from '../types';

interface HeaderProps {
  branding: Branding;
}

export const Header: React.FC<HeaderProps> = ({ branding }) => {
  const headerStyle = {
    backgroundColor: branding.primaryColor,
    color: '#ffffff', // Ensure text is white for contrast
  };

  return (
    <header className="py-4 shadow-lg" style={headerStyle}>
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-3 text-white no-underline">
          <img
            src={branding.logoUrl || 'https://picsum.photos/50/50?random=defaultlogo'}
            alt={`${branding.appName} Logo`}
            className="w-10 h-10 rounded-full"
          />
          <h1 className="text-2xl font-bold">{branding.appName}</h1>
        </Link>
        <nav>
          {/* Future navigation items can go here */}
        </nav>
      </div>
    </header>
  );
};