import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import postcss from 'postcss';

const styles=[
 'night-club/style.css','cinema-entrance/style.css','cinema-entrance/lobby-arrival.css',
 'round-studies/study.css','round-looks/looks.css','round-studies/projector-motion.css',
 'full-cinema/full.css','full-cinema/game-polish.css',
];
const assets=[
 'cinema-entrance/assets/cinema-clean.png',
 'cinema-entrance/assets/entrance-door-restored-v3.png',
 'cinema-entrance/assets/cinema-ticket-vestibule.png',
 'cinema-entrance/assets/lobby-door-restored.png',
 'cinema-entrance/assets/lobby-auditorium-seats-v2.png',
 'night-club/assets/cinema-foyer.png','night-club/assets/Oswald.ttf',
 'full-cinema/assets/spiral-portal.png',
];
const source=path=>fileURLToPath(new URL(`./prototype/${path}`,import.meta.url));

// Keep the approved desktop styles out of the existing mobile interface.
export function cinemaBuild(){
 return {
  name:'cinema-production-assets',
  resolveId(id){if(id==='virtual:cinema.css')return '\0cinema.css';},
  load(id){
   if(id!=='\0cinema.css')return;
   return styles.map(path=>{
    this.addWatchFile(source(path));
    const sheet=postcss.parse(readFileSync(source(path),'utf8'));
    sheet.walkRules(rule=>{
     if(rule.parent.type==='atrule'&&/keyframes$/i.test(rule.parent.name))return;
     rule.selectors=rule.selectors.flatMap(selector=>{
      if(selector===':root'||selector==='body')return ['.full-cinema'];
      if(selector.startsWith('.full-cinema'))return [selector];
      if(/^\.(round-study|round-looks|look-light|motion-studies)(?=[\s.:#[>+~]|$)/.test(selector))return [`.full-cinema${selector}`];
      return [`:where(.full-cinema) ${selector}`];
     });
    });
    sheet.walkDecls(decl=>{if(decl.value.includes('Oswald.ttf'))decl.value="url('/prototype/night-club/assets/Oswald.ttf') format('truetype')";});
    return sheet.toString();
   }).join('\n');
  },
  generateBundle(){for(const path of assets)this.emitFile({type:'asset',fileName:`prototype/${path}`,source:readFileSync(source(path))});},
 };
}
