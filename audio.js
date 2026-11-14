/* SKY FIGHT: user-supplied BGM (427 battle / 159 menus) + synthesized SFX. */
(() => {
  'use strict';
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx, master, musicBus, sfxBus, timer, nextBeat = 0, step = 0, scene = 'home';
  let enabled = true, musicVol = .38, sfxVol = .85;
  const tracks = {home:'music/159_BPM130.mp3',select:'music/159_BPM130.mp3',battle:'music/427_BPM190.mp3',win:'music/035_BPM60.mp3',lose:'music/171_BPM75.mp3'};
  const bgm = new Audio(); bgm.loop=true; bgm.preload='auto'; let currentTrack=''; let battleLevel=3;
  try { const v=JSON.parse(localStorage.getItem('sky-fight-audio-v2')||'{}'); enabled=v.enabled!==false; musicVol=Number.isFinite(v.music)?v.music:.38; sfxVol=Number.isFinite(v.sfx)?v.sfx:.85; } catch(_){}
  const save=()=>{try{localStorage.setItem('sky-fight-audio-v2',JSON.stringify({enabled,music:musicVol,sfx:sfxVol}));}catch(_){}};
  function init(){
    if(!AC)return false;
    if(!ctx){
      ctx=new AC();master=ctx.createGain();master.gain.value=enabled?1:0;master.connect(ctx.destination);
      musicBus=ctx.createGain();musicBus.gain.value=musicVol*.18;musicBus.connect(master);
      sfxBus=ctx.createGain();sfxBus.gain.value=sfxVol*.82;const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-14;limiter.knee.value=8;limiter.ratio.value=9;limiter.attack.value=.002;limiter.release.value=.12;sfxBus.connect(limiter);limiter.connect(master);
      nextBeat=ctx.currentTime+.05;
    }
    if(ctx.state==='suspended')ctx.resume().catch(()=>{});
    syncBgm();
    return true;
  }
  function tone(freq,when,duration,type='triangle',gain=.25,bus=musicBus,slide=0){
    if(!ctx || !bus || freq<=0)return;
    const o=ctx.createOscillator(), g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,when);
    if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(35,freq*slide),when+duration);
    g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),when+.009);
    g.gain.exponentialRampToValueAtTime(.0001,when+duration);
    o.connect(g);g.connect(bus);o.start(when);o.stop(when+duration+.025);
  }
  function noise(when,duration,gain=.15,cutoff=2200,bus=sfxBus){
    if(!ctx)return;
    const len=Math.ceil(ctx.sampleRate*Math.max(duration,.02));const buf=ctx.createBuffer(1,len,ctx.sampleRate);const arr=buf.getChannelData(0);
    for(let i=0;i<len;i++)arr[i]=(Math.random()*2-1)*(1-i/len);
    const src=ctx.createBufferSource();src.buffer=buf;const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=cutoff;
    const g=ctx.createGain();g.gain.value=gain;src.connect(f);f.connect(g);g.connect(bus);src.start(when);
  }
  const homeMelody=[0,3,7,10,7,3,5,7,0,3,8,12,10,7,5,3];
  const battleMelody=[0,0,7,10,12,10,7,5,0,3,7,10,14,12,10,7];
  function tick(){
    if(!ctx||ctx.state!=='running')return;
    const bpm=scene==='battle'?152:scene==='home'?112:0;
    if(!bpm){nextBeat=ctx.currentTime+.07;return;}
    const beat=60/bpm/2;
    if(nextBeat<ctx.currentTime-.4)nextBeat=ctx.currentTime+.04;
    while(nextBeat<ctx.currentTime+.16){
      const i=step%16, root=scene==='battle'?110:130.81, seq=scene==='battle'?battleMelody:homeMelody;
      const note=root*Math.pow(2,seq[i]/12);
      tone(note*2,nextBeat,beat*.78,scene==='battle'?'sawtooth':'triangle',scene==='battle'?.11:.14);
      if(i%2===0)tone(root/2*Math.pow(2,([0,0,5,7][Math.floor(i/4)])/12),nextBeat,beat*1.7,'triangle',.18);
      if(scene==='battle'){
        if(i%4===0)tone(65,nextBeat,.12,'sine',.32,musicBus,.3);
        if(i%4===2)noise(nextBeat,.045,.045,3800,musicBus);
        if(i%2===1)noise(nextBeat,.025,.014,6000,musicBus);
      }else if(i%4===0){tone(root/2,nextBeat,.26,'sine',.14);}
      step++;nextBeat+=beat;
    }
  }
  function sfx(name){
    if(!ctx||ctx.state!=='running'||!enabled||sfxVol===0)return;
    const t=ctx.currentTime+.005;
    switch(name){
      case 'click': // crisp double-layer menu confirm
        tone(960,t,.065,'square',.21,sfxBus,1.22);
        tone(1480,t+.028,.105,'triangle',.34,sfxBus,.85);
        noise(t,.035,.19,6200);break;
      case 'select': // character/level selection sparkle
        tone(620,t,.075,'triangle',.31,sfxBus,1.35);
        tone(1040,t+.045,.12,'sine',.29,sfxBus,1.2);
        noise(t,.025,.12,6500);break;
      case 'punch': // short air swipe with hard attack transient
        noise(t,.11,.46,2400);
        noise(t,.026,.33,6500);
        tone(240,t,.12,'sawtooth',.24,sfxBus,.43);break;
      case 'kick': // longer, sharper sweeping strike
        noise(t,.17,.53,3200);
        noise(t+.035,.06,.29,6800);
        tone(350,t,.18,'sawtooth',.29,sfxBus,.29);break;
      case 'hit': // strong impact, crack and low body
        noise(t,.16,.65,2200);
        noise(t,.035,.56,7000);
        tone(175,t,.18,'sawtooth',.38,sfxBus,.35);
        tone(92,t+.02,.16,'sine',.35,sfxBus,.45);break;
      case 'guard': // metallic clash
        noise(t,.11,.45,5200);
        tone(850,t,.16,'square',.21,sfxBus,.71);
        tone(1240,t+.02,.13,'triangle',.22,sfxBus,.76);break;
      case 'jump':
        tone(300,t,.17,'sine',.35,sfxBus,1.9);
        noise(t,.065,.12,2800);break;
      case 'special': // bright charge-up, rising power and burst
        tone(210,t,.4,'sawtooth',.32,sfxBus,3.5);
        tone(480,t+.07,.37,'triangle',.34,sfxBus,2.2);
        tone(880,t+.23,.24,'square',.17,sfxBus,1.5);
        noise(t+.20,.20,.44,4800);break;
      case 'count':
        tone(760,t,.16,'square',.28,sfxBus,.85);
        tone(1140,t,.10,'sine',.20,sfxBus);break;
      case 'fight':
        noise(t,.18,.40,5300);
        tone(520,t,.18,'sawtooth',.33,sfxBus,1.4);
        tone(1040,t+.085,.32,'triangle',.42,sfxBus,1.1);break;
      case 'win':
      case 'lose': // result themes are played as full MP3 tracks instead
        break;
    }
  }
  function syncBgm(){
    const target=scene==='battle'?'battle':(['win','lose'].includes(scene)?scene:(['home','select'].includes(scene)?'home':''));
    bgm.volume=enabled?Math.min(1,musicVol*.43):0;
    if(!target){bgm.pause();return;}
    bgm.loop=target!=='win'&&target!=='lose';
    if(currentTrack!==tracks[target]){currentTrack=tracks[target];bgm.pause();bgm.src=tracks[target];bgm.load();}
    if(enabled&&musicVol>0)bgm.play().catch(()=>{});else bgm.pause();
  }
  function setScene(id,lvl){
    if(Number.isFinite(lvl))battleLevel=lvl;
    const next=(id==='win'||id==='lose')?id:id==='battle'?'battle':id==='home'?'home':(['select','difficulty','versus'].includes(id)?'select':'silent');
    if(next!==scene){scene=next;step=0;}
    syncBgm();
  }
  function updateUI(){
    const b=document.getElementById('audioToggle');if(b){b.textContent=enabled?'🔊 SOUND ON':'🔇 SOUND OFF';b.setAttribute('aria-pressed',String(enabled));}
    if(ctx){master.gain.setTargetAtTime(enabled?1:0,ctx.currentTime,.03);musicBus.gain.setTargetAtTime(musicVol*.18,ctx.currentTime,.03);sfxBus.gain.setTargetAtTime(sfxVol*.82,ctx.currentTime,.03);}
    syncBgm();
    save();
  }
  window.SkyAudio={scene:setScene,sfx,unlock:init};
  document.addEventListener('pointerdown',init,{passive:true});
  document.addEventListener('keydown',init);
  document.addEventListener('click',e=>{
    if(e.target.closest('#audioPanel'))return;
    const b=e.target.closest('button');if(b)sfx(b.classList.contains('fighter')||b.classList.contains('level')?'select':'click');
  });
  document.getElementById('audioToggle')?.addEventListener('click',()=>{init();enabled=!enabled;updateUI();if(enabled)sfx('select');});
  document.getElementById('audioSettings')?.addEventListener('click',()=>{init();const el=document.getElementById('audioOptions');el.hidden=!el.hidden;document.getElementById('audioSettings').setAttribute('aria-expanded',String(!el.hidden));sfx('click');});
  document.getElementById('musicVolume')?.addEventListener('input',e=>{musicVol=+e.target.value/100;updateUI();});
  document.getElementById('sfxVolume')?.addEventListener('input',e=>{sfxVol=+e.target.value/100;updateUI();});
  document.getElementById('musicVolume').value=Math.round(musicVol*100);
  document.getElementById('sfxVolume').value=Math.round(sfxVol*100);
  updateUI();
})();
