import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {GameContext} from '../../src/GameContext.jsx';

const ENDPOINT='/__kinonames-demo';

async function request(view, body) {
  const response=await fetch(`${ENDPOINT}?view=${encodeURIComponent(view)}`,{
    method:body?'POST':'GET',
    headers:body?{'content-type':'application/json','x-kinonames-demo':'1'}:undefined,
    body:body?JSON.stringify(body):undefined,
    cache:'no-store',
  });
  const result=await response.json();
  if(!response.ok||result?.success===false)throw new Error(result?.message||'Не удалось обновить демонстрационную партию');
  return result.snapshot||result;
}

export default function DemoProvider({view='leader',children}) {
  const [snapshot,setSnapshot]=useState(null),[error,setError]=useState(''),[toast,setToast]=useState(null),[modal,setModal]=useState(null);
  const [entryCommitted,setEntryCommitted]=useState(false),[gameEntered,setGameEntered]=useState(false),[gameTransitionPending,setGameTransitionPending]=useState(false);
  const [presentationStage,setPresentationStage]=useState('home');
  const [demoRevision,setDemoRevision]=useState(0),[clockSample,setClockSample]=useState({clock:0,receivedAt:0}),[pulse,setPulse]=useState(0);
  const pendingEntrance=useRef(false),latest=useRef(null),alive=useRef(true),snapshotJson=useRef('');
  const controls=snapshot?.controls||null,lobby=snapshot?.lobby||null;
  const demoPaused=!!controls?.paused;
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;}},[]);
  useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(null),3200);return()=>clearTimeout(timer);},[toast]);
  const apply=useCallback(next=>{
    if(!alive.current)return;
    const receipt=Date.now(),serialized=JSON.stringify(next);
    if(serialized!==snapshotJson.current){snapshotJson.current=serialized;setSnapshot(next);}
    setError('');
    const clock=Number(next?.controls?.clock);
    if(Number.isFinite(clock))setClockSample(current=>current.clock===clock&&current.receivedAt!==0?current:{clock,receivedAt:receipt});
  },[]);
  const send=useCallback(async(command,details={})=>{
    const next=await request(view,{command,...details});apply(next);setDemoRevision(value=>value+1);return next;
  },[apply,view]);

  useEffect(()=>{
    let stopped=false,busy=false;
    const poll=async()=>{
      if(stopped||busy)return;busy=true;
      try{apply(await request(view));}catch(e){if(!stopped)setError(e.message||'Демо-сервер недоступен');}
      finally{busy=false;}
    };
    poll();const timer=setInterval(poll,250);
    return()=>{stopped=true;clearInterval(timer);};
  },[apply,view]);

  const stage=!lobby?'home':lobby.state==='lobby'?'foyer':'game';
  // Gate the first render of a new stage, before the effect commits presentation.
  // Otherwise the raw game flashes for one frame before the portal is mounted.
  let visibleGamePending=gameTransitionPending,visibleGameEntered=gameEntered,visibleEntryCommitted=entryCommitted;
  if(stage!==presentationStage){
    visibleGamePending=stage==='game'&&presentationStage==='foyer';
    visibleGameEntered=stage==='game'&&!visibleGamePending;
    visibleEntryCommitted=stage==='game'||(stage==='foyer'&&presentationStage!=='home');
    setPresentationStage(stage);setEntryCommitted(visibleEntryCommitted);setGameEntered(visibleGameEntered);setGameTransitionPending(visibleGamePending);
  }
  useEffect(()=>{if(stage==='home')pendingEntrance.current=false;},[stage]);
  useEffect(()=>{if(demoPaused)return;const timer=setInterval(()=>setPulse(Date.now()),100);return()=>clearInterval(timer);},[demoPaused]);
  useEffect(()=>{latest.current={lobby};},[lobby]);

  const commitRoom=useCallback(()=>{
    pendingEntrance.current=false;
    if(!latest.current?.lobby)return false;
    setEntryCommitted(true);return true;
  },[]);
  const prepareRoom=useCallback(async(nickname)=>{
    try{pendingEntrance.current=true;const result=await send('create',{nickname});setEntryCommitted(false);return {success:true,snapshot:result};}
    catch(e){pendingEntrance.current=false;return {success:false,message:e.message};}
  },[send]);
  const cancelRoom=useCallback(()=>{
    if(!pendingEntrance.current)return;
    pendingEntrance.current=false;
    void send('first').catch(()=>{});
    setEntryCommitted(false);
  },[send]);
  const enterGame=useCallback(async()=>{
    setGameTransitionPending(true);setGameEntered(false);
    try{await send('start');return true;}
    catch(e){setGameTransitionPending(false);setToast({message:e.message,type:'error'});throw e;}
  },[send]);
  const completeGameTransition=useCallback(()=>{setGameEntered(true);setGameTransitionPending(false);},[]);
  const beginRestoredEntry=useCallback(()=>{pendingEntrance.current=true;return {success:true};},[]);

  const realLobby=lobby;
  const visibleLobby=realLobby&&realLobby.state!=='lobby'&&visibleGamePending&&!visibleGameEntered?{...realLobby,state:'lobby'}:realLobby;
  const player=snapshot?.player||null;
  const currentClock=controls?.paused?clockSample.clock:clockSample.clock+Math.max(0,pulse-clockSample.receivedAt);
  const presentedLobby=visibleLobby?.kinonames?.game?{...visibleLobby,kinonames:{...visibleLobby.kinonames,game:{...visibleLobby.kinonames.game,serverNow:currentClock}}}:visibleLobby;
  const gameState=!presentedLobby||(!visibleEntryCommitted&&presentedLobby.state==='lobby')?null:presentedLobby;

  const closeModal=useCallback(result=>setModal(current=>{current?.resolve?.(result);return null;}),[]);
  const showAlert=useCallback((message,options={})=>new Promise(resolve=>setModal({type:'alert',message,title:options.title||'Внимание',confirmText:options.confirmText||'Понятно',resolve})),[]);
  const showConfirm=useCallback((message,options={})=>new Promise(resolve=>setModal({type:'confirm',message,title:options.title||'Подтверждение',confirmText:options.confirmText||'Подтвердить',cancelText:options.cancelText||'Отмена',isDanger:!!options.isDanger,resolve})),[]);
  const showToast=useCallback((message,type='info')=>setToast({message,type}),[]);

  const action=useCallback(async(event,data)=>{
    const result=await send('action',{event,data});
    return result?.ack||result?.actionResult||{success:true};
  },[send]);
  const socket=useMemo(()=>({
    connected:true,
    timeout(){return {emitWithAck:(event,data)=>action(event,data)};},
    emit(event,data){void action(event,data).catch(e=>showToast(e.message,'error'));},
    on(){return this;},off(){return this;},
  }),[action,showToast]);
  const leaveGame=useCallback(()=>{setGameEntered(false);setEntryCommitted(false);void send('first').catch(e=>showToast(e.message,'error'));},[send,showToast]);
  const closeLobby=leaveGame;
  const reconnect=useCallback(()=>void request(view).then(apply).catch(e=>setError(e.message)),[view,apply]);
  // Explicit developer-controller command; does not impersonate a room host.
  const demoRestart=useCallback(()=>send('new_party'),[send]);

  const contextValue=useMemo(()=>({
    socket,gameState,player,isConnected:true,connectionMessage:error,reconnect,
    leaveGame,closeLobby,modal,toast,showAlert,showConfirm,showToast,closeModal,
    prepareRoom,commitRoom,cancelRoom,enterGame,beginRestoredEntry,
    entranceRequested:!!lobby&&!visibleEntryCommitted&&lobby.state==='lobby',
    gameTransitionPending:!!lobby&&visibleGamePending&&!visibleGameEntered,
    completeGameTransition,
    demoPaused,demoRevision,serverNow:currentClock,demoControls:controls,demoRestart,
  }),[socket,gameState,player,error,reconnect,leaveGame,closeLobby,modal,toast,showAlert,showConfirm,showToast,closeModal,prepareRoom,commitRoom,cancelRoom,enterGame,beginRestoredEntry,lobby,visibleEntryCommitted,visibleGamePending,visibleGameEntered,completeGameTransition,demoPaused,demoRevision,currentClock,controls,demoRestart]);
  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
}

