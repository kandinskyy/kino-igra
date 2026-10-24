import React, { useState } from 'react';
import { useGame } from '../GameContext';
import OkkoBanner from './OkkoBanner';
import { copyText } from '../utils/clipboard';

const ALL_16_COLORS = [

    { hex: '#B57EDC', emoji: '☂️', name: 'Лавандовый' },
    { hex: '#1CA0E5', emoji: '💧', name: 'Неоновый голубой' },
    { hex: '#00E676', emoji: '🍀', name: 'Изумрудный' },
    { hex: '#FF007F', emoji: '🌸', name: 'Фуксия' },
    { hex: '#FFB300', emoji: '⚡', name: 'Янтарный' },
    { hex: '#8A2BE2', emoji: '🔮', name: 'Фиолетовый' },
    { hex: '#FF3864', emoji: '🪸', name: 'Коралловый' },
    { hex: '#00F5D4', emoji: '🫧', name: 'Мятный' },
    { hex: '#FF6D00', emoji: '🦊', name: 'Оранжевый' },
    { hex: '#AEEA00', emoji: '🍏', name: 'Лайм' },
    { hex: '#0091EA', emoji: '🌊', name: 'Лазурный' },
    { hex: '#FF1493', emoji: '🦩', name: 'Hot Pink' },
    { hex: '#FFD600', emoji: '☀️', name: 'Золотой' },
    { hex: '#00B4D8', emoji: '💎', name: 'Аквамарин' },
    { hex: '#7B2CBF', emoji: '🪐', name: 'Ультрафиолет' },
    { hex: '#D8B4FE', emoji: '🌙', name: 'Сиреневый' }
];

const Lobby = () => {
    const { socket, gameState, player, leaveGame, closeLobby, showConfirm, showToast } = useGame();
    const [showRules, setShowRules] = useState(false);
    const [copied, setCopied] = useState(false);

    const isHost = gameState.host === player?.id;
    const myPlayer = gameState.players.find(p => p.id === player?.id) || player;

    const handleCopy = () => {
        copyText(gameState.id);
        setCopied(true);
        showToast(`Код скопирован: ${gameState.id}`, 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLaunch = () => {
        socket.emit('launch_game', gameState.id);
    };

    const handleUpdateTargetVP = (newVal) => {
        if (!isHost || !socket || !gameState?.id) return;
        socket.emit('update_target_vp', { lobbyId: gameState.id, targetVP: newVal });
    };

    const handleSelectColor = (colorHex) => {
        if (!socket || !gameState?.id) return;
        socket.emit('change_color', { lobbyId: gameState.id, color: colorHex }, (res) => {
            if (!res?.success && res?.message) {
                showToast(res.message, 'error');
            }
        });
    };

    const handleTransferHost = async (targetPlayerId, targetNick) => {
        if (!isHost) return;
        const confirmed = await showConfirm(`Передать права хоста игроку «${targetNick}»?`, {
            title: 'Передача прав хоста',
            icon: '👑',
            confirmText: 'Передать хоста',
            cancelText: 'Отмена',
            isDanger: false
        });
        if (confirmed) {
            socket.emit('transfer_host', { lobbyId: gameState.id, targetPlayerId }, (res) => {
                if (res?.success) {
                    showToast(`Вы передали статус хоста игроку «${targetNick}»!`, 'success');
                } else if (res?.message) {
                    showToast(res.message, 'error');
                }
            });
        }
    };

    const handleKickPlayer = async (targetPlayerId, targetNick) => {
        if (!isHost) return;
        const confirmed = await showConfirm(`Исключить игрока ${targetNick ? `«${targetNick}»` : ''} из комнаты?`, {
            title: 'Исключение игрока',
            icon: '🛑',
            confirmText: 'Исключить',
            cancelText: 'Отмена',
            isDanger: true
        });
        if (confirmed) {
            socket.emit('kick_player', { lobbyId: gameState.id, playerId: targetPlayerId });
            showToast('Игрок исключён из комнаты', 'info');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', width: '100%', maxWidth: '880px', margin: '0 auto', marginTop: '2vh' }}>
            
            {/* Верхняя плашка с кодом лобби и кнопками */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="cloud-logo" style={{ fontSize: '2.4rem' }}>🌧️</span>
                    <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>КОМНАТА ОЖИДАНИЯ</div>
                        <div 
                            onClick={handleCopy}
                            title="Нажмите, чтобы скопировать код комнаты"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                background: copied ? 'rgba(0, 230, 118, 0.15)' : 'rgba(28, 160, 229, 0.12)',
                                border: copied ? '1px solid #00e676' : '1px solid rgba(28, 160, 229, 0.4)',
                                padding: '6px 14px',
                                borderRadius: '12px',
                                marginTop: '4px',
                                boxShadow: copied ? '0 0 20px rgba(0, 230, 118, 0.35)' : '0 0 16px rgba(28, 160, 229, 0.25)',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 0 25px rgba(28, 160, 229, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = copied ? '0 0 20px rgba(0, 230, 118, 0.35)' : '0 0 16px rgba(28, 160, 229, 0.25)';
                            }}
                        >
                            <span style={{ 
                                fontSize: '2.2rem', 
                                fontWeight: 900, 
                                color: copied ? '#00e676' : 'var(--accent-blue)', 
                                textShadow: copied ? '0 0 16px rgba(0, 230, 118, 0.7)' : '0 0 16px rgba(28, 160, 229, 0.6)',
                                letterSpacing: '2px'
                            }}>
                                {copied ? '✓ Скопировано!' : gameState.id}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>

                    {isHost && (
                        <button
                            className="btn-secondary"
                            onClick={async () => {
                                const confirmed = await showConfirm('Вы действительно хотите закрыть комнату для всех участников?', {
                                    title: 'Закрыть комнату',
                                    icon: '🛑',
                                    confirmText: 'Да, закрыть',
                                    cancelText: 'Отмена',
                                    isDanger: true
                                });
                                if (confirmed) {
                                    closeLobby();
                                }
                            }}
                            title="Закрыть и распустить комнату"
                            style={{ borderColor: 'rgba(255, 56, 100, 0.45)', color: '#ff4d6d' }}
                        >
                            🛑 Закрыть комнату
                        </button>
                    )}

                    <button
                        className="btn-secondary"
                        onClick={leaveGame}
                        title="Выйти в меню (вы сможете вернуться в любой момент по тому же нику)"
                        style={{ borderColor: 'rgba(255, 77, 109, 0.35)', color: '#ff6b81' }}
                    >
                        🚪 Выйти в меню
                    </button>
                </div>
            </div>

            {/* Палитра выбора 16 цветов для игрока */}
            <div className="glass-panel" style={{ padding: '1.4rem 1.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>🎨</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>ВЫБОР ЦВЕТА И ЭМОДЗИ (16 ВАРИАНТОВ):</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(46px, 1fr))', gap: '0.85rem', justifyContent: 'center' }}>
                    {ALL_16_COLORS.map(c => {
                        const isMyColor = myPlayer?.color?.toLowerCase() === c.hex.toLowerCase();
                        const takenBy = gameState.players.find(p => p.id !== player?.id && p.color?.toLowerCase() === c.hex.toLowerCase());

                        return (
                            <button
                                key={c.hex}
                                onClick={() => !takenBy && handleSelectColor(c.hex)}
                                disabled={Boolean(takenBy)}
                                title={isMyColor ? `${c.emoji} ${c.name} (Ваш выбор)` : takenBy ? `${c.emoji} ${c.name} (Занят: ${takenBy.nickname})` : `Выбрать: ${c.emoji} ${c.name}`}
                                style={{
                                    width: '46px',
                                    height: '46px',
                                    borderRadius: '50%',
                                    backgroundColor: c.hex,
                                    border: isMyColor ? '3px solid #ffffff' : '2px solid rgba(255,255,255,0.2)',
                                    boxShadow: isMyColor ? `0 0 16px ${c.hex}, 0 0 25px ${c.hex}` : `0 2px 8px rgba(0,0,0,0.4)`,
                                    cursor: takenBy ? 'not-allowed' : 'pointer',
                                    opacity: takenBy ? 0.3 : 1,
                                    transform: isMyColor ? 'scale(1.18)' : 'scale(1)',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.25rem',
                                    outline: 'none',
                                    padding: 0,
                                    position: 'relative'
                                }}
                            >
                                <span style={{ filter: takenBy ? 'grayscale(1)' : 'none' }}>{c.emoji}</span>
                                {isMyColor && (
                                    <span style={{ 
                                        position: 'absolute', 
                                        bottom: '-3px', 
                                        right: '-3px', 
                                        background: '#ffffff', 
                                        color: '#000000', 
                                        borderRadius: '50%', 
                                        width: '16px', 
                                        height: '16px', 
                                        fontSize: '10px', 
                                        fontWeight: 900, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        boxShadow: '0 0 6px rgba(0,0,0,0.5)'
                                    }}>
                                        ✓
                                    </span>
                                )}
                                {takenBy && (
                                    <span style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        borderRadius: '50%',
                                        background: 'rgba(0,0,0,0.55)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#ff4d6d',
                                        fontSize: '0.9rem',
                                        fontWeight: 900
                                    }}>
                                        ✕
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Карточка участников */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    borderBottom: '1px solid var(--surface-border)', 
                    paddingBottom: '1.2rem', 
                    marginBottom: '1.6rem',
                    flexWrap: 'wrap',
                    gap: '1.2rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <label style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600 }}>Цель для победы:</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div 
                                className="vp-stepper-container"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    background: 'rgba(3, 10, 20, 0.75)',
                                    border: '1px solid rgba(28, 160, 229, 0.35)',
                                    borderRadius: '12px',
                                    padding: '0 8px 0 10px',
                                    height: '42px',
                                    boxSizing: 'border-box',
                                    boxShadow: '0 0 15px rgba(28, 160, 229, 0.15)'
                                }}
                            >
                                <input 
                                    type="number" 
                                    className="vp-stepper-input" 
                                    value={gameState.targetVP || 30} 
                                    disabled={!isHost}
                                    readOnly={!isHost}
                                    onChange={(e) => {
                                        if (!isHost) return;
                                        const val = parseInt(e.target.value, 10);
                                        handleUpdateTargetVP(isNaN(val) ? '' : Math.max(1, Math.min(999, val)));
                                    }}
                                    onBlur={() => {
                                        if (!isHost) return;
                                        if (!gameState.targetVP || gameState.targetVP < 1) handleUpdateTargetVP(30);
                                    }}
                                    min={1} 
                                    max={999}
                                    title={isHost ? 'Цель очков для победы в матче' : 'Цель для победы (настраивает хост)'}
                                    style={{
                                        width: '46px',
                                        background: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        boxShadow: 'none',
                                        color: '#ffffff',
                                        fontWeight: 700,
                                        fontSize: '1.2rem',
                                        textAlign: 'center',
                                        padding: 0,
                                        margin: 0,
                                        cursor: isHost ? 'text' : 'default'
                                    }}
                                />
                                {isHost && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginLeft: '4px' }}>
                                        <button
                                            type="button"
                                            className="vp-stepper-arrow-btn"
                                            onClick={() => handleUpdateTargetVP(Math.min(999, (Number(gameState.targetVP) || 0) + 1))}
                                            title="Увеличить на 1"
                                            style={{
                                                background: 'transparent',
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                outline: 'none',
                                                boxShadow: 'none',
                                                padding: '2px 4px',
                                                margin: 0,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                lineHeight: 1
                                            }}
                                        >
                                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ display: 'block' }}>
                                                <path d="M1 5L5 1L9 5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            className="vp-stepper-arrow-btn"
                                            onClick={() => handleUpdateTargetVP(Math.max(1, (Number(gameState.targetVP) || 0) - 1))}
                                            title="Уменьшить на 1"
                                            style={{
                                                background: 'transparent',
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                outline: 'none',
                                                boxShadow: 'none',
                                                padding: '2px 4px',
                                                margin: 0,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                lineHeight: 1
                                            }}
                                        >
                                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ display: 'block' }}>
                                                <path d="M1 1L5 5L9 1" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <span style={{ color: 'var(--accent-blue)', fontWeight: 700, fontSize: '0.95rem' }}>ПО</span>
                            {!isHost && (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '4px' }}>(настраивает хост)</span>
                            )}
                        </div>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
                        👥 Игроки: <strong style={{ color: 'var(--accent-blue)', fontWeight: 800 }}>{gameState.players.length} / 16</strong>
                    </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.1rem' }}>
                    {gameState.players.map((p, idx) => (
                        <div key={p.id || idx} style={{ 
                            background: 'rgba(3, 10, 22, 0.7)', 
                            padding: '1.1rem', 
                            borderRadius: '14px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.9rem',
                            border: `1px solid ${p.color}45`,
                            borderLeft: `5px solid ${p.color}`,
                            opacity: p.connected ? 1 : 0.65,
                            transition: 'all 0.3s',
                            boxShadow: `0 4px 15px rgba(0,0,0,0.3)`
                        }}>
                            {/* Индикатор онлайн-статуса: изумрудный зеленый или бордовый красный */}
                            <div 
                                title={p.connected ? 'В сети (в игре)' : 'Отключился'}
                                style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor: p.connected ? '#00e676' : '#8b0000',
                                    boxShadow: p.connected ? '0 0 10px #00e676' : '0 0 10px #8b0000',
                                    flexShrink: 0
                                }}
                            />

                            {/* Кружок с эмодзи и цветом игрока */}
                            <div style={{ 
                                width: '34px', 
                                height: '34px', 
                                borderRadius: '50%', 
                                backgroundColor: p.color, 
                                boxShadow: `0 0 12px ${p.color}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.15rem',
                                flexShrink: 0
                            }}>
                                {p.emoji || '🌧️'}
                            </div>

                            <div style={{ overflow: 'hidden', flex: 1 }}>
                                <div style={{ fontWeight: '700', fontSize: '1.05rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ color: p.color, textShadow: `0 0 10px ${p.color}40` }}>{p.nickname}</span>
                                    {p.id === gameState.host && <span title="Хост комнаты (создатель)" style={{ fontSize: '1.1rem', filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.85))' }}>👑</span>} 
                                </div>
                                <div style={{ fontSize: '0.8rem', color: p.connected ? 'var(--text-muted)' : '#ff4d6d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {p.connected ? (p.id === gameState.host ? 'Хост лобби' : 'В игре') : 'Отключился'}
                                </div>
                            </div>

                            {/* Кнопки управления хоста для других участников */}
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                {/* Кнопка передачи хоста: серая корона с hover в золото */}
                                {isHost && p.id !== player?.id && p.connected && (
                                    <button
                                        onClick={() => handleTransferHost(p.id, p.nickname)}
                                        title={`Передать статус хоста игроку «${p.nickname}»`}
                                        style={{
                                            background: 'rgba(255, 215, 0, 0.08)',
                                            border: '1px solid rgba(255, 215, 0, 0.25)',
                                            color: '#e2e8f0',
                                            borderRadius: '8px',
                                            padding: '4px 8px',
                                            fontSize: '0.95rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            filter: 'grayscale(0.85) opacity(0.6)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.filter = 'grayscale(0) opacity(1) drop-shadow(0 0 10px rgba(255, 215, 0, 0.9))';
                                            e.currentTarget.style.transform = 'scale(1.15)';
                                            e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.8)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.filter = 'grayscale(0.85) opacity(0.6)';
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.25)';
                                        }}
                                    >
                                        👑
                                    </button>
                                )}

                                {/* Кнопка кика для хоста */}
                                {isHost && p.id !== player?.id && (
                                    <button
                                        onClick={() => handleKickPlayer(p.id, p.nickname)}
                                        title="Исключить игрока из лобби"
                                        style={{
                                            background: 'rgba(255, 56, 100, 0.15)',
                                            border: '1px solid rgba(255, 56, 100, 0.3)',
                                            color: '#ff4d6d',
                                            borderRadius: '8px',
                                            padding: '4px 8px',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {gameState.players.length < 2 && (
                    <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--accent-c)', fontWeight: '600', fontSize: '1.05rem', background: 'rgba(255, 179, 0, 0.08)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255, 179, 0, 0.25)' }}>
                        ⏳ Ожидаем участников: нужно минимум 2 игрока для начала (ещё {2 - gameState.players.length}).
                    </div>
                )}
            </div>

            {/* Кнопки управления */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', marginTop: '0.2rem' }}>
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

            {/* Партнерский баннер Okko в лобби */}
            <OkkoBanner maxWidth="760px" />

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
                            <li>🎨 До старта матча вы можете выбрать любой из <strong>16 цветов</strong> (включая лавандовый).</li>
                            <li>🟢 <strong>Зелёная точка</strong> — игрок онлайн в матче, 🔴 <strong>бордовая</strong> — отключился.</li>
                            <li>⏸️ При отключении игрока таймер автоматически ставится на паузу. Хост может продолжить без него или исключить.</li>
                            <li>🔄 Ошиблись в ранге? Кликните на другую букву или нажмите повторно, чтобы снять выбор!</li>
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
