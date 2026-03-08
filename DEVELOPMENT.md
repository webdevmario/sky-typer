# DEVELOPMENT.md — Sky Typer

A complete guide for setting up, understanding, and working on this project. Written for developers familiar with React who are new to Svelte.

---

## Prerequisites

You need **Node.js 18+** and **npm**. Check with:

```bash
node --version   # should be 18.x or higher
npm --version    # should be 9.x or higher
```

If you need to install Node, grab it from https://nodejs.org (LTS is fine).

---

## Setup from Scratch

```bash
# 1. Clone or download the project
cd sky-typer

# 2. Install dependencies — this creates node_modules/
npm install

# 3. Start the dev server
npm run dev
```

Vite will print a local URL (usually `http://localhost:5173`). Open it in your browser. Changes to any `.svelte` or `.js` file will hot-reload instantly.

**Important**: You must run `npm install` before anything else. The project won't work by just opening `index.html` in a browser — it needs the Svelte compiler and Vite bundler from `node_modules`.

---

## Available Commands

| Command           | What it does                                              |
| ----------------- | --------------------------------------------------------- |
| `npm run dev`     | Starts Vite dev server with hot module replacement        |
| `npm run build`   | Compiles everything into `dist/` for production           |
| `npm run preview` | Serves the `dist/` build locally to test before deploying |

After `npm run build`, the `dist/` folder contains static HTML/CSS/JS you can deploy anywhere (Netlify, Vercel, GitHub Pages, any static host). The `vite.config.js` has `base: './'` so the build even works opened directly from the filesystem.

---

## Why Svelte (not SvelteKit)?

**Svelte** is the UI framework — it compiles `.svelte` components into optimized vanilla JavaScript at build time. No virtual DOM, no runtime overhead.

**SvelteKit** is the meta-framework built on top of Svelte (like Next.js is to React). It adds routing, server-side rendering, API routes, and deployment adapters.

We chose plain Svelte + Vite because Sky Typer is:

- A single-page game (no routes, no navigation)
- Entirely client-side (no server, no API, no database)
- Self-contained (no SEO needs, no SSR benefits)

SvelteKit would add unnecessary complexity here — a router, server hooks, and adapter configuration we'd never use. If Sky Typer grows into a multi-page app with user accounts, leaderboard APIs, etc., SvelteKit would be the right move.

---

## Svelte 5 Concepts (React → Svelte Translation)

### Components

React:

```jsx
export default function Counter({ initial = 0 }) {
  const [count, setCount] = useState(initial);
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}
```

Svelte:

```svelte
<script>
  let { initial = 0 } = $props();
  let count = $state(initial);
</script>

<button onclick={() => count++}>{count}</button>
```

Key differences:

- **No JSX** — Svelte uses HTML with `{expressions}` and directives
- **`$state()`** replaces `useState()` — but you mutate directly, no setter function
- **`$props()`** replaces function params — destructure to get props
- **`$derived()`** replaces `useMemo()` — automatic dependency tracking
- **`$effect()`** replaces `useEffect()` — runs when dependencies change
- **Scoped `<style>`** — CSS in each component is automatically scoped (no CSS modules needed)

### Reactivity

React makes you explicitly declare dependencies. Svelte tracks them automatically:

```svelte
<script>
  let width = $state(10);
  let height = $state(20);
  let area = $derived(width * height); // auto-updates when width or height changes

  $effect(() => {
    console.log('Area changed to', area); // auto-runs when area changes
  });
</script>
```

### The `.svelte.js` Extension

Files ending in `.svelte.js` (like `game.svelte.js`) can use runes (`$state`, `$derived`, `$effect`) outside of `.svelte` components. This is how we build reactive stores. The Svelte compiler processes these files specially — a plain `.js` file cannot use runes.

---

## Architecture Overview

### Data Flow

```
game.svelte.js (store)    ← Single source of truth
       ↕
   Components              ← Read state, call actions
       ↕
   helpers.js              ← Pure functions (scoring, audio, etc.)
```

Everything flows through the store. Components never hold game logic — they read `game.score`, `game.fallingObjects`, etc. and call `game.startGame()`, `game.handleInput()`, etc.

### The Game Store (`src/lib/stores/game.svelte.js`)

This is the heart of the app. It's a function that creates a closure with reactive state:

```js
function createGameStore() {
  let score = $state(0);         // reactive
  let level = $state(1);         // reactive
  let df = $derived(DIFFICULTY[difficulty]); // auto-computed

  function startGame() { ... }   // mutates state directly

  return {
    get score() { return score; }, // getters expose reactive state
    startGame,                     // actions exposed directly
  };
}

export const game = createGameStore();
```

Components import `game` and use it:

```svelte
<script>
  import { game } from '../stores/game.svelte.js';
</script>

<div>{game.score}</div>
<button onclick={() => game.startGame()}>Start</button>
```

### Component Responsibilities

| Component             | Role                                                           |
| --------------------- | -------------------------------------------------------------- |
| `App.svelte`          | Composes all screens, nothing else                             |
| `Starfield.svelte`    | Decorative background, self-contained                          |
| `StartScreen.svelte`  | Menu, settings, high scores, custom words link                 |
| `GameHUD.svelte`      | Top bar during gameplay (score, lives, timer)                  |
| `GameArea.svelte`     | The play field, renders `FallingWord` instances, manages input |
| `FallingWord.svelte`  | One falling word — animates, detects when it exits the screen  |
| `GradeDisplay.svelte` | Reusable grade badge (used in 3 different screens)             |
| `LevelTransition`     | "LEVEL 2" splash before each level starts                      |
| `LevelUpScreen`       | Results after completing a level                               |
| `GameOverScreen`      | Shown when you run out of lives                                |
| `WinScreen`           | Shown after beating all 5 levels                               |
| `CustomWordsScreen`   | Add/remove custom words                                        |

### Utilities (`src/lib/utils/helpers.js`)

All pure functions — no state, no side effects (except audio). Includes:

- `shuffle()`, `pickRandom()` — array helpers
- `calcPoints()`, `calcSpeedBonus()` — scoring math
- `calcGrade()`, `calcOverallGrade()` — letter grade computation
- `sndType()`, `sndWord()`, `sndMiss()`, etc. — Web Audio tones
- `getHighScores()`, `saveHighScore()` — localStorage wrappers
- `getCustomWords()`, `saveCustomWords()` — localStorage wrappers

### Data (`src/lib/data/`)

- `words.js` — Word pools for levels 1-5, plus level name/badge arrays
- `difficulty.js` — Fall speed, spawn interval, max misses, word count per difficulty

---

## Common Tasks

### Add a new word

Open `src/lib/data/words.js` and add to the appropriate level array:

```js
{ w: 'phoenix', i: '🔥', d: 'A mythical bird that rises from its own ashes.' },
```

Words are auto-assigned to levels by length in the custom words feature, but the built-in pools are manually curated.

### Change difficulty settings

Edit `src/lib/data/difficulty.js`:

```js
easy: {
  sp: [22, 20, 17, 14, 12],  // fall speed (seconds) per level
  si: [4800, 4200, ...],       // spawn interval (ms) per level
  ms: 5,                       // max misses before game over
  wc: 5,                       // words per level
},
```

### Add a new screen

1. Create `src/lib/components/MyScreen.svelte`
2. Add a new screen state string in `game.svelte.js` (e.g., `'myScreen'`)
3. Add it to `App.svelte`
4. Control visibility with `game.screen === 'myScreen'`

### Change the visual theme

Global CSS variables live in `src/app.css`:

```css
:root {
  --sky-top: #1a0533;
  --gold: #ffd700;
  --cyan: #00e5ff;
  /* etc. */
}
```

Change these and every component picks up the new palette. Per-component styles are in each `.svelte` file's `<style>` block — they're scoped and won't leak.

---

## Deployment

```bash
npm run build
```

Upload the entire `dist/` folder to any static host:

- **Netlify**: Drag-and-drop `dist/` or connect your repo
- **Vercel**: `npx vercel --prod` from the project root
- **GitHub Pages**: Push `dist/` contents to a `gh-pages` branch
- **Any web server**: Just serve the `dist/` folder as static files

No server runtime needed — it's all static HTML, CSS, and JS.

---

## Troubleshooting

**"Nothing loads when I open index.html"**
You can't open the source `index.html` directly — it needs Vite to compile the Svelte code. Run `npm run dev` and open the URL it prints. If you want to open files directly, run `npm run build` first, then open `dist/index.html`.

**"npm install fails"**
Make sure you have Node 18+. Run `node --version` to check.

**"Fonts look wrong"**
The project loads Google Fonts (Fredoka, Lilita One, Nunito) via CSS `@import`. You need internet access on first load. After that, browsers cache them.

**"Changes don't show up"**
Vite's HMR (hot module replacement) handles most changes automatically. If state gets weird during development, refresh the page. Store state resets on refresh since it's all in-memory.

---

## Further Reading

- [Svelte 5 docs](https://svelte.dev/docs) — Official docs, very well written
- [Svelte 5 tutorial](https://svelte.dev/tutorial) — Interactive, takes ~1 hour
- [Vite docs](https://vite.dev/guide/) — Build tool config and plugins
- [SvelteKit docs](https://svelte.dev/docs/kit) — For when you outgrow plain Svelte
