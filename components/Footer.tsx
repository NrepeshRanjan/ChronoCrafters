import React from 'react';
import { Link } from 'react-router-dom';
import { Branding, FooterLink, Ad } from '../types';
import { AdDisplay } from './AdDisplay';
import { WEBSITE_URL, SUPPORT_EMAIL, COMPANY_NAME } from '../constants';

interface FooterProps {
  branding: Branding;
  links: FooterLink[];
  ads: Ad[];
}

export const Footer: React.FC<FooterProps> = ({ branding, links, ads }) => {
  const footerStyle = {
    backgroundColor: branding.primaryColor,
    color: '#ffffff', // Ensure text is white for contrast
  };

  return (
    <footer className="py-8 shadow-inner mt-auto" style={footerStyle}>
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Branding Section */}
          <div className="text-center md:text-left">
            <Link to="/" className="flex items-center justify-center md:justify-start space-x-3 mb-4 text-white no-underline">
              <img
                src={branding.logoUrl || 'https://picsum.photos/50/50?random=defaultlogo'}
                alt={`${branding.appName} Logo`}
                className="w-12 h-12 rounded-full"
              />
              <h2 className="text-xl font-bold">{branding.appName}</h2>
            </Link>
            <p className="text-sm text-gray-200">
              &copy; {new Date().getFullYear()} {COMPANY_NAME || branding.appName}. All rights reserved.
            </p>
            <p className="text-sm text-gray-200 mt-2">
              Developed by maaZone
            </p>
            <p className="text-sm text-gray-200 mt-2">
              <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-gray-300 underline">
                Contact Support
              </a>
            </p>
            {WEBSITE_URL && (
              <p className="text-sm text-gray-200 mt-2">
                Visit us: <a href={WEBSITE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 underline">{WEBSITE_URL.replace(/https?:\/\//, '')}</a>
              </p>
            )}
          </div>

          {/* Navigation Links */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              {links.map((link, index) => (
                <li key={index}>
                  <Link to={link.path} className="text-gray-200 hover:text-gray-50 transition duration-200 block text-base no-underline">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ad Section */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <h3 className="text-lg font-semibold text-white">Advertisements</h3>
            {ads.length > 0 ? (
              ads.map(ad => (
                <div key={ad.id} className="w-full max-w-sm md:max-w-full"> {/* Responsive width for ads */}
                  <AdDisplay ad={ad} />
                </div>
              ))
            ) : (
              <p className="text-gray-300 text-sm">No ads currently configured for footer.</p>
            )}
            <p className="text-xs text-gray-400 mt-4">
              Ads help us keep ChronoCrafters free!
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};