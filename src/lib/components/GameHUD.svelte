<script>
  import { game } from '../stores/game.svelte.js';

  let timeStr = $derived(() => {
    const m = Math.floor(game.timeLeft / 60);
    const s = game.timeLeft % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  });
  let isDanger = $derived(game.timeLeft <= 10 && game.timeLeft > 0);
</script>

{#if game.screen === 'game' || game.screen === 'levelTransition'}
  <header class="hud">
    <div class="hud-block">
      <div class="hud-label">Score</div>
      <div class="hud-value score">{game.score.toLocaleString()}</div>
    </div>

    <div class="hud-center">
      <div class="hud-title">SKY TYPER</div>
      <div class="hud-player">{game.playerName}</div>
    </div>

    <div class="hud-right">
      <div class="hud-stat">
        <div class="hud-label">Lives</div>
        <div class="hud-value lives">
          ❤️ <span class="lives-count">× {game.livesRemaining}</span>
        </div>
      </div>
      <div class="hud-stat">
        <div class="hud-label">Level</div>
        <div class="hud-value level">{game.level || '-'}</div>
      </div>
      <div class="hud-stat">
        <div class="hud-label">Time</div>
        <div class="hud-value time" class:danger={isDanger}>{timeStr()}</div>
      </div>
    </div>
  </header>

  <button class="exit-btn" onclick={() => game.goHome()}>✕ Exit</button>
{/if}

<style>
  .hud {
    position: fixed; top: 0; left: 0; right: 0; height: 64px; z-index: 100;
    display: flex; align-items: center; justify-content: space-between; padding: 0 14px;
    background: linear-gradient(180deg, rgba(10, 0, 30, 0.85), rgba(10, 0, 30, 0.4));
    border-bottom: 1px solid var(--glass-border); backdrop-filter: blur(12px);
  }
  .hud-block { display: flex; align-items: center; gap: 8px; }
  .hud-label {
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1.5px; opacity: 0.5;
  }
  .hud-value {
    font-family: 'Fredoka', sans-serif; font-size: 19px; font-weight: 700;
  }
  .score { color: var(--gold); }
  .level { color: var(--cyan); }
  .time { color: var(--orange); font-variant-numeric: tabular-nums; }
  .time.danger { color: #ff4444; animation: pulse 0.5s ease-in-out infinite alternate; }
  @keyframes pulse { to { opacity: 0.5; } }

  .lives { display: flex; align-items: center; gap: 2px; font-size: 14px; }
  .lives-count {
    font-family: 'Fredoka', sans-serif; font-size: 14px; font-weight: 600; opacity: 0.8;
  }

  .hud-center { text-align: center; }
  .hud-title {
    font-family: 'Lilita One', sans-serif; font-size: 20px;
    background: linear-gradient(135deg, var(--gold), var(--pink), var(--cyan));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .hud-player {
    font-family: 'Fredoka', sans-serif; font-size: 10px; font-weight: 600;
    color: var(--gold); letter-spacing: 1px; opacity: 0.7;
  }

  .hud-right { display: flex; gap: 12px; align-items: center; }
  .hud-stat { text-align: center; min-width: 48px; }

  .exit-btn {
    position: fixed; top: 72px; right: 12px; z-index: 110;
    padding: 6px 14px; font-family: 'Fredoka', sans-serif; font-size: 12px; font-weight: 600;
    background: rgba(255, 255, 255, 0.06); border: 1px solid var(--glass-border);
    border-radius: 10px; color: rgba(255, 255, 255, 0.4); cursor: pointer;
    backdrop-filter: blur(8px); transition: all 0.2s; letter-spacing: 0.5px;
  }
  .exit-btn:hover {
    background: rgba(255, 68, 68, 0.15); border-color: rgba(255, 68, 68, 0.4); color: #ff8888;
  }
</style>
