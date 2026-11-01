import { useState } from 'react';
import { useGame } from '../GameContext';
import { storage } from '../utils/storage';
export default function MainMenu() {
  const { socket, setPlayer, setGameState, showToast, isConnected } = useGame();
  const [nickname, setNickname] = useState(() => storage.getItem('kino_lastNickname') || '');
  const [code, setCode] = useState(() => new URLSearchParams(location.search).get('room') || storage.getItem('kino_lastLobbyId') || '');
  const [busy, setBusy] = useState(false);
  async function enter(create) {
    if (busy || !isConnected) return;
    if (!nickname.trim()) return showToast('Введите никнейм', 'error');
    if (!create && !/^[A-Z0-9]{6}$/.test(code.trim().toUpperCase())) return showToast('Код комнаты состоит из 6 символов', 'error');
    setBusy(true);
    try {
      let lobbyId = code.trim().toUpperCase();
      if (create) {
        const created = await socket.timeout(10000).emitWithAck('create_lobby', { targetVP: 30 });
        if (!created.success) throw Error(created.message);
        lobbyId = created.lobbyId;
      }
      const response = await socket.timeout(10000).emitWithAck('join_lobby', { lobbyId, nickname: nickname.trim(), sessionToken: storage.getItem('kino_token_' + lobbyId) });
      if (!response.success) throw Error(response.message);
      storage.setItem('kino_lobbyId', lobbyId);
      storage.setItem('kino_sessionToken', response.player.sessionToken);
      storage.setItem('kino_token_' + lobbyId, response.player.sessionToken);
      storage.setItem('kino_lastLobbyId', lobbyId);
      storage.setItem('kino_lastNickname', nickname.trim());
      setPlayer(response.player); setGameState(response.lobby);
    } catch (e) { showToast(e.message === 'operation has timed out' ? 'Сервер не ответил. Попробуйте ещё раз.' : e.message, 'error'); }
    finally { setBusy(false); }
  }
  return <main className="main-menu">
    <header className="menu-brand"><span className="cloud-logo" aria-hidden="true">🌧️</span><h1>OVERRATED</h1><p>Пять фильмов. Пять рангов. А ваши вкусы совпадут?</p></header>
    <form className="glass-panel menu-form" onSubmit={e => { e.preventDefault(); enter(false); }}>
      <label htmlFor="nickname">Ваш никнейм</label><input id="nickname" className="input-field" value={nickname} onChange={e => setNickname(e.target.value)} maxLength={15} placeholder="Квентин Тарантино" autoComplete="nickname" required />
      <label htmlFor="room-code">Код комнаты</label>
      <div className="join-row"><input id="room-code" className="input-field" value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={6} placeholder="ABC123" autoComplete="off" spellCheck={false} /><button className="btn-primary" disabled={busy || !isConnected}>Войти</button></div>
      <div className="menu-divider" /><button type="button" className="btn-primary" onClick={() => enter(true)} disabled={busy || !isConnected}>{busy ? 'Подключаемся…' : 'Создать игру'}</button>
      <p className="menu-note">Для компании от 2 до 16 человек</p>
    </form>
    <details className="menu-rules"><summary>Как играть</summary><p>Расставьте пять фильмов по рангам от S до D. Каждый ранг используется один раз; пятый назначается автоматически. За каждое совпадение с другим игроком — одно очко.</p><p>Ведущий запускает таймер на 60 секунд. Неуспевшие оценки распределяются случайно. Цель по очкам выбирается в комнате.</p></details>
  </main>;
}
