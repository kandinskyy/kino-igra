import { storage } from './utils/storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [player, setPlayer] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionMessage, setConnectionMessage] = useState('Подключаемся к игре…');
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
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const newSocket = io(backendUrl, { timeout: 15000, reconnectionDelayMax: 5000 });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            setIsConnected(true);
            setConnectionMessage('');

            // Пытаемся восстановить сессию, если страница была обновлена или произошло переподключение
            const savedLobbyId = storage.getItem('kino_lobbyId');
            const savedToken = storage.getItem('kino_sessionToken');
            const savedNick = storage.getItem('kino_lastNickname') || '';

            if (savedLobbyId && savedToken) {
                newSocket.timeout(10000).emit('join_lobby', {
                    lobbyId: savedLobbyId,
                    sessionToken: savedToken,
                    nickname: savedNick
                }, (error, response) => {
                    if (error) { setIsConnected(false); setConnectionMessage('Не удалось восстановить игру. Повторите подключение.'); return; }
                    if (response && response.success) {
                        setPlayer(response.player);
                        setGameState(response.lobby);
                    } else if (response && !response.success) {
                        showToast(response.message === 'Лобби не найдено' ? 'Комната закрыта или сервер перезапущен. Создайте новую игру.' : response.message, 'error');
                        // Только если комната реально удалена/не существует, очищаем сессию
                        storage.removeItem('kino_lobbyId');
                        storage.removeItem('kino_sessionToken');
                        setGameState(null);
                        setPlayer(null);
                    }
                });
            }
        });

        newSocket.on('disconnect', () => { setIsConnected(false); setConnectionMessage('Связь прервалась. Восстанавливаем подключение…'); });
        newSocket.on('connect_error', () => { setIsConnected(false); setConnectionMessage(navigator.onLine ? 'Сервер пока недоступен. Повторяем подключение…' : 'Нет интернета. Проверьте подключение.'); });
        newSocket.on('error_message', message => showToast(message, 'error'));
        newSocket.on('player_connection_notice', data => showToast(data.message, 'info'));
        const removed = data => {
            storage.removeItem('kino_lobbyId'); storage.removeItem('kino_sessionToken');
            setGameState(null); setPlayer(null); showToast(data.message, 'error');
        };
        newSocket.on('kicked', removed);
        newSocket.on('session_replaced', data => { removed(data); newSocket.disconnect(); });

        newSocket.on('lobby_update', (lobby) => {
            setGameState(lobby);
        });

        newSocket.on('host_transferred', (data) => {
            showToast(`👑 Игрок «${data.newHostName}» стал хостом комнаты!`, 'info');
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
            storage.removeItem('kino_lobbyId');
            storage.removeItem('kino_sessionToken');
            setGameState(null);
            setPlayer(null);
        });

        return () => {
            newSocket.close();
        };
    }, []);

    const leaveGame = () => {
        if (socket && gameState?.id) {
            socket.emit('leave_lobby', { lobbyId: gameState.id });
        }
        if (gameState?.id) {
            storage.setItem('kino_lastLobbyId', gameState.id);
        }
        if (player?.nickname) {
            storage.setItem('kino_lastNickname', player.nickname);
        }
        if (player?.sessionToken) {
            storage.setItem('kino_lastSessionToken', player.sessionToken);
            storage.setItem('kino_token_' + gameState.id, player.sessionToken);
        }
        storage.removeItem('kino_lobbyId');
        storage.removeItem('kino_sessionToken');

        setGameState(null);
        setPlayer(null);
    };

    const closeLobby = () => {
        if (socket && gameState?.id) {
            socket.emit('close_lobby', { lobbyId: gameState.id });
        }
        storage.removeItem('kino_lobbyId');
        storage.removeItem('kino_sessionToken');
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
        connectionMessage,
        reconnect: () => { socket?.disconnect(); socket?.connect(); },
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
