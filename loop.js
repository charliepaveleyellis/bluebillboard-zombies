// ─── GAME LOOP ──────────────────────────────────
var lastTime=0;
function gameLoop(timestamp){
  if(!running) return;
  var dt=Math.min(0.05,(timestamp-lastTime)/1000);
  lastTime=timestamp;frameCount++;

  X.clearRect(0,0,C.width,C.height);
  drawAROverlay();

  if(!gameOver){
    updateYaw();

    // Spawn
    if(timestamp-lastSpawn>spawnInterval){
      spawnZombie();
      if(wave>3&&Math.random()<0.3) spawnZombie();
      if(wave>6&&Math.random()<0.2) spawnZombie();
      lastSpawn=timestamp;
    }

    // Update zombies
    for(var i=zombies.length-1;i>=0;i--){
      var z=zombies[i];
      z.dist-=z.speed*dt;
      z.worldAngle+=Math.sin(z.wobble*0.5)*0.08;
      z.wobble+=z.wobbleSpeed;
      if(z.hitTimer>0) z.hitTimer-=dt;

      // Project to screen
      var relYaw=angleDiff(z.worldAngle,camYaw-yawOffset);
      var sx=relYaw/(CAM_FOV_H/2);

      if(Math.abs(sx)>1.4){
        z.onScreen=false;
      } else {
        z.onScreen=Math.abs(sx)<=1.1;
        z.x=C.width/2+sx*(C.width/2);
        z.y=getZombieFeetY(z.dist);
      }

      // Reached player
      if(z.dist<=0.8){
        hp--;sfxHit();damageFlash=12;
        if(z.onScreen) spawnParticles(z.x,z.y-40,'#ff0000',8);
        zombies.splice(i,1);
        if(navigator.vibrate) navigator.vibrate([100,50,150]);
        if(hp<=0){gameOver=true;screenFlash=15;setTimeout(endGame,800);}
        continue;
      }
    }
  }

  // Sort far first
  zombies.sort(function(a,b){return b.dist-a.dist;});
  for(var i=0;i<zombies.length;i++) drawZombie(zombies[i]);
  drawParticles();

  if(damageFlash>0){
    X.fillStyle='rgba(255,0,0,'+(damageFlash*0.04)+')';
    X.fillRect(0,0,C.width,C.height);damageFlash--;
  }
  if(screenFlash>0){
    X.fillStyle='rgba(100,255,100,'+(screenFlash*0.03)+')';
    X.fillRect(0,0,C.width,C.height);screenFlash--;
  }

  if(!gameOver){
    drawHUD();

    // DEBUG: show last tap
    if(tapFired){
      X.fillStyle='rgba(255,255,0,0.6)';
      X.beginPath();X.arc(lastTapX,lastTapY,8,0,Math.PI*2);X.fill();
      X.strokeStyle='#ffff00';X.lineWidth=2;
      X.beginPath();X.arc(lastTapX,lastTapY,15,0,Math.PI*2);X.stroke();
    }
  }
  requestAnimationFrame(gameLoop);
}

// ─── START / END ────────────────────────────────
function startGame(){
  try{
    initAudio();
    if(audioCtx&&audioCtx.state==='suspended') audioCtx.resume();
    score=0;kills=0;wave=1;hp=MAX_HP;
    waveKills=0;waveTarget=5;
    spawnInterval=SPAWN_INTERVAL_START;
    zombies=[];particles=[];
    frameCount=0;lastSpawn=0;lastTime=0;
    gameOver=false;screenFlash=0;damageFlash=0;tapFired=false;
    yawOffset=rawYaw;camYaw=rawYaw;
    resize();
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('endScreen').classList.add('hidden');
    C.style.pointerEvents='auto';
    running=true;
    requestAnimationFrame(gameLoop);
  }catch(err){alert('Error: '+err.message);}
}

function endGame(){
  running=false;
  if(score>highScore){highScore=score;localStorage.setItem('bb_zombie_hi',highScore.toString());}
  document.getElementById('finalScore').textContent=kills;
  document.getElementById('highDisp').textContent='BEST: '+highScore+' PTS';
  document.getElementById('statsDisp').textContent='Wave '+wave+' | '+score+' points';
  document.getElementById('endTitle').textContent=wave>5?'VALIANT EFFORT!':'YOU DIED!';
  document.getElementById('endScreen').classList.remove('hidden');
}

// ─── BUTTONS ────────────────────────────────────
function onStartTap(e){
  if(e) e.preventDefault();
  initAudio();
  if(audioCtx&&audioCtx.state==='suspended') audioCtx.resume();
  initCamera();
  initGyro();
  startGame();
}

function onRestartTap(e){
  if(e) e.preventDefault();
  startGame();
}

document.getElementById('startBtn').onclick=onStartTap;
document.getElementById('restartBtn').onclick=onRestartTap;
