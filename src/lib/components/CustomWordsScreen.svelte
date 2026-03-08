<script>
  import { game } from '../stores/game.svelte.js';
  import { getCustomWords, saveCustomWords, wordLevel, escapeHtml } from '../utils/helpers.js';

  let customWords = $state(getCustomWords());
  let wordInput = $state('');
  let defInput = $state('');
  let result = $state(null); // { type: 'ok'|'err', text: '' }

  function refresh() { customWords = getCustomWords(); }

  function addWord() {
    const word = wordInput.trim().toLowerCase().replace(/[^a-z]/g, '');
    const def = defInput.trim();
    result = null;

    if (!word || word.length < 3) {
      result = { type: 'err', text: 'Word must be at least 3 letters.' };
      return;
    }
    if (!def || def.length < 5) {
      result = { type: 'err', text: 'Please add a definition (at least 5 characters).' };
      return;
    }
    const list = getCustomWords();
    if (list.some(x => x.w === word)) {
      result = { type: 'err', text: 'That word already exists!' };
      return;
    }
    const lvl = wordLevel(word);
    list.push({ w: word, d: def, l: lvl });
    saveCustomWords(list);
    result = { type: 'ok', text: `✓ "${word}" added to Level ${lvl}!` };
    wordInput = '';
    defInput = '';
    refresh();
  }

  function removeWord(idx) {
    const list = getCustomWords();
    list.splice(idx, 1);
    saveCustomWords(list);
    refresh();
  }
</script>

<div class="overlay" class:visible={game.screen === 'customWords'}>
  <div class="card">
    <div class="emoji-hero">📝</div>
    <h2 class="title">Custom Words</h2>
    <p class="message">Add your own words! They'll be mixed into the matching level.</p>

    <div class="cw-form">
      <input class="cw-input" placeholder="Word..." maxlength="20" bind:value={wordInput} />
      <input class="cw-input" placeholder="Definition..." bind:value={defInput} />

      {#if result}
        <div class="cw-result" class:ok={result.type === 'ok'} class:err={result.type === 'err'}>
          {result.text}
        </div>
      {/if}

      <div class="actions" style="margin-bottom: 12px;">
        <button class="btn btn-primary btn-sm" onclick={addWord}>➕ Add Word</button>
      </div>

      <div class="section-label">Your Words</div>
      <div class="cw-list">
        {#if customWords.length === 0}
          <div class="empty">No custom words yet.</div>
        {:else}
          {#each customWords as cw, i}
            <div class="cw-item">
              <span class="cw-word">{escapeHtml(cw.w)}</span>
              <span class="cw-def">{escapeHtml(cw.d).substring(0, 40)}{cw.d.length > 40 ? '...' : ''}</span>
              <span class="cw-lvl">Lvl {cw.l}</span>
              <button class="cw-remove" onclick={() => removeWord(i)}>✕</button>
            </div>
          {/each}
        {/if}
      </div>
    </div>

    <div class="actions" style="margin-top: 14px;">
      <button class="btn btn-ghost" onclick={() => game.closeCustomWords()}>← Back</button>
    </div>
  </div>
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
    text-align: center; max-width: 520px; width: 92%; padding: 32px 24px;
    background: linear-gradient(135deg, rgba(45, 27, 105, 0.8), rgba(74, 44, 138, 0.6));
    border: 1px solid var(--glass-border); border-radius: 28px;
    box-shadow: 0 20px 80px rgba(0, 0, 0, 0.5);
    transform: scale(0.9) translateY(20px); transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .overlay.visible .card { transform: scale(1) translateY(0); }

  .emoji-hero { font-size: 48px; margin-bottom: 8px; }
  .title { font-family: 'Lilita One', sans-serif; font-size: 28px; color: var(--cyan); margin-bottom: 6px; }
  .message { font-family: 'Fredoka', sans-serif; font-size: 14px; opacity: 0.7; margin-bottom: 16px; }

  .cw-form { text-align: left; margin: 0 auto; max-width: 420px; }
  .cw-input {
    width: 100%; padding: 9px 14px; font-family: 'Fredoka', sans-serif; font-size: 15px; font-weight: 600;
    background: rgba(255, 255, 255, 0.06); border: 2px solid var(--glass-border); border-radius: 10px;
    color: #fff; outline: none; transition: all 0.2s; margin-bottom: 8px;
  }
  .cw-input:focus { border-color: var(--cyan); background: rgba(255, 255, 255, 0.1); }
  .cw-input::placeholder { color: rgba(255, 255, 255, 0.25); font-weight: 400; }

  .cw-result { font-size: 12px; padding: 6px 10px; border-radius: 8px; margin-bottom: 8px; }
  .cw-result.ok { background: rgba(105, 240, 174, 0.1); border: 1px solid rgba(105, 240, 174, 0.2); color: var(--green); }
  .cw-result.err { background: rgba(255, 68, 68, 0.1); border: 1px solid rgba(255, 68, 68, 0.2); color: #ff8888; }

  .section-label {
    display: block; font-family: 'Fredoka', sans-serif; font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.6; margin-bottom: 6px;
  }
  .cw-list { max-height: 25vh; overflow-y: auto; margin: 10px 0; padding-right: 4px; }
  .cw-list::-webkit-scrollbar { width: 5px; }
  .cw-list::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 3px; }

  .empty { font-size: 12px; opacity: 0.4; padding: 12px; text-align: center; }

  .cw-item {
    display: flex; align-items: center; gap: 8px; padding: 7px 10px;
    background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px; margin-bottom: 4px; font-family: 'Fredoka', sans-serif; font-size: 13px;
  }
  .cw-word { color: var(--green); font-weight: 600; min-width: 80px; }
  .cw-def { opacity: 0.5; flex: 1; font-size: 11px; }
  .cw-lvl { font-size: 11px; color: var(--cyan); opacity: 0.7; flex-shrink: 0; }
  .cw-remove { cursor: pointer; color: rgba(255, 255, 255, 0.3); font-size: 16px; margin-left: auto; padding: 0 4px; transition: color 0.2s; }
  .cw-remove:hover { color: #ff4444; }

  .actions { display: flex; gap: 8px; justify-content: center; }
</style>
