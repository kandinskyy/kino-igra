import {useEffect, useMemo, useRef, useState} from 'react';
import {Check, ChevronDown, Crown, EyeOff, Settings2, ShieldAlert, Users, X} from 'lucide-react';
import {useGame} from '../GameContext.jsx';
import {defaultKinonamesSettings, mergeKinonamesSettings} from './settings.js';
import {useKinonamesAudio} from './useKinonamesAudio.js';
import {Avatar} from '../components/Identity.jsx';
import './kinonames.css';

export function KinonamesSettings({value, editable, onSave, compact = false}) {
  const settings = useMemo(()=>mergeKinonamesSettings(value),[value]);
  const [draft, setDraft] = useState(settings);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const detailsDialog=useRef(null);
  const restored=useRef(false);
  const preferenceKey='kinonames.settings.v1';
  useEffect(() => {
    let next=settings;
    if(!restored.current&&editable){
      restored.current=true;
      try{
        const saved=JSON.parse(localStorage.getItem(preferenceKey)||'null');
        if(saved&&JSON.stringify(settings)===JSON.stringify(defaultKinonamesSettings)){
          next=mergeKinonamesSettings(saved);
          if(JSON.stringify(next)!==JSON.stringify(settings)) Promise.resolve(onSave?.(next)).catch(()=>setError('Не удалось восстановить последние настройки Kinonames.'));
        }
      }catch{}
    }
    setDraft(next);
  }, [value,editable,preferenceKey,settings,onSave]);

  async function save(next) {
    setDraft(next);
    setError('');
    if (!editable || !onSave) return;
    setPending(true);
    try { await onSave(next); try{localStorage.setItem(preferenceKey,JSON.stringify(next));}catch{} }
    catch (e) { setError(e.message || 'Не удалось сохранить настройки'); setDraft(settings); }
    finally { setPending(false); }
  }
  const number = (path, label, min = 1, max = Number.MAX_SAFE_INTEGER) => {
    const [group, key] = path;
    const current = draft[group][key];
    const logicalMax=group==='coop'&&key==='blue'?Math.max(1,25-(Number(draft.coop.black)||0)):group==='coop'&&key==='black'?Math.max(0,25-(Number(draft.coop.blue)||1)):max;
    return <label className="kn-setting-number" key={path.join('-')}><span>{label}</span><input type="number" inputMode="numeric" min={min} max={max} step="1" value={current} disabled={!editable || pending} onChange={e=>{
      const raw=e.target.value; setDraft(s=>({...s,[group]:{...s[group],[key]:raw}}));
    }} onBlur={e=>{
      const n=Number(e.target.value), copy={...draft,[group]:{...draft[group]}};
      if (!Number.isSafeInteger(n)||n<min||n>logicalMax) { setDraft(settings); setError(`${label}: допустимое целое число от ${min} до ${logicalMax}`); return; }
      copy[group][key]=n; save(copy);
    }} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();}}/></label>;
  };
  const variant=draft.variant;
  return <section className={`kn-settings${compact?' compact':''}`} aria-label="Параметры Kinonames">
    <label className="kn-setting-select"><span>Режим</span><span className="kn-select-wrap"><select value={variant} disabled={!editable||pending} onChange={e=>save({...draft,variant:e.target.value})}>
      <option value="competitive">Многопользовательский</option><option value="coop">Одиночный</option>
    </select><ChevronDown aria-hidden="true"/></span></label>
    <div className="kn-locked-category"><span>Категория</span><strong>Супергероика</strong></div>
    <button type="button" className="kn-mode-settings-trigger" onClick={()=>detailsDialog.current?.showModal()}><Settings2 size={16}/> Настройка режима</button>
    {error&&<p className="kn-error" role="alert">{error}</p>}
    {!editable&&<p className="kn-setting-note">Параметры меняет создатель комнаты.</p>}
    <dialog ref={detailsDialog} className="kn-settings-dialog" aria-labelledby="kn-settings-title" onCancel={e=>{if(pending)e.preventDefault();}}>
      <section className="kn-settings-dialog-body"><button className="kn-settings-close" type="button" aria-label="Закрыть настройки режима" disabled={pending} onClick={()=>detailsDialog.current?.close()}><X size={18}/></button>
        <h2 id="kn-settings-title">Настройка режима</h2>
        {variant==='coop'?<div className="kn-settings-grid">
          {number(['coop','clues'],'Подсказки на партию')}{number(['coop','blue'],'Синие персонажи')}{number(['coop','black'],'Чёрные персонажи',0)}{number(['coop','lives'],'Жизни команды')}
          <p className="kn-setting-note">Нейтральных персонажей: {Math.max(0,25-(Number(draft.coop.blue)||0)-(Number(draft.coop.black)||0))}. Подсказки можно запрашивать в ходе игры.</p>
        </div>:<div className="kn-settings-grid">
          {number(['competitive','clueSeconds'],'Время на подсказку, сек')}{number(['competitive','guessSeconds'],'Время на угадывание, сек')}
          <label className="kn-setting-check"><input type="checkbox" checked={!!draft.competitive.traitors} disabled={!editable||pending} onChange={e=>save({...draft,competitive:{...draft.competitive,traitors:e.target.checked}})}/><span>Играть с предателем</span></label>
          {draft.competitive.traitors&&<p className="kn-setting-note kn-warning">Режим с предателем доступен от 8 игроков в лобби; в каждой команде должно быть минимум 4 участника.</p>}
        </div>}
        <p className="kn-settings-dialog-actions"><button className="btn-primary" type="button" disabled={pending} onClick={()=>detailsDialog.current?.close()}><Check size={16}/> Готово</button></p>
      </section>
    </dialog>
  </section>;
}

export function KinonamesTeams({game, players=[], player, settings=defaultKinonamesSettings, onAssign, readyIds=[], compact=false}) {
  const assignments=game?.assignments||EMPTY_ASSIGNMENTS;
  const mine=assignments[player?.id]||{};
  const teams=settings.variant==='coop'?['blue']:['blue','red'];
  const connected=players.filter(p=>p.connected!==false&&!p.waiting);
  const active=!!game?.gameId&&!['ready','finished'].includes(game.phase);
  const canChange=!active;
  const traitorGate=settings.variant==='competitive'&&settings.competitive.traitors;
  let gate='';
  if(traitorGate&&connected.length<8) gate='Режим с предателем доступен от 8 игроков в лобби';
  else if(traitorGate&&!['blue','red'].every(team=>connected.filter(p=>assignments[p.id]?.team===team).length>=4)) gate='Для игры с предателем нужно минимум 4 участника в каждой команде.';
  const ready=game?.phase==='ready'?connected.length>0&&connected.every(p=>readyIds.includes(p.id)):
    settings.variant==='coop'?connected.length>=2&&connected.every(p=>assignments[p.id]?.team==='blue')&&connected.filter(p=>assignments[p.id]?.leader&&assignments[p.id]?.team==='blue').length===1&&connected.some(p=>assignments[p.id]?.team==='blue'&&!assignments[p.id]?.leader):
    connected.every(p=>['blue','red'].includes(assignments[p.id]?.team))&&['blue','red'].every(team=>{const members=connected.filter(p=>assignments[p.id]?.team===team);return members.length>=2&&members.filter(p=>assignments[p.id]?.leader).length===1;});
  async function assign(team,leader){if(active&&team!==mine.team)return;try{await onAssign?.({team,leader});}catch{}}
  return <section className={`kn-teams${compact?' compact':''}`} aria-label="Ваша компания">
    {!compact&&<header className="kn-company-head"><Users size={16}/><h3>Ваша компания</h3><span>{connected.length}/{Math.max(16,players.length)}</span></header>}
    <div className={`kn-team-columns ${settings.variant}`}>
      {teams.map(team=>{
        const members=connected.filter(p=>assignments[p.id]?.team===team);
        const leaderPlayer=members.find(p=>assignments[p.id]?.leader);
        const title=team==='blue'?'Синяя команда':'Красная команда';
        const canJoin=canChange&&mine.team!==team;
        const teamChangeAllowed=canChange||mine.team===team;
        return <section className={`kn-team kn-team-${team}`} key={team} aria-label={title}>
          <header className="kn-team-title"><h4>{title}</h4>{canJoin&&<button type="button" className="kn-join-team" onClick={()=>assign(team,false)}>Вступить</button>}</header>
          <button type="button" className={`kn-roster-slot kn-leader-slot${leaderPlayer?' filled':''}${player?.id===leaderPlayer?.id?' is-self':''}`} disabled={!teamChangeAllowed||(leaderPlayer?player?.id!==leaderPlayer.id:mine.team!==team)} onClick={()=>assign(team,!leaderPlayer)} aria-label={leaderPlayer?`Освободить место ведущего: ${leaderPlayer.nickname}`:`Занять свободный слот ведущего: ${title}`}>
            <span className="kn-slot-role">Ведущий</span>{leaderPlayer?<><span className="kn-slot-name">{leaderPlayer.nickname}{leaderPlayer.id===player?.id?' · Вы':''}</span><Crown size={15}/>{readyIds.includes(leaderPlayer.id)&&<Check className="kn-ready-mark" size={14} aria-label="Готов"/>}</>:<span className="kn-slot-empty">Свободный слот</span>}
          </button>
          <div className="kn-guesser-slots" aria-label="Угадывающие">
            {members.filter(p=>!assignments[p.id]?.leader).map(p=><button type="button" className={`kn-roster-slot kn-guesser-slot${p.id===player?.id?' is-self':''}`} key={p.id} disabled={!teamChangeAllowed||!!leaderPlayer||p.id!==player?.id} onClick={()=>{if(p.id===player?.id)assign(team,true);}} aria-label={p.id===player?.id?'Занять свободное место ведущего':`${p.nickname}, угадывающий`}>
              <span className="kn-slot-role">Угадывающий</span><span className="kn-slot-name">{p.nickname}{p.id===player?.id?' · Вы':''}</span>{readyIds.includes(p.id)&&<Check size={14} aria-label="Готов"/>}
            </button>)}
            {mine.team===team&&mine.leader&&<button type="button" className="kn-roster-slot kn-guesser-slot kn-open-guesser-slot" onClick={()=>assign(team,false)} aria-label="Перейти на свободное место угадывающего и освободить роль ведущего"><span className="kn-slot-role">{compact?'':'Свободное место'}</span><span className="kn-slot-empty">{compact?'Стать угадывающим':'Нажмите, чтобы стать угадывающим'}</span></button>}
            {!members.some(p=>!assignments[p.id]?.leader)&&<p className="kn-team-empty">Пока нет угадывающих</p>}
          </div>
        </section>;
      })}
    </div>
    {!ready&&game?.phase!=='ready'&&<p className="kn-setting-note">В каждой команде нужен ведущий и хотя бы один угадывающий.</p>}
    {gate&&<p className="kn-error" role="status">{gate}</p>}
    {ready&&game?.phase!=='ready'&&<p className="kn-ready" role="status">Составы готовы к игре</p>}
  </section>;
}

function secondsLeft(deadline,now) { return deadline==null?null:Math.max(0,Math.ceil((deadline-now)/1000)); }

export function KinonamesScreen() {
  const {gameState:g,player,socket,showToast,showConfirm,leaveGame}=useGame();
  const model=g?.kinonames?.game;
  const assignments=model?.assignments||EMPTY_ASSIGNMENTS;
  const mine=assignments[player?.id]||{};
  const readyPhase=model?.phase==='ready';
  const leader=!!mine.leader&&!readyPhase;
  const [now,setNow]=useState(null);
  const [clueWord,setClueWord]=useState('');
  const [clueCount,setClueCount]=useState('1');
  const [busy,setBusy]=useState(false);
  const roleDialog=useRef(null);
  const serverOffset=useRef(0);
  useEffect(()=>{if(Number.isFinite(model?.serverNow))serverOffset.current=model.serverNow-Date.now();},[model?.serverNow]);
  useEffect(()=>{const id=setInterval(()=>setNow(Date.now()+serverOffset.current),250);return()=>clearInterval(id);},[]);
  useKinonamesAudio(model,now,{paused:!!g.demoPaused,revision:g.demoRevision||0});
  if(!model) return <main className="kn-screen"><p className="kn-setting-note">Подготавливаем игровое поле…</p></main>;
  const selected=model.votes?.[player?.id]||null;
  const ownRole=model.ownRole||{};
  const displayNow=g.demoPaused?model.serverNow:now;
  const left=displayNow==null?null:secondsLeft(model.confirmation?.deadline,displayNow);
  const variant=model.settings?.variant||g.kinonames?.settings?.variant||'coop';
  const canClue=leader&&model.phase==='clue'&&model.activeTeam===mine.team;
  const cardCount=Object.values(model.votes||{}).reduce((acc,id)=>({...acc,[id]:(acc[id]||0)+1}),{});
  const canVote=!leader&&model.phase==='guess'&&model.voterIds?.includes(player?.id);
  const finished=model.phase==='finished';
  const readyIds=model.readyIds||[];
  const totalSeconds=variant==='coop'?null:model.leaderGrace?20:model.phase==='clue'?model.settings.competitive.clueSeconds:model.settings.competitive.guessSeconds;
  const timerDeadline=model.deadline??model.leaderGrace?.deadline??null;
  const timer=timerDeadline==null?null:secondsLeft(timerDeadline,displayNow);
  const timerRatio=timerDeadline==null||!totalSeconds?0:Math.max(0,Math.min(1,(timerDeadline-displayNow)/(totalSeconds*1000)));
  const sideTeams=variant==='competitive'?['blue','red']:['blue'];
  const teamHistories=Object.fromEntries(sideTeams.map(team=>[team,model.history?.filter(item=>item.team===team)||[]]));
  async function action(payload){
    if(!socket||busy)return;
    setBusy(true);
    try{const result=await socket.timeout(10000).emitWithAck('kinonames_action',{lobbyId:g.id,action:{gameId:model.gameId,turnId:model.turnId,...payload}});if(!result?.success)throw Error(result?.message||'Действие не выполнено');}
    catch(e){showToast(e.message||'Не удалось выполнить действие','error');}
    finally{setBusy(false);}
  }
  function cardPress(card){
    if(canVote&&!card.revealed) action({type:'vote',cardId:selected===card.id?null:card.id});
  }
  async function assignRole(role){
    if(!socket)return;
    if(role.type==='ready'){await action({type:'ready'});return;}
    const result=await socket.timeout(10000).emitWithAck('kinonames_assign',{lobbyId:g.id,...role});
    if(!result?.success)throw Error(result?.message||'Не удалось сменить роль');
  }
  async function newParty(){
    try{const result=await socket.timeout(10000).emitWithAck('restart_game',g.id);if(!result?.success)throw Error(result?.message||'Не удалось подготовить новую партию');}
    catch(e){showToast(e.message||'Не удалось подготовить новую партию','error');}
  }
  const connected=(g.players||[]).filter(p=>p.connected!==false&&!p.waiting);
  const playerById=Object.fromEntries(connected.map(p=>[p.id,p]));
  const showTimer=variant==='competitive'&&(timerDeadline!=null||!!model.leaderGrace);
  return <main className="kn-screen" aria-label="Kinonames">
    {showTimer&&<div className={`kn-timer-track ${model.activeTeam==='red'?'red':'blue'}${model.leaderGrace?' grace':''}`} role="progressbar" aria-label={model.leaderGrace?'Ожидание возвращения ведущего':model.phase==='clue'?'Время подсказки':'Время хода'} aria-valuemin="0" aria-valuemax={totalSeconds||20} aria-valuenow={timer??0}>
      <span className="kn-timer-fill" style={{'--kn-timer-progress':`${timerRatio*100}%`}}/><span className="kn-timer-accessible">{timer??'Пауза'}{timer!==null?' секунд':''}</span>
    </div>}
    {model.leaderGrace&&<p className="kn-leader-grace" role="status">Ведущий отключился. Ожидаем возвращения · {Math.max(0,Math.ceil((model.leaderGrace.deadline-displayNow)/1000))} с</p>}
    <div className="kn-clue-bar" aria-live="polite">
      {model.clue?<><span className="kn-clue-label">Подсказка</span><strong>{model.clue.word} — {model.clue.count}</strong><span>от {model.clue.team==='red'?'красной':'синей'} команды</span></>:<span>{readyPhase?'Карточки и роли перемешаны':model.leaderGrace?'Таймер остановлен на время перезахода':'Ждём первую подсказку'}</span>}
      {ownRole.traitor&&<span className="kn-secret-role"><ShieldAlert size={14}/> Ваша секретная роль: предатель</span>}
      <div className="kn-match-tools"><button className="kn-change-role" type="button" onClick={()=>roleDialog.current?.showModal()}>Сменить роль</button></div>
    </div>
    {model.phase==='finished'&&<section className="kn-result" aria-live="assertive"><h2>{model.result?.winner?(model.result.winner==='blue'?'Синяя команда победила':'Красная команда победила'):'Игра окончена'}</h2><p>{resultReason(model.result?.reason)}</p></section>}
    {canClue&&<form className="kn-clue-form" onSubmit={e=>{e.preventDefault();action({type:'clue',word:clueWord,count:Number(clueCount)}).then(()=>setClueWord(''));}}>
      <label>Однословная подсказка<input value={clueWord} maxLength={40} required autoComplete="off" onChange={e=>setClueWord(e.target.value)}/></label>
      <label>Число<input type="number" min="1" max="25" value={clueCount} onChange={e=>setClueCount(e.target.value)}/></label>
      <button className="btn-primary" disabled={busy||!clueWord.trim()}>{model.clue?'Отправить подсказку':'Дать первую подсказку'}</button>
    </form>}
    {!leader&&ownRole.team&&model.phase==='guess'&&variant==='coop'&&ownRole.team==='blue'&&<button className="kn-request-clue btn-secondary" disabled={busy||model.remainingClues<1} onClick={()=>action({type:'request_clue'})}>{model.remainingClues>0?'Запросить новую подсказку':'Подсказки закончились — продолжайте угадывать'}</button>}
    <div className={`kn-match-layout ${variant}`}>
      {sideTeams.slice(0,1).map(team=><TeamSidebar key={team} team={team} players={connected} assignments={assignments} history={teamHistories[team]} remaining={model.remaining?.[team]} active={model.activeTeam===team}/>) }
      <section className="kn-match-center">
        <section className={`kn-board ${readyPhase?'is-ready':''}`} aria-label="Игровое поле 5 на 5">
          {model.board.map(card=>{
            const revealed=!!card.revealed||finished;
            const count=cardCount[card.id]||0;
            const isSelected=selected===card.id;
            const showSecret=leader&&!readyPhase;
            const color=card.color;
            const cardVoting=count>0&&model.phase==='guess';
            const voterIds=Object.entries(model.votes||{}).filter(([,id])=>id===card.id).map(([id])=>id);
            const name=card.name||'Новая карточка';
            return <button key={card.id} type="button" className={`kn-card ${readyPhase?'ready-card':''} ${showSecret?'leader-card':''} ${revealed?'revealed':''} ${color&&(!readyPhase||revealed)?`color-${color}`:''} ${isSelected?'voted':''} ${cardVoting?'has-votes':''} ${model.phase==='guess'&&model.activeTeam==='red'?'vote-red':''}`} aria-label={readyPhase?'Карточка скрыта до начала партии':`${name}${color&&(revealed||showSecret)?`, ${colorLabel(color)}`:''}${revealed?', открыта':''}${count?`, голосов: ${count}`:''}`} aria-pressed={leader?undefined:isSelected} disabled={showSecret||revealed||readyPhase||!canVote||busy} onClick={()=>cardPress(card)}>
              <span className="kn-card-name">{readyPhase?'':name}</span>
              {voterIds.length>0&&<span className="kn-card-voters" aria-label={`${voterIds.length} голосов`}>{voterIds.map(id=>{const voter=playerById[id];return voter?<span className="kn-card-avatar" key={id} title={voter.nickname} aria-label={`Голос: ${voter.nickname}`}><Avatar player={voter}/></span>:null;})}</span>}
              {color&&revealed&&<span className="kn-card-team">{colorLabel(color)}</span>}
              {model.confirmation?.cardId===card.id&&<span className={`kn-card-confirmation ${model.activeTeam==='red'?'red':'blue'}`} role="progressbar" aria-label={`Карточка откроется через ${left??3} секунды`} aria-valuemin="0" aria-valuemax="3" aria-valuenow={displayNow==null?0:Math.max(0,3-Math.min(3,(model.confirmation.deadline-displayNow)/1000))}><span style={{'--kn-confirm-progress':`${displayNow==null?0:Math.max(0,Math.min(100,(1-(model.confirmation.deadline-displayNow)/3000)*100))}%`}}/></span>}
            </button>;
          })}
        </section>
      </section>
      {variant==='competitive'&&<TeamSidebar team="red" players={connected} assignments={assignments} history={teamHistories.red} remaining={model.remaining?.red} active={model.activeTeam==='red'}/>}
    </div>
    <footer className="kn-game-footer">
      {!finished&&<p>{leader?<><Crown size={15}/> Ведущий команды {mine.team==='red'?'Красной':'Синей'}</>:canVote?<><Users size={15}/> Все игроки вашей команды должны выбрать одну карточку.</>:<><EyeOff size={15}/> {readyPhase?'Карточки скрыты до старта':`Ожидайте хода ${model.activeTeam==='red'?'красной':'синей'} команды.`}</>}</p>}
      {finished&&<div className="kn-result-actions"><button className="btn-primary" disabled={g.host!==player?.id} onClick={newParty}>Новая партия</button>{g.host!==player?.id&&<p className="kn-setting-note">Ожидаем ведущего, чтобы начать новую партию.</p>}</div>}
      {readyPhase&&<div className="kn-round-ready"><button type="button" className={`kn-ready-button${readyIds.includes(player?.id)?' selected':''}`} disabled={readyIds.includes(player?.id)||busy} onClick={()=>action({type:'ready'})}>{readyIds.includes(player?.id)?<><Check size={16}/> Вы готовы</>:'Готов'}</button><p className="kn-setting-note">Готовы: {readyIds.length} / {connected.length}</p></div>}
    </footer>
    <dialog ref={roleDialog} className="kn-role-dialog" aria-label="Сменить роль">
      <section className="kn-role-dialog-body"><button type="button" className="kn-settings-close" aria-label="Закрыть" onClick={()=>roleDialog.current?.close()}><X size={18}/></button><h2>Сменить роль</h2>
        <KinonamesTeams game={model} players={g.players||[]} player={player} settings={g.kinonames?.settings||model.settings} readyIds={readyIds} onAssign={async role=>{try{await assignRole(role);if(role.type!=='ready')showToast('Роль обновлена','success');}catch(e){showToast(e.message||'Не удалось сменить роль','error');}}}/>
      </section>
    </dialog>
    <button className="kn-exit-room" onClick={async()=>{if(await showConfirm('Выйти из комнаты и вернуться в главное меню?',{title:'Выйти из игры',confirmText:'Выйти'}))leaveGame();}}>Выйти из комнаты</button>
  </main>;
}

function TeamSidebar({team,players,assignments,history,remaining,active}){
  const members=players.filter(p=>assignments[p.id]?.team===team);
  const leader=members.find(p=>assignments[p.id]?.leader);
  const guessers=members.filter(p=>!assignments[p.id]?.leader);
  return <aside className={`kn-team-sidebar ${team}${active?' active':''}`} aria-label={`${team==='blue'?'Синяя':'Красная'} команда`}>
    <h2>{team==='blue'?'Синяя':'Красная'} команда</h2>
    <p className="kn-sidebar-count">{remaining??0} осталось</p>
    <div className="kn-sidebar-roster"><p className="kn-sidebar-leader"><Crown size={14}/>{leader?.nickname||'Ведущий не выбран'}</p>{guessers.map(p=><span key={p.id}>{p.nickname}</span>)}</div>
    <section className="kn-sidebar-history"><h3>Подсказки</h3>{history.length?<ol>{history.map((clue,index)=><li key={`${clue.turnId}-${index}`}><span>{clue.count}</span>{clue.word}</li>)}</ol>:<p>Пока нет подсказок</p>}</section>
  </aside>;
}

function colorLabel(color){return ({blue:'СИНЯЯ',red:'КРАСНАЯ',black:'ЧЁРНАЯ',neutral:'НЕЙТРАЛЬНАЯ'})[color]||'ОТКРЫТА';}
function resultReason(reason){return ({all_cards:'Команда открыла все карточки своей стороны.',black_card:'Открыта чёрная карточка.',lives_exhausted:'У команды закончились жизни.'})[reason]||'Партия завершена.';}

const EMPTY_ASSIGNMENTS=Object.freeze({});
