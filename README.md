# Sky Typer ✦ Word Adventure

A typing game where words fall from the sky and you race to type them before they escape. Built with **Svelte 5** and **Vite**.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## How to Play

1. Enter your name, pick a difficulty, and set your time limit
2. Words fall from the sky — type them before they reach the bottom
3. Clear all words to advance through 5 levels
4. Earn speed bonuses for fast typing; avoid typos for the best grade

## Project Structure

```
sky-typer/
├── src/
│   ├── App.svelte                  # Root — composes all screens
│   ├── app.css                     # Global styles, CSS variables, buttons
│   ├── main.js                     # Vite entry point
│   └── lib/
│       ├── components/             # UI components (one per file)
│       │   ├── Starfield.svelte    # Animated star/cloud background
│       │   ├── StartScreen.svelte  # Main menu, settings, high scores
│       │   ├── GameHUD.svelte      # Score, lives, level, timer bar
│       │   ├── GameArea.svelte     # Play field + text input
│       │   ├── FallingWord.svelte  # Single falling word w/ hit detection
│       │   ├── GradeDisplay.svelte # Reusable letter grade badge
│       │   ├── LevelTransition.svelte
│       │   ├── LevelUpScreen.svelte
│       │   ├── GameOverScreen.svelte
│       │   ├── WinScreen.svelte
│       │   └── CustomWordsScreen.svelte
│       ├── stores/
│       │   └── game.svelte.js      # All game state & logic (Svelte 5 runes)
│       ├── data/
│       │   ├── words.js            # Word pools by level
│       │   └── difficulty.js       # Difficulty presets
│       └── utils/
│           └── helpers.js          # Scoring, grading, audio, localStorage
├── index.html                      # HTML shell
├── package.json
├── vite.config.js
├── svelte.config.js
└── .gitignore
```

## Tech Stack

- **Svelte 5** — Compiler-based UI framework with runes (`$state`, `$derived`)
- **Vite 7** — Dev server and bundler
- **Web Audio API** — Sound effects (no external audio files)
- **CSS** — Scoped per-component, global variables in `app.css`
- **localStorage** — High scores and custom words persistence

## Configuration

Difficulty presets live in `src/lib/data/difficulty.js`. Word pools in `src/lib/data/words.js`. Both are plain JS objects — edit directly, no build config needed.

See `DEVELOPMENT.md` for a full walkthrough of the architecture, Svelte concepts, and how to modify things.

## License

MIT
