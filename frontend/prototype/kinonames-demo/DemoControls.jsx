import {useEffect, useMemo, useState} from 'react';
import {ChevronDown,FastForward,Pause,Play,Rewind,RotateCcw,Settings2,SkipBack,SkipForward,Volume2} from 'lucide-react';
import {useGame} from '../../src/GameContext.jsx';
import {unlockGameAudio} from '../../src/utils/gameAudio.js';

const SCENE_NAMES={home:'Главное меню',foyer:'Фойе',clue:'Подсказка ведущего',guess:'Голосование',confirmation:'Подтверждение карточки',reveal:'Открытие карточки',round:'Следующий ход',game_over:'Итог партии'};

async function sendDemoCommand(view,command,details={}) {
  const response=await fetch(`/__kinonames-demo?view=${encodeURIComponent(view)}`,{
    method:'POST',headers:{'content-type':'application/json','x-kinonames-demo':'1'},
    body:JSON.stringify({command,...details}),cache:'no-store',
  });
  const result=await response.json();
  if(!response.ok||result?.success===false)throw new Error(result?.message||'Команда не выполнена');
  return result.snapshot||result;
}

export default function DemoControls({view='leader'}) {
  const {showToast,demoControls:state}=useGame();
  const [pending,setPending]=useState(false),[audioReady,setAudioReady]=useState(false),[draft,setDraft]=useState(null),[reduced,setReduced]=useState(false);
  const [collapsed,setCollapsed]=useState(true);
  useEffect(()=>{const query=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(query.matches);update();query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[]);
  const steps=state?.steps||[];
  const cursor=Number(state?.cursor)||0;
  const length=Number(state?.length)||steps.length||1;
  const selectedStep=steps[cursor]||steps[0]||null;
  const hrefFor=role=>`${location.pathname}?view=${role}`;
  const run=async(command,details={})=>{
    if(pending)return;
    setPending(true);
    try{
      await sendDemoCommand(view,command,details);
    }catch(e){showToast(e.message||'Команда не выполнена','error');}
    finally{setPending(false);}
  };
  const seek=next=>{setDraft({index:next,cursor});void run('seek',{index:next});};
  const timeLabel=useMemo(()=>{
    if(state?.clock==null)return 'Ожидание сервера';
    return state.paused?'Пауза':'Время партии';
  },[state?.clock,state?.paused]);
  const button=(label,icon,onClick,disabled=false,extra='')=><button key={label} type="button" className={`knd-button ${extra}`} onClick={onClick} disabled={disabled||pending} aria-label={label} title={label}>{icon}<span>{label}</span></button>;

  if(!state)return <aside className="knd-panel knd-loading" aria-label="Панель управления прототипом"><span>Подключаемся к общей демонстрационной партии…</span></aside>;
  if(collapsed)return <aside className="knd-panel is-collapsed" aria-label="Панель управления прототипом"><button className="knd-toggle" type="button" aria-expanded="false" onClick={()=>setCollapsed(false)}><Settings2 size={17}/> Тест-панель</button></aside>;
  return <aside className="knd-panel" aria-label="Ручное управление демонстрационной партией">
    <div className="knd-topline">
      <div className="knd-heading"><strong>Тест Kinonames</strong><span>{selectedStep?.label||state.label||SCENE_NAMES[selectedStep?.scene]||'Сценарий'}</span></div>
      <div className="knd-role-switch" aria-label="Открыть роль">
        <a href={hrefFor('leader')} aria-current={view==='leader'?'page':undefined}>Ведущий</a>
        <a href={hrefFor('player')} aria-current={view==='player'?'page':undefined}>Игрок</a>
        <button className="knd-toggle" type="button" aria-label="Свернуть тест-панель" aria-expanded="true" onClick={()=>setCollapsed(true)}><ChevronDown size={17}/></button>
      </div>
    </div>
    <div className="knd-mode-row"><label>Режим прототипа<select aria-label="Режим прототипа" value={state.mode||'competitive'} disabled={pending} onChange={e=>run('mode',{mode:e.target.value})}><option value="competitive">Многопользовательский</option><option value="coop">Одиночный</option><option value="traitors">С предателями</option></select></label><span>Общая локальная партия · изменения видны в обеих вкладках</span>{state.canRestart&&button('Новая партия (тест)',<RotateCcw/>,()=>run('new_party'))}</div>
    <div className="knd-transport">
      {button('К началу',<SkipBack/>,()=>run('first'),cursor<=0)}
      {button('Предыдущий шаг',<Rewind/>,()=>run('back'),cursor<=0)}
      {button(state.paused?'Продолжить':'Пауза',state.paused?<Play/>:<Pause/>,()=>run(state.paused?'play':'pause'),false,'knd-play')}
      {button('Следующий шаг',<FastForward/>,()=>run('next'),cursor>=length-1,'knd-next')}
      {button('К финалу',<SkipForward/>,()=>run('last'),cursor>=length-1)}
      <span className="knd-divider" aria-hidden="true"/>
      {button('Продвинуть таймер на 1 секунду',<span className="knd-time-icon">+1</span>,()=>run('advance',{ms:1000}),cursor>=length-1)}
      {button('Продвинуть таймер на 5 секунд',<span className="knd-time-icon">+5</span>,()=>run('advance',{ms:5000}),cursor>=length-1)}
      <button className={`knd-button knd-audio ${audioReady?'is-ready':''}`} type="button" onClick={async()=>{const ready=await unlockGameAudio();setAudioReady(ready);showToast(ready?'Звуки Kinonames включены':'Браузер не разрешил звук. Нажмите ещё раз. ',ready?'success':'error');}} aria-label="Разрешить звуки игры" title="Разрешить звуки игры"><Volume2/><span>{audioReady?'Звук включён':'Включить звук'}</span></button>
    </div>
    <div className="knd-seek-row">
      <span className="knd-step-count">{cursor+1}<i>/</i>{length}</span>
      <input aria-label="Перейти к шагу сценария" type="range" min="0" max={Math.max(0,length-1)} value={draft?.cursor===cursor?draft.index:cursor} onChange={e=>setDraft({index:Number(e.target.value),cursor})} onPointerUp={e=>seek(Number(e.currentTarget.value))} onKeyUp={e=>seek(Number(e.currentTarget.value))} onBlur={()=>setDraft(null)}/>
      <span className="knd-clock-state">{timeLabel}</span>
      {reduced&&<span className="knd-reduced">Сокращённая анимация</span>}
    </div>
    <ol className="knd-sr-steps" aria-label="Этапы сценария">{steps.map((step,index)=><li key={`${index}-${step.label}`} aria-current={index===cursor?'step':undefined}>{step.label||SCENE_NAMES[step.scene]||`Шаг ${index+1}`}</li>)}</ol>
  </aside>;
}
