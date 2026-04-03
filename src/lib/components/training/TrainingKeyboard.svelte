<script lang="ts">
  import { KEYBOARD_ROWS, FINGER_MAP, FINGER_COLORS } from '../../data/training-lessons';

  let {
    nextKey = '',
    pressedKey = '',
    pressCorrect = true,
    mode = 'always' as 'always' | 'hidden',
  } = $props();

  const HOME_KEYS = new Set(['f', 'j']);

  function fingerColor(key: string): string {
    const finger = FINGER_MAP[key.toLowerCase()];
    return finger ? FINGER_COLORS[finger] || '#555' : '#555';
  }

  function keyClass(key: string): string {
    const classes: string[] = ['key'];
    if (key === nextKey) classes.push('next');
    if (key === pressedKey && pressCorrect) classes.push('correct-flash');
    if (key === pressedKey && !pressCorrect) classes.push('error-flash');
    if (HOME_KEYS.has(key)) classes.push('home-key');
    return classes.join(' ');
  }
</script>

{#if mode !== 'hidden'}
  <div class="keyboard">
    {#each KEYBOARD_ROWS as row, rowIdx (rowIdx)}
      <div class="kb-row" class:row-middle={rowIdx === 1} class:row-bottom={rowIdx === 2}>
        {#each row as key (key)}
          <div class={keyClass(key)} style="--finger-color: {fingerColor(key)}">
            <span class="key-label">{key}</span>
            {#if HOME_KEYS.has(key)}
              <span class="bump"></span>
            {/if}
          </div>
        {/each}
      </div>
    {/each}
    <div class="kb-row">
      <div
        class="key space-key"
        class:next={nextKey === ' '}
        class:correct-flash={pressedKey === ' ' && pressCorrect}
        class:error-flash={pressedKey === ' ' && !pressCorrect}
        style="--finger-color: {FINGER_COLORS['thumb']}"
      >
        <span class="key-label">space</span>
      </div>
    </div>
  </div>
{/if}

<style>
  .keyboard {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 12px;
    background: rgba(10, 0, 30, 0.6);
    border-top: 1px solid var(--glass-border);
    backdrop-filter: blur(12px);
    transition: opacity 0.5s;
  }
  .keyboard.faded {
    opacity: 0;
    pointer-events: none;
  }

  .kb-row {
    display: flex;
    gap: 4px;
    justify-content: center;
  }
  .kb-row.row-middle {
    padding-left: 20px;
  }
  .kb-row.row-bottom {
    padding-left: 44px;
  }

  .key {
    position: relative;
    width: 42px;
    height: 42px;
    border-radius: 8px;
    border: 2px solid var(--glass-border);
    background: color-mix(in srgb, var(--finger-color) 12%, rgba(255, 255, 255, 0.04));
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    flex-shrink: 0;
  }

  .key-label {
    font-family: 'Fredoka', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    transition: opacity 0.3s;
    user-select: none;
  }

  .key.home-key {
    border-bottom-width: 3px;
  }

  .bump {
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    width: 10px;
    height: 2px;
    border-radius: 1px;
    background: rgba(255, 255, 255, 0.3);
  }

  .key.next {
    border-color: var(--cyan);
    background: color-mix(in srgb, var(--finger-color) 25%, rgba(0, 229, 255, 0.15));
    box-shadow: 0 0 16px rgba(0, 229, 255, 0.3);
    animation: pulse-key 1s ease-in-out infinite alternate;
  }
  .key.next .key-label {
    color: #fff;
    opacity: 1;
  }

  .key.correct-flash {
    border-color: var(--green);
    background: rgba(76, 175, 80, 0.3);
  }
  .key.correct-flash .key-label {
    color: var(--green);
  }

  .key.error-flash {
    border-color: #ff4444;
    background: rgba(255, 68, 68, 0.2);
  }
  .key.error-flash .key-label {
    color: #ff4444;
  }

  .space-key {
    width: 220px;
  }
  .space-key .key-label {
    font-size: 11px;
    letter-spacing: 2px;
    opacity: 0.4;
  }

  @keyframes pulse-key {
    from {
      box-shadow: 0 0 8px rgba(0, 229, 255, 0.2);
    }
    to {
      box-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
    }
  }

  @media (max-width: 600px) {
    .key {
      width: 32px;
      height: 36px;
    }
    .key-label {
      font-size: 13px;
    }
    .space-key {
      width: 160px;
    }
    .kb-row.row-middle {
      padding-left: 14px;
    }
    .kb-row.row-bottom {
      padding-left: 32px;
    }
  }
</style>
