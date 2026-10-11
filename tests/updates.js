async page=>{
 const checks=[],errors=[],ok=(b,m)=>{if(!b)throw Error(m);checks.push(m);};
 const response=await page.request.get('http://127.0.0.1:8080/'),original=await response.text();
 const current=original.match(/name="app-version" content="([a-f0-9]{64})"/)[1];
 const next=current==='a'.repeat(64)?'b'.repeat(64):'a'.repeat(64);
 const newer=original.replace(`name="app-version" content="${current}"`,`name="app-version" content="${next}"`);
 const context=await page.context().browser().newContext({viewport:{width:390,height:844}});
 let mode='same',manifestRequests=[],htmlChecks=0,navigations=0;
 await context.addInitScript(()=>{localStorage.setItem('fasl-language','pa');localStorage.setItem('fasl-units','bowl');localStorage.setItem('fasl-motion','reduced');});
 await context.route('http://127.0.0.1:8080/fasl/**',async route=>{
  const r=route.request(),url=new URL(r.url());
  if(url.pathname==='/fasl/version.json'){
   manifestRequests.push(url);
   if(mode==='failed')return route.fulfill({status:503,body:'Unavailable'});
   const body=mode==='invalid'?'not-json':JSON.stringify({schema:1,version:mode==='same'?current:next});
   return route.fulfill({contentType:'application/json',body});
  }
  if(url.pathname==='/fasl/'){
   if(r.isNavigationRequest())navigations++;else htmlChecks++;
   const body=mode==='published'||mode==='startup'&&url.searchParams.has('_v')?newer:mode==='lagging'&&!r.isNavigationRequest()?newer:original;
   return route.fulfill({contentType:'text/html',body});
  }
  return route.fulfill({status:404,body:'Not found'});
 });
 const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
 const focus=()=>p.evaluate(()=>window.dispatchEvent(new Event('focus')));
 const settle=()=>p.waitForTimeout(250);
 try{
  await p.goto('http://127.0.0.1:8080/fasl/?demo=rice#field');await settle();
  ok(manifestRequests.length>0&&manifestRequests.every(u=>u.pathname==='/fasl/version.json'&&u.searchParams.has('_check')),'Startup checks cache-busted version metadata under the project path');
  ok(navigations===1&&htmlChecks===0,'An unchanged version does not reload or fetch the full page');
  mode='invalid';await focus();await settle();ok(navigations===1,'Invalid version metadata leaves the app running');
  mode='failed';await focus();await settle();ok(navigations===1,'Failed version requests leave the app running');
  mode='ahead';await focus();await settle();ok(htmlChecks>0&&navigations===1,'A new manifest with old HTML cannot trigger a reload');
  await context.setOffline(true);const requests=manifestRequests.length;await focus();await settle();ok(manifestRequests.length===requests&&navigations===1,'Offline mode skips checks and retains the current app');
  mode='published';await context.setOffline(false);await p.waitForURL(u=>u.searchParams.get('_v')===next);await settle();
  ok(await p.locator('meta[name=app-version]').getAttribute('content')===next,'Returning online automatically loads the newer release');
  ok(new URL(p.url()).searchParams.get('demo')==='rice'&&new URL(p.url()).hash==='#field'&&new URL(p.url()).searchParams.has('_refresh'),'Forced reload preserves existing URL state and bypasses cached HTML');
  ok(await p.evaluate(()=>document.documentElement.lang==='pa'&&Fieldnotes.getTimeline().displayMode==='bowl'),'Language and quantity preferences survive automatic reload');
  const after=navigations;await focus();await settle();ok(navigations===after,'The updated page stays stable and does not reload repeatedly');
  ok(await p.evaluate(()=>sessionStorage.getItem('fasl-update-attempt')===null),'Successfully loading the target revision clears the retry guard');
  // Simulate a CDN serving verified new HTML to fetch, but old HTML to navigation.
  mode='same';await p.goto('http://127.0.0.1:8080/fasl/');await settle();mode='lagging';await focus();await p.waitForURL(u=>u.searchParams.get('_v')===next);await settle();const guarded=navigations;
  await focus();await settle();ok(navigations===guarded&&await p.locator('meta[name=app-version]').getAttribute('content')===current,'A stale navigation response cannot create a rapid reload loop');
  await p.evaluate(()=>{const a=JSON.parse(sessionStorage.getItem('fasl-update-attempt'));a.at=Date.now()-61000;sessionStorage.setItem('fasl-update-attempt',JSON.stringify(a));});mode='published';await focus();await p.waitForFunction(v=>document.querySelector('meta[name=app-version]').content===v,next);ok(true,'The guarded update retries after its cooldown and recovers');
  // An isolated virtual clock exercises the actual periodic 60-second check.
  mode='same';const periodic=await context.newPage();periodic.on('pageerror',e=>errors.push(e.message));try{
   await periodic.clock.install();await periodic.goto('http://127.0.0.1:8080/fasl/');await periodic.clock.pauseAt(new Date(Date.now()+1000));await periodic.waitForTimeout(250);mode='published';await periodic.clock.fastForward(60000);await periodic.waitForURL(u=>u.searchParams.get('_v')===next);ok(true,'An open foreground page detects a deployment at the next periodic check');
  }finally{await periodic.clock.resume();await periodic.close();}
  mode='same';const blocked=await context.newPage();blocked.on('pageerror',e=>errors.push(e.message));try{
   await blocked.addInitScript(()=>Object.defineProperty(window,'sessionStorage',{get(){throw Error('Storage blocked');}}));
   await blocked.goto('http://127.0.0.1:8080/fasl/');await blocked.waitForTimeout(250);mode='lagging';await blocked.evaluate(()=>window.dispatchEvent(new Event('focus')));await blocked.waitForURL(u=>u.searchParams.get('_v')===next);await blocked.waitForTimeout(250);const guarded=navigations;
   await blocked.evaluate(()=>window.dispatchEvent(new Event('focus')));await blocked.waitForTimeout(250);ok(navigations===guarded,'The URL retry guard prevents reload loops when session storage is blocked');
   await blocked.evaluate(()=>{const url=new URL(location.href);url.searchParams.set('_refresh',String(Date.now()-61000));history.replaceState(null,'',url);});mode='published';await blocked.evaluate(()=>window.dispatchEvent(new Event('online')));await blocked.waitForFunction(v=>document.querySelector('meta[name=app-version]').content===v,next);ok(true,'Automatic updates recover with blocked session storage');
  }finally{await blocked.close();}
  // file:// must not request a network version or reload itself.
  const file=await context.newPage();let versionFetches=0;file.on('request',r=>{if(r.url().includes('version.json'))versionFetches++;});try{
   await file.goto('file:///Users/vikramsra/Desktop/Duar%20Projects/fasl/index.html');await file.waitForFunction(()=>window.Fieldnotes?.Scene3D.info().renderer);await file.waitForTimeout(150);ok(versionFetches===0,'The standalone file build works without update-network requests');
  }finally{await file.close();}
  ok(errors.length===0,'No browser JavaScript errors during update handling');return{passed:checks.length,checks};
 }catch(e){throw Error('After "'+checks.at(-1)+'": '+e.message);}finally{await context.close();}
}
