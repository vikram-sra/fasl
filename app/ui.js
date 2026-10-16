'use strict';
/* UI layer: renders the store and model into the page, and owns every user control. Playback itself lives in application.js. */
const app=$('app');

/* ---------- theme and labels ---------- */
function applyTheme(){document.documentElement.dataset.theme=theme==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):theme;document.querySelector('meta[name="theme-color"]').content=document.documentElement.dataset.theme==='dark'?'#111f1a':'#f3f0e5';}
const VIEW_LABELS={field:['Field','ਖੇਤ'],plant:['Plant','ਪੌਦਾ'],underground:['Underground','ਧਰਤੀ ਹੇਠ'],ledger:['Ledger','ਹਿਸਾਬ']};
function applyLabels(){
  document.documentElement.lang=language;
  const labels={
    'welcome-kicker':['A SMALL STORY ABOUT WHAT FEEDS US','ਸਾਡੇ ਭੋਜਨ ਦੀ ਇੱਕ ਛੋਟੀ ਕਹਾਣੀ'],
    'welcome-copy':['Follow rice and wheat from seed to food—and see the water used along the way.','ਝੋਨੇ ਅਤੇ ਕਣਕ ਨੂੰ ਬੀਜ ਤੋਂ ਭੋਜਨ ਤੱਕ ਦੇਖੋ—ਅਤੇ ਰਾਹ ਵਿੱਚ ਵਰਤਿਆ ਪਾਣੀ ਸਮਝੋ।'],
    'start-story':['▶ Play story','▶ ਕਹਾਣੀ ਚਲਾਓ'],'explore':['Explore','ਖੋਜੋ'],
    'cutaway-note':['Illustrative cutaway · not to scale','ਧਰਤੀ ਹੇਠਲਾ ਦ੍ਰਿਸ਼ · ਅਸਲ ਪੈਮਾਨਾ ਨਹੀਂ'],
    'harvest-results':['Harvest ↗','ਇਹ ਵਾਢੀ ਦੇਖੋ ↗'],'finish-kicker':['THE FIELD KEEPS ITS HISTORY','ਖੇਤ ਦਾ ਇਤਿਹਾਸ ਅੱਗੇ ਚੱਲਦਾ ਹੈ'],
    'finish-title':['Two harvests. One shared source.','ਦੋ ਵਾਢੀਆਂ। ਇੱਕ ਸਾਂਝਾ ਸਰੋਤ।'],'compare-crops':['Results ↗','ਝੋਨੇ ਅਤੇ ਕਣਕ ਦੀ ਤੁਲਨਾ'],'replay':['Replay ↻','ਦੁਬਾਰਾ ਦੇਖੋ ↻'],
    'try-straw':['Try the other straw choice ↗','ਪਰਾਲੀ ਦਾ ਦੂਜਾ ਰਾਹ ਅਜ਼ਮਾਓ ↗'],'resume-story':['Resume story','ਕਹਾਣੀ ਜਾਰੀ ਰੱਖੋ'],'menu':['Menu','ਮੀਨੂ']
  };
  for(const [id,pair] of Object.entries(labels))if($(id))$(id).textContent=tr(...pair);
  $('welcome-title').innerHTML=tr('One field.<br>Two harvests.','ਇੱਕ ਖੇਤ।<br>ਦੋ ਵਾਢੀਆਂ।');
  $('home').setAttribute('aria-label',tr('Return to the introduction','ਜਾਣ-ਪਛਾਣ ਵੱਲ ਵਾਪਸ'));
  $('language-toggle').textContent=tr('ਪੰਜਾਬੀ','English');$('language-toggle').lang=language==='en'?'pa':'en';$('language-toggle').setAttribute('aria-label',tr('Switch to Punjabi','Switch to English'));
  $('menu').setAttribute('aria-label',tr('Settings and information','ਸੈਟਿੰਗਾਂ ਅਤੇ ਜਾਣਕਾਰੀ'));
  for(const b of document.querySelectorAll('[data-scene]'))b.textContent=tr(b.dataset.scene==='rice'?'Rice':'Wheat',b.dataset.scene==='rice'?'ਝੋਨਾ':'ਕਣਕ');
  for(const b of document.querySelectorAll('#views [data-view]'))b.querySelector('span').textContent=tr(...VIEW_LABELS[b.dataset.view]);
  document.querySelector('[data-unit=acre]').textContent=tr('Acre','ਏਕੜ');document.querySelector('[data-unit=bowl]').textContent='100 g';
  document.querySelector('[data-unit=acre]').setAttribute('aria-label',tr('Whole field: one acre','ਪੂਰਾ ਖੇਤ: ਇੱਕ ਏਕੜ'));document.querySelector('[data-unit=bowl]').setAttribute('aria-label',tr('Per 100 grams of dry food','ਪ੍ਰਤੀ 100 ਗ੍ਰਾਮ ਸੁੱਕਾ ਭੋਜਨ'));
  $('unit-switch').setAttribute('aria-label',tr('Quantity basis','ਮਾਤਰਾ ਦਾ ਆਧਾਰ'));$('views').setAttribute('aria-label',tr('View','ਦ੍ਰਿਸ਼'));
  $('timeline-slider').setAttribute('aria-label',tr('Crop growing timeline','ਫ਼ਸਲ ਦੀ ਸਮਾਂ ਰੇਖਾ'));$('close-sheet').setAttribute('aria-label',tr('Close details','ਵੇਰਵੇ ਬੰਦ ਕਰੋ'));
  $('metrics-button').setAttribute('aria-label',tr('Water and harvest details','ਪਾਣੀ ਅਤੇ ਵਾਢੀ ਦੇ ਵੇਰਵੇ'));
  $('chapter-prev').setAttribute('aria-label',tr('Previous chapter','ਪਿਛਲਾ ਪੜਾਅ'));$('chapter-next').setAttribute('aria-label',tr('Next chapter','ਅਗਲਾ ਪੜਾਅ'));
  $('scene-art').setAttribute('aria-label',tr('Representative crops above soil, roots and illustrative groundwater','ਮਿੱਟੀ, ਜੜ੍ਹਾਂ ਅਤੇ ਮਾਡਲ ਦੇ ਧਰਤੀ ਹੇਠਲੇ ਪਾਣੀ ਉੱਪਰ ਨੁਮਾਇੰਦਾ ਫ਼ਸਲਾਂ'));
  buildMonths();uiTime=0;
}

/* ---------- scrubber: season bands, month labels, event markers ---------- */
const dayOf=date=>Math.round((Date.parse(date+'T00:00:00Z')-Date.parse(Sim.dateAt(0)+'T00:00:00Z'))/Sim.MS);
function buildBands(){
  const ws=Sim.wheatStart(),pct=d=>d/maxDay*100;
  $('scrub-bands').innerHTML=`<i data-band="rice" style="width:${pct(121)}%"></i><i data-band="fallow" style="width:${pct(ws-121)}%"></i><i data-band="wheat" style="width:${pct(maxDay-ws)}%"></i><b class="progress"></b>`;
}
let monthMarks=[];
function buildMonthMarks(){
  monthMarks=[];let month=new Date(Sim.dateAt(0)+'T00:00:00Z'),first=month;monthMarks.push({day:0,key:month.toISOString().slice(0,7)});
  month=new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth()+1,1));
  while(month<=new Date(Sim.dateAt(maxDay)+'T00:00:00Z')){monthMarks.push({day:(month-first)/Sim.MS,key:month.toISOString().slice(0,7)});month=new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth()+1,1));}
}
function buildMonths(){
  $('month-list').innerHTML=monthMarks.map(m=>`<span style="left:${m.day/maxDay*100}%" data-month="${m.key}">${language==='pa'?paMonths[Number(m.key.slice(5))-1]:new Date(m.key+'-01T00:00:00Z').toLocaleDateString('en',{month:'short',timeZone:'UTC'})}</span>`).join('');
}
const MARKER_SHEET={sow:'care',transplant:'care',harvest:'results',pump:'water',rain:'water',fertilizer:'fertilizer',weed:'herbicide',pest:'pest_control',straw:'soil'};
let markers=[];
function computeMarkers(){
  const keep=new Set(['pumping','rain','product','harvest','residue_management']),ev=result.snapshots.flatMap(s=>s.events.filter(e=>e.date===s.date&&keep.has(e.type))),seen=new Set(),out=[],cluster=(list,kind,gap,make)=>{let group=[];const flush=()=>{if(group.length){out.push({kind,day:group[0].day,...make(group)});group=[];}};for(const e of list){if(group.length&&e.day-group[group.length-1].day>gap)flush();group.push(e);}flush();};
  const uniq=ev.filter(e=>!seen.has(e.id)&&seen.add(e.id)).map(e=>({...e,day:dayOf(e.date)})).sort((a,b)=>a.day-b.day);
  out.push({kind:'sow',day:0,en:'Rice nursery sown',pa:'ਝੋਨੇ ਦੀ ਪਨੀਰੀ ਬੀਜੀ'},{kind:'transplant',day:27,en:'Seedlings moved to the field',pa:'ਪਨੀਰੀ ਖੇਤ ਵਿੱਚ ਲੱਗੀ'},{kind:'sow',day:Sim.wheatStart(),en:'Wheat sown',pa:'ਕਣਕ ਬੀਜੀ'});
  cluster(uniq.filter(e=>e.type==='pumping'&&e.quantity>0),'pump',10,g=>({en:`Irrigation · ${g.length} runs`,pa:`ਸਿੰਚਾਈ · ${g.length} ਵਾਰ`}));
  cluster(uniq.filter(e=>e.type==='rain'&&e.rainMm>0),'rain',6,g=>({total:g.reduce((n,e)=>n+e.rainMm,0)}));
  const rainClusters=out.filter(m=>m.kind==='rain');for(const m of rainClusters)if(m.total<25)out.splice(out.indexOf(m),1);else{m.en=`Rain · ${fmt(m.total,0)} mm`;m.pa=`ਮੀਂਹ · ${fmt(m.total,0)} mm`;}
  const cats={fertilizer:['fertilizer','Fertilizer applied','ਖਾਦ ਪਾਈ'],herbicide:['weed','Weed care','ਨਦੀਨ ਪ੍ਰਬੰਧ'],pest_control:['pest','Pest care','ਕੀਟ ਪ੍ਰਬੰਧ']};
  for(const [cat,[kind,en,pa]] of Object.entries(cats))cluster(uniq.filter(e=>e.type==='product'&&e.category===cat),kind,5,()=>({en,pa}));
  for(const e of uniq.filter(e=>e.type==='harvest'))out.push({kind:'harvest',day:e.day,en:(e.cropId==='rice'?'Rice':'Wheat')+' harvested',pa:e.cropId==='rice'?'ਝੋਨੇ ਦੀ ਵਾਢੀ':'ਕਣਕ ਦੀ ਵਾਢੀ'});
  const straw=uniq.find(e=>e.type==='residue_management');if(straw)out.push({kind:'straw',day:straw.day,en:'Straw handled',pa:'ਪਰਾਲੀ ਦਾ ਪ੍ਰਬੰਧ'});
  markers=out.sort((a,b)=>a.day-b.day);
}
function renderMarkers(){
  const box=$('scrub-markers'),width=Math.max(200,box.clientWidth||$('scrub').clientWidth||300),minGap=18/width*maxDay,groups=[];
  for(const [i,m] of markers.entries()){const g=groups[groups.length-1];if(g&&m.day-g.items[0].m.day<minGap)g.items.push({m,i});else groups.push({items:[{m,i}]});}
  box.innerHTML=groups.map(g=>{const rank=['harvest','sow','transplant','straw','pump','fertilizer','pest','weed','rain'],first=g.items.slice().sort((a,b)=>rank.indexOf(a.m.kind)-rank.indexOf(b.m.kind))[0],names=g.items.map(x=>tr(x.m.en,x.m.pa)).join(', '),date=displayDate(new Date(Sim.dateAt(first.m.day)+'T00:00:00Z'));
    return `<button data-marker="${first.i}" data-kind="${first.m.kind}" style="left:${first.m.day/maxDay*100}%" aria-label="${esc(names)} · ${date}" title="${esc(names)}"></button>`;}).join('');
}
/* ---------- harvest and finish overlays ---------- */
const grainRandom=Sim.random(4282);
$('bowl-grains').innerHTML=Array.from({length:160},(_,i)=>{const x=40+grainRandom()*160,y=48+grainRandom()*48;return `<ellipse cx="${x}" cy="${y}" rx="3.6" ry="1.3" transform="rotate(${grainRandom()*170},${x},${y})" fill="${['#f8f3df','#ece3c8','#fff9ea'][i%3]}"/>`;}).join('');
function updateHarvest(v){
  const {journey}=Store.get(),hold=harvestHold,finished=position>=maxDay-.001&&!hold,harvested=v.fallow||v.growth.harvest>.02;
  $('harvest-reveal').hidden=!harvested||journey==='welcome';$('story-finish').hidden=!finished||journey==='welcome';app.dataset.finished=finished;app.dataset.harvest=harvested&&journey!=='welcome';
  if(!harvested)return;
  const seconds=hold?hold.elapsed:journey==='guided'&&playing&&!seenHarvest.has(v.id)?0:8,rice=v.id==='rice';
  $('processing-label').textContent=seconds<2?tr('01 · CUTTING THE CROP','01 · ਫ਼ਸਲ ਕੱਟਣਾ'):seconds<4?tr('02 · SEPARATING GRAIN','02 · ਦਾਣੇ ਵੱਖ ਕਰਨਾ'):rice&&seconds<6?tr('03 · REMOVING THE HUSK','03 · ਛਿੱਲਕਾ ਹਟਾਉਣਾ'):tr('FROM FIELD TO FOOD','ਖੇਤ ਤੋਂ ਭੋਜਨ ਤੱਕ');
  const fill=Timeline.phase(seconds,rice?4:2,7)*(v.fallow?1:v.growth.harvest),edible=result.state.cropStates[v.id].edibleKg||0;
  $('bowl-grains').querySelectorAll('ellipse').forEach((el,i)=>{el.style.opacity=edible>0&&i/160<fill?'1':'0';el.setAttribute('fill',rice?['#f8f3df','#ece3c8','#fff9ea'][i%3]:['#b78b42','#d8b86b','#c5a05a'][i%3]);el.setAttribute('ry',rice?'1.3':'2');});
  $('bowl-title').textContent=edible>0?tr('From this field to your bowl','ਇਸ ਖੇਤ ਤੋਂ ਤੁਹਾਡੀ ਕੌਲੀ ਤੱਕ'):tr('No harvest; inputs still used','ਵਾਢੀ ਨਹੀਂ ਹੋਈ; ਸਾਧਨ ਫਿਰ ਵੀ ਵਰਤੇ ਗਏ');
  $('bowl-note').textContent=tr(rice?'100 g dry, uncooked milled rice':'100 g dry wheat grain',rice?'100 g ਸੁੱਕੇ, ਕੱਚੇ ਚੌਲ':'100 g ਸੁੱਕੀ ਕਣਕ');
  $('finish-copy').textContent=tr('Rice and wheat share this soil and groundwater. Explore the water behind each 100 g of dry food, or change what happens to the straw.','ਝੋਨਾ ਅਤੇ ਕਣਕ ਇਹ ਮਿੱਟੀ ਅਤੇ ਧਰਤੀ ਹੇਠਲਾ ਪਾਣੀ ਸਾਂਝਾ ਕਰਦੇ ਹਨ। ਹਰ 100 g ਸੁੱਕੇ ਭੋਜਨ ਲਈ ਪਾਣੀ ਦੇਖੋ ਜਾਂ ਪਰਾਲੀ ਦਾ ਰਾਹ ਬਦਲੋ।');
}

/* ---------- main readout ---------- */
function updateUI(v){
  const {journey,view,chapter,storyPaused}=Store.get(),m=Metrics.sample(result,v,displayMode),welcome=journey==='welcome',date=new Date(Sim.dateAt(v.day)+'T00:00:00Z');
  document.querySelectorAll('[data-unit]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.unit===displayMode));
  document.querySelectorAll('#views [data-view]').forEach(b=>b.setAttribute('aria-pressed',!welcome&&b.dataset.view===view));
  $('metric-water').textContent=liters(m.pumpedL);$('metric-grain').textContent=mass(m.grainKg);
  $('label-water').textContent=tr('Pumped','ਪੰਪ ਕੀਤਾ');
  $('label-grain').textContent=tr(m.harvested?'Harvest':'Grain',m.harvested?'ਵਾਢੀ':'ਅਨਾਜ');
  $('stage-title').textContent=welcome?tr('A year in one Punjab field','ਪੰਜਾਬ ਦੇ ਇੱਕ ਖੇਤ ਦਾ ਸਾਲ'):v.fallow?tr('Straw covers the soil','ਪਰਾਲੀ ਮਿੱਟੀ ਢੱਕਦੀ ਹੈ'):stageLabel(v);
  $('story-caption').textContent=welcome?'':storyCaption(v);
  $('chapter-label').textContent=tr(v.fallow?'BETWEEN SEASONS':v.id==='rice'?'THE RICE SEASON':'THE WHEAT SEASON',v.fallow?'ਦੋ ਫ਼ਸਲਾਂ ਵਿਚਕਾਰ':v.id==='rice'?'ਝੋਨੇ ਦਾ ਮੌਸਮ':'ਕਣਕ ਦਾ ਮੌਸਮ');
  const dasNum=Math.max(1,Math.floor(v.das)+1);
  $('current-date').textContent=welcome?'':displayDate(date,true)+' · '+(v.fallow?tr('Harvest interval','ਵਾਢੀ ਤੋਂ ਬਾਅਦ'):tr('Day '+dasNum,'ਦਿਨ '+dasNum));
  $('timeline-caption').textContent=displayDate(date);
  const slider=$('timeline-slider');slider.value=target;
  $('scrub-bands').style.setProperty('--progress',position/maxDay*100+'%');
  slider.setAttribute('aria-valuetext',displayDate(date,true)+', '+(v.fallow?tr('Between seasons','ਦੋ ਫ਼ਸਲਾਂ ਵਿਚਕਾਰ'):stageLabel(v)));
  document.querySelectorAll('[data-scene]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.scene===v.id&&!v.fallow));
  document.querySelectorAll('[data-month]').forEach(el=>el.classList.toggle('current-month',el.dataset.month===Sim.dateAt(v.day).slice(0,7)));
  $('play-icon').setAttribute('d',playing?'M3 2h4v12H3zM9 2h4v12H9z':'M4 2l10 6-10 6z');
  $('play-label').textContent=tr(playing?'Pause':position>=maxDay?'Replay':'Play',playing?'ਰੋਕੋ':position>=maxDay?'ਦੁਬਾਰਾ':'ਚਲਾਓ');
  $('play').setAttribute('aria-label',tr(playing?'Pause simulation':'Play simulation',playing?'ਸਿਮੂਲੇਸ਼ਨ ਰੋਕੋ':'ਸਿਮੂਲੇਸ਼ਨ ਚਲਾਓ'));
  const diff=v.aquiferL-v.previous.aquifer;$('groundwater-label').textContent=(Math.abs(diff)<.5?'↔':diff>0?'↑':'↓')+' '+tr('Groundwater','ਧਰਤੀ ਹੇਠਲਾ ਪਾਣੀ');
  const effects=Scene3D.info();$('weather-status').textContent=v.flow.rain>0&&v.fraction<.4?tr('Rain wets the field','ਮੀਂਹ ਖੇਤ ਨੂੰ ਗਿੱਲਾ ਕਰਦਾ ਹੈ'):v.flow.pumped>0&&v.fraction<.4?tr('Underground water → field','ਧਰਤੀ ਹੇਠੋਂ ਪਾਣੀ → ਖੇਤ'):effects.infiltrationAnimating?tr('Water seeps into the soil','ਪਾਣੀ ਮਿੱਟੀ ਵਿੱਚ ਰਿਸਦਾ ਹੈ'):v.flow.recharge>0?tr('Delayed water returns underground','ਦੇਰੀ ਨਾਲ ਪਾਣੀ ਧਰਤੀ ਹੇਠ ਵਾਪਸ ਜਾਂਦਾ ਹੈ'):'';
  // story chapter card
  const guided=journey==='guided',card=$('chapter-card');card.hidden=!guided||storyPaused||chapter<0;$('resume-story').hidden=!(guided&&storyPaused);
  if(guided&&chapter>=0){const c=Story.list[chapter];$('chapter-step').textContent=tr('CHAPTER ','ਪੜਾਅ ')+(chapter+1)+' / '+Story.list.length;$('chapter-title').textContent=tr(...c.title);$('chapter-copy').textContent=tr(...c.copy);$('chapter-bar').style.width=Story.progress(chapter,target)*100+'%';$('chapter-prev').disabled=chapter===0;$('chapter-next').disabled=chapter===Story.list.length-1;}
  $('scene-art').setAttribute('aria-label',welcome?tr('A rice plant above soil','ਮਿੱਟੀ ਉੱਤੇ ਝੋਨੇ ਦਾ ਪੌਦਾ'):[tr(VIEW_LABELS[sceneView][0]+' view','ਦ੍ਰਿਸ਼: '+VIEW_LABELS[sceneView][1]),v.fallow?tr('between seasons','ਦੋ ਫ਼ਸਲਾਂ ਵਿਚਕਾਰ'):stageLabel(v),tr('field water '+fmt(v.pondDepthMm,0)+' mm deep','ਖੇਤ ਵਿੱਚ ਪਾਣੀ '+fmt(v.pondDepthMm,0)+' mm'),tr('groundwater model '+fmt(v.aquiferL/Sim.H.aquifer_capacity_L*100,0)+'%','ਧਰਤੀ ਹੇਠਲਾ ਪਾਣੀ (ਮਾਡਲ) '+fmt(v.aquiferL/Sim.H.aquifer_capacity_L*100,0)+'%')].join(', '));
  $('plant-note-label').textContent=v.growth.grain>.05?tr(v.id==='rice'?'Grain head':'Ear',v.id==='rice'?'ਮੁੰਜਰ':'ਸਿੱਟਾ'):v.growth.height>.45?tr('Tillers','ਫੁਟਾਰਾ'):tr('Seedling','ਬੂਟਾ');
  updateHarvest(v);
  if(Store.get().sheet==='metrics'||Store.get().sheet==='ledger')refreshSheet();
}

/* ---------- sheet ---------- */
const SHEET_TITLES={
  water:['Water drawn underground','ਧਰਤੀ ਹੇਠੋਂ ਲਿਆ ਪਾਣੀ'],metrics:['Water & harvest details','ਪਾਣੀ ਅਤੇ ਵਾਢੀ ਦੇ ਵੇਰਵੇ'],soil:['What the soil carries forward','ਮਿੱਟੀ ਅੱਗੇ ਕੀ ਲੈ ਜਾਂਦੀ ਹੈ'],care:['The field is cared for automatically','ਖੇਤ ਦੀ ਦੇਖਭਾਲ ਆਪਣੇ ਆਪ ਹੁੰਦੀ ਹੈ'],
  fertilizer:['Plant nutrition','ਪੌਦਿਆਂ ਦਾ ਪੋਸ਼ਣ'],herbicide:['Weed management','ਨਦੀਨਾਂ ਦਾ ਪ੍ਰਬੰਧ'],pest_control:['Pest management','ਕੀਟਾਂ ਦਾ ਪ੍ਰਬੰਧ'],results:['The water behind your food','ਤੁਹਾਡੇ ਭੋਜਨ ਲਈ ਪਾਣੀ'],
  comparison:['Two paths for the straw','ਪਰਾਲੀ ਲਈ ਦੋ ਰਾਹ'],evidence:['About these estimates','ਇਨ੍ਹਾਂ ਅੰਦਾਜ਼ਿਆਂ ਬਾਰੇ'],residue:['What happens to the rice straw?','ਝੋਨੇ ਦੀ ਪਰਾਲੀ ਦਾ ਕੀ ਹੁੰਦਾ ਹੈ?'],ledger:['Water & inputs ledger','ਪਾਣੀ ਅਤੇ ਸਾਧਨਾਂ ਦਾ ਹਿਸਾਬ'],about:['One field. Two harvests.','ਇੱਕ ਖੇਤ। ਦੋ ਵਾਢੀਆਂ।']
};
const INPUT_COLORS={fertilizer:'var(--fertilizer)',herbicide:'var(--weed-care)',pest_control:'var(--pest-care)'};
function ledgerDetails(v){
  const m=Metrics.sample(result,v,displayMode),dot=c=>`style="--dot:${c}"`;
  const amount=cat=>{const parts=[];for(const u of ['kg','g','mL']){const n=m.products[cat][u];if(n>0){const g=displayMode==='bowl'&&u==='kg';parts.push(fmt(n*(g?1000:1),g||u!=='kg'?3:2)+' '+(g?'g':u));}}return parts.join(' · ')||'—';};
  const names={fertilizer:['Fertilizer','ਖਾਦ'],herbicide:['Weed care','ਨਦੀਨ'],pest_control:['Pest care','ਕੀਟ']};
  const rows=cat=>v.s.cropStates[v.id].products.filter(p=>p.category===cat);
  return `<p>${basisLabel(v)} · ${tr('cumulative to the displayed day','ਦਿਖਾਏ ਦਿਨ ਤੱਕ ਕੁੱਲ')}</p>
  <section class="ledger-group"><h3><i ${dot('var(--water-pumped)')}></i>${tr('Water pumped','ਪੰਪ ਕੀਤਾ ਪਾਣੀ')}</h3><div class="ledger-total">${liters(m.pumpedL)}</div>
  <table>${[[tr('Rain (counted separately)','ਮੀਂਹ (ਵੱਖਰਾ ਗਿਣਿਆ)'),m.water.rain,'var(--water-rain)'],[tr('Plant use + evaporation','ਫ਼ਸਲ ਦੀ ਖਪਤ ਅਤੇ ਭਾਫ਼'),m.water.et],[tr('Arrived recharge','ਪਹੁੰਚੀ ਭਰਪਾਈ'),m.water.recharge],[tr('Groundwater storage (model)','ਧਰਤੀ ਹੇਠਲਾ ਪਾਣੀ (ਮਾਡਲ)'),v.aquiferL*m.scale,'var(--groundwater)']].map(([l,n])=>`<tr><td>${l}</td><td>${liters(n)}</td></tr>`).join('')}</table></section>`
  +['fertilizer','herbicide','pest_control'].map(cat=>`<section class="ledger-group"><h3><i ${dot(INPUT_COLORS[cat])}></i>${tr(...names[cat])}</h3><div class="ledger-total">${amount(cat)}</div>${rows(cat).length?'<table><tbody>'+rows(cat).filter(p=>p.date<=Sim.dateAt(v.day)).map(p=>`<tr><td>${p.date} · ${esc(p.product)}</td><td>${productAmount(p,v)}</td></tr>`).join('')+'</tbody></table>':'<p>'+tr('No application yet.','ਅਜੇ ਕੋਈ ਵਰਤੋਂ ਨਹੀਂ।')+'</p>'}</section>`).join('')
  +`<p>${tr('Unlike units are never added together. Pumping is groundwater drawn; rain is counted separately. These are model quantities, not a lifecycle water footprint.','ਵੱਖਰੀਆਂ ਇਕਾਈਆਂ ਜੋੜੀਆਂ ਨਹੀਂ ਜਾਂਦੀਆਂ। ਪੰਪ ਕੀਤਾ ਪਾਣੀ ਧਰਤੀ ਹੇਠੋਂ ਲਿਆ ਜਾਂਦਾ ਹੈ; ਮੀਂਹ ਵੱਖਰਾ ਹੈ। ਇਹ ਮਾਡਲ ਦੀਆਂ ਮਾਤਰਾਵਾਂ ਹਨ।')}</p><button class="action" data-sheet="evidence">${tr('About these estimates','ਇਨ੍ਹਾਂ ਅੰਦਾਜ਼ਿਆਂ ਬਾਰੇ')}</button>`;
}
function menuBody(){
  return `<button class="action" data-sheet="care">${tr('Crop care & inputs','ਦੇਖਭਾਲ ਤੇ ਸਾਧਨ')}</button><button class="action" data-sheet="comparison" id="compare-straw">${tr('Compare straw choices','ਪਰਾਲੀ ਦੇ ਰਾਹਾਂ ਦੀ ਤੁਲਨਾ')}</button><button class="action" data-sheet="results">${tr('Compare harvests','ਵਾਢੀਆਂ ਦੀ ਤੁਲਨਾ')}</button>
  <p>${tr('Follow a Punjab field from rice to wheat. The story plays about 80 seconds, one chapter at a time; touch anything to pause it. Crop care happens automatically. Straw is retained as the disclosed baseline; you can compare burning at any time.','ਪੰਜਾਬ ਦੇ ਖੇਤ ਵਿੱਚ ਝੋਨੇ ਤੋਂ ਕਣਕ ਤੱਕ ਦੇਖੋ। ਕਹਾਣੀ ਲਗਭਗ 80 ਸਕਿੰਟ ਚੱਲਦੀ ਹੈ; ਕੁਝ ਵੀ ਛੂਹਣ ਨਾਲ ਰੁਕ ਜਾਂਦੀ ਹੈ। ਦੇਖਭਾਲ ਆਪਣੇ ਆਪ ਹੁੰਦੀ ਹੈ। ਮੂਲ ਰਾਹ ਵਿੱਚ ਪਰਾਲੀ ਰੱਖੀ ਜਾਂਦੀ ਹੈ; ਸਾੜਨ ਨਾਲ ਕਦੇ ਵੀ ਤੁਲਨਾ ਕਰੋ।')}</p>${settingsHTML()}
  <p>${tr('Field, Plant and Underground change where you look. Acre / 100 g changes only the quantity basis. Tap a marker on the timeline to jump to that event.','ਖੇਤ, ਪੌਦਾ ਅਤੇ ਧਰਤੀ ਹੇਠ ਦੇਖਣ ਦੀ ਥਾਂ ਬਦਲਦੇ ਹਨ। ਏਕੜ / 100 g ਸਿਰਫ਼ ਮਾਤਰਾ ਦਾ ਆਧਾਰ ਬਦਲਦਾ ਹੈ। ਸਮਾਂ ਰੇਖਾ ਦੇ ਨਿਸ਼ਾਨ ਨੂੰ ਛੂਹ ਕੇ ਉਸ ਘਟਨਾ ਉੱਤੇ ਜਾਓ।')}</p><button class="action" data-sheet="evidence">${tr('Sources & model assumptions','ਸਰੋਤ ਅਤੇ ਮਾਡਲ ਦੀਆਂ ਧਾਰਨਾਵਾਂ')}</button>`;
}
function residueBody(){
  return `<p>${tr('Change the path while keeping the same date, weather and automatic care.','ਉਹੀ ਤਾਰੀਖ਼, ਮੌਸਮ ਅਤੇ ਦੇਖਭਾਲ ਰੱਖ ਕੇ ਰਾਹ ਬਦਲੋ।')}</p>`+['mulch','burn'].map(s=>`<button class="residue-option" data-residue="${s}" aria-pressed="${s===residueStrategy}">${tr(s==='mulch'?'Keep as mulch · chop, spread and sow wheat':'Burn straw · fire, smoke and ash',s==='mulch'?'ਮਲਚ ਵਜੋਂ ਰੱਖੋ · ਕੁਤਰਾ ਕਰੋ, ਵਿਛਾਓ ਅਤੇ ਕਣਕ ਬੀਜੋ':'ਪਰਾਲੀ ਸਾੜੋ · ਅੱਗ, ਧੂੰਆਂ ਅਤੇ ਸੁਆਹ')}</button>`).join('')+`<p>${tr('The baseline keeps straw as mulch. Closing this sheet keeps the current path.','ਮੂਲ ਰਾਹ ਵਿੱਚ ਪਰਾਲੀ ਮਲਚ ਵਜੋਂ ਹੈ। ਇਹ ਸ਼ੀਟ ਬੰਦ ਕਰਨ ਨਾਲ ਮੌਜੂਦਾ ਰਾਹ ਰਹਿੰਦਾ ਹੈ।')}</p>`;
}
function sheetBody(kind,v){
  switch(kind){
    case 'water':return waterDetails(v);
    case 'metrics':return metricsDetails(v);
    case 'soil':return soilDetails(v);
    case 'care':return careDetails(v);
    case 'fertilizer':case 'herbicide':case 'pest_control':return inputDetails(v,kind);
    case 'results':return resultsDetails();
    case 'comparison':return comparisonDetails();
    case 'evidence':return evidenceDetails(v);
    case 'residue':return residueBody();
    case 'ledger':return ledgerDetails(v);
    default:return menuBody();
  }
}
function refreshSheet(){
  const kind=Store.get().sheet;if(!kind)return;const v=current||Timeline.sample(result,flows,position),box=$('sheet-content'),top=box.scrollTop;
  $('sheet-title').textContent=tr(...(SHEET_TITLES[kind]||SHEET_TITLES.about));box.innerHTML=sheetBody(kind,v);box.scrollTop=top;
}
function openSheet(kind,{size}={}){
  pauseForUser();
  const was=Store.get().sheet;if(!was)sheetTrigger=document.activeElement;
  const el=$('sheet');el.hidden=false;el.dataset.size=size||(kind==='ledger'||kind==='comparison'||kind==='results'?'full':'half');
  Store.set({sheet:kind,...(kind==='ledger'?{view:'ledger'}:Store.get().view==='ledger'?{view:sceneView}:{})});
  refreshSheet();$('sheet-content').scrollTop=0;if(!was)requestAnimationFrame(()=>$('close-sheet').focus({preventScroll:true}));
}
function closeSheet(){
  if(!Store.get().sheet)return;$('sheet').hidden=true;Store.set({sheet:null,...(Store.get().view==='ledger'?{view:sceneView}:{})});
  const t=sheetTrigger;sheetTrigger=null;requestAnimationFrame(()=>{(t&&t.isConnected?t:$('menu')).focus({preventScroll:true});});
}
Store.subscribe((s,changed)=>{
  if('view' in changed)app.dataset.view=s.view;
  if('journey' in changed)app.dataset.journey=s.journey;
  if('sheet' in changed){app.dataset.sheet=s.sheet?'open':'closed';uiTime=0;}
});

/* ---------- view switching ---------- */
let sceneView='field';
function setView(view,{fromStory=false}={}){
  if(!VIEWS.includes(view))return;
  if(!fromStory)pauseForUser();
  if(view==='ledger'){openSheet('ledger');return;}
  sceneView=view;if(Store.get().sheet==='ledger')closeSheet();
  Store.set({view});uiTime=0;
}
function sceneMode(){return viewToScene[sceneView];}

/* ---------- residue, language, data ---------- */
function setResidue(strategy){residueStrategy=strategy;residueExplicit=true;result=comparisonCache[strategy]||(comparisonCache[strategy]=Sim.ideal({residueStrategy:strategy}));flows=Timeline.prepare(result);refreshPlanned();computeMarkers();renderMarkers();Scene3D.invalidate();current=Timeline.sample(result,flows,position);if(Store.get().sheet==='residue')closeSheet();uiTime=0;}
function toggleLanguage(){language=language==='en'?'pa':'en';savePref('fasl-language',language);applyLabels();renderMarkers();refreshSheet();}
function downloadData(){const blob=new Blob([JSON.stringify({mode:'managed_rotation',modelVersion:2,displayMode,view:sceneView,residueStrategy,soil:result.state.soil,seed:result.seed,scenario:result.scenario,assumptions:result.cfg,automaticPolicy:Sim.AUTO_CONFIG,decisions:result.actions,waterLedger:result.state.water,cropStates:result.state.cropStates},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='fasl-rotation.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

/* ---------- events ---------- */
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.view){setView(b.dataset.view);return;}
  if(b.dataset.unit){displayMode=b.dataset.unit;savePref('fasl-units',displayMode);uiTime=0;if(Store.get().sheet)refreshSheet();return;}
  if(b.dataset.scene){jump(b.dataset.scene==='rice'?0:Sim.wheatStart());return;}
  if(b.dataset.marker!==undefined){const m=markers[Number(b.dataset.marker)];jump(m.day);openSheet(MARKER_SHEET[m.kind]||'care');return;}
  if(b.dataset.sheet){openSheet(b.dataset.sheet);return;}
  if(b.dataset.residue){setResidue(b.dataset.residue);return;}
  if(b.dataset.watch){setResidue(b.dataset.watch);closeSheet();Store.set({journey:'explore',storyPaused:false});jump(121);playing=true;return;}
  switch(b.id){
    case 'start-story':beginStory();return;case 'explore':begin('explore');return;case 'replay':beginStory();return;
    case 'play':togglePlay();return;case 'resume-story':resumeStory();return;
    case 'chapter-next':gotoChapter(Store.get().chapter+1);return;case 'chapter-prev':gotoChapter(Store.get().chapter-1);return;
    case 'language':case 'language-toggle':toggleLanguage();return;case 'close-sheet':closeSheet();return;
    case 'change-residue':openSheet('residue');return;
    case 'theme':theme=theme==='system'?'light':theme==='light'?'dark':'system';savePref('fasl-theme',theme);applyTheme();refreshSheet();return;
    case 'motion':reduced=!reduced;if(reduced)playing=false;savePref('fasl-motion',reduced?'reduced':'full');app.dataset.reduced=reduced;uiTime=0;refreshSheet();return;
    case 'export':downloadData();return;
  }
});
$('timeline-slider').addEventListener('input',e=>jump(Number(e.target.value)));
$('timeline-slider').addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(e.key))return;e.preventDefault();
  if(e.key==='PageUp'||e.key==='PageDown'){const days=Story.list.map(c=>c.from),n=e.key==='PageDown'?days.find(d=>d>target+.5):[...days].reverse().find(d=>d<target-.5);jump(n===undefined?(e.key==='PageDown'?maxDay:0):n);return;}
  const step=e.shiftKey?7:1;jump(e.key==='Home'?0:e.key==='End'?maxDay:target+(['ArrowLeft','ArrowDown'].includes(e.key)?-1:1)*step);
});
$('home').addEventListener('click',e=>{e.preventDefault();playing=false;closeSheet();Store.set({journey:'welcome',chapter:-1,storyPaused:false,view:'field'});sceneView='field';harvestHold=null;position=target=0;uiTime=0;});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&Store.get().sheet){e.preventDefault();closeSheet();}});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(theme==='system')applyTheme();});
// Sheet handle: drag down to dismiss, drag up to expand.
(()=>{let y0=null;const h=$('sheet-handle');h.addEventListener('pointerdown',e=>{y0=e.clientY;h.setPointerCapture(e.pointerId);});h.addEventListener('pointerup',e=>{if(y0===null)return;const d=e.clientY-y0;y0=null;if(d>70)closeSheet();else if(d<-50)$('sheet').dataset.size='full';else if(Math.abs(d)<6)$('sheet').dataset.size=$('sheet').dataset.size==='full'?'half':'full';});})();
// Keep the canvas sized to the scene as the panel opens and closes.
new ResizeObserver(()=>Scene3D.resize()).observe($('scene-art'));new ResizeObserver(()=>renderMarkers()).observe($('scrub'));

buildMonthMarks();buildBands();computeMarkers();renderMarkers();

// Labels attached to scene points follow the camera every frame.
function positionAnnotations(){
  const el=$('plant-note'),on=Store.get().journey!=='welcome'&&sceneView==='plant'&&!current?.fallow,a=on?Scene3D.anchor('plantTop'):null;
  if(!a||!a.visible){el.hidden=true;return;}
  el.hidden=false;el.style.left=Math.round(a.x)+'px';el.style.top=Math.round(a.y)+'px';
}
