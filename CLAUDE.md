# CLAUDE.md - Sky Typer

## Quick Reference

- **Stack**: Svelte 5 (runes) + Vite 7 + TypeScript
- **No framework**: Plain Svelte, not SvelteKit (single-page game, no routing)
- **Dev**: `npm run dev` (localhost:5173)
- **Validate**: `npm run validate` (format + lint + type check)
- **Build**: `npm run build` (static output to dist/)

## Project Structure

```
src/
  App.svelte              # Root - composes all screens
  app.css                 # Global CSS variables and base styles
  lib/
    stores/game.svelte.ts      # Game state (falling words mode)
    stores/training.svelte.ts  # Training mode state (separate store)
    components/                # Game UI components (screens + reusable)
    components/training/       # Training mode components
    data/words.ts              # Word pools per level + level names/badges
    data/difficulty.ts         # Difficulty presets (fall speed, spawn, misses, word count)
    data/training-lessons.ts   # Training stages, lessons, word lists, keyboard maps
    data/training-config.ts    # Training thresholds, badges, WPM labels
    utils/helpers.ts           # Pure functions: scoring, grading, audio, localStorage
    types.ts                   # Shared TypeScript interfaces
```

## Key Patterns

- Game and training have separate stores (`game.svelte.ts` and `training.svelte.ts`)
- Both stores use the same closure pattern with Svelte 5 runes
- Components read state via getters (`game.score`) and call actions (`game.startGame()`)
- Reactive files use `.svelte.ts` extension (required for runes outside components)
- Styles are scoped per component; global vars in `app.css`
- Audio is procedural via Web Audio API (no audio files)
- Persistence via localStorage: `skytyper_hs` (high scores), `skytyper_cw` (custom words), `skytyper_training` (training progress)
- Avoid `new Date()` in `.svelte.ts` files (linter requires SvelteDate) - use helpers instead

## Style Rules

- Do not use em dashes anywhere. Use regular hyphens/dashes instead.
- Fonts: Fredoka (UI), Lilita One (titles), Nunito (secondary text)
- Target audience includes children (ages 7-10) - keep UI friendly and rewarding

## Game Flow

Start Screen -> Level Transition (1.8s) -> Game -> Level Up -> ... -> Win/Game Over

- ESC quits to home from gameplay
- 5 levels, words get longer each level
- 3 difficulties: easy/normal/hard

## Training Mode

6 stages: Home Row -> Top Row -> Bottom Row -> Space Bar -> Numbers -> Punctuation
Each stage has 3-5 lessons with 3 exercises each.

- Separate store (`training.svelte.ts`) from game store
- Per-key mastery tracking (accuracy + speed)
- WPM tracking with idle time exclusion (3s threshold)
- On-screen keyboard with finger-zone color coding
- 3 keyboard modes: Always / Auto (fades mastered keys) / Hidden
- Star ratings (0-3) based on accuracy thresholds (70/85/95%)
- Badge system for achievements
- Daily practice streak tracking
- Lessons unlock sequentially; stages unlock when all previous stage lessons completed
