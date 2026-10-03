const $=id=>document.getElementById(id);
let pending=Promise.resolve();
export function popup({title='Une action est nécessaire',message,kind='error',action='Compris',cancel,focus}){
 const result=pending.then(()=>new Promise(resolve=>{
 const d=$('feedbackDialog');d.dataset.kind=kind;
 $('feedbackTitle').textContent=title;$('feedbackMessage').textContent=message;
 $('feedbackIcon').textContent='!';$('feedbackAction').textContent=action;
 $('feedbackCancel').hidden=!cancel;$('feedbackCancel').textContent=cancel||'Annuler';
 let accepted=false;
 const finish=()=>{d.removeEventListener('close',finish);if(focus&&accepted){const el=$(focus);el?.scrollIntoView({block:'center'});el?.focus();}resolve(accepted);};
 $('feedbackAction').onclick=()=>{accepted=true;d.close();};$('feedbackCancel').onclick=()=>d.close();
 d.addEventListener('close',finish);d.showModal();(cancel?$('feedbackCancel'):$('feedbackAction')).focus();
 }));pending=result.catch(()=>{});return result;
}
export const confirmAction=message=>popup({title:'Confirmer cette action',message,kind:'warning',action:'Confirmer',cancel:'Annuler'});
