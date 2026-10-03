export const categories=['Autres','Charcuterie','Viandes','Poissons','Produits laitiers','Fruits et légumes','Épicerie','Surgelés'];
const rules=[[/jambon|saucisson|lardon|pâté|charcuterie|chorizo/i,'Charcuterie',['charcuterie','réfrigéré']],[/poulet|dinde|bœuf|boeuf|steak|porc|agneau|veau/i,'Viandes',['viande','réfrigéré']],[/saumon|thon|cabillaud|crevette|poisson/i,'Poissons',['poisson','réfrigéré']],[/lait|fromage|yaourt|beurre|crème/i,'Produits laitiers',['laitier','réfrigéré']],[/tomate|carotte|salade|pomme|courgette|légume|fruit/i,'Fruits et légumes',['végétal']],[/riz|pâte|farine|huile|sucre|conserve/i,'Épicerie',['épicerie']]];
export function classify(text){const rule=rules.find(r=>r[0].test(text));const tags=rule?[...rule[2]]:[];if(/jambon|porc|lardon|saucisson|chorizo/i.test(text))tags.push('porc');if(/surgelé|congelé/i.test(text))return{type:'Surgelés',tags:[...new Set([...tags,'surgelé'])]};return{type:rule?.[1]||'Autres',tags};}
export function localDate(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function parseDate(s){const m=s.match(/\b(\d{1,2})[./-](\d{1,2})[./-](\d{4}|\d{2})\b/);if(!m)return '';let year=Number(m[3]);if(year<100)year+=2000;const d=new Date(year,Number(m[2])-1,Number(m[1]));return d.getFullYear()===year&&d.getMonth()===Number(m[2])-1&&d.getDate()===Number(m[1])?localDate(d):'';}
export function extract(text){
 const lines=text.split(/\n/).map(s=>s.trim()).filter(Boolean),flat=text.replace(/\s+/g,' ');
 const brand=flat.match(/\b(Herta|Fleury\s+Michon|Président|Lactel|Danone|Aoste|Bonduelle|Panzani|Barilla|D'aucy|Elle\s*&\s*Vire)\b/i)?.[1]||'';
 const labelled=lines.find(s=>/^(?:produit|d[eé]nomination|intitul[eé])\s*:/i.test(s));
 const product=lines.filter(s=>s.length<180&&rules.some(r=>r[0].test(s))&&!/nutrition|allerg[eè]ne|peut contenir|ingr[eé]dient|traces de|sans lait/i.test(s)).sort((a,b)=>Number(/jambon|saucisson|poulet|saumon|yaourt|riz|farine/i.test(b))-Number(/jambon|saucisson|poulet|saumon|yaourt|riz|farine/i.test(a)))[0];
 // Le Bon Paris is a Herta ham range, confirmed by the manufacturer's catalogue.
 const alias=/bon\s*paris/i.test(flat)&&/herta/i.test(flat)?"Jambon cuit Le Bon Paris"+(/touff/i.test(flat)?" à l’étouffée":""):'';
 const name=labelled?labelled.replace(/^[^:]+:\s*/, ''):alias||product||'';
 const lotMatch=flat.match(/\b(?:lot|batch)\s*(?:n[°oº]?|num[eé]ro)?\s*[:#.-]?\s*([A-Z0-9][A-Z0-9./_-]*)/i),candidate=lotMatch?.[1]||'';
 const lot=/\d/.test(candidate)&&!/^(?:DLC|DDM)$/i.test(candidate)?candidate:'';
 const dateIndex=lines.findIndex(s=>/DLC|DDM|consommer|péremption|expiration/i.test(s));const dateLine=dateIndex>=0?lines[dateIndex]:'';
 const expiry=dateLine?parseDate(lines.slice(dateIndex,dateIndex+3).join(' ')):'';
 const quantityLine=lines.find(s=>/poids\s*(?:net)?|quantit[eé]/i.test(s)&&/\d/i.test(s))||lines.find(s=>!/nutrition|100\s*g|pour\s+1|énergie|kcal|kj/i.test(s)&&/\b\d+(?:[.,]\d+)?\s*(?:kg|g|ml|cl|litres?|l)\b/i.test(s));
 const quantity=quantityLine?.match(/\b\d+(?:[.,]\d+)?\s*(?:kg|g|ml|cl|litres?|l)\b/i)?.[0]||'';
 const supplier=lines.find(s=>/^(?:fournisseur|distribu[eé]\s+par)\s*:/i.test(s))?.replace(/^[^:]+:\s*/,'')||'';
 return{name,brand,supplier,quantity,lot,expiry,dateKind:dateLine&&/DDM|de préférence/i.test(dateLine)?'DDM':'DLC',...classify(name)};
}
export function deadline(r){return [r.expiry,r.openExpiry].filter(Boolean).sort()[0]||'';}
export function urgency(r,today=localDate()){if(r.state==='blocked'||r.state==='withdrawn')return'blocked';if(r.state==='used')return'used';const end=deadline(r);if(!end)return'none';const days=Math.round((Date.parse(end+'T12:00:00Z')-Date.parse(today+'T12:00:00Z'))/86400000);return days<0?'expired':days<=3?'soon':'ok';}
export function csvCell(value){let s=String(value??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
