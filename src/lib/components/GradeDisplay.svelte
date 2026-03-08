<script lang="ts">
  let { grade, detail = '' } = $props();
</script>

<div class="grade-wrap">
  <div class="grade-circle {grade.cls}">
    <div class="grade-letter {grade.cls}">{grade.letter}</div>
  </div>
  <div class="grade-msg">{grade.emoji} {grade.msg}</div>
  {#if detail}
    <div class="grade-detail">{detail}</div>
  {/if}
</div>

<style>
  .grade-wrap {
    margin: 14px 0 18px;
    text-align: center;
  }
  .grade-circle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 96px;
    height: 96px;
    border-radius: 50%;
    position: relative;
  }
  .grade-circle::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 4px solid;
    animation: glow 2s ease-in-out infinite alternate;
  }
  .grade-circle.grade-ap::before {
    border-color: var(--gold);
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.4);
  }
  .grade-circle.grade-a::before {
    border-color: var(--green);
    box-shadow: 0 0 25px rgba(105, 240, 174, 0.3);
  }
  .grade-circle.grade-am::before {
    border-color: var(--cyan);
    box-shadow: 0 0 20px rgba(0, 229, 255, 0.3);
  }
  .grade-circle.grade-bp::before {
    border-color: var(--orange);
    box-shadow: 0 0 20px rgba(255, 171, 64, 0.3);
  }
  .grade-circle.grade-b::before {
    border-color: var(--pink);
    box-shadow: 0 0 15px rgba(255, 107, 157, 0.3);
  }
  .grade-circle.grade-c::before {
    border-color: #b388ff;
    box-shadow: 0 0 15px rgba(179, 136, 255, 0.3);
  }
  @keyframes glow {
    0% {
      opacity: 0.7;
      transform: scale(1);
    }
    100% {
      opacity: 1;
      transform: scale(1.05);
    }
  }

  .grade-letter {
    font-family: 'Lilita One', sans-serif;
    font-size: 48px;
    position: relative;
    z-index: 2;
  }
  .grade-letter.grade-ap {
    color: var(--gold);
  }
  .grade-letter.grade-a {
    color: var(--green);
  }
  .grade-letter.grade-am {
    color: var(--cyan);
  }
  .grade-letter.grade-bp {
    color: var(--orange);
  }
  .grade-letter.grade-b {
    color: var(--pink);
  }
  .grade-letter.grade-c {
    color: #b388ff;
  }

  .grade-msg {
    font-family: 'Fredoka', sans-serif;
    font-size: 14px;
    font-weight: 600;
    margin-top: 6px;
    opacity: 0.8;
  }
  .grade-detail {
    font-family: 'Nunito', sans-serif;
    font-size: 11px;
    opacity: 0.4;
    margin-top: 4px;
  }
</style>
