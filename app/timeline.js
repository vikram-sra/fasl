/* Read-only continuous presentation of a deterministic, automatically managed rotation. */
const Timeline=(()=>{
 const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),lerp=(a,b,t)=>a+(b-a)*t;
 const phase=(t,a,b)=>{const x=clamp((t-a)/(b-a));return x*x*(3-2*x);};
 function prepare(result){return result.snapshots.map(s=>{
  const balances=s.events.filter(e=>e.date===s.date&&e.type==='water_balance'),cropBalances=balances.filter(e=>e.cropId===s.cropId);
  return{...s.lastFlows,etPond:balances.reduce((n,e)=>n+e.fromPond,0),etSoil:balances.reduce((n,e)=>n+e.fromSoil,0),cropET:cropBalances.reduce((n,e)=>n+e.quantity,0),deep:balances.reduce((n,e)=>n+e.drainage,0),overflow:s.events.filter(e=>e.date===s.date&&e.type==='arrived_recharge').length?s.water.overflow-(s.day?result.snapshots[s.day-1].water.overflow:0):0};
 });}
 function sample(result,flows,position){
  const max=result.snapshots.length,p=clamp(position,0,max),day=Math.min(max-1,Math.floor(p)),f=p===max?1:p-day,s=result.snapshots[day],prev=day?result.snapshots[day-1]:Sim.initial(result.cfg),flow=flows[day],rainPhase=phase(f,0,.3),seepPhase=phase(f,.3,.65),etPhase=phase(f,.65,.9),drainPhase=phase(f,.9,1),arrivePhase=phase(f,0,.2);
  const pondBefore=prev.zones.reduce((n,z)=>n+z.pond,0),soilBefore=prev.zones.reduce((n,z)=>n+z.soil,0);
  const pond=pondBefore+(flow.rain+flow.pumped*Sim.H.conveyance_efficiency)*rainPhase-(flow.infiltration+flow.runoff)*seepPhase-flow.etPond*etPhase;
  const soil=soilBefore+flow.infiltration*seepPhase-flow.etSoil*etPhase-flow.deep*drainPhase;
  const aquifer=prev.aquifer-flow.pumped*rainPhase+(flow.recharge-flow.overflow)*arrivePhase;
  const id=s.cropId==='fallow'?'rice':s.cropId,das=id==='wheat'?p-Sim.wheatStart():p,def=Sim.cropDef(id),stage=def.stages.findLast(st=>das>=st.start_das)||def.stages[0];
  const points=[...def.stages.map((st,i)=>({day:st.start_das,height:[.09,.72,1.08,1.52,2.07,2.45,2.82,2.85,2.82,2.82][i],root:[.13,.31,.48,.62,.77,.9,1,1.05,1.12,1.12][i]}))];
  const i=Math.max(0,points.findLastIndex(k=>das>=k.day)),a=points[i],b=points[Math.min(i+1,points.length-1)],t=a===b?0:clamp((das-a.day)/(b.day-a.day));
  const c=s.cropStates[id],prior=prev.cropStates[id],water={},rotationWater={},allocationPhase=k=>['pumped','rain','spray','conveyance'].includes(k)?rainPhase:['recharge','overflow'].includes(k)?arrivePhase:k==='et'?etPhase:k==='runoff'?seepPhase:k==='deep'?drainPhase:f;for(const k of Object.keys(c.water)){water[k]=lerp(prior.water[k],c.water[k],allocationPhase(k));rotationWater[k]=lerp(prev.water[k],s.water[k],allocationPhase(k));}
  const totals={};for(const cat of ['fertilizer','herbicide','pest_control']){const sum=c=>c.products.filter(q=>q.category===cat).reduce((n,q)=>n+q.quantity,0);totals[cat]=lerp(sum(prior),sum(c),rainPhase);}
  return{position:p,day,fraction:f,s,previous:prev,id,das,stage,def,flow,pondL:Math.max(0,pond),soilL:Math.max(0,soil),aquiferL:Math.max(0,aquifer),pondDepthMm:Math.max(0,pond)/Sim.A,water,rotationWater,totals,
   soil:{...s.soil,...Object.fromEntries(['fertilizerN','residueKg','residueNReturned','residueNRemoved'].map(k=>[k,lerp(prev.soil?.[k]||0,s.soil[k],k==='fertilizerN'?rainPhase:f)]))},residueStrategy:result.residueStrategy,residueProgress:phase(p,121,125),residueCover:result.residueStrategy==='mulch'?phase(p,121,125)*Math.exp(-Math.max(0,p-121)/result.cfg.residue.decay_days):0,
   growth:{height:lerp(a.height,b.height,phase(t,0,1))/2.82,root:lerp(a.root,b.root,phase(t,0,1))/1.12,spread:lerp(.1,1,phase(das,0,55)),grain:phase(das,def.stages[6].start_das,def.stages[8].start_das),ripe:phase(das,def.stages[7].start_das,def.harvest_das),harvest:phase(das,def.harvest_das-1,def.harvest_das+1)},fallow:s.cropId==='fallow'};
 }
 return{prepare,sample,phase};
})();
