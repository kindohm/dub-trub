import { expect, test } from "vitest";
import { generateBoard } from "./generator";
import { Game, DRAW_MS } from "./game";

test("starting boards have the required layout and a complete playable solution", () => {
  let seed = 17;
  const random = () =>
    (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32;
  for (let sample = 0; sample < 30; sample++) {
    const { board, solution } = generateBoard(random);
    expect(board).toHaveLength(8);
    expect(board.every((row) => row.length === 10)).toBe(true);
    for (let type = 0; type < 10; type++)
      expect(board.flat().filter((tile) => tile === type)).toHaveLength(8);
    expect(board[3][4]).toBe(board[3][5]);
    const game = new Game(board, 180_000);
    game.start(0);
    let now = 0;
    for (const [a, b] of solution) {
      game.select(a, now);
      game.select(b, now);
      expect(game.state.pending).toHaveLength(1);
      now += DRAW_MS;
      game.advance(now);
    }
    expect(game.state.status).toBe("won");
  }
});
