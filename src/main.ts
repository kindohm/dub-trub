import "./style.css";
import { Game, DRAW_MS } from "./game";
import { generateBoard } from "./generator";
import { tiles } from "./tiles";

const requestedSeconds = Number(
  new URLSearchParams(location.search).get("seconds"),
);
let seconds =
  Number.isFinite(requestedSeconds) && requestedSeconds > 0
    ? Math.min(3600, requestedSeconds)
    : 180;
let game = new Game(generateBoard().board, seconds * 1000);
const app = document.querySelector<HTMLElement>("#app")!;
app.innerHTML = `
  <header class="masthead"><a href="./" aria-label="Double Trouble home">double<span>trouble</span><i aria-hidden="true">✳</i></a><span class="tagline">A little match. A little mayhem.</span></header>
  <div class="game-layout">
    <aside class="intro"><h1>Two of<br>a kind.<br><em>Clear your<br>mind.</em></h1>
      <p>Find a matching pair.<br>Make a connection.<br>Beat the clock.</p>
      <details open><summary>How to play</summary><p>Click or tap two tiles with the same symbol and color.</p><p>Connections enter from the sides: straight across, or with two bends through open space. They stay inside the board.</p><p>Start in the center. Clearing a pair opens new paths. No connections left? That’s game over.</p></details>
      <span class="edition">The first playable · 10 × 8</span>
    </aside>
    <section class="play-area" aria-label="Double Trouble game">
      <div class="dashboard"><div><span class="stat-label">Time left</span><strong id="clock" role="timer">3:00</strong></div><div class="pair-stat"><span class="stat-label">Pairs cleared</span><strong><span id="cleared">0</span><small> / 40</small></strong></div><button class="quiet" id="reset">New board</button></div>
      <div class="timer-track" aria-hidden="true"><div id="timer-fill"></div></div>
      <div class="board-shell"><div class="board" aria-label="Tile board"></div><svg class="connections" viewBox="0 0 1000 800" aria-hidden="true"></svg>
        <div class="overlay" id="overlay"><div class="welcome"><div class="pair-mark" aria-hidden="true">✳ ✳</div><h2>Ready to connect?</h2><p>80 tiles. 40 pairs.<br>A little space makes all the difference.</p><label class="duration-label">Seconds per board <input id="duration" type="number" min="1" max="3600" value="${seconds}"></label><button class="primary" id="start">Start</button><span class="start-note">The clock starts when you do.</span></div></div>
      </div>
      <div class="under-board"><span id="message" role="status" aria-live="polite">Take a breath. Then find your first pair.</span><span class="side-note">Match. Connect. Repeat.</span></div>
    </section>
  </div>`;
const board = app.querySelector<HTMLElement>(".board")!;
const connections = app.querySelector<SVGSVGElement>(".connections")!;
const overlay = app.querySelector<HTMLElement>("#overlay")!;
const clock = app.querySelector<HTMLElement>("#clock")!;
const cleared = app.querySelector<HTMLElement>("#cleared")!;
const message = app.querySelector<HTMLElement>("#message")!;
const timerFill = app.querySelector<HTMLElement>("#timer-fill")!;
const reset = app.querySelector<HTMLButtonElement>("#reset")!;
let previousStatus = "";
let buttons: (HTMLButtonElement | null)[] = [];

function buildBoard() {
  board.replaceChildren();
  buttons = game.state.board.flat().map((type, index) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    board.append(cell);
    if (game.state.status === "ready" || type === null) return null;
    const tile = tiles[type];
    const button = document.createElement("button");
    button.className = "tile";
    button.dataset.index = String(index);
    button.style.setProperty("--tile-color", tile.color);
    button.style.setProperty("--tile-ink", tile.ink);
    button.setAttribute(
      "aria-label",
      `${tile.name}, row ${Math.floor(index / 10) + 1}, column ${(index % 10) + 1}`,
    );
    button.innerHTML = tile.icon;
    button.addEventListener("click", () => {
      game.select(index, performance.now());
      render(performance.now());
    });
    cell.append(button);
    return button;
  });
}

function start() {
  const input = app.querySelector<HTMLInputElement>("#duration")!;
  if (!input.reportValidity()) return;
  seconds = Number(input.value);
  if (!Number.isFinite(seconds) || seconds < 1 || seconds > 3600) return;
  game = new Game(game.state.board, seconds * 1000);
  game.start(performance.now());
  buildBoard();
  render(performance.now());
  buttons[34]?.focus({ preventScroll: true });
}
function newBoard() {
  game = new Game(generateBoard().board, seconds * 1000);
  previousStatus = "";
  overlay.innerHTML = `<div class="welcome"><div class="pair-mark" aria-hidden="true">✳ ✳</div><h2>Another little challenge?</h2><p>A fresh board, a fresh start.</p><label class="duration-label">Seconds per board <input id="duration" type="number" min="1" max="3600" value="${seconds}"></label><button class="primary" id="start">Start</button><span class="start-note">The clock starts when you do.</span></div>`;
  app.querySelector("#start")!.addEventListener("click", start);
  buildBoard();
  render(performance.now());
  app.querySelector<HTMLButtonElement>("#start")!.focus();
}
function render(now: number) {
  const state = game.state;
  const remaining = Math.ceil(state.remaining / 1000);
  clock.textContent = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;
  clock.classList.toggle(
    "urgent",
    state.remaining <= 30_000 && state.status === "playing",
  );
  timerFill.style.transform = `scaleX(${state.remaining / (seconds * 1000)})`;
  const flat = state.board.flat();
  cleared.textContent = String(
    (80 - flat.filter((tile) => tile !== null).length) / 2,
  );
  buttons.forEach((button, index) => {
    if (!button) return;
    if (flat[index] === null) {
      button.remove();
      buttons[index] = null;
      return;
    }
    const pending = state.pending.some((match) => match.tiles.includes(index));
    button.disabled =
      pending || state.status !== "playing" || state.remaining === 0;
    button.classList.toggle("pending", pending);
    button.classList.toggle("selected", state.selected === index);
    button.setAttribute("aria-pressed", String(state.selected === index));
  });
  connections.innerHTML = state.pending
    .map((match) => {
      // Stop at the tile's side edge, not its center; centers of empty cells form the route.
      const points = match.path.map((point) => ({
        x: point.x * 100 + 50,
        y: point.y * 100 + 50,
      }));
      points[0].x += Math.sign(points[1].x - points[0].x) * 43;
      const end = points.length - 1;
      points[end].x += Math.sign(points[end - 1].x - points[end].x) * 43;
      const progress = Math.min(1, (now - match.started) / DRAW_MS);
      return `<polyline class="connection" points="${points.map((p) => `${p.x},${p.y}`).join(" ")}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1 - progress}"/>`;
    })
    .join("");
  if (previousStatus === state.status) return;
  previousStatus = state.status;
  overlay.hidden = state.status === "playing";
  reset.hidden =
    state.status === "ready" ||
    ["won", "timeout", "deadlock"].includes(state.status);
  if (state.status === "ready")
    message.textContent = "Take a breath. Then find your first pair.";
  if (state.status === "playing")
    message.textContent = "Look for a pair in the center to get things moving.";
  if (["won", "timeout", "deadlock"].includes(state.status)) {
    const title =
      state.status === "won"
        ? "Beautifully cleared."
        : state.status === "timeout"
          ? "Time’s up"
          : "No connections remaining";
    const detail =
      state.status === "won"
        ? "All 40 pairs connected. Nicely done."
        : `You cleared ${cleared.textContent} of 40 pairs. Give a fresh board a go.`;
    overlay.innerHTML = `<div class="welcome"><div class="pair-mark" aria-hidden="true">${state.status === "won" ? "✳" : "↻"}</div><h2>${title}</h2><p>${detail}</p><button class="primary" id="again">New board</button></div>`;
    message.textContent = title;
    const again = app.querySelector<HTMLButtonElement>("#again")!;
    again.addEventListener("click", newBoard);
    again.focus({ preventScroll: true });
  }
}
app.querySelector("#start")!.addEventListener("click", start);
reset.addEventListener("click", newBoard);
buildBoard();
function frame(now: number) {
  game.advance(now);
  render(now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
