import { useEffect, useState } from "react";
import { denseRank } from "../config/places";
import { Avatar } from "./Identity";
import Character from "./Character";
import PlaceMedal from "./PlaceMedal";
import ConfettiCannons from "./ConfettiCannons";
export default function PodiumCeremony({
  players,
  history = [],
  isHost,
  onRestartGame,
  onLeaveGame,
}) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [step, setStep] = useState(reduced ? 3 : 0),
    [view, setView] = useState("podium"),
    [fire, setFire] = useState(0);
  const sorted = [...players].sort(
    (a, b) => b.vp - a.vp || a.nickname.localeCompare(b.nickname),
  );
  const winner = sorted[0],
    tied = sorted.filter((p) => p.vp === winner?.vp);
  useEffect(() => {
    if (reduced || view !== "podium") return;
    const timers = [
      setTimeout(() => setStep(1), 600),
      setTimeout(() => setStep(2), 1500),
      setTimeout(() => {
        setStep(3);
        setFire(Date.now());
      }, 2500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reduced, view]);
  return (
    <section className="ceremony">
      <ConfettiCannons fireTrigger={fire} />
      {view === "podium" ? (
        <>
          <div className="ceremony-heading">
            <span className="overline">Игра завершена</span>
            <h1>
              {step < 3
                ? "Встречаем победителей"
                : tied.length > 1
                  ? "Разделили победу"
                  : `Побеждает ${winner?.nickname}`}
            </h1>
            <p>
              {step < 3
                ? ""
                : tied.length > 1
                  ? `${tied.map((p) => p.nickname).join(", ")} — по ${winner.vp} очков`
                  : `${winner.vp} очков за совпадения`}
            </p>
          </div>
          <div className={`podium-stage ${step === 3 ? "celebrating" : ""}`}>
            <div className="stage-halo" aria-hidden="true" />
            {[1, 0, 2].map((index) => {
              const group = sorted.filter(p=>denseRank(sorted,p.vp)===index+1);
              const visible = step >= (index === 2 ? 1 : index === 1 ? 2 : 3);
              const rank = index + 1;
              return (
                <div
                  key={index}
                  style={{"--podium-count":Math.max(group.length,1)}}
                  className={`podium-person place-${index + 1} medal-${rank} ${visible ? "visible" : ""}`}
                >
                  <div className="podium-members">{group.map(member=><Character key={member.id} color={member.color} full celebrate={step===3} className="podium-character"/>)}</div>
                  <div className="podium-block">
                    <span className="podium-place">
                      {rank}
                      <small>место</small>
                    </span>
                    <div className={`podium-names names-${rank}`}>{group.map(member=><strong key={member.id}>{member.nickname}</strong>)}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="btn-secondary" onClick={() => setView("table")}>
            Таблица всех игроков
          </button>
        </>
      ) : (
        <>
          <div className="page-heading">
            <div>
              <span className="overline">Игра завершена</span>
              <h1>Итоговая таблица</h1>
            </div>
            <button
              className="quiet-button"
              onClick={() => {
                setStep(reduced ? 3 : 0);
                setView("podium");
              }}
            >
              Пьедестал
            </button>
          </div>
          <div className="final-leaderboard">
            {sorted.map((p) => {
              const rank = denseRank(sorted,p.vp);
              return (
                <div
                  className={`leader-row ${p.vp === winner.vp ? "leader-winner" : ""}`}
                  key={p.id}
                >
                  {rank <= 3 ? (
                    <PlaceMedal rank={rank} className="leader-place" />
                  ) : (
                    <span className="leader-place">{rank}</span>
                  )}
                  <Avatar player={p} />
                  <strong>{p.nickname}</strong>
                  <span className="leader-score">
                    {p.vp}
                    <small> очков</small>
                  </span>
                </div>
              );
            })}
          </div>
          {history.length > 0 && <section className="round-history">
            <h2>История раундов</h2>
            {history.map(round => {
              const critic = round.players.find(p => p.id === round.criticId);
              return <details key={round.roundId}>
                <summary><span>Раунд {round.roundId}</span>{critic && <span className="history-critic"><span>Критик:</span><Avatar player={critic}/><strong style={{color:critic.color}}>{critic.nickname}</strong></span>}</summary>
                <div>{round.movies.map(m => <article className="history-film" key={m.id}>
                  <h3>{m.title}</h3>
                  <div className="history-ballots">{round.players.map(p => <div className="history-ballot" key={p.id}>
                    <Avatar player={p}/>
                    <span className="history-player"><strong style={{color:p.color}}>{p.nickname}</strong>{p.id === round.criticId && <small>Критик</small>}</span>
                    <strong className={`history-rating rank-${round.ratings[p.id]?.[m.id]}`}>{round.ratings[p.id]?.[m.id] || '—'}</strong>
                    {round.autoRatings[p.id]?.[m.id] && <small>Авто</small>}
                  </div>)}</div>
                </article>)}</div>
              </details>;
            })}
          </section>}
          <div className="final-actions">
            <button className="btn-secondary" onClick={onLeaveGame}>
              В главное меню
            </button>
            {isHost && (
              <button className="btn-primary" onClick={onRestartGame}>
                Новая игра
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
