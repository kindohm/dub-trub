import { connection, type Board } from "./game";

/** Build a legal removal order first, then assign matching tile types to its pairs. */
export function generateBoard(random = Math.random): {
  board: Board;
  solution: [number, number][];
} {
  for (let attempt = 0; ; attempt++) {
    const occupied: Board = Array.from({ length: 8 }, () =>
      Array<number | null>(10).fill(0),
    );
    const solution: [number, number][] = [[34, 35]];
    occupied[3][4] = occupied[3][5] = null;
    while (solution.length < 40) {
      const candidates: [number, number][] = [];
      const tiles = occupied.flat();
      for (let a = 0; a < 80; a++) {
        if (tiles[a] === null) continue;
        for (let b = a + 1; b < 80; b++) {
          if (tiles[b] === null) continue;
          const from = { x: a % 10, y: Math.floor(a / 10) };
          const to = { x: b % 10, y: Math.floor(b / 10) };
          // A same-row-only fallback guarantees bounded generation, even for unusual random sources.
          if (attempt >= 20 && from.y !== to.y) continue;
          if (connection(occupied, from, to)) candidates.push([a, b]);
        }
      }
      if (!candidates.length) break;
      const pair = candidates[Math.floor(random() * candidates.length)];
      solution.push(pair);
      for (const index of pair)
        occupied[Math.floor(index / 10)][index % 10] = null;
    }
    if (solution.length !== 40) continue;
    const types = Array.from({ length: 40 }, (_, i) => i % 10);
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [types[i], types[j]] = [types[j], types[i]];
    }
    solution.forEach((pair, i) => {
      for (const index of pair)
        occupied[Math.floor(index / 10)][index % 10] = types[i];
    });
    return { board: occupied, solution };
  }
}
