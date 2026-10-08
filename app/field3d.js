/* Real XZ terrain, imported crop meshes and an orbitable cutaway plot. */
const FieldPlot3D=(()=>{
 const T=THREE,models={},loads={},V=(x,y,z)=>new T.Vector3(x,y,z);
 let scene,camera,terrain,water,roots,group,pump,seedObject,rain,residue,rendererRef,readyCrop='',batches=[],angle=.42,zoom=1,drag=null,lastV,info={},dirty=true,texture;
 const area=4046.8564224,width=Math.sqrt(area),depth=width,count=96;
 let canopy,canopyCrop;const heights={rice:.82,wheat:1.12};
 function load(id){
  if(loads[id])return loads[id];
  loads[id]=new Promise(resolve=>{
   const bytes=Uint8Array.from(atob(CROP_MODELS[id]),c=>c.charCodeAt(0));
   new ModelLoader.GLTFLoader().parse(bytes.buffer,'',gltf=>{
    const root=gltf.scene;root.updateMatrixWorld(true);const parts=[];
    root.traverse(o=>{if(!o.isMesh||o.material.name==='soil')return;const geometry=o.geometry.clone();for(const name of ['position','normal']){const a=geometry.getAttribute(name);if(a){const values=[];for(let i=0;i<a.count;i++)values.push(a.getX(i),a.getY(i),a.getZ(i));geometry.setAttribute(name,new T.Float32BufferAttribute(values,3));}}geometry.applyMatrix4(o.matrixWorld);geometry.computeBoundingBox();parts.push({geometry,material:o.material.clone(),grain:id==='rice'&&o.material.name==='gold'});});
    const bounds=new T.Box3();parts.forEach(p=>bounds.union(p.geometry.boundingBox));const scale=heights[id]/(bounds.max.y-bounds.min.y),center=bounds.getCenter(V(0,0,0));
    parts.forEach(p=>{p.geometry.translate(-center.x,-bounds.min.y,-center.z);p.geometry.scale(scale,scale,scale);p.material.side=T.DoubleSide;p.material.roughness=.78;p.material.userData.base=p.material.color.clone();});
    models[id]=parts;dirty=true;if(window.Fieldnotes)Fieldnotes.Scene3D.invalidate();resolve(parts);
   },e=>{console.error('Crop model could not be loaded',e);resolve(null);});
  });return loads[id];
 }
 function init(renderer,sourceTexture,sourcePump){
  rendererRef=renderer;scene=new T.Scene();camera=new T.PerspectiveCamera(35,1,.1,1200);
  scene.add(new T.HemisphereLight(0xdfe8ee,0x4d4430,2.6));const sun=new T.DirectionalLight(0xffe8bb,3);sun.position.set(-4,7,5);scene.add(sun);const rim=new T.DirectionalLight(0xd5e4dc,1.2);rim.position.set(3,3,-4);scene.add(rim);

  group=new T.Group();scene.add(group);
  const earth=new T.MeshStandardMaterial({color:'#81694c',roughness:1});
  for(const [top,bottom,color] of [[0,-.26,'#58432f'],[-.26,-.70,'#8d7050'],[-.70,-1.25,'#a58b65']]){
   const material=earth.clone();material.color.set(color);const slab=new T.Mesh(new T.BoxGeometry(width,top-bottom,depth),material);slab.position.y=(top+bottom)/2;group.add(slab);
  }
  const geometry=new T.PlaneGeometry(width,depth,36,32);geometry.rotateX(-Math.PI/2);const positions=geometry.attributes.position;
  for(let i=0;i<positions.count;i++){const x=positions.getX(i),z=positions.getZ(i);positions.setY(i,.016+Math.sin(x*28+z*7)*.009+Math.sin(z*24)*.008);}geometry.computeVertexNormals();
  terrain=new T.Mesh(geometry,new T.MeshStandardMaterial({color:'#68533a',roughness:.94,side:T.DoubleSide}));group.add(terrain);
  water=new T.Mesh(new T.BoxGeometry(width+.008,.36,depth+.008),new T.MeshStandardMaterial({color:'#476e6b',roughness:.7,transparent:true,opacity:.75}));water.position.y=-1.05;group.add(water);
  const pool=new T.Mesh(new T.PlaneGeometry(width-.12,depth-.12),new T.MeshStandardMaterial({color:'#759b91',metalness:.26,roughness:.18,transparent:true,opacity:.5}));pool.rotation.x=-Math.PI/2;pool.position.y=.035;pool.name='pool';group.add(pool);
  const rootPositions=[],r=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};let seed=842;
  for(let hill=0;hill<12;hill++){const x=-width/2+(hill+.5)*width/12;for(let strand=0;strand<8;strand++){let previous=V(x,-.02,depth/2+.009);const spread=(r()-.5)*.30,length=.30+r()*.35;for(let step=1;step<=7;step++){const t=step/7,next=V(x+spread*t+Math.sin(t*8+strand)*.013,-length*t,depth/2+.012);rootPositions.push(...previous.toArray(),...next.toArray());previous=next;}}}
  roots=new T.LineSegments(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(rootPositions,3)),new T.LineBasicMaterial({color:'#c3b594',transparent:true,opacity:.63}));group.add(roots);
  pump=sourcePump.clone(true);pump.position.set(width/2+2,0,depth/2-3);pump.scale.setScalar(.82);pump.children.forEach(o=>{o.position.x-=1.27;o.position.z-=1.5;});group.add(pump);
  const pad=new T.Mesh(new T.BoxGeometry(4,.15,4),new T.MeshStandardMaterial({color:'#a99c82',roughness:1}));pad.position.set(width/2+2,-.075,depth/2-3);group.add(pad);
  const pipe=new T.Mesh(new T.CylinderGeometry(.06,.06,2.8,8),new T.MeshStandardMaterial({color:'#616d65',metalness:.5,roughness:.5}));pipe.rotation.z=Math.PI/2;pipe.position.set(width/2+.7,.08,depth/2-3);group.add(pipe);
  const bore=new T.Mesh(new T.CylinderGeometry(.035,.035,1.23,12),new T.MeshStandardMaterial({color:'#616d65',metalness:.6,roughness:.5}));bore.position.set(width/2+2.09,-.6,depth/2-2.91);group.add(bore);
  const rainPositions=new Float32Array(48*6);rain=new T.LineSegments(new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(rainPositions,3)),new T.LineBasicMaterial({color:'#7c9fa5',transparent:true,opacity:.5}));scene.add(rain);
  residue=new T.InstancedMesh(new T.CylinderGeometry(.008,.008,.16,4),new T.MeshStandardMaterial({color:'#b39a5e',roughness:1}),64);group.add(residue);
  const canvas=renderer.domElement;
  canvas.tabIndex=0;canvas.setAttribute('aria-label','3D field. Drag or use left and right arrows to turn. Home resets the view.');
  canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home'].includes(e.key)||document.querySelector('.game').dataset.journey!=='guided')return;e.preventDefault();angle=e.key==='Home'?.42:Math.max(-.8,Math.min(.8,angle+(e.key==='ArrowLeft'?-.1:.1)));Fieldnotes.Scene3D.invalidate();});
  canvas.addEventListener('pointerdown',e=>{if(['welcome','seed','sowing'].includes(document.querySelector('.game').dataset.journey))return;drag={x:e.clientX,angle,pointer:e.pointerId};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;angle=Math.max(-.8,Math.min(.8,drag.angle+(e.clientX-drag.x)*.006));dirty=true;Fieldnotes.Scene3D.invalidate();});
  const end=()=>{drag=null;};canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  canvas.addEventListener('dblclick',()=>{angle=.42;dirty=true;Fieldnotes.Scene3D.invalidate();});
  seedObject=new T.Group();const seedMaterial=new T.MeshStandardMaterial({color:'#c1a167',roughness:.64});const kernel=new T.Mesh(new T.SphereGeometry(1,32,24),seedMaterial);kernel.scale.set(.11,.28,.10);seedObject.add(kernel);const crease=new T.CatmullRomCurve3([V(0,-.23,.048),V(-.006,-.12,.086),V(-.01,0,.102),V(-.004,.12,.086),V(0,.23,.048)]);const seam=new T.Mesh(new T.TubeGeometry(crease,24,.0025,5,false),new T.MeshStandardMaterial({color:'#9a793f',roughness:.85}));seedObject.add(seam);scene.add(seedObject);
  load('rice');load('wheat');
 }
 function populate(id){
  if(!models[id]||readyCrop===id)return;
  for(const batch of batches){group.remove(batch);batch.material.dispose();}batches=[];
  for(const part of models[id]){
   const material=part.material.clone();material.userData.base=part.material.userData.base.clone();material.userData.cut={value:1.8};
   material.onBeforeCompile=shader=>{shader.uniforms.cropCut=material.userData.cut;shader.vertexShader='varying float cropY;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ncropY=position.y;');shader.fragmentShader='varying float cropY;uniform float cropCut;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(cropY>cropCut)discard;');};material.customProgramCacheKey=()=> 'imported-crop-cut-v1';
   const batch=new T.InstancedMesh(part.geometry,material,count);batch.frustumCulled=false;batch.userData.grain=part.grain;batch.userData.base=material.color.clone();
   group.add(batch);batches.push(batch);
  }
  readyCrop=id;dirty=true;
 }
 function setCamera(height,aspect,a,targetY){
  camera.aspect=aspect;camera.top=height/2;camera.bottom=-height/2;
  const distance=height/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2))),direction=V(Math.sin(a),.77,Math.cos(a)).normalize();
  camera.position.copy(direction.multiplyScalar(distance)).add(V(0,targetY,0));camera.lookAt(0,targetY,0);camera.updateProjectionMatrix();
 }
 function frame(host){const aspect=host.clientWidth/host.clientHeight;setCamera(Math.max(92,102/aspect)/zoom,aspect,angle,.35);}
 function changeZoom(delta){zoom=Math.max(1,Math.min(6,zoom*delta));dirty=true;if(window.Fieldnotes)Fieldnotes.Scene3D.invalidate();document.getElementById('zoom-out').disabled=zoom<=1;document.getElementById('zoom-in').disabled=zoom>=6;document.getElementById('zoom-level').textContent=zoom.toFixed(1)+'×';}
 function project(p,host){const v=p.clone().project(camera);return{x:(v.x+1)*host.clientWidth/2,y:(1-v.y)*host.clientHeight/2};}
 function render(renderer,v,{soilTexture,sourcePump,host,motion,time,dark,metrics}){
  if(!scene)init(renderer,soilTexture,sourcePump);group.visible=true;seedObject.visible=false;lastV=v;populate(v.id);frame(host);
  scene.background=new T.Color(dark?'#172a28':'#e2e7dd');
  const growing=!v.fallow&&v.growth.harvest<.95,scale=Math.max(.025,v.growth.height),dummy=new T.Object3D();
  // At acre distance use one GPU point per plant, preserving metre coordinates.
  // Full imported meshes would require billions of triangles at this population.
  const population=Math.round(metrics.targetPopulation);
  if(canopyCrop!==v.id){
   if(canopy){group.remove(canopy);canopy.geometry.dispose();canopy.material.dispose();}
   const a=new Float32Array(population*3),rice=v.id==='rice',cols=rice?Math.floor(width/.15):Math.floor(width/.20),rows=Math.ceil(population/(rice?2:1)/cols);
   for(let i=0;i<population;i++){const hill=rice?Math.floor(i/2):i,row=Math.floor(hill/cols),col=hill%cols;
    a[i*3]=-width/2+(col+.5)*width/cols+(rice?(i%2? .018:-.018):Math.sin(i*71)*.018);
    a[i*3+1]=heights[v.id]*(.90+.10*Math.sin(i*21.7));
    a[i*3+2]=-depth/2+(row+.5)*depth/rows+(rice?(i%2?.018:-.018):0);
   }
   const material=new T.ShaderMaterial({uniforms:{growth:{value:1},size:{value:1},tint:{value:new T.Color('#708044')}},vertexShader:'uniform float growth;uniform float size;varying float shade;void main(){vec3 p=position;p.y*=growth;shade=.76+.24*fract(sin(position.x*31.+position.z*73.)*43758.5);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);gl_PointSize=size;}',fragmentShader:'uniform vec3 tint;varying float shade;void main(){if(length(gl_PointCoord-.5)>.5)discard;gl_FragColor=vec4(tint*shade,1.);}',depthWrite:true});
   canopy=new T.Points(new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(a,3)),material);canopy.frustumCulled=false;group.add(canopy);canopyCrop=v.id;
  }
  const standing=Math.min(population,Math.max(0,Math.round(metrics?.plants??population)));
  const detailed=models[v.id]?Math.min(count,standing):0;canopy.geometry.setDrawRange(detailed,Math.max(0,standing-detailed));canopy.visible=growing;canopy.material.uniforms.growth.value=scale;
  canopy.material.uniforms.size.value=Math.max(1,.15*host.clientHeight/(camera.top-camera.bottom)*renderer.getPixelRatio());
  canopy.material.uniforms.tint.value.set('#708944').lerp(new T.Color('#bc9b50'),Math.max(v.growth.grain*.65,v.growth.ripe));
  batches.forEach(batch=>{
   batch.count=detailed;batch.visible=growing&&(!batch.userData.grain||v.growth.grain>.01);batch.material.userData.cut.value=heights[v.id]*(v.id==='wheat'?.65+.35*v.growth.grain:1);
   batch.material.color.copy(batch.userData.base).lerp(new T.Color('#b99b4f'),v.growth.ripe*.4);
   const a=canopy.geometry.attributes.position;for(let i=0;i<detailed;i++){dummy.position.set(a.getX(i),.02,a.getZ(i));dummy.rotation.set(0,i*2.399,0);dummy.scale.setScalar(scale);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);}batch.instanceMatrix.needsUpdate=true;
  });
  rain.visible=v.flow.rain>0&&v.fraction<.4;const positions=rain.geometry.attributes.position;for(let i=0;i<48;i++){const x=Math.sin(i*78)*width*.6,z=Math.cos(i*31)*depth*.6,y=2.8-((motion?0:time*.8)+i/48)%1*2.8;positions.setXYZ(i*2,x,y,z);positions.setXYZ(i*2+1,x-.025,y-.12,z);}positions.needsUpdate=true;
  residue.visible=v.position>=121;residue.material.color.set(v.residueStrategy==='burn'?'#524b3b':'#b39a5e');for(let i=0;i<64;i++){dummy.position.set(Math.sin(i*31)*width*.46,.024,Math.cos(i*19)*depth*.46);dummy.rotation.set(Math.PI/2,0,i*2.3);dummy.scale.setScalar(v.residueStrategy==='mulch'?Math.max(.12,v.residueCover):.6);dummy.updateMatrix();residue.setMatrixAt(i,dummy.matrix);}residue.instanceMatrix.needsUpdate=true;
  roots.visible=true;roots.scale.y=Math.max(.15,v.growth.root);roots.material.opacity=v.fallow?.28:.63;
  water.position.y=-1.12+(v.aquiferL/Sim.H.aquifer_capacity_L)*.22;
  group.getObjectByName('pool').visible=v.pondDepthMm>.05;terrain.material.color.set(v.pondDepthMm>5?'#514b34':'#68533a');
  renderer.render(scene,camera);
  const soil=project(V(-width/2,-.02,depth/2),host),groundwater=project(V(-width/2,water.position.y+.18,depth/2),host);
  info={is3D:true,model:readyCrop,modelLoaded:readyCrop===v.id,perspective:true,zoom,plantCount:growing?standing:0,targetPopulation:population,areaM2:area,widthM:width,depthM:depth,matureHeightM:heights[v.id],heightM:heights[v.id]*scale,pumpOutside:true,pumpX:pump.position.x,pumpZ:pump.position.z,anchors:{soil,water:groundwater,crop:project(V(0,heights[v.id]*scale,0),host),pump:project(pump.position.clone().add(V(0,.5,0)),host)},angle,groundPlane:true,soilScreenY:soil.y,waterScreenY:groundwater.y,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles};
  const marker=document.getElementById('groundwater-marker');marker.style.top=groundwater.y+'px';document.getElementById('soil-status').style.top=Math.min(host.clientHeight-130,soil.y+4)+'px';dirty=false;
 }
 function renderEntry(renderer,v,options){
  const {soilTexture,sourcePump,host,motion,time,dark,phase,progress=0}=options;
  if(!scene)init(renderer,soilTexture,sourcePump);scene.background=new T.Color(dark?'#172a28':'#eef0e6');
  const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);},sowing=phase==='sowing',drop=ease(progress/.42),pull=ease((progress-.30)/.70),aspect=host.clientWidth/host.clientHeight;
  group.visible=sowing;if(canopy)canopy.visible=false;rain.visible=false;residue.visible=false;for(const batch of batches)batch.visible=false;roots.visible=false;group.getObjectByName('pool').visible=false;
  seedObject.visible=!sowing||progress<.48;seedObject.scale.setScalar(v.id==='rice'?1:.90);seedObject.position.set(0,sowing?.45*(1-drop)-.04*drop:.45,0);seedObject.rotation.set(.15,!motion?time*.15:0,(sowing?drop*.8:.28));
  const finalHeight=Math.max(92,102/aspect),height=sowing?1.65+(finalHeight-1.65)*pull:1.65;
  const a=.06+(.42-.06)*pull;zoom=1;setCamera(height,aspect,a,sowing?.45*(1-pull)+.35*pull:.45);
  renderer.render(scene,camera);info={is3D:true,phase,progress,seedVisible:seedObject.visible,groundPlane:sowing,modelLoaded:!!models[v.id],angle:a};
 }
 return{render,renderEntry,changeZoom,info:()=>info,rotation:()=>angle,loaded:id=>!!models[id]};
})();
