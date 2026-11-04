import { Avatar, Poster } from "./Identity";
import { playersByRating } from "../config/roundBallots";
export default function MatchReveal({ game: g, me }) {
  const opinion = g.mode === "opinion";
  return (
    <div className="movie-grid reveal-grid">
      {g.movies.map((m, index) => {
        const myRating = g.ratings?.[me]?.[m.id],
          correct = g.criticRatings?.[m.id];
        const points = g.matchPoints?.[m.id] || 0;
        return (
          <article
            key={`${g.roundId}-${m.id}`}
            style={{ "--reveal-delay": `${index * 260}ms` }}
            className={`movie-card reveal-card staged-reveal ${!g.isCritic ? (points ? "guess-hit" : "guess-miss") : ""} ${g.myPerfect ? "perfect-reveal" : ""}`}
          >
            <div className="movie-poster">
              <Poster movie={m} />
            </div>
            <h2>{m.title}</h2>
            {!g.hiddenMode && !opinion && (
              <div className="film-average">
                <span>Средняя оценка</span>
                <strong>
                  {g.roundAverages?.[m.id] || "—"}
                  <small> / 5</small>
                </strong>
              </div>
            )}
            {(g.hiddenMode || opinion) && (
              <div className="personal-ballot">
                <span>
                  {g.isCritic ? "Ваш рейтинг" : "Ваша оценка"}{" "}
                  <strong className={`rank-${myRating}`}>{myRating}</strong>
                  {g.autoRatings?.[me]?.[m.id] && <small>Авто</small>}
                </span>
                {opinion && !g.isCritic && (
                  <span>
                    Критик{" "}
                    <strong className={`rank-${correct}`}>{correct}</strong>
                    {g.criticAuto?.[m.id] && <small>Авто</small>}
                  </span>
                )}
                {!g.isCritic && <strong>+{points}</strong>}
              </div>
            )}
            {!g.hiddenMode && (
              <ul className="film-ballots" aria-label={`Оценки: ${m.title}`}>
                {playersByRating(g.players, g.ratings, m.id).map((p) => {
                  const r = g.ratings?.[p.id]?.[m.id];
                  const bonus = opinion
                    ? p.id !== g.criticId && r === correct
                      ? 1
                      : 0
                    : Math.max(
                        0,
                        (g.roundDetails?.[m.id]?.[r]?.length || 0) - 1,
                      );
                  return (
                    <li key={p.id}>
                      <Avatar player={p} />
                      <span className="ballot-name">
                        {p.nickname}
                        {p.id === g.criticId ? " · критик" : ""}
                        {g.autoRatings?.[p.id]?.[m.id] && (
                          <small> · Авто</small>
                        )}
                      </span>
                      <span className={`ballot-rank rank-${r}`}>
                        {r || "—"}
                      </span>
                      <small className={bonus ? "ballot-bonus" : "ballot-zero"}>
                        +{bonus}
                      </small>
                    </li>
                  );
                })}
              </ul>
            )}
          </article>
        );
      })}
    </div>
  );
}
