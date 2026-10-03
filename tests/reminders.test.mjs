import {test} from 'node:test';
import assert from 'node:assert/strict';
import {dueReminders,validReminder} from '../reminders.mjs';
const r={id:'r1',name:'Jambon',lot:'L1',type:'Charcuterie',expiry:'2026-10-06',openExpiry:'',dateKind:'DLC',state:'active'};
test('J−3 inclus, J−4 exclu, minimum de trois jours',()=>{assert.equal(dueReminders([r],'2026-10-03').length,1);assert.equal(dueReminders([r],'2026-10-02').length,0);assert.equal(dueReminders([r],'2026-10-03',1).length,1);assert.equal(dueReminders([r],'2026-10-01',5).length,1);});
test('Un identifiant par lot, échéance et jour',()=>{const a=dueReminders([r],'2026-10-03')[0];assert.equal(a.id,dueReminders([r],'2026-10-03')[0].id);assert.notEqual(a.id,dueReminders([r],'2026-10-04')[0].id);assert.notEqual(a.id,dueReminders([{...r,expiry:'2026-10-05'}],'2026-10-03')[0].id);assert.ok(validReminder(a));});
test('Aujourd’hui et dépassement, sans jours rétroactifs',()=>{assert.equal(dueReminders([r],'2026-10-06')[0].kind,'today');const notes=dueReminders([r],'2026-10-08');assert.equal(notes.length,1);assert.equal(notes[0].kind,'expired');assert.equal(notes[0].day,'2026-10-08');});
test('Aucun nouveau rappel sur lot utilisé, retiré ou bloqué',()=>{for(const state of ['used','withdrawn','blocked'])assert.equal(dueReminders([{...r,state}],'2026-10-05').length,0);});
test('L’ouverture prend priorité, pas d’échéance = pas d’alerte',()=>{const n=dueReminders([{...r,openExpiry:'2026-10-04'}],'2026-10-03')[0];assert.equal(n.days,1);assert.equal(n.dateKind,'Après ouverture');assert.equal(dueReminders([{...r,expiry:''}],'2026-10-03').length,0);});
