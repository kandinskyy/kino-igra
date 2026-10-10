import React, { useState } from 'react';
import { useGame } from '../GameContext';

const Lobby = () => {
    const { socket, gameState, player } = useGame();
    const [showRules, setShowRules] = useState(false);

    const isHost = gameState.host === player?.id;

    const handleCopy = () => {
        navigator.clipboard.writeText(gameState.id);
        alert('Код скопирован!');
    };

    const handleLaunch = () => {
        socket.emit('launch_game', gameState.id);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '800px', margin: '0 auto', marginTop: '5vh' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontSize: '2.5rem', margin: 0 }}>Код лобби: <span style={{ color: '#00CCFF', textShadow: '0 0 15px rgba(0,204,255,0.5)' }}>{gameState.id}</span></h2>
                <button className="btn-primary" onClick={handleCopy} style={{ fontSize: '0.9rem', padding: '8px 16px', background: 'transparent', border: '1px solid #00CCFF', color: '#00CCFF', boxShadow: 'none' }}>
                    Скопировать код
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Цель: <strong style={{ color: 'white' }}>{gameState.targetVP} ПО</strong></span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Игроков: <strong style={{ color: 'white' }}>{gameState.players.length}/10</strong></span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                    {gameState.players.map((p, idx) => (
                        <div key={idx} style={{ 
                            background: 'rgba(0,0,0,0.4)', 
                            padding: '1rem', 
                            borderRadius: '12px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '1rem',
                            borderLeft: `4px solid ${p.color}`,
                            opacity: p.connected ? 1 : 0.5,
                            transition: 'all 0.3s'
                        }}>
                            <div style={{ 
                                width: '24px', 
                                height: '24px', 
                                borderRadius: '50%', 
                                backgroundColor: p.color, 
                                boxShadow: `0 0 15px ${p.color}` 
                            }}></div>
                            <span style={{ fontWeight: '600', fontSize: '1.1rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {p.nickname} {p.id === gameState.host && '👑'} 
                                {!p.connected && <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}><br/>(Отключен)</span>}
                            </span>
                        </div>
                    ))}
                </div>

                {gameState.players.length < 5 && (
                    <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--accent-s)', fontWeight: '600' }}>
                        Для старта игры нужно минимум 5 игроков. (Еще {5 - gameState.players.length})
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                <button 
                    className="btn-primary" 
                    style={{ background: 'transparent', border: '1px solid var(--text-muted)', color: 'var(--text-main)', boxShadow: 'none' }}
                    onClick={() => setShowRules(true)}
                >
                    Как играть?
                </button>
                
                {isHost && (
                    <button 
                        className="btn-primary" 
                        onClick={handleLaunch}
                        // Для тестов я временно уберу блокировку кнопки, чтобы мы могли тестить одному/вдвоем
                        // disabled={gameState.players.length < 5} 
                        // style={{ opacity: gameState.players.length < 5 ? 0.5 : 1, cursor: gameState.players.length < 5 ? 'not-allowed' : 'pointer' }}
                    >
                        Запуск
                    </button>
                )}
            </div>

            {showRules && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--accent-d)' }}>Правила игры</h2>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: '1.6', color: '#e2e8f0', fontSize: '1.1rem' }}>
                            <li>Вам будет показано <strong>5 случайных фильмов</strong>.</li>
                            <li>У вас есть 60 секунд, чтобы оценить каждый из них буквой (S, A, B, C, D).</li>
                            <li>Каждая буква (от S до D) может быть использована <strong>только один раз</strong> за раунд!</li>
                            <li><strong style={{ color: 'var(--accent-s)' }}>Цель:</strong> Поставить фильму такую же букву, как и другие игроки.</li>
                            <li>За каждое совпадение с другим игроком вы получаете <strong>+1 ПО</strong> (победное очко).</li>
                            <li>Игра идет до тех пор, пока кто-то не наберет {gameState.targetVP} ПО.</li>
                        </ul>
                        <button className="btn-primary" style={{ marginTop: '2.5rem', width: '100%' }} onClick={() => setShowRules(false)}>Понятно, в бой!</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Lobby;
