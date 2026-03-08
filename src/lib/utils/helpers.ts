import type { Grade, HighScore, CustomWord } from '../types';

/** Fisher-Yates shuffle (in-place). */
export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Pick a random item from an array. */
export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Escape HTML for safe rendering. */
export function escapeHtml(str: string): string {
  const el = document.createElement('div');
  el.textContent = str;
  return el.innerHTML;
}

// ── Scoring ──────────────────────────────────────────

export function calcPoints(word: string, level: number): number {
  const len = word.length;
  const multiplier = len >= 10 ? 3 : len >= 7 ? 2 : 1;
  return len * 15 * multiplier * level;
}

export function calcSpeedBonus(word: string, ms: number): number {
  const cps = (word.length / ms) * 1000;
  if (cps >= 5) return Math.round(word.length * 20);
  if (cps >= 3) return Math.round(word.length * 12);
  if (cps >= 2) return Math.round(word.length * 6);
  if (cps >= 1) return Math.round(word.length * 2);
  return 0;
}

// ── Grading ──────────────────────────────────────────

interface GradeDef {
  min: number;
  letter: string;
  cls: string;
  msg: string;
  emoji: string;
  requiresPerfect?: boolean;
}

const GRADES: GradeDef[] = [
  {
    min: 95,
    letter: 'A+',
    cls: 'grade-ap',
    msg: 'Absolutely perfect! 🌟',
    emoji: '🤩',
    requiresPerfect: true,
  },
  { min: 88, letter: 'A', cls: 'grade-a', msg: 'Outstanding work!', emoji: '🎯' },
  { min: 78, letter: 'A-', cls: 'grade-am', msg: 'Excellent job!', emoji: '💪' },
  { min: 65, letter: 'B+', cls: 'grade-bp', msg: 'Really great effort!', emoji: '👏' },
  { min: 50, letter: 'B', cls: 'grade-b', msg: 'Good job, keep going!', emoji: '👍' },
  { min: 0, letter: 'C', cls: 'grade-c', msg: 'Nice try, practice more!', emoji: '💡' },
];

export function calcGrade(
  done: number,
  total: number,
  misses: number,
  maxMiss: number,
  avgSpd: number,
  typos: number,
): Grade {
  const comp = total > 0 ? done / total : 0;
  const missPen = maxMiss > 0 ? 1 - misses / maxMiss : 1;
  const spdF = Math.min(avgSpd / 80, 1);
  const typoPen = Math.max(0, 1 - typos * 0.08);
  const score = comp * 40 + missPen * 25 + spdF * 15 + typoPen * 20;

  for (const g of GRADES) {
    if (score >= g.min) {
      if (g.requiresPerfect && (typos > 0 || misses > 0)) continue;
      return { letter: g.letter, cls: g.cls, msg: g.msg, emoji: g.emoji, score };
    }
  }
  const fallback = GRADES[GRADES.length - 1];
  return {
    letter: fallback.letter,
    cls: fallback.cls,
    msg: fallback.msg,
    emoji: fallback.emoji,
    score,
  };
}

const GRADE_TO_NUM: Record<string, number> = {
  'A+': 100,
  A: 92,
  'A-': 82,
  'B+': 72,
  B: 58,
  C: 40,
};

export function calcOverallGrade(lvlGrades: Grade[]): Grade {
  const scores = lvlGrades.map((g) => GRADE_TO_NUM[g.letter] || 58);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

  const thresholds: [number, GradeDef][] = [
    [96, GRADES[0]],
    [88, GRADES[1]],
    [78, GRADES[2]],
    [65, GRADES[3]],
    [50, GRADES[4]],
    [0, GRADES[5]],
  ];
  for (const [min, g] of thresholds) {
    if (avg >= min) return { letter: g.letter, cls: g.cls, msg: g.msg, emoji: g.emoji, score: avg };
  }
  const fallback = GRADES[GRADES.length - 1];
  return {
    letter: fallback.letter,
    cls: fallback.cls,
    msg: fallback.msg,
    emoji: fallback.emoji,
    score: avg,
  };
}

// ── Audio ────────────────────────────────────────────

let actx: AudioContext | null = null;

function ensureAudio(): void {
  if (!actx) actx = new AudioContext();
  if (actx.state === 'suspended') actx.resume();
}

function tone(freq: number, time: number, type: OscillatorType, vol: number, dur: number): void {
  if (!actx) return;
  const o = actx.createOscillator();
  const g = actx.createGain();
  o.connect(g);
  g.connect(actx.destination);
  o.type = type;
  o.frequency.setValueAtTime(freq, time);
  g.gain.setValueAtTime(vol, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + dur);
  o.start(time);
  o.stop(time + dur);
}

export function sndType(): void {
  ensureAudio();
  tone(500 + Math.random() * 500, actx!.currentTime, 'sine', 0.07, 0.08);
}
export function sndWord(): void {
  ensureAudio();
  [523, 659, 784, 1047].forEach((f, i) => tone(f, actx!.currentTime + i * 0.07, 'sine', 0.1, 0.25));
}
export function sndMiss(): void {
  ensureAudio();
  tone(200, actx!.currentTime, 'sawtooth', 0.06, 0.3);
}
export function sndErr(): void {
  ensureAudio();
  tone(150, actx!.currentTime, 'square', 0.08, 0.12);
  tone(120, actx!.currentTime + 0.06, 'square', 0.06, 0.12);
}
export function sndGameOver(): void {
  ensureAudio();
  [400, 350, 300, 200].forEach((f, i) =>
    tone(f, actx!.currentTime + i * 0.15, 'sawtooth', 0.07, 0.3),
  );
}
export function sndLevelUp(): void {
  ensureAudio();
  [523, 659, 784, 1047, 1319].forEach((f, i) =>
    tone(f, actx!.currentTime + i * 0.09, 'sine', 0.1, 0.35),
  );
}

// ── Local Storage ────────────────────────────────────

const HS_KEY = 'skytyper_hs';
const CW_KEY = 'skytyper_cw';

export function getHighScores(): HighScore[] {
  try {
    return JSON.parse(localStorage.getItem(HS_KEY) || '[]') as HighScore[];
  } catch {
    return [];
  }
}

export function saveHighScore(name: string, score: number, tag: string): void {
  const hs = getHighScores();
  hs.push({ n: name, s: score, t: tag, d: Date.now() });
  hs.sort((a, b) => b.s - a.s);
  localStorage.setItem(HS_KEY, JSON.stringify(hs.slice(0, 10)));
}

export function clearHighScores(): void {
  localStorage.removeItem(HS_KEY);
}

export function getCustomWords(): CustomWord[] {
  try {
    return JSON.parse(localStorage.getItem(CW_KEY) || '[]') as CustomWord[];
  } catch {
    return [];
  }
}

export function saveCustomWords(list: CustomWord[]): void {
  localStorage.setItem(CW_KEY, JSON.stringify(list));
}

export function wordLevel(w: string): number {
  const l = w.length;
  if (l <= 5) return 1;
  if (l <= 6) return 2;
  if (l <= 7) return 3;
  if (l <= 9) return 4;
  return 5;
}
