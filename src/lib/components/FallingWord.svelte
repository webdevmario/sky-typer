<script>
  import { onMount } from 'svelte';
  import { game } from '../stores/game.svelte.js';

  let { obj, gameAreaEl } = $props();
  let el = $state(null);

  onMount(() => {
    if (!el || !gameAreaEl) return;

    let rafId;
    function checkBounds() {
      if (!game.fallingObjects.find(o => o.id === obj.id)) return;
      if (!el || !gameAreaEl) return;
      const r = el.getBoundingClientRect();
      const gb = gameAreaEl.getBoundingClientRect();
      if (r.top > gb.bottom) {
        game.wordMissed(obj.id);
        return;
      }
      rafId = requestAnimationFrame(checkBounds);
    }
    rafId = requestAnimationFrame(checkBounds);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  });

  let isActive = $derived(game.currentTarget?.id === obj.id);
</script>

<div
  bind:this={el}
  class="falling-obj"
  class:active={isActive}
  style:--fd="{obj.fallDuration}s"
  style:left="{obj.leftPos}%"
>
  <div class="obj-icon">{obj.icon}</div>
  <div class="word-label">
    <span class="typed">{obj.word.substring(0, obj.typed)}</span><span class="remaining">{obj.word.substring(obj.typed)}</span>
  </div>
</div>

<style>
  .falling-obj {
    position: absolute; display: flex; flex-direction: column;
    align-items: center; gap: 6px;
    animation: fall var(--fd) linear forwards;
    z-index: 20; transition: transform 0.1s;
  }
  .falling-obj.active { transform: scale(1.1); }
  .falling-obj.active .obj-icon {
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
    border-color: var(--gold);
  }

  @keyframes fall {
    0% { top: -120px; }
    100% { top: calc(100% + 120px); }
  }

  .obj-icon {
    width: 58px; height: 58px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 28px;
    background: var(--glass); border: 2px solid var(--glass-border);
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    transition: all 0.2s;
  }

  .word-label {
    font-family: 'Fredoka', sans-serif; font-size: 15px; font-weight: 600;
    padding: 4px 14px;
    background: rgba(0, 0, 0, 0.5); border-radius: 20px;
    border: 1px solid var(--glass-border);
    white-space: nowrap; letter-spacing: 1.5px;
    backdrop-filter: blur(6px);
  }
  .typed { color: var(--green); }
  .remaining { color: rgba(255, 255, 255, 0.9); }

  @media (max-width: 600px) {
    .obj-icon { width: 46px; height: 46px; font-size: 22px; border-radius: 12px; }
    .word-label { font-size: 13px; }
  }
</style>
