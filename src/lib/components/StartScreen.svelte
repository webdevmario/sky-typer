<script lang="ts">
  import { game } from '../stores/game.svelte';
  import { getHighScores, clearHighScores, escapeHtml } from '../utils/helpers';

  let highScores = $state(getHighScores());
  let nameValue = $state('');

  function refreshScores() {
    highScores = getHighScores();
  }

  function handleNameInput(e: Event) {
    nameValue = (e.target as HTMLInputElement).value;
    game.setPlayerName(nameValue);
  }

  function handleClear() {
    clearHighScores();
    refreshScores();
  }

  function handleStart() {
    if (nameValue.trim().length > 0) game.startGame();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && nameValue.trim().length > 0) game.startGame();
  }

  let canStart = $derived(nameValue.trim().length > 0);
</script>

<div class="overlay" class:visible={game.screen === 'start'}>
  <div class="card">
    <div class="emoji-hero">🌠</div>
    <h1 class="title">SKY TYPER</h1>
    <p class="subtitle">
      Type the falling words before they escape!<br />5 levels of cosmic typing adventure.
    </p>

    <div class="form">
      <div class="field">
        <div class="label">Your Name</div>
        <input
          class="input-field"
          type="text"
          placeholder="Enter your name..."
          maxlength="12"
          value={nameValue}
          oninput={handleNameInput}
          onkeydown={handleKeydown}
          autofocus
        />
      </div>

      <div class="field">
        <div class="label">Difficulty</div>
        <div class="toggle-row">
          <button
            class="toggle-btn"
            class:selected={game.difficulty === 'easy'}
            onclick={() => game.setDifficulty('easy')}>🌱 Easy</button
          >
          <button
            class="toggle-btn"
            class:selected={game.difficulty === 'normal'}
            onclick={() => game.setDifficulty('normal')}>⚡ Normal</button
          >
          <button
            class="toggle-btn"
            class:selected={game.difficulty === 'hard'}
            onclick={() => game.setDifficulty('hard')}>🔥 Hard</button
          >
        </div>
      </div>

      <div class="field">
        <div class="label">Time Per Level</div>
        <div class="time-row">
          <button class="time-btn" onclick={() => game.setTimePerLevel(game.timePerLevel - 5)}
            >−</button
          >
          <div class="time-display">{game.timePerLevel}s</div>
          <button class="time-btn" onclick={() => game.setTimePerLevel(game.timePerLevel + 5)}
            >+</button
          >
        </div>
      </div>
    </div>

    <div class="start-actions">
      <button class="btn btn-primary" disabled={!canStart} onclick={handleStart}>🎮 Start</button>
    </div>
    <div class="hint" class:ready={canStart}>
      {canStart ? 'Press ENTER to start' : 'Enter your name to begin'}
    </div>

    <div class="divider"></div>

    <div class="scores-section">
      <div class="label center">🏆 High Scores</div>
      {#if highScores.length === 0}
        <div class="no-scores">No scores yet — be the first!</div>
      {:else}
        <div class="score-list">
          {#each highScores.slice(0, 5) as hs, i (hs.d)}
            <div class="score-row" class:odd={i % 2 === 1}>
              <div class="rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</div>
              <div class="score-info">
                <div class="score-name">{escapeHtml(hs.n)}</div>
                {#if hs.t}<div class="score-meta">{escapeHtml(hs.t)}</div>{/if}
              </div>
              <div class="score-val">{hs.s.toLocaleString()}</div>
            </div>
          {/each}
        </div>
      {/if}
      <div class="secondary-actions">
        <button class="btn btn-ghost btn-sm" onclick={() => game.openCustomWords()}
          >📝 Custom Words</button
        >
        <button class="btn btn-ghost btn-sm" onclick={handleClear}>🗑️ Clear Scores</button>
      </div>
    </div>
  </div>
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
    max-width: 480px;
    width: 92%;
    padding: 32px 28px;
    background: linear-gradient(135deg, rgba(45, 27, 105, 0.8), rgba(74, 44, 138, 0.6));
    border: 1px solid var(--glass-border);
    border-radius: 28px;
    box-shadow: 0 20px 80px rgba(0, 0, 0, 0.5);
    transform: scale(0.9) translateY(20px);
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    max-height: 92vh;
    overflow-y: auto;
  }
  .card::-webkit-scrollbar {
    width: 6px;
  }
  .card::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
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
    background: linear-gradient(135deg, var(--gold), var(--pink), var(--cyan));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .subtitle {
    font-family: 'Fredoka', sans-serif;
    font-size: 14px;
    opacity: 0.7;
    margin-bottom: 20px;
    line-height: 1.5;
  }

  .form {
    text-align: left;
    margin: 0 auto;
    max-width: 380px;
  }
  .field {
    margin-bottom: 16px;
  }
  .label {
    display: block;
    font-family: 'Fredoka', sans-serif;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    opacity: 0.6;
    margin-bottom: 6px;
  }
  .label.center {
    text-align: center;
  }

  .input-field {
    width: 100%;
    padding: 10px 14px;
    font-family: 'Fredoka', sans-serif;
    font-size: 16px;
    font-weight: 600;
    text-align: center;
    letter-spacing: 2px;
    text-transform: uppercase;
    background: rgba(255, 255, 255, 0.06);
    border: 2px solid var(--glass-border);
    border-radius: 12px;
    color: #fff;
    outline: none;
    transition: all 0.2s;
  }
  .input-field:focus {
    border-color: var(--cyan);
    background: rgba(255, 255, 255, 0.1);
  }
  .input-field::placeholder {
    text-transform: none;
    letter-spacing: 1px;
    color: rgba(255, 255, 255, 0.25);
    font-size: 14px;
  }

  .toggle-row {
    display: flex;
    gap: 8px;
  }
  .toggle-btn {
    flex: 1;
    padding: 9px 6px;
    text-align: center;
    font-family: 'Fredoka', sans-serif;
    font-size: 13px;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.04);
    border: 2px solid var(--glass-border);
    border-radius: 12px;
    color: var(--txt);
    cursor: pointer;
    transition: all 0.2s;
  }
  .toggle-btn:hover {
    background: rgba(255, 255, 255, 0.08);
  }
  .toggle-btn.selected {
    border-color: var(--cyan);
    background: rgba(0, 229, 255, 0.12);
    color: var(--cyan);
    box-shadow: 0 0 12px rgba(0, 229, 255, 0.15);
  }

  .time-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
  }
  .time-btn {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 2px solid var(--glass-border);
    background: var(--glass);
    color: #fff;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    font-family: 'Fredoka', sans-serif;
  }
  .time-btn:hover {
    border-color: var(--cyan);
    background: rgba(0, 229, 255, 0.12);
  }
  .time-display {
    font-family: 'Fredoka', sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: var(--orange);
    min-width: 50px;
    text-align: center;
  }

  .start-actions {
    margin-top: 20px;
  }
  .hint {
    font-size: 10px;
    opacity: 0.6;
    margin-top: 10px;
    letter-spacing: 1px;
    color: var(--orange);
    transition: all 0.2s;
  }
  .hint.ready {
    color: var(--txt);
    opacity: 0.3;
  }

  .divider {
    border-top: 1px solid var(--glass-border);
    margin: 18px auto 14px;
    max-width: 380px;
  }

  .scores-section {
    margin: 0 auto;
    max-width: 380px;
  }
  .no-scores {
    font-size: 12px;
    opacity: 0.4;
    padding: 12px;
    text-align: center;
  }
  .score-list {
    margin-bottom: 10px;
  }
  .score-row {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    gap: 10px;
    border-radius: 10px;
  }
  .score-row.odd {
    background: rgba(255, 255, 255, 0.03);
  }
  .rank {
    font-family: 'Fredoka', sans-serif;
    font-size: 14px;
    font-weight: 700;
    width: 26px;
    text-align: center;
    flex-shrink: 0;
  }
  .score-info {
    flex: 1;
    text-align: left;
    min-width: 0;
  }
  .score-name {
    font-family: 'Fredoka', sans-serif;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .score-meta {
    font-family: 'Nunito', sans-serif;
    font-size: 10px;
    opacity: 0.45;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .score-val {
    font-family: 'Fredoka', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: var(--gold);
    flex-shrink: 0;
  }

  .secondary-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-top: 10px;
  }
</style>
