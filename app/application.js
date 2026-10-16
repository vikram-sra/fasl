'use strict';
/* Playback, story control and the frame loop. State lives in state.js; rendering and controls live in ui.js. */
$('timeline-slider').max=maxDay;
const clampDay=d=>Math.max(0,Math.min(maxDay,d));
function pauseForUser(){playing=false;const s=Store.get();if(s.journey==='guided'&&!s.storyPaused)Store.set({storyPaused:true});}
function begin(mode){Store.set({journey:mode,chapter:-1,storyPaused:false});position=target=0;harvestHold=null;seenHarvest.clear();playing=false;uiTime=0;$('play').focus();}
function beginStory(){closeSheet();begin('guided');Store.set({chapter:0});setView(Story.list[0].view,{fromStory:true});playing=true;}
function jump(value){
  if(Store.get().journey==='welcome')begin('explore');
  pauseForUser();harvestHold=null;target=clampDay(value);position=target;uiTime=0;
  if(Store.get().journey==='guided')Store.set({chapter:Story.indexAt(target)});
}
function resumeStory(){const i=Story.indexAt(target);Store.set({storyPaused:false,chapter:i});setView(Story.list[i].view,{fromStory:true});playing=true;uiTime=0;}
function gotoChapter(i){
  i=Math.max(0,Math.min(Story.list.length-1,i));harvestHold=null;target=position=clampDay(i===0?0:Story.list[i].from);
  Store.set({chapter:i});setView(Story.list[i].view,{fromStory:true});uiTime=0;
}
function togglePlay(){
  const s=Store.get();
  if(s.journey==='welcome'){beginStory();return;}
  if(position>=maxDay-.001){if(s.journey==='guided')beginStory();else{begin(s.journey);playing=true;}return;}
  if(s.journey==='guided'&&s.storyPaused){resumeStory();return;}
  playing=!playing;uiTime=0;
}
function frame(time){
  requestAnimationFrame(frame);const dt=lastTime?Math.min(.1,(time-lastTime)/1000):0;lastTime=time;if(document.hidden)return;
  const {journey,storyPaused}=Store.get(),guided=journey==='guided';
  if(playing){
    animationTime+=dt;
    if(harvestHold){harvestHold.elapsed+=dt;if(harvestHold.elapsed>=8){seenHarvest.add(harvestHold.id);harvestHold=null;if(target>=maxDay)playing=false;}}
    else{
      const next=Math.min(maxDay,target+dt*(guided?guidedSpeed:speed)),checkpoint=guided?[{id:'rice',day:122},{id:'wheat',day:maxDay}].find(h=>!seenHarvest.has(h.id)&&target<h.day&&next>=h.day):null;
      if(checkpoint){target=checkpoint.day;harvestHold={...checkpoint,elapsed:0};}else{target=next;if(target>=maxDay)playing=false;}
    }
  }
  position=target;current=Timeline.sample(result,flows,position);
  if(guided&&!storyPaused){const i=Story.indexAt(target);if(i!==Store.get().chapter){Store.set({chapter:i});setView(Story.list[i].view,{fromStory:true});}}
  const welcome=journey==='welcome',sceneSample=welcome?Timeline.sample(result,flows,78):current;
  Scene3D.update(sceneSample,{motion:reduced,time:animationTime,dt,displayMode:welcome?'bowl':sceneMode(),quantityMode:displayMode,metrics:Metrics.sample(result,sceneSample,displayMode),intro:welcome,paused:!playing||!!harvestHold||welcome});
  positionAnnotations();
  if(time-uiTime>100||uiTime===0){
    updateUI(current);uiTime=time;
    if(!Scene3D.info().renderer){const fallback=document.querySelector('.webgl-fallback');if(fallback)fallback.innerHTML='<strong>'+tr('The story is still here.','ਕਹਾਣੀ ਅਜੇ ਵੀ ਇੱਥੇ ਹੈ।')+'</strong>'+tr('This device cannot draw the field. Follow the chapter descriptions, water totals and harvest bowl using the controls below.','ਇਹ ਜੰਤਰ ਖੇਤ ਦਾ ਦ੍ਰਿਸ਼ ਨਹੀਂ ਬਣਾ ਸਕਦਾ। ਹੇਠਲੇ ਬਟਨਾਂ ਨਾਲ ਕਹਾਣੀ, ਪਾਣੀ ਦੇ ਅੰਕੜੇ ਅਤੇ ਵਾਢੀ ਦੀ ਕੌਲੀ ਦੇਖੋ।');}
  }
}
// Exact model history and a read-only presentation snapshot remain available to verification tools.
window.Fieldnotes={Sim,Timeline,Metrics,Scene3D,Store,Story,getResult:()=>result,getTimeline:()=>({position,target,playing,mode:'managed_rotation',residueStrategy,residueExplicit,displayMode,viewMode:sceneMode()||'acre',view:Store.get().view,sceneView,journey:Store.get().journey,chapter:Store.get().chapter,sheet:Store.get().sheet,reduced,harvestHold:harvestHold?{...harvestHold}:null,metrics:current?Metrics.sample(result,current,displayMode):null,sample:current}),planned};
if(readPref('fasl-motion','')==='reduced')reduced=true;
app.dataset.reduced=reduced;
applyTheme();applyLabels();
requestAnimationFrame(frame);
