import { GameLevel, Branding, AppContentPage, Ad } from './types';

// Admin Credentials (for demo purposes)
export const ADMIN_USERNAME = 'admin';
export const ADMIN_PASSWORD = 'password';

// Default Branding
export const DEFAULT_BRANDING: Branding = {
  appName: 'ChronoCrafters: Temporal Tangle',
  logoUrl: 'https://picsum.photos/50/50?random=logo',
  primaryColor: '#6366f1', // indigo-500
  secondaryColor: '#a78bfa', // violet-400
};

// Default Admin Pages (for footer and content management)
export const DEFAULT_PAGES: AppContentPage[] = [
  {
    id: 'page-privacy-policy',
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content: `
# Privacy Policy for ChronoCrafters: Temporal Tangle

**Last Updated: October 26, 2023**

ChronoCrafters: Temporal Tangle ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website (collectively, the "Service"). Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access the Service.

## 1. Information We Collect

We do not collect personally identifiable information (PII) from our users. However, we may collect non-personally identifiable information:

*   **Gameplay Data:** Information about your interaction with the game, such as levels completed, scores, progress, time spent in game, and in-game actions. This data is stored locally on your device and is not transmitted to our servers.
*   **Device Information:** We may collect non-specific device information like device type, operating system, and unique device identifiers (e.g., advertiser IDs) for analytical purposes and ad serving. This information does not directly identify you.
*   **Ad Interactions:** Data related to your interaction with advertisements, such as ad impressions, clicks, and conversions.

## 2. How We Use Your Information

We use the non-personally identifiable information we collect for the following purposes:

*   **To Operate and Improve the Service:** To understand how users interact with the game, troubleshoot issues, and enhance gameplay experience.
*   **Analytics:** To analyze usage patterns and trends, helping us to improve game features and content.
*   **Advertising:** To serve personalized or non-personalized advertisements through third-party ad networks (e.g., Google AdMob).

## 3. Third-Party Services

### Google AdMob

Our Service uses Google AdMob, an advertising service provided by Google Inc. ("Google"). AdMob may collect and use information about your usage of the Service and other websites and apps to provide relevant advertisements. This includes collecting device identifiers and location data (if you grant permission).

*   **Opt-out:** You can opt-out of personalized advertising by visiting Google's Ads Settings or, if available on your mobile device, by selecting "Limit Ad Tracking" (iOS) or "Opt-out of Ads Personalization" (Android).
*   **Privacy Policy:** For more information on how Google uses data, please visit Google's Privacy & Terms: [https://policies.google.com/privacy](https://policies.google.com/privacy) and [https://policies.google.com/technologies/ads](https://policies.google.com/technologies/ads).

## 4. Data Retention and Security

We do not retain any user data on our servers as we do not collect PII. Gameplay progress is stored locally on your device. We implement reasonable security measures to protect the integrity of the Service, but please be aware that no security system is impenetrable.

## 5. Children's Privacy

Our Service is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have inadvertently received personal information from a child under 13, we will delete such information from our records.

## 6. Changes to This Privacy Policy

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.

## 7. Contact Us

If you have any questions about this Privacy Policy, please contact us at:
[contact@chronocrafters.com](mailto:contact@chronocrafters.com)
`
  },
  {
    id: 'page-terms-of-service',
    title: 'Terms of Service',
    slug: 'terms-of-service',
    content: `
# Terms of Service for ChronoCrafters: Temporal Tangle

**Last Updated: October 26, 2023**

Welcome to ChronoCrafters: Temporal Tangle ("Service"), owned and operated by [Your Company Name/Developer Name]. These Terms of Service ("Terms") govern your use of our mobile game and associated website. By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.

## 1. License to Use the Service

We grant you a limited, non-exclusive, non-transferable, revocable license to use the Service for your personal, non-commercial entertainment purposes, subject to these Terms.

## 2. Prohibited Uses

You agree not to:
*   Use the Service for any unlawful purpose.
*   Attempt to gain unauthorized access to any part of the Service.
*   Interfere with or disrupt the integrity or performance of the Service.
*   Copy, modify, distribute, sell, or lease any part of our Service or its content.
*   Use any automated system, including "robots," "spiders," or "offline readers," to access the Service in a manner that sends more request messages to our servers than a human can reasonably produce in the same period by using a conventional web browser.

## 3. Intellectual Property

The Service and its original content, features, and functionality are and will remain the exclusive property of [Your Company Name/Developer Name] and its licensors. The Service is protected by copyright, trademark, and other laws of both the [Your Country] and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of [Your Company Name/Developer Name].

## 4. Third-Party Advertisements

The Service may display advertisements from third-party ad networks, such as Google AdMob. We are not responsible for the content of these ads or any external websites they may link to. Your interactions with third-party advertisers are solely between you and the advertiser.

## 5. Disclaimer of Warranties

The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no representations or warranties of any kind, express or implied, as to the operation of the Service or the information, content, or materials included therein. You expressly agree that your use of the Service is at your sole risk.

## 6. Limitation of Liability

In no event shall [Your Company Name/Developer Name], nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.

## 7. Governing Law

These Terms shall be governed and construed in accordance with the laws of [Your Country], without regard to its conflict of law provisions.

## 8. Changes to Terms

We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.

## 9. Contact Us

If you have any questions about these Terms, please contact us:
By email: [contact@chronocrafters.com](mailto:contact@chronocrafters.com)
`
  },
  {
    id: 'page-about-us',
    title: 'About Us',
    slug: 'about-us',
    content: `
# About ChronoCrafters: Temporal Tangle

Welcome to ChronoCrafters, where time is your playground! We are a small team of passionate developers dedicated to creating unique and engaging puzzle experiences.

## Our Vision

We believe games should challenge your mind in novel ways and offer a fresh perspective. With ChronoCrafters: Temporal Tangle, we set out to create a game that blends classic puzzle-solving with an innovative time-manipulation mechanic. Our goal is to immerse you in intricately designed pocket dimensions, each with its own temporal mysteries to unravel.

## The Game

ChronoCrafters: Temporal Tangle invites you to step into the role of a Temporal Architect. Your mission is to fix chronological anomalies within miniature worlds. By speeding up, slowing down, reversing, or pausing time for specific objects or entire environments, you'll orchestrate sequences of events to achieve your objectives. It's a game of foresight, experimentation, and creative problem-solving.

## Our Commitment

*   **Innovation:** We strive to deliver fresh gameplay mechanics that you won't find anywhere else.
*   **Engagement:** We craft levels that are both challenging and rewarding, keeping you hooked for hours.
*   **Player Experience:** We prioritize intuitive controls and a visually appealing aesthetic to make your journey enjoyable.

## Contact Us

We love hearing from our players! Your feedback helps us make ChronoCrafters even better.

**For support, bug reports, or general inquiries:**
Email: [support@chronocrafters.com](mailto:support@chronocrafters.com)

Thank you for playing ChronoCrafters: Temporal Tangle!
`
  },
  {
    id: 'page-faq',
    title: 'FAQ',
    slug: 'faq',
    content: `
# Frequently Asked Questions (FAQ) for ChronoCrafters: Temporal Tangle

Here are some common questions about ChronoCrafters: Temporal Tangle. If you don't find your answer here, feel free to contact us!

## General Game Questions

### What kind of game is ChronoCrafters: Temporal Tangle?
It's a unique puzzle-adventure game where you manipulate time within small "pocket dimensions" to solve challenges. Think of it as a Rube Goldberg machine where you control the timeline!

### Is ChronoCrafters free to play?
Yes, ChronoCrafters: Temporal Tangle is free to play. We support the game through advertisements.

### Do I need an internet connection to play?
An internet connection is required to download the game and display advertisements. Once levels are downloaded, basic gameplay might be possible offline, but ad-serving will require a connection.

### How do I save my game progress?
Your game progress is automatically saved locally on your device. There's no login required for gameplay, so your progress is tied to the device you're playing on.

## Gameplay Mechanics

### How do I manipulate time?
You'll have a set of time control tools available for each level, displayed on the UI. These can include:
*   **Global Speed:** Speed up or slow down the entire dimension.
*   **Reverse Time:** Rewind the timeline for a specific duration or until a certain event.
*   **Pause Object:** Freeze individual objects in time.
*   **Accelerate/Decelerate Object:** Speed up or slow down specific objects relative to global time.

Experiment with these tools to see how they interact with the environment!

### I'm stuck on a level! What should I do?
*   **Observe:** Watch the dimension carefully without any time manipulation first. Understand the natural flow of events.
*   **Experiment:** Try different time controls on various objects. Sometimes a small change has a big effect!
*   **Hints:** If you're truly stuck, you can sometimes request a hint (usually by watching a rewarded ad).

## Ads & Monetization

### Why do I see ads in the game?
As a free-to-play game, advertisements help us cover development costs and allow us to continue improving ChronoCrafters.

### What kind of ads will I see?
You might see interstitial ads (full-screen ads between levels) and banner ads. Some features, like hints, might be accessible by watching rewarded video ads.

### Can I remove ads?
Currently, there is no option to remove ads. We strive to make ad placements non-intrusive.

### What is a rewarded ad?
A rewarded ad is an optional video ad that you choose to watch in exchange for an in-game benefit, such as a hint for a difficult level.

## Technical Questions

### The game is lagging or crashing. What can I do?
*   Ensure your device's operating system is up to date.
*   Close other apps running in the background.
*   Restart your device.
*   Make sure you have enough free storage space.
If issues persist, please contact our support team.

### My game progress was lost!
Since progress is saved locally, this can happen if you uninstall the app, clear app data, or switch to a new device. We recommend not clearing app data if you wish to keep your progress.

## Contact

### How can I report a bug or give feedback?
We appreciate your feedback! Please email us at [support@chronocrafters.com](mailto:support@chronocrafters.com).

Thank you for being a part of the ChronoCrafters community!
`
  },
];

// Default Ads
export const DEFAULT_ADS: Ad[] = [
  {
    id: 'ad-banner-1',
    name: 'Game Banner Ad 1',
    type: 'banner',
    placement: 'game',
    frequencyCap: 0, // Always show
    imageUrl: 'https://picsum.photos/468/60?random=banner1',
    textContent: 'Play now and unravel the temporal tangle!',
    actionUrl: 'https://chronocrafters.com',
    geminiPrompt: 'Generate a short, engaging ad text for a time-travel puzzle game. Focus on mystery and challenge.',
  },
  {
    id: 'ad-interstitial-1',
    name: 'Game Interstitial Ad',
    type: 'interstitial',
    placement: 'game',
    frequencyCap: 3, // Show every 3 levels
    imageUrl: 'https://picsum.photos/320/480?random=interstitial1',
    textContent: 'Unlock new dimensions of fun!',
    actionUrl: 'https://chronocrafters.com',
    geminiPrompt: 'Create a captivating interstitial ad message for a time manipulation game, encouraging players to continue.',
  },
  {
    id: 'ad-rewarded-hint',
    name: 'Rewarded Hint Ad',
    type: 'rewarded',
    placement: 'game',
    frequencyCap: 1, // Show every time user requests
    textContent: 'Watch a short video to get a valuable hint!',
    actionUrl: '', // No direct action, just reward
    geminiPrompt: 'Generate a call-to-action for a rewarded ad offering a game hint. Be encouraging.',
  },
  {
    id: 'ad-footer-1',
    name: 'Footer Banner Ad',
    type: 'banner',
    placement: 'footer',
    frequencyCap: 0,
    imageUrl: 'https://picsum.photos/728/90?random=footerbanner',
    textContent: 'Visit our website for more awesome games!',
    actionUrl: 'https://chronocrafters.com',
    geminiPrompt: 'Write a concise footer banner ad text for a gaming company, promoting their website.',
  }
];

// Game Levels
export const GAME_LEVELS: GameLevel[] = [
  {
    id: 'level-1',
    name: 'The Clockwork Orchard',
    description: 'A small garden where fruits ripen at different speeds. Get all apples to full ripeness simultaneously.',
    goal: 'Make all apples ripe at the same time.',
    initialState: [
      { id: 'apple-1', type: 'plant', position: { x: 50, y: 150 }, size: { width: 30, height: 30 }, color: 'green', properties: { growthStage: 0.2 }, timeAffectedBy: 'dimension' },
      { id: 'apple-2', type: 'plant', position: { x: 150, y: 100 }, size: { width: 30, height: 30 }, color: 'green', properties: { growthStage: 0.5 }, timeAffectedBy: 'dimension' },
      { id: 'apple-3', type: 'plant', position: { x: 250, y: 200 }, size: { width: 30, height: 30 }, color: 'green', properties: { growthStage: 0.8 }, timeAffectedBy: 'dimension' },
    ],
    timeControls: ['globalSpeed'],
    winningCondition: (objects: any[]) => {
      const apples = objects.filter(obj => obj.id.startsWith('apple'));
      return apples.every(apple => apple.properties.growthStage >= 0.99);
    },
    geminiHintPrompt: `The player is on Level 1, 'The Clockwork Orchard'. The goal is to make all apples ripe at the same time. Apples are at growth stages 0.2, 0.5, and 0.8. The only control is 'globalSpeed'. Provide a short, actionable hint.`
  },
  {
    id: 'level-2',
    name: 'Temporal Toggles',
    description: 'Two buttons need to be pressed in quick succession, but they operate on different time flows. Use pause and global speed to sync them.',
    goal: 'Press both buttons within 0.1 seconds of each other.',
    initialState: [
      { id: 'button-A', type: 'button', position: { x: 80, y: 150 }, size: { width: 40, height: 20 }, color: 'gray', properties: { isPressed: false, pressTime: -1 }, timeAffectedBy: 'dimension' },
      { id: 'button-B', type: 'button', position: { x: 220, y: 150 }, size: { width: 40, height: 20 }, color: 'gray', properties: { isPressed: false, pressTime: -1 }, timeAffectedBy: 'self' }, // Imagine 'self' means its internal timer is faster
      { id: 'barrier', type: 'static', position: { x: 150, y: 100 }, size: { width: 10, height: 100 }, color: 'red' }
    ],
    timeControls: ['globalSpeed', 'pauseObject'],
    winningCondition: (objects: any[]) => {
      const buttonA = objects.find(obj => obj.id === 'button-A');
      const buttonB = objects.find(obj => obj.id === 'button-B');
      if (buttonA.properties.isPressed && buttonB.properties.isPressed) {
        return Math.abs(buttonA.properties.pressTime - buttonB.properties.pressTime) <= 0.1;
      }
      return false;
    },
    geminiHintPrompt: `The player is on Level 2, 'Temporal Toggles'. The goal is to press two buttons within 0.1 seconds. Button A reacts to global speed, Button B has its own fast internal timer. Controls are 'globalSpeed' and 'pauseObject'. Provide a short, actionable hint.`
  },
  {
    id: 'level-3',
    name: 'Reversal River',
    description: 'A delicate vase is about to fall. Use time reversal to catch it before it shatters.',
    goal: 'Prevent the vase from breaking by reversing time and moving a platform into place.',
    initialState: [
      { id: 'vase', type: 'movable', position: { x: 150, y: 50 }, size: { width: 20, height: 40 }, color: 'white', properties: { falling: true, shattered: false }, timeAffectedBy: 'dimension' },
      { id: 'platform', type: 'movable', position: { x: 100, y: 250 }, size: { width: 80, height: 10 }, color: 'brown', properties: { canMove: true, targetY: 100 }, timeAffectedBy: 'self' },
      { id: 'ground', type: 'static', position: { x: 0, y: 280 }, size: { width: 300, height: 20 }, color: 'gray' }
    ],
    timeControls: ['globalSpeed', 'direction'], // direction will be 'forward'/'reverse'
    winningCondition: (objects: any[]) => {
      const vase = objects.find(obj => obj.id === 'vase');
      return !vase.properties.shattered && vase.position.y >= 100 && vase.position.y < 280 &&
             objects.find(obj => obj.id === 'platform' && obj.position.y <= vase.position.y + vase.size.height);
    },
    geminiHintPrompt: `The player is on Level 3, 'Reversal River'. The goal is to prevent a falling vase from breaking. The player can reverse time and move a platform. The vase is falling from y=50 towards y=280 (ground). A platform needs to be positioned under it. Provide a short, actionable hint.`
  }
];

// Gemini API Configuration
export const GEMINI_MODEL = 'gemini-3-flash-preview';
export const GEMINI_SYSTEM_INSTRUCTION_HINT = `You are a helpful game assistant for "ChronoCrafters: Temporal Tangle". You provide concise, actionable, and spoiler-free hints to players who are stuck on a puzzle. Do not reveal the exact solution, but guide them towards the next step.`;
export const GEMINI_SYSTEM_INSTRUCTION_AD = `You are an ad copy generator for "ChronoCrafters: Temporal Tangle". Create short, engaging, and enticing ad texts that fit a mysterious time-manipulation game. Focus on captivating the player's interest.`;

// AdMob/Play Store Compliance Constants
export const SUPPORT_EMAIL = 'support@chronocrafters.com';
export const COMPANY_NAME = 'Temporal Gaming Studios'; // Placeholder for Terms of Service
export const WEBSITE_URL = 'https://chronocrafters.com'; // Placeholder for branding/ads
