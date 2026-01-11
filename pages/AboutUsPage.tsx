import React from 'react';
import { AppContentPage, Branding } from '../types';
import { DEFAULT_PAGES } from '../constants';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

interface AboutUsPageProps {
  branding: Branding; // Passed for consistency with PageWrapper
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({ branding }) => {
  const aboutUsPage: AppContentPage | undefined = DEFAULT_PAGES.find(
    (page) => page.slug === 'about-us'
  );

  if (!aboutUsPage) {
    return (
      <div className="text-center text-red-400 py-8">
        <h1 className="text-3xl font-bold mb-4">About Us Page Not Found</h1>
        <p>The 'About Us' content could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 bg-opacity-80 p-6 md:p-10 rounded-lg shadow-xl text-gray-100 min-h-[60vh]">
      <MarkdownRenderer content={aboutUsPage.content} title={aboutUsPage.title} />
    </div>
  );
};