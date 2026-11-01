import { useEffect, useState } from "react";
import { Avatar } from "./Identity";
import Character from "./Character";
import PlaceMedal from "./PlaceMedal";
import ConfettiCannons from "./ConfettiCannons";
export default function PodiumCeremony({
  players,
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
              const p = sorted[index];
              if (!p) return null;
              const visible = step >= (index === 2 ? 1 : index === 1 ? 2 : 3);
              const rank = sorted.findIndex((x) => x.vp === p.vp) + 1;
              return (
                <div
                  key={p.id}
                  className={`podium-person place-${index + 1} medal-${rank} ${visible ? "visible" : ""}`}
                >
                  <div className="podium-identity">
                    <strong>{p.nickname}</strong>
                    <span>{p.vp} очков</span>
                    <Character
                      color={p.color}
                      full
                      celebrate={step === 3}
                      className="podium-character"
                    />
                  </div>
                  <div className="podium-block">
                    <span className="podium-place">
                      {rank}
                      <small>место</small>
                    </span>
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
              const rank = sorted.findIndex((x) => x.vp === p.vp) + 1;
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
