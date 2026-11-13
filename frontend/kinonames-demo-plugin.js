import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);

/** Development only. No demo endpoint or secret rehearsal data enters builds. */
export function kinonamesDemoPlugin(){
  return {name:'kinonames-local-rehearsal',apply:'serve',configureServer(server){
    const {createDemo}=require('../backend/kinonames-demo.cjs');
    const demo=createDemo();
    const timer=setInterval(()=>demo.pulse(),100);timer.unref();
    server.httpServer?.once('close',()=>clearInterval(timer));
    server.middlewares.use('/__kinonames-demo',async(req,res)=>{
      res.setHeader('Content-Type','application/json; charset=utf-8');
      res.setHeader('Cache-Control','no-store');
      const respond=(status,data)=>{res.statusCode=status;res.end(JSON.stringify(data));};
      const host=req.headers.host||'';
      if(!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host))return respond(403,{success:false,message:'Тест-панель доступна только локально'});
      if(req.headers.origin&&req.headers.origin!==`http://${host}`)return respond(403,{success:false,message:'Недопустимый источник запроса'});
      const view=new URL(req.url,'http://localhost').searchParams.get('view')==='player'?'player':'leader';
      try {
        if(req.method==='GET')return respond(200,demo.snapshot(view));
        if(req.method!=='POST'||req.headers['x-kinonames-demo']!=='1')return respond(403,{success:false,message:'Используйте локальную тест-панель'});
        let body='';
        for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>8192)return respond(413,{success:false,message:'Слишком большой запрос'});}
        respond(200,demo.command(view,JSON.parse(body||'{}')));
      }catch(error){respond(400,{success:false,message:error.message});}
    });
  }};
}
