export async function rotatedPhoto(photo){
 const image=new Image();image.src=photo.data;await image.decode();
 const turn=((photo.ocrRotation||0)%360+360)%360,swap=turn===90||turn===270;
 const c=document.createElement('canvas');c.width=swap?image.naturalHeight:image.naturalWidth;c.height=swap?image.naturalWidth:image.naturalHeight;
 const x=c.getContext('2d');x.translate(c.width/2,c.height/2);x.rotate(turn*Math.PI/180);x.drawImage(image,-image.naturalWidth/2,-image.naturalHeight/2);return c;
}
export async function preparePhoto(photo,gray=false){
 const source=await rotatedPhoto(photo),r=photo.ocrRegion||{x:0,y:0,width:1,height:1};
 const sw=Math.max(1,source.width*r.width),sh=Math.max(1,source.height*r.height),scale=Math.min(4,2000/Math.max(sw,sh));
 const c=document.createElement('canvas');c.width=Math.round(sw*scale)+40;c.height=Math.round(sh*scale)+40;const x=c.getContext('2d',{willReadFrequently:gray});x.fillStyle='white';x.fillRect(0,0,c.width,c.height);x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(source,source.width*r.x,source.height*r.y,sw,sh,20,20,c.width-40,c.height-40);
 if(gray){const pixels=x.getImageData(0,0,c.width,c.height);for(let i=0;i<pixels.data.length;i+=4){const v=Math.max(0,Math.min(255,(.299*pixels.data[i]+.587*pixels.data[i+1]+.114*pixels.data[i+2]-128)*1.25+128));pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;}x.putImageData(pixels,0,0);}
 return{canvas:c,small:Math.max(source.width,source.height)<800||Math.min(sw,sh)<200};
}
export function installCropper({getPhoto,onChange,notify}){
 const $=id=>document.getElementById(id);let index=-1,source,selection,start;
 function paint(){const c=$('cropCanvas'),x=c.getContext('2d');x.drawImage(source,0,0,c.width,c.height);if(selection){const r=selection;x.fillStyle='#183c2c66';x.fillRect(0,0,c.width,c.height);x.drawImage(source,r.x*source.width,r.y*source.height,r.width*source.width,r.height*source.height,r.x*c.width,r.y*c.height,r.width*c.width,r.height*c.height);x.strokeStyle='#cbea66';x.lineWidth=4;x.strokeRect(r.x*c.width,r.y*c.height,r.width*c.width,r.height*c.height);}}
 function point(e){const r=$('cropCanvas').getBoundingClientRect();return{x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))};}
 $('cropCanvas').onpointerdown=e=>{e.preventDefault();start=point(e);$('cropCanvas').setPointerCapture(e.pointerId);};$('cropCanvas').onpointermove=e=>{if(!start)return;const end=point(e);selection={x:Math.min(start.x,end.x),y:Math.min(start.y,end.y),width:Math.abs(end.x-start.x),height:Math.abs(end.y-start.y)};paint();};$('cropCanvas').onpointerup=()=>{start=null;if(selection?.width<.03||selection?.height<.03){selection=null;paint();}};$('cropCanvas').onpointercancel=()=>{start=null;};
 $('cancelCrop').onclick=()=>$('cropDialog').close();$('resetCrop').onclick=()=>{selection=null;paint();};$('applyCrop').onclick=()=>{const p=getPhoto(index);if(p){p.ocrRegion=selection||undefined;onChange();}$('cropDialog').close();};
 return async i=>{try{index=i;const p=getPhoto(i);source=await rotatedPhoto(p);selection=p.ocrRegion||null;const c=$('cropCanvas'),scale=Math.min(1,1000/Math.max(source.width,source.height));c.width=Math.round(source.width*scale);c.height=Math.round(source.height*scale);paint();$('cropDialog').showModal();}catch{notify('Cette photo ne peut pas être recadrée.');}};
}
