import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [player, setPlayer] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? 'http://localhost:3001' : undefined);
        const newSocket = backendUrl ? io(backendUrl) : io();
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setIsConnected(true);
            
            // Пытаемся восстановить сессию, если страница была обновлена
            const savedLobbyId = localStorage.getItem('kino_lobbyId');
            const savedToken = localStorage.getItem('kino_sessionToken');
            
            if (savedLobbyId && savedToken) {
                newSocket.emit('join_lobby', { 
                    lobbyId: savedLobbyId, 
                    sessionToken: savedToken 
                }, (response) => {
                    if (response.success) {
                        setPlayer(response.player);
                        setGameState(response.lobby);
                    } else {
                        // Если лобби уже не существует, чистим хвосты
                        localStorage.removeItem('kino_lobbyId');
                        localStorage.removeItem('kino_sessionToken');
                    }
                });
            }
        });

        newSocket.on('disconnect', () => setIsConnected(false));
        
        newSocket.on('lobby_update', (lobby) => {
            setGameState(lobby);
        });

        return () => newSocket.close();
    }, []);

    const leaveGame = () => {
        if (socket && gameState?.id) {
            socket.emit('leave_lobby', { lobbyId: gameState.id });
        }
        if (gameState?.id) {
            localStorage.setItem('kino_lastLobbyId', gameState.id);
        }
        if (player?.nickname) {
            localStorage.setItem('kino_lastNickname', player.nickname);
        }
        if (player?.sessionToken) {
            localStorage.setItem('kino_lastSessionToken', player.sessionToken);
        }
        localStorage.removeItem('kino_lobbyId');
        localStorage.removeItem('kino_sessionToken');

        setGameState(null);
        setPlayer(null);
    };

    const value = {
        socket,
        gameState,
        setGameState,
        player,
        setPlayer,
        isConnected,
        leaveGame
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};
