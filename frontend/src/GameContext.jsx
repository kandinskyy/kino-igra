import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [player, setPlayer] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [modal, setModal] = useState(null);
    const [toast, setToast] = useState(null);

    const closeModal = (result = false) => {
        setModal((currentModal) => {
            if (currentModal?.resolve) {
                currentModal.resolve(result);
            }
            return null;
        });
    };

    const showAlert = (message, options = {}) => {
        const opts = typeof options === 'string' ? { title: options } : options;
        return new Promise((resolve) => {
            setModal({
                type: 'alert',
                message,
                title: opts.title || 'Внимание',
                icon: opts.icon || '🌧️',
                confirmText: opts.confirmText || 'Понятно',
                resolve
            });
        });
    };

    const showConfirm = (message, options = {}) => {
        return new Promise((resolve) => {
            setModal({
                type: 'confirm',
                message,
                title: options.title || 'Подтверждение',
                icon: options.icon || (options.isDanger ? '🛑' : '⚠️'),
                confirmText: options.confirmText || 'Подтвердить',
                cancelText: options.cancelText || 'Отмена',
                isDanger: options.isDanger || false,
                resolve
            });
        });
    };

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => {
            setToast(null);
        }, 3200);
        return () => clearTimeout(timer);
    }, [toast]);

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

        newSocket.on('lobby_closed', (data) => {
            setModal({
                type: 'alert',
                title: 'Комната закрыта',
                message: data?.message || 'Комната была закрыта хостом',
                icon: '🛑',
                confirmText: 'Понятно',
                resolve: () => {}
            });
            localStorage.removeItem('kino_lobbyId');
            localStorage.removeItem('kino_sessionToken');
            setGameState(null);
            setPlayer(null);
        });

        const handleUnload = () => {
            const currentLobbyId = localStorage.getItem('kino_lobbyId');
            if (newSocket && currentLobbyId) {
                newSocket.emit('leave_lobby', { lobbyId: currentLobbyId });
            }
        };
        window.addEventListener('beforeunload', handleUnload);
        window.addEventListener('pagehide', handleUnload);

        return () => {
            window.removeEventListener('beforeunload', handleUnload);
            window.removeEventListener('pagehide', handleUnload);
            newSocket.close();
        };
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

    const closeLobby = () => {
        if (socket && gameState?.id) {
            socket.emit('close_lobby', { lobbyId: gameState.id });
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
        leaveGame,
        closeLobby,
        modal,
        toast,
        showAlert,
        showConfirm,
        showToast,
        closeModal
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};
