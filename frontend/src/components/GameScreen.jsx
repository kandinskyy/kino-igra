import React, { useState, useEffect } from 'react';
import { useGame } from '../GameContext';

const GameScreen = () => {
    const { socket, gameState, player } = useGame();
    
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
        socket.emit('resume_timer', gameState.id);
    };

    // Быстрое досрочное завершение раунда (хост)
    const handleEndRoundEarly = () => {
        socket.emit('end_round_early', gameState.id);
    };

    // Следующий раунд (хост)
    const handleNextRound = () => {
        setMyRatings({});
        socket.emit('next_round', gameState.id);
    };

    // Перезапуск игры (хост)
    const handleRestartGame = () => {
        setMyRatings({});
        socket.emit('restart_game', gameState.id);
    };

    // Выставление / изменение оценки с защитой от миссклика
    const handleRating = (movieId, rating) => {
        if (gameState.state !== 'round_start') return;

        const newRatings = { ...myRatings };

        // 1. Если кликнули на уже выбранную букву у этого фильма -> снимаем её (сброс)
        if (newRatings[movieId] === rating) {
            delete newRatings[movieId];
        } else {
            // 2. Если буква уже стояла на другом фильме -> убираем её оттуда
            for (const [mId, r] of Object.entries(newRatings)) {
                if (r === rating) delete newRatings[mId];
            }
            newRatings[movieId] = rating;
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
    // ЭКРАН ПОБЕДЫ (GAME OVER)
    // ==========================================
    if (gameState.state === 'game_over') {
        const winner = gameState.winner || gameState.players[0];
        const sortedPlayers = [...gameState.players].sort((a, b) => b.vp - a.vp);

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '800px', margin: '4vh auto', textAlign: 'center' }}>
                <div className="glass-panel" style={{ padding: '3rem', border: '2px solid var(--accent-blue)', boxShadow: '0 0 50px rgba(28, 160, 229, 0.4)' }}>
                    <div style={{ fontSize: '4.5rem', marginBottom: '1rem', animation: 'floatCloud 3s ease-in-out infinite' }}>🏆</div>
                    <div style={{ color: 'var(--accent-blue)', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '2px' }}>ПОБЕДИТЕЛЬ ИГРЫ!</div>
                    <h1 style={{ fontSize: '3rem', margin: '0.5rem 0 1.5rem', color: '#ffffff', textShadow: '0 0 20px rgba(28, 160, 229, 0.6)' }}>
                        {winner?.nickname} <span style={{ fontSize: '1.8rem', color: 'var(--accent-a)' }}>({winner?.vp} ПО)</span>
                    </h1>

                    <div style={{ margin: '2rem 0', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <h3 style={{ color: 'var(--text-muted)', fontSize: '1rem', textTransform: 'uppercase' }}>Итоговая таблица лидеров:</h3>
                        {sortedPlayers.map((p, idx) => (
                            <div key={p.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px 20px',
                                background: idx === 0 ? 'rgba(28, 160, 229, 0.15)' : 'rgba(3, 10, 22, 0.5)',
                                borderRadius: '12px',
                                border: idx === 0 ? '1px solid var(--accent-blue)' : '1px solid var(--surface-border)'
                            }}>
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: idx === 0 ? 'var(--accent-blue)' : '#ffffff' }}>
                                    {idx + 1}. {p.nickname} {idx === 0 && '👑'}
                                </span>
                                <strong style={{ fontSize: '1.2rem', color: 'var(--accent-a)' }}>{p.vp} ПО</strong>
                            </div>
                        ))}
                    </div>

                    {isHost && (
                        <button className="btn-primary" onClick={handleRestartGame} style={{ padding: '16px 36px', fontSize: '1.2rem' }}>
                            🌧️ Начать новую игру
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // ==========================================
    // ОСНОВНОЙ ЭКРАН ИГРЫ ИЛИ ВСКРЫТИЕ РЕЗУЛЬТАТОВ
    // ==========================================
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1440px', margin: '0 auto', marginTop: '1vh' }}>
            
            {/* ВЕРХНЯЯ ПАНЕЛЬ: ИГРОКИ, ОЧКИ И УПРАВЛЕНИЕ ТАЙМЕРОМ */}
            <div className="glass-panel" style={{ padding: '1.2rem 1.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.2rem' }}>
                
                {/* Список игроков с очками и индикатором готовности */}
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {gameState.players.map(p => {
                        const pRatedCount = progress[p.id] ?? (Object.keys(gameState.ratings?.[p.id] || {}).length);
                        const isAllDone = pRatedCount === 5;

                        return (
                            <div key={p.id} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.6rem', 
                                background: 'rgba(3, 12, 24, 0.75)', 
                                padding: '8px 14px', 
                                borderRadius: '14px', 
                                border: `1px solid ${p.color}55`,
                                boxShadow: `0 0 12px ${p.color}25` 
                            }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: p.color, boxShadow: `0 0 8px ${p.color}` }}></div>
                                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.nickname}</span>
                                
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

                                <strong style={{ color: '#ffffff', padding: '2px 8px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '0.9rem' }}>
                                    {p.vp} ПО
                                </strong>
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

                    {/* В режиме раскрытия (reveal) кнопка перехода к следующему раунду */}
                    {gameState.state === 'reveal' && isHost && (
                        <button className="btn-primary" onClick={handleNextRound} style={{ padding: '12px 28px', fontSize: '1.05rem' }}>
                            🌧️ Следующий раунд ➔
                        </button>
                    )}
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

                    return (
                        <div key={movie.id} className="glass-panel" style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            padding: '1.1rem',
                            border: currentRating ? `1px solid ${getRatingColor(currentRating)}` : '1px solid var(--surface-border)',
                            boxShadow: currentRating ? `0 8px 30px ${getRatingColor(currentRating)}25` : '0 10px 30px rgba(0,0,0,0.5)',
                            transition: 'all 0.3s ease'
                        }}>
                            
                            {/* Постер фильма с аккуратным соотношением 2:3 */}
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

                                {/* Выбранный бейдж ранга в углу постера */}
                                {currentRating && (
                                    <div style={{
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
                                        zIndex: 2
                                    }}>
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
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center' }}>
                                        Оценки игроков:
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
                                                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                                    {playersList.map(p => (
                                                        <span key={p.id} style={{ 
                                                            fontSize: '0.85rem', 
                                                            color: '#ffffff', 
                                                            fontWeight: 600,
                                                            borderBottom: `2px solid ${p.color}` 
                                                        }}>
                                                            {p.nickname}
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
                    <h3 style={{ fontSize: '1.4rem', margin: '0 0 0.8rem', color: 'var(--accent-blue)' }}>
                        🌧️ Раунд завершён! Очки начислены за все совпадения.
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        {gameState.players.map(p => (
                            <div key={p.id} style={{ fontSize: '1.05rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>{p.nickname}: </span>
                                <strong style={{ color: '#00e676' }}>+{(gameState.roundPoints?.[p.id] || 0)} ПО</strong>
                                <span style={{ color: 'var(--text-muted)' }}> (Всего: {p.vp})</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameScreen;
