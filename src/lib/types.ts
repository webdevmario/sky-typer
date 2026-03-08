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
