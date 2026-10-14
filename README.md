# Double Trouble

A first playable browser remake, built with TypeScript and Vite. Match tiles by symbol and color, connect through open space, and clear all 40 pairs before time runs out.

## Run

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Choose the countdown duration before pressing **Start** (180 seconds by default). For quick playtesting, `/?seconds=60` sets a one-minute countdown. New boards keep the selected duration.

## Check

```sh
npm run typecheck
npm test
npm run test:browser
npm run build
```

Browser tests use installed Google Chrome through Playwright. `npm run build` produces the static site in `dist/`.

## Rules and boundaries

[GLOSSARY.md](GLOSSARY.md) defines the vocabulary. The **Chosen reconstruction rules** in [the research document](docs/double-trouble-research.md) are the gameplay specification; historical uncertainty is background.

- `src/game.ts`: game state, selection, connections and time. Callers supply monotonic milliseconds, making deadline and animation behavior deterministic in tests.
- `src/generator.ts`: produces a 10×8 board and a legal complete removal order. The generator assigns four pairs of each of ten tile types. The solution is used by tests, never shown as a hint.
- `src/main.ts`: browser input and rendering. The engine determines when a tile disappears, including while animations overlap or the deadline passes.

Tests exercise the agreed game-engine, board-generator, and browser-interaction boundaries. Generator tests replay complete solutions through the engine. Difficulty and the provisional timer still need human playtesting. Points, hints, undo and sound are deferred.
