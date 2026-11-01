import { useEffect, useState } from "react";
import { useGame } from "./GameContext";
import MainMenu from "./components/MainMenu";
import Lobby from "./components/Lobby";
import GameScreen from "./components/GameScreen";
import RainBackground from "./components/RainBackground";
import ModalDialog from "./components/ModalDialog";
import { Cloud } from "./components/Identity";
export default function App() {
  const { gameState, isConnected, connectionMessage, reconnect, showAlert } =
    useGame();
  const allVoted = gameState?.state === "round_start" && gameState.allVoted;
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 12000);
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      <RainBackground isAllVoted={allVoted} />
      <div className={`ambient ${allVoted ? "ambient-ready" : ""}`} />
      <ModalDialog />
      <div className={`site-shell ${allVoted ? "ready-theme" : ""}`}>
        <header className="site-header">
          <span className="brand">
            <Cloud />
            OVERRATED
          </span>
          {!gameState && (
            <button
              className="quiet-button"
              onClick={() =>
                showAlert(
                  "В каждом раунде — пять фильмов. Расставьте ранги от S до D: каждый используется один раз, пятый назначается автоматически. За каждое совпадение с другим игроком — одно очко. Ведущий запускает таймер и раскрывает оценки. Побеждает тот, кто достигнет выбранной цели.",
                  { title: "Как играть", icon: "", confirmText: "Понятно" },
                )
              }
            >
              Правила игры
            </button>
          )}
          {gameState && (
            <span className="room-label">
              Комната <strong>{gameState.id}</strong>
            </span>
          )}
        </header>
        {!isConnected && (
          <div className="connection-banner" role="status">
            {connectionMessage}
            {slow && (
              <button className="btn-secondary" onClick={reconnect}>
                Повторить подключение
              </button>
            )}
          </div>
        )}
        <main>
          <fieldset className="game-fieldset" disabled={!isConnected}>
            {!gameState ? (
              <MainMenu />
            ) : gameState.state === "lobby" ? (
              <Lobby />
            ) : (
              <GameScreen />
            )}
          </fieldset>
        </main>
      </div>
    </>
  );
}
