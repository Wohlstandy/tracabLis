import {test} from 'node:test';
import assert from 'node:assert/strict';
import {standardize} from '../standardize.mjs';
import {extractStamp} from '../stamp-logic.mjs';
test('Nettoyage conserve les accents et la désignation',()=>{assert.equal(standardize('name','| Blanc de Dinde \\ <>'),'Blanc de Dinde');assert.equal(standardize('name','à l’étouffée'),'à l’étouffée');});
test('Lot normalisé sans substitutions arbitraires de caractères',()=>{assert.equal(standardize('lot','ab-123 |'),'AB-123');assert.equal(standardize('lot','O0-I1'),'O0-I1');});
test('Unités standardisées',()=>{assert.equal(standardize('quantity','180g'),'180 g');assert.equal(standardize('quantity','1.5 KG'),'1,5 kg');});
test('Date imprimée et candidat lot voisin, sans heure ni barcode',()=>{assert.deepEqual(extractStamp('TT 63561177 A\n30/09/26 13:24 15B 1'),{expiry:'2026-09-30',lot:'63561177'});assert.equal(extractStamp('3661112059798\n30/09/26').lot,'');assert.equal(extractStamp('31/02/26').expiry,'');});
