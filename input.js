// ─── TAP HANDLER ────────────────────────────────
var lastTapX=0,lastTapY=0,tapFired=false;

function handleTap(e){
  if(!running||gameOver) return;
  if(e&&e.preventDefault) e.preventDefault();

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

  // Muzzle flash particles
  spawnParticles(tx,ty,'#ffcc00',4);
  spawnParticles(tx,ty,'#ffffff',2);

  // Find nearest on-screen zombie — must tap within range of the zombie
  var bestIdx=-1,bestDist=99999;
  for(var i=0;i<zombies.length;i++){
    var z=zombies[i];
    if(!z.onScreen) continue;
    var zh=getZombieHeight(z.dist);
    var zw=zh*0.5;
    var dx=tx-z.x,dy=ty-(z.y-zh/2);
    var d=Math.sqrt(dx*dx+dy*dy);
    // Must tap within the zombie's body area (half height + 30px padding)
    var maxDist=Math.max(40,zh/2+30);
    if(d<maxDist&&d<bestDist){bestDist=d;bestIdx=i;}
  }
  if(bestIdx>=0){
    var z=zombies[bestIdx];
    z.hp--;z.hitTimer=0.4;

    // Screen shake on hit
    screenShakeX+=(Math.random()-0.5)*6;
    screenShakeY+=(Math.random()-0.5)*4;

    if(z.hp<=0){
      // KILL!
      kills++;waveKills++;
      combo++;comboTimer=2;
      var points=z.isBig?25:10;
      points*=Math.min(combo,10); // combo multiplier!
      score+=points;

      if(combo>=3) sfxHeadshot();
      sfxKill();

      var zh2=getZombieHeight(z.dist);
      var killX=z.x,killY=z.y-zh2/2;

      // Big death explosion
      spawnParticles(killX,killY,'#3a6a3a',20);
      spawnParticles(killX,killY,'#ff2200',15);
      spawnParticles(killX,killY,'#880000',10);
      spawnParticles(killX,killY,'#ffaa00',5);

      // Blood splat on ground
      bloodSplats.push({
        x:killX+(Math.random()-0.5)*30,
        y:z.y+Math.random()*10,
        w:15+Math.random()*25,h:5+Math.random()*10,
        rot:Math.random()*Math.PI,
        color:'rgba('+(80+Math.random()*40)+',0,0,1)',
        life:1
      });
      // Extra splats
      for(var si=0;si<2;si++){
        bloodSplats.push({
          x:killX+(Math.random()-0.5)*60,
          y:z.y+Math.random()*15-5,
          w:8+Math.random()*15,h:3+Math.random()*8,
          rot:Math.random()*Math.PI,
          color:'rgba('+(60+Math.random()*50)+',0,0,1)',
          life:0.8+Math.random()*0.2
        });
      }

      // Screen shake on kill
      screenShakeX+=(Math.random()-0.5)*12;
      screenShakeY+=(Math.random()-0.5)*10;

      // Remove from AR scene if WebXR
      if(z.mesh&&typeof xrScene!=='undefined') try{xrScene.remove(z.mesh);}catch(e){}
      zombies.splice(bestIdx,1);

      // Wave check
      if(waveKills>=waveTarget){
        wave++;waveKills=0;
        waveTarget=Math.floor(5+wave*2.5);
        spawnInterval=Math.max(SPAWN_INTERVAL_MIN,SPAWN_INTERVAL_START-wave*100);
        sfxWave();screenFlash=15;
        // Heal 1 heart on wave clear
        if(hp<MAX_HP){
          hp++;
          spawnParticles(C.width/2,C.height*0.04,'#ff3333',12);
          spawnParticles(C.width/2,C.height*0.04,'#ff8888',8);
        }
        screenShakeX+=(Math.random()-0.5)*20;
        screenShakeY+=(Math.random()-0.5)*15;
      }

      // Bonus heart at 5 combo
      if(combo===5&&hp<MAX_HP){
        hp++;
        spawnParticles(C.width*0.8,30,'#ff3333',10);
        snd(1000,'sine',0.1,0.06);
      }
      // Bonus heart at 10 combo
      if(combo===10&&hp<MAX_HP){
        hp++;
        spawnParticles(C.width*0.8,30,'#ffaa00',12);
        snd(1200,'sine',0.1,0.07);
      }
    } else {
      // Hit but alive — blood spray
      spawnParticles(tx,ty,'#ff0000',8);
      spawnParticles(tx,ty,'#880000',4);
    }
  } else {
    // Miss
    spawnParticles(tx,ty,'rgba(150,150,150,0.4)',3);
  }
}

// Listen on document so touches always register
document.addEventListener('touchstart',function(e){
  if(!running||gameOver) return;
  handleTap(e);
},{passive:false});
document.addEventListener('click',function(e){
  if(!running||gameOver) return;
  handleTap(e);
});
