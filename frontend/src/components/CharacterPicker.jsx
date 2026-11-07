import {useRef, useState} from 'react';
import {Search, X, LockKeyhole, Check} from 'lucide-react';
import {emblems, robotIndex} from '../config/playerSymbols';
import {sortedIndices} from './characters/expansion/cast';
import Character from './Character';
import './CharacterPicker.css';

const order=sortedIndices(emblems);
export default function CharacterPicker({color,players,playerId,availableColors,onSave}){
  const dialog=useRef(null);
  const [draft,setDraft]=useState(color);
  const [query,setQuery]=useState('');
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');
  const current=emblems[robotIndex(color)], pending=emblems[robotIndex(draft)];
  const occupied=key=>typeof key==='string'&&players.find(p=>p.id!==playerId&&p.color?.toLowerCase()===key.toLowerCase());
  const available=new Set(availableColors.map(c=>c.hex.toLowerCase()));
  const visible=order.filter(i=>available.has(emblems[i].hex.toLowerCase())&&`${emblems[i].name} ${emblems[i].film}`.toLocaleLowerCase('ru').includes(query.trim().toLocaleLowerCase('ru')));
  async function save(){
    if(saving||!draft||occupied(draft))return;
    setSaving(true);setError('');
    try{if(draft!==color)await onSave(draft);dialog.current.close();}
    catch(e){setError(e.message||'Не удалось выбрать персонажа');}
    finally{setSaving(false);}
  }
  function identity(c){return <div className="character-choice-identity"><Character color={c.hex}/><div><strong>{c.name}</strong><span>{c.film}</span></div><i style={{background:c.color}} aria-label={`Цвет персонажа ${c.name}`}/></div>;}
  return <section className="identity-picker game-character-picker">
    <h3>Ваш персонаж и цвет</h3>
    <div className="character-choice-current">{identity(current)}<button className="btn-secondary" onClick={()=>{setDraft(color);setQuery('');setError('');dialog.current.showModal();}}>Сменить</button></div>
    <div className="character-choice-stage" style={{'--tone':current.color}} role="img" aria-label={`${current.name} в полный рост`}><Character color={color} full/></div>
    <dialog ref={dialog} className="character-choice-dialog" aria-labelledby="character-choice-title" onCancel={e=>{if(saving)e.preventDefault();}} onClick={e=>{if(e.target===dialog.current&&!saving)dialog.current.close();}}>
      <header><div><h2 id="character-choice-title">Выберите персонажа</h2><p>Персонаж определяет цвет вашего имени</p></div><button aria-label="Закрыть выбор персонажа" disabled={saving} onClick={()=>dialog.current.close()}><X size={21}/></button></header>
      <label className="character-choice-search"><Search size={20}/><input aria-label="Поиск персонажа" placeholder="Персонаж или фильм" value={query} onChange={e=>setQuery(e.target.value)}/></label>
      <div className="character-choice-body"><div className="character-choice-grid">{visible.map(i=>{const c=emblems[i],taken=occupied(c.hex);return <button type="button" key={c.hex} className={draft===c.hex?'chosen':''} style={{'--tone':c.color}} disabled={!!taken||saving} title={`${c.name} · ${c.film}${taken?` — занят: ${taken.nickname}`:''}`} aria-label={`${c.name}${taken?' — занят':''}`} aria-pressed={draft===c.hex} onClick={()=>{setDraft(c.hex);setError('');}}><Character index={i}/>{taken&&<LockKeyhole className="character-choice-lock" size={13}/>} {draft===c.hex&&<Check className="character-choice-check" size={15}/>}</button>;})}{!visible.length&&<p className="character-choice-empty">Ничего не найдено</p>}</div>
      <div className="character-choice-preview" aria-label={`${pending.name}: победная анимация`}><Character color={draft} full celebrate/></div></div>
      <footer>{identity(pending)}<button className="btn-primary" disabled={saving||!!occupied(draft)} onClick={save}>{saving?'Сохраняем…':'Выбрать'}</button></footer>
      {error&&<p className="character-choice-error" role="alert">{error}</p>}
    </dialog>
  </section>;
}
