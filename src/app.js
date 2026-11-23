/* ======================= helpers ======================= */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const msgs=$('#msgs'), scroller=$('#msgscroll'), cursor=$('#cursor');
const P=new URLSearchParams(location.search);
/* fit like Chrome at 90%: on a laptop screen the whole page is scaled down a little (the same as Cmd -), never up */
let Z=1; function fitZoom(){ const q=parseFloat(P.get('zoom')); Z=q>0?q:Math.min(1,Math.max(.75,innerWidth/1680)); document.documentElement.style.zoom=Z; document.documentElement.style.setProperty('--z',Z); }
fitZoom(); addEventListener('resize',fitZoom);
if(P.has('clean')) document.body.classList.add('clean');
const ico=(id,cls)=>`<svg class="${cls||''}"><use href="#${id}"/></svg>`;
const icoS=(id,px,color)=>`<svg style="width:${px}px;height:${px}px;${color?'color:'+color:''}"><use href="#${id}"/></svg>`;
const tick=`<span class="chk">${ico('i-check')}</span>`;
let ANIM=false, TOKEN=0;
const realSleep=ms=>new Promise(r=>setTimeout(r,ms));
const sleep=ms=>ANIM?realSleep(ms):Promise.resolve();
function guard(t){if(t!==TOKEN) throw 'stale';}
const TPL={bot:$('#tpl [data-tpl=bot]'),user:$('#tpl [data-tpl=user]'),work:$('#tpl [data-tpl=work]')};
let seq=40;
function stamp(el,t){ const ts=[...el.querySelectorAll('div')].reverse().find(d=>/\d+:\d+\s?(AM|PM)/.test(d.textContent)&&d.children.length<=1); if(ts) ts.innerHTML=`${t} <span class="text-[8px]">(${seq++})</span>`; }
function addEl(el){ document.body.classList.remove('chat-min'); if(ANIM) el.classList.add('rise'); msgs.appendChild(el); return el; }
function bot(html,t){ const el=TPL.bot.cloneNode(true); el.removeAttribute('data-tpl'); el.querySelector('span.w-full.bg-transparent').innerHTML=`<div class="cxm">${html}</div>`; stamp(el,t||clock()); return addEl(el); }
function user(text,t){ const el=TPL.user.cloneNode(true); el.removeAttribute('data-tpl'); el.querySelector('.user-message').innerHTML=`<p>${String(text).replace(/</g,'&lt;')}</p>`; stamp(el,t||clock()); return addEl(el); }
function raw(html){ const d=document.createElement('div'); d.innerHTML=html.trim(); return addEl(d.firstElementChild); }
const pill=(text,attrs)=>`<div class="answer-example-item" style="display:block;width:100%"><span class="flex flex-col space-y-1"><div class="inline-flex items-center gap-2"><span ${attrs} class="rounded-[8px] inline-flex max-w-[36rem] items-start gap-1.5 px-3 py-1 my-1 shadow-sm transition-colors duration-200 ease-in-out cursor-pointer bg-[#f0f5ff] text-black border border-[#60A5FA] hover:bg-[#f0f5ff] hover:text-black hover:shadow-md hover:scale-[1.02]" data-pill="true" style="min-width:170px"><span class="flex items-center justify-center text-xl transition-colors">+</span><span class="text-sm leading-7"><span style="margin:0;display:inline">${text}</span></span></span></div></span></div>`;
const pills=list=>`<div style="display:flex;flex-direction:column;align-items:flex-start">${list.map(([t,a])=>pill(t,a)).join('')}</div>`;
const opts=list=>list.map(([t,a])=>opt(t,a)).join('');
let lastAim=-1e9;
function scrollChat(el,mode){
  if(!el) return Promise.resolve(); lastAim=performance.now();
  const er=el.getBoundingClientRect(), mr=scroller.getBoundingClientRect();
  const top=scroller.scrollTop+(er.top-mr.top)/Z, h=er.height/Z;
  const target=mode==='top'?Math.max(0,top-24):Math.max(0,top+h-scroller.clientHeight+24);
  return smoothScroll(scroller,target);
}
function smoothScroll(box,target,dur=600){ if(!ANIM){box.scrollTop=target;return Promise.resolve();}
  const from=box.scrollTop, d=target-from, t0=performance.now();
  return new Promise(r=>{const f=now=>{const k=Math.min(1,(now-t0)/dur), e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2; box.scrollTop=from+d*e; k<1?requestAnimationFrame(f):r();};requestAnimationFrame(f);}); }
let cx=900, cy=700, AUTOPLAY=false;
async function point(el){ if(!ANIM||!AUTOPLAY||P.has('nocursor')||!el) return; cursor.classList.add('on');
  const r=el.getBoundingClientRect(), px=(r.left+r.width/2)/Z, py=(r.top+r.height/2)/Z, fx=cx, fy=cy, dur=700, t0=performance.now();
  await new Promise(res=>{const f=now=>{const k=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-k,3);cx=fx+(px-fx)*e;cy=fy+(py-fy)*e;cursor.style.transform=`translate(${cx-4}px,${cy-2}px)`;k<1?requestAnimationFrame(f):res();};requestAnimationFrame(f);});
  await sleep(220); }
function hideCursor(){cursor.classList.remove('on');}
function expand(el,dur=560){ if(!ANIM||!el) return; el.style.overflow='hidden'; el.style.maxHeight='0px'; el.style.transition=`max-height ${dur}ms cubic-bezier(.2,.7,.2,1)`; void el.offsetHeight; el.style.maxHeight=el.scrollHeight+'px'; setTimeout(()=>{el.style.maxHeight='';el.style.overflow='';el.style.transition='';},dur+60); }
let toastTimer; function toast(t){ $('#toast-t').textContent=t; $('#toast').classList.add('on'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('#toast').classList.remove('on'),2600); }

/* ======================= state ======================= */
const S0=()=>({genie:false,status:'review',sent:false,filter:'All',view:'DOC',sel:0,dev:DEVS.map(()=>'hidden'),choice:{cap:'2x',ins:'2m'},t:0,stars:0,org:'All organisations',recollect:false,ping:false});
let st=S0();
function clock(){ st.t++; const base=cur>=13?50:cur>=7?44:cur>=3?42:39; return `9:${String(Math.min(59,base+st.t)).padStart(2,'0')} AM`; }

/* ======================= screens ======================= */
let screen='home';
function show(name){ screen=name; $$('#screens > .scr').forEach(s=>s.classList.toggle('on',s.id==='scr-'+name)); closeOv();
  if(name==='corpus') renderCorpus(); if(name==='projects') renderProjects(); if(name!=='search'&&name!=='contract'&&name!=='analysis') document.body.classList.remove('wide'); updateHint(); }
function greet(){ return bot(`<p class="cxp"><b>Suggested Actions:</b></p><p class="cxp">Please select one of the options below to get started.</p>${opt('Search contracts','id="sg-main" data-act="sugg" data-k="main"')}${opt('Redline a contract','data-act="sugg" data-k="redline0"')}${opt('Compare contracts','data-act="sugg" data-k="compare0"')}${opt('Generate a contract','data-act="gen"')}${opt('Validate contract integrity','data-act="sugg" data-k="validate"')}${opt('Or, type your question below','data-act="focus"')}`,'9:38 AM'); }
function renderSugg(){}
function closeOv(){ ['#ov-menu','#ov-modes','#ov-filter','#ov-hamb'].forEach(s=>{const e=$(s); if(e) e.style.display='none';}); $$('.org-list').forEach(x=>x.classList.remove('on')); }

/* corpus (all contracts) */
function repoStatus(r){ if(r.main) return {review:'In review',redline:'In review',ready:'In review',sent:'Out for signature'}[st.status]; return r.status||'In review'; }
function renderCorpus(){
  const all=[...QUEUE,...EXEC], tabs=['All','In review','Active','Out for signature'];
  const n=t=>all.filter(r=>t==='All'||(t==='Active'?/Active|Expiring/.test(repoStatus(r)):repoStatus(r)===t)).length;
  $('#c-chips').innerHTML=tabs.map(t=>`<span class="fchip ${st.filter===t?'on':''}" data-act="cfilter" data-f="${t}">${t} <b>${t==='All'?'1,248':n(t)}</b></span>`).join('');
  const list=all.filter(r=>st.filter==='All'||(st.filter==='Active'?/Active|Expiring/.test(repoStatus(r)):repoStatus(r)===st.filter));
  const pc=s=>({'In review':'blue','Active':'ok','Expiring soon':'warn','Out for signature':'ok'}[s]);
  const pre=r=>r.main?{review:['warn','9 deviations'],redline:['blue','2 to review'],ready:['ok','Ready to approve'],sent:['ok','Out for signature']}[st.status]:r.pre==='warn'?['warn',r.preT]:null;
  $('#c-table').innerHTML=`<div class="tr2 th"><div>Contract</div><div>Title</div><div>Counterparty</div><div>Value</div><div>Status</div></div>`+
    list.map(r=>{const p=pre(r); return `<div class="tr2 row ${r.main&&st.sent?'donerow':''}" ${r.main?'id="row-main"':''} data-act="row" data-id="${r.id}"><div class="id">${r.id}<span class="sub">${r.type}</span></div><div>${r.title}</div><div style="color:#4B5563">${r.cp}</div><div class="num" style="font-weight:600">${r.val}</div><div>${p?`<span class="pc ${p[0]}">${p[1]}</span>`:`<span class="pc ${pc(repoStatus(r))}">${repoStatus(r)}</span>`}</div></div>`;}).join('');
  $('#done-banner').classList.toggle('on',st.sent);
}
const PROJECTS=[['Vendor contracts FY27','Legal review · 42 contracts','In review'],['IT services renewals','Procurement · 18 contracts','Active'],['Grant agreements 2027','Programs · 26 contracts','Active'],['Lease portfolio','Real estate · 11 contracts','Active'],['Facilities and maintenance','Operations · 9 contracts','In review'],['Template library','Legal · 5 templates','Gold standard']];
function renderProjects(){ const q=($('#pj-search').value||'').toLowerCase();
  $('#pj-grid').innerHTML=PROJECTS.filter(p=>!q||p.join(' ').toLowerCase().includes(q)).map(p=>`<div class="pj" data-act="pj-open" data-p="${p[0]}"><b>${p[0]}</b><small>${p[1]}</small><div class="pjm"><span class="pc ${p[2]==='In review'?'blue':p[2]==='Active'?'ok':'grey'}">${p[2]}</span><span class="pc grey">Sample</span></div></div>`).join('')||'<p style="color:#6B7280;font-size:14px">No projects match.</p>'; }

/* contract views */
function setView(v){ st.view=v; $$('#tabs .tab').forEach(t=>t.classList.toggle('on',t.dataset.v===v)); $$('#scr-contract .view').forEach(x=>x.classList.toggle('on',x.id==='view-'+v));
  if(v==='KEY') renderKey(); if(v==='TIME') renderTime(); if(v==='DOC') $('#c-doc').innerHTML=kestrelPage('c'); }
function rlRow(i){ const d=DEVS[i], s=st.dev[i]; if(s==='hidden') return '';
  const cls=s==='fixed'||s==='decided'?'fixed':s==='you'?'you':d.r;
  const vd=s==='fixed'?`<s>${d.v}</s> <ins>${d.t}</ins>`:s==='decided'?decidedText(d):d.v;
  const rs=s==='fixed'?`<span class="fixtag">${d.fix}</span><span class="risk ok"><i></i>Fixed by AI</span>`:s==='decided'?`<span class="fixtag">${CHOICES[d.you].tag[st.choice[d.you]]}</span><span class="risk ok"><i></i>Decided by you</span>`:s==='you'?`<span class="risk you"><i></i>Your call</span>`:`<span class="risk ${d.r}"><i></i>${d.r==='high'?'High risk':'Medium risk'}</span>`;
  return `<div class="rlr ${cls}" id="rlr${i}"><div class="cn"><b>${d.n}</b><small>§ ${d.s}</small><div class="rs">${rs}</div></div><div class="vd"><span class="lbl">Vendor draft</span>${vd}</div><div class="tp"><span class="lbl">Our template</span>${d.t}</div></div>`; }
function counts(){ const shown=st.dev.filter(s=>s!=='hidden').length, open=st.dev.filter(s=>s==='marked'||s==='you').length, fixed=st.dev.filter(s=>s==='fixed').length; return {shown,open,fixed}; }
function renderRedline(){ const c=counts();
  $('#rl-body').innerHTML=c.shown?DEVS.map((_,i)=>rlRow(i)).join(''):`<div class="rl-empty"><b>No redline yet</b>Ask Contracts AI to compare this draft with your template. It checks all 46 clauses and marks every deviation by risk.</div>`;
  renderCount(); }
function renderCount(){ const c=counts(), el=$('#rl-count'), tag=$('#rl-tag'); $('.rl').classList.toggle('counted',!!c.shown);
  if(!c.shown){ el.classList.remove('on'); tag.style.display='none'; return; }
  el.classList.add('on'); tag.style.display='inline-block'; const op=c.open>0&&st.status!=='ready'&&st.status!=='sent'; tag.style.background=op?'var(--blue-soft)':''; tag.style.color=op?'var(--blue-ink)':'';
  if(st.status==='ready'||st.status==='sent'){ el.innerHTML=`${ico('i-check')}<span>9 deviations</span><span class="ar">→</span><span class="dn">0 open</span>`; tag.textContent='0 open'; }
  else if(c.fixed){ el.innerHTML=`${ico('i-spark')}<span>9 deviations</span><span class="ar">→</span><span class="to">${c.open} to review</span>`; tag.textContent=c.open+' open'; }
  else { el.innerHTML=`${ico('i-alert')}<span class="num">${c.shown} deviation${c.shown===1?'':'s'}</span>`; tag.textContent=c.shown+' open'; }
  $('#rl-sub').textContent=`· 46 clauses · ${46-c.shown} match`; }
async function updDev(i,s,anim){ st.dev[i]=s; const old=$('#rlr'+i), html=rlRow(i); if(!html){ if(old) old.remove(); return; }
  const d=document.createElement('div'); d.innerHTML=html; const el=d.firstElementChild;
  if(old) old.replaceWith(el); else { const body=$('#rl-body'); if(body.querySelector('.rl-empty')) body.innerHTML=''; const nxt=[...body.children].find(x=>+x.id.slice(3)>i); nxt?body.insertBefore(el,nxt):body.appendChild(el); }
  if(anim&&ANIM){ el.classList.add(s==='marked'?'mark-in':'flash'); const body=$('#rl-body'); const er=el.getBoundingClientRect(), br=body.getBoundingClientRect();
    const top=body.scrollTop+(er.top-br.top)/Z, eh=er.height/Z; if(top+eh>body.scrollTop+body.clientHeight-20||top<body.scrollTop) smoothScroll(body,Math.max(0,top-body.clientHeight/2+eh/2),420); }
  renderCount(); const cd=$('#c-dv'+i); if(cd) cd.outerHTML=devSpan(i,'c'); }
function renderKey(){ const fixed=st.status!=='review';
  $('#rpt-key').innerHTML=`<div class="rpt-h"><h2>Key terms</h2><span class="cdtag">Read by Contracts AI</span><span class="meta">${fixed?'After the redline':'From the vendor draft v2'}</span></div>
   <div class="kt"><div class="rstat"><span>Value</span><b>$1.2M</b><small>$400K a year, Schedule B</small></div><div class="rstat"><span>Term</span><b>3 years</b><small>Jan 1, 2027 – Dec 31, 2029</small></div><div class="rstat"><span>Payment</span><b class="${fixed?'ok':'bad'}">${fixed?'Net 45':'15 days'}</b><small>${fixed?'Matches the template':'Template: 45 days'}</small></div>
   <div class="rstat"><span>Renewal</span><b>${fixed?'By amendment':'Automatic'}</b><small>Section 2.2</small></div><div class="rstat"><span>Liability cap</span><b>${st.status==='ready'||st.status==='sent'?(st.choice.cap==='2x'?'2× value':'1× fees'):'1× annual fees'}</b><small>Section 9.1</small></div><div class="rstat"><span>Governing law</span><b>${fixed?'New York':'Delaware'}</b><small>Section 14.3</small></div></div>
   <div class="rbox oblig" style="margin-top:14px"><h3>${ico('i-cal')}Dates and obligations<span class="cnt">5 found</span></h3>
    <div class="obr"><span class="d">Dec 15, 2026</span><span class="w">Insurance certificate due<small>Section 10.2 · Vendor</small></span><span class="pc grey">Before start</span></div>
    <div class="obr"><span class="d">Jan 1, 2027</span><span class="w">Services start<small>Section 2.1</small></span><span class="pc blue">Start</span></div>
    <div class="obr"><span class="d">Monthly</span><span class="w">Invoices in arrears, with the PO number<small>Section 3.3 · Vendor</small></span><span class="pc grey">Recurring</span></div>
    <div class="obr"><span class="d">Quarterly</span><span class="w">Service level report<small>Schedule C · Vendor</small></span><span class="pc grey">Recurring</span></div>
    <div class="obr"><span class="d">Oct 2, 2029</span><span class="w">Decide on a new contract, 90 days before the end<small>Section 2.2 · Agency</small></span><span class="pc warn">Reminder set</span></div></div>`; }
function renderTime(){ const done=st.status==='sent';
  const ev=(cls,ic,b,s)=>`<div class="tl-ev ${cls}"><span class="d">${ico(ic)}</span><div class="e"><b>${b}</b><small>${s}</small></div></div>`;
  $('#rpt-time').innerHTML=`<div class="tl-cmp"><div class="tl-h"><h3>Time to review</h3><span>this contract, against the old process</span>${done?`<span class="tl-pill">5 minutes</span>`:''}</div>
     <div class="tl-row"><span class="lb">Manual review</span><div class="tl-bar old"><i style="width:100%"></i></div><span class="tot num">3 days</span></div>
     <div class="tl-row new"><span class="lb">With Contracts AI</span><div class="tl-bar new"><i style="width:${done?'1.6%':'0'};min-width:${done?'10px':'0'}"></i></div><span class="tot num">${done?'5 min':'…'}</span></div></div>
   <div class="tl-days"><div class="tl-day"><h4><b>Nov 18</b> · received</h4>${ev('','i-doc','Vendor draft v2 received','Kestrel Facility Services · 18 pages')}${ev('ai','i-spark','AI pre-check overnight','9 deviations from template v4 flagged')}</div>
     <div class="tl-day"><h4><b>Nov 20</b> · today</h4>${ev(st.dev.some(s=>s!=='hidden')?'ai':'todo','i-spark','AI redline','9 deviations marked by risk · 9:46 AM')}${ev(st.dev.some(s=>s==='fixed')?'ai':'todo','i-spark','7 routine fixes','Matched to the template · 9:47 AM')}${ev(st.status==='ready'||done?'ok':'todo','i-scale','2 calls made by you','Liability and insurance · 9:48 AM')}</div>
     <div class="tl-day"><h4><b>Next</b></h4>${ev(done?'ok':'todo','i-check','Approved','Reviewed in 5 minutes')}${ev(done?'ok':'todo','i-pen','Sent for signature','Kestrel Facility Services')}</div></div>`; }
function setStatus(s){ st.status=s; const m={review:['blue','In legal review'],redline:['warn','2 to review'],ready:['ok','Ready to approve'],sent:['ok','Out for signature']}[s];
  $('#status-pill').className='pill '+m[0]; $('#status-pill').innerHTML=`<span class="dot"></span>${m[1]}`;
  $('#day-pill').textContent=s==='sent'?'Reviewed in 5 min':'Day 3 in review';
  const ap=$('#approve-hdr'); ap.innerHTML=s==='sent'?ico('i-check')+'Approved':'Approve'; ap.className='btn sm '+(s==='sent'?'okb':'pri');
  if(st.view==='DOC') $('#c-doc').innerHTML=kestrelPage('c'); if(st.view==='KEY') renderKey(); if(st.view==='TIME') renderTime(); renderCount(); if(screen==='corpus') renderCorpus(); }

/* modal */
function openGenie(){ st.genie=true; modal(`<div class="gh2"><h3>Contract Genie</h3><button id="genie-x" data-act="close-genie" aria-label="Close">${ico('i-close')}</button></div>
   <div class="why">Why this is the best match: <b>Matching score 99.2%</b></div>
   <ol><li>The clause names an exact number of days: forty-five (45).</li><li>It covers every undisputed invoice under the contract, not one schedule.</li><li>No amendment or side letter changes it. Amendment 1 replaced the price schedule only.</li></ol>
   <div class="gpage"><div class="ph"><span>NORTHWIND CLOUD SYSTEMS · MASTER SERVICES AGREEMENT</span><span>PAGE 4 OF 22</span></div><h4>6 · Payment</h4>
     <p style="margin:0 0 6px"><b>6.1 Invoices.</b> Vendor shall submit invoices monthly in arrears, with the purchase order number and a description of the Services delivered.</p>
     <p style="margin:0 0 6px"><b>6.2 Payment terms.</b> <mark>Undisputed invoices are due within forty-five (45) days of receipt of a proper invoice.</mark></p>
     <p style="margin:0"><b>6.3 Disputed amounts.</b> The Agency shall notify Vendor in writing of any disputed amount within fifteen (15) days, and the parties shall work in good faith to resolve it.</p></div>
   <div class="mf"><button class="btn out" data-act="close-genie">Close</button><button class="btn pri" data-act="genie-doc">${ico('i-doc')}Open Section 6.2 in the contract</button></div>`,'genie'); }
function modal(html,wide){ $('#modal').className='modal'+(wide==='genie'?' genie':wide?' cert':''); $('#modal').innerHTML=html; $('#modal-bg').classList.add('on'); }
function closeModal(){ $('#modal-bg').classList.remove('on'); }

/* ======================= main storyline ======================= */
const STEPS=[
 {id:'home',label:'Contracts AI home',run:async t=>{ show('home'); if(!msgs.children.length) greet(); }},
 {id:'ask',label:'Question typed',run:async t=>{
    const box=$('#cin'); const typed=box.value.trim(); const q=(typed&&/45|payment|net|days/i.test(typed))?typed:QUESTION;
    if(ANIM && !typed){ await point(box); hideCursor(); box.focus();
      for(let i=1;i<=QUESTION.length;i++){guard(t); box.value=QUESTION.slice(0,i); await sleep(30+(QUESTION[i-1]===' '?22:0));}
      await sleep(300); await point($('#send')); await sleep(120); guard(t); }
    if(ANIM) pulseSend(); box.value=''; box.blur(); hideCursor();
    const u=user(q,'9:41 AM'); await scrollChat(u);
 }},
 {id:'working',label:'Searching every contract',run:async t=>{ await analyzing(t,'Contract Search',[
      ['Read every contract you can access · <b>1,248 contracts</b>'],['Found the payment clauses · <b>3,912 clauses</b>'],['Read each payment term in days · <b>15 to 90 days</b>'],['Ranked by relevance · <b>17 relevant, top 9</b>'],['Checked each match for gaps · <b>1 gap</b>']],'1.8'); }},
 {id:'results',label:'Ranked results',run:async t=>{
    show('results'); renderResults();
    const a=bot(`<p>Filter the results by clicking on checkboxes.</p><p style="margin-top:6px">I found <b>17</b> relevant contracts</p>${totalCard()}
      <p>. Here are the <b>top 9 contracts</b> as per your request for contracts that have payment terms of 45 days or more.</p>
      <div class="lm-coll" data-act="lm-coll">Contracts that have payment terms of 45 days or more${ico('i-chev')}</div><div id="lm-ci">${RES.slice(0,3).map(chatItem).join('')}<p style="font-size:14px;color:#6B7280;margin:4px 0 0">6 more are in the results on the right.</p></div>`,'9:41 AM');
    const b=bot(`<p><b>1 contract in your review queue does not meet this term.</b></p>${opt('Show me the gap','id="show-gap" data-act="show-gap"')}
      <p style="margin-top:10px">If you would like to explore more such contracts, you can load additional results below:</p>${opt('Show more of such contracts','data-act="free" data-q="more"')}
      <p class="lm-lbl">Or you can search through the <span class="lm-lib" data-act="corpus">Contract Library</span> for:</p>${opt('contracts with extended payment terms','data-act="free" data-q="ext"')}${opt('contracts with payment terms greater than 45 days','data-act="free" data-q="gt45"')}
      <p class="lm-lbl">None of the above, just:</p>${opt('Please enter your request so that I can refine and filter the contract list accordingly','data-act="focus"')}`,'9:41 AM');
    await scrollChat(a,'top');
 }},
 {id:'reasoning',label:'Reasoning, step by step',run:async t=>{
    const w=$('#why-1'); if(ANIM){await point(w); await sleep(120); guard(t);} hideCursor();
    const lis=[...$('#cd-1').querySelectorAll('ol li')]; if(ANIM) lis.forEach(l=>l.classList.add('wait'));
    openWhy(1,true); await scrollList($('#lmc-1'));
    if(ANIM){ for(const l of lis){ await sleep(380); guard(t); l.classList.remove('wait'); } }
 }},
 {id:'citation',label:'The exact clause',run:async t=>{
    const v=$('#vp-1'); if(ANIM){await point(v); await sleep(120); guard(t);} hideCursor();
    openPdf(1,true); await sleep(ANIM?120:0); await scrollList($('#pdf-1'),'bottom');
 }},
 {id:'gap',label:'Flags the gap',run:async t=>{
    const g=$('#show-gap'); if(ANIM&&g){await point(g); await sleep(120); guard(t);} hideCursor();
    openPdf(1,false); openWhy(1,false); show('results');
    const c=$('#lmc-9'); await scrollList(c); c.classList.add('flash'); setTimeout(()=>c.classList.remove('flash'),1600); await sleep(ANIM?300:0); openWhy(9,true); await scrollList($('#cd-9 .lm-sec.bad'),'bottom');
    const n=bot(`<div class="lm-gapbox"><div class="h">${ico('i-alert')}Gaps in decision · 9th match, 40%</div><p><b>CTR-2026-01184 · Kestrel Facility Services</b> (draft in your review queue): payment is due in <b>15 days, not the 45</b> you asked for. Your template says 45.</p></div>
      <p style="margin-top:10px">Suggested next steps:</p>${opt('Redline CTR-2026-01184 against our template','id="chip-open" data-act="open-main"')}${opt('Show more of such contracts','data-act="free" data-q="more"')}`,'9:42 AM');
    await scrollChat(n,'top');
 }},
 ...AN_STEPS, // comparison -> side by side -> review one -> fix one -> fix the rest -> decide (src/analysis.js)
 {id:'approve',label:'Attorney approves',run:async t=>{
    const c=$('#chip-approve'); if(ANIM&&c){await point(c); await sleep(120); guard(t);} hideCursor();
    modal(`<div class="mh"><span class="ic" style="background:var(--ok-soft);color:var(--ok)">${ico('i-check')}</span><h3>Approve CTR-2026-01184?</h3></div>
      <div class="mb">This approves the redlined agreement and sends it to Kestrel Facility Services for signature.
        <div class="rows"><div><span>Deviations</span><b style="color:var(--ok)">9 found · 0 open</b></div><div><span>Fixed by AI</span><b>7, matched to template v4</b></div><div><span>Decided by you</span><b>2 · liability and insurance</b></div><div><span>Time in review</span><b>5 minutes</b></div></div>
        <label>Attorney note</label><textarea id="rev-note">Approved after the AI redline against Vendor services template v4. Payment net 45, New York law, termination for convenience. Liability ${st.choice.cap==='2x'?'countered at 2× contract value':'accepted at 1× annual fees'}; insurance ${st.choice.ins==='2m'?'$2M per occurrence':'$1M per occurrence'}.</textarea></div>
      <div class="mf"><button class="btn out" data-act="close-modal">Cancel</button><button class="btn okb" id="m-approve" data-act="send-sign">${ico('i-pen')}Approve and send for signature</button></div>`);
 }},
 {id:'sent',label:'Sent for signature',run:async t=>{
    const b=$('#m-approve'); if(ANIM&&b){await point(b); await sleep(150); guard(t);} hideCursor();
    closeModal(); st.sent=true; setStatus('sent'); if(ANIM) toast('Sent for signature · Kestrel Facility Services');
    const m=bot(`<p><b>Sent for signature.</b> I’ll tell you when Kestrel Facility Services signs, and I’ve added the key dates to your calendar.</p>
      <div class="permitc"><div class="ph">${ico('i-pen')}Out for signature · CTR-2026-01184</div>
        <div class="pb"><div><span>Sent</span><b>Nov 20, 2026</b></div><div><span>Review time</span><b>5 minutes</b></div><div><span>Deviations fixed</span><b>9 of 9</b></div><div><span>Payment terms</span><b>Net 45</b></div></div>
        <div class="pf"><button class="btn out sm" data-act="view-sum">${ico('i-doc')}View summary</button><button class="btn pri sm" id="back-queue" data-act="back-queue">All contracts</button></div></div>`,'9:49 AM');
    await scrollChat(m);
 }},
 {id:'done',label:'Review complete',run:async t=>{
    const b=$('#back-queue'); if(ANIM&&b){await point(b); await sleep(150); guard(t);} hideCursor();
    st.filter='All'; show('corpus');
 }},
];
async function analyzing(t,type,steps,secs){
  const el=bot(`<div class="lm-qt">Question Type: <span class="ty">${type}</span> — <span class="stt">${ANIM?'Analyzing...':'Done in '+secs+' s'}</span></div><div class="lm-gen" data-act="lm-gen">Generating your summary ${ico('i-chev')}</div><div class="lm-steps">${steps.map((s,i)=>`<div class="lm-st"><span class="d ${ANIM?(i===0?'pend':''):'done'}"></span><span>${s[0]}</span></div>`).join('')}</div>`);
  await scrollChat(el);
  if(ANIM){ const ds=[...el.querySelectorAll('.lm-st .d')]; for(let i=0;i<ds.length;i++){ ds[i].className='d pend'; await sleep(800); guard(t); ds[i].className='d done'; } el.querySelector('.stt').textContent='Done in '+secs+' s'; }
}
async function work(t,steps,secs){
  const el=TPL.work.cloneNode(true); el.removeAttribute('data-tpl');
  const title=el.querySelector('.gpt-color'); title.innerHTML=ANIM?'Working…':`What I did for ${secs} seconds`;
  title.insertAdjacentHTML('afterend','<span class="cd-tag">Cognitive Decisioning</span>');
  const panel=el.querySelector('.max-h-0'); panel.classList.remove('max-h-0','opacity-0'); panel.style.maxHeight='none'; panel.style.opacity='1';
  panel.querySelector('.no-scrollbar').innerHTML=`<div class="wd-steps">${steps.map((s,i)=>`<div class="wd-st" data-act="wstep"><span class="dot ${ANIM?(i===0?'pend':''):'done'}">${ANIM?'':ico('i-check')}</span><div class="tx">${s[0]}<span class="tm">(${s[2]} secs)</span><div class="det">${s[1]}</div></div></div>`).join('')}</div>`;
  const tr=panel.querySelector('[data-testid=showTrace]'); if(tr) tr.setAttribute('data-act','trace');
  el.querySelectorAll('p.max-w-full').forEach(p=>p.remove()); stamp(el,clock());
  addEl(el); await scrollChat(el);
  if(ANIM){ const ds=[...el.querySelectorAll('.wd-st .dot')]; for(let i=0;i<ds.length;i++){ ds[i].className='dot pend'; await sleep(850); guard(t); ds[i].className='dot done'; ds[i].innerHTML=ico('i-check'); } title.textContent=`What I did for ${secs} seconds`; }
}

/* ======================= side questions ======================= */
const FREE={
 all6:{q:'Show all 6 matches',a:()=>`<table class="mini"><tr><th>Contract</th><th>Term</th><th class="r">Relevance</th></tr>${[['Northwind Cloud Systems · MSA','45 days','100%'],['Summit Talent Partners · MSA','60 days','90%'],['Meridian Data Partners · SOW','45 days after acceptance','80%'],['Keystone Office Supply','Net 45','70%'],['Cobalt Systems Group · SOW','45 days after acceptance','68%'],['Atlas Fleet Supply','Net 45','64%']].map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td class="r num">${r[2]}</td></tr>`).join('')}</table>`},
 export:{q:'Export this list',a:()=>`<p>Done. The 6 matches are in a spreadsheet with the contract, the clause, the term in days and the relevance score. (Downloads are turned off in this demo.)</p>`},
 fix15:{q:'Fix: set payment to 45 days',a:()=>`<p>I’ll do that as part of the redline, so every change to this draft is tracked in one place. Open it with <span class="lnk" data-act="open-main">Redline CTR-2026-01184 against our template</span>.</p>`},
 summary:{q:'Summarise this contract',a:()=>`<p>A three-year <b>facilities maintenance services agreement</b> with Kestrel Facility Services, $1.2M ($400K a year), starting January 1, 2027.</p><ul class="bl"><li>HVAC, electrical and plumbing maintenance, with service levels in Schedule C.</li><li>${st.status==='review'?'The vendor draft differs from your template in <b>9 places</b>, 4 of them high risk.':st.status==='redline'?'7 deviations are fixed; <b>2 need your call</b>.':'Every deviation is resolved. Payment is net 45 under New York law.'}</li></ul>`},
 dates:{q:'What are the key dates?',a:()=>`<ul class="bl"><li><b>Dec 15, 2026</b> · insurance certificate due</li><li><b>Jan 1, 2027</b> · services start</li><li><b>Quarterly</b> · service level report</li><li><b>Oct 2, 2029</b> · decide on a new contract, 90 days before the end</li></ul>`},
 all9:{q:'Show all 9 deviations',a:()=>`<table class="mini"><tr><th>Clause</th><th>Risk</th><th class="r">Handled by</th></tr>${DEVS.map(d=>`<tr><td>§ ${d.s} ${d.n}</td><td>${d.r==='high'?'High':'Medium'}</td><td class="r">${d.fix?'AI fix':'You'}</td></tr>`).join('')}</table>`},
 why2:{q:'Why are these two left for me?',a:()=>`<p>Both are business trade-offs, not wording fixes. The liability cap and the insurance limit change how much risk the Agency carries, and a vendor may push back on price if you hold the line. I recommend your template for both, but the call is yours.</p>`},
 recap:{q:'Summarise this review',a:()=>`<ul class="bl"><li><b>Nov 18</b> · vendor draft v2 received. The pre-check flagged 9 deviations overnight.</li><li><b>Nov 20, 9:46 AM</b> · AI redline against Vendor services template v4.</li><li><b>9:47 AM</b> · 7 routine deviations fixed to match the template.</li><li><b>9:48 AM</b> · you decided liability and insurance.</li><li><b>9:49 AM</b> · approved and sent for signature.</li></ul><p>Review time: <b>5 minutes</b>, against 3 days on average.</p>`},
 renew:{q:'Does it renew automatically?',a:()=>st.status==='review'?`<p><b>Yes, as drafted.</b> Section 2.2 renews it every year unless someone cancels. Your template allows renewal only by a written amendment.</p>`:`<p><b>No.</b> The redline removed the auto-renewal; Section 2.2 now allows renewal only by a written amendment, as in your template.</p>`},
 more:{q:'Show more of such contracts',a:()=>`<p>Here are the next 8 of the 17:</p><table class="mini"><tr><th>Contract</th><th>Term</th><th class="r">Score</th></tr>${[['Harbor Youth Alliance · grant','45 days after report','52%'],['Harborline Properties · lease','Monthly rent','48%'],['Eastside Community Kitchen · grant','Advance + 45 days','46%'],['Bridgeway Jobs Network · grant','Quarterly, 45 days','45%'],['Pier Nine Holdings · lease','Monthly rent','41%']].map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td class="r num">${r[2]}</td></tr>`).join('')}</table>`},
 ext:{q:'contracts with extended payment terms',a:()=>`<p><b>2 contracts</b> pay later than 45 days: <b>Summit Talent Partners</b> (60 days) and <b>Harborline Properties</b> (rent paid quarterly in arrears).</p>`},
 gt45:{q:'contracts with payment terms greater than 45 days',a:()=>`<p><b>1 contract</b> is above 45 days: <b>Summit Talent Partners</b>, IT staffing MSA, Section 5.1, sixty (60) days.</p>`},
 validate:{q:'Validate contract integrity',a:()=>`<p>I checked the 42 contracts in review for missing schedules, signature blocks and cross-references. <b>2 need attention</b>: CTR-2026-01184 (Schedule C referenced but not attached) and CTR-2026-01169 (no data-return clause).</p>`},
 redline0:{q:'Redline a contract',a:()=>`<p>Which contract? <b>CTR-2026-01184</b> (Kestrel Facility Services, facilities maintenance) is the one in the review queue with the most deviations from its template.</p>${opts([['Redline CTR-2026-01184 against our template','data-act="open-main"']])}`},
 compare0:{q:'Compare contracts',a:()=>`<p>I can compare any contract with your gold-standard template or with another contract. A good start is <b>CTR-2026-01184</b> against <b>Vendor services template v4</b>.</p>${opts([['Compare CTR-2026-01184 with our template','data-act="open-tpl"']])}`},
 corpus:{q:'Which contracts are in review?',a:()=>`<p><b>42 contracts</b> are in legal review. Two need attention: <span class="lnk" data-act="row" data-id="${MAIN}">CTR-2026-01184</span> ${st.sent?'(now out for signature)':'(9 deviations from your vendor template)'} and <span class="lnk" data-act="row" data-id="CTR-2026-01169">CTR-2026-01169</span> (milestone acceptance and data return).</p>`},
};
let freeBusy=false;
async function freeQA(key,custom){
  if(freeBusy||busy) return; freeBusy=true; const save=ANIM; ANIM=true;
  try{
    const f=FREE[key]||{q:custom,a:()=>`<p>In this demo I answer questions about these contracts. Try “${QUESTION}”</p>${opts([[QUESTION,'data-act="ask-main"']])}`};
    const u=user(custom||f.q); await scrollChat(u);
    const ty=raw(`<div class="group/user-msg flex flex-col items-start gap-1 mb-2"><div class="w-full flex flex-row justify-start items-start gap-3"><div style="max-height:32px;max-width:32px"><img alt="" src="assets/askmod-icon.svg" style="width:32px"></div><span class="typing"><i></i><i></i><i></i></span></div></div>`); await scrollChat(ty); await realSleep(850); ty.remove();
    const a=bot(f.a()); await scrollChat(a);
  } finally { ANIM=save; freeBusy=false; updateHint(); }
}

/* ======================= step engine ======================= */
let cur=-1, busy=false, playing=false, advancing=false;
const idx=id=>STEPS.findIndex(s=>s.id===id);
function label(){ $('#lbl').textContent=`${cur+1} / ${STEPS.length} · ${STEPS[cur].label}`; history.replaceState(null,'',location.pathname+location.search+'#'+STEPS[cur].id); updateHint(); }
function reset(){
  st=S0(); msgs.innerHTML=''; scroller.scrollTop=0; hideCursor(); closeModal(); closeOv(); $('#toast').classList.remove('on');
  renderResults(); $('#t-doc').innerHTML=templatePage(); setStatus('review'); setView('DOC'); renderRedline(); anReset(); renderAn();
  $('#cin').value=''; document.body.classList.remove('chat-min','wide'); paintStars();
}
async function goTo(i){ const t=++TOKEN; ANIM=false; busy=false; advancing=false; freeBusy=false; document.body.classList.add('instant'); reset();
  for(let j=0;j<=i;j++) await STEPS[j].run(t);
  document.body.classList.remove('instant'); cur=i; label(); }
async function next(){ if(busy||freeBusy||cur>=STEPS.length-1) return false; busy=true; updateHint(); const t=++TOKEN; ANIM=true;
  try{ await STEPS[cur+1].run(t); cur++; label(); }catch(e){ if(e!=='stale') console.error(e); }
  busy=false; updateHint(); return true; }
async function advanceTo(id){ if(advancing) return; advancing=true; try{ const target=idx(id); while(cur<target){ const before=cur; busy=false; await next(); if(cur===before) break; if(cur<target) await realSleep(450); } } finally { advancing=false; updateHint(); } }
async function play(){ if(playing) return; playing=true; AUTOPLAY=true; $('#b-play').textContent='Playing…'; updateHint();
  if(cur>=STEPS.length-1) await goTo(0);
  while(playing&&cur<STEPS.length-1){ await next(); await realSleep(1400); }
  playing=false; AUTOPLAY=false; hideCursor(); $('#b-play').textContent='Play'; updateHint(); }
const HINTS={0:'#sg-main',3:'#why-1',4:'#vp-1',5:'#show-gap',6:'#rd-9',7:'#an-cmp:not([disabled]), #an-c1:not(.on)',8:'#sev-review',9:'#fix-this',10:'#chip-fix',11:'#chip-apply',12:'#chip-approve',13:'#m-approve',14:'#back-queue',15:'#done-banner .btn'};
function showAn(){ show('analysis'); if(cur>=idx('compare')&&AN.mode!=='cmp'){ AN.mode='cmp'; } renderAn(); }
function updateHint(){ $$('.hint').forEach(e=>e.classList.remove('hint')); if(busy||playing||advancing) return; const sel=HINTS[cur]; const el=sel&&$(sel); if(el&&el.offsetParent) el.classList.add('hint'); }

/* ======================= header bits ======================= */
const starSvgs=()=>[...document.querySelectorAll('#feedback svg')].filter(s=>!s.closest('[class*="flame"]')).slice(0,5);
function paintStars(){ starSvgs().forEach((s,i)=>s.classList.toggle('star-on',i<st.stars)); }
starSvgs().forEach((s,i)=>{ s.style.cursor='pointer'; s.addEventListener('click',e=>{ e.stopPropagation(); st.stars=i+1; paintStars(); toast(`Thanks for rating Contracts AI ${i+1} of 5`); }); });
function placeModes(){ const p=$('#ov-modes'), r=$('#mode-dd').getBoundingClientRect(); p.style.top=(r.bottom/Z+6)+'px'; p.style.left=Math.max(12,r.left/Z-20)+'px'; p.style.position='fixed'; }
function filterModes(q){ q=(q||'').toLowerCase(); $$('#ov-modes li').forEach(li=>li.style.display=!q||li.textContent.toLowerCase().includes(q)?'':'none'); }

/* ======================= one click handler ======================= */
document.addEventListener('click',async e=>{
  const el=e.target.closest('[data-act]');
  if(!e.target.closest('#ov-menu,#menu-btn,#ov-modes,#mode-dd')){ ['#ov-menu','#ov-modes'].forEach(s=>$(s).style.display='none'); }
  if(!e.target.closest('.org-list,#org-dd')) $$('.org-list').forEach(x=>x.classList.remove('on'));
  if(!el) return;
  const a=el.dataset.act;
  if(playing&&a!=='restart'&&a!=='logo') return;
  if((busy||advancing)&&!['dd-modes','menu','close-ov','close-modal','view','sel','wstep','cfilter','fullscreen'].includes(a)) return;
  switch(a){
    case 'lm-why': { const n=+el.dataset.n; if(cur===3&&n===1) await advanceTo('reasoning'); else openWhy(n); break; }
    case 'lm-pdf': { const n=+el.dataset.n; if(cur===4&&n===1) await advanceTo('citation'); else openPdf(n); break; }
    case 'lm-pdf-x': openPdf(+el.dataset.n,false); break;
    case 'lm-redline': { const n=+el.dataset.n; if(n===9){ if(cur===6) await advanceTo('open'); else showAn(); } else { const r=RES.find(x=>x.n===n); toast(`${r.cp} is already signed · this demo redlines CTR-2026-01184`); } break; }
    case 'lm-compare': { const n=+el.dataset.n; if(n===9){ show('contract'); setView('TPL'); } else toast('Pick a second contract to compare with (demo)'); break; }
    case 'lm-rate': toast('Thanks, your rating helps rank results'); break;
    case 'lm-expand': { const n=+el.dataset.n; if(n===9){ show('contract'); setView(st.view); } else { const r=RES.find(x=>x.n===n); toast(`${r.id} · ${r.cp}`); } break; }
    case 'lm-more': el.closest('.lm-ais').classList.toggle('more'); el.textContent=el.closest('.lm-ais').classList.contains('more')?'View less':'View more'; break;
    case 'fav': el.classList.toggle('on'); el.style.color=el.classList.contains('on')?'#DB2777':''; toast(el.classList.contains('on')?'Added to favourites':'Removed from favourites'); break;
    case 'lm-save': toast('Saved to the project “Vendor contracts FY27”'); break;
    case 'lm-share': toast('Share link copied (demo)'); break;
    case 'lm-sort': toast('Sorted by relevance score, highest first'); break;
    case 'lm-filter': toast('Filters: 17 contracts · Services, Software, Facilities'); break;
    case 'lm-cat': el.classList.toggle('off'); toast(`${el.dataset.c} ${el.classList.contains('off')?'hidden from':'shown in'} the results`); break;
    case 'lm-coll': { const l=$('#lm-ci'); if(l){ const hid=l.style.display==='none'; l.style.display=hid?'':'none'; el.querySelector('svg').style.transform=hid?'rotate(180deg)':'rotate(0deg)'; } break; }
    case 'lm-goto': { const n=+el.dataset.n; show('results'); const c=$('#lmc-'+n); await scrollList(c); c.classList.add('flash'); setTimeout(()=>c.classList.remove('flash'),1500); break; }
    case 'lm-back': show('results'); break;
    case 'show-gap': if(cur===5) await advanceTo('gap'); else { show('results'); const c=$('#lmc-9'); await scrollList(c); openWhy(9,true); } break;
    case 'lm-gen': { const p=el.nextElementSibling; if(p) p.style.display=p.style.display==='none'?'':'none'; break; }
    case 'gen': toast('Generate a contract is coming soon'); break;
    case 'focus': $('#cin').focus(); break;
    case 'ingest': toast('Contracts ingested: 1,248 · up to date'); break;
    case 'home': closeOv(); closeModal(); document.body.classList.remove('chat-min','wide'); show('home'); break;
    case 'corpus': show('corpus'); break;
    case 'feat': { const f=el.dataset.f;
      if(f==='search'){ if(cur===0) await advanceTo('results'); else show('results'); }
      else if(f==='corpus') show('corpus');
      else if(f==='redline'){ if(cur===6) await advanceTo('open'); else if(cur===7) await advanceTo('compare'); else showAn(); }
      else if(f==='compare'){ if(cur===6) await advanceTo('open'); else if(cur===7) await advanceTo('compare'); else { if(cur<7){ AN.mode='pick'; } showAn(); } }
      else if(f==='compliance'){ show('contract'); setView('KEY'); }
      else toast('Generate a contract is coming soon');
      break; }
    case 'logo': playing=false; AUTOPLAY=false; closeOv(); closeModal(); await goTo(0); break;
    case 'restart': playing=false; AUTOPLAY=false; closeOv(); closeModal(); await goTo(0); toast('Demo restarted'); break;
    case 'cfilter': st.filter=el.dataset.f; renderCorpus(); updateHint(); break;
    case 'row': { closeOv(); const id=el.dataset.id; if(id===MAIN){ if(cur===6) await advanceTo('open'); else showAn(); } else { const r=[...QUEUE,...EXEC].find(x=>x.id===id); toast(`${r.id} · ${r.title} · ${r.sum?r.sum.split('.')[0]:'matches its template'}`); } break; }
    case 'view': setView(el.dataset.v); break;
    case 'send': { const v=$('#cin').value.trim(); if(v) pulseSend();
      if(cur===0&&(!v||/45|payment|net|days/i.test(v))){ await advanceTo('results'); }
      else if(cur===6&&/redline|check|template|01184|kestrel|open/i.test(v)){ $('#cin').value=''; await advanceTo('open'); }
      else if(cur===7&&/compar|template|redline/i.test(v)){ $('#cin').value=''; await advanceTo('compare'); }
      else if(cur===8&&/review|why|explain|payment|deep/i.test(v)){ $('#cin').value=''; await advanceTo('review'); }
      else if(cur===9&&/fix/i.test(v)){ $('#cin').value=''; await advanceTo('fixone'); }
      else if(cur===10&&/fix/i.test(v)){ $('#cin').value=''; await advanceTo('autofix'); }
      else if(cur===12&&/approve|sign/i.test(v)){ $('#cin').value=''; await advanceTo('approve'); }
      else if(v){ $('#cin').value=''; const key=/summar/i.test(v)?'summary':/date|deadline/i.test(v)?'dates':/renew/i.test(v)?'renew':/review|queue/i.test(v)?'corpus':/deviation/i.test(v)?'all9':null; freeQA(key,v); }
      else $('#cin').focus();
      break; }
    case 'free': freeQA(el.dataset.q); break;
    case 'sugg': { const k=el.dataset.k; if(k==='main'){ if(cur===0) await advanceTo('results'); else freeQA(null,QUESTION); } else freeQA(k); break; }
    case 'ask-main': if(cur===0) advanceTo('results'); else freeQA('all6'); break;
    case 'wstep': el.classList.toggle('open'); break;
    case 'trace': toast('Trace: 5 steps · 1,248 contracts · 3,912 clauses'); break;
    case 'dl': toast('Downloads are turned off in this demo'); break;
    case 'open-main': closeOv(); if(cur===6) await advanceTo('open'); else showAn(); break;
    case 'open-tpl': show('contract'); setView('TPL'); break;
    case 'compare': if(cur===7) await advanceTo('compare'); else showAn(); break;
    case 'fix': if(cur===10) await advanceTo('autofix'); else if(cur===8||cur===9) toast('Review the high-risk ones first: start with Payment terms'); break;
    case 'choose': { if(el.classList.contains('locked')) break; const g=el.dataset.g; st.choice[g]=el.dataset.v; el.parentElement.querySelectorAll('.opt').forEach(o=>{ const on=o.dataset.v===st.choice[g]; o.classList.toggle('on',on); o.innerHTML=(on?ico('i-check'):'')+CHOICES[g].opts.find(x=>x[0]===o.dataset.v)[1]; }); break; }
    case 'apply': if(cur===11) await advanceTo('decide'); break;
    case 'approve': if(cur===12) await advanceTo('approve'); else if(cur>=13) toast('This contract is already approved'); break;
    case 'send-sign': if(cur===13) await advanceTo('sent'); break;
    case 'close-modal': closeModal(); updateHint(); break;
    case 'back-queue': if(cur===14) await advanceTo('done'); else show('corpus'); break;
    case 'view-sum': modal(`<div class="cb"><div class="ct"><div><h2>Review summary</h2><small class="num">CTR-2026-01184 · Nov 20, 2026</small></div><div class="seal">REVIEWED<br>SAMPLE<br>CONTRACT</div></div>
        <div class="grid"><div><span>Contract</span><b>Facilities maintenance services agreement</b></div><div><span>Counterparty</span><b>Kestrel Facility Services LLC</b></div><div><span>Checked against</span><b>Vendor services template v4</b></div><div><span>Deviations</span><b>9 found · 7 fixed by AI · 2 decided</b></div><div><span>Payment terms</span><b>Net 45</b></div><div><span>Review time</span><b>5 minutes</b></div></div>
        <div class="cond"><b>Changes sent to the vendor.</b> ${DEVS.filter(d=>d.fix).map(d=>d.fix).join(' · ')} · ${CHOICES.cap.tag[st.choice.cap]} · ${CHOICES.ins.tag[st.choice.ins]}.</div></div>
        <div class="mf"><button class="btn out" data-act="dl">Download redline</button><button class="btn pri" data-act="close-modal">Close</button></div>`,true); break;
    case 'req-chg': if(cur<8) toast('Run the AI redline first, so the changes are tracked'); else if(cur<13) toast('The redline already holds every change for the vendor'); else toast('This contract is already out for signature'); break;
    case 'approve-hdr':
      if(cur===12) await advanceTo('approve');
      else if(cur>=13) toast('This contract is already approved');
      else modal(`<div class="mh"><span class="ic" style="background:var(--warn-soft);color:var(--warn)">${ico('i-alert')}</span><h3>Not ready to approve</h3></div>
        <div class="mb">${cur<8?'This draft has <b>9 open deviations</b> from your template, 4 of them high risk. Compare it with the template first.':'<b>2 deviations</b> still need your call: limitation of liability and insurance.'}</div>
        <div class="mf"><button class="btn out" data-act="close-modal">Close</button>${cur===7?'<button class="btn pri" data-act="m-compare">Compare with our template</button>':''}</div>`);
      break;
    case 'm-compare': closeModal(); if(cur===7) await advanceTo('compare'); break;
    /* --- the real AppMod.AI shell controls --- */
    case 'projects': show('projects'); break;
    case 'pj-open': { const p=el.dataset.p; if(/Vendor contracts|Facilities/.test(p)) { show('corpus'); toast('Opened project · '+p); } else toast('Opened project · '+p+' (sample)'); break; }
    case 'pj-new': toast('New projects are turned off in this demo'); break;
    case 'filter': { closeOv(); $('#ov-filter').style.display='flex'; break; }
    case 'org-dd': { const host=el.parentElement; host.style.position='relative'; let l=host.querySelector('.org-list'); if(!l){ l=document.createElement('div'); l.className='org-list'; host.appendChild(l); } l.innerHTML=['All organisations','Legal','Procurement','Facilities','Programs'].map(o=>`<div data-act="org" data-o="${o}" class="${o===st.org?'sel':''}">${o===st.org?'✓ ':''}${o}</div>`).join(''); l.classList.toggle('on'); break; }
    case 'org': { e.stopPropagation(); st.org=el.dataset.o; const lab=$('#org-dd .p-multiselect-label'); if(lab){ lab.textContent=st.org; lab.classList.remove('p-placeholder'); } el.parentElement.classList.remove('on'); break; }
    case 'filter-apply': $('#ov-filter').style.display='none'; toast(`Filter applied · ${st.org}`); break;
    case 'close-ov': closeOv(); break;
    case 'newchat': { closeOv(); raw(`<div class="divider">New conversation</div>`); const w=greet(); scrollChat(w); break; }
    case 'chatmin': closeOv(); document.body.classList.add('chat-min'); break;
    case 'chatmax': document.body.classList.remove('chat-min'); updateHint(); break;
    case 'menu': { const m=$('#ov-menu'); m.style.display=m.style.display==='none'?'block':'none'; break; }
    case 'mi': { const m=el.dataset.m; $('#ov-menu').style.display='none';
      if(/Minimize/.test(m)) document.body.classList.add('chat-min');
      else if(/Recollect/.test(m)){ st.recollect=!st.recollect; const s=[...el.querySelectorAll('span')].find(x=>/Recollect/.test(x.textContent)); if(s) s.textContent=`Recollect Harder ${st.recollect?'On':'Off'}`; el.dataset.m=`Recollect Harder ${st.recollect?'On':'Off'}`; toast(`Recollect Harder ${st.recollect?'on':'off'}`); }
      else if(/History/.test(m)) $('#ov-hamb').style.display='flex';
      else if(/Export/.test(m)) toast('Conversation exported to Docs (demo)');
      else if(/Quality/.test(m)) toast('Pre-release quality checklist: 12 of 12 passed (demo)');
      else if(/Log/.test(m)) toast('Log controls are admin-only in this demo');
      else if(/Ping/.test(m)){ st.ping=!st.ping; const sw=el.querySelector('[class*="rounded-full"]'); if(sw) sw.style.background=st.ping?'#5928ED':''; toast(`Ping Pong Asst. ${st.ping?'on':'off'}`); }
      break; }
    case 'hamb': { closeOv(); $('#ov-hamb').style.display='flex'; break; }
    case 'hm-settings': toast('Settings are turned off in this demo'); break;
    case 'hm-sign': toast('Sign out is turned off in this demo'); break;
    case 'dd-modes': { const p=$('#ov-modes'); const open=p.style.display==='none'; closeOv(); if(open){ placeModes(); p.style.display='block'; const i=$('#mode-search'); if(i){ i.value=''; filterModes(''); setTimeout(()=>i.focus(),30);} } break; }
    case 'mode': { const m=el.dataset.mode; $('#ov-modes').style.display='none'; if(m==='Contracts AI Mode') show('home'); else toast(`${m} isn’t part of this demo`); break; }
    case 'usage': toast('Used today: $0.00 of your $30 daily budget'); break;
    case 'attach': toast('Attach a contract (PDF or DOCX) · turned off in this demo'); break;
    case 'guide': toast('Guidelines: Vendor services template v4 is attached'); break;
    case 'cart': toast('Context: 1,248 contracts · 5 templates'); break;
    case 'add': { const w=bot(`<p>What would you like to do?</p>${opts([['Search contracts','data-act="sugg" data-k="main"'],['Redline a contract','data-act="sugg" data-k="redline0"'],['Compare contracts','data-act="sugg" data-k="compare0"']])}`); scrollChat(w); break; }
    case 'speaker': { const on=!el.classList.contains('cx-on'); el.classList.toggle('cx-on',on); el.style.color=on?'#5928ED':''; toast(on?'Voice replies on':'Voice replies off'); break; }
    case 'mic': { if(el.classList.contains('cx-rec')) break; el.classList.add('cx-rec'); el.style.color='#5928ED';
      const q=cur===0?QUESTION:cur===7?'Compare it with our template':'Summarise this contract', cin=$('#cin'); cin.value='';
      for(let i=1;i<=q.length;i++){ cin.value=q.slice(0,i); await realSleep(22); }
      el.classList.remove('cx-rec'); el.style.color=''; cin.focus(); toast('Got it. Press send to ask.'); break; }
    case 'fullscreen': if(document.fullscreenElement) document.exitFullscreen().catch(()=>{}); else document.documentElement.requestFullscreen?.().catch(()=>toast('Full screen isn’t available here')); break;
  }
});
$('#ov-filter').addEventListener('click',e=>{ if(e.target.id==='ov-filter') closeOv(); });
$('#ov-hamb').addEventListener('click',e=>{ if(e.target.id==='ov-hamb') closeOv(); });
$('#modal-bg').addEventListener('click',e=>{ if(e.target.id==='modal-bg'&&cur!==13){ closeModal(); updateHint(); } });
$('#mode-search')?.addEventListener('input',e=>filterModes(e.target.value));
$('#pj-search').addEventListener('input',renderProjects);
$('#hist-search')?.addEventListener('input',e=>{ const q=e.target.value.toLowerCase(); $$('#ov-hamb .p-sidebar-content button, #ov-hamb .p-sidebar-content [class*="rounded"]').forEach(()=>{}); });
(function sendLoop(){ const v=!!$('#cin').value.trim(); $('#send').classList.toggle('ready',v); requestAnimationFrame(sendLoop); })();
function pulseSend(){ const b=$('#send'); b.classList.remove('sent'); void b.offsetWidth; b.classList.add('sent'); setTimeout(()=>b.classList.remove('sent'),700); }
$('#cin').addEventListener('keydown',e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); $('#send').click(); } });
$('#b-next').onclick=()=>{ if(!playing&&!advancing) next(); };
$('#b-prev').onclick=()=>{ playing=false; if(cur>0) goTo(cur-1); };
$('#b-play').onclick=()=>play();
addEventListener('keydown',e=>{ if(e.target.matches('input,textarea,[contenteditable=true]')) return;
  if(e.key==='ArrowRight'){ if(!playing) next(); } else if(e.key==='ArrowLeft'){ playing=false; if(cur>0) goTo(cur-1); } else if(e.key===' '){ e.preventDefault(); play(); } else if(e.key==='Escape'){ closeOv(); closeModal(); } });

{ const w=$('#scr-home h1'); const p=w&&w.nextElementSibling; if(p) p.insertAdjacentHTML('afterend','<p class="lm-ing">Contracts ingested: <b>1,248</b> <span data-act="ingest" title="Refresh">⟳</span></p>'); }
const start=Math.max(0,idx(location.hash.slice(1)));
(document.fonts?document.fonts.ready:Promise.resolve()).then(async()=>{ await goTo(start); if(P.has('play')) play(); });
window.__goTo=goTo; window.__steps=STEPS.map(s=>s.id); window.__state=()=>({cur,screen,busy:busy||advancing,freeBusy});
