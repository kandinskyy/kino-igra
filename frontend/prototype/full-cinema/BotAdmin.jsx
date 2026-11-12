import { useEffect, useRef, useState } from 'react';
import { FlaskConical, X, Plus, Trash2, Send, RotateCcw, SlidersHorizontal, CircleHelp } from 'lucide-react';
import { useGame } from '../../src/GameContext.jsx';
import './bot-admin.css';

const POLICY_OPTIONS=[
  ['random','Случайно'],
  ['copy-host','Повторять ведущего'],
  ['reverse-host','Ставить наоборот'],
  ['manual','Вручную'],
];
const MODE_OPTIONS=[['original','Оригинальный'],['opinion','Мнение одного']];
const RANKS=['S','A','B','C','D'];
const LABELS={
  home:'Главное меню',lobby:'Фойе',round_start:'Идёт раунд',reveal:'Раскрытие оценок',round_end:'Итоги раунда',game_over:'Игра завершена',
  idle:'Ждёт оценок',voting:'Выставляет оценки',ready:'Все оценки отправлены',saved:'Сохранил ответ',
  critic:'Сейчас критик',guess:'Сейчас угадывает',sent:'Оценки отправлены',
};
function initialSettings(control){return {mode:control?.mode||'original',targetVP:String(control?.targetVP??10),circles:String(control?.circles??1),hiddenMode:!!control?.hiddenMode,repeatRatings:!!control?.repeatRatings};}
export default function BotAdmin(){
  const {testControl,gameState}=useGame();
  const [open,setOpen]=useState(false),[draft,setDraft]=useState(()=>initialSettings(testControl));
  const [error,setError]=useState(''),[confirmReset,setConfirmReset]=useState(false);
  const dialog=useRef(null),trigger=useRef(null),closeButton=useRef(null);
  const bots=testControl?.bots||[],movies=testControl?.movies||[];
  const mode=testControl?.mode||'original',inLobby=testControl?.state==='lobby';
  const playerCount=gameState?.players?.length||0;
  const hostRatings=gameState?.ratings?.[gameState?.host]||{};
  const hostRatingsComplete=movies.length>0&&movies.every(movie=>!!hostRatings[movie.id]);
  useEffect(()=>{
    if(!open||!dialog.current)return;
    const node=dialog.current,previous=document.activeElement;
    if(!node.open)node.showModal();
    closeButton.current?.focus();
    return()=>{if(node.open)node.close();if(previous?.isConnected)previous.focus();};
  },[open]);
  const close=()=>setOpen(false);
  function action(method,...args){
    setError('');
    const result=testControl?.[method]?.(...args);
    if(result?.success===false){setError(result.message||'Действие недоступно.');return false;}
    return true;
  }
  function resetRoom(){
    if(action('resetToLobby')){setConfirmReset(false);setOpen(false);}
  }
  function setSetting(key,value){setDraft(current=>({...current,[key]:value}));}
  function applySettings(){
    const field=draft.mode==='opinion'?'circles':'targetVP';
    const number=Number(draft[field]);
    if(!Number.isInteger(number)||number<1||number>999){setError('Укажи целое число от 1 до 999.');return;}
    action('setSettings',{mode:draft.mode,[field]:number,hiddenMode:draft.hiddenMode,repeatRatings:draft.repeatRatings});
  }
  function configure(bot,patch){action('configureBot',bot.id,patch);}
  function changeManual(bot,index,value){
    const ranks=[...(bot.manualRanks||['S','A','B','C','D'])];
    const previous=ranks[index],occupied=ranks.findIndex((rank,i)=>i!==index&&rank===value);
    if(!testControl.repeatRatings&&occupied>=0)ranks[occupied]=previous;
    ranks[index]=value;
    configure(bot,{manualRanks:ranks});
  }
  return <div className="bot-admin">
    <button ref={trigger} className="bot-admin-trigger" type="button" aria-haspopup="dialog" aria-expanded={open} aria-label="Открыть тестовую панель" onClick={()=>{setDraft(initialSettings(testControl));setError('');setOpen(true);}}>
      <FlaskConical size={17}/><span>Тест-панель</span>{bots.length>0&&<b>{bots.length}</b>}
    </button>
    {open&&<dialog ref={dialog} className="bot-admin-dialog" aria-labelledby="bot-admin-title" onCancel={event=>{event.preventDefault();close();}}>
      <div className="bot-admin-head"><div className="bot-admin-title"><span className="bot-admin-mark"><FlaskConical size={18}/></span><div><h2 id="bot-admin-title">Тестовая панель</h2><p>Боты и настройки текущего зала</p></div></div><button ref={closeButton} className="bot-admin-icon" type="button" aria-label="Закрыть тестовую панель" onClick={close}><X size={19}/></button></div>
      <div className="bot-admin-body">
        {!testControl||!gameState||testControl.state==='home'?<div className="bot-admin-empty"><CircleHelp size={20}/><p>Создай тестовую комнату, чтобы управлять участниками и настройками игры.</p></div>:<>
          <section className="bot-admin-section" aria-labelledby="bot-room-state"><div className="bot-admin-section-head"><div><h3 id="bot-room-state">Текущий зал</h3><p>Код {testControl.roomCode||testControl.roomId||gameState?.id||'—'} · {LABELS[testControl.state]||testControl.state||'Ожидание'}</p></div><span className={`bot-admin-state ${inLobby?'is-lobby':''}`}>{inLobby?'Фойе':mode==='opinion'?(testControl.phase==='critic'?'Фаза критика':'Фаза ответов'):'Игра'}</span></div>
            <label className="bot-admin-field"><span>Режим игры</span><select value={draft.mode} disabled={!inLobby} onChange={event=>setSetting('mode',event.target.value)}>{MODE_OPTIONS.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
            {!inLobby&&<p className="bot-admin-note">Режим раунда уже начался. Изменить его можно после возврата в фойе.</p>}
            <label className="bot-admin-field"><span>{draft.mode==='opinion'?'Кругов до победы':'Очков до победы'}</span><input type="number" min="1" max="999" step="1" value={draft[draft.mode==='opinion'?'circles':'targetVP']} disabled={!inLobby} onChange={event=>setSetting(draft.mode==='opinion'?'circles':'targetVP',event.target.value)}/></label>
            <label className="bot-admin-check"><input type="checkbox" checked={draft.hiddenMode} disabled={!inLobby} onChange={event=>setSetting('hiddenMode',event.target.checked)}/><span><b>Скрытые оценки</b><small>Участники не видят ответы до раскрытия.</small></span></label>
            <label className="bot-admin-check"><input type="checkbox" checked={draft.repeatRatings} disabled={!inLobby} onChange={event=>setSetting('repeatRatings',event.target.checked)}/><span><b>Разрешить повтор оценок</b><small>Ботам можно ставить один ранг нескольким фильмам.</small></span></label>
            {inLobby&&<button className="bot-admin-primary" type="button" onClick={applySettings}><SlidersHorizontal size={16}/>Применить настройки</button>}
          </section>
          <section className="bot-admin-section" aria-labelledby="bot-admin-players"><div className="bot-admin-section-head"><div><h3 id="bot-admin-players">Тестовые участники</h3><p>{playerCount||bots.length} из 16 · {bots.length} ботов</p></div></div>
            <div className="bot-admin-add"><button type="button" onClick={()=>action('addBots',1)} disabled={!inLobby||playerCount>=16}><Plus size={15}/>Добавить бота</button><button type="button" onClick={()=>action('addBots',3)} disabled={!inLobby||playerCount>13}><Plus size={15}/>Добавить 3</button></div>
            {!bots.length?<p className="bot-admin-no-bots">Добавь бота, чтобы проверить голосование и раскрытие оценок.</p>:<div className="bot-admin-bots">{bots.map((bot,index)=>{
              const manual=bot.policy==='manual',ready=bot.canVote!==false;
              const voted=bot.ratings||bot.currentRatings||[];
              const ranks=Array.isArray(voted)?voted:movies.map(movie=>voted[movie.id]||'—');
              return <article className="bot-admin-card" key={bot.id}>
                <div className="bot-admin-card-head"><label className="bot-admin-field bot-admin-name"><span className="sr-only">Имя бота {index+1}</span><input maxLength="24" value={bot.nickname||`Бот ${index+1}`} disabled={!inLobby} onChange={event=>configure(bot,{nickname:event.target.value})}/></label><span className={`bot-admin-vote-state ${ready?'is-ready':''}`}>{bot.status||LABELS[bot.progress]|| (ready?'Готов голосовать':'Ждёт хода')}</span></div>
                <label className="bot-admin-field"><span>Как оценивает</span><select value={bot.policy||'random'} onChange={event=>configure(bot,{policy:event.target.value})}>{POLICY_OPTIONS.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
                {manual&&<fieldset className="bot-admin-manual"><legend>Оценки фильмов</legend>{movies.map((movie,movieIndex)=>{const current=bot.manualRanks?.[movieIndex]||RANKS[movieIndex]||'S';return <label key={movie.id} className="bot-admin-rank-field"><span title={movie.title}>{movie.title}</span><select aria-label={`Оценка бота ${bot.nickname} · ${movie.title}`} value={current} onChange={event=>changeManual(bot,movieIndex,event.target.value)}>{RANKS.map(rank=><option key={rank} value={rank}>{rank}</option>)}</select></label>;})}</fieldset>}
                {policyNeedsHost(bot.policy)&&<p className="bot-admin-note">{hostRatingsComplete?'Берёт готовую последовательность ведущего.':'Сначала выставь свои оценки, затем запускай бота.'}</p>}
                <label className="bot-admin-check bot-admin-auto"><input type="checkbox" checked={!!bot.auto} onChange={event=>configure(bot,{auto:event.target.checked})}/><span><b>Голосовать автоматически</b><small>Пауза перед отправкой</small></span></label>
                {!!bot.auto&&<label className="bot-admin-field bot-admin-delay"><span>Задержка, мс</span><input type="number" min="0" max="15000" step="250" value={bot.delayMs??1500} onChange={event=>configure(bot,{delayMs:Number(event.target.value)})}/></label>}
                <div className="bot-admin-bot-actions"><button className="bot-admin-send" type="button" disabled={!ready} onClick={()=>action('sendBot',bot.id)}><Send size={14}/>Отправить оценки</button><button className="bot-admin-remove" type="button" aria-label={`Удалить ${bot.nickname}`} disabled={!inLobby} onClick={()=>action('removeBot',bot.id)}><Trash2 size={15}/></button></div>
                {ranks.some(rank=>rank&&rank!=='—')&&<p className="bot-admin-current-ratings">Текущие: {movies.slice(0,5).map((movie,i)=>`${movie.title}: ${ranks[i]||'—'}`).join(' · ')}</p>}
              </article>;
            })}</div>}
            {bots.length>0&&<button className="bot-admin-primary bot-admin-send-all" type="button" disabled={!bots.some(bot=>bot.canVote!==false)} onClick={()=>action('sendAll')}><Send size={16}/>Отправить оценки всех готовых</button>}
          </section>
          <section className="bot-admin-foot">{confirmReset?<div className="bot-admin-reset-confirm" role="group" aria-label="Подтвердить сброс раунда"><p>Вернуть комнату в фойе? Раунд и выставленные оценки сбросятся, участники и настройки сохранятся.</p><button className="bot-admin-reset" type="button" onClick={()=>setConfirmReset(false)}>Продолжить раунд</button><button className="bot-admin-primary" type="button" onClick={resetRoom}>Да, вернуть в фойе</button></div>:<button className="bot-admin-reset" type="button" disabled={inLobby} onClick={()=>setConfirmReset(true)}><RotateCcw size={15}/>Вернуться в фойе и сбросить раунд</button>}<p>Локальная тестовая комната. Реальные игроки и сервер не подключены.</p></section>
        </>}
        {error&&<p className="bot-admin-error" role="alert">{error}</p>}
      </div>
    </dialog>}
  </div>;
}
function policyNeedsHost(policy){return policy==='copy-host'||policy==='reverse-host';}


