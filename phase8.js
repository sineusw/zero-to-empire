/* ZERO TO EMPIRE — PHASE 8: MONETIZATION & RETENTION (NO FAKE TRANSACTIONS) */
(()=>{
  const VERSION='phase8-v1';
  const COSMETICS=[
    {id:'founder-fit',name:'Founder Outfit Pack',price:'$4.99',type:'outfit'},
    {id:'midnight-fleet',name:'Midnight Vehicle Pack',price:'$3.99',type:'vehicle'},
    {id:'gold-property',name:'Gold Property Theme',price:'$3.99',type:'property'},
    {id:'mogul-pack',name:'Mogul Character Pack',price:'$6.99',type:'character'}
  ];
  const PASS=[
    {xp:0,label:'Season Start',reward:250},{xp:100,label:'Gold Phone Skin',reward:400},{xp:250,label:'Empire Cash',reward:750},
    {xp:450,label:'Executive Badge',reward:1200},{xp:700,label:'Season Finale',reward:2500}
  ];
  function ensure(){
    const today=new Date().toISOString().slice(0,10);
    st.phase8={version:VERSION,passXP:0,passClaimed:[],loginDate:'',loginStreak:0,daily:{date:today,hustles:0,passiveCollects:0,claimed:false},weekly:{week:keyWeek(),hustles:0,sleeps:0,claimed:false},...st.phase8};
    if(!Array.isArray(st.phase8.passClaimed))st.phase8.passClaimed=[];
    if(!st.phase8.daily||st.phase8.daily.date!==today)st.phase8.daily={date:today,hustles:0,passiveCollects:0,claimed:false};
    if(!st.phase8.weekly||st.phase8.weekly.week!==keyWeek())st.phase8.weekly={week:keyWeek(),hustles:0,sleeps:0,claimed:false};
  }
  function keyWeek(){const d=new Date(),x=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()));x.setUTCDate(x.getUTCDate()+4-(x.getUTCDay()||7));const y=new Date(Date.UTC(x.getUTCFullYear(),0,1));return x.getUTCFullYear()+'-'+String(Math.ceil((((x-y)/86400000)+1)/7)).padStart(2,'0')}
  ensure();

  /* PROVIDER INTEGRATION STUBS — intentionally never grant rewards or mark purchases successful. */
  window.triggerRewardedAd=function(placement){console.info('[STUB] rewarded ad provider not connected:',placement);stubNotice('Rewarded ads are not connected yet. No reward was granted.')};
  window.triggerIAP=function(productId){console.info('[STUB] IAP provider not connected:',productId);stubNotice('Real-money checkout is not connected yet. Nothing was charged or unlocked.')};
  function stubNotice(msg){const m=document.getElementById('p8Stub');if(!m)return;m.textContent=msg;m.style.display='block'}

  const style=document.createElement('style');style.textContent='.rewardTrack{display:grid;gap:7px}.rewardRow{display:grid;grid-template-columns:58px 1fr auto;gap:8px;align-items:center;border:1px solid #353b36;background:#0b0e0c;border-radius:13px;padding:10px}.rewardRow.done{border-color:#8b722f}.pill{font-size:9px;font-weight:900;border:1px solid #725f2b;color:var(--g2);border-radius:999px;padding:4px 7px}.stub{border:1px dashed #8b722f;background:#171309;border-radius:12px;padding:10px;margin:8px 0;font-size:10px;color:#d9c783}.challenge{border:1px solid #343a35;border-radius:13px;padding:11px;margin:7px 0;background:#0a0e0c}';document.head.appendChild(style);

  const sec=document.createElement('section');sec.id='rewards';sec.className='s';sec.innerHTML='<div class="top"><button class="back" data-go="world">‹</button><div class="ttl">REWARDS & STYLE</div><div style="width:44px"></div></div><div class="panel"><h3>DAILY / WEEKLY</h3><div id="p8Login"></div><div id="p8Challenges"></div></div><div class="panel"><h3>EMPIRE PASS</h3><div class="sub">Season progress earned through normal play. No purchase required for this prototype track.</div><div id="p8Pass" class="rewardTrack"></div></div><div class="panel"><h3>OPTIONAL REWARDED ADS</h3><div class="sub">Always player-initiated. No forced or interstitial ads.</div><button class="btn sm" id="p8EnergyAd">WATCH AD • +20 ENERGY</button><button class="btn dk sm" id="p8SkipAd">WATCH AD • SKIP A COOLDOWN</button></div><div class="panel"><h3>COSMETIC STORE</h3><div class="sub">Purely cosmetic catalog. Checkout is intentionally stubbed until a real IAP provider is connected.</div><div id="p8Cosmetics"></div></div><div class="panel"><h3>VIP</h3><div class="sub">Ad removal + faster energy regeneration QoL only. No starting-cash or income advantage.</div><button class="btn sm" id="p8VIP">CONNECT VIP CHECKOUT</button></div><div id="p8Stub" class="stub" style="display:none"></div><button class="btn dk sm" data-go="world">BACK</button>';
  document.getElementById('app').appendChild(sec);sec.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>show(b.dataset.go));

  let entry=document.createElement('div');entry.id='phase8Panel';entry.className='panel';entry.innerHTML='<h3>REWARDS & STYLE</h3><div class="sub">Optional monetization interfaces + retention rewards. No fake transactions.</div><button id="openRewards" class="btn sm">OPEN REWARDS</button>';document.getElementById('sleepBtn')?.parentNode?.insertBefore(entry,document.getElementById('sleepBtn'));entry.querySelector('button').onclick=()=>show('rewards');

  function login(){ensure();const today=new Date().toISOString().slice(0,10);if(st.phase8.loginDate===today)return;const prev=new Date(Date.now()-86400000).toISOString().slice(0,10);st.phase8.loginStreak=st.phase8.loginDate===prev?st.phase8.loginStreak+1:1;st.phase8.loginDate=today;const bonus=Math.min(1000,100*st.phase8.loginStreak);st.cash+=bonus;st.phase8.passXP+=25;save()}
  login();
  function addPass(x){ensure();st.phase8.passXP+=x;save()}
  function render(){ensure();$('p8Login').innerHTML='<div class="challenge"><b>🔥 LOGIN STREAK • '+st.phase8.loginStreak+' DAY(S)</b><div class="sub">Today\'s login bonus already applied. Streak rewards cap at $1,000/day.</div></div>';
    const d=st.phase8.daily,w=st.phase8.weekly,dDone=d.hustles>=5,wDone=w.hustles>=20&&w.sleeps>=5;
    $('p8Challenges').innerHTML='<div class="challenge"><b>DAILY • RUN 5 HUSTLES</b><div class="sub">'+d.hustles+'/5 • Reward $500 + 50 Pass XP</div><button id="claimDaily" class="btn sm" '+(!dDone||d.claimed?'disabled':'')+'>'+(d.claimed?'CLAIMED':'CLAIM')+'</button></div><div class="challenge"><b>WEEKLY • 20 HUSTLES + 5 DAYS</b><div class="sub">'+w.hustles+'/20 hustles • '+w.sleeps+'/5 days • Reward $2,500 + 150 Pass XP</div><button id="claimWeekly" class="btn sm" '+(!wDone||w.claimed?'disabled':'')+'>'+(w.claimed?'CLAIMED':'CLAIM')+'</button></div>';
    $('claimDaily').onclick=()=>{if(dDone&&!d.claimed){d.claimed=true;st.cash+=500;addPass(50);render();hud()}};$('claimWeekly').onclick=()=>{if(wDone&&!w.claimed){w.claimed=true;st.cash+=2500;addPass(150);render();hud()}};
    $('p8Pass').innerHTML='';PASS.forEach((r,i)=>{const open=st.phase8.passXP>=r.xp,claimed=st.phase8.passClaimed.includes(i),el=document.createElement('div');el.className='rewardRow'+(claimed?' done':'');el.innerHTML='<span class="pill">'+r.xp+' XP</span><div><b>'+r.label+'</b><div class="sub">'+fmt(r.reward)+' in-game cash</div></div><button class="mini" '+(!open||claimed?'disabled':'')+'>'+(claimed?'✓':'CLAIM')+'</button>';el.querySelector('button').onclick=()=>{if(open&&!claimed){st.phase8.passClaimed.push(i);st.cash+=r.reward;save();render();hud()}};$('p8Pass').appendChild(el)});
    $('p8Cosmetics').innerHTML='';COSMETICS.forEach(c=>{const e=document.createElement('div');e.className='lifeItem';e.innerHTML='<b>'+c.name+'</b><div class="sub">'+c.type.toUpperCase()+' COSMETIC • '+c.price+'</div><button class="btn sm">CHECKOUT</button>';e.querySelector('button').onclick=()=>triggerIAP(c.id);$('p8Cosmetics').appendChild(e)});
  }
  $('p8EnergyAd').onclick=()=>triggerRewardedAd('energy_plus_20');$('p8SkipAd').onclick=()=>triggerRewardedAd('skip_cooldown');$('p8VIP').onclick=()=>triggerIAP('vip_ad_removal');

  function recordHustle(){ensure();st.phase8.daily.hustles++;st.phase8.weekly.hustles++;addPass(8)}
  document.getElementById('deliveryCollect')?.addEventListener('click',recordHustle);document.getElementById('collect')?.addEventListener('click',recordHustle);
  document.getElementById('sleepBtn')?.addEventListener('click',()=>{ensure();st.phase8.weekly.sleeps++;if(passiveFlow()>0)st.phase8.daily.passiveCollects++;addPass(10)});
  const showBase=show;show=function(x){showBase(x);if(x==='rewards')render()};
  const hudBase=hud;hud=function(){hudBase();if(document.getElementById('rewards')?.classList.contains('on'))render()};
  render();save();
})();