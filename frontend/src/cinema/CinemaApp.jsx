import {useEffect,useState} from 'react';
import {CloudRain} from 'lucide-react';
import {useGame} from '../GameContext.jsx';
import SupportDevelopment from '../components/SupportDevelopment.jsx';
import ModalDialog from '../components/ModalDialog.jsx';
import GameScreen from '../../prototype/full-cinema/FullGameScreen.jsx';
import ReturnPassage from '../../prototype/full-cinema/ReturnPassage.jsx';
import CinemaChat from '../../prototype/night-club/CinemaChat.jsx';
import FullEntrance from '../../prototype/full-cinema/FullEntrance.jsx';
import {prepareGameAudio} from '../utils/gameAudio.js';
import 'virtual:cinema.css';
import './controls.css';
import {KinonamesScreen} from '../kinonames/KinonamesUI.jsx';
import {reverseJourney} from './sceneJourney.js';
import WaitingRoom from '../components/WaitingRoom.jsx';

export default function CinemaApp(){
 useEffect(prepareGameAudio,[]);
 const {gameState:g,toast,isConnected,connectionMessage,reconnect,gameTransitionPending}=useGame();
 const waiting=g&&(g.waitingRoom||g.state==='waiting');
 const playing=g&&!waiting&&g.state!=='lobby';
 const scene=waiting?'waiting':playing?'game':g?'lobby':'home';
 const [display,setDisplay]=useState({scene,journey:null,sequence:0});
 if(display.scene!==scene){
  const previous=display.scene,reverse=reverseJourney(previous,scene,{enteringGame:gameTransitionPending});
  const sequence=display.sequence+1;
  setDisplay({scene,sequence,journey:reverse?{from:previous,to:scene,id:`${previous}-${scene}-${sequence}`}:null});
 }
 return <div className="full-cinema round-study round-looks look-light motion-studies" data-scene={scene}>
  {waiting?<><header className="study-masthead"><div className="study-brand"><CloudRain/><div><strong>OVERRATED</strong><span>Зал {g.id}</span></div></div><SupportDevelopment/></header><WaitingRoom/><ModalDialog/></>:playing?<div className={`study-run study-game ${g.state==='reveal'?'study-revealed':''} ${g.allVoted&&g.state==='round_start'?'scene-ready':''}`}>
   <header className="study-masthead"><div className="study-brand"><CloudRain/><div><strong>OVERRATED</strong><span>Зал {g.id}</span></div></div><SupportDevelopment/></header>
   <main className="projection-screen"><div key={g.roundId} className="projection-content">{g.mode==='kinonames'?<KinonamesScreen/>:<GameScreen settledRevealTitle="Раунд завершён"/>}</div></main><CinemaChat/><ModalDialog/>
  </div>:<FullEntrance/>}
  {!isConnected&&<div className="connection-banner" role="status">{connectionMessage||'Подключаемся к игре…'} <button onClick={reconnect}>Повторить</button></div>}
  {toast&&<div className={`study-toast ${toast.type}`} role="status">{toast.message}</div>}
  {display.journey&&<ReturnPassage key={display.journey.id} from={display.journey.from} to={display.journey.to} onComplete={()=>setDisplay(current=>({...current,journey:null}))}/>}
 </div>;
}

