import { STAGES } from '../data/training-lessons';
import { STAR_THRESHOLDS, IDLE_THRESHOLD_MS } from '../data/training-config';
import { sndType, sndErr, sndWord, sndLevelUp, todayStr, yesterdayStr } from '../utils/helpers';
import type { TrainingPersistence, LessonProgress, LessonCompleteData } from '../types';

const TM_OLD_KEY = 'skytyper_training';
const TM_USERS_KEY = 'skytyper_training_users';

function defaultPersistence(): TrainingPersistence {
  return {
    keyStats: {},
    lessons: {},
    badges: [],
    streak: { current: 0, lastPracticeDate: '', longestStreak: 0 },
    settings: { keyboardMode: 'always' },
  };
}

function loadAllUsers(): Record<string, TrainingPersistence> {
  try {
    const raw = localStorage.getItem(TM_USERS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveAllUsers(users: Record<string, TrainingPersistence>): void {
  localStorage.setItem(TM_USERS_KEY, JSON.stringify(users));
}

function loadUserData(name: string): TrainingPersistence {
  if (!name) return defaultPersistence();
  const users = loadAllUsers();
  return users[name] ? { ...defaultPersistence(), ...users[name] } : defaultPersistence();
}

function saveUserData(name: string, data: TrainingPersistence): void {
  if (!name) return;
  const users = loadAllUsers();
  users[name] = data;
  saveAllUsers(users);
}

// Migrate old single-user data to per-user schema
function migrateOldData(): void {
  const old = localStorage.getItem(TM_OLD_KEY);
  if (old) {
    try {
      const parsed = JSON.parse(old);
      const users = loadAllUsers();
      if (!users['PLAYER']) {
        users['PLAYER'] = { ...defaultPersistence(), ...parsed };
        saveAllUsers(users);
      }
    } catch {
      // ignore bad data
    }
    localStorage.removeItem(TM_OLD_KEY);
  }
}

// Run migration on load
migrateOldData();

function createTrainingStore() {
  // Per-user state
  let currentUser = $state('');
  let persistence = $state<TrainingPersistence>(defaultPersistence());

  // Screen state
  let screen = $state<'userPicker' | 'home' | 'lesson' | 'complete' | 'inactive'>('inactive');

  // Current lesson context
  let currentStageIndex = $state(0);
  let currentLessonIndex = $state(0);
  let exerciseIndex = $state(0);

  // Exercise state
  let prompt = $state('');
  let cursorPos = $state(0);
  let correctCount = $state(0);
  let errorCount = $state(0);
  let currentStreak = $state(0);
  let bestStreak = $state(0);
  let charResults = $state<('correct' | 'error' | 'pending')[]>([]);

  // Timing
  let startTime = $state(0);
  let lastKeyTime = $state(0);
  let activeTimeMs = $state(0);
  let wpm = $state(0);

  // Visual feedback
  let lastPressedKey = $state('');
  let lastPressCorrect = $state(true);
  let streakMessage = $state('');
  let streakTimeout: ReturnType<typeof setTimeout> | null = null;

  // Completion data
  let completeData = $state<LessonCompleteData | null>(null);

  // Derived
  const currentStage = $derived(STAGES[currentStageIndex]);
  const currentLesson = $derived(currentStage?.lessons[currentLessonIndex]);
  const accuracy = $derived(
    correctCount + errorCount > 0
      ? Math.round((correctCount / (correctCount + errorCount)) * 100)
      : 100,
  );
  const nextKey = $derived(cursorPos < prompt.length ? prompt[cursorPos] : '');
  const exerciseCount = $derived(currentLesson?.exercises.length ?? 0);
  const isExerciseDone = $derived(cursorPos >= prompt.length && prompt.length > 0);

  const keyboardMode = $derived(persistence.settings.keyboardMode);

  // Check if a lesson is unlocked
  function isLessonUnlocked(stageIdx: number, lessonIdx: number): boolean {
    if (stageIdx === 0 && lessonIdx === 0) return true;

    // Previous lesson in same stage must be completed
    if (lessonIdx > 0) {
      const prevId = STAGES[stageIdx].lessons[lessonIdx - 1].id;
      return persistence.lessons[prevId]?.completed ?? false;
    }

    // First lesson of stage: all lessons in previous stage must be completed
    const prevStage = STAGES[stageIdx - 1];
    return prevStage.lessons.every((l) => persistence.lessons[l.id]?.completed ?? false);
  }

  function getLessonProgress(lessonId: string): LessonProgress | null {
    return persistence.lessons[lessonId] ?? null;
  }

  function getKeyMastery(key: string): number {
    const stat = persistence.keyStats[key];
    if (!stat || stat.hits === 0) return 0;
    const acc = stat.hits / (stat.hits + stat.misses);
    const avgMs = stat.totalTimeMs / stat.hits;
    const speedFactor = Math.min(1, 600 / Math.max(avgMs, 100));
    return Math.round(acc * 60 + speedFactor * 40);
  }

  // Actions

  function goToUserPicker(): void {
    screen = 'userPicker';
  }

  function getUserNames(): string[] {
    return Object.keys(loadAllUsers());
  }

  function selectUser(name: string): void {
    currentUser = name;
    persistence = loadUserData(name);
    screen = 'home';
  }

  function createUser(name: string): void {
    const normalized = name.trim().toUpperCase();
    if (!normalized) return;
    const users = loadAllUsers();
    if (!users[normalized]) {
      users[normalized] = defaultPersistence();
      saveAllUsers(users);
    }
    selectUser(normalized);
  }

  function goToTrainingHome(): void {
    screen = 'home';
  }

  function exitTraining(): void {
    screen = 'inactive';
  }

  function startLesson(stageIdx: number, lessonIdx: number): void {
    currentStageIndex = stageIdx;
    currentLessonIndex = lessonIdx;
    exerciseIndex = 0;
    correctCount = 0;
    errorCount = 0;
    currentStreak = 0;
    bestStreak = 0;
    activeTimeMs = 0;
    wpm = 0;
    startTime = 0;
    lastKeyTime = 0;
    loadExercise();
    screen = 'lesson';
  }

  function loadExercise(): void {
    const lesson = STAGES[currentStageIndex].lessons[currentLessonIndex];
    const words = lesson.exercises[exerciseIndex];
    prompt = words.join(' ');
    cursorPos = 0;
    charResults = Array(prompt.length).fill('pending');
    lastPressedKey = '';
  }

  function handleKey(e: KeyboardEvent): void {
    if (screen !== 'lesson') return;
    if (isExerciseDone) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      goToTrainingHome();
      return;
    }

    // Ignore modifier-only keys, tab, etc.
    if (e.key.length !== 1 && e.key !== ' ') return;
    e.preventDefault();

    const expected = prompt[cursorPos];
    const typed = e.key;
    const now = performance.now();

    // Track active time (exclude idle gaps)
    if (startTime === 0) {
      startTime = now;
      lastKeyTime = now;
    } else {
      const gap = now - lastKeyTime;
      if (gap < IDLE_THRESHOLD_MS) {
        activeTimeMs += gap;
      }
      lastKeyTime = now;
    }

    lastPressedKey = typed;

    if (typed === expected) {
      lastPressCorrect = true;
      charResults[cursorPos] = 'correct';
      charResults = [...charResults];
      cursorPos++;
      correctCount++;
      currentStreak++;
      if (currentStreak > bestStreak) bestStreak = currentStreak;

      // Update per-key stats
      const keyLower = expected.toLowerCase();
      const stat = persistence.keyStats[keyLower] ?? { hits: 0, misses: 0, totalTimeMs: 0 };
      stat.hits++;
      if (lastKeyTime > 0) {
        const gap = now - (lastKeyTime - (now - lastKeyTime > 0 ? now - lastKeyTime : 0));
        stat.totalTimeMs += Math.min(gap, IDLE_THRESHOLD_MS);
      }
      persistence.keyStats[keyLower] = stat;

      sndType();
      checkStreakMilestone();

      // Update WPM
      if (activeTimeMs > 0) {
        wpm = Math.round(correctCount / 5 / (activeTimeMs / 60000));
      }

      // Check if exercise is done
      if (cursorPos >= prompt.length) {
        sndWord();
        setTimeout(() => advanceExercise(), 600);
      }
    } else {
      lastPressCorrect = false;
      charResults[cursorPos] = 'error';
      charResults = [...charResults];
      errorCount++;
      currentStreak = 0;

      // Track miss for the expected key
      const keyLower = expected.toLowerCase();
      const stat = persistence.keyStats[keyLower] ?? { hits: 0, misses: 0, totalTimeMs: 0 };
      stat.misses++;
      persistence.keyStats[keyLower] = stat;

      sndErr();

      // Reset the error state after a brief flash
      setTimeout(() => {
        if (charResults[cursorPos] === 'error') {
          charResults[cursorPos] = 'pending';
          charResults = [...charResults];
        }
      }, 300);
    }
  }

  function checkStreakMilestone(): void {
    const milestones = [50, 20, 10, 5];
    for (const m of milestones) {
      if (currentStreak === m) {
        streakMessage = `${m} in a row!`;
        if (streakTimeout) clearTimeout(streakTimeout);
        streakTimeout = setTimeout(() => {
          streakMessage = '';
        }, 2000);
        // Play a special streak sound (ascending tones)
        sndWord();
        break;
      }
    }
  }

  function advanceExercise(): void {
    const lesson = STAGES[currentStageIndex].lessons[currentLessonIndex];
    if (exerciseIndex < lesson.exercises.length - 1) {
      exerciseIndex++;
      loadExercise();
    } else {
      completeLesson();
    }
  }

  function completeLesson(): void {
    const lessonDef = STAGES[currentStageIndex].lessons[currentLessonIndex];
    const acc =
      correctCount + errorCount > 0
        ? Math.round((correctCount / (correctCount + errorCount)) * 100)
        : 100;
    const finalWpm = activeTimeMs > 0 ? Math.round(correctCount / 5 / (activeTimeMs / 60000)) : 0;

    // Calculate stars
    let stars = 0;
    for (const threshold of STAR_THRESHOLDS) {
      if (acc >= threshold) stars++;
    }

    // Update lesson progress
    const prev = persistence.lessons[lessonDef.id];
    const isNewBest = !prev || finalWpm > prev.bestWpm;
    const recentWpm = prev?.recentWpm ? [...prev.recentWpm] : [];
    recentWpm.push(finalWpm);
    if (recentWpm.length > 5) recentWpm.shift();

    persistence.lessons[lessonDef.id] = {
      completed: true,
      bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, acc),
      bestWpm: Math.max(prev?.bestWpm ?? 0, finalWpm),
      stars: Math.max(prev?.stars ?? 0, stars),
      attempts: (prev?.attempts ?? 0) + 1,
      recentWpm,
    };

    // Update streak
    updateStreak();

    // Check for new badges
    const newBadges = checkBadges(acc, finalWpm, lessonDef.id);

    // Save
    persistence = { ...persistence };
    saveUserData(currentUser, persistence);

    sndLevelUp();

    completeData = {
      stageId: STAGES[currentStageIndex].id,
      lessonId: lessonDef.id,
      accuracy: acc,
      wpm: finalWpm,
      correctCount,
      errorCount,
      bestStreak,
      stars,
      newBadges,
      isNewBest,
    };
    screen = 'complete';
  }

  function updateStreak(): void {
    const today = todayStr();
    const s = persistence.streak;
    if (s.lastPracticeDate === today) return; // Already practiced today

    if (s.lastPracticeDate === yesterdayStr()) {
      s.current++;
    } else if (s.lastPracticeDate !== today) {
      s.current = 1;
    }
    s.lastPracticeDate = today;
    if (s.current > s.longestStreak) s.longestStreak = s.current;
  }

  function checkBadges(acc: number, finalWpm: number, _lessonId: string): string[] {
    const earned: string[] = [];
    const has = (id: string) => persistence.badges.includes(id);

    // First Steps
    if (!has('first_steps')) {
      earned.push('first_steps');
    }

    // Home Row Hero - all stage 1 lessons mastered (3 stars)
    if (!has('home_row_hero')) {
      const allMastered = STAGES[0].lessons.every(
        (l) => (persistence.lessons[l.id]?.stars ?? 0) >= 2,
      );
      if (allMastered) earned.push('home_row_hero');
    }

    // Full Keyboard - stages 1-3 completed
    if (!has('full_keyboard')) {
      const allDone = STAGES.slice(0, 3)
        .flatMap((s) => s.lessons)
        .every((l) => persistence.lessons[l.id]?.completed);
      if (allDone) earned.push('full_keyboard');
    }

    // Speed Demon
    if (!has('speed_demon') && finalWpm >= 30) {
      earned.push('speed_demon');
    }

    // Perfect Run
    if (!has('perfect_run') && acc === 100) {
      earned.push('perfect_run');
    }

    // Week Warrior
    if (!has('week_warrior') && persistence.streak.current >= 7) {
      earned.push('week_warrior');
    }

    // No Peeking
    if (!has('no_peeking') && persistence.settings.keyboardMode === 'hidden') {
      earned.push('no_peeking');
    }

    // Dedicated - 10 unique lessons completed
    if (!has('ten_lessons')) {
      const completedCount = Object.values(persistence.lessons).filter((l) => l.completed).length;
      if (completedCount >= 10) earned.push('ten_lessons');
    }

    // All Stars
    if (!has('all_stars')) {
      const allPerfect = STAGES.flatMap((s) => s.lessons).every(
        (l) => (persistence.lessons[l.id]?.stars ?? 0) >= 3,
      );
      if (allPerfect) earned.push('all_stars');
    }

    for (const id of earned) {
      if (!persistence.badges.includes(id)) {
        persistence.badges.push(id);
      }
    }

    return earned;
  }

  function setKeyboardMode(mode: 'always' | 'hidden'): void {
    persistence.settings.keyboardMode = mode;
    persistence = { ...persistence };
    saveUserData(currentUser, persistence);
  }

  function nextLesson(): void {
    const stage = STAGES[currentStageIndex];
    if (currentLessonIndex < stage.lessons.length - 1) {
      startLesson(currentStageIndex, currentLessonIndex + 1);
    } else if (currentStageIndex < STAGES.length - 1) {
      startLesson(currentStageIndex + 1, 0);
    } else {
      goToTrainingHome();
    }
  }

  function retryLesson(): void {
    startLesson(currentStageIndex, currentLessonIndex);
  }

  return {
    get screen() {
      return screen;
    },
    get currentStage() {
      return currentStage;
    },
    get currentLesson() {
      return currentLesson;
    },
    get exerciseIndex() {
      return exerciseIndex;
    },
    get exerciseCount() {
      return exerciseCount;
    },
    get prompt() {
      return prompt;
    },
    get cursorPos() {
      return cursorPos;
    },
    get charResults() {
      return charResults;
    },
    get correctCount() {
      return correctCount;
    },
    get errorCount() {
      return errorCount;
    },
    get currentStreak() {
      return currentStreak;
    },
    get bestStreak() {
      return bestStreak;
    },
    get accuracy() {
      return accuracy;
    },
    get wpm() {
      return wpm;
    },
    get nextKey() {
      return nextKey;
    },
    get isExerciseDone() {
      return isExerciseDone;
    },
    get lastPressedKey() {
      return lastPressedKey;
    },
    get lastPressCorrect() {
      return lastPressCorrect;
    },
    get streakMessage() {
      return streakMessage;
    },
    get completeData() {
      return completeData;
    },
    get keyboardMode() {
      return keyboardMode;
    },
    get currentUser() {
      return currentUser;
    },
    get persistence() {
      return persistence;
    },

    stages: STAGES,
    isLessonUnlocked,
    getLessonProgress,
    getKeyMastery,
    goToUserPicker,
    getUserNames,
    selectUser,
    createUser,
    goToTrainingHome,
    exitTraining,
    startLesson,
    handleKey,
    nextLesson,
    retryLesson,
    setKeyboardMode,
  };
}

export const training = createTrainingStore();
