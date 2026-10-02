async page=>{
 await page.goto('http://127.0.0.1:8080/');await page.setViewportSize({width:390,height:844});
 const fixture=await page.evaluate(()=>({schemaVersion:'1.0',datasetVersion:'package-1.0',randomSeed:126826,scenario:'dry',horizon:0,decisions:{'0:establish':'sow','0:fert0':'skip','0:water':'auto'},runId:'lateral-events',assumptions:Fieldnotes.Sim.CONFIG,autoPump:true}));
 await page.getByRole('button',{name:'Open game menu',exact:true}).click();await page.locator('#import-file').setInputFiles({name:'fixture.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture))});
 if(await page.evaluate(()=>document.body.classList.contains('reduced'))){await page.getByRole('button',{name:'Open game menu',exact:true}).click();await page.locator('#toggle-motion').click();await page.locator('#close-drawer').click();}
 await page.waitForFunction(()=>Fieldnotes.getRun().runId==='lateral-events');
 let rain=false,pump=false,changed=false;
 for(let i=0;i<95&&(!rain||!pump);i++){
  const pending=await page.evaluate(()=>Fieldnotes.getResult().state.checkpoints.find(c=>!c.resolved));
  if(pending){const value=pending.key==='establish'?'sow':pending.key==='transplant'?'transplant':pending.key==='weed'?'manual':'skip';await page.locator(`[data-key="${pending.key}"][data-choice="${value}"]`).click();continue;}
  await page.locator('#next-day').click();
  const state=await page.evaluate(()=>({flow:Fieldnotes.getResult().state.lastFlows,info:Fieldnotes.Scene3D.info()}));
  if(state.flow.rain>0){await page.waitForFunction(()=>Fieldnotes.Scene3D.info().rainAnimating);rain=true;await page.screenshot({path:'output/playwright/lateral-rain.png'});}
  if(state.flow.pumped>0){await page.waitForFunction(()=>Fieldnotes.Scene3D.info().pumpAnimating);pump=true;changed=state.info.waterSurface!==state.info.waterGoal;await page.screenshot({path:'output/playwright/lateral-pumping.png'});}
 }
 if(!rain||!pump||!changed)throw Error('Rain, auto-pump or moving water level missing');
 await page.locator('#auto-pump').click();const nextDay=await page.evaluate(()=>Fieldnotes.getRun().day+1);await page.locator('#next-day').click();
 if(await page.evaluate(d=>Fieldnotes.getRun().actions[d+':water']==='auto',nextDay))throw Error('Off controller still schedules automatic irrigation');
 await page.getByRole('button',{name:'Stage 9: Dough and ripening',exact:true}).click();
 for(const [width,height] of [[390,844],[390,667],[1440,1000]]){
  await page.setViewportSize({width,height});
  await page.waitForFunction(()=>document.querySelector('canvas').getBoundingClientRect().width===innerWidth&&document.querySelector('canvas').getBoundingClientRect().bottom===innerHeight);
  const layout=await page.evaluate(()=>{const c=document.querySelector('canvas').getBoundingClientRect(),st=document.querySelector('.stages').getBoundingClientRect(),b=[...document.querySelectorAll('.stage-button')].map(x=>x.getBoundingClientRect());return{canvas:c.bottom===innerHeight&&c.width===innerWidth,footer:st.bottom===innerHeight,horizontal:b.every((x,i)=>i===0||x.left>b[i-1].left),scroll:document.documentElement.scrollWidth===innerWidth&&document.documentElement.scrollHeight===innerHeight};});
  if(!Object.values(layout).every(Boolean))throw Error(JSON.stringify(layout));
  await page.screenshot({path:`output/playwright/lateral-${width}-${height}.png`});
 }
 return{rain,pump,waterLevelMoving:changed,autoOff:true,responsiveLayouts:3};
}
