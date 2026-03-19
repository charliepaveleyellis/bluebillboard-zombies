// ─── SKIN COLOR HELPERS ─────────────────────────
function zombieSkin(z,light){
  var hue=z.skinHue||0;
  // Each type has a VERY different colour so you can tell them apart instantly
  if(z.type==='runner') return light?'rgb('+(100+hue)+','+(80+hue)+','+(120+hue)+')':'rgb('+(55+hue)+','+(40+hue)+','+(70+hue)+')'; // purple
  if(z.type==='tank') return light?'rgb('+(70+hue)+','+(50+hue)+','+(40+hue)+')':'rgb('+(40+hue)+','+(25+hue)+','+(18+hue)+')'; // dark brown
  if(z.type==='crawler') return light?'rgb('+(120+hue)+','+(110+hue)+','+(60+hue)+')':'rgb('+(70+hue)+','+(60+hue)+','+(30+hue)+')'; // sickly yellow
  return light?'rgb('+(50+hue)+','+(100+hue)+','+(55+hue)+')':'rgb('+(25+hue)+','+(55+hue)+','+(28+hue)+')'; // classic green
}

// ─── DRAW ZOMBIE ────────────────────────────────
function drawZombie(z){
  if(!z.onScreen) return;
  var h=getZombieHeight(z.dist);
  var w=h*0.5;
  if(h<6) return;
  var s=h/C.height;
  var big=z.isBig;
  var type=z.type||'normal';

  var feetY=z.y;
  var wobX=Math.sin(z.wobble)*4*s*5;
  var stepBounce=Math.abs(Math.sin(z.wobble*2))*3*s*4;
  var lean=Math.sin(z.wobble*0.5)*0.06;
  var crawlerLean=type==='crawler'?0.3:0;
  var cx=z.x+wobX;
  var bodyCenter=feetY-h*(type==='crawler'?0.35:0.5)-stepBounce;

  // ── DEATH ANIMATION ──
  var deathProgress=0;
  if(z.dying){
    deathProgress=1-Math.max(0,z.deathTimer); // 0 to 1
    var fallAngle=deathProgress*Math.PI*0.45*(z.deathFallDir>0?1:-1); // fall sideways
    var sinkY=deathProgress*deathProgress*h*0.3; // sink into ground
    var deathScale=1-deathProgress*0.3; // shrink slightly
    lean=fallAngle;
    crawlerLean=0;
    wobX=0;stepBounce=0;
    cx=z.x;
    bodyCenter=feetY-h*0.5+sinkY;
    h*=deathScale;w*=deathScale;
  }

  X.save();
  X.translate(cx,bodyCenter);
  X.rotate(lean+crawlerLean);

  // Death fade
  if(z.dying){
    X.globalAlpha=Math.max(0,z.deathTimer);
  }

  var distAlpha=Math.min(1,Math.max(0.15,s*2.5));
  X.globalAlpha=distAlpha;
  if(z.hitTimer>0&&Math.sin(z.hitTimer*25)>0) X.globalAlpha=distAlpha*0.35;

  var skinL=zombieSkin(z,true),skinD=zombieSkin(z,false);
  var legAnim=Math.sin(frameCount*(type==='runner'?0.18:0.1)+z.armPhase);
  var armAnim=Math.sin(frameCount*(type==='runner'?0.18:0.1)+z.armPhase+Math.PI);
  var breathe=Math.sin(frameCount*0.04+z.wobble)*0.03;

  // ── GROUND SHADOW ──
  X.save();X.rotate(-lean-crawlerLean);
  var sha=Math.min(0.6,0.2+s*0.8);
  var sg=X.createRadialGradient(0,h*0.5,0,0,h*0.5,w);
  sg.addColorStop(0,'rgba(0,0,0,'+sha+')');sg.addColorStop(1,'rgba(0,0,0,0)');
  X.fillStyle=sg;
  X.beginPath();X.ellipse(0,h*0.5+stepBounce,w*(big?1.2:0.9),h*0.05+5,0,0,Math.PI*2);X.fill();
  X.restore();

  var backSide=legAnim>0?-1:1;

  // ── BACK LEG ──
  zLeg(w,h,s,skinL,skinD,legAnim*14*s*backSide,0.6,type);
  // ── BACK ARM ──
  zArm(w,h,s,skinL,skinD,armAnim,backSide>0?-1:1,0.6,type);

  // ── TORSO ──
  var tw=w*(0.5+breathe)*(big?1.15:1);
  var th=h*0.38;
  var tg=X.createLinearGradient(0,-th,0,th);
  tg.addColorStop(0,skinD);tg.addColorStop(0.4,skinL);tg.addColorStop(1,skinD);
  X.fillStyle=tg;
  X.beginPath();
  X.moveTo(-tw*0.85,-th*0.7);
  X.bezierCurveTo(-tw*1.1,-th*0.2,-tw*1.05,th*0.3,-tw*0.7,th*0.55);
  X.lineTo(tw*0.7,th*0.55);
  X.bezierCurveTo(tw*1.05,th*0.3,tw*1.1,-th*0.2,tw*0.85,-th*0.7);
  X.closePath();X.fill();
  // Chest muscle definition
  X.strokeStyle='rgba(0,0,0,0.15)';X.lineWidth=Math.max(1,1.5*s);
  X.beginPath();X.moveTo(0,-th*0.5);X.lineTo(0,th*0.1);X.stroke();
  X.beginPath();X.arc(-tw*0.3,-th*0.2,tw*0.35,0.2,1.2);X.stroke();
  X.beginPath();X.arc(tw*0.3,-th*0.2,tw*0.35,Math.PI-1.2,Math.PI-0.2);X.stroke();

  // Tattered clothing remnants
  if(type!=='crawler'){
    X.fillStyle=type==='tank'?'rgba(40,25,15,0.5)':type==='runner'?'rgba(50,50,70,0.4)':'rgba(80,65,45,0.45)';
    X.beginPath();
    X.moveTo(-tw*0.9,-th*0.65);
    X.lineTo(-tw*0.5,-th*0.1);
    X.bezierCurveTo(-tw*0.2,th*0.1,tw*0.1,-th*0.3,tw*0.6,-th*0.6);
    X.lineTo(tw*0.85,-th*0.7);X.closePath();X.fill();
    // Ragged bottom edge
    X.fillStyle='rgba(60,50,35,0.3)';
    for(var ri=0;ri<4;ri++){
      var rx=-tw*0.6+ri*tw*0.35;
      X.beginPath();X.moveTo(rx,th*0.4);
      X.lineTo(rx+tw*0.12,th*0.65+Math.sin(ri*2)*th*0.1);
      X.lineTo(rx+tw*0.25,th*0.4);X.fill();
    }
  }

  // Exposed ribs (on one side)
  X.strokeStyle='rgba(200,190,170,0.3)';X.lineWidth=Math.max(1,2*s);
  for(var rbi=0;rbi<4;rbi++){
    var ry2=th*(-0.15+rbi*0.12);
    X.beginPath();X.moveTo(tw*0.1,ry2);
    X.quadraticCurveTo(tw*0.5,ry2-th*0.04,tw*0.7,ry2+th*0.02);X.stroke();
  }
  // Wound over ribs
  X.fillStyle='rgba(120,15,15,0.5)';
  X.beginPath();X.ellipse(tw*0.4,th*0.0,tw*0.3,th*0.2,0.1,0,Math.PI*2);X.fill();
  // Blood drips from wound
  X.fillStyle='rgba(90,5,5,0.6)';
  var dripY=th*0.15+Math.sin(frameCount*0.02+z.wobble)*th*0.05;
  X.beginPath();X.moveTo(tw*0.35,th*0.1);
  X.quadraticCurveTo(tw*0.33,dripY,tw*0.37,dripY+th*0.08);
  X.quadraticCurveTo(tw*0.4,dripY,tw*0.38,th*0.1);X.fill();

  // ── FRONT LEG ──
  zLeg(w,h,s,skinL,skinD,legAnim*14*s*(backSide*-1),1,type);
  // ── FRONT ARM ──
  zArm(w,h,s,skinL,skinD,armAnim,backSide>0?1:-1,1,type);

  // ── NECK ──
  var nw=Math.max(3,w*0.2);
  var ng=X.createLinearGradient(-nw,-th*0.7,nw,-th*0.7-h*0.06);
  ng.addColorStop(0,skinD);ng.addColorStop(1,skinL);
  X.fillStyle=ng;
  X.fillRect(-nw,-th*0.72,nw*2,h*0.09);
  // Neck tendons
  X.strokeStyle='rgba(0,0,0,0.2)';X.lineWidth=Math.max(0.5,1*s);
  X.beginPath();X.moveTo(-nw*0.4,-th*0.72);X.lineTo(-nw*0.5,-th*0.72-h*0.07);X.stroke();
  X.beginPath();X.moveTo(nw*0.4,-th*0.72);X.lineTo(nw*0.5,-th*0.72-h*0.07);X.stroke();

  // ── HEAD ──
  var hR=w*(big?0.45:0.42);
  var hY=-h*(type==='crawler'?0.32:0.4);
  var hBob=Math.sin(frameCount*0.07+z.wobble)*hR*0.06;
  var hTilt=Math.sin(z.wobble*0.3)*(type==='crawler'?0.3:0.15);

  X.save();
  X.translate(0,hY+hBob);
  X.rotate(hTilt);

  // Skull base — lumpy, asymmetric
  var hg=X.createRadialGradient(-hR*0.1,-hR*0.1,hR*0.1,-hR*0.1,-hR*0.1,hR*1.1);
  hg.addColorStop(0,skinL);hg.addColorStop(1,skinD);
  X.fillStyle=hg;
  X.beginPath();
  X.moveTo(0,-hR*1.05);
  X.bezierCurveTo(hR*0.7,-hR*1.0,hR*1.05,-hR*0.5,hR*0.95,0);
  X.bezierCurveTo(hR*0.9,hR*0.5,hR*0.5,hR*0.95,hR*0.1,hR);
  X.bezierCurveTo(-hR*0.1,hR*1.02,-hR*0.5,hR*0.95,-hR*0.6,hR*0.7);
  X.bezierCurveTo(-hR*0.95,hR*0.4,-hR*1.05,-hR*0.3,-hR*0.9,-hR*0.7);
  X.bezierCurveTo(-hR*0.8,-hR*0.95,-hR*0.3,-hR*1.05,0,-hR*1.05);
  X.fill();

  // Brow ridge
  X.fillStyle=skinD;
  X.beginPath();
  X.moveTo(-hR*0.8,-hR*0.35);
  X.quadraticCurveTo(0,-hR*0.55,hR*0.8,-hR*0.35);
  X.quadraticCurveTo(0,-hR*0.3,-hR*0.8,-hR*0.35);
  X.fill();

  // Rotting patches with texture
  X.globalAlpha*=0.5;
  X.fillStyle='rgba(15,30,10,0.8)';
  X.beginPath();X.ellipse(-hR*0.35,-hR*0.55,hR*0.2,hR*0.18,0.4,0,Math.PI*2);X.fill();
  X.fillStyle='rgba(60,45,30,0.4)';
  X.beginPath();X.ellipse(hR*0.3,hR*0.2,hR*0.22,hR*0.15,-0.3,0,Math.PI*2);X.fill();
  // Exposed skull bone
  X.fillStyle='rgba(200,190,170,0.2)';
  X.beginPath();X.ellipse(hR*0.4,-hR*0.6,hR*0.12,hR*0.1,0.2,0,Math.PI*2);X.fill();
  X.globalAlpha=distAlpha;
  if(z.hitTimer>0&&Math.sin(z.hitTimer*25)>0) X.globalAlpha=distAlpha*0.35;

  // ── EYE SOCKETS ──
  X.fillStyle='#050505';
  X.beginPath();X.ellipse(-hR*0.33,-hR*0.12,hR*0.23,hR*0.2,0.08,0,Math.PI*2);X.fill();
  X.beginPath();X.ellipse(hR*0.33,-hR*0.12,hR*0.23,hR*0.2,-0.08,0,Math.PI*2);X.fill();
  // Socket rims
  X.strokeStyle='rgba(0,0,0,0.3)';X.lineWidth=Math.max(1,1.5*s);
  X.beginPath();X.ellipse(-hR*0.33,-hR*0.12,hR*0.25,hR*0.22,0.08,0,Math.PI*2);X.stroke();
  X.beginPath();X.ellipse(hR*0.33,-hR*0.12,hR*0.25,hR*0.22,-0.08,0,Math.PI*2);X.stroke();

  // ── GLOWING EYES ──
  var ep=0.5+Math.sin(frameCount*0.12+z.wobble)*0.4;
  var eR=Math.max(1.5,hR*0.14);
  // Outer glow
  X.shadowColor='rgba(255,20,0,'+ep+')';X.shadowBlur=Math.max(8,20*s);
  X.fillStyle='rgba(255,30,0,'+ep+')';
  X.beginPath();X.arc(-hR*0.33,-hR*0.12,eR,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(hR*0.33,-hR*0.12,eR,0,Math.PI*2);X.fill();
  // Inner bright
  X.fillStyle='rgba(255,180,30,'+(ep*0.9)+')';
  X.beginPath();X.arc(-hR*0.33,-hR*0.12,eR*0.45,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(hR*0.33,-hR*0.12,eR*0.45,0,Math.PI*2);X.fill();
  // White hot center
  X.fillStyle='rgba(255,255,200,'+(ep*0.5)+')';
  X.beginPath();X.arc(-hR*0.33,-hR*0.15,eR*0.2,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(hR*0.33,-hR*0.15,eR*0.2,0,Math.PI*2);X.fill();
  X.shadowBlur=0;X.shadowColor='transparent';

  // ── NOSE ── (collapsed, just holes)
  X.fillStyle='#0a0805';
  X.beginPath();X.ellipse(-hR*0.08,hR*0.15,hR*0.06,hR*0.08,0.1,0,Math.PI*2);X.fill();
  X.beginPath();X.ellipse(hR*0.06,hR*0.15,hR*0.06,hR*0.08,-0.1,0,Math.PI*2);X.fill();
  // Nose bridge remnant
  X.strokeStyle=skinD;X.lineWidth=Math.max(1,2*s);
  X.beginPath();X.moveTo(0,hR*0.0);X.lineTo(0,hR*0.2);X.stroke();

  // ── MOUTH ──
  var mOpen=0.5+Math.sin(frameCount*0.05+z.armPhase)*0.35;
  // Jaw outline
  X.fillStyle='#060303';
  X.beginPath();
  X.moveTo(-hR*0.4,hR*0.4);
  X.quadraticCurveTo(-hR*0.35,hR*(0.5+mOpen*0.25),0,hR*(0.55+mOpen*0.2));
  X.quadraticCurveTo(hR*0.35,hR*(0.5+mOpen*0.25),hR*0.4,hR*0.4);
  X.quadraticCurveTo(hR*0.2,hR*0.35,-hR*0.0,hR*0.35);
  X.quadraticCurveTo(-hR*0.2,hR*0.35,-hR*0.4,hR*0.4);
  X.fill();
  // Gums — upper
  X.fillStyle='rgba(100,25,25,0.8)';
  X.beginPath();X.ellipse(0,hR*0.38,hR*0.32,hR*0.06,0,Math.PI,Math.PI*2);X.fill();
  // Gums — lower
  X.fillStyle='rgba(80,20,20,0.7)';
  X.beginPath();X.ellipse(0,hR*(0.45+mOpen*0.12),hR*0.28,hR*0.05,0,0,Math.PI);X.fill();

  // Teeth — upper row, irregular
  X.fillStyle='#c8bf90';
  var ut=[{x:-0.28,w:0.07,h:0.14},{x:-0.16,w:0.06,h:0.18},{x:-0.06,w:0.08,h:0.12},
          {x:0.05,w:0.07,h:0.16},{x:0.15,w:0.06,h:0.1},{x:0.24,w:0.08,h:0.13}];
  for(var ti=0;ti<ut.length;ti++){
    if(ti===2&&type==='tank') continue; // missing tooth
    var t2=ut[ti];
    X.fillStyle=(ti%2)?'#c8bf90':'#b5aa80';
    X.fillRect(hR*t2.x,hR*0.34,hR*t2.w,hR*t2.h*mOpen);
  }
  // Bottom teeth — fewer
  X.fillStyle='#b0a570';
  X.fillRect(-hR*0.12,hR*(0.45+mOpen*0.1),hR*0.07,-hR*0.07*mOpen);
  X.fillRect(hR*0.06,hR*(0.45+mOpen*0.1),hR*0.08,-hR*0.09*mOpen);
  X.fillRect(-hR*0.22,hR*(0.45+mOpen*0.1),hR*0.06,-hR*0.05*mOpen);

  // Drool
  if(mOpen>0.5){
    X.strokeStyle='rgba(150,170,140,0.4)';X.lineWidth=Math.max(0.5,1.5*s);
    var droolSway=Math.sin(frameCount*0.06+z.wobble)*hR*0.1;
    X.beginPath();X.moveTo(-hR*0.05,hR*(0.5+mOpen*0.15));
    X.quadraticCurveTo(-hR*0.05+droolSway,hR*(0.7+mOpen*0.1),-hR*0.03+droolSway,hR*(0.8+mOpen*0.15));
    X.stroke();
  }

  // Stringy hair
  X.strokeStyle=skinD;X.lineWidth=Math.max(1,2.5*s);X.lineCap='round';
  var hairStrands=[{x:-0.6,len:0.5},{x:-0.35,len:0.7},{x:-0.1,len:0.4},{x:0.2,len:0.55},{x:0.5,len:0.45}];
  for(var hi=0;hi<hairStrands.length;hi++){
    var hs=hairStrands[hi];
    var hWave=Math.sin(frameCount*0.025+hi*1.5+z.wobble)*hR*0.2;
    X.beginPath();
    X.moveTo(hR*hs.x,-hR*0.95);
    X.quadraticCurveTo(hR*hs.x+hWave,-hR*(0.95-hs.len*0.5),hR*hs.x+hWave*1.3,-hR*(0.95-hs.len));
    X.stroke();
  }

  // Ears (partially missing)
  X.fillStyle=skinL;
  X.beginPath();X.ellipse(-hR*0.95,-hR*0.05,hR*0.1,hR*0.18,0.2,0,Math.PI*2);X.fill();
  X.fillStyle=skinD;
  X.beginPath();X.ellipse(hR*0.95,-hR*0.1,hR*0.08,hR*0.12,-0.1,0,Math.PI);X.fill(); // torn ear

  X.restore(); // end head

  // ── HIT WHITE FLASH ──
  if(z.hitTimer>0&&Math.sin(z.hitTimer*25)>0){
    X.globalAlpha=0.6;X.fillStyle='#fff';
    X.beginPath();X.ellipse(0,-h*0.1,w*0.55,h*0.5,0,0,Math.PI*2);X.fill();
  }

  // ── HP BAR ──
  if(z.maxHp>1){
    X.globalAlpha=distAlpha;
    var bw2=w*1.3,bh2=Math.max(3,6*s),by2=-h*0.55-Math.max(6,12*s);
    X.fillStyle='rgba(0,0,0,0.7)';X.fillRect(-bw2/2-1,by2-1,bw2+2,bh2+2);
    X.fillStyle='#1a1a1a';X.fillRect(-bw2/2,by2,bw2,bh2);
    var hpP=z.hp/z.maxHp;
    var hpG=X.createLinearGradient(-bw2/2,0,bw2/2,0);
    if(hpP>0.6){hpG.addColorStop(0,'#22cc22');hpG.addColorStop(1,'#44ff44');}
    else if(hpP>0.3){hpG.addColorStop(0,'#ccaa00');hpG.addColorStop(1,'#ffdd22');}
    else{hpG.addColorStop(0,'#cc2222');hpG.addColorStop(1,'#ff4444');}
    X.fillStyle=hpG;X.fillRect(-bw2/2,by2,bw2*hpP,bh2);
  }

  // ── TYPE INDICATOR (runners get speed lines) ──
  if(type==='runner'&&s>0.03){
    X.strokeStyle='rgba(200,200,255,0.15)';X.lineWidth=Math.max(1,2*s);
    for(var sli=0;sli<3;sli++){
      var slx=-w*0.8-sli*w*0.2;
      var sly=-h*0.2+sli*h*0.15;
      X.beginPath();X.moveTo(slx,sly);X.lineTo(slx-w*0.4,sly);X.stroke();
    }
  }

  X.globalAlpha=1;X.restore();
}

// ── LEG HELPER ──
function zLeg(w,h,s,skinL,skinD,anim,alpha,type){
  var legX=anim>0?w*0.12:-w*0.12;
  var hipY=h*(type==='crawler'?0.3:0.15);
  var kneeX=legX+anim*0.5;
  var kneeY=h*(type==='crawler'?0.4:0.33);
  var footX=legX+anim;
  var footY=h*0.48;

  X.globalAlpha*=alpha;

  // Thigh
  X.strokeStyle=skinD;X.lineWidth=Math.max(3,10*s);X.lineCap='round';
  X.beginPath();X.moveTo(legX,hipY);X.lineTo(kneeX,kneeY);X.stroke();
  // Thigh highlight
  X.strokeStyle=skinL;X.lineWidth=Math.max(1,4*s);
  X.beginPath();X.moveTo(legX,hipY+h*0.02);X.lineTo(kneeX,kneeY-h*0.02);X.stroke();

  // Shin
  X.strokeStyle=skinD;X.lineWidth=Math.max(2,8*s);
  X.beginPath();X.moveTo(kneeX,kneeY);X.lineTo(footX,footY);X.stroke();

  // Knee cap
  X.fillStyle=skinL;
  X.beginPath();X.arc(kneeX,kneeY,Math.max(2,5*s),0,Math.PI*2);X.fill();

  // Foot
  X.fillStyle='#1a1815';
  X.beginPath();
  X.ellipse(footX+Math.max(2,4*s),footY,Math.max(4,w*0.14),Math.max(2,h*0.03),0,0,Math.PI*2);
  X.fill();

  X.globalAlpha/=alpha;
}

// ── ARM HELPER ──
function zArm(w,h,s,skinL,skinD,anim,side,alpha,type){
  var sx=side*w*0.48;
  var sy=-h*0.22;
  var reachMult=type==='crawler'?1.5:type==='runner'?1.3:1;
  var ex=sx+side*w*0.22+anim*10*s*reachMult;
  var ey=sy+h*0.16+Math.abs(anim)*6*s;
  var handX=ex+side*w*0.12+anim*8*s*reachMult;
  var handY=ey+h*0.1-anim*5*s;

  X.globalAlpha*=alpha;

  // Upper arm
  X.strokeStyle=skinD;X.lineWidth=Math.max(2,7*s);X.lineCap='round';
  X.beginPath();X.moveTo(sx,sy);X.lineTo(ex,ey);X.stroke();
  X.strokeStyle=skinL;X.lineWidth=Math.max(1,3*s);
  X.beginPath();X.moveTo(sx,sy+h*0.01);X.lineTo(ex,ey-h*0.01);X.stroke();

  // Forearm
  X.strokeStyle=skinD;X.lineWidth=Math.max(2,6*s);
  X.beginPath();X.moveTo(ex,ey);X.lineTo(handX,handY);X.stroke();

  // Elbow
  X.fillStyle=skinD;
  X.beginPath();X.arc(ex,ey,Math.max(1.5,3.5*s),0,Math.PI*2);X.fill();

  // Hand
  X.fillStyle=skinL;
  X.beginPath();X.arc(handX,handY,Math.max(2,5*s),0,Math.PI*2);X.fill();

  // Clawed fingers
  X.strokeStyle=skinD;X.lineWidth=Math.max(1,2*s);
  for(var fi=0;fi<4;fi++){
    var fa=(fi-1.5)*0.35+anim*0.2;
    var fLen=Math.max(3,8*s);
    X.beginPath();
    X.moveTo(handX,handY);
    X.lineTo(handX+Math.cos(fa)*fLen*side,handY+Math.sin(fa)*fLen);
    X.stroke();
    // Nail
    X.fillStyle='#2a2520';
    X.beginPath();
    X.arc(handX+Math.cos(fa)*fLen*side,handY+Math.sin(fa)*fLen,Math.max(0.5,1.5*s),0,Math.PI*2);
    X.fill();
  }

  X.globalAlpha/=alpha;
}

// ─── PARTICLES ──────────────────────────────────
function spawnParticles(x,y,color,count){
  for(var i=0;i<count;i++){
    var a=(i/count)*Math.PI*2+Math.random()*0.8;
    var spd=2+Math.random()*7;
    particles.push({x:x,y:y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd-3,
      life:15+Math.random()*15,maxLife:30,size:1.5+Math.random()*5,
      color:color,rot:Math.random()*Math.PI*2,rotSpd:(Math.random()-0.5)*0.3});
  }
}
function drawParticles(){
  for(var i=particles.length-1;i>=0;i--){
    var p=particles[i];
    p.x+=p.vx;p.y+=p.vy;p.vy+=0.12;p.vx*=0.98;p.life--;p.rot+=p.rotSpd;
    if(p.life<=0){particles.splice(i,1);continue;}
    var t=p.life/p.maxLife;
    X.globalAlpha=t;X.fillStyle=p.color;
    X.save();X.translate(p.x,p.y);X.rotate(p.rot);
    var sz=p.size*(0.5+t*0.5);
    X.fillRect(-sz/2,-sz/2,sz,sz);X.restore();
  }
  X.globalAlpha=1;
}

// ─── HUD ────────────────────────────────────────
function drawHUD(){
  // Top bar — BB dark blue
  var hbg=X.createLinearGradient(0,0,0,80);
  hbg.addColorStop(0,'rgba(0,5,20,0.85)');hbg.addColorStop(1,'rgba(0,5,20,0)');
  X.fillStyle=hbg;X.fillRect(0,0,C.width,80);
  X.fillStyle='rgba(46,163,242,0.4)';X.fillRect(0,0,C.width,2);

  // Mode indicator — BB blue
  X.fillStyle=useWebXR?'#00ffff':'#2ea3f2';X.font='bold 10px Courier New';X.textAlign='center';
  X.fillText(useWebXR?'[ REAL AR ]':'[ CAMERA ]',C.width/2,14);

  // Score — white with BB blue glow
  X.shadowColor='rgba(46,163,242,0.5)';X.shadowBlur=10;
  X.fillStyle='#fff';X.font='bold 36px Courier New';X.textAlign='center';
  X.fillText(score,C.width/2,46);
  X.shadowBlur=0;X.shadowColor='transparent';
  X.fillStyle='#ffdd00';X.font='10px Courier New';
  X.fillText('HI '+Math.max(highScore,score),C.width/2,60);

  // Wave — BB blue
  X.fillStyle='#2ea3f2';X.font='bold 16px Courier New';X.textAlign='left';
  X.fillText('W'+wave,16,28);
  X.fillStyle='#00ffff';X.font='bold 12px Courier New';
  X.fillText(kills+' KILLS',16,46);

  // Hearts — red (danger colour stays)
  X.textAlign='right';
  var heartX=C.width-16;
  for(var i=MAX_HP-1;i>=0;i--){
    X.font='24px serif';
    if(i<hp){X.shadowColor='rgba(255,0,0,0.5)';X.shadowBlur=6;X.fillStyle='#ff3333';}
    else{X.shadowBlur=0;X.shadowColor='transparent';X.fillStyle='#1a0000';}
    X.fillText('\u2764',heartX,36);heartX-=28;
  }
  X.shadowBlur=0;X.shadowColor='transparent';

  // Wave progress — BB blue to cyan gradient
  var progW=C.width-32,prog=Math.min(waveKills/waveTarget,1);
  X.fillStyle='rgba(46,163,242,0.1)';X.fillRect(16,66,progW,4);
  var pg=X.createLinearGradient(16,0,16+progW*prog,0);
  pg.addColorStop(0,'#003d7a');pg.addColorStop(1,'#2ea3f2');
  X.fillStyle=pg;X.fillRect(16,66,progW*prog,4);
  if(prog>0){X.shadowColor='#2ea3f2';X.shadowBlur=8;X.fillRect(16+progW*prog-4,65,4,6);X.shadowBlur=0;X.shadowColor='transparent';}

  // Radar — BB blue theme
  var rR=38,rX=C.width/2,rY=C.height-rR-24;
  X.globalAlpha=0.6;
  var rg=X.createRadialGradient(rX,rY,0,rX,rY,rR);
  rg.addColorStop(0,'rgba(0,10,30,0.7)');rg.addColorStop(1,'rgba(0,5,15,0.4)');
  X.fillStyle=rg;X.beginPath();X.arc(rX,rY,rR,0,Math.PI*2);X.fill();
  X.strokeStyle='rgba(46,163,242,0.3)';X.lineWidth=1;
  X.beginPath();X.arc(rX,rY,rR,0,Math.PI*2);X.stroke();
  X.beginPath();X.arc(rX,rY,rR*0.6,0,Math.PI*2);X.stroke();
  X.beginPath();X.arc(rX,rY,rR*0.3,0,Math.PI*2);X.stroke();
  // Sweep line — cyan
  var sw=frameCount*0.03;
  X.strokeStyle='rgba(0,255,255,0.2)';X.lineWidth=2;
  X.beginPath();X.moveTo(rX,rY);X.lineTo(rX+Math.sin(sw)*rR,rY-Math.cos(sw)*rR);X.stroke();
  // Cross lines
  X.strokeStyle='rgba(46,163,242,0.15)';X.lineWidth=1;
  X.beginPath();X.moveTo(rX-rR,rY);X.lineTo(rX+rR,rY);X.stroke();
  X.beginPath();X.moveTo(rX,rY-rR);X.lineTo(rX,rY+rR);X.stroke();
  // Player dot — BB blue
  X.fillStyle='#2ea3f2';X.globalAlpha=1;
  X.beginPath();X.arc(rX,rY,3,0,Math.PI*2);X.fill();
  // FOV cone
  var fovR2=CAM_FOV_H/2*Math.PI/180;
  X.fillStyle='rgba(46,163,242,0.06)';
  X.beginPath();X.moveTo(rX,rY);X.arc(rX,rY,rR,-Math.PI/2-fovR2,-Math.PI/2+fovR2);X.closePath();X.fill();
  X.strokeStyle='rgba(46,163,242,0.25)';X.lineWidth=1;
  X.beginPath();X.moveTo(rX,rY);X.lineTo(rX+Math.sin(-fovR2)*rR,rY-Math.cos(-fovR2)*rR);X.stroke();
  X.beginPath();X.moveTo(rX,rY);X.lineTo(rX+Math.sin(fovR2)*rR,rY-Math.cos(fovR2)*rR);X.stroke();
  // Zombie dots — red (danger) on blue radar
  for(var i=0;i<zombies.length;i++){
    var rz=zombies[i];
    var relA=angleDiff(rz.worldAngle,camYaw-yawOffset)*Math.PI/180;
    var rd=Math.min(1,rz.dist/10);
    X.globalAlpha=1;
    if(rz.type==='runner') X.fillStyle='#dd66ff';
    else if(rz.type==='tank') X.fillStyle='#ff2200';
    else if(rz.type==='crawler') X.fillStyle='#ffcc00';
    else X.fillStyle='#ff4444';
    X.shadowColor=X.fillStyle;X.shadowBlur=6;
    var dotR=rz.isBig?5:3.5;
    X.beginPath();X.arc(rX+Math.sin(relA)*rR*rd,rY-Math.cos(relA)*rR*rd,dotR,0,Math.PI*2);X.fill();
  }
  X.shadowBlur=0;X.shadowColor='transparent';X.globalAlpha=1;
  X.fillStyle='#2ea3f2';X.font='bold 10px Courier New';X.textAlign='center';
  X.fillText(zombies.length+' nearby',rX,rY+rR+14);

  // Warning arrows — BB blue with red urgency
  for(var i=0;i<zombies.length;i++){
    var az=zombies[i];
    if(az.onScreen||az.dist>8) continue;
    var relA2=angleDiff(az.worldAngle,camYaw-yawOffset);
    if(Math.abs(relA2)<CAM_FOV_H/2) continue;
    var urg=Math.min(1,(4-az.dist)/4);
    if(urg<0) continue;
    var aS=relA2>0?1:-1;
    var aX=aS>0?C.width-35:35;
    var aB=Math.sin(frameCount*0.15)*5*urg;
    X.globalAlpha=0.5+urg*0.5;
    // Colour shifts from blue to red as zombie gets closer
    var arrCol=urg>0.7?'#ff3333':urg>0.4?'#ff8800':'#2ea3f2';
    X.shadowColor=arrCol;X.shadowBlur=8*urg;
    X.fillStyle=arrCol;
    X.beginPath();X.moveTo(aX+aS*15+aB*aS,C.height/2);X.lineTo(aX-aS*5,C.height/2-12);X.lineTo(aX-aS*5,C.height/2+12);X.closePath();X.fill();
    X.shadowBlur=0;X.fillStyle='#2ea3f2';X.font='bold 11px Courier New';X.textAlign='center';
    X.fillText(Math.round(az.dist)+'m',aX,C.height/2+24);X.globalAlpha=1;
  }
  X.shadowBlur=0;X.shadowColor='transparent';
}

// ─── AR OVERLAY ─────────────────────────────────
function drawAROverlay(){
  // Subtle dark blue tint
  X.globalAlpha=0.1;X.fillStyle='#000510';
  X.fillRect(0,0,C.width,C.height);X.globalAlpha=1;
  // Blue-tinted vignette
  var vg=X.createRadialGradient(C.width/2,C.height/2,C.width*0.25,C.width/2,C.height/2,C.width*0.75);
  vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,5,20,0.35)');
  X.fillStyle=vg;X.fillRect(0,0,C.width,C.height);
  // Crosshair — BB blue/cyan
  var cx2=C.width/2,cy2=C.height/2;
  X.strokeStyle='rgba(46,163,242,0.2)';X.lineWidth=1;
  X.beginPath();X.arc(cx2,cy2,22,0,Math.PI*2);X.stroke();
  X.fillStyle='rgba(0,255,255,0.25)';
  X.beginPath();X.arc(cx2,cy2,2,0,Math.PI*2);X.fill();
  X.strokeStyle='rgba(46,163,242,0.2)';
  X.beginPath();X.moveTo(cx2-30,cy2);X.lineTo(cx2-8,cy2);X.stroke();
  X.beginPath();X.moveTo(cx2+8,cy2);X.lineTo(cx2+30,cy2);X.stroke();
  X.beginPath();X.moveTo(cx2,cy2-30);X.lineTo(cx2,cy2-8);X.stroke();
  X.beginPath();X.moveTo(cx2,cy2+8);X.lineTo(cx2,cy2+30);X.stroke();
}
