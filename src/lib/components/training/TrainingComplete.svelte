<script lang="ts">
  import { training } from '../../stores/training.svelte';
  import { getWpmLabel, BADGES } from '../../data/training-config';

  let wpmInfo = $derived(training.completeData ? getWpmLabel(training.completeData.wpm) : null);

  function starStr(count: number): string {
    return '★'.repeat(count) + '☆'.repeat(3 - count);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && training.screen === 'complete') {
      training.nextLesson();
    }
  }

  $effect(() => {
    if (training.screen === 'complete') {
      document.addEventListener('keydown', handleKeydown);
      return () => document.removeEventListener('keydown', handleKeydown);
    }
  });
</script>

<div class="overlay" class:visible={training.screen === 'complete'}>
  {#if training.completeData}
    {@const data = training.completeData}
    <div class="card">
      <div class="emoji-hero">
        {data.stars >= 3 ? '🌟' : data.stars >= 2 ? '⭐' : data.stars >= 1 ? '✨' : '💪'}
      </div>
      <h2 class="title" class:gold={data.stars >= 2} class:green={data.stars === 1}>
        {data.stars >= 3
          ? 'PERFECT!'
          : data.stars >= 2
            ? 'GREAT JOB!'
            : data.stars >= 1
              ? 'NICE WORK!'
              : 'KEEP GOING!'}
      </h2>

      <div class="stars-display">{starStr(data.stars)}</div>

      <div class="stats">
        <div class="stat">
          <div class="stat-value" class:good={data.accuracy >= 85}>{data.accuracy}%</div>
          <div class="stat-label">Accuracy</div>
        </div>
        <div class="stat">
          <div class="stat-value wpm">{data.wpm}</div>
          <div class="stat-label">WPM</div>
        </div>
        <div class="stat">
          <div class="stat-value streak-val">{data.bestStreak}</div>
          <div class="stat-label">Best Streak</div>
        </div>
      </div>

      {#if wpmInfo}
        <div class="wpm-label">{wpmInfo.emoji} {wpmInfo.label}</div>
      {/if}

      {#if data.isNewBest}
        <div class="new-best">New Personal Best!</div>
      {/if}

      {#if data.newBadges.length > 0}
        <div class="new-badges">
          {#each data.newBadges as badgeId (badgeId)}
            {@const badge = BADGES.find((b) => b.id === badgeId)}
            {#if badge}
              <div class="badge-earned">
                <span class="badge-emoji">{badge.emoji}</span>
                <div class="badge-info">
                  <div class="badge-title">Badge Unlocked: {badge.title}</div>
                  <div class="badge-desc">{badge.description}</div>
                </div>
              </div>
            {/if}
          {/each}
        </div>
      {/if}

      <div class="detail-stats">
        <div class="detail-row">
          <span class="detail-label">Correct</span>
          <span class="detail-value">{data.correctCount}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Errors</span>
          <span class="detail-value">{data.errorCount}</span>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-primary" onclick={() => training.nextLesson()}> Next Lesson </button>
        <button class="btn btn-ghost btn-sm" onclick={() => training.retryLesson()}>
          🔄 Retry
        </button>
        <button class="btn btn-ghost btn-sm" onclick={() => training.goToTrainingHome()}>
          🏠 Home
        </button>
      </div>
      <div class="hint">Press ENTER to continue</div>
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
    max-width: 500px;
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
  .overlay.visible .card {
    transform: scale(1) translateY(0);
  }

  .emoji-hero {
    font-size: 48px;
    margin-bottom: 8px;
  }
  .title {
    font-family: 'Lilita One', sans-serif;
    font-size: 30px;
    margin-bottom: 8px;
    color: var(--cyan);
  }
  .title.gold {
    color: var(--gold);
  }
  .title.green {
    color: var(--green);
  }

  .stars-display {
    font-size: 32px;
    color: var(--gold);
    letter-spacing: 6px;
    margin-bottom: 16px;
  }

  .stats {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-bottom: 12px;
  }
  .stat {
    text-align: center;
  }
  .stat-value {
    font-family: 'Fredoka', sans-serif;
    font-size: 24px;
    font-weight: 700;
    color: var(--cyan);
  }
  .stat-value.good {
    color: var(--green);
  }
  .stat-value.wpm {
    color: var(--cyan);
  }
  .stat-value.streak-val {
    color: var(--gold);
  }
  .stat-label {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    opacity: 0.5;
  }

  .wpm-label {
    font-family: 'Fredoka', sans-serif;
    font-size: 13px;
    font-weight: 600;
    opacity: 0.6;
    margin-bottom: 12px;
  }

  .new-best {
    display: inline-block;
    padding: 4px 14px;
    border-radius: 20px;
    background: rgba(0, 229, 255, 0.12);
    border: 1px solid rgba(0, 229, 255, 0.3);
    font-family: 'Fredoka', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: var(--cyan);
    margin-bottom: 12px;
  }

  .new-badges {
    margin-bottom: 14px;
  }
  .badge-earned {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    margin: 6px auto;
    max-width: 300px;
    border-radius: 12px;
    background: rgba(255, 215, 0, 0.08);
    border: 1px solid rgba(255, 215, 0, 0.25);
    animation: badge-pop 0.4s ease-out;
  }
  .badge-emoji {
    font-size: 24px;
  }
  .badge-info {
    text-align: left;
  }
  .badge-title {
    font-family: 'Fredoka', sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: var(--gold);
  }
  .badge-desc {
    font-size: 10px;
    opacity: 0.5;
  }

  @keyframes badge-pop {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .detail-stats {
    margin: 12px auto 16px;
    max-width: 200px;
  }
  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 3px 0;
    font-family: 'Fredoka', sans-serif;
    font-size: 12px;
  }
  .detail-label {
    opacity: 0.5;
  }
  .detail-value {
    font-weight: 600;
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
