<script lang="ts">
  import { game } from '../stores/game.svelte';
  import { training } from '../stores/training.svelte';
</script>

<div class="overlay" class:visible={game.screen === 'landing' && training.screen === 'inactive'}>
  <div class="card">
    <div class="emoji-hero">🌠</div>
    <h1 class="title">SKY TYPER</h1>
    <p class="subtitle">Type your way through the cosmos!</p>

    <div class="choices">
      <button class="choice-btn play" onclick={() => game.goHome()}>
        <span class="choice-icon">🎮</span>
        <span class="choice-label">Play</span>
        <span class="choice-desc">Type falling words before they escape</span>
      </button>

      <button class="choice-btn train" onclick={() => training.goToUserPicker()}>
        <span class="choice-icon">🎓</span>
        <span class="choice-label">Train</span>
        <span class="choice-desc">Learn to type at your own pace</span>
      </button>
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
    max-width: 460px;
    width: 92%;
    padding: 40px 32px;
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
    font-size: 56px;
    margin-bottom: 10px;
  }
  .title {
    font-family: 'Lilita One', sans-serif;
    font-size: 40px;
    margin-bottom: 6px;
    background: linear-gradient(135deg, var(--gold), var(--pink), var(--cyan));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .subtitle {
    font-family: 'Fredoka', sans-serif;
    font-size: 14px;
    opacity: 0.6;
    margin-bottom: 28px;
  }

  .choices {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 320px;
    margin: 0 auto;
  }

  .choice-btn {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    padding: 16px 20px;
    border-radius: 16px;
    border: 2px solid var(--glass-border);
    background: rgba(255, 255, 255, 0.04);
    color: var(--txt);
    cursor: pointer;
    transition: all 0.25s;
    text-align: left;
  }
  .choice-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
  .choice-btn.play:hover {
    border-color: var(--gold);
    box-shadow: 0 8px 24px rgba(255, 215, 0, 0.15);
  }
  .choice-btn.train:hover {
    border-color: var(--cyan);
    box-shadow: 0 8px 24px rgba(0, 229, 255, 0.15);
  }

  .choice-icon {
    font-size: 32px;
    flex-shrink: 0;
  }
  .choice-label {
    font-family: 'Lilita One', sans-serif;
    font-size: 22px;
    display: block;
  }
  .choice-btn.play .choice-label {
    color: var(--gold);
  }
  .choice-btn.train .choice-label {
    color: var(--cyan);
  }
  .choice-desc {
    font-family: 'Fredoka', sans-serif;
    font-size: 11px;
    opacity: 0.5;
    display: block;
    margin-top: 2px;
  }

  @media (max-width: 400px) {
    .title {
      font-size: 32px;
    }
    .choice-btn {
      padding: 14px 16px;
    }
  }
</style>
