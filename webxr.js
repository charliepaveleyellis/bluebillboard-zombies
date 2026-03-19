// ─── WEBXR MODE (Android Chrome) ────────────────
var xrSession=null,xrRenderer=null,xrScene=null,xrCamera=null;
var xrHitTestSource=null,xrLocalRef=null,xrFloorY=null;

async function startWebXR(){
  if(typeof THREE==='undefined'){
    await new Promise(function(resolve,reject){
      var check=setInterval(function(){
        if(typeof THREE!=='undefined'){clearInterval(check);resolve();}
      },100);
      setTimeout(function(){clearInterval(check);reject(new Error('3D engine not loaded'));},10000);
    });
  }

  xrSession=await navigator.xr.requestSession('immersive-ar',{
    requiredFeatures:['hit-test','local'],
    optionalFeatures:['dom-overlay'],
    domOverlay:{root:document.body}
  });

  xrScene=new THREE.Scene();
  xrCamera=new THREE.PerspectiveCamera(70,window.innerWidth/window.innerHeight,0.01,100);
  xrRenderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
  xrRenderer.setSize(window.innerWidth,window.innerHeight);
  xrRenderer.setPixelRatio(window.devicePixelRatio);
  xrRenderer.xr.enabled=true;
  document.body.appendChild(xrRenderer.domElement);
  xrRenderer.domElement.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;';

  cam.classList.add('hidden');
  C.style.zIndex='2';

  xrScene.add(new THREE.AmbientLight(0xffffff,0.6));
  var dl=new THREE.DirectionalLight(0xffffff,0.8);dl.position.set(1,3,2);xrScene.add(dl);
  xrScene.add(new THREE.PointLight(0xff3333,0.5,10));

  xrRenderer.xr.setReferenceSpaceType('local');
  await xrRenderer.xr.setSession(xrSession);

  xrLocalRef=await xrSession.requestReferenceSpace('local');
  var viewerRef=await xrSession.requestReferenceSpace('viewer');
  xrHitTestSource=await xrSession.requestHitTestSource({space:viewerRef});

  // In WebXR, regular touch events don't fire — use XR select event for taps
  xrSession.addEventListener('select',function(){
    if(!running||gameOver) return;
    // In AR mode, shoot the nearest zombie (aim with crosshair)
    sfxShoot();
    spawnParticles(C.width/2,C.height/2,'#ffaa00',3);
    var bestIdx=-1,bestDist=99999;
    for(var i=0;i<zombies.length;i++){
      var z=zombies[i];
      if(z.dist<bestDist){bestDist=z.dist;bestIdx=i;}
    }
    if(bestIdx>=0){
      var z=zombies[bestIdx];
      z.hp--;z.hitTimer=0.3;
      if(z.hp<=0){
        kills++;waveKills++;score+=z.isBig?25:10;
        sfxKill();
        if(z.mesh) xrScene.remove(z.mesh);
        zombies.splice(bestIdx,1);
        if(waveKills>=waveTarget){
          wave++;waveKills=0;
          waveTarget=Math.floor(5+wave*2.5);
          spawnInterval=Math.max(SPAWN_INTERVAL_MIN,SPAWN_INTERVAL_START-wave*100);
          sfxWave();screenFlash=10;
        }
      }
    }
  });

  xrSession.addEventListener('end',function(){xrSession=null;useWebXR=false;});

  useWebXR=true;
  xrRenderer.setAnimationLoop(xrFrame);
}

function createXRZombie(isBig){
  var g=new THREE.Group();
  var sc=isBig?1.3:1.0;
  var skin=isBig?0x1a3a1a:0x3a6a3a;
  var dark=isBig?0x0a2a0a:0x2a4a2a;

  var body=new THREE.Mesh(new THREE.CylinderGeometry(0.15*sc,0.18*sc,0.5*sc,8),new THREE.MeshLambertMaterial({color:skin}));
  body.position.y=0.75*sc;g.add(body);
  var head=new THREE.Mesh(new THREE.SphereGeometry(0.12*sc,8,8),new THREE.MeshLambertMaterial({color:isBig?0x2a4a2a:0x4a7a4a}));
  head.position.y=1.12*sc;g.add(head);
  var em=new THREE.MeshBasicMaterial({color:0xff2200});
  var eL=new THREE.Mesh(new THREE.SphereGeometry(0.02*sc,6,6),em);eL.position.set(-0.04*sc,1.14*sc,0.1*sc);g.add(eL);
  var eR=new THREE.Mesh(new THREE.SphereGeometry(0.02*sc,6,6),em);eR.position.set(0.04*sc,1.14*sc,0.1*sc);g.add(eR);
  var am=new THREE.MeshLambertMaterial({color:skin});
  var aL=new THREE.Mesh(new THREE.CylinderGeometry(0.04*sc,0.03*sc,0.4*sc,6),am);
  aL.position.set(-0.22*sc,0.85*sc,0.1*sc);aL.rotation.x=-0.8;aL.rotation.z=0.3;g.add(aL);
  var aR=new THREE.Mesh(new THREE.CylinderGeometry(0.04*sc,0.03*sc,0.4*sc,6),am);
  aR.position.set(0.22*sc,0.85*sc,0.1*sc);aR.rotation.x=-0.8;aR.rotation.z=-0.3;g.add(aR);
  var lm=new THREE.MeshLambertMaterial({color:dark});
  var lL=new THREE.Mesh(new THREE.CylinderGeometry(0.06*sc,0.05*sc,0.5*sc,6),lm);lL.position.set(-0.08*sc,0.25*sc,0);g.add(lL);
  var lR=new THREE.Mesh(new THREE.CylinderGeometry(0.06*sc,0.05*sc,0.5*sc,6),lm);lR.position.set(0.08*sc,0.25*sc,0);g.add(lR);
  var sg=new THREE.CircleGeometry(0.25*sc,16);sg.rotateX(-Math.PI/2);
  g.add(new THREE.Mesh(sg,new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.4})));

  g.userData={aL:aL,aR:aR,lL:lL,lR:lR,head:head,sc:sc};
  return g;
}

function spawnXRZombie(){
  if(xrFloorY===null) return;
  var angle=Math.random()*Math.PI*2;
  var dist=3+Math.random()*5;
  var x=xrCamera.position.x+Math.sin(angle)*dist;
  var z2=xrCamera.position.z+Math.cos(angle)*dist;
  var isBig=Math.random()<0.12+wave*0.02;
  var mesh=createXRZombie(isBig);
  mesh.position.set(x,xrFloorY,z2);
  xrScene.add(mesh);
  var zd={
    worldAngle:angle*180/Math.PI,
    dist:dist,speed:(0.4+Math.random()*0.4)*(1+wave*0.05),
    hp:1+Math.floor(wave/4)+(isBig?2:0),maxHp:1+Math.floor(wave/4)+(isBig?2:0),
    hitTimer:0,wobble:Math.random()*Math.PI*2,wobbleSpeed:0.02+Math.random()*0.03,
    isBig:isBig,armPhase:Math.random()*Math.PI*2,
    x:C.width/2,y:C.height*0.8,scale:0.1,onScreen:true,
    mesh:mesh,xr:true
  };
  zombies.push(zd);
}

var xrPrevTime=0;
function xrFrame(time,frame){
  if(!frame) return;
  var dt=Math.min(0.05,(time-xrPrevTime)/1000);
  xrPrevTime=time;frameCount++;

  // Floor detection
  if(xrFloorY===null) xrFloorY=xrCamera.position.y-1.5;
  if(xrHitTestSource){
    var hits=frame.getHitTestResults(xrHitTestSource);
    if(hits.length>0){
      var pose=hits[0].getPose(xrLocalRef);
      if(pose){
        var hy=pose.transform.position.y;
        xrFloorY=xrFloorY*0.9+hy*0.1;
      }
    }
  }

  if(running&&!gameOver){
    if(time-lastSpawn>spawnInterval){
      spawnXRZombie();
      if(wave>3&&Math.random()<0.3) spawnXRZombie();
      lastSpawn=time;
    }

    for(var i=zombies.length-1;i>=0;i--){
      var z=zombies[i];
      if(!z.xr) continue;
      var m=z.mesh;
      var dx=xrCamera.position.x-m.position.x;
      var dz=xrCamera.position.z-m.position.z;
      var dist=Math.sqrt(dx*dx+dz*dz);
      z.dist=dist;
      m.rotation.y=Math.atan2(dx,dz);
      if(dist>0.5){m.position.x+=dx/dist*z.speed*dt;m.position.z+=dz/dist*z.speed*dt;}
      m.position.y=xrFloorY;

      z.wobble+=z.wobbleSpeed;
      var wb=Math.sin(z.wobble*4);
      var ud=m.userData;
      ud.lL.rotation.x=wb*0.4;ud.lR.rotation.x=-wb*0.4;
      ud.aL.rotation.x=-0.8+wb*0.3;ud.aR.rotation.x=-0.8-wb*0.3;
      m.rotation.z=Math.sin(z.wobble*2)*0.05;

      if(z.hitTimer>0){z.hitTimer-=dt;m.visible=Math.sin(z.hitTimer*20)>0;}else{m.visible=true;}

      // Set worldAngle relative to device yaw so radar works
      var zombieWorldAngle=Math.atan2(dx,dz)*180/Math.PI;
      z.worldAngle=zombieWorldAngle+camYaw-yawOffset;
      z.x=C.width/2;z.y=C.height*0.8;z.onScreen=dist<15;

      if(dist<0.7){
        hp--;sfxHit();damageFlash=12;
        xrScene.remove(m);zombies.splice(i,1);
        if(navigator.vibrate) navigator.vibrate([100,50,150]);
        if(hp<=0){gameOver=true;screenFlash=15;setTimeout(endGame,800);}
      }
    }
  }

  X.clearRect(0,0,C.width,C.height);
  if(damageFlash>0){X.fillStyle='rgba(255,0,0,'+(damageFlash*0.04)+')';X.fillRect(0,0,C.width,C.height);damageFlash--;}
  if(screenFlash>0){X.fillStyle='rgba(100,255,100,'+(screenFlash*0.03)+')';X.fillRect(0,0,C.width,C.height);screenFlash--;}
  if(!gameOver) drawHUD();

  xrRenderer.render(xrScene,xrCamera);
}

// ─── AR BUTTON SETUP ────────────────────────────
if(navigator.xr&&navigator.xr.isSessionSupported){
  navigator.xr.isSessionSupported('immersive-ar').then(function(ok){
    if(ok){
      // Show AR button
      var arBtn=document.getElementById('arBtn');
      if(arBtn) arBtn.style.display='inline-block';
      // Preload Three.js
      var s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
      document.head.appendChild(s);
    }
  }).catch(function(){});
}

function onARTap(e){
  if(e) e.preventDefault();
  initAudio();
  if(audioCtx&&audioCtx.state==='suspended') audioCtx.resume();

  var arBtn=document.getElementById('arBtn');
  arBtn.textContent='Loading AR...';

  try{
    startWebXR().then(function(){
      score=0;kills=0;wave=1;hp=MAX_HP;
      waveKills=0;waveTarget=5;spawnInterval=SPAWN_INTERVAL_START;
      zombies=[];particles=[];frameCount=0;lastSpawn=0;
      gameOver=false;screenFlash=0;damageFlash=0;
      document.getElementById('startScreen').classList.add('hidden');
      document.getElementById('endScreen').classList.add('hidden');
      running=true;
      arBtn.textContent='AR ACTIVE';arBtn.style.borderColor='#33ff33';
    }).catch(function(err){
      arBtn.textContent='FAILED: '+err.message;
      arBtn.style.borderColor='#ff0000';
    });
  }catch(err2){
    arBtn.textContent='ERROR: '+err2.message;
    arBtn.style.borderColor='#ff0000';
  }
}

var arBtnEl=document.getElementById('arBtn');
if(arBtnEl) arBtnEl.onclick=onARTap;
