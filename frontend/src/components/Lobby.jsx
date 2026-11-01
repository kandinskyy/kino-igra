import { emblems, robotIndex } from "../config/playerSymbols";
import { useState } from "react";
import { useGame } from "../GameContext";
import { copyText } from "../utils/clipboard";
import { Avatar, Emblem } from "./Identity";
import { LockKeyhole } from "lucide-react";
export default function Lobby() {
  const {
    socket,
    gameState: g,
    player,
    leaveGame,
    closeLobby,
    showToast,
    showConfirm,
  } = useGame();
  const host = g.host === player?.id,
    me = g.players.find((p) => p.id === player?.id) || player;
  const [draft, setDraft] = useState(String(g.targetVP)),
    [busy, setBusy] = useState(false);
  async function request(event, data) {
    const r = await socket.timeout(10000).emitWithAck(event, data);
    if (!r.success) throw Error(r.message || "Действие недоступно");
    return r;
  }
  async function saveTarget() {
    const value = Number(draft);
    if (!Number.isInteger(value) || value < 1 || value > 999) {
      showToast("Введите целое число от 1 до 999", "error");
      setDraft(String(g.targetVP));
      return false;
    }
    if (value !== g.targetVP)
      await request("update_target_vp", { lobbyId: g.id, targetVP: value });
    return true;
  }
  async function launch() {
    setBusy(true);
    try {
      if (await saveTarget()) await request("launch_game", g.id);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setBusy(false);
    }
  }
  async function copy() {
    try {
      await copyText(new URL("?room=" + g.id, location.origin).href);
      showToast("Ссылка скопирована", "success");
    } catch {
      showToast("Не удалось скопировать ссылку", "error");
    }
  }
  async function manage(event, p) {
    if (
      !(await showConfirm(
        event === "kick_player"
          ? `Исключить «${p.nickname}»?`
          : `Передать права ведущего игроку «${p.nickname}»?`,
        {
          title:
            event === "kick_player" ? "Исключить игрока" : "Передать права",
          confirmText: event === "kick_player" ? "Исключить" : "Передать права",
          isDanger: event === "kick_player",
        },
      ))
    )
      return;
    try {
      await request(event, {
        lobbyId: g.id,
        playerId: p.id,
        targetPlayerId: p.id,
      });
    } catch (e) {
      showToast(e.message, "error");
    }
  }
  return (
    <section className="lobby-page">
      <div className="page-heading">
        <div>
          <h1>Комната ожидания</h1>
        </div>
        <div className="heading-actions">
          <button className="btn-secondary" onClick={leaveGame}>
            Выйти
          </button>
          {host && (
            <button
              className="quiet-button danger"
              onClick={async () => {
                if (
                  await showConfirm("Закрыть комнату для всех участников?", {
                    title: "Закрыть комнату",
                    confirmText: "Закрыть комнату",
                    isDanger: true,
                  })
                )
                  closeLobby();
              }}
            >
              Закрыть комнату
            </button>
          )}
        </div>
      </div>
      <div className="lobby-grid">
        <section className="surface players-panel">
          <div className="section-heading">
            <h2>Игроки</h2>
            <span>
              {g.players.filter((p) => p.connected).length} в сети /{" "}
              {g.players.length} из 16
            </span>
          </div>
          <div className="players-list">
            {g.players.map((p) => (
              <div
                key={p.id}
                className={`player-row ${!p.connected ? "offline" : ""}`}
              >
                <Avatar player={p} />
                <div className="player-name">
                  <strong>
                    {p.nickname}
                    {p.id === player?.id && <small> · вы</small>}
                  </strong>
                  <span>
                    {p.id === g.host
                      ? "Ведущий"
                      : p.connected
                        ? "В комнате"
                        : "Отключился"}
                  </span>
                </div>
                {host && p.id !== player?.id && (
                  <div className="player-actions">
                    {p.connected && (
                      <button
                        title={`Передать права: ${p.nickname}`}
                        onClick={() => manage("transfer_host", p)}
                      >
                        Ведущий
                      </button>
                    )}
                    <button
                      aria-label={`Исключить ${p.nickname}`}
                      title="Исключить"
                      onClick={() => manage("kick_player", p)}
                    >
                      ×
                    </button>
                  </div>
                )}
                <span
                  className={`status-dot ${p.connected ? "online" : ""}`}
                  aria-label={p.connected ? "В сети" : "Не в сети"}
                />
              </div>
            ))}
          </div>
          <div className="identity-picker">
            <div>
              <h3>Ваш персонаж и цвет</h3>
            </div>
            <div className="robot-preview">
              <Emblem color={me?.color} full />
              <div>
                <strong>{emblems[robotIndex(me?.color)].name}</strong>
                <span>{emblems[robotIndex(me?.color)].film}</span>
              </div>
            </div>
            <div className="symbol-grid">
              {g.allColors.map((c, i) => {
                const occupied = g.players.find(
                  (p) =>
                    p.id !== player?.id &&
                    p.color.toLowerCase() === c.hex.toLowerCase(),
                );
                return (
                  <button
                    key={c.hex}
                    className={me?.color === c.hex ? "selected" : ""}
                    disabled={!!occupied}
                    title={`${emblems[i].name} · ${emblems[i].film}${occupied ? " — занят: " + occupied.nickname : ""}`}
                    aria-label={`${emblems[i].name}, ${emblems[i].colorName}`}
                    aria-pressed={me?.color === c.hex}
                    style={{ "--player-color": emblems[i].color }}
                    onClick={async () => {
                      try {
                        await request("change_color", {
                          lobbyId: g.id,
                          color: c.hex,
                        });
                      } catch (e) {
                        showToast(e.message, "error");
                      }
                    }}
                  >
                    <Emblem index={i} />
                    {occupied && (
                      <LockKeyhole
                        className="costume-lock"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
        <aside className="surface room-settings">
          <h2>Пригласить друзей</h2>
          <button
            className="copy-code"
            onClick={copy}
            title="Скопировать ссылку"
          >
            <span>{g.id}</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <rect x="8" y="8" width="12" height="13" rx="2" />
              <path d="M16 8V3H3v13h5" />
            </svg>
          </button>
          <button className="text-link" onClick={copy}>
            Скопировать приглашение
          </button>
          <div className="target-setting">
            <label htmlFor="target-vp">Цель игры</label>
            {host ? (
              <div className="target-input">
                <input
                  id="target-vp"
                  type="number"
                  min="1"
                  max="999"
                  step="1"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={() =>
                    saveTarget().catch((e) => showToast(e.message, "error"))
                  }
                />
                <span>очков</span>
              </div>
            ) : (
              <strong>{g.targetVP} очков</strong>
            )}
            <p>
              {host ? "Введите число от 1 до 999" : "Цель выбирает ведущий"}
            </p>
          </div>
          <div className="setting-line">
            <span>Время на раунд</span>
            <strong>60 секунд</strong>
          </div>
          {host ? (
            <button
              className="btn-primary full"
              disabled={g.players.filter((p) => p.connected).length < 2 || busy}
              onClick={launch}
            >
              {busy ? "Запускаем…" : "Начать игру"}
            </button>
          ) : (
            <p className="waiting-note">Ведущий скоро начнёт игру</p>
          )}
          {g.players.filter((p) => p.connected).length < 2 && (
            <p className="waiting-note">Для старта нужен ещё один игрок</p>
          )}
        </aside>
      </div>
    </section>
  );
}
