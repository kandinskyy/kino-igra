import { Avatar, Poster } from "./Identity";
import { playersByRating } from "../config/roundBallots";

export default function RoundReveal({ game: g }) {
  return (
    <div className="movie-grid reveal-grid">
      {g.movies.map((m) => (
        <article className="movie-card reveal-card" key={m.id}>
          <div className="movie-poster">
            <Poster movie={m} />
          </div>
          <h2>{m.title}</h2>
          <div className="film-average">
            <span>Средняя оценка</span>
            <strong>
              {g.roundAverages?.[m.id] || "—"}
              <small> / 5</small>
            </strong>
          </div>
          <ul className="film-ballots" aria-label={`Оценки: ${m.title}`}>
            {playersByRating(g.players, g.ratings, m.id).map((p) => {
              const rating = g.ratings?.[p.id]?.[m.id];
              const bonus = Math.max(
                0,
                (g.roundDetails?.[m.id]?.[rating]?.length || 0) - 1,
              );
              return (
                <li key={p.id}>
                  <Avatar player={p} />
                  <span className="ballot-name">{p.nickname}</span>
                  <span className={`ballot-rank rank-${rating}`}>
                    {rating || "—"}
                  </span>
                  <small
                    className={bonus ? "ballot-bonus" : "ballot-zero"}
                    aria-label={`${bonus} очков за фильм`}
                  >
                    +{bonus}
                  </small>
                </li>
              );
            })}
          </ul>
        </article>
      ))}
    </div>
  );
}
