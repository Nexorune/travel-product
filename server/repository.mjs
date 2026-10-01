import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';import { dirname } from 'node:path';import { randomUUID } from 'node:crypto';import {validatePlan} from './validation.mjs';
export class Repository {
 constructor(path){if(path!==':memory:')mkdirSync(dirname(path),{recursive:true});this.db=new DatabaseSync(path);this.db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS records (kind TEXT, id TEXT, owner TEXT, value TEXT, PRIMARY KEY(kind,id));');this.db.prepare("UPDATE records SET value=json_set(value,'$.status','failed','$.error','服务已重启，请重新发起规划。') WHERE kind='run' AND json_extract(value,'$.status') IN ('queued','running')").run();}
 put(kind,id,owner,value){this.db.prepare('INSERT INTO records VALUES(?,?,?,?) ON CONFLICT(kind,id) DO UPDATE SET value=excluded.value WHERE records.owner=excluded.owner').run(kind,id,owner,JSON.stringify(value));}
 get(kind,id,owner){const row=this.db.prepare('SELECT value FROM records WHERE kind=? AND id=? AND owner=?').get(kind,id,owner);return row?JSON.parse(row.value):null;}
 list(kind,owner){return this.db.prepare('SELECT value FROM records WHERE kind=? AND owner=? ORDER BY rowid DESC LIMIT 100').all(kind,owner).map(r=>JSON.parse(r.value));}
 apply(runId,owner,revision,confirmationId){this.db.exec('BEGIN IMMEDIATE');try{
  const run=this.get('run',runId,owner);if(!run)throw Object.assign(new Error('规划不存在'),{status:404});
  if(run.status==='committed'){const prior=this.get('trip',run.tripId,owner);this.db.exec('COMMIT');return prior;}
  if(!['ready','ready_partial'].includes(run.status)||run.proposal?.kind!=='itinerary')throw Object.assign(new Error('当前没有可应用的行程'),{status:409});
  if(confirmationId!==run.confirmationId)throw Object.assign(new Error('请确认当前修改提案'),{status:409});
  const current=this.get('trip',run.tripId,owner);if((current?.revision||0)!==revision||run.baseRevision!==revision)throw Object.assign(new Error('行程已改变，请基于最新版本重新规划'),{status:409});
  if(current)this.put('snapshot',randomUUID(),owner,current);
  const trip={id:run.tripId,revision:revision+1,brief:run.brief,plan:run.proposal.plan,places:run.places,lockedIds:current?.lockedIds||[],dataMode:'live',updatedAt:new Date().toISOString()};
  this.put('trip',trip.id,owner,trip);this.put('run',runId,owner,{...run,status:'committed'});this.db.exec('COMMIT');return trip;
 }catch(e){this.db.exec('ROLLBACK');throw e;}}
 edit(trip,owner,baseRevision){this.db.exec('BEGIN IMMEDIATE');try{const current=this.get('trip',trip.id,owner);if(!current)throw Object.assign(new Error('行程不存在'),{status:404});if(current.revision!==baseRevision)throw Object.assign(new Error('行程版本冲突，请刷新'),{status:409});this.put('snapshot',randomUUID(),owner,current);const next={...trip,revision:baseRevision+1,updatedAt:new Date().toISOString()};this.put('trip',trip.id,owner,next);this.db.exec('COMMIT');return next;}catch(e){this.db.exec('ROLLBACK');throw e;}}
 undo(id,owner,revision){const current=this.get('trip',id,owner);if(!current)throw Object.assign(new Error('行程不存在'),{status:404});const old=this.list('snapshot',owner).find(x=>x.id===id&&x.revision<revision);if(!old)throw Object.assign(new Error('没有可恢复的版本'),{status:409});const check=validatePlan(old.plan,current.brief,old.places,current.lockedIds,current.plan);if(check.errors.length)throw Object.assign(new Error('当前锁定安排不能撤销，请先解锁对应地点'),{status:409});return this.edit({...old,lockedIds:current.lockedIds},owner,revision);}
 deleteAll(owner){this.db.prepare('DELETE FROM records WHERE owner=?').run(owner);}
 close(){this.db.close();}
}
