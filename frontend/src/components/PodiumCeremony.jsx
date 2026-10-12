import React, { useState, useEffect } from 'react';
import ConfettiCannons from './ConfettiCannons';

export default function PodiumCeremony({
    players = [],
    winner = null,
    isHost = false,
    onRestartGame,
    onLeaveGame,
}) {
    // Сортировка игроков по очкам (по убыванию)
    const sortedPlayers = [...players].sort((a, b) => b.vp - a.vp);

    const firstPlace = sortedPlayers[0] || null;
    const secondPlace = sortedPlayers[1] || null;
    const thirdPlace = sortedPlayers[2] || null;

    // Шаги анимации:
    // 0: Появляется только пустой пьедестал с цифрами мест
    // 1: Появляется 3-е место (через 2 секунды)
    // 2: Появляется 2-е место (через 4 секунды)
    // 3: Появляется 1-е место + выстрел конфетти из боковых пушек (через 6 секунд)
    // 4: Открывается полная таблица очков всех игроков (через 8.5 секунд)
    const [step, setStep] = useState(0);
    const [confettiTrigger, setConfettiTrigger] = useState(0);

    const totalPlaces = Math.min(3, sortedPlayers.length);

    useEffect(() => {
        // Тайминги появления участников строго раз в 2 секунды:
        // Если участников 3 и более:
        // 2000ms -> 3 место
        // 4000ms -> 2 место
        // 6000ms -> 1 место (конфетти!)
        // 8500ms -> полная таблица очков
        const timers = [];

        if (totalPlaces >= 3) {
            timers.push(setTimeout(() => setStep(1), 2000));
            timers.push(setTimeout(() => setStep(2), 4000));
            timers.push(setTimeout(() => {
                setStep(3);
                setConfettiTrigger(Date.now());
            }, 6000));
            timers.push(setTimeout(() => setStep(4), 8500));
        } else if (totalPlaces === 2) {
            // 2 игрока: 2-е место на 2с, 1-е место на 4с
            timers.push(setTimeout(() => setStep(2), 2000));
            timers.push(setTimeout(() => {
                setStep(3);
                setConfettiTrigger(Date.now());
            }, 4000));
            timers.push(setTimeout(() => setStep(4), 6500));
        } else {
            // 1 игрок
            timers.push(setTimeout(() => {
                setStep(3);
                setConfettiTrigger(Date.now());
            }, 2000));
            timers.push(setTimeout(() => setStep(4), 4500));
        }

        return () => {
            timers.forEach(clearTimeout);
        };
    }, [totalPlaces]);

    // Кнопка быстрого пропуска к полной таблице
    const handleSkip = () => {
        setStep(4);
        setConfettiTrigger(Date.now());
    };

    // Перезапуск анимации церемонии
    const handleReplay = () => {
        setStep(0);
        const timers = [];
        if (totalPlaces >= 3) {
            timers.push(setTimeout(() => setStep(1), 2000));
            timers.push(setTimeout(() => setStep(2), 4000));
            timers.push(setTimeout(() => {
                setStep(3);
                setConfettiTrigger(Date.now());
            }, 6000));
            timers.push(setTimeout(() => setStep(4), 8500));
        } else if (totalPlaces === 2) {
            timers.push(setTimeout(() => setStep(2), 2000));
            timers.push(setTimeout(() => {
                setStep(3);
                setConfettiTrigger(Date.now());
            }, 4000));
            timers.push(setTimeout(() => setStep(4), 6500));
        } else {
            timers.push(setTimeout(() => {
                setStep(3);
                setConfettiTrigger(Date.now());
            }, 2000));
            timers.push(setTimeout(() => setStep(4), 4500));
        }
    };

    // Проверка видимости каждого места
    const isThirdVisible = step >= 1 && thirdPlace !== null;
    const isSecondVisible = step >= 2 && secondPlace !== null;
    const isFirstVisible = step >= 3 && firstPlace !== null;
    const showFullTable = step >= 4;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2.5rem',
            width: '100%',
            maxWidth: '1000px',
            margin: '2vh auto 5vh',
            textAlign: 'center',
            position: 'relative'
        }}>
            {/* Пушки с конфетти по бокам экрана */}
            <ConfettiCannons fireTrigger={confettiTrigger} />

            {/* Верхняя плашка церемонии */}
            <div className="glass-panel" style={{
                padding: '2rem 2.5rem',
                border: '2px solid rgba(255, 215, 0, 0.4)',
                boxShadow: '0 0 50px rgba(255, 215, 0, 0.25)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Фоновое сияние */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '600px',
                    height: '350px',
                    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.18) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }} />

                {/* Кнопка "Пропустить" / "Повторить" в верхнем углу */}
                <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
                    {!showFullTable ? (
                        <button
                            className="btn-secondary"
                            onClick={handleSkip}
                            style={{
                                padding: '6px 14px',
                                fontSize: '0.85rem',
                                color: 'var(--text-muted)',
                                borderColor: 'rgba(255, 255, 255, 0.15)',
                                background: 'rgba(5, 15, 30, 0.6)'
                            }}
                            title="Пропустить анимацию и сразу открыть результаты"
                        >
                            ⏭️ Пропустить
                        </button>
                    ) : (
                        <button
                            className="btn-secondary"
                            onClick={handleReplay}
                            style={{
                                padding: '6px 14px',
                                fontSize: '0.85rem',
                                color: 'var(--accent-a)',
                                borderColor: 'rgba(0, 229, 255, 0.3)',
                                background: 'rgba(5, 15, 30, 0.6)'
                            }}
                            title="Запустить церемонию награждения заново"
                        >
                            🔄 Повторить церемонию
                        </button>
                    )}
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                        fontSize: '3.2rem',
                        marginBottom: '0.5rem',
                        animation: isFirstVisible ? 'goldCrownFloat 2.5s ease-in-out infinite' : 'floatCloud 3s ease-in-out infinite'
                    }}>
                        🏆
                    </div>
                    <div style={{
                        color: 'var(--accent-blue)',
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        marginBottom: '0.4rem'
                    }}>
                        Церемония награждения
                    </div>
                    <h1 style={{
                        fontSize: '2.5rem',
                        margin: '0',
                        color: '#ffffff',
                        textShadow: '0 0 25px rgba(255, 215, 0, 0.5)'
                    }}>
                        {isFirstVisible ? (
                            <>
                                Победитель: <span style={{ color: firstPlace?.color || '#ffd700' }}>{firstPlace?.nickname}</span>!
                            </>
                        ) : (
                            'Определение победителей...'
                        )}
                    </h1>
                </div>

                {/* ==================================================== */}
                {/* СЦЕНА ПЬЕДЕСТАЛА С МЕСТАМИ 2, 1, 3 */}
                {/* ==================================================== */}
                <div style={{
                    marginTop: '3.5rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    gap: totalPlaces >= 3 ? '24px' : '36px',
                    minHeight: '440px',
                    animation: 'podiumRise 0.8s cubic-bezier(0.2, 0.8, 0.3, 1) forwards'
                }}>

                    {/* ---------------- 2 МЕСТО (СЛЕВА) ---------------- */}
                    {secondPlace && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: totalPlaces >= 3 ? '190px' : '220px',
                            transition: 'all 0.5s ease'
                        }}>
                            {/* Карточка участника над пьедесталом */}
                            <div style={{
                                minHeight: '180px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                marginBottom: '14px',
                                opacity: isSecondVisible ? 1 : 0,
                                transform: isSecondVisible ? 'none' : 'translateY(-40px) scale(0.6)',
                                transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                pointerEvents: isSecondVisible ? 'auto' : 'none'
                            }}>
                                {isSecondVisible && (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        animation: 'dropInBounce 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                    }}>
                                        {/* Над эмодзи: сколько очков он набрал */}
                                        <div style={{
                                            padding: '4px 14px',
                                            borderRadius: '20px',
                                            background: 'rgba(192, 205, 225, 0.18)',
                                            border: '1px solid rgba(192, 205, 225, 0.5)',
                                            color: '#e2e8f0',
                                            fontWeight: 800,
                                            fontSize: '1.05rem',
                                            marginBottom: '8px',
                                            boxShadow: '0 0 15px rgba(192, 205, 225, 0.3)',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {secondPlace.vp} ПО
                                        </div>

                                        {/* Эмодзи: слегка прыгает и радуется */}
                                        <div style={{
                                            position: 'relative',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{
                                                fontSize: '3.8rem',
                                                display: 'inline-block',
                                                animation: 'emojiJoyJump2 1.25s ease-in-out infinite',
                                                filter: 'drop-shadow(0 4px 12px rgba(192, 205, 225, 0.4))'
                                            }}>
                                                {secondPlace.emoji || '🌧️'}
                                            </span>
                                            {/* Пульсирующая тень под эмодзи */}
                                            <div style={{
                                                width: '42px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: 'rgba(0, 0, 0, 0.7)',
                                                marginTop: '-4px',
                                                animation: 'emojiShadowPulse 1.25s ease-in-out infinite'
                                            }} />
                                        </div>

                                        {/* Снизу эмодзи: никнейм человека */}
                                        <div style={{
                                            marginTop: '10px',
                                            fontWeight: 800,
                                            fontSize: '1.15rem',
                                            color: secondPlace.color || '#cbd5e1',
                                            textShadow: `0 0 12px ${secondPlace.color || '#cbd5e1'}60`,
                                            whiteSpace: 'nowrap',
                                            maxWidth: '180px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {secondPlace.nickname}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Тумба 2-го места (Серебро) */}
                            <div style={{
                                width: '100%',
                                height: '145px',
                                borderRadius: '16px 16px 4px 4px',
                                background: 'linear-gradient(180deg, rgba(192, 205, 225, 0.32) 0%, rgba(100, 125, 160, 0.15) 100%)',
                                border: '2px solid rgba(192, 205, 225, 0.75)',
                                boxShadow: isSecondVisible
                                    ? '0 0 30px rgba(192, 205, 225, 0.4), inset 0 2px 10px rgba(255, 255, 255, 0.25)'
                                    : '0 0 15px rgba(192, 205, 225, 0.15)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                position: 'relative',
                                backdropFilter: 'blur(12px)',
                                transition: 'all 0.5s ease'
                            }}>
                                <div style={{
                                    fontSize: '3.4rem',
                                    fontWeight: 900,
                                    color: '#f1f5f9',
                                    textShadow: '0 0 20px rgba(192, 205, 225, 0.8)',
                                    lineHeight: 1
                                }}>
                                    2
                                </div>
                                <div style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 800,
                                    letterSpacing: '1.5px',
                                    color: 'rgba(241, 245, 249, 0.85)',
                                    textTransform: 'uppercase'
                                }}>
                                    🥈 2 МЕСТО
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ---------------- 1 МЕСТО (ЦЕНТР, САМОЕ ВЫСОКОЕ) ---------------- */}
                    {firstPlace && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: totalPlaces >= 3 ? '220px' : '240px',
                            zIndex: 2,
                            transition: 'all 0.5s ease'
                        }}>
                            {/* Карточка победителя над пьедесталом */}
                            <div style={{
                                minHeight: '200px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                marginBottom: '14px',
                                opacity: isFirstVisible ? 1 : 0,
                                transform: isFirstVisible ? 'none' : 'translateY(-50px) scale(0.6)',
                                transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                pointerEvents: isFirstVisible ? 'auto' : 'none'
                            }}>
                                {isFirstVisible && (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        animation: 'dropInBounce 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                    }}>
                                        {/* Корона над победителем */}
                                        <div style={{
                                            fontSize: '2rem',
                                            marginBottom: '-8px',
                                            animation: 'goldCrownFloat 2.2s ease-in-out infinite',
                                            filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))'
                                        }}>
                                            👑
                                        </div>

                                        {/* Над эмодзи: сколько очков он набрал */}
                                        <div style={{
                                            padding: '6px 18px',
                                            borderRadius: '20px',
                                            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.35) 0%, rgba(255, 160, 0, 0.25) 100%)',
                                            border: '2px solid #ffd700',
                                            color: '#ffd700',
                                            fontWeight: 900,
                                            fontSize: '1.25rem',
                                            marginBottom: '8px',
                                            boxShadow: '0 0 25px rgba(255, 215, 0, 0.6)',
                                            letterSpacing: '1px'
                                        }}>
                                            {firstPlace.vp} ПО
                                        </div>

                                        {/* Эмодзи: слегка прыгает и радуется */}
                                        <div style={{
                                            position: 'relative',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{
                                                fontSize: '4.6rem',
                                                display: 'inline-block',
                                                animation: 'emojiJoyJump1 1.1s ease-in-out infinite',
                                                filter: 'drop-shadow(0 6px 18px rgba(255, 215, 0, 0.65))'
                                            }}>
                                                {firstPlace.emoji || '🌧️'}
                                            </span>
                                            {/* Пульсирующая тень под эмодзи */}
                                            <div style={{
                                                width: '54px',
                                                height: '10px',
                                                borderRadius: '50%',
                                                background: 'rgba(0, 0, 0, 0.85)',
                                                marginTop: '-6px',
                                                animation: 'emojiShadowPulse 1.1s ease-in-out infinite'
                                            }} />
                                        </div>

                                        {/* Снизу эмодзи: никнейм человека */}
                                        <div style={{
                                            marginTop: '10px',
                                            fontWeight: 900,
                                            fontSize: '1.35rem',
                                            color: firstPlace.color || '#ffd700',
                                            textShadow: `0 0 18px ${firstPlace.color || '#ffd700'}90`,
                                            whiteSpace: 'nowrap',
                                            maxWidth: '210px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {firstPlace.nickname}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Тумба 1-го места (Золото, самая высокая) */}
                            <div style={{
                                width: '100%',
                                height: '205px',
                                borderRadius: '18px 18px 4px 4px',
                                background: 'linear-gradient(180deg, rgba(255, 215, 0, 0.42) 0%, rgba(200, 130, 0, 0.2) 100%)',
                                border: '3px solid #ffd700',
                                boxShadow: isFirstVisible
                                    ? '0 0 45px rgba(255, 215, 0, 0.6), inset 0 2px 14px rgba(255, 245, 180, 0.4)'
                                    : '0 0 25px rgba(255, 215, 0, 0.25)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                position: 'relative',
                                backdropFilter: 'blur(14px)',
                                transition: 'all 0.5s ease'
                            }}>
                                <div style={{
                                    fontSize: '4.2rem',
                                    fontWeight: 900,
                                    color: '#ffd700',
                                    textShadow: '0 0 30px rgba(255, 215, 0, 0.95)',
                                    lineHeight: 1
                                }}>
                                    1
                                </div>
                                <div style={{
                                    fontSize: '0.95rem',
                                    fontWeight: 900,
                                    letterSpacing: '2px',
                                    color: '#ffe57f',
                                    textTransform: 'uppercase',
                                    textShadow: '0 0 10px rgba(255, 215, 0, 0.6)'
                                }}>
                                    🥇 1 МЕСТО
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ---------------- 3 МЕСТО (СПРАВА, ЕСЛИ ЕСТЬ) ---------------- */}
                    {thirdPlace && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '180px',
                            transition: 'all 0.5s ease'
                        }}>
                            {/* Карточка участника над пьедесталом */}
                            <div style={{
                                minHeight: '160px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                marginBottom: '14px',
                                opacity: isThirdVisible ? 1 : 0,
                                transform: isThirdVisible ? 'none' : 'translateY(-40px) scale(0.6)',
                                transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                pointerEvents: isThirdVisible ? 'auto' : 'none'
                            }}>
                                {isThirdVisible && (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        animation: 'dropInBounce 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                    }}>
                                        {/* Над эмодзи: сколько очков он набрал */}
                                        <div style={{
                                            padding: '4px 14px',
                                            borderRadius: '20px',
                                            background: 'rgba(205, 127, 50, 0.2)',
                                            border: '1px solid rgba(205, 127, 50, 0.5)',
                                            color: '#f0ad4e',
                                            fontWeight: 800,
                                            fontSize: '1rem',
                                            marginBottom: '8px',
                                            boxShadow: '0 0 15px rgba(205, 127, 50, 0.3)',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {thirdPlace.vp} ПО
                                        </div>

                                        {/* Эмодзи: слегка прыгает и радуется */}
                                        <div style={{
                                            position: 'relative',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{
                                                fontSize: '3.6rem',
                                                display: 'inline-block',
                                                animation: 'emojiJoyJump3 1.35s ease-in-out infinite',
                                                filter: 'drop-shadow(0 4px 10px rgba(205, 127, 50, 0.4))'
                                            }}>
                                                {thirdPlace.emoji || '🌧️'}
                                            </span>
                                            {/* Пульсирующая тень под эмодзи */}
                                            <div style={{
                                                width: '38px',
                                                height: '7px',
                                                borderRadius: '50%',
                                                background: 'rgba(0, 0, 0, 0.7)',
                                                marginTop: '-4px',
                                                animation: 'emojiShadowPulse 1.35s ease-in-out infinite'
                                            }} />
                                        </div>

                                        {/* Снизу эмодзи: никнейм человека */}
                                        <div style={{
                                            marginTop: '10px',
                                            fontWeight: 800,
                                            fontSize: '1.1rem',
                                            color: thirdPlace.color || '#e0a96d',
                                            textShadow: `0 0 12px ${thirdPlace.color || '#e0a96d'}60`,
                                            whiteSpace: 'nowrap',
                                            maxWidth: '170px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {thirdPlace.nickname}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Тумба 3-го места (Бронза) */}
                            <div style={{
                                width: '100%',
                                height: '105px',
                                borderRadius: '14px 14px 4px 4px',
                                background: 'linear-gradient(180deg, rgba(205, 127, 50, 0.3) 0%, rgba(130, 65, 20, 0.15) 100%)',
                                border: '2px solid rgba(205, 127, 50, 0.7)',
                                boxShadow: isThirdVisible
                                    ? '0 0 25px rgba(205, 127, 50, 0.35), inset 0 2px 8px rgba(255, 200, 150, 0.2)'
                                    : '0 0 15px rgba(205, 127, 50, 0.15)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '3px',
                                position: 'relative',
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.5s ease'
                            }}>
                                <div style={{
                                    fontSize: '3rem',
                                    fontWeight: 900,
                                    color: '#e0a96d',
                                    textShadow: '0 0 20px rgba(205, 127, 50, 0.8)',
                                    lineHeight: 1
                                }}>
                                    3
                                </div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    fontWeight: 800,
                                    letterSpacing: '1.5px',
                                    color: 'rgba(224, 169, 109, 0.85)',
                                    textTransform: 'uppercase'
                                }}>
                                    🥉 3 МЕСТО
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ==================================================== */}
            {/* ИТОГОВАЯ ТАБЛИЦА ОЧКОВ ВСЕХ ИГРОКОВ (ПОЯВЛЯЕТСЯ ПОСЛЕ АНИМАЦИИ) */}
            {/* ==================================================== */}
            <div style={{
                opacity: showFullTable ? 1 : 0,
                transform: showFullTable ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                pointerEvents: showFullTable ? 'auto' : 'none'
            }}>
                <div className="glass-panel" style={{
                    padding: '2.5rem',
                    border: '1px solid var(--surface-border-glow)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7)'
                }}>
                    <h3 style={{
                        color: 'var(--text-muted)',
                        fontSize: '1.05rem',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}>
                        📊 Итоговая таблица лидеров
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2rem' }}>
                        {sortedPlayers.map((p, idx) => (
                            <div
                                key={p.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '14px 22px',
                                    background: idx === 0
                                        ? 'rgba(255, 215, 0, 0.12)'
                                        : idx === 1
                                            ? 'rgba(192, 205, 225, 0.08)'
                                            : idx === 2
                                                ? 'rgba(205, 127, 50, 0.08)'
                                                : 'rgba(3, 10, 22, 0.5)',
                                    borderRadius: '12px',
                                    border: idx === 0
                                        ? '1px solid rgba(255, 215, 0, 0.5)'
                                        : idx === 1
                                            ? '1px solid rgba(192, 205, 225, 0.3)'
                                            : idx === 2
                                                ? '1px solid rgba(205, 127, 50, 0.3)'
                                                : '1px solid var(--surface-border)',
                                    boxShadow: idx === 0 ? '0 0 15px rgba(255, 215, 0, 0.2)' : 'none',
                                    transition: 'transform 0.2s ease'
                                }}
                            >
                                <span style={{
                                    fontWeight: 700,
                                    fontSize: '1.15rem',
                                    color: p.color || '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <span style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        backgroundColor: p.connected ? '#00e676' : '#8b0000',
                                        display: 'inline-block'
                                    }} />
                                    <span style={{ color: 'var(--text-muted)', minWidth: '24px', textAlign: 'left' }}>
                                        {idx + 1}.
                                    </span>
                                    <span style={{ fontSize: '1.35rem' }}>{p.emoji || '🌧️'}</span>
                                    <span style={{ textShadow: `0 0 10px ${p.color}40` }}>{p.nickname}</span>
                                    {idx === 0 && <span title="Победитель матча">👑</span>}
                                    {idx === 1 && <span title="Серебряный призер">🥈</span>}
                                    {idx === 2 && <span title="Бронзовый призер">🥉</span>}
                                </span>
                                <strong style={{
                                    fontSize: '1.25rem',
                                    color: idx === 0 ? '#ffd700' : 'var(--accent-a)'
                                }}>
                                    {p.vp} ПО
                                </strong>
                            </div>
                        ))}
                    </div>

                    {/* Кнопки управления хоста и игроков */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
                        {isHost && (
                            <button
                                className="btn-primary"
                                onClick={onRestartGame}
                                style={{
                                    padding: '16px 36px',
                                    fontSize: '1.2rem',
                                    background: 'linear-gradient(135deg, #1ca0e5 0%, #0c72b8 100%)',
                                    boxShadow: '0 0 25px rgba(28, 160, 229, 0.5)'
                                }}
                            >
                                🌧️ Начать новую игру
                            </button>
                        )}
                        <button
                            className="btn-secondary"
                            onClick={onLeaveGame}
                            style={{
                                padding: '16px 28px',
                                fontSize: '1.2rem',
                                borderColor: 'rgba(255, 77, 109, 0.4)',
                                color: '#ff6b81'
                            }}
                        >
                            🚪 Выйти в меню
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
