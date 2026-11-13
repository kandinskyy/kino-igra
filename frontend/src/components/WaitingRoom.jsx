import {Hourglass,LogOut} from 'lucide-react';
import {useGame} from '../GameContext.jsx';
import './waiting-room.css';

export default function WaitingRoom(){
  const {leaveGame}=useGame();
  return <section className="waiting-room" aria-labelledby="waiting-room-title">
    <Hourglass className="waiting-room-icon" aria-hidden="true"/>
    <h1 id="waiting-room-title">Ожидаем начала новой игры</h1>
    <p>Вы уже в комнате. Присоединитесь к участникам следующей партии.</p>
    <button className="btn-secondary" onClick={leaveGame}><LogOut size={17} aria-hidden="true"/>Выйти из комнаты</button>
  </section>;
}
