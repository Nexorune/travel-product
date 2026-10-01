import {z} from 'zod'
import {BriefSchema,TripSchema,PlanDraftSchema,PlaceSchema} from '../shared/schema'
export type Brief=z.infer<typeof BriefSchema>
export type Itinerary=z.infer<typeof TripSchema>
export type Plan=z.infer<typeof PlanDraftSchema>
export type Fact=z.infer<typeof PlaceSchema>
export type Candidate={id:string;name:string;reason:string;tradeoff:string;sourceUrl:string;retrievedAt:string}
export type Run={id:string;tripId:string;kind:'discover'|'plan'|'adjust';baseRevision:number;confirmationId:string;brief:Brief;status:'queued'|'running'|'needs_input'|'ready'|'ready_partial'|'failed'|'cancelled'|'committed';stage?:string;question?:string;error?:string;diff?:string[];places?:Fact[];routes?:Array<{fromId:string;toId:string;durationMinutes:number|null;mode:string}>;proposal?:{kind:'destinations';candidates:Candidate[]}|{kind:'itinerary';plan:Plan};usage?:{inputTokens:number;outputTokens:number}}
export type Health={ready:boolean;missing:string[];modelConfigured:boolean;placesConfigured:boolean;searchConfigured:boolean;coverage:string}
export const emptyBrief:Brief={origin:'',destination:'',days:3,startDate:'',budget:null,currency:'CNY',interests:[],pace:'松弛',companion:'一个人',request:'',constraints:''}
export async function api<T>(path:string,body?:unknown,method?:string):Promise<T>{const response=await fetch('/api'+path,{method:method||(body?'POST':'GET'),headers:body?{'content-type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});const result=await response.json();if(!response.ok)throw new Error(result.error||'服务暂时不可用');return result}
