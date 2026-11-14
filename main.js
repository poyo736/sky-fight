const fighters=[
 {id:'dai',image:'assets/dai.png',name:'ダイ',type:'バランス型',avatar:'🔥',color:'#4c9cff',stats:[3,3,3,3,3],special:'ファイアボール',description:'全能力が均等な万能ファイター。'},
 {id:'mii',image:'assets/mii.png',name:'ミー',type:'特殊・防御型',avatar:'⚡',color:'#bc77ff',stats:[3,4,4,2,2],special:'左右にレーザー',description:'特殊攻撃と防御に優れたテクニック型。'},
 {id:'sei',image:'assets/sei.png',name:'セイ',type:'スピード型',avatar:'☄️',color:'#ff6868',stats:[4,2,2,3,4],special:'4発の流星群',description:'素早い近接攻撃が得意なファイター。'},
 {id:'lala',image:'assets/lala.png',name:'ララ',type:'高火力・高速型',avatar:'🐩',color:'#ffcc56',stats:[5,2,2,1,5],special:'餌を食べて体力回復',description:'小さな当たり判定と高い攻撃力が特徴。'},
 {id:'kisachi',image:'assets/kisachi.png',name:'キサチ',type:'パワー・防御型',avatar:'🍺',color:'#ffad48',stats:[5,2,4,2,2],special:'酔拳',description:'ビールを片手に豪快な連続パンチ！攻守に優れたファイター。'},
 {id:'shinko',image:'assets/shinko.png',name:'シンコ',type:'体力・テクニック型',avatar:'💗',color:'#ff70bb',stats:[2,4,3,4,2],special:'根性',description:'高い体力と巧みな立ち回り。根性で一時的に防御力アップ！'}
];
const takeBoss={id:'take',image:'assets/take.png',name:'タケ',type:'隠しボス・超パワー型',avatar:'👴',color:'#bd79ff',stats:[5,3,4,4,2],special:'タケの一撃',description:'普段はよぼよぼ、戦えば伝説。'};
let phase='player',player=null,cpu=null,selected=fighters[0],level=3;
let bossEncounter=false, bossPending=false, regularCpu=null, regularLevel=3, bossCleared=false;
const $=id=>document.getElementById(id);
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===id));window.SkyAudio?.scene(id,level);}
function renderFighters(){
 $('characterList').innerHTML='';
 fighters.forEach(f=>{const card=document.createElement('button');card.className='fighter'+(f.id===selected.id?' chosen':'');card.style.setProperty('--accent',f.color);card.innerHTML=`<div class="avatar"><img src="${f.image}" alt="${f.name}の立ち絵"></div><strong>${f.name}</strong><small>${f.type}</small>`;card.addEventListener('click',()=>{selected=f;renderFighters();renderDetail();});$('characterList').appendChild(card);});
}
function renderDetail(){
 $('characterName').textContent=selected.name;
 $('detailImage').src=selected.image;
 $('detailImage').alt=selected.name+'の立ち絵';
 $('detailImage').style.filter='drop-shadow(0 0 18px '+selected.color+'66)';
 $('characterType').textContent='タイプ：'+selected.type;
 $('characterSpecial').textContent='特殊攻撃：'+selected.special;
 $('characterDescription').textContent=selected.description;
 drawRadar(selected.stats,selected.color);
}
function drawRadar(stats,color){
 const canvas=$('radar'),ctx=canvas.getContext('2d'),cx=160,cy=145,r=92;
 ctx.clearRect(0,0,320,290);const labels=['物理攻撃','特殊攻撃','防御','体力','素早さ'];
 const point=(i,v)=>{const a=-Math.PI/2+i*2*Math.PI/5;return [cx+Math.cos(a)*r*v/5,cy+Math.sin(a)*r*v/5];};
 for(let lv=1;lv<=5;lv++){ctx.beginPath();for(let i=0;i<5;i++){const [x,y]=point(i,lv);i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.strokeStyle='#4e5a78';ctx.stroke();}
 for(let i=0;i<5;i++){const [x,y]=point(i,5);ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);ctx.strokeStyle='#4e5a78';ctx.stroke();const [tx,ty]=point(i,6.6);ctx.fillStyle='#f0f4ff';ctx.font='13px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(labels[i],tx,ty);}
 ctx.beginPath();stats.forEach((v,i)=>{const [x,y]=point(i,v);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();ctx.fillStyle=color+'55';ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=3;ctx.stroke();
}
function beginSelect(){bossEncounter=false;bossPending=false;bossCleared=false;phase='player';player=null;cpu=null;selected=fighters[0];$('selectGuide').textContent='操作するキャラクターを選んでね！';renderFighters();renderDetail();show('select');}
$('startButton').addEventListener('click',beginSelect);
$('confirmButton').addEventListener('click',()=>{if(phase==='player'){player=selected;phase='cpu';selected=fighters.find(f=>f.id!==player.id);$('selectGuide').textContent='対戦するCPUキャラクターを選んでね！';renderFighters();renderDetail();}else{cpu=selected;showDifficulty();}});
$('backButton').addEventListener('click',()=>{if(phase==='cpu'){phase='player';selected=player;player=null;$('selectGuide').textContent='操作するキャラクターを選んでね！';renderFighters();renderDetail();}else show('home');});
const levelData = [
  ['ROOKIE','はじめての対戦','ゆっくり動く練習相手'],
  ['BEGINNER','ウォームアップ','基本の攻撃を覚えよう'],
  ['NORMAL','スタンダード','バランスの良いCPU'],
  ['SKILLED','チャレンジャー','反撃とガードが増える'],
  ['EXPERT','ベテラン','攻守の切り替えが速い'],
  ['ELITE','エリート','間合いを見て攻めてくる'],
  ['MASTER','マスター','隙を逃さない強敵'],
  ['GRANDMASTER','グランドマスター','精密な反撃と回避'],
  ['LEGEND','レジェンド','必殺技を使いこなす'],
  ['NIGHTMARE','最強の挑戦者','超高速の判断・強烈な連撃']
];
function showDifficulty(){
  $('matchup').textContent=`${player.name} VS ${cpu.name}`;
  const container=$('levels');container.innerHTML='';
  for(let i=1;i<=10;i++){
    const [rank,title,description]=levelData[i-1];
    const b=document.createElement('button');
    b.type='button';b.className='level level-'+i+(level===i?' chosen':'');
    b.setAttribute('aria-pressed',String(level===i));
    b.innerHTML=`<span class="level-index">${String(i).padStart(2,'0')}</span><span class="level-meta"><strong>${rank}</strong><small>${title}</small></span><span class="level-chevron">↗</span>`;
    b.addEventListener('click',()=>{level=i;showDifficulty();});container.appendChild(b);
  }
  const [rank,title,description]=levelData[level-1];
  $('levelCurrent').textContent=`LEVEL ${String(level).padStart(2,'0')} — ${rank}`;
  $('levelDescription').textContent=description;
  $('levelDanger').style.width=(level*10)+'%';
  $('levelDanger').classList.toggle('max',level===10);
  $('difficulty').classList.toggle('nightmare-selected',level===10);
  show('difficulty');
}
$('difficultyBack').addEventListener('click',()=>{phase='cpu';selected=cpu;renderFighters();renderDetail();show('select');});
// CPU難易度決定後に、対戦カードを表示する
function showVersus() {
  if (!player || !cpu) return;
  $('vsPlayerImage').src = player.image;
  $('vsPlayerImage').alt = player.name + 'の立ち絵';
  $('vsPlayerName').textContent = player.name;
  $('vsPlayerSpecial').textContent = 'SPECIAL : ' + player.special;

  $('vsCpuImage').src = cpu.image;
  $('vsCpuImage').alt = cpu.name + 'の立ち絵';
  $('vsCpuName').textContent = cpu.name;
  $('vsCpuSpecial').textContent = 'SPECIAL : ' + cpu.special;
  $('vsLevel').textContent = 'CPU LEVEL ' + level;
  show('versus');
}

$('battleButton').addEventListener('click', showVersus);
$('vsBack').addEventListener('click', showDifficulty);
$('vsConfirm').addEventListener('click', startBattle);
// STEP 5: 旧READY画面のhomeButtonは存在しないため削除。
// バトル画面のホームへ戻る操作はbattleHomeButtonで処理します。


// STEP 18: 全4キャラクターの必殺技を実装
const arena = $('arena');
const pen = arena.getContext('2d');
const keys = new Set();
let match = null;
let lastFrame = 0;
let animationId = null;
const FLOOR = 432;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

function createCombatant(f, x, facing) {
  const maxHp = 76 + f.stats[3] * 9;
  return { f, x, y: FLOOR, vx: 0, vy: 0, facing, hp: maxHp, maxHp,
    width: f.id === 'lala' ? 78 : 82, height: f.id === 'lala' ? 100 : 180,
    guard: false, attack: null, attackUntil: 0, hitDone: false,
    stunnedUntil: 0, cooldownUntil: 0, aiNext: 0, aiGuardUntil: 0, aiPlan: 0,
    animClock: 0, animState: "idle", animSince: 0, lastGrounded: true,
    landingUntil: 0, hitFlashUntil: 0, specialMeter: 0, specialReady: false, specialUsed: false, specialUntil: 0, specialCooldown: 0, guardEnergy: 3, healFxUntil: 0, defenseUntil: 0 };
}
function startBattle() {
  if (!player || !cpu) return;
  keys.clear();
  clearSpecialCutin();
  if (animationId) cancelAnimationFrame(animationId);
  match = { p: createCombatant(player, 240, 1), c: createCombatant(cpu, 760, -1),
    time: 90, round: 1, winsP: 0, winsC: 0, roundPause: 0, pendingRound: false, running: false, over: false, cutInRemaining: 0, countdown: 0, countdownPhase: "ready", elapsed: 0, now: 0, aiAttack: false, effects: [], particles: [], rings: [], shake: 0, flash: 0 };
  $('pName').textContent = player.name;
  $('cName').textContent = cpu.name;
  $('battleLevel').textContent = bossEncounter ? 'SECRET BOSS · TAKE' : 'CPU LEVEL ' + level;
  updateRoundHud();
  $('overlayTitle').textContent = '3';
  $('overlayInfo').textContent = 'ROUND 1 · GET READY';
  $('overlayButton').hidden = true;
  $('battleOverlay').classList.add('countdown-mode');
  $('battleOverlay').classList.remove('hidden');
  updateHud();
  show('battle');
  lastFrame = 0;
  animationId = requestAnimationFrame(frame);
}
function updateRoundHud(){
  if(!match)return;
  $('roundNumber').textContent='ROUND '+match.round+' / 3';
  $('pRoundWins').textContent='●'.repeat(match.winsP)+'○'.repeat(2-match.winsP);
  $('cRoundWins').textContent='●'.repeat(match.winsC)+'○'.repeat(2-match.winsC);
}
function resetRound(){
  const m=match;
  m.p=createCombatant(player,240,1);
  m.c=createCombatant(cpu,760,-1);
  m.time=90;m.elapsed=0;m.now=0;
  m.effects=[];m.particles=[];m.rings=[];m.shake=0;m.flash=0;
  m.cutInRemaining=0;m.countdown=0;m.countdownPhase='ready';
  m.roundPause=0;m.pendingRound=false;m.running=false;
  clearSpecialCutin();keys.clear();
  $('overlayTitle').textContent='3';
  $('overlayInfo').textContent='ROUND '+m.round+' · GET READY';
  $('overlayButton').hidden=true;
  $('battleOverlay').classList.add('countdown-mode');
  $('battleOverlay').classList.remove('hidden','fight-phase');
  updateRoundHud();updateHud();
}
function endRound(winner, byTime=false){
  if(!match||match.over||match.pendingRound)return;
  const m=match;
  m.running=false;keys.clear();clearSpecialCutin();
  if(winner==='p')m.winsP++;else m.winsC++;
  updateRoundHud();
  if(m.winsP>=2||m.winsC>=2||m.round>=3){
    finish(m.winsP>m.winsC?'WIN!':'LOSE!',(m.winsP>m.winsC?player.name:cpu.name)+' の勝利！ '+m.winsP+' - '+m.winsC);
    return;
  }
  m.pendingRound=true;m.roundPause=2.2;
  const overlay=$('battleOverlay');
  overlay.classList.remove('hidden','countdown-mode','fight-phase');
  $('overlayTitle').textContent=winner==='p'?'ROUND WIN!':'ROUND LOSE';
  $('overlayInfo').textContent=(byTime?'TIME UP · ':'')+'ROUND '+m.round+' / 3 · '+m.winsP+' - '+m.winsC+'　次のラウンドへ！';
  $('overlayButton').hidden=true;
}
function updateHud() {
  if (!match) return;
  for (const [side, f] of [['p', match.p], ['c', match.c]]) {
    $(side + 'Hp').style.width = (100 * f.hp / f.maxHp) + '%';
    $(side + 'HpText').textContent = Math.ceil(f.hp) + ' / ' + f.maxHp;
  }
  $('battleTime').textContent = Math.ceil(match.time);
  for(const [side,f] of [['p',match.p],['c',match.c]]){
    const e=$(side+'Special');
    if(e)e.textContent=f.specialMeter>=100 ? 'SPECIAL READY!  [I]' : 'SPECIAL '+Math.floor(f.specialMeter)+'% · 攻撃/被弾でチャージ';
    const meter=$(side+'Meter');if(meter)meter.style.width=f.specialMeter+'%';
    const track=$(side+'MeterTrack');if(track)track.classList.toggle('meter-ready',f.specialMeter>=100);
    const g=$(side+'Guard');if(g)g.style.width=(f.guardEnergy/3*100)+'%';
  }
}
function attack(f, kind) {
  if (!match?.running || match.over || match.now < f.cooldownUntil || match.now < f.stunnedUntil) return;
  window.SkyAudio?.sfx(kind);
  f.attack = kind;
  const pace = 1 + (f.f.stats[4] - 3) * .065;
  f.attackUntil = match.now + (kind === 'kick' ? 0.30 : 0.22) / pace;
  f.cooldownUntil = match.now + (kind === 'kick' ? 0.68 : 0.43) / pace;
  if(f.f.id === 'kisachi') f.cooldownUntil += .10; // 重い一撃には隙を作る
  f.hitDone = false;
}
// STEP 31: Hit-confirmed attacks and taking damage charge the special meter.
function chargeSpecial(f,amount){
  if(!f || !Number.isFinite(amount))return;
  const wasReady=f.specialMeter>=100;
  f.specialMeter=clamp(f.specialMeter+amount,0,100);
  f.specialReady=f.specialMeter>=100;
  if(!wasReady&&f.specialReady&&f===match.p){
    window.SkyAudio?.sfx('select');
    burst(f.x,f.y-f.height*.6,'#ffe87a',20,135);
    ring(f.x,f.y-f.height*.6,'#ffdd69',15,90,.45);
  }
}

function applyDamage(attacker, target, raw, knock=18){
  if(match.over)return;
  const cpuBonus=(attacker===match.c ? 1 + Math.max(0,level-5)*.055 : 1);
   const defenseFactor = 1 - (target.f.stats[2] - 3) * .065;
  const amount=Math.max(1,Math.round(raw*cpuBonus*defenseFactor*(target.guard?.2:1)*(match.now<target.defenseUntil?.30:1)));
  target.hp=Math.max(0,target.hp-amount);
  window.SkyAudio?.sfx(target.guard?'guard':'hit');
  burst(target.x,target.y-target.height*.52,target.guard?'#8beaff':'#ffe1a1',target.guard?10:20,150);
  ring(target.x,target.y-target.height*.52,target.guard?'#5deaff':'#ffca68',10,55,.26);
  match.shake=Math.max(match.shake,target.guard?3:7);
  match.flash=Math.max(match.flash,target.guard?.03:.09);
  target.stunnedUntil=match.now+(target.guard?.07:.18);
  target.hitFlashUntil=match.now+.16;
  target.x=clamp(target.x+attacker.facing*(target.guard?5:knock),45,955);
  // Guarded hits grant less meter to the attacker; damage taken also builds meter.
  chargeSpecial(attacker,target.guard?9:Math.max(15,amount*1.5));
  chargeSpecial(target,target.guard?Math.max(4,amount*.65):Math.max(11,amount*1.05));
  if(target.hp<=0)endRound(attacker===match.p?'p':'c');
  updateHud();
}
// STEP19: lightweight Canvas VFX (no additional image assets needed).
function burst(x,y,color,count=20,power=170){
  for(let i=0;i<count;i++){
    const a=Math.random()*Math.PI*2, speed=power*(.3+Math.random()*.9),life=.3+Math.random()*.45;
    match.particles.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed-35,life,maxLife:life,r:2+Math.random()*4,color});
  }
}
function ring(x,y,color,r=15,max=105,life=.42){match.rings.push({x,y,color,r,max,life,maxLife:life});}
function vfxUpdate(dt){
  for(const p of match.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=180*dt;p.life-=dt;}
  match.particles=match.particles.filter(p=>p.life>0).slice(-350);
  for(const r of match.rings)r.life-=dt;
  match.rings=match.rings.filter(r=>r.life>0);
  match.shake=Math.max(0,(match.shake||0)-dt*28);
  match.flash=Math.max(0,(match.flash||0)-dt*2.8);
}
function drawVfx(){
  const c=pen;
  for(const r of match.rings){
    const u=1-r.life/r.maxLife;
    c.save();c.globalAlpha=(1-u)*.85;c.strokeStyle=r.color;c.lineWidth=6*(1-u)+1;
    c.shadowBlur=15;c.shadowColor=r.color;c.beginPath();c.arc(r.x,r.y,r.r+(r.max-r.r)*u,0,Math.PI*2);c.stroke();c.restore();
  }
  for(const p of match.particles){
    c.save();c.globalAlpha=Math.max(0,p.life/p.maxLife);c.fillStyle=p.color;c.shadowColor=p.color;c.shadowBlur=10;
    c.beginPath();c.arc(p.x,p.y,p.r,0,Math.PI*2);c.fill();c.restore();
  }
}
// STEP 29: Cinematic character-specific special cut-ins, including CPU specials.
function playSpecialCutin(f){
  const el=$('specialCutin');
  if(!el || !match)return;
  const isPlayer=f===match.p;
  const palette={take:['#ae67ff','#f6e7ff'],dai:['#ff7c38','#ffcf56'],mii:['#a75aff','#6cf4ff'],sei:['#ff455f','#ffca4c'],lala:['#f9b848','#7effbd'],kisachi:['#f6a13e','#ffe0a0'],shinko:['#fc63b7','#ffffff']};
  const [primary,secondary]=palette[f.f.id]||palette.dai;
  el.style.setProperty('--cutin-primary',primary);
  el.style.setProperty('--cutin-secondary',secondary);
  el.classList.toggle('cutin-cpu',!isPlayer);
  $('cutinPortrait').src=f.f.image;
  $('cutinName').textContent=f.f.name;
  $('cutinMove').textContent=f.f.special;
  $('cutinSide').textContent=isPlayer?'PLAYER SPECIAL':'CPU SPECIAL';
  $('cutinLabel').textContent=f.f.id==='lala'?'RECOVERY BURST':f.f.id==='shinko'?'DEFENSE BOOST':'SPECIAL ATTACK';
  el.classList.remove('cutin-active');
  void el.offsetWidth;
  el.classList.add('cutin-active');
  el.setAttribute('aria-hidden','false');
  match.cutInRemaining=1.02;
  keys.clear();
}
function clearSpecialCutin(){
  const el=$('specialCutin');
  if(el){el.classList.remove('cutin-active');el.setAttribute('aria-hidden','true');}
}
function specialAttack(f){
  if(!match?.running||match.over||match.cutInRemaining>0||f.specialMeter<100||match.now<f.specialCooldown||match.now<f.stunnedUntil)return;
  f.specialMeter=0;f.specialReady=false;
  window.SkyAudio?.sfx('special');
  playSpecialCutin(f);
  f.specialCooldown=match.now+0.8;
  updateHud();
  f.specialUntil=match.now+.55;
  f.animState='special';f.animSince=match.now;
  const target=f===match.p?match.c:match.p;
  const fx=match.effects;
  if(f.f.id==='dai'){
    fx.push({type:'fire',owner:f,x:f.x+f.facing*55,y:f.y-105,vx:f.facing*490,ttl:1.7,hit:false});
    burst(f.x+f.facing*55,f.y-105,'#ffb34c',28,190);
    ring(f.x+f.facing*55,f.y-105,'#ff9a31',12,80,.34);
  }else if(f.f.id==='mii'){
    fx.push({type:'laser',owner:f,x:f.x,y:f.y-102,ttl:.40,hit:false});
    burst(f.x,f.y-102,'#e4b4ff',42,260);
    ring(f.x,f.y-102,'#b96bff',25,180,.38);
    match.flash=.20;match.shake=8;
  }else if(f.f.id==='sei'){
    for(let i=0;i<4;i++)fx.push({type:'meteor',owner:f,x:clamp(target.x+(i-1.5)*66,45,955),y:-80-i*75,vy:420+i*42,ttl:2.2,hit:false});
    ring(target.x,FLOOR-15,'#ff7546',45,220,.9);
  }else if(f.f.id==='take'){
    fx.push({type:'takePunch',owner:f,delay:.24,ttl:1.0,hit:false});
    burst(f.x+f.facing*65,f.y-105,'#bd79ff',46,250);
    ring(f.x+f.facing*70,f.y-100,'#dfb0ff',28,190,.55);
    match.shake=15;match.flash=.15;
  }else if(f.f.id==='kisachi'){
    // 酔拳：近距離で3連撃。攻撃をガードされても軽減される。
    for(let i=0;i<3;i++)fx.push({type:'drunkenPunch',owner:f,delay:.13+i*.19,ttl:.85,hit:false});
    burst(f.x+f.facing*55,f.y-105,'#ffb548',28,180);
    ring(f.x+f.facing*55,f.y-105,'#ffdc85',16,100,.45);
  }else if(f.f.id==='shinko'){
    // 根性：5秒間、受けるダメージを70%軽減。
    f.defenseUntil=match.now+5;
    fx.push({type:'guts',owner:f,ttl:5});
    burst(f.x,f.y-f.height*.55,'#ff70bd',40,175);
    ring(f.x,f.y-f.height*.55,'#ff9ed6',30,135,.8);
    updateHud();
  }else{
    f.hp=Math.min(f.maxHp,f.hp+Math.round(f.maxHp*.19));
    f.healFxUntil=match.now+1.2;
    fx.push({type:'food',owner:f,x:f.x,y:f.y-150,ttl:1.2});
    burst(f.x,f.y-f.height*.65,'#7dffb4',40,160);
    ring(f.x,f.y-f.height*.6,'#62ffad',20,120,.75);
    updateHud();
  }
}
function updateEffects(dt){
  const fx=match.effects;
  for(let i=fx.length-1;i>=0;i--){
    const e=fx[i],target=e.owner===match.p?match.c:match.p;
    e.ttl-=dt;
    if(e.type==='takePunch'){
      e.delay-=dt;
      if(!e.hit&&e.delay<=0){
        e.hit=true;
        const x=e.owner.x+e.owner.facing*90,y=e.owner.y-105;
        burst(x,y,'#d7a2ff',38,240);ring(x,y,'#e3b6ff',25,145,.5);
        match.shake=18;match.flash=.2;
        if(Math.abs(e.owner.x-target.x)<215&&Math.abs(e.owner.y-target.y)<125){
          // Boss signature: guard-breaking strike, mitigated by target's base defense.
          const prev=target.guard;target.guard=false;
          applyDamage(e.owner,target,23,48);
          target.guard=prev;
        }
      }
    }else if(e.type==='drunkenPunch'){
      e.delay-=dt;
      if(!e.hit&&e.delay<=0){
        e.hit=true;
        const x=e.owner.x+e.owner.facing*78,y=e.owner.y-e.owner.height*.57;
        burst(x,y,'#ffcc7b',20,170);ring(x,y,'#ff9f48',12,80,.3);
        if(Math.abs(e.owner.x-target.x)<170&&Math.abs(e.owner.y-target.y)<110){
          applyDamage(e.owner,target,7+e.owner.f.stats[0]*.65,16);
        }
      }
    }else if(e.type==='fire'){
      e.x+=e.vx*dt;
      if(Math.random()<.85)burst(e.x-e.vx*.018,e.y,'#ff9d32',2,45);
      if(!e.hit&&Math.abs(e.x-target.x)<target.width*.5+22&&Math.abs(e.y-(target.y-target.height*.55))<target.height*.6){
        applyDamage(e.owner,target,21+e.owner.f.stats[1]*1.8,32);e.hit=true;e.ttl=0;
      }
      if(e.x<0||e.x>1000)e.ttl=0;
    }else if(e.type==='laser'&&!e.hit){
      // 両方向に発射する水平レーザー。防御可能。
      if(Math.abs(target.y-target.height*.55-e.y)<target.height*.55+16)applyDamage(e.owner,target,19+e.owner.f.stats[1]*1.7,22);
      e.hit=true;
    }else if(e.type==='meteor'){
      e.y+=e.vy*dt;
      if(!e.hit&&e.y>=target.y-target.height*.85&&e.y<=target.y+12&&Math.abs(e.x-target.x)<target.width*.5+24){
        applyDamage(e.owner,target,8+e.owner.f.stats[1],13);e.hit=true;
      }
      if(e.y>=FLOOR&&!e.impacted){
        e.impacted=true;burst(e.x,FLOOR-8,'#ff8a4c',34,220);
        ring(e.x,FLOOR-8,'#ffb065',12,100,.43);
        match.shake=Math.max(match.shake,9);match.flash=Math.max(match.flash,.12);
      }
      if(e.y>=FLOOR){e.hit=true;e.ttl=Math.min(e.ttl,.18);}
    }
    if(e.ttl<=0)fx.splice(i,1);
  }
}
function tryHit(a, b) {
  if (!a.attack || a.hitDone || match.now > a.attackUntil) return;
  const reach = a.attack === 'kick' ? 118 : 93;
  const delta = b.x - a.x;
  if (Math.sign(delta) !== a.facing || Math.abs(delta) > reach + b.width / 2 ||
      Math.abs(a.y - b.y) > 105) return;
  const base = a.attack === 'kick' ? 12 : 7;
  applyDamage(a,b,base+a.f.stats[0]*1.3,23);
  a.hitDone=true;
}
function finish(title, info) {
  match.running = false; match.over = true;
  clearSpecialCutin();
  const won=title.includes('WIN');
  bossPending=false;
  if(bossEncounter){
    if(won){title='LEGEND CLEAR!';info='伝説のタケに勝利！ '+info;bossCleared=true;}
    else{title='タケに敗北した！';info='';}
  }else if(won && !bossCleared && Math.random()<.20){
    bossPending=true;
    title='WARNING!';
    info='タケが勝負を挑んできた！';
  }
  window.SkyAudio?.scene(won?'win':'lose');
  $('overlayTitle').textContent = title;
  $('overlayInfo').textContent = info;
  $('overlayButton').textContent = bossPending?'タケに挑戦！':bossEncounter?'通常ステージに戻る':'もう一度戦う';
  $('overlayButton').hidden = false;
  $('battleOverlay').classList.remove('hidden','countdown-mode','fight-phase');
}
function leaveTakeEncounter(){
  bossEncounter=false;bossPending=false;bossCleared=false;
  if(regularCpu){cpu=regularCpu;level=regularLevel;regularCpu=null;}
}
function startTakeBoss(){
  bossPending=false;bossEncounter=true;
  regularCpu=cpu;regularLevel=level;
  cpu=takeBoss;level=10;
  startBattle();
}
function update(dt) {
  const m = match; m.now += dt; m.elapsed += dt;
  m.time = Math.max(0, 90 - m.elapsed);
  const p = m.p, c = m.c;
  p.facing = c.x >= p.x ? 1 : -1;
  c.facing = -p.facing;
  p.guard = keys.has('l') && m.now >= p.stunnedUntil && p.guardEnergy>0;
  p.vx = (keys.has('a') ? -1 : 0) * (190 + p.f.stats[4] * 27) + (keys.has('d') ? 1 : 0) * (190 + p.f.stats[4] * 27);
  if (p.guard || m.now < p.stunnedUntil) p.vx = 0;
  // 10段階AI: 反応速度、間合い管理、ガード、反撃、ジャンプ、必殺技判断を強化。
  // Lv10でも無限ガード・無限攻撃にならないよう、通常のクールダウンとガード残量を維持。
  if (m.now >= c.aiNext) {
    const gap=Math.abs(c.x-p.x);
    const high=level>=7, boss=level===10;
    const pThreat=p.attack!==null && m.now<p.attackUntil;
    const pSpecial=p.specialUntil>m.now;
    const inReach=gap < (high?157:140);
    const defendChance=Math.min(.94,.09+level*.077);
    const guardReaction=(pThreat||pSpecial)&&gap<175&&Math.random()<defendChance;
    if(guardReaction&&c.guardEnergy>.20)c.aiGuardUntil=m.now+(boss?.33:.14+level*.014);
    c.guard=c.guardEnergy>.05 && m.now<c.aiGuardUntil;
    // 近距離は距離を調整。高難度ではプレイヤーの攻撃中に後退することもある。
    const ideal=level>=8?103:level>=5?93:85;
    const moveSpeed=(190+c.f.stats[4]*27)*(.64+level*.036);
    if(c.guard)c.vx=0;
    else if(gap>ideal+22)c.vx=c.facing*moveSpeed;
    else if(gap<ideal-27)c.vx=-c.facing*(85+level*12);
    else c.vx=0;
    if(high&&pThreat&&gap<150&&!c.guard&&Math.random()<.40)c.vx=-c.facing*(190+level*11);
    // 攻撃頻度と種類。上位CPUはキックも活用し、間合いを維持する。
    const strikeChance=Math.min(.98,.18+level*.074);
    if(inReach&&!c.guard&&m.now>=c.cooldownUntil&&Math.random()<strikeChance){
      const kickChance=gap>108?.85:(.22+level*.035);
      attack(c,Math.random()<kickChance?'kick':'punch');
    }
    // プレイヤーが飛び越える際、Lv7以上は追いかけるより着地を待つ。
    if(level>=3&&c.y>=FLOOR&&gap<200&&Math.random()<(.013+level*.007) && !(high&&p.y<FLOOR-45)){
      c.vy=-760;c.vx=c.facing*(190+level*20);
    }
    if(c.specialMeter>=100&&m.now>=c.specialCooldown&&Math.random()<(.09+level*.072)){
      if(boss||gap<330||['sei','mii','lala','kisachi','shinko','take'].includes(c.f.id))specialAttack(c);
    }
    // 最上位でも正の判断間隔を保証する（元の式はLv8以上で負になっていた）。
    const intervals=[.72,.62,.54,.46,.38,.31,.25,.19,.14,.095];
    c.aiNext=m.now+intervals[level-1]+Math.random()*(boss?.035:.09);
  }
  if (m.now < c.stunnedUntil) c.vx = 0;
  for (const f of [p, c]) {
    const wasAirborne = f.y < FLOOR - 1;
    f.animClock += dt;
    f.guardEnergy=clamp(f.guardEnergy+(f.guard?-dt:dt*.65),0,3);
    if(f.guardEnergy<=0)f.guard=false;
    f.x = clamp(f.x + f.vx * dt, 45, 955);
    f.vy += 1550 * dt;
    f.y += f.vy * dt;
    if (f.y >= FLOOR) { f.y = FLOOR; f.vy = 0;
      if (wasAirborne) f.landingUntil = m.now + .20; }
    if (f.attack && m.now >= f.attackUntil) f.attack = null;
    const state = m.now < f.stunnedUntil ? "hit" : m.now<f.specialUntil ? "special" : f.guard ? "guard" :
      f.attack ? f.attack : f.y < FLOOR - 1 ? "jump" :
      Math.abs(f.vx) > 20 ? "run" : "idle";
    if (state !== f.animState) { f.animState = state; f.animSince = m.now; }
  }
  // STEP 20: 空中で相手を飛び越えられるようにする。
  // 足元の高さに十分な差がある間は、横方向の押し戻しを行わない。
  // 両者が地上（または近い高さ）なら、従来通りすり抜けを防止する。
  const minDist = (p.width + c.width) * .45;
  const verticalGap = Math.abs(p.y - c.y);
  const canPassOver = verticalGap > Math.min(p.height, c.height) * .48;
  if (!canPassOver && Math.abs(p.x - c.x) < minDist) {
    const delta = c.x - p.x;
    // 向きが切り替わる瞬間も押し戻し方向を安定させる。
    const direction = delta === 0 ? (p.facing || 1) : Math.sign(delta);
    const shift = (minDist - Math.abs(delta)) / 2;
    p.x = clamp(p.x - direction * shift, 45, 955);
    c.x = clamp(c.x + direction * shift, 45, 955);
  }
  tryHit(p, c); if (!m.over) tryHit(c, p);
  if(!m.over)updateEffects(dt);
  vfxUpdate(dt);
  if (m.time <= 0 && !m.over && !m.pendingRound) endRound(p.hp / p.maxHp >= c.hp / c.maxHp ? 'p' : 'c',true);
  updateHud();
}
// STEP 17: 全キャラクター共通の、立ち絵を崩さないモーション描画。
// ダイはSTEP15の修復スプライトを採用。選択画面用の元画像は維持。
const art = {};
for (const f of [...fighters, takeBoss]) {
  const im = new Image();
  im.src = f.id === 'dai' ? 'assets/dai_clean.png' : f.image;
  art[f.id] = im;
}
const easeMotion = v => { v=clamp(v,0,1);return v*v*(3-2*v); };
function attackEnvelope(u,kind){
  const hit=kind==='kick'?.48:.39;
  if(u<.2)return -.28*easeMotion(u/.2);
  if(u<hit)return -.28+1.28*easeMotion((u-.2)/(hit-.2));
  return 1-easeMotion((u-hit)/(1-hit));
}
function drawCombatant(f){
  const c=pen,img=art[f.f.id],state=f.animState,t=f.animClock;
  const elapsed=Math.max(0,match.now-f.animSince);
  const duration=state==='kick'?.30:.22;
  const u=clamp(elapsed/duration,0,1);
  const strike=(state==='punch'||state==='kick')?attackEnvelope(u,state):0;
  const impact=Math.max(0,strike);
  const walk=Math.sin(t*16);
  let dx=0,dy=0,angle=0,sx=1,sy=1;
  if(state==='idle'){dy=Math.sin(t*3)*1.8;sy+=Math.sin(t*3)*.006;}
  if(state==='run'){dy=-Math.abs(walk)*5;dx=walk*3;angle=walk*.018;sy+=Math.cos(t*16)*.007;}
  if(state==='jump'){angle=f.vy<0?-.055:.045;sy=1.035;sx=.975;}
  if(state==='punch'){dx=strike*28;angle=-strike*.075;sy=1+impact*.013;}
  if(state==='kick'){dx=strike*22;angle=strike*.085;sy=1-impact*.022;sx=1+impact*.03;}
  if(state==='guard'){dx=-6;angle=-.035;sx=.965;}
  if(state==='special'){dy=-5;angle=-.04;sy=1.025;}
  if(state==='hit'){dx=-10;angle=.07;sx=.975;}
  if(match.now<f.landingUntil&&state!=='jump'){
    const k=(f.landingUntil-match.now)/.2;sx*=1+.055*k;sy*=1-.06*k;
  }
  // 描画幅は元画像の縦横比を維持する（特にララの体型を潰さない）。
  const isLala=f.f.id==='lala';
  const height=f.height;
  const ratio=(img.complete&&img.naturalWidth)?img.naturalWidth/img.naturalHeight:(isLala?.9:.43);
  const width=height*ratio;
  c.save();c.translate(f.x,f.y);
  c.fillStyle='#0009';c.beginPath();c.ellipse(0,6,Math.max(25,width*.42),9,0,0,Math.PI*2);c.fill();
  if(f.facing<0)c.scale(-1,1);
  c.translate(dx,dy);c.rotate(angle);c.scale(sx,sy);
  if(img.complete&&img.naturalWidth)c.drawImage(img,-width/2,-height,width,height);
  else{c.fillStyle=f.f.color;c.fillRect(-width/2,-height,width,height);}
  if(match.now<f.hitFlashUntil){
    c.save();c.globalAlpha=.28;c.fillStyle='#fff';c.beginPath();c.ellipse(0,-height*.5,width*.5,height*.47,0,0,Math.PI*2);c.fill();c.restore();
  }
  if(state==='guard'){
    c.save();c.shadowBlur=18;c.shadowColor='#6fe6ff';c.strokeStyle='#6fe6ff';c.lineWidth=5;
    c.beginPath();c.ellipse(width*.18,-height*.52,width*.62,height*.48,0,-1.3,1.3);c.stroke();c.restore();
  }
  if((state==='punch'||state==='kick')&&impact>.03){
    const kick=state==='kick';
    const cx=width*.55+(kick?37:26),cy=-height*(kick?.27:.60);
    c.save();c.globalAlpha=Math.min(.9,impact*.85);c.shadowBlur=20;c.shadowColor=kick?'#ff9c39':f.f.color;
    c.strokeStyle=kick?'#ffca77':f.f.color;c.lineWidth=kick?8:7;
    for(let i=0;i<2;i++){
      c.beginPath();c.ellipse(cx+i*12,cy,kick?39+i*13:27+i*12,kick?23+i*8:31+i*9,kick?-.45:-.2,-1.15,1.25);c.stroke();
    }
    c.restore();
  }
  if(match.now<f.defenseUntil){
    c.save();c.globalAlpha=.62+.15*Math.sin(match.now*14);c.shadowBlur=24;c.shadowColor='#ff58b5';c.strokeStyle='#ff8acb';c.lineWidth=5;
    c.beginPath();c.ellipse(0,-height*.51,width*.70,height*.57,0,0,Math.PI*2);c.stroke();c.restore();
  }
  if(match.now<f.healFxUntil){
    c.save();c.font='bold 26px sans-serif';c.fillStyle='#72ffb0';c.textAlign='center';
    c.shadowBlur=15;c.shadowColor='#00ff80';c.fillText('+ HP',0,-height-15-(f.healFxUntil-match.now)*9);c.restore();
  }
  c.restore();
}
function drawEffects(){
  const c=pen;
  for(const e of match.effects){
    c.save();
    if(e.type==='fire'){
      c.shadowBlur=27;c.shadowColor='#ff8c19';
      const r=19+Math.sin(match.now*22)*3;
      const g=c.createRadialGradient(e.x,e.y,1,e.x,e.y,r*1.8);
      g.addColorStop(0,'#fffad0');g.addColorStop(.3,'#ffce46');g.addColorStop(.7,'#ff651f');g.addColorStop(1,'#ff371000');
      c.fillStyle=g;c.beginPath();c.arc(e.x,e.y,r*1.8,0,Math.PI*2);c.fill();
    }else if(e.type==='laser'){
      c.globalAlpha=Math.min(1,e.ttl*5);
      c.shadowBlur=22;c.shadowColor='#b86dff';c.strokeStyle='#b66cff';c.lineWidth=22;
      c.beginPath();c.moveTo(0,e.y);c.lineTo(1000,e.y);c.stroke();
      c.strokeStyle='#f8eaff';c.lineWidth=7;c.beginPath();c.moveTo(0,e.y);c.lineTo(1000,e.y);c.stroke();
    }else if(e.type==='meteor'){
      c.shadowBlur=24;c.shadowColor='#ff653c';c.strokeStyle='#ff9b5b';c.lineWidth=10;
      c.beginPath();c.moveTo(e.x-22,e.y-60);c.lineTo(e.x,e.y);c.stroke();
      c.fillStyle='#fff3a0';c.beginPath();c.arc(e.x,e.y,18,0,Math.PI*2);c.fill();
    }else if(e.type==='guts'){
      c.globalAlpha=.28+.12*Math.sin(match.now*12);c.strokeStyle='#ff79bd';c.shadowColor='#ff58b5';c.shadowBlur=22;c.lineWidth=6;
      c.beginPath();c.ellipse(e.owner.x,e.owner.y-e.owner.height*.52,65,115,0,0,Math.PI*2);c.stroke();
    }else if(e.type==='food'){
      c.font='45px sans-serif';c.textAlign='center';c.fillText('🍖',e.x,e.y-12*Math.sin(match.now*6));
    }
    c.restore();
  }
}

function drawArena() {
  const w=arena.width,h=arena.height;
  pen.save();
  if(match?.shake){pen.translate((Math.random()-.5)*match.shake,(Math.random()-.5)*match.shake);}
  const sky=pen.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#0a173b');sky.addColorStop(.65,'#34416d');sky.addColorStop(1,'#171a2b');
  pen.fillStyle=sky;pen.fillRect(0,0,w,h);
  pen.fillStyle='#ffffff12';
  for(let i=0;i<13;i++){pen.fillRect(i*90-30,190+(i%4)*23,60,240);}
  pen.fillStyle='#0a1022';pen.fillRect(0,FLOOR+7,w,h-FLOOR);
  pen.fillStyle='#7789b4';pen.fillRect(0,FLOOR+6,w,4);
  pen.strokeStyle='#ffffff13';pen.lineWidth=2;
  for(let x=0;x<w;x+=65){pen.beginPath();pen.moveTo(x,FLOOR+10);pen.lineTo(x-50,h);pen.stroke();}
  if(match){drawCombatant(match.p);drawCombatant(match.c);drawEffects();drawVfx();}
  pen.restore();
  if(match?.flash){pen.save();pen.fillStyle=`rgba(255,245,225,${match.flash*.65})`;pen.fillRect(0,0,w,h);pen.restore();}
}
// STEP 25: Frame-driven countdown. The game clock, physics and AI stay frozen until FIGHT.
function updateCountdown(dt) {
  if (!match || match.running || match.over || match.countdownPhase === 'done') return;
  match.countdown += dt;
  const elapsed = match.countdown;
  const overlay = $('battleOverlay');
  const title = $('overlayTitle');
  const info = $('overlayInfo');
  let nextPhase, label;
  if (elapsed < 1) { nextPhase = '3'; label = '3'; }
  else if (elapsed < 2) { nextPhase = '2'; label = '2'; }
  else if (elapsed < 3) { nextPhase = '1'; label = '1'; }
  else if (elapsed < 3.75) { nextPhase = 'fight'; label = 'FIGHT!'; }
  else {
    match.countdownPhase = 'done';
    match.running = true;
    window.SkyAudio?.scene('battle',level);
    keys.clear();
    overlay.classList.add('hidden');
    overlay.classList.remove('countdown-mode', 'fight-phase');
    return;
  }
  if (match.countdownPhase !== nextPhase) {
    match.countdownPhase = nextPhase;
    title.textContent = label;
    window.SkyAudio?.sfx(nextPhase==='fight'?'fight':'count');
    info.textContent = nextPhase === 'fight' ? 'LET THE BATTLE BEGIN!' : 'ROUND '+match.round+' · GET READY';
    overlay.classList.toggle('fight-phase', nextPhase === 'fight');
    title.classList.remove('count-pop');
    void title.offsetWidth; // restart CSS keyframe only when the number changes
    title.classList.add('count-pop');
  }
}
function frame(t) {
  if (!match || !document.getElementById('battle').classList.contains('active')) return;
  const dt = lastFrame ? Math.min((t-lastFrame)/1000,.035) : 0;
  lastFrame=t;
  if(match.running && !match.over){
    if(match.cutInRemaining>0){
      match.cutInRemaining=Math.max(0,match.cutInRemaining-dt);
      if(match.cutInRemaining===0)clearSpecialCutin();
    }else update(dt);
  }else if(match.pendingRound){
    match.roundPause-=dt;
    if(match.roundPause<=0){match.round++;resetRound();}
  }else if(!match.over) updateCountdown(dt);
  drawArena();
  animationId=requestAnimationFrame(frame);
}
$('overlayButton').addEventListener('click', () => {
  if (match?.over) { if(bossPending)startTakeBoss();else {if(bossEncounter)leaveTakeEncounter();startBattle();} return; }
  // Countdown begins automatically on entering the arena; no manual skip.
});
$('retryButton').addEventListener('click', () => {if(bossPending)startTakeBoss();else {if(bossEncounter)leaveTakeEncounter();startBattle();}});
$('battleHomeButton').addEventListener('click', () => {
  clearSpecialCutin(); match=null; keys.clear(); if(animationId)cancelAnimationFrame(animationId); leaveTakeEncounter();show('home');
});
window.addEventListener('keydown', e => {
  if (!document.getElementById('battle').classList.contains('active')) return;
  const k=e.key.toLowerCase();
  if (['a','d','w','j','k','l','i',' '].includes(k)) e.preventDefault();
  if (e.repeat && ['j','k','i'].includes(k)) return;
  keys.add(k);
  if(!match?.running || match.over || match.cutInRemaining>0) return;
  if((k==='w'||k===' ') && match.p.y>=FLOOR){match.p.vy=-760;window.SkyAudio?.sfx('jump');}
  if(k==='j')attack(match.p,'punch');
  if(k==='k')attack(match.p,'kick');
  if(k==='i')specialAttack(match.p);
});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>keys.clear());
