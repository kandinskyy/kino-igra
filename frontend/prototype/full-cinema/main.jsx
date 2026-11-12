import {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {CloudRain} from 'lucide-react';
import {useGame} from '../../src/GameContext.jsx';
import SupportDevelopment from '../../src/components/SupportDevelopment.jsx';
import ModalDialog from '../../src/components/ModalDialog.jsx';
import GameScreen from './FullGameScreen.jsx';
import ReturnPassage from './ReturnPassage.jsx';
import CinemaChat from '../night-club/CinemaChat.jsx';
import FullProvider from './FullProvider.jsx';
import FullEntrance from './FullEntrance.jsx';
import BotAdmin from './BotAdmin.jsx';
import {prepareGameAudio} from '../../src/utils/gameAudio.js';
import '../../src/index.css';
import '../night-club/style.css';
import '../cinema-entrance/style.css';
import '../cinema-entrance/lobby-arrival.css';
import '../round-studies/study.css';
import '../round-looks/looks.css';
import '../round-studies/projector-motion.css';
import './full.css';
import './game-polish.css';

export function Cinema(){
 useEffect(prepareGameAudio,[]);
 const {gameState:g,toast}=useGame();
 const playing=g&&g.state!=='lobby';
 const scene=playing?'game':g?'lobby':'home';
 const [display,setDisplay]=useState({scene,journey:null,sequence:0});
 if(display.scene!==scene){
  const previous=display.scene,reverse=(previous==='game'&&scene!=='game')||(previous==='lobby'&&scene==='home');
  const sequence=display.sequence+1;
  setDisplay({scene,sequence,journey:reverse?{from:previous,to:scene,id:`${previous}-${scene}-${sequence}`}:null});
 }
 return <div className={`full-cinema round-study round-looks look-light motion-studies`} data-scene={scene}>
  {playing?<div className={`study-run study-game ${g.state==='reveal'?'study-revealed':''} ${g.allVoted&&g.state==='round_start'?'scene-ready':''}`}>
   <header className="study-masthead"><div className="study-brand"><CloudRain/><div><strong>OVERRATEDKINO</strong><span>Зал {g.id}</span></div></div><SupportDevelopment/></header>
   <main className="projection-screen"><div key={g.roundId} className="projection-content"><GameScreen settledRevealTitle="Раунд завершён"/></div></main><CinemaChat/><ModalDialog/>
  </div>:<FullEntrance/>}
  <BotAdmin/>
  {scene==='lobby'&&g.players.length<2&&<p className="full-test-hint">Добавь игроков через «Тест-панель», чтобы начать игру.</p>}
  {toast&&<div className={`study-toast ${toast.type}`} role="status">{toast.message}</div>}
  {display.journey&&<ReturnPassage key={display.journey.id} from={display.journey.from} to={display.journey.to} onComplete={()=>setDisplay(current=>({...current,journey:null}))}/>}
 </div>;
}
const root=createRoot(document.getElementById('root'));root.render(<FullProvider><Cinema/></FullProvider>);
if(import.meta.hot)import.meta.hot.dispose(()=>root.unmount());
