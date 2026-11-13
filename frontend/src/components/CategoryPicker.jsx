import {useEffect,useRef} from 'react';
import categoryOptions from '../../../shared/catalog-categories.json';
import './category-picker.css';

export default function CategoryPicker({value,onChange,disabled=false}) {
  const ordinary=categoryOptions.filter(category=>!category.special);
  const special=categoryOptions.filter(category=>category.special);
  const previousOrdinary=useRef(value.filter(id=>ordinary.some(category=>category.id===id)));
  const specialActive=value.some(id=>special.some(category=>category.id===id));
  useEffect(()=>{
    if(!specialActive&&value.length)previousOrdinary.current=[...value];
  },[value,specialActive]);
  function selectSpecial(id,checked){
    if(checked){
      if(!specialActive)previousOrdinary.current=[...value];
      onChange([id]);
    }else onChange(previousOrdinary.current.length?[...previousOrdinary.current]:['films']);
  }
  return <div className="category-groups">
    <fieldset className="category-group" disabled={disabled||specialActive}>
      <legend>Обычные</legend>
      {ordinary.map(category=><label key={category.id}><input type="checkbox" checked={value.includes(category.id)} onChange={event=>onChange(event.target.checked?[...value,category.id]:value.filter(id=>id!==category.id))}/><span>{category.label}</span></label>)}
    </fieldset>
    <fieldset className="category-group" disabled={disabled}>
      <legend>Особые</legend>
      {special.map(category=><label key={category.id}><input type="checkbox" checked={value.includes(category.id)} onChange={event=>selectSpecial(category.id,event.target.checked)}/><span>{category.label}</span></label>)}
    </fieldset>
  </div>;
}
