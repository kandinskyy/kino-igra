import { useEffect, useRef, useState } from 'react';
import Character from './Character';

import { playRoundCue } from "../utils/gameAudio";

export default function RoundAnnouncement({ game:g, player }) {
  const [notice, setNotice] = useState(null);
  const previous = useRef(null);
  useEffect(() => {
    const key = `${g.id}:${g.roundId}:${g.phase}:${g.state}`;
    if (previous.current?.key === key) return;
    const old = previous.current;
    previous.current = {key, phase:g.phase, room:g.id, round:g.roundId};
    if (g.mode !== 'opinion' || g.state !== 'round_start') {
      setNotice(null); return;
    }
    if (g.phase === 'guess') {
      // Joining an already running minute should not replay its starting signal.
      if (old?.phase !== 'critic' || old.room !== g.id || old.round !== g.roundId) {
        if (g.timeLeft >= 58) setNotice({key, title:g.isCritic?'Вы критик':'Вы угадываете', detail:g.isCritic?'Остальные угадывают ваши оценки':'Угадайте оценки критика за 60 секунд'});
        return;
      }
      playRoundCue("minute");
      setNotice({key, title:'Минута началась', detail:g.isCritic?'Остальные угадывают ваши оценки':'Угадайте оценки критика за 60 секунд', minute:true});
    } else {
      playRoundCue("role");
      setNotice({key, title:g.isCritic?'Вы критик':'Вы угадываете', detail:g.isCritic?'Расставьте оценки и сохраните свой рейтинг':'Дождитесь рейтинга критика. Затем начнётся ваша минута.'});
    }
  }, [g.id,g.roundId,g.phase,g.state,g.mode,g.isCritic,g.timeLeft]);
  useEffect(() => {
    if (!notice) return;
    const timer=setTimeout(()=>setNotice(null),4200);
    const escape=e=>{if(e.key==='Escape')setNotice(null);};
    document.addEventListener('keydown',escape);
    return ()=>{clearTimeout(timer);document.removeEventListener('keydown',escape);};
  }, [notice]);
  if (!notice) return null;
  return <div className="round-announcement" key={notice.key}>
    <div className="round-announcement-content" role="status" aria-live="polite">
      <span className="overline">{notice.minute?'Время угадывать':`Раунд ${g.roundId}`}</span>
      <h2>{notice.title}</h2>
      <div className="announcement-character"><Character color={player?.color} full/></div>
      <p>{notice.detail}</p>
    </div>
    <button className="quiet-button announcement-dismiss" onClick={()=>setNotice(null)}>К игре · Esc</button>
  </div>;
}
