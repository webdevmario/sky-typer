<script lang="ts">
  import { training } from '../../stores/training.svelte';

  let nameValue = $state('');
  let userNames = $derived(training.screen === 'userPicker' ? training.getUserNames() : []);

  function handleCreate() {
    const trimmed = nameValue.trim();
    if (trimmed.length > 0) {
      training.createUser(trimmed);
      nameValue = '';
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleCreate();
    if (e.key === 'Escape') training.exitTraining();
  }
</script>

<div class="overlay" class:visible={training.screen === 'userPicker'}>
  <div class="card">
    <button class="back-btn" onclick={() => training.exitTraining()}>← Back</button>
    <div class="emoji-hero">🎓</div>
    <h1 class="title">Training Mode</h1>
    <p class="subtitle">Who's training today?</p>

    {#if userNames.length > 0}
      <div class="section-label">Pick your profile</div>
      <div class="user-list">
        {#each userNames as name (name)}
          <button class="user-btn" onclick={() => training.selectUser(name)}>
            <span class="user-icon">👤</span>
            <span class="user-name">{name}</span>
          </button>
        {/each}
      </div>

      <div class="divider-text">or create a new profile</div>
    {:else}
      <div class="section-label">Create your profile to get started</div>
    {/if}

    <div class="create-form">
      <input
        class="input-field"
        type="text"
        placeholder="Enter your name..."
        maxlength="12"
        value={nameValue}
        oninput={(e) => (nameValue = (e.target as HTMLInputElement).value)}
        onkeydown={handleKeydown}
        autofocus
      />
      <button
        class="btn btn-primary"
        disabled={nameValue.trim().length === 0}
        onclick={handleCreate}
      >
        Start Training
      </button>
    </div>
    <div class="hint">
      {nameValue.trim().length > 0 ? 'Press ENTER to start' : 'Type your name to begin'}
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
    position: relative;
    text-align: center;
    max-width: 460px;
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
  .overlay.visible .card {
    transform: scale(1) translateY(0);
  }

  .back-btn {
    position: absolute;
    top: 16px;
    left: 16px;
    font-family: 'Fredoka', sans-serif;
    font-size: 13px;
    font-weight: 600;
    padding: 6px 14px;
    border-radius: 10px;
    border: 1px solid var(--glass-border);
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all 0.2s;
  }
  .back-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--txt);
  }

  .emoji-hero {
    font-size: 48px;
    margin-bottom: 8px;
  }
  .title {
    font-family: 'Lilita One', sans-serif;
    font-size: 30px;
    margin-bottom: 4px;
    background: linear-gradient(135deg, var(--cyan), var(--green));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .subtitle {
    font-family: 'Fredoka', sans-serif;
    font-size: 15px;
    opacity: 0.6;
    margin-bottom: 20px;
  }

  .section-label {
    font-family: 'Fredoka', sans-serif;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    opacity: 0.5;
    margin-bottom: 10px;
  }

  .user-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-width: 300px;
    margin: 0 auto 16px;
  }

  .user-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    border: 2px solid var(--glass-border);
    background: rgba(255, 255, 255, 0.04);
    color: var(--txt);
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Fredoka', sans-serif;
    text-align: left;
  }
  .user-btn:hover {
    background: rgba(0, 229, 255, 0.08);
    border-color: var(--cyan);
    transform: translateY(-1px);
  }
  .user-icon {
    font-size: 20px;
  }
  .user-name {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 1px;
    flex: 1;
  }

  .divider-text {
    font-family: 'Fredoka', sans-serif;
    font-size: 11px;
    opacity: 0.4;
    margin: 12px 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .create-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 300px;
    margin: 0 auto;
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

  .hint {
    font-size: 10px;
    opacity: 0.3;
    margin-top: 12px;
    letter-spacing: 1px;
    color: var(--orange);
  }
</style>
