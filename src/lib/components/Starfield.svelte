<script>
  import { onMount } from 'svelte';

  let stars = $state([]);
  let clouds = $state([]);

  onMount(() => {
    stars = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 70,
      dur: 1.5 + Math.random() * 3,
      delay: Math.random() * 3,
      size: Math.random() > 0.7 ? 3 : 2,
    }));
    clouds = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      width: 200 + Math.random() * 400,
      height: 80 + Math.random() * 120,
      top: 10 + Math.random() * 60,
      dur: 40 + Math.random() * 60,
      delay: -Math.random() * 60,
    }));
  });
</script>

<div class="stars">
  {#each stars as s (s.id)}
    <div
      class="star"
      style:left="{s.left}%"
      style:top="{s.top}%"
      style:width="{s.size}px"
      style:height="{s.size}px"
      style:--dur="{s.dur}s"
      style:animation-delay="{s.delay}s"
    ></div>
  {/each}
</div>

<div class="cloud-layer">
  {#each clouds as c (c.id)}
    <div
      class="cloud"
      style:width="{c.width}px"
      style:height="{c.height}px"
      style:top="{c.top}%"
      style:animation-duration="{c.dur}s"
      style:animation-delay="{c.delay}s"
    ></div>
  {/each}
</div>

<style>
  .stars { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
  .star {
    position: absolute; background: #fff; border-radius: 50%;
    animation: twinkle var(--dur) ease-in-out infinite alternate;
  }
  @keyframes twinkle { 0% { opacity: 0.2; } 100% { opacity: 1; } }

  .cloud-layer { position: fixed; inset: 0; pointer-events: none; z-index: 1; overflow: hidden; }
  .cloud {
    position: absolute;
    background: radial-gradient(ellipse, rgba(200, 180, 255, 0.12) 0%, transparent 70%);
    border-radius: 50%; filter: blur(30px);
    animation: drift linear infinite;
  }
  @keyframes drift {
    0% { transform: translateX(-200px); }
    100% { transform: translateX(calc(100vw + 200px)); }
  }
</style>
