/* Presentation quantities are read-only allocations of the same acre. */
const Metrics=(()=>{
 function sample(result,v,mode='acre'){
  const cfg=result.cfg,pop=cfg.population,crop=result.state.cropStates[v.id],edibleKg=crop.edibleKg??crop.projectedYieldKg*v.def.processing.recovery.value;
  const scale=mode==='bowl'?(edibleKg>0?cfg.bowl_mass_kg/edibleKg:0):1;
  const target=v.id==='rice'?cfg.field_area_m2/(pop.rice_row_m*pop.rice_spacing_m)*pop.rice_seedlings_per_hill:cfg.field_area_m2*pop.wheat_plants_per_m2;
  const emergence=Timeline.phase(v.das,0,v.id==='rice'?5:10),harvest=Timeline.phase(v.das,v.def.harvest_das-1,v.def.harvest_das+1);
  const plants=v.fallow?0:target*emergence*(1-harvest);
  const tillers=plants*(1+(pop.max_shoots_per_plant[v.id]-1)*Timeline.phase(v.das,v.id==='rice'?27:15,v.id==='rice'?62:55));
  const formed=edibleKg*v.growth.grain,grain=v.fallow?edibleKg:formed;
  const productTotals={};for(const category of ['fertilizer','herbicide','pest_control']){productTotals[category]={};const c=v.s.cropStates[v.id],before=v.previous.cropStates[v.id];for(const unit of ['kg','g','mL']){const sum=c=>c.products.filter(p=>p.category===category&&p.unit===unit).reduce((n,p)=>n+p.quantity,0);const f=Timeline.phase(v.fraction,0,.3);productTotals[category][unit]=(sum(before)+(sum(c)-sum(before))*f)*scale;}}
  return {mode,scale,edibleKg,plants:plants*scale,shoots:tillers*scale,pumpedL:v.water.pumped*scale,rainL:v.water.rain*scale,etL:v.water.et*scale,grainKg:grain*scale,harvested:harvest>=.999||v.fallow,products:productTotals,water:Object.fromEntries(Object.entries(v.rotationWater).map(([k,n])=>[k,n*scale]))};
 }
 return {sample};
})();
