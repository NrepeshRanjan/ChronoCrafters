import React, { useState, useEffect, useCallback } from 'react';
import { Ad } from '../types';
import { generateGeminiContent } from '../services/geminiService';
import { GEMINI_MODEL, GEMINI_SYSTEM_INSTRUCTION_AD } from '../constants';

interface AdDisplayProps {
  ad: Ad;
}

export const AdDisplay: React.FC<AdDisplayProps> = ({ ad }) => {
  const [dynamicText, setDynamicText] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState<boolean>(false);

  const fetchDynamicAdContent = useCallback(async (prompt: string) => {
    setLoadingText(true);
    try {
      const result = await generateGeminiContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction: GEMINI_SYSTEM_INSTRUCTION_AD,
          temperature: 0.8,
          maxOutputTokens: 50,
        }
      });
      if (result.text) {
        setDynamicText(result.text.trim().replace(/^"|"$/g, '')); // Remove potential quotes from Gemini output
      } else {
        setDynamicText('Failed to generate dynamic ad content.');
      }
    } catch (error) {
      console.error('Error fetching dynamic ad content:', error);
      setDynamicText('Error loading dynamic ad content.');
    } finally {
      setLoadingText(false);
    }
  }, []);

  useEffect(() => {
    if (ad.geminiPrompt) {
      fetchDynamicAdContent(ad.geminiPrompt);
    } else {
      setDynamicText(null); // Clear dynamic text if no prompt
    }
  }, [ad.geminiPrompt, fetchDynamicAdContent]);


  const displayedText = dynamicText || ad.textContent || `Default ad content for ${ad.name}`;
  const displayedImage = ad.imageUrl || 'https://picsum.photos/400/100?random=ad';

  const handleClick = () => {
    if (ad.actionUrl) {
      window.open(ad.actionUrl, '_blank');
    }
    // For rewarded ads, this would trigger the actual rewarded ad logic
  };

  const isClickable = ad.actionUrl !== undefined && ad.actionUrl !== '';

  let adContent;

  switch (ad.type) {
    case 'banner':
      adContent = (
        <a
          href={ad.actionUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className={`relative block overflow-hidden rounded-lg shadow-md transition-shadow duration-300 ${isClickable ? 'hover:shadow-lg cursor-pointer' : ''}`}
          style={{ backgroundColor: '#1f2937' }} // bg-gray-800
        >
          <img src={displayedImage} alt={ad.name} className="w-full h-auto object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2">
            {loadingText ? (
              <div className="flex items-center text-white text-sm">
                <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading Ad...
              </div>
            ) : (
              <p className="text-white text-center text-sm font-semibold">{displayedText}</p>
            )}
          </div>
        </a>
      );
      break;
    case 'interstitial':
      // Interstitial ads are usually full-screen and triggered by the app logic
      // This display is a placeholder, a real interstitial would be a modal.
      adContent = (
        <div
          onClick={handleClick}
          className={`relative bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 text-center ${isClickable ? 'hover:shadow-lg cursor-pointer' : ''}`}
        >
          <p className="text-xs text-gray-400 mb-1">Advertisement</p>
          <h4 className="text-lg font-bold text-white mb-2">{ad.name}</h4>
          {ad.imageUrl && <img src={displayedImage} alt={ad.name} className="w-full h-24 object-cover rounded-md mb-2" />}
          {loadingText ? (
            <div className="flex items-center justify-center text-white text-sm">
              <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading Ad...
            </div>
          ) : (
            <p className="text-gray-300 text-sm">{displayedText}</p>
          )}
        </div>
      );
      break;
    case 'rewarded':
      adContent = (
        <div className="bg-gradient-to-r from-purple-800 to-indigo-800 p-4 rounded-lg shadow-md border border-purple-700 text-center">
          <p className="text-xs text-purple-200 mb-1">Rewarded Video</p>
          <h4 className="text-lg font-bold text-white mb-2">Get a Hint!</h4>
          {loadingText ? (
            <div className="flex items-center justify-center text-white text-sm">
              <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading Ad...
            </div>
          ) : (
            <p className="text-purple-100 text-sm">{displayedText}</p>
          )}
        </div>
      );
      break;
    default:
      adContent = <div className="bg-red-900 p-4 rounded-lg text-white">Unknown Ad Type</div>;
  }

  return (
    <div className="ad-container w-full h-auto min-h-[60px] flex items-center justify-center">
      {adContent}
    </div>
  );
};