// ─── DRAW ZOMBIE ────────────────────────────────
function drawZombie(z){
  if(!z.onScreen) return;
  var h=getZombieHeight(z.dist);
  var w=h*0.35;
  if(h<8) return;
  var s=h/C.height;

  var feetY=z.y;
  var wobX=Math.sin(z.wobble)*3*s*4;
  var wobY=Math.cos(z.wobble*0.7)*2*s*4;
  var cx=z.x+wobX;
  var bodyCenter=feetY-h*0.5+wobY;

  X.save();
  X.translate(cx,bodyCenter);

  var distAlpha=Math.min(1,Math.max(0.2,s*2));
  X.globalAlpha=distAlpha;
  if(z.hitTimer>0) X.globalAlpha=distAlpha*(0.5+Math.sin(z.hitTimer*20)*0.5);

  // Ground shadow
  var sha=Math.min(0.5,0.15+s);
  X.fillStyle='rgba(0,0,0,'+sha+')';
  X.beginPath();X.ellipse(0,h*0.5,w*0.7,h*0.04+4,0,0,Math.PI*2);X.fill();
  X.fillStyle='rgba(0,0,0,'+sha*0.3+')';
  X.beginPath();X.ellipse(0,h*0.5,w*1.0,h*0.06+6,0,0,Math.PI*2);X.fill();

  var legAnim=Math.sin(frameCount*0.08+z.armPhase)*14*s;
  var big=z.isBig;

  // Legs
  X.strokeStyle=big?'#2a4a2a':'#3a5a3a';X.lineWidth=Math.max(2,7*s);X.lineCap='round';
  X.beginPath();X.moveTo(-w*0.2,h*0.2);X.lineTo(-w*0.2+legAnim,h*0.48);X.stroke();
  X.beginPath();X.moveTo(w*0.2,h*0.2);X.lineTo(w*0.2-legAnim,h*0.48);X.stroke();
  X.fillStyle='#2a3a2a';
  X.beginPath();X.ellipse(-w*0.2+legAnim,h*0.49,w*0.15,h*0.03,0,0,Math.PI*2);X.fill();
  X.beginPath();X.ellipse(w*0.2-legAnim,h*0.49,w*0.15,h*0.03,0,0,Math.PI*2);X.fill();

  // Body
  var bg=X.createLinearGradient(0,-h*0.4,0,h*0.3);
  bg.addColorStop(0,big?'#1a3a1a':'#3a6a3a');bg.addColorStop(1,big?'#0a2a0a':'#2a4a2a');
  X.fillStyle=bg;
  X.beginPath();X.ellipse(0,0,w*0.42,h*0.36,0,0,Math.PI*2);X.fill();

  // Shirt
  X.fillStyle=big?'rgba(80,40,40,0.6)':'rgba(100,80,60,0.5)';
  X.beginPath();X.ellipse(0,-h*0.05,w*0.35,h*0.2,0,0,Math.PI);X.fill();

  // Wounds
  X.strokeStyle='rgba(150,30,30,0.5)';X.lineWidth=Math.max(1,1.5*s);
  X.beginPath();X.moveTo(-w*0.15,h*0.05);X.lineTo(w*0.15,h*0.05);X.stroke();

  // Arms
  var armAnim=Math.sin(frameCount*0.06+z.armPhase)*16*s;
  X.strokeStyle=big?'#1a3a1a':'#3a6a3a';X.lineWidth=Math.max(2,6*s);X.lineCap='round';
  X.beginPath();X.moveTo(-w*0.38,-h*0.15);
  X.quadraticCurveTo(-w*0.6+armAnim,-h*0.3-armAnim*0.5,-w*0.5+armAnim*0.5,-h*0.45);X.stroke();
  X.beginPath();X.moveTo(w*0.38,-h*0.15);
  X.quadraticCurveTo(w*0.6-armAnim,-h*0.3+armAnim*0.5,w*0.5-armAnim*0.5,-h*0.45);X.stroke();
  X.fillStyle='#4a7a4a';
  X.beginPath();X.arc(-w*0.5+armAnim*0.5,-h*0.45,Math.max(2,4.5*s),0,Math.PI*2);X.fill();
  X.beginPath();X.arc(w*0.5-armAnim*0.5,-h*0.45,Math.max(2,4.5*s),0,Math.PI*2);X.fill();

  // Head
  var headR=w*0.36;
  var headY=-h*0.36;
  X.fillStyle=big?'#1a3a1a':'#3a6a3a';
  X.fillRect(-Math.max(2,5*s),headY+headR*0.6,Math.max(4,10*s),Math.max(4,9*s));
  X.fillStyle=big?'#2a4a2a':'#4a7a4a';
  X.beginPath();X.arc(0,headY,headR,0,Math.PI*2);X.fill();

  // Cheeks
  X.fillStyle='rgba(20,40,20,0.5)';
  X.beginPath();X.ellipse(-headR*0.4,headY+headR*0.2,headR*0.2,headR*0.3,0,0,Math.PI*2);X.fill();
  X.beginPath();X.ellipse(headR*0.4,headY+headR*0.2,headR*0.2,headR*0.3,0,0,Math.PI*2);X.fill();

  // Eyes
  var eg=0.6+Math.sin(frameCount*0.1+z.wobble)*0.3;
  X.shadowColor='rgba(255,50,0,'+eg+')';X.shadowBlur=Math.max(4,10*s);
  X.fillStyle='rgba(255,50,0,'+eg+')';
  X.beginPath();X.arc(-headR*0.3,headY-headR*0.1,Math.max(1.5,3.5*s),0,Math.PI*2);X.fill();
  X.beginPath();X.arc(headR*0.3,headY-headR*0.1,Math.max(1.5,3.5*s),0,Math.PI*2);X.fill();
  X.shadowBlur=0;X.shadowColor='transparent';

  // Mouth
  X.fillStyle='#1a0a0a';
  X.beginPath();X.ellipse(0,headY+headR*0.5,headR*0.35,headR*0.2,0,0,Math.PI*2);X.fill();
  X.fillStyle='#cccc99';
  for(var t=0;t<5;t++){
    var tx2=-headR*0.25+t*(headR*0.5/4);
    X.fillRect(tx2-Math.max(0.5,1.5*s),headY+headR*0.4,Math.max(1,3*s),(t%2===0)?headR*0.12:headR*0.08);
  }

  // HP bar
  if(z.maxHp>1){
    var bw=w*0.8,bh=Math.max(2,4*s),by=-h*0.5-Math.max(4,8*s);
    X.fillStyle='rgba(0,0,0,0.5)';X.fillRect(-bw/2,by,bw,bh);
    X.fillStyle=z.hp/z.maxHp>0.5?'#44ff44':'#ff4444';
    X.fillRect(-bw/2,by,bw*(z.hp/z.maxHp),bh);
  }

  X.globalAlpha=1;X.restore();
}

// ─── PARTICLES ──────────────────────────────────
function spawnParticles(x,y,color,count){
  for(var i=0;i<count;i++){
    var a=(i/count)*Math.PI*2+Math.random()*0.5;
    particles.push({x:x,y:y,vx:Math.cos(a)*(3+Math.random()*5),
      vy:Math.sin(a)*(3+Math.random()*5)-2,
      life:12+Math.random()*10,maxLife:22,size:2+Math.random()*4,color:color});
  }
}
function drawParticles(){
  for(var i=particles.length-1;i>=0;i--){
    var p=particles[i];
    p.x+=p.vx;p.y+=p.vy;p.vy+=0.15;p.life--;
    if(p.life<=0){particles.splice(i,1);continue;}
    X.globalAlpha=p.life/p.maxLife;X.fillStyle=p.color;
    X.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
  }
  X.globalAlpha=1;
}

// ─── HUD ────────────────────────────────────────
function drawHUD(){
  X.fillStyle='rgba(0,0,0,0.7)';X.fillRect(0,0,C.width,75);
  X.fillStyle='rgba(255,50,50,0.3)';X.fillRect(0,73,C.width,2);

  // Mode
  X.fillStyle=useWebXR?'#33ff33':'#ff6644';X.font='bold 10px Courier New';X.textAlign='center';
  X.fillText(useWebXR?'REAL AR MODE':'CAMERA MODE',C.width/2,14);

  // Score
  X.fillStyle='#fff';X.font='bold 32px Courier New';X.textAlign='center';
  X.fillText(score,C.width/2,42);
  X.fillStyle='#ffdd00';X.font='11px Courier New';
  X.fillText('BEST: '+Math.max(highScore,score),C.width/2,57);

  // Wave & Kills
  X.fillStyle='#ff6644';X.font='bold 14px Courier New';X.textAlign='left';
  X.fillText('WAVE '+wave,16,25);
  X.fillStyle='#ff3333';X.font='12px Courier New';
  X.fillText(kills+' KILLS',16,42);

  // Hearts
  X.font='22px serif';X.textAlign='right';
  var hearts='';
  for(var i=0;i<MAX_HP;i++) hearts+=(i<hp)?'\u2764':'\u2661';
  X.fillStyle='#ff3333';X.fillText(hearts,C.width-16,38);

  // Wave progress
  var progW=C.width-32;
  var prog=Math.min(waveKills/waveTarget,1);
  X.fillStyle='rgba(255,50,50,0.15)';X.fillRect(16,62,progW,6);
  X.fillStyle='rgba(255,100,50,0.7)';X.fillRect(16,62,progW*prog,6);

  // Radar
  var rR=32,rX=C.width/2,rY=C.height-rR-22;
  X.globalAlpha=0.55;
  X.fillStyle='rgba(0,0,0,0.5)';
  X.beginPath();X.arc(rX,rY,rR,0,Math.PI*2);X.fill();
  X.strokeStyle='#ff3333';X.lineWidth=1;
  X.beginPath();X.arc(rX,rY,rR,0,Math.PI*2);X.stroke();
  X.beginPath();X.arc(rX,rY,rR*0.5,0,Math.PI*2);X.stroke();
  X.strokeStyle='rgba(255,50,50,0.2)';
  X.beginPath();X.moveTo(rX-rR,rY);X.lineTo(rX+rR,rY);X.stroke();
  X.beginPath();X.moveTo(rX,rY-rR);X.lineTo(rX,rY+rR);X.stroke();
  X.fillStyle='#fff';X.globalAlpha=1;
  X.beginPath();X.arc(rX,rY,2.5,0,Math.PI*2);X.fill();
  var fovR=CAM_FOV_H/2*Math.PI/180;
  X.strokeStyle='rgba(255,255,255,0.3)';X.lineWidth=1;
  X.beginPath();X.moveTo(rX,rY);X.lineTo(rX+Math.sin(-fovR)*rR,rY-Math.cos(-fovR)*rR);X.stroke();
  X.beginPath();X.moveTo(rX,rY);X.lineTo(rX+Math.sin(fovR)*rR,rY-Math.cos(fovR)*rR);X.stroke();
  X.globalAlpha=0.8;
  for(var i=0;i<zombies.length;i++){
    var rz=zombies[i];
    var relA=angleDiff(rz.worldAngle,camYaw-yawOffset)*Math.PI/180;
    var rd=Math.min(1,rz.dist/10);
    X.fillStyle=rz.isBig?'#ff0000':'#ff4444';
    X.beginPath();X.arc(rX+Math.sin(relA)*rR*rd,rY-Math.cos(relA)*rR*rd,rz.isBig?3:2,0,Math.PI*2);X.fill();
  }
  X.globalAlpha=1;

  // Warning arrows
  for(var i=0;i<zombies.length;i++){
    var az=zombies[i];
    if(az.onScreen||az.dist>8) continue;
    var relA2=angleDiff(az.worldAngle,camYaw-yawOffset);
    if(Math.abs(relA2)<CAM_FOV_H/2) continue;
    var urg=Math.min(1,(4-az.dist)/4);
    if(urg<0) continue;
    var arrX=relA2>0?C.width-30:30;
    X.globalAlpha=0.4+urg*0.5;
    X.fillStyle='#ff3333';X.font='bold 28px Courier New';X.textAlign='center';
    X.fillText(relA2>0?'\u25B6':'\u25C0',arrX,C.height/2);
    X.font='10px Courier New';
    X.fillText(Math.round(az.dist)+'m',arrX,C.height/2+18);
    X.globalAlpha=1;
  }
}

// ─── AR OVERLAY ─────────────────────────────────
function drawAROverlay(){
  X.globalAlpha=0.15;X.fillStyle='#0a0008';
  X.fillRect(0,0,C.width,C.height);X.globalAlpha=1;
  var vg=X.createRadialGradient(C.width/2,C.height/2,C.width*0.3,C.width/2,C.height/2,C.width*0.8);
  vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,0.35)');
  X.fillStyle=vg;X.fillRect(0,0,C.width,C.height);
  var cx2=C.width/2,cy2=C.height/2;
  X.strokeStyle='rgba(255,50,50,0.2)';X.lineWidth=1;
  X.beginPath();X.moveTo(cx2-20,cy2);X.lineTo(cx2+20,cy2);X.stroke();
  X.beginPath();X.moveTo(cx2,cy2-20);X.lineTo(cx2,cy2+20);X.stroke();
  X.beginPath();X.arc(cx2,cy2,14,0,Math.PI*2);X.stroke();
}
