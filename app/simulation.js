'use strict';
const Sim = (() => {
  const clone = v => JSON.parse(JSON.stringify(v));
  const CONFIG = {...clone(DATA.model_assumptions), demonstration: {
    startDate: '2027-06-08', wheatDate: '2027-11-10', seed: 126826,
    firstNitrogenLatestDAS:35, secondNitrogenEarliestDAS:42,
    nurseryEstablishmentWeight:0.05, initialWeedPressure:0.08,
    initialPestPressure:0.15, wheatCarrierFullAcreL:90,
    wheatBorderFraction:0.25, compositions:{urea:0.46,DAP:0.18},
    weedOnsetRiceDAS:29, weedOnsetWheatDAS:32
  }};
  const AUTO_CONFIG={nurserySoilTriggerMm:75,riceEstablishmentPondTriggerMm:10,riceLaterSoilTriggerMm:90,riceDryPondDays:2,wheatSoilTriggerMm:75,wheatMinIntervalDays:7,status:'illustrative automatic irrigation policy; not field guidance'};
  const MS=86400000, A=CONFIG.field_area_m2, H=CONFIG.hydrology;
  const dateAt=(day,cfg=CONFIG)=>new Date(Date.parse(cfg.demonstration.startDate+'T00:00:00Z')+day*MS).toISOString().slice(0,10);
  const wheatStart=(cfg=CONFIG)=>Math.round((Date.parse(cfg.demonstration.wheatDate+'T00:00:00Z')-Date.parse(cfg.demonstration.startDate+'T00:00:00Z'))/MS);
  const endDay=(cfg=CONFIG)=>wheatStart(cfg)+DATA.crops.crops[1].harvest_das;
  const cropDef=id=>DATA.crops.crops.find(c=>c.id===id);
  function random(seed){let n=seed>>>0;return()=>{n=(n+0x6D2B79F5)>>>0;let t=n;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
  function hash(seed,str){let h=seed>>>0;for(const c of str)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h;}
  function weather(seed,scenario='normal',cfg=CONFIG){
    const result={}, first=new Date(cfg.demonstration.startDate+'T00:00:00Z'), last=new Date(dateAt(endDay(cfg),cfg)+'T00:00:00Z');
    for(let y=first.getUTCFullYear();y<=last.getUTCFullYear();y++)for(let m=0;m<12;m++){
      const rng=random(hash(seed,`weather:${y}:${m}`)), normal=DATA.rainfall.months[m], count=Math.max(1,Math.round(normal.mean_rainy_days));
      const days=Array.from({length:new Date(Date.UTC(y,m+1,0)).getUTCDate()},(_,i)=>i+1);
      for(let i=days.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[days[i],days[j]]=[days[j],days[i]];}
      const picked=days.slice(0,count).sort((a,b)=>a-b), weights=picked.map(()=>0.1+rng()), total=normal.rain_mm*cfg.dry_wet_rain_multipliers[scenario], sum=weights.reduce((a,b)=>a+b,0);let allocated=0;
      picked.forEach((d,i)=>{const amount=i===count-1?total-allocated:total*weights[i]/sum;allocated+=amount;result[`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`]=amount;});
    }return result;
  }
  const ledger=()=>({rain:0,pumped:0,spray:0,et:0,runoff:0,conveyance:0,deep:0,recharge:0,overflow:0});
  const cropState=id=>({id,harvested:false,established:true,referenceYieldKg:cropDef(id).reference_yield.value,projectedYieldKg:cropDef(id).reference_yield.value,actualYieldKg:null,edibleKg:null,etPotential:0,etDeficit:0,nutrientDeficits:[],nurseryDeficits:[],weed:0,pest:0,weedIntegral:0,pestIntegral:0,cropDays:0,pondDryDays:0,scouted:false,pestOccurred:false,pestDecisionMade:false,weedManaged:false,ureaTriggers:[],irrigationDays:[],products:[],water:ledger(),stressIntegrals:{}});
  function initial(cfg){return{day:-1,date:dateAt(0,cfg),aquifer:cfg.hydrology.aquifer_initial_L,zones:[{area:160,soil:160*cfg.hydrology.initial_soil_mm,pond:0,crop:'rice'},{area:cfg.field_area_m2-160,soil:(cfg.field_area_m2-160)*cfg.hydrology.initial_soil_mm,pond:0,crop:'fallow'}],pending:[],water:ledger(),cropStates:{rice:cropState('rice'),wheat:cropState('wheat')},events:[],processed:{},checkpoints:[],balanceError:0,maxBalanceError:0,lastFlows:{rain:0,pumped:0,recharge:0,drainage:0,runoff:0,et:0,infiltration:0,queuedRecharge:0},initialStocks:cfg.hydrology.aquifer_initial_L+cfg.field_area_m2*cfg.hydrology.initial_soil_mm};}
  const stocks=s=>s.aquifer+s.zones.reduce((v,z)=>v+z.soil+z.pond,0)+s.pending.reduce((v,q)=>v+q.litres,0);
  const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
  function yieldFor(c,cfg=CONFIG){const o=cfg.outcome,water=c.etPotential?c.etDeficit/c.etPotential:0,nutrient=c.nutrientDeficits.length?c.nutrientDeficits.reduce((a,b)=>a+b,0)/c.nutrientDeficits.length:0,nursery=c.nurseryDeficits.length?c.nurseryDeficits.reduce((a,b)=>a+b,0)/c.nurseryDeficits.length:0;
    const appliedN=c.products.filter(p=>p.category==='fertilizer'&&p.zone!=='nursery').reduce((v,p)=>v+(cfg.demonstration.compositions[p.product]||0)*p.quantity,0),baseline=c.id==='rice'?90*0.46:90*0.46+55*0.18;
    const excess=Math.min(o.excess_n_max_penalty,o.excess_n_max_penalty*Math.max(0,appliedN/baseline-1));
    const weed=c.cropDays?c.weedIntegral/c.cropDays:0,pest=c.cropDays?c.pestIntegral/c.cropDays:0;
    const multiplier=c.established?clamp(1-o.water_stress_weight*water-o.nutrient_stress_weight*nutrient-cfg.demonstration.nurseryEstablishmentWeight*nursery-o.weed_stress_weight*weed-o.pest_stress_weight*pest-excess):0;
    return {kg:c.referenceYieldKg*multiplier,multiplier,water,nutrient,weed,pest,excess,nursery};
  }
  const options={establish:['sow','unsown'],fert:['full','half','skip','double'],weed:['manual','monitor','chemical'],pest:['monitor','chemical'],water:['25','50','75','wait','auto'],scout:['inspect']};
  const key=(d,k)=>`${d}:${k}`;
  function irrigationNeed(s,id,das,zone,cfg=CONFIG){
    const c=s.cropStates[id],h=cfg.hydrology;if(!c?.established||c.harvested||s.aquifer<=0||!zone)return 0;
    const soil=(zone.soil+Math.min(zone.pond,Math.max(0,h.soil_capacity_mm*zone.area-zone.soil)))/zone.area,pond=zone.pond/zone.area;
    if(id==='rice'){
      if(das<27)return soil<AUTO_CONFIG.nurserySoilTriggerMm?25:0;
      if(das>=106)return 0;
      if(das<41)return pond<AUTO_CONFIG.riceEstablishmentPondTriggerMm?Math.max(0,h.rice_refill_target_pond_mm-pond):0;
      return c.pondDryDays>=AUTO_CONFIG.riceDryPondDays&&soil<AUTO_CONFIG.riceLaterSoilTriggerMm?h.rice_refill_target_pond_mm:0;
    }
    const last=c.irrigationDays.at(-1);if(last!==undefined&&das-last<AUTO_CONFIG.wheatMinIntervalDays)return 0;
    return soil<AUTO_CONFIG.wheatSoilTriggerMm?(last===undefined?h.wheat_first_event_mm:75):0;
  }
  function reduce(state,event,context){
    if(event.type!=='day'||state.processed[event.id])return state;
    const {cfg,actions,weather:rainfall,seed}=context,h=cfg.hydrology,area=cfg.field_area_m2,day=event.day,date=dateAt(day,cfg),ws=wheatStart(cfg),id=day<=120?'rice':day>=ws?'wheat':'fallow',das=id==='wheat'?day-ws:day;
    const s={...state,day,date,zones:state.zones.map(z=>({...z})),pending:state.pending.map(q=>({...q})),water:{...state.water},cropStates:clone(state.cropStates),events:[...state.events],processed:{...state.processed,[event.id]:true},checkpoints:[],lastFlows:{rain:0,pumped:0,recharge:0,drainage:0,runoff:0,et:0,infiltration:0,queuedRecharge:0}};
    const before=stocks(state),c=id==='fallow'?null:s.cropStates[id],choice=k=>actions[key(day,k)];
    const addEvent=(type,quantity,unit,extra={})=>s.events.push({id:`${date}:${type}:${s.events.length}`,date,cropId:id,type,quantity,unit,sourceIds:[],status:'simulation',...extra});
    const flow=(name,litres,owner=id)=>{s.water[name]+=litres;if(owner!=='fallow')s.cropStates[owner].water[name]+=litres;if(name in s.lastFlows)s.lastFlows[name]+=litres;};
    s.pending=s.pending.filter(q=>{if(q.day>day)return true;const accepted=Math.min(q.litres,h.aquifer_capacity_L-s.aquifer),overflow=q.litres-accepted;s.aquifer+=accepted;flow('recharge',accepted,q.crop);flow('overflow',overflow,q.crop);addEvent('arrived_recharge',accepted,'L',{cropId:q.crop});return false;});
    if(day===27||day===121||day===ws){s.zones=[{area,soil:s.zones.reduce((v,z)=>v+z.soil,0),pond:s.zones.reduce((v,z)=>v+z.pond,0),crop:day===27?'rice':day===ws?'wheat':'fallow'}];}
    function checkpoint(kind,title,detail,values,extra={}){s.checkpoints.push({key:kind,title,detail,values,resolved:choice(kind)!==undefined,...extra});}
    function fertilizer(k,title,products,zone='field'){
      const fraction={full:1,half:0.5,skip:0,double:2}[choice(k)]??0;
      checkpoint(k,title,'Source baseline. More input cannot exceed reference yield; a missed deadline remains a deficit.',options.fert,{category:'fertilizer',products,zone});
      const deficit=1-Math.min(1,fraction);(zone==='nursery'?c.nurseryDeficits:c.nutrientDeficits).push(deficit);
      products.forEach(p=>{if(!fraction)return;const entry={id:key(day,k)+':'+p.product,date,cropId:id,category:'fertilizer',product:p.product,quantity:p.kg*fraction,unit:'kg',zone,sourceIds:p.sources,userDecisionId:key(day,k),status:'source_rate_scaled'};c.products.push(entry);addEvent('product',entry.quantity,'kg',entry);});
    }
    if(c){
      if(das===0){checkpoint('establish',id==='rice'?'Begin in the seedbed':'Sow the next season',id==='rice'?'Your nursery occupies 160 m² inside this same acre. The rest remains fallow.':'The soil and aquifer carry the memory of rice and fallow.',options.establish);c.established=choice('establish')!=='unsown';}
      if(id==='rice'){
        if(day===0)fertilizer('fert0','Prepare nursery nutrition',[{product:'urea',kg:26*160/area,sources:['PAU_K26']},{product:'SSP',kg:60*160/area,sources:['PAU_K26']},{product:'zinc_sulphate_21',kg:40*160/area,sources:['PAU_K26']}],'nursery');
        if(day===14)fertilizer('fert14','Nursery nitrogen',[{product:'urea',kg:26*160/area,sources:['PAU_K26']}],'nursery');
        if(day===27)checkpoint('transplant','Move seedlings to the field','Soil water is merged by volume; this is the same acre.', ['transplant']);
        if([34,48,62].includes(day))fertilizer('fert'+day,'Split nitrogen · '+(day-27)+' DAT',[{product:'urea',kg:30,sources:['PAU_K26','PAU_RICE26']}]);
      }else{
        if(das===0)fertilizer('dap','Basal phosphorus route',[{product:'DAP',kg:55,sources:['PAU_R25']}]);
      }
    }
    let rain=rainfall[date]||0;
    for(const z of s.zones){const r=rain*z.area;z.pond+=r;flow('rain',r,z.crop);addEvent('rain',r,'L',{cropId:z.crop,zoneAreaM2:z.area,rainMm:rain,sourceIds:['IMD_LDH'],status:'normal_with_synthetic_timing'});}
    function pump(net,zone,isSpray=false){const gross=Math.min(s.aquifer,net/h.conveyance_efficiency);s.aquifer-=gross;const delivered=gross*h.conveyance_efficiency;zone.pond+=delivered;flow('pumped',gross);flow('conveyance',gross-delivered);if(isSpray)flow('spray',delivered);addEvent(isSpray?'spray_carrier':'pumping',gross,'L',{waterSource:'aquifer',zoneAreaM2:zone.area,userDecisionId:key(day,'water')});return delivered;}
    const active=s.zones.find(z=>z.crop===id);
    if(c&&active){
      const auto=choice('water')==='auto',depth=auto?irrigationNeed(s,id,das,active,cfg):['25','50','75'].includes(choice('water'))?Number(choice('water')):0;if(depth>0){const delivered=pump(depth*active.area,active);if(delivered>0){c.irrigationDays.push(das);s.events.at(-1).automatic=auto;s.events.at(-1).requestedNetDepthMm=depth;}}
      const weedDay=id==='rice'?cfg.demonstration.weedOnsetRiceDAS:cfg.demonstration.weedOnsetWheatDAS;
      if(das===weedDay){c.weed=cfg.demonstration.initialWeedPressure;checkpoint('weed','Make room for the crop','Inspected weed scenario. Manual removal has unmodelled labour; chemical examples remain conditional.',options.weed,{category:'herbicide'});}
      const pestEligible=id==='rice'?das>=27&&das<=62:das>=100&&das<=125;
      if(!c.pestOccurred&&pestEligible&&random(hash(seed,`pest:${id}:${date}`))()<cfg.outcome.pest_event_probability_per_eligible_day){c.pestOccurred=true;c.scouted=false;c.pest=cfg.demonstration.initialPestPressure;addEvent('pest_scenario',c.pest,'pressure',{status:'game_assumption'});}
      if(choice('scout')==='inspect'){c.scouted=true;addEvent('scout',0,'none');}
      if(c.pest>0&&!c.pestDecisionMade)checkpoint('pest','Scout before choosing a response',c.scouted?(id==='rice'?'White-backed planthopper scenario detected. This example does not treat leaf folder or fungal disease.':'Aphid scenario above the source threshold (5 per earhead); this is a scenario label, not a measured count.'):'An uncertain crop-health signal. Inspect the field to identify it.',options.pest,{category:'pest_control',resolved:choice('pest')!==undefined||c.scouted&&c.pest<0.1});
      const chemical=(opt,fraction=1)=>{
        const source=DATA.inputs.conditional_options.find(o=>o.id===opt),carrier=Array.isArray(source.spray_water_L_per_acre)?cfg.demonstration.wheatCarrierFullAcreL:source.spray_water_L_per_acre||0;
        // A partial/empty pump cannot silently create a full spray carrier or application.
        const wanted=carrier*fraction,delivered=wanted?pump(wanted,active,true):0,actualFraction=wanted?fraction*(delivered/wanted):fraction;
        if(!actualFraction)return 0;
        const entry={id:key(day,opt),date,cropId:id,category:source.category,product:source.formulation,productId:source.id,quantity:source.amount*actualFraction,unit:source.unit.split('/')[0],sourceIds:source.source_ids,treatedAreaFraction:actualFraction,sprayWaterL:delivered,sandKg:source.carrier?.amount*actualFraction||0,userDecisionId:key(day,source.category==='herbicide'?'weed':'pest'),status:'source_example_not_current_guidance'};c.products.push(entry);addEvent('product',entry.quantity,entry.unit,entry);return actualFraction;
      };
      if(choice('weed')==='manual'){c.weed*=cfg.outcome.control_remaining_pressure_factor;c.weedManaged=true;addEvent('manual_weeding',0,'none');}
      if(choice('weed')==='chemical'&&das===weedDay&&(id==='rice'||c.irrigationDays.length)){const applied=chemical(id==='rice'?'rice_pretilachlor':'wheat_pinoxaden');if(applied){c.weed*=1-(1-cfg.outcome.control_remaining_pressure_factor)*applied;c.weedManaged=true;}}
      if(choice('pest')==='monitor')c.pestDecisionMade=true;
      if(choice('pest')==='chemical'&&c.scouted&&c.pest>0){const fraction=id==='wheat'?cfg.demonstration.wheatBorderFraction:1,applied=chemical(id==='rice'?'rice_wbph':'wheat_aphid',fraction);if(applied){c.pest*=1-(1-cfg.outcome.control_remaining_pressure_factor)*(applied/fraction);c.pestDecisionMade=true;}}
      if(id==='wheat'){
        const irrigationTrigger=c.irrigationDays.some(d=>d>=20),first=c.ureaTriggers.length===0&&(irrigationTrigger||das>=cfg.demonstration.firstNitrogenLatestDAS),second=c.ureaTriggers.length===1&&((das>=cfg.demonstration.secondNitrogenEarliestDAS&&c.irrigationDays.some(d=>d>c.ureaTriggers[0]))||das>=55);
        if(first||second){const k=first?'urea1':'urea2';fertilizer(k,first?'Nitrogen at first irrigation':'Second nitrogen · latest DAS 55',[{product:'urea',kg:45,sources:['PAU_R25']}]);c.ureaTriggers.push(das);}
      }
      if(das===28&&id==='wheat')checkpoint('water','First irrigation review','PAU timing: about DAS 28. Model event depth 50 mm is an assumption; rain can justify waiting.',options.water);
    }
    for(const z of s.zones){
      const paddy=z.crop==='rice'&&day>=27&&day<=120,pondCap=paddy?h.paddy_pond_capacity_mm*z.area:0;
      const infiltration=Math.min(z.pond,h.daily_infiltration_limit_mm*z.area,Math.max(0,h.soil_capacity_mm*z.area-z.soil));z.pond-=infiltration;z.soil+=infiltration;s.lastFlows.infiltration+=infiltration;
      const runoff=Math.max(0,z.pond-pondCap);z.pond-=runoff;flow('runoff',runoff,z.crop);
      const monthly=new Date(date+'T00:00:00Z').getUTCMonth(),potential=h.monthly_reference_et_mm_day[monthly]*h.crop_demand_multiplier[z.crop]*z.area;
      const fromPond=Math.min(z.pond,potential);z.pond-=fromPond;const fromSoil=Math.min(z.soil,potential-fromPond);z.soil-=fromSoil;flow('et',fromPond+fromSoil,z.crop);
      if(z.crop!=='fallow'){const cc=s.cropStates[z.crop];cc.etPotential+=potential;cc.etDeficit+=potential-fromPond-fromSoil;}
      const drain=Math.min(Math.max(0,z.soil-h.soil_drainage_threshold_mm*z.area),h.daily_drainage_limit_mm*z.area);z.soil-=drain;const queued=drain*h.recharge_fraction_of_drainage;flow('deep',drain-queued,z.crop);s.lastFlows.drainage+=drain;s.lastFlows.queuedRecharge+=queued;if(queued)s.pending.push({day:day+h.recharge_lag_days,litres:queued,crop:z.crop});
      addEvent('water_balance',fromPond+fromSoil,'L',{cropId:z.crop,zoneAreaM2:z.area,potentialET:potential,fromPond,fromSoil,infiltration,runoff,drainage:drain,queuedRecharge:queued,status:'game_assumption'});
    }
    if(c){
      if(id==='rice'&&day>=27)c.pondDryDays=s.zones.find(z=>z.crop==='rice')?.pond>0?0:c.pondDryDays+1;
      c.cropDays++;c.weedIntegral+=c.weed;c.pestIntegral+=c.pest;
      if(c.weed>0&&!c.weedManaged)c.weed=clamp(c.weed+cfg.outcome.unmanaged_weed_growth_per_day);
      if(c.pest>0)c.pest=clamp(c.pest+cfg.outcome.unmanaged_pest_growth_per_day);
      c.stressIntegrals=yieldFor(c,cfg);c.projectedYieldKg=c.stressIntegrals.kg;
      if(das===cropDef(id).harvest_das){c.harvested=true;c.actualYieldKg=c.projectedYieldKg;c.edibleKg=c.actualYieldKg*cropDef(id).processing.recovery.value;addEvent('harvest',c.actualYieldKg,'kg',{sourceIds:cropDef(id).reference_yield.source_ids,status:'illustrative_yield_model'});}
    }
    const lossNames=['et','runoff','conveyance','deep','overflow'],out=lossNames.reduce((v,k)=>v+s.water[k]-state.water[k],0);
    s.balanceError=stocks(s)-before-(s.water.rain-state.water.rain)+out;s.maxBalanceError=Math.max(s.maxBalanceError,Math.abs(s.balanceError));
    s.cropId=id;s.das=das;s.rainMm=rain;return s;
  }
  function simulate({seed=CONFIG.demonstration.seed,scenario='normal',day=0,actions={},cfg=CONFIG}={}){const rain=weather(seed,scenario,cfg),snapshots=[];let state=initial(cfg);for(let d=0;d<=day;d++){state=reduce(state,{type:'day',id:'day:'+d,day:d},{cfg,actions,weather:rain,seed});snapshots.push(state);}return {state,snapshots,weather:rain};}
  function ideal({seed=CONFIG.demonstration.seed,scenario='normal',cfg=CONFIG}={}){
    const rain=weather(seed,scenario,cfg),actions={},snapshots=[];let state=initial(cfg);
    for(let day=0;day<=endDay(cfg);day++){
      if(day<=120||day>=wheatStart(cfg))actions[key(day,'water')]='auto';
      const context={cfg,actions,weather:rain,seed},event={type:'day',id:'day:'+day,day};
      const preview=reduce(state,event,context);
      for(const cp of preview.checkpoints){
        const value=cp.key==='establish'?'sow':cp.key==='transplant'?'transplant':cp.key==='water'?'auto':cp.key==='pest'?'chemical':cp.key==='weed'?(preview.cropId==='wheat'&&!preview.cropStates.wheat.irrigationDays.length?'manual':'chemical'):'full';
        actions[key(day,cp.key)]=value;if(cp.key==='pest')actions[key(day,'scout')]='inspect';
      }
      state=reduce(state,event,context);snapshots.push(state);
    }
    return{state,snapshots,weather:rain,actions,seed,scenario,cfg};
  }
  function allocation(c,cfg=CONFIG){const kg=c.harvested?c.edibleKg:c.projectedYieldKg*cropDef(c.id).processing.recovery.value,bowls=kg/cfg.bowl_mass_kg;return{kg,bowls,pumpedPerBowl:bowls>0?c.water.pumped/bowls:null,product:(q,unit)=>bowls>0?(unit==='kg'?q*1000:q)/bowls:null};}
  function validateImport(raw){
    if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Choose a game JSON exported by this application.');
    function inspect(v,depth=0){if(depth>35)throw Error('JSON is too deeply nested.');if(typeof v==='number'&&(!Number.isFinite(v)||v<0))throw Error('Negative or nonfinite quantities are not allowed.');if(v&&typeof v==='object'){for(const [k,x]of Object.entries(v)){if(['__proto__','constructor','prototype'].includes(k))throw Error('Unsafe JSON key.');inspect(x,depth+1);}}}inspect(raw);
    if(raw.schemaVersion!=='1.0'||raw.datasetVersion!=='package-1.0')throw Error('Unsupported schema or dataset version.');
    if(!Number.isInteger(raw.randomSeed)||raw.randomSeed>4294967295||!Number.isInteger(raw.horizon)||raw.horizon>endDay())throw Error('Invalid seed or calendar horizon.');
    if(!['normal','dry','wet'].includes(raw.scenario)||JSON.stringify(raw.assumptions)!==JSON.stringify(CONFIG))throw Error('Unknown scenario or modified assumptions. This edition requires its named configuration.');
    if(!raw.decisions||typeof raw.decisions!=='object'||Array.isArray(raw.decisions)||Object.keys(raw.decisions).length>5000)throw Error('Invalid decisions.');
    for(const [k,v]of Object.entries(raw.decisions)){const match=/^(\d+):(establish|transplant|fert0|fert14|fert34|fert48|fert62|dap|urea1|urea2|weed|pest|water|scout)$/.exec(k);if(!match||Number(match[1])>raw.horizon)throw Error('Invalid decision date or type.');const group=match[2].startsWith('fert')||['dap','urea1','urea2'].includes(match[2])?'fert':match[2];if(!(options[group]||(group==='transplant'?['transplant']:[])).includes(v))throw Error('Invalid decision choice.');}
    return{seed:raw.randomSeed,scenario:raw.scenario,day:raw.horizon,actions:clone(raw.decisions),runId:typeof raw.runId==='string'?raw.runId.slice(0,80):'imported',branchParent:typeof raw.branchParent==='string'?raw.branchParent.slice(0,80):null,activeScene:['rice','wheat'].includes(raw.activeScene)?raw.activeScene:'rice',displayMode:raw.displayMode==='acre'?'acre':'bowl',autoPump:raw.autoPump!==false};
  }
  return{CONFIG,AUTO_CONFIG,irrigationNeed,A,H,MS,clone,random,weather,dateAt,wheatStart,endDay,cropDef,initial,reduce,simulate,ideal,stocks,yieldFor,allocation,validateImport,options,key};
})();
if(typeof module!=='undefined')module.exports={Sim,DATA};
