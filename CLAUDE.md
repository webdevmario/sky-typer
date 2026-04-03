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
    stores/game.svelte.ts # Central game state (single store, closure pattern)
    components/           # All UI components (screens + reusable)
    data/words.ts         # Word pools per level + level names/badges
    data/difficulty.ts    # Difficulty presets (fall speed, spawn, misses, word count)
    utils/helpers.ts      # Pure functions: scoring, grading, audio, localStorage
    types.ts              # Shared TypeScript interfaces
```

## Key Patterns

- All game state lives in `game.svelte.ts` as a single store using Svelte 5 runes
- Components read state via getters (`game.score`) and call actions (`game.startGame()`)
- Reactive files use `.svelte.ts` extension (required for runes outside components)
- Styles are scoped per component; global vars in `app.css`
- Audio is procedural via Web Audio API (no audio files)
- Persistence via localStorage: `skytyper_hs` (high scores), `skytyper_cw` (custom words)

## Style Rules

- Do not use em dashes anywhere. Use regular hyphens/dashes instead.
- Fonts: Fredoka (UI), Lilita One (titles), Nunito (secondary text)
- Target audience includes children (ages 7-10) - keep UI friendly and rewarding

## Game Flow

Start Screen -> Level Transition (1.8s) -> Game -> Level Up -> ... -> Win/Game Over

- ESC quits to home from gameplay
- 5 levels, words get longer each level
- 3 difficulties: easy/normal/hard
