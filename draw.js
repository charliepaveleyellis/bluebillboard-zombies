// ─── DRAW ZOMBIE ────────────────────────────────
function drawZombie(z){
  if(!z.onScreen) return;
  var h=getZombieHeight(z.dist);
  var w=h*0.4;
  if(h<6) return;
  var s=h/C.height;
  var big=z.isBig;

  var feetY=z.y;
  var wobX=Math.sin(z.wobble)*4*s*5;
  var wobY=Math.abs(Math.sin(z.wobble*2))*3*s*4; // bounce up on each step
  var lean=Math.sin(z.wobble*0.5)*0.06; // body lean side to side
  var cx=z.x+wobX;
  var bodyCenter=feetY-h*0.5-wobY;

  X.save();
  X.translate(cx,bodyCenter);
  X.rotate(lean);

  var distAlpha=Math.min(1,Math.max(0.15,s*2.5));
  X.globalAlpha=distAlpha;

  // Hit flash — whole body turns white
  if(z.hitTimer>0){
    var flash=Math.sin(z.hitTimer*25);
    if(flash>0) X.globalAlpha=distAlpha*0.4;
  }

  // ── GROUND SHADOW ──
  X.save();X.rotate(-lean); // shadow stays flat
  var sha=Math.min(0.6,0.2+s*0.8);
  var shadowGrad=X.createRadialGradient(0,h*0.5,0,0,h*0.5,w*0.9);
  shadowGrad.addColorStop(0,'rgba(0,0,0,'+sha+')');
  shadowGrad.addColorStop(1,'rgba(0,0,0,0)');
  X.fillStyle=shadowGrad;
  X.beginPath();X.ellipse(0,h*0.5+wobY,w*0.9,h*0.05+5,0,0,Math.PI*2);X.fill();
  X.restore();

  var legAnim=Math.sin(frameCount*0.1+z.armPhase);
  var armAnim=Math.sin(frameCount*0.1+z.armPhase+Math.PI);
  var breathe=Math.sin(frameCount*0.04+z.wobble)*0.02;

  // ── BACK LEG ──
  var backLeg=legAnim>0?-1:1;
  drawLeg(w,h,s,big,legAnim*12*s*backLeg,true);

  // ── BACK ARM ──
  drawArm(w,h,s,big,armAnim,backLeg>0?-1:1);

  // ── TORSO ──
  var torsoW=w*0.48+w*breathe;
  var torsoH=h*0.38;
  // Tattered clothing
  var torsoGrad=X.createLinearGradient(-torsoW,-torsoH*0.8,torsoW,torsoH);
  if(big){
    torsoGrad.addColorStop(0,'#1a2e1a');torsoGrad.addColorStop(0.5,'#0f1f0f');torsoGrad.addColorStop(1,'#1a2a1a');
  } else {
    torsoGrad.addColorStop(0,'#2a5030');torsoGrad.addColorStop(0.5,'#1e3a22');torsoGrad.addColorStop(1,'#2a4a2a');
  }
  X.fillStyle=torsoGrad;
  X.beginPath();
  X.moveTo(-torsoW,-torsoH*0.6);
  X.quadraticCurveTo(-torsoW*1.1,0,-torsoW*0.9,torsoH*0.5);
  X.lineTo(torsoW*0.9,torsoH*0.5);
  X.quadraticCurveTo(torsoW*1.1,0,torsoW,-torsoH*0.6);
  X.closePath();X.fill();

  // Torn shirt/rags
  X.fillStyle=big?'rgba(60,30,20,0.5)':'rgba(90,70,50,0.45)';
  X.beginPath();
  X.moveTo(-torsoW*0.8,-torsoH*0.5);
  X.lineTo(-torsoW*0.3,torsoH*0.1);
  X.lineTo(torsoW*0.2,-torsoH*0.2);
  X.lineTo(torsoW*0.7,-torsoH*0.5);
  X.closePath();X.fill();

  // Exposed ribs/wounds
  X.strokeStyle='rgba(120,20,20,0.6)';X.lineWidth=Math.max(1,2*s);
  for(var ri=0;ri<3;ri++){
    var ry=torsoH*(-0.1+ri*0.15);
    X.beginPath();
    X.moveTo(-torsoW*0.3,ry);
    X.quadraticCurveTo(0,ry-torsoH*0.05,torsoW*0.25,ry);
    X.stroke();
  }
  // Blood drips
  X.fillStyle='rgba(100,10,10,0.5)';
  X.beginPath();X.ellipse(torsoW*0.1,torsoH*0.2,w*0.06,h*0.04,0.3,0,Math.PI*2);X.fill();
  X.beginPath();X.ellipse(-torsoW*0.3,torsoH*0.1,w*0.04,h*0.06,-0.2,0,Math.PI*2);X.fill();

  // ── FRONT LEG ──
  drawLeg(w,h,s,big,legAnim*12*s*(backLeg*-1),false);

  // ── FRONT ARM ──
  drawArm(w,h,s,big,armAnim,backLeg>0?1:-1);

  // ── NECK ──
  var neckW=Math.max(2,w*0.18);
  X.fillStyle=big?'#1a3018':'#2a4a28';
  X.fillRect(-neckW,-torsoH*0.65-h*0.04,neckW*2,h*0.08);
  // Neck wound
  X.fillStyle='rgba(100,15,15,0.5)';
  X.beginPath();X.ellipse(neckW*0.5,-torsoH*0.65,neckW*0.6,h*0.015,0,0,Math.PI*2);X.fill();

  // ── HEAD ──
  var headR=w*0.4;
  var headY=-h*0.38;
  var headBob=Math.sin(frameCount*0.07+z.wobble)*headR*0.05;
  var headTilt=Math.sin(z.wobble*0.3)*0.15; // creepy head tilt

  X.save();
  X.translate(0,headY+headBob);
  X.rotate(headTilt);

  // Skull shape — not perfectly round, more angular
  X.fillStyle=big?'#1e3a1c':'#3a6035';
  X.beginPath();
  X.moveTo(0,-headR);
  X.quadraticCurveTo(headR*0.9,-headR*0.8,headR,-headR*0.1);
  X.quadraticCurveTo(headR*0.85,headR*0.6,headR*0.4,headR*0.9);
  X.lineTo(-headR*0.4,headR*0.9);
  X.quadraticCurveTo(-headR*0.85,headR*0.6,-headR,-headR*0.1);
  X.quadraticCurveTo(-headR*0.9,-headR*0.8,0,-headR);
  X.fill();

  // Rotting patches
  X.fillStyle=big?'rgba(10,25,10,0.5)':'rgba(20,40,15,0.4)';
  X.beginPath();X.ellipse(-headR*0.3,-headR*0.3,headR*0.25,headR*0.2,0.3,0,Math.PI*2);X.fill();
  X.beginPath();X.ellipse(headR*0.4,headR*0.1,headR*0.15,headR*0.2,-0.2,0,Math.PI*2);X.fill();

  // Sunken eye sockets
  X.fillStyle='#0a0a0a';
  X.beginPath();X.ellipse(-headR*0.32,-headR*0.15,headR*0.22,headR*0.18,0.1,0,Math.PI*2);X.fill();
  X.beginPath();X.ellipse(headR*0.32,-headR*0.15,headR*0.22,headR*0.18,-0.1,0,Math.PI*2);X.fill();

  // Glowing eyes — pulsing
  var eyePulse=0.5+Math.sin(frameCount*0.12+z.wobble)*0.4;
  var eyeR=Math.max(1.5,headR*0.13);
  X.shadowColor='rgba(255,30,0,'+eyePulse+')';X.shadowBlur=Math.max(6,15*s);
  X.fillStyle='rgba(255,40,0,'+eyePulse+')';
  X.beginPath();X.arc(-headR*0.32,-headR*0.15,eyeR,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(headR*0.32,-headR*0.15,eyeR,0,Math.PI*2);X.fill();
  // Bright eye center
  X.fillStyle='rgba(255,200,50,'+(eyePulse*0.8)+')';
  X.beginPath();X.arc(-headR*0.32,-headR*0.15,eyeR*0.4,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(headR*0.32,-headR*0.15,eyeR*0.4,0,Math.PI*2);X.fill();
  X.shadowBlur=0;X.shadowColor='transparent';

  // Nose — just a hole
  X.fillStyle='#1a1a0a';
  X.beginPath();
  X.moveTo(-headR*0.08,headR*0.1);
  X.lineTo(headR*0.08,headR*0.1);
  X.lineTo(0,headR*0.25);
  X.closePath();X.fill();

  // Mouth — gaping, jagged
  var mouthOpen=0.5+Math.sin(frameCount*0.05+z.armPhase)*0.3;
  X.fillStyle='#0a0505';
  X.beginPath();
  X.ellipse(0,headR*0.5,headR*0.4,headR*0.2*mouthOpen,0,0,Math.PI*2);
  X.fill();
  // Gums
  X.fillStyle='rgba(80,20,20,0.7)';
  X.beginPath();
  X.ellipse(0,headR*0.45,headR*0.35,headR*0.12*mouthOpen,0,Math.PI,Math.PI*2);
  X.fill();
  // Teeth — irregular, broken
  X.fillStyle='#c8c090';
  var teeth=[
    {x:-0.3,h:0.15,w:0.08},{x:-0.15,h:0.2,w:0.07},{x:-0.02,h:0.12,w:0.06},
    {x:0.12,h:0.18,w:0.09},{x:0.25,h:0.1,w:0.07}
  ];
  for(var ti=0;ti<teeth.length;ti++){
    var tt=teeth[ti];
    var tw=headR*tt.w,th=headR*tt.h*mouthOpen;
    X.fillRect(headR*tt.x-tw/2,headR*0.38,tw,th);
  }
  // Bottom teeth
  X.fillStyle='#b0a878';
  X.fillRect(-headR*0.15,headR*0.55,headR*0.08,headR*-0.08*mouthOpen);
  X.fillRect(headR*0.08,headR*0.55,headR*0.1,headR*-0.1*mouthOpen);

  // Hair — stringy remnants
  X.strokeStyle=big?'#0a1a0a':'#1a2a1a';X.lineWidth=Math.max(1,2*s);
  for(var hi=0;hi<4;hi++){
    var hx=-headR*0.6+hi*headR*0.4;
    var hWave=Math.sin(frameCount*0.03+hi*2+z.wobble)*headR*0.15;
    X.beginPath();
    X.moveTo(hx,-headR*0.9);
    X.quadraticCurveTo(hx+hWave,-headR*0.4,hx+hWave*1.5,-headR*0.1);
    X.stroke();
  }

  X.restore(); // end head transform

  // ── HIT FLASH OVERLAY ──
  if(z.hitTimer>0&&Math.sin(z.hitTimer*25)>0){
    X.globalAlpha=0.5;X.fillStyle='#fff';
    X.beginPath();X.ellipse(0,0,w*0.5,h*0.45,0,0,Math.PI*2);X.fill();
  }

  // ── HP BAR ──
  if(z.maxHp>1){
    X.globalAlpha=distAlpha;
    var bw=w*1.2,bh=Math.max(3,5*s),by=-h*0.52-Math.max(6,10*s);
    X.fillStyle='rgba(0,0,0,0.6)';
    X.fillRect(-bw/2-1,by-1,bw+2,bh+2);
    X.fillStyle='#222';
    X.fillRect(-bw/2,by,bw,bh);
    var hpPct=z.hp/z.maxHp;
    X.fillStyle=hpPct>0.6?'#44dd44':hpPct>0.3?'#ddaa00':'#dd3333';
    X.fillRect(-bw/2,by,bw*hpPct,bh);
  }

  X.globalAlpha=1;X.restore();
}

// ── HELPER: Draw leg ──
function drawLeg(w,h,s,big,anim,isBack){
  var legX=(isBack?-1:1)*w*0.15;
  var kneeX=legX+anim*0.6;
  var footX=legX+anim;
  var hipY=h*0.15;
  var kneeY=h*0.33;
  var footY=h*0.48;
  var alpha=isBack?0.7:1;

  X.globalAlpha*=alpha;

  // Thigh
  X.strokeStyle=big?'#1a2e18':'#2a4a28';X.lineWidth=Math.max(3,9*s);X.lineCap='round';
  X.beginPath();X.moveTo(legX,hipY);X.lineTo(kneeX,kneeY);X.stroke();
  // Shin — thinner
  X.lineWidth=Math.max(2,7*s);
  X.beginPath();X.moveTo(kneeX,kneeY);X.lineTo(footX,footY);X.stroke();
  // Knee joint
  X.fillStyle=big?'#1a2a18':'#2a4228';
  X.beginPath();X.arc(kneeX,kneeY,Math.max(2,4*s),0,Math.PI*2);X.fill();
  // Foot — chunky
  X.fillStyle='#1a1a18';
  X.beginPath();X.ellipse(footX+Math.max(1,3*s),footY,Math.max(3,w*0.12),Math.max(2,h*0.025),0,0,Math.PI*2);X.fill();

  X.globalAlpha/=alpha;
}

// ── HELPER: Draw arm ──
function drawArm(w,h,s,big,anim,side){
  var shoulderX=side*w*0.45;
  var shoulderY=-h*0.2;
  var elbowX=shoulderX+side*w*0.2+anim*8*s;
  var elbowY=shoulderY+h*0.15+Math.abs(anim)*5*s;
  var handX=elbowX+side*w*0.1+anim*6*s;
  var handY=elbowY+h*0.12-anim*4*s;

  // Upper arm
  X.strokeStyle=big?'#1a2e18':'#2a4a28';X.lineWidth=Math.max(2,6*s);X.lineCap='round';
  X.beginPath();X.moveTo(shoulderX,shoulderY);X.lineTo(elbowX,elbowY);X.stroke();
  // Forearm — exposed bone color peek
  X.strokeStyle=big?'#1a2a15':'#2a4525';X.lineWidth=Math.max(2,5*s);
  X.beginPath();X.moveTo(elbowX,elbowY);X.lineTo(handX,handY);X.stroke();
  // Elbow
  X.fillStyle=big?'#152a15':'#254225';
  X.beginPath();X.arc(elbowX,elbowY,Math.max(1.5,3*s),0,Math.PI*2);X.fill();
  // Hand — clawed fingers
  X.fillStyle=big?'#1a3018':'#2a4a28';
  X.beginPath();X.arc(handX,handY,Math.max(2,4*s),0,Math.PI*2);X.fill();
  // Fingers/claws
  X.strokeStyle=big?'#1a2a15':'#2a4020';X.lineWidth=Math.max(1,2*s);
  for(var fi=0;fi<3;fi++){
    var fa=(fi-1)*0.4+anim*0.3;
    X.beginPath();
    X.moveTo(handX,handY);
    X.lineTo(handX+Math.cos(fa)*Math.max(3,7*s)*side,handY+Math.sin(fa)*Math.max(3,7*s));
    X.stroke();
  }
}

// ─── PARTICLES ──────────────────────────────────
function spawnParticles(x,y,color,count){
  for(var i=0;i<count;i++){
    var a=(i/count)*Math.PI*2+Math.random()*0.8;
    var spd=2+Math.random()*6;
    particles.push({
      x:x,y:y,
      vx:Math.cos(a)*spd,vy:Math.sin(a)*spd-3,
      life:15+Math.random()*15,maxLife:30,
      size:1.5+Math.random()*5,
      color:color,
      rot:Math.random()*Math.PI*2,
      rotSpd:(Math.random()-0.5)*0.3
    });
  }
}
function drawParticles(){
  for(var i=particles.length-1;i>=0;i--){
    var p=particles[i];
    p.x+=p.vx;p.y+=p.vy;p.vy+=0.12;p.vx*=0.98;
    p.life--;p.rot+=p.rotSpd;
    if(p.life<=0){particles.splice(i,1);continue;}
    var t=p.life/p.maxLife;
    X.globalAlpha=t;X.fillStyle=p.color;
    X.save();X.translate(p.x,p.y);X.rotate(p.rot);
    var sz=p.size*(0.5+t*0.5);
    X.fillRect(-sz/2,-sz/2,sz,sz);
    X.restore();
  }
  X.globalAlpha=1;
}

// ─── HUD ────────────────────────────────────────
function drawHUD(){
  // Top bar — gradient
  var hbg=X.createLinearGradient(0,0,0,80);
  hbg.addColorStop(0,'rgba(0,0,0,0.8)');hbg.addColorStop(1,'rgba(0,0,0,0)');
  X.fillStyle=hbg;X.fillRect(0,0,C.width,80);

  // Neon line
  X.fillStyle='rgba(255,50,50,0.4)';X.fillRect(0,0,C.width,2);

  // Mode
  X.fillStyle=useWebXR?'#33ff33':'#ff6644';X.font='bold 10px Courier New';X.textAlign='center';
  X.fillText(useWebXR?'[ REAL AR ]':'[ CAMERA ]',C.width/2,14);

  // Score — big neon
  X.shadowColor='rgba(255,50,50,0.5)';X.shadowBlur=10;
  X.fillStyle='#fff';X.font='bold 36px Courier New';X.textAlign='center';
  X.fillText(score,C.width/2,46);
  X.shadowBlur=0;X.shadowColor='transparent';

  // High score
  X.fillStyle='#ffdd00';X.font='10px Courier New';
  X.fillText('HI '+Math.max(highScore,score),C.width/2,60);

  // Wave — left
  X.fillStyle='#ff6644';X.font='bold 16px Courier New';X.textAlign='left';
  X.fillText('W'+wave,16,28);
  // Kills
  X.fillStyle='#ff4444';X.font='bold 12px Courier New';
  X.fillText(kills+' KILLS',16,46);

  // Hearts — right, bigger
  X.textAlign='right';
  var heartX=C.width-16;
  for(var i=MAX_HP-1;i>=0;i--){
    X.font='24px serif';
    if(i<hp){
      X.shadowColor='rgba(255,0,0,0.5)';X.shadowBlur=6;
      X.fillStyle='#ff3333';
      X.fillText('\u2764',heartX,36);
    } else {
      X.shadowBlur=0;X.shadowColor='transparent';
      X.fillStyle='#440000';
      X.fillText('\u2764',heartX,36);
    }
    heartX-=28;
  }
  X.shadowBlur=0;X.shadowColor='transparent';

  // Wave progress — neon bar
  var progW=C.width-32;
  var prog=Math.min(waveKills/waveTarget,1);
  X.fillStyle='rgba(255,50,50,0.1)';X.fillRect(16,66,progW,4);
  var progGrad=X.createLinearGradient(16,0,16+progW*prog,0);
  progGrad.addColorStop(0,'#ff3333');progGrad.addColorStop(1,'#ff8800');
  X.fillStyle=progGrad;X.fillRect(16,66,progW*prog,4);
  // Glow on progress bar
  if(prog>0){
    X.shadowColor='#ff5500';X.shadowBlur=8;
    X.fillRect(16+progW*prog-4,65,4,6);
    X.shadowBlur=0;X.shadowColor='transparent';
  }

  // ── RADAR — larger, more detailed ──
  var rR=38,rX=C.width/2,rY=C.height-rR-24;

  // Radar background
  X.globalAlpha=0.6;
  var radarGrad=X.createRadialGradient(rX,rY,0,rX,rY,rR);
  radarGrad.addColorStop(0,'rgba(20,0,0,0.7)');radarGrad.addColorStop(1,'rgba(0,0,0,0.4)');
  X.fillStyle=radarGrad;
  X.beginPath();X.arc(rX,rY,rR,0,Math.PI*2);X.fill();

  // Rings
  X.strokeStyle='rgba(255,50,50,0.3)';X.lineWidth=1;
  X.beginPath();X.arc(rX,rY,rR,0,Math.PI*2);X.stroke();
  X.beginPath();X.arc(rX,rY,rR*0.6,0,Math.PI*2);X.stroke();
  X.beginPath();X.arc(rX,rY,rR*0.3,0,Math.PI*2);X.stroke();

  // Sweep line — rotating
  var sweepAngle=frameCount*0.03;
  X.strokeStyle='rgba(255,80,50,0.2)';X.lineWidth=2;
  X.beginPath();X.moveTo(rX,rY);
  X.lineTo(rX+Math.sin(sweepAngle)*rR,rY-Math.cos(sweepAngle)*rR);
  X.stroke();

  // Cross
  X.strokeStyle='rgba(255,50,50,0.15)';X.lineWidth=1;
  X.beginPath();X.moveTo(rX-rR,rY);X.lineTo(rX+rR,rY);X.stroke();
  X.beginPath();X.moveTo(rX,rY-rR);X.lineTo(rX,rY+rR);X.stroke();

  // Player dot
  X.fillStyle='#00ff88';X.globalAlpha=1;
  X.beginPath();X.arc(rX,rY,3,0,Math.PI*2);X.fill();

  // FOV cone — filled
  var fovR=CAM_FOV_H/2*Math.PI/180;
  X.fillStyle='rgba(255,255,255,0.04)';
  X.beginPath();X.moveTo(rX,rY);
  X.arc(rX,rY,rR,-Math.PI/2-fovR,-Math.PI/2+fovR);
  X.closePath();X.fill();
  X.strokeStyle='rgba(255,255,255,0.2)';X.lineWidth=1;
  X.beginPath();X.moveTo(rX,rY);X.lineTo(rX+Math.sin(-fovR)*rR,rY-Math.cos(-fovR)*rR);X.stroke();
  X.beginPath();X.moveTo(rX,rY);X.lineTo(rX+Math.sin(fovR)*rR,rY-Math.cos(fovR)*rR);X.stroke();

  // Zombie dots — pulsing
  for(var i=0;i<zombies.length;i++){
    var rz=zombies[i];
    var relA=angleDiff(rz.worldAngle,camYaw-yawOffset)*Math.PI/180;
    var rd=Math.min(1,rz.dist/10);
    var pulse=0.6+Math.sin(frameCount*0.1+i)*0.4;
    X.globalAlpha=pulse;
    X.fillStyle=rz.isBig?'#ff0000':'#ff4444';
    var dotR=rz.isBig?4:2.5;
    X.shadowColor='#ff0000';X.shadowBlur=4;
    X.beginPath();X.arc(rX+Math.sin(relA)*rR*rd,rY-Math.cos(relA)*rR*rd,dotR,0,Math.PI*2);X.fill();
  }
  X.shadowBlur=0;X.shadowColor='transparent';
  X.globalAlpha=1;

  // ── WARNING ARROWS — animated ──
  for(var i=0;i<zombies.length;i++){
    var az=zombies[i];
    if(az.onScreen||az.dist>8) continue;
    var relA2=angleDiff(az.worldAngle,camYaw-yawOffset);
    if(Math.abs(relA2)<CAM_FOV_H/2) continue;
    var urg=Math.min(1,(4-az.dist)/4);
    if(urg<0) continue;

    var arrSide=relA2>0?1:-1;
    var arrX=arrSide>0?C.width-35:35;
    var arrY=C.height/2;
    var arrBounce=Math.sin(frameCount*0.15)*5*urg;

    X.globalAlpha=0.5+urg*0.5;
    X.shadowColor='#ff3333';X.shadowBlur=8*urg;

    // Arrow shape
    X.fillStyle='#ff3333';
    X.beginPath();
    X.moveTo(arrX+arrSide*15+arrBounce*arrSide,arrY);
    X.lineTo(arrX-arrSide*5,arrY-12);
    X.lineTo(arrX-arrSide*5,arrY+12);
    X.closePath();X.fill();

    // Distance text
    X.shadowBlur=0;
    X.fillStyle='#ff6644';X.font='bold 11px Courier New';X.textAlign='center';
    X.fillText(Math.round(az.dist)+'m',arrX,arrY+24);
    X.globalAlpha=1;
  }
  X.shadowBlur=0;X.shadowColor='transparent';
}

// ─── AR OVERLAY ─────────────────────────────────
function drawAROverlay(){
  // Subtle dark tint
  X.globalAlpha=0.12;X.fillStyle='#0a0005';
  X.fillRect(0,0,C.width,C.height);X.globalAlpha=1;

  // Vignette — stronger
  var vg=X.createRadialGradient(C.width/2,C.height/2,C.width*0.25,C.width/2,C.height/2,C.width*0.75);
  vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,0.4)');
  X.fillStyle=vg;X.fillRect(0,0,C.width,C.height);

  // Crosshair — more detailed
  var cx2=C.width/2,cy2=C.height/2;
  X.strokeStyle='rgba(255,50,50,0.15)';X.lineWidth=1;
  // Outer circle
  X.beginPath();X.arc(cx2,cy2,22,0,Math.PI*2);X.stroke();
  // Inner dot
  X.fillStyle='rgba(255,50,50,0.2)';
  X.beginPath();X.arc(cx2,cy2,2,0,Math.PI*2);X.fill();
  // Cross lines — with gaps
  X.beginPath();X.moveTo(cx2-30,cy2);X.lineTo(cx2-8,cy2);X.stroke();
  X.beginPath();X.moveTo(cx2+8,cy2);X.lineTo(cx2+30,cy2);X.stroke();
  X.beginPath();X.moveTo(cx2,cy2-30);X.lineTo(cx2,cy2-8);X.stroke();
  X.beginPath();X.moveTo(cx2,cy2+8);X.lineTo(cx2,cy2+30);X.stroke();
}
