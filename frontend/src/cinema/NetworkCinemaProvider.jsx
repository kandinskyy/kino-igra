import {useCallback,useLayoutEffect,useRef,useState} from 'react';
import {GameContext,useGame} from '../GameContext.jsx';
import {storage} from '../utils/storage.js';
import {rememberSession,roomAddress} from '../config/sessionRouting.js';

/** Presentation gate only: membership, ratings and scores remain server-authoritative. */
export default function NetworkCinemaProvider({children}) {
 const transport=useGame(),latest=useRef(transport);
 useLayoutEffect(()=>{latest.current=transport;},[transport]);
 const pending=useRef(false),generation=useRef(0);
 const real=transport.gameState;
 const [presentation,setPresentation]=useState({roomId:null,entryCommitted:false,gameEntered:false,lobby:null});
 let shown=presentation;
 if(shown.roomId!==(real?.id||null))shown={roomId:real?.id||null,entryCommitted:false,gameEntered:false,lobby:null};
 if(real?.state==='lobby'&&(shown.lobby!==real||shown.gameEntered))shown={...shown,lobby:real,gameEntered:false};
 if((real?.waitingRoom||real?.state==='waiting')&&(!shown.entryCommitted||!shown.gameEntered))shown={...shown,entryCommitted:true,gameEntered:true};
 if(shown!==presentation)setPresentation(shown);
 const {entryCommitted,gameEntered}=shown;
 const cancelRoom=useCallback(()=>{
  generation.current++;
  // Escape only abandons an entry that has not crossed the threshold.
  if(pending.current){pending.current=false;latest.current.leaveGame();latest.current.reconnect();}
 },[]);
 const prepareRoom=useCallback(async(nickname,code='')=>{
  const source=latest.current;
  if(pending.current)return {success:false,message:'Подключение уже выполняется'};
  if(!source.isConnected||!source.socket?.connected)return {success:false,message:'Подождите подключения к серверу'};
  const name=typeof nickname==='string'?nickname.trim():'';
  if(!name||name.length>15)return {success:false,message:'Имя должно содержать от 1 до 15 символов'};
  if(code&&!/^[A-Z0-9]{6}$/.test(code))return {success:false,message:'Код — 6 латинских букв или цифр'};
  const ticket=++generation.current;pending.current=true;let createdRoom=false;
  try {
   let lobbyId=code;
   if(!lobbyId){
    const created=await source.socket.timeout(10000).emitWithAck('create_lobby',{targetVP:10});
    if(!created?.success)throw Error(created?.message||'Не удалось создать комнату');
    lobbyId=created.lobbyId;createdRoom=true;
   }
   if(ticket!==generation.current)return {success:false,message:'Подключение отменено'};
   const joined=await source.socket.timeout(10000).emitWithAck('join_lobby',{
    lobbyId,nickname:name,sessionToken:storage.getItem('kino_token_'+lobbyId),
   });
   if(!joined?.success)throw Error(joined?.message||'Не удалось войти в комнату');
   if(ticket!==generation.current){source.socket.emit('leave_lobby',{lobbyId});return {success:false,message:'Подключение отменено'};}
   rememberSession(storage,lobbyId,joined.player);
   history.replaceState(null,'',roomAddress(location.href,lobbyId));
   source.setPlayer(joined.player);source.setGameState(joined.lobby);
   return {success:true};
  } catch(error) {
   if(ticket===generation.current){
    pending.current=false;
    // An interrupted create can reserve membership before join; reconnect frees it.
    if(createdRoom)source.reconnect();
   }
   return {success:false,message:error.message==='operation has timed out'?'Сервер не ответил. Повторите попытку.':error.message};
  }
 },[]);
 const beginRestoredEntry=useCallback(()=>{pending.current=true;return {success:true};},[]);
 const commitRoom=useCallback(()=>{
  pending.current=false;
  const source=latest.current;
  if(!source.gameState||!source.player||!source.gameState.players.some(player=>player.id===source.player.id))return false;
  setPresentation(current=>({...current,entryCommitted:true}));return true;
 },[]);
 const enterGame=useCallback(async()=>{
  const source=latest.current;
  if(!source.isConnected||!source.gameState||source.gameState.host!==source.player?.id)throw Error('Начать игру может только подключённый ведущий');
  if(source.gameState.players.filter(player=>player.connected).length<2)throw Error('Ждём ещё одного игрока');
  const result=await source.socket.timeout(10000).emitWithAck('launch_game',source.gameState.id);
  if(!result?.success)throw Error(result?.message||'Не удалось начать игру');
 },[]);
 const completeGameTransition=useCallback(()=>setPresentation(current=>({...current,gameEntered:true})),[]);
 const hasMembership=Boolean(real&&transport.player);
 const waiting=Boolean(real?.waitingRoom||real?.state==='waiting');
 const gameTransitionPending=Boolean(hasMembership&&!waiting&&entryCommitted&&real.state!=='lobby'&&!gameEntered);
 const gameState=waiting?real:!hasMembership||!entryCommitted?null:gameTransitionPending?
  (shown.lobby||{...real,state:'lobby'}):real;
 return <GameContext.Provider value={{...transport,gameState,prepareRoom,commitRoom,cancelRoom,enterGame,beginRestoredEntry,
  entranceRequested:hasMembership&&!entryCommitted,gameTransitionPending,completeGameTransition,
 }}>{children}</GameContext.Provider>;
}
