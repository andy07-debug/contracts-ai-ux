
/* ======================= data ======================= */
const TYPES={'MSA':'#3289FF','SOW':'#8B5CF6','Vendor agreement':'#0EA5A4','Grant':'#F59E0B','Lease':'#EF4444'};
const MAIN='CTR-2026-01184';
const QUEUE=[
 {id:MAIN,type:'Vendor agreement',title:'Facilities maintenance services',cp:'Kestrel Facility Services',val:'$1.2M',day:3,main:true},
 {id:'CTR-2026-01169',type:'SOW',title:'Case management system, phase 2',cp:'Meridian Data Partners',val:'$860K',day:4,pre:'warn',preT:'2 items to review',sum:'Two items: milestone acceptance has no time limit, and the clause on returning Agency data at the end is missing. Payment (45 days after acceptance) matches the template.'},
 {id:'CTR-2026-01177',type:'MSA',title:'Cloud backup master agreement',cp:'Northwind Cloud Systems',val:'$2.4M',day:2,pre:'ok',sum:'Matches the MSA template v3 apart from a renamed exhibit. Payment is net 45. Ready for review.'},
 {id:'CTR-2026-01192',type:'Grant',title:'After-school program grant',cp:'Harbor Youth Alliance',val:'$340K',day:1,pre:'ok',sum:'Matches the grant agreement template. Reporting is quarterly and the budget schedule adds up.'},
 {id:'CTR-2026-01151',type:'Lease',title:'Office lease, 4th floor',cp:'Harborline Properties LLC',val:'$2.1M',day:5,pre:'ok',sum:'Matches the lease template. Ten-year term with one renewal option; rent steps are listed in Schedule C.'},
 {id:'CTR-2026-01188',type:'Vendor agreement',title:'Fleet vehicle parts supply',cp:'Atlas Fleet Supply',val:'$640K',day:2,pre:'ok',sum:'Matches the vendor template. Pricing is fixed for two years; delivery within 5 business days.'},
 {id:'CTR-2026-01163',type:'SOW',title:'Data migration services',cp:'Cobalt Systems Group',val:'$410K',day:3,pre:'ok',sum:'Matches the SOW template. Three milestones, each paid 45 days after acceptance.'},
 {id:'CTR-2026-01145',type:'Vendor agreement',title:'Security guard services',cp:'Shieldpoint Security',val:'$1.9M',day:6,pre:'ok',sum:'Matches the vendor template. Insurance certificates are attached and current.'},
 {id:'CTR-2026-01190',type:'Grant',title:'Senior meals program grant',cp:'Eastside Community Kitchen',val:'$280K',day:1,pre:'ok',sum:'Matches the grant template. Advance payment of 25% on signature, as the program allows.'},
 {id:'CTR-2026-01172',type:'MSA',title:'Translation services master agreement',cp:'Lingua Bridge Services',val:'$520K',day:2,pre:'ok',sum:'Matches the MSA template v3. Rates are set per language in Schedule A.'},
];
const EXEC=[
 {id:'CTR-2025-00733',type:'MSA',title:'Cloud hosting master agreement',cp:'Northwind Cloud Systems',val:'$4.8M',status:'Active',pay:'Net 45',sum:'Active until June 30, 2028. Payment within 45 days of a proper invoice (Section 6.2). Amendment 1 changed pricing only.'},
 {id:'CTR-2025-00612',type:'MSA',title:'IT staffing master agreement',cp:'Summit Talent Partners',val:'$3.5M',status:'Active',pay:'Net 60',sum:'Active until March 31, 2027. Payment within 60 days of receipt (Section 5.1).'},
 {id:'CTR-2025-00841',type:'Vendor agreement',title:'Office supplies',cp:'Keystone Office Supply',val:'$220K',status:'Active',pay:'Net 45',sum:'Active until December 31, 2026. Renewal is by amendment only.'},
 {id:'CTR-2024-01310',type:'Lease',title:'Warehouse lease, Pier 9',cp:'Pier Nine Holdings LLC',val:'$1.6M',status:'Expiring soon',pay:'Monthly',sum:'Ends January 31, 2027. One five-year renewal option; notice is due 60 days before the end.'},
 {id:'CTR-2025-00977',type:'Grant',title:'Workforce training grant',cp:'Bridgeway Jobs Network',val:'$450K',status:'Active',pay:'Quarterly',sum:'Active until August 31, 2027. Quarterly reports; the next one is due January 15.'},
];
const QUESTION='Show me contracts with payment terms of 45 days or more.';
const SR=[
 {n:1,cp:'Northwind Cloud Systems',t:'Cloud hosting MSA',id:'CTR-2025-00733',sec:'Section 6.2 · Payment terms',st:'Active',rel:100,q:'Undisputed invoices are due within forty-five (45) days of receipt of a proper invoice.',doc:'nw'},
 {n:2,cp:'Summit Talent Partners',t:'IT staffing MSA',id:'CTR-2025-00612',sec:'Section 5.1 · Invoicing',st:'Active',rel:90,q:'The Agency shall pay each proper invoice within sixty (60) days of receipt.',doc:'su'},
 {n:3,cp:'Meridian Data Partners',t:'Case management SOW, phase 2',id:'CTR-2026-01169',sec:'Section 4.3 · Milestone payments',st:'In review',rel:80,q:'Each milestone payment is due forty-five (45) days after written acceptance of the deliverable.',doc:'me'},
 {n:4,cp:'Keystone Office Supply',t:'Office supplies agreement',id:'CTR-2025-00841',sec:'Section 3 · Payment',st:'Active',rel:70,q:'Payment shall be made net forty-five (45) days from the later of delivery or invoice.',doc:'ke'},
];
const LOW={n:5,cp:'Kestrel Facility Services',t:'Facilities maintenance (draft)',id:MAIN,sec:'Section 3.2 · Payment terms',st:'In your queue',rel:40,q:'The Agency shall pay all invoices within fifteen (15) days of the invoice date.',doc:'ks'};
// the nine deviations of the Kestrel draft from the vendor services template
const DEVS=[
 {s:'2.2',n:'Renewal',r:'med',v:'This Agreement renews automatically for successive one-year terms.',t:'Renewal only by a written amendment signed by both parties.',fix:'Auto-renewal removed'},
 {s:'3.2',n:'Payment terms',r:'high',v:'The Agency shall pay all invoices within fifteen (15) days of the invoice date.',t:'Undisputed invoices are due within forty-five (45) days of receipt of a proper invoice.',fix:'Payment set to 45 days'},
 {s:'3.4',n:'Late payment interest',r:'med',v:'Unpaid amounts accrue interest at 1.5% per month.',t:'Interest on late payments only as set by the prompt payment rules.',fix:'Late interest per prompt payment rules'},
 {s:'3.5',n:'Price increases',r:'med',v:'Vendor may raise its prices by up to 8% each contract year.',t:'Prices are fixed for the term; changes only by amendment.',fix:'Price held for the term'},
 {s:'5.1',n:'Termination',r:'high',v:'Either party may terminate only for a material breach.',t:'The Agency may also terminate for convenience on 30 days’ written notice.',fix:'Termination for convenience added'},
 {s:'9.1',n:'Limitation of liability',r:'high',v:'Vendor’s total liability is capped at 1× the annual fees.',t:'Vendor’s liability is capped at 2× the total contract value.',you:'cap'},
 {s:'10.1',n:'Insurance',r:'med',v:'Commercial general liability of $1M per occurrence.',t:'Commercial general liability of $2M per occurrence.',you:'ins'},
 {s:'11.2',n:'Audit and records',r:'med',v:'Records kept for 1 year; one audit per year on 30 days’ notice.',t:'Records kept for 6 years and open to audit on reasonable notice.',fix:'Audit rights restored'},
 {s:'14.3',n:'Governing law',r:'high',v:'Governed by the laws of the State of Delaware.',t:'Governed by New York law; venue in the courts of New York County.',fix:'New York jurisdiction restored'},
];
const CHOICES={cap:{rec:'2x',opts:[['2x','Counter at 2× contract value'],['1x','Accept 1× annual fees']],tag:{'2x':'Counter: 2× contract value','1x':'Accepted: 1× annual fees'}},
  ins:{rec:'2m',opts:[['2m','Require $2M per occurrence'],['1m','Accept $1M per occurrence']],tag:{'2m':'Require: $2M per occurrence','1m':'Accepted: $1M per occurrence'}}};
const DASH={
 week:{sub:'Per day',k:[['Contracts reviewed','38','this week'],['Avg. review time','5 min','was 3 days'],['Deviations caught','214','before signature'],['Error rate','0.8%','was 11%']],bars:[['Mon',7],['Tue',9],['Wed',8],['Thu',6],['Fri',8]]},
 month:{sub:'Per week',k:[['Contracts reviewed','161','this month'],['Avg. review time','6 min','was 3 days'],['Deviations caught','902','before signature'],['Error rate','0.9%','was 11%']],bars:[['Week 1',36],['Week 2',41],['Week 3',46],['Week 4',38]]},
 quarter:{sub:'Per month',k:[['Contracts reviewed','452','this quarter'],['Avg. review time','6 min','was 3 days'],['Deviations caught','2,480','before signature'],['$ returned','$250K','in 100 days']],bars:[['Sep',122],['Oct',169],['Nov',161]]},
};
const TEMPLATES=[
 {k:'vend',t:'Vendor services template v4',s:'Gold standard · 46 clauses',d:'The Agency’s standard terms for buying services from a vendor. Contracts AI compares every vendor draft with it clause by clause and flags each deviation by risk.',secs:['2.2 Renewal by amendment only','3.2 Payment within 45 days','3.4 Late interest per prompt payment rules','3.5 Prices fixed for the term','5.1 Termination for convenience','9.1 Liability cap: 2× contract value','10.1 Insurance: $2M per occurrence','14.3 New York law and venue'],open:true,use:[MAIN,'CTR-2026-01188','CTR-2026-01145']},
 {k:'msa',t:'Master services agreement v3',s:'Gold standard · 58 clauses',d:'Framework terms for multi-year services bought through task orders.',secs:['4.1 Task orders','6.2 Payment within 45 days','8.1 Data protection','9.1 Liability cap','12.1 Termination for convenience','15.2 New York law and venue'],use:['CTR-2026-01177','CTR-2026-01172']},
 {k:'sow',t:'Statement of work template',s:'Gold standard · 22 clauses',d:'Milestones, deliverables and acceptance for project work under an MSA.',secs:['2.1 Deliverables','3.1 Acceptance within 10 business days','4.3 Milestone payments, 45 days after acceptance','7.2 Return of Agency data'],use:['CTR-2026-01169','CTR-2026-01163']},
 {k:'grant',t:'Grant agreement template',s:'Gold standard · 31 clauses',d:'Program grants to nonprofit providers, with budget and reporting schedules.',secs:['3.1 Advance payment up to 25%','5.2 Quarterly reports','6.1 Allowable costs','9.3 Records kept 6 years'],use:['CTR-2026-01192','CTR-2026-01190']},
 {k:'lease',t:'Lease template',s:'Gold standard · 40 clauses',d:'Space the Agency rents, with rent schedules and renewal options.',secs:['2.1 Term and renewal options','4.1 Rent schedule','9.2 Repairs','14.1 Holdover'],use:['CTR-2026-01151']},
];
/* contract pages */
function page(o){ return `<div class="lh"><h2>${o.h}</h2><div class="ls">${o.s}</div><small>${o.m}</small>${o.stamp||''}</div>${o.parties?`<p class="parties">${o.parties}</p>`:''}${o.secs.map(([h,ps])=>`<h4>${h}</h4>${ps.map(([n,b,txt,id,cls])=>`<p><b>${n} ${b}.</b> <span class="${cls||'cl'}" ${id?`id="${id}"`:''}>${txt}</span></p>`).join('')}`).join('')}<div class="foot"><span>${o.f}</span><span>${o.pg}</span></div>`; }
const DOCS={
 nw:{name:'CTR-2025-00733_northwind-msa.pdf',pg:'Page 4 of 22',hl:'cl-nw62',html:()=>page({h:'MASTER SERVICES AGREEMENT',s:'Cloud hosting services',m:'CTR-2025-00733 · Executed July 1, 2025',f:'Northwind Cloud Systems · MSA',pg:'Page 4 of 22',secs:[
   ['5 · Fees',[['5.1','Fees','The Agency shall pay the fees set out in Schedule B for Services accepted under this Agreement.'],['5.2','Taxes','The Agency is exempt from sales and use taxes and will provide an exemption certificate on request.']]],
   ['6 · Payment',[['6.1','Invoices','Vendor shall submit invoices monthly in arrears, with the purchase order number and a description of the Services delivered.'],['6.2','Payment terms','Undisputed invoices are due within forty-five (45) days of receipt of a proper invoice.','cl-nw62'],['6.3','Disputed amounts','The Agency shall notify Vendor in writing of any disputed amount within fifteen (15) days, and the parties shall work in good faith to resolve it.'],['6.4','Late payment','Interest on late payments accrues only as provided under the applicable prompt payment rules.']]],
   ['7 · Term',[['7.1','Term','This Agreement runs from July 1, 2025 to June 30, 2028, unless ended earlier under Section 12.'],['7.2','Amendments','This Agreement may be changed only by a written amendment signed by both parties. Amendment 1 (March 2026) replaces Schedule B.']]]]})},
 su:{name:'CTR-2025-00612_summit-msa.pdf',pg:'Page 3 of 19',hl:'cl-su51',html:()=>page({h:'MASTER SERVICES AGREEMENT',s:'IT staffing services',m:'CTR-2025-00612 · Executed April 1, 2025',f:'Summit Talent Partners · MSA',pg:'Page 3 of 19',secs:[
   ['5 · Invoicing and payment',[['5.1','Invoicing','The Agency shall pay each proper invoice within sixty (60) days of receipt.','cl-su51'],['5.2','Timesheets','Each invoice shall attach approved timesheets for every consultant billed.'],['5.3','Rates','Hourly rates are fixed in Schedule A for the initial term.']]],
   ['6 · Personnel',[['6.1','Key personnel','Vendor shall not replace key personnel without the Agency’s written consent.'],['6.2','Background checks','Vendor shall complete background checks before any consultant starts work.']]]]})},
 me:{name:'CTR-2026-01169_meridian-sow.pdf',pg:'Page 6 of 14',hl:'cl-me43',html:()=>page({h:'STATEMENT OF WORK',s:'Case management system, phase 2',m:'CTR-2026-01169 · Draft for review',f:'Meridian Data Partners · SOW',pg:'Page 6 of 14',secs:[
   ['4 · Milestones and payment',[['4.1','Milestones','The milestones and deliverables are listed in Table 2.'],['4.2','Acceptance','The Agency will review each deliverable and confirm acceptance in writing.'],['4.3','Milestone payments','Each milestone payment is due forty-five (45) days after written acceptance of the deliverable.','cl-me43']]],
   ['5 · Project team',[['5.1','Project manager','Vendor shall name a project manager who attends the weekly status meeting.']]]]})},
 ke:{name:'CTR-2025-00841_keystone-supply.pdf',pg:'Page 2 of 9',hl:'cl-ke3',html:()=>page({h:'SUPPLY AGREEMENT',s:'Office supplies',m:'CTR-2025-00841 · Executed January 6, 2025',f:'Keystone Office Supply · Supply agreement',pg:'Page 2 of 9',secs:[
   ['2 · Orders and delivery',[['2.1','Orders','The Agency will place orders through its purchasing system.'],['2.2','Delivery','Vendor shall deliver within five (5) business days of each order.']]],
   ['3 · Payment',[['3.1','Payment','Payment shall be made net forty-five (45) days from the later of delivery or invoice.','cl-ke3'],['3.2','Pricing','Prices are fixed for the term as listed in Schedule A.']]]]})},
 ks:{name:'CTR-2026-01184_vendor-draft-v2.pdf',pg:'Page 1 of 18',hl:'cl-ks32',bad:true,html:()=>kestrelPage('pv')},
};
function devSpan(i,pre){ const d=DEVS[i], s=st.dev[i]; const cls=s==='fixed'||s==='decided'?'dev fx':s==='marked'||s==='you'?`dev on ${d.r}`:'dev';
  const txt=s==='fixed'?`<s>${d.v}</s> <ins>${d.t}</ins>`:s==='decided'?decidedText(d):d.v; return `<span class="${cls}" id="${pre}-dv${i}">${txt}</span>`; }
function decidedText(d){ const c=st.choice[d.you]; const keep=(d.you==='cap'&&c==='1x')||(d.you==='ins'&&c==='1m'); return keep?d.v:`<s>${d.v}</s> <ins>${d.t}</ins>`; }
function kestrelPage(pre){ const stamp={review:['','DRAFT','Vendor paper · v2'],redline:['blue','REDLINE','In progress'],ready:['blue','REDLINED','Ready to approve'],sent:['ok','APPROVED','Sent for signature']}[st.status];
  const p=(n,b,html)=>`<p><b>${n} ${b}.</b> ${html}</p>`;
  return `<div class="lh"><h2>VENDOR SERVICES AGREEMENT</h2><div class="ls">Facilities maintenance services</div><small>CTR-2026-01184 · Vendor draft v2 · Received Nov 18, 2026</small><div class="dstamp ${stamp[0]}">${stamp[1]}<small>${stamp[2]}</small></div></div>
   <p class="parties">This Vendor Services Agreement is made between <b>the Agency</b> and <b>Kestrel Facility Services LLC</b> (“Vendor”). Vendor will provide the services in Schedule A on the terms below.</p>
   <h4>1 · Services</h4>${p('1.1','Services','Vendor shall maintain the building systems listed in Schedule A, including HVAC, electrical and plumbing, at the service levels in Schedule C.')}
   <h4>2 · Term</h4>${p('2.1','Term','This Agreement runs for three (3) years from January 1, 2027.')}${p('2.2','Renewal',devSpan(0,pre))}
   <h4>3 · Fees and payment</h4>${p('3.1','Fees','The Agency shall pay the fees in Schedule B.')}${p('3.2','Payment terms',`<span class="cl" id="${pre==='pv'?'cl-ks32':'c-ks32'}">${devSpan(1,pre)}</span>`)}${p('3.3','Invoices','Vendor shall invoice monthly in arrears, with the purchase order number.')}${p('3.4','Late payment',devSpan(2,pre))}${p('3.5','Price changes',devSpan(3,pre))}
   <div class="foot"><span>Kestrel Facility Services · Vendor draft v2</span><span>Page 1 of 18</span></div>`; }
function templatePage(){ return page({h:'VENDOR SERVICES AGREEMENT',s:'Template v4 · gold standard',m:'Approved by Legal · Used for every vendor services contract',f:'Vendor services template v4',pg:'Page 1 of 16',secs:[
   ['2 · Term',[['2.1','Term','This Agreement runs for the term stated in the cover page.'],['2.2','Renewal',DEVS[0].t]]],
   ['3 · Fees and payment',[['3.1','Fees','The Agency shall pay the fees in Schedule B.'],['3.2','Payment terms',DEVS[1].t],['3.3','Invoices','Vendor shall invoice monthly in arrears, with the purchase order number.'],['3.4','Late payment',DEVS[2].t],['3.5','Price changes',DEVS[3].t]]],
   ['5 · Termination',[['5.1','Termination',DEVS[4].t]]]]}); }

