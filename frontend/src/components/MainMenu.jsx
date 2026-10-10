import React, { useState } from 'react';
import { useGame } from '../GameContext';

const MainMenu = () => {
    const { socket, setPlayer } = useGame();
    const [nickname, setNickname] = useState('');
    const [lobbyCode, setLobbyCode] = useState('');
    const [targetVP, setTargetVP] = useState(30);

    const handleCreateLobby = () => {
        if (!nickname.trim()) return alert('Введите никнейм!');
        
        socket.emit('create_lobby', { targetVP }, (response) => {
            if (response.success) {
                // После создания, сам хост должен тоже зайти в это лобби
                handleJoinLobby(response.lobbyId);
            }
        });
    };

    const handleJoinLobby = (codeToJoin = lobbyCode) => {
        if (!nickname.trim()) return alert('Введите никнейм!');
        if (!codeToJoin.trim()) return alert('Введите код лобби!');

        socket.emit('join_lobby', { lobbyId: codeToJoin.toUpperCase(), nickname }, (response) => {
            if (response.success) {
                setPlayer(response.player);
                // Сохраняем сессию для реконнекта
                localStorage.setItem('kino_lobbyId', codeToJoin.toUpperCase());
                localStorage.setItem('kino_sessionToken', response.player.sessionToken);
            } else {
                alert(response.message || 'Ошибка подключения');
            }
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center', marginTop: '10vh' }}>
            <h1 style={{ fontSize: '4rem', textShadow: '0 0 20px rgba(255,0,85,0.5)', background: 'linear-gradient(to right, #FF0055, #00CCFF)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                КИНО-ИГРА
            </h1>

            <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Ваш никнейм</label>
                    <input 
                        className="input-field" 
                        value={nickname} 
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Квентин Тарантино"
                        maxLength={15}
                    />
                </div>

                <div style={{ height: '1px', background: 'var(--surface-border)', margin: '0.5rem 0' }}></div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Подключиться по коду</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input 
                            className="input-field" 
                            style={{ textTransform: 'uppercase' }}
                            value={lobbyCode} 
                            onChange={(e) => setLobbyCode(e.target.value)}
                            placeholder="КОД ЛОББИ"
                            maxLength={6}
                        />
                        <button className="btn-primary" onClick={() => handleJoinLobby()}>Войти</button>
                    </div>
                </div>

                <div style={{ height: '1px', background: 'var(--surface-border)', margin: '0.5rem 0' }}></div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Создать новое лобби</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ color: 'var(--text-muted)' }}>ПО для победы:</label>
                        <input 
                            type="number" 
                            className="input-field" 
                            style={{ width: '80px', textAlign: 'center' }}
                            value={targetVP} 
                            onChange={(e) => setTargetVP(Number(e.target.value))}
                            min={10} 
                            max={99}
                        />
                    </div>
                    <button className="btn-primary" onClick={handleCreateLobby} style={{ background: 'linear-gradient(135deg, #00CCFF, #00FF66)', boxShadow: '0 4px 15px rgba(0, 204, 255, 0.4)' }}>
                        Создать игру
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MainMenu;
