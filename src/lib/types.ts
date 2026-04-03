export interface WordEntry {
  w: string;
  i: string;
  d: string;
}

export interface CustomWord {
  w: string;
  d: string;
  l: number;
}

export interface HighScore {
  n: string;
  s: number;
  t: string;
  d: number;
}

export interface Grade {
  letter: string;
  cls: string;
  msg: string;
  emoji: string;
  score?: number;
}

export interface CompletedWord {
  w: string;
  i: string;
  d: string;
  p: number;
  sb: number;
}

export interface FallingObject {
  id: number;
  word: string;
  icon: string;
  def: string;
  typed: number;
  fallDuration: number;
  leftPos: number;
  active: boolean;
}

export interface DifficultyPreset {
  sp: number[];
  si: number[];
  ms: number;
  wc: number;
}

export interface LevelUpData {
  levelName: string;
  badge: string;
  wordsDone: number;
  wordsSpawned: number;
  misses: number;
  typos: number;
  avgSpeed: number;
  speedBonus: number;
  timeRemaining: number;
  grade: Grade;
  isLastLevel: boolean;
}

export interface GameOverData {
  reason: string;
  wordsDone: number;
  totalScore: number;
  levelReached: number;
  grade: Grade;
  message: string;
}

export interface WinData {
  playerName: string;
  words: CompletedWord[];
  totalScore: number;
  totalSpeedBonus: number;
  overallGrade: Grade;
  breakdown: string;
}

// ── Training Mode ──

export interface KeyStat {
  hits: number;
  misses: number;
  totalTimeMs: number;
}

export interface LessonProgress {
  completed: boolean;
  bestAccuracy: number;
  bestWpm: number;
  stars: number;
  attempts: number;
  recentWpm: number[];
}

export interface StreakData {
  current: number;
  lastPracticeDate: string;
  longestStreak: number;
}

export interface TrainingPersistence {
  keyStats: Record<string, KeyStat>;
  lessons: Record<string, LessonProgress>;
  badges: string[];
  streak: StreakData;
  settings: {
    keyboardMode: 'always' | 'hidden';
  };
}

export interface TrainingLesson {
  id: string;
  title: string;
  keys: string[];
  exercises: string[][];
}

export interface TrainingStage {
  id: number;
  title: string;
  emoji: string;
  lessons: TrainingLesson[];
}

export interface LessonCompleteData {
  stageId: number;
  lessonId: string;
  accuracy: number;
  wpm: number;
  correctCount: number;
  errorCount: number;
  bestStreak: number;
  stars: number;
  newBadges: string[];
  isNewBest: boolean;
}

export interface BadgeDef {
  id: string;
  emoji: string;
  title: string;
  description: string;
}
