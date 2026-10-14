const shapes = [
  [
    "Sun",
    "#ffe59a",
    "#855900",
    '<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
  ],
  [
    "Star",
    "#cfc6fa",
    "#5b408c",
    '<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>',
  ],
  [
    "Heart",
    "#ffc6d6",
    "#9a3455",
    '<path d="M12 21 3 12C-3 4 7-1 12 6 17-1 27 4 21 12Z"/>',
  ],
  [
    "Moon",
    "#bfdaf9",
    "#315d95",
    '<path d="M20 16A10 10 0 0 1 8 3a9 9 0 1 0 12 13Z"/>',
  ],
  [
    "Leaf",
    "#b9e3c6",
    "#2b6d49",
    '<path d="M20 3C5 1 1 9 6 17c8 6 17-1 14-14ZM4 21 16 8"/>',
  ],
  ["Diamond", "#ffd0ac", "#995126", '<path d="m12 2 9 10-9 10-9-10Z"/>'],
  [
    "Flower",
    "#e6c8eb",
    "#83468e",
    '<path d="M12 8C3-5-3 10 8 12-5 21 10 27 12 16c9 13 15-2 4-4C29 3 14-3 12 8Z"/>',
  ],
  ["Bolt", "#d9e6a6", "#5d711e", '<path d="M14 1 4 14h7l-1 9 10-14h-7Z"/>'],
  [
    "Wave",
    "#aee4e3",
    "#256e79",
    '<path d="M2 8c5-8 8 8 13 0s7 0 7 0M2 16c5-8 8 8 13 0s7 0 7 0"/>',
  ],
  ["Bow", "#f6bbb6", "#9a4945", '<path d="M12 12 3 4v16l9-8 9-8v16Z"/>'],
] as const;

export const tiles = shapes.map(([name, color, ink, shape]) => ({
  name,
  color,
  ink,
  icon: `<svg viewBox="-2 -2 28 28" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${shape}</svg>`,
}));
