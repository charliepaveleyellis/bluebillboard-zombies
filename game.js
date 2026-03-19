// ─── AUDIO ──────────────────────────────────────
var audioCtx=null;
function initAudio(){if(!audioCtx)try{audioCtx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}}
function snd(f,t,d,v){if(!audioCtx)return;try{var o=audioCtx.createOscillator(),g=audioCtx.createGain();
  o.type=t||'square';o.frequency.value=f;g.gain.value=v||0.06;
  g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+(d||0.1));
  o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+(d||0.1));}catch(e){}}
function playSweep(s,e,t,d,v){if(!audioCtx)return;try{var n=audioCtx.currentTime,o=audioCtx.createOscillator(),g=audioCtx.createGain();
  o.type=t||'sawtooth';o.frequency.setValueAtTime(s,n);o.frequency.exponentialRampToValueAtTime(e,n+d);
  g.gain.setValueAtTime(v||0.06,n);g.gain.exponentialRampToValueAtTime(0.001,n+d);
  o.connect(g);g.connect(audioCtx.destination);o.start(n);o.stop(n+d);}catch(e){}}
function sfxShoot(){snd(900,'square',0.04,0.1);snd(150,'sawtooth',0.06,0.07);snd(2000,'sine',0.02,0.04);}
function sfxKill(){playSweep(500,60,'sawtooth',0.25,0.08);snd(120,'square',0.2,0.07);snd(80,'sine',0.3,0.05);}
function sfxHit(){playSweep(150,40,'sawtooth',0.4,0.12);snd(60,'square',0.3,0.1);if(navigator.vibrate)navigator.vibrate([80,30,120,30,80]);}
function sfxWave(){playSweep(200,800,'sine',0.4,0.06);setTimeout(function(){playSweep(300,1200,'sine',0.3,0.05);snd(1500,'sine',0.1,0.04);},200);}
function sfxMoan(){if(!audioCtx)return;try{var n=audioCtx.currentTime,o=audioCtx.createOscillator(),g=audioCtx.createGain();
  o.type='sawtooth';o.frequency.setValueAtTime(80+Math.random()*40,n);o.frequency.linearRampToValueAtTime(60+Math.random()*30,n+0.8);
  g.gain.setValueAtTime(0.02,n);g.gain.linearRampToValueAtTime(0.03,n+0.2);g.gain.exponentialRampToValueAtTime(0.001,n+0.8);
  o.connect(g);g.connect(audioCtx.destination);o.start(n);o.stop(n+0.8);}catch(e){}}
function sfxHeadshot(){snd(1400,'sine',0.04,0.09);snd(700,'square',0.08,0.07);snd(2200,'sine',0.03,0.05);}

// ─── CAMERA ─────────────────────────────────────
var cam=document.getElementById('cam');
var fallbackEl=document.getElementById('fallback');
function initCamera(){
  navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false})
  .then(function(s){cam.srcObject=s;})
  .catch(function(){cam.classList.add('hidden');fallbackEl.classList.remove('hidden');});
}

// ─── DEVICE ORIENTATION ─────────────────────────
var camYaw=0,rawYaw=0,yawOffset=0;
var CAM_FOV_H=70;

function initGyro(){
  if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){
    DeviceOrientationEvent.requestPermission().then(function(r){
      if(r==='granted') listenGyro();
    }).catch(function(){});
  } else {
    listenGyro();
  }
}
function listenGyro(){
  window.addEventListener('deviceorientation',function(e){
    if(e.alpha!==null) rawYaw=e.alpha;
  },true);
}
function updateYaw(){
  var diff=rawYaw-camYaw;
  while(diff>180) diff-=360;
  while(diff<-180) diff+=360;
  camYaw+=diff*0.12;
  while(camYaw<0) camYaw+=360;
  while(camYaw>=360) camYaw-=360;
}
function angleDiff(a,b){
  var d=a-b;while(d>180)d-=360;while(d<-180)d+=360;return d;
}

// ─── CANVAS ─────────────────────────────────────
var C=document.getElementById('game');
var X=C.getContext('2d');
function resize(){C.width=window.innerWidth;C.height=window.innerHeight;}
window.addEventListener('resize',resize);resize();

// ─── CONFIG ─────────────────────────────────────
var MAX_HP=5;
var SPAWN_INTERVAL_START=2000;
var SPAWN_INTERVAL_MIN=400;

// ─── STATE ──────────────────────────────────────
var running=false,gameOver=false;
var score=0,wave=1,kills=0,hp=MAX_HP;
var highScore=parseInt(localStorage.getItem('bb_zombie_hi')||'0');
var zombies=[];var particles=[];var bloodSplats=[];
var frameCount=0;var lastSpawn=0;var lastMoan=0;
var spawnInterval=SPAWN_INTERVAL_START;
var waveKills=0,waveTarget=5;
var screenFlash=0,damageFlash=0;
var screenShakeX=0,screenShakeY=0;
var combo=0,comboTimer=0;
var muzzleFlash=0;
var useWebXR=false;

// ─── PERSPECTIVE ────────────────────────────────
function getZombieFeetY(dist){
  var t=Math.min(1,1.5/dist);
  return C.height*(0.72+t*0.25);
}
function getZombieHeight(dist){
  return C.height*Math.min(0.6,0.7/dist);
}

// ─── ZOMBIE ─────────────────────────────────────
var ZOMBIE_TYPES=['normal','runner','tank','crawler'];
function spawnZombie(){
  // Pick type based on wave
  var typeRoll=Math.random();
  var type='normal';
  if(wave>=3&&typeRoll<0.15) type='runner';
  if(wave>=4&&typeRoll<0.1) type='tank';
  if(wave>=5&&typeRoll<0.08) type='crawler';

  var z={
    worldAngle:Math.random()*360,
    dist:7+Math.random()*5,
    speed:0.5+Math.random()*0.4,
    hp:1+Math.floor(wave/4),
    maxHp:1+Math.floor(wave/4),
    hitTimer:0,
    wobble:Math.random()*Math.PI*2,
    wobbleSpeed:0.02+Math.random()*0.03,
    isBig:false,
    type:type,
    armPhase:Math.random()*Math.PI*2,
    x:0,y:0,scale:0.1,onScreen:false,
    skinHue:Math.random()*30, // vary green shade per zombie
    moanTimer:Math.random()*200
  };

  if(type==='runner'){z.speed*=1.8;z.hp=1;}
  if(type==='tank'){z.isBig=true;z.hp+=3;z.maxHp=z.hp;z.speed*=0.5;}
  if(type==='crawler'){z.speed*=0.7;z.hp=1;}

  zombies.push(z);
}
