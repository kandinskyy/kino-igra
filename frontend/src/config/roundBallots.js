const order = { S: 0, A: 1, B: 2, C: 3, D: 4 };

export function playersByRating(players, ratings, movieId) {
  return [...players].sort((a, b) =>
    (order[ratings?.[a.id]?.[movieId]] ?? 5) -
    (order[ratings?.[b.id]?.[movieId]] ?? 5),
  );
}
