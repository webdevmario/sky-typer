/** Fisher-Yates shuffle (in-place). */
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Pick a random item from an array. */
export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Escape HTML for safe rendering. */
export function escapeHtml(str) {
  const el = document.createElement('div');
  el.textContent = str;
  return el.innerHTML;
}

// ── Scoring ──────────────────────────────────────────

export function calcPoints(word, level) {
  const len = word.length;
  const multiplier = len >= 10 ? 3 : len >= 7 ? 2 : 1;
  return len * 15 * multiplier * level;
}

export function calcSpeedBonus(word, ms) {
  const cps = (word.length / ms) * 1000;
  if (cps >= 5) return Math.round(word.length * 20);
  if (cps >= 3) return Math.round(word.length * 12);
  if (cps >= 2) return Math.round(word.length * 6);
  if (cps >= 1) return Math.round(word.length * 2);
  return 0;
}

// ── Grading ──────────────────────────────────────────

const GRADES = [
  { min: 95, letter: 'A+', cls: 'grade-ap', msg: 'Absolutely perfect! 🌟', emoji: '🤩', requiresPerfect: true },
  { min: 88, letter: 'A',  cls: 'grade-a',  msg: 'Outstanding work!',      emoji: '🎯' },
  { min: 78, letter: 'A-', cls: 'grade-am', msg: 'Excellent job!',         emoji: '💪' },
  { min: 65, letter: 'B+', cls: 'grade-bp', msg: 'Really great effort!',   emoji: '👏' },
  { min: 50, letter: 'B',  cls: 'grade-b',  msg: 'Good job, keep going!',  emoji: '👍' },
  { min: 0,  letter: 'C',  cls: 'grade-c',  msg: 'Nice try, practice more!', emoji: '💡' },
];

/**
 * Calculate a grade from level performance.
 * @param {number} done    - words completed
 * @param {number} total   - words that actually spawned (done + missed)
 * @param {number} misses  - words missed
 * @param {number} maxMiss - max misses allowed
 * @param {number} avgSpd  - average speed bonus per word
 * @param {number} typos   - total typo count
 */
export function calcGrade(done, total, misses, maxMiss, avgSpd, typos) {
  const comp = total > 0 ? done / total : 0;
  const missPen = maxMiss > 0 ? 1 - (misses / maxMiss) : 1;
  const spdF = Math.min(avgSpd / 80, 1);
  const typoPen = Math.max(0, 1 - (typos * 0.08));
  const score = (comp * 40) + (missPen * 25) + (spdF * 15) + (typoPen * 20);

  for (const g of GRADES) {
    if (score >= g.min) {
      if (g.requiresPerfect && (typos > 0 || misses > 0)) continue;
      return { letter: g.letter, cls: g.cls, msg: g.msg, emoji: g.emoji, score };
    }
  }
  return GRADES[GRADES.length - 1];
}

/** Map grade letters to numeric values for averaging. */
const GRADE_TO_NUM = { 'A+': 100, 'A': 92, 'A-': 82, 'B+': 72, 'B': 58, 'C': 40 };

/** Compute an overall grade from an array of per-level grade objects. */
export function calcOverallGrade(lvlGrades) {
  const scores = lvlGrades.map(g => GRADE_TO_NUM[g.letter] || 58);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

  const thresholds = [
    [96, GRADES[0]], [88, GRADES[1]], [78, GRADES[2]],
    [65, GRADES[3]], [50, GRADES[4]], [0, GRADES[5]],
  ];
  for (const [min, g] of thresholds) {
    if (avg >= min) return { ...g, score: avg };
  }
  return { ...GRADES[GRADES.length - 1], score: avg };
}

// ── Audio ────────────────────────────────────────────

const AudioCtx = window.AudioContext || window.webkitAudioContext;
let actx;

function ensureAudio() {
  if (!actx) actx = new AudioCtx();
  if (actx.state === 'suspended') actx.resume();
}

function tone(freq, time, type, vol, dur) {
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

export function sndType() {
  ensureAudio();
  tone(500 + Math.random() * 500, actx.currentTime, 'sine', 0.07, 0.08);
}
export function sndWord() {
  ensureAudio();
  [523, 659, 784, 1047].forEach((f, i) => tone(f, actx.currentTime + i * 0.07, 'sine', 0.1, 0.25));
}
export function sndMiss() {
  ensureAudio();
  tone(200, actx.currentTime, 'sawtooth', 0.06, 0.3);
}
export function sndErr() {
  ensureAudio();
  tone(150, actx.currentTime, 'square', 0.08, 0.12);
  tone(120, actx.currentTime + 0.06, 'square', 0.06, 0.12);
}
export function sndGameOver() {
  ensureAudio();
  [400, 350, 300, 200].forEach((f, i) => tone(f, actx.currentTime + i * 0.15, 'sawtooth', 0.07, 0.3));
}
export function sndLevelUp() {
  ensureAudio();
  [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, actx.currentTime + i * 0.09, 'sine', 0.1, 0.35));
}

// ── Local Storage ────────────────────────────────────

const HS_KEY = 'skytyper_hs';
const CW_KEY = 'skytyper_cw';

export function getHighScores() {
  try { return JSON.parse(localStorage.getItem(HS_KEY) || '[]'); } catch { return []; }
}
export function saveHighScore(name, score, tag) {
  const hs = getHighScores();
  hs.push({ n: name, s: score, t: tag, d: Date.now() });
  hs.sort((a, b) => b.s - a.s);
  localStorage.setItem(HS_KEY, JSON.stringify(hs.slice(0, 10)));
}
export function clearHighScores() {
  localStorage.removeItem(HS_KEY);
}

export function getCustomWords() {
  try { return JSON.parse(localStorage.getItem(CW_KEY) || '[]'); } catch { return []; }
}
export function saveCustomWords(list) {
  localStorage.setItem(CW_KEY, JSON.stringify(list));
}
export function wordLevel(w) {
  const l = w.length;
  if (l <= 5) return 1;
  if (l <= 6) return 2;
  if (l <= 7) return 3;
  if (l <= 9) return 4;
  return 5;
}
