import {deadline,localDate} from './logic.mjs';
export function dueReminders(records,today=localDate(),leadDays=3){
 const lead=Math.max(3,Math.min(30,Number(leadDays)||3));
 return records.filter(r=>r.state==='active'&&r.stock!==0&&deadline(r)).flatMap(r=>{
  const expiry=deadline(r),days=Math.round((Date.parse(expiry+'T12:00:00Z')-Date.parse(today+'T12:00:00Z'))/86400000);
  if(!Number.isFinite(days)||days>lead)return [];
  return [{id:JSON.stringify([r.id,expiry,today]),recordId:r.id,name:r.name,lot:r.lot,type:r.type,expiry,dateKind:r.openExpiry&&r.openExpiry===expiry?'Après ouverture':r.dateKind||'Échéance',day:today,days,kind:days<0?'expired':days===0?'today':'soon',createdAt:new Date().toISOString(),readAt:null,channel:'in-app'}];
 });
}
export function validReminder(n){return n&&['id','recordId','name','lot','type','expiry','dateKind','day','kind','createdAt'].every(k=>typeof n[k]==='string')&&['soon','today','expired'].includes(n.kind)&&Number.isFinite(n.days)&&n.channel==='in-app'&&(n.readAt===null||typeof n.readAt==='string');}
