// ─── GAME LOOP ──────────────────────────────────
var lastTime=0;
function gameLoop(timestamp){
  if(!running) return;
  var dt=Math.min(0.05,(timestamp-lastTime)/1000);
  lastTime=timestamp;frameCount++;

  // Screen shake decay
  screenShakeX*=0.85;screenShakeY*=0.85;

  X.save();
  X.translate(screenShakeX,screenShakeY);

  X.clearRect(-10,-10,C.width+20,C.height+20);
  drawAROverlay();

  // Draw blood splats on ground (persistent)
  drawBloodSplats();

  if(!gameOver){
    updateYaw();

    // Combo timer
    if(comboTimer>0){comboTimer-=dt;if(comboTimer<=0)combo=0;}

    // Muzzle flash decay
    if(muzzleFlash>0) muzzleFlash--;

    // Random zombie moans
    if(frameCount-lastMoan>120+Math.random()*200){
      lastMoan=frameCount;
      if(zombies.length>0) sfxMoan();
    }

    // Spawn
    if(timestamp-lastSpawn>spawnInterval){
      spawnZombie();
      if(wave>2&&Math.random()<0.35) spawnZombie();
      if(wave>5&&Math.random()<0.25) spawnZombie();
      if(wave>8&&Math.random()<0.15) spawnZombie();
      lastSpawn=timestamp;
    }

    // Update zombies
    for(var i=zombies.length-1;i>=0;i--){
      var z=zombies[i];
      z.dist-=z.speed*dt*(1+wave*0.03);
      z.worldAngle+=Math.sin(z.wobble*0.5)*0.08;
      z.wobble+=z.wobbleSpeed;
      if(z.hitTimer>0) z.hitTimer-=dt;

      // Moan
      z.moanTimer-=1;
      if(z.moanTimer<=0&&z.dist<5&&Math.random()<0.02){
        sfxMoan();z.moanTimer=200+Math.random()*300;
      }

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
        hp--;sfxHit();damageFlash=15;
        screenShakeX=(Math.random()-0.5)*20;
        screenShakeY=(Math.random()-0.5)*15;
        combo=0;comboTimer=0;
        if(z.onScreen){
          spawnParticles(z.x,z.y-40,'#ff0000',12);
          spawnParticles(z.x,z.y-40,'#880000',8);
        }
        zombies.splice(i,1);
        if(navigator.vibrate) navigator.vibrate([100,50,150]);
        if(hp<=0){gameOver=true;screenFlash=20;setTimeout(endGame,1200);}
        continue;
      }
    }
  }

  // Sort far first
  zombies.sort(function(a,b){return b.dist-a.dist;});
  for(var i=0;i<zombies.length;i++) drawZombie(zombies[i]);
  drawParticles();

  // Damage flash — red pulse
  if(damageFlash>0){
    var df=damageFlash/15;
    X.fillStyle='rgba(180,0,0,'+df*0.5+')';
    X.fillRect(-10,-10,C.width+20,C.height+20);
    // Blood drip edges
    X.fillStyle='rgba(100,0,0,'+df*0.3+')';
    X.fillRect(-10,-10,C.width+20,30*df);
    X.fillRect(-10,C.height-20*df,C.width+20,30*df);
    damageFlash--;
  }

  // Wave complete flash — green
  if(screenFlash>0){
    var sf=screenFlash/20;
    X.fillStyle='rgba(50,255,50,'+sf*0.15+')';
    X.fillRect(-10,-10,C.width+20,C.height+20);
    screenFlash--;
  }

  // Muzzle flash
  if(muzzleFlash>0){
    X.globalAlpha=muzzleFlash/5;
    X.fillStyle='#ffaa00';
    X.beginPath();X.arc(C.width/2,C.height-60,15+muzzleFlash*3,0,Math.PI*2);X.fill();
    X.fillStyle='#fff';
    X.beginPath();X.arc(C.width/2,C.height-60,5+muzzleFlash,0,Math.PI*2);X.fill();
    X.globalAlpha=1;
  }

  // Combo display
  if(combo>=3&&comboTimer>0){
    X.globalAlpha=Math.min(1,comboTimer*2);
    X.shadowColor='#ff4400';X.shadowBlur=15;
    X.fillStyle='#ff6600';X.font='bold 40px Courier New';X.textAlign='center';
    X.fillText(combo+'x COMBO!',C.width/2,C.height*0.35);
    if(combo>=5){
      X.fillStyle='#ffdd00';X.font='bold 18px Courier New';
      X.fillText(combo>=10?'UNSTOPPABLE!':combo>=7?'RAMPAGE!':'ON FIRE!',C.width/2,C.height*0.35+35);
    }
    X.shadowBlur=0;X.shadowColor='transparent';X.globalAlpha=1;
  }

  if(!gameOver){
    drawHUD();

    // Debug: show last tap
    if(tapFired){
      X.fillStyle='rgba(255,255,0,0.5)';
      X.beginPath();X.arc(lastTapX,lastTapY,6,0,Math.PI*2);X.fill();
    }
  }

  X.restore(); // end screen shake

  requestAnimationFrame(gameLoop);
}

// ─── BLOOD SPLATS (persistent on ground) ────────
function drawBloodSplats(){
  for(var i=bloodSplats.length-1;i>=0;i--){
    var b=bloodSplats[i];
    b.life-=0.003;
    if(b.life<=0){bloodSplats.splice(i,1);continue;}
    X.globalAlpha=b.life*0.4;
    X.fillStyle=b.color;
    X.beginPath();X.ellipse(b.x,b.y,b.w,b.h,b.rot,0,Math.PI*2);X.fill();
  }
  X.globalAlpha=1;
}

// ─── START / END ────────────────────────────────
function startGame(){
  try{
    initAudio();
    if(audioCtx&&audioCtx.state==='suspended') audioCtx.resume();
    score=0;kills=0;wave=1;hp=MAX_HP;
    waveKills=0;waveTarget=5;
    spawnInterval=SPAWN_INTERVAL_START;
    zombies=[];particles=[];bloodSplats=[];
    frameCount=0;lastSpawn=0;lastTime=0;lastMoan=0;
    gameOver=false;screenFlash=0;damageFlash=0;
    screenShakeX=0;screenShakeY=0;
    combo=0;comboTimer=0;muzzleFlash=0;tapFired=false;
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
  document.getElementById('statsDisp').textContent='Wave '+wave+' | '+score+' pts | '+combo+' best combo';
  document.getElementById('endTitle').textContent=wave>8?'LEGENDARY!':wave>5?'VALIANT EFFORT!':'YOU DIED!';
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
