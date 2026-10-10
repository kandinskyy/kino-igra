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
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
        const newSocket = io(backendUrl);
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

    const value = {
        socket,
        gameState,
        player,
        setPlayer,
        isConnected
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};
