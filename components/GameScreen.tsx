import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameLevel, GameObject, TimeControlState, Ad, ToastMessage } from '../types';
import { Button } from './Button';
import { AdDisplay } from './AdDisplay';
import { generateGeminiContent } from '../services/geminiService';
import { GEMINI_MODEL, GEMINI_SYSTEM_INSTRUCTION_HINT } from '../constants';

interface GameScreenProps {
  level: GameLevel;
  onLevelComplete: (levelId: string) => void;
  ads: Ad[]; // Ads for in-game placement (e.g., rewarded for hints)
  showToast: (message: string, type: ToastMessage['type']) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ level, onLevelComplete, ads, showToast }) => {
  // State for game objects and time control
  const [objects, setObjects] = useState<GameObject[]>(level.initialState);
  const [timeControl, setTimeControl] = useState<TimeControlState>({
    globalSpeed: 1, // 0 (paused), 0.5 (slow), 1 (normal), 2 (fast)
    direction: 'forward', // 'forward' or 'reverse'
    pausedObjects: [],
  });
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const [gameTime, setGameTime] = useState<number>(0); // Internal game time
  const [hint, setHint] = useState<string | null>(null);
  const [isHintLoading, setIsHintLoading] = useState<boolean>(false);

  // Refs for stable access to mutable values inside the game loop
  // These refs are updated by useEffects to ensure they always hold the latest state/prop values
  const objectsRef = useRef<GameObject[]>(objects);
  const timeControlRef = useRef<TimeControlState>(timeControl);
  const gameTimeRef = useRef<number>(gameTime);
  const levelRef = useRef<GameLevel>(level);
  const onLevelCompleteRef = useRef<(levelId: string) => void>(onLevelComplete);
  const showToastRef = useRef<(message: string, type: ToastMessage['type']) => void>(showToast);
  const isGameRunningRef = useRef<boolean>(isGameRunning); // Added ref for isGameRunning

  // Update refs whenever relevant state/props change
  useEffect(() => { objectsRef.current = objects; }, [objects]);
  useEffect(() => { timeControlRef.current = timeControl; }, [timeControl]);
  useEffect(() => { gameTimeRef.current = gameTime; }, [gameTime]);
  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { onLevelCompleteRef.current = onLevelComplete; }, [onLevelComplete]);
  useEffect(() => { showToastRef.current = showToast; }, [showToast]);
  useEffect(() => { isGameRunningRef.current = isGameRunning; }, [isGameRunning]); // Update isGameRunning ref

  const animationFrameRef = useRef<number>();
  // Fix: Removed explicit type argument from useRef, letting TypeScript infer 'number'
  // This addresses potential subtle issues where explicit type annotation combined with a function call for initial value
  // might be misinterpreted by some linting or TypeScript configurations, leading to an "Expected 1 arguments, but got 0" error.
  const lastUpdateTimeRef = useRef(Date.now()); // Moved here for stable access

  const rewardedAd = ads.find(ad => ad.type === 'rewarded' && ad.placement === 'game');

  // Game physics/state update loop - made stable with empty dependency array
  // It accesses state and props via refs to avoid being re-created on every render
  const gameLoop = useCallback((currentTime: DOMHighResTimeStamp) => {
    // Only proceed if the game is actually running. The `useEffect` below handles starting/stopping `requestAnimationFrame`.
    // This check is primarily for the very first frame or if `isGameRunning` changes mid-loop, though the outer `useEffect` usually stops it.
    if (!isGameRunningRef.current) return;

    const currentObjects = objectsRef.current;
    const currentTimeControl = timeControlRef.current;
    const currentLevel = levelRef.current;
    const currentOnLevelComplete = onLevelCompleteRef.current;
    const currentShowToast = showToastRef.current;

    const deltaTime = (currentTime - lastUpdateTimeRef.current) / 1000; // delta in seconds
    lastUpdateTimeRef.current = currentTime;

    let updatedObjects = [...currentObjects];
    let effectiveDeltaTime = deltaTime * currentTimeControl.globalSpeed;

    if (currentTimeControl.direction === 'reverse') {
      effectiveDeltaTime *= -1;
    }

    updatedObjects = updatedObjects.map(obj => {
      if (currentTimeControl.pausedObjects.includes(obj.id)) {
        return obj; // Object is paused, no update
      }

      const newObj = { ...obj };

      // Example physics for specific object types
      if (newObj.type === 'plant' && newObj.properties?.growthStage !== undefined) {
        if (currentTimeControl.direction === 'forward' && newObj.properties.growthStage < 1) {
          newObj.properties.growthStage = Math.min(1, newObj.properties.growthStage + (effectiveDeltaTime * 0.1)); // Grow slowly
          if (newObj.properties.growthStage >= 0.99) newObj.color = 'red'; // Ripe color
        } else if (currentTimeControl.direction === 'reverse' && newObj.properties.growthStage > 0) {
          newObj.properties.growthStage = Math.max(0, newObj.properties.growthStage + (effectiveDeltaTime * 0.1)); // Degrow
          if (newObj.properties.growthStage < 0.99) newObj.color = 'green';
        }
      }
      if (newObj.type === 'movable' && newObj.properties?.falling) {
          newObj.position = {
            ...newObj.position,
            y: newObj.position.y + (effectiveDeltaTime * 50) // Fall speed
          };
          // Simple collision detection with ground
          const ground = updatedObjects.find(o => o.id === 'ground'); // Access updatedObjects directly or use currentObjectsRef.current if ground is a static property of the level
          if (ground && newObj.position.y + newObj.size.height > ground.position.y) {
            if (newObj.id === 'vase' && !newObj.properties?.shattered) {
              newObj.properties = { ...newObj.properties, shattered: true };
              currentShowToast('Vase shattered!', 'error'); // Use ref
              setIsGameRunning(false); // Can directly call state setter
            }
            newObj.position.y = ground.position.y - newObj.size.height; // Rest on ground
            newObj.properties = { ...newObj.properties, falling: false };
          }
      }
      // Example for platform movement if it's affected by 'self' or a button press
      if (newObj.id === 'platform' && newObj.properties?.canMove) {
        // Move platform towards targetY
        if (newObj.position.y !== newObj.properties.targetY) {
          const moveAmount = effectiveDeltaTime * 30; // Speed of platform movement
          if (newObj.position.y < newObj.properties.targetY) {
            newObj.position.y = Math.min(newObj.properties.targetY, newObj.position.y + moveAmount);
          } else {
            newObj.position.y = Math.max(newObj.properties.targetY, newObj.position.y - moveAmount);
          }
        }
      }

      // Example for buttons that auto-reset or track press time
      if (newObj.type === 'button' && newObj.properties?.isPressed) {
        // If a button is pressed, track its press time
        newObj.properties.pressTime += effectiveDeltaTime;
      }

      return newObj;
    });

    // Update game time for tracking button presses, etc.
    setGameTime(prevTime => {
      const newGameTime = prevTime + effectiveDeltaTime;
      gameTimeRef.current = newGameTime; // Keep ref updated immediately
      return newGameTime;
    });
    setObjects(updatedObjects); // Update objects state

    // Check winning condition
    if (currentLevel.winningCondition(updatedObjects)) { // Use ref
      setIsGameRunning(false);
      currentShowToast('Level Complete!', 'success'); // Use ref
      currentOnLevelComplete(currentLevel.id); // Use ref
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, []); // Empty dependency array means gameLoop is stable and won't be recreated

  // Effect to start/stop the game loop
  useEffect(() => {
    if (isGameRunning) {
      lastUpdateTimeRef.current = Date.now(); // Initialize last update time
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    } else {
      cancelAnimationFrame(animationFrameRef.current as number);
    }
    // Cleanup function to ensure animation frame is cancelled when component unmounts or isGameRunning becomes false
    return () => {
      cancelAnimationFrame(animationFrameRef.current as number);
    };
  }, [isGameRunning, gameLoop]); // `gameLoop` is stable, so this `useEffect` only re-runs when `isGameRunning` changes.

  const handleStartReset = () => {
    setIsGameRunning(false); // Stop game first
    setObjects(level.initialState); // Reset objects
    setTimeControl({
      globalSpeed: 1,
      direction: 'forward',
      pausedObjects: [],
    });
    setGameTime(0);
    setHint(null); // Clear hint on reset
    // Start game in the next tick to ensure state is fully reset
    setTimeout(() => setIsGameRunning(true), 0);
    showToast('Level reset and started!', 'info');
  };

  const setGlobalSpeed = (speed: number) => {
    setTimeControl(prev => ({ ...prev, globalSpeed: speed }));
  };

  const setDirection = (dir: 'forward' | 'reverse') => {
    setTimeControl(prev => ({ ...prev, direction: dir }));
  };

  const togglePauseObject = (objId: string) => {
    setTimeControl(prev => {
      if (prev.pausedObjects.includes(objId)) {
        return { ...prev, pausedObjects: prev.pausedObjects.filter(id => id !== objId) };
      } else {
        return { ...prev, pausedObjects: [...prev.pausedObjects, objId] };
      }
    });
  };

  const handleObjectInteraction = (objId: string) => {
    // Example: Clicking a button
    setObjects(prev => prev.map(obj => {
      if (obj.id === objId && obj.type === 'button') {
        showToast(`Button ${obj.id} pressed!`, 'info');
        return { ...obj, properties: { ...obj.properties, isPressed: true, pressTime: gameTimeRef.current } }; // Use gameTime from ref
      }
      return obj;
    }));
  };

  const getGeminiHint = useCallback(async () => {
    if (!rewardedAd) {
      showToast('No rewarded ad configured for hints.', 'error');
      return;
    }

    // Use levelRef.current for latest level details
    if (!levelRef.current.geminiHintPrompt) {
      showToast('No specific hint prompt for this level. Cannot generate hint.', 'error');
      return;
    }

    // In a real app, you'd integrate with AdMob Rewarded Ads here.
    // For this demo, we'll just simulate "watching an ad" and then provide the hint.
    showToast(`Simulating rewarded ad for hint...`, 'info');
    setIsHintLoading(true);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate ad watch delay

    const currentGameState = {
      levelId: levelRef.current.id, // Use ref
      levelName: levelRef.current.name, // Use ref
      goal: levelRef.current.goal, // Use ref
      currentObjects: objectsRef.current.map(obj => ({ // Use ref
        id: obj.id,
        type: obj.type,
        position: obj.position,
        properties: obj.properties,
      })),
      timeControlState: timeControlRef.current, // Use ref
      gameTime: gameTimeRef.current, // Use ref
    };

    const prompt = `${GEMINI_SYSTEM_INSTRUCTION_HINT}\n\n` +
                   `Here's the current game state:\n\`\`\`json\n${JSON.stringify(currentGameState, null, 2)}\n\`\`\`\n\n` +
                   `Level-specific hint request: "${levelRef.current.geminiHintPrompt}"\n\n` + // Use ref
                   `Please provide a concise and helpful hint, without directly solving the puzzle.`;

    try {
      const result = await generateGeminiContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 100,
        }
      });
      if (result.text) {
        setHint(result.text);
        showToast('Hint provided!', 'success');
      } else {
        showToast('Could not generate a hint at this time.', 'warning');
      }
    } catch (err: any) {
      console.error('Failed to get Gemini hint:', err);
      showToast(`Failed to get hint: ${err.message || 'unknown error'}`, 'error');
    } finally {
      setIsHintLoading(false);
    }
  }, [rewardedAd, showToast]); // Dependencies for this useCallback

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Game Dimension */}
      <div className="relative w-full lg:w-3/4 aspect-video bg-gradient-to-br from-blue-900 to-indigo-900 border-4 border-indigo-700 rounded-lg shadow-2xl flex-shrink-0">
        <h3 className="absolute top-4 left-4 text-xl font-bold text-white z-10">Level: {level.name}</h3>
        <p className="absolute top-12 left-4 text-sm text-gray-300 z-10">{level.goal}</p>

        {/* Render game objects */}
        {objects.map(obj => (
          <div
            key={obj.id}
            onClick={() => handleObjectInteraction(obj.id)}
            className={`absolute rounded-md transition-transform duration-100 ease-linear ${obj.type === 'button' ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}`}
            style={{
              left: obj.position.x,
              top: obj.position.y,
              width: obj.size.width,
              height: obj.size.height,
              backgroundColor: obj.color,
              // Add subtle visual cues for time state
              opacity: timeControl.pausedObjects.includes(obj.id) ? 0.6 : 1,
              border: timeControl.pausedObjects.includes(obj.id) ? '2px dashed yellow' : 'none',
            }}
          >
            {obj.type === 'plant' && obj.properties?.growthStage !== undefined && (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-white">
                {(obj.properties.growthStage * 100).toFixed(0)}%
              </div>
            )}
            {obj.id === 'vase' && obj.properties?.shattered && (
              <div className="absolute inset-0 flex items-center justify-center text-4xl" role="img" aria-label="Shattered Vase">
                💥
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Controls & Info Panel */}
      <div className="flex-grow bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col space-y-6">
        <h3 className="text-xl font-bold text-white">Controls</h3>
        <div className="flex flex-wrap gap-3">
          {level.timeControls.includes('globalSpeed') && (
            <>
              <Button onClick={() => setGlobalSpeed(0)} variant={timeControl.globalSpeed === 0 ? 'primary' : 'secondary'}>Pause Global</Button>
              <Button onClick={() => setGlobalSpeed(0.5)} variant={timeControl.globalSpeed === 0.5 ? 'primary' : 'secondary'}>Slow</Button>
              <Button onClick={() => setGlobalSpeed(1)} variant={timeControl.globalSpeed === 1 ? 'primary' : 'secondary'}>Normal</Button>
              <Button onClick={() => setGlobalSpeed(2)} variant={timeControl.globalSpeed === 2 ? 'primary' : 'secondary'}>Fast</Button>
            </>
          )}
          {level.timeControls.includes('direction') && (
            <>
              <Button onClick={() => setDirection('forward')} variant={timeControl.direction === 'forward' ? 'primary' : 'secondary'}>Forward</Button>
              <Button onClick={() => setDirection('reverse')} variant={timeControl.direction === 'reverse' ? 'primary' : 'secondary'}>Reverse</Button>
            </>
          )}
        </div>

        {level.timeControls.includes('pauseObject') && (
          <div className="mt-4">
            <h4 className="text-lg font-semibold text-white mb-2">Object Specific Control:</h4>
            <div className="flex flex-wrap gap-2">
              {objects.filter(obj => obj.type === 'movable' || obj.type === 'plant').map(obj => (
                <Button
                  key={`pause-${obj.id}`}
                  onClick={() => togglePauseObject(obj.id)}
                  variant={timeControl.pausedObjects.includes(obj.id) ? 'danger' : 'outline'}
                  size="sm"
                >
                  {timeControl.pausedObjects.includes(obj.id) ? `Unpause ${obj.id}` : `Pause ${obj.id}`}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto pt-6 border-t border-gray-700">
          <Button onClick={handleStartReset} variant="primary" fullWidth className="mb-4">
            {isGameRunning ? 'Restart Level' : 'Start Level'}
          </Button>

          {rewardedAd && (
            <Button
              onClick={getGeminiHint}
              variant="secondary"
              fullWidth
              loading={isHintLoading}
              disabled={isHintLoading}
              className="mb-4"
            >
              {isHintLoading ? 'Getting Hint...' : 'Get Hint (Watch Ad)'}
            </Button>
          )}

          {hint && (
            <div className="bg-blue-900 bg-opacity-40 p-3 rounded-md border border-blue-700 mt-4 text-sm text-blue-100">
              <h5 className="font-bold text-blue-50">Hint:</h5>
              <p>{hint}</p>
              <p className="text-xs text-blue-200 mt-2">
                <span className="font-semibold">Disclaimer:</span> This hint is AI-generated and may not always be perfect, but it aims to guide you!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};