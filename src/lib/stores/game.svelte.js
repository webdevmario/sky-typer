import { WORDS, LEVEL_NAMES, LEVEL_BADGES } from '../data/words.js';
import { DIFFICULTY } from '../data/difficulty.js';
import {
  shuffle, pickRandom, calcPoints, calcSpeedBonus,
  calcGrade, calcOverallGrade, sndType, sndWord, sndMiss, sndErr,
  sndGameOver, sndLevelUp, getCustomWords,
  saveHighScore,
} from '../utils/helpers.js';

function createGameStore() {
  // ── Config ──
  let playerName = $state('');
  let difficulty = $state('normal');
  let timePerLevel = $state(30);

  // ── Screen state ──
  let screen = $state('start'); // start | game | levelUp | gameOver | win | customWords

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
  let levelGrades = $state([]);
  let completedWords = $state([]);

  // ── Falling objects ──
  let fallingObjects = $state([]);
  let wordQueue = $state([]);
  let currentTarget = $state(null);
  let typingStart = $state(0);
  let inputValue = $state('');
  let inputError = $state(false);

  // ── Level meta ──
  let levelNames = $state([]);
  let levelBadges = $state([]);

  // ── Level-up screen data ──
  let levelUpData = $state(null);
  let gameOverData = $state(null);
  let winData = $state(null);

  // ── Internals ──
  let spawnTimer = null;
  let gameTimer = null;
  let objectId = 0;
  let boundCheckRef = null;

  // ── Derived ──
  let livesRemaining = $derived(maxLives - lives);
  let df = $derived(DIFFICULTY[difficulty]);
  let currentLevelName = $derived(levelNames[level - 1] || '');
  let currentLevelBadge = $derived(levelBadges[level - 1] || '');

  function randomMeta() {
    levelNames = LEVEL_NAMES.map(p => pickRandom(p));
    levelBadges = LEVEL_BADGES.map(p => pickRandom(p));
  }

  function clearIntervals() {
    if (spawnTimer) { clearInterval(spawnTimer); spawnTimer = null; }
    if (gameTimer) { clearInterval(gameTimer); gameTimer = null; }
  }

  function removeObject(obj) {
    fallingObjects = fallingObjects.filter(o => o.id !== obj.id);
  }

  function autoTarget() {
    if (fallingObjects.length > 0) {
      setTarget(fallingObjects[0]);
    } else {
      currentTarget = null;
    }
  }

  function setTarget(obj) {
    currentTarget = obj;
    inputValue = '';
    typingStart = 0;
  }

  function checkLevelComplete() {
    if (running && fallingObjects.length === 0 && (wordQueue.length === 0 || timeLeft <= 0)) {
      levelDone();
    }
  }

  // ── Public API ──

  function setDifficulty(d) { difficulty = d; }
  function setTimePerLevel(t) { timePerLevel = Math.max(15, Math.min(120, t)); }
  function setPlayerName(n) { playerName = n; }
  function setInputValue(v) { inputValue = v; }

  function startGame() {
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

  function restart() {
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

  function goHome() {
    clearAll();
    screen = 'start';
  }

  function clearAll() {
    clearIntervals();
    fallingObjects = [];
    wordQueue = [];
    currentTarget = null;
    running = false;
    inputValue = '';
    typingStart = 0;
  }

  function startLevel(lv) {
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

    // Show level transition, then begin
    screen = 'levelTransition';
    setTimeout(() => {
      screen = 'game';
      spawn();
      spawnTimer = setInterval(spawn, df.si[lv - 1]);
      gameTimer = setInterval(tick, 1000);
    }, 1800);
  }

  function getWordsForLevel(lv) {
    const base = [...WORDS[lv]];
    const custom = getCustomWords()
      .filter(x => x.l === lv)
      .map(x => ({ w: x.w, i: '📝', d: x.d }));
    return base.concat(custom);
  }

  function tick() {
    if (!running) return;
    timeLeft--;
    if (timeLeft <= 0) {
      timeLeft = 0;
      clearIntervals();
      if (fallingObjects.length === 0) {
        levelDone();
      }
      // else: let remaining words play out naturally
    }
  }

  function spawn() {
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

    const obj = {
      id, word: wd.w, icon: wd.i, def: wd.d,
      typed: 0, fallDuration, leftPos,
      active: false,
    };
    fallingObjects = [...fallingObjects, obj];
    if (!currentTarget) setTarget(obj);
  }

  function wordMissed(objId) {
    if (!running) return;
    const obj = fallingObjects.find(o => o.id === objId);
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

  function handleKeydown(e) {
    if (!running) return;

    if (e.key === 'Tab' || e.key === 'Escape') { e.preventDefault(); return; }
    if (e.repeat) { e.preventDefault(); return; }
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    if (e.key.length !== 1) return;

    const nextVal = (inputValue + e.key).toLowerCase();

    if (!currentTarget) {
      let found = fallingObjects.some(o => o.word.startsWith(nextVal));
      if (!found) { e.preventDefault(); rejectKey(); return; }
    } else {
      if (currentTarget.word.startsWith(nextVal)) {
        // good
      } else {
        let found = fallingObjects.some(o => o.id !== currentTarget.id && o.word.startsWith(nextVal));
        if (!found) { e.preventDefault(); rejectKey(); return; }
      }
    }
  }

  function handleInput(value) {
    if (!running) return;
    sndType();
    const v = value.toLowerCase();
    inputValue = v;
    if (v.length === 1 && typingStart === 0) typingStart = performance.now();

    if (!currentTarget) {
      const match = fallingObjects.find(o => o.word.startsWith(v));
      if (match) switchTarget(match, v);
    }
    if (currentTarget) {
      if (currentTarget.word.startsWith(v)) {
        updateTypedProgress(currentTarget, v.length);
        if (v === currentTarget.word) wordCompleted(currentTarget);
      } else {
        const match = fallingObjects.find(o => o.id !== currentTarget.id && o.word.startsWith(v));
        if (match) switchTarget(match, v);
      }
    }
  }

  function switchTarget(obj, v) {
    currentTarget = obj;
    updateTypedProgress(obj, v.length);
    typingStart = performance.now();
  }

  function updateTypedProgress(obj, count) {
    fallingObjects = fallingObjects.map(o =>
      o.id === obj.id ? { ...o, typed: count, active: true } : { ...o, active: o.id === obj.id }
    );
    // Sync currentTarget
    if (currentTarget && currentTarget.id === obj.id) {
      currentTarget = { ...currentTarget, typed: count, active: true };
    }
  }

  function rejectKey() {
    sndErr();
    levelTypos++;
    totalTypos++;
    inputError = true;
    setTimeout(() => { inputError = false; }, 200);
  }

  function wordCompleted(obj) {
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

    // Return VFX data for the component to use
    return { pts, sb };
  }

  function levelDone() {
    running = false;
    clearIntervals();
    sndLevelUp();

    const wordsSpawned = levelWordsDone + levelMisses;
    const avgSpd = levelWordsDone > 0 ? levelSpeedBonus / levelWordsDone : 0;
    const grade = calcGrade(levelWordsDone, wordsSpawned, levelMisses, maxLives, avgSpd, levelTypos);
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

  function nextLevel() {
    startLevel(level + 1);
  }

  function showWinScreen() {
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

  function gameOver(reason) {
    running = false;
    clearIntervals();
    sndGameOver();
    fallingObjects = [];

    const wordsSpawned = completedWords.length + lives;
    const avgSpd = completedWords.length > 0 ? totalSpeedBonus / completedWords.length : 0;
    const grade = calcGrade(completedWords.length, wordsSpawned, lives, maxLives, avgSpd, totalTypos);

    gameOverData = {
      reason,
      wordsDone: completedWords.length,
      totalScore: score,
      levelReached: level,
      grade,
      message: reason === 'miss'
        ? `Too many words escaped! (${lives}/${maxLives})`
        : 'Time ran out!',
    };
    saveHighScore(playerName, score, grade.letter + ' — ' + levelNames[Math.min(level - 1, 4)]);
    screen = 'gameOver';
  }

  function openCustomWords() { screen = 'customWords'; }
  function closeCustomWords() { screen = 'start'; }

  return {
    // Getters (reactive via $state)
    get playerName() { return playerName; },
    get difficulty() { return difficulty; },
    get timePerLevel() { return timePerLevel; },
    get screen() { return screen; },
    get score() { return score; },
    get level() { return level; },
    get timeLeft() { return timeLeft; },
    get running() { return running; },
    get livesRemaining() { return livesRemaining; },
    get maxLives() { return maxLives; },
    get fallingObjects() { return fallingObjects; },
    get currentTarget() { return currentTarget; },
    get inputValue() { return inputValue; },
    get inputError() { return inputError; },
    get currentLevelName() { return currentLevelName; },
    get currentLevelBadge() { return currentLevelBadge; },
    get levelUpData() { return levelUpData; },
    get gameOverData() { return gameOverData; },
    get winData() { return winData; },
    get completedWords() { return completedWords; },
    get levelGrades() { return levelGrades; },

    // Actions
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
