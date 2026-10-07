/* New releases reload automatically; file:// and offline builds remain usable. */
(()=>{
 'use strict';
 const current=document.querySelector('meta[name="app-version"]')?.content;
 if(!/^https?:$/.test(location.protocol)||!/^[a-f0-9]{64}$/.test(current||''))return;
 const guardKey='fasl-update-attempt',retryDelay=60000;
 let checking=false,leaving=false;
 function readAttempt(){
  let attempt;
  try{attempt=JSON.parse(sessionStorage.getItem(guardKey)||'null');}catch{}
  if(/^[a-f0-9]{64}$/.test(attempt?.version||'')&&Number.isFinite(attempt.at))return attempt;
  // The navigation URL also guards against loops when browser storage is blocked.
  const url=new URL(location.href),version=url.searchParams.get('_v'),at=Number(url.searchParams.get('_refresh'));
  return /^[a-f0-9]{64}$/.test(version||'')&&at>0&&Number.isFinite(at)?{version,at}:null;
 }
 function clearAttempt(){try{sessionStorage.removeItem(guardKey);}catch{}}
 if(readAttempt()?.version===current)clearAttempt();
 async function check(){
  if(checking||leaving||document.hidden||navigator.onLine===false)return;
  checking=true;
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);
  const options={cache:'no-store',credentials:'same-origin',signal:controller.signal};
  try{
   const manifestURL=new URL('version.json',location.href);
   manifestURL.searchParams.set('_check',Date.now()+'-'+Math.random().toString(36).slice(2));
   const response=await fetch(manifestURL,options);
   if(!response.ok)return;
   const manifest=await response.json(),next=manifest.version;
   if(manifest.schema!==1||!/^[a-f0-9]{64}$/.test(next||'')||next===current)return;
   const attempt=readAttempt();
   if(attempt?.version===next&&Date.now()-attempt.at<retryDelay)return;
   // Confirm HTML and manifest belong to the same release before navigating.
   const nextURL=new URL(location.href);
   nextURL.searchParams.set('_v',next);
   nextURL.searchParams.set('_refresh',Date.now().toString());
   const page=await fetch(nextURL,options);
   if(!page.ok)return;
   const html=new DOMParser().parseFromString(await page.text(),'text/html');
   if(html.querySelector('meta[name="app-version"]')?.content!==next)return;
   try{sessionStorage.setItem(guardKey,JSON.stringify({version:next,at:Date.now()}));}catch{}
   leaving=true;
   location.replace(nextURL.href);
  }catch{
   // A failed check must never prevent the current offline-capable app working.
  }finally{
   clearTimeout(timeout);checking=false;
  }
 }
 check();
 setInterval(check,retryDelay);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});
 window.addEventListener('focus',check);
 window.addEventListener('pageshow',check);
 window.addEventListener('online',check);
})();
