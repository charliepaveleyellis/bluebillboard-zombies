// ─── TAP HANDLER ────────────────────────────────
var lastTapX=0,lastTapY=0,tapFired=false;
var lastShotTime=0;
var SHOT_COOLDOWN=350; // milliseconds between shots
var touchHandled=false; // prevent double-fire from touchstart+click

function handleTap(e){
  if(!running||gameOver) return;
  // Prevent double-fire: touchstart sets flag, click checks it
  if(e.type==='click'&&touchHandled){touchHandled=false;return;}
  if(e.type==='touchstart') touchHandled=true;

  if(e&&e.preventDefault) e.preventDefault();

  // Cooldown
  var now=Date.now();
  if(now-lastShotTime<SHOT_COOLDOWN) return;
  lastShotTime=now;

  // If in WebXR mode, don't handle here — XR select handles it
  if(useWebXR) return;

  var tx,ty;
  if(e.changedTouches&&e.changedTouches.length>0){
    tx=e.changedTouches[0].clientX;
    ty=e.changedTouches[0].clientY;
  } else if(e.touches&&e.touches.length>0){
    tx=e.touches[0].clientX;
    ty=e.touches[0].clientY;
  } else {
    tx=e.clientX;
    ty=e.clientY;
  }
  if(tx===undefined||ty===undefined) return;

  lastTapX=tx;lastTapY=ty;tapFired=true;
  sfxShoot();
  muzzleFlash=5;
  spawnParticles(tx,ty,'#ffcc00',4);
  spawnParticles(tx,ty,'#ffffff',2);

  // Check if tap lands directly on a zombie's body
  var hitIdx=-1;
  for(var i=zombies.length-1;i>=0;i--){ // check closest (front) first
    var z=zombies[i];
    if(!z.onScreen) continue;
    var zh=getZombieHeight(z.dist);
    var zw=zh*0.5;
    var bodyTop=z.y-zh;   // top of zombie (head)
    var bodyBot=z.y;       // bottom of zombie (feet)
    var bodyLeft=z.x-zw/2;
    var bodyRight=z.x+zw/2;
    if(tx>=bodyLeft&&tx<=bodyRight&&ty>=bodyTop&&ty<=bodyBot){
      hitIdx=i;
      break; // hit the frontmost zombie at this position
    }
  }

  if(hitIdx>=0){
    var z=zombies[hitIdx];
    z.hp--;z.hitTimer=0.4;
    screenShakeX+=(Math.random()-0.5)*6;
    screenShakeY+=(Math.random()-0.5)*4;

    if(z.hp<=0){
      kills++;waveKills++;
      combo++;comboTimer=2;
      var points=z.isBig?25:10;
      points*=Math.min(combo,10);
      score+=points;
      if(combo>=3) sfxHeadshot();
      sfxKill();
      var zh2=getZombieHeight(z.dist);
      var killX=z.x,killY=z.y-zh2/2;
      spawnParticles(killX,killY,'#3a6a3a',20);
      spawnParticles(killX,killY,'#ff2200',15);
      spawnParticles(killX,killY,'#880000',10);
      spawnParticles(killX,killY,'#ffaa00',5);
      bloodSplats.push({x:killX+(Math.random()-0.5)*30,y:z.y+Math.random()*10,
        w:15+Math.random()*25,h:5+Math.random()*10,rot:Math.random()*Math.PI,
        color:'rgba('+(80+Math.random()*40)+',0,0,1)',life:1});
      for(var si=0;si<2;si++){
        bloodSplats.push({x:killX+(Math.random()-0.5)*60,y:z.y+Math.random()*15-5,
          w:8+Math.random()*15,h:3+Math.random()*8,rot:Math.random()*Math.PI,
          color:'rgba('+(60+Math.random()*50)+',0,0,1)',life:0.8+Math.random()*0.2});
      }
      screenShakeX+=(Math.random()-0.5)*12;
      screenShakeY+=(Math.random()-0.5)*10;
      if(z.mesh&&typeof xrScene!=='undefined') try{xrScene.remove(z.mesh);}catch(e){}
      zombies.splice(hitIdx,1);
      if(waveKills>=waveTarget){
        wave++;waveKills=0;
        waveTarget=wave<=3?3+wave:Math.floor(3+wave*2); // 4,5,6 then ramps up
        spawnInterval=Math.max(SPAWN_INTERVAL_MIN,SPAWN_INTERVAL_START-wave*100);
        sfxWave();screenFlash=15;
        if(hp<MAX_HP){hp++;spawnParticles(C.width/2,C.height*0.04,'#ff3333',12);}
        screenShakeX+=(Math.random()-0.5)*20;
        screenShakeY+=(Math.random()-0.5)*15;
      }
      if(combo===5&&hp<MAX_HP){hp++;spawnParticles(C.width*0.8,30,'#ff3333',10);snd(1000,'sine',0.1,0.06);}
      if(combo===10&&hp<MAX_HP){hp++;spawnParticles(C.width*0.8,30,'#ffaa00',12);snd(1200,'sine',0.1,0.07);}
    } else {
      spawnParticles(tx,ty,'#ff0000',8);
      spawnParticles(tx,ty,'#880000',4);
    }
  } else {
    // Miss — tap didn't land on any zombie
    spawnParticles(tx,ty,'rgba(150,150,150,0.4)',3);
  }
}

// Listen on document — but NOT in AR mode
document.addEventListener('touchstart',function(e){
  if(!running||gameOver||useWebXR) return;
  handleTap(e);
},{passive:false});
document.addEventListener('click',function(e){
  if(!running||gameOver||useWebXR) return;
  handleTap(e);
});
