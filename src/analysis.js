/* ======================= Contracts Analysis and redlining =======================
   From the success story (1:59): "the same cognitive decisioning can also power comparison, redlining and deviation
   analysis". 1) Comparison: the AI suggests templates and similar contracts, each with a similarity score and why it
   is suggested; pick one, Compare. 2) Deviation analysis: the uploaded draft and the template side by side, section by
   section, "No Deviation" or a % between them, the differing words highlighted on both sides; deviations by severity
   High / Medium / Low with Fix. 3) Redlining: each fix is written into the draft as a tracked change. Sample data only. */
const SEV={1:'high',4:'high',5:'high',0:'med',3:'med',6:'med',8:'med',2:'low',7:'low'};
const SIM={0:64,1:41,2:78,3:66,4:58,5:52,6:71,7:74,8:60};
const SEVN={high:'High',med:'Medium',low:'Low'};
const LEAD={0:'The initial term is set out in Section 2.1.',1:'Each invoice shall include the purchase order number and the services delivered.',2:'Late payments are handled as follows.',
  3:'Fees are listed in Schedule B.',4:'This Agreement may be ended as follows.',5:'Neither party limits its liability for fraud or gross negligence.',6:'Vendor shall keep the following insurance during the term.',
  7:'Vendor shall keep complete records of the Services.',8:'This Agreement is the entire agreement between the parties.'};
const SECS=[
 {s:'1.1',n:'Services',a:'Vendor shall maintain the building systems listed in Schedule A, including HVAC, electrical and plumbing, at the service levels in Schedule C.',b:'Vendor shall perform the Services listed in Schedule A at the service levels in Schedule C.'},
 {s:'2.1',n:'Term',a:'This Agreement runs for three (3) years from January 1, 2027.',b:'This Agreement runs for the term stated on the cover page.'},
 {d:0},{s:'3.1',n:'Fees',a:'The Agency shall pay the fees in Schedule B.',b:'The Agency shall pay the fees in Schedule B.'},{d:1},
 {s:'3.3',n:'Invoices',a:'Vendor shall invoice monthly in arrears, with the purchase order number.',b:'Vendor shall invoice monthly in arrears, with the purchase order number.'},{d:2},{d:3},{d:4},
 {s:'7.1',n:'Confidential information',a:'Vendor shall keep Agency information confidential and use it only to perform the Services.',b:'Vendor shall keep Agency information confidential and use it only to perform the Services.'},
 {s:'8.1',n:'Indemnity',a:'Vendor shall defend and indemnify the Agency against third-party claims arising from the Services.',b:'Vendor shall defend and indemnify the Agency against third-party claims arising from the Services.'},
 {d:5},{d:6},{d:7},{d:8},
];
const PICKS=[
 {k:'Template',n:'Vendor Services Template v4',sim:94,why:96,ord:'first',d:'The Agency’s standard terms for buying services from a vendor. Approved by Legal; 46 clauses.',r:['Same contract type: vendor services, paid monthly.','It is the template Legal approved for every vendor services contract.','44 of the draft’s 46 clause headings match it.']},
 {k:'Template',n:'Facilities Services Template v2',sim:89,why:91,ord:'second',d:'Older template for building maintenance and repairs, before the vendor template replaced it.',r:['Covers building maintenance, like this draft.','Replaced by the vendor services template in 2025.']},
 {k:'Similar Contract',n:'Security guard services · CTR-2026-01145',sim:86,why:88,ord:'third',d:'A signed facilities vendor contract on the Agency’s paper, $1.9M over 3 years.',r:['Signed on the template, with the same services structure.','Shows how Legal settled liability and insurance last time.']},
];
const EXPL={1:['The draft makes every invoice due <b>15 days from the invoice date</b>, not from receipt.','Your Vendor Services Template v4 allows <b>45 days from receipt of a proper invoice</b>, and every signed vendor contract follows it.'],
  4:['The Agency can end the contract only if the vendor breaches it.','The template also lets the Agency end it for convenience on 30 days’ notice.'],
  5:['The vendor’s liability is capped at 1× the annual fees ($400K).','The template caps it at 2× the total contract value ($2.4M).']};
const sevIdx=s=>DEVS.map((_,i)=>i).filter(i=>SEV[i]===s);
let AN={mode:'pick',pick:0,pickerOpen:false,exp:null,focus:null};
const anReset=()=>{ AN={mode:'pick',pick:0,pickerOpen:false,exp:null,focus:null}; };

/* ---------- render ---------- */
function anSimTotal(){ const done=st.dev.filter(s=>s==='fixed'||s==='decided').length; return Math.min(100,94+Math.round(done*6/9)); }
function anDevText(i,side){ const d=DEVS[i], s=st.dev[i];
  if(side==='b') return `${LEAD[i]} <span class="an-hl ${s==='fixed'||s==='decided'?'ok':''}">${d.t}</span>`;
  if(s==='fixed') return `${LEAD[i]} <span class="an-tc"><s>${d.v}</s> <ins>${d.t}</ins></span>`;
  if(s==='decided'){ const keep=(d.you==='cap'&&st.choice.cap==='1x')||(d.you==='ins'&&st.choice.ins==='1m'); return keep?`${LEAD[i]} <span class="an-hl kept">${d.v}</span>`:`${LEAD[i]} <span class="an-tc"><s>${d.v}</s> <ins>${d.t}</ins></span>`; }
  return `${LEAD[i]} <span class="an-hl">${d.v}</span>`; }
function anLink(i){ const s=st.dev[i];
  if(s==='fixed') return `<span class="an-lk ok">${ico('i-check')}Fixed</span>`;
  if(s==='decided') return `<span class="an-lk ok">${ico('i-check')}Decided</span>`;
  if(s==='you') return `<span class="an-lk you">Your call</span>`;
  return `<span class="an-lk ${SEV[i]}">${SIM[i]}%</span>`; }
function anRow(x,k){
  if(x.d===undefined) return `<div class="an-row nd"><div class="an-sec"><div class="an-sh"><b>${x.n}</b><small>§ ${x.s}</small>${ico('i-chev')}</div></div><div class="an-mid"><span class="an-lk nd">No Deviation</span></div><div class="an-sec"><div class="an-sh"><b>${x.n}</b><small>§ ${x.s}</small>${ico('i-chev')}</div></div></div>`;
  const i=x.d, d=DEVS[i], s=st.dev[i], st2=s==='fixed'||s==='decided'?'ok':s==='you'?'you':SEV[i];
  return `<div class="an-row dv ${st2} ${AN.focus===i?'focus':''}" id="anr-${i}"><div class="an-sec"><div class="an-sh"><b>${d.n}</b><small>§ ${d.s}</small>${ico('i-chev')}</div><p>${anDevText(i,'a')}</p></div>
    <div class="an-mid">${anLink(i)}</div><div class="an-sec"><div class="an-sh"><b>${d.n}</b><small>§ ${d.s}</small>${ico('i-chev')}</div><p>${anDevText(i,'b')}</p></div></div>`; }
function anPickers(){ return `<div class="an-pk ${AN.mode==='cmp'&&!AN.pickerOpen?'min':''}" id="an-pk">
   ${AN.mode==='cmp'?`<div class="an-pkbar" data-act="an-pkt">Suggested Templates/Contracts ${ico('i-chev')}</div>`:''}
   <div class="an-pkb"><div class="an-pkh"><div><b>Select any Template or contract</b><small>Select a template or similar contract to compare with your uploaded document.</small></div>
     <button class="an-cmp" id="an-cmp" data-act="an-cmp" ${AN.pick?'':'disabled'}>Compare</button></div>
    <div class="an-cards">${PICKS.map((p,j)=>`<div class="an-card ${AN.pick===j+1?'on':''}" id="an-c${j+1}" data-act="an-pick" data-n="${j+1}">
      <div class="an-ct"><span class="an-kind ${p.k==='Template'?'':'sim'}">${ico(p.k==='Template'?'i-doc':'i-layers')}${p.k}</span><span class="an-rad" id="an-r${j+1}"></span></div>
      <div class="an-cn"><b>${p.n}</b><span class="an-simp">${p.sim}% Similarity</span></div><p>${p.d}</p>
      <div class="an-why" data-act="an-why" data-n="${j+1}">Why this ${p.k==='Template'?'template':'contract'} is suggested ${p.ord}<span class="an-ds">${HAND}${p.why}%</span></div>
      <ul class="an-wl" id="an-wl${j+1}">${p.r.map(r=>`<li>${r}</li>`).join('')}</ul></div>`).join('')}</div></div></div>`; }
function renderAn(){ const b=$('#an-body'); if(!b) return; const p=PICKS[(AN.pick||1)-1];
  if(AN.mode==='pick'){
    b.innerHTML=`${anPickers()}<div class="an-doc"><div class="an-dh">${ico('i-doc')}<b>Uploaded Contract</b> · CTR-2026-01184_vendor-draft-v2.pdf<span class="sp"></span><span class="an-pg">1 / 18</span><span class="an-z">−</span><span class="an-pg">100%</span><span class="an-z">+</span></div>
      <div class="pdfbg"><div class="paper legal">${kestrelPage('an')}</div></div></div>`;
    return; }
  b.innerHTML=`${anPickers()}<div class="an-tools"><span class="an-filt" data-act="an-filter">${ico('i-filter')}Filters</span></div>
   <div class="an-cmpv"><div class="an-hd"><div class="an-col l">${ico('i-doc')}<b>Uploaded Contract</b><small>CTR-2026-01184_vendor-draft-v2.pdf</small></div><div class="an-mid"><span class="an-lk tot" id="an-tot">${anSimTotal()}% Similarity</span></div><div class="an-col r">${ico('i-book')}<b class="bl">${p.n}</b></div></div>
    <div class="an-rows" id="an-rows">${SECS.map(anRow).join('')}</div></div>`; }
function anUpd(i,s,anim){ st.dev[i]=s; updDev(i,s,false); const old=$('#anr-'+i); if(!old) return; const k=SECS.findIndex(x=>x.d===i);
  const d=document.createElement('div'); d.innerHTML=anRow(SECS[k]); const el=d.firstElementChild; old.replaceWith(el); const t=$('#an-tot'); if(t) t.textContent=anSimTotal()+'% Similarity';
  if(anim&&ANIM){ el.classList.add(s==='marked'?'mark-in':'flash'); } }
async function anFocus(i,anim){ AN.focus=i; $$('#an-rows .an-row').forEach(r=>r.classList.toggle('focus',r.id==='anr-'+i)); const el=$('#anr-'+i), box=$('#an-rows'); if(!el||!box) return;
  const er=el.getBoundingClientRect(), br=box.getBoundingClientRect(); const top=box.scrollTop+(er.top-br.top)/Z;
  const tgt=Math.max(0,top-24); if(anim&&ANIM) await smoothScroll(box,tgt,700); else box.scrollTop=tgt; }

/* ---------- the severity panel in chat ---------- */
function sevItem(i,n){ const d=DEVS[i], s=st.dev[i], done=s==='fixed'||s==='decided';
  return `<div class="sv-it ${done?'done':''}" id="sv-${i}"><div class="sv-r"><span class="sv-t">${n}. ${d.n} <small>§ ${d.s}</small></span><span class="sv-hand">${HAND}</span>
    ${done?`<span class="sv-ok">${ico('i-check')}Fixed</span>`:s==='you'?`<span class="sv-you">Your call</span>`:`<span class="sv-fix" data-act="sv-fix" data-i="${i}">Fix</span>`}<span class="sv-go" data-act="sv-go" data-i="${i}">${ico('i-ext')}</span></div>
    ${AN.exp===i?sevExplain(i):''}</div>`; }
function sevExplain(i){ const e=EXPL[i]||[`The draft says: “${DEVS[i].v}”`,`Your template says: “${DEVS[i].t}”`]; const done=st.dev[i]==='fixed';
  return `<div class="sv-ex"><div class="sv-exh">Explanation${ico('i-chev')}</div><ol>${e.map(x=>`<li>${x}</li>`).join('')}</ol>
    ${done?`<div class="sv-done">${ico('i-check')}Fixed: ${DEVS[i].fix}. Tracked in the redline.</div>`:`<span class="sv-fixthis" id="fix-this" data-act="fix-this" data-i="${i}">Fix this deviation ${icoS('i-arrow',14)}</span>`}
    <div class="sv-cd"><span>${HAND}Cognitive Decisioning AI</span><span class="sv-dstr">${ico('i-spark')}Decision Strength ${i===1?96:92}%</span></div>
    <div class="sv-acc" data-act="sv-acc"><span class="ic y">${ico('i-bulb')}</span><div><b>Reasoning</b><small>Why This Was Picked</small></div>${ico('i-chev')}<div class="sv-ab">Section ${DEVS[i].s} is the only ${DEVS[i].n.toLowerCase()} clause in the draft, and the template’s § ${DEVS[i].s} is the version Legal approved.</div></div>
    <div class="sv-acc" data-act="sv-acc"><span class="ic b">${ico('i-scan')}</span><div><b>Gap</b><small>What’s missing or unclear</small></div>${ico('i-chev')}<div class="sv-ab">${i===1?'The draft never defines a “proper invoice”; the template does in § 3.3.':'No gaps identified.'}</div></div></div>`; }
function sevPanel(){ let n=0; const grp=s=>{ const ids=sevIdx(s); const open=s==='high';
    return `<div class="sv-g ${s} ${open?'open':''}"><div class="sv-gh" data-act="sv-grp"><b>${SEVN[s]}(${ids.length})</b>${s==='high'?`<span class="sv-rev" id="sev-review" data-act="sv-review">Review ›</span>`:ico('i-chev')}</div><div class="sv-gb">${ids.map(i=>sevItem(i,++n)).join('')}</div></div>`; };
  return `<div class="sv" id="sv-panel">${grp('high')}${grp('med')}${grp('low')}</div>`; }
function sevRefresh(){ const p=$('#sv-panel'); if(!p) return; const open=[...p.querySelectorAll('.sv-g')].map(g=>g.classList.contains('open')); const d=document.createElement('div'); d.innerHTML=sevPanel(); const nw=d.firstElementChild;
  [...nw.querySelectorAll('.sv-g')].forEach((g,k)=>g.classList.toggle('open',open[k])); p.replaceWith(nw); }

/* ---------- the guided steps (replace the old single-column redline) ---------- */
const AN_STEPS=[
 {id:'open',label:'Pick what to compare',run:async t=>{
    const c=$('#rd-9')||$('#chip-open'); if(ANIM&&c){await point(c); await sleep(120); guard(t);} hideCursor();
    anReset(); show('analysis'); renderAn(); $('#an-body').scrollTop=0;
    raw(`<div class="divider">Opened CTR-2026-01184</div>`);
    const m=bot(`<p>The vendor draft <b>CTR-2026-01184</b> (Kestrel Facility Services, $1.2M over 3 years) is loaded and ready.</p><p style="margin-top:6px">Based on it, here are the <b>templates and similar contracts</b> you may want to compare it with. Please select one to start the comparison.</p>`,'9:44 AM');
    await scrollChat(m);
    if(ANIM){ await sleep(900); guard(t); } const wl=$('#an-wl1'); if(wl) wl.classList.add('on'); // it explains why the first template is suggested
 }},
 {id:'compare',label:'Side by side',run:async t=>{
    if(!AN.pick){ const r=$('#an-c1'); if(ANIM&&r){ await point($('#an-r1')); await sleep(120); guard(t);} AN.pick=1; renderAn(); if(ANIM){ await sleep(420); guard(t);} }
    const b=$('#an-cmp'); if(ANIM&&b){ await point(b); await sleep(120); guard(t);} hideCursor();
    const u=user(`Compare with ${PICKS[AN.pick-1].n}`,'9:45 AM'); await scrollChat(u);
    AN.mode='cmp'; renderAn(); $('#an-rows').scrollTop=0;
    await analyzing(t,'Contract Comparison',[['Paired every section with the template · <b>46 of 46</b>'],['Compared the wording clause by clause · <b>37 match</b>'],['Rated each deviation by severity · <b>3 high, 4 medium, 2 low</b>']],'3');
    for(let i=0;i<DEVS.length;i++){ guard(t); anUpd(i,'marked',true); if(ANIM) await sleep(140); }
    const a=bot(`<p>Below are the <b>9 deviations</b> I found, categorized by severity to make the review easier.</p>${sevPanel()}
      <p class="lm-lbl" style="margin-top:12px">Suggested next steps:</p>${opt('Deep dive into: Payment terms, § 3.2','data-act="sv-review"')}${opt('Fix every routine deviation','data-act="fix"')}`,'9:46 AM');
    await scrollChat(a,'top');
 }},
 {id:'review',label:'Why it’s a deviation',run:async t=>{
    const r=$('#sev-review'); if(ANIM&&r){ await point(r); await sleep(120); guard(t);} hideCursor();
    AN.exp=1; sevRefresh(); await anFocus(1,true); await scrollChat($('#sv-panel'),'top'); // the whole panel stays in view
 }},
 {id:'fixone',label:'Fixed as a tracked change',run:async t=>{
    const f=$('#fix-this'); if(ANIM&&f){ await point(f); await sleep(150); guard(t);} hideCursor();
    anUpd(1,'fixed',true); setStatus('redline'); sevRefresh();
    const m=bot(`<p><b>Fixed.</b> Section 3.2 now matches your template: payment within <b>45 days of a proper invoice</b>. The change is tracked in the redline.</p>
      <div class="nchips"><span class="nchip go" id="chip-fix" data-act="fix">${ico('i-spark')}Fix the 6 other routine ones</span><span class="nchip" data-act="free" data-q="all9">Show all 9</span></div>`,'9:46 AM');
    await scrollChat(m);
 }},
 {id:'autofix',label:'7 fixed, 2 left',run:async t=>{
    const b=$('#chip-fix'); if(ANIM&&b){await point(b); await sleep(120); guard(t);} hideCursor(); if(b) b.classList.add('picked');
    for(let i=0;i<DEVS.length;i++){ if(st.dev[i]==='fixed') continue; guard(t); if(DEVS[i].fix) await anFocus(i,true); anUpd(i,DEVS[i].fix?'fixed':'you',true); if(ANIM) await sleep(DEVS[i].fix?380:160); }
    await anFocus(5,true); sevRefresh();
    const a=bot(`<p class="lead"><b>7 of 9 fixed</b> to match your template. Every change is a tracked change in the redline.</p>
      <ul class="fixlist">${DEVS.filter(d=>d.fix).map(d=>`<li>${tick}${d.fix}</li>`).join('')}</ul>
      <div class="dec" id="dec"><div class="dh">${ico('i-scale')}2 calls for you</div>
        ${DEVS.filter(d=>d.you).map(d=>{const c=CHOICES[d.you]; return `<div class="dr"><div class="dt">${d.n} · § ${d.s}<span class="risk ${d.r}"><i></i>${d.r==='high'?'High':'Medium'}</span></div>
          <div class="rec">AI recommends: <b>${c.opts.find(o=>o[0]===c.rec)[1]}</b>, as in your template.</div>
          <div class="opts">${c.opts.map(o=>`<span class="opt ${st.choice[d.you]===o[0]?'on':''}" data-act="choose" data-g="${d.you}" data-v="${o[0]}">${st.choice[d.you]===o[0]?ico('i-check'):''}${o[1]}</span>`).join('')}</div></div>`;}).join('')}
        <div class="df"><button class="btn pri sm" id="chip-apply" data-act="apply">${ico('i-check')}Apply my decisions</button></div></div>`,'9:47 AM');
    await scrollChat(a);
 }},
 {id:'decide',label:'Attorney decides',run:async t=>{
    const b=$('#chip-apply'); if(ANIM&&b){await point(b); await sleep(150); guard(t);} hideCursor();
    if(b){ b.disabled=true; b.classList.add('done'); b.innerHTML=ico('i-check')+'Applied'; } $$('#dec .opt').forEach(o=>o.classList.add('locked'));
    for(let i=0;i<DEVS.length;i++){ if(DEVS[i].you){ guard(t); anUpd(i,'decided',true); if(ANIM) await sleep(380); } }
    setStatus('ready'); sevRefresh();
    const a=bot(`<div class="allok"><div class="gh">${icoS('i-check',18)}Redline complete · 0 open deviations</div><p>7 fixed to match the template and 2 decided by you. Payment is now net 45, and the review took <b>5 minutes</b>.</p></div>
      <div class="nchips"><span class="nchip go okc" id="chip-approve" data-act="approve">${ico('i-check')}Approve and send for signature</span><span class="nchip" data-act="an-export">Export the redlined contract</span></div>`,'9:48 AM');
    await scrollChat(a,'top');
 }},
];

/* ---------- clicks ---------- */
document.addEventListener('click',async e=>{ const el=e.target.closest('[data-act^="an-"],[data-act^="sv-"],[data-act="fix-this"]'); if(!el||playing) return; const a=el.dataset.act;
  if((busy||advancing)&&!['sv-acc','sv-grp','an-pkt','an-why'].includes(a)) return;
  switch(a){
   case 'an-pick': { if(e.target.closest('[data-act="an-why"]')) break; if(AN.mode==='cmp'&&cur>=idx('compare')){ AN.pick=+el.dataset.n; renderAn(); break; } AN.pick=+el.dataset.n; renderAn(); updateHint(); break; }
   case 'an-why': { e.stopPropagation(); const l=$('#an-wl'+el.dataset.n); if(l) l.classList.toggle('on'); break; }
   case 'an-cmp': if(!AN.pick){ toast('Select a template or contract first'); break; } if(cur===idx('open')) await advanceTo('compare'); else { AN.mode='cmp'; AN.pickerOpen=false; renderAn(); } break;
   case 'an-pkt': AN.pickerOpen=!AN.pickerOpen; renderAn(); break;
   case 'an-filter': toast('Filters: severity, section, fixed or open · 0 applied'); break;
   case 'an-export': modal(`<div class="mh"><span class="ic">${ico('i-download')}</span><h3>Export redlined contract</h3></div><div class="mb">CTR-2026-01184_vendor-draft-v2_<b>redlined</b>.docx · every change as a tracked change, with a comment on each deviation explaining why it changed.</div><div class="mf"><button class="btn out" data-act="close-modal">Cancel</button><button class="btn pri" data-act="dl">${ico('i-download')}Download .docx</button></div>`); break;
   case 'an-back': show(cur>=idx('done')?'corpus':'results'); break;
   case 'sv-grp': el.parentElement.classList.toggle('open'); break;
   case 'sv-review': if(cur===idx('compare')) await advanceTo('review'); else { const g=$('#sv-panel .sv-g.high'); if(g) g.classList.add('open'); AN.exp=1; sevRefresh(); show('analysis'); if(AN.mode!=='cmp'){ AN.mode='cmp'; renderAn(); } await anFocus(1,true); } break;
   case 'sv-go': { const i=+el.dataset.i; show('analysis'); if(AN.mode!=='cmp'){ AN.mode='cmp'; renderAn(); } await anFocus(i,true); break; }
   case 'sv-fix': { const i=+el.dataset.i; if(i===1&&cur===idx('review')){ await advanceTo('fixone'); break; } if(cur<idx('compare')) break; if(DEVS[i].you){ toast('This one is a legal call: choose an option below'); break; } AN.exp=i; anUpd(i,'fixed',true); sevRefresh(); await anFocus(i,true); toast(`Fixed: ${DEVS[i].fix}`); break; }
   case 'fix-this': { const i=+el.dataset.i; if(i===1&&cur===idx('review')) await advanceTo('fixone'); else if(!DEVS[i].you){ anUpd(i,'fixed',true); sevRefresh(); toast(`Fixed: ${DEVS[i].fix}`); } break; }
   case 'sv-acc': el.classList.toggle('open'); break;
  }
});
