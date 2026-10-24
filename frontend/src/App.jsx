import React from 'react';
import { useGame } from './GameContext';
import MainMenu from './components/MainMenu';
import Lobby from './components/Lobby';
import GameScreen from './components/GameScreen';
import RainBackground from './components/RainBackground';

import ModalDialog from './components/ModalDialog';

function App() {
    const { gameState, isConnected } = useGame();

    // Проверяем: оценили ли все активные игроки 5/5 фильмов в текущем раунде
    const isRoundStart = gameState?.state === 'round_start';
    const activePlayers = gameState?.players?.filter(p => p.connected) || [];
    const isAllVoted = isRoundStart && activePlayers.length > 0 && Boolean(
        gameState.allVoted ||
        activePlayers.every(p => {
            const count = Object.keys(gameState?.ratings?.[p.id] || {}).length;
            return count >= 5;
        })
    );

    React.useEffect(() => {
        if (isAllVoted) {
            document.body.classList.add('all-voted-theme');
        } else {
            document.body.classList.remove('all-voted-theme');
        }
        return () => {
            document.body.classList.remove('all-voted-theme');
        };
    }, [isAllVoted]);

    if (!isConnected) {
        return (
            <>
                <RainBackground />
                <ModalDialog />
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
            {/* Плавная смена фона сайта на темно-зеленый (на основе #00A86B) при голосовании 5/5 всеми игроками */}
            <div className={`all-voted-bg-transition ${isAllVoted ? 'active' : ''}`} />
            <RainBackground isAllVoted={isAllVoted} />
            <ModalDialog />
            <div className="app-container">
                {!gameState && <MainMenu />}
                {gameState?.state === 'lobby' && <Lobby />}
                {gameState && gameState.state !== 'lobby' && <GameScreen isAllVoted={isAllVoted} />}
            </div>
        </>
    );
}

export default App;
