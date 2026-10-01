import {PlaceSchema} from '../shared/schema.ts';
export class ProviderError extends Error {}
export async function jsonRequest(url,options={},signal) {
 const response=await fetch(url,{...options,signal:AbortSignal.any([signal||new AbortController().signal,AbortSignal.timeout(45000)]),redirect:'error'});
 if(!response.ok)throw new ProviderError(`服务商请求失败（HTTP ${response.status}），请检查配置或额度。`);
 const body=await response.json();return body;
}
export function createModel(config) {
 const base=new URL(config.baseUrl);if(base.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(base.hostname))throw new Error('模型地址必须使用 HTTPS');
 if(!['chat','responses'].includes(config.protocol))throw new Error('MODEL_PROTOCOL 必须为 chat 或 responses');
 return async (messages,tools,signal,maxTokens)=>{
  const headers={'content-type':'application/json',authorization:`Bearer ${config.apiKey}`};
  if(config.protocol==='responses') {
   const input=messages.flatMap(m=>m.role==='tool'?[{type:'function_call_output',call_id:m.tool_call_id,output:m.content}]:m.role==='assistant'&&m.tool_calls?[
    ...(m.content?[{role:'assistant',content:m.content}]:[]),...m.tool_calls.map(c=>({type:'function_call',call_id:c.id,name:c.function.name,arguments:c.function.arguments}))]:[{role:m.role,content:m.content}]);
   const body=await jsonRequest(`${config.baseUrl.replace(/\/$/,'')}/responses`,{method:'POST',headers,body:JSON.stringify({model:config.name,input,store:false,max_output_tokens:maxTokens,tools:tools.map(t=>({type:'function',...t.function,strict:false}))})},signal);
   return {message:{role:'assistant',content:(body.output||[]).filter(x=>x.type==='message').flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('\n'),tool_calls:(body.output||[]).filter(x=>x.type==='function_call').map(x=>({id:x.call_id,type:'function',function:{name:x.name,arguments:x.arguments}}))},usage:body.usage};
  }
  const body=await jsonRequest(`${config.baseUrl.replace(/\/$/,'')}/chat/completions`,{method:'POST',headers,body:JSON.stringify({model:config.name,messages,tools,max_completion_tokens:maxTokens})},signal);
  if(!body.choices?.[0]?.message)throw new ProviderError('模型未返回有效消息');return {message:body.choices[0].message,usage:body.usage};
 };
}
export function createTravelProvider(config) {
 const amap=async(path,params,signal)=>{
  const url=new URL(`https://restapi.amap.com${path}`);url.search=new URLSearchParams({...params,key:config.amapKey,output:'JSON'}).toString();
  const result=await jsonRequest(url,{},signal);if(result.status!=='1')throw new ProviderError(`地点服务失败（${result.infocode||'unknown'}），请检查服务权限与额度。`);return result;
 };
 const string=x=>typeof x==='string'?x:'';
 const toPlace=(p,city)=>PlaceSchema.parse({id:p.id,name:p.name,city:string(p.cityname)||city,address:string(p.address),category:string(p.type),coordinate:p.location.split(',').map(Number),coordinateSystem:'GCJ02',sourceUrl:`https://www.amap.com/search?query=${encodeURIComponent(p.name)}&city=${encodeURIComponent(city)}`,retrievedAt:new Date().toISOString(),openingHours:string(p.business?.opentime)||string(p.business?.opentime_week)||null,ticketPrice:null,verified:true});
 return {
  async destinations(cities,signal){const values=[];for(const city of cities){const r=await amap('/v3/geocode/geo',{address:city},signal);const p=r.geocodes?.[0];if(p&&['市','城市','区县'].includes(p.level)){values.push({id:p.adcode,name:city,address:string(p.formatted_address),coordinate:p.location.split(',').map(Number),sourceUrl:`https://www.amap.com/search?query=${encodeURIComponent(city)}`,retrievedAt:new Date().toISOString()});}}return values;},
  async places(city,query,signal){const r=await amap('/v5/place/text',{keywords:query,region:city,city_limit:'true',page_size:'10',show_fields:'business'},signal);return (r.pois||[]).filter(p=>p.id&&p.location).map(p=>toPlace(p,city));},
  async facts(ids,city,signal){const values=[];for(const id of ids){const r=await amap('/v5/place/detail',{id,show_fields:'business'},signal);for(const p of r.pois||[])if(p.location)values.push(toPlace(p,city));}return values;},
  async route(from,to,mode,signal){const r=await amap(mode==='driving'?'/v3/direction/driving':'/v3/direction/walking',{origin:from.coordinate.join(','),destination:to.coordinate.join(',')},signal);const p=r.route?.paths?.[0];return {fromId:from.id,toId:to.id,mode,durationMinutes:p?Math.ceil(Number(p.duration)/60):null,distanceMeters:p?Number(p.distance):null,retrievedAt:new Date().toISOString(),source:'高德路线服务',coordinateSystem:'GCJ02'};},
  async web(query,signal){if(!config.tavilyKey)return {status:'unavailable',results:[],warning:'未配置网页检索；票价、预约和天气保持待核实。'};const r=await jsonRequest('https://api.tavily.com/search',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({api_key:config.tavilyKey,query,max_results:4,include_answer:false})},signal);return {status:'ok',results:(r.results||[]).map(x=>({title:x.title,url:x.url,content:x.content.slice(0,1500),retrievedAt:new Date().toISOString()}))};},
 };
}
