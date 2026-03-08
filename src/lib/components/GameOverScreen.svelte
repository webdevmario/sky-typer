<script>
  import { game } from '../stores/game.svelte.js';
  import GradeDisplay from './GradeDisplay.svelte';

  function handleKeydown(e) {
    if (e.key === 'Enter' && game.screen === 'gameOver') game.restart();
  }

  $effect(() => {
    if (game.screen === 'gameOver') {
      document.addEventListener('keydown', handleKeydown);
      return () => document.removeEventListener('keydown', handleKeydown);
    }
  });
</script>

<div class="overlay" class:visible={game.screen === 'gameOver'}>
  {#if game.gameOverData}
    <div class="card">
      <div class="emoji-hero">💥</div>
      <h2 class="title gameover">GAME OVER</h2>
      <p class="message">{game.gameOverData.message}</p>

      <GradeDisplay
        grade={game.gameOverData.grade}
        detail="Level {game.gameOverData.levelReached}, {game.gameOverData.wordsDone} words"
      />

      <div class="stats">
        <div class="stat"><div class="stat-value">{game.gameOverData.wordsDone}</div><div class="stat-label">Words</div></div>
        <div class="stat"><div class="stat-value">{game.gameOverData.totalScore.toLocaleString()}</div><div class="stat-label">Score</div></div>
        <div class="stat"><div class="stat-value">Lvl {game.gameOverData.levelReached}</div><div class="stat-label">Reached</div></div>
      </div>

      <div class="actions">
        <button class="btn btn-danger" onclick={() => game.restart()}>🔄 Try Again</button>
        <button class="btn btn-ghost" onclick={() => game.goHome()}>🏠 Home</button>
      </div>
      <div class="hint">Press ENTER to retry</div>
    </div>
  {/if}
</div>

<style>
  .overlay {
    position: fixed; inset: 0; z-index: 200;
    display: flex; align-items: center; justify-content: center;
    background: rgba(10, 0, 30, 0.92); backdrop-filter: blur(20px);
    opacity: 0; transition: opacity 0.5s; pointer-events: none;
  }
  .overlay.visible { opacity: 1; pointer-events: all; }

  .card {
    text-align: center; max-width: 600px; width: 92%; padding: 32px 24px;
    background: linear-gradient(135deg, rgba(45, 27, 105, 0.8), rgba(74, 44, 138, 0.6));
    border: 1px solid var(--glass-border); border-radius: 28px;
    box-shadow: 0 20px 80px rgba(0, 0, 0, 0.5);
    transform: scale(0.9) translateY(20px); transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .overlay.visible .card { transform: scale(1) translateY(0); }

  .emoji-hero { font-size: 48px; margin-bottom: 8px; }
  .title { font-family: 'Lilita One', sans-serif; font-size: 34px; margin-bottom: 6px; }
  .title.gameover { color: #ff4444; text-shadow: 0 0 30px rgba(255, 68, 68, 0.4); }
  .message {
    font-family: 'Fredoka', sans-serif; font-size: 14px; opacity: 0.7;
    margin-bottom: 16px; line-height: 1.5;
  }

  .stats { display: flex; justify-content: center; gap: 20px; margin-bottom: 18px; flex-wrap: wrap; }
  .stat { text-align: center; }
  .stat-value { font-family: 'Fredoka', sans-serif; font-size: 22px; font-weight: 700; color: var(--cyan); }
  .stat-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.5; }

  .actions { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
  .hint { font-size: 10px; opacity: 0.3; margin-top: 12px; letter-spacing: 1px; }
</style>
