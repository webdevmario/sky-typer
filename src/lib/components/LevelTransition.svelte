<script lang="ts">
  import { game } from '../stores/game.svelte';
</script>

<div class="level-transition" class:visible={game.screen === 'levelTransition'}>
  <div class="lt-content">
    <div class="lt-level">LEVEL {game.level}</div>
    <div class="lt-name">{game.currentLevelName}</div>
    <div class="lt-badge">{game.currentLevelBadge}</div>
  </div>
</div>

<style>
  .level-transition {
    position: fixed;
    inset: 0;
    z-index: 300;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(10, 0, 30, 0.95);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.4s;
  }
  .level-transition.visible {
    opacity: 1;
    pointer-events: all;
  }

  .lt-content {
    text-align: center;
    animation: pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes pop {
    0% {
      transform: scale(0.5);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  .lt-level {
    font-family: 'Lilita One', sans-serif;
    font-size: 70px;
    background: linear-gradient(135deg, var(--gold), var(--pink));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .lt-name {
    font-family: 'Fredoka', sans-serif;
    font-size: 20px;
    color: var(--cyan);
    margin-top: 4px;
  }
  .lt-badge {
    margin-top: 12px;
    font-size: 42px;
  }
</style>
