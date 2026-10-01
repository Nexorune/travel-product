import {destinations,places,createTrip} from './data'
import {emptyBrief} from './domain'
import type {Itinerary} from './domain'
export {destinations as exampleDestinations}
export function exampleTrip(id:string,days:3|5):Itinerary{
 const city=destinations.find(d=>d.id===id)!,sample=createTrip(id,days)
 return {id:crypto.randomUUID(),revision:1,brief:{...emptyBrief,destination:city.name,days},plan:{destination:city.name,summary:city.summary,days:sample.days.map(d=>({day:d.day,title:d.title,stops:d.placeIds.map((placeId,i)=>({placeId,startTime:`${String(9+i*3).padStart(2,'0')}:00`,durationMinutes:90,note:places[placeId].reason}))})),warnings:['示例行程：地点、时间和交通尚未经过实时查询；仅供体验页面交互。']},places:city.placeIds.map(p=>({id:p,name:places[p].name,city:city.name,address:'示例资料',category:places[p].category,coordinate:[places[p].coordinate[1],places[p].coordinate[0]],coordinateSystem:'WGS84',sourceUrl:`https://www.amap.com/search?query=${encodeURIComponent(places[p].name)}`,retrievedAt:'2026-09-24',openingHours:null,ticketPrice:null,verified:false})),lockedIds:[],dataMode:'example',updatedAt:new Date().toISOString()}
}
