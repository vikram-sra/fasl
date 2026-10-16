'use strict';
/* Shared helpers, preferences, model state and the UI store. Loaded before story/details/ui/application. */
const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const readPref=(key,fallback)=>{try{return localStorage.getItem(key)||fallback;}catch{return fallback;}};
const savePref=(key,value)=>{try{localStorage.setItem(key,value);}catch{}};
let language=readPref('fasl-language','en'),theme=readPref('fasl-theme','system'),displayMode=readPref('fasl-units','acre');
if(!['en','pa'].includes(language))language='en';
if(!['system','light','dark'].includes(theme))theme='system';
if(!['acre','bowl'].includes(displayMode))displayMode='acre';
const tr=(en,pa)=>language==='pa'?pa:en,fmt=(n,d=1)=>Number(n).toLocaleString(language==='pa'?'pa-IN':'en',{maximumFractionDigits:d});
const paMonths=['ਜਨਵਰੀ','ਫ਼ਰਵਰੀ','ਮਾਰਚ','ਅਪ੍ਰੈਲ','ਮਈ','ਜੂਨ','ਜੁਲਾਈ','ਅਗਸਤ','ਸਤੰਬਰ','ਅਕਤੂਬਰ','ਨਵੰਬਰ','ਦਸੰਬਰ'];
function displayDate(date,year=false){return language==='pa'?date.getUTCDate()+' '+paMonths[date.getUTCMonth()]+(year?' '+date.getUTCFullYear():''):date.toLocaleDateString('en',{day:'numeric',month:'short',...(year?{year:'numeric'}:{}),timeZone:'UTC'});}

/* UI store: the only place view, journey and sheet state live. Subscribers re-render; nothing else mutates these. */
const VIEWS=['field','plant','underground','ledger'];
const Store=(()=>{
  const state={view:'field',journey:'welcome',sheet:null,chapter:-1,storyPaused:false};
  const subs=new Set();
  return{
    get:()=>state,
    set(patch){const changed={};for(const k of Object.keys(patch))if(state[k]!==patch[k]){state[k]=patch[k];changed[k]=true;}if(Object.keys(changed).length)subs.forEach(f=>f(state,changed));},
    subscribe(f){subs.add(f);return()=>subs.delete(f);}
  };
})();

/* Model and playback state. */
let residueStrategy='mulch',residueExplicit=false,result=Sim.ideal({residueStrategy}),flows=Timeline.prepare(result);
const maxDay=result.snapshots.length,comparisonCache={mulch:result},planned={};
let position=0,target=0,playing=false,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,lastTime=0,uiTime=0,current,animationTime=0,harvestHold=null,seenHarvest=new Set(),sheetTrigger=null;
const speed=1.5,guidedSpeed=4.5;
function refreshPlanned(){for(const id of ['rice','wheat']){planned[id]={};for(const cat of ['fertilizer','herbicide','pest_control'])planned[id][cat]=result.state.cropStates[id].products.filter(p=>p.category===cat).reduce((n,p)=>n+p.quantity,0);}}
refreshPlanned();
const viewToScene={field:'acre',plant:'plant',underground:'section',ledger:null};
