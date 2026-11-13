import { useEffect, useState } from "react";
import { useGame } from "./GameContext";
import MainMenu from "./components/MainMenu";
import SupportDevelopment from "./components/SupportDevelopment";
import RoomChat from "./components/RoomChat";
import Lobby from "./components/Lobby";
import GameScreen from "./components/GameScreen";
import RainBackground from "./components/RainBackground";
import ModalDialog from "./components/ModalDialog";
import { Cloud } from "./components/Identity";
import { prepareGameAudio } from "./utils/gameAudio";
import { KinonamesScreen } from "./kinonames/KinonamesUI.jsx";
import WaitingRoom from './components/WaitingRoom.jsx';
export default function App() {
  const { gameState, player, isConnected, connectionMessage, reconnect } =
    useGame();
  const allVoted = gameState?.state === "round_start" && gameState.allVoted;
  const [slow, setSlow] = useState(false);
  useEffect(prepareGameAudio, []);
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
          <div className="header-actions">
          {(!gameState || gameState.state === "lobby" || gameState.state === "game_over") && <SupportDevelopment />}
          {gameState && (
            <span className="room-label">
              Комната <strong>{gameState.id}</strong>
            </span>
          )}
          </div>
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
            ) : gameState.waitingRoom || gameState.state === 'waiting' ? (
              <WaitingRoom />
            ) : gameState.state === "lobby" ? (
              <Lobby />
            ) : (
              gameState.mode === "kinonames" ? <KinonamesScreen /> : <GameScreen />
            )}
          </fieldset>
          {gameState && player && <RoomChat key={gameState.id} />}
        </main>
      </div>
    </>
  );
}
