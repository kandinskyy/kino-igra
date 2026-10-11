import React, { useState } from 'react';
import { useGame } from '../GameContext';

const Lobby = () => {
    const { socket, gameState, player } = useGame();
    const [showRules, setShowRules] = useState(false);
    const [copied, setCopied] = useState(false);

    const isHost = gameState.host === player?.id;

    const handleCopy = () => {
        navigator.clipboard.writeText(gameState.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLaunch = () => {
        socket.emit('launch_game', gameState.id);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '850px', margin: '0 auto', marginTop: '3vh' }}>
            
            {/* Верхняя плашка с кодом */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="cloud-logo" style={{ fontSize: '2.4rem' }}>🌧️</span>
                    <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>КОМНАТА ОЖИДАНИЯ</div>
                        <h2 style={{ fontSize: '2.2rem', margin: 0, fontWeight: 800 }}>
                            КОД: <span style={{ color: 'var(--accent-blue)', textShadow: '0 0 16px rgba(28, 160, 229, 0.6)' }}>{gameState.id}</span>
                        </h2>
                    </div>
                </div>

                <button 
                    className="btn-secondary" 
                    onClick={handleCopy} 
                    style={{ borderColor: copied ? '#00e676' : 'rgba(28, 160, 229, 0.4)', color: copied ? '#00e676' : 'var(--accent-blue)' }}
                >
                    {copied ? '✓ СКОПИРОВАНО!' : '📋 Скопировать код'}
                </button>
            </div>

            {/* Карточка участников */}
            <div className="glass-panel" style={{ padding: '2.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1.2rem', marginBottom: '1.8rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
                        🎯 Цель победы: <strong style={{ color: '#ffffff', fontWeight: 800 }}>{gameState.targetVP} ПО</strong>
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
                        👥 Игроки: <strong style={{ color: 'var(--accent-blue)', fontWeight: 800 }}>{gameState.players.length} / 10</strong>
                    </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.1rem' }}>
                    {gameState.players.map((p, idx) => (
                        <div key={idx} style={{ 
                            background: 'rgba(3, 10, 22, 0.65)', 
                            padding: '1.1rem', 
                            borderRadius: '14px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '1rem',
                            border: `1px solid ${p.color}40`,
                            borderLeft: `5px solid ${p.color}`,
                            opacity: p.connected ? 1 : 0.5,
                            transition: 'all 0.3s',
                            boxShadow: `0 4px 15px rgba(0,0,0,0.3)`
                        }}>
                            <div style={{ 
                                width: '28px', 
                                height: '28px', 
                                borderRadius: '50%', 
                                backgroundColor: p.color, 
                                boxShadow: `0 0 14px ${p.color}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.8rem',
                                color: '#000',
                                fontWeight: 800
                            }}>
                                {idx + 1}
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <div style={{ fontWeight: '700', fontSize: '1.1rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: '#ffffff' }}>
                                    {p.nickname} {p.id === gameState.host && '👑'} 
                                </div>
                                <div style={{ fontSize: '0.8rem', color: p.connected ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
                                    {p.connected ? (p.id === gameState.host ? 'Хост лобби' : 'Готов к игре') : 'Отключился'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {gameState.players.length < 2 && (
                    <div style={{ marginTop: '2.2rem', textAlign: 'center', color: 'var(--accent-c)', fontWeight: '600', fontSize: '1.05rem', background: 'rgba(255, 179, 0, 0.08)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255, 179, 0, 0.25)' }}>
                        ⏳ Ожидаем участников: нужно минимум 2 игрока для начала (ещё {2 - gameState.players.length}).
                    </div>
                )}
            </div>

            {/* Кнопки управления */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', marginTop: '0.5rem' }}>
                <button 
                    className="btn-secondary" 
                    onClick={() => setShowRules(true)}
                >
                    📖 Правила игры
                </button>
                
                {isHost && (
                    <button 
                        className="btn-primary" 
                        onClick={handleLaunch}
                        disabled={gameState.players.length < 2}
                        title={gameState.players.length < 2 ? 'Нужно минимум 2 игрока для старта' : 'Запустить раунд!'}
                        style={{ 
                            padding: '14px 36px',
                            opacity: gameState.players.length < 2 ? 0.45 : 1, 
                            cursor: gameState.players.length < 2 ? 'not-allowed' : 'pointer',
                            filter: gameState.players.length < 2 ? 'grayscale(0.6)' : 'none'
                        }}
                    >
                        🌧️ Начать раунд
                    </button>
                )}
            </div>

            {/* Модалка с правилами */}
            {showRules && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(2, 6, 14, 0.88)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '640px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
                            <span style={{ fontSize: '2rem' }}>🌧️</span>
                            <h2 style={{ fontSize: '2rem', margin: 0, color: 'var(--accent-blue)' }}>Правила игры</h2>
                        </div>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', lineHeight: '1.6', color: '#e2e8f0', fontSize: '1.05rem', listStyle: 'none', padding: 0 }}>
                            <li>🎬 В каждом раунде показывается <strong>5 случайных фильмов</strong>.</li>
                            <li>⏱️ У вас есть 60 секунд на расстановку рангов от <strong>S</strong> (шедевр) до <strong>D</strong> (худший).</li>
                            <li>⚠️ Каждая буква (S, A, B, C, D) используется <strong>строго один раз</strong>.</li>
                            <li>🔄 Ошиблись? Просто нажмите на другую букву или нажмите повторно, чтобы снять выбор!</li>
                            <li>🎯 <strong style={{ color: 'var(--accent-blue)' }}>Цель игры:</strong> Поставить фильму такую же букву, как и ваши друзья.</li>
                            <li>✨ За каждое совпадение оценки с другим игроком вы получаете <strong>+1 ПО</strong>.</li>
                            <li>🏆 Побеждает тот, кто первым наберёт <strong>{gameState.targetVP} ПО</strong>!</li>
                        </ul>
                        <button className="btn-primary" style={{ marginTop: '2.5rem', width: '100%', padding: '14px' }} onClick={() => setShowRules(false)}>
                            Всё ясно, в бой!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Lobby;
