import { useEffect, useRef, useState } from 'react';
import Character from './Character';

import { playRoundCue } from "../utils/gameAudio";

export default function RoundAnnouncement({ game:g, player, characterPlayer, presentation='default' }) {
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
    const roleTitle = g.isCritic ? 'Вы критик' : 'Вы угадываете';
    const roleDetail = g.isCritic
      ? 'Остальные угадывают ваши оценки'
      : presentation==='projector' && !g.hiddenMode && g.criticName
        ? `Критик — «${g.criticName}». Угадайте его оценки за оставшееся время.`
        : 'Угадайте оценки критика за 60 секунд';
    if (g.phase === 'guess') {
      // Joining an already running minute should not replay its starting signal.
      if (old?.phase !== 'critic' || old.room !== g.id || old.round !== g.roundId) {
        if (g.timeLeft >= 58) setNotice({key, title:roleTitle, detail:roleDetail});
        return;
      }
      playRoundCue("minute");
      setNotice({key, title:presentation==='projector'?roleTitle:'Минута началась', detail:roleDetail, minute:true});
    } else {
      playRoundCue("role");
      const detail=g.isCritic?'Расставьте оценки и сохраните свой рейтинг':presentation==='projector'&&!g.hiddenMode&&g.criticName?`Критик — «${g.criticName}». Дождитесь его рейтинга, затем начнётся ваша минута.`:'Дождитесь рейтинга критика. Затем начнётся ваша минута.';
      setNotice({key, title:roleTitle, detail});
    }
  }, [g.id,g.roundId,g.phase,g.state,g.mode,g.isCritic,g.timeLeft,g.hiddenMode,g.criticName,presentation]);
  useEffect(() => {
    if (!notice) return;
    const timer=setTimeout(()=>setNotice(null),4200);
    const escape=e=>{if(e.key==='Escape')setNotice(null);};
    document.addEventListener('keydown',escape);
    return ()=>{clearTimeout(timer);document.removeEventListener('keydown',escape);};
  }, [notice]);
  if (!notice) return null;
  return <div className={`round-announcement ${presentation==='projector'?`round-announcement-projector ${g.isCritic?'role-critic':'role-guesser'}`:''}`} key={notice.key}>
    <div className="round-announcement-content" role="status" aria-live="polite">
      <span className="overline">{notice.minute?'Время угадывать':`Раунд ${g.roundId}`}</span>
      <h2>{notice.title}</h2>
      <div className="announcement-character"><Character color={characterPlayer?.color||player?.color} full/></div>
      <p>{notice.detail}</p>
    </div>
    <button className="quiet-button announcement-dismiss" onClick={()=>setNotice(null)}>К игре · Esc</button>
  </div>;
}
