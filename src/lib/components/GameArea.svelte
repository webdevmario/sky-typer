<script>
  import { onMount } from 'svelte';
  import { game } from '../stores/game.svelte.js';
  import FallingWord from './FallingWord.svelte';

  let gameAreaEl = $state(null);
  let inputEl = $state(null);

  // Focus management
  onMount(() => {
    const focusInterval = setInterval(() => {
      if (game.running && inputEl && document.activeElement !== inputEl) {
        inputEl.focus();
      }
    }, 300);

    function handleGlobalKeydown(e) {
      if (game.running && inputEl && document.activeElement !== inputEl) {
        inputEl.focus();
      }
    }
    function handleVisibility() {
      if (game.running && !document.hidden && inputEl) inputEl.focus();
    }
    function handleClick() {
      if (game.running && inputEl) inputEl.focus();
    }

    document.addEventListener('keydown', handleGlobalKeydown);
    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('click', handleClick);

    return () => {
      clearInterval(focusInterval);
      document.removeEventListener('keydown', handleGlobalKeydown);
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('click', handleClick);
    };
  });

  function handleKeydown(e) { game.handleKeydown(e); }
  function handleInput(e) { game.handleInput(e.target.value); }

  let isGameScreen = $derived(game.screen === 'game');
</script>

{#if isGameScreen || game.screen === 'levelTransition'}
  <div class="game-area" bind:this={gameAreaEl}>
    {#each game.fallingObjects as obj (obj.id)}
      <FallingWord {obj} {gameAreaEl} />
    {/each}
  </div>

  <div class="input-area" class:visible={isGameScreen}>
    <input
      bind:this={inputEl}
      type="text"
      class="typing-input"
      class:error={game.inputError}
      placeholder="type the words..."
      autocomplete="off"
      autocapitalize="off"
      spellcheck="false"
      value={game.inputValue}
      onkeydown={handleKeydown}
      oninput={handleInput}
    />
  </div>
{/if}

<style>
  .game-area {
    position: fixed; top: 64px; left: 0; right: 0; bottom: 80px;
    z-index: 10; overflow: hidden;
  }

  .input-area {
    position: fixed; bottom: 0; left: 0; right: 0; height: 80px; z-index: 100;
    display: none; align-items: center; justify-content: center; padding: 0 24px;
    background: linear-gradient(0deg, rgba(10, 0, 30, 0.9), rgba(10, 0, 30, 0.5));
    border-top: 1px solid var(--glass-border); backdrop-filter: blur(12px);
  }
  .input-area.visible { display: flex; }

  .typing-input {
    width: 100%; max-width: 500px; padding: 12px 24px;
    font-family: 'Fredoka', sans-serif; font-size: 22px; font-weight: 600;
    text-align: center; letter-spacing: 3px;
    background: rgba(255, 255, 255, 0.06); border: 2px solid var(--glass-border);
    border-radius: 16px; color: #fff; outline: none; transition: all 0.2s;
  }
  .typing-input:focus {
    border-color: var(--cyan); background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 20px rgba(0, 229, 255, 0.2);
  }
  .typing-input::placeholder { color: rgba(255, 255, 255, 0.25); letter-spacing: 2px; }
  .typing-input.error {
    border-color: #ff4444; box-shadow: 0 0 15px rgba(255, 68, 68, 0.3);
  }

  @media (max-width: 600px) {
    .typing-input { font-size: 18px; }
  }
</style>
