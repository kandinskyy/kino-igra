export const denseRank = (players, score) =>
  [...new Set(players.map((p) => p.vp))].sort((a, b) => b - a).indexOf(score) +
  1;
