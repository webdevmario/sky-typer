<script lang="ts">
  import { game } from '../stores/game.svelte';
  import GradeDisplay from './GradeDisplay.svelte';

  function handleNext() {
    if (game.levelUpData?.isLastLevel) {
      game.showWinScreen();
    } else {
      game.nextLevel();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && game.screen === 'levelUp') handleNext();
  }

  $effect(() => {
    if (game.screen === 'levelUp') {
      document.addEventListener('keydown', handleKeydown);
      return () => document.removeEventListener('keydown', handleKeydown);
    }
  });

  let gradeDetail = $derived(() => {
    if (!game.levelUpData) return '';
    const d = game.levelUpData;
    const parts = [`${d.wordsDone}/${d.wordsSpawned} words`];
    if (d.misses > 0) parts.push(`${d.misses} missed`);
    if (d.typos > 0) parts.push(`${d.typos} typos`);
    parts.push(`⚡${d.avgSpeed} avg speed bonus`);
    return parts.join(', ');
  });
</script>

<div class="overlay" class:visible={game.screen === 'levelUp'}>
  {#if game.levelUpData}
    <div class="card">
      <div class="emoji-hero">{game.levelUpData.badge}</div>
      <h2 class="title gold">{game.levelUpData.levelName} Complete!</h2>

      <GradeDisplay grade={game.levelUpData.grade} detail={gradeDetail()} />

      <div class="stats">
        <div class="stat">
          <div class="stat-value">{game.levelUpData.wordsDone}</div>
          <div class="stat-label">Words</div>
        </div>
        <div class="stat">
          <div class="stat-value">{game.score.toLocaleString()}</div>
          <div class="stat-label">Score</div>
        </div>
        <div class="stat">
          <div class="stat-value">{game.levelUpData.timeRemaining}s</div>
          <div class="stat-label">Time Left</div>
        </div>
        <div class="stat">
          <div class="stat-value">⚡{game.levelUpData.speedBonus}</div>
          <div class="stat-label">Speed Bonus</div>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-primary" onclick={handleNext}>
          {game.levelUpData.isLastLevel ? '🎉 See Results' : '🚀 Next Level'}
        </button>
        <button class="btn btn-ghost btn-sm" onclick={() => game.restart()}>🔄 Restart</button>
        <button class="btn btn-ghost btn-sm" onclick={() => game.goHome()}>🏠 Home</button>
      </div>
      <div class="hint">Press ENTER to continue</div>
    </div>
  {/if}
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(10, 0, 30, 0.92);
    backdrop-filter: blur(20px);
    opacity: 0;
    transition: opacity 0.5s;
    pointer-events: none;
  }
  .overlay.visible {
    opacity: 1;
    pointer-events: all;
  }

  .card {
    text-align: center;
    max-width: 600px;
    width: 92%;
    padding: 32px 24px;
    background: linear-gradient(135deg, rgba(45, 27, 105, 0.8), rgba(74, 44, 138, 0.6));
    border: 1px solid var(--glass-border);
    border-radius: 28px;
    box-shadow: 0 20px 80px rgba(0, 0, 0, 0.5);
    transform: scale(0.9) translateY(20px);
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .overlay.visible .card {
    transform: scale(1) translateY(0);
  }

  .emoji-hero {
    font-size: 48px;
    margin-bottom: 8px;
  }
  .title {
    font-family: 'Lilita One', sans-serif;
    font-size: 34px;
    margin-bottom: 6px;
  }
  .title.gold {
    color: var(--gold);
  }

  .stats {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 18px;
    flex-wrap: wrap;
  }
  .stat {
    text-align: center;
  }
  .stat-value {
    font-family: 'Fredoka', sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: var(--cyan);
  }
  .stat-label {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    opacity: 0.5;
  }

  .actions {
    display: flex;
    gap: 8px;
    justify-content: center;
    flex-wrap: wrap;
  }
  .hint {
    font-size: 10px;
    opacity: 0.3;
    margin-top: 12px;
    letter-spacing: 1px;
  }
</style>
