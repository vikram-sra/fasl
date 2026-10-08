async page=>{
 const checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));const ok=(b,m)=>{if(!b)throw Error(m);checks.push(m);};
 await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:8080/');await page.evaluate(()=>localStorage.clear());await page.reload();await page.waitForFunction(()=>window.Fieldnotes);await page.locator('[data-choose=rice]').click();await page.locator('#sow-seed').click();await page.waitForFunction(()=>Fieldnotes.getTimeline().journey==='guided');await page.locator('#play').click();
 const seek=async n=>{await page.locator('#timeline-slider').fill(String(n));await page.waitForFunction(n=>Fieldnotes.Scene3D.info().position===n,n);await page.waitForTimeout(150);};
 await seek(90);const state=await page.evaluate(()=>JSON.stringify(Fieldnotes.getResult().state));
 for(const [w,h] of [[390,844],[390,667],[320,568],[768,1024],[1440,1000]]){
  await page.setViewportSize({width:w,height:h});await page.waitForTimeout(150);
  const l=await page.evaluate(()=>{const scene=document.querySelector('#scene-art').getBoundingClientRect(),f=Fieldnotes.Scene3D.info(),footer=document.querySelector('footer').getBoundingClientRect();return{coverage:scene.height/innerHeight,overflow:document.documentElement.scrollWidth>innerWidth,soilVisible:f.soilScreenY>0&&f.soilScreenY>=scene.height*.64&&f.soilScreenY<=scene.height*.66,waterVisible:f.waterScreenY>f.soilScreenY&&f.waterScreenY<scene.height-20,inside:scene.bottom<=footer.top&&footer.bottom<=innerHeight+1,canvasHeight:document.querySelector('canvas').getBoundingClientRect().height===scene.height};});
  ok(!l.overflow&&l.soilVisible&&l.waterVisible&&l.inside&&l.canvasHeight,'Crop, soil and groundwater fit '+w+'×'+h+' '+JSON.stringify(l));ok(l.coverage>=(h===568?.63:h===667?.68:.73),'Scene dominates '+w+'×'+h);await page.screenshot({path:`output/playwright/crop-first-field-${w}-${h}.png`});
 }
 await page.setViewportSize({width:390,height:844});
 for(const day of [13.5,34.15,90,250]){
  await seek(day);
  for(const mode of ['acre','bowl']){
   await page.locator('[data-unit='+mode+']').click();await page.waitForTimeout(350);
   const f=await page.evaluate(()=>Fieldnotes.Scene3D.info());
   ok(Math.abs(f.soilScreenY/f.sceneHeight-.65)<.01&&f.waterScreenY<f.sceneHeight-20,'Shallow cutaway preserves groundwater at '+day+' '+mode);
   ok(f.displayedCropHeightPx/f.sceneHeight>.35,'Growing crop dominates phone scene at '+day+' '+mode);
   ok((f.tubewellBounds.bottom-f.tubewellBounds.top)/f.sceneHeight<.18,'Pump stays proportionate at '+day+' '+mode);
  }
 }
 for(const day of [0,34.15,90,150,250,304]){
  await seek(day);await page.locator('[data-unit=acre]').click();await page.waitForFunction(()=>Fieldnotes.getTimeline().metrics.mode==='acre');await page.waitForTimeout(350);const field=await page.evaluate(()=>({m:Fieldnotes.getTimeline().metrics,size:parseFloat(getComputedStyle(document.querySelector('#object-fertilizer svg')).height)}));
  await page.locator('[data-unit=bowl]').click();await page.waitForFunction(()=>Fieldnotes.Scene3D.info().quantityMode==='bowl'&&Fieldnotes.getTimeline().metrics.mode==='bowl');await page.waitForTimeout(350);
  const bowl=await page.evaluate(()=>({m:Fieldnotes.getTimeline().metrics,size:parseFloat(getComputedStyle(document.querySelector('#object-fertilizer svg')).height),scene:Fieldnotes.Scene3D.info(),objects:[...document.querySelectorAll('.input-object')].map(e=>({kind:e.id.replace('object-',''),q:Number(e.dataset.quantity),unit:e.dataset.amountUnit,fill:Number(e.dataset.fill)}))}));
  ok(bowl.size<field.size&&bowl.scene.viewMode==='bowl','100 g changes containers and crop framing at '+day);
  ok(Math.abs(bowl.m.pumpedL-field.m.pumpedL*bowl.m.scale)<1e-7,'Allocated pumping remains exact at '+day);
  ok(bowl.objects.every(o=>Math.abs(o.q-(o.kind==='water'?bowl.m.pumpedL:bowl.m.products[o.kind][o.unit]))<1e-8&&o.fill>=0&&o.fill<=1),'Objects match unit-specific cumulative ledgers at '+day);
  ok(await page.evaluate(n=>Fieldnotes.getTimeline().position===n,day),'Quantity switch preserves date '+day);
 }
 ok(await page.evaluate(s=>JSON.stringify(Fieldnotes.getResult().state)===s,state),'Presentation changes preserve simulation history');
 await seek(150);await page.waitForFunction(()=>Fieldnotes.Scene3D.info().zoomBlend<.02);ok(await page.locator('#harvest-reveal').isVisible(),'Between seasons retains a small harvest reference');const area=await page.evaluate(()=>{const a=document.querySelector('#harvest-reveal').getBoundingClientRect(),b=document.querySelector('#scene-art').getBoundingClientRect();return a.width*a.height/(b.width*b.height);});ok(area<.04,'Harvest reference occupies less than 4% of the scene');ok(await page.evaluate(()=>{const h=document.querySelector('#harvest-reveal').getBoundingClientRect(),s=document.querySelector('#scene-art').getBoundingClientRect(),p=Fieldnotes.Scene3D.info().tubewellBounds;return !(h.left<s.left+p.right&&h.right>s.left+p.left&&h.top<s.top+p.bottom&&h.bottom>s.top+p.top);}), 'Harvest reference keeps the tubewell visible');await page.screenshot({path:'output/playwright/crop-first-between.png'});
 await seek(90);await page.locator('#object-fertilizer').click();await page.locator('#annotation-details').click();ok((await page.locator('#drawer-content').textContent()).includes('Per 100 g dry rice'),'Input object opens its exact allocated product ledger');await page.keyboard.press('Escape');await page.waitForFunction(()=>document.activeElement.id==='object-fertilizer');ok(true,'Input details restore keyboard focus');
 await page.locator('.menu').click();await page.locator('#motion').click();await page.locator('[data-unit=acre]').click();await page.waitForFunction(()=>Fieldnotes.Scene3D.info().zoomBlend===1);await page.locator('[data-unit=bowl]').click();await page.waitForFunction(()=>Fieldnotes.Scene3D.info().zoomBlend===0);ok(true,'Reduced motion switches the scene immediately');const frames=await page.evaluate(()=>Fieldnotes.Scene3D.info().renderedFrames);await page.waitForTimeout(250);ok(await page.evaluate(n=>Fieldnotes.Scene3D.info().renderedFrames===n,frames),'Paused reduced scene stops repeated rendering');
 await page.locator('#language-toggle').click();await page.locator('.menu').click();await page.locator('#theme').click();await page.locator('#theme').click();await page.locator('#close-drawer').click();await page.waitForFunction(()=>Fieldnotes.Scene3D.info().theme==='dark');await seek(250);await page.screenshot({path:'output/playwright/crop-first-wheat-pa-dark.png'});ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.querySelector('#groundwater-marker').getBoundingClientRect().bottom<document.querySelector('footer').getBoundingClientRect().top),'Punjabi dark scene retains visible underground');
 ok(errors.length===0,'No browser errors');return{passed:checks.length,checks};
}
