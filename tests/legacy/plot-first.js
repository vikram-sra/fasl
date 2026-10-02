async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8080/');await page.setViewportSize({width:390,height:844});
 const fixture=await page.evaluate(()=>({schemaVersion:'1.0',datasetVersion:'package-1.0',randomSeed:126826,scenario:'normal',horizon:0,decisions:{},runId:'plot-first-'+Date.now(),assumptions:Fieldnotes.Sim.CONFIG,autoPump:true}));
 await page.getByRole('button',{name:'Open game menu',exact:true}).click();await page.locator('#import-file').setInputFiles({name:'fixture.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture))});await page.waitForFunction(id=>Fieldnotes.getRun().runId===id,fixture.runId);
 let steps=0;while(await page.evaluate(()=>Fieldnotes.getRun().day<303)){
  if(++steps>340)throw Error('Unable to complete rotation');
  const pending=await page.evaluate(()=>Fieldnotes.getResult().state.checkpoints.find(c=>!c.resolved));
  if(pending){if(!await page.locator('#drawer').evaluate(d=>d.open))await page.locator('#field-step').click();const value=pending.key==='establish'?'sow':pending.key==='transplant'?'transplant':pending.key==='weed'?'manual':pending.key==='pest'?'monitor':pending.key==='water'?'auto':'full';await page.locator(`#drawer [data-key="${pending.key}"][data-choice="${value}"]`).click();}
  else await page.locator('#field-step').click();
 }
 await page.getByRole('button',{name:'Rice ਝੋਨਾ',exact:true}).click();await page.getByRole('button',{name:'Stage 9: Dough and ripening',exact:true}).click();
 for(const [w,h] of [[390,844],[390,667],[1440,1000]]){await page.setViewportSize({width:w,height:h});await page.waitForFunction(()=>document.querySelector('canvas').getBoundingClientRect().bottom===innerHeight);const okay=await page.evaluate(()=>getComputedStyle(document.querySelector('.control-panel')).display==='none'&&document.documentElement.scrollHeight===innerHeight&&document.documentElement.scrollWidth===innerWidth&&document.querySelector('.stages').getBoundingClientRect().bottom===innerHeight);if(!okay)throw Error('Layout failed');await page.screenshot({path:`output/playwright/plot-first-${w}-${h}.png`});}
 if(errors.length)throw Error(errors.join('\n'));return{fullRotation:true,steps,hiddenInfoPanel:true,layouts:3,noJavaScriptErrors:true};
}
