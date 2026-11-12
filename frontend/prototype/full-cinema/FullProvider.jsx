import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {GameContext} from '../../src/GameContext.jsx';
import {addBots,botSnapshot,createRoom,defaultBotConfig,dispatch,publicView,resetToLobby,sceneFor,sendBotVotes,tickTimer,validateBotConfig} from './full-model.js';

const phaseToken=g=>`${g.id}:${g.roundId}:${g.phase}:${g.movies.map(m=>m.id).join(',')}`;

// This transport intentionally stays in this tab. It never connects to a server,
// touches a real room, or stores test controls in a production session.
export default function FullProvider({children}) {
  const room=useRef(null),pending=useRef(null),configs=useRef(new Map()),due=useRef(new Map()),listeners=useRef(new Map());
  const [gameState,setState]=useState(null),[admin,setAdmin]=useState(null),[modal,setModal]=useState(null),[toast,setToast]=useState(null);
  const emitLocal=useCallback((event,data)=>listeners.current.get(event)?.forEach(fn=>fn(data)),[]);
  const publish=useCallback(()=>{
    const g=room.current,view=publicView(g);setState(view);
    setAdmin(g?{bots:g.players.filter(p=>p.bot).map(p=>botSnapshot(g,p,configs.current.get(p.id)||defaultBotConfig())),
      state:g.state,mode:g.mode,targetVP:g.targetVP,phase:g.phase,criticId:g.criticId,
      criticName:g.players.find(p=>p.id===g.criticId)?.nickname||null,movies:g.movies.map(({id,title})=>({id,title})),
      hiddenMode:g.hiddenMode,repeatRatings:g.repeatRatings,circles:g.circles,categories:[...g.categories]}:null);
    emitLocal('lobby_update',view);
  },[emitLocal]);
  const showToast=useCallback((message,type='info')=>setToast({message,type}),[]);
  const fail=useCallback(error=>{const message=error?.message||'Не удалось выполнить действие';showToast(message,'error');return {success:false,message};},[showToast]);
  useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(null),3200);return()=>clearTimeout(timer);},[toast]);
  const closeModal=useCallback((result=false)=>setModal(current=>{current?.resolve?.(result);return null;}),[]);
  const showConfirm=useCallback((message,options={})=>new Promise(resolve=>setModal({type:'confirm',title:'Подтверждение',confirmText:'Подтвердить',cancelText:'Отмена',message,...options,resolve})),[]);
  const showAlert=useCallback((message,options={})=>new Promise(resolve=>setModal({type:'alert',title:'Внимание',confirmText:'Понятно',message,...(typeof options==='string'?{title:options}:options),resolve})),[]);
  const prepareRoom=useCallback((nickname,code='')=>{
    try {
      if(room.current||pending.current)throw Error('Комната уже создаётся');
      if(code&&!/^[A-Z0-9]{6}$/.test(code))throw Error('Код — 6 латинских букв или цифр');
      pending.current=createRoom(nickname,code);return {success:true};
    }catch(error){return fail(error);}
  },[fail]);
  const cancelRoom=useCallback(()=>{pending.current=null;},[]);
  const commitRoom=useCallback(()=>{if(!pending.current)return false;room.current=pending.current;pending.current=null;configs.current.clear();due.current.clear();publish();return true;},[publish]);
  const leaveGame=useCallback(()=>{room.current=null;pending.current=null;configs.current.clear();due.current.clear();setModal(current=>{current?.resolve?.(false);return null;});publish();},[publish]);
  const request=useCallback((event,data)=>{
    try {
      if(event==='leave_lobby'||event==='close_lobby'){leaveGame();return {success:true};}
      const result=dispatch(room.current,event,data);publish();return result;
    }catch(error){return fail(error);}
  },[fail,leaveGame,publish]);
  const enterGame=useCallback(()=>request('launch_game',{}),[request]);
  const socket=useMemo(()=>{
    const connection={connected:true,
      on(event,fn){if(!listeners.current.has(event))listeners.current.set(event,new Set());listeners.current.get(event).add(fn);return connection;},
      off(event,fn){if(fn)listeners.current.get(event)?.delete(fn);else listeners.current.delete(event);return connection;},
      timeout(){return connection;},
      async emitWithAck(event,data){return request(event,data);},
      emit(event,data,callback){const result=request(event,data);callback?.(result);return connection;},
    };return connection;
  },[request]);
  const control=useCallback(action=>{try{const result=action();publish();return result||{success:true};}catch(error){return fail(error);}},[publish,fail]);
  const addTestBots=useCallback(count=>control(()=>{
    addBots(room.current,count);for(const p of room.current.players.filter(p=>p.bot))if(!configs.current.has(p.id))configs.current.set(p.id,defaultBotConfig());
  }),[control]);
  const removeBot=useCallback(id=>control(()=>{
    if(room.current?.state!=='lobby')throw Error('Удаляйте ботов в лобби');
    if(!room.current.players.some(p=>p.id===id&&p.bot))throw Error('Бот не найден');
    dispatch(room.current,'kick_player',{targetPlayerId:id});configs.current.delete(id);due.current.delete(id);
  }),[control]);
  const configureBot=useCallback((id,patch)=>control(()=>{
    const bot=room.current?.players.find(p=>p.id===id&&p.bot);
    if(!bot)throw Error('Бот не найден');
    const next=validateBotConfig(configs.current.get(id)||defaultBotConfig(),patch);
    if(patch.nickname!==undefined){
      if(room.current.state!=='lobby')throw Error('Имя бота можно изменить только в лобби');
      if(typeof patch.nickname!=='string'||!patch.nickname.trim()||patch.nickname.trim().length>24)throw Error('Имя должно содержать от 1 до 24 символов');
      bot.nickname=patch.nickname.trim();
    }
    configs.current.set(id,next);due.current.delete(id);
  }),[control]);
  const sendBot=useCallback(id=>control(()=>{
    const token=room.current&&phaseToken(room.current);
    const result=sendBotVotes(room.current,id,configs.current.get(id)||defaultBotConfig());
    due.current.set(id,{token,at:Date.now(),sent:true});return result;
  }),[control]);
  const sendAll=useCallback(()=>control(()=>{
    if(!room.current||room.current.state!=='round_start')throw Error('Сначала начните раунд');
    let sent=0;const errors=[];
    for(const bot of room.current.players.filter(p=>p.bot)){
      const config=configs.current.get(bot.id)||defaultBotConfig();
      if(!botSnapshot(room.current,bot,config).canVote)continue;
      try{const token=phaseToken(room.current);sendBotVotes(room.current,bot.id,config);due.current.set(bot.id,{token,at:Date.now(),sent:true});sent++;}catch(error){errors.push(`${bot.nickname}: ${error.message}`);}
    }
    // Keep successful ballots visible even if one configured bot cannot send yet.
    if(errors.length){publish();throw Error(errors.join('; '));}
    if(!sent)throw Error('Нет ботов, которые могут ответить в этой фазе');
    return {success:true,count:sent};
  }),[control,publish]);
  const setSettings=useCallback(patch=>request('update_target_vp',patch),[request]);
  const returnToLobby=useCallback(()=>control(()=>{due.current.clear();return resetToLobby(room.current);}),[control]);
  useEffect(()=>{
    const timer=setInterval(()=>{const g=room.current;if(!tickTimer(g))return;emitLocal('timer_tick',{timeLeft:g.timeLeft,isRunning:g.timerRunning});publish();},1000);
    const bots=setInterval(()=>{
      const g=room.current;if(!g||g.state!=='round_start')return;
      let changed=false;
      for(const bot of g.players.filter(p=>p.bot&&p.connected)){
        const config=configs.current.get(bot.id)||defaultBotConfig(),snapshot=botSnapshot(g,bot,config);
        const token=phaseToken(g);
        let scheduled=due.current.get(bot.id);
        if(!scheduled||scheduled.token!==token){scheduled={token,at:Date.now()+config.delayMs,sent:false};due.current.set(bot.id,scheduled);}
        if(!config.auto||!snapshot.canVote||scheduled.sent||Date.now()<scheduled.at)continue;
        try{sendBotVotes(g,bot.id,config);scheduled.sent=true;changed=true;}catch{/* A dependent/manual ballot waits silently; admin shows its reason. */}
        if(g.state!=='round_start')break;
      }
      if(changed)publish();
    },100);
    return()=>{clearInterval(timer);clearInterval(bots);};
  },[emitLocal,publish]);
  const testControl=useMemo(()=>{
    return {bots:[],state:'home',mode:'original',targetVP:10,phase:null,criticId:null,criticName:null,movies:[],hiddenMode:false,repeatRatings:false,circles:1,categories:['films'],...admin,
      addBots:addTestBots,removeBot,configureBot,sendBot,sendAll,setSettings,resetToLobby:returnToLobby,
    };
  },[admin,addTestBots,removeBot,configureBot,sendBot,sendAll,setSettings,returnToLobby]);
  const player=gameState?.players.find(p=>p.id==='me')||null;
  const value={gameState,player,socket,isConnected:true,connectionMessage:'',reconnect(){},prepareRoom,commitRoom,cancelRoom,enterGame,
    leaveGame,closeLobby:leaveGame,modal,toast,closeModal,showConfirm,showAlert,showToast,testControl,scene:sceneFor(gameState)};
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
