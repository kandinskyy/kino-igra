import { useState, useEffect } from "react";
import { useGame } from "../GameContext";
import { storage } from "../utils/storage";
import { rememberSession, roomAddress } from "../config/sessionRouting";
import { Poster } from "./Identity";
export default function MainMenu() {
  const { socket, setPlayer, setGameState, showToast, isConnected } = useGame();
  const [nickname, setNickname] = useState(
    () => storage.getItem("kino_lastNickname") || "",
  );
  const [code, setCode] = useState(
    () =>
      new URLSearchParams(location.search).get("room") ||
      storage.getItem("kino_lastLobbyId") ||
      "",
  );
  const [mode, setMode] = useState(() =>
    new URLSearchParams(location.search).has("room") ? "join" : "create",
  );
  const [busy, setBusy] = useState(false),
    [movies, setMovies] = useState([]);
  const [errors, setErrors] = useState({});
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/preview-movies", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then(setMovies)
      .catch(() => {});
    return () => controller.abort();
  }, []);
  async function enter(e) {
    e.preventDefault();
    const nextErrors = {};
    if (!nickname.trim()) nextErrors.nickname = "Введите никнейм";
    if (mode === "join" && !/^[A-Z0-9]{6}$/.test(code.trim().toUpperCase()))
      nextErrors.code = "Введите код из 6 латинских букв или цифр";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      e.currentTarget.elements
        .namedItem(nextErrors.nickname ? "nickname" : "room-code")
        ?.focus();
      return;
    }
    if (busy || !isConnected) return;
    setBusy(true);
    try {
      let lobbyId = code.trim().toUpperCase();
      if (mode === "create") {
        const r = await socket
          .timeout(10000)
          .emitWithAck("create_lobby", { targetVP: 30 });
        if (!r.success) throw Error(r.message);
        lobbyId = r.lobbyId;
      }
      const r = await socket.timeout(10000).emitWithAck("join_lobby", {
        lobbyId,
        nickname: nickname.trim(),
        sessionToken: storage.getItem("kino_token_" + lobbyId),
      });
      if (!r.success) throw Error(r.message);
      rememberSession(storage, lobbyId, r.player);
      history.replaceState(null, "", roomAddress(location.href, lobbyId));
      setPlayer(r.player);
      setGameState(r.lobby);
    } catch (err) {
      showToast(
        err.message === "operation has timed out"
          ? "Сервер не ответил. Повторите попытку."
          : err.message,
        "error",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="home-layout">
      <section className="home-hero">
        <h1>
          Кино одно.
          <br />
          Мнения разные.
        </h1>
        <div
          className="poster-fan"
          aria-label="Случайные фильмы из игрового каталога"
        >
          {movies.map((m, i) => (
            <div
              key={m.id}
              className="fan-film"
              style={{
                "--i": i,
                "--rise": [0, 13, 23, 13, 0][i],
                zIndex: [1, 2, 5, 3, 1][i],
              }}
              title={m.title}
            >
              <Poster movie={m} variant="fan" priority={i === 2} />
            </div>
          ))}
        </div>
      </section>
      <section className="entry-panel">
        <h2>Начать игру</h2>
        <div className="entry-tabs" role="tablist" aria-label="Способ входа">
          <button
            role="tab"
            aria-selected={mode === "create"}
            onClick={() => {
              setMode("create");
              setErrors({});
            }}
          >
            Создать комнату
          </button>
          <button
            role="tab"
            aria-selected={mode === "join"}
            onClick={() => {
              setMode("join");
              setErrors({});
            }}
          >
            Войти по коду
          </button>
        </div>
        <form onSubmit={enter} noValidate>
          <label htmlFor="nickname">Никнейм</label>
          <input
            id="nickname"
            name="nickname"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setErrors((current) => ({ ...current, nickname: undefined }));
            }}
            aria-invalid={Boolean(errors.nickname)}
            aria-describedby={errors.nickname ? "nickname-error" : undefined}
            placeholder="Как вас называть?"
            maxLength={15}
            autoComplete="nickname"
            required
          />
          {errors.nickname && (
            <p id="nickname-error" className="entry-error" role="alert">
              {errors.nickname}
            </p>
          )}
          {mode === "join" && (
            <>
              <label htmlFor="room-code">Код комнаты</label>
              <input
                id="room-code"
                name="room-code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setErrors((current) => ({ ...current, code: undefined }));
                }}
                aria-invalid={Boolean(errors.code)}
                aria-describedby={errors.code ? "room-code-error" : undefined}
                placeholder="ABC123"
                maxLength={6}
                autoComplete="off"
                spellCheck={false}
                required
              />
              {errors.code && (
                <p id="room-code-error" className="entry-error" role="alert">
                  {errors.code}
                </p>
              )}
            </>
          )}
          <button className="btn-primary full" disabled={busy || !isConnected}>
            {busy
              ? "Подключаемся…"
              : mode === "create"
                ? "Создать игру"
                : "Войти в игру"}
          </button>
        </form>
        <span className="entry-foot">2–16 игроков</span>
      </section>
    </div>
  );
}
