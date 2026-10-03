import {parseDate} from './logic.mjs';
export function extractStamp(text){
 const lines=text.split('\n').map(s=>s.trim()).filter(Boolean);let best={expiry:'',lot:''};
 for(let i=0;i<lines.length;i++){const expiry=parseDate(lines[i]);if(!expiry)continue;const nearby=lines.slice(Math.max(0,i-2),i+3).filter(l=>!parseDate(l));const lot=nearby.flatMap(l=>[...l.matchAll(/(?:^|\s)(\d{6,12})(?=\s|$)/g)].map(m=>m[1]))[0]||'';if(lot||!best.expiry)best={expiry,lot};}
 return best;
}
