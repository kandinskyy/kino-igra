import React, { useState, useEffect } from 'react';
import { useGame } from '../GameContext';

const GameScreen = () => {
    const { socket, gameState, player } = useGame();
    const [timeLeft, setTimeLeft] = useState(60);
    const [timerActive, setTimerActive] = useState(false);
    
    // myRatings: { movieId: 'S' }
    const [myRatings, setMyRatings] = useState({});

    const isHost = gameState.host === player?.id;

    // TODO: Socket logic for timer will be added later
    // For now it's just visually showing movies

    const startTimer = () => {
        setTimerActive(true);
        // socket.emit('start_timer', gameState.id);
    };

    const handleRating = (movieId, rating) => {
        // if (timeLeft === 0) return; // Block when time is up
        
        const newRatings = { ...myRatings };
        // Remove this rating if used on another movie
        for (const [mId, r] of Object.entries(newRatings)) {
            if (r === rating) delete newRatings[mId];
        }
        
        newRatings[movieId] = rating;
        setMyRatings(newRatings);
        
        // socket.emit('submit_rating', { lobbyId: gameState.id, ratings: newRatings });
    };

    const availableRatings = ['S', 'A', 'B', 'C', 'D'];
    const getUsedRatings = () => Object.values(myRatings);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem', width: '100%', maxWidth: '1400px', margin: '0 auto', marginTop: '2vh' }}>
            
            <div className="glass-panel" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {gameState.players.map(p => (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '8px 16px', borderRadius: '20px', border: `1px solid ${p.color}`, boxShadow: `0 0 10px ${p.color}40` }}>
                            <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: p.color }}></div>
                            <span style={{ fontWeight: '600' }}>{p.nickname}</span>
                            <strong style={{ color: 'white', marginLeft: '5px', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>{p.vp} ПО</strong>
                        </div>
                    ))}
                </div>
                <div>
                    {timerActive ? (
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: timeLeft <= 10 ? 'var(--accent-s)' : '#00CCFF', textShadow: '0 0 15px rgba(0,204,255,0.5)' }}>
                            {timeLeft}
                        </div>
                    ) : (
                        isHost && <button className="btn-primary" onClick={startTimer}>Запустить таймер (60с)</button>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginTop: '1rem' }}>
                {gameState.movies?.map((movie) => (
                    <div key={movie.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ position: 'relative', paddingTop: '150%', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 15px 30px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <img src={movie.posterUrl} alt={movie.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <h4 style={{ textAlign: 'center', margin: 0, fontSize: '1.1rem', minHeight: '2.8rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{movie.title}</h4>
                        
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '16px', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', border: '1px solid rgba(255,255,255,0.05)' }}>
                            {availableRatings.map(r => {
                                const isSelected = myRatings[movie.id] === r;
                                const isUsedElsewhere = getUsedRatings().includes(r) && !isSelected;
                                
                                // Color logic
                                let colorVar = '';
                                if(r==='S') colorVar='--accent-s';
                                if(r==='A') colorVar='--accent-a';
                                if(r==='B') colorVar='--accent-b';
                                if(r==='C') colorVar='--accent-c';
                                if(r==='D') colorVar='--accent-d';

                                return (
                                    <button 
                                        key={r}
                                        onClick={() => handleRating(movie.id, r)}
                                        disabled={isUsedElsewhere} // || timeLeft === 0
                                        style={{
                                            width: '45px', height: '45px', borderRadius: '12px', border: 'none',
                                            fontWeight: '800', fontSize: '1.3rem', cursor: (isUsedElsewhere) ? 'not-allowed' : 'pointer',
                                            background: isSelected ? `var(${colorVar})` : 'rgba(255,255,255,0.08)',
                                            color: isSelected ? '#000' : 'white',
                                            opacity: isUsedElsewhere ? 0.2 : 1,
                                            boxShadow: isSelected ? `0 0 20px var(${colorVar})` : 'none',
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                            transform: isSelected ? 'scale(1.1)' : 'scale(1)'
                                        }}
                                    >
                                        {r}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* В будущем тут появится кнопка "Раскрыть оценки" для хоста */}
        </div>
    );
};

export default GameScreen;
