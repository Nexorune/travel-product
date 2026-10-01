export function loadConfig(env=process.env) {
 const integer=(key,def,min,max)=>Math.min(max,Math.max(min,Number(env[key])||def));
 return {port:integer('PORT',17887,1,65535),host:env.HOST||'127.0.0.1',
  model:{baseUrl:env.MODEL_BASE_URL||'https://api.openai.com/v1',apiKey:env.MODEL_API_KEY||'',name:env.MODEL_NAME||'',protocol:env.MODEL_PROTOCOL||'chat'},
  amapKey:env.AMAP_WEB_KEY||'',tavilyKey:env.TAVILY_API_KEY||'',
  database:env.DATABASE_PATH||'data/travel.sqlite',origin:env.APP_ORIGIN||'',
  maxSteps:integer('AGENT_MAX_STEPS',12,2,30),maxCalls:integer('AGENT_MAX_TOOL_CALLS',32,3,80),
  runTimeout:integer('AGENT_TIMEOUT_MS',180000,1000,600000),maxTokens:integer('AGENT_MAX_OUTPUT_TOKENS',4000,256,16000),
  concurrency:integer('MAX_CONCURRENT_RUNS',2,1,10),secureCookie:env.COOKIE_SECURE==='true'};
}
export function readiness(config) {
 const missing=[];if(!config.model.apiKey)missing.push('MODEL_API_KEY');if(!config.model.name)missing.push('MODEL_NAME');if(!config.amapKey)missing.push('AMAP_WEB_KEY');
 return {ready:missing.length===0,missing,modelConfigured:Boolean(config.model.apiKey&&config.model.name),placesConfigured:Boolean(config.amapKey),searchConfigured:Boolean(config.tavilyKey),coverage:'中国大陆地点查询（具体覆盖取决于服务商）'};
}
