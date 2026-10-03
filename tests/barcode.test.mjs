import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validGTIN,lookupProduct} from '../barcode.mjs';
import {extract} from '../logic.mjs';
test('EAN vérifié, erreurs de chiffres refusées',()=>{assert.ok(validGTIN('3154230809302'));assert.ok(validGTIN('3 154230 809302'));assert.equal(validGTIN('3154230809301'),false);assert.equal(validGTIN('ABC123'),false);});
test('La base remplit le produit mais jamais le lot ni la DLC',async()=>{const p=await lookupProduct('3154230809302',{fetcher:async()=>({ok:true,status:200,json:async()=>({status:1,product:{product_name_fr:'Jambon',brands:'Herta',quantity:'170 g',expiration_date:'2020-01-01',lot:'OLD'}})})});assert.equal(p.name,'Jambon');assert.equal(p.brand,'Herta');assert.equal(p.expiry,undefined);assert.equal(p.lot,undefined);});
test('Produit absent et erreurs API',async()=>{assert.equal(await lookupProduct('3154230809302',{fetcher:async()=>({status:404})}),null);await assert.rejects(()=>lookupProduct('3154230809302',{fetcher:async()=>({status:429,ok:false})}),/minute/);});
test('OCR produit, marque, poids et texte corrigé',()=>{const r=extract('Herta\nLe Bon Paris\nà l’étouffée\nPoids net 170 g\nLot: AB-123\nDLC 15/10/2026');assert.match(r.name,/Jambon/);assert.equal(r.brand,'Herta');assert.equal(r.quantity,'170 g');assert.equal(r.lot,'AB-123');assert.equal(r.expiry,'2026-10-15');});
