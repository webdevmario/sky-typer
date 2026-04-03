import type { BadgeDef } from '../types';

// Mastery thresholds
export const MASTERY = {
  completed: { accuracy: 70, avgKeyMs: Infinity },
  mastered: { accuracy: 85, avgKeyMs: 600 },
  perfected: { accuracy: 95, avgKeyMs: 400 },
};

// Star thresholds (based on accuracy %)
export const STAR_THRESHOLDS = [70, 85, 95] as const;

// WPM labels for kids
export const WPM_LABELS: { min: number; label: string; emoji: string }[] = [
  { min: 40, label: 'Lightning Typist', emoji: '⚡' },
  { min: 30, label: 'Super Speed', emoji: '✈️' },
  { min: 20, label: 'Fast Fingers', emoji: '🚗' },
  { min: 10, label: 'Building Speed', emoji: '🚲' },
  { min: 0, label: 'Getting Started', emoji: '🚀' },
];

export function getWpmLabel(wpm: number): { label: string; emoji: string } {
  for (const entry of WPM_LABELS) {
    if (wpm >= entry.min) return { label: entry.label, emoji: entry.emoji };
  }
  return WPM_LABELS[WPM_LABELS.length - 1];
}

// Idle threshold - pauses longer than this are excluded from WPM calculation
export const IDLE_THRESHOLD_MS = 3000;

// Badges
export const BADGES: BadgeDef[] = [
  {
    id: 'first_steps',
    emoji: '👶',
    title: 'First Steps',
    description: 'Complete your first lesson',
  },
  {
    id: 'home_row_hero',
    emoji: '🏠',
    title: 'Home Row Hero',
    description: 'Master all home row lessons',
  },
  {
    id: 'full_keyboard',
    emoji: '⌨️',
    title: 'Full Keyboard',
    description: 'Complete all letter stages',
  },
  {
    id: 'speed_demon',
    emoji: '⚡',
    title: 'Speed Demon',
    description: 'Reach 30 WPM in any lesson',
  },
  {
    id: 'perfect_run',
    emoji: '💯',
    title: 'Perfect Run',
    description: '100% accuracy on any lesson',
  },
  {
    id: 'week_warrior',
    emoji: '🔥',
    title: 'Week Warrior',
    description: '7-day practice streak',
  },
  {
    id: 'no_peeking',
    emoji: '🙈',
    title: 'No Peeking!',
    description: 'Complete a lesson with keyboard hidden',
  },
  {
    id: 'ten_lessons',
    emoji: '🌟',
    title: 'Dedicated',
    description: 'Complete 10 different lessons',
  },
  {
    id: 'all_stars',
    emoji: '🏆',
    title: 'All Stars',
    description: 'Get 3 stars on every lesson',
  },
];
