import test from 'node:test';
import assert from 'node:assert/strict';
import {dueReminders} from '../reminders.mjs';
import {urgency} from '../logic.mjs';
test('Un stock à zéro ne génère pas de rappel ; les anciennes fiches restent compatibles',()=>{
 const r={id:'stock',name:'Jambon',lot:'A',state:'active',expiry:'2026-10-04'};
 assert.equal(dueReminders([{...r,stock:0}],'2026-10-03').length,0);
 assert.equal(urgency({...r,stock:0},'2026-10-03'),'used');
 assert.equal(dueReminders([r],'2026-10-03').length,1);
 assert.equal(dueReminders([{...r,stock:4}],'2026-10-03').length,1);
});