async page=>{
 const checks=[],ok=(b,m)=>{if(!b)throw Error(m);checks.push(m);};
 await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:8080/');await page.evaluate(()=>{localStorage.clear();localStorage.setItem('fasl-theme','dark');localStorage.setItem('fasl-units','bowl');});await page.reload();await page.waitForFunction(()=>Fieldnotes.Scene3D.info().renderer);
 for(const [width,height] of [[390,844],[390,667],[320,568],[768,1024]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(250);
  const m=await page.evaluate(()=>{const f=Fieldnotes.Scene3D.info(),title=document.querySelector('#welcome').getBoundingClientRect(),scene=document.querySelector('#scene-art').getBoundingClientRect();return{f,titleBottom:title.bottom-scene.top,button:document.querySelector('#start-story').getBoundingClientRect().toJSON(),overflow:document.documentElement.scrollWidth>innerWidth,inert:document.querySelector('footer').inert,center:document.querySelector('#welcome').getBoundingClientRect().left+document.querySelector('#welcome').getBoundingClientRect().width/2};});
  ok(!m.inert&&m.button.height>=56&&m.button.width>=150,'Opening has an enabled large Play story target '+width+'×'+height);
  ok(m.f.soilScreenY-m.f.displayedCropHeightPx>m.titleBottom+15&&!m.f.cloudsVisible,'Opening crop leaves clear title space without clouds '+width+'×'+height);
  ok(Math.abs(m.center-width/2)<2&&!m.overflow,'Opening is centered without overflow '+width+'×'+height);
  await page.screenshot({path:`output/playwright/touch-welcome-${width}-${height}.png`});
 }
 await page.setViewportSize({width:390,height:844});const b=await page.locator('#start-story').boundingBox();await page.mouse.click(b.x+8,b.y+b.height-8);await page.waitForFunction(()=>Fieldnotes.getTimeline().playing&&Fieldnotes.getTimeline().journey==='guided');ok(true,'Edge of Play story starts playback directly');
 ok(!(await page.locator('#start-story').isVisible())&&!(await page.locator('#explore').isVisible()),'Opening actions disappear during playback');
 const p=await page.locator('#play').boundingBox();ok(p.height>=56&&p.width>=104,'Pause has a large prominent target');await page.mouse.click(p.x+8,p.y+p.height-8);await page.waitForFunction(()=>!Fieldnotes.getTimeline().playing);ok(true,'Edge of Pause responds');
 await page.locator('#timeline-slider').fill('90');await page.waitForTimeout(300);await page.screenshot({path:'output/playwright/touch-playing-390-844.png'});
 ok((await page.locator('#timeline-slider').boundingBox()).height>=40,'Timeline has a larger drag area');
 await page.locator('#home').click();await page.waitForFunction(()=>Fieldnotes.getTimeline().journey==='welcome');await page.locator('#explore').click();await page.waitForFunction(()=>Fieldnotes.getTimeline().journey==='explore'&&!Fieldnotes.getTimeline().playing);ok(true,'Explore opens the paused interactive scene directly');
 return{passed:checks.length,checks};
}
