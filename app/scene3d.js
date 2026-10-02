/* Original procedural botanical sculpture. Three.js r182, MIT; fixed orthographic camera. */
const Scene3D=(()=>{
  let renderer,scene,camera,plant,roots,water,pond,rainGroup,pumpGroup,particles,infiltrationGroup,fertilizerGroup,host,currentStage='',lastTime=0,until=0,isMotion=false,flow={},cloudGroup,uptakeGroup,rechargeGroup,waterTarget=.44,growStart=0,fertilizing=false;
  const T=THREE,V=(x,y,z)=>new T.Vector3(x,y,z),rng=Sim.random(630126);
  const materials={},mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.84,...extra});
  const stemMat=mat('#71814b'),rootMat=mat('#d7c49b'),metal=mat('#6f8079',{metalness:.65,roughness:.42});
  function mesh(geometry,material,parent=scene){const m=new T.Mesh(geometry,material);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function box(w,h,d,x,y,z,color,parent=scene){const m=mesh(new T.BoxGeometry(w,h,d),mat(color),parent);m.position.set(x,y,z);return m;}
  function tube(points,radius,material,parent,segments=18){const c=new T.CatmullRomCurve3(points);return mesh(new T.TubeGeometry(c,segments,radius,5,false),material,parent);}
  function line(a,b,r,material,parent){const d=new T.Vector3().subVectors(b,a),m=mesh(new T.CylinderGeometry(r,r,d.length(),5),material,parent);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());return m;}
  function leaf(origin,angle,length,width,droop,material,parent){
    const points=[],indices=[],N=16;
    for(let j=0;j<=N;j++){const t=j/N,blade=Math.sin(Math.PI*t)*width*(1-t*.6),rad=length*t*.8,y=length*(Math.sin(t*Math.PI*.72)*.47-t*t*droop),curve=Math.sin(t*2)*.11;
      for(let s=-1;s<=1;s++){points.push(origin.x+Math.cos(angle)*rad-Math.sin(angle)*blade*s,origin.y+y+(s===0?.01:0),origin.z+Math.sin(angle)*rad+Math.cos(angle)*blade*s+curve);}
    }
    for(let j=0;j<N;j++)for(let q=0;q<2;q++){const a=j*3+q,b=a+3;indices.push(a,b,a+1,b,b+1,a+1);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points,3));g.setIndex(indices);g.computeVertexNormals();mesh(g,material,parent);
    const vein=[];for(let j=0;j<=N;j++){const t=j/N,rad=length*t*.8;vein.push(V(origin.x+Math.cos(angle)*rad,origin.y+length*(Math.sin(t*Math.PI*.72)*.47-t*t*droop)+.011,origin.z+Math.sin(angle)*rad+Math.sin(t*2)*.11));}tube(vein,.0018,stemMat,parent,12);
  }
  function grain(position,rotation,size,material,parent,geometry){const m=mesh(geometry,material,parent);m.position.copy(position);m.scale.set(size*.40,size,size*.34);m.rotation.set(rotation,.1,.38);return m;}
  function instanceRepeats(group){group.updateMatrixWorld(true);const buckets=new Map(),inverse=group.matrixWorld.clone().invert();group.traverse(o=>{if(!o.isMesh||o.isInstancedMesh)return;const key=o.geometry.uuid+':'+o.material.uuid;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(o);});for(const bucket of buckets.values()){if(bucket.length<3)continue;const merged=new T.InstancedMesh(bucket[0].geometry,bucket[0].material,bucket.length);bucket.forEach((o,i)=>{merged.setMatrixAt(i,new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));o.parent.remove(o);});merged.castShadow=true;merged.receiveShadow=true;group.add(merged);}}
  function mergeStatic(group){
    group.updateMatrixWorld(true);const buckets=new Map(),inverse=group.matrixWorld.clone().invert();group.traverse(o=>{if(!o.isMesh||o.isInstancedMesh)return;const key=o.material.uuid;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(o);});
    for(const meshes of buckets.values()){if(meshes.length<2)continue;const positions=[],normals=[];for(const m of meshes){const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry,matrix=new T.Matrix4().multiplyMatrices(inverse,m.matrixWorld),normalMatrix=new T.Matrix3().getNormalMatrix(matrix),p=g.getAttribute('position'),n=g.getAttribute('normal');for(let i=0;i<p.count;i++){const v=V(p.getX(i),p.getY(i),p.getZ(i)).applyMatrix4(matrix),normal=V(n.getX(i),n.getY(i),n.getZ(i)).applyNormalMatrix(normalMatrix);positions.push(v.x,v.y,v.z);normals.push(normal.x,normal.y,normal.z);}if(g!==m.geometry)g.dispose();m.geometry.dispose();m.parent.remove(m);}const merged=new T.BufferGeometry();merged.setAttribute('position',new T.Float32BufferAttribute(positions,3));merged.setAttribute('normal',new T.Float32BufferAttribute(normals,3));mesh(merged,meshes[0].material,group);}
  }
  function disposeGroup(group){if(!group)return;group.traverse(o=>{if(o.isMesh||o.isLine){o.geometry.dispose();if(o.material!==stemMat&&o.material!==rootMat&&o.material!==metal)o.material.dispose();}});scene.remove(group);}
  function buildPlant(id,index){disposeGroup(plant);disposeGroup(roots);plant=new T.Group();roots=new T.Group();scene.add(plant,roots);plant.position.set(-.40,.035,.03);
    const rice=id==='rice',gold=index>=8,color=gold?'#b8a153':rice?'#658344':'#7b8b42',leafMaterial=mat(color,{side:T.DoubleSide}),grainMaterial=mat(gold?'#d0ad61':index===7?'#a4a46a':'#9da563'),stemMaterial=mat(gold?'#a9914c':'#6c8248'),seedMat=mat(rice?'#b49d64':'#bca66e'),grainGeo=new T.SphereGeometry(1,7,5),flowerGeo=new T.SphereGeometry(.008,5,4),flowerMat=mat('#e4deb0'),N=index<2?1:index===2?3:index===3?8:7;
    const height=[.32,.72,1.08,1.52,2.07,2.45,2.82,2.85,2.82,2.8][index],r=Sim.random(2612+(rice?0:100));
    if(index===0){const seed=grain(V(0,.045,0),.85,rice?.13:.115,seedMat,plant,grainGeo);seed.scale.z*=1.5;tube([V(0,.02,0),V(-.06,.13,.01),V(-.03,.32,0)],.008,stemMaterial,plant);leaf(V(-.03,.25,0),.3,.16,.019,.05,leafMaterial,plant);}
    if(index>0)for(let n=0;n<N;n++){
      const angle=n*2.399,spread=index<3?.035:.12,base=V(Math.cos(angle)*spread,0,Math.sin(angle)*spread),bend=.16+(n%3)*.08,ht=height*(1-(n%3)*.09),tip=V(base.x+Math.cos(angle)*bend,ht,base.z+Math.sin(angle)*bend),mid=V(base.x+Math.cos(angle)*bend*.55,ht*.55,base.z+Math.sin(angle)*bend*.55);
      if(index===9){line(base,V(base.x,.16,base.z),.012,stemMaterial,plant);continue;}
      tube([base,mid,tip],.009,stemMaterial,plant,16);
      const leaves=index<3?3:5;
      for(let l=0;l<leaves;l++){const f=.17+l*(index<3?.22:.15),origin=V(base.x+(tip.x-base.x)*f,ht*f,base.z+(tip.z-base.z)*f);leaf(origin,angle+l*2.8,Math.min(.9,ht*.56)*(1-l*.08),rice?.037:.048,index<4?.14:.36,leafMaterial,plant);}
      if(!rice&&index===4)for(let j=1;j<4;j++){const node=mesh(new T.SphereGeometry(.017,6,5),stemMaterial,plant);node.position.copy(base).lerp(tip,j/4);}
      if(index===4||index===5){const sheath=mesh(new T.SphereGeometry(1,8,7),mat(index===4?'#92a566':'#a0ac69'),plant);sheath.position.copy(tip).add(V(0,-.18,0));sheath.scale.set(.027,.15,.032);}
      if(index>=6&&index<9){
        if(rice){const panicle=V(tip.x+.16,tip.y+.25,tip.z+.025),end=V(tip.x+.32,tip.y+(gold?-.12:.08),tip.z+.07);tube([tip,panicle,end],.004,stemMaterial,plant,15);
          for(let j=0;j<9;j++){const t=j/9,origin=tip.clone().lerp(panicle,Math.min(1,t*1.4));origin.y-=t*t*.19;for(let side=-1;side<=1;side+=2){const branchEnd=origin.clone().add(V(side*(.06+.09*t),-.03-t*.12,(r()-.5)*.12));tube([origin,origin.clone().lerp(branchEnd,.5).add(V(0,.02,0)),branchEnd],.002,stemMaterial,plant,5);for(let g=0;g<4;g++){const point=origin.clone().lerp(branchEnd,(g+1)/4);point.y-=.01*g;grain(point,.3+(g%2)*.4,index===7||gold?.028:.019,grainMaterial,plant,grainGeo);if(index===6&&g===2){const anther=mesh(flowerGeo,flowerMat,plant);anther.position.copy(point).add(V(.01,-.023,0));}}}
          }
        }else{line(tip,tip.clone().add(V(0,.38,0)),.004,stemMaterial,plant);for(let j=0;j<10;j++){const yy=j*.033;for(let side=-1;side<=1;side+=2){const pos=tip.clone().add(V(side*.035,yy,.005*(j%2)));const g=grain(pos,0,index===7?.047:.038,grainMaterial,plant,grainGeo);g.rotation.z=side*-.5;line(pos.clone().add(V(0,.035,0)),pos.clone().add(V(side*.06,.15,.03)),.0012,stemMaterial,plant);if(index===6&&j%3===0){const a=mesh(flowerGeo,flowerMat,plant);a.position.copy(pos).add(V(side*.035,-.015,.015));}}}}
      }
    }
    if(index===9){const sheaf=new T.Group();plant.add(sheaf);sheaf.rotation.z=-.55;sheaf.position.set(.14,.02,0);for(let j=0;j<8;j++){const x=(j-4)*.025;line(V(x,0,0),V(x,.98,(j%2)*.04),.009,stemMaterial,sheaf);grain(V(x,.99,(j%2)*.04),0,rice?.11:.14,grainMaterial,sheaf,grainGeo);}const tie=mesh(new T.TorusGeometry(.13,.012,4,12),mat('#8c7757'),sheaf);tie.rotation.x=Math.PI/2;tie.position.y=.35;}
    const length=[.16,.31,.48,.62,.77,.9,1.0,1.05,1.12,1.1][index],count=index===0?3:8+index*3;
    for(let j=0;j<count;j++){const spread=(r()-.5)*length*.95,origin=V(-.4,-.03,1.132),end=V(-.4+spread,-length*(.6+r()*.4),1.14);tube([origin,V(-.4+spread*.35,-length*.35,1.14),end],j%3===0?.009:.004,rootMat,roots,10);for(let k=0;k<3;k++){const t=.25+k*.23,from=origin.clone().lerp(end,t);tube([from,from.clone().add(V(spread*.2+(k%2?.035:-.035),-.045,0)),from.clone().add(V(spread*.35+(k%2?.07:-.07),-.10,0))],.002,rootMat,roots,5);}}
    instanceRepeats(plant);mergeStatic(plant);mergeStatic(roots);currentStage=id+':'+index;
  }
  let soilSurface,waterSurface=-1.84,waterGoal=-1.84;
  function plane(width,height,x,y,z,color,parent=scene){const m=mesh(new T.PlaneGeometry(width,height),new T.MeshBasicMaterial({color}),parent);m.position.set(x,y,z);return m;}
  function initialize(){host=document.getElementById('scene-art');try{renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch(e){return false;}
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor(0xf3f0e5,1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.NoToneMapping;host.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Flat full-screen side view: crop and branching roots above a moving groundwater level, with a connected pump pipe');
    scene=new T.Scene();camera=new T.OrthographicCamera(-4,4,4,-4,.1,40);camera.position.set(0,.05,12);camera.lookAt(0,.05,0);scene.add(new T.HemisphereLight(0xfff9e8,0x8e8768,2));const sun=new T.DirectionalLight(0xfff4d8,2.1);sun.position.set(-3,7,8);scene.add(sun);
    plane(100,16,0,-8,-2,'#c5ac87');soilSurface=plane(100,.32,0,-.16,-1.9,'#8b6948');plane(100,.60,0,-.62,-1.8,'#a48560');plane(100,.58,0,-1.2,-1.7,'#b69b75');plane(100,.55,0,-1.75,-1.6,'#c4ad89');
    water=plane(100,12,0,-7.5,-1.1,'#5b969f');pond=plane(100,.025,0,.015,.2,'#a0c9bf');pond.visible=false;
    const dirt=new T.Group();scene.add(dirt);const geo=new T.SphereGeometry(1,5,4),dirtMat=mat('#e0cfaf');for(let j=0;j<110;j++){const m=mesh(geo,dirtMat,dirt);m.position.set((rng()-.5)*14,-rng()*2.1,.2);m.scale.set(.006+rng()*.012,.004,.003);}instanceRepeats(dirt);
    pumpGroup=new T.Group();pumpGroup.position.x=-.18;scene.add(pumpGroup);const pipepoints=[V(1.55,-2.45,1.4),V(1.55,.34,1.4),V(1.47,.45,1.4),V(1.09,.45,1.4),V(1.05,.13,1.4)];tube(pipepoints,.04,metal,pumpGroup,25);plane(.51,.055,1.56,.035,1.5,'#b6b19b',pumpGroup);plane(.39,.18,1.56,.16,1.5,'#677e69',pumpGroup);const motor=mesh(new T.CylinderGeometry(.085,.085,.25,12),metal,pumpGroup);motor.rotation.z=Math.PI/2;motor.position.set(1.55,.22,1.6);for(let j=0;j<5;j++)plane(.012,.11,1.43+j*.05,.17,1.7,'#a7b59b',pumpGroup);
    rainGroup=new T.Group();scene.add(rainGroup);const rainMat=new T.LineBasicMaterial({color:0x88b1bb,transparent:true,opacity:.65});for(let j=0;j<65;j++){const line=new T.Line(new T.BufferGeometry().setFromPoints([V(0,0,0),V(-.025,-.15,0)]),rainMat);line.position.set((rng()-.5)*9,rng()*3.1,2);rainGroup.add(line);}rainGroup.visible=false;
    cloudGroup=new T.Group();scene.add(cloudGroup);const cloudMat=new T.MeshBasicMaterial({color:'#d8e0dc',transparent:true,opacity:.82,depthWrite:false});for(let c=0;c<3;c++){const cloud=new T.Group();cloud.position.set(-1.4+c*1.05,2.85+(c%2)*.25,2.2);cloud.userData.baseX=cloud.position.x;for(let j=0;j<5;j++){const puff=mesh(new T.SphereGeometry(1,12,8),cloudMat,cloud);puff.position.set((j-2)*.15,Math.sin(j*1.8)*.07,0);puff.scale.set(.26,.12+(j%2)*.07,.025);}cloudGroup.add(cloud);}cloudGroup.visible=false;
    const pm=mat('#b8e3dd',{emissive:'#68aaa7',emissiveIntensity:.3});particles=new T.Group();particles.position.x=-.18;scene.add(particles);for(let j=0;j<18;j++){const m=mesh(new T.SphereGeometry(.017,5,4),pm,particles);m.userData.phase=j/18;}particles.visible=false;
    infiltrationGroup=new T.Group();scene.add(infiltrationGroup);for(let j=0;j<18;j++){const m=mesh(new T.SphereGeometry(.013,4,3),pm,infiltrationGroup);m.userData.phase=j/18;m.position.set(-1.4+j*.18,-.1,1.16);}infiltrationGroup.visible=false;
    uptakeGroup=new T.Group();scene.add(uptakeGroup);rechargeGroup=new T.Group();scene.add(rechargeGroup);for(let j=0;j<14;j++){const u=mesh(new T.SphereGeometry(.017,5,4),pm,uptakeGroup);u.userData.phase=j/14;const q=mesh(new T.SphereGeometry(.018,5,4),pm,rechargeGroup);q.userData.phase=j/14;}uptakeGroup.visible=rechargeGroup.visible=false;
    fertilizerGroup=new T.Group();scene.add(fertilizerGroup);const fm=mat('#e4dfbd');for(let j=0;j<16;j++){const m=mesh(new T.SphereGeometry(.014,4,3),fm,fertilizerGroup);m.userData.phase=j/16;m.position.set(-.75+(j%4)*.25,.6+(j%5)*.2,1.2);}fertilizerGroup.visible=false;
    resize();window.addEventListener('resize',resize);requestAnimationFrame(frame);return true;
  }
  function resize(){if(!renderer)return;const w=host.clientWidth,h=host.clientHeight,aspect=w/h,height=aspect<.8?(h<720?9.1:8):7.4,width=height*aspect;camera.left=-width/2;camera.right=width/2;camera.top=height/2;camera.bottom=-height/2;camera.updateProjectionMatrix();renderer.setSize(w,h);renderer.render(scene,camera);positionWaterLabel();}
  function positionWaterLabel(){const label=document.getElementById('aquifer-label');if(!label||!camera)return;const p=V(0,waterSurface,0).project(camera);label.style.top=((1-p.y)*host.clientHeight/2-15)+'px';}
  function update(v,animate,settings){if(!renderer&&!initialize()){host.innerHTML='<p class="webgl-fallback">The field view needs WebGL on this browser. All game choices and accounting still work.</p>';return;}
    isMotion=settings.motion;const index=v.def.stages.indexOf(v.stage),stage=v.id+':'+index;if(stage!==currentStage){buildPlant(v.id,index);growStart=animate&&!isMotion?Date.now():0;}
    plant.visible=roots.visible=v.future||v.s.cropStates[v.id].established;const level=v.s.aquifer/Sim.H.aquifer_capacity_L;waterGoal=-2.6+level*.95;if(!animate||isMotion)waterSurface=waterGoal;water.position.y=waterSurface-6;positionWaterLabel();pond.visible=v.s.zones.some(z=>z.pond>0);const m=v.s.zones.reduce((n,z)=>n+z.soil,0)/(Sim.A*Sim.H.soil_capacity_mm);soilSurface.material.color.set(m>.75?'#806446':'#9a7954');
    flow=v.s.lastFlows;flow={...flow,cropET:v.s.events.filter(e=>e.date===v.s.date&&e.type==='water_balance'&&e.cropId===v.id).reduce((n,e)=>n+e.quantity,0)};until=animate?Date.now()+3600:0;cloudGroup.visible=flow.rain>0&&!v.future;rainGroup.visible=animate&&flow.rain>0&&!isMotion;particles.visible=animate&&flow.pumped>0&&!isMotion;
    fertilizing=animate&&settings.lastAnimation==='fert';plant.scale.y=growStart ? .88 : 1;renderer.render(scene,camera);
  }
  function frame(time){requestAnimationFrame(frame);if(document.hidden)return;const elapsed=Math.min(.08,(time-lastTime)/1000);lastTime=time;const active=Date.now()<until&&!isMotion,growing=growStart>0&&!isMotion;if(growStart){const fraction=Math.min(1,(Date.now()-growStart)/900);plant.scale.y=.88+fraction*.12;roots.scale.y=.88+fraction*.12;if(fraction>=1||isMotion){growStart=0;plant.scale.y=1;roots.scale.y=1;}}
    if(active&&flow.rain>0)rainGroup.children.forEach((drop,i)=>{drop.visible=i<Math.min(65,10+Math.round(flow.rain/Sim.A));if(drop.visible){drop.position.y-=elapsed*3.5;if(drop.position.y<.05)drop.position.y=3.1;}});
    if(active&&flow.rain>0)cloudGroup.children.forEach((c,i)=>{c.position.x=c.userData.baseX+Math.sin(time*.0007+i)*.13;});
    rainGroup.visible=active&&flow.rain>0;particles.visible=active&&flow.pumped>0;
    if(particles.visible)particles.children.forEach((p,j)=>{p.userData.phase=(p.userData.phase+elapsed*.45)%1;const f=p.userData.phase;if(f<.82)p.position.set(1.55,-2.4+f/ .82*2.85,1.8);else if(f<.94)p.position.set(1.55-(f-.82)/.12*.50,.45,1.8);else p.position.set(1.05,.45-(f-.94)/.06*.43,1.8);});
    fertilizerGroup.visible=active&&fertilizing;if(fertilizerGroup.visible)fertilizerGroup.children.forEach(p=>{p.userData.phase=(p.userData.phase+elapsed*.65)%1;p.position.y=1.8*(1-p.userData.phase);});
    infiltrationGroup.visible=active&&flow.infiltration>0;if(infiltrationGroup.visible)infiltrationGroup.children.forEach(p=>{p.userData.phase=(p.userData.phase+elapsed*.35)%1;p.position.y=-.05-p.userData.phase*.8;});if(active){waterSurface+=(waterGoal-waterSurface)*Math.min(1,elapsed*3);water.position.y=waterSurface-6;positionWaterLabel();}
    uptakeGroup.visible=active&&flow.cropET>0&&plant.visible;rechargeGroup.visible=active&&(flow.queuedRecharge>0||flow.recharge>0);
    if(uptakeGroup.visible)uptakeGroup.children.forEach((p,j)=>{p.userData.phase=(p.userData.phase+elapsed*.4)%1;const f=p.userData.phase;p.position.set(-.4+Math.sin(j*2.4)*.28*(1-f),-.65+f*.92,1.25);});
    if(rechargeGroup.visible)rechargeGroup.children.forEach((p,j)=>{p.userData.phase=(p.userData.phase+elapsed*.3)%1;const f=p.userData.phase,top=flow.recharge>0?waterSurface+.3:-.85,bottom=flow.recharge>0?waterSurface-.08:waterSurface+.15;p.position.set(-1.15+(j%7)*.27,top+(bottom-top)*f,1.3);});
    water.material.color.set(active&&flow.recharge>0?'#80b1b2':'#669ca3');
    pumpGroup.position.y=active&&flow.pumped>0?Math.sin(time*.08)*.0015:0;
    // Only render continuously while an event is moving; the locked idle scene is cheap on phones.
    if(active||growing)renderer.render(scene,camera);
  }
  return{update,resize,info:()=>({representation:'flat lateral',waterSurface,waterGoal,revision:T.REVISION,locked:true,renderer:!!renderer,stage:currentStage,groundScreenFraction:camera?(1-V(0,0,0).project(camera).y)/2:null,cloudsVisible:!!cloudGroup?.visible,uptakeAnimating:!!uptakeGroup?.visible,rechargeAnimating:!!rechargeGroup?.visible,rainAnimating:!!rainGroup?.visible,pumpAnimating:!!particles?.visible,drawCalls:renderer?.info.render.calls})};
})();
