import {createServer} from 'node:http';import {randomUUID,randomBytes} from 'node:crypto';import {readFile,stat} from 'node:fs/promises';import {resolve,extname} from 'node:path';import {fileURLToPath} from 'node:url';
import {z} from 'zod';import {RunRequestSchema,PlanDraftSchema} from '../shared/schema.ts';import {Repository} from './repository.mjs';import {loadConfig,readiness} from './config.mjs';import {createModel,createTravelProvider} from './providers.mjs';import {runAgent} from './agent.mjs';import {validatePlan} from './validation.mjs';
export function createApplication({config=loadConfig(),repository=new Repository(config.database),model,provider}={}) {
 const active=new Map(),pending=[],jobs=new Set();let stopping=false;model ||= createModel(config.model);provider ||= createTravelProvider(config);
 const publicRun=run=>{const {owner:_owner,inputFingerprint:_fingerprint,...value}=run;return value;};
 const fail=(message,status=400)=>Object.assign(new Error(message),{status});
 const pump=()=>{while(!stopping&&active.size<config.concurrency&&pending.length){const {id,owner}=pending.shift(),run=repository.get('run',id,owner);if(!run||run.status!=='queued')continue;const controller=new AbortController();active.set(id,controller);const signal=AbortSignal.any([controller.signal,AbortSignal.timeout(config.runTimeout)]);repository.put('run',id,owner,{...run,status:'running',stage:'开始规划'});
  const job=runAgent({run,trip:run.tripId?repository.get('trip',run.tripId,owner):null,provider,model,config,signal,onProgress:async progress=>{const current=repository.get('run',id,owner);if(current&&current.status==='running')repository.put('run',id,owner,{...current,...progress,events:[...(current.events||[]),{at:new Date().toISOString(),stage:progress.stage,tool:progress.tool,step:progress.step}].slice(-100)});}}).then(result=>{const current=repository.get('run',id,owner);if(signal.aborted||!current||current.status==='cancelled')return;repository.put('run',id,owner,{...current,...result,finishedAt:new Date().toISOString()});}).catch(e=>{const current=repository.get('run',id,owner);if(current&&current.status!=='cancelled')repository.put('run',id,owner,{...current,status:'failed',error:signal.aborted?'规划超时，请缩小范围后重试。':e.message,finishedAt:new Date().toISOString()});}).finally(()=>{active.delete(id);jobs.delete(job);pump();});jobs.add(job);}};
 const server=createServer(async(req,res)=>{
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);
  const reply=(status,body)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(body));};
  try {
   if(!url.pathname.startsWith('/api/')){const root=resolve('dist'),relative=decodeURIComponent(url.pathname),file=resolve(root,'.'+relative);if(file!==root&&!file.startsWith(root+'/'))throw fail('路径无效');let path=file;try{if(!(await stat(file)).isFile())path=resolve(root,'index.html');}catch{path=resolve(root,'index.html');}const bytes=await readFile(path);res.writeHead(200,{'content-type':({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'})[extname(path)]||'application/octet-stream','x-content-type-options':'nosniff'});res.end(bytes);return;}
   if(req.method==='GET'&&url.pathname==='/api/health'){reply(200,{status:'ok',...readiness(config)});return;}
   if(!['GET','HEAD'].includes(req.method)){const origin=req.headers.origin;if(!origin)throw fail('请求缺少来源',403);const allowed=config.origin||`${config.secureCookie?'https':'http'}://${req.headers.host}`;if(origin!==allowed)throw fail('请求来源不允许',403);if(req.headers['content-type']?.split(';')[0]!=='application/json')throw fail('需要 JSON 请求',415);}
   const cookies=req.headers.cookie||'';let owner=cookies.match(/(?:^|;\s*)travel_session=([a-f0-9]{64})(?:;|$)/)?.[1];if(!owner){owner=randomBytes(32).toString('hex');res.setHeader('set-cookie',`travel_session=${owner}; HttpOnly; SameSite=Strict; Path=/; Max-Age=2592000${config.secureCookie?'; Secure':''}`);}
   let body={};if(!['GET','HEAD'].includes(req.method)){let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>100000)throw fail('请求过大',413);chunks.push(chunk);}try{body=JSON.parse(Buffer.concat(chunks).toString()||'{}');}catch{throw fail('JSON 格式无效');}}
   if(url.pathname==='/api/trips'&&req.method==='GET'){reply(200,{trips:repository.list('trip',owner)});return;}
   if(url.pathname==='/api/planning-runs'&&req.method==='POST'){
    const input=RunRequestSchema.parse(body),existing=repository.list('run',owner).find(r=>r.idempotencyKey===input.idempotencyKey);if(existing){if(existing.inputFingerprint!==JSON.stringify(input))throw fail('幂等键已用于不同请求',409);reply(200,publicRun(existing));return;}
    const ready=readiness(config);if(!ready.ready){reply(503,{error:'真实 AI 服务尚未配置。',...ready});return;}
    if(repository.list('run',owner).filter(r=>['queued','running'].includes(r.status)).length>=2)throw fail('已有规划正在进行，请先等待或取消',429);
    if(repository.list('run',owner).filter(r=>Date.now()-Date.parse(r.createdAt)<3600000).length>=20)throw fail('本小时规划次数已达上限',429);
    if(pending.length>=20)throw fail('服务繁忙，请稍后重试',429);
    let trip=null;if(input.tripId){trip=repository.get('trip',input.tripId,owner);if(!trip)throw fail('行程不存在',404);if(trip.revision!==input.baseRevision)throw fail('行程版本已更新',409);if(input.kind!=='adjust')throw fail('已有行程只允许局部调整');}
    if(input.kind==='adjust'&&!trip)throw fail('调整需要已有行程');if(input.kind==='adjust'&&(!input.scopeDays.length||input.scopeDays.some(d=>d>trip.brief.days)))throw fail('请指定有效的调整日期范围');if(input.kind==='plan'&&!input.brief.destination)throw fail('请填写目的地');
    const run={...input,brief:trip?trip.brief:input.brief,id:randomUUID(),tripId:trip?.id||randomUUID(),baseRevision:trip?.revision||0,status:'queued',stage:'等待开始',createdAt:new Date().toISOString(),confirmationId:randomUUID(),inputFingerprint:JSON.stringify(input)};repository.put('run',run.id,owner,run);pending.push({id:run.id,owner});reply(202,publicRun(run));pump();return;
   }
   const match=url.pathname.match(/^\/api\/planning-runs\/([^/]+)(?:\/(cancel|resume|apply))?$/);
   if(match){const run=repository.get('run',match[1],owner);if(!run)throw fail('规划不存在',404);
    if(req.method==='GET'&&!match[2]){reply(200,publicRun(run));return;}
    if(req.method==='POST'&&match[2]==='cancel'){if(['queued','running','needs_input'].includes(run.status)){repository.put('run',run.id,owner,{...run,status:'cancelled',stage:'已取消'});active.get(run.id)?.abort();}reply(200,publicRun(repository.get('run',run.id,owner)));return;}
    if(req.method==='POST'&&match[2]==='resume'){const {answer}=z.object({answer:z.string().trim().min(1).max(2000)}).strict().parse(body);if(run.status!=='needs_input')throw fail('当前规划无需补充',409);if(run.resumes>=3)throw fail('补充次数已达上限，请重新规划');const trip=repository.get('trip',run.tripId,owner);if(trip&&trip.revision!==run.baseRevision)throw fail('行程版本已更新，请重新规划',409);repository.put('run',run.id,owner,{...run,status:'queued',question:null,request:`${run.request}\n助手澄清：${run.question}\n用户补充：${answer}`,resumes:(run.resumes||0)+1});pending.push({id:run.id,owner});reply(202,publicRun(repository.get('run',run.id,owner)));pump();return;}
    if(req.method==='POST'&&match[2]==='apply'){const value=z.object({baseRevision:z.number().int().nonnegative(),confirmationId:z.string()}).strict().parse(body);reply(200,{trip:repository.apply(run.id,owner,value.baseRevision,value.confirmationId)});return;}
   }
   const edit=url.pathname.match(/^\/api\/trips\/([^/]+)(?:\/(undo))?$/);if(edit&&req.method==='POST'){
    const current=repository.get('trip',edit[1],owner);if(!current)throw fail('行程不存在',404);
    if(edit[2]==='undo'){const {baseRevision}=z.object({baseRevision:z.number().int().nonnegative()}).strict().parse(body);const trip=repository.undo(current.id,owner,baseRevision);reply(200,{trip});return;}
    const value=z.object({baseRevision:z.number().int().nonnegative(),plan:PlanDraftSchema,lockedIds:z.array(z.string()).max(100)}).strict().parse(body);
    const check=validatePlan(value.plan,current.brief,current.places,current.lockedIds,current.plan);if(check.errors.length)throw fail(check.errors.join('；'));
    if(value.lockedIds.some(id=>!value.plan.days.some(d=>d.stops.some(s=>s.placeId===id))))throw fail('只能锁定当前行程中的地点');
    const trip=repository.edit({...current,plan:{...value.plan,warnings:[...new Set([...value.plan.warnings,...check.warnings])]},lockedIds:value.lockedIds},owner,value.baseRevision);reply(200,{trip});return;
   }
   if(url.pathname==='/api/session'&&req.method==='DELETE'){for(const run of repository.list('run',owner))active.get(run.id)?.abort();repository.deleteAll(owner);reply(200,{deleted:true});return;}
   throw fail('接口不存在',404);
  }catch(e){reply(e.status||400,{error:e instanceof z.ZodError?'请求参数格式无效':e.code==='ENOENT'?'页面尚未构建，请先运行 npm run build。':e.message||'请求失败'});}
 });
 return {server,repository,close:async()=>{stopping=true;for(const c of active.values())c.abort();await new Promise(r=>server.close(r));await Promise.allSettled([...jobs]);repository.close();}};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const config=loadConfig(),app=createApplication({config});app.server.listen(config.port,config.host,()=>console.log(JSON.stringify({event:'server_started',host:config.host,port:config.port,...readiness(config)})));process.on('SIGTERM',()=>app.close().then(()=>process.exit()));
}
