export type Board = (number | null)[][];
export type Point = { x: number; y: number };
export type Match = { tiles: [number, number]; path: Point[]; started: number };
export type Status = "ready" | "playing" | "won" | "timeout" | "deadlock";
export const DRAW_MS = 300;

export class Game {
  readonly state: {
    board: Board;
    status: Status;
    selected: number | null;
    pending: Match[];
    remaining: number;
  };
  private deadline = 0;
  constructor(
    board: Board,
    private duration: number,
  ) {
    this.state = {
      board: board.map((row) => [...row]),
      status: "ready",
      selected: null,
      pending: [],
      remaining: duration,
    };
  }
  start(now: number) {
    if (this.state.status !== "ready") return;
    this.deadline = now + this.duration;
    this.state.status = "playing";
  }
  select(index: number, now: number): "tap" | "invalid" | undefined {
    this.advance(now);
    if (this.state.status !== "playing" || now >= this.deadline) return;
    const width = this.state.board[0].length;
    if (this.state.board[Math.floor(index / width)]?.[index % width] == null)
      return;
    if (this.state.pending.some((match) => match.tiles.includes(index))) return;
    if (this.state.selected === index) {
      this.state.selected = null;
      return "tap";
    }
    const first = this.state.selected;
    if (first === null) {
      this.state.selected = index;
      return "tap";
    }
    const a = { x: first % width, y: Math.floor(first / width) };
    const b = { x: index % width, y: Math.floor(index / width) };
    const path =
      this.state.board[a.y][a.x] === this.state.board[b.y][b.x]
        ? connection(this.state.board, a, b)
        : null;
    if (!path) {
      this.state.selected = index;
      return "invalid";
    }
    this.state.pending.push({ tiles: [first, index], path, started: now });
    this.state.selected = null;
    return "tap";
  }
  advance(now: number) {
    if (this.state.status !== "playing") return;
    this.state.remaining = Math.max(0, this.deadline - now);
    if (now >= this.deadline) this.state.selected = null;
    const width = this.state.board[0].length;
    let removed = false;
    this.state.pending = this.state.pending.filter((match) => {
      if (now - match.started < DRAW_MS) return true;
      removed = true;
      for (const index of match.tiles)
        this.state.board[Math.floor(index / width)][index % width] = null;
      return false;
    });
    if (this.state.board.every((row) => row.every((tile) => tile === null)))
      this.state.status = "won";
    else if (this.state.pending.length === 0 && now >= this.deadline)
      this.state.status = "timeout";
    else if (
      removed &&
      this.state.pending.length === 0 &&
      !hasConnection(this.state.board)
    )
      this.state.status = "deadlock";
    if (this.state.status !== "playing") this.state.selected = null;
  }
}

/** Geometry shared by gameplay and the generator; endpoints are occupied tiles. */
export function connection(board: Board, a: Point, b: Point): Point[] | null {
  if (a.x === b.x && a.y === b.y) return null;
  const horizontalFree = (row: number, from: number, to: number) => {
    for (let x = Math.min(from, to) + 1; x < Math.max(from, to); x++) {
      if (board[row][x] !== null) return false;
    }
    return true;
  };
  if (a.y === b.y) return horizontalFree(a.y, a.x, b.x) ? [a, b] : null;
  for (let x = 0; x < board[0].length; x++) {
    if (x === a.x || x === b.x) continue;
    if (!horizontalFree(a.y, a.x, x) || !horizontalFree(b.y, b.x, x)) continue;
    let free = true;
    for (let y = Math.min(a.y, b.y); y <= Math.max(a.y, b.y); y++) {
      if (board[y][x] !== null) {
        free = false;
        break;
      }
    }
    if (free) return [a, { x, y: a.y }, { x, y: b.y }, b];
  }
  return null;
}

function hasConnection(board: Board): boolean {
  const width = board[0].length;
  const tiles = board.flat();
  for (let a = 0; a < tiles.length; a++) {
    if (tiles[a] === null) continue;
    for (let b = a + 1; b < tiles.length; b++) {
      if (
        tiles[a] === tiles[b] &&
        connection(
          board,
          { x: a % width, y: Math.floor(a / width) },
          { x: b % width, y: Math.floor(b / width) },
        )
      )
        return true;
    }
  }
  return false;
}
