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
function sfxShoot(){snd(800,'square',0.06,0.08);snd(200,'sawtooth',0.08,0.05);}
function sfxKill(){playSweep(600,100,'sawtooth',0.2,0.07);snd(150,'square',0.15,0.06);}
function sfxHit(){playSweep(200,60,'sawtooth',0.3,0.1);snd(80,'square',0.2,0.08);}
function sfxWave(){playSweep(300,900,'sine',0.3,0.05);setTimeout(function(){playSweep(400,1000,'sine',0.2,0.04);},150);}

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
var SPAWN_INTERVAL_START=2200;
var SPAWN_INTERVAL_MIN=500;

// ─── STATE ──────────────────────────────────────
var running=false,gameOver=false;
var score=0,wave=1,kills=0,hp=MAX_HP;
var highScore=parseInt(localStorage.getItem('bb_zombie_hi')||'0');
var zombies=[];var particles=[];
var frameCount=0;var lastSpawn=0;
var spawnInterval=SPAWN_INTERVAL_START;
var waveKills=0,waveTarget=5;
var screenFlash=0,damageFlash=0;
var useWebXR=false;

// ─── PERSPECTIVE ────────────────────────────────
function getZombieFeetY(dist){
  var t=Math.min(1,1.5/dist);
  return C.height*(0.75+t*0.22);
}
function getZombieHeight(dist){
  return C.height*Math.min(0.4,0.35/dist);
}

// ─── ZOMBIE ─────────────────────────────────────
function spawnZombie(){
  var z={
    worldAngle:Math.random()*360,
    dist:7+Math.random()*5,
    speed:(0.4+Math.random()*0.4)*(1+wave*0.05),
    hp:1+Math.floor(wave/4),
    maxHp:1+Math.floor(wave/4),
    hitTimer:0,
    wobble:Math.random()*Math.PI*2,
    wobbleSpeed:0.02+Math.random()*0.03,
    isBig:Math.random()<0.12+wave*0.02,
    armPhase:Math.random()*Math.PI*2,
    x:0,y:0,scale:0.1,onScreen:false
  };
  if(z.isBig){z.hp+=2;z.maxHp=z.hp;z.speed*=0.65;}
  zombies.push(z);
}
