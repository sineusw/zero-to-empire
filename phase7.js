/* ZERO TO EMPIRE — PHASE 7: EMPIRE TIER */
(()=>{
  const VERSION='phase7-v1';
  const BIZ={
    luxuryAuto:{name:'Luxury Auto Group',icon:'🏎️',price:350000,value:350000,flow:9500,manager:45000,upgrade:120000},
    media:{name:'Media & Brand Holdings',icon:'📺',price:600000,value:600000,flow:17000,manager:70000,upgrade:200000},
    logistics:{name:'International Logistics Network',icon:'🌐',price:900000,value:900000,flow:28000,manager:110000,upgrade:300000}
  };
  const REGIONS={
    home:{name:'Home Market',buyIn:0,mult:1},
    europe:{name:'Europe',buyIn:250000,mult:1.18},
    asia:{name:'Asia-Pacific',buyIn:400000,mult:1.28},
    gulf:{name:'Gulf Region',buyIn:650000,mult:1.4}
  };
  const LUXURY={
    exotic:{name:'Exotic Vehicle Collection',icon:'🏁',price:250000},
    mansion:{name:'Empire Mansion',icon:'🏛️',price:750000},
    yacht:{name:'Superyacht',icon:'🛥️',price:1200000},
    jet:{name:'Private Jet',icon:'✈️',price:2000000}
  };
  const HQ={price:1500000,value:1500000,mult:1.25};
  const ENDGAME=10000000;

  function ensure(){
    st.phase7={version:VERSION,empireBiz:{},regions:['home'],activeRegion:'home',luxury:[],hq:false,executiveOps:false,epilogueSeen:false,arcComplete:false,...(st.phase7||{})};
    st.phase7.empireBiz=st.phase7.empireBiz||{};
    st.phase7.regions=Array.isArray(st.phase7.regions)?st.phase7.regions:['home'];
    if(!st.phase7.regions.includes('home'))st.phase7.regions.unshift('home');
    st.phase7.luxury=Array.isArray(st.phase7.luxury)?st.phase7.luxury:[];
  }
  ensure();
  function p6Complete(){return (st.phase6?.history?.length||0)>=10&&netWorth()>=500000}
  function regionMultiplier(){return REGIONS[st.phase7.activeRegion]?.mult||1}
  function empireBizValue(){return Object.entries(st.phase7.empireBiz).reduce((a,[id,b])=>a+(b.owned?(BIZ[id]?.value||0)+(b.upgrade?(BIZ[id]?.upgrade||0):0):0),0)}
  function luxuryValue(){return st.phase7.luxury.reduce((a,id)=>a+(LUXURY[id]?.price||0),0)}
  function empireRawFlow(){
    let n=0;
    Object.entries(st.phase7.empireBiz).forEach(([id,b])=>{if(!b.owned||!b.manager)return;let c=BIZ[id];let x=c.flow;if(b.upgrade)x=Math.round(x*1.25);n+=x});
    n=Math.round(n*regionMultiplier());
    if(st.phase7.executiveOps)n=Math.round(n*1.15);
    if(st.phase7.hq)n=Math.round(n*HQ.mult);
    return n;
  }

  const nwBase=netWorth;
  netWorth=function(){ensure();return Math.max(0,nwBase()+empireBizValue()+luxuryValue()+(st.phase7.hq?HQ.value:0))};
  const flowBase=passiveFlow;
  passiveFlow=function(){ensure();const penalty=1-(st.phase6?.incomePenaltyPct||0);return Math.max(0,Math.round(flowBase()+empireRawFlow()*penalty))};

  const goalBase=goalInfo;
  goalInfo=function(){
    ensure();if(!p6Complete())return goalBase();
    if(!st.phase7.hq)return[HQ.price,'BUILD CORPORATE HEADQUARTERS','cash'];
    if(netWorth()<ENDGAME)return[ENDGAME,'FROM $0 TO $10M • COMPLETE THE CORE ARC','worth'];
    return[ENDGAME,'CORE ARC COMPLETE • EMPIRE SANDBOX','worth'];
  };

  const style=document.createElement('style');
  style.textContent='.empireHero{border:1px solid #92752c;background:radial-gradient(circle at 80% 20%,#4b3811,#17140b 45%,#090b09);border-radius:22px;padding:18px;margin:10px 0;box-shadow:0 0 35px #d2a62a18}.empireGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.empireStat{background:#090c0a;border:1px solid #383c35;border-radius:13px;padding:10px}.empireStat b{display:block;color:var(--g2);font-size:15px}.regionBtn.on{border-color:var(--g);box-shadow:0 0 0 2px #e7ba4725}.capstone{border:1px solid #a98832;background:linear-gradient(135deg,#2c230e,#0c0e0b);border-radius:18px;padding:14px;margin:10px 0}';
  document.head.appendChild(style);

  const empire=document.createElement('section');empire.id='empire';empire.className='s';
  empire.innerHTML='<div class="top"><button class="back" data-go="world">‹</button><div class="ttl">EMPIRE TIER</div><div style="width:44px"></div></div><div id="p7Hero"></div><div class="panel"><h3>CORPORATE DASHBOARD</h3><div id="p7Stats" class="empireGrid"></div></div><div class="panel"><h3>INTERNATIONAL EXPANSION</h3><div class="sub">Choose one active region. Region multiplier applies to Empire-tier businesses.</div><div id="p7Regions"></div></div><div class="panel"><h3>HIGH-PROFILE BUSINESSES</h3><div class="sub">Acquire, appoint executive management, then upgrade. Automation is the reward.</div><div id="p7Businesses"></div></div><div class="panel"><h3>LUXURY & STATUS</h3><div class="sub">High-value lifestyle assets. Status first — no major gameplay advantage.</div><div id="p7Luxury"></div></div><div id="p7HQ"></div><button class="btn dk sm" data-go="world">BACK TO EMPIRE</button>';
  document.getElementById('app').appendChild(empire);
  empire.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>show(b.dataset.go));

  let entry=document.getElementById('phase7Panel');
  if(!entry){entry=document.createElement('div');entry.id='phase7Panel';entry.className='panel';document.getElementById('sleepBtn')?.parentNode?.insertBefore(entry,document.getElementById('sleepBtn'))}
  function renderEntry(){ensure();let open=p6Complete();entry.innerHTML='<h3>EMPIRE TIER</h3><div class="sub">'+(open?'Phase 6 complete. Corporate-scale ownership is now available.':'Unlock: 10 distinct random events + $500,000 net worth.')+'</div>'+(open?'<button id="openEmpire" class="btn sm">OPEN EMPIRE DASHBOARD</button>':'');let b=document.getElementById('openEmpire');if(b)b.onclick=()=>show('empire')}

  function renderStats(){
    $('p7Stats').innerHTML='<div class="empireStat"><span class="sub">NET WORTH</span><b>'+fmt(netWorth())+'</b></div><div class="empireStat"><span class="sub">TOTAL PASSIVE / DAY</span><b>'+fmt(passiveFlow())+'</b></div><div class="empireStat"><span class="sub">EMPIRE-TIER / DAY</span><b>'+fmt(empireRawFlow())+'</b></div><div class="empireStat"><span class="sub">ACTIVE REGION</span><b>'+REGIONS[st.phase7.activeRegion].name+'</b></div>';
  }
  function renderRegions(){let box=$('p7Regions');box.innerHTML='';Object.entries(REGIONS).forEach(([id,r])=>{let owned=st.phase7.regions.includes(id),d=document.createElement('div');d.className='asset';d.innerHTML='<div class="bizTop"><b>🌍 '+r.name+'</b><span class="gold">×'+r.mult.toFixed(2)+'</span></div><div class="sub">'+(id==='home'?'Base market.':('One-time expansion buy-in '+fmt(r.buyIn)+'.'))+'</div><button class="btn sm regionBtn '+(st.phase7.activeRegion===id?'on':'')+'" '+(!owned&&st.cash<r.buyIn?'disabled':'')+'>'+(owned?(st.phase7.activeRegion===id?'ACTIVE':'SET ACTIVE'):'EXPAND • '+fmt(r.buyIn))+'</button>';box.appendChild(d);d.querySelector('button').onclick=()=>{if(!owned){if(st.cash<r.buyIn)return;st.cash-=r.buyIn;st.phase7.regions.push(id)}st.phase7.activeRegion=id;save();renderEmpire();hud()}})}
  function renderBusinesses(){let box=$('p7Businesses');box.innerHTML='';Object.entries(BIZ).forEach(([id,c])=>{let b=st.phase7.empireBiz[id]||{owned:false,manager:false,upgrade:false},d=document.createElement('div');d.className='biz';let daily=Math.round(c.flow*(b.upgrade?1.25:1)*regionMultiplier()*(st.phase7.executiveOps?1.15:1)*(st.phase7.hq?HQ.mult:1));d.innerHTML='<div class="bizTop"><b>'+c.icon+' '+c.name+'</b>'+(b.manager?'<span class="green">AUTOMATED</span>':'<span class="gold">EXECUTIVE NEEDED</span>')+'</div><div class="sub">Value '+fmt(c.value)+' • Automated income '+fmt(daily)+'/day</div>'+(b.owned?'<div class="actions"><button class="primary mgr">'+(b.manager?'EXECUTIVE MANAGER HIRED':'HIRE EXECUTIVE • '+fmt(c.manager))+'</button><button class="up" '+(b.upgrade?'disabled':'')+'>'+(b.upgrade?'UPGRADED':'EXPAND • '+fmt(c.upgrade))+'</button></div>':'<button class="btn sm buy" '+(st.cash<c.price?'disabled':'')+'>ACQUIRE • '+fmt(c.price)+'</button>');box.appendChild(d);if(!b.owned)d.querySelector('.buy').onclick=()=>{if(st.cash<c.price)return;st.cash-=c.price;st.phase7.empireBiz[id]={owned:true,manager:false,upgrade:false};save();renderEmpire();hud()};else{let m=d.querySelector('.mgr');m.disabled=b.manager||st.cash<c.manager;m.onclick=()=>{if(b.manager||st.cash<c.manager)return;st.cash-=c.manager;b.manager=true;st.phase7.empireBiz[id]=b;save();renderEmpire();hud()};let u=d.querySelector('.up');u.disabled=b.upgrade||st.cash<c.upgrade;u.onclick=()=>{if(b.upgrade||st.cash<c.upgrade)return;st.cash-=c.upgrade;b.upgrade=true;st.phase7.empireBiz[id]=b;save();renderEmpire();hud()}}})}
  function renderLuxury(){let box=$('p7Luxury');box.innerHTML='';Object.entries(LUXURY).forEach(([id,c])=>{let owned=st.phase7.luxury.includes(id),d=document.createElement('div');d.className='lifeItem';d.innerHTML='<b>'+c.icon+' '+c.name+'</b><div class="sub">Luxury/status asset • adds to net worth • no major income bonus.</div><button class="btn sm" '+(owned||st.cash<c.price?'disabled':'')+'>'+(owned?'OWNED':fmt(c.price))+'</button>';box.appendChild(d);d.querySelector('button').onclick=()=>{if(owned||st.cash<c.price)return;st.cash-=c.price;st.phase7.luxury.push(id);save();renderEmpire();hud()}})}
  function renderHQ(){let box=$('p7HQ');box.innerHTML='<div class="capstone"><h3>🏢 CORPORATE HEADQUARTERS</h3><div class="sub">Singular capstone asset. Consolidates Empire management and multiplies Empire-tier passive income by 25%.</div>'+(st.phase7.hq?'<div class="gold" style="font-weight:1000;margin-top:8px">HEADQUARTERS OPERATIONAL • ×1.25 EMPIRE INCOME</div><button id="execOps" class="btn dk sm" '+(st.phase7.executiveOps||st.cash<250000?'disabled':'')+'>'+(st.phase7.executiveOps?'EXECUTIVE OPS MAXED':'UPGRADE EXECUTIVE OPS • $250,000 • +15%')+'</button>':'<button id="buyHQ" class="btn" '+(st.cash<HQ.price?'disabled':'')+'>BUILD HQ • '+fmt(HQ.price)+'</button>')+'</div>';let h=$('buyHQ');if(h)h.onclick=()=>{if(st.cash<HQ.price)return;st.cash-=HQ.price;st.phase7.hq=true;save();renderEmpire();hud()};let e=$('execOps');if(e)e.onclick=()=>{if(st.phase7.executiveOps||st.cash<250000)return;st.cash-=250000;st.phase7.executiveOps=true;save();renderEmpire();hud()}}
  function renderHero(){let complete=netWorth()>=ENDGAME;$('p7Hero').innerHTML='<div class="empireHero"><div class="sub gold" style="letter-spacing:.18em;font-weight:900">'+(complete?'CORE ARC COMPLETE':'FROM HUSTLER TO EMPIRE')+'</div><h2 style="margin:5px 0">'+(complete?'YOUR EMPIRE IS BUILT':'BUILD BEYOND THE CITY')+'</h2><div class="sub">'+(complete?'$10M reached. The game continues as an open-ended empire sandbox.':'Acquire global businesses, automate leadership, expand regions, and build your corporate headquarters.')+'</div></div>'}
  function renderEmpire(){ensure();if(!p6Complete()){show('world');return}renderHero();renderStats();renderRegions();renderBusinesses();renderLuxury();renderHQ();checkEpilogue()}

  const showBase=show;show=function(x){showBase(x);renderEntry();if(x==='empire')renderEmpire()};
  const hudBase=hud;hud=function(){hudBase();renderEntry();if(document.getElementById('empire')?.classList.contains('on'))renderEmpire()};

  document.getElementById('sleepBtn')?.addEventListener('click',()=>{setTimeout(()=>{ensure();if(!p6Complete())return;let income=empireRawFlow();let penalty=1-(st.phase6?.incomePenaltyPct||0);income=Math.round(income*penalty);if(income>0)st.cash+=income;save();hud();checkEpilogue()},5)});

  const ep=document.createElement('div');ep.id='p7Epilogue';ep.className='modal';ep.innerHTML='<div class="eventBox"><div class="sub gold" style="letter-spacing:.16em;font-weight:900">CORE ARC COMPLETE</div><h2>FROM $0 TO $10M — YOUR EMPIRE</h2><p>You started with nothing, built income streams, survived setbacks, acquired property, expanded across the city, and grew into a global operator.</p><div class="empireGrid"><div class="empireStat"><span class="sub">NET WORTH</span><b id="epWorth"></b></div><div class="empireStat"><span class="sub">DAY</span><b id="epDay"></b></div></div><button id="epContinue" class="btn">CONTINUE IN SANDBOX</button></div>';document.getElementById('app').appendChild(ep);$('epContinue').onclick=()=>{st.phase7.epilogueSeen=true;st.phase7.arcComplete=true;save();ep.classList.remove('on')};
  function checkEpilogue(){if(netWorth()<ENDGAME||st.phase7.epilogueSeen)return;$('epWorth').textContent=fmt(netWorth());$('epDay').textContent='DAY '+st.day;ep.classList.add('on')}

  renderEntry();save();
})();
