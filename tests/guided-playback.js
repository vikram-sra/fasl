async page=>{
 const context=await page.context().browser().newContext({viewport:{width:390,height:844}}),guided=await context.newPage(),checks=[],errors=[];guided.on('pageerror',e=>errors.push(e.message));const ok=(b,m)=>{if(!b)throw Error(m);checks.push(m);};
 try{
  await guided.addInitScript(()=>{localStorage.setItem('fasl-language','en');localStorage.setItem('fasl-theme','light');localStorage.removeItem('fasl-motion');});
  const start=new Date('2026-10-07T12:00:00Z');await guided.clock.install({time:start});
  // A controlled 10 fps clock verifies the full journey without rendering 5,000 synthetic frames.
  await guided.addInitScript(()=>{window.requestAnimationFrame=cb=>setTimeout(()=>cb(performance.now()),100);});
  await guided.goto('http://127.0.0.1:8080/');await guided.clock.pauseAt(new Date(start.getTime()+2000));await guided.clock.runFor(64);
  await guided.evaluate(()=>document.querySelector('#start-story').click());await guided.clock.runFor(28000);
  ok(await guided.evaluate(()=>Fieldnotes.getTimeline().harvestHold?.id==='rice'&&Fieldnotes.getTimeline().position===122),'Guided story holds at rice harvest');
  ok(await guided.locator('#harvest-reveal').isVisible(),'Rice processing and bowl are visible');await guided.clock.runFor(3000);
  const processing=await guided.locator('#processing-label').textContent();ok(processing.includes('SEPARATING')||processing.includes('REMOVING'),'Rice processing advances through threshing and husk removal');
  await guided.evaluate(()=>document.querySelector('#play').click());await guided.clock.runFor(64);const stopped=await guided.evaluate(()=>({day:Fieldnotes.getTimeline().position,elapsed:Fieldnotes.getTimeline().harvestHold.elapsed,time:Fieldnotes.Scene3D.info().windTime}));await guided.clock.runFor(2000);
  ok(await guided.evaluate(a=>Fieldnotes.getTimeline().position===a.day&&Fieldnotes.getTimeline().harvestHold.elapsed===a.elapsed&&Fieldnotes.Scene3D.info().windTime===a.time,stopped),'Pause freezes the processing sequence and field');
  await guided.evaluate(()=>document.querySelector('#play').click());await guided.clock.runFor(6000);ok(await guided.evaluate(()=>Fieldnotes.getTimeline().position>122&&Fieldnotes.getTimeline().playing),'Story continues after rice processing');
  await guided.clock.runFor(48000);ok(await guided.evaluate(()=>Fieldnotes.getTimeline().position===304&&!Fieldnotes.getTimeline().playing&&!Fieldnotes.getTimeline().harvestHold),'Full guided journey ends automatically');
  ok(await guided.locator('#story-finish').isVisible(),'Guided ending reveals summary');ok(await guided.evaluate(()=>[...document.querySelectorAll('#bowl-grains ellipse')].every(el=>el.style.opacity==='1')),'Completed harvest fills the dry-food bowl');
  ok(errors.length===0,'No errors during complete timed journey');return{passed:checks.length,checks};
 }finally{await context.close();}
}
