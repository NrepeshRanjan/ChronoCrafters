import React, { useState, useEffect } from 'react';
import { Branding, GameLevel, Ad, ToastMessage } from '../types';
import { GAME_LEVELS } from '../constants';
import { LevelSelector } from '../components/LevelSelector';
import { GameScreen } from '../components/GameScreen';
import { AdDisplay } from '../components/AdDisplay';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';

interface HomePageProps {
  branding: Branding;
  ads: Ad[]; // Game-specific ads
  showToast: (message: string, type: ToastMessage['type']) => void;
}

const LOCAL_STORAGE_KEY_COMPLETED_LEVELS = 'chronocrafters_completed_levels';
const LOCAL_STORAGE_KEY_LAST_INTERSTITIAL_LEVEL = 'chronocrafters_last_interstitial_level';

export const HomePage: React.FC<HomePageProps> = ({ branding, ads, showToast }) => {
  const [selectedLevel, setSelectedLevel] = useState<GameLevel | null>(null);
  const [completedLevels, setCompletedLevels] = useState<string[]>([]);
  const [showInterstitialAd, setShowInterstitialAd] = useState<boolean>(false);
  const navigate = useNavigate();

  // Load completed levels from local storage on component mount
  useEffect(() => {
    const storedCompleted = localStorage.getItem(LOCAL_STORAGE_KEY_COMPLETED_LEVELS);
    if (storedCompleted) {
      setCompletedLevels(JSON.parse(storedCompleted));
    }
  }, []);

  // Save completed levels to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_COMPLETED_LEVELS, JSON.stringify(completedLevels));
  }, [completedLevels]);

  const handleLevelSelect = (level: GameLevel) => {
    const interstitialAd = ads.find(ad => ad.type === 'interstitial' && ad.placement === 'game');
    if (interstitialAd) {
      const lastInterstitialLevelIndex = parseInt(localStorage.getItem(LOCAL_STORAGE_KEY_LAST_INTERSTITIAL_LEVEL) || '0', 10);
      const currentLevelIndex = GAME_LEVELS.findIndex(l => l.id === level.id);
      const levelsSinceLastAd = currentLevelIndex - lastInterstitialLevelIndex;

      if (interstitialAd.frequencyCap > 0 && levelsSinceLastAd >= interstitialAd.frequencyCap) {
        setShowInterstitialAd(true);
        localStorage.setItem(LOCAL_STORAGE_KEY_LAST_INTERSTITIAL_LEVEL, String(currentLevelIndex));
        // Simulate ad display, then set the level
        setTimeout(() => {
          setSelectedLevel(level);
          setShowInterstitialAd(false);
        }, 3000); // Simulate ad display duration
        return;
      }
    }
    setSelectedLevel(level);
  };

  const handleLevelComplete = (levelId: string, timeTaken: number, rewindsUsed: number) => {
    if (!completedLevels.includes(levelId)) {
      setCompletedLevels(prev => [...prev, levelId]);
    }
    // The LevelCompleteModal now handles the post-completion flow
    // No direct navigation back to selector here; the modal will trigger it.
    showToast('Congratulations! Level unlocked!', 'success');
  };

  const handleBackToLevelSelect = () => {
    setSelectedLevel(null);
  };

  const handleReplayLevel = (level: GameLevel) => {
    setSelectedLevel(null); // Clear current selection to force re-render GameScreen with fresh state
    setTimeout(() => setSelectedLevel(level), 0); // Re-select in next render cycle
  };

  const handleNextLevel = (currentLevel: GameLevel) => {
    const currentIndex = GAME_LEVELS.findIndex(l => l.id === currentLevel.id);
    if (currentIndex !== -1 && currentIndex < GAME_LEVELS.length - 1) {
      setSelectedLevel(GAME_LEVELS[currentIndex + 1]);
    } else {
      showToast('You completed all available levels!', 'info');
      setSelectedLevel(null); // Go back to level select if no more levels
    }
  };

  const currentInterstitialAd = ads.find(ad => ad.type === 'interstitial' && ad.placement === 'game');

  if (showInterstitialAd && currentInterstitialAd) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 p-8 rounded-lg shadow-2xl max-w-xl w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Advertisement</h2>
          <AdDisplay ad={currentInterstitialAd} />
          <p className="text-gray-400 mt-4">Ad will close in a moment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh]">
      {selectedLevel ? (
        <GameScreen
          level={selectedLevel}
          onLevelComplete={handleLevelComplete}
          ads={ads}
          showToast={showToast}
          onBackToSelect={handleBackToLevelSelect}
          onReplayLevel={handleReplayLevel}
          onNextLevel={handleNextLevel}
          hasMoreLevels={GAME_LEVELS.findIndex(l => l.id === selectedLevel.id) < GAME_LEVELS.length - 1}
        />
      ) : (
        <div className="text-center p-6">
          <h1 className="text-4xl font-extrabold text-white mb-4">Welcome to {branding.appName}!</h1>
          <p className="text-xl text-gray-300 mb-8">Unravel temporal tangles in a world where time is yours to command.</p>

          <h2 className="text-3xl font-bold text-indigo-400 mb-6">Select a Level</h2>
          <LevelSelector
            levels={GAME_LEVELS}
            onSelectLevel={handleLevelSelect}
            completedLevels={completedLevels}
          />

          <div className="mt-12 p-6 bg-gray-700 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-white mb-4">What is ChronoCrafters?</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              ChronoCrafters: Temporal Tangle is a unique puzzle-adventure game where you manipulate time in miniature pocket dimensions.
              Your goal is to solve intricate puzzles by speeding up, slowing down, reversing, or pausing time for specific objects or the entire dimension.
              Each level presents a new challenge, requiring logic, foresight, and a touch of temporal magic to achieve your objectives.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Dive into a world of clockwork gardens, synchronized buttons, and falling vases, and master the art of time itself!
            </p>
            <Button onClick={() => showToast('More levels coming soon!', 'info')} variant="outline" className="mt-6">
              Learn More
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};