export function cleanCode(value){return String(value||'').replace(/[\s-]/g,'');}
export function validGTIN(value){const code=cleanCode(value);if(!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(code))return false;let sum=0;for(let i=code.length-2,weight=3;i>=0;i--,weight=weight===3?1:3)sum+=Number(code[i])*weight;return(10-sum%10)%10===Number(code.at(-1));}
export async function lookupProduct(value,{fetcher=fetch}={}){
 const code=cleanCode(value);if(!validGTIN(code))throw new Error('Code-barres invalide : vérifiez les 8, 12, 13 ou 14 chiffres.');
 const url=`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=code,product_name,product_name_fr,brands,quantity,categories&app_name=LotAndDate`;
 const response=await fetcher(url,{signal:AbortSignal.timeout(15000)});if(response.status===404)return null;if(!response.ok)throw new Error(response.status===429?'Trop de demandes. Réessayez dans une minute.':'La base produit est temporairement indisponible.');
 const data=await response.json();if(data.status!==1||!data.product)return null;const p=data.product;
 return{code,name:p.product_name_fr||p.product_name||'',brand:p.brands||'',quantity:p.quantity||'',categories:p.categories||'',source:`https://world.openfoodfacts.org/product/${code}`};
}
