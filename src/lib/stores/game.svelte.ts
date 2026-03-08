import { WORDS, LEVEL_NAMES, LEVEL_BADGES } from '../data/words';
import { DIFFICULTY } from '../data/difficulty';
import type {
  FallingObject,
  CompletedWord,
  Grade,
  WordEntry,
  LevelUpData,
  GameOverData,
  WinData,
} from '../types';
import {
  shuffle,
  pickRandom,
  calcPoints,
  calcSpeedBonus,
  calcGrade,
  calcOverallGrade,
  sndType,
  sndWord,
  sndMiss,
  sndErr,
  sndGameOver,
  sndLevelUp,
  getCustomWords,
  saveHighScore,
} from '../utils/helpers';

function createGameStore() {
  // ── Config ──
  let playerName = $state('');
  let difficulty = $state('normal');
  let timePerLevel = $state(30);

  // ── Screen state ──
  let screen = $state('start');

  // ── Game state ──
  let score = $state(0);
  let level = $state(0);
  let timeLeft = $state(0);
  let running = $state(false);
  let lives = $state(0);
  let maxLives = $state(3);

  // ── Level tracking ──
  let levelWordsDone = $state(0);
  let levelMisses = $state(0);
  let levelTypos = $state(0);
  let levelSpeedBonus = $state(0);
  let totalSpeedBonus = $state(0);
  let totalTypos = $state(0);
  let levelGrades = $state<Grade[]>([]);
  let completedWords = $state<CompletedWord[]>([]);

  // ── Falling objects ──
  let fallingObjects = $state<FallingObject[]>([]);
  let wordQueue = $state<WordEntry[]>([]);
  let currentTarget = $state<FallingObject | null>(null);
  let typingStart = $state(0);
  let inputValue = $state('');
  let inputError = $state(false);

  // ── Level meta ──
  let levelNames = $state<string[]>([]);
  let levelBadges = $state<string[]>([]);

  // ── Level-up screen data ──
  let levelUpData = $state<LevelUpData | null>(null);
  let gameOverData = $state<GameOverData | null>(null);
  let winData = $state<WinData | null>(null);

  // ── Internals ──
  let spawnTimer: ReturnType<typeof setInterval> | null = null;
  let gameTimer: ReturnType<typeof setInterval> | null = null;
  let objectId = 0;

  // ── Derived ──
  const livesRemaining = $derived(maxLives - lives);
  const df = $derived(DIFFICULTY[difficulty]);
  const currentLevelName = $derived(levelNames[level - 1] || '');
  const currentLevelBadge = $derived(levelBadges[level - 1] || '');

  function randomMeta(): void {
    levelNames = LEVEL_NAMES.map((p) => pickRandom(p));
    levelBadges = LEVEL_BADGES.map((p) => pickRandom(p));
  }

  function clearIntervals(): void {
    if (spawnTimer) {
      clearInterval(spawnTimer);
      spawnTimer = null;
    }
    if (gameTimer) {
      clearInterval(gameTimer);
      gameTimer = null;
    }
  }

  function removeObject(obj: FallingObject): void {
    fallingObjects = fallingObjects.filter((o) => o.id !== obj.id);
  }

  function autoTarget(): void {
    if (fallingObjects.length > 0) {
      setTarget(fallingObjects[0]);
    } else {
      currentTarget = null;
    }
  }

  function setTarget(obj: FallingObject): void {
    currentTarget = obj;
    inputValue = '';
    typingStart = 0;
  }

  function checkLevelComplete(): void {
    if (running && fallingObjects.length === 0 && (wordQueue.length === 0 || timeLeft <= 0)) {
      levelDone();
    }
  }

  // ── Public API ──

  function setDifficulty(d: string): void {
    difficulty = d;
  }
  function setTimePerLevel(t: number): void {
    timePerLevel = Math.max(15, Math.min(120, t));
  }
  function setPlayerName(n: string): void {
    playerName = n;
  }
  function setInputValue(v: string): void {
    inputValue = v;
  }

  function startGame(): void {
    playerName = playerName.trim().toUpperCase() || 'PLAYER';
    score = 0;
    level = 0;
    completedWords = [];
    lives = 0;
    maxLives = df.ms;
    totalSpeedBonus = 0;
    totalTypos = 0;
    levelGrades = [];
    randomMeta();
    screen = 'game';
    startLevel(1);
  }

  function restart(): void {
    clearAll();
    score = 0;
    level = 0;
    completedWords = [];
    lives = 0;
    maxLives = df.ms;
    totalSpeedBonus = 0;
    totalTypos = 0;
    levelGrades = [];
    randomMeta();
    screen = 'game';
    startLevel(1);
  }

  function goHome(): void {
    clearAll();
    screen = 'start';
  }

  function clearAll(): void {
    clearIntervals();
    fallingObjects = [];
    wordQueue = [];
    currentTarget = null;
    running = false;
    inputValue = '';
    typingStart = 0;
  }

  function startLevel(lv: number): void {
    clearAll();
    level = lv;
    timeLeft = timePerLevel;
    running = true;
    lives = 0;
    levelWordsDone = 0;
    levelMisses = 0;
    levelTypos = 0;
    levelSpeedBonus = 0;
    typingStart = 0;
    inputValue = '';

    const pool = getWordsForLevel(lv);
    shuffle(pool);
    wordQueue = pool.slice(0, df.wc);

    screen = 'levelTransition';
    setTimeout(() => {
      screen = 'game';
      spawn();
      spawnTimer = setInterval(spawn, df.si[lv - 1]);
      gameTimer = setInterval(tick, 1000);
    }, 1800);
  }

  function getWordsForLevel(lv: number): WordEntry[] {
    const base = [...WORDS[lv]];
    const custom = getCustomWords()
      .filter((x) => x.l === lv)
      .map((x) => ({ w: x.w, i: '📝', d: x.d }));
    return base.concat(custom);
  }

  function tick(): void {
    if (!running) return;
    timeLeft--;
    if (timeLeft <= 0) {
      timeLeft = 0;
      clearIntervals();
      if (fallingObjects.length === 0) {
        levelDone();
      }
    }
  }

  function spawn(): void {
    if (!running || timeLeft <= 0) return;
    if (wordQueue.length === 0) {
      if (fallingObjects.length === 0) levelDone();
      return;
    }
    const wd = wordQueue[0];
    wordQueue = wordQueue.slice(1);
    const id = ++objectId;
    const fallDuration = df.sp[level - 1];
    const leftPos = 8 + Math.random() * 74;

    const obj: FallingObject = {
      id,
      word: wd.w,
      icon: wd.i,
      def: wd.d,
      typed: 0,
      fallDuration,
      leftPos,
      active: false,
    };
    fallingObjects = [...fallingObjects, obj];
    if (!currentTarget) setTarget(obj);
  }

  function wordMissed(objId: number): void {
    if (!running) return;
    const obj = fallingObjects.find((o) => o.id === objId);
    if (!obj) return;

    sndMiss();
    lives++;
    levelMisses++;
    removeObject(obj);
    currentTarget = null;
    inputValue = '';
    typingStart = 0;
    autoTarget();

    if (lives >= maxLives) {
      gameOver('miss');
      return;
    }
    checkLevelComplete();
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (!running) return;

    if (e.key === 'Tab' || e.key === 'Escape') {
      e.preventDefault();
      return;
    }
    if (e.repeat) {
      e.preventDefault();
      return;
    }
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    if (e.key.length !== 1) return;

    const nextVal = (inputValue + e.key).toLowerCase();

    if (!currentTarget) {
      const found = fallingObjects.some((o) => o.word.startsWith(nextVal));
      if (!found) {
        e.preventDefault();
        rejectKey();
        return;
      }
    } else {
      if (currentTarget.word.startsWith(nextVal)) {
        // good
      } else {
        const found = fallingObjects.some(
          (o) => o.id !== currentTarget!.id && o.word.startsWith(nextVal),
        );
        if (!found) {
          e.preventDefault();
          rejectKey();
          return;
        }
      }
    }
  }

  function handleInput(value: string): void {
    if (!running) return;
    sndType();
    const v = value.toLowerCase();
    inputValue = v;
    if (v.length === 1 && typingStart === 0) typingStart = performance.now();

    if (!currentTarget) {
      const match = fallingObjects.find((o) => o.word.startsWith(v));
      if (match) switchTarget(match, v);
    }
    if (currentTarget) {
      if (currentTarget.word.startsWith(v)) {
        updateTypedProgress(currentTarget, v.length);
        if (v === currentTarget.word) wordCompleted(currentTarget);
      } else {
        const match = fallingObjects.find(
          (o) => o.id !== currentTarget!.id && o.word.startsWith(v),
        );
        if (match) switchTarget(match, v);
      }
    }
  }

  function switchTarget(obj: FallingObject, v: string): void {
    currentTarget = obj;
    updateTypedProgress(obj, v.length);
    typingStart = performance.now();
  }

  function updateTypedProgress(obj: FallingObject, count: number): void {
    fallingObjects = fallingObjects.map((o) =>
      o.id === obj.id ? { ...o, typed: count, active: true } : { ...o, active: o.id === obj.id },
    );
    if (currentTarget && currentTarget.id === obj.id) {
      currentTarget = { ...currentTarget, typed: count, active: true };
    }
  }

  function rejectKey(): void {
    sndErr();
    levelTypos++;
    totalTypos++;
    inputError = true;
    setTimeout(() => {
      inputError = false;
    }, 200);
  }

  function wordCompleted(obj: FallingObject): { pts: number; sb: number } {
    sndWord();
    const pts = calcPoints(obj.word, level);
    const elapsed = typingStart > 0 ? performance.now() - typingStart : 5000;
    const sb = calcSpeedBonus(obj.word, elapsed);
    score += pts + sb;
    levelSpeedBonus += sb;
    levelWordsDone++;
    totalSpeedBonus += sb;

    completedWords = [...completedWords, { w: obj.word, i: obj.icon, d: obj.def, p: pts, sb }];
    removeObject(obj);
    currentTarget = null;
    inputValue = '';
    typingStart = 0;
    autoTarget();
    checkLevelComplete();

    return { pts, sb };
  }

  function levelDone(): void {
    running = false;
    clearIntervals();
    sndLevelUp();

    const wordsSpawned = levelWordsDone + levelMisses;
    const avgSpd = levelWordsDone > 0 ? levelSpeedBonus / levelWordsDone : 0;
    const grade = calcGrade(
      levelWordsDone,
      wordsSpawned,
      levelMisses,
      maxLives,
      avgSpd,
      levelTypos,
    );
    levelGrades = [...levelGrades, grade];

    levelUpData = {
      levelName: levelNames[level - 1],
      badge: levelBadges[level - 1],
      wordsDone: levelWordsDone,
      wordsSpawned,
      misses: levelMisses,
      typos: levelTypos,
      avgSpeed: Math.round(avgSpd),
      speedBonus: levelSpeedBonus,
      timeRemaining: timeLeft,
      grade,
      isLastLevel: level >= 5,
    };
    screen = 'levelUp';
  }

  function nextLevel(): void {
    startLevel(level + 1);
  }

  function showWinScreen(): void {
    const overall = calcOverallGrade(levelGrades);
    const breakdown = levelGrades.map((g, i) => `L${i + 1}: ${g.letter}`).join('  ');

    winData = {
      playerName,
      words: completedWords,
      totalScore: score,
      totalSpeedBonus,
      overallGrade: overall,
      breakdown,
    };
    saveHighScore(playerName, score, overall.letter + ' — ' + levelNames[4]);
    screen = 'win';
  }

  function gameOver(reason: string): void {
    running = false;
    clearIntervals();
    sndGameOver();
    fallingObjects = [];

    const wordsSpawned = completedWords.length + lives;
    const avgSpd = completedWords.length > 0 ? totalSpeedBonus / completedWords.length : 0;
    const grade = calcGrade(
      completedWords.length,
      wordsSpawned,
      lives,
      maxLives,
      avgSpd,
      totalTypos,
    );

    gameOverData = {
      reason,
      wordsDone: completedWords.length,
      totalScore: score,
      levelReached: level,
      grade,
      message:
        reason === 'miss' ? `Too many words escaped! (${lives}/${maxLives})` : 'Time ran out!',
    };
    saveHighScore(playerName, score, grade.letter + ' — ' + levelNames[Math.min(level - 1, 4)]);
    screen = 'gameOver';
  }

  function openCustomWords(): void {
    screen = 'customWords';
  }
  function closeCustomWords(): void {
    screen = 'start';
  }

  return {
    get playerName() {
      return playerName;
    },
    get difficulty() {
      return difficulty;
    },
    get timePerLevel() {
      return timePerLevel;
    },
    get screen() {
      return screen;
    },
    get score() {
      return score;
    },
    get level() {
      return level;
    },
    get timeLeft() {
      return timeLeft;
    },
    get running() {
      return running;
    },
    get livesRemaining() {
      return livesRemaining;
    },
    get maxLives() {
      return maxLives;
    },
    get fallingObjects() {
      return fallingObjects;
    },
    get currentTarget() {
      return currentTarget;
    },
    get inputValue() {
      return inputValue;
    },
    get inputError() {
      return inputError;
    },
    get currentLevelName() {
      return currentLevelName;
    },
    get currentLevelBadge() {
      return currentLevelBadge;
    },
    get levelUpData() {
      return levelUpData;
    },
    get gameOverData() {
      return gameOverData;
    },
    get winData() {
      return winData;
    },
    get completedWords() {
      return completedWords;
    },
    get levelGrades() {
      return levelGrades;
    },

    setDifficulty,
    setTimePerLevel,
    setPlayerName,
    setInputValue,
    startGame,
    restart,
    goHome,
    startLevel,
    nextLevel,
    showWinScreen,
    handleKeydown,
    handleInput,
    wordMissed,
    openCustomWords,
    closeCustomWords,
  };
}

export const game = createGameStore();
