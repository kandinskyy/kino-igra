// One-time migration: copy the curated catalog's posters from the existing origin,
// produce all three sizes locally and serve them without Render/TMDB at runtime.
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const sharp = require('/opt/overrated-tools/node_modules/sharp');
const movies = require('/opt/overrated/app/backend/movies.json');
const root = '/var/cache/overrated-posters';
const origin = 'https://kino-igra.onrender.com';
const files = [...new Set(movies.map(m => m.posterUrl))];
let next = 0, done = 0;
const failures = [];
for (const size of [185,342,500]) fs.mkdirSync(`${root}/${size}/api/poster`, {recursive:true, mode:0o755});
async function download(url) {
  for (let attempt=0; attempt<5; attempt++) {
    try {
      const response = await fetch(url, {signal:AbortSignal.timeout(30000)});
      if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw Error(`HTTP ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length>2*1024*1024) throw Error('oversized poster');
      await sharp(buffer).metadata(); return buffer;
    } catch(error) {
      if (attempt===4) {
        // curl's HTTP/2 transport can recover an interrupted origin fetch.
        const buffer = execFileSync('curl',['-4','--http2','--fail','--silent','--show-error',
          '--max-time','30',url],{maxBuffer:2*1024*1024});
        await sharp(buffer).metadata(); return buffer;
      }
      await new Promise(r=>setTimeout(r,1000*(attempt+1)));
    }
  }
}
async function worker() {
  while (next<files.length) {
    const file = files[next++];
    if (!/^\/api\/poster\/[a-zA-Z0-9_-]+\.(jpg|png|webp)$/.test(file)) {failures.push(file);continue;}
    try {
      if (![185,342,500].every(size=>fs.existsSync(root+'/'+size+file))) {
        const buffer = await download(origin+file+'?w=500');
        for (const size of [185,342,500]) {
          const output = root+'/'+size+file;
          const format = path.extname(file).slice(1);
          await sharp(buffer).resize({width:size,withoutEnlargement:true})
            .toFormat(format==='jpg'?'jpeg':format,{quality:85}).toFile(output+'.tmp');
          fs.chmodSync(output+'.tmp',0o644); fs.renameSync(output+'.tmp',output);
        }
      }
      done++; if (done%50===0) console.log(`Posters ${done}/${files.length}`);
    } catch(error) {failures.push(file); console.error('Poster failed',file,error.message);}
  }
}
(async()=>{
  await Promise.all(Array.from({length:4},worker));
  if (failures.length) throw Error(`${failures.length} posters missing; nginx unchanged`);
  const config='/etc/nginx/sites-available/overrated';
  let text=fs.readFileSync(config,'utf8');
  fs.writeFileSync('/etc/nginx/conf.d/overrated-posters.conf',
    'map $arg_w $overrated_poster_size { default ""; "" 500; 185 185; 342 342; 500 500; }\n');
  fs.writeFileSync('/etc/nginx/snippets/overrated-posters.conf',
    'location /api/poster/ {\n if ($overrated_poster_size = "") { return 400; }\n root /var/cache/overrated-posters;\n try_files /$overrated_poster_size$uri =404;\n expires 1y;\n add_header Cache-Control "public, immutable";\n add_header X-Content-Type-Options nosniff;\n}\n');
  if (!text.includes('include /etc/nginx/snippets/overrated-posters.conf;')) {
    fs.copyFileSync(config,config+'.before-posters');
    text=text.replace('    location / {','    include /etc/nginx/snippets/overrated-posters.conf;\n    location / {');
    fs.writeFileSync(config,text);
  }
  execFileSync('nginx',['-t'],{stdio:'inherit'});
  execFileSync('systemctl',['reload','nginx']);
  console.log(`POSTERS_READY ${done} images, three sizes, local nginx delivery`);
})().catch(error=>{console.error(error.message);process.exitCode=1;});
