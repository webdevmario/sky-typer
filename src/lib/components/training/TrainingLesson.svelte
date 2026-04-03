<script lang="ts">
  import { onMount } from 'svelte';
  import { training } from '../../stores/training.svelte';
  import { getWpmLabel } from '../../data/training-config';
  import TrainingKeyboard from './TrainingKeyboard.svelte';

  let wpmLabel = $derived(getWpmLabel(training.wpm));

  onMount(() => {
    function onKey(e: KeyboardEvent) {
      if (training.screen === 'lesson') {
        training.handleKey(e);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });
</script>

{#if training.screen === 'lesson'}
  <!-- HUD -->
  <header class="hud">
    <div class="hud-block">
      <div class="hud-label">Accuracy</div>
      <div
        class="hud-value"
        class:good={training.accuracy >= 85}
        class:warn={training.accuracy < 70}
      >
        {training.accuracy}%
      </div>
    </div>

    <div class="hud-center">
      <div class="hud-title">{training.currentLesson?.title ?? ''}</div>
      <div class="hud-sub">
        {training.currentStage?.emoji}
        Stage {training.currentStage?.id} - Exercise {training.exerciseIndex +
          1}/{training.exerciseCount}
      </div>
    </div>

    <div class="hud-right">
      <div class="hud-stat">
        <div class="hud-label">WPM</div>
        <div class="hud-value wpm">{training.wpm}</div>
      </div>
      <div class="hud-stat">
        <div class="hud-label">Streak</div>
        <div class="hud-value streak">{training.currentStreak}</div>
      </div>
    </div>
  </header>

  <button class="exit-btn" onclick={() => training.goToTrainingHome()}>← Exit</button>

  <!-- Streak message -->
  {#if training.streakMessage}
    <div class="streak-popup">{training.streakMessage}</div>
  {/if}

  <!-- Typing area -->
  <div class="lesson-area">
    <div class="wpm-badge">
      {wpmLabel.emoji}
      {wpmLabel.label}
    </div>

    <div class="prompt-container">
      <div class="prompt-text">
        {#each training.prompt.split('') as char, i (i)}
          <span
            class="prompt-char"
            class:correct={training.charResults[i] === 'correct'}
            class:error={training.charResults[i] === 'error'}
            class:cursor={i === training.cursorPos}
            class:space={char === ' '}>{char === ' ' ? '\u00A0' : char}</span
          >
        {/each}
      </div>
    </div>

    {#if training.isExerciseDone}
      <div class="exercise-done">Nice! Moving on...</div>
    {/if}
  </div>

  <!-- Keyboard -->
  <div class="keyboard-wrap">
    <TrainingKeyboard
      nextKey={training.nextKey}
      pressedKey={training.lastPressedKey}
      pressCorrect={training.lastPressCorrect}
      mode={training.keyboardMode}
    />
  </div>
{/if}

<style>
  .hud {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 64px;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 14px;
    background: linear-gradient(180deg, rgba(10, 0, 30, 0.85), rgba(10, 0, 30, 0.4));
    border-bottom: 1px solid var(--glass-border);
    backdrop-filter: blur(12px);
  }

  .hud-block {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .hud-label {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    opacity: 0.5;
  }
  .hud-value {
    font-family: 'Fredoka', sans-serif;
    font-size: 19px;
    font-weight: 700;
    color: var(--green);
  }
  .hud-value.good {
    color: var(--green);
  }
  .hud-value.warn {
    color: var(--orange);
  }
  .hud-value.wpm {
    color: var(--cyan);
  }
  .hud-value.streak {
    color: var(--gold);
  }

  .hud-center {
    text-align: center;
  }
  .hud-title {
    font-family: 'Lilita One', sans-serif;
    font-size: 16px;
    background: linear-gradient(135deg, var(--cyan), var(--green));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hud-sub {
    font-family: 'Fredoka', sans-serif;
    font-size: 10px;
    opacity: 0.5;
  }

  .hud-right {
    display: flex;
    gap: 14px;
    align-items: center;
  }
  .hud-stat {
    text-align: center;
    min-width: 48px;
  }

  .exit-btn {
    position: fixed;
    top: 72px;
    left: 12px;
    z-index: 110;
    padding: 6px 14px;
    font-family: 'Fredoka', sans-serif;
    font-size: 12px;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--glass-border);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    backdrop-filter: blur(8px);
    transition: all 0.2s;
  }
  .exit-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--txt);
  }

  .streak-popup {
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 150;
    padding: 8px 24px;
    border-radius: 20px;
    background: rgba(255, 215, 0, 0.15);
    border: 1px solid rgba(255, 215, 0, 0.3);
    font-family: 'Fredoka', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: var(--gold);
    animation: streak-in 0.3s ease-out;
  }

  @keyframes streak-in {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-10px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0) scale(1);
    }
  }

  .lesson-area {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 250px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .wpm-badge {
    font-family: 'Fredoka', sans-serif;
    font-size: 12px;
    font-weight: 600;
    opacity: 0.4;
    margin-bottom: 24px;
    letter-spacing: 1px;
  }

  .prompt-container {
    max-width: 600px;
    width: 100%;
    text-align: center;
    padding: 24px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
  }

  .prompt-text {
    font-family: 'Fredoka', sans-serif;
    font-size: 28px;
    font-weight: 600;
    letter-spacing: 3px;
    line-height: 1.6;
    word-break: break-all;
  }

  .prompt-char {
    transition: color 0.1s;
    color: rgba(255, 255, 255, 0.35);
  }
  .prompt-char.correct {
    color: var(--green);
  }
  .prompt-char.error {
    color: #ff4444;
    text-decoration: underline;
  }
  .prompt-char.cursor {
    border-bottom: 3px solid var(--cyan);
    color: #fff;
  }
  .prompt-char.space.cursor {
    background: rgba(0, 229, 255, 0.15);
    border-radius: 2px;
  }

  .exercise-done {
    position: absolute;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Fredoka', sans-serif;
    font-size: 14px;
    color: var(--green);
    opacity: 0.8;
    animation: fade-in 0.3s;
    white-space: nowrap;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 0.8;
    }
  }

  .keyboard-wrap {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
  }

  @media (max-width: 600px) {
    .prompt-text {
      font-size: 22px;
      letter-spacing: 2px;
    }
    .lesson-area {
      bottom: 200px;
    }
  }
</style>
