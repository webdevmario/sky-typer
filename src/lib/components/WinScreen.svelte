<script lang="ts">
  import { game } from '../stores/game.svelte';
  import GradeDisplay from './GradeDisplay.svelte';

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && game.screen === 'win') game.restart();
  }
  $effect(() => {
    if (game.screen === 'win') {
      document.addEventListener('keydown', handleKeydown);
      return () => document.removeEventListener('keydown', handleKeydown);
    }
  });
</script>

<div class="overlay" class:visible={game.screen === 'win'}>
  {#if game.winData}
    <div class="card wide">
      <div class="emoji-hero">🎉</div>
      <h2 class="title champ">CHAMPION!</h2>
      <p class="message">{game.winData.playerName}, you conquered all 5 levels!</p>

      <GradeDisplay grade={game.winData.overallGrade} detail={game.winData.breakdown} />

      <div class="word-review">
        {#each game.winData.words as word (word.w)}
          <div class="word-entry">
            <div class="we-icon">{word.i}</div>
            <div class="we-text">
              <div class="we-word">{word.w}</div>
              <div class="we-def">{word.d}</div>
            </div>
            <div class="we-pts">
              +{word.p}{#if word.sb > 0}
                <span class="speed-bonus">⚡{word.sb}</span>{/if}
            </div>
          </div>
        {/each}
      </div>

      <div class="stats">
        <div class="stat">
          <div class="stat-value">{game.winData.words.length}</div>
          <div class="stat-label">Words</div>
        </div>
        <div class="stat">
          <div class="stat-value">{game.winData.totalScore.toLocaleString()}</div>
          <div class="stat-label">Score</div>
        </div>
        <div class="stat">
          <div class="stat-value">⚡{game.winData.totalSpeedBonus}</div>
          <div class="stat-label">Speed Bonus</div>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-primary" onclick={() => game.restart()}>🔄 Play Again</button>
        <button class="btn btn-ghost" onclick={() => game.goHome()}>🏠 Home</button>
      </div>
      <div class="hint">Press ENTER to play again</div>
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
  .card.wide {
    max-width: 720px;
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
  .title.champ {
    background: linear-gradient(135deg, var(--gold), var(--green));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .message {
    font-family: 'Fredoka', sans-serif;
    font-size: 14px;
    opacity: 0.7;
    margin-bottom: 16px;
    line-height: 1.5;
  }

  .word-review {
    display: grid;
    gap: 7px;
    margin: 12px 0 18px;
    text-align: left;
    max-height: 34vh;
    overflow-y: auto;
    padding-right: 6px;
  }
  .word-review::-webkit-scrollbar {
    width: 6px;
  }
  .word-review::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
  .word-entry {
    padding: 9px 12px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    display: flex;
    align-items: flex-start;
    gap: 9px;
  }
  .we-icon {
    font-size: 18px;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .we-text {
    flex: 1;
  }
  .we-word {
    font-family: 'Fredoka', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: var(--green);
    margin-bottom: 1px;
  }
  .we-def {
    font-size: 11px;
    opacity: 0.55;
    line-height: 1.4;
  }
  .we-pts {
    font-family: 'Fredoka', sans-serif;
    font-size: 11px;
    color: var(--gold);
    opacity: 0.7;
    flex-shrink: 0;
    align-self: center;
  }
  .speed-bonus {
    color: var(--cyan);
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
