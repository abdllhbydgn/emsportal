const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const fs=require('fs'),cp=require('child_process');
const AUD='/home/user/ems/tanitim/audio2/';
const SC=JSON.parse(fs.readFileSync('/home/user/ems/tanitim/script2.json','utf8'));
const dur=f=>parseFloat(cp.execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 ${f}`).toString());
const LEAD=0.9,GAP=0.5,TAIL=1.3;
const logo='data:image/png;base64,'+fs.readFileSync('/home/user/ems/tanitim/kaynak/arac/logo.png').toString('base64');
const OPEN={hse:"openDetailModal('category','hse')",env:"openDetailModal('category','env')",cd:"openDetailModal('category','cd')",higg:"openDetailModal('category','higg')",oeko:"openDetailModal('category','oekotex')",sedex:"openDetailModal('category','sedex')",organic:"openDetailModal('category','organic')",csr:"openDetailModal('group','sustain,csr')"};
// sahne ayarları: kind: home | page | card ; acts: [cümleNo, js]
const CFG={
 welcome:{kind:'card',card:'title'},
 why:{kind:'home',acts:[[1,"scrollMain(260)"],[2,"scrollMain(0)"]]},
 signin:{kind:'entry',acts:[[1,"CLICK:q:.ent-staff"],[2,"typeIn('login-username','name@nscstr.com')"],[3,"typeIn('login-password','••••••••••')"]]},
 steps:{kind:'home',acts:[[1,"CLICK:n:HSE Audit"],[2,"scrollTop(380)"]]},
 overview:{kind:'home',acts:[[1,"scrollMain(0)"],[3,"scrollMain(330)"]]},
 about:{kind:'page',acts:[[0,"openAboutHub()"],[2,"scrollTop(300)"]]},
 certs:{kind:'page',pre:"certificatesData=defaultCertificatesData.map((c,i)=>Object.assign({},c,{issuedDate:'2025-0'+(1+i%9)+'-15',expiryDate:'2027-0'+(1+i%9)+'-14',status:i%5===2?'critical':'compliant'}));_cloudDocsLoaded.certificates=true;",acts:[[0,"CLICK:n:Certificates"],[1,"scrollTop(380)"]]},
 csr:{kind:'page',acts:[[0,"CLICK:n:CSR & Compliance"],[1,"scrollTop(0)"],[2,"scrollTop(380)"]]},
 hse:{kind:'page',acts:[[0,"CLICK:n:HSE Audit"],[2,"scrollTop(300)"]]},
 env:{kind:'page',acts:[[0,"CLICK:n:Environment & Chemical Audit"],[1,"scrollTop(300)"]]},
 chem:{kind:'page',pre:"chemicalMaterials=defaultChemicalMaterials.slice();try{chemicalConsumptionRecords=(typeof defaultChemicalConsumptionRecords!=='undefined'?defaultChemicalConsumptionRecords:[]).slice()}catch(e){}",acts:[[0,"openChemicalDeptReport('printing')"],[2,"scrollTop(300)"]]},
 cd:{kind:'page',acts:[[0,"CLICK:n:Civil Defence Audit"],[2,"scrollTop(300)"]]},
 higg:{kind:'page',acts:[[0,"CLICK:n:Higg FEM Audit"],[2,"scrollTop(300)"]]},
 oeko:{kind:'page',acts:[[0,"CLICK:n:OEKO-TEX Audit"],[2,"scrollTop(300)"]]},
 sedex:{kind:'page',acts:[[0,"CLICK:n:Sedex Audit"],[2,"scrollTop(300)"]]},
 organic:{kind:'page',acts:[[0,"CLICK:n:Organic Audit"],[1,"scrollTop(380)"]]},
 docs:{kind:'page',pre:"window._qmsVisitor=()=>false;sessionStorage.setItem('ems_qms_unlocked','1');",acts:[[0,"CLICK:n:Quality Management System"],[2,"sessionStorage.setItem('ems_qms_unlocked','1');_qmsState.view='idx';_qmsState.tab='all';_qmsRender()"],[4,"_qmsState.view='hub';_qmsRender();setTimeout(()=>scrollTop(180),500)"]]},
 customers:{kind:'page',pre:"customerAudits=JSON.parse(JSON.stringify(defaultCustomerAudits));",acts:[[0,"CLICK:n:Customers & Audits"],[1,"scrollTop(300)"],[3,"openAuditFindings(4)",0.2],[3,"scrollTop(430)",1.2],[4,"CLICK:F:j:document.querySelectorAll('#audit-findings-modal tbody tr:first-child button[onclick*=triggerFindingPhotoUpload]')[0]"],[4,"tvPick('finding-photo-file-input','find')",1.5],[4,"CLICK:F:j:document.querySelectorAll('#audit-findings-modal tbody tr:first-child button[onclick*=triggerFindingPhotoUpload]')[0]",2.2],[4,"tvPick('finding-photo-file-input','fix')",3.7],[4,"tvDrop('#audit-findings-modal tbody tr:first-child select.status-sel')",4.0],[4,"tvDropHover(1)",4.5]]},
 internal:{kind:'page',acts:[[0,"CLICK:n:Internal Audits"],[2,"openDepartmentsHub()"]]},
 academy:{kind:'page',acts:[[0,"CLICK:n:NSCS Academy"]]},
 rules:{kind:'page',acts:[[0,"CLICK:n:HSE Audit"],[1,"scrollTop(260)"],[2,"scrollTop(420)"]]},
 lang:{kind:'home',acts:[[1,"CLICK:q:.lang-btn:nth-child(1)"],[2,"CLICK:q:.lang-btn:nth-child(3)"]]},
 hr:{kind:'page',acts:[[0,"CLICK:n:HR Audit"],[2,"scrollTop(380)"]]},
 prod:{kind:'page',acts:[[1,"CLICK:n:Knitting Reports"]]},
 defs:{kind:'page',acts:[[0,"CLICK:n:Definitions"]]},
 owner:{kind:'page',pre:"_dirContacts=()=>[{name:'Sara Hassan',email:'sara.hassan@nscstr.com',dept:'Quality'},{name:'Omar Ali',email:'omar.ali@nscstr.com',dept:'Production'},{name:'Mona Farid',email:'mona.farid@nscstr.com',dept:'HSE'}];_qOwnerNames=()=>_dirContacts().map(c=>c.name);_qOwnerDatalistHtml=()=>'';",acts:[[0,"CLICK:n:HSE Audit"],[1,"CLICK:q:.modal-overlay.open tbody tr:first-child [onclick*=openQOwnerDialog]"],[2,"typeIn('q-owner-name','Sa')",0.2],[2,"CLICK:F:q:#fnd-resp-pop [data-i]",1.6],[3,"(()=>{var e=document.getElementById('q-owner-due');if(e){e.value='2026-12-15';e.dispatchEvent(new Event('input',{bubbles:true}))}})()",2.0]]},
 photo:{kind:'page',acts:[[0,"CLICK:n:HSE Audit"],[1,"CLICK:q:.modal-overlay.open tbody tr:first-child td[data-label=PHOTO] button"],[1,"tvPick('question-photo-file-input','ev')",2.3]]},
 status:{kind:'page',pre:"(()=>{const a=auditQuestions.find(q=>q.id===31),b=auditQuestions.find(q=>q.id===32);if(a)a.status='critical';if(b)b.status='minor';calcMetrics();applyFilter();refreshAllDashboards()})()",acts:[[0,"CLICK:n:HSE Audit"],[1,"CLICK:q:.modal-overlay.open tbody tr:first-child select.status-sel"],[1,"tvDrop('.modal-overlay.open tbody tr:first-child select.status-sel')",2.1],[2,"tvDropHover(0)",0.4],[2,"tvDropHover(1)",1.8],[2,"tvDropHover(2)",3.1],[3,"tvDropHover(1)",0.2],[3,"tvDropPick(1)",1.2]]},
 report:{kind:'page',acts:[[0,"CLICK:n:HSE Audit"],[1,"CLICK:N:q:.modal-overlay.open .modal-close-download"],[1,"tvToast('Generating PDF (7/15)',1800)",1.5],[1,"tvToast('Report downloaded',1800,1)",3.0]]},
 closing:{kind:'card',card:'close'}
};

// İmleç hedefleri: her cümle için ekranda anlatılan yeri gösterir. Biçim: "t:Metin" (üstteki pencerede/ sayfada görünen metin), "n:Metin" (sol menü), "q:css" (ilk görünen), "x:X,Y"
const CUR={
 why:{0:["t:ALL AUDIT QUESTIONS"],1:["t:COMPLETED"],2:["n:Quality Management System"],3:["n:Overall Status","n:Company Profile","n:Certificates","n:Quality Management System"]},
 signin:{0:["t:Staff Login"],1:["t:Staff Login"],2:["q:#login-username"],3:["q:#login-password"],4:["q:#login-card .btn-admin-login-submit"],5:["t:New Account Request"]},
 steps:{0:["t:ALL AUDIT QUESTIONS"],1:[],2:["q:.modal-overlay.open tbody tr:first-child td[data-label^=CRITERIA] strong"],3:["q:.modal-overlay.open tbody tr:first-child td[data-label=PHOTO]"],4:["q:.modal-overlay.open tbody tr:first-child td[data-label^=ACTION]"],5:["q:.modal-overlay.open tbody tr:first-child [onclick*=openQOwnerDialog]"]},
 overview:{0:["t:Overall Status"],1:["t:ALL AUDIT QUESTIONS","t:Completed","t:In progress","t:Not started"],2:["t:OVERALL COMPLIANCE"],3:["t:SECTION DASHBOARDS","t:ORGANIC AUDIT"],4:["t:CSR & COMPLIANCE","t:ORGANIC AUDIT"]},

 certs:{0:["t:Our Certificates"],1:["t:SEDEX","t:BSCI","t:BCI"],2:["t:Logo","t:Issued","t:Certificate"],3:["t:Valid Until"]},
 csr:{0:["t:Total Questions"],1:["t:Compliance"],2:["q:.modal-overlay.open tbody tr:nth-child(1) td[data-label^=CRITERIA] strong","q:.modal-overlay.open tbody tr:nth-child(2) td[data-label^=CRITERIA] strong","q:.modal-overlay.open tbody tr:nth-child(3) td[data-label^=CRITERIA] strong"],3:["q:.modal-overlay.open tbody tr:first-child [onclick*=openQOwnerDialog]"],4:["q:.modal-overlay.open tbody tr:first-child td[data-label=PHOTO]","q:.modal-overlay.open tbody tr:first-child td[data-label^=ACTION]"]},
 hse:{0:["t:Total Questions"],1:["q:.modal-overlay.open table th:nth-child(3)"],2:["q:.modal-overlay.open tbody tr:nth-child(1) td[data-label^=CRITERIA] strong","q:.modal-overlay.open tbody tr:nth-child(2) td[data-label^=CRITERIA] strong"],3:["q:.modal-overlay.open tbody tr:first-child td[data-label=PHOTO]"],4:["q:.modal-overlay.open tbody tr:first-child td[data-label^=ACTION]"]},
 env:{0:["t:Total Questions"],1:["q:.modal-overlay.open tbody tr:nth-child(1) td[data-label^=CRITERIA] strong","q:.modal-overlay.open tbody tr:nth-child(2) td[data-label^=CRITERIA] strong"],2:["q:.modal-overlay.open tbody tr:first-child [onclick*=openQOwnerDialog]"]},
 chem:{0:["t:Printing Chemical Consumption Report"],1:["t:Total Materials","t:Current Stock","t:Consumed This Month"],2:["x:760,360"],3:["x:760,500"]},
 cd:{0:["t:Total Questions"],1:["q:.modal-overlay.open tbody tr:nth-child(1) td[data-label^=CRITERIA] strong","q:.modal-overlay.open tbody tr:nth-child(2) td[data-label^=CRITERIA] strong"],2:["q:.modal-overlay.open tbody tr:first-child td[data-label^=ACTION]"]},
 higg:{0:["t:Total Questions"],1:["q:.modal-overlay.open tbody tr:nth-child(1) td[data-label^=CRITERIA] strong","q:.modal-overlay.open tbody tr:nth-child(2) td[data-label^=CRITERIA] strong"],2:["q:.modal-overlay.open tbody tr:first-child td[data-label=PHOTO]"]},
 oeko:{0:["t:Total Questions"],1:["q:.modal-overlay.open tbody tr:nth-child(1) td[data-label^=CRITERIA] strong","q:.modal-overlay.open tbody tr:nth-child(2) td[data-label^=CRITERIA] strong"],2:["q:.modal-overlay.open tbody tr:first-child td[data-label^=ACTION]"]},
 sedex:{0:["t:Total Questions"],1:["t:Compliance"],2:["q:.modal-overlay.open tbody tr:nth-child(1) td[data-label^=CRITERIA] strong","q:.modal-overlay.open tbody tr:nth-child(2) td[data-label^=CRITERIA] strong"],3:["q:.modal-overlay.open tbody tr:first-child td[data-label^=ACTION]"]},
 organic:{0:["t:Organic Audit"],1:["t:Organic Raw Material","t:Organic Yarn Storage","t:Organic Knitting"],2:["t:Details","t:Details"],3:["x:640,330"]},
 docs:{0:["t:Quality Management System"],1:["q:#qms-page input"],2:["t:Total documents"],3:["t:Forms"],4:["t:Order & Pre","t:Purchasing","t:Spinning","t:Dyehouse"]},
 customers:{0:["t:Customer Portal"],1:["x:430,420","x:760,420"],2:["x:1000,420"],3:["j:document.querySelectorAll('#audit-findings-modal tbody tr:first-child button[onclick*=triggerFindingPhotoUpload]')[0]","j:document.querySelectorAll('#audit-findings-modal tbody tr:first-child button[onclick*=triggerFindingPhotoUpload]')[1]"],4:[]},
 internal:{0:["t:START NEW AUDIT"],1:["t:Start Audit"],2:["x:640,400"]},
 academy:{0:["t:NSCS Academy"],1:["t:English","t:Arabic","t:Turkish"],2:["x:640,600"]},
 rules:{0:["t:Total Questions"],1:["q:.modal-overlay.open tbody tr:first-child td[data-label=PHOTO]"],2:["q:.modal-overlay.open tbody tr:first-child [onclick*=openQOwnerDialog]"],3:["q:.modal-overlay.open tbody tr:first-child .cust-q-del"]},
 lang:{0:["q:.lang-btn"],1:[],2:[]},
 hr:{0:["t:Total Questions"],1:["q:.modal-overlay.open table th:nth-child(3)"],2:["q:.modal-overlay.open tbody tr:first-child [onclick*=openQOwnerDialog]","q:.modal-overlay.open tbody tr:first-child td[data-label=PHOTO]","q:.modal-overlay.open tbody tr:first-child td[data-label^=ACTION]"]},
 prod:{0:["n:Yarn Reports","n:Dyeing Reports","n:Garment Reports"],1:[],2:["t:TOTAL (TONS)","t:THIS MONTH","t:LAST ENTRY"],3:["n:Download Production Reports"]},
 defs:{0:[],1:["t:12 sections","t:Yarn","t:Knitting"],2:["t:PROCESS STEPS"],3:["q:#defs-modal input"]},
 owner:{0:[],1:[],2:[],3:["q:#q-owner-email","q:#q-owner-due"],4:["t:Save"]},
 photo:{0:["q:.modal-overlay.open table th:nth-child(6)"],1:[],2:["q:.modal-overlay.open tbody tr:first-child td[data-label=PHOTO] img"],3:["q:.modal-overlay.open tbody tr:first-child td[data-label=PHOTO]"],4:["q:.modal-overlay.open tbody tr:first-child td[data-label^=ACTION] select"]},
 status:{0:["q:.modal-overlay.open table th:nth-child(7)"],1:[],2:[],3:[]},
 report:{0:["q:.modal-overlay.open .modal-close-download"],1:[],2:["q:.modal-overlay.open .modal-close-download"],3:["n:Download CSR & Compliance Report","n:Download HSE Report","n:Download General Report"]},
};
const SETUP=`(()=>{
 window.showEmsToast=function(){};{const st=document.createElement('style');st.textContent='[onclick*="enterAsViewer"],.ent-visitor{display:none!important}';document.head.appendChild(st)}
 window.scrollMain=y=>{const m=document.querySelector('.main-content');(m||document.scrollingElement).scrollTo({top:y,behavior:'smooth'})};
 window.scrollTop=y=>{const o=[...document.querySelectorAll('.modal-overlay.open,.qa-dept-overlay.open,#qms-page.open')].pop();if(!o)return;let best=null,bh=0;o.querySelectorAll('*').forEach(e=>{if(e.scrollHeight>e.clientHeight+40&&e.clientHeight>200&&getComputedStyle(e).overflowY!=='visible'){if(e.scrollHeight>bh){bh=e.scrollHeight;best=e}}});(best||o).scrollTo({top:y,behavior:'smooth'})};

 window.tvFind=(spec,any)=>{const k=spec.slice(0,2),v=spec.slice(2);
  const vis=e=>{const r=e.getBoundingClientRect();if(r.width<4||r.height<4)return false;const cs=getComputedStyle(e);return cs.visibility!=='hidden'&&cs.display!=='none'};
  if(k==='x:'){const a=v.split(',');return {x:+a[0],y:+a[1]}}
  if(k==='j:'){var je=null;try{je=eval(v)}catch(x){}return je||null}if(k==='q:'){const l=[...document.querySelectorAll(v)].filter(vis);const e=l.find(e=>{const r=e.getBoundingClientRect();return r.top>40&&r.bottom<700})||l[0];return e||null}
  const ovs=[...document.querySelectorAll('.modal-overlay.open,.qa-dept-overlay.open,#qms-page.open,#q-owner-dlg')];const root=k==='n:'?document:(ovs.length?ovs[ovs.length-1]:document);
  const low=v.toLowerCase();let best=null;
  root.querySelectorAll('body *').forEach(e=>{if(/^(SCRIPT|STYLE|SVG|PATH|TEXT)$/i.test(e.tagName))return;if(!vis(e))return;const r=e.getBoundingClientRect();if(k==='n:'&&r.left>320)return;if(!any&&(r.bottom<30||r.top>700||r.right<0||r.left>1280))return;
   const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ').trim().toLowerCase();if(!own||own.indexOf(low)<0)return;
   const sc=own.length-low.length;if(!best||sc<best.sc)best={sc,e}});
  return best?best.e:null};

 window.tvClickSeq=spec=>{let fast=false,noClick=false;while(spec.slice(0,2)==='F:'||spec.slice(0,2)==='N:'){if(spec.slice(0,2)==='F:')fast=true;else noClick=true;spec=spec.slice(2)}const el=window.tvFind(spec,true);if(!el){window.__clickMiss=(window.__clickMiss||'')+spec+';';return}
  const tgt=el.x!==undefined?null:(el.closest('button,a,[onclick]')||el);
  if(!fast&&tgt&&tgt.scrollIntoView)tgt.scrollIntoView({block:'center',behavior:'smooth'});
  setTimeout(()=>window.tvPt(spec),fast?120:650);
  setTimeout(()=>{const c=document.getElementById('tv-cur');if(c){c.style.transform='scale(.78)';setTimeout(()=>{c.style.transform=''},170)}},fast?1000:1650);
  setTimeout(()=>{if(tgt&&!noClick){['mousedown','mouseup'].forEach(function(t){tgt.dispatchEvent(new MouseEvent(t,{bubbles:true,cancelable:true,view:window}))});tgt.click()};const h=document.getElementById('tv-hl');if(h)h.classList.remove('on')},fast?1150:1800)};
 window.tvPt=spec=>{let t=window.tvFind(spec);if(!t&&spec.slice(0,2)==='n:'){const t2=window.tvFind(spec,true);if(t2&&t2.scrollIntoView){t2.scrollIntoView({block:'center',behavior:'smooth'});setTimeout(()=>window.tvPt(spec),750);return 'scroll'}}if(!t)return 'MISS '+spec;let x,y;if(t.x!==undefined){x=t.x;y=t.y}else{const r=t.getBoundingClientRect();x=Math.min(r.left+Math.min(r.width*0.5,200),1250);y=r.top+r.height/2}
  x=Math.max(20,Math.min(1250,x));y=Math.max(20,Math.min(690,y));window.tvCur(x,y);const hl=document.getElementById('tv-hl');if(hl){if(t.x!==undefined){hl.classList.remove('on')}else{const r=t.getBoundingClientRect();const w=Math.min(Math.max(r.width+16,130),760),h=Math.min(Math.max(r.height+14,46),340);let L=r.left+r.width/2-w/2,T=r.top+r.height/2-h/2;L=Math.max(8,Math.min(1272-w,L));T=Math.max(8,Math.min(712-h,T));hl.style.left=L+'px';hl.style.top=T+'px';hl.style.width=w+'px';hl.style.height=h+'px';hl.classList.add('on')}}const rp=document.getElementById('tv-rip');if(rp){rp.classList.remove('go');rp.style.left=x+'px';rp.style.top=y+'px';void rp.offsetWidth;setTimeout(()=>rp.classList.add('go'),650)}const c=document.getElementById('tv-cur');c.classList.remove('hit');void c.offsetWidth;setTimeout(()=>c.classList.add('hit'),950);return 'ok '+Math.round(x)+','+Math.round(y)};

 try{_saveDocFileData=function(sk,id,kind,dataUrl,onDone){try{_docFileCache.set(sk+'::'+id+'::'+kind,dataUrl)}catch(e){}if(onDone)setTimeout(function(){onDone(true)},200)}}catch(e){}
 window.alert=function(){};
 window.tvDrop=function(css){var sel=document.querySelector(css);if(!sel)return;var r=sel.getBoundingClientRect();var old=document.getElementById('tv-drop');if(old)old.remove();
  var d=document.createElement('div');d.id='tv-drop';var W=Math.max(r.width,176),H=3*38+6;var top=(r.bottom+H+10>700)?(r.top-H-6):(r.bottom+5);
  d.style.cssText='position:absolute;left:'+Math.min(r.left,1280-W-8)+'px;top:'+top+'px;width:'+W+'px;background:#fff;border-radius:10px;box-shadow:0 14px 34px rgba(0,0,0,.4);overflow:hidden;opacity:0;transform:translateY(-8px) scale(.97);transition:opacity .25s,transform .25s;border:2px solid #fff;font:700 13px Arial,sans-serif';
  var cols=['#1EA03C','#FF8C1E','#FF4D4D'],labs=['✅ Completed','⏳ In Progress','✖︎ Not Started'];
  d.innerHTML=labs.map(function(t,i){return '<div style="padding:10px 12px;height:38px;box-sizing:border-box;background:'+cols[i]+';color:#000;transition:filter .2s,box-shadow .2s">'+t+'</div>'}).join('');
  document.getElementById('tv-ovl').appendChild(d);requestAnimationFrame(function(){d.style.opacity=1;d.style.transform='none'});window.__dropSel=css};
 window.tvDropHover=function(i){var d=document.getElementById('tv-drop');if(!d)return;[].forEach.call(d.children,function(c,k){c.style.filter=k===i?'brightness(1.18)':'';c.style.boxShadow=k===i?'inset 0 0 0 3px #1d4ed8':''});var c=d.children[i];if(c){var r=c.getBoundingClientRect();window.tvCur(r.left+r.width*0.55,r.top+r.height*0.55)}};
 window.tvDropPick=function(i){var d=document.getElementById('tv-drop');var sel=document.querySelector(window.__dropSel||'x');if(sel){var vals=[].map.call(sel.options,function(o){return o.value});sel.value=vals[i];sel.className='status-sel '+['compliant','minor','critical'][i]}if(d){d.style.opacity=0;d.style.transform='translateY(-6px)';setTimeout(function(){d.remove()},300)}};
 window.tvPick=function(inputId,kind){var c=document.createElement('canvas');c.width=640;c.height=480;var g=c.getContext('2d');var gr=g.createLinearGradient(0,0,640,480);
  if(kind==='fix'){gr.addColorStop(0,'#dff3e4');gr.addColorStop(1,'#a5d6a7')}else if(kind==='find'){gr.addColorStop(0,'#eceff1');gr.addColorStop(1,'#b0bec5')}else{gr.addColorStop(0,'#e3f2fd');gr.addColorStop(1,'#90caf9')}
  g.fillStyle=gr;g.fillRect(0,0,640,480);g.lineWidth=14;g.lineJoin='round';
  if(kind==='find'){g.fillStyle='#fbc02d';g.strokeStyle='#f57f17';g.beginPath();g.moveTo(320,90);g.lineTo(520,400);g.lineTo(120,400);g.closePath();g.fill();g.stroke();g.fillStyle='#212121';g.font='bold 170px Arial';g.textAlign='center';g.fillText('!',320,370)}
  else if(kind==='fix'){g.strokeStyle='#2e7d32';g.lineWidth=36;g.lineCap='round';g.beginPath();g.moveTo(170,250);g.lineTo(280,360);g.lineTo(480,140);g.stroke()}
  else{g.fillStyle='#c62828';g.fillRect(260,150,120,250);g.fillStyle='#212121';g.fillRect(295,115,50,40);g.fillStyle='#fff';g.font='bold 30px Arial';g.textAlign='center';g.fillText('EVIDENCE',320,290)}
  c.toBlob(function(b){var f=new File([b],kind+'.jpg',{type:'image/jpeg'});var inp=document.getElementById(inputId);if(!inp)return;var dt=new DataTransfer();dt.items.add(f);inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}))},'image/jpeg',.85)};
 window.tvChapter=function(n,t,en,tr,ar){var o=document.getElementById('tv-ovl');if(!o)return;var e=document.getElementById('tv-ch');if(e)e.remove();e=document.createElement('div');e.id='tv-ch';
  e.innerHTML='<b>'+(n<10?'0':'')+n+'</b><span><em>'+en+'</em><small>'+tr+' · '+ar+'</small></span>';o.appendChild(e);requestAnimationFrame(function(){e.classList.add('in')});setTimeout(function(){e.classList.remove('in');e.classList.add('out')},2900);setTimeout(function(){e.remove()},3600)};

 window.tvToast=function(msg,ms,ok){var o=document.getElementById('tv-ovl');if(!o)return;var e=document.getElementById('tv-toast');if(e)e.remove();e=document.createElement('div');e.id='tv-toast';
  e.style.cssText='position:absolute;left:50%;bottom:150px;transform:translate(-50%,20px);background:#1A3660;color:#fff;font:700 15px Arial,sans-serif;padding:13px 22px;border-radius:12px;box-shadow:0 10px 28px rgba(0,0,0,.4);display:flex;align-items:center;gap:12px;opacity:0;transition:opacity .3s,transform .3s';
  e.innerHTML=(ok?'<span style="color:#7CFC9A;font-size:18px">\u2714</span>':'<span style="width:16px;height:16px;border:3px solid #fff;border-top-color:transparent;border-radius:50%;display:inline-block;animation:tvspin .8s linear infinite"></span>')+'<span>'+msg+'</span>';
  if(!document.getElementById('tv-spin-css')){var st=document.createElement('style');st.id='tv-spin-css';st.textContent='@keyframes tvspin{to{transform:rotate(360deg)}}';document.head.appendChild(st)}
  o.appendChild(e);requestAnimationFrame(function(){e.style.opacity=1;e.style.transform='translate(-50%,0)'});setTimeout(function(){e.style.opacity=0;setTimeout(function(){e.remove()},300)},ms||2000)};
 window.typeIn=(id,txt)=>{const e=document.getElementById(id);if(!e)return;let i=0;e.focus();const t=setInterval(()=>{e.value=txt.slice(0,++i);e.dispatchEvent(new Event('input',{bubbles:true}));if(i>=txt.length)clearInterval(t)},70)};
})()`;
const OVER=(L)=>`
(()=>{if(document.getElementById('tv-ovl'))return;const st=document.createElement('style');st.textContent='#tv-ovl{position:fixed;inset:0;z-index:2147483000;pointer-events:none;font-family:Inter,Arial,sans-serif}#tv-sub{position:absolute;left:50%;bottom:26px;transform:translateX(-50%);width:min(1120px,92vw);display:flex;flex-direction:column;gap:6px;align-items:center;opacity:0;transition:opacity .25s}#tv-sub.on{opacity:1}#tv-sub div{padding:6px 14px;border-radius:7px;font-weight:700;font-size:21px;line-height:1.3;text-align:center;max-width:100%}#tv-tr{background:rgba(11,18,32,.82);color:#fff}#tv-ar{background:rgba(11,18,32,.82);color:#FFD66B;direction:rtl}#tv-ch{position:absolute;left:50%;top:-80px;transform:translateX(-50%);display:flex;align-items:center;gap:14px;background:rgba(15,23,42,.94);color:#fff;border-radius:16px;padding:10px 26px 10px 12px;box-shadow:0 10px 30px rgba(0,0,0,.45);border:1px solid rgba(255,128,0,.7);transition:top .55s cubic-bezier(.2,.9,.2,1),opacity .5s;opacity:0;font-family:Arial,sans-serif}#tv-ch.in{top:14px;opacity:1}#tv-ch.out{top:-80px;opacity:0}#tv-ch b{background:#FF8000;color:#fff;border-radius:10px;padding:8px 12px;font-size:20px;letter-spacing:.04em}#tv-ch em{font-style:normal;font-weight:800;font-size:19px;display:block}#tv-ch small{font-size:12px;color:#cbd5e1;display:block;margin-top:2px}#tv-hl{position:absolute;border:3px solid #FF8000;border-radius:12px;opacity:0;pointer-events:none;box-shadow:0 0 0 3000px rgba(8,14,30,.30),0 0 22px 4px rgba(255,128,0,.75),inset 0 0 18px rgba(255,128,0,.22);transition:left .7s cubic-bezier(.4,.1,.2,1),top .7s cubic-bezier(.4,.1,.2,1),width .7s cubic-bezier(.4,.1,.2,1),height .7s cubic-bezier(.4,.1,.2,1),opacity .4s}#tv-hl.on{opacity:1;animation:tvpulse 1.5s ease-in-out infinite}@keyframes tvpulse{50%{box-shadow:0 0 0 3000px rgba(8,14,30,.30),0 0 36px 10px rgba(255,170,50,.95),inset 0 0 24px rgba(255,128,0,.35)}}#tv-tag{position:absolute;background:#FF8000;color:#fff;font:800 13px Arial,sans-serif;letter-spacing:.06em;padding:3px 9px;border-radius:99px;opacity:0;transform:translateY(6px);transition:opacity .35s,transform .35s;box-shadow:0 4px 12px rgba(0,0,0,.3)}#tv-tag.on{opacity:1;transform:none}#tv-rip{position:absolute;width:26px;height:26px;border-radius:50%;border:3px solid #FF8000;opacity:0;pointer-events:none}#tv-rip.go{animation:tvrip .9s ease-out}@keyframes tvrip{0%{opacity:.95;transform:translate(-50%,-50%) scale(.3)}100%{opacity:0;transform:translate(-50%,-50%) scale(4.2)}}#tv-cur.hit{animation:tvhit .6s ease-out}@keyframes tvhit{0%{filter:drop-shadow(0 0 0 rgba(255,128,0,0))}40%{filter:drop-shadow(0 0 14px #FF8000)}100%{filter:drop-shadow(0 2px 3px rgba(0,0,0,.45))}}#tv-cur{position:absolute;left:1100px;top:700px;width:40px;height:40px;transition:left .9s cubic-bezier(.4,.1,.2,1),top .9s cubic-bezier(.4,.1,.2,1);filter:drop-shadow(0 2px 3px rgba(0,0,0,.45))}';document.head.appendChild(st);
const o=document.createElement('div');o.id='tv-ovl';o.innerHTML='<div id="tv-sub"><div id="tv-tr"></div><div id="tv-ar"></div></div><div id="tv-hl"></div><div id="tv-tag"></div><div id="tv-rip"></div><svg id="tv-cur" viewBox="0 0 24 24"><path d="M3 2l7 19 2.6-7.4L20 11z" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>';document.body.appendChild(o);
window.tvSub=(tr,ar)=>{document.getElementById('tv-tr').textContent=tr||'';document.getElementById('tv-ar').textContent=ar||'';document.getElementById('tv-sub').classList.toggle('on',!!(tr||ar))};
window.tvCur=(x,y)=>{const c=document.getElementById('tv-cur');c.style.left=x+'px';c.style.top=y+'px'};})()`;
function closeHtml(P){const s2=P.sentences[1]?P.sentences[1].start:2;return `<style>*{box-sizing:border-box;margin:0}body{width:1280px;height:720px;font-family:Arial,sans-serif;overflow:hidden;background:linear-gradient(135deg,#fff,#eef2f7);position:relative}.bar{position:fixed;left:0;top:0;height:10px;background:#FF8000;animation:w 2s ease-out forwards;width:0}@keyframes w{to{width:100%}}.l{position:absolute;left:0;top:0;width:1280px;height:720px;display:flex;flex-direction:column;align-items:center;justify-content:center;animation:sh .9s ${s2}s cubic-bezier(.4,.1,.2,1) both}@keyframes sh{from{transform:translateX(0)}to{transform:translateX(-300px) scale(.82)}}img{height:150px;animation:z 1.4s cubic-bezier(.2,.8,.2,1) both}@keyframes z{from{transform:scale(.6);opacity:0}to{transform:none;opacity:1}}h1{font-size:60px;font-weight:800;color:#111827;margin-top:26px;animation:u 1s .5s both}h2{font-size:26px;color:#475569;margin-top:8px;animation:u 1s .9s both}@keyframes u{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}.tag{margin-top:30px;font-size:25px;font-weight:700;color:#fff;background:#FF8000;padding:11px 28px;border-radius:999px;animation:u 1s 1.5s both}.c{position:absolute;left:640px;top:120px;width:560px;background:#fff;border-radius:18px;border-left:8px solid #FF8000;box-shadow:0 20px 60px rgba(15,23,42,.18);padding:30px 34px;opacity:0;animation:cf .8s ${s2+0.5}s forwards}@keyframes cf{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}.c h3{font-size:30px;color:#111827;letter-spacing:.5px}.c .r{font-size:19px;color:#475569;margin:3px 0 14px}.c .k{font-size:13px;font-weight:800;color:#FF8000;letter-spacing:1.5px;margin-top:11px}.c .v{font-size:15.5px;color:#334155;line-height:1.4;margin-top:2px}.c .i{opacity:0;animation:cf .6s forwards}.c .m{font-size:18px;color:#0f4c81;font-weight:700;margin-top:12px}</style><div class="bar"></div><div class="l"><img src="${logo}"><h1>Thank you</h1><h2>Teşekkürler · شكراً</h2><div class="tag">Quality starts with you</div></div><div class="c"><div class="i" style="animation-delay:${s2+0.9}s"><h3>ABDULLAH BAYDOĞAN</h3><div class="r">Quality Assurance Manager</div></div><div class="i" style="animation-delay:${s2+1.5}s"><div class="k">OFFICE</div><div class="v">3MRH+W22, Second New Cairo, Cairo Governorate 4771820, Egypt</div></div><div class="i" style="animation-delay:${s2+2.1}s"><div class="k">PHONE</div><div class="v">+20 120 640 37 42</div></div><div class="i" style="animation-delay:${s2+2.7}s"><div class="m">abdullah.baydogan@nscstr.com</div><div class="m" style="margin-top:4px">www.nscstr.com</div></div></div>`}
function titleHtml(){return `<style>*{box-sizing:border-box;margin:0}body{width:1280px;height:720px;font-family:Arial,sans-serif;overflow:hidden;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative}.bar{position:fixed;left:0;top:0;height:10px;background:#FF8000;animation:w 1.6s ease-out forwards;width:0}@keyframes w{to{width:100%}}img{height:170px;animation:z 1.2s cubic-bezier(.2,.8,.2,1) both}@keyframes z{from{transform:scale(.6);opacity:0}to{transform:none;opacity:1}}h1{font-size:44px;font-weight:800;color:#0f172a;margin-top:34px;animation:u 1s .5s both}h2{font-size:22px;color:#64748b;margin-top:10px;animation:u 1s .8s both}.tag{margin-top:26px;font-size:21px;font-weight:700;color:#fff;background:#FF8000;padding:10px 26px;border-radius:999px;animation:u 1s 1.2s both}@keyframes u{from{transform:translateY(22px);opacity:0}to{transform:none;opacity:1}}</style><div class="bar"></div><img src="${logo}"><h1>NSCS Quality Management Systems Portal</h1><h2>New Surveillance Consultant Systems</h2><div class="tag">All our quality management systems in one portal</div>`}
const only=process.argv[2]?process.argv[2].split(',').map(Number):SC.map((_,i)=>i+1);
(async()=>{const b=await chromium.launch();
for(const n of only){const s=SC[n-1],cfg=CFG[s.id];if(!cfg){console.log('NO CFG',s.id);continue}
 let t=LEAD;const sent=s.s.map((r,k)=>{const d=dur(AUD+`en_${String(n).padStart(2,'0')}_${String(k+1).padStart(2,'0')}.mp3`);const o={start:t,end:t+d,tr:r.tr,ar:r.ar,d};t+=d+GAP;return o});
 const total=t-GAP+TAIL;const nn=String(n).padStart(2,'0');
 const ctx=await b.newContext({viewport:{width:1280,height:720},recordVideo:{dir:'out/raw'+nn,size:{width:1280,height:720}}});
 const p=await ctx.newPage();const created=Date.now();const err=[];p.on('pageerror',x=>err.push(x.message));
 let ready;
 if(cfg.kind==='card'){await p.setContent('<html><body></body></html>');await p.setContent(cfg.card==='close'?closeHtml({sentences:sent}):titleHtml());await p.evaluate(OVER());await p.evaluate(()=>{const c=document.getElementById('tv-cur');if(c)c.style.display='none'});ready=Date.now();}
 else{
  await p.goto('http://localhost:8791/index.html',{waitUntil:'domcontentloaded'});await p.waitForTimeout(2600);
  if(cfg.kind!=='entry'){await p.evaluate(()=>{currentUserRole='admin';currentUserIsNamedAccount=true;currentUserEmail='abdullah.baydogan@nscstr.com';currentUserName='Abdullah Baydoğan';enterApp();setLanguage('en');document.querySelectorAll('.open').forEach(x=>x.classList.remove('open'));const a=document.getElementById('site-announcement-popup');if(a)a.style.display='none';
   let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};auditQuestions=defaultAuditQuestions.map(q=>{const r=rnd();return Object.assign({},q,{status:r<.55?'compliant':r<.8?'minor':'critical'})});calcMetrics();applyFilter();refreshAllDashboards();
   trainingVideosDocs=[{id:'1',name:'NSCS Portal Introduction',videoLink:'https://www.youtube.com/watch?v=xtnfclCbmkk',description:'English narration with Turkish and Arabic subtitles.'},{id:'2',name:'General · Personal Protective Equipment (EN)',videoLink:'https://www.youtube.com/watch?v=4BLN-fspikM',description:'Health and safety training'},{id:'3',name:'General · First Aid (EN)',videoLink:'https://www.youtube.com/watch?v=5OKFljZ2GQE',description:'Basic first aid'},{id:'4',name:'New Employee Orientation',videoLink:'https://abdllhbydgn.github.io/emsportal/tanitim/EMS_Oryantasyon_Yeni_Baslayan.mp4',description:'Orientation video'}];});
   await p.waitForTimeout(800);if(cfg.kind==='home')await p.evaluate(()=>{const m=document.querySelector('.main-content');if(m)m.style.zoom=0.8});}
  if(cfg.pre)await p.evaluate(cfg.pre);
  await p.evaluate(SETUP);await p.evaluate(OVER());await p.evaluate(a=>window.tvChapter(a[0],a[1],a[2],a[3],a[4]),[n,SC.length,s.title[0],s.title[1],s.title[2]]);ready=Date.now();
 }
 const off=(ready-created)/1000;
 const t0=Date.now();
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const cur=[[820,300],[520,420],[900,520],[640,260],[1000,380],[420,520]];
 const events=[];
 sent.forEach((x,k)=>{events.push([x.start,'sub',k]);events.push([x.end,'unsub',k]);
  const tg=(CUR[s.id]&&CUR[s.id][k])||[];const d=x.end-x.start;const step=tg.length>1?Math.max(0.9,Math.min(1.8,(d-1.3)/(tg.length))):0;
  const clk=(cfg.acts||[]).some(a=>a[0]===k&&(String(a[1]).startsWith('CLICK:')||(a[2]||0)>=1));tg.forEach((sp,i)=>events.push([x.start+(clk?2.5:1.0)+i*step,'curt',sp]));});
 (cfg.acts||[]).forEach(a=>events.push([sent[Math.min(a[0],sent.length-1)].start+0.2+(a[2]||0),'act',a[1]]));
 events.sort((a,b)=>a[0]-b[0]);
 if(cfg.kind!=='card'||cfg.card==='close'){}
 const clicks=[];
 let _prev=0;for(const ev of events){const dt=process.env.DRY?Math.min(700,(ev[0]-_prev)*1000):ev[0]*1000-(Date.now()-t0);_prev=ev[0];if(dt>0)await wait(dt);
  try{
   if(ev[1]==='sub')await p.evaluate(([a,b])=>window.tvSub&&window.tvSub(a,b),[sent[ev[2]].tr,sent[ev[2]].ar]);
   else if(ev[1]==='unsub')await p.evaluate(()=>{window.tvSub&&window.tvSub('','');const h=document.getElementById('tv-hl');if(h)h.classList.remove('on')});
   else if(ev[1]==='curt'){const r=await p.evaluate(sp=>window.tvPt(sp),ev[2]);if(/^MISS/.test(r))err.push(r);if(process.env.DRY){await p.waitForTimeout(1000);await p.screenshot({path:`dry/${s.id}_${String(ev[0]).slice(0,5)}.png`})}}
   else if(String(ev[2]).startsWith('CLICK:')){const sp=String(ev[2]).slice(6);if(!/^N:/.test(sp)&&!/^F:N:/.test(sp))clicks.push(+(ev[0]+(/^F:/.test(sp)?1.15:1.8)).toFixed(2));else clicks.push(+(ev[0]+(/^F:/.test(sp)?1.0:1.65)).toFixed(2));await p.evaluate(x=>window.tvClickSeq(x),sp)}else await p.evaluate(ev[2]);
  }catch(e){err.push(String(e.message).slice(0,80))}}
 const rest=process.env.DRY?300:total*1000-(Date.now()-t0);if(rest>0)await wait(rest);
 const vid=p.video();await ctx.close();const path=await vid.path();
 fs.writeFileSync(`out/${nn}.json`,JSON.stringify({off,total,sent:sent.map(x=>[x.start,x.end]),clicks}));
 fs.renameSync(path,`out/${nn}.webm`);fs.rmSync('out/raw'+nn,{recursive:true,force:true});
 console.log('scene',nn,s.id,total.toFixed(1),'off',off.toFixed(2),err.length?err.slice(0,2):'');
}
await b.close()})()
