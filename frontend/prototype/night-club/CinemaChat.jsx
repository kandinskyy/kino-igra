import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, Send, Trash2, Volume2, VolumeX, X } from 'lucide-react';
import { useGame } from '../../src/GameContext';
import { Avatar } from '../../src/components/Identity';
import { storage } from '../../src/utils/storage';
import { playChatCue } from '../../src/utils/gameAudio';

export default function CinemaChat() {
  const { gameState: g, player, socket, isConnected, showToast } = useGame();
  const lobby = false;
  const [anchor, setAnchor] = useState(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [sound, setSound] = useState(() => storage.getItem('overrated_chat_sound') !== 'off');
  const [unread, setUnread] = useState([]);
  const seen = useRef(null), list = useRef(null), input = useRef(null);
  const visible = lobby || open;
  const messages = g.chat || [];
  useLayoutEffect(() => { setAnchor(lobby ? document.getElementById('lobby-chat') : null); }, [lobby]);
  useEffect(() => {
    const ids = new Set(messages.map(m => m.id));
    if (seen.current) {
      const incoming = messages.filter(m => !seen.current.has(m.id) && m.playerId !== player.id);
      if (incoming.length && sound) playChatCue();
      setUnread(previous => visible ? [] : [...previous.filter(id => ids.has(id)), ...incoming.map(m => m.id)]);
    }
    seen.current = ids;
  }, [g.chat, visible, player.id, sound]); // A reconnect snapshot is also handled without replaying old sounds.
  useEffect(() => {
    if (visible && list.current) list.current.scrollTop = list.current.scrollHeight;
  }, [g.chat, visible, anchor]);
  useEffect(() => { if (open) input.current?.focus(); }, [open]);
  async function request(event, data) {
    const r = await socket.timeout(10000).emitWithAck(event, { lobbyId: g.id, ...data });
    if (!r.success) throw Error(r.message || 'Не удалось выполнить действие');
  }
  async function send(e) {
    e.preventDefault();
    if (busy || !text.trim()) return;
    setBusy(true);
    try { await request('send_chat_message', { text }); setText(''); input.current?.focus(); }
    catch (e) { showToast(e.message, 'error'); }
    finally { setBusy(false); }
  }
  async function remove(id) {
    try { await request('delete_chat_message', { messageId: id }); }
    catch (e) { showToast(e.message, 'error'); }
  }
  const panel = <section className={`room-chat ${lobby ? 'chat-inline' : 'chat-floating'}`} aria-label="Чат комнаты" onKeyDown={e => { if (e.key === 'Escape') setOpen(false); }}>
    <header className="chat-heading"><h3>Чат комнаты</h3><div>
      <button className="chat-icon" aria-label={sound ? 'Выключить звук сообщений' : 'Включить звук сообщений'} aria-pressed={sound} onClick={() => { setSound(!sound); storage.setItem('overrated_chat_sound', sound ? 'off' : 'on'); }}>{sound ? <Volume2 size={18}/> : <VolumeX size={18}/>}</button>
      {!lobby && <button className="chat-icon" aria-label="Закрыть чат" onClick={() => setOpen(false)}><X size={19}/></button>}
    </div></header>
    <div className="chat-messages" ref={list} role="log" aria-live={visible ? 'polite' : 'off'}>
      {!messages.length && <p className="chat-empty">Здесь можно обсудить кино и позвать друзей в следующий раунд.</p>}
      {messages.map(m => <article key={m.id} className="chat-message">
        <Avatar player={{ color: m.color, nickname: m.nickname }}/>
        <div><header><strong style={{ color: m.color }}>{m.nickname}</strong><time dateTime={new Date(m.at).toISOString()}>{new Date(m.at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</time></header><p>{m.text}</p></div>
        {g.host === player.id && <button className="chat-icon chat-delete" aria-label={`Удалить сообщение ${m.nickname}`} onClick={() => remove(m.id)}><Trash2 size={14}/></button>}
      </article>)}
    </div>
    <form className="chat-compose" onSubmit={send}>
      <input ref={input} aria-label="Сообщение в чат" placeholder="Написать в комнату…" maxLength={500} value={text} onChange={e => setText(e.target.value)} disabled={!isConnected}/>
      <button className="chat-icon" type="submit" aria-label="Отправить сообщение" disabled={busy || !text.trim() || !isConnected}><Send size={19}/></button>
    </form>
  </section>;
  if (lobby) return anchor ? createPortal(panel, anchor) : null;
  return <div className="chat-dock">{open && panel}<button className="chat-toggle" aria-label={`Чат${unread.length ? `: новых сообщений ${unread.length}` : ''}`} aria-expanded={open} onClick={() => setOpen(!open)}><MessageCircle size={21}/>{unread.length > 0 && <span className="chat-unread">{unread.length > 99 ? '99+' : unread.length}</span>}</button></div>;
}

