import {rotatedPhoto} from './image-reader.js';
import {extractStamp} from './stamp-logic.mjs';
export async function readWeight(photo,worker){
 const b=photo.ocrBarcodeBox;if(!b||b.width<=0||b.height<=0)return '';
 const x=Math.max(0,b.x-b.width*.18),y=Math.max(0,b.y-b.height*1.8),region={x,y,width:Math.min(1-x,b.width*1.8),height:Math.min(b.y-y,b.height*1.7)};
 if(region.height<=0)return '';
 await worker.setParameters({tessedit_pageseg_mode:'6',tessedit_char_whitelist:'0123456789gGkKmMlL., '});
 try{for(const angle of [0,6,-6]){const data=(await worker.recognize(await stampCanvas(photo,region,angle,0))).data;const match=data.text.match(/\b\d+(?:[.,]\d+)?\s*(?:kg|g|ml|cl|l)\b/i);if(match)return match[0];}}finally{await worker.setParameters({tessedit_char_whitelist:''});}return '';
}
export async function readStamps(photo,worker,onProgress=()=>{}){
 let best={expiry:'',lot:'',text:'',score:0};
 const regions=photo.ocrRegion?[photo.ocrRegion]:[{x:0,y:.8,width:1,height:.2},{x:0,y:.6,width:1,height:.2},{x:0,y:.4,width:1,height:.2},{x:0,y:.2,width:1,height:.2}];
 await worker.setParameters({tessedit_pageseg_mode:'6',tessedit_char_whitelist:'0123456789/:ABCDEFGHIJKLMNOPQRSTUVWXYZ '});
 try{for(let i=0;i<regions.length;i++)for(const angle of [0,6,-6]){onProgress(`Lecture des impressions lot/date · zone ${i+1}/${regions.length}`);const canvas=await stampCanvas(photo,regions[i],angle,2);const result=(await worker.recognize(canvas)).data;const proposal=extractStamp(result.text);const score=Number(!!proposal.expiry)*2+Number(!!proposal.lot)*2;if(score>best.score)best={...proposal,text:result.text,score};if(best.expiry&&best.lot)return best;}}finally{await worker.setParameters({tessedit_char_whitelist:''});}
 return best;
}
export async function stampCanvas(photo,region={x:0,y:.7,width:1,height:.3},angle=0,dilate=1){
 const source=await rotatedPhoto(photo);const c=document.createElement('canvas'),scale=Math.min(1.5,1800/(source.width*region.width));c.width=Math.round(source.width*region.width*scale);c.height=Math.round(source.height*region.height*scale);const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(source,region.x*source.width,region.y*source.height,region.width*source.width,region.height*source.height,0,0,c.width,c.height);
 const {width:w,height:h}=c,p=ctx.getImageData(0,0,w,h),gray=new Uint8Array(w*h),integral=new Float64Array((w+1)*(h+1));
 for(let y=0;y<h;y++){let sum=0;for(let x=0;x<w;x++){const i=y*w+x,v=Math.round(.299*p.data[i*4]+.587*p.data[i*4+1]+.114*p.data[i*4+2]);gray[i]=v;sum+=v;integral[(y+1)*(w+1)+x+1]=integral[y*(w+1)+x+1]+sum;}}
 const dark=new Uint8Array(w*h),r=16;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const x0=Math.max(0,x-r),x1=Math.min(w,x+r+1),y0=Math.max(0,y-r),y1=Math.min(h,y+r+1);const mean=(integral[y1*(w+1)+x1]-integral[y0*(w+1)+x1]-integral[y1*(w+1)+x0]+integral[y0*(w+1)+x0])/((x1-x0)*(y1-y0));dark[y*w+x]=gray[y*w+x]<mean-18?1:0;}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let black=false;for(let dy=-dilate;dy<=dilate&&!black;dy++)for(let dx=-dilate;dx<=dilate;dx++){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<w&&yy>=0&&yy<h&&dark[yy*w+xx]){black=true;break;}}const i=(y*w+x)*4;p.data[i]=p.data[i+1]=p.data[i+2]=black?0:255;p.data[i+3]=255;}ctx.putImageData(p,0,0);
 const output=document.createElement('canvas');output.width=w+80;output.height=h+160;const out=output.getContext('2d');out.fillStyle='white';out.fillRect(0,0,output.width,output.height);out.translate(output.width/2,output.height/2);out.rotate(angle*Math.PI/180);out.drawImage(c,-w/2,-h/2);return output;
}
