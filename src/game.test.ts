import { expect, test } from "vitest";
import { Game, DRAW_MS } from "./game";

test("a horizontal matching pair stays on the board until its connection finishes", () => {
  const game = new Game([[0, 0]], 180_000);
  game.start(0);
  game.select(0, 0);
  game.select(1, 0);
  expect(game.state.pending).toHaveLength(1);
  expect(game.state.board[0]).toEqual([0, 0]);
  game.advance(299);
  expect(game.state.board[0]).toEqual([0, 0]);
  game.advance(300);
  expect(game.state.board[0]).toEqual([null, null]);
  expect(game.state.status).toBe("won");
});

test("only matching tiles joined horizontally or through a free internal column connect", () => {
  const cases: {
    board: (number | null)[][];
    pair: [number, number];
    valid: boolean;
  }[] = [
    { board: [[0, 1]], pair: [0, 1], valid: false },
    { board: [[0], [0]], pair: [0, 1], valid: false },
    { board: [[0, 1, 0]], pair: [0, 2], valid: false },
    {
      board: [
        [0, null],
        [null, 0],
      ],
      pair: [0, 3],
      valid: false,
    },
    {
      board: [
        [0, null],
        [0, null],
      ],
      pair: [0, 2],
      valid: true,
    },
    {
      board: [
        [0, null, 1],
        [1, null, 0],
      ],
      pair: [0, 5],
      valid: true,
    },
    {
      board: [
        [0, 1],
        [0, 1],
      ],
      pair: [0, 2],
      valid: false,
    },
  ];
  for (const { board, pair, valid } of cases) {
    const game = new Game(board, 180_000);
    game.start(0);
    game.select(pair[0], 0);
    game.select(pair[1], 0);
    expect(game.state.pending.length, JSON.stringify(board)).toBe(
      valid ? 1 : 0,
    );
    expect(game.state.selected).toBe(valid ? null : pair[1]);
  }
});

test("selection can cancel and accepted tiles cannot be reused while other matches animate", () => {
  const game = new Game([[0, 0, 1, 1]], 1000);
  game.start(0);
  game.select(0, 0);
  game.select(0, 0);
  expect(game.state.selected).toBeNull();
  game.select(0, 0);
  game.select(1, 0);
  game.select(0, 100);
  expect(game.state.selected).toBeNull();
  game.select(2, 100);
  game.select(3, 100);
  expect(game.state.pending).toHaveLength(2);
  game.advance(DRAW_MS);
  expect(game.state.board[0]).toEqual([null, null, 1, 1]);
  expect(game.state.status).toBe("playing");
  game.advance(100 + DRAW_MS);
  expect(game.state.status).toBe("won");
});

test("the deadline rejects new matches but lets the final accepted pair win", () => {
  const game = new Game([[0, 0]], 1000);
  game.select(0, 0);
  expect(game.state.selected).toBeNull();
  game.start(0);
  game.select(0, 900);
  game.select(1, 999);
  game.advance(1000);
  expect(game.state.remaining).toBe(0);
  expect(game.state.status).toBe("playing");
  game.advance(999 + DRAW_MS);
  expect(game.state.status).toBe("won");
  const other = new Game([[0, 0, 1, 1]], 1000);
  other.start(0);
  other.select(0, 900);
  other.select(1, 999);
  other.select(2, 1000);
  other.select(3, 1000);
  expect(other.state.pending).toHaveLength(1);
  other.advance(999 + DRAW_MS);
  expect(other.state.status).toBe("timeout");
});

test("pending tiles block paths and deadlock waits until all removals finish", () => {
  const game = new Game([[0, 1, 1, 0]], 2000);
  game.start(0);
  game.select(1, 0);
  game.select(2, 0);
  game.select(0, 100);
  game.select(3, 100);
  expect(game.state.pending).toHaveLength(1);
  game.advance(DRAW_MS);
  expect(game.state.status).toBe("playing");
  game.select(0, DRAW_MS); // invalid second selection was 3, so this accepts the outer pair
  expect(game.state.pending).toHaveLength(1);
  game.advance(2 * DRAW_MS);
  expect(game.state.status).toBe("won");
  const stuck = new Game(
    [
      [0, 0, 1],
      [null, null, 1],
    ],
    2000,
  );
  stuck.start(0);
  stuck.select(0, 0);
  stuck.select(1, 0);
  stuck.advance(DRAW_MS);
  // Open space to the left means this is still connectable.
  expect(stuck.state.status).toBe("playing");
  const dead = new Game([[0, 0, 1, 2]], 2000);
  dead.start(0);
  dead.select(0, 0);
  dead.select(1, 0);
  dead.advance(DRAW_MS);
  expect(dead.state.status).toBe("deadlock");
});

test("selection feedback distinguishes taps, invalid attempts, and ignored input", () => {
  const game = new Game([[0, 0, 1, 2, 1]], 1000);
  expect(game.select(0, 0)).toBeUndefined();
  game.start(0);
  expect(game.select(0, 0)).toBe("tap");
  expect(game.select(0, 1)).toBe("tap"); // Deselect.
  expect(game.select(2, 2)).toBe("tap");
  expect(game.select(4, 3)).toBe("invalid"); // Same symbol, blocked connection.
  expect(game.select(0, 4)).toBe("invalid"); // Different symbol.
  expect(game.select(1, 5)).toBe("tap");
  expect(game.select(1, 6)).toBeUndefined(); // Already pending.
  game.advance(5 + DRAW_MS);
  expect(game.select(0, 6 + DRAW_MS)).toBeUndefined(); // Removed.
  expect(game.select(2, 1000)).toBeUndefined(); // Game ended.
});
