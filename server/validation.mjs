import { PlanDraftSchema } from '../shared/schema.ts';
export function validatePlan(input,brief,places,lockedIds=[],previous=null,routes=[],scopeDays=[]) {
 const parsed=PlanDraftSchema.safeParse(input);if(!parsed.success)return {errors:['行程数据格式无效'],warnings:[]};
 const plan=parsed.data,errors=[],warnings=[];const ids=new Set(),facts=new Map(places.map(p=>[p.id,p]));
 if(plan.days.length!==brief.days)errors.push('行程天数与需求不一致');
 if(brief.destination&&plan.destination!==brief.destination)errors.push('目的地与已确认需求不一致');
 plan.days.forEach((day,index)=>{if(day.day!==index+1)errors.push('天数必须连续');let end=0;
  day.stops.forEach((stop,i)=>{const place=facts.get(stop.placeId);if(!place)errors.push(`地点 ${stop.placeId} 没有查询证据`);
   if(ids.has(stop.placeId))errors.push('地点重复安排');ids.add(stop.placeId);
   const [h,m]=stop.startTime.split(':').map(Number),start=h*60+m;
   const route=i?routes.find(r=>r.fromId===day.stops[i-1].placeId&&r.toId===stop.placeId):null;
   if(start<end+(route?.durationMinutes||0))errors.push(`第 ${day.day} 天时间或交通冲突`);
   end=start+stop.durationMinutes;if(end>1440)errors.push('活动超出当天');
   if(!place?.openingHours)warnings.push(`${place?.name||stop.placeId}开放时间待核实`);
   if(i&&!route?.durationMinutes)warnings.push(`第 ${day.day} 天相邻地点交通时间待查询`);
  });if(day.stops.length===0)warnings.push(`第 ${day.day} 天暂未安排活动`);
 });
 if(previous&&scopeDays.length)for(const old of previous.days)if(!scopeDays.includes(old.day)&&JSON.stringify(old)!==JSON.stringify(plan.days.find(d=>d.day===old.day)))errors.push('局部调整不能改变范围外的日期安排');
 for(const id of lockedIds){if(!ids.has(id))errors.push('不能删除锁定地点');if(previous){const old=previous.days.find(d=>d.stops.some(s=>s.placeId===id));const next=plan.days.find(d=>d.stops.some(s=>s.placeId===id));const a=old?.stops.find(s=>s.placeId===id),b=next?.stops.find(s=>s.placeId===id);if(old?.day!==next?.day||JSON.stringify(a)!==JSON.stringify(b))errors.push('不能改变锁定安排的日期、时间或内容');}}
 if(brief.budget!==null)warnings.push('预算仅作为规划偏好；当前没有完整票价及住宿证据，尚不能确认总费用符合预算。');
 return {errors:[...new Set(errors)],warnings:[...new Set(warnings)]};
}
export function planDiff(previous,next,places) {
 const names=new Map(places.map(p=>[p.id,p.name])); const locations=p=>new Map(p?.days.flatMap(d=>d.stops.map(s=>[s.placeId,{day:d.day,...s}]))||[]);
 const a=locations(previous),b=locations(next),diff=[];
 for(const [id,old] of a){if(!b.has(id))diff.push(`移除 ${names.get(id)||id}`);else if(JSON.stringify(old)!==JSON.stringify(b.get(id)))diff.push(`调整 ${names.get(id)||id}：第${old.day}天 ${old.startTime} → 第${b.get(id).day}天 ${b.get(id).startTime}`);}
 for(const [id,stop] of b)if(!a.has(id))diff.push(`新增 ${names.get(id)||id} · 第${stop.day}天 ${stop.startTime}`);
 if(previous?.summary!==next.summary)diff.push('更新行程说明');return diff;
}
