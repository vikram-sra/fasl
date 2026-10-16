/* Original botanical geometry; continuous growth and connected water paths. Three.js r182, MIT. */
const Scene3D=(()=>{
  let renderer,scene,camera,plant,roots,water,pond,rainGroup,pumpGroup,particles,infiltrationGroup,fertilizerGroup,host,currentStage='',cloudGroup,uptakeGroup,rechargeGroup,grainMaterialRef,reproductiveMaterialRef,plantMaterials=[],seedMesh,moisture,dischargeGroup,pipeCurve,outletCurve,waterLine,poolLine;
  let skyMesh,skyUniforms,mistMesh,sunLight,hemiLight,capillaryFringe,outletStream,splashGroup;
  const T=THREE,V=(x,y,z)=>new T.Vector3(x,y,z),rng=Sim.random(630126);
  let strawGroup,fireGroup,smokeGroup,themeSeen='',slowFrames=0,fieldGroup,fieldSurface,fieldLines,fieldRoots,fieldCrop='',viewMode='bowl',viewBlend=0,baseHeight=9.8,fieldBatches=[],pumpAnchor=1.37,pumpOffset=0;
  const fieldCount=96,fieldUniforms={growth:{value:1},grain:{value:0},cut:{value:4},time:{value:0},wind:{value:1},spread:{value:1}};
  let heroPlants=[],underground,boreGroup,depthCompression=1,pumpSceneScale=1;
  let groundFraction=.65,sectionBlend=0;
  let lastIntro=false;
  let lastQuantity='acre',lastMetrics=null;
  let soilTexture,lastPaused=false,lastReduced=false,lastViewBlend=-1;
  const materials={},mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.82,...extra});
  const stemMat=mat('#6d7f46',{roughness:.76}),rootMat=mat('#d8c59c',{roughness:.88}),metal=mat('#6c7e77',{metalness:.68,roughness:.38});

  // Real-world material and light layer: CC0 PBR textures (ambientCG) and a CC0 HDRI (Poly Haven) from the embedded ASSETS pack.
  // Everything degrades to the original procedural look when ASSETS is empty or a map is missing.
  const Look=(()=>{
    const A=typeof ASSETS==='object'&&ASSETS?ASSETS:{},cache={};let onLoad=()=>{},applied=0,loaded=0,envReady=false;
    const has=id=>!!A[id+'.albedo'];
    function load(key,srgb){
      if(cache[key])return cache[key];
      return cache[key]=new Promise(resolve=>{
        if(!A[key]){resolve(null);return;}
        new T.TextureLoader().load(A[key],t=>{t.colorSpace=srgb?T.SRGBColorSpace:T.NoColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;resolve(t);},undefined,()=>resolve(null));
      });
    }
    function apply(m,id,o={}){
      if(!has(id))return false;applied++;
      Promise.all([o.albedo===false?null:load(id+'.albedo',true),load(id+'.normal',false),load(id+'.orm',false)]).then(([a,n,r])=>{
        const set=t=>{const c=t.clone();c.repeat.set(o.rx||1,o.ry||1);c.needsUpdate=true;return c;};
        if(a)m.map=set(a);
        if(n){m.normalMap=set(n);m.normalScale.set(o.normal??1,o.normal??1);m.bumpMap=null;}
        if(r){m.roughnessMap=set(r);m.aoMap=set(r);m.aoMapIntensity=o.ao??.75;}
        m.needsUpdate=true;loaded++;onLoad();
      });
      return true;
    }
    function mesh(id){
      const key='m:'+id;if(cache[key])return cache[key];const src=A[id];if(!src)return null;
      try{
        const j=JSON.parse(atob(src.slice(src.indexOf(',')+1))),dec=(s,C)=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return new C(u.buffer);};
        const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(dec(j.p,Float32Array),3));g.setAttribute('normal',new T.BufferAttribute(dec(j.n,Float32Array),3));g.setAttribute('uv',new T.BufferAttribute(dec(j.uv,Float32Array),2));g.setIndex(new T.BufferAttribute(dec(j.i,Uint16Array),1));
        return cache[key]=g;
      }catch(e){return null;}
    }
    function parseHDR(u8,clamp){
      let p=0;const line=()=>{let s='';while(u8[p]!==10)s+=String.fromCharCode(u8[p++]);p++;return s;};
      while(line()!==''){}const dim=line().split(' '),h=+dim[1],w=+dim[3],out=new Float32Array(w*h*4),sc=new Uint8Array(w*4);
      for(let y=0;y<h;y++){
        if(u8[p]!==2||u8[p+1]!==2||(u8[p+2]&128)){for(let x=0;x<w*4;x++)sc[x]=u8[p++];}
        else{p+=4;for(let c=0;c<4;c++){let x=0;while(x<w){let n=u8[p++];if(n>128){n-=128;const v=u8[p++];while(n--)sc[(x++)*4+c]=v;}else{while(n--)sc[(x++)*4+c]=u8[p++];}}}}
        const row=h-1-y;
        for(let x=0;x<w;x++){const e=sc[x*4+3],f=e?Math.pow(2,e-136):0,i=(row*w+x)*4;out[i]=Math.min(sc[x*4]*f,clamp);out[i+1]=Math.min(sc[x*4+1]*f,clamp);out[i+2]=Math.min(sc[x*4+2]*f,clamp);out[i+3]=1;}
      }
      return{data:out,width:w,height:h};
    }
    function environment(renderer,scene,intensity=.6){
      const src=A['sky-dry-field'];if(!src)return false;
      try{
        const bin=atob(src.slice(src.indexOf(',')+1)),u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);
        const hdr=parseHDR(u8,4),tex=new T.DataTexture(hdr.data,hdr.width,hdr.height,T.RGBAFormat,T.FloatType);
        tex.mapping=T.EquirectangularReflectionMapping;tex.minFilter=tex.magFilter=T.LinearFilter;tex.colorSpace=T.LinearSRGBColorSpace;tex.needsUpdate=true;
        const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(tex).texture;scene.environmentIntensity=intensity;pmrem.dispose();tex.dispose();
        envReady=true;return true;
      }catch(e){return false;}
    }
    return{has,apply,mesh,environment,onLoad:f=>{onLoad=f;},stats:()=>({maps:Object.keys(A).length,materialsTextured:applied,materialsReady:loaded,hdri:envReady})};
  })();
  function mesh(geometry,material,parent=scene){const m=new T.Mesh(geometry,material);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function box(w,h,d,x,y,z,color,parent=scene){const m=mesh(new T.BoxGeometry(w,h,d),mat(color),parent);m.position.set(x,y,z);return m;}
  function tube(points,radius,material,parent,segments=18){const c=new T.CatmullRomCurve3(points);return mesh(new T.TubeGeometry(c,segments,radius,6,false),material,parent);}
  function line(a,b,r,material,parent){const d=new T.Vector3().subVectors(b,a),m=mesh(new T.CylinderGeometry(r*.78,r,d.length(),5),material,parent);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());return m;}
  function leaf(origin,angle,length,width,droop,material,parent){
    // Textured blade: V-folded around the midrib, rippled edges and a slight twist. u runs across the blade, v base to tip.
    const points=[],uvs=[],indices=[],N=20,W=4,R=W+1,ca=Math.cos(angle),sa=Math.sin(angle);
    for(let j=0;j<=N;j++){
      const t=j/N,blade=Math.sin(Math.pow(t,.78)*Math.PI)*width*(1-t*.52),rad=length*t*.82,y=length*(Math.sin(t*Math.PI*.71)*.48-t*t*droop),curve=Math.sin(t*2.2)*.11,twist=Math.sin(t*Math.PI*1.3)*(1-t*.3);
      for(let k=0;k<=W;k++){
        const s=-1+2*k/W,across=blade*s,lift=blade*(.16-Math.abs(s)*.30*(1-t*.5))+Math.sin(t*38+s*2.3)*.0016*Math.abs(s)+twist*s*blade*.22;
        points.push(origin.x+ca*rad-sa*across,origin.y+y+lift,origin.z+sa*rad+ca*across+curve);uvs.push((s+1)/2,t);
      }
    }
    for(let j=0;j<N;j++)for(let k=0;k<W;k++){const a=j*R+k,b=a+R;indices.push(a,b,a+1,b,b+1,a+1);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();mesh(g,material,parent);
  }
  function grain(position,rotation,size,material,parent,geometry){const m=mesh(geometry,material,parent);m.position.copy(position);m.scale.set(size*.41,size*1.06,size*.33);m.rotation.set(rotation,.12,.38);return m;}
  function instanceRepeats(group){group.updateMatrixWorld(true);const buckets=new Map(),inverse=group.matrixWorld.clone().invert();group.traverse(o=>{if(!o.isMesh||o.isInstancedMesh)return;const key=o.geometry.uuid+':'+o.material.uuid;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(o);});for(const bucket of buckets.values()){if(bucket.length<3)continue;const merged=new T.InstancedMesh(bucket[0].geometry,bucket[0].material,bucket.length);bucket.forEach((o,i)=>{merged.setMatrixAt(i,new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));o.parent.remove(o);});merged.castShadow=true;merged.receiveShadow=true;group.add(merged);}}
  function mergeStatic(group){
    group.updateMatrixWorld(true);const buckets=new Map(),inverse=group.matrixWorld.clone().invert();group.traverse(o=>{if(!o.isMesh||o.isInstancedMesh)return;const key=o.material.uuid;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(o);});
    for(const meshes of buckets.values()){if(meshes.length<2)continue;const positions=[],normals=[],uvList=[];for(const m of meshes){const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry,matrix=new T.Matrix4().multiplyMatrices(inverse,m.matrixWorld),normalMatrix=new T.Matrix3().getNormalMatrix(matrix),p=g.getAttribute('position'),n=g.getAttribute('normal'),uvA=g.getAttribute('uv');for(let i=0;i<p.count;i++){uvList.push(uvA?uvA.getX(i):0,uvA?uvA.getY(i):0);const v=V(p.getX(i),p.getY(i),p.getZ(i)).applyMatrix4(matrix),normal=V(n.getX(i),n.getY(i),n.getZ(i)).applyNormalMatrix(normalMatrix);positions.push(v.x,v.y,v.z);normals.push(normal.x,normal.y,normal.z);}if(g!==m.geometry)g.dispose();m.geometry.dispose();m.parent.remove(m);}const merged=new T.BufferGeometry();merged.setAttribute('position',new T.Float32BufferAttribute(positions,3));merged.setAttribute('normal',new T.Float32BufferAttribute(normals,3));merged.setAttribute('uv',new T.Float32BufferAttribute(uvList,2));mesh(merged,meshes[0].material,group);}
  }
  function disposeGroup(group){if(!group)return;group.traverse(o=>{if(o.isMesh||o.isLine){o.geometry.dispose();if(o.material!==stemMat&&o.material!==rootMat&&o.material!==metal)o.material.dispose();}});group.removeFromParent();}
  function buildPlant(id,index){if(world&&heroWorld){world.remove(heroWorld);heroWorld=null;}heroPlants.forEach(o=>scene.remove(o));heroPlants=[];disposeGroup(plant);disposeGroup(roots);plant=new T.Group();roots=new T.Group();scene.add(plant);underground.add(roots);plant.position.set(0,.035,.03);roots.position.x=.4;
    const rice=id==='rice',gold=index>=8,color=gold?'#bba252':rice?'#5f823f':'#758940',leafMaterial=mat(color,{side:T.DoubleSide,roughness:.74}),grainMaterial=mat(gold?'#d4b05f':index===7?'#a8a668':'#9ca662',{roughness:.68}),stemMaterial=mat(gold?'#ab924b':'#688044',{roughness:.75}),seedMat=mat(rice?'#b49d64':'#bca66e'),grainGeo=Look.mesh(rice?'mesh-rice-spikelet':'mesh-wheat-spikelet')||new T.SphereGeometry(1,8,6),flowerGeo=new T.SphereGeometry(.0085,5,4),flowerMat=mat('#eae3b5'),nodeGeo=new T.SphereGeometry(.014,6,5),N=index<2?1:index===2?3:index===3?8:7;
    Look.apply(leafMaterial,rice?'tex-leaf-rice':'tex-leaf-wheat',{normal:.8,ao:.6});Look.apply(grainMaterial,'tex-husk',{normal:.6,ao:.5});
    const reproductiveMaterial=mat(gold?'#af975a':'#749051',{transparent:true,opacity:0,depthWrite:false});
    const height=[.32,.72,1.08,1.52,2.07,2.45,2.82,2.85,2.82,2.8][index],r=Sim.random(2612+(rice?0:100));
    if(index===0){const seed=grain(V(0,.045,0),.85,rice?.13:.115,seedMat,plant,grainGeo);seed.scale.z*=1.5;tube([V(0,.02,0),V(-.06,.13,.01),V(-.03,.32,0)],.008,stemMaterial,plant);leaf(V(-.03,.25,0),.3,.16,.019,.05,leafMaterial,plant);}
    if(index>0)for(let n=0;n<N;n++){
      const angle=n*2.399,spread=index<3?.035:.125,base=V(Math.cos(angle)*spread,0,Math.sin(angle)*spread),bend=.15+(n%3)*.082,ht=height*(1-(n%3)*.088),tip=V(base.x+Math.cos(angle)*bend,ht,base.z+Math.sin(angle)*bend),mid=V(base.x+Math.cos(angle)*bend*.52,ht*.54,base.z+Math.sin(angle)*bend*.52);
      if(index===9){line(base,V(base.x,.16,base.z),.012,stemMaterial,plant);continue;}
      tube([base,mid,tip],.0095,stemMaterial,plant,18);
      for(let j=1;j<=3;j++){const f=j*.24,node=mesh(nodeGeo,stemMaterial,plant);node.position.copy(base).lerp(tip,f);node.scale.set(1.1,.75,1.1);}
      const leaves=index<3?3:6;
      for(let l=0;l<leaves;l++){const f=.14+l*(index<3?.22:.135),origin=V(base.x+(tip.x-base.x)*f,ht*f,base.z+(tip.z-base.z)*f);leaf(origin,angle+l*2.65,Math.min(.92,ht*.57)*(1-l*.075),rice?.038:.049,index<4?.14:.34+(l===leaves-1?-.08:.04),leafMaterial,plant);}
      if(index===4||index===5){const sheath=mesh(new T.SphereGeometry(1,8,7),mat(index===4?'#92a566':'#a0ac69'),plant);sheath.position.copy(tip).add(V(0,-.18,0));sheath.scale.set(.027,.15,.032);}
      if(index>=6&&index<9){
        if(rice){const panicle=V(tip.x+.17,tip.y+.24,tip.z+.025),end=V(tip.x+.34,tip.y+(gold?-.14:.06),tip.z+.07);tube([tip,panicle,end],.0042,reproductiveMaterial,plant,16);
          for(let j=0;j<10;j++){const t=j/10,origin=tip.clone().lerp(panicle,Math.min(1,t*1.38));origin.y-=t*t*.20;for(let side=-1;side<=1;side+=2){const branchEnd=origin.clone().add(V(side*(.062+.092*t),-.032-t*.125,(r()-.5)*.12));tube([origin,origin.clone().lerp(branchEnd,.5).add(V(0,.02,0)),branchEnd],.002,reproductiveMaterial,plant,5);for(let g=0;g<4;g++){const point=origin.clone().lerp(branchEnd,(g+1)/4);point.y-=.011*g;grain(point,.32+(g%2)*.38,index===7||gold?.029:.020,grainMaterial,plant,grainGeo);if(index===6&&g===2){const anther=mesh(flowerGeo,flowerMat,plant);anther.position.copy(point).add(V(.01,-.023,0));}}}
          }
        }else{line(tip,tip.clone().add(V(0,.41,0)),.0045,reproductiveMaterial,plant);for(let j=0;j<11;j++){const yy=j*.032;for(let side=-1;side<=1;side+=2){const pos=tip.clone().add(V(side*.034,yy,.006*(j%2)));const g=grain(pos,0,index===7?.048:.039,grainMaterial,plant,grainGeo);g.rotation.z=side*-.48;line(pos.clone().add(V(0,.032,0)),pos.clone().add(V(side*.068,.165,.028)),.0013,reproductiveMaterial,plant);line(pos.clone().add(V(side*.01,.028,.008)),pos.clone().add(V(side*.048,.135,-.018)),.001,reproductiveMaterial,plant);if(index===6&&j%3===0){const a=mesh(flowerGeo,flowerMat,plant);a.position.copy(pos).add(V(side*.035,-.015,.015));}}}}
      }
    }
    if(index===9){const sheaf=new T.Group();plant.add(sheaf);sheaf.rotation.z=-.55;sheaf.position.set(.14,.02,0);for(let j=0;j<8;j++){const x=(j-4)*.025;line(V(x,0,0),V(x,.98,(j%2)*.04),.009,stemMaterial,sheaf);grain(V(x,.99,(j%2)*.04),0,rice?.11:.14,grainMaterial,sheaf,grainGeo);}const tie=mesh(new T.TorusGeometry(.13,.012,4,12),mat('#8c7757'),sheaf);tie.rotation.x=Math.PI/2;tie.position.y=.35;}
    const length=[.16,.31,.48,.62,.77,.9,1.0,1.05,1.12,1.1][index],count=index===0?4:10+index*3;
    for(let j=0;j<count;j++){const spread=(r()-.5)*length*.98,origin=V(-.4,-.028,1.132),mid=V(-.4+spread*.38,-length*.34,1.136),end=V(-.4+spread,-length*(.62+r()*.38),1.14);tube([origin,mid,end],j%3===0?.0092:.0042,rootMat,roots,10);for(let k=0;k<3;k++){const t=.22+k*.24,from=origin.clone().lerp(end,t);tube([from,from.clone().add(V(spread*.22+(k%2?.038:-.038),-.048,0)),from.clone().add(V(spread*.36+(k%2?.075:-.075),-.105,0))],.0021,rootMat,roots,5);}}
    instanceRepeats(plant);mergeStatic(plant);mergeStatic(roots);grainMaterialRef=grainMaterial;reproductiveMaterialRef=reproductiveMaterial;currentStage=id;configureGrowth();for(let i=0;i<4;i++){const copy=plant.clone(true);scene.add(copy);heroPlants.push(copy);}if(world){heroWorld=plant.clone(true);world.add(heroWorld);}
  }
  const uniforms={time:{value:0},height:{value:1},spread:{value:1},root:{value:1},wind:{value:1},cut:{value:4}};
  let soilSurface,soilBumpTexture,waterSurface=-1.84,waterGoal=-1.84,surfaceHeight=0,pumpStrength=0,rainStrength=0,rechargeStrength=0,infiltrationStrength=0,uptakeStrength=0,lastDay=-1,renderedFrames=0,geometryBuilds=0,waterDirection=0,lastPosition=null,lastMotion=false,failed=false;
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
        ${root?'mvPosition.x=-.4+(mvPosition.x+.4)*uRoot;mvPosition.y*=uRoot;':'mvPosition.x*=uSpread;mvPosition.y*=uGrowth;float stemY=max(0.0,mvPosition.y);float gust=sin(uTime*1.25+mvPosition.y*1.4+mvPosition.x*3.6)*.018*stemY*stemY+sin(uTime*2.45+mvPosition.z*6.5+mvPosition.x*2.1)*.009*stemY;mvPosition.x+=uWind*gust;mvPosition.y-=uWind*abs(gust)*.06*stemY;'}
        mvPosition=modelViewMatrix*mvPosition;gl_Position=projectionMatrix*mvPosition;`);
      if(!root){
        shader.fragmentShader='uniform float uCut;varying float vPlantY;\n'+shader.fragmentShader;
        shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(vPlantY>uCut)discard;');
        shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>',`
          float canopyAO=mix(0.72,1.08,smoothstep(0.0,1.6,vPlantY));
          float vein=1.0+sin(vPlantY*95.0)*0.035;
          vec3 sss=vec3(0.09,0.11,0.02)*smoothstep(0.25,2.2,vPlantY);
          gl_FragColor.rgb=gl_FragColor.rgb*canopyAO*vein+sss;
          #include <dithering_fragment>`);
      }
    };material.customProgramCacheKey=()=>root?'continuous-root-v3':'continuous-plant-v3';material.needsUpdate=true;}
    plantMaterials.forEach(m=>deform(m,false));deform(rootMat,true);grainMaterialRef.transparent=true;grainMaterialRef.opacity=0;grainMaterialRef.depthWrite=false;
  }
  function plane(width,height,x,y,z,color,parent=scene,opacity=1){const m=mesh(new T.PlaneGeometry(width,height),new T.MeshBasicMaterial({color,transparent:opacity<1,opacity,depthWrite:opacity===1}),parent);m.position.set(x,y,z);return m;}
  function dotGroup(count,radius,color){const group=new T.Group(),geometry=new T.SphereGeometry(radius,6,5),material=new T.MeshBasicMaterial({color,transparent:true,opacity:.82}),batch=new T.InstancedMesh(geometry,material,count);group.userData.dots=[];for(let j=0;j<count;j++){const dot=new T.Object3D();dot.userData.phase=j/count;dot.material=material;group.userData.dots.push(dot);}group.add(batch);group.userData.batch=batch;scene.add(group);return group;}
  function buildEnvMap(){
    try{
      const envCanvas=document.createElement('canvas');envCanvas.width=256;envCanvas.height=128;
      const ectx=envCanvas.getContext('2d'),grad=ectx.createLinearGradient(0,0,0,128);
      grad.addColorStop(0,'#d8e8ec');grad.addColorStop(.48,'#fff6e3');grad.addColorStop(.52,'#8d7552');grad.addColorStop(1,'#3e2f1e');
      ectx.fillStyle=grad;ectx.fillRect(0,0,256,128);
      ectx.fillStyle='rgba(255,250,224,0.85)';ectx.beginPath();ectx.arc(72,34,16,0,Math.PI*2);ectx.fill();
      const envTex=new T.CanvasTexture(envCanvas);envTex.mapping=T.EquirectangularReflectionMapping;envTex.colorSpace=T.SRGBColorSpace;
      const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(envTex).texture;scene.environmentIntensity=.55;
      pmrem.dispose();envTex.dispose();
    }catch(e){}
  }
  function initialize(){
    host=document.getElementById('scene-art');try{renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch(e){failed=true;host.innerHTML='<p class="webgl-fallback"><strong>The story is still here.</strong>This device cannot draw the field. Follow the chapter descriptions, water totals and harvest bowl using the controls below.</p>';return false;}
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor(0xf3f0e5,1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;host.appendChild(renderer.domElement);
    scene=new T.Scene();underground=new T.Group();scene.add(underground);camera=new T.OrthographicCamera(-4,4,4,-4,.1,40);camera.position.set(0,.05,12);camera.lookAt(0,.05,0);
    if(!Look.environment(renderer,scene))buildEnvMap();
    Look.onLoad(()=>{lastPosition=null;});
    hemiLight=new T.HemisphereLight(0xfff9e8,0x8b8264,2.05);scene.add(hemiLight);
    sunLight=new T.DirectionalLight(0xfff3d6,2.2);sunLight.position.set(-3,7.2,8);sunLight.castShadow=true;sunLight.shadow.mapSize.set(2048,2048);Object.assign(sunLight.shadow.camera,{left:-4.6,right:4.6,top:4.6,bottom:-3,near:.5,far:30});sunLight.shadow.bias=-.0006;sunLight.shadow.normalBias=.02;sunLight.shadow.radius=3;scene.add(sunLight);
    // Atmospheric sky backdrop with volumetric god-rays, distant Punjab windbreak trees, and seasonal mist.
    skyUniforms={
      uZenith:{value:new T.Color('#dfe7e4')},
      uHorizon:{value:new T.Color('#f4efe1')},
      uSunColor:{value:new T.Color('#fff5d6')},
      uTreeColor:{value:new T.Color('#b8c5b6')},
      uSunPos:{value:new T.Vector2(.24,.68)},
      uSunStrength:{value:.42},
      uMist:{value:0},
      uTime:{value:0}
    };
    const skyMat=new T.ShaderMaterial({
      uniforms:skyUniforms,
      depthWrite:false,
      vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader:`uniform vec3 uZenith,uHorizon,uSunColor,uTreeColor;uniform vec2 uSunPos;uniform float uSunStrength,uMist,uTime;varying vec2 vUv;
        void main(){
          float h=clamp(vUv.y,0.0,1.0);
          vec3 sky=mix(uHorizon,uZenith,pow(h,0.70));
          vec2 delta=vUv-uSunPos;
          float d=length(delta);
          float angle=atan(delta.y,delta.x);
          float rays=(0.5+0.5*sin(angle*14.0+uTime*0.15)*cos(angle*9.0-uTime*0.1))*exp(-d*2.6)*(1.0-smoothstep(0.0,0.85,d));
          float core=exp(-d*d*54.0)*0.58+exp(-d*3.6)*0.34+rays*0.18;
          sky=mix(sky,uSunColor,clamp(core*uSunStrength,0.0,0.72));
          float treeWave=0.032+0.018*sin(vUv.x*42.0)+0.011*sin(vUv.x*115.0+1.4)+0.007*cos(vUv.x*230.0);
          float treeMask=smoothstep(treeWave+0.008,treeWave-0.004,h)*smoothstep(0.0,0.015,h);
          sky=mix(sky,mix(uTreeColor,uHorizon,0.52+uMist*0.35),treeMask*0.42);
          float mistBand=smoothstep(0.38,0.0,h)*uMist;
          sky=mix(sky,mix(uHorizon,vec3(0.95,0.96,0.94),0.5),mistBand*0.56);
          gl_FragColor=vec4(sky,1.0);
        }`
    });
    skyMesh=new T.Mesh(new T.PlaneGeometry(1,1),skyMat);skyMesh.position.set(0,2,-3.4);skyMesh.userData.noThemeDim=true;scene.add(skyMesh);
    mistMesh=plane(100,.68,0,.30,.85,'#eef2ec',scene,0);mistMesh.userData.noThemeDim=true;
    // High-definition 512x512 procedural alluvial soil albedo + bump textures: offline, deterministic and rich.
    const textureCanvas=document.createElement('canvas'),bumpCanvas=document.createElement('canvas');
    textureCanvas.width=textureCanvas.height=bumpCanvas.width=bumpCanvas.height=512;
    const ctx=textureCanvas.getContext('2d'),bctx=bumpCanvas.getContext('2d'),texRandom=Sim.random(805);
    ctx.fillStyle='#dfd0b2';ctx.fillRect(0,0,512,512);
    bctx.fillStyle='#808080';bctx.fillRect(0,0,512,512);
    for(let i=0;i<18000;i++){
      const x=texRandom()*512,y=texRandom()*512,w=1+texRandom()*3.5,h=1+texRandom()*2.2,a=.035+texRandom()*.135,darkGrain=texRandom()>.48;
      ctx.fillStyle=darkGrain?'rgba(62,43,22,'+a+')':'rgba(255,249,226,'+a+')';ctx.fillRect(x,y,w,h);
      bctx.fillStyle=darkGrain?'rgba(35,35,35,'+(a*1.4)+')':'rgba(225,225,225,'+(a*1.4)+')';bctx.fillRect(x,y,w,h);
    }
    for(let i=0;i<1500;i++){
      const x=texRandom()*512,y=texRandom()*512,rad=.8+texRandom()*2.6,a=.05+texRandom()*.13;
      ctx.fillStyle=texRandom()>.35?'rgba(95,70,42,'+a+')':'rgba(218,202,168,'+a+')';ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.fill();
      bctx.fillStyle='rgba(240,240,240,'+(a*1.5)+')';bctx.beginPath();bctx.arc(x,y,rad,0,Math.PI*2);bctx.fill();
    }
    soilTexture=new T.CanvasTexture(textureCanvas);soilTexture.wrapS=soilTexture.wrapT=T.RepeatWrapping;soilTexture.repeat.set(22,3);soilTexture.colorSpace=T.SRGBColorSpace;
    soilBumpTexture=new T.CanvasTexture(bumpCanvas);soilBumpTexture.wrapS=soilBumpTexture.wrapT=T.RepeatWrapping;soilBumpTexture.repeat.set(22,3);
    function stratum(top,bottom,color,offset,rough=.86,texId){const points=[],uvs=[];for(let j=0;j<400;j++){const a=-30+j*.15,b=a+.15,w=x=>Math.sin(x*2.1+offset)*.055+Math.sin(x*5.7+offset)*.022+Math.cos(x*11.3+offset)*.008;points.push(a,top+w(a),-2,b,top+w(b),-2,a,bottom+w(a)*.8,-2,b,top+w(b),-2,b,bottom+w(b)*.8,-2,a,bottom+w(a)*.8,-2);uvs.push(j/400,0,(j+1)/400,0,j/400,1,(j+1)/400,0,(j+1)/400,1,j/400,1);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.computeVertexNormals();const m=mesh(g,new T.MeshStandardMaterial({color,map:soilTexture,bumpMap:soilBumpTexture,bumpScale:.032,roughness:rough,metalness:.03,side:T.DoubleSide}),underground);m.receiveShadow=false;if(texId)Look.apply(m.material,texId,{rx:60/1.6,ry:Math.max(.12,(top-bottom)/1.6),normal:1.1});m.userData.soil=true;m.userData.originalColor=m.material.color.clone();return m;}
    plane(100,16,0,-8,-2.1,'#a88354',underground);const textured=Look.has('tex-mud-wet');soilSurface=stratum(0,-.42,textured?'#f2e6d8':'#6b482b',0,.78,textured&&'tex-mud-wet');stratum(-.42,-1.12,textured?'#e6d6c0':'#8f6a3e',1,.84,textured&&'tex-soil-dry');stratum(-1.12,-1.9,textured?'#d8c7a8':'#ac8554',2,.88,textured&&'tex-kankar');stratum(-1.9,-7,textured?'#ffffff':'#aa9062',3,.9,textured&&'tex-sand-wet');
    moisture=plane(100,.95,0,-.475,-1.5,'#3d5d48',underground,.08);
    capillaryFringe=plane(100,.26,0,waterSurface+.12,-1.25,'#588683',underground,.24);
    // Tint the saturated sediment with subtle animated water caustics and depth gradient.
    water=plane(100,12,0,waterSurface-6,-1.1,'#4f888e',underground,.76);
    water.material.onBeforeCompile=shader=>{
      shader.uniforms.uTime=uniforms.time;
      shader.vertexShader='varying vec2 vWaterUv;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvWaterUv=uv;');
      shader.fragmentShader='uniform float uTime;varying vec2 vWaterUv;\n'+shader.fragmentShader.replace('#include <dithering_fragment>',`
        float caustic=sin(vWaterUv.x*160.0+uTime*1.4)*cos(vWaterUv.y*28.0-uTime*0.9)*0.5+0.5;
        float topGlow=smoothstep(0.82,1.0,vWaterUv.y);
        gl_FragColor.rgb=mix(gl_FragColor.rgb*0.78,gl_FragColor.rgb*1.16,smoothstep(0.0,1.0,vWaterUv.y))+vec3(0.05,0.11,0.12)*(caustic*topGlow);
        #include <dithering_fragment>`);
    };
    pond=plane(100,1,0,.03,.5,'#8fc5c0',scene,.60);pond.visible=false;
    pond.material.onBeforeCompile=shader=>{
      shader.uniforms.uTime=uniforms.time;
      shader.vertexShader='varying vec2 vPondUv;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvPondUv=uv;');
      shader.fragmentShader='uniform float uTime;varying vec2 vPondUv;\n'+shader.fragmentShader.replace('#include <dithering_fragment>',`
        float shimmer=sin(vPondUv.x*210.0+uTime*2.1)*sin(vPondUv.y*18.0-uTime*1.3)*0.05;
        gl_FragColor.rgb+=vec3(0.08,0.11,0.10)*shimmer+vec3(0.09,0.12,0.11)*smoothstep(0.65,1.0,vPondUv.y);
        #include <dithering_fragment>`);
    };
    waterLine=new T.Line(new T.BufferGeometry(),new T.LineBasicMaterial({color:'#b4e6e4',transparent:true,opacity:.9}));poolLine=new T.Line(new T.BufferGeometry(),new T.LineBasicMaterial({color:'#cef0ec',transparent:true,opacity:.94}));underground.add(waterLine);scene.add(poolLine);
    const dirt=new T.Group();underground.add(dirt);const geo=new T.SphereGeometry(1,6,5),dirtMat=mat('#766040',{roughness:.9}),pebbleMat=mat('#9b8665',{roughness:.72});for(let j=0;j<640;j++){const m=mesh(geo,j%5===0?pebbleMat:dirtMat,dirt);m.position.set((rng()-.5)*22,-rng()*5,.2);m.scale.set(.006+rng()*.022,.005+rng()*.008,.003);}instanceRepeats(dirt);
    pumpGroup=new T.Group();scene.add(pumpGroup);boreGroup=new T.Group();underground.add(boreGroup);
    // A ground-mounted motor and centrifugal pump, connected to the bore and outlet.
    const concrete=mat('#aaa58d'),paint=mat('#456854',{metalness:.28,roughness:.58}),darkMetal=mat('#324741',{metalness:.64,roughness:.38}),brass=mat('#9e8a58',{metalness:.68,roughness:.32});
    for(const b of [box(.68,.09,.40,1.27,.045,1.45,'#a8a38b',pumpGroup),box(.74,.035,.44,1.27,.012,1.45,'#8e8973',pumpGroup)])if(Look.apply(b.material,'tex-plaster',{rx:1,ry:.4}))b.material.color.set('#d4cfc0');
    Look.apply(paint,'tex-steel-blue',{albedo:false,rx:1.5,ry:1.5,normal:.6,ao:.5});
    const motor=mesh(new T.CylinderGeometry(.12,.12,.36,18),paint,pumpGroup);motor.rotation.z=Math.PI/2;motor.position.set(1.37,.23,1.52);
    const endCap=mesh(new T.SphereGeometry(.118,16,12),darkMetal,pumpGroup);endCap.scale.set(.35,1,1);endCap.position.set(1.55,.23,1.52);
    for(let j=0;j<8;j++){const fin=mesh(new T.TorusGeometry(.125,.009,5,18),darkMetal,pumpGroup);fin.rotation.y=Math.PI/2;fin.position.set(1.22+j*.037,.23,1.52);}
    box(.14,.07,.13,1.35,.39,1.52,'#586f5c',pumpGroup);
    const housing=mesh(new T.SphereGeometry(.138,18,12),paint,pumpGroup);housing.scale.set(.85,1,1);housing.position.set(1.09,.23,1.52);
    for(const x of [1.22,1.48])box(.07,.09,.22,x,.12,1.52,'#344943',pumpGroup);
    pipeCurve=new T.CatmullRomCurve3([V(1.37,-2.9,1.4),V(1.37,0,1.4),V(1.34,.15,1.4),V(1.09,.23,1.4),V(1.08,.49,1.4),V(.90,.53,1.4),V(.80,.44,1.4),V(.80,.18,1.4)],false,'centripetal');
    const surfacePipe=new T.CatmullRomCurve3(pipeCurve.points.slice(1),false,'centripetal');mesh(new T.TubeGeometry(surfacePipe,45,.048,12,false),metal,pumpGroup);line(V(1.37,-2.9,1.4),V(1.37,0,1.4),.048,metal,boreGroup);
    for(const y of [-2.6,-1.5,-.2]){const collar=mesh(new T.CylinderGeometry(.068,.068,.08,12),metal,boreGroup);collar.position.set(1.37,y,1.4);}
    for(let j=0;j<6;j++){const slot=mesh(new T.CylinderGeometry(.054,.054,.045,10),brass,boreGroup);slot.position.set(1.37,-2.82+j*.09,1.4);}
    const outletCollar=mesh(new T.CylinderGeometry(.068,.068,.08,12),metal,pumpGroup);outletCollar.position.set(.80,.20,1.4);
    box(.32,.026,.16,.72,.024,1.5,'#8a8d78',pumpGroup);
    outletCurve=new T.QuadraticBezierCurve3(V(.80,.18,1.8),V(.69,.13,1.8),V(.56,.02,1.8));
    outletStream=mesh(new T.TubeGeometry(outletCurve,20,.024,8,false),new T.MeshBasicMaterial({color:'#a8e2e4',transparent:true,opacity:0}),pumpGroup);
    dischargeGroup=dotGroup(22,.017,'#9fe0e2');particles=dotGroup(26,.019,'#94d3d9');
    splashGroup=dotGroup(10,.022,'#c7eded');
    rainGroup=new T.Group();scene.add(rainGroup);const rainMat=new T.LineBasicMaterial({color:'#7aa3b0',transparent:true,opacity:.68});for(let j=0;j<78;j++){const drop=new T.Line(new T.BufferGeometry().setFromPoints([V(0,0,0),V(-.032,-.155,0)]),rainMat);drop.userData.phase=j/78;drop.userData.x=(rng()-.5)*8.4;rainGroup.add(drop);}
    cloudGroup=new T.Group();scene.add(cloudGroup);const cloudMat=new T.MeshBasicMaterial({color:'#d9e3e0',transparent:true,opacity:.72,depthWrite:false});for(let c=0;c<3;c++){const cloud=new T.Group();cloud.position.set(-1.4+c*1.05,2.85+(c%2)*.25,2.2);cloud.userData.baseX=cloud.position.x;for(let j=0;j<6;j++){const puff=mesh(new T.SphereGeometry(1,12,8),cloudMat,cloud);puff.position.set((j-2.5)*.145,Math.sin(j*1.7)*.075,0);puff.scale.set(.27,.125+(j%2)*.07,.025);}cloudGroup.add(cloud);}
    infiltrationGroup=dotGroup(24,.011,'#b3ded4');uptakeGroup=dotGroup(14,.012,'#b9e4d5');rechargeGroup=dotGroup(20,.013,'#a8dcd3');fertilizerGroup=dotGroup(14,.011,'#e0dbb2');seedMesh=mesh(new T.SphereGeometry(1,7,5),mat('#b6a46b'));seedMesh.position.set(0,.025,1.2);seedMesh.scale.set(.045,.018,.025);
    strawGroup=dotGroup(76,.035,'#b9a167');fireGroup=dotGroup(44,.085,'#ff9e32');smokeGroup=dotGroup(24,.09,'#77776b');smokeGroup.userData.batch.geometry.dispose();smokeGroup.userData.batch.geometry=new T.SphereGeometry(.09,12,8);
    buildWorld();resize();window.addEventListener('resize',resize);new ResizeObserver(resize).observe(host);return true;
  }

  // Small reusable botanical clumps keep a full field economical on phones.
  function buildField(id){
    if(fieldGroup){fieldGroup.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});scene.remove(fieldGroup);}
    fieldGroup=new T.Group();scene.add(fieldGroup);fieldBatches=[];fieldCrop=id;
    const blades=[],ears=[],rice=id==='rice',random=Sim.random(rice?126:826);
    const bladeUV=[],tri=(list,a,b,c,ua,ub,uc)=>{list.push(...a,...b,...c);if(list===blades)bladeUV.push(...(ua||[.03,.5]),...(ub||[.03,.5]),...(uc||[.03,.5]));};
    // Six curved stems, tapered cambered leaf ribbons and crop-specific reproductive shapes.
    for(let stem=0;stem<6;stem++){
      const base=(stem-2.5)*.048,h=1.64+random()*.34,bend=(random()-.5)*.22;
      for(let j=0;j<9;j++){const a=j/9,b=(j+1)/9,x=t=>base+bend*t*t;tri(blades,[x(a)-.008,a*h,0],[x(a)+.008,a*h,0],[x(b)+.008,b*h,0]);tri(blades,[x(a)-.008,a*h,0],[x(b)+.008,b*h,0],[x(b)-.008,b*h,0]);}
      for(let leaf=0;leaf<5;leaf++){const y=.15+leaf*.265,side=(leaf+stem)%2?1:-1,length=.39+random()*.17;for(let j=0;j<10;j++){const a=j/10,b=(j+1)/10,point=(t,s)=>[base+side*length*t,y+Math.sin(t*Math.PI*.84)*.285-t*t*.135+s*Math.sin(Math.PI*t)*(rice?.023:.032),.012+Math.sin(t*Math.PI)*.026];tri(blades,point(a,-1),point(b,-1),point(a,1),[0,a],[0,b],[1,a]);tri(blades,point(a,1),point(b,-1),point(b,1),[1,a],[0,b],[1,b]);}}
      const tip=base+bend;
      if(rice){for(let branch=0;branch<7;branch++){const t=branch/7,xx=tip+t*.215,yy=h+.145*Math.sin(t*Math.PI)-t*.105;tri(ears,[tip,h,0],[xx-.004,yy,.01],[xx+.006,yy,.01]);for(let side of [-1,1])for(let grain=0;grain<3;grain++){const x=xx+side*(.025+grain*.025),y=yy-grain*.022-t*.04;tri(ears,[xx,yy,0],[x,y-.026,.025],[x+.012,y+.01,.025]);tri(ears,[x-.01,y-.012,.025],[x+.017,y-.02,.025],[x+.013,y+.026,.025]);}}}
      else{for(let grain=0;grain<10;grain++)for(let side of [-1,1]){const yy=h+grain*.027,xx=tip+side*.027;tri(ears,[tip,yy,0],[xx+side*.021,yy+.041,.025],[xx,yy+.054,.025]);tri(ears,[xx,yy+.025,.015],[xx+side*.066,yy+.18,.015],[xx+side*.004,yy+.025,.015]);}}
    }
    for(const [points,isGrain] of [[blades,false],[ears,true]]){
      const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(points,3));if(!isGrain)geo.setAttribute('uv',new T.Float32BufferAttribute(bladeUV,2));geo.computeVertexNormals();const material=new T.MeshStandardMaterial({color:isGrain?'#d2b76f':'#638143',side:T.DoubleSide,roughness:.76,transparent:true,opacity:1,depthWrite:!isGrain});if(!isGrain)Look.apply(material,rice?'tex-leaf-rice':'tex-leaf-wheat',{normal:.7,ao:.5});
      material.onBeforeCompile=shader=>{
        Object.assign(shader.uniforms,{fGrowth:fieldUniforms.growth,fGrain:fieldUniforms.grain,fCut:fieldUniforms.cut,fTime:fieldUniforms.time,fWind:fieldUniforms.wind,fSpread:fieldUniforms.spread});
        shader.vertexShader='uniform float fGrowth,fTime,fWind,fSpread; varying float fHeight;\n'+shader.vertexShader;
        shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','vec3 transformed=vec3(position);fHeight=position.y;transformed.y*=fGrowth;transformed.x*=fSpread;float phase=0.0;\n#ifdef USE_INSTANCING\nphase=instanceMatrix[3].x*2.2+instanceMatrix[3].y*6.8;\n#endif\nfloat sway=(sin(fTime*1.35+phase+position.y*1.7)*.022+sin(fTime*2.65+phase*1.6)*.008)*position.y*position.y*fWind;transformed.x+=sway;transformed.y-=abs(sway)*.07;');
        shader.fragmentShader='uniform float fCut,fGrain;varying float fHeight;\n'+shader.fragmentShader;
        shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(fHeight>fCut)discard;'+(isGrain?'if(fGrain<.01)discard;':''));
        shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>',`
          float ao=mix(0.68,1.10,smoothstep(0.0,1.5,fHeight));
          vec3 backlight=vec3(0.08,0.10,0.02)*smoothstep(0.3,1.8,fHeight);
          gl_FragColor.rgb=gl_FragColor.rgb*ao+backlight;
          #include <dithering_fragment>`);
      };
      material.customProgramCacheKey=()=>isGrain?'field-grain-v4':'field-leaf-v4';
      const batch=new T.InstancedMesh(geo,material,fieldCount);batch.frustumCulled=false;batch.userData.grain=isGrain;for(let j=0;j<fieldCount;j++){const tone=.86+random()*.20;batch.setColorAt(j,new T.Color(tone,tone,tone*.97));}fieldGroup.add(batch);fieldBatches.push(batch);
    }
    if(!fieldSurface){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([-.5,0,-.8,.5,0,-.8,-.42,.76,-.8,.5,0,-.8,.42,.76,-.8,-.42,.76,-.8],3));g.setAttribute('uv',new T.Float32BufferAttribute([0,0,1,0,0,1,1,0,1,1,0,1],2));g.computeVertexNormals();fieldSurface=new T.Mesh(g,new T.MeshStandardMaterial({color:'#95805a',map:soilTexture,bumpMap:soilBumpTexture,bumpScale:.025,roughness:.82,transparent:true,opacity:1,side:T.DoubleSide}));Look.apply(fieldSurface.material,'tex-soil-dry',{rx:9,ry:3,normal:1.2});scene.add(fieldSurface);fieldRoots=new T.LineSegments(new T.BufferGeometry(),new T.LineBasicMaterial({color:'#e0cda3',transparent:true,opacity:.68}));underground.add(fieldRoots);fieldLines=new T.LineSegments(new T.BufferGeometry(),new T.LineBasicMaterial({color:'#786542',transparent:true,opacity:.32}));scene.add(fieldLines);}
  }
  const fieldDummy=new T.Object3D();
  function updateField(v,{motion,time,dark}){
    if(fieldCrop!==v.id)buildField(v.id);
    const perspectiveDepth=v.fallow?.16:Math.min(1,v.growth.height/.7),visible=viewBlend>.02,width=(camera.right-camera.left)*.96;fieldGroup.visible=fieldSurface.visible=fieldLines.visible=fieldRoots.visible=visible;
    fieldUniforms.growth.value=v.growth.height;fieldUniforms.grain.value=Timeline.phase(v.das,v.def.stages[5].start_das,v.def.stages[7].start_das);fieldUniforms.cut.value=2.3-v.growth.harvest*2.17;fieldUniforms.time.value=time;fieldUniforms.wind.value=motion?0:1;fieldUniforms.spread.value=.18+v.growth.spread*.82;
    fieldSurface.scale.x=width;fieldSurface.scale.y=perspectiveDepth;fieldSurface.material.color.set(Look.has('tex-soil-dry')?(dark?'#a8957f':v.pondDepthMm>5?'#9a8f70':'#f0e0c8'):(dark?'#63523b':v.pondDepthMm>5?'#5f5538':'#785e3c'));fieldSurface.material.roughness=v.pondDepthMm>5?.35:.82;fieldSurface.material.opacity=viewBlend;
    const rootPoints=[],rootRandom=Sim.random(1926);
    for(let j=0;j<12;j++){const x=-width/2+(j+.5)*width/12;for(let k=0;k<5;k++){const spread=(rootRandom()-.5)*.36*v.growth.root,depth=(.3+rootRandom()*.8)*v.growth.root;let previous=V(x,-.02,1.35);for(let step=1;step<=6;step++){const f=step/6,next=V(x+spread*Math.sin(f*1.5)+Math.sin(j+k+f*9)*.012,-depth*f,1.35);rootPoints.push(previous.x,previous.y,previous.z,next.x,next.y,next.z);if(step>2){const tip=next.clone().add(V((k%2?1:-1)*.04,-.06,0));rootPoints.push(next.x,next.y,next.z,tip.x,tip.y,tip.z);}previous=next;}}}fieldRoots.geometry.setAttribute('position',new T.Float32BufferAttribute(rootPoints,3));fieldRoots.material.opacity=viewBlend*.72;
    const fTop=.58*perspectiveDepth,linePoints=[-width/2,0,-.75,width/2,0,-.75,-width/2,0,-.75,-width*.42,fTop,-.75,width/2,0,-.75,width*.42,fTop,-.75,-width*.42,fTop,-.75,width*.42,fTop,-.75];for(let j=0;j<13;j++){const x=-width/2+(j+.5)/13*width;linePoints.push(x,0,-.75,x*.84,fTop,-.75);}fieldLines.geometry.setAttribute('position',new T.Float32BufferAttribute(linePoints,3));fieldLines.material.opacity=viewBlend*.22;
    fieldBatches.forEach(batch=>{batch.material.opacity=viewBlend*(batch.userData.grain?fieldUniforms.grain.value:1);batch.material.color.set(batch.userData.grain?'#d1b36c':dark?'#93b860':new T.Color('#466c30').lerp(new T.Color('#b49b50'),v.growth.ripe));for(let j=0;j<fieldCount;j++){const row=Math.floor(j/12),column=j%12,back=(7-row)/7,variation=Math.sin(j*73.3);fieldDummy.position.set((-width/2+(column+.5)*width/12)*(1-back*.16)+variation*.018,back*.55*perspectiveDepth+.02,-.2+row*.035);fieldDummy.scale.set((.95-back*.16+variation*.045)*Math.min(1.3,width/5),1.14-back*.17+variation*.11,.8);fieldDummy.rotation.z=variation*.022;fieldDummy.updateMatrix();batch.setMatrixAt(j,fieldDummy.matrix);}batch.instanceMatrix.needsUpdate=true;});
  }

  function positionPump(){
    const screenX=host.clientWidth*.91;pumpAnchor=(screenX/host.clientWidth*2-1)*camera.right;pumpOffset=pumpAnchor-1.37*.85*pumpSceneScale;
    for(const group of [pumpGroup,boreGroup,particles,dischargeGroup,splashGroup]){group.position.x=pumpOffset;group.scale.x=.85*pumpSceneScale;group.scale.y=group===pumpGroup||group===dischargeGroup||group===splashGroup?pumpSceneScale:1;}
  }
  function fitCamera(top){
    camera.top=top;camera.bottom=-top*(1-groundFraction)/groundFraction;
    const width=(camera.top-camera.bottom)*host.clientWidth/host.clientHeight;camera.left=-width/2;camera.right=width/2;camera.updateProjectionMatrix();
    depthCompression=-camera.bottom/3.05;underground.scale.y=depthCompression;pumpSceneScale=Math.min(1,top/groundFraction/6.08);
    if(skyMesh){skyMesh.scale.set(width*1.08,top*1.06,1);skyMesh.position.set(0,top*.52,-3.4);}
  }
  function resize(){if(!renderer)return;lastPosition=null;const w=host.clientWidth,h=host.clientHeight;fitCamera(camera.top||3.95);renderer.setSize(w,h);positionPump();positionMarker();resizeWorld();if(persp&&worldActive())renderer.render(world,persp);else renderer.render(scene,camera);}
  function positionMarker(){if(!camera)return;const label=document.getElementById('groundwater-marker'),p=V(0,waterSurface*depthCompression,0).project(camera);if(label)label.style.top=((1-p.y)*host.clientHeight/2)+'px';}
  const ease=(value,target,dt,rate=4)=>value+(target-value)*(1-Math.exp(-dt*rate));
  const wavePoints=[];for(let i=0;i<64;i++)wavePoints.push(V(0,0,0));
  function wave(line,level,time,amplitude){const width=camera.right-camera.left;for(let i=0;i<wavePoints.length;i++){const x=-width/2+i/(wavePoints.length-1)*width;wavePoints[i].set(x,level+amplitude*(Math.sin(x*3.2+time*1.05)+Math.sin(x*5.4-time*.72)*.48),1.2);}line.geometry.setFromPoints(wavePoints);}
  const cZenith=new T.Color(),cHorizon=new T.Color(),cSun=new T.Color(),cTemp=new T.Color();
  function updateAtmosphere(v,dark,burning,clock){
    const s=v.solar||{seasonAngle:0,diurnal:.5,winterMist:0,monsoonHumidity:0};
    const sunX=.22+.52*(.15+.7*v.fraction),sunY=.52+.22*s.seasonAngle+.08*s.diurnal;
    skyUniforms.uSunPos.value.set(sunX,sunY);
    skyUniforms.uTime.value=clock;
    if(dark){
      cZenith.set('#0e1c18');cHorizon.set('#182e26');cSun.set('#8db5a4');
      skyUniforms.uTreeColor.value.set('#12251e');
      if(burning){cHorizon.lerp(cTemp.set('#3d2c20'),.45);cSun.set('#d98845');}
      skyUniforms.uSunStrength.value=.26;skyUniforms.uMist.value=s.winterMist*.35;
      sunLight.intensity=1.45;sunLight.color.set('#dcebe4');hemiLight.intensity=1.65;
    }else{
      const warmSeason=Math.max(0,s.seasonAngle),ripeWarmth=v.growth.ripe*.45;
      cZenith.set('#d5e3e6').lerp(cTemp.set('#dee5d5'),warmSeason*.45+ripeWarmth*.35);
      cHorizon.set('#f3f0e5').lerp(cTemp.set('#f6e6c8'),warmSeason*.35+ripeWarmth*.55);
      cSun.set('#fff7dc').lerp(cTemp.set('#ffe2a8'),ripeWarmth*.6);
      skyUniforms.uTreeColor.value.set('#b6c5b3').lerp(cTemp.set('#c9bf9d'),ripeWarmth*.7);
      if(rainStrength>.02){
        cZenith.lerp(cTemp.set('#adbcc2'),rainStrength*.72);
        cHorizon.lerp(cTemp.set('#cfd7d4'),rainStrength*.65);
      }
      if(burning){
        cZenith.lerp(cTemp.set('#c4b49b'),.55);
        cHorizon.lerp(cTemp.set('#dfb98b'),.65);
      }
      skyUniforms.uSunStrength.value=(.52+warmSeason*.16)*(1-rainStrength*.65);
      skyUniforms.uMist.value=s.winterMist;
      sunLight.intensity=2.22-rainStrength*.55-s.winterMist*.28;
      sunLight.color.set(burning?'#ffdfb0':ripeWarmth>.2?'#fff0cc':'#fff5dc');
      sunLight.position.set(-3.2+v.fraction*2.4,6.4+s.seasonAngle*1.4,8);
      hemiLight.intensity=2.05-rainStrength*.2;
    }
    skyUniforms.uZenith.value.copy(cZenith);
    skyUniforms.uHorizon.value.copy(cHorizon);
    skyUniforms.uSunColor.value.copy(cSun);
    mistMesh.visible=s.winterMist>.02&&!lastIntro;
    mistMesh.material.color.set(dark?'#263c35':'#edf1ea');
    mistMesh.material.opacity=s.winterMist*(dark?.14:.26);
  }
  // Optional runtime hook to hot-load custom PBR textures from Nano Banana or Blender MCP.
  function loadCustomTextures({soilUrl,bumpUrl}={}){
    if(!T.TextureLoader)return;
    const loader=new T.TextureLoader();
    if(soilUrl)loader.load(soilUrl,tex=>{tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(22,3);tex.colorSpace=T.SRGBColorSpace;underground.traverse(o=>{if(o.userData?.soil){o.material.map=tex;o.material.needsUpdate=true;}});lastPosition=null;});
    if(bumpUrl)loader.load(bumpUrl,tex=>{tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(22,3);underground.traverse(o=>{if(o.userData?.soil){o.material.bumpMap=tex;o.material.needsUpdate=true;}});lastPosition=null;});
  }
  // ---------- Perspective world: real 3D ground, rows of crop, sky and fog. Used by the Field and Plant views. ----------
  let clumpData=[],clumpMask='',world,persp,worldSun,worldHemi,worldGround,worldWater,worldCanopy,worldSky,worldTrees,worldStraw,worldFire,worldSmoke,worldRain,heroWorld,worldFog,worldClumps=[],worldCrop='',worldAnchor=V(0,2,0);
  const groundMats={},cam={pos:V(0,3.4,4.6),look:V(0,1.5,-5),fov:42,init:false},orbit={yaw:0,pitch:0,zoom:1,dragging:false,x:0,y:0,mode:''},worldFlags={dirty:true,family:'',fadeTimer:0};
  const heroZ=1.7,rowCols=14,rowRows=15,rowSpacingX=.62,rowSpacingZ=.5,clumpScale=1.45;
  function fieldMaterial(isGrain,rice){
    const material=new T.MeshStandardMaterial({color:isGrain?'#d2b76f':'#638143',side:T.DoubleSide,roughness:.72,transparent:false});
    if(!isGrain)Look.apply(material,rice?'tex-leaf-rice':'tex-leaf-wheat',{normal:.7,ao:.5});
    material.onBeforeCompile=shader=>{
      Object.assign(shader.uniforms,{fGrowth:fieldUniforms.growth,fGrain:fieldUniforms.grain,fCut:fieldUniforms.cut,fTime:fieldUniforms.time,fWind:fieldUniforms.wind,fSpread:fieldUniforms.spread});
      shader.vertexShader='uniform float fGrowth,fTime,fWind,fSpread; varying float fHeight;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','vec3 transformed=vec3(position);fHeight=position.y;transformed.y*=fGrowth;transformed.xz*=fSpread;float phase=0.0;\n#ifdef USE_INSTANCING\nphase=instanceMatrix[3].x*2.2+instanceMatrix[3].z*3.1;\n#endif\nfloat sway=(sin(fTime*1.35+phase+position.y*1.7)*.024+sin(fTime*2.65+phase*1.6)*.009)*position.y*position.y*fWind;transformed.x+=sway;transformed.z+=sway*.4;transformed.y-=abs(sway)*.07;');
      shader.fragmentShader='uniform float fCut,fGrain;varying float fHeight;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(fHeight>fCut)discard;'+(isGrain?'if(fGrain<.01)discard;':''));
      shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>','float ao=mix(0.60,1.08,smoothstep(0.0,1.5,fHeight));vec3 backlight=vec3(0.08,0.10,0.02)*smoothstep(0.3,1.8,fHeight);gl_FragColor.rgb=gl_FragColor.rgb*ao+backlight;\n#include <dithering_fragment>');
    };
    material.customProgramCacheKey=()=>isGrain?'world-grain-v1':'world-leaf-v1';
    return material;
  }
  // One crop hill: stems, radial textured leaves and the grain head, as non-indexed triangles.
  function buildClumpGeometry(rice){
    const random=Sim.random(rice?3126:3826),blades=[],uv=[],ears=[],tri=(list,a,b,c,ua,ub,uc)=>{list.push(...a,...b,...c);if(list===blades)uv.push(...(ua||[.03,.5]),...(ub||[.03,.5]),...(uc||[.03,.5]));};
    const stems=7;
    for(let s=0;s<stems;s++){
      const a=s/stems*Math.PI*2+random()*.6,rad=.04+random()*.07,bx=Math.cos(a)*rad,bz=Math.sin(a)*rad,h=1.5+random()*.45,lean=.08+random()*.17,ox=Math.cos(a),oz=Math.sin(a);
      const P=t=>[bx+ox*lean*t*t,t*h,bz+oz*lean*t*t];
      for(let j=0;j<9;j++){const t0=j/9,t1=(j+1)/9,p0=P(t0),p1=P(t1);for(const [dx,dz] of [[-oz,ox],[ox,oz]]){const w=.0085;tri(blades,[p0[0]-dx*w,p0[1],p0[2]-dz*w],[p0[0]+dx*w,p0[1],p0[2]+dz*w],[p1[0]+dx*w,p1[1],p1[2]+dz*w]);tri(blades,[p0[0]-dx*w,p0[1],p0[2]-dz*w],[p1[0]+dx*w,p1[1],p1[2]+dz*w],[p1[0]-dx*w,p1[1],p1[2]-dz*w]);}}
      for(let k=0;k<5;k++){
        const y0=.14+k*.26,o=P(y0/h),phi=a+(k%2?1:-1)*(.7+random()*.9)+random()*.4,cx=Math.cos(phi),cz=Math.sin(phi),len=.42+random()*.2,wid=rice?.03:.04;
        const pt=(t,s)=>{const r=len*t,y=y0+Math.sin(t*Math.PI*.84)*.285-t*t*.135,w=Math.sin(Math.pow(t,.8)*Math.PI)*wid*(1-t*.4)*s;return[o[0]+cx*r-cz*w,o[1]+(y-y0)-Math.abs(s)*Math.abs(w)*.25,o[2]+cz*r+cx*w];};
        for(let j=0;j<10;j++){const a0=j/10,b0=(j+1)/10;tri(blades,pt(a0,-1),pt(b0,-1),pt(a0,1),[0,a0],[0,b0],[1,a0]);tri(blades,pt(a0,1),pt(b0,-1),pt(b0,1),[1,a0],[0,b0],[1,b0]);}
      }
      const tip=P(1),ES=.62,L=(x,y,z)=>[tip[0]+(ox*x-oz*z)*ES,tip[1]+y*ES,tip[2]+(oz*x+ox*z)*ES];
      if(rice){for(let br=0;br<7;br++){const t=br/7,xx=t*.215,yy=.145*Math.sin(t*Math.PI)-t*.105;tri(ears,L(0,0,0),L(xx-.004,yy,.01),L(xx+.006,yy,.01));for(const side of [-1,1])for(let g=0;g<3;g++){const x=xx+side*(.025+g*.025),y=yy-g*.022-t*.04;tri(ears,L(xx,yy,0),L(x,y-.026,.025),L(x+.012,y+.01,.025));tri(ears,L(x-.01,y-.012,.025),L(x+.017,y-.02,.025),L(x+.013,y+.026,.025));}}}
      else{for(let g=0;g<10;g++)for(const side of [-1,1]){const yy=g*.027,xx=side*.027;tri(ears,L(0,yy,0),L(xx+side*.021,yy+.041,.025),L(xx,yy+.054,.025));tri(ears,L(xx,yy+.025,.015),L(xx+side*.066,yy+.18,.015),L(xx+side*.004,yy+.025,.015));}}
    }
    const make=(list,withUV)=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(list,3));if(withUV)g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;};
    return{blades:make(blades,true),ears:make(ears,false)};
  }
  function buildClumps(id){
    for(const m of worldClumps){world.remove(m);m.geometry.dispose();m.material.dispose();}worldClumps=[];worldCrop=id;
    const rice=id==='rice',geos=buildClumpGeometry(rice),random=Sim.random(rice?411:911),dummy=new T.Object3D(),count=rowCols*rowRows;
    for(const [isGrain,geo] of [[false,geos.blades],[true,geos.ears]]){
      const batch=new T.InstancedMesh(geo,fieldMaterial(isGrain,rice),count);batch.frustumCulled=false;batch.castShadow=false;batch.receiveShadow=true;batch.userData.grain=isGrain;
      worldClumps.push(batch);world.add(batch);
    }
    clumpData=[];for(let r=0;r<rowRows;r++)for(let c=0;c<rowCols;c++)clumpData.push({x:(c-(rowCols-1)/2)*rowSpacingX+(random()-.5)*.14,z:.9-r*rowSpacingZ+(random()-.5)*.12,ry:random()*Math.PI*2,rz:(random()-.5)*.05,s:clumpScale*(.9+random()*.2),sy:.94+random()*.12,tone:.86+random()*.2});
    clumpMask='';maskClumps(clumpMaskFor(orbit.mode),true);
  }
  const clumpMaskFor=mode=>mode;
  // Plant view clears the rows in front of the hero plant so it stands on open soil with the field behind it.
  function maskClumps(mode,force){
    if(!force&&clumpMask===mode)return;clumpMask=mode;const dummy=new T.Object3D();
    clumpData.forEach((d,n)=>{const hide=mode==='plant'&&d.z>-.35;dummy.position.set(d.x,0,d.z);dummy.rotation.set(0,d.ry,d.rz);const k=hide?0:1;dummy.scale.set(d.s*k,d.s*d.sy*k,d.s*k);dummy.updateMatrix();for(const b of worldClumps){b.setMatrixAt(n,dummy.matrix);b.setColorAt(n,new T.Color(d.tone,d.tone,d.tone*.97));}});
    for(const b of worldClumps){b.instanceMatrix.needsUpdate=true;if(b.instanceColor)b.instanceColor.needsUpdate=true;}
  }
  function stripeTexture(){
    const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d'),r=Sim.random(77);x.fillStyle='#8a9a6a';x.fillRect(0,0,256,256);
    for(let i=0;i<9000;i++){const px=r()*256,py=r()*256,a=.05+r()*.18;x.fillStyle=r()>.5?`rgba(30,48,24,${a})`:`rgba(230,235,180,${a})`;x.fillRect(px,py,1+r()*3,1+r()*5);}
    for(let i=0;i<8;i++){x.fillStyle='rgba(20,36,16,.18)';x.fillRect(i*32+14,0,5,256);}
    const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(30,12);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;
  }
  function buildWorld(){
    world=new T.Scene();world.environment=scene.environment;world.environmentIntensity=scene.environmentIntensity??.6;
    worldFog=new T.FogExp2(0xf3efe2,.0085);world.fog=worldFog;
    persp=new T.PerspectiveCamera(42,1,.05,400);
    worldHemi=new T.HemisphereLight(0xfff9e8,0x8b8264,1.7);world.add(worldHemi);
    worldSun=new T.DirectionalLight(0xfff3d6,2.2);worldSun.position.set(-4,9,6);worldSun.castShadow=true;worldSun.shadow.mapSize.set(2048,2048);Object.assign(worldSun.shadow.camera,{left:-3.2,right:3.2,top:4.2,bottom:-1.6,near:.5,far:30});worldSun.shadow.bias=-.0006;worldSun.shadow.normalBias=.02;worldSun.shadow.radius=3;worldSun.target.position.set(0,1,0);world.add(worldSun,worldSun.target);
    // Ground: dry soil, wet mud, straw mulch and ash are separate materials swapped by state.
    const geoG=new T.PlaneGeometry(260,260);geoG.rotateX(-Math.PI/2);
    for(const [k,id,rep] of [['dry','tex-soil-dry',90],['mud','tex-mud-wet',70],['ash','tex-ash-burnt',70]]){const m=new T.MeshStandardMaterial({color:'#b09878',roughness:.9});Look.apply(m,id,{rx:rep,ry:rep,normal:1.1});groundMats[k]=m;}
    worldGround=new T.Mesh(geoG,groundMats.dry);worldGround.receiveShadow=true;world.add(worldGround);
    worldStraw=new T.Mesh(geoG,new T.MeshStandardMaterial({color:'#e0cf9d',roughness:.9,transparent:true,opacity:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));worldStraw.position.y=.012;Look.apply(worldStraw.material,'tex-straw-mulch',{rx:120,ry:120,normal:1.2});worldStraw.visible=false;world.add(worldStraw);
    worldWater=new T.Mesh(geoG,new T.MeshPhysicalMaterial({color:'#6f6a4a',roughness:.1,metalness:0,transparent:true,opacity:.5,envMapIntensity:1.2,clearcoat:.6,clearcoatRoughness:.08}));worldWater.position.y=.05;worldWater.visible=false;world.add(worldWater);
    // Far canopy: a fogged mat that carries the rows to the horizon.
    worldCanopy=new T.Mesh(new T.PlaneGeometry(260,100),new T.MeshStandardMaterial({map:stripeTexture(),roughness:.95,color:'#ffffff'}));worldCanopy.rotation.x=-Math.PI/2;worldCanopy.position.set(0,1.9,-6.3-50);world.add(worldCanopy);
    // Sky dome with a warm haze horizon; colours follow the atmosphere.
    worldSky=new T.Mesh(new T.SphereGeometry(300,32,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,uniforms:{uZ:{value:new T.Color('#c6d8dd')},uH:{value:new T.Color('#f3eedd')},uSun:{value:V(-.4,.45,-.8).normalize()},uSunC:{value:new T.Color('#fff2cc')}},vertexShader:'varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform vec3 uZ,uH,uSunC,uSun;varying vec3 vD;void main(){float h=clamp(vD.y,0.0,1.0);vec3 c=mix(uH,uZ,pow(h,.55));float s=max(dot(normalize(vD),normalize(uSun)),0.0);c+=uSunC*(pow(s,420.0)*.9+pow(s,12.0)*.18);if(vD.y<0.0)c=uH;gl_FragColor=vec4(c,1.0);}'}));world.add(worldSky);
    // Distant windbreak trees.
    const treeGeo=new T.SphereGeometry(1,8,6);worldTrees=new T.InstancedMesh(treeGeo,new T.MeshStandardMaterial({color:'#51663f',roughness:1}),70);const tr=Sim.random(5),td=new T.Object3D();
    for(let i=0;i<70;i++){const x=-110+i*3.2+tr()*2,z=-92-tr()*8,h=7+tr()*7;td.position.set(x,h*.55,z);td.scale.set(2+tr()*1.6,h*.6,2+tr()*1.6);td.updateMatrix();worldTrees.setMatrixAt(i,td.matrix);}worldTrees.instanceMatrix.needsUpdate=true;worldTrees.frustumCulled=false;world.add(worldTrees);
    // Fire, smoke and rain as small instanced meshes.
    const inst=(geo,color,count,opacity)=>{const m=new T.InstancedMesh(geo,new T.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false}),count);m.frustumCulled=false;m.visible=false;world.add(m);return m;};
    worldFire=inst(new T.SphereGeometry(.07,6,5),'#ff9e32',44,.85);worldSmoke=inst(new T.SphereGeometry(.28,10,8),'#6b6b60',24,.16);worldRain=inst(new T.BoxGeometry(.012,.5,.012),'#dbe8ee',160,.55);
    heroWorld=null;resizeWorld();
    host.addEventListener('pointerdown',e=>{if(!worldActive())return;orbit.dragging=true;orbit.x=e.clientX;orbit.y=e.clientY;host.setPointerCapture(e.pointerId);});
    host.addEventListener('pointermove',e=>{if(!orbit.dragging)return;orbit.yaw=Math.max(-.8,Math.min(.8,orbit.yaw-(e.clientX-orbit.x)*.006));orbit.pitch=Math.max(-.25,Math.min(.35,orbit.pitch+(e.clientY-orbit.y)*.003));orbit.x=e.clientX;orbit.y=e.clientY;worldFlags.dirty=true;});
    const end=e=>{orbit.dragging=false;};host.addEventListener('pointerup',end);host.addEventListener('pointercancel',end);
    host.addEventListener('wheel',e=>{if(!worldActive())return;e.preventDefault();orbit.zoom=Math.max(.65,Math.min(1.4,orbit.zoom*(1+e.deltaY*.0012)));worldFlags.dirty=true;},{passive:false});
    host.style.touchAction='none';
  }
  const worldActive=()=>viewMode==='acre'||viewMode==='plant'||viewMode==='bowl';
  function resizeWorld(){if(!persp||!host)return;persp.aspect=Math.max(.2,host.clientWidth/Math.max(1,host.clientHeight));persp.updateProjectionMatrix();worldFlags.dirty=true;}
  function updateWorld(v,{motion,time,dt,dark,burning,intro}){
    const rice=v.id==='rice';
    if(worldCrop!==v.id)buildClumps(v.id);
    const H=Math.max(.35,v.growth.height*2.82),fallow=v.fallow,pond=v.pondDepthMm>5,mode=intro?'plant':viewMode==='acre'?'field':'plant';
    if(orbit.mode!==mode){orbit.mode=mode;orbit.yaw=0;orbit.pitch=0;orbit.zoom=1;}maskClumps(mode);
    // shared uniforms
    fieldUniforms.growth.value=v.growth.height;fieldUniforms.grain.value=Timeline.phase(v.das,v.def.stages[5].start_das,v.def.stages[7].start_das);fieldUniforms.cut.value=2.3-v.growth.harvest*2.17;fieldUniforms.time.value=time;fieldUniforms.wind.value=motion?0:1;fieldUniforms.spread.value=.2+v.growth.spread*.8;
    for(const b of worldClumps){b.visible=!fallow||v.growth.harvest>0&&v.position<125;b.material.color.set(b.userData.grain?(dark?'#a8955c':'#b8a15c'):dark?'#93b860':new T.Color('#466c30').lerp(new T.Color('#b49b50'),v.growth.ripe));}
    worldClumps.forEach(b=>{b.visible=!(fallow&&v.position>=125);});
    // hero plant
    if(heroWorld){heroWorld.visible=!fallow&&mode==='plant';heroWorld.position.set(0,0,heroZ);heroWorld.scale.setScalar(1.0);heroWorld.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});}
    // ground state
    const mat=burning||(v.residueStrategy==='burn'&&v.position>=125)?groundMats.ash:pond?groundMats.mud:groundMats.dry;worldGround.material=mat;mat.color.set(dark?'#6c5a48':pond?'#8b7a62':'#c4aa86');
    worldWater.visible=pond;worldWater.material.color.set(dark?'#3b463a':'#6f6a4a');worldWater.position.y=.05+Math.min(v.pondDepthMm,130)/130*.1;
    const cover=v.residueStrategy==='mulch'?v.residueCover:0;worldStraw.visible=cover>.02;worldStraw.material.opacity=Math.min(.95,cover*1.2);
    worldCanopy.visible=!fallow;worldCanopy.position.y=Math.max(.2,v.growth.height*2.82*.88);worldCanopy.material.color.set(dark?'#6e8656':new T.Color('#6f8a4c').lerp(new T.Color('#c5ab62'),v.growth.ripe));worldCanopy.material.opacity=1;
    // atmosphere: reuse the ortho sky colours
    worldSky.material.uniforms.uZ.value.copy(cZenith);worldSky.material.uniforms.uH.value.copy(cHorizon);worldSky.material.uniforms.uSunC.value.copy(cSun);worldFog.color.copy(cHorizon);world.background=null;
    worldFog.density=.0085+rainStrength*.008;
    worldHemi.intensity=hemiLight.intensity*.85;worldSun.intensity=sunLight.intensity;worldSun.color.copy(sunLight.color);worldTrees.material.color.set(dark?'#1c3026':'#3f5535');
    // particles
    worldRain.visible=rainStrength>.04&&!motion&&!intro;if(worldRain.visible){const d=new T.Object3D();for(let i=0;i<160;i++){const ph=(i*.6180339)%1,x=((i*7.31)%11)-5.5,z=-((i*3.7)%9)+1.5,y=6-((time*1.6+ph)%1)*6.2;d.position.set(x,y,z);d.updateMatrix();worldRain.setMatrixAt(i,d.matrix);}worldRain.instanceMatrix.needsUpdate=true;}
    worldFire.visible=!!burning;worldSmoke.visible=!!burning;
    if(burning){const d=new T.Object3D(),c=motion?0:time;for(let j=0;j<44;j++){const f=(c*.9+j/44)%1;d.position.set(-3.6+(j%15)*.5+Math.sin(c*3+j)*.08,.12+f*1.1,-.2-Math.floor(j/15)*1.1);d.scale.set((1-f)*2.4,(1-f)*(3.2+Math.sin(c*5+j)*.8),(1-f)*2.4);d.updateMatrix();worldFire.setMatrixAt(j,d.matrix);}worldFire.instanceMatrix.needsUpdate=true;
      for(let j=0;j<24;j++){const f=(c*.2+j/24)%1;d.position.set(-3+(j%8)*.85+f*.6,.9+f*3.4,-1-Math.floor(j/8)*1.5);d.scale.setScalar(.6+f*1.6);d.updateMatrix();worldSmoke.setMatrixAt(j,d.matrix);}worldSmoke.instanceMatrix.needsUpdate=true;}
    // camera presets
    const tyaw=orbit.yaw,pitch=orbit.pitch,zoom=orbit.zoom;let goal;
    if(mode==='field'){
      const eye=Math.max(3.6,H*1.45+1.6)*zoom,dist=6.4*zoom;goal={pos:V(Math.sin(tyaw)*dist*.8,eye+pitch*3,1.2+Math.cos(tyaw)*dist),look:V(0,Math.max(.9,H*.85),-6.5),fov:44};
    }else{
      const d=(2.05*H+.8)*zoom,tgt=V(0,H*.52+.05,heroZ);goal={pos:V(tgt.x+Math.sin(.45+tyaw)*d,tgt.y+d*(.1+pitch*.5),tgt.z+Math.cos(.45+tyaw)*d),look:tgt,fov:32};
    }
    if(!cam.init||motion){cam.pos.copy(goal.pos);cam.look.copy(goal.look);cam.fov=goal.fov;cam.init=true;}
    else{const k=1-Math.exp(-dt*4.5);cam.pos.lerp(goal.pos,k);cam.look.lerp(goal.look,k);cam.fov+=(goal.fov-cam.fov)*k;if(cam.pos.distanceTo(goal.pos)>.003||Math.abs(cam.fov-goal.fov)>.01)worldFlags.dirty=true;}
    persp.position.copy(cam.pos);persp.fov=cam.fov;persp.lookAt(cam.look);persp.updateProjectionMatrix();persp.updateMatrixWorld();
    worldAnchor.set(0,H*.98,heroZ);
  }
  function anchor(name){
    if(!persp||!worldActive()||!host)return null;
    const p=name==='plantTop'?worldAnchor.clone():null;if(!p)return null;p.project(persp);
    return{x:(p.x+1)/2*host.clientWidth,y:(1-p.y)/2*host.clientHeight,visible:p.z<1&&Math.abs(p.x)<1.05&&Math.abs(p.y)<1.05};
  }
  function setFamily(f){if(worldFlags.family===f)return;const first=!worldFlags.family;worldFlags.family=f;worldFlags.dirty=true;lastPosition=null;if(first)return;const c=renderer.domElement;c.style.transition='none';c.style.opacity='0';requestAnimationFrame(()=>{c.style.transition='opacity .35s ease';c.style.opacity='1';});}
  function update(v,{motion,time,dt,displayMode='acre',quantityMode='acre',metrics=null,paused=false,intro=false}){
    if(failed||!renderer&&!initialize())return;
    const dark=document.documentElement.dataset.theme==='dark',themeKey=dark?'dark':'light';
    if(themeSeen!==themeKey){themeSeen=themeKey;renderer.setClearColor(dark?0x14231e:0xf3f0e5,1);scene.traverse(o=>{if(o.isMesh&&!o.userData.noThemeDim&&(o.geometry.type==='PlaneGeometry'||o.userData.soil)){if(!o.userData.originalColor)o.userData.originalColor=o.material.color.clone();o.material.color.copy(o.userData.originalColor).multiplyScalar(dark?.57:1);}});lastPosition=null;}
    if(dt>.028&&!motion)slowFrames++;else slowFrames=Math.max(0,slowFrames-1);if(slowFrames>120&&renderer.getPixelRatio()>1){renderer.setPixelRatio(1);resize();slowFrames=0;}
    if(viewMode!==displayMode||lastQuantity!==quantityMode){viewMode=displayMode;lastQuantity=quantityMode;lastPosition=null;}lastMetrics=metrics;
    const secTarget=viewMode==='section'?1:0;sectionBlend=motion?secTarget:ease(sectionBlend,secTarget,dt,5);if(Math.abs(sectionBlend-secTarget)<.002)sectionBlend=secTarget;const growthTop=v.fallow?1.2:Math.max(.75,Math.min(5.1,v.growth.height*4.35+.35)),fitTop=growthTop+(1.35-growthTop)*sectionBlend,gf=.65+(.22-.65)*sectionBlend;if(Math.abs(camera.top-fitTop)>.001||Math.abs(groundFraction-gf)>.0005){groundFraction=gf;fitCamera(fitTop);lastPosition=null;}cloudGroup.scale.set(camera.right/2.9,camera.top/4.7,1);cloudGroup.position.y=camera.top*.76-3*cloudGroup.scale.y;
    if(lastIntro!==intro){lastIntro=intro;lastPosition=null;}
    const oldBlend=viewBlend;viewBlend=motion?(viewMode==='acre'?1:0):ease(viewBlend,viewMode==='acre'?1:0,dt,6);
    const staticFrame=motion||paused;if(staticFrame&&lastMotion&&paused===lastPaused&&motion===lastReduced&&v.position===lastPosition&&Math.abs(viewBlend-lastViewBlend)<.00001&&!(worldActive()&&worldFlags.dirty))return;lastPosition=v.position;lastMotion=staticFrame;lastPaused=paused;lastReduced=motion;lastViewBlend=viewBlend;
    if(currentStage!==v.id)buildPlant(v.id,8);
    uniforms.time.value=motion?0:time;uniforms.wind.value=motion?0:1;uniforms.height.value=v.growth.height;uniforms.spread.value=v.growth.spread;uniforms.root.value=v.growth.root;uniforms.cut.value=4-v.growth.harvest*3.82;
    const green=new T.Color(dark?'#95b96a':v.id==='rice'?'#628742':'#778f4b'),gold=new T.Color(dark?'#dac676':'#bba258');plantMaterials.forEach(m=>{if(m!==grainMaterialRef)m.color.copy(green).lerp(gold,v.growth.ripe);});grainMaterialRef.color.set('#ccb678');grainMaterialRef.opacity=v.growth.grain;reproductiveMaterialRef.opacity=Timeline.phase(v.das,v.def.stages[5].start_das,v.def.stages[6].start_das+3);rootMat.color.set(v.fallow?'#b7a686':'#d5c39e');plant.visible=roots.visible=true;seedMesh.visible=!v.fallow&&v.das<5;
    positionPump();
    updateField(v,{motion,time,dark});
    plant.visible=true;plant.position.z=2;plant.scale.setScalar(viewBlend>.5?.96:1.03);heroPlants.forEach((o,i)=>{o.visible=viewBlend>.04&&!v.fallow;o.position.set((i<2?-1:1)*(i%2?.73:.39)*camera.right,.015,1.9);o.scale.setScalar((.82+(i%2)*.10)*viewBlend);});seedMesh.visible=seedMesh.visible&&viewBlend<.5;roots.visible=true;roots.position.z=.3;roots.scale.setScalar(viewBlend>.5?1:1.18);roots.scale.y*=1.35;
    // All values are driven by the same continuously sampled, conserved daily ledger.
    const oldWater=waterSurface;waterGoal=-2.75+v.aquiferL/Sim.H.aquifer_capacity_L*1.05;waterSurface=(motion||paused)?waterGoal:ease(waterSurface,waterGoal,dt,7);waterDirection=Math.sign(waterSurface-oldWater);water.position.y=waterSurface-6;capillaryFringe.position.y=waterSurface+.12;positionMarker();
    const moistureFraction=v.soilL/(Sim.A*Sim.H.soil_capacity_mm);soilSurface.material.color.set(Look.has('tex-mud-wet')?(dark?(moistureFraction>.75?'#8c7a68':'#a08c76'):(moistureFraction>.75?'#cdb8a2':'#f6e8d6')):(dark?(moistureFraction>.75?'#6d583e':'#826948'):(moistureFraction>.75?'#61452c':'#795633')));soilSurface.material.roughness=.88-Math.min(1,moistureFraction)*.46;moisture.material.opacity=.04+Math.min(1,moistureFraction)*.17;
    // A true surface pool is held above y=0 before the timeline releases it into the root zone.
    const poolTarget=v.pondDepthMm>.05?.012+Math.min(v.pondDepthMm,130)/130*.13:0;surfaceHeight=(motion||paused)?poolTarget:ease(surfaceHeight,poolTarget,dt,6);pond.visible=surfaceHeight>.003;pond.scale.y=Math.max(.001,surfaceHeight);pond.position.y=surfaceHeight/2+.003;poolLine.visible=pond.visible;
    pumpStrength=(motion||paused)?(v.flow.pumped>0&&v.fraction<.4?1:0):ease(pumpStrength,v.flow.pumped>0&&v.fraction>.005&&v.fraction<.4?1:0,dt,6);
    rainStrength=(motion||paused)?(v.flow.rain>0&&v.fraction<.4?1:0):ease(rainStrength,v.flow.rain>0&&v.fraction>.005&&v.fraction<.4?1:0,dt,4);
    infiltrationStrength=(motion||paused)?(v.flow.infiltration>0&&v.fraction>=.3&&v.fraction<.72?1:0):ease(infiltrationStrength,v.flow.infiltration>0&&v.fraction>=.3&&v.fraction<.72?1:0,dt,5);
    uptakeStrength=(motion||paused)?(v.flow.cropET>0?1:0):ease(uptakeStrength,v.flow.cropET>0?1:0,dt,3);rechargeStrength=(motion||paused)?(v.flow.recharge>0||v.flow.queuedRecharge>0&&v.fraction>.8?1:0):ease(rechargeStrength,v.flow.recharge>0||v.flow.queuedRecharge>0&&v.fraction>.8?1:0,dt,4);
    const after=v.position>=121,burning=v.residueStrategy==='burn'&&v.position<125&&after,clock=motion?0:time;
    updateAtmosphere(v,dark,burning,clock);
    cloudGroup.children[0].children[0].material.opacity=.72*rainStrength;cloudGroup.visible=rainStrength>.03;cloudGroup.children.forEach((c,i)=>{c.position.x=c.userData.baseX+(motion?0:Math.sin(time*.18+i)*.17);});rainGroup.visible=rainStrength>.04&&!motion;rainGroup.children.forEach((p,i)=>{p.visible=i<Math.min(78,22+Math.round(v.s.rainMm));p.position.set(p.userData.x,3.2-((motion?0:time*1.15)+p.userData.phase)%1*3.2,2);});rainGroup.children[0].material.opacity=.62*rainStrength;
    particles.visible=dischargeGroup.visible=splashGroup.visible=pumpStrength>.03;
    outletStream.visible=pumpStrength>.03&&!intro;outletStream.material.opacity=.58*pumpStrength;
    particles.userData.dots.forEach(p=>{const f=((motion?0:time*.38)+p.userData.phase)%1;p.scale.setScalar(quantityMode==='bowl'?.65:1);p.position.copy(pipeCurve.getPoint(f));p.position.z=1.85;if(p.position.y>0)p.position.y*=pumpSceneScale;p.material.opacity=.85*pumpStrength;});dischargeGroup.userData.dots.forEach(p=>{const f=((motion?0:time*1.6)+p.userData.phase)%1;p.scale.setScalar(quantityMode==='bowl'?.65:1);p.position.copy(outletCurve.getPoint(f));p.position.y+=(surfaceHeight-.016)*(f*f);p.material.opacity=.85*pumpStrength;});
    splashGroup.userData.dots.forEach((p,j)=>{const f=((motion?0:time*2.2)+p.userData.phase)%1,ang=(j/10)*Math.PI;p.position.set(.56+Math.cos(ang)*f*.11,Math.max(.01,surfaceHeight)+Math.sin(f*Math.PI)*.06,1.82);p.scale.setScalar((1-f)*(quantityMode==='bowl'?.55:.85));p.material.opacity=.7*pumpStrength*(1-f);});
    infiltrationGroup.visible=infiltrationStrength>.04;infiltrationGroup.userData.dots.forEach((p,j)=>{const f=((motion?0:time*.38)+p.userData.phase)%1;p.position.set(-1.1+(j%12)*.19,-.04-f*.85,1.25);p.material.opacity=.58*infiltrationStrength;});
    uptakeGroup.visible=uptakeStrength>.05&&!v.fallow;uptakeGroup.userData.dots.forEach((p,j)=>{const f=((motion?0:time*.28)+p.userData.phase)%1;p.position.set(Math.sin(j*2.4)*.22*(1-f),-.55+f*.7,1.27);p.material.opacity=.62*uptakeStrength;});
    rechargeGroup.visible=rechargeStrength>.03;rechargeGroup.userData.dots.forEach((p,j)=>{const f=((motion?0:time*.27)+p.userData.phase)%1,arriving=v.flow.recharge>0,top=arriving?waterSurface+.28:-.9,bottom=arriving?waterSurface-.03:waterSurface+.15;p.position.set(-1.12+(j%10)*.21,top+(bottom-top)*f,1.3);p.material.opacity=.76*rechargeStrength;});
    const feeding=v.s.cropStates[v.id].products.some(p=>p.date===v.s.date&&p.category==='fertilizer');fertilizerGroup.visible=feeding&&v.fraction<.6;
    const origin=V(-camera.right*.25,1.25,1.9);
    fertilizerGroup.userData.dots.forEach((p,j)=>{const f=Timeline.phase(v.fraction, j*.007,.3+j*.007),x=-1.0+(j%7)*.17;p.position.set(origin.x+(x-origin.x)*f,origin.y*(1-f)+Math.sin(f*Math.PI)*.3-Math.max(0,v.fraction-.3)*.5,1.9);p.scale.setScalar(1.6*(1-Timeline.phase(v.fraction,.4,.6)));p.material.opacity=1;});
    strawGroup.visible=after;strawGroup.userData.batch.material.color.set(v.residueStrategy==='burn'?'#5c513e':'#bea368');
    strawGroup.userData.dots.forEach((p,j)=>{const cover=v.residueStrategy==='mulch'?v.residueCover:1-v.residueProgress*.9;const spread=v.residueStrategy==='mulch'?v.residueProgress:1;p.position.set(-.4+(-1.1+(j%15)*.16)*spread,.024+Math.floor(j/15)*.011+Math.sin(spread*Math.PI)*.18,1.55);p.scale.set(cover*1.5,.18,1);p.rotation.z=(1-spread)*1.5+Math.sin(j*3)*.4;});
    fireGroup.visible=burning;smokeGroup.visible=burning;
    fireGroup.userData.dots.forEach((p,j)=>{const f=(clock*.9+j/44)%1;p.position.set(-1.4+(j%15)*.16+Math.sin(clock*3+j)*.025,.05+f*.42,1.8);p.scale.set((1-f)*.7,(1-f)*(1.5+Math.sin(clock*5+j)*.4),.4);p.material.opacity=.85*(1-v.residueProgress);});
    smokeGroup.userData.dots.forEach((p,j)=>{const f=(clock*.2+j/24)%1;p.position.set(-1.3+(j%8)*.30+f*.25,.3+f*1.7,1.7);p.scale.setScalar(.5+f*1.4);p.material.opacity=.14*(1-v.residueProgress);});
    for(const group of [particles,dischargeGroup,splashGroup,infiltrationGroup,uptakeGroup,rechargeGroup,fertilizerGroup,strawGroup,fireGroup,smokeGroup]){if(!group.visible)continue;group.userData.dots.forEach((p,i)=>{if(p.position.y<0)p.position.y*=depthCompression;p.updateMatrix();group.userData.batch.setMatrixAt(i,p.matrix);});group.userData.batch.instanceMatrix.needsUpdate=true;}
    if(intro){for(const group of [cloudGroup,rainGroup,particles,dischargeGroup,splashGroup,infiltrationGroup,uptakeGroup,rechargeGroup,fertilizerGroup])group.visible=false;outletStream.visible=false;}
    water.material.color.set(dark?'#42797f':v.flow.recharge>0?'#4d8d89':'#50898e');wave(waterLine,waterSurface,motion?0:time,motion?0:.0025);if(pond.visible)wave(poolLine,surfaceHeight+.003,motion?0:time,motion?0:.0045);if(worldActive()){updateWorld(v,{motion,time,dt,dark,burning,intro});setFamily('persp');renderer.render(world,persp);}else{setFamily('ortho');renderer.render(scene,camera);}worldFlags.dirty=false;renderedFrames++;lastDay=v.day;
  }
  return{update,resize,anchor,loadCustomTextures,invalidate:()=>{lastPosition=null;},info:()=>({world:{active:worldActive(),family:worldFlags.family,orbit:{...orbit},clumps:worldClumps.length,camera:{x:cam.pos.x,y:cam.pos.y,z:cam.pos.z,fov:cam.fov}},representation:viewMode==='acre'?'representative field canopy':'plant close-up',viewMode,zoomBlend:viewBlend,visiblePlantClumps:viewBlend>.5?(lastDay>=121&&lastDay<Sim.wheatStart()?0:fieldCount):1,revision:T.REVISION,locked:true,renderer:!!renderer,reduced:lastReduced,paused:lastPaused,position:lastPosition,crop:currentStage,geometryBuilds,renderedFrames,waterSurface,waterGoal,waterDirection,surfacePoolHeight:surfaceHeight,pumpStrength,rainStrength,cloudsVisible:!!cloudGroup?.visible,infiltrationAnimating:!!infiltrationGroup?.visible,uptakeAnimating:!!uptakeGroup?.visible,rechargeAnimating:!!rechargeGroup?.visible,rainAnimating:!!rainGroup?.visible,pumpAnimating:!!particles?.visible,dischargeAnimating:!!dischargeGroup?.visible,growth:uniforms.height.value,windTime:uniforms.time.value,day:lastDay,tubewellScreenX:camera?(pumpAnchor/camera.right+1)*host.clientWidth/2:null,tubewellBounds:camera?{left:(pumpOffset+.58*.85*pumpSceneScale-camera.left)/(camera.right-camera.left)*host.clientWidth,right:(pumpOffset+1.70*.85*pumpSceneScale-camera.left)/(camera.right-camera.left)*host.clientWidth,top:(camera.top-.61*pumpSceneScale)/(camera.top-camera.bottom)*host.clientHeight,bottom:(camera.top-.02*pumpSceneScale)/(camera.top-camera.bottom)*host.clientHeight}:null,look:Look.stats(),tubewellOutletX:pumpOffset+.80*.85*pumpSceneScale,quantityMode:lastQuantity,allocatedWaterL:lastMetrics?.pumpedL,sceneHeight:host?.clientHeight,soilScreenY:camera?(camera.top/(camera.top-camera.bottom))*host.clientHeight:null,depthCompression,groundFraction,displayedCropHeightPx:camera?3.12*uniforms.height.value/(camera.top-camera.bottom)*host.clientHeight:null,waterScreenY:camera?((camera.top-waterSurface*depthCompression)/(camera.top-camera.bottom))*host.clientHeight:null,cropCenterX:plant?new T.Vector3(plant.position.x,0,0).project(camera).x:null,drawCalls:renderer?.info.render.calls,theme:themeSeen,fireVisible:!!fireGroup?.visible,residueVisible:!!strawGroup?.visible,fertilizerVisible:!!fertilizerGroup?.visible,pixelRatio:renderer?.getPixelRatio()})};
})();
