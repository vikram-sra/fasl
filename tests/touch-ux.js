async page=>{
 const checks=[];const ok=(b,m)=>{if(!b)throw Error(m);checks.push(m)};
 await page.goto('http://127.0.0.1:8080/');await page.evaluate(()=>localStorage.clear());await page.reload();
 for(const [width,height] of [[320,568],[390,667],[390,844],[768,1024]]){
  await page.setViewportSize({width,height});
  ok(await page.locator('button:visible').count()===2,'Two home choices '+width);
  for(const selector of ['[data-choose=rice]','[data-choose=wheat]']){const b=await page.locator(selector).boundingBox();ok(b.width>=100&&b.height>=100,'Large crop target '+selector+' '+width);}
  await page.locator('[data-choose=rice]').click();const b=await page.locator('#sow-seed').boundingBox();ok(b.width>=200&&b.height>=200,'Large seed target '+width);await page.locator('#seed-back').click();
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.locator('[data-choose=wheat]').click();await page.locator('#sow-seed').click();await page.waitForFunction(()=>Fieldnotes.getTimeline().journey==='guided');ok(await page.evaluate(()=>Fieldnotes.getTimeline().sample.id==='wheat'),'Wheat starts in its own season');
 const b=await page.locator('#play').boundingBox();ok(b.width>=64&&b.height>=44,'Playback is a large touch target');await page.emulateMedia({reducedMotion:'no-preference'});return{passed:checks.length,checks};
}
