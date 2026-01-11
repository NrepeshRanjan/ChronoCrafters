import React from 'react';
import { GameLevel } from '../types';
import { Button } from './Button';

interface LevelSelectorProps {
  levels: GameLevel[];
  onSelectLevel: (level: GameLevel) => void;
  completedLevels: string[];
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({ levels, onSelectLevel, completedLevels }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {levels.map(level => {
        const isCompleted = completedLevels.includes(level.id);
        return (
          <div
            key={level.id}
            className={`bg-gray-700 p-6 rounded-lg shadow-lg border-2 ${
              isCompleted ? 'border-green-500' : 'border-indigo-600'
            } transition-transform transform hover:scale-105 duration-200`}
          >
            <h3 className="text-xl font-bold text-white mb-2">{level.name}</h3>
            <p className="text-gray-300 text-sm mb-4">{level.description}</p>
            <p className={`text-sm font-semibold ${isCompleted ? 'text-green-400' : 'text-yellow-400'} mb-4`}>
              Status: {isCompleted ? 'Completed' : 'New'}
            </p>
            <Button
              onClick={() => onSelectLevel(level)}
              fullWidth
              variant="primary"
            >
              Play Level
            </Button>
          </div>
        );
      })}
    </div>
  );
};