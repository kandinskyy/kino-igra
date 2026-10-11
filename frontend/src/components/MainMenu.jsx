import React, { useState } from 'react';
import { useGame } from '../GameContext';

const MainMenu = () => {
    const { socket, setPlayer } = useGame();
    const [nickname, setNickname] = useState('');
    const [lobbyCode, setLobbyCode] = useState('');
    const [targetVP, setTargetVP] = useState(30);

    const handleCreateLobby = () => {
        if (!nickname.trim()) return alert('Введите ваш никнейм!');
        
        socket.emit('create_lobby', { targetVP }, (response) => {
            if (response.success) {
                handleJoinLobby(response.lobbyId);
            }
        });
    };

    const handleJoinLobby = (codeToJoin = lobbyCode) => {
        if (!nickname.trim()) return alert('Введите ваш никнейм!');
        if (!codeToJoin.trim()) return alert('Введите код лобби!');

        socket.emit('join_lobby', { lobbyId: codeToJoin.toUpperCase(), nickname }, (response) => {
            if (response.success) {
                setPlayer(response.player);
                localStorage.setItem('kino_lobbyId', codeToJoin.toUpperCase());
                localStorage.setItem('kino_sessionToken', response.player.sessionToken);
            } else {
                alert(response.message || 'Ошибка подключения к лобби');
            }
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', marginTop: '6vh', position: 'relative' }}>
            
            {/* Логотип: серая тучка с голубыми каплями */}
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <span className="cloud-logo" role="img" aria-label="rain cloud">🌧️</span>
                <h1 style={{ 
                    fontSize: '3.6rem', 
                    fontWeight: 800,
                    letterSpacing: '-1px',
                    margin: 0,
                    background: 'linear-gradient(135deg, #ffffff 10%, #1ca0e5 70%, #0a84c6 100%)', 
                    WebkitBackgroundClip: 'text', 
                    color: 'transparent',
                    filter: 'drop-shadow(0 0 25px rgba(28, 160, 229, 0.45))'
                }}>
                    КИНО-ИГРА
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0, letterSpacing: '0.5px' }}>
                    Кинематографичная битва вкусов в дождливый вечер
                </p>
            </div>

            <div className="glass-panel" style={{ padding: '2.2rem', width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                        👤 ВАШ НИКНЕЙМ
                    </label>
                    <input 
                        className="input-field" 
                        value={nickname} 
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Квентин Тарантино"
                        maxLength={15}
                    />
                </div>

                <div style={{ height: '1px', background: 'var(--surface-border)' }}></div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>🔑</span> Подключиться по коду
                    </h3>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <input 
                            className="input-field" 
                            style={{ textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}
                            value={lobbyCode} 
                            onChange={(e) => setLobbyCode(e.target.value)}
                            placeholder="КОД ЛОББИ"
                            maxLength={6}
                        />
                        <button className="btn-primary" onClick={() => handleJoinLobby()}>
                            Войти
                        </button>
                    </div>
                </div>

                <div style={{ height: '1px', background: 'var(--surface-border)' }}></div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>✨</span> Создать новое лобби
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(3, 10, 20, 0.5)', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
                        <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Цель для победы:</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input 
                                type="number" 
                                className="input-field" 
                                style={{ width: '70px', textAlign: 'center', padding: '6px 8px', fontWeight: 700 }}
                                value={targetVP} 
                                onChange={(e) => setTargetVP(Number(e.target.value))}
                                min={10} 
                                max={99}
                            />
                            <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>ПО</span>
                        </div>
                    </div>
                    <button className="btn-primary" onClick={handleCreateLobby} style={{ width: '100%', padding: '14px' }}>
                        🌧️ Создать игру
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MainMenu;
