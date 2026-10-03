import {validGTIN,cleanCode} from './barcode.mjs';
import {preparePhoto} from './image-reader.js';
let loading;
async function loadDecoder(){if(window.ZXingBrowser)return;if(!loading)loading=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.5/umd/zxing-browser.min.js';s.onload=resolve;s.onerror=()=>{s.remove();loading=null;reject(new Error('Le lecteur ne peut pas être chargé. Vérifiez la connexion.'));};document.head.append(s);});await loading;}
export async function decodeCanvas(canvas){
 if('BarcodeDetector'in window){try{const available=await BarcodeDetector.getSupportedFormats();const formats=['ean_13','ean_8','upc_a','upc_e','itf'].filter(f=>available.includes(f));if(formats.length){const results=await new BarcodeDetector({formats}).detect(canvas);const found=results.find(r=>validGTIN(r.rawValue));if(found)return cleanCode(found.rawValue);}}catch{}}
 await loadDecoder();const reader=new ZXingBrowser.BrowserMultiFormatOneDReader();try{const result=reader.decodeFromCanvas(canvas);const code=cleanCode(result.getText());return validGTIN(code)?code:null;}catch{return null;}
}
export async function decodePhotos(photos){for(const p of photos){const prepared=await preparePhoto(p);const code=await decodeCanvas(prepared.canvas);if(code)return code;}return null;}
