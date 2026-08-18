/* ZERO TO EMPIRE — PHASE 6: RANDOM EVENTS & FAILURE RECOVERY */
(()=>{
  const P6_VERSION='phase6-v1';
  const ensure=()=>{
    st.phase6={
      version:P6_VERSION,
      history:[],
      nextEventDay:3,
      lastEventDay:0,
      activeEvent:null,
      recoveryDebt:0,
      dailyDrag:0,
      dailyDragDays:0,
      incomePenaltyPct:0,
      incomePenaltyDays:0,
      energyPenalty:0,
      energyPenaltyDays:0,
      propertyValuePenalty:0,
      propertyValuePenaltyDays:0,
      rescueUsed:false,
      ...st.phase6
    };
    st.phase6.history=Array.isArray(st.phase6.history)?st.phase6.history:[];
  };
  ensure();

  const nwBase=netWorth;
  netWorth=function(){
    ensure();
    return Math.max(0,nwBase()-(st.phase6.recoveryDebt||0)-(st.phase6.propertyValuePenalty||0));
  };
  const flowBase=passiveFlow;
  passiveFlow=function(){
    ensure();
    const base=flowBase();
    return Math.max(0,Math.round(base*(1-(st.phase6.incomePenaltyPct||0))));
  };

  function workerCount(){return ['detail','fleet','third'].filter(k=>st.biz?.[k]?.worker).length}
  function ownedBiz(){return ['detail','fleet','third'].filter(k=>st.biz?.[k]?.owned)}
  function districtCount(){const w=netWorth();return 1+(w>=20000?1:0)+(w>=75000?1:0)+(w>=200000?1:0)}
  function hasDelivery(){return st.cash>=60||st.biz?.detail?.owned||st.upgrades?.includes('ebike')}
  function clampCash(){
    if(st.cash>=0)return;
    const short=Math.abs(st.cash);
    st.cash=0;
    st.phase6.recoveryDebt+=short;
  }
  function addCash(n){st.cash+=n;clampCash()}
  function addHistory(id){if(!st.phase6.history.includes(id))st.phase6.history.push(id)}
  function scheduleNext(){st.phase6.lastEventDay=st.day;st.phase6.nextEventDay=st.day+2+Math.floor(Math.random()*3);st.phase6.activeEvent=null}
  function spend(n){if(st.cash<n)return false;st.cash-=n;return true}
  function randomOwnedBiz(){const a=ownedBiz();return a.length?a[Math.floor(Math.random()*a.length)]:null}

  const EVENTS=[
    {id:'breakdown',title:'🚗 BAD TIMING',body:'Your vehicle breaks down right when demand is picking up.',ok:()=>hasDelivery(),choices:[
      ['PAY $180 • FIX IT NOW',()=>{if(!spend(180))return false;return true},'You paid for a fast repair.'],
      ['PATCH IT • -20 ENERGY FOR 2 DAYS',()=>{st.phase6.energyPenalty=20;st.phase6.energyPenaltyDays=2;return true},'You kept moving, but the temporary fix drains your energy.'],
      ['TAKE A $220 REPAIR TAB',()=>{st.phase6.recoveryDebt+=220;return true},'The shop let you pay later. Your net worth carries the debt.']
    ]},
    {id:'raise',title:'💼 YOUR BEST WORKER WANTS A RAISE',body:'They know the business is growing and want a better deal.',ok:()=>workerCount()>0,choices:[
      ['APPROVE • $40/DAY FOR 3 DAYS',()=>{st.phase6.dailyDrag+=40;st.phase6.dailyDragDays=Math.max(st.phase6.dailyDragDays,3);return true},'You protected morale, but payroll is heavier for a few days.'],
      ['BONUS $150 • KEEP CURRENT PAY',()=>spend(150),'A one-time bonus keeps the team happy.'],
      ['DECLINE • RISK PRODUCTIVITY',()=>{if(Math.random()<.5){st.phase6.incomePenaltyPct=Math.max(st.phase6.incomePenaltyPct,.15);st.phase6.incomePenaltyDays=3}return true},'They stayed — but motivation may dip.']
    ]},
    {id:'competitor',title:'⚔️ A COMPETITOR MOVED IN',body:'A polished new operator is targeting your customers.',ok:()=>ownedBiz().length>0,choices:[
      ['MARKETING BLITZ • $300',()=>spend(300),'You defended your territory with a focused campaign.'],
      ['LOWER PRICES • -15% INCOME 3 DAYS',()=>{st.phase6.incomePenaltyPct=Math.max(st.phase6.incomePenaltyPct,.15);st.phase6.incomePenaltyDays=3;return true},'Revenue takes a short hit while you protect market share.'],
      ['IGNORE THEM',()=>{if(Math.random()<.45){st.phase6.incomePenaltyPct=Math.max(st.phase6.incomePenaltyPct,.25);st.phase6.incomePenaltyDays=2}return true},'You stayed disciplined. The market will decide whether that was smart.']
    ]},
    {id:'buyout',title:'🤝 SOMEONE WANTS YOUR BUSINESS',body:'A buyer offers a premium for one of your operating businesses.',ok:()=>ownedBiz().length>0,choices:[
      ['SELL FOR A PREMIUM',()=>{const id=randomOwnedBiz();if(!id)return false;const values={detail:1300,fleet:3300,third:4600};addCash(values[id]||1500);st.biz[id].owned=false;st.biz[id].worker=false;return true},'You took liquidity over future cash flow. You can rebuild.'],
      ['DECLINE • KEEP CASH FLOW',()=>true,'You kept the asset. Ownership matters more than a quick payday.'],
      ['COUNTEROFFER',()=>{if(Math.random()<.35){const id=randomOwnedBiz();if(!id)return false;const values={detail:1600,fleet:4000,third:5400};addCash(values[id]||1800);st.biz[id].owned=false;st.biz[id].worker=false}return true},'You pushed for a richer number. Sometimes leverage works.']
    ]},
    {id:'propertySwing',title:'🏠 PROPERTY VALUES JUST MOVED',body:'Buyers are suddenly paying attention to your neighborhood.',ok:()=>!!st.property?.owned,choices:[
      ['HOLD • KEEP RENT',()=>true,'You ignored the noise and kept the income stream.'],
      ['LOCK IN VALUE • +$600 CASH',()=>{addCash(600);st.phase6.propertyValuePenalty=400;st.phase6.propertyValuePenaltyDays=3;return true},'You extracted some value now, but the asset carries a temporary valuation haircut.'],
      ['RENOVATE • $500',()=>{if(!spend(500))return false;st.property.rentBoost=(st.property.rentBoost||0)+20;return true},'You turned market attention into stronger rent.']
    ]},
    {id:'audit',title:'📋 BOOKS UNDER REVIEW',body:'A surprise compliance review finds expenses you did not plan for.',ok:()=>netWorth()>=5000,choices:[
      ['SETTLE • $350',()=>spend(350),'Clean books, clean slate.'],
      ['PAY OVER 4 DAYS • $100/DAY',()=>{st.phase6.dailyDrag+=100;st.phase6.dailyDragDays=Math.max(st.phase6.dailyDragDays,4);return true},'You protected cash today, but daily cash flow is tighter.'],
      ['DISPUTE IT',()=>{if(Math.random()<.5)addCash(200);else st.phase6.recoveryDebt+=500;return true},'You challenged the bill. The result was not guaranteed.']
    ]},
    {id:'theft',title:'🔒 EQUIPMENT MISSING',body:'One of your operations opens for the day and key equipment is gone.',ok:()=>ownedBiz().length>0,choices:[
      ['REPLACE IT • $250',()=>spend(250),'You absorbed the hit and stayed operational.'],
      ['RUN LEAN • -20% INCOME 3 DAYS',()=>{st.phase6.incomePenaltyPct=Math.max(st.phase6.incomePenaltyPct,.20);st.phase6.incomePenaltyDays=3;return true},'The team improvises while you rebuild.'],
      ['INSURANCE CLAIM • $75',()=>{if(!spend(75))return false;addCash(180);return true},'You paid the deductible and recovered part of the loss.']
    ]},
    {id:'viral',title:'🔥 YOUR BRAND IS TRENDING',body:'A customer post is taking off. You have a small window to capitalize.',ok:()=>ownedBiz().length>0,choices:[
      ['BOOST IT • $150',()=>{if(!spend(150))return false;addCash(450);return true},'You turned attention into sales.'],
      ['LET IT RUN ORGANIC',()=>{addCash(120+Math.floor(Math.random()*181));return true},'The momentum brought in extra cash without ad spend.'],
      ['OFFER A PROMO',()=>{st.phase6.incomePenaltyPct=Math.max(0,st.phase6.incomePenaltyPct-.05);addCash(180);return true},'The offer brought customers through the door.']
    ]},
    {id:'permit',title:'🏙️ DISTRICT PERMIT CHECK',body:'Growth gets attention. A district inspector wants your paperwork tightened up.',ok:()=>districtCount()>=2&&ownedBiz().length>0,choices:[
      ['PAY EXPEDITED FEE • $400',()=>spend(400),'You kept expansion moving.'],
      ['HANDLE IT YOURSELF • -25 ENERGY',()=>{st.energy=Math.max(0,st.energy-25);return true},'You saved cash but lost most of a productive afternoon.'],
      ['DEFER • $500 RECOVERY DEBT',()=>{st.phase6.recoveryDebt+=500;return true},'You bought time, not freedom. The obligation stays on the books.']
    ]},
    {id:'investor',title:'🥂 AN INVESTOR WANTS IN',body:'Someone with money likes what you built and offers growth capital.',ok:()=>districtCount()>=3&&netWorth()>=75000,choices:[
      ['TAKE $15K • REPAY $600/DAY',()=>{addCash(15000);st.phase6.recoveryDebt+=18000;st.phase6.dailyDrag+=600;st.phase6.dailyDragDays=Math.max(st.phase6.dailyDragDays,30);return true},'You chose speed. The repayment drag is real.'],
      ['DECLINE • STAY IN CONTROL',()=>true,'No dilution, no obligation.'],
      ['NEGOTIATE',()=>{if(Math.random()<.4){addCash(10000);st.phase6.recoveryDebt+=11000}else st.energy=Math.max(0,st.energy-15);return true},'You tested your leverage instead of accepting the first offer.']
    ]},
    {id:'underperformer',title:'📉 A WORKER IS SLIPPING',body:'One employee keeps missing standards and customers are noticing.',ok:()=>workerCount()>0,choices:[
      ['RETRAIN • $200',()=>spend(200),'You invested in the person instead of replacing them.'],
      ['REPLACE • $300',()=>spend(300),'Fresh talent costs money, but protects standards.'],
      ['ONE MORE CHANCE',()=>{if(Math.random()<.5){st.phase6.incomePenaltyPct=Math.max(st.phase6.incomePenaltyPct,.18);st.phase6.incomePenaltyDays=2}return true},'You gave them room to recover.']
    ]},
    {id:'downturn',title:'🌧️ THE MARKET COOLS OFF',body:'Demand softens across the city. Strong operators survive the quiet weeks.',ok:()=>netWorth()>=20000,choices:[
      ['CUT COSTS • $250',()=>spend(250),'You protected operations before the slowdown got worse.'],
      ['RIDE IT OUT • -20% INCOME 2 DAYS',()=>{st.phase6.incomePenaltyPct=Math.max(st.phase6.incomePenaltyPct,.20);st.phase6.incomePenaltyDays=2;return true},'You kept your structure intact and accepted a short-term hit.'],
      ['BUY THE DIP • $750',()=>{if(!spend(750))return false;addCash(1000+Math.floor(Math.random()*501));return true},'You used volatility as an opportunity.']
    ]}
  ];

  function eligibleEvents(){return EVENTS.filter(e=>e.ok()&&!st.phase6.history.includes(e.id))}
  function chooseEvent(){
    let pool=eligibleEvents();
    if(!pool.length)pool=EVENTS.filter(e=>e.ok());
    return pool.length?pool[Math.floor(Math.random()*pool.length)]:null;
  }

  const modal=document.createElement('div');
  modal.id='phase6Modal';modal.className='modal';
  modal.innerHTML='<div class="eventBox"><div class="sub gold" style="letter-spacing:.16em;font-weight:900">RANDOM EVENT</div><h2 id="p6Title">EVENT</h2><p id="p6Body"></p><div id="p6Choices"></div><div id="p6Result" class="sub" style="display:none;margin-top:12px;line-height:1.5"></div><button id="p6Close" class="btn dk sm" style="display:none">CONTINUE</button></div>';
  document.getElementById('app').appendChild(modal);

  function showEvent(ev){
    st.phase6.activeEvent=ev.id;save();
    $('p6Title').textContent=ev.title;$('p6Body').textContent=ev.body;$('p6Result').style.display='none';$('p6Close').style.display='none';
    const c=$('p6Choices');c.innerHTML='';
    ev.choices.forEach(([label,fn,result])=>{
      const b=document.createElement('button');b.className='btn'+(c.children.length?' dk':'');b.textContent=label;
      b.onclick=()=>{
        const ok=fn();if(ok===false){$('p6Result').textContent='You do not have enough cash for that option.';$('p6Result').style.display='block';return}
        clampCash();addHistory(ev.id);scheduleNext();save();hud();renderPhase6Status();
        [...c.children].forEach(x=>x.disabled=true);$('p6Result').textContent=result;$('p6Result').style.display='block';$('p6Close').style.display='block';
      };c.appendChild(b);
    });
    modal.classList.add('on');
  }
  $('p6Close').onclick=()=>{modal.classList.remove('on');st.phase6.activeEvent=null;save();hud()};

  function applyDailySetbacks(){
    ensure();
    if(st.phase6.dailyDragDays>0){
      const due=Math.min(st.cash,st.phase6.dailyDrag);st.cash-=due;
      const unpaid=st.phase6.dailyDrag-due;if(unpaid>0)st.phase6.recoveryDebt+=unpaid;
      st.phase6.dailyDragDays--;if(st.phase6.dailyDragDays<=0)st.phase6.dailyDrag=0;
    }
    if(st.phase6.recoveryDebt>0&&st.cash>250){
      const pay=Math.min(st.phase6.recoveryDebt,Math.max(50,Math.round(st.cash*.08)));st.cash-=pay;st.phase6.recoveryDebt-=pay;
    }
    if(st.phase6.energyPenaltyDays>0){st.energy=Math.max(0,st.energy-st.phase6.energyPenalty);st.phase6.energyPenaltyDays--;if(st.phase6.energyPenaltyDays<=0)st.phase6.energyPenalty=0}
    if(st.phase6.incomePenaltyDays>0){st.phase6.incomePenaltyDays--;if(st.phase6.incomePenaltyDays<=0)st.phase6.incomePenaltyPct=0}
    if(st.phase6.propertyValuePenaltyDays>0){st.phase6.propertyValuePenaltyDays--;if(st.phase6.propertyValuePenaltyDays<=0)st.phase6.propertyValuePenalty=0}
    if(st.cash===0&&st.energy<20&&!st.phase6.rescueUsed){
      st.phase6.rescueUsed=true;st.energy=40;addCash(75);
    }
    save();hud();renderPhase6Status();
  }

  function maybeTrigger(){
    ensure();
    if(st.day<st.phase6.nextEventDay||modal.classList.contains('on'))return;
    const ev=chooseEvent();
    if(!ev){st.phase6.nextEventDay=st.day+2;save();return}
    showEvent(ev);
  }

  function renderPhase6Status(){
    let p=document.getElementById('phase6Panel');
    if(!p){
      p=document.createElement('div');p.id='phase6Panel';p.className='panel';
      const anchor=document.getElementById('sleepBtn');anchor?.parentNode?.insertBefore(p,anchor);
    }
    const distinct=st.phase6.history.length,done=distinct>=10&&netWorth()>=500000;
    p.innerHTML='<h3>STORY & RISK</h3><div class="sub">Events experienced: <b class="gold">'+distinct+'/10</b> • Next event window: Day '+st.phase6.nextEventDay+'</div>'+
      (st.phase6.recoveryDebt?'<div class="sub red" style="margin-top:6px">Recovery debt: '+fmt(st.phase6.recoveryDebt)+' • automatically repays from future cash.</div>':'')+
      (st.phase6.incomePenaltyDays?'<div class="sub" style="margin-top:4px">Temporary income penalty: '+Math.round(st.phase6.incomePenaltyPct*100)+'% for '+st.phase6.incomePenaltyDays+' more day(s).</div>':'')+
      (done?'<div class="biz phaseDone"><b class="gold">PHASE 6 COMPLETE</b><div class="sub">10+ distinct events experienced and '+fmt(500000)+' net worth reached. Empire Tier is ready.</div></div>':'<div class="sub" style="margin-top:7px">Phase 6 milestone: 10 distinct event types + $500,000 net worth.</div>');
  }

  const oldHud=hud;hud=function(){oldHud();renderPhase6Status()};
  document.getElementById('sleepBtn')?.addEventListener('click',()=>{setTimeout(()=>{applyDailySetbacks();maybeTrigger()},0)});
  const oldShow=show;show=function(x){oldShow(x);if(x==='world'){renderPhase6Status();setTimeout(maybeTrigger,80)}};

  renderPhase6Status();save();
})();
