// Local developer rehearsal. Never mounted by the production HTTP server.
const K = require('./kinonames');
const catalog = require('../shared/kinonames/catalog.json').records;
const clone = value => structuredClone(value);
const PRESETS = Object.freeze({coop:'Одиночный',competitive:'Многопользовательский',traitors:'С предателями'});

function createDemo({now = Date.now(),mode='competitive'} = {}) {
  let settings,players,assignments;
  let frames=[],cursor=0,current,paused=true,revision=0,lastReal=null,elapsed=0;
  function configure(next) {
    settings=K.normalizeSettings(next);
    const ids=settings.variant==='coop'?['blue-leader','blue-1','blue-2']:['blue-leader','red-leader','blue-1','red-1','blue-2','red-2',...(settings.competitive.traitors?['blue-3','red-3']:[])];
    const names={'blue-leader':'Саша','red-leader':'Катя','blue-1':'Маша','red-1':'Дима','blue-2':'Лёша','red-2':'Аня','blue-3':'Оля','red-3':'Илья'};
    const colors=['#a2adff','#e7a4b8','#a8e6c1','#7dd3fc','#f7c978','#c4b5fd','#82c8b2','#eda9ba'];
    players=ids.map((id,i)=>({id,nickname:names[id],connected:true,color:colors[i],emoji:'🌧️',vp:0}));
    assignments=K.defaultAssignments(players,settings,{});
  }
  function preset(name) {
    if(!Object.hasOwn(PRESETS,name))throw Error('Выберите одиночный, многопользовательский режим или предателей');
    return K.normalizeSettings({variant:name==='coop'?'coop':'competitive',competitive:{clueSeconds:60,guessSeconds:60,traitors:name==='traitors'}});
  }
  const modeName=()=>settings.variant==='coop'?'coop':settings.competitive.traitors?'traitors':'competitive';
  const labelForResult=game=>game.result?.winner==='blue'?'Победа синей команды · партия завершена':game.result?.winner==='red'?'Победа красной команды · партия завершена':'Партия завершена';
  function nextFrame(frame) {
    const f=clone(frame);f.clock+=1500;
    if(f.scene==='home'){f.scene='lobby';f.assignments=clone(assignments);f.label=`Фойе · ${PRESETS[modeName()]}`;return f;}
    if(f.scene==='lobby'){
      f.scene='game';f.game=K.startGame({players,settings,assignments:f.assignments,catalog,now:f.clock});
      // The rehearsal starts with blue. Real matches retain the server's random first team.
      f.game.activeTeam='blue';f.label=settings.variant==='coop'?'Начало совместной партии':'Начало партии · минута синему ведущему';return f;
    }
    const game=f.game;if(game.phase==='finished')return null;
    const action=(id,a)=>K.act(game,id,{...a,gameId:game.gameId,turnId:game.turnId},players,f.clock);
    if(game.phase==='ready'){
      const next=players.find(p=>!game.readyIds.includes(p.id));
      if(next){action(next.id,{type:'ready'});f.label=game.phase==='ready'?`${next.nickname}: готов к новой партии`:'Все готовы · новая партия начинается';return f;}
    }
    const before=`${game.turnId}:${game.phase}:${game.board.filter(c=>c.revealed).length}`;
    K.tick(game,players,f.clock);
    if(game.leaderGrace){f.clock=game.leaderGrace.deadline;K.tick(game,players,f.clock);f.label='Восстановление ведущего · игра продолжается';return f;}
    if(before!==`${game.turnId}:${game.phase}:${game.board.filter(c=>c.revealed).length}`){f.label=game.phase==='finished'?labelForResult(game):game.phase==='clue'?'Время хода истекло · очередь другой команды':'Карточка подтверждена';return f;}
    const leader=players.find(p=>game.roles[p.id].leader&&game.roles[p.id].team===game.activeTeam);
    if(game.phase==='clue'){
      action(leader.id,{type:'clue',word:game.activeTeam==='blue'?'Сила':'Легенда',count:Math.min(3,game.board.filter(c=>c.color===game.activeTeam&&!c.revealed).length)});
      f.label=`${leader.nickname}: подсказка · ${settings.variant==='coop'?'угадываем без таймера':'минута угадывающим'}`;return f;
    }
    if(game.confirmation){
      f.clock=game.confirmation.deadline;const name=game.board.find(c=>c.id===game.confirmation.cardId).name;K.tick(game,players,f.clock);
      f.label=game.phase==='finished'?labelForResult(game):`Открыта карточка: ${name}`;return f;
    }
    const coop=game.settings.variant==='coop';
    const open=c=>game.board.some(card=>card.color===c&&card.revealed);
    if(coop&&game.board.filter(c=>c.color==='blue'&&c.revealed).length===3&&game.history.length===1&&game.remainingClues>0){
      const guesser=players.find(p=>!game.roles[p.id].leader);action(guesser.id,{type:'request_clue'});f.label='Команда запросила новую подсказку';return f;
    }
    const color=coop?(game.lives>1&&!open('black')&&game.board.some(c=>c.color==='black')?'black':!open('neutral')&&game.board.some(c=>c.color==='neutral')?'neutral':'blue'):
      game.turnId===1?'neutral':game.turnId===2?(open('red')?'neutral':'red'):game.activeTeam;
    const chosen=Object.values(game.votes)[0];
    const target=game.board.find(c=>c.id===chosen&&!c.revealed)||game.board.find(c=>c.color===color&&!c.revealed)||game.board.find(c=>c.color===game.activeTeam&&!c.revealed);
    const voter=players.find(p=>game.roles[p.id].team===game.activeTeam&&!game.roles[p.id].leader&&game.votes[p.id]!==target?.id);
    if(!voter||!target)throw Error('Некорректный шаг тестовой партии');
    action(voter.id,{type:'vote',cardId:target.id});f.label=game.confirmation?'Единогласие · подтверждение 3 секунды':`${voter.nickname}: голос за «${target.name}»`;return f;
  }
  function buildFrom(frame){const result=[clone(frame)];while(result.length<220){const next=nextFrame(result.at(-1));if(!next)break;result.push(next);}return result;}
  function reset(scene='home'){
    const home={scene:'home',clock:now,game:null,assignments:clone(assignments),label:'Главное меню · дождливый кинотеатр'};
    frames=buildFrom(home);cursor=scene==='lobby'?1:0;current=clone(frames[cursor]);paused=true;revision++;elapsed=0;lastReal=null;
  }
  function load(index,seek=false){cursor=Math.max(0,Math.min(frames.length-1,index));current=clone(frames[cursor]);elapsed=0;if(seek)revision++;if(cursor===frames.length-1)paused=true;}
  function branch(label){current.label=label;const future=buildFrom(current);frames=[...frames.slice(0,cursor),...future];current=clone(frames[cursor]);elapsed=0;}
  function advance(ms){current.clock+=ms;if(current.game&&current.game.phase!=='finished')K.tick(current.game,players,current.clock);}
  function newParty(){
    if(current.game?.phase!=='finished')throw Error('Сначала завершите текущую партию');
    const nextAssignments=K.defaultAssignments(players,settings,{},Math.random);
    current={scene:'game',clock:current.clock+1500,assignments:nextAssignments,game:K.startGame({players,settings,assignments:nextAssignments,catalog,now:current.clock+1500,ready:true}),label:'Новая партия · команды перемешаны, ждём готовности'};
    cursor=frames.length;frames.push(clone(current));branch(current.label);paused=true;revision++;
  }
  function pulse(realNow=Date.now()){
    if(lastReal===null){lastReal=realNow;return;}
    const delta=Math.max(0,Math.min(1000,realNow-lastReal));lastReal=realNow;if(paused)return;
    advance(delta);elapsed+=delta;
    const entrance=current.scene==='lobby'||(current.scene==='game'&&frames[cursor-1]?.scene==='lobby');
    const dwell=entrance?5500:frames[cursor]?.game?.confirmation?3000:1500;
    if(elapsed>=dwell&&cursor<frames.length-1)load(cursor+1);
  }
  function act(view,event,data={}){
    const id=view==='player'?'blue-1':'blue-leader';
    if(event==='launch_game'){if(id!=='blue-leader')throw Error('Начать игру может только хост');if(current.scene!=='lobby')throw Error('Сначала откройте фойе');K.validateStart(players,settings,current.assignments);load(cursor+1);return;}
    if(event==='restart_game'){if(id!=='blue-leader')throw Error('Новую партию запускает хост');newParty();return;}
    if(event==='leave_lobby'){load(0,true);return;}
    if(event==='kinonames_action'){if(!current.game)throw Error('Партия ещё не началась');K.act(current.game,id,data.action,players,current.clock);branch('Действие пользователя');return;}
    if(event==='kinonames_settings'){
      if(current.scene!=='lobby')throw Error('Настройки доступны в фойе');if(id!=='blue-leader')throw Error('Настройки меняет создатель комнаты');
      configure(K.normalizeSettings(data.settings));reset('lobby');return;
    }
    if(event==='kinonames_assign'){
      const {team,leader}=data;
      if(current.game){K.changeRole(current.game,id,team,leader,players,current.clock);branch('Роль участника изменена');return;}
      if(current.scene!=='lobby')throw Error('Сначала откройте фойе');
      if(!['blue','red'].includes(team)||typeof leader!=='boolean'||(settings.variant==='coop'&&team!=='blue'))throw Error('Выберите допустимую команду и роль');
      if(leader&&Object.entries(current.assignments).some(([pid,r])=>pid!==id&&r.team===team&&r.leader))throw Error('В этой команде уже есть ведущий');
      current.assignments[id]={team,leader};
      // An incomplete roster is still valid to show in the lobby; retain future only when playable.
      try{K.validateStart(players,settings,current.assignments);branch('Состав команд обновлён');}catch{current.label='Выберите ведущего в каждой команде';frames=frames.slice(0,cursor+1);frames[cursor]=clone(current);}
      return;
    }
    if(event==='update_target_vp')throw Error('Этот прототип предназначен для Kinonames; разновидность выбирается в тест-панели');
    if(event==='send_chat_message')return;
    throw Error('Это действие недоступно в тестовом просмотре');
  }
  function command(view,request={}){
    const type=request.command;
    if(type==='mode'){configure(preset(request.mode));reset();}
    else if(type==='new_party'){newParty();}
    else if(type==='next'){if(cursor<frames.length-1)load(cursor+1);}
    else if(type==='back'){paused=true;load(cursor-1,true);}
    else if(type==='first'){paused=true;load(0,true);}
    else if(type==='last'){paused=true;load(frames.length-1,true);}
    else if(type==='seek'){if(!Number.isInteger(request.index))throw Error('Укажите номер шага');paused=true;load(request.index,true);}
    else if(type==='play'){if(cursor===frames.length-1)load(0,true);paused=false;lastReal=Date.now();}
    else if(type==='pause'){paused=true;}
    else if(type==='advance'){if(!Number.isInteger(request.ms)||request.ms<0||request.ms>60000)throw Error('Допустима перемотка от 0 до 60000 мс');advance(request.ms);branch('Время перемотано вручную');}
    else if(type==='create'){if(current.scene==='home'){load(1);branch(`Фойе · ${PRESETS[modeName()]}`);}}
    else if(type==='start'){if(current.scene==='home')load(1);if(current.scene==='lobby'){K.validateStart(players,settings,current.assignments);load(cursor+1);}}
    else if(type==='action')act(view,request.event,request.data);
    else throw Error('Неизвестная команда тестового просмотра');
    return snapshot(view);
  }
  function snapshot(view='leader'){
    const id=view==='player'?'blue-1':'blue-leader';
    const game=current.game?{...K.publicView(current.game,id,players),serverNow:current.clock}:null;
    const publicAssignments=game?.assignments||current.assignments;
    const lobby=current.scene==='home'?null:{id:'KINO42',host:'blue-leader',creatorId:'blue-leader',mode:'kinonames',state:current.scene==='lobby'?'lobby':game.phase==='finished'?'game_over':'kinonames',players:clone(players),targetVP:10,categories:['superheroes'],allColors:[],chat:[],roundId:game?.gameId||0,kinonames:{creatorId:'blue-leader',settings:clone(settings),assignments:clone(publicAssignments),game},demoPaused:paused,demoRevision:revision};
    return {success:true,lobby,player:clone(players.find(p=>p.id===id)),revision,serverNow:current.clock,controls:{cursor,length:frames.length,paused,label:current.label,clock:current.clock,mode:modeName(),canRestart:current.game?.phase==='finished',steps:frames.map(f=>({label:f.label,scene:f.scene}))}};
  }
  configure(preset(mode));reset();return {snapshot,command,pulse};
}
module.exports={createDemo};
