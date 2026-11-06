// Run on the VPS after certbot has installed the certificate for both hostnames.
const fs = require('node:fs');
const https = require('node:https');
const assert = require('node:assert/strict');
const {createRequire} = require('node:module');
const {execFileSync} = require('node:child_process');
const {io} = createRequire('/opt/overrated/app/frontend/package.json')('socket.io-client');
const config = '/etc/nginx/sites-available/overrated';
let text = fs.readFileSync(config,'utf8');
if (!text.includes('# Canonical www redirect')) {
  assert.ok(text.includes('listen 443 ssl;'), 'certbot must install HTTPS first');
  fs.copyFileSync(config,config+'.before-canonical');
  text = text.replace('server_name overratedkino.ru www.overratedkino.ru;', 'server_name overratedkino.ru;')
    .replaceAll('return 301 https://$host$request_uri;', 'return 301 https://overratedkino.ru$request_uri;');
  text += `\n# Canonical www redirect\nserver {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name www.overratedkino.ru;
    ssl_certificate /etc/letsencrypt/live/overratedkino.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/overratedkino.ru/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    return 301 https://overratedkino.ru$request_uri;
}\n`;
  fs.writeFileSync(config,text);
  try {execFileSync('nginx',['-t'],{stdio:'inherit'});}
  catch(error) {fs.copyFileSync(config+'.before-canonical',config);throw error;}
  execFileSync('systemctl',['reload','nginx']);
}
// Preserve real hostnames and certificate verification, resolving only this
// diagnostic agent to loopback so old recursive DNS caches cannot mask the VPS.
const agent = new https.Agent({lookup: (_host, options, callback) => options.all
  ? callback(null,[{address:'127.0.0.1',family:4}]) : callback(null,'127.0.0.1',4)});
function get(url) {
  return new Promise((resolve,reject)=>{
    https.get(url,{agent},response=>{
      let body=''; response.on('data',b=>body+=b); response.on('end',()=>resolve({response,body}));
    }).on('error',reject);
  });
}
async function socket(transports) {
  const s=io('https://overratedkino.ru',{agent,transports,reconnection:false,
    extraHeaders:{Origin:'https://overratedkino.ru'}});
  try {
    await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(Error('TLS socket timeout')),10000);
      s.once('connect',()=>{clearTimeout(timer);resolve();});
      s.once('connect_error',e=>{clearTimeout(timer);reject(e);});
    });
  } finally {s.close();}
}
(async()=>{
  let health;
  for(let i=0;i<20;i++) {
    health=await get('https://overratedkino.ru/api/health');
    const www=await get('https://www.overratedkino.ru/api/health');
    if(www.response.statusCode===301) break;
    await new Promise(r=>setTimeout(r,250));
  }
  assert.equal(health.response.statusCode,200);
  assert.equal(JSON.parse(health.body).status,'ok');
  const www=await get('https://www.overratedkino.ru/?room=CHECK');
  assert.equal(www.response.statusCode,301);
  assert.equal(www.response.headers.location,'https://overratedkino.ru/?room=CHECK');
  await socket(['websocket']); await socket(['polling']);
  execFileSync('systemctl',['is-active','overrated','nginx'],{stdio:'inherit'});
  execFileSync('systemctl',['is-enabled','overrated','nginx','certbot.timer'],{stdio:'inherit'});
  console.log('TLS certificate validation, canonical redirect, WebSocket and polling: PASS');
  console.log('FIRSTBYTE_TLS_PASS');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
