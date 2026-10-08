/* Original botanical geometry; continuous growth and connected water paths. Three.js r182, MIT. */
const Scene3D=(()=>{
  let renderer,scene,camera,plant,roots,water,pond,rainGroup,pumpGroup,particles,infiltrationGroup,fertilizerGroup,host,currentStage='',cloudGroup,uptakeGroup,rechargeGroup,grainMaterialRef,reproductiveMaterialRef,plantMaterials=[],seedMesh,moisture,dischargeGroup,pipeCurve,outletCurve,waterLine,poolLine;
  const T=THREE,V=(x,y,z)=>new T.Vector3(x,y,z),rng=Sim.random(630126);
  let strawGroup,fireGroup,smokeGroup,themeSeen='',slowFrames=0,fieldGroup,fieldSurface,fieldLines,fieldRoots,fieldCrop='',viewMode='bowl',viewBlend=0,baseHeight=9.8,fieldBatches=[],pumpAnchor=1.37,pumpOffset=0;
  const fieldCount=96,fieldUniforms={growth:{value:1},grain:{value:0},cut:{value:4},time:{value:0},wind:{value:1},spread:{value:1}};
  let heroPlants=[],underground,boreGroup,depthCompression=1,pumpSceneScale=1;
  const groundFraction=.65;
  let lastIntro=false;
  let lastQuantity='acre',lastMetrics=null;
  let soilTexture,lastPaused=false,lastReduced=false,lastViewBlend=-1;
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
  function disposeGroup(group){if(!group)return;group.traverse(o=>{if(o.isMesh||o.isLine){o.geometry.dispose();if(o.material!==stemMat&&o.material!==rootMat&&o.material!==metal)o.material.dispose();}});group.removeFromParent();}
  function buildPlant(id,index){heroPlants.forEach(o=>scene.remove(o));heroPlants=[];disposeGroup(plant);disposeGroup(roots);plant=new T.Group();roots=new T.Group();scene.add(plant);underground.add(roots);plant.position.set(0,.035,.03);roots.position.x=.4;
    const rice=id==='rice',gold=index>=8,color=gold?'#b8a153':rice?'#658344':'#7b8b42',leafMaterial=mat(color,{side:T.DoubleSide}),grainMaterial=mat(gold?'#d0ad61':index===7?'#a4a46a':'#9da563'),stemMaterial=mat(gold?'#a9914c':'#6c8248'),seedMat=mat(rice?'#b49d64':'#bca66e'),grainGeo=new T.SphereGeometry(1,7,5),flowerGeo=new T.SphereGeometry(.008,5,4),flowerMat=mat('#e4deb0'),N=index<2?1:index===2?3:index===3?8:7;
    const reproductiveMaterial=mat(gold?'#ac965c':'#779153',{transparent:true,opacity:0,depthWrite:false});
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
        if(rice){const panicle=V(tip.x+.16,tip.y+.25,tip.z+.025),end=V(tip.x+.32,tip.y+(gold?-.12:.08),tip.z+.07);tube([tip,panicle,end],.004,reproductiveMaterial,plant,15);
          for(let j=0;j<9;j++){const t=j/9,origin=tip.clone().lerp(panicle,Math.min(1,t*1.4));origin.y-=t*t*.19;for(let side=-1;side<=1;side+=2){const branchEnd=origin.clone().add(V(side*(.06+.09*t),-.03-t*.12,(r()-.5)*.12));tube([origin,origin.clone().lerp(branchEnd,.5).add(V(0,.02,0)),branchEnd],.002,reproductiveMaterial,plant,5);for(let g=0;g<4;g++){const point=origin.clone().lerp(branchEnd,(g+1)/4);point.y-=.01*g;grain(point,.3+(g%2)*.4,index===7||gold?.028:.019,grainMaterial,plant,grainGeo);if(index===6&&g===2){const anther=mesh(flowerGeo,flowerMat,plant);anther.position.copy(point).add(V(.01,-.023,0));}}}
          }
        }else{line(tip,tip.clone().add(V(0,.38,0)),.004,reproductiveMaterial,plant);for(let j=0;j<10;j++){const yy=j*.033;for(let side=-1;side<=1;side+=2){const pos=tip.clone().add(V(side*.035,yy,.005*(j%2)));const g=grain(pos,0,index===7?.047:.038,grainMaterial,plant,grainGeo);g.rotation.z=side*-.5;line(pos.clone().add(V(0,.035,0)),pos.clone().add(V(side*.06,.15,.03)),.0012,reproductiveMaterial,plant);if(index===6&&j%3===0){const a=mesh(flowerGeo,flowerMat,plant);a.position.copy(pos).add(V(side*.035,-.015,.015));}}}}
      }
    }
    if(index===9){const sheaf=new T.Group();plant.add(sheaf);sheaf.rotation.z=-.55;sheaf.position.set(.14,.02,0);for(let j=0;j<8;j++){const x=(j-4)*.025;line(V(x,0,0),V(x,.98,(j%2)*.04),.009,stemMaterial,sheaf);grain(V(x,.99,(j%2)*.04),0,rice?.11:.14,grainMaterial,sheaf,grainGeo);}const tie=mesh(new T.TorusGeometry(.13,.012,4,12),mat('#8c7757'),sheaf);tie.rotation.x=Math.PI/2;tie.position.y=.35;}
    const length=[.16,.31,.48,.62,.77,.9,1.0,1.05,1.12,1.1][index],count=index===0?3:8+index*3;
    for(let j=0;j<count;j++){const spread=(r()-.5)*length*.95,origin=V(-.4,-.03,1.132),end=V(-.4+spread,-length*(.6+r()*.4),1.14);tube([origin,V(-.4+spread*.35,-length*.35,1.14),end],j%3===0?.009:.004,rootMat,roots,10);for(let k=0;k<3;k++){const t=.25+k*.23,from=origin.clone().lerp(end,t);tube([from,from.clone().add(V(spread*.2+(k%2?.035:-.035),-.045,0)),from.clone().add(V(spread*.35+(k%2?.07:-.07),-.10,0))],.002,rootMat,roots,5);}}
    instanceRepeats(plant);mergeStatic(plant);mergeStatic(roots);grainMaterialRef=grainMaterial;reproductiveMaterialRef=reproductiveMaterial;currentStage=id;configureGrowth();for(let i=0;i<4;i++){const copy=plant.clone(true);scene.add(copy);heroPlants.push(copy);}
  }
  const uniforms={time:{value:0},height:{value:1},spread:{value:1},root:{value:1},wind:{value:1},cut:{value:4}};
  let soilSurface,waterSurface=-1.84,waterGoal=-1.84,surfaceHeight=0,pumpStrength=0,rainStrength=0,rechargeStrength=0,infiltrationStrength=0,uptakeStrength=0,lastDay=-1,renderedFrames=0,geometryBuilds=0,waterDirection=0,lastPosition=null,lastMotion=false,failed=false;
  function configureGrowth(){
    geometryBuilds++;plantMaterials=[...new Set([...plant.children].filter(x=>x.material).map(x=>x.material))];
    function deform(material,root){material.onBeforeCompile=shader=>{
      Object.assign(shader.uniforms,{uTime:uniforms.time,uGrowth:uniforms.height,uSpread:uniforms.spread,uRoot:uniforms.root,uWind:uniforms.wind,uCut:uniforms.cut});
      shader.vertexShader='uniform float uTime,uGrowth,uSpread,uRoot,uWind; varying float vPlantY;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`vec4 mvPosition=vec4(transformed,1.0);
        #ifdef USE_BATCHING
        mvPosition=batchingMatrix*mvPosition;
        #endif
        #ifdef USE_INSTANCING
        mvPosition=instanceMatrix*mvPosition;
        #endif
        vPlantY=mvPosition.y;
        ${root?'mvPosition.x=-.4+(mvPosition.x+.4)*uRoot;mvPosition.y*=uRoot;':'mvPosition.x*=uSpread;mvPosition.y*=uGrowth;float stemY=max(0.0,mvPosition.y);mvPosition.x+=uWind*(sin(uTime*1.25+mvPosition.y*1.4+mvPosition.x*4.0)*.017*stemY*stemY+sin(uTime*2.3+mvPosition.z*7.0)*.011*stemY);'}
        mvPosition=modelViewMatrix*mvPosition;gl_Position=projectionMatrix*mvPosition;`);
      if(!root){shader.fragmentShader='uniform float uCut;varying float vPlantY;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(vPlantY>uCut)discard;');}
    };material.customProgramCacheKey=()=>root?'continuous-root-v1':'continuous-plant-v1';material.needsUpdate=true;}
    plantMaterials.forEach(m=>deform(m,false));deform(rootMat,true);grainMaterialRef.transparent=true;grainMaterialRef.opacity=0;grainMaterialRef.depthWrite=false;
  }
  function plane(width,height,x,y,z,color,parent=scene,opacity=1){const m=mesh(new T.PlaneGeometry(width,height),new T.MeshBasicMaterial({color,transparent:opacity<1,opacity,depthWrite:opacity===1}),parent);m.position.set(x,y,z);return m;}
  function dotGroup(count,radius,color){const group=new T.Group(),geometry=new T.SphereGeometry(radius,5,4),material=new T.MeshBasicMaterial({color,transparent:true,opacity:.8}),batch=new T.InstancedMesh(geometry,material,count);group.userData.dots=[];for(let j=0;j<count;j++){const dot=new T.Object3D();dot.userData.phase=j/count;dot.material=material;group.userData.dots.push(dot);}group.add(batch);group.userData.batch=batch;scene.add(group);return group;}
  function initialize(){
    host=document.getElementById('scene-art');try{renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch(e){failed=true;host.innerHTML='<p class="webgl-fallback"><strong>The story is still here.</strong>This device cannot draw the field. Follow the chapter descriptions, water totals and harvest bowl using the controls below.</p>';return false;}
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor(0xf3f0e5,1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;host.appendChild(renderer.domElement);
    scene=new T.Scene();underground=new T.Group();scene.add(underground);camera=new T.OrthographicCamera(-4,4,4,-4,.1,40);camera.position.set(0,.05,12);camera.lookAt(0,.05,0);scene.add(new T.HemisphereLight(0xfff9e8,0x8e8768,2));const sun=new T.DirectionalLight(0xfff4d8,2.1);sun.position.set(-3,7,8);scene.add(sun);
    // Original procedural soil texture: offline, deterministic and inexpensive.
    const textureCanvas=document.createElement('canvas');textureCanvas.width=textureCanvas.height=256;const ctx=textureCanvas.getContext('2d'),texRandom=Sim.random(805);
    ctx.fillStyle='#e0d1b3';ctx.fillRect(0,0,256,256);for(let i=0;i<6500;i++){const a=.04+texRandom()*.13;ctx.fillStyle=texRandom()>.5?'rgba(68,48,26,'+a+')':'rgba(255,250,228,'+a+')';ctx.fillRect(texRandom()*256,texRandom()*256,1+texRandom()*3,1+texRandom()*2);}
    soilTexture=new T.CanvasTexture(textureCanvas);soilTexture.wrapS=soilTexture.wrapT=T.RepeatWrapping;soilTexture.repeat.set(22,3);soilTexture.colorSpace=T.SRGBColorSpace;
    function stratum(top,bottom,color,offset){const points=[],uvs=[];for(let j=0;j<400;j++){const a=-30+j*.15,b=a+.15,w=x=>Math.sin(x*2.1+offset)*.055+Math.sin(x*5.7+offset)*.022;points.push(a,top+w(a),-2,b,top+w(b),-2,a,bottom+w(a)*.8,-2,b,top+w(b),-2,b,bottom+w(b)*.8,-2,a,bottom+w(a)*.8,-2);uvs.push(j/400,0,(j+1)/400,0,j/400,1,(j+1)/400,0,(j+1)/400,1,j/400,1);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));const m=mesh(g,new T.MeshBasicMaterial({color,map:soilTexture}),underground);m.userData.soil=true;m.userData.originalColor=m.material.color.clone();return m;}
    plane(100,16,0,-8,-2.1,'#aa8556',underground);soilSurface=stratum(0,-.42,'#6f4c2e',0);stratum(-.42,-1.12,'#926d40',1);stratum(-1.12,-1.9,'#ae8756',2);stratum(-1.9,-7,'#ab9164',3);
    moisture=plane(100,.95,0,-.475,-1.5,'#405f4a',underground,.08);
    // Tint the saturated sediment instead of drawing an opaque underground reservoir.
    water=plane(100,12,0,waterSurface-6,-1.1,'#548b90',underground,.72);pond=plane(100,1,0,.03,.5,'#96c9c4',scene,.55);pond.visible=false;
    waterLine=new T.Line(new T.BufferGeometry(),new T.LineBasicMaterial({color:'#a2d2d0',transparent:true,opacity:.8}));poolLine=new T.Line(new T.BufferGeometry(),new T.LineBasicMaterial({color:'#bddeda',transparent:true,opacity:.9}));underground.add(waterLine);scene.add(poolLine);
    const dirt=new T.Group();underground.add(dirt);const geo=new T.SphereGeometry(1,5,4),dirtMat=mat('#796343');for(let j=0;j<550;j++){const m=mesh(geo,dirtMat,dirt);m.position.set((rng()-.5)*22,-rng()*5,.2);m.scale.set(.006+rng()*.02,.005+rng()*.007,.003);}instanceRepeats(dirt);
    pumpGroup=new T.Group();scene.add(pumpGroup);boreGroup=new T.Group();underground.add(boreGroup);
    // A ground-mounted motor and centrifugal pump, connected to the bore and outlet.
    const concrete=mat('#aaa58d'),paint=mat('#486956',{metalness:.18,roughness:.72}),darkMetal=mat('#344943',{metalness:.55,roughness:.48});
    box(.66,.09,.38,1.27,.045,1.45,'#aaa58d',pumpGroup);
    const motor=mesh(new T.CylinderGeometry(.12,.12,.36,18),paint,pumpGroup);motor.rotation.z=Math.PI/2;motor.position.set(1.37,.23,1.52);
    for(let j=0;j<8;j++){const fin=mesh(new T.TorusGeometry(.125,.009,5,18),darkMetal,pumpGroup);fin.rotation.y=Math.PI/2;fin.position.set(1.22+j*.037,.23,1.52);}
    box(.14,.07,.13,1.35,.39,1.52,'#586f5c',pumpGroup);
    const housing=mesh(new T.SphereGeometry(.135,18,12),paint,pumpGroup);housing.scale.set(.85,1,1);housing.position.set(1.09,.23,1.52);
    for(const x of [1.22,1.48])box(.07,.09,.22,x,.12,1.52,'#344943',pumpGroup);
    pipeCurve=new T.CatmullRomCurve3([V(1.37,-2.9,1.4),V(1.37,0,1.4),V(1.34,.15,1.4),V(1.09,.23,1.4),V(1.08,.49,1.4),V(.90,.53,1.4),V(.80,.44,1.4),V(.80,.18,1.4)],false,'centripetal');
    const surfacePipe=new T.CatmullRomCurve3(pipeCurve.points.slice(1),false,'centripetal');mesh(new T.TubeGeometry(surfacePipe,45,.048,12,false),metal,pumpGroup);line(V(1.37,-2.9,1.4),V(1.37,0,1.4),.048,metal,boreGroup);
    for(const y of [-2.6,-1.5,-.2]){const collar=mesh(new T.CylinderGeometry(.067,.067,.08,12),metal,boreGroup);collar.position.set(1.37,y,1.4);}
    const outletCollar=mesh(new T.CylinderGeometry(.067,.067,.08,12),metal,pumpGroup);outletCollar.position.set(.80,.20,1.4);
    box(.30,.025,.15,.72,.024,1.5,'#8a8d78',pumpGroup);
    outletCurve=new T.QuadraticBezierCurve3(V(.80,.18,1.8),V(.70,.12,1.8),V(.58,.02,1.8));
    dischargeGroup=dotGroup(18,.017,'#9bd9da');particles=dotGroup(25,.019,'#94d3d9');
    rainGroup=new T.Group();scene.add(rainGroup);const rainMat=new T.LineBasicMaterial({color:'#7fa5b1',transparent:true,opacity:.65});for(let j=0;j<70;j++){const drop=new T.Line(new T.BufferGeometry().setFromPoints([V(0,0,0),V(-.025,-.13,0)]),rainMat);drop.userData.phase=j/70;drop.userData.x=(rng()-.5)*8;rainGroup.add(drop);}
    cloudGroup=new T.Group();scene.add(cloudGroup);const cloudMat=new T.MeshBasicMaterial({color:'#d8e1de',transparent:true,opacity:.7,depthWrite:false});for(let c=0;c<3;c++){const cloud=new T.Group();cloud.position.set(-1.4+c*1.05,2.85+(c%2)*.25,2.2);cloud.userData.baseX=cloud.position.x;for(let j=0;j<5;j++){const puff=mesh(new T.SphereGeometry(1,12,8),cloudMat,cloud);puff.position.set((j-2)*.15,Math.sin(j*1.8)*.07,0);puff.scale.set(.26,.12+(j%2)*.07,.025);}cloudGroup.add(cloud);}
    infiltrationGroup=dotGroup(22,.011,'#b3ded4');uptakeGroup=dotGroup(12,.012,'#b9e4d5');rechargeGroup=dotGroup(18,.013,'#a8dcd3');fertilizerGroup=dotGroup(14,.011,'#e0dbb2');seedMesh=mesh(new T.SphereGeometry(1,7,5),mat('#b6a46b'));seedMesh.position.set(0,.025,1.2);seedMesh.scale.set(.045,.018,.025);
    strawGroup=dotGroup(70,.035,'#b9a167');fireGroup=dotGroup(42,.085,'#ff9e32');smokeGroup=dotGroup(22,.09,'#77776b');smokeGroup.userData.batch.geometry.dispose();smokeGroup.userData.batch.geometry=new T.SphereGeometry(.09,12,8);
    resize();window.addEventListener('resize',resize);new ResizeObserver(resize).observe(host);return true;
  }

  // Small reusable botanical clumps keep a full field economical on phones.
  function buildField(id){
    if(fieldGroup){fieldGroup.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});scene.remove(fieldGroup);}
    fieldGroup=new T.Group();scene.add(fieldGroup);fieldBatches=[];fieldCrop=id;
    const blades=[],ears=[],rice=id==='rice',random=Sim.random(rice?126:826);
    const tri=(list,a,b,c)=>list.push(...a,...b,...c);
    // Five curved stems, tapered leaf ribbons and crop-specific reproductive shapes.
    for(let stem=0;stem<5;stem++){
      const base=(stem-2)*.055,h=1.65+random()*.32,bend=(random()-.5)*.21;
      for(let j=0;j<9;j++){const a=j/9,b=(j+1)/9,x=t=>base+bend*t*t;tri(blades,[x(a)-.008,a*h,0],[x(a)+.008,a*h,0],[x(b)+.008,b*h,0]);tri(blades,[x(a)-.008,a*h,0],[x(b)+.008,b*h,0],[x(b)-.008,b*h,0]);}
      for(let leaf=0;leaf<5;leaf++){const y=.16+leaf*.26,side=(leaf+stem)%2?1:-1,length=.38+random()*.16;for(let j=0;j<10;j++){const a=j/10,b=(j+1)/10,point=(t,s)=>[base+side*length*t,y+Math.sin(t*Math.PI*.85)*.28-t*t*.13+s*Math.sin(Math.PI*t)*(rice?.022:.031),.012+Math.sin(t*Math.PI)*.025];tri(blades,point(a,-1),point(b,-1),point(a,1));tri(blades,point(a,1),point(b,-1),point(b,1));}}
      const tip=base+bend;
      if(rice){for(let branch=0;branch<7;branch++){const t=branch/7,xx=tip+t*.21,yy=h+.14*Math.sin(t*Math.PI)-t*.10;tri(ears,[tip,h,0],[xx-.004,yy,.01],[xx+.006,yy,.01]);for(let side of [-1,1])for(let grain=0;grain<3;grain++){const x=xx+side*(.025+grain*.025),y=yy-grain*.022-t*.04;tri(ears,[xx,yy,0],[x,y-.026,.025],[x+.012,y+.01,.025]);tri(ears,[x-.01,y-.012,.025],[x+.017,y-.02,.025],[x+.013,y+.026,.025]);}}}
      else{for(let grain=0;grain<9;grain++)for(let side of [-1,1]){const yy=h+grain*.028,xx=tip+side*.027;tri(ears,[tip,yy,0],[xx+side*.02,yy+.04,.025],[xx,yy+.053,.025]);tri(ears,[xx,yy+.025,.015],[xx+side*.06,yy+.17,.015],[xx+side*.004,yy+.025,.015]);}}
    }
    for(const [points,isGrain] of [[blades,false],[ears,true]]){
      const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(points,3));geo.computeVertexNormals();const material=new T.MeshStandardMaterial({color:isGrain?'#d2b76f':'#638143',side:T.DoubleSide,roughness:.92,transparent:true,opacity:1,depthWrite:!isGrain});
      material.onBeforeCompile=shader=>{Object.assign(shader.uniforms,{fGrowth:fieldUniforms.growth,fGrain:fieldUniforms.grain,fCut:fieldUniforms.cut,fTime:fieldUniforms.time,fWind:fieldUniforms.wind,fSpread:fieldUniforms.spread});shader.vertexShader='uniform float fGrowth,fTime,fWind,fSpread; varying float fHeight;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','vec3 transformed=vec3(position);fHeight=position.y;transformed.y*=fGrowth;transformed.x*=fSpread;float phase=0.0;\n#ifdef USE_INSTANCING\nphase=instanceMatrix[3].x*2.3+instanceMatrix[3].y*7.0;\n#endif\ntransformed.x+=sin(fTime*1.3+phase+position.y*1.7)*.023*position.y*position.y*fWind;');shader.fragmentShader='uniform float fCut,fGrain;varying float fHeight;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(fHeight>fCut)discard;'+(isGrain?'if(fGrain<.01)discard;':''));};material.customProgramCacheKey=()=>isGrain?'field-grain-v2':'field-leaf-v2';
      const batch=new T.InstancedMesh(geo,material,fieldCount);batch.frustumCulled=false;batch.userData.grain=isGrain;for(let j=0;j<fieldCount;j++){const tone=.87+random()*.19;batch.setColorAt(j,new T.Color(tone,tone,tone));}fieldGroup.add(batch);fieldBatches.push(batch);
    }
    if(!fieldSurface){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([-.5,0,-.8,.5,0,-.8,-.42,.76,-.8,.5,0,-.8,.42,.76,-.8,-.42,.76,-.8],3));g.setAttribute('uv',new T.Float32BufferAttribute([0,0,1,0,0,1,1,0,1,1,0,1],2));fieldSurface=new T.Mesh(g,new T.MeshBasicMaterial({color:'#95805a',map:soilTexture,transparent:true,opacity:1,side:T.DoubleSide}));scene.add(fieldSurface);fieldRoots=new T.LineSegments(new T.BufferGeometry(),new T.LineBasicMaterial({color:'#e0cda3',transparent:true,opacity:.65}));underground.add(fieldRoots);fieldLines=new T.LineSegments(new T.BufferGeometry(),new T.LineBasicMaterial({color:'#7e6c47',transparent:true,opacity:.65}));scene.add(fieldLines);}
  }
  const fieldDummy=new T.Object3D();
  function updateField(v,{motion,time,dark}){
    if(fieldCrop!==v.id)buildField(v.id);
    const perspectiveDepth=v.fallow?.16:Math.min(1,v.growth.height/.7),visible=viewBlend>.02,width=(camera.right-camera.left)*.96;fieldGroup.visible=fieldSurface.visible=fieldLines.visible=fieldRoots.visible=visible;
    fieldUniforms.growth.value=v.growth.height;fieldUniforms.grain.value=Timeline.phase(v.das,v.def.stages[5].start_das,v.def.stages[7].start_das);fieldUniforms.cut.value=2.3-v.growth.harvest*2.17;fieldUniforms.time.value=time;fieldUniforms.wind.value=motion?0:1;fieldUniforms.spread.value=.18+v.growth.spread*.82;
    fieldSurface.scale.x=width;fieldSurface.scale.y=perspectiveDepth;fieldSurface.material.color.set(dark?'#66553d':v.pondDepthMm>5?'#635736':'#7a603d');fieldSurface.material.opacity=viewBlend;
    const rootPoints=[],rootRandom=Sim.random(1926);
    for(let j=0;j<12;j++){const x=-width/2+(j+.5)*width/12;for(let k=0;k<5;k++){const spread=(rootRandom()-.5)*.36*v.growth.root,depth=(.3+rootRandom()*.8)*v.growth.root;let previous=V(x,-.02,1.35);for(let step=1;step<=6;step++){const f=step/6,next=V(x+spread*Math.sin(f*1.5)+Math.sin(j+k+f*9)*.012,-depth*f,1.35);rootPoints.push(previous.x,previous.y,previous.z,next.x,next.y,next.z);if(step>2){const tip=next.clone().add(V((k%2?1:-1)*.04,-.06,0));rootPoints.push(next.x,next.y,next.z,tip.x,tip.y,tip.z);}previous=next;}}}fieldRoots.geometry.setAttribute('position',new T.Float32BufferAttribute(rootPoints,3));fieldRoots.material.opacity=viewBlend*.70;
    const linePoints=[-width/2,0,1.1,width/2,0,1.1,-width/2,0,1.1,-width*.42,.76,1.1,width/2,0,1.1,width*.42,.76,1.1,-width*.42,.76,1.1,width*.42,.76,1.1];for(let j=0;j<21;j++){const x=-width/2+j/20*width;linePoints.push(x,0,1.1,x*.84,.76,1.1);}fieldLines.geometry.setAttribute('position',new T.Float32BufferAttribute(linePoints,3));fieldLines.material.opacity=0;
    fieldBatches.forEach(batch=>{batch.material.opacity=viewBlend*(batch.userData.grain?fieldUniforms.grain.value:1);batch.material.color.set(batch.userData.grain?'#cfb16e':dark?'#93b860':new T.Color('#486d32').lerp(new T.Color('#b29a51'),v.growth.ripe));for(let j=0;j<fieldCount;j++){const row=Math.floor(j/12),column=j%12,back=(7-row)/7,variation=Math.sin(j*73.3);fieldDummy.position.set((-width/2+(column+.5)*width/12)*(1-back*.16)+variation*.018,back*.55*perspectiveDepth+.02,-.2+row*.035);fieldDummy.scale.set((.95-back*.16+variation*.045)*Math.min(1.3,width/5),1.14-back*.17+variation*.11,.8);fieldDummy.rotation.z=variation*.022;fieldDummy.updateMatrix();batch.setMatrixAt(j,fieldDummy.matrix);}batch.instanceMatrix.needsUpdate=true;});
  }

  function positionPump(){
    const screenX=host.clientWidth*.91;pumpAnchor=(screenX/host.clientWidth*2-1)*camera.right;pumpOffset=pumpAnchor-1.37*.85*pumpSceneScale;
    for(const group of [pumpGroup,boreGroup,particles,dischargeGroup]){group.position.x=pumpOffset;group.scale.x=.85*pumpSceneScale;group.scale.y=group===pumpGroup||group===dischargeGroup?pumpSceneScale:1;}
  }
  function fitCamera(top){
    camera.top=top;camera.bottom=-top*(1-groundFraction)/groundFraction;
    const width=(camera.top-camera.bottom)*host.clientWidth/host.clientHeight;camera.left=-width/2;camera.right=width/2;camera.updateProjectionMatrix();
    depthCompression=-camera.bottom/3.05;underground.scale.y=depthCompression;pumpSceneScale=Math.min(1,top/3.95);
  }
  function resize(){if(!renderer)return;lastPosition=null;const w=host.clientWidth,h=host.clientHeight;fitCamera(camera.top||3.95);renderer.setSize(w,h);positionPump();positionMarker();renderer.render(scene,camera);}
  function positionMarker(){if(!camera)return;const label=document.getElementById('groundwater-marker'),p=V(0,waterSurface*depthCompression,0).project(camera);if(label)label.style.top=((1-p.y)*host.clientHeight/2)+'px';}
  const ease=(value,target,dt,rate=4)=>value+(target-value)*(1-Math.exp(-dt*rate));
  const wavePoints=[];for(let i=0;i<48;i++)wavePoints.push(V(0,0,0));
  function wave(line,level,time,amplitude){const width=camera.right-camera.left;for(let i=0;i<wavePoints.length;i++){const x=-width/2+i/(wavePoints.length-1)*width;wavePoints[i].set(x,level+amplitude*(Math.sin(x*3+time*.9)+Math.sin(x*5-time*.65)*.45),1.2);}line.geometry.setFromPoints(wavePoints);}
  function update(v,{motion,time,dt,displayMode='acre',quantityMode='acre',metrics=null,paused=false,intro=false,entry=null}){
    if(failed||!renderer&&!initialize())return;
    const dark=document.documentElement.dataset.theme==='dark',themeKey=dark?'dark':'light';
    if(entry){FieldPlot3D.renderEntry(renderer,v,{soilTexture,sourcePump:pumpGroup,host,motion,time,dark,...entry});host.dataset.view='seed';lastPosition=null;return;}
    if(themeSeen!==themeKey){themeSeen=themeKey;renderer.setClearColor(dark?0x14231e:0xf3f0e5,1);scene.traverse(o=>{if(o.isMesh&&(o.geometry.type==='PlaneGeometry'||o.userData.soil)){if(!o.userData.originalColor)o.userData.originalColor=o.material.color.clone();o.material.color.copy(o.userData.originalColor).multiplyScalar(dark?.57:1);}});lastPosition=null;}
    if(dt>.028&&!motion)slowFrames++;else slowFrames=Math.max(0,slowFrames-1);if(slowFrames>120&&renderer.getPixelRatio()>1){renderer.setPixelRatio(1);resize();slowFrames=0;}
    if(viewMode!==displayMode||lastQuantity!==quantityMode){viewMode=displayMode;lastQuantity=quantityMode;lastPosition=null;}lastMetrics=metrics;
    const fitTop=v.fallow?1.2:Math.max(.75,Math.min(5.1,v.growth.height*4.35+.35));if(Math.abs(camera.top-fitTop)>.001)fitCamera(fitTop);cloudGroup.scale.set(camera.right/2.9,camera.top/4.7,1);cloudGroup.position.y=camera.top*.76-3*cloudGroup.scale.y;
    if(lastIntro!==intro){lastIntro=intro;lastPosition=null;}
    const oldBlend=viewBlend;viewBlend=motion?(viewMode==='acre'?1:0):ease(viewBlend,viewMode==='acre'?1:0,dt,6);
    const staticFrame=motion||paused;if(staticFrame&&lastMotion&&paused===lastPaused&&motion===lastReduced&&v.position===lastPosition&&Math.abs(viewBlend-lastViewBlend)<.00001)return;lastPosition=v.position;lastMotion=staticFrame;lastPaused=paused;lastReduced=motion;lastViewBlend=viewBlend;
    if(currentStage!==v.id)buildPlant(v.id,8);
    uniforms.time.value=motion?0:time;uniforms.wind.value=motion?0:1;uniforms.height.value=v.growth.height;uniforms.spread.value=v.growth.spread;uniforms.root.value=v.growth.root;uniforms.cut.value=4-v.growth.harvest*3.82;
    const green=new T.Color(dark?'#95b96a':v.id==='rice'?'#668946':'#7a914e'),gold=new T.Color(dark?'#dac676':'#b8a15b');plantMaterials.forEach(m=>{if(m!==grainMaterialRef)m.color.copy(green).lerp(gold,v.growth.ripe);});grainMaterialRef.color.set('#c8b47a');grainMaterialRef.opacity=v.growth.grain;reproductiveMaterialRef.opacity=Timeline.phase(v.das,v.def.stages[5].start_das,v.def.stages[6].start_das+3);rootMat.color.set(v.fallow?'#b7a686':'#d5c39e');plant.visible=roots.visible=true;seedMesh.visible=!v.fallow&&v.das<5;
    positionPump();
    updateField(v,{motion,time,dark});
    plant.visible=true;plant.position.z=2;plant.scale.setScalar(viewBlend>.5?.96:1.03);heroPlants.forEach((o,i)=>{o.visible=viewBlend>.04&&!v.fallow;o.position.set((i<2?-1:1)*(i%2?.73:.39)*camera.right,.015,1.9);o.scale.setScalar((.82+(i%2)*.10)*viewBlend);});seedMesh.visible=seedMesh.visible&&viewBlend<.5;roots.visible=true;roots.position.z=.3;roots.scale.setScalar(viewBlend>.5?1:1.18);roots.scale.y*=1.35;
    // All values are driven by the same continuously sampled, conserved daily ledger.
    const oldWater=waterSurface;waterGoal=-2.75+v.aquiferL/Sim.H.aquifer_capacity_L*1.05;waterSurface=(motion||paused)?waterGoal:ease(waterSurface,waterGoal,dt,7);waterDirection=Math.sign(waterSurface-oldWater);water.position.y=waterSurface-6;positionMarker();
    const moistureFraction=v.soilL/(Sim.A*Sim.H.soil_capacity_mm);soilSurface.material.color.set(dark?(moistureFraction>.75?'#705b41':'#826948'):(moistureFraction>.75?'#654930':'#795633'));moisture.material.opacity=.03+Math.min(1,moistureFraction)*.16;
    // A true surface pool is held above y=0 before the timeline releases it into the root zone.
    const poolTarget=v.pondDepthMm>.05?.012+Math.min(v.pondDepthMm,130)/130*.13:0;surfaceHeight=(motion||paused)?poolTarget:ease(surfaceHeight,poolTarget,dt,6);pond.visible=surfaceHeight>.003;pond.scale.y=Math.max(.001,surfaceHeight);pond.position.y=surfaceHeight/2+.003;poolLine.visible=pond.visible;
    pumpStrength=(motion||paused)?(v.flow.pumped>0&&v.fraction<.4?1:0):ease(pumpStrength,v.flow.pumped>0&&v.fraction>.005&&v.fraction<.4?1:0,dt,6);
    rainStrength=(motion||paused)?(v.flow.rain>0&&v.fraction<.4?1:0):ease(rainStrength,v.flow.rain>0&&v.fraction>.005&&v.fraction<.4?1:0,dt,4);
    infiltrationStrength=(motion||paused)?(v.flow.infiltration>0&&v.fraction>=.3&&v.fraction<.72?1:0):ease(infiltrationStrength,v.flow.infiltration>0&&v.fraction>=.3&&v.fraction<.72?1:0,dt,5);
    uptakeStrength=(motion||paused)?(v.flow.cropET>0?1:0):ease(uptakeStrength,v.flow.cropET>0?1:0,dt,3);rechargeStrength=(motion||paused)?(v.flow.recharge>0||v.flow.queuedRecharge>0&&v.fraction>.8?1:0):ease(rechargeStrength,v.flow.recharge>0||v.flow.queuedRecharge>0&&v.fraction>.8?1:0,dt,4);
    cloudGroup.children[0].children[0].material.opacity=.7*rainStrength;cloudGroup.visible=rainStrength>.03;cloudGroup.children.forEach((c,i)=>{c.position.x=c.userData.baseX+(motion?0:Math.sin(time*.18+i)*.17);});rainGroup.visible=rainStrength>.04&&!motion;rainGroup.children.forEach((p,i)=>{p.visible=i<Math.min(70,20+Math.round(v.s.rainMm));p.position.set(p.userData.x,3.2-((motion?0:time*1.1)+p.userData.phase)%1*3.2,2);});rainGroup.children[0].material.opacity=.6*rainStrength;
    particles.visible=dischargeGroup.visible=pumpStrength>.03;particles.userData.dots.forEach(p=>{const f=((motion?0:time*.38)+p.userData.phase)%1;p.scale.setScalar(quantityMode==='bowl'?.65:1);p.position.copy(pipeCurve.getPoint(f));p.position.z=1.85;if(p.position.y>0)p.position.y*=pumpSceneScale;p.material.opacity=.85*pumpStrength;});dischargeGroup.userData.dots.forEach(p=>{const f=((motion?0:time*1.6)+p.userData.phase)%1;p.scale.setScalar(quantityMode==='bowl'?.65:1);p.position.copy(outletCurve.getPoint(f));p.position.y+=(surfaceHeight-.016)*(f*f);p.material.opacity=.85*pumpStrength;});
    infiltrationGroup.visible=infiltrationStrength>.04;infiltrationGroup.userData.dots.forEach((p,j)=>{const f=((motion?0:time*.38)+p.userData.phase)%1;p.position.set(-1.1+(j%11)*.21,-.04-f*.85,1.25);p.material.opacity=.55*infiltrationStrength;});
    uptakeGroup.visible=uptakeStrength>.05&&!v.fallow;uptakeGroup.userData.dots.forEach((p,j)=>{const f=((motion?0:time*.28)+p.userData.phase)%1;p.position.set(Math.sin(j*2.4)*.22*(1-f),-.55+f*.7,1.27);p.material.opacity=.6*uptakeStrength;});
    rechargeGroup.visible=rechargeStrength>.03;rechargeGroup.userData.dots.forEach((p,j)=>{const f=((motion?0:time*.27)+p.userData.phase)%1,arriving=v.flow.recharge>0,top=arriving?waterSurface+.28:-.9,bottom=arriving?waterSurface-.03:waterSurface+.15;p.position.set(-1.12+(j%9)*.23,top+(bottom-top)*f,1.3);p.material.opacity=.75*rechargeStrength;});
    const feeding=v.s.cropStates[v.id].products.some(p=>p.date===v.s.date&&p.category==='fertilizer');fertilizerGroup.visible=feeding&&v.fraction<.6;
    const origin=V(-camera.right*.25,1.25,1.9);
    fertilizerGroup.userData.dots.forEach((p,j)=>{const f=Timeline.phase(v.fraction, j*.007,.3+j*.007),x=-1.0+(j%7)*.17;p.position.set(origin.x+(x-origin.x)*f,origin.y*(1-f)+Math.sin(f*Math.PI)*.3-Math.max(0,v.fraction-.3)*.5,1.9);p.scale.setScalar(1.6*(1-Timeline.phase(v.fraction,.4,.6)));p.material.opacity=1;});
    const after=v.position>=121,burning=v.residueStrategy==='burn'&&v.position<125&&after;
    strawGroup.visible=after;strawGroup.userData.batch.material.color.set(v.residueStrategy==='burn'?'#625744':'#baa16a');
    strawGroup.userData.dots.forEach((p,j)=>{const cover=v.residueStrategy==='mulch'?v.residueCover:1-v.residueProgress*.9;const spread=v.residueStrategy==='mulch'?v.residueProgress:1;p.position.set(-.4+(-1.05+(j%14)*.17)*spread,.025+Math.floor(j/14)*.012+Math.sin(spread*Math.PI)*.18,1.55);p.scale.set(cover*1.5,.18,1);p.rotation.z=(1-spread)*1.5+Math.sin(j*3)*.4;});
    fireGroup.visible=burning;smokeGroup.visible=burning;const clock=motion?0:time;
    fireGroup.userData.dots.forEach((p,j)=>{const f=(clock*.9+j/42)%1;p.position.set(-1.4+(j%14)*.17+Math.sin(clock*3+j)*.025,.05+f*.42,1.8);p.scale.set((1-f)*.7,(1-f)*(1.5+Math.sin(clock*5+j)*.4),.4);p.material.opacity=.85*(1-v.residueProgress);});
    smokeGroup.userData.dots.forEach((p,j)=>{const f=(clock*.2+j/22)%1;p.position.set(-1.3+(j%7)*.32+f*.25,.3+f*1.7,1.7);p.scale.setScalar(.5+f*1.4);p.material.opacity=.13*(1-v.residueProgress);});
    for(const group of [particles,dischargeGroup,infiltrationGroup,uptakeGroup,rechargeGroup,fertilizerGroup,strawGroup,fireGroup,smokeGroup]){if(!group.visible)continue;group.userData.dots.forEach((p,i)=>{if(p.position.y<0)p.position.y*=depthCompression;p.updateMatrix();group.userData.batch.setMatrixAt(i,p.matrix);});group.userData.batch.instanceMatrix.needsUpdate=true;}
    if(intro)for(const group of [cloudGroup,rainGroup,particles,dischargeGroup,infiltrationGroup,uptakeGroup,rechargeGroup,fertilizerGroup])group.visible=false;
    water.material.color.set(dark?'#42797f':v.flow.recharge>0?'#518e8a':'#548b90');wave(waterLine,waterSurface,motion?0:time,motion?0:.002);if(pond.visible)wave(poolLine,surfaceHeight+.003,motion?0:time,motion?0:.004);if(viewMode==='acre'&&!intro){FieldPlot3D.render(renderer,v,{soilTexture,sourcePump:pumpGroup,host,motion,time,dark,metrics});host.dataset.view='field3d';}else{host.dataset.view='plant';document.getElementById('soil-status').style.top='';renderer.render(scene,camera);}renderedFrames++;lastDay=v.day;
  }
  return{update,resize,invalidate:()=>{lastPosition=null;},info:()=>({plot:FieldPlot3D.info(),representation:viewMode==='acre'?'3D planted field':'plant close-up',viewMode,zoomBlend:viewBlend,visiblePlantClumps:viewMode==='acre'?(FieldPlot3D.info().plantCount||0):1,revision:T.REVISION,locked:true,renderer:!!renderer,reduced:lastReduced,paused:lastPaused,position:lastPosition,crop:currentStage,geometryBuilds,renderedFrames,waterSurface,waterGoal,waterDirection,surfacePoolHeight:surfaceHeight,pumpStrength,rainStrength,cloudsVisible:!!cloudGroup?.visible,infiltrationAnimating:!!infiltrationGroup?.visible,uptakeAnimating:!!uptakeGroup?.visible,rechargeAnimating:!!rechargeGroup?.visible,rainAnimating:!!rainGroup?.visible,pumpAnimating:!!particles?.visible,dischargeAnimating:!!dischargeGroup?.visible,growth:uniforms.height.value,windTime:uniforms.time.value,day:lastDay,tubewellScreenX:camera?(pumpAnchor/camera.right+1)*host.clientWidth/2:null,tubewellBounds:camera?{left:(pumpOffset+.58*.85*pumpSceneScale-camera.left)/(camera.right-camera.left)*host.clientWidth,right:(pumpOffset+1.70*.85*pumpSceneScale-camera.left)/(camera.right-camera.left)*host.clientWidth,top:(camera.top-.61*pumpSceneScale)/(camera.top-camera.bottom)*host.clientHeight,bottom:(camera.top-.02*pumpSceneScale)/(camera.top-camera.bottom)*host.clientHeight}:null,tubewellOutletX:pumpOffset+.80*.85*pumpSceneScale,quantityMode:lastQuantity,allocatedWaterL:lastMetrics?.pumpedL,sceneHeight:host?.clientHeight,soilScreenY:camera?(camera.top/(camera.top-camera.bottom))*host.clientHeight:null,depthCompression,groundFraction,displayedCropHeightPx:camera?3.12*uniforms.height.value/(camera.top-camera.bottom)*host.clientHeight:null,waterScreenY:camera?((camera.top-waterSurface*depthCompression)/(camera.top-camera.bottom))*host.clientHeight:null,cropCenterX:plant?new T.Vector3(plant.position.x,0,0).project(camera).x:null,drawCalls:renderer?.info.render.calls,theme:themeSeen,fireVisible:!!fireGroup?.visible,residueVisible:!!strawGroup?.visible,fertilizerVisible:!!fertilizerGroup?.visible,pixelRatio:renderer?.getPixelRatio()})};
})();
