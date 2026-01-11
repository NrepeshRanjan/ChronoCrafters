// Branding and UI types
export interface Branding {
  appName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface FooterLink {
  title: string;
  path: string;
}

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

// Admin content types
export interface AppContentPage {
  id: string;
  title: string;
  slug: string;
  content: string; // Markdown content
}

export interface Ad {
  id: string;
  name: string;
  type: 'interstitial' | 'rewarded' | 'banner';
  placement: 'game' | 'footer'; // Where the ad appears
  frequencyCap: number; // e.g., show every X levels or every X minutes
  imageUrl?: string; // For banner ads
  textContent?: string; // For text-based ads or interstitial descriptions
  actionUrl?: string; // Click-through URL
  geminiPrompt?: string; // Optional prompt for dynamic ad content via Gemini
}

// Game types
export interface GameObject {
  id: string;
  type: 'static' | 'movable' | 'plant' | 'button';
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: string;
  properties?: { [key: string]: any }; // e.g., 'growthStage', 'isPressed', 'momentum'
  timeAffectedBy?: 'dimension' | 'self'; // How time manipulation affects it
}

export interface TimeControlState {
  globalSpeed: number; // 0 (paused), 0.5 (slow), 1 (normal), 2 (fast)
  direction: 'forward' | 'reverse';
  pausedObjects: string[]; // IDs of objects currently paused
  // More complex controls could include localized time fields
}

export interface GameLevel {
  id: string;
  name: string;
  description: string;
  goal: string; // User-facing goal description
  initialState: GameObject[];
  timeControls: string[]; // e.g., ['globalSpeed', 'reverse', 'pauseObject']
  winningCondition: (objects: GameObject[]) => boolean;
  geminiHintPrompt?: string; // Optional prompt for Gemini-generated hints
  initialRewindCharges?: number; // New: Number of rewinds available for the level
}

// Represents a snapshot of the game state for rewind functionality
export interface GameStateSnapshot {
  objects: GameObject[];
  timeControl: TimeControlState;
  gameTime: number;
}

// Props for the LevelCompleteModal
export interface LevelCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: GameLevel;
  timeTaken: number;
  rewindsUsed: number;
  starsEarned: number;
  geminiFeedback: string | null;
  onReplayLevel: () => void;
  onNextLevel: () => void;
  onBackToSelect: () => void;
  hasMoreLevels: boolean; // Indicates if there's a next level to play
}

// Gemini API related types (simplified for direct SDK usage)
export interface GeminiGenerateContentResponse {
  text: string | undefined;
}

export interface GeminiContentPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface GeminiGenerateContentParameters {
  model: string;
  contents: string | { parts: GeminiContentPart[] };
  config?: {
    systemInstruction?: string;
    topK?: number;
    topP?: number;
    temperature?: number;
    responseMimeType?: string;
    responseSchema?: any; // Use Type from @google/genai
    seed?: number;
    maxOutputTokens?: number;
    thinkingConfig?: { thinkingBudget: number };
    tools?: any[]; // Use FunctionDeclaration from @google/genai
    imageConfig?: {
      aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
      imageSize?: "1K" | "2K" | "4K";
    };
  };
}
