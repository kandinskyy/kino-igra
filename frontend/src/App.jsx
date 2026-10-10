import React from 'react';
import { useGame } from './GameContext';
import MainMenu from './components/MainMenu';
import Lobby from './components/Lobby';
import GameScreen from './components/GameScreen';

function App() {
    const { gameState, isConnected } = useGame();

    if (!isConnected) {
        return (
            <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <h2 style={{ color: 'var(--text-muted)' }}>Подключение к серверу...</h2>
            </div>
        );
    }

    return (
        <div className="app-container">
            {!gameState && <MainMenu />}
            {gameState?.state === 'lobby' && <Lobby />}
            {gameState?.state === 'round_start' && <GameScreen />}
        </div>
    );
}

export default App;
