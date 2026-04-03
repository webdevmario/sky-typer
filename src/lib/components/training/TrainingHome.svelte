<script lang="ts">
  import { training } from '../../stores/training.svelte';
  import { BADGES } from '../../data/training-config';

  function starStr(count: number): string {
    return '★'.repeat(count) + '☆'.repeat(3 - count);
  }
</script>

<div class="overlay" class:visible={training.screen === 'home'}>
  <div class="card">
    <button class="back-btn" onclick={() => training.exitTraining()}>← Back</button>
    <div class="emoji-hero">🎓</div>
    <h1 class="title">Training Mode</h1>
    {#if training.currentUser}
      <div class="user-badge">👤 {training.currentUser}</div>
    {/if}
    <p class="subtitle">Learn to type - one key at a time!</p>

    {#if training.persistence.streak.current > 0}
      <div class="streak-badge">
        🔥 {training.persistence.streak.current} day streak!
      </div>
    {/if}

    <div class="stages">
      {#each training.stages as stage, si (stage.id)}
        {@const stageUnlocked = training.isLessonUnlocked(si, 0)}
        <div class="stage" class:locked={!stageUnlocked}>
          <div class="stage-header">
            <span class="stage-emoji">{stage.emoji}</span>
            <span class="stage-title">Stage {stage.id}: {stage.title}</span>
            {#if !stageUnlocked}
              <span class="lock-icon">🔒</span>
            {/if}
          </div>

          {#if stageUnlocked}
            <div class="lessons">
              {#each stage.lessons as lesson, li (lesson.id)}
                {@const unlocked = training.isLessonUnlocked(si, li)}
                {@const progress = training.getLessonProgress(lesson.id)}
                <button
                  class="lesson-btn"
                  class:locked={!unlocked}
                  class:completed={progress?.completed}
                  disabled={!unlocked}
                  onclick={() => training.startLesson(si, li)}
                >
                  <div class="lesson-info">
                    <span class="lesson-title">{lesson.title}</span>
                    {#if progress}
                      <span class="lesson-stars">{starStr(progress.stars)}</span>
                    {/if}
                  </div>
                  {#if progress?.bestWpm}
                    <span class="lesson-wpm">{progress.bestWpm} wpm</span>
                  {:else if !unlocked}
                    <span class="lesson-lock">🔒</span>
                  {/if}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>

    {#if training.persistence.badges.length > 0}
      <div class="divider"></div>
      <div class="badges-section">
        <div class="label center">Badges</div>
        <div class="badge-grid">
          {#each training.persistence.badges as badgeId (badgeId)}
            {@const badge = BADGES.find((b) => b.id === badgeId)}
            {#if badge}
              <div class="badge" title={badge.description}>
                <span class="badge-emoji">{badge.emoji}</span>
                <span class="badge-title">{badge.title}</span>
              </div>
            {/if}
          {/each}
        </div>
      </div>
    {/if}

    <div class="divider"></div>
    <div class="keyboard-setting">
      <span class="label">On-screen Keyboard:</span>
      <div class="toggle-row">
        <button
          class="toggle-btn"
          class:selected={training.keyboardMode === 'always'}
          onclick={() => training.setKeyboardMode('always')}>Show</button
        >
        <button
          class="toggle-btn"
          class:selected={training.keyboardMode === 'hidden'}
          onclick={() => training.setKeyboardMode('hidden')}>Hide</button
        >
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
    position: relative;
    text-align: center;
    max-width: 520px;
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
  .user-badge {
    display: inline-block;
    padding: 3px 14px;
    border-radius: 16px;
    background: rgba(0, 229, 255, 0.1);
    border: 1px solid rgba(0, 229, 255, 0.25);
    font-family: 'Fredoka', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: var(--cyan);
    letter-spacing: 1px;
    margin-bottom: 6px;
  }
  .subtitle {
    font-family: 'Fredoka', sans-serif;
    font-size: 13px;
    opacity: 0.6;
    margin-bottom: 16px;
  }

  .streak-badge {
    display: inline-block;
    padding: 4px 14px;
    border-radius: 20px;
    background: rgba(255, 152, 0, 0.15);
    border: 1px solid rgba(255, 152, 0, 0.3);
    font-family: 'Fredoka', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: var(--orange);
    margin-bottom: 16px;
  }

  .stages {
    display: flex;
    flex-direction: column;
    gap: 12px;
    text-align: left;
    margin: 0 auto;
    max-width: 420px;
  }

  .stage {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--glass-border);
    border-radius: 14px;
    padding: 12px;
    transition: opacity 0.3s;
  }
  .stage.locked {
    opacity: 0.4;
  }

  .stage-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-family: 'Fredoka', sans-serif;
    font-size: 14px;
    font-weight: 700;
  }
  .stage-emoji {
    font-size: 18px;
  }
  .stage-title {
    flex: 1;
    color: var(--gold);
  }
  .lock-icon {
    font-size: 12px;
    opacity: 0.5;
  }

  .lessons {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .lesson-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 8px 12px;
    border-radius: 10px;
    border: 1px solid transparent;
    background: rgba(255, 255, 255, 0.03);
    color: var(--txt);
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Fredoka', sans-serif;
    text-align: left;
  }
  .lesson-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: var(--glass-border);
  }
  .lesson-btn:disabled {
    cursor: default;
    opacity: 0.4;
  }
  .lesson-btn.completed {
    border-color: rgba(76, 175, 80, 0.2);
    background: rgba(76, 175, 80, 0.05);
  }

  .lesson-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .lesson-title {
    font-size: 12px;
    font-weight: 600;
  }
  .lesson-stars {
    font-size: 11px;
    color: var(--gold);
    letter-spacing: 1px;
  }
  .lesson-wpm {
    font-size: 10px;
    font-weight: 600;
    color: var(--cyan);
    opacity: 0.7;
  }
  .lesson-lock {
    font-size: 10px;
    opacity: 0.4;
  }

  .divider {
    border-top: 1px solid var(--glass-border);
    margin: 16px auto 12px;
    max-width: 380px;
  }

  .badges-section {
    margin: 0 auto;
    max-width: 380px;
  }
  .badge-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: center;
    margin-top: 8px;
  }
  .badge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 16px;
    background: rgba(255, 215, 0, 0.08);
    border: 1px solid rgba(255, 215, 0, 0.2);
    font-size: 11px;
  }
  .badge-emoji {
    font-size: 14px;
  }
  .badge-title {
    font-family: 'Fredoka', sans-serif;
    font-weight: 600;
    color: var(--gold);
  }

  .label {
    font-family: 'Fredoka', sans-serif;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    opacity: 0.6;
  }
  .label.center {
    text-align: center;
  }

  .keyboard-setting {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin: 0 auto;
    max-width: 380px;
  }

  .toggle-row {
    display: flex;
    gap: 6px;
  }
  .toggle-btn {
    padding: 6px 14px;
    font-family: 'Fredoka', sans-serif;
    font-size: 12px;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--glass-border);
    border-radius: 8px;
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
  }

</style>
