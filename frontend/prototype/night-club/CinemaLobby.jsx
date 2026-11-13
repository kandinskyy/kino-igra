import {useRef, useState} from 'react';
import {Copy, Crown, Pencil, UserRoundX} from 'lucide-react';
import {useGame} from '../../src/GameContext';
import {Avatar} from '../../src/components/Identity';
import CharacterPicker from '../../src/components/CharacterPicker';
import MatchSettings from '../../src/components/MatchSettings';
import {copyText} from '../../src/utils/clipboard';
import categoryOptions from '../../../shared/catalog-categories.json';
import CategoryPicker from '../../src/components/CategoryPicker.jsx';
import {KinonamesSettings, KinonamesTeams} from '../../src/kinonames/KinonamesUI.jsx';
import {defaultKinonamesSettings} from '../../src/kinonames/settings.js';

export default function CinemaLobby({onStart,startDisabled=false}){
  const {gameState:g,player,socket,leaveGame,closeLobby,showToast,showConfirm}=useGame();
  const host=g.host===player?.id, me=g.players.find(p=>p.id===player?.id)||player;
  const [busy,setBusy]=useState(false), [categories,setCategories]=useState(g.categories);
  const categoryDialog=useRef(null),rulesDialog=useRef(null);
  async function request(event,data){const r=await socket.timeout(10000).emitWithAck(event,data);if(!r.success)throw Error(r.message||'Действие недоступно');return r;}
  async function update(changes){try{await request('update_target_vp',{lobbyId:g.id,targetVP:g.targetVP,categories:g.categories,mode:g.mode,circles:g.circles,hiddenMode:g.hiddenMode,repeatRatings:g.repeatRatings,...changes});}catch(e){showToast(e.message,'error');}}
  async function invite(){try{const url=new URL(location.href);url.search='';url.searchParams.set('room',g.id);await copyText(url.href);showToast('Ссылка скопирована','success');}catch{showToast('Не удалось скопировать ссылку','error');}}
  async function manage(event,p){if(!await showConfirm(event==='kick_player'?`Исключить «${p.nickname}»?`:`Передать права ведущего игроку «${p.nickname}»?`,{title:event==='kick_player'?'Исключить игрока':'Передать права',confirmText:event==='kick_player'?'Исключить':'Передать права',isDanger:event==='kick_player'}))return;try{await request(event,{lobbyId:g.id,playerId:p.id,targetPlayerId:p.id});}catch(e){showToast(e.message,'error');}}
  async function launch(){setBusy(true);try{if(onStart)await onStart();else await request('launch_game',g.id);}catch(e){showToast(e.message,'error');}finally{setBusy(false);}}
  async function saveKinonamesSettings(settings){await request('kinonames_settings',{lobbyId:g.id,settings});}
  async function assignKinonames(changes){try{await request('kinonames_assign',{lobbyId:g.id,...changes});}catch(e){showToast(e.message,'error');}}
  const opinion=g.mode==='opinion', kinonames=g.mode==='kinonames';
  const kn={...defaultKinonamesSettings,...g.kinonames?.settings,coop:{...defaultKinonamesSettings.coop,...g.kinonames?.settings?.coop},competitive:{...defaultKinonamesSettings.competitive,...g.kinonames?.settings?.competitive}};
  const creator=(g.kinonames?.creatorId||g.creatorId||g.host)===player?.id;
  const assignments=g.kinonames?.assignments||{}, connected=g.players.filter(p=>p.connected!==false);
  const knReady=kn.variant==='coop'
    ?connected.length>=2&&connected.every(p=>assignments[p.id]?.team==='blue')&&connected.filter(p=>assignments[p.id]?.team==='blue'&&assignments[p.id]?.leader).length===1&&connected.some(p=>assignments[p.id]?.team==='blue'&&!assignments[p.id]?.leader)
    :connected.every(p=>['blue','red'].includes(assignments[p.id]?.team))&&['blue','red'].every(team=>{const members=connected.filter(p=>assignments[p.id]?.team===team);return members.length>=2&&members.filter(p=>assignments[p.id]?.leader).length===1;});
  const traitorsBlocked=kn.variant==='competitive'&&kn.competitive.traitors&&(connected.length<8||['blue','red'].some(team=>connected.filter(p=>assignments[p.id]?.team===team).length<4));
  return <main className={`cinema-lobby${kinonames?' cinema-lobby-kinonames':''}`} aria-label="Комната ожидания">
    <button className="hall-plaque" onClick={invite} title="Скопировать приглашение"><strong>ЗАЛ {g.id}<Copy aria-hidden="true"/></strong><span>Нажмите, чтобы пригласить друзей</span></button>
    <section className="arch-panel company-panel" aria-labelledby="company-title">
      <header className="arch-heading"><h1 id="company-title">Ваша компания</h1><span>{g.players.length}/16</span></header>
      {!kinonames&&<div className="cinema-players" aria-label="Игроки в комнате">{g.players.map(p=><div className={'cinema-player'+(!p.connected?' offline':'')} key={p.id}>
        <Avatar player={p}/><span className="cinema-player-name" title={p.nickname}>{p.nickname}</span>{kinonames&&assignments[p.id]?.team&&<span className={`kn-player-team kn-player-team-${assignments[p.id].team}`}>{assignments[p.id].team==='blue'?'Синяя':'Красная'}{assignments[p.id].leader?' · ведущий':''}</span>}{p.id===g.host?<Crown className="host-crown" size={13} aria-label="Ведущий"/>:<i className={'status-dot '+(p.connected?'online':'')} aria-label={p.connected?'В сети':'Не в сети'}/>}
        {host&&p.id!==player?.id&&<div className="player-hover-actions"><button aria-label={`Передать права: ${p.nickname}`} title={p.bot?'Бот не может быть ведущим':'Передать права ведущего'} disabled={!p.connected||p.bot} onClick={()=>manage('transfer_host',p)}><Crown size={15}/></button><button aria-label={`Исключить ${p.nickname}`} title="Исключить" onClick={()=>manage('kick_player',p)}><UserRoundX size={15}/></button></div>}
      </div>)}</div>}
      {kinonames?<KinonamesTeams game={g.kinonames} players={g.players} player={player} settings={kn} onAssign={assignKinonames} compact/>:<CharacterPicker color={me.color} players={g.players} playerId={player.id} availableColors={g.allColors} onSave={color=>request('change_color',{lobbyId:g.id,color})}/>}
      <footer className="company-footer"><button className="quiet-button" onClick={leaveGame}>Выйти из комнаты</button>{host&&<button className="quiet-button close-room" onClick={async()=>{if(await showConfirm('Закрыть комнату для всех участников?',{title:'Закрыть комнату',confirmText:'Закрыть комнату',isDanger:true}))closeLobby();}}>Закрыть комнату</button>}</footer>
    </section>
    <aside className="arch-panel cinema-settings" aria-labelledby="settings-title">
      <header className="arch-heading"><h2 id="settings-title">Параметры игры</h2></header>
      <div className="mode-row"><select aria-label="Режим игры" value={g.mode} disabled={!host||busy} onChange={e=>update({mode:e.target.value})}><option value="original">Оригинальный</option><option value="opinion">Мнение одного</option><option value="kinonames">Kinonames</option></select><button className="text-link" onClick={()=>rulesDialog.current.showModal()}>Правила</button></div>
      {!kinonames&&<label className="goal-row"><span>{opinion?'Количество кругов':'Очки до победы'}</span><input key={`${g.mode}-${opinion?g.circles:g.targetVP}`} aria-label={opinion?'Количество кругов':'Очки до победы'} type="number" min="1" max="999" step="1" defaultValue={opinion?g.circles:g.targetVP} disabled={!host||busy} onBlur={e=>{const n=Number(e.target.value);if(Number.isInteger(n)&&n>=1&&n<=999)update(opinion?{circles:n}:{targetVP:n});else{e.target.value=opinion?g.circles:g.targetVP;showToast('Введите целое число от 1 до 999','error');}}} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();}}/></label>}
      {kinonames?<KinonamesSettings value={kn} editable={creator&&!busy} onSave={saveKinonamesSettings} compact/>:<><div className="category-field"><span>Категории</span><div><span className="category-value category-list">{g.categories.map(id=><span key={id}>{categoryOptions.find(c=>c.id===id)?.label}</span>)}</span><button className="text-link category-edit" aria-label={host?'Изменить категории':'Посмотреть категории'} title={host?'Изменить категории':'Посмотреть категории'} onClick={()=>{setCategories([...g.categories]);categoryDialog.current.showModal();}}><Pencil size={19} aria-hidden="true"/></button></div></div>
      <label className="cinema-condition"><input type="checkbox" checked={g.hiddenMode} disabled={!host||busy} onChange={e=>update({hiddenMode:e.target.checked})}/>Скрытый режим</label>
      <label className="cinema-condition"><input type="checkbox" checked={g.repeatRatings} disabled={!host||busy} onChange={e=>update({repeatRatings:e.target.checked})}/>Любая оценка</label></>}
      {host?<button className="btn-primary launch-game" onClick={launch} disabled={busy||startDisabled||(kinonames?(!knReady||traitorsBlocked):(!onStart&&connected.length<2))}>{busy?'Открываем зал…':'Начать игру'}</button>:<p className="waiting-note">Ведущий скоро начнёт игру</p>}
      {kinonames&&!knReady&&<p className="lobby-help">Состав команды ещё не готов</p>}{traitorsBlocked&&<p className="lobby-help">Проверьте требования к числу игроков в командах</p>}
      {!kinonames&&g.players.length<2&&!onStart&&<p className="lobby-help">Ждём ещё одного игрока</p>}
    </aside>
    <dialog ref={categoryDialog} className="app-dialog cinema-dialog" aria-labelledby="categories-title"><div className="dialog-body"><h2 id="categories-title">Категории</h2><CategoryPicker value={categories} onChange={setCategories} disabled={!host}/><div className="dialog-actions"><button className="btn-secondary" onClick={()=>categoryDialog.current.close()}>Отмена</button><button className="btn-primary" disabled={!categories.length} onClick={async()=>{if(host)await update({categories});categoryDialog.current.close();}}>Готово</button></div></div></dialog>
    <dialog ref={rulesDialog} className="app-dialog cinema-dialog" aria-labelledby="rules-title"><div className="dialog-body"><h2 id="rules-title">Правила режима</h2>{kinonames?<><p><strong>Kinonames</strong> — игра в угадывание персонажей по подсказкам. Ведущий даёт одно слово и число. Угадывающие выбирают карточки голосованием; карточка открывается, когда вся активная команда единогласно выбрала её и завершилась короткая проверка.</p>{kn.variant==='coop'?<p>Синяя команда открывает персонажей своей стороны. Чёрная карточка отнимает жизнь, нейтральная не меняет запас. Можно запросить новую подсказку, пока они остались; когда подсказки закончились, игра продолжается по предыдущим.</p>:<p>Синяя и красная команды ходят по очереди. Верная карточка продолжает ход и добавляет время. Карточка соперника или нейтральная завершает ход, чёрная сразу заканчивает партию. При включённом предателе в каждой команде тайно выбран один игрок.</p>}</>:opinion?<><p>Критик оценивает пять произведений и сохраняет оценки. Остальные угадывают их за 60 секунд. Когда все сохранят ответы, раунд завершается раньше.</p><p>За совпадение — 1 очко, за все пять — ещё 1. Критик получает по очку за каждый идеальный ответ, но если угадали все — 0. Каждый становится критиком один раз за круг.</p><p>Скрытый режим прячет чужие очки до финала и личность критика. «Любая оценка» разрешает повторять ранги.</p></>:<><p>В раунде пять произведений. Расставьте оценки S, A, B, C, D: каждую один раз. Последняя свободная оценка назначается автоматически.</p><p>За каждое совпадение с другим игроком — 1 очко. Ведущий запускает таймер и раскрывает оценки. Игра завершается после раунда, в котором достигнута цель по очкам.</p><p>Скрытый режим прячет чужие очки до финала. «Любая оценка» разрешает повторять ранги.</p></>}<button className="btn-primary full" onClick={()=>rulesDialog.current.close()}>Понятно</button>{!kinonames&&<div className="original-settings"><MatchSettings settings={g} targetVP={g.targetVP} categories={g.categories} host={host} onSave={(targetVP,categories,options)=>request('update_target_vp',{lobbyId:g.id,targetVP,categories,...options})}/></div>}</div></dialog>
  </main>;
}

