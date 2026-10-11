import React from 'react';
import { useGame } from './GameContext';
import MainMenu from './components/MainMenu';
import Lobby from './components/Lobby';
import GameScreen from './components/GameScreen';
import RainBackground from './components/RainBackground';

function App() {
    const { gameState, isConnected } = useGame();

    if (!isConnected) {
        return (
            <>
                <RainBackground />
                <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <div className="glass-panel" style={{ padding: '2rem 3rem', textAlign: 'center' }}>
                        <div className="cloud-logo" style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌧️</div>
                        <h2 style={{ color: 'var(--text-main)', fontSize: '1.4rem' }}>Подключение к серверу...</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Устанавливаем защищенное соединение</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <RainBackground />
            <div className="app-container">
                {!gameState && <MainMenu />}
                {gameState?.state === 'lobby' && <Lobby />}
                {gameState && gameState.state !== 'lobby' && <GameScreen />}
            </div>
        </>
    );
}

export default App;
