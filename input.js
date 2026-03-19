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
  sfxShoot();spawnParticles(tx,ty,'#ffaa00',3);

  // Find nearest zombie to tap
  var bestIdx=-1,bestDist=99999;
  for(var i=0;i<zombies.length;i++){
    var z=zombies[i];
    if(!z.onScreen) continue;
    var zh=getZombieHeight(z.dist);
    var zcx=z.x,zcy=z.y-zh/2;
    var dx=tx-zcx,dy=ty-zcy;
    var d=Math.sqrt(dx*dx+dy*dy);
    var maxDist=Math.max(80,zh);
    if(d<maxDist&&d<bestDist){bestDist=d;bestIdx=i;}
  }
  if(bestIdx>=0){
    var z=zombies[bestIdx];
    z.hp--;z.hitTimer=0.3;
    if(z.hp<=0){
      kills++;waveKills++;score+=z.isBig?25:10;
      sfxKill();
      var zh2=getZombieHeight(z.dist);
      spawnParticles(z.x,z.y-zh2/2,'#4a7a4a',12);
      spawnParticles(z.x,z.y-zh2/2,'#ff3333',6);
      zombies.splice(bestIdx,1);
      if(waveKills>=waveTarget){
        wave++;waveKills=0;
        waveTarget=Math.floor(5+wave*2.5);
        spawnInterval=Math.max(SPAWN_INTERVAL_MIN,SPAWN_INTERVAL_START-wave*100);
        sfxWave();screenFlash=10;
      }
    } else {
      spawnParticles(tx,ty,'#ff0000',4);
    }
  } else {
    spawnParticles(tx,ty,'rgba(150,150,150,0.5)',2);
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
