import { criticNameStyle } from "../config/playerSymbols";
import AnimatedScoreList from "./AnimatedScoreList";
import { Avatar } from "./Identity";
import { denseRank } from "../config/places";
export default function MatchScores({ game: g, me, animation: a }) {
  const visible = g.hiddenMode
    ? g.players.filter((p) => p.id === me)
    : [...g.players].sort((p, q) =>
        a.complete
          ? q.vp - p.vp
          : q.vp -
            (g.roundPoints?.[q.id] || 0) -
            (p.vp - (g.roundPoints?.[p.id] || 0)),
      );
  const order = visible.map((p) => p.id).join(",");
  const ranked = g.players.map((p) => ({
    ...p,
    vp: a.complete ? p.vp : p.vp - (g.roundPoints?.[p.id] || 0),
  }));
  return (
    <AnimatedScoreList
      order={order}
      className={g.hiddenMode ? "personal-score" : "match-leaderboard"}
      label={g.hiddenMode ? "Ваши очки" : "Таблица игроков"}
    >
      {visible.map((p) => (
        <div
          className={`match-score-row ${!g.hiddenMode && g.mode === "opinion" && p.id === g.criticId ? "current-critic" : ""}`}
          style={criticNameStyle(p.color)}
          key={p.id}
          data-score-id={p.id}
        >
          {!g.hiddenMode && (
            <>
              <span className="score-place">
                {denseRank(
                  ranked,
                  a.complete ? p.vp : p.vp - (g.roundPoints?.[p.id] || 0),
                )}
              </span>
              <Avatar player={p} />
              <strong>{p.nickname}</strong>
            </>
          )}
          {g.hiddenMode && <strong>Ваши очки:</strong>}
          <span className="score-number">{a.scores[p.id] ?? 0}</span>
          {g.hiddenMode && a.showBonus && !!g.roundPoints?.[p.id] && (
            <span className={`score-add ${a.merging ? "merging" : ""}`}>
              + {g.roundPoints[p.id]}
            </span>
          )}
        </div>
      ))}
    </AnimatedScoreList>
  );
}
