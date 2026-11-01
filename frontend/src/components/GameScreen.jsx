import { useEffect, useState } from "react";
import { useGame } from "../GameContext";
import { Avatar, Poster } from "./Identity";
import RoundReveal from "./RoundReveal";
import PodiumCeremony from "./PodiumCeremony";
const ranks = ["S", "A", "B", "C", "D"];
export default function GameScreen() {
  const {
    socket,
    gameState: g,
    player,
    leaveGame,
    showConfirm,
    showToast,
  } = useGame();
  const host = g.host === player?.id,
    reveal = g.state === "reveal";
  const [clock, setClock] = useState({
    timeLeft: g.timeLeft,
    running: g.timerRunning,
  });
  const [pending, setPending] = useState(false);
  useEffect(() => {
    const onTick = (data) =>
      setClock({ timeLeft: data.timeLeft, running: data.isRunning });
    socket.on("timer_tick", onTick);
    return () => socket.off("timer_tick", onTick);
  }, [socket]);
  useEffect(
    () => setClock({ timeLeft: g.timeLeft, running: g.timerRunning }),
    [g.timeLeft, g.timerRunning],
  );
  async function request(event, data) {
    try {
      const r = await socket.timeout(10000).emitWithAck(event, data);
      if (!r.success) throw Error(r.message || "Действие недоступно");
      return r;
    } catch (e) {
      showToast(
        e.message === "operation has timed out"
          ? "Сервер не ответил. Повторите действие."
          : e.message,
        "error",
      );
      return null;
    }
  }
  async function rate(movieId, rating) {
    if (pending) return;
    setPending(true);
    await request("submit_rating", {
      lobbyId: g.id,
      movieId,
      rating,
      roundId: g.roundId,
    });
    setPending(false);
  }
  async function manage(event, p) {
    if (
      await showConfirm(
        event === "kick_player"
          ? `Исключить «${p.nickname}»?`
          : `Передать права ведущего игроку «${p.nickname}»?`,
        { title: "Управление игроком", confirmText: "Подтвердить" },
      )
    )
      await request(event, {
        lobbyId: g.id,
        playerId: p.id,
        targetPlayerId: p.id,
      });
  }
  async function end() {
    if (
      !g.allVoted &&
      !(await showConfirm(
        "Оставшиеся оценки будут распределены случайно. Раскрыть раунд?",
        { title: "Завершить раунд", confirmText: "Раскрыть оценки" },
      ))
    )
      return;
    await request("end_round_early", g.id);
  }
  async function resume() {
    if (g.pausedDueToDisconnect)
      await request("dismiss_disconnect_pause", { lobbyId: g.id });
    await request("resume_timer", g.id);
  }
  const mine = g.ratings?.[player?.id] || {},
    progress = g.progress || {},
    count = Object.keys(mine).length;
  const active = g.players.filter((p) => p.connected),
    ready = active.filter((p) => (progress[p.id] || 0) === 5).length;
  if (g.state === "game_over")
    return (
      <PodiumCeremony
        players={g.players}
        isHost={host}
        onRestartGame={() => request("restart_game", g.id)}
        onLeaveGame={leaveGame}
      />
    );
  return (
    <section className={`game-page ${!reveal && g.allVoted ? "everyone-ready" : ""}`}>
      <div className="page-heading">
        <div>
          <span className="overline">
            Раунд {g.roundId} · цель {g.targetVP} очков
          </span>
          <h1>
            {reveal
              ? "Вскрываем оценки"
              : g.allVoted
                ? "Все готовы"
                : "Расставьте фильмы по местам"}
          </h1>
        </div>
        <div className="game-top-actions">
          {!reveal && (
            <div className="timer">
              <span className={clock.running ? "running" : ""}>
                {Math.floor(clock.timeLeft / 60)}:
                {String(clock.timeLeft % 60).padStart(2, "0")}
              </span>
              {host && (
                <button
                  className="btn-secondary"
                  onClick={() =>
                    clock.running ? request("pause_timer", g.id) : resume()
                  }
                >
                  {clock.running
                    ? "Пауза"
                    : clock.timeLeft === 60
                      ? "Запустить таймер"
                      : "Продолжить"}
                </button>
              )}
            </div>
          )}
          <button
            className="quiet-button"
            onClick={async () => {
              if (
                await showConfirm(
                  "Выйти из игры? Вернуться можно из этого браузера.",
                  { title: "Выйти из игры" },
                )
              )
                leaveGame();
            }}
          >
            Выйти
          </button>
        </div>
      </div>
      {g.pausedDueToDisconnect && (
        <div className="disconnect-notice" role="status">
          <span>
            Игрок «{g.disconnectedPlayerName}» отключился. Таймер на паузе.
          </span>
          {host && (
            <button className="btn-secondary" onClick={resume}>
              Продолжить без него
            </button>
          )}
        </div>
      )}
      <div className="game-roster">
        {g.players.map((p) => (
          <div
            className={`roster-player ${!p.connected ? "offline" : ""}`}
            key={p.id}
          >
            <Avatar player={p} />
            <div>
              <strong>
                {p.nickname}
                {p.id === player?.id ? " · вы" : ""}
              </strong>
              <span>
                {reveal
                  ? `${g.roundPoints?.[p.id] || 0} за раунд · ${p.vp} всего`
                  : p.connected
                    ? `${progress[p.id] || 0}/5 фильмов`
                    : "Не в сети"}
              </span>
            </div>
            {!reveal && (progress[p.id] || 0) === 5 && (
              <span className="ready-check" aria-label="Готов">
                ✓
              </span>
            )}
            {host && p.id !== player?.id && (
              <details className="player-menu">
                <summary aria-label={`Действия: ${p.nickname}`}>···</summary>
                <div>
                  {p.connected && (
                    <button onClick={() => manage("transfer_host", p)}>
                      Передать права
                    </button>
                  )}
                  <button onClick={() => manage("kick_player", p)}>
                    Исключить
                  </button>
                </div>
              </details>
            )}
          </div>
        ))}
      </div>
      {!reveal ? (
        <>
          <p className="rank-instruction">
            S — шедевр, D — не моё. Каждый ранг используется один раз.
          </p>
          <div className="movie-grid">
            {g.movies.map((m, index) => (
              <article
                className={`movie-card ${mine[m.id] ? "rated rank-" + mine[m.id] : ""}`}
                key={m.id}
              >
                <div className="movie-poster">
                  <Poster movie={m} priority={index === 0} />
                  {mine[m.id] && (
                    <span className={`rank-stamp rank-${mine[m.id]}`}>
                      {mine[m.id]}
                    </span>
                  )}
                </div>
                <h2>{m.title.replace(/ \(\d{4}\)$/, "")}</h2>
                <span className="movie-year">
                  {m.title.match(/\((\d{4})\)$/)?.[1] || "Фильм"}
                </span>
                <div
                  className="rank-options"
                  role="group"
                  aria-label={`Оценить ${m.title}`}
                >
                  {ranks.map((r) => (
                    <button
                      key={r}
                      className={`rank-${r} ${mine[m.id] === r ? "chosen" : Object.values(mine).includes(r) ? "rank-used" : ""}`}
                      disabled={pending}
                      onClick={() => rate(m.id, r)}
                      aria-pressed={mine[m.id] === r}
                      aria-label={`${r}: ${m.title}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <div className="round-controls">
            <div>
              <strong>
                {count === 5
                  ? "Вы оценили все фильмы"
                  : `Ваши оценки: ${count} из 5`}
              </strong>
              <span>
                Готовы {ready} из {active.length} игроков
              </span>
            </div>
            {host ? (
              <button className="btn-primary" onClick={end}>
                {g.allVoted ? "Раскрыть оценки" : "Завершить раунд досрочно"}
              </button>
            ) : (
              <p className="muted">
                {g.allVoted
                  ? "Ведущий раскрывает оценки"
                  : "Ожидаем остальных игроков"}
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          <RoundReveal game={g} />
          <div className="round-controls">
            <div>
              <strong>
                {g.isFinalRound ? "Победный порог достигнут" : "Раунд завершён"}
              </strong>
              <span>
                {g.isFinalRound
                  ? "Сначала обсудите оценки, затем откройте итоги игры."
                  : "Каждое совпадение с другим игроком — одно очко."}
              </span>
            </div>
            {host ? (
              <button
                className="btn-primary"
                onClick={() =>
                  request(g.isFinalRound ? "finish_game" : "next_round", g.id)
                }
              >
                {g.isFinalRound ? "Итоги игры" : "Следующий раунд"}
              </button>
            ) : (
              <p className="muted">
                {g.isFinalRound
                  ? "Ожидаем итоги игры от ведущего"
                  : "Ожидаем следующий раунд"}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
