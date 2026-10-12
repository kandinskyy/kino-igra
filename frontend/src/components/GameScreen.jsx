import React, { useState, useEffect } from 'react';
import { useGame } from '../GameContext';
import PodiumCeremony from './PodiumCeremony';

const GameScreen = () => {
    const { socket, gameState, player, leaveGame, closeLobby, showConfirm, showToast } = useGame();
    const [copiedCode, setCopiedCode] = useState(false);
    
    // Локальное состояние таймера (синхронизируется с сокетами)
    const [timeLeft, setTimeLeft] = useState(gameState?.timeLeft ?? 60);
    const [timerRunning, setTimerRunning] = useState(gameState?.timerRunning ?? false);
    
    // Мои оценки: { [movieId]: 'S' | 'A' | 'B' | 'C' | 'D' }
    const [myRatings, setMyRatings] = useState(() => {
        return gameState?.ratings?.[player?.id] || {};
    });

    // Прогресс других игроков: { [playerId]: countOfRatedMovies }
    const [progress, setProgress] = useState({});



    const isHost = gameState.host === player?.id;

    // Динамическая сортировка игроков по очкам во время матча (топ 1 — самый левый / верхний)
    const sortedPlayers = [...(gameState?.players || [])].sort((a, b) => {
        if ((b.vp || 0) !== (a.vp || 0)) {
            return (b.vp || 0) - (a.vp || 0);
        }
        return (a.nickname || '').localeCompare(b.nickname || '');
    });

    // Синхронизация таймера и прогресса через сокеты
    useEffect(() => {
        if (!socket) return;

        const handleTimerTick = (data) => {
            setTimeLeft(data.timeLeft);
            setTimerRunning(data.isRunning);
        };

        const handleProgress = (data) => {
            setProgress(data);
        };

        socket.on('timer_tick', handleTimerTick);
        socket.on('ratings_progress', handleProgress);

        return () => {
            socket.off('timer_tick', handleTimerTick);
            socket.off('ratings_progress', handleProgress);
        };
    }, [socket]);

    // Синхронизация при обновлении стейта лобби
    useEffect(() => {
        if (gameState) {
            setTimeLeft(gameState.timeLeft ?? 60);
            setTimerRunning(gameState.timerRunning ?? false);
            if (gameState.ratings?.[player?.id]) {
                setMyRatings(gameState.ratings[player.id]);
            } else if (gameState.state === 'round_start' && Object.keys(gameState.ratings || {}).length === 0) {
                setMyRatings({});
                setProgress({});
            }
        }
    }, [gameState, player?.id]);

    // Управление таймером (хост)
    const handleStartTimer = () => {
        socket.emit('start_timer', gameState.id);
    };

    const handlePauseTimer = () => {
        socket.emit('pause_timer', gameState.id);
    };

    const handleResumeTimer = () => {
        if (gameState.pausedDueToDisconnect) {
            socket.emit('dismiss_disconnect_pause', { lobbyId: gameState.id });
        }
        socket.emit('resume_timer', gameState.id);
    };

    // Быстрое досрочное завершение раунда (хост)
    const handleEndRoundEarly = async () => {
        const confirmed = await showConfirm('Завершить раунд досрочно и сразу вскрыть оценки всех игроков?', {
            title: 'Досрочное завершение',
            icon: '⚡',
            confirmText: 'Завершить раунд',
            cancelText: 'Продолжить оценку',
            isDanger: false
        });
        if (confirmed) {
            socket.emit('end_round_early', gameState.id);
        }
    };

    // Исключить игрока из матча (хост)
    const handleKickPlayer = async (targetPlayerId, targetNick) => {
        if (!isHost) return;
        const confirmed = await showConfirm(`Исключить игрока ${targetNick ? `«${targetNick}»` : ''} из матча?`, {
            title: 'Исключение игрока',
            icon: '🛑',
            confirmText: 'Исключить',
            cancelText: 'Отмена',
            isDanger: true
        });
        if (confirmed) {
            socket.emit('kick_player', { lobbyId: gameState.id, playerId: targetPlayerId });
            showToast('Игрок исключён из матча', 'info');
        }
    };

    // Передача хоста во время матча
    const handleTransferHost = async (targetPlayerId, targetNick) => {
        if (!isHost) return;
        const confirmed = await showConfirm(`Передать права хоста игроку «${targetNick}» во время матча?`, {
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

    // Выход в главное меню с подтверждением
    const handleLeaveGame = async () => {
        const confirmed = await showConfirm('Вы действительно хотите выйти в главное меню? Вы сможете вернуться по тому же нику в любой момент.', {
            title: 'Выход из матча',
            icon: '🚪',
            confirmText: 'Выйти в меню',
            cancelText: 'Остаться в игре',
            isDanger: false
        });
        if (confirmed) {
            leaveGame();
        }
    };

    // Снять паузу отключения и продолжить без него
    const handleDismissPause = () => {
        socket.emit('dismiss_disconnect_pause', { lobbyId: gameState.id });
        if (timeLeft > 0) {
            socket.emit('resume_timer', gameState.id);
        }
    };

    // Следующий раунд (хост)
    const handleNextRound = () => {
        setMyRatings({});
        setProgress({});
        socket.emit('next_round', gameState.id);
    };

    // Переход к финальной таблице лидеров (хост)
    const handleFinishGame = () => {
        socket.emit('finish_game', gameState.id);
    };

    // Перезапуск игры (хост)
    const handleRestartGame = () => {
        setMyRatings({});
        setProgress({});
        socket.emit('restart_game', gameState.id);
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(gameState.id);
        setCopiedCode(true);
        showToast(`Код комнаты скопирован: ${gameState.id}`, 'success');
        setTimeout(() => setCopiedCode(false), 2000);
    };

    // Выставление / изменение оценки (со свапом оценок и авто-заполнением 5-го фильма)
    const handleRating = (movieId, rating) => {
        if (gameState.state !== 'round_start') return;

        const newRatings = { ...myRatings };
        const movieWithRating = Object.keys(newRatings).find(mId => newRatings[mId] === rating);
        const oldRatingOfCurrentMovie = newRatings[movieId];

        if (movieWithRating && movieWithRating !== movieId) {
            // Свап: если буква уже стояла у другого фильма, меняем их местами
            newRatings[movieId] = rating;
            if (oldRatingOfCurrentMovie) {
                newRatings[movieWithRating] = oldRatingOfCurrentMovie;
            } else {
                delete newRatings[movieWithRating];
            }
        } else if (oldRatingOfCurrentMovie === rating) {
            // Если все 5 оценок уже выставлены, пользователь меняет их местами свапом.
            // Но если выставлено меньше 5, можно отменить выбор
            if (Object.keys(newRatings).length < 5) {
                delete newRatings[movieId];
            }
        } else {
            newRatings[movieId] = rating;
        }

        // Если оценено 4 из 5 фильмов -> оставшаяся оценка автоматически выставляется последнему фильму
        const ratedKeys = Object.keys(newRatings).filter(id => newRatings[id]);
        if (ratedKeys.length === 4 && gameState.movies?.length === 5) {
            const unratedMovie = gameState.movies.find(m => !newRatings[m.id]);
            const used = Object.values(newRatings);
            const remaining = ['S', 'A', 'B', 'C', 'D'].find(r => !used.includes(r));
            if (unratedMovie && remaining) {
                newRatings[unratedMovie.id] = remaining;
            }
        }

        setMyRatings(newRatings);

        // Отправляем на бэкенд
        socket.emit('submit_rating', {
            lobbyId: gameState.id,
            movieId,
            rating
        }, (res) => {
            if (res?.success) {
                setMyRatings(res.myRatings);
            }
        });
    };

    const availableRatings = ['S', 'A', 'B', 'C', 'D'];
    const getUsedRatings = () => Object.values(myRatings);
    const ratedCount = Object.keys(myRatings).length;

    const RATING_NUMBERS = { S: 5, A: 4, B: 3, C: 2, D: 1 };
    const getMovieAvg = (movieId) => {
        if (gameState.roundAverages?.[movieId]) return gameState.roundAverages[movieId];
        const breakdown = gameState.roundDetails?.[movieId] || {};
        let total = 0, count = 0;
        Object.entries(breakdown).forEach(([r, pIds]) => {
            if (RATING_NUMBERS[r]) {
                total += RATING_NUMBERS[r] * pIds.length;
                count += pIds.length;
            }
        });
        return count > 0 ? (total / count).toFixed(1) : null;
    };

    const getRatingColor = (r) => {
        switch (r) {
            case 'S': return 'var(--accent-s)';
            case 'A': return 'var(--accent-a)';
            case 'B': return 'var(--accent-b)';
            case 'C': return 'var(--accent-c)';
            case 'D': return 'var(--accent-d)';
            default: return 'var(--accent-blue)';
        }
    };

    // ==========================================
    // ЭКРАН ПОБЕДЫ (GAME OVER) — ЦЕРЕМОНИЯ НАГРАЖДЕНИЯ НА ПЬЕДЕСТАЛЕ
    // ==========================================
    if (gameState.state === 'game_over') {
        return (
            <PodiumCeremony
                players={gameState.players || []}
                winner={gameState.winner}
                isHost={isHost}
                onRestartGame={handleRestartGame}
                onLeaveGame={leaveGame}
            />
        );
    }

    // ==========================================
    // ОСНОВНОЙ ЭКРАН ИГРЫ ИЛИ ВСКРЫТИЕ РЕЗУЛЬТАТОВ
    // ==========================================
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1440px', margin: '0 auto', marginTop: '1vh' }}>
            
            {/* ПЛАШКА ПАУЗЫ ИЗ-ЗА ОТКЛЮЧЕНИЯ ИГРОКА */}
            {gameState.pausedDueToDisconnect && (
                <div className="glass-panel" style={{ 
                    padding: '1rem 1.6rem', 
                    background: 'rgba(139, 0, 0, 0.25)', 
                    border: '1px solid #8b0000', 
                    boxShadow: '0 0 25px rgba(139, 0, 0, 0.35)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <span style={{ fontSize: '1.4rem' }}>⚠️</span>
                        <div>
                            <div style={{ color: '#ff6b81', fontWeight: 800, fontSize: '1.05rem' }}>
                                Игрок «{gameState.disconnectedPlayerName}» отключился!
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                Таймер автоматически поставлен на паузу. Вы можете продолжить игру без него.
                            </div>
                        </div>
                    </div>

                    {isHost && (
                        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                            <button 
                                className="btn-primary" 
                                onClick={handleDismissPause}
                                style={{ background: 'linear-gradient(135deg, #00e676 0%, #00b359 100%)', boxShadow: '0 0 15px rgba(0, 230, 118, 0.4)' }}
                            >
                                ▶️ Продолжить без него
                            </button>
                            {gameState.disconnectedPlayerId && (
                                <button 
                                    className="btn-secondary" 
                                    onClick={() => handleKickPlayer(gameState.disconnectedPlayerId, gameState.disconnectedPlayerName)}
                                    style={{ color: '#ff4d6d', borderColor: 'rgba(255, 77, 109, 0.4)' }}
                                >
                                    ❌ Исключить из матча
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ВЕРХНЯЯ ПАНЕЛЬ: ИГРОКИ, ОЧКИ И УПРАВЛЕНИЕ ТАЙМЕРОМ */}
            <div className="glass-panel" style={{ padding: '1.2rem 1.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.2rem' }}>
                
                {/* Динамическая таблица игроков (отсортирована по набранным очкам: топ 1 — самый левый) */}
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {sortedPlayers.map((p, rankIdx) => {
                        const pRatedCount = progress[p.id] ?? (Object.keys(gameState.ratings?.[p.id] || {}).length);
                        const isAllDone = pRatedCount === 5;
                        const isTop1 = rankIdx === 0 && (p.vp || 0) > 0;
                        const isHostPlayer = p.id === gameState.host;

                        return (
                            <div key={p.id} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.6rem', 
                                background: isTop1 ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.12) 0%, rgba(3, 12, 24, 0.85) 100%)' : 'rgba(3, 12, 24, 0.75)', 
                                padding: '8px 14px', 
                                borderRadius: '14px', 
                                border: isTop1 ? '1px solid rgba(255, 215, 0, 0.6)' : `1px solid ${p.color}55`,
                                boxShadow: isTop1 ? '0 0 16px rgba(255, 215, 0, 0.35)' : `0 0 12px ${p.color}25`,
                                opacity: p.connected ? 1 : 0.65,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}>
                                {/* Бейдж места в рейтинге (#1, #2, #3...) */}
                                <span style={{ 
                                    fontSize: '0.78rem', 
                                    fontWeight: 900, 
                                    color: rankIdx === 0 ? '#ffd700' : rankIdx === 1 ? '#e2e8f0' : rankIdx === 2 ? '#cd7f32' : 'var(--text-muted)',
                                    padding: '1px 5px',
                                    borderRadius: '6px',
                                    background: rankIdx === 0 ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255,255,255,0.06)'
                                }}>
                                    #{rankIdx + 1}
                                </span>

                                {/* Точка подключения: зеленый изумруд или бордовый */}
                                <div 
                                    title={p.connected ? 'В игре (онлайн)' : 'Отключился'}
                                    style={{ 
                                        width: '10px', 
                                        height: '10px', 
                                        borderRadius: '50%', 
                                        backgroundColor: p.connected ? '#00e676' : '#8b0000', 
                                        boxShadow: p.connected ? '0 0 8px #00e676' : '0 0 8px #8b0000', 
                                        flexShrink: 0
                                    }} 
                                />

                                {/* Эмодзи цвета игрока и цветной ник с короной хоста и кнопкой передачи */}
                                <span style={{ fontSize: '1.15rem' }}>{p.emoji || '🌧️'}</span>
                                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: p.color, textShadow: `0 0 8px ${p.color}35`, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <span>{p.nickname}</span>
                                    {isHostPlayer && (
                                        <span title="Хост лобби (ведущий/создатель)" style={{ fontSize: '1.1rem', filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.9))' }}>👑</span>
                                    )}
                                    {/* Серая корона: появляется у хоста при наведении на другого участника для передачи хоста */}
                                    {isHost && !isHostPlayer && p.connected && (
                                        <button
                                            onClick={() => handleTransferHost(p.id, p.nickname)}
                                            title={`Нажмите, чтобы передать статус хоста игроку «${p.nickname}»`}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: '0 2px',
                                                fontSize: '1rem',
                                                filter: 'grayscale(0.85) opacity(0.55)',
                                                transition: 'all 0.2s',
                                                lineHeight: 1,
                                                display: 'inline-flex',
                                                alignItems: 'center'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.filter = 'grayscale(0) opacity(1) drop-shadow(0 0 8px rgba(255, 215, 0, 0.9))';
                                                e.currentTarget.style.transform = 'scale(1.25)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.filter = 'grayscale(0.85) opacity(0.55)';
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }}
                                        >
                                            👑
                                        </button>
                                    )}
                                </span>
                                
                                {gameState.state === 'round_start' && (
                                    <span style={{ 
                                        fontSize: '0.75rem', 
                                        padding: '2px 6px', 
                                        borderRadius: '8px', 
                                        background: isAllDone ? 'rgba(0, 230, 118, 0.2)' : 'rgba(28, 160, 229, 0.15)',
                                        color: isAllDone ? '#00e676' : 'var(--accent-blue)',
                                        fontWeight: 700 
                                    }}>
                                        {pRatedCount}/5
                                    </span>
                                )}

                                <strong style={{ color: isTop1 ? '#ffd700' : '#ffffff', padding: '2px 8px', background: isTop1 ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '0.9rem' }}>
                                    {p.vp} ПО
                                </strong>

                                {/* Для хоста: кнопка исключить отключившегося игрока */}
                                {isHost && !p.connected && (
                                    <button
                                        onClick={() => handleKickPlayer(p.id, p.nickname)}
                                        title="Исключить игрока из матча"
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#ff4d6d',
                                            cursor: 'pointer',
                                            padding: '0 2px',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* БЛОК ТАЙМЕРА И КНОПОК ХОСТА */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {gameState.state === 'round_start' && (
                        <>
                            {/* Индикатор времени */}
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.6rem',
                                background: 'rgba(3, 10, 20, 0.8)',
                                padding: '6px 16px',
                                borderRadius: '14px',
                                border: timeLeft <= 10 && timerRunning ? '1px solid var(--accent-d)' : '1px solid var(--surface-border)'
                            }}>
                                <span style={{ fontSize: '1.2rem' }}>⏱️</span>
                                <span style={{ 
                                    fontSize: '2rem', 
                                    fontWeight: 800, 
                                    color: timeLeft <= 10 && timerRunning ? 'var(--accent-d)' : 'var(--accent-blue)',
                                    textShadow: timeLeft <= 10 && timerRunning ? '0 0 20px rgba(255, 56, 100, 0.7)' : '0 0 15px rgba(28, 160, 229, 0.5)',
                                    minWidth: '55px',
                                    textAlign: 'center'
                                }}>
                                    {timeLeft}с
                                </span>
                                {!timerRunning && timeLeft < 60 && (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-c)', fontWeight: 700, textTransform: 'uppercase' }}>
                                        (Пауза)
                                    </span>
                                )}
                            </div>

                            {/* Кнопки управления хоста */}
                            {isHost && (
                                <div style={{ display: 'flex', gap: '0.6rem' }}>
                                    {!timerRunning ? (
                                        <button className="btn-primary" onClick={timeLeft === 60 ? handleStartTimer : handleResumeTimer} style={{ padding: '8px 16px', fontSize: '0.95rem' }}>
                                            {timeLeft === 60 ? '▶️ Запуск таймера (60с)' : '▶️ Возобновить'}
                                        </button>
                                    ) : (
                                        <button className="btn-secondary" onClick={handlePauseTimer} style={{ padding: '8px 16px', fontSize: '0.95rem' }}>
                                            ⏸️ Пауза
                                        </button>
                                    )}

                                    {/* Кнопка быстрого досрочного завершения (всегда доступна хосту) */}
                                    <button 
                                        className="btn-primary" 
                                        onClick={handleEndRoundEarly}
                                        style={{ 
                                            background: 'linear-gradient(135deg, #00e5ff 0%, #1ca0e5 100%)', 
                                            padding: '8px 18px', 
                                            fontSize: '0.95rem',
                                            boxShadow: '0 0 15px rgba(0, 229, 255, 0.4)'
                                        }}
                                        title="Завершить раунд и вскрыть оценки прямо сейчас, не дожидаясь таймера"
                                    >
                                        ⚡ Завершить раунд
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {/* В режиме раскрытия (reveal) кнопка перехода к следующему раунду или итогам игры */}
                    {gameState.state === 'reveal' && isHost && (
                        gameState.winner ? (
                            <button 
                                className="btn-primary" 
                                onClick={handleFinishGame} 
                                style={{ 
                                    padding: '12px 28px', 
                                    fontSize: '1.05rem',
                                    background: 'linear-gradient(135deg, #ffd700 0%, #ff9900 100%)',
                                    color: '#000000',
                                    boxShadow: '0 0 25px rgba(255, 215, 0, 0.55)',
                                    fontWeight: 900
                                }}
                                title="Перейти к итоговой таблице и награждению победителя"
                            >
                                🏆 Итоги игры ➔
                            </button>
                        ) : (
                            <button className="btn-primary" onClick={handleNextRound} style={{ padding: '12px 28px', fontSize: '1.05rem' }}>
                                🌧️ Следующий раунд ➔
                            </button>
                        )
                    )}

                    {/* Кнопка закрытия комнаты хостом */}
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
                            style={{ borderColor: 'rgba(255, 56, 100, 0.45)', color: '#ff4d6d', padding: '8px 14px', fontSize: '0.9rem' }}
                        >
                            🛑 Закрыть комнату
                        </button>
                    )}

                    {/* Кнопка выхода в главное меню */}
                    <button
                        className="btn-secondary"
                        onClick={handleLeaveGame}
                        title="Выйти в главное меню (вы сможете вернуться в этот матч в любой момент по тому же нику)"
                        style={{ borderColor: 'rgba(255, 77, 109, 0.35)', color: '#ff6b81', padding: '8px 14px', fontSize: '0.9rem' }}
                    >
                        🚪 Выйти в меню
                    </button>
                </div>
            </div>

            {/* ПОДСКАЗКА ДЛЯ ИГРОКА */}
            {gameState.state === 'round_start' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        Расставьте ранги от <strong style={{ color: 'var(--accent-s)' }}>S</strong> до <strong style={{ color: 'var(--accent-d)' }}>D</strong>. Кликните повторно по букве, чтобы снять оценку.
                    </div>
                    <div style={{ fontWeight: 700, color: ratedCount === 5 ? '#00e676' : 'var(--accent-blue)', fontSize: '0.95rem' }}>
                        {ratedCount === 5 ? '✓ Все 5 фильмов оценены' : `Оценено: ${ratedCount} из 5`}
                    </div>
                </div>
            )}

            {/* СЕТКА ФИЛЬМОВ (5 ШТУК) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.6rem', marginTop: '0.2rem' }}>
                {gameState.movies?.map((movie) => {
                    const currentRating = myRatings[movie.id];
                    const roundBreakdown = gameState.roundDetails?.[movie.id] || {};
                    const movieAvg = getMovieAvg(movie.id);

                    return (
                        <div key={movie.id} className="glass-panel" style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            padding: '1.1rem',
                            border: currentRating ? `1px solid ${getRatingColor(currentRating)}` : '1px solid var(--surface-border)',
                            boxShadow: currentRating ? `0 8px 30px ${getRatingColor(currentRating)}25` : '0 10px 30px rgba(0,0,0,0.5)',
                            transition: 'all 0.3s ease'
                        }}>
                            
                            {/* Постер фильма с соотношением 2:3 */}
                            <div style={{ 
                                position: 'relative', 
                                paddingTop: '148%', 
                                borderRadius: '14px', 
                                overflow: 'hidden', 
                                background: '#071526',
                                border: '1px solid rgba(255,255,255,0.08)'
                            }}>
                                <img 
                                    src={movie.posterUrl} 
                                    alt={movie.title} 
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://placehold.co/400x600/081a30/1ca0e5?text=${encodeURIComponent(movie.title)}`;
                                    }}
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                                />

                                {/* Средняя оценка пользователей (появляется в левом углу постера после завершения раунда) */}
                                {gameState.state === 'reveal' && (
                                    <div 
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            left: '10px',
                                            padding: '5px 10px',
                                            borderRadius: '10px',
                                            background: 'rgba(3, 10, 24, 0.92)',
                                            backdropFilter: 'blur(8px)',
                                            border: '1px solid rgba(255, 215, 0, 0.6)',
                                            boxShadow: '0 0 16px rgba(255, 215, 0, 0.35)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            zIndex: 3
                                        }}
                                        title={`Средняя оценка всех игроков: ${movieAvg ? `${movieAvg} / 5` : 'Нет оценок'}`}
                                    >
                                        <span style={{ fontSize: '1rem' }}>⭐</span>
                                        <span style={{ 
                                            fontSize: '0.95rem', 
                                            fontWeight: 800, 
                                            color: '#ffd700',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {movieAvg ?? '—'}
                                        </span>
                                    </div>
                                )}

                                {/* Выбранный бейдж ранга в правом углу постера */}
                                {currentRating && (
                                    <div 
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            width: '42px',
                                            height: '42px',
                                            borderRadius: '12px',
                                            background: getRatingColor(currentRating),
                                            color: '#000',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 800,
                                            fontSize: '1.5rem',
                                            boxShadow: `0 0 20px ${getRatingColor(currentRating)}`,
                                            zIndex: 2,
                                            transition: 'all 0.2s'
                                        }}
                                        title={`Выставлен ранг: ${currentRating}`}
                                    >
                                        {currentRating}
                                    </div>
                                )}
                            </div>

                            {/* Название фильма */}
                            <h4 style={{ 
                                textAlign: 'center', 
                                margin: '0.9rem 0', 
                                fontSize: '1.05rem', 
                                fontWeight: 700,
                                minHeight: '2.8rem', 
                                display: '-webkit-box', 
                                WebkitLineClamp: 2, 
                                WebkitBoxOrient: 'vertical', 
                                overflow: 'hidden',
                                color: '#ffffff'
                            }}>
                                {movie.title}
                            </h4>

                            {/* РЕЖИМ 1: ГОЛОСОВАНИЕ (ROUND_START) */}
                            {gameState.state === 'round_start' && (
                                <div style={{ 
                                    background: 'rgba(3, 10, 22, 0.6)', 
                                    padding: '0.8rem', 
                                    borderRadius: '14px', 
                                    display: 'flex', 
                                    gap: '0.45rem', 
                                    justifyContent: 'center', 
                                    border: '1px solid var(--surface-border)' 
                                }}>
                                    {availableRatings.map(r => {
                                        const isSelected = currentRating === r;
                                        const isUsedElsewhere = getUsedRatings().includes(r) && !isSelected;
                                        const color = getRatingColor(r);

                                        return (
                                            <button 
                                                key={r}
                                                onClick={() => handleRating(movie.id, r)}
                                                title={isSelected ? 'Нажмите, чтобы снять оценку' : isUsedElsewhere ? 'Уже используется на другом фильме (клик перенесёт сюда)' : `Поставить ранг ${r}`}
                                                style={{
                                                    flex: 1,
                                                    height: '46px', 
                                                    borderRadius: '10px', 
                                                    border: isSelected ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.08)',
                                                    fontWeight: 800, 
                                                    fontSize: '1.25rem', 
                                                    cursor: 'pointer',
                                                    background: isSelected ? color : 'rgba(255,255,255,0.04)',
                                                    color: isSelected ? '#000000' : isUsedElsewhere ? 'rgba(255,255,255,0.3)' : '#ffffff',
                                                    boxShadow: isSelected ? `0 0 18px ${color}` : 'none',
                                                    transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    transform: isSelected ? 'scale(1.08)' : 'scale(1)'
                                                }}
                                            >
                                                {r}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* РЕЖИМ 2: ВСКРЫТИЕ ОЦЕНОК (REVEAL) */}
                            {gameState.state === 'reveal' && (
                                <div style={{ 
                                    background: 'rgba(3, 10, 22, 0.75)', 
                                    padding: '0.8rem', 
                                    borderRadius: '14px', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    gap: '0.5rem',
                                    border: '1px solid var(--surface-border)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                                        <span>Оценки игроков:</span>
                                        {movieAvg && (
                                            <span style={{ color: '#ffd700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                <span>⭐</span> Ср. балл: {movieAvg}
                                            </span>
                                        )}
                                    </div>

                                    {availableRatings.map(r => {
                                        const ratedPlayerIds = roundBreakdown[r] || [];
                                        if (ratedPlayerIds.length === 0) return null;

                                        const playersList = ratedPlayerIds.map(pId => gameState.players.find(p => p.id === pId)).filter(Boolean);
                                        const hasMatch = ratedPlayerIds.length >= 2;
                                        const color = getRatingColor(r);

                                        return (
                                            <div key={r} style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '0.6rem',
                                                padding: '4px 8px',
                                                borderRadius: '8px',
                                                background: hasMatch ? `${color}20` : 'transparent',
                                                border: hasMatch ? `1px solid ${color}55` : 'none'
                                            }}>
                                                <span style={{ 
                                                    fontWeight: 800, 
                                                    fontSize: '1rem', 
                                                    color: color, 
                                                    minWidth: '22px' 
                                                }}>
                                                    {r}:
                                                </span>
                                                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                                    {playersList.map(p => (
                                                        <span key={p.id} style={{ 
                                                            fontSize: '0.88rem', 
                                                            color: p.color, 
                                                            fontWeight: 700,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            background: `${p.color}18`,
                                                            border: `1px solid ${p.color}44`,
                                                            padding: '2px 8px',
                                                            borderRadius: '6px',
                                                            boxShadow: `0 0 8px ${p.color}20`
                                                        }}>
                                                            <span style={{ fontSize: '1rem' }}>{p.emoji || '🌧️'}</span>
                                                            <span>{p.nickname}</span>
                                                        </span>
                                                    ))}
                                                    {hasMatch && (
                                                        <span style={{ fontSize: '0.75rem', color: '#00e676', fontWeight: 800, marginLeft: 'auto' }}>
                                                            +{ratedPlayerIds.length - 1} ПО
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                        </div>
                    );
                })}
            </div>

            {/* ИТОГИ РАУНДА В ФАЗЕ ВСКРЫТИЯ */}
            {gameState.state === 'reveal' && (
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', marginTop: '1rem' }}>
                    {gameState.winner ? (
                        <div style={{ marginBottom: '1.2rem', padding: '14px 22px', borderRadius: '14px', background: 'rgba(255, 215, 0, 0.12)', border: '1px solid rgba(255, 215, 0, 0.55)', boxShadow: '0 0 25px rgba(255, 215, 0, 0.25)', display: 'inline-block' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '1.8rem' }}>🏆</span>
                                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffd700' }}>
                                    Победитель определён: {gameState.winner.nickname} ({gameState.winner.vp} ПО)!
                                </span>
                            </div>
                            <div style={{ color: '#e2e8f0', fontSize: '0.95rem', marginTop: '6px' }}>
                                {isHost ? 'Все оценки вскрыты! Нажмите кнопку «🏆 Итоги игры» наверху для перехода к финальной таблице.' : 'Все оценки вскрыты! Ожидаем, пока ведущий нажмёт «Итоги игры».'}
                            </div>
                        </div>
                    ) : (
                        <h3 style={{ fontSize: '1.4rem', margin: '0 0 0.8rem', color: 'var(--accent-blue)' }}>
                            🌧️ Раунд завершён! Очки начислены за все совпадения.
                        </h3>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        {sortedPlayers.map(p => (
                            <div key={p.id} style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: p.connected ? '#00e676' : '#8b0000', display: 'inline-block' }} />
                                <span style={{ fontSize: '1.15rem' }}>{p.emoji || '🌧️'}</span>
                                <span style={{ color: p.color, fontWeight: 700, textShadow: `0 0 8px ${p.color}35`, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                    {p.nickname}
                                    {p.id === gameState.host && <span title="Хост лобби" style={{ fontSize: '1rem' }}>👑</span>}:
                                </span>
                                <strong style={{ color: '#00e676' }}>+{(gameState.roundPoints?.[p.id] || 0)} ПО</strong>
                                <span style={{ color: 'var(--text-muted)' }}> (Всего: {p.vp})</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Плашка снизу с кодом комнаты для быстрого копирования */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0 1.5rem' }}>
                <button
                    onClick={handleCopyCode}
                    className="glass-panel"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px 20px',
                        borderRadius: '26px',
                        cursor: 'pointer',
                        border: copiedCode ? '1px solid #00e676' : '1px solid rgba(28, 160, 229, 0.4)',
                        color: copiedCode ? '#00e676' : '#ffffff',
                        background: 'rgba(3, 10, 24, 0.85)',
                        boxShadow: copiedCode ? '0 0 20px rgba(0, 230, 118, 0.35)' : '0 4px 20px rgba(0, 0, 0, 0.45)',
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        letterSpacing: '2.5px',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        outline: 'none',
                        textShadow: copiedCode ? 'none' : '0 0 12px rgba(28, 160, 229, 0.5)'
                    }}
                    title="Нажмите, чтобы скопировать код комнаты"
                >
                    {copiedCode ? '✓ СКОПИРОВАНО!' : gameState.id}
                </button>
            </div>
        </div>
    );
};

export default GameScreen;
