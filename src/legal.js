/* ======================= Legal Mode results (from the Contract Intelligence demo) ======================= */
const RES=[
 {n:1,title:'Cloud Hosting Services',cp:'Northwind Cloud Systems',id:'CTR-2025-00733',ind:'SOFTWARE',type:'MSA',prod:'SERVICE',date:'JUL-01-2025',p2:'NORTHWIND CLOUD SYSTEMS',score:100,doc:'nw',
  sum:'This <b>Master Services Agreement (MSA)</b> sets the terms for <b>Northwind Cloud Systems</b> to host the Agency’s applications. Effective July 1st, 2025, undisputed invoices are due within forty-five (45) days of a proper invoice…',
  why:['Sets payment for every undisputed invoice at <b>forty-five (45) days</b> of a proper invoice, an exact match for “45 days or more”.','Amendment 1 (March 2026) replaces the price schedule only, so the payment term still applies.','The contract is active until June 30, 2028, and uses the same wording as the Agency’s template.']},
 {n:2,title:'IT Staffing Services',cp:'Summit Talent Partners',id:'CTR-2025-00612',ind:'SERVICES',type:'MSA',prod:'SERVICE',date:'APR-01-2025',p2:'SUMMIT TALENT PARTNERS',score:90,doc:'su',
  sum:'This <b>Master Services Agreement (MSA)</b> is entered into between the <b>Agency</b> and <b>Summit Talent Partners</b> for IT staffing. Each proper invoice is paid within sixty (60) days of receipt…',
  why:['Pays each proper invoice within <b>sixty (60) days</b>, which is more than 45.','Timesheets are required with every invoice, so the clock starts on a proper invoice.','Active until March 31, 2027.']},
 {n:3,title:'Case Management System, Phase 2',cp:'Meridian Data Partners',id:'CTR-2026-01169',ind:'SOFTWARE',type:'SOW',prod:'SERVICE',date:'JAN-05-2027',p2:'MERIDIAN DATA PARTNERS',score:80,doc:'me',
  sum:'This <b>Statement of Work (SOW)</b> between the <b>Agency</b> and <b>Meridian Data Partners</b> covers phase 2 of the case management system. Each milestone payment is due forty-five (45) days after written acceptance…',
  why:['Milestone payments are due <b>45 days after written acceptance</b> of each deliverable.','The term counts from acceptance, not the invoice date, so it ranks below exact invoice terms.','Still a draft in the review queue.']},
 {n:4,title:'Office Supplies',cp:'Keystone Office Supply',id:'CTR-2025-00841',ind:'COMMERCIAL',type:'SUPPLY',prod:'PRODUCT',date:'JAN-06-2025',p2:'KEYSTONE OFFICE SUPPLY',score:70,doc:'ke',
  sum:'This <b>Supply Agreement</b> covers office supplies for the <b>Agency</b>. Payment is made net forty-five (45) days from the later of delivery or invoice…',
  why:['Payment is <b>net 45</b> from the later of delivery or invoice.','Prices are fixed for the term.','Active until December 31, 2026.']},
 {n:5,title:'Data Migration Services',cp:'Cobalt Systems Group',id:'CTR-2026-01163',ind:'SOFTWARE',type:'SOW',prod:'SERVICE',date:'FEB-01-2027',p2:'COBALT SYSTEMS GROUP',score:68,doc:null,
  sum:'This <b>Statement of Work (SOW)</b> with <b>Cobalt Systems Group</b> covers data migration in three milestones, each paid forty-five (45) days after acceptance…',
  why:['Three milestones, each paid <b>45 days after acceptance</b>.','Ranks below #3 because acceptance has a 10-day review window.','In the review queue.']},
 {n:6,title:'Fleet Vehicle Parts Supply',cp:'Atlas Fleet Supply',id:'CTR-2026-01188',ind:'COMMERCIAL',type:'VENDOR',prod:'PRODUCT',date:'MAR-01-2027',p2:'ATLAS FLEET SUPPLY',score:64,doc:null,
  sum:'This <b>Vendor Agreement</b> covers vehicle parts for the Agency’s fleet, with delivery within 5 business days and payment net forty-five (45)…',
  why:['Payment is <b>net 45</b> from invoice.','Pricing is fixed for two years.','In the review queue.']},
 {n:7,title:'Translation Services',cp:'Lingua Bridge Services',id:'CTR-2026-01172',ind:'SERVICES',type:'MSA',prod:'SERVICE',date:'JAN-01-2027',p2:'LINGUA BRIDGE SERVICES',score:60,doc:null,
  sum:'This <b>Master Services Agreement (MSA)</b> with <b>Lingua Bridge Services</b> sets rates per language and pays invoices within forty-five (45) days…',
  why:['Invoices are paid within <b>45 days</b>.','Rates are set per language in Schedule A.','In the review queue.']},
 {n:8,title:'Security Guard Services',cp:'Shieldpoint Security',id:'CTR-2026-01145',ind:'SERVICES',type:'VENDOR',prod:'SERVICE',date:'JAN-01-2027',p2:'SHIELDPOINT SECURITY',score:55,doc:null,
  sum:'This <b>Vendor Agreement</b> with <b>Shieldpoint Security</b> covers guard services at five sites. Monthly invoices are paid within forty-five (45) days…',
  why:['Monthly invoices are paid within <b>45 days</b>.','Insurance certificates are attached and current.','In the review queue.']},
 {n:9,title:'Facilities Maintenance Services',cp:'Kestrel Facility Services',id:MAIN,ind:'FACILITIES',type:'VENDOR',prod:'SERVICE',date:'JAN-01-2027',p2:'KESTREL FACILITY SERVICES LLC',score:40,doc:'ks',draft:true,
  sum:'This <b>Vendor Services Agreement</b> (vendor draft v2) with <b>Kestrel Facility Services LLC</b> covers building maintenance for three years, $1.2M. As drafted, the Agency shall pay all invoices within fifteen (15) days…',
  why:['It is a vendor services agreement with a payment clause, so it was searched.','Section 3.2 sets payment at <b>fifteen (15) days</b> of the invoice date.','It is a draft in your review queue, not yet signed.'],
  gap:'<b>Payment is due in 15 days, not the 45 you asked for.</b> The Agency’s template says 45 days of a proper invoice. Fix it before this contract is signed.'},
];
const ord=n=>n+({1:'st',2:'nd',3:'rd'}[n]||'th');
const HAND='<svg viewBox="0 0 24 24" class="lm-hand"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-.6a5 5 0 0 1-4-2L4.6 15a1.5 1.5 0 0 1 2.3-1.9L9 15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SPK='<svg viewBox="0 0 24 24" class="lm-spk"><path d="M10 4.5l1.6 5.4 5.4 1.6-5.4 1.6L10 18.5l-1.6-5.4L3 11.5l5.4-1.6zM18 3l.7 2.3L21 6l-2.3.7L18 9l-.7-2.3L15 6l2.3-.7z" fill="currentColor"/></svg>';
const scoreCls=s=>s>=80?'hi':s>=60?'mid':'low';
function lmCard(r){ const g=!!r.gap;
  return `<div class="lm-card" id="lmc-${r.n}">
   <div class="lm-ch"><h3 title="${r.title}">${r.n}. ${r.title}</h3>
     <span class="lm-chip ic" data-act="fav">${ico('i-heart')}</span>
     <span class="lm-chip" data-act="lm-compare" data-n="${r.n}">${ico('i-copy')}Compare</span>
     <span class="lm-chip" id="rd-${r.n}" data-act="lm-redline" data-n="${r.n}">${ico('i-pen')}Redline</span>
     <span class="lm-chip" data-act="lm-rate" data-n="${r.n}">${ico('i-star')}Rate</span>
     <span class="lm-score ${scoreCls(r.score)}">${SPK}${r.score}%</span>
     <span class="lm-chip ic" data-act="lm-expand" data-n="${r.n}">${ico('i-expand')}</span></div>
   <div class="lm-meta">
     <div><small>Contract Industry</small><b>${r.ind}</b></div><div><small>Contract Type</small><b>${r.type}</b></div><div><small>Product Type</small><b>${r.prod}</b></div>
     <div><small>Contract Effective Date</small><b>${r.date}</b></div><div><small>Parties Involved (2)</small><b class="trunc">Party 1: THE AGENCY</b><span class="lm-p2">Party 2: ${r.p2}</span></div></div>
   <div class="lm-ais"><div class="lm-aih">${SPK}AI Summary</div><p>${r.sum}</p><span class="lm-vm" data-act="lm-more" data-n="${r.n}">View more</span> ${HAND}<span class="lm-car">${ico('i-chev')}</span>
     <div class="lm-cd" id="cd-${r.n}">
       <div class="lm-cdh">${HAND}<span>Cognitive Decisioning AI</span><span class="lm-ds">${SPK}Decision Strength ${g?'96%':'100%'}</span></div>
       <div class="lm-sec"><div class="lm-sh"><span class="lm-sic">${ico('i-bulb')}</span><div><b>Reasoning</b><small>Why This Was Picked</small></div><span class="lm-up">${ico('i-chev')}</span></div>
         <ol>${r.why.map(w=>`<li>${w} ${HAND}<span class="lm-car">${ico('i-chev')}</span></li>`).join('')}</ol></div>
       <div class="lm-sec ${g?'bad':''}"><div class="lm-sh"><span class="lm-sic">${ico('i-scan')}</span><div><b>${g?'Gaps in Decision':'Gap'}</b><small>What’s missing or unclear</small></div><span class="lm-up">${ico('i-chev')}</span></div>
         ${g?`<p class="lm-gap">${r.gap}</p><div class="lm-fix"><span data-act="lm-redline" data-n="${r.n}">Fix: set payment to 45 days</span><span data-act="lm-redline" data-n="${r.n}">Redline against our template</span></div>`:'<p class="lm-nogap">No Gaps Identified!</p>'}</div>
     </div></div>
   <div class="lm-pdf" id="pdf-${r.n}"></div>
   <div class="lm-cf"><span class="lm-why" id="why-${r.n}" data-act="lm-why" data-n="${r.n}">Why this contract is the ${ord(r.n)} Match ${HAND}<span class="lm-car">${ico('i-chev')}</span></span>
     <span class="lm-vp" id="vp-${r.n}" data-act="lm-pdf" data-n="${r.n}">${ico('i-eye')}View PDF<span class="lm-car">${ico('i-chev')}</span></span></div>
  </div>`; }
function renderResults(){ $('#lm-list').innerHTML=RES.map(lmCard).join(''); $('#lm-list').scrollTop=0; }
function openWhy(n,on){ const c=$('#lmc-'+n); if(!c) return; const want=on===undefined?!c.classList.contains('why-on'):on; c.classList.toggle('why-on',want); }
const FILL={
 before:[['3 · Services',[['3.1','Scope','Vendor shall provide the Services described in Schedule A in a professional and workmanlike manner, consistent with generally accepted industry standards.'],['3.2','Service levels','Vendor shall meet the service levels in Schedule C. Service credits are the Agency’s sole remedy for a missed service level, except as stated in Section 12.'],['3.3','Personnel','Vendor shall assign qualified personnel and shall not replace key personnel without the Agency’s prior written consent.']]],['4 · Agency Responsibilities',[['4.1','Access','The Agency shall provide reasonable access to its facilities and systems as needed for Vendor to perform the Services.'],['4.2','Approvals','The Agency shall review and respond to deliverables within ten (10) business days of receipt.']]]],
 after:[['8 · Confidentiality',[['8.1','Confidential Information','Each party shall protect the other party’s Confidential Information with at least the same degree of care it uses for its own, and no less than reasonable care.'],['8.2','Public records','Vendor acknowledges that the Agency is subject to public records laws and that this Agreement may be disclosed as required by law.']]],['9 · Limitation of Liability',[['9.1','Cap','Except for indemnification obligations, neither party’s total liability shall exceed the amounts set out in this Section.'],['9.2','Exclusions','Neither party is liable for indirect, incidental or consequential damages, except as required by law.']]],['10 · Insurance',[['10.1','Coverage','Vendor shall maintain commercial general liability insurance in the amounts stated in Schedule D.']]]]};
function fillPage(secs,name,pg){ return `<div class="pdfpage">${secs.map(([h,ps])=>`<h4>${h}</h4>${ps.map(([n,t,x])=>`<p><b>${n} ${t}.</b> ${x}</p>`).join('')}`).join('')}<div class="pdffoot"><span>${name}</span><span>Page ${pg}</span></div></div>`; }
function pdfHTML(r){ const d=DOCS[r.doc]; const m=d.pg.match(/Page (\d+) of (\d+)/), p=+m[1], tot=+m[2]; const nm=r.cp+(r.draft?' · Vendor draft v2':'');
  return `<div class="lm-pv"><div class="lm-pvb"><span class="lm-pvi">${ico('i-doc')}</span><b>${d.name}</b><span class="lm-pvz">${ico('i-zoomout')}</span><span class="lm-pvp">100% ▾</span><span class="lm-pvz">${ico('i-zoomin')}</span><span class="lm-pvn" id="pvn-${r.n}">${p} of ${tot}</span><span class="sp"></span><span class="lm-pvz">${ico('i-expand')}</span><span class="lm-pvz" data-act="dl">${ico('i-download')}</span><span class="lm-pvz" data-act="lm-pdf-x" data-n="${r.n}">${ico('i-close')}</span></div>
   <div class="lm-pvbody" id="pvb-${r.n}">${p>1?fillPage(FILL.before,nm,p-1):''}<div class="pdfpage main">${d.html()}</div>${fillPage(FILL.after,nm,p+1)}</div></div>`; }
function openPdf(n,on){ const r=RES.find(x=>x.n===n), box=$('#pdf-'+n); if(!r||!box) return; if(!r.doc){ toast('This PDF isn’t part of the sample set'); return; }
  const want=on===undefined?!box.classList.contains('on'):on; box.classList.toggle('on',want); $('#vp-'+n)?.classList.toggle('open',want);
  if(want){ box.innerHTML=pdfHTML(r); const d=DOCS[r.doc]; const c=box.querySelector('#'+d.hl); const bg=box.querySelector('.lm-pvbody');
    if(c){ c.classList.add(d.bad?'hlbad':'hl'); const off=bg.scrollTop+(c.getBoundingClientRect().top-bg.getBoundingClientRect().top)/Z; const target=Math.max(0,off-bg.clientHeight*0.38);
      if(ANIM){ bg.scrollTop=Math.max(0,target-260); smoothScroll(bg,target,900); } else bg.scrollTop=target; }
    const upd=()=>{ const pages=[...bg.querySelectorAll('.pdfpage')], m=d.pg.match(/Page (\d+) of (\d+)/), base=+m[1]-(pages.length===3?1:0); const bt=bg.getBoundingClientRect().top; let k=0; pages.forEach((pg,i)=>{ if(pg.getBoundingClientRect().top-bt<bg.getBoundingClientRect().height*0.5) k=i; }); const el=$('#pvn-'+n); if(el) el.textContent=`${base+k} of ${m[2]}`; }; bg.addEventListener('scroll',upd); setTimeout(upd,ANIM?950:0); }
}
function scrollList(el,mode){ const box=$('#lm-list'); if(!el||!box) return Promise.resolve(); const er=el.getBoundingClientRect(), br=box.getBoundingClientRect(); const top=box.scrollTop+(er.top-br.top)/Z; const target=mode==='bottom'?Math.max(0,top+er.height/Z-box.clientHeight+16):Math.max(0,top-12); return smoothScroll(box,target,700); }
/* chat building blocks in the demo style */
const opt=(text,attrs)=>`<div class="lm-opt" ${attrs||''}><span class="lm-arr">${ico('i-arrow')}</span><span>${text}</span></div>`;
function totalCard(){ return `<div class="lm-tot"><div class="lm-toth"><b>Total Contracts : 17</b><div class="lm-from">Fetched from: <b>01/03/24 to 20/11/26</b></div></div>
   <div class="lm-tiles"><div class="lm-tile c1" data-act="lm-cat" data-c="SERVICES"><div class="lm-tt"><span class="lm-cb">${ico('i-check')}</span>SERVICES<span class="lm-ti">${ico('i-building')}</span></div><div class="lm-tn"><b>9</b>Contract(s)</div></div>
   <div class="lm-tile c2" data-act="lm-cat" data-c="SOFTWARE"><div class="lm-tt"><span class="lm-cb">${ico('i-check')}</span>SOFTWARE<span class="lm-ti">${ico('i-branch')}</span></div><div class="lm-tn"><b>6</b>Contract(s)</div></div>
   <div class="lm-tile c3" data-act="lm-cat" data-c="FACILITIES"><div class="lm-tt"><span class="lm-cb">${ico('i-check')}</span>FACILITIES<span class="lm-ti">${ico('i-wrench')}</span></div><div class="lm-tn"><b>2</b>Contract(s)</div></div></div></div>`; }
function chatItem(r){ return `<div class="lm-ci"><div class="lm-cih"><b>${r.n}. ${r.title}</b><span class="lm-up">${ico('i-chev')}</span></div>
   <div class="lm-kv"><span>Contract Effective Date:</span> ${r.date}</div><div class="lm-kv"><span>Contract Industry:</span> ${r.ind}</div><div class="lm-kv"><span>Contract Type:</span> ${r.type}</div><div class="lm-kv"><span>Party 1:</span> THE AGENCY</div><div class="lm-kv"><span>Party 2:</span> ${r.p2}</div>
   <p class="lm-cis">${r.sum.split('…')[0]}…</p>
   <div class="lm-cif"><span class="lm-cw" data-act="lm-goto" data-n="${r.n}">Why this is the ${ord(r.n)} Match <span class="lm-pct ${scoreCls(r.score)}">${HAND}${r.score}%</span></span><span class="lm-open" data-act="lm-goto" data-n="${r.n}">Open ${ico('i-ext')}</span></div></div>`; }
