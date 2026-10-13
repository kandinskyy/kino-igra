import React, { useState } from 'react';
import { useGame } from '../GameContext';
import YandexAd from './YandexAd';

const MainMenu = () => {
    const { socket, setPlayer, showToast } = useGame();
    const [nickname, setNickname] = useState(() => localStorage.getItem('kino_lastNickname') || '');
    const [lobbyCode, setLobbyCode] = useState(() => localStorage.getItem('kino_lastLobbyId') || '');
    const [targetVP, setTargetVP] = useState(30);

    const handleCreateLobby = () => {
        if (!nickname.trim()) {
            return showToast('Введите ваш никнейм!', 'error');
        }
        
        socket.emit('create_lobby', { targetVP }, (response) => {
            if (response.success) {
                handleJoinLobby(response.lobbyId);
            }
        });
    };

    const handleJoinLobby = (codeToJoin = lobbyCode) => {
        const cleanNick = nickname.trim();
        const cleanCode = (codeToJoin || '').trim().toUpperCase();
        if (!cleanNick) {
            return showToast('Введите ваш никнейм!', 'error');
        }
        if (!cleanCode) {
            return showToast('Введите код лобби!', 'error');
        }

        const lastToken = localStorage.getItem('kino_lastSessionToken');

        socket.emit('join_lobby', { lobbyId: cleanCode, nickname: cleanNick, sessionToken: lastToken }, (response) => {
            if (response.success) {
                setPlayer(response.player);
                localStorage.setItem('kino_lobbyId', cleanCode);
                localStorage.setItem('kino_sessionToken', response.player.sessionToken);
                localStorage.setItem('kino_lastLobbyId', cleanCode);
                localStorage.setItem('kino_lastNickname', cleanNick);
                localStorage.setItem('kino_lastSessionToken', response.player.sessionToken);
            } else {
                showToast(response.message || 'Ошибка подключения к лобби', 'error');
            }
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', marginTop: '6vh', position: 'relative' }}>
            
            {/* Логотип: серая тучка с голубыми каплями */}
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <span className="cloud-logo" role="img" aria-label="rain cloud">🌧️</span>
                <div style={{ filter: 'drop-shadow(0 0 25px rgba(28, 160, 229, 0.45))', padding: '0.1em 0.2em' }}>
                    <h1 style={{ 
                        fontSize: '3.6rem', 
                        fontWeight: 800,
                        letterSpacing: '-1px',
                        margin: 0,
                        background: 'linear-gradient(135deg, #ffffff 10%, #1ca0e5 70%, #0a84c6 100%)', 
                        WebkitBackgroundClip: 'text', 
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        color: 'transparent',
                        lineHeight: 1.1
                    }}>
                        OVERRATED
                    </h1>
                </div>
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
                            <button
                                onClick={() => setTargetVP(prev => Math.max(10, prev - 5))}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    background: 'rgba(255,255,255,0.06)',
                                    color: '#ffffff',
                                    fontSize: '1.3rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s',
                                    lineHeight: 1,
                                    padding: 0,
                                    fontFamily: 'var(--font-main)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(28, 160, 229, 0.2)';
                                    e.currentTarget.style.borderColor = 'var(--accent-blue)';
                                    e.currentTarget.style.boxShadow = '0 0 12px rgba(28, 160, 229, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                −
                            </button>
                            <input 
                                type="number" 
                                className="input-field vp-input" 
                                style={{ width: '85px', textAlign: 'center', padding: '6px 8px', fontWeight: 700 }}
                                value={targetVP} 
                                onChange={(e) => setTargetVP(Number(e.target.value))}
                                min={10} 
                                max={999}
                            />
                            <button
                                onClick={() => setTargetVP(prev => Math.min(999, prev + 5))}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    background: 'rgba(255,255,255,0.06)',
                                    color: '#ffffff',
                                    fontSize: '1.3rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s',
                                    lineHeight: 1,
                                    padding: 0,
                                    fontFamily: 'var(--font-main)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(28, 160, 229, 0.2)';
                                    e.currentTarget.style.borderColor = 'var(--accent-blue)';
                                    e.currentTarget.style.boxShadow = '0 0 12px rgba(28, 160, 229, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                +
                            </button>
                            <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>ПО</span>
                        </div>
                    </div>
                    <button className="btn-primary" onClick={handleCreateLobby} style={{ width: '100%', padding: '14px' }}>
                        🌧️ Создать игру
                    </button>
                </div>
            </div>

            {/* Рекламный блок РСЯ */}
            <YandexAd maxWidth="440px" minHeight="90px" />
        </div>
    );
};

export default MainMenu;
