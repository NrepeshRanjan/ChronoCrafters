import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameLevel, GameObject, TimeControlState, Ad, ToastMessage, GameStateSnapshot } from '../types';
import { Button } from './Button';
import { AdDisplay } from './AdDisplay';
import { generateGeminiContent } from '../services/geminiService';
import { GEMINI_MODEL, GEMINI_SYSTEM_INSTRUCTION_HINT, GEMINI_SYSTEM_INSTRUCTION_LEVEL_FEEDBACK, GEMINI_SYSTEM_INSTRUCTION_LEVEL_FAILED_FEEDBACK } from '../constants';
import { LevelCompleteModal } from './LevelCompleteModal';
import { LevelFailedModal } from './LevelFailedModal'; // New import

// Sound imports - using direct paths for simplicity
import buttonSound from '../assets/sounds/button_click.mp3';
import successSound from '../assets/sounds/success.mp3';
import failureSound from '../assets/sounds/failure.mp3';
import rewindSound from '../assets/sounds/rewind.mp3';
import hintSound from '../assets/sounds/hint.mp3';


interface GameScreenProps {
  level: GameLevel;
  onLevelComplete: (levelId: string, timeTaken: number, rewindsUsed: number) => void;
  ads: Ad[]; // Ads for in-game placement (e.g., rewarded for hints)
  showToast: (message: string, type: ToastMessage['type']) => void;
  onBackToSelect: () => void; // Added prop to go back to level select
  onReplayLevel: (level: GameLevel) => void; // Added prop to replay current level
  onNextLevel: (level: GameLevel) => void; // Added prop to advance to next level
  onFailLevel: (levelId: string) => void; // New: Added prop to handle level failure
  hasMoreLevels: boolean; // Added prop to indicate if there's a next level
}

const REWIND_INTERVAL_MS = 200; // How often to save a state snapshot
const REWIND_DURATION_SECONDS = 5; // How many seconds to rewind by

// Audio elements
const audioButtonClick = new Audio(buttonSound);
const audioSuccess = new Audio(successSound);
const audioFailure = new Audio(failureSound);
const audioRewind = new Audio(rewindSound);
const audioHint = new Audio(hintSound);


export const GameScreen: React.FC<GameScreenProps> = ({ level, onLevelComplete, ads, showToast, onBackToSelect, onReplayLevel, hasMoreLevels, onNextLevel, onFailLevel }) => {
  // Game state
  const [objects, setObjects] = useState<GameObject[]>(level.initialState);
  const [timeControl, setTimeControl] = useState<TimeControlState>({
    globalSpeed: 1,
    direction: 'forward',
    pausedObjects: [],
  });
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const [gameTime, setGameTime] = useState<number>(0);
  const [rewindCharges, setRewindCharges] = useState<number>(level.initialRewindCharges || 0);

  // UI state
  const [hint, setHint] = useState<string | null>(null);
  const [isHintLoading, setIsHintLoading] = useState<boolean>(false);
  const [isLevelCompleteModalOpen, setIsLevelCompleteModalOpen] = useState<boolean>(false);
  const [levelCompletionData, setLevelCompletionData] = useState<{ time: number; rewinds: number; stars: number; geminiFeedback: string | null } | null>(null);
  const [isLevelFailedModalOpen, setIsLevelFailedModalOpen] = useState<boolean>(false); // New: State for failure modal
  const [levelFailureData, setLevelFailureData] = useState<{ geminiFeedback: string | null } | null>(null); // New: State for failure data


  // Refs for stable access to mutable values inside the game loop and other callbacks
  const objectsRef = useRef<GameObject[]>(objects);
  const timeControlRef = useRef<TimeControlState>(timeControl);
  const gameTimeRef = useRef<number>(gameTime);
  const levelRef = useRef<GameLevel>(level);
  const onLevelCompleteRef = useRef<(levelId: string, timeTaken: number, rewindsUsed: number) => void>(onLevelComplete);
  const showToastRef = useRef<(message: string, type: ToastMessage['type']) => void>(showToast);
  const isGameRunningRef = useRef<boolean>(isGameRunning);
  const rewindChargesRef = useRef<number>(rewindCharges); // New ref for rewind charges
  const onFailLevelRef = useRef<(levelId: string) => void>(onFailLevel);


  // State history for rewind functionality
  const gameHistoryRef = useRef<GameStateSnapshot[]>([]);
  const lastHistorySnapshotTimeRef = useRef<number>(0);

  // Animation frame and time tracking
  // Fix: Provide an explicit initial value for useRef to satisfy TS/linter.
  // Using `null` is a common pattern for refs that will hold numbers (like animation frame IDs)
  // that are not yet assigned, and allows for explicit null checks.
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef(Date.now());

  // Update refs whenever relevant state/props change
  useEffect(() => { objectsRef.current = objects; }, [objects]);
  useEffect(() => { timeControlRef.current = timeControl; }, [timeControl]);
  useEffect(() => { gameTimeRef.current = gameTime; }, [gameTime]);
  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { onLevelCompleteRef.current = onLevelComplete; }, [onLevelComplete]);
  useEffect(() => { showToastRef.current = showToast; }, [showToast]);
  useEffect(() => { isGameRunningRef.current = isGameRunning; }, [isGameRunning]);
  useEffect(() => { rewindChargesRef.current = rewindCharges; }, [rewindCharges]);
  useEffect(() => { onFailLevelRef.current = onFailLevel; }, [onFailLevel]);


  const rewardedAd = ads.find(ad => ad.type === 'rewarded' && ad.placement === 'game');

  const gameLoop = useCallback<FrameRequestCallback>((currentTime: DOMHighResTimeStamp) => {
    if (!isGameRunningRef.current) return;

    const currentObjects = objectsRef.current;
    const currentTimeControl = timeControlRef.current;
    const currentLevel = levelRef.current;
    const currentOnLevelComplete = onLevelCompleteRef.current;
    const currentShowToast = showToastRef.current;
    const currentRewindCharges = rewindChargesRef.current;
    const currentOnFailLevel = onFailLevelRef.current;


    const deltaTime = (currentTime - lastUpdateTimeRef.current) / 1000;
    lastUpdateTimeRef.current = currentTime;

    let updatedObjects = [...currentObjects];
    let effectiveDeltaTime = deltaTime * currentTimeControl.globalSpeed;

    // If game is globally paused (globalSpeed is 0), don't process physics or history
    if (effectiveDeltaTime === 0 && currentTimeControl.globalSpeed === 0) {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return;
    }

    if (currentTimeControl.direction === 'reverse') {
      effectiveDeltaTime *= -1;
    }

    // Update objects
    updatedObjects = updatedObjects.map(obj => {
      if (currentTimeControl.pausedObjects.includes(obj.id)) {
        return obj;
      }

      const newObj = { ...obj };

      if (newObj.type === 'plant' && newObj.properties?.growthStage !== undefined) {
        if (currentTimeControl.direction === 'forward' && newObj.properties.growthStage < 1) {
          newObj.properties.growthStage = Math.min(1, newObj.properties.growthStage + (effectiveDeltaTime * 0.1));
          if (newObj.properties.growthStage >= 0.99) newObj.icon = '🍎'; // Ripe apple emoji
        } else if (currentTimeControl.direction === 'reverse' && newObj.properties.growthStage > 0) {
          newObj.properties.growthStage = Math.max(0, newObj.properties.growthStage + (effectiveDeltaTime * 0.1));
          if (newObj.properties.growthStage < 0.99) newObj.icon = '🍏'; // Unripe apple emoji
        }
      }
      if (newObj.type === 'movable' && newObj.properties?.falling) {
          newObj.position = {
            ...newObj.position,
            y: newObj.position.y + (effectiveDeltaTime * 50)
          };
          const ground = currentObjects.find(o => o.id === 'ground'); // Ground is static in this level.
          if (ground && newObj.position.y + newObj.size.height > ground.position.y) {
            if (newObj.id === 'vase' && !newObj.properties?.shattered) {
              newObj.properties = { ...newObj.properties, shattered: true };
              newObj.icon = '💥'; // Shattered vase emoji
              currentShowToast('Vase shattered!', 'error');
              setIsGameRunning(false); // Stop game immediately
              currentOnFailLevel(currentLevel.id); // Trigger failure handler
              // Set failure data and open modal
              setLevelFailureData({ geminiFeedback: null });
              setIsLevelFailedModalOpen(true);
            }
            newObj.position.y = ground.position.y - newObj.size.height;
            newObj.properties = { ...newObj.properties, falling: false };
          }
      }
      if (newObj.id === 'platform' && newObj.properties?.canMove) {
        if (newObj.position.y !== newObj.properties.targetY) {
          const moveAmount = effectiveDeltaTime * 30;
          if (newObj.position.y < newObj.properties.targetY) {
            newObj.position.y = Math.min(newObj.properties.targetY, newObj.position.y + moveAmount);
          } else {
            newObj.position.y = Math.max(newObj.properties.targetY, newObj.position.y - moveAmount);
          }
        }
      }
      // Button state for visual feedback
      if (newObj.type === 'button' && newObj.properties?.isPressed && newObj.icon !== '🟢') {
        newObj.icon = '🟢'; // Pressed button emoji
      } else if (newObj.type === 'button' && !newObj.properties?.isPressed && newObj.icon !== '⚪') {
        newObj.icon = '⚪'; // Unpressed button emoji
      }

      return newObj;
    });

    // Update game time
    setGameTime(prevTime => {
      const newGameTime = prevTime + effectiveDeltaTime;
      gameTimeRef.current = newGameTime;
      return newGameTime;
    });
    setObjects(updatedObjects);

    // Save state snapshot for rewind
    if (gameTimeRef.current - lastHistorySnapshotTimeRef.current >= REWIND_INTERVAL_MS / 1000) {
        gameHistoryRef.current.push({
            objects: objectsRef.current,
            timeControl: timeControlRef.current,
            gameTime: gameTimeRef.current,
        });
        // Limit history size to prevent memory issues (e.g., 60 seconds worth of snapshots)
        const maxHistorySize = Math.ceil(60 / (REWIND_INTERVAL_MS / 1000));
        if (gameHistoryRef.current.length > maxHistorySize) {
            gameHistoryRef.current.shift();
        }
        lastHistorySnapshotTimeRef.current = gameTimeRef.current;
    }

    // Check winning condition
    if (currentLevel.winningCondition(updatedObjects)) {
      setIsGameRunning(false);
      audioSuccess.play(); // Play success sound
      currentShowToast('Level Complete!', 'success');
      const actualRewindsUsed = (currentLevel.initialRewindCharges || 0) - currentRewindCharges;
      const stars = calculateStars(gameTimeRef.current, actualRewindsUsed);
      setLevelCompletionData({
        time: gameTimeRef.current,
        rewinds: actualRewindsUsed,
        stars,
        geminiFeedback: null,
      });
      setIsLevelCompleteModalOpen(true);
      currentOnLevelComplete(currentLevel.id, gameTimeRef.current, actualRewindsUsed);
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [setObjects, setTimeControl, setGameTime, setRewindCharges, setIsGameRunning, setHint, onFailLevelRef]); // Added onFailLevelRef to dependencies

  // Effect to start/stop the game loop
  useEffect(() => {
    if (isGameRunning) {
      lastUpdateTimeRef.current = Date.now();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    } else {
      // Fix: Check if animationFrameRef.current is not null before canceling.
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    return () => {
      // Fix: Check if animationFrameRef.current is not null before canceling on cleanup.
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isGameRunning, gameLoop]);

  // Reset level on initial load or when `level` prop changes
  useEffect(() => {
    handleStartReset(false); // Do not toast on initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level.id]); // Only reset when level ID changes

  const handleStartReset = (showResetToast: boolean = true) => {
    setIsGameRunning(false);
    setObjects(level.initialState);
    setTimeControl({
      globalSpeed: 1,
      direction: 'forward',
      pausedObjects: [],
    });
    setGameTime(0);
    setRewindCharges(level.initialRewindCharges || 0); // Reset rewind charges
    gameHistoryRef.current = []; // Clear history
    lastHistorySnapshotTimeRef.current = 0; // Reset history time
    setHint(null);
    setIsLevelCompleteModalOpen(false); // Close modal if open
    setLevelCompletionData(null); // Clear completion data
    setIsLevelFailedModalOpen(false); // New: Close failure modal
    setLevelFailureData(null); // New: Clear failure data
    setTimeout(() => setIsGameRunning(true), 0); // Start game in the next tick
    if (showResetToast) showToast('Level reset and started!', 'info');
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
    setObjects(prev => prev.map(obj => {
      if (obj.id === objId && obj.type === 'button') {
        audioButtonClick.play(); // Play button click sound
        showToast(`Button ${obj.id} pressed!`, 'info');
        return { ...obj, properties: { ...obj.properties, isPressed: true, pressTime: gameTimeRef.current }, icon: '🟢' };
      }
      return obj;
    }));
  };

  const handleRewind = () => {
    if (rewindChargesRef.current > 0) {
      setIsGameRunning(false); // Pause game during rewind transition
      setRewindCharges(prev => prev - 1); // Decrement charges
      audioRewind.play(); // Play rewind sound

      const targetTime = gameTimeRef.current - REWIND_DURATION_SECONDS;
      // Find the closest snapshot in history
      const snapshot = gameHistoryRef.current.reduce((prev, curr) => {
        return (Math.abs(curr.gameTime - targetTime) < Math.abs(prev.gameTime - targetTime) ? curr : prev);
      }, gameHistoryRef.current[0]);

      if (snapshot) {
        setObjects(snapshot.objects);
        setTimeControl(snapshot.timeControl);
        setGameTime(snapshot.gameTime);
        // Trim history to remove future states
        gameHistoryRef.current = gameHistoryRef.current.filter(s => s.gameTime <= snapshot.gameTime);
        lastHistorySnapshotTimeRef.current = snapshot.gameTime;

        showToast(`Rewound ${REWIND_DURATION_SECONDS} seconds!`, 'info');
        // Resume game after a short visual 'rewind' delay
        setTimeout(() => setIsGameRunning(true), 100);
      } else {
        showToast('Not enough history to rewind that far!', 'warning');
        setRewindCharges(prev => prev + 1); // Refund charge if rewind failed
        setIsGameRunning(true);
      }
    } else {
      showToast('No rewind charges left!', 'warning');
    }
  };


  const getGeminiHint = useCallback(async () => {
    if (!rewardedAd) {
      showToast('No rewarded ad configured for hints.', 'error');
      return;
    }

    if (!levelRef.current.geminiHintPrompt) {
      showToast('No specific hint prompt for this level. Cannot generate hint.', 'error');
      return;
    }

    showToast(`Simulating rewarded ad for hint...`, 'info');
    setIsHintLoading(true);
    await new Promise(resolve => setTimeout(resolve, 3000));

    const currentGameState = {
      levelId: levelRef.current.id,
      levelName: levelRef.current.name,
      goal: levelRef.current.goal,
      currentObjects: objectsRef.current.map(obj => ({
        id: obj.id,
        type: obj.type,
        position: obj.position,
        properties: obj.properties,
      })),
      timeControlState: timeControlRef.current,
      gameTime: gameTimeRef.current,
      rewindChargesRemaining: rewindChargesRef.current,
    };

    const prompt = `${GEMINI_SYSTEM_INSTRUCTION_HINT}\n\n` +
                   `Here's the current game state:\n\`\`\`json\n${JSON.stringify(currentGameState, null, 2)}\n\`\`\`\n\n` +
                   `Level-specific hint request: "${levelRef.current.geminiHintPrompt}"\n\n` +
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
        audioHint.play(); // Play hint sound
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
  }, [rewardedAd, showToast]);

  const getGeminiLevelFeedback = useCallback(async (time: number, rewinds: number, stars: number, levelName: string) => {
    const prompt = `${GEMINI_SYSTEM_INSTRUCTION_LEVEL_FEEDBACK}\n\n` +
                   `Player completed "${levelName}" in ${time.toFixed(2)} seconds, using ${rewinds} rewinds, earning ${stars} stars. ` +
                   `Craft a short, thematic report based on these stats, mentioning temporal efficiency or anomaly resolution.`;
    try {
      const result = await generateGeminiContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          temperature: 0.8,
          maxOutputTokens: 150,
        }
      });
      return result.text || "The Temporal Chronicler observes your progress.";
    } catch (err) {
      console.error("Error generating Gemini level feedback:", err);
      return "The Temporal Chronicler is currently offline, but commends your efforts!";
    }
  }, []);

  const getGeminiLevelFailedFeedback = useCallback(async (levelName: string) => {
    const prompt = `${GEMINI_SYSTEM_INSTRUCTION_LEVEL_FAILED_FEEDBACK}\n\n` +
                   `Player failed "${levelName}". Provide a short, thematic, cautionary report.`;
    try {
      const result = await generateGeminiContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          temperature: 0.8,
          maxOutputTokens: 150,
        }
      });
      return result.text || "A temporal anomaly prevents further progress in this dimension.";
    } catch (err) {
      console.error("Error generating Gemini level failed feedback:", err);
      return "The Temporal Chronicler is currently offline, but encourages you to try again!";
    }
  }, []);

  // Effect to fetch Gemini feedback when level completion/failure modal opens
  useEffect(() => {
    if (isLevelCompleteModalOpen && levelCompletionData && !levelCompletionData.geminiFeedback) {
      handleLevelCompleteModalOpen(); // This now updates `levelCompletionData` with feedback
    }
    if (isLevelFailedModalOpen && levelFailureData && !levelFailureData.geminiFeedback) {
      handleLevelFailedModalOpen(); // This now updates `levelFailureData` with feedback
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLevelCompleteModalOpen, isLevelFailedModalOpen]);

  const handleLevelCompleteModalOpen = async () => {
    if (levelCompletionData) {
      const feedback = await getGeminiLevelFeedback(
        levelCompletionData.time,
        levelCompletionData.rewinds,
        levelCompletionData.stars,
        level.name
      );
      setLevelCompletionData(prev => prev ? { ...prev, geminiFeedback: feedback } : null);
    }
  };

  const handleLevelFailedModalOpen = async () => {
    audioFailure.play(); // Play failure sound
    if (levelFailureData) {
      const feedback = await getGeminiLevelFailedFeedback(level.name);
      setLevelFailureData(prev => prev ? { ...prev, geminiFeedback: feedback } : null);
    }
  };


  const calculateStars = (timeTaken: number, rewindsUsed: number): number => {
    // Simple demo logic:
    // Level 1: 0.2, 0.5, 0.8 growth stages. Goal is simultaneous ripeness.
    // Optimal time depends on how fast global speed can make them ripen.
    // For demo, let's say:
    // Time < 20s & rewinds = 0 -> 3 Stars
    // Time < 40s & rewinds <= 1 -> 2 Stars
    // Else -> 1 Star
    const rawRewindsUsed = rewindsUsed;
    if (timeTaken < 20 && rawRewindsUsed <= 0) return 3;
    if (timeTaken < 40 && rawRewindsUsed <= 1) return 2;
    return 1;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds * 100) % 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Game Dimension */}
      <div className="relative w-full lg:w-3/4 aspect-video bg-gradient-to-br from-blue-900 to-indigo-900 border-4 border-indigo-70- rounded-lg shadow-2xl flex-shrink-0">
        <h3 className="absolute top-4 left-4 text-2xl font-bold text-white z-10">Level: {level.name}</h3>
        <p className="absolute top-12 left-4 text-md text-gray-300 z-10">{level.goal}</p>
        <div className="absolute top-4 right-4 text-3xl font-bold text-yellow-300 z-10 bg-gray-900 bg-opacity-70 px-4 py-2 rounded-md">
            {formatTime(gameTime)}
        </div>

        {/* Render game objects */}
        {objects.map(obj => (
          <div
            key={obj.id}
            onClick={() => handleObjectInteraction(obj.id)}
            className={`absolute rounded-md transition-transform duration-100 ease-linear flex items-center justify-center text-4xl leading-none
                       ${obj.type === 'button' ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}
                       ${obj.type === 'static' || obj.type === 'movable' ? 'border border-gray-600' : ''}`}
            style={{
              left: obj.position.x,
              top: obj.position.y,
              width: obj.size.width,
              height: obj.size.height,
              backgroundColor: obj.color || 'transparent', // Use transparent if icon is present
              opacity: timeControl.pausedObjects.includes(obj.id) ? 0.6 : 1,
              border: timeControl.pausedObjects.includes(obj.id) ? '2px dashed yellow' : (obj.color ? 'none' : '2px solid #555'),
              transition: isGameRunning ? 'all 0.1s linear' : 'none', // Smooth movement when running, instant snap when paused/rewound
            }}
            role={obj.type === 'button' ? 'button' : 'figure'}
            aria-label={obj.id}
          >
            {obj.icon ? obj.icon : (obj.type === 'plant' && obj.properties?.growthStage !== undefined && (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-white">
                {(obj.properties.growthStage * 100).toFixed(0)}%
              </div>
            ))}
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
          <Button
            onClick={handleRewind}
            variant="outline"
            disabled={rewindCharges <= 0 || !isGameRunning}
            className="flex items-center"
          >
            Rewind 5s <span className="ml-2 px-2 py-0.5 bg-gray-700 rounded-full text-xs font-bold">{rewindCharges}</span>
          </Button>
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
                  {timeControl.pausedObjects.includes(obj.id) ? `Unpause ${obj.icon || obj.id}` : `Pause ${obj.icon || obj.id}`}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto pt-6 border-t border-gray-700">
          <Button onClick={() => handleStartReset(true)} variant="primary" fullWidth className="mb-4">
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
            <div className="bg-blue-900 bg-opacity-40 p-3 rounded-md border border-blue-700 mt-4 text-sm text-blue-100 flex items-center">
              <span className="mr-2 text-xl" role="img" aria-label="Hint lightbulb">💡</span>
              <div>
                <h5 className="font-bold text-blue-50">Hint:</h5>
                <p>{hint}</p>
                <p className="text-xs text-blue-200 mt-2">
                  <span className="font-semibold">Disclaimer:</span> This hint is AI-generated and may not always be perfect, but it aims to guide you!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      {levelCompletionData && (
        <LevelCompleteModal
          isOpen={isLevelCompleteModalOpen}
          onClose={() => setIsLevelCompleteModalOpen(false)}
          level={level}
          timeTaken={levelCompletionData.time}
          rewindsUsed={levelCompletionData.rewinds}
          starsEarned={levelCompletionData.stars}
          geminiFeedback={levelCompletionData.geminiFeedback}
          onReplayLevel={() => onReplayLevel(level)}
          onNextLevel={() => onNextLevel(level)}
          onBackToSelect={onBackToSelect}
          hasMoreLevels={hasMoreLevels}
        />
      )}
      {levelFailureData && (
        <LevelFailedModal
          isOpen={isLevelFailedModalOpen}
          onClose={() => setIsLevelFailedModalOpen(false)}
          level={level}
          geminiFeedback={levelFailureData.geminiFeedback}
          onReplayLevel={() => onReplayLevel(level)}
          onBackToSelect={onBackToSelect}
        />
      )}
    </div>
  );
};