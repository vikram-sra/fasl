async page=>{
 const checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/ERR_CONNECTION|favicon/.test(m.text()))errors.push(m.text());});
 const ok=(b,m)=>{if(!b)throw Error('FAIL: '+m);checks.push(m);};
 const ready=async()=>{await page.goto('http://127.0.0.1:8080/');await page.evaluate(()=>localStorage.clear());await page.reload();await page.waitForFunction(()=>window.Fieldnotes&&Fieldnotes.Scene3D.info().renderer);};
 await page.setViewportSize({width:390,height:844});await ready();
 // welcome → explore
 ok(await page.locator('#start-story').isVisible(),'welcome shows Play story');
 await page.locator('#explore').click();
 const state=()=>page.evaluate(()=>Fieldnotes.getTimeline());
 const seek=async n=>{await page.locator('#timeline-slider').fill(String(n));await page.waitForFunction(n=>Math.abs(Fieldnotes.getTimeline().position-n)<.01,n);await page.waitForTimeout(250);};
 await seek(95);
 // layout at several viewports
 for(const [w,h] of [[390,844],[320,568],[768,1024],[1440,1000]]){
  await page.setViewportSize({width:w,height:h});await page.waitForTimeout(300);
  const l=await page.evaluate(()=>{const s=document.querySelector('.scene').getBoundingClientRect(),d=document.getElementById('dock').getBoundingClientRect();return{overflow:document.documentElement.scrollWidth>innerWidth,sceneShare:s.height/innerHeight,dockInside:d.bottom<=innerHeight+1&&d.left>=0&&d.right<=innerWidth+1,canvas:document.querySelector('canvas').getBoundingClientRect().height>=s.height-1};});
  ok(!l.overflow,'no horizontal overflow at '+w+'x'+h);ok(l.dockInside,'dock inside viewport at '+w+'x'+h);ok(l.canvas,'canvas fills scene at '+w+'x'+h);
  if(w>=390&&h>=800)ok(l.sceneShare>.62,'scene takes most of the phone height ('+l.sceneShare.toFixed(2)+')');
 }
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(200);
 // views change the scene mode, never the units; units never change the view
 const modes={};
 for(const v of ['field','plant','underground']){await page.locator(`#views [data-view=${v}]`).click();await page.waitForTimeout(400);const s=await state();modes[v]=s.viewMode;ok(s.view===v,'view button selects '+v);ok(s.displayMode==='acre','view '+v+' leaves units alone');}
 ok(modes.field==='acre'&&modes.plant==='plant'&&modes.underground==='section','views map to distinct scene modes');
 const world=await page.evaluate(()=>Fieldnotes.Scene3D.info().world);
 await page.locator('#views [data-view=field]').click();await page.waitForTimeout(500);
 ok((await page.evaluate(()=>Fieldnotes.Scene3D.info().world.active)),'Field uses the perspective world');
 await page.locator('#views [data-view=underground]').click();await page.waitForTimeout(500);
 ok(!(await page.evaluate(()=>Fieldnotes.Scene3D.info().world.active)),'Underground uses the sectional camera');
 const before=(await state()).view;await page.locator('[data-unit=bowl]').click();await page.waitForTimeout(300);
 const after=await state();ok(after.view===before&&after.displayMode==='bowl','unit switch changes quantities, not the view');
 await page.locator('[data-unit=acre]').click();
 // sheet open/close and focus return
 await page.locator('#metrics-button').focus();await page.locator('#metrics-button').click();await page.waitForTimeout(400);
 ok((await state()).sheet==='metrics','metrics sheet opens');
 ok(await page.evaluate(()=>document.activeElement.id==='close-sheet'),'focus moves into the sheet');
 await page.keyboard.press('Escape');await page.waitForTimeout(400);
 ok((await state()).sheet===null,'Escape closes the sheet');
 ok(await page.evaluate(()=>document.activeElement.id==='metrics-button'),'focus returns to the trigger');
 // ledger equals the metric sample
 await page.locator('#views [data-view=ledger]').click();await page.waitForTimeout(500);
 const led=await page.evaluate(()=>({sheet:Fieldnotes.getTimeline().sheet,text:document.getElementById('sheet-content').textContent,m:Fieldnotes.getTimeline().metrics.pumpedL,shown:document.getElementById('metric-water').textContent}));
 ok(led.sheet==='ledger'&&/Water pumped/.test(led.text),'Ledger view opens the ledger');
 ok(led.text.includes(led.shown),'ledger total matches the dock metric ('+led.shown+')');
 await page.keyboard.press('Escape');await page.waitForTimeout(300);
 // markers
 const markers=await page.locator('#scrub-markers button').count();ok(markers>=5,'timeline shows event markers ('+markers+')');
 await page.locator('#scrub-markers button').first().click();await page.waitForTimeout(300);ok((await state()).sheet!==null,'tapping a marker opens its sheet');await page.keyboard.press('Escape');
 // story: chapters, pause on touch, resume
 await page.locator('#home').click();await page.waitForTimeout(300);
 await page.locator('#start-story').click();await page.waitForTimeout(1500);
 let s=await state();ok(s.journey==='guided'&&s.chapter===0&&s.playing,'story starts at chapter 1');
 const seen=new Set();for(let i=0;i<14;i++){await page.waitForTimeout(1000);seen.add((await state()).chapter);}
 ok(seen.size>=3,'story advances through chapters ('+[...seen].join(',')+')');
 await page.locator('#views [data-view=plant]').click();await page.waitForTimeout(300);
 s=await state();ok(!s.playing&&await page.locator('#resume-story').isVisible(),'touching a view pauses the story and offers Resume');
 await page.locator('#resume-story').click();await page.waitForTimeout(500);s=await state();ok(s.playing,'Resume restarts the story');
 // language and reduced motion
 await page.locator('#language-toggle').click();await page.waitForTimeout(300);
 ok(await page.evaluate(()=>document.documentElement.lang==='pa'&&/[਀-੿]/.test(document.getElementById('stage-title').textContent)),'Punjabi switches the interface');
 await page.locator('#language-toggle').click();
 ok(errors.length===0,'no page errors'+(errors.length?': '+errors.slice(0,3).join(' | '):''));
 return checks.length+' checks passed\n'+checks.join('\n');
}
