// Floating action button: expands into a frosted overlay with search bar + filter / sort options + close. Shared by home7 and subtopic3.
(function(){
const sorts=['Importance','Trending','Newest','Most liked'];
const diffs=[['Basic','#6f9a5b'],['Intermediate','#c9a646'],['Hard','#d07a3a'],['Advanced','#b5473a']];
const html=`
<div class="catcher" id="catcher"><div class="fl l1"></div><div class="fl l2"></div><div class="fl l3"></div><div class="fl tint"></div></div>
<div class="fabwrap ctx" id="cwrap">
  <button class="cfab" id="cfab" aria-label="Modern Hippie" data-tip="Modern Hippie" data-tip-side="b"><span class="cmh" id="cfabMark">MH</span><i data-ic="users" id="cfabIc" hidden></i></button>
  <button class="cmini c1" data-ctx="mh" aria-label="Modern Hippie" data-tip="Modern Hippie" data-tip-side="r"><span class="cmh">MH</span></button>
  <button class="cmini c2" data-ctx="follow" aria-label="Follow" data-tip="Follow" data-tip-side="r"><i data-ic="users"></i></button>
  <button class="cmini c3" data-ctx="personal" aria-label="Personal" data-tip="Personal" data-tip-side="r"><i data-ic="user"></i></button>
</div>
<div class="fabwrap left" id="lwrap">
  <button class="mini l s" id="lX" aria-label="Close" data-tip="Close" data-tip-side="r"><i data-ic="x"></i></button>
  <button class="mini l f" id="lRoot" aria-label="Path to root" data-tip="Path" data-tip-side="r"><i data-ic="network"></i></button>
  <div class="cres" id="cres" hidden></div>
  <button class="fab l" id="lfab" aria-label="Menu" data-tip="Menu" data-tip-side="r"><i data-ic="menu" id="lfabIc"></i></button>
</div>
<div class="pop" id="pathPop"><div class="card pathcard" role="dialog" aria-label="Path"><div class="pathhead"><h3>Path</h3><span id="pathDepth"></span></div>
  <div class="pathlist" id="pathList"></div>
  <p class="pathnote" id="pathNote"></p>
  <div class="btns"><button class="pri" id="pathDone">Close</button></div></div></div>
<div class="fabwrap top" id="twrap">
  <button class="tfab" id="tfab" aria-label="Profile" data-tip="Profile"><i data-ic="user" id="tfabIc"></i></button>
  ${[['bell','Notifications','Notifications'],['settings','Settings','Settings'],['circle-dollar-sign','Finance','Finance']].map(([i,l,a],n)=>`<button class="tmini t${n+1}" data-l="${l}" aria-label="${a}" data-tip="${l}"><i data-ic="${i}"></i></button>`).join('')}
</div>
<div class="ascreen" id="ascreen" role="dialog" aria-modal="true" aria-labelledby="asTitle"><div class="aspanel"><div class="ashead"><button type="button" class="asback" id="asBack" aria-label="Back"><i data-ic="arrow-left"></i><span>Back</span></button><h3 id="asTitle"></h3><button type="button" class="icbtn" id="asX" aria-label="Close" data-tip="Close"><i data-ic="x"></i></button></div><div id="asBody"></div></div></div>
<div class="fabwrap" id="fabwrap">
  <div class="fopts sfcard" id="optSF" role="dialog" aria-label="Sort and filter">
    <div class="sortsec"><h5>Sort</h5><div class="pgrid" id="sortGrid">
    ${sorts.map((s,i)=>`<button class="po${i==0?' on':''}" data-v="${s}">${s}</button>`).join('')}</div></div>
    <h5>Filter</h5>
    <div class="ddrow"><span class="ddlab">Difficulty</span>
      <div class="dd" id="dd"><button class="ddbtn" id="ddBtn" aria-haspopup="listbox" aria-expanded="false"><span class="dot any"></span><span id="ddVal">Any</span><i class="ddcar" data-ic="chevron-down"></i></button>
      <div class="ddlist" id="ddList" role="listbox">
      ${[['Any','']].concat(diffs).map(([d,c])=>`<button class="ddopt${d=='Any'?' on':''}" role="option" data-v="${d}"><span class="dot${c?'':' any'}"${c?` style="background:${c}"`:''}></span>${d}<i class="ck" data-ic="check"></i></button>`).join('')}
      </div></div></div></div>
  <div class="fopts sfcard" id="optView" role="dialog" aria-label="View"><h5>View</h5><div class="pgrid vgrid" id="viewGrid">
    ${[['list','List','list'],['compact','Compact','rows-3'],['post','Post','image'],['full','Full screen','smartphone']].map(([v,l,i])=>`<button class="po vo${v==='full'?' soon':''}" data-v="${v}"${v==='full'?' aria-disabled="true"':''}><i data-ic="${i}"></i>${l}${v==='full'?'<small class="soonlab">Coming soon</small>':''}</button>`).join('')}</div></div>
  <button class="mini x" id="fabX" aria-label="Close" data-tip="Close"><i data-ic="x"></i></button>
  <button class="mini s" id="fabView" aria-label="View" data-tip="View"><i data-ic="layout-panel-left"></i></button>
  <button class="mini f" id="fabSF" aria-label="Sort and filter" data-tip="Sort"><i data-ic="sliders-horizontal"></i></button>
  <form class="sbar" id="sbar" autocomplete="off"><input id="sq" placeholder="Search this topic" aria-label="Search"></form>
  <div class="sres" id="sres"></div>
  <button class="fab" id="fab" aria-label="Tools" data-tip="Tools"><i data-ic="sparkles" id="fabIc"></i></button>
</div>`;
document.body.insertAdjacentHTML('beforeend',html);
paintIcons();
const $=id=>document.getElementById(id);
const wrap=$('fabwrap'),catcher=$('catcher'),fab=$('fab'),sq=$('sq'),sres=$('sres');
const panels={sf:[$('optSF'),$('fabSF')],view:[$('optView'),$('fabView')]};
let backFn=null, panelOwner=null; // 'top' | 'create' | null
function setIc(name,id='fabIc'){const i=$(id);i.dataset.ic=name;delete i.dataset.done;paintIcons(i.parentNode)}
function showPanel(k){document.getElementById('dd')?.classList.remove('open');$('optSF').classList.remove('ddopen');for(const [n,[p,b]] of Object.entries(panels)){const on=n==k;p.classList.toggle('on',on);b.classList.toggle('show',on)}if(k)sres.classList.remove('on')}
function current(){return Object.keys(panels).find(k=>panels[k][0].classList.contains('on'))}
function topicName(){const p=window.TOPIC_PATH;return (p&&p.length)?p[p.length-1]:'Modern Hippie'}
function syncSearchPh(){
  const noun=window.sectionSearchNoun?window.sectionSearchNoun():'items';
  sq.placeholder=`Search ${noun} in ${topicName()}`;
  sq.setAttribute('aria-label',sq.placeholder);
}
function openMenu(){closeLeft();closeTop();closeCtx();closeVote();closeCreate(true);wrap.classList.add('open','searching');catcher.classList.remove('on');showPanel(null);setIc('search');fab.setAttribute('aria-label','Search');fab.dataset.tip='Search';syncSearchPh();sq.focus()}
function closeAll(){closeMenu();closeLeft();closeTop();closeCtx();closeVote();closeCreate()}
function syncCatcher(){const toolsFrost=wrap.classList.contains('open')&&!wrap.classList.contains('searching');catcher.classList.toggle('on',!!(toolsFrost||document.querySelector('#vr,#ascreen.on,.fabwrap.left.open,.fabwrap.top.open,.fabwrap.ctx.open')))}
// vote ruler
const MARKS=['&#9650;&#9650;','&#9650;','','&#9660;','&#9660;&#9660;'];
function closeVote(){const v=$('vr');if(v){v.remove();syncCatcher()}}
window.openVote=function(b,e){e&&e.stopPropagation();closeAll();closeVote();
  const r=b.getBoundingClientRect(),v=document.createElement('div');v.id='vr';v.className='vr glass';
  v.style.left=(r.left+r.width/2-22)+'px';v.style.top=Math.max(8,r.top+r.height/2-94)+'px';
  v.innerHTML='<span>Higher</span><div class="track">'+[0,1,2,3,4].map(i=>'<div class="n" style="top:'+(i*25)+'%"></div>').join('')+'<div class="knob">'+b.textContent+'</div></div><span>Lower</span>';
  document.body.appendChild(v);catcher.classList.add('on');
  const tr=v.querySelector('.track'),k=v.querySelector('.knob');
  const cur=+(b.dataset.vote??2);const set=i=>{k.style.top=(i*25)+'%';b.dataset.vote=i;b.classList.toggle('voted',i!=2);
    let m=b.parentNode.querySelector('.mark');if(!m){m=document.createElement('span');m.className='mark';b.parentNode.appendChild(m)}m.innerHTML=MARKS[i]};
  k.style.top=(cur*25)+'%';
  const pick=ev=>{const rr=tr.getBoundingClientRect();set(Math.max(0,Math.min(4,Math.round((ev.clientY-rr.top)/rr.height*4))))};
  v.addEventListener('pointerdown',ev=>{ev.stopPropagation();v.setPointerCapture(ev.pointerId);pick(ev)});
  v.addEventListener('pointermove',ev=>{if(v.hasPointerCapture(ev.pointerId))pick(ev)});
  v.addEventListener('click',ev=>ev.stopPropagation());
};
function closeMenu(){wrap.classList.remove('open','searching');syncCatcher();showPanel(null);setIc('sparkles');fab.setAttribute('aria-label','Tools');fab.dataset.tip='Tools';sres.classList.remove('on');sres.innerHTML='';sq.value='';sq.blur();if(window.clearSectionFilter)window.clearSectionFilter()}
function runSearch(){
  showPanel(null);sres.classList.remove('on');sres.innerHTML='';
  const q=sq.value.trim();
  if(!q){if(window.clearSectionFilter)window.clearSectionFilter();return}
  if(window.filterSection)window.filterSection(q);
}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function search(){runSearch()}
window.fabOpen=openMenu;window.fabClose=closeMenu;
fab.addEventListener('click',e=>{e.stopPropagation();
  if(!wrap.classList.contains('open'))return openMenu();
  // searching: second tap closes tools (filter already live)
  if(wrap.classList.contains('searching'))return closeMenu();
  search();
});
$('sbar').addEventListener('submit',e=>{e.preventDefault();runSearch()});
sq.addEventListener('input',()=>{if(wrap.classList.contains('open'))runSearch()});
window.onSectionChange=()=>{syncSearchPh();if(wrap.classList.contains('searching'))runSearch()};
['pointerdown','mousedown','touchstart'].forEach(t=>catcher.addEventListener(t,e=>{e.preventDefault();e.stopPropagation()},{passive:false}));
catcher.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();closeAll()});
wrap.addEventListener('click',e=>e.stopPropagation());
$('fabX').onclick=closeMenu;
window.openToolsChrome=function openToolsChrome(){closeLeft();closeTop();closeCtx();closeVote();closeCreate(true);wrap.classList.add('open');wrap.classList.remove('searching');catcher.classList.add('on');setIc('search');syncSearchPh()}
$('fabSF').onclick=()=>{if(!wrap.classList.contains('open')||wrap.classList.contains('searching'))openToolsChrome();showPanel(current()=='sf'?null:'sf')};
$('fabView').onclick=()=>{if(!wrap.classList.contains('open')||wrap.classList.contains('searching'))openToolsChrome();syncView();showPanel(current()=='view'?null:'view')};
$('sortGrid').querySelectorAll('.po').forEach(o=>o.onclick=()=>$('sortGrid').querySelectorAll('.po').forEach(x=>x.classList.toggle('on',x==o)));
const dd=$('dd'),ddBtn=$('ddBtn');
const syncF=()=>$('fabSF').classList.toggle('act',$('ddVal').textContent!='Any');
const ddOpen=o=>{dd.classList.toggle('open',o);$('optSF').classList.toggle('ddopen',o);ddBtn.setAttribute('aria-expanded',o)};
ddBtn.onclick=e=>{e.stopPropagation();ddOpen(!dd.classList.contains('open'))};
$('ddList').querySelectorAll('.ddopt').forEach(o=>o.onclick=e=>{e.stopPropagation();$('ddList').querySelectorAll('.ddopt').forEach(x=>x.classList.toggle('on',x==o));
  $('ddVal').textContent=o.dataset.v;ddBtn.querySelector('.dot').replaceWith(o.querySelector('.dot').cloneNode());ddOpen(false);syncF()});
$('optSF').addEventListener('click',e=>{if(!e.target.closest('#dd'))ddOpen(false)});
function syncView(){const v=window.getView?getView():'compact';$('viewGrid').querySelectorAll('.po').forEach(x=>x.classList.toggle('on',x.dataset.v==v&&x.dataset.v!=='full'))}
$('viewGrid').querySelectorAll('.po').forEach(o=>o.onclick=()=>{
  if(o.dataset.v==='full'||o.classList.contains('soon')){if(window.toast)toast('Full screen coming soon');return}
  window.setView&&setView(o.dataset.v);syncView();
});
// ---- top-right menu
const twrap=$('twrap'),tfab=$('tfab'),asc=$('ascreen');
const chev='<i class="aschev" data-ic="chevron-right"></i>';
const row=(ic,l,v)=>`<button class="asrow"><i class="asic" data-ic="${ic}"></i><span class="asl">${l}</span>${v?`<span class="asv">${v}</span>`:''}${chev}</button>`;
const kv=(k,v)=>`<div class="askv"><span>${k}</span><b>${v}</b></div>`;
const EX='<p class="asex">Example data</p>';
const NOTIFS=[
  {ic:'heart',t:'@river liked your post',meta:'2h · Like'},
  {ic:'message-circle',t:'@sage replied to your discussion',meta:'5h · Reply'},
  {ic:'bookmark',t:'@juniper saved your resource',meta:'1d · Save'},
  {ic:'bell',t:'Welcome to Modern Hippie',meta:'3d · System'}
];
const SCREENS={
 Profile:['Profile',`${EX}<div class="asprof"><div class="asav"><i data-ic="user"></i></div><div><div class="asname">Example Name</div><div class="asmeta">@examplename</div><div class="asmeta">Joined March 2026</div></div></div>
   <div class="asrows">${row('user-pen','Edit profile')}</div>`],
 Notifications:['Notifications',`${EX}<div class="nlist">${NOTIFS.map(n=>`<button type="button" class="nrow"><i class="asic" data-ic="${n.ic}"></i><span class="nbody"><b>${n.t}</b><small>${n.meta}</small></span></button>`).join('')}</div>`],
 Settings:['Settings',`${EX}<div class="asrows">${row('bell','Notifications','On')}${row('globe','Language','English')}${row('sun-moon','Theme','Light')}${row('shield','Privacy','')}</div>`]};
const FOUNDERS=[['Gold','#d4a017',250,1000],['Green','#2f8f46',300,1500],['Indigo','#3f37c9',350,1600],['Red','#d1242f',400,1400],['Copper','#b87333',475,1200],['Yellow','#e6c200',550,1000],['Orange','#f0671e',650,850],['Pink','#ff4fa3',750,700],['Violet','#9b30ff',875,450],['Silver','#9aa3ad',1000,300]];
function financeHTML(state){
  const has=state==='member';
  const fmt=n=>n.toLocaleString('en-US');
  const pay=has
    ?`<div class="askvs"><button class="askv ascard" type="button"><span>Card</span><b>Visa ending in **** 4242</b></button>${kv('Next payment','November 4, 2026')}</div><div class="asbtns"><button class="asbtn">Update card</button></div>`
    :`<button class="asbtn pri wide asaddcard"><i data-ic="credit-card"></i> Add credit card</button><p class="asnote">Add a card to start a membership.</p>`;
  const plan=(price,key,star,lab,desc,on)=>`<button class="mplan${on?' on':''}" data-v="${key}"><span class="mstar ${star}"><i data-ic="star"></i></span><div class="mbody"><b>$${price}<small>/mo</small></b><span class="mlab">${lab}</span><p>${desc}</p></div>${on?'<i class="mck" data-ic="check"></i>':''}</button>`;
  const plans=`<h5 class="ash5">Monthly</h5><div class="mplans">${plan(5,'growth','gold','Growth tools','Non-AI: progress tracking, offline saves, post stats, profile customization, more pods, supporter badge, small gift allowance.',false)}${plan(15,'ai','silver','Growth tools + AI','Everything in $5, plus AI guide, AI journal reflection and a bigger gift allowance. Founders get this for life with a fair-use AI cap.',has)}</div>`;
  const ftiers=`<h5 class="ash5">Founder passes <small>least → most</small></h5><div class="ftiers">${FOUNDERS.map(([n,c,p,s])=>`<button class="ftier" data-v="${n}"><span class="fdot" style="background:${c}"></span><span class="fn">${n}</span><b>$${fmt(p)}</b><small>${fmt(s)} passes</small></button>`).join('')}</div><p class="asnote">Founders show a coloured circle only — no silver star. Same perks at every tier.</p>`;
  return EX+pay+plans+ftiers+(has?`<button class="aslink">Cancel subscription</button>`:'');
}
window.openScreen=openScreen;
function setAsHead(mode,onBack){
  const back=$('asBack');
  backFn=onBack||null;
  if(mode==='back'){asc.classList.add('hasback');back.setAttribute('aria-hidden','false')}
  else{asc.classList.remove('hasback');back.setAttribute('aria-hidden','true')}
}
function openScreen(k,state){
  closeCreate(true);closeMenu();closeLeft();closeCtx();closeVote();
  panelOwner='top';
  twrap.classList.add('open');catcher.classList.add('on');twrap.classList.add('screen');
  if(k==='Finance'){const st=state||window.BILLING_DEMO||window._finState||'member';window._finState=st;$('asTitle').textContent='Finance';$('asBody').innerHTML=financeHTML(st);asc.dataset.state=st;setAsHead('x')}
  else if(k==='Card'){openCard();return}
  else{const [t,h]=SCREENS[k];$('asTitle').textContent=t;$('asBody').innerHTML=h;setAsHead('x')}
  paintIcons(asc);asc.classList.add('on');asc.dataset.k=k;wireFinance();
}
function cardHTML(){return `${EX}<div class="cform">
  <label class="cfield"><span>Name on card</span><input placeholder="Example Name" value="" autocomplete="cc-name"></label>
  <label class="cfield"><span>Card number</span><input inputmode="numeric" placeholder="•••• •••• •••• ••••" autocomplete="cc-number"></label>
  <div class="crow"><label class="cfield"><span>Expiry</span><input placeholder="MM / YY" autocomplete="cc-exp"></label>
  <label class="cfield"><span>CVC</span><input inputmode="numeric" placeholder="•••" autocomplete="cc-csc"></label></div>
  <button type="button" class="asbtn pri wide" id="asSaveCard">Save</button></div>`;}
function openCard(){
  panelOwner='top';
  $('asTitle').textContent='Credit card';$('asBody').innerHTML=cardHTML();
  asc.dataset.k='Card';setAsHead('back',()=>openScreen('Finance'));asc.classList.add('on');twrap.classList.add('open','screen');catcher.classList.add('on');
  paintIcons(asc);
  $('asSaveCard').onclick=e=>{e.stopPropagation();window._finState='member';window.BILLING_DEMO='member';openScreen('Finance','member')};
}
function wireFinance(){if(asc.dataset.k!=='Finance')return;
  const add=asc.querySelector('.asaddcard');if(add)add.onclick=e=>{e.stopPropagation();openCard()};
  const card=asc.querySelector('.ascard');if(card)card.onclick=e=>{e.stopPropagation();openCard()};
}
function closeScreen(){asc.classList.remove('on','hasback');twrap.classList.remove('screen');backFn=null;if(panelOwner==='top')panelOwner=null}
$('asX').onclick=e=>{e.stopPropagation();if(panelOwner==='create')closeCreate();else closeTop()};
function handleBack(e){if(e){e.preventDefault();e.stopPropagation()}if(backFn)backFn();else if(asc.dataset.k==='Card')openScreen('Finance')}
['pointerdown','click'].forEach(t=>$('asBack').addEventListener(t,handleBack));
asc.addEventListener('click',e=>e.stopPropagation());
asc.addEventListener('pointerdown',e=>e.stopPropagation());
function openTop(){closeMenu();closeLeft();closeCtx();closeVote();closeCreate(true);twrap.classList.add('open');catcher.classList.add('on');setIc('user','tfabIc');tfab.setAttribute('aria-label','Profile')}
function closeTop(){if(!twrap)return;closeScreen();twrap.classList.remove('open');syncCatcher()}
twrap.addEventListener('click',e=>e.stopPropagation());
tfab.addEventListener('click',()=>twrap.classList.contains('open')?openScreen('Profile'):openTop());
twrap.querySelectorAll('.tmini').forEach(b=>b.onclick=()=>openScreen(b.dataset.l));
// ---- create (left +)
const CREATE_META={
  sub:{title:'New subtopic',fields:'name'},
  feed:{title:'Write a post',fields:'post'},
  dis:{title:'Start a discussion',fields:'dis'},
  res:{title:'Add a resource',fields:'res'}
};
function closeCreate(silent){
  const pop=$('cInfoPop');if(pop)pop.remove();
  if(panelOwner!=='create'&&!asc.classList.contains('on'))return;
  if(panelOwner==='create'){asc.classList.remove('on','hasback');backFn=null;panelOwner=null;if(!silent)syncCatcher()}
}
function openCreatePanel(title,html,onBack){
  closeMenu();closeTop();closeCtx();closeVote();
  lwrap.classList.remove('open');setIc('menu','lfabIc');lfab.setAttribute('aria-label','Menu');lfab.dataset.tip='Menu';
  panelOwner='create';catcher.classList.add('on');
  $('asTitle').textContent=title;$('asBody').innerHTML=html;asc.dataset.k='Create';
  setAsHead(onBack?'back':'x',onBack||null);
  asc.classList.add('on');paintIcons(asc);
}
function createPickerHTML(){
  const cur=window.currentSection?window.currentSection():'sub';
  const types=window.CREATE_TYPES||[];
  return `${EX}<p class="asnote">Creating in <b>${esc(topicName())}</b> · current section: ${esc(window.sectionLabel?window.sectionLabel():'Subtopics')}</p>
    <div class="asrows">${types.map(t=>`<button type="button" class="asrow ctyp${t.k===cur?' on':''}" data-k="${t.k}"><i class="asic" data-ic="${t.ic}"></i><span class="asl">${t.label}</span>${chev}</button>`).join('')}</div>`;
}
function createFormHTML(k){
  const meta=CREATE_META[k];
  const secPick=`<label class="cfield"><span>Section</span><select id="cSec">${(window.CREATE_TYPES||[]).map(t=>`<option value="${t.k}"${t.k===k?' selected':''}>${t.label}</option>`).join('')}</select></label>`;
  if(k==='sub'){
    const path=PATH.length?PATH:['Modern Hippie'];
    const last=path.length-1;
    const pathHtml=path.map((n,i)=>{
      const cur=i===last;
      const root=i===0;
      const lab=root?'Root':(cur?'You are here':'Level '+i);
      return `<div class="prow cprow${cur?' cur on':''}${root?' root':''}" role="option" data-i="${i}" tabindex="0"><span class="pdot"></span><span class="cpill"><span class="pname">${esc(n)}</span></span><span class="plev">${lab}</span><button type="button" class="cinfo" data-info="${i}" aria-label="About placing here"${cur?'':' hidden'}><i data-ic="info"></i></button></div>`;
    }).join('');
    return `<div class="csub" id="cSub" data-k="sub">
      <div class="cpath" id="cPath" role="listbox" aria-label="Path">${pathHtml}</div>
      <div class="cformdock" id="cForm">
        <label class="cfield"><span>Name</span><input id="cName" placeholder="e.g. Morning stretch" maxlength="60" autocomplete="off"></label>
        <p class="asnote" id="cUnique">A new name creates a new topic. An existing name links that topic here.</p>
        <p class="asnote linknote" id="cLink" hidden></p>
        <label class="cfield"><span>Short description <small>(optional · new topics only)</small></span><textarea id="cBody" rows="3" placeholder="A sentence or two"></textarea></label>
        <button type="button" class="asbtn pri wide" id="cSubmit">Add subtopic</button>
      </div>
    </div>`;
  }
  if(k==='feed')return `${EX}<div class="cform" id="cForm" data-k="feed">${secPick}
    <label class="cfield"><span>Post</span><textarea id="cBody" rows="5" placeholder="Share an update"></textarea></label>
    <button type="button" class="asbtn pri wide" id="cSubmit">Post</button></div>`;
  if(k==='dis')return `${EX}<div class="cform" id="cForm" data-k="dis">${secPick}
    <label class="cfield"><span>Title</span><input id="cName" placeholder="What do you want to discuss?" maxlength="120"></label>
    <label class="cfield"><span>Opening message</span><textarea id="cBody" rows="4" placeholder="Add context"></textarea></label>
    <button type="button" class="asbtn pri wide" id="cSubmit">Start discussion</button></div>`;
  return `${EX}<div class="cform" id="cForm" data-k="res">${secPick}
    <label class="cfield"><span>Title</span><input id="cName" placeholder="Resource title" maxlength="120"></label>
    <label class="cfield"><span>Type</span><select id="cType"><option value="link">Link</option><option value="file">File</option></select></label>
    <label class="cfield"><span>URL or note</span><input id="cUrl" placeholder="https://… or filename"></label>
    <label class="cfield"><span>Description <small>(optional)</small></span><textarea id="cBody" rows="3" placeholder="What is it?"></textarea></label>
    <button type="button" class="asbtn pri wide" id="cSubmit">Add resource</button></div>`;
}
function wireCreateForm(k){
  const form=$('cForm');if(!form)return;
  const sec=$('cSec');
  if(sec)sec.onchange=()=>openCreateForm(sec.value);
  if(k==='sub'){
    let parentIdx=PATH.length-1;
    const name=$('cName'),link=$('cLink'),note=$('cUnique'),pathEl=$('cPath'),sub=$('cSub');
    const parentName=()=>PATH[parentIdx]||'Modern Hippie';
    const closeInfoPop=()=>{const pop=$('cInfoPop');if(pop)pop.remove();document.removeEventListener('pointerdown',onInfoAway,true)};
    const onInfoAway=e=>{const pop=$('cInfoPop');if(!pop)return;if(pop.contains(e.target)||e.target.closest?.('.cinfo'))return;closeInfoPop()};
    const placeInfoPop=btn=>{
      const pop=$('cInfoPop');if(!pop||!btn)return;
      const r=btn.getBoundingClientRect(), pw=Math.min(260,window.innerWidth-24), ph=pop.offsetHeight||88;
      let left=r.right-pw; if(left<12)left=12; if(left+pw>window.innerWidth-12)left=window.innerWidth-12-pw;
      // Prefer sprouting above when the info button sits low (next to the form)
      let place=(r.top>window.innerHeight*0.45)?'above':'below';
      let top=place==='below'?r.bottom+8:r.top-ph-8;
      if(place==='below'&&top+ph>window.innerHeight-12){place='above';top=r.top-ph-8}
      if(place==='above'&&top<8){place='below';top=r.bottom+8}
      if(top<8)top=8;
      pop.style.left=left+'px';pop.style.top=top+'px';pop.style.width=pw+'px';
      pop.dataset.place=place;
      const ax=Math.min(pw-18,Math.max(18,r.left+r.width/2-left));
      pop.style.setProperty('--ax',ax+'px');
    };
    const openInfoPop=(btn,i)=>{
      closeInfoPop();
      const pop=document.createElement('div');
      pop.id='cInfoPop';pop.className='cinfoPop';pop.setAttribute('role','dialog');
      pop.innerHTML=`<button type="button" class="cinfoPopX" aria-label="Close"><i data-ic="x"></i></button><p>New subtopics will be placed under <b>${esc(PATH[i])}</b>. Tap another level in the path to choose a different parent.</p><span class="cinfoArrow" aria-hidden="true"></span>`;
      document.body.appendChild(pop);
      if(window.paintIcons)paintIcons(pop);
      placeInfoPop(btn);
      requestAnimationFrame(()=>placeInfoPop(btn));
      pop.querySelector('.cinfoPopX').onclick=e=>{e.stopPropagation();closeInfoPop()};
      pop.addEventListener('pointerdown',e=>e.stopPropagation());
      pop.addEventListener('click',e=>e.stopPropagation());
      setTimeout(()=>document.addEventListener('pointerdown',onInfoAway,true),0);
    };
    const selectParent=(i,keepPop)=>{
      parentIdx=i;
      pathEl.querySelectorAll('.cprow').forEach(x=>{
        const on=+x.dataset.i===i;
        x.classList.toggle('cur',on);x.classList.toggle('on',on);
        const info=x.querySelector('.cinfo');if(info)info.hidden=!on;
      });
      if(!keepPop)closeInfoPop();
      syncName();
    };
    pathEl.querySelectorAll('.cprow').forEach(row=>{
      row.addEventListener('click',e=>{if(e.target.closest('.cinfo'))return;e.stopPropagation();selectParent(+row.dataset.i)});
    });
    pathEl.querySelectorAll('.cinfo').forEach(btn=>btn.addEventListener('click',e=>{
      e.stopPropagation();e.preventDefault();
      const i=+btn.dataset.info;selectParent(i,true);
      openInfoPop(btn,i);
    }));
    const syncName=()=>{
      const v=name.value.trim();
      const exists=v&&window.isSubtopicTaken&&window.isSubtopicTaken(v);
      if(exists){link.hidden=false;link.textContent=`This topic already exists — it will be added under ${parentName()}`;note.hidden=true;$('cBody').closest('.cfield').style.opacity='.45'}
      else{link.hidden=true;note.hidden=false;$('cBody').closest('.cfield').style.opacity=''}
    };
    name.addEventListener('input',syncName);
    pathEl.addEventListener('scroll',()=>{const pop=$('cInfoPop'),btn=pathEl.querySelector('.cinfo:not([hidden])');if(pop&&btn)placeInfoPop(btn);else closeInfoPop()},{passive:true});
    $('cSubmit').onclick=e=>{e.stopPropagation();
      const t=name.value.trim();if(!t){link.hidden=false;link.textContent='Please enter a name.';closeInfoPop();return}
      const exists=window.isSubtopicTaken&&window.isSubtopicTaken(t);
      const under=parentName();
      closeInfoPop();
      if(exists){
        window.addPlaceholderItem&&addPlaceholderItem('sub',{t,text:`Linked under ${under}`,chips:['Linked',under],href:'subtopic3.html?t='+encodeURIComponent(t)+'&path='+encodeURIComponent(PATH.slice(0,parentIdx+1).concat([t]).join('>'))});
        closeCreate();window.toast&&toast('Added under '+under);
      } else {
        window.addPlaceholderItem&&addPlaceholderItem('sub',{t,text:$('cBody').value.trim()||undefined,chips:['New',under],href:'subtopic3.html?t='+encodeURIComponent(t)+'&path='+encodeURIComponent(PATH.slice(0,parentIdx+1).concat([t]).join('>'))});
        closeCreate();window.toast&&toast('Created under '+under);
      }
    };
    // ensure pop closes with create panel
    const prevClose=closeCreate;
    // scroll current to sit next to form (bottom of path list)
    requestAnimationFrame(()=>{pathEl.scrollTop=pathEl.scrollHeight;const cur=pathEl.querySelector('.cprow.cur');cur&&cur.scrollIntoView({block:'end',behavior:'instant'})});
    return;
  }
  $('cSubmit').onclick=e=>{e.stopPropagation();
    if(k==='feed'){
      const body=$('cBody').value.trim()||'Example post from you';
      window.addPlaceholderItem&&addPlaceholderItem('feed',{t:body.slice(0,80)+(body.length>80?'…':''),text:body,meta:'Just now · 0 likes'});
      closeCreate();window.toast&&toast('Post added');return;
    }
    if(k==='dis'){
      const t=$('cName').value.trim()||'New discussion';
      window.addPlaceholderItem&&addPlaceholderItem('dis',{t,text:$('cBody').value.trim()||undefined,meta:'0 replies · Just now'});
      closeCreate();window.toast&&toast('Discussion started');return;
    }
    const t=$('cName').value.trim()||'New resource';
    const kind=$('cType').value;
    window.addPlaceholderItem&&addPlaceholderItem('res',{t,kind,text:$('cBody').value.trim()||undefined,meta:(kind==='file'?'File':'Link')+' · Just now'});
    closeCreate();window.toast&&toast('Resource added');
  };
}
function openCreateForm(k){
  const meta=CREATE_META[k]||CREATE_META.sub;
  openCreatePanel(meta.title,createFormHTML(k),()=>openCreatePicker());
  wireCreateForm(k);
  if(k==='sub'){
    const pathEl=$('cPath');
    if(pathEl){requestAnimationFrame(()=>{pathEl.scrollTop=pathEl.scrollHeight})}
  } else {
    const focusEl=$('cName')||$('cBody');focusEl&&setTimeout(()=>focusEl.focus(),50);
  }
}
function openCreatePicker(){
  openCreatePanel('Create',createPickerHTML(),null);
  $('asBody').querySelectorAll('.ctyp').forEach(b=>b.onclick=e=>{e.stopPropagation();openCreateForm(b.dataset.k)});
}

// ---- top-left context switch (Modern Hippie / Follow / Personal)
const CTX=[{id:'mh',label:'Modern Hippie',kind:'mh'},{id:'follow',label:'Follow',kind:'ic',ic:'users'},{id:'personal',label:'Personal',kind:'ic',ic:'user'}];
function readCtx(){
  const q=new URLSearchParams(location.search).get('ctx');
  if(q&&['mh','follow','personal'].includes(q)){try{sessionStorage.setItem('mh.context',q)}catch(e){}return q}
  try{const s=sessionStorage.getItem('mh.context');if(s&&['mh','follow','personal'].includes(s))return s}catch(e){}
  return 'mh';
}
let curCtx=readCtx();
window.MH_CONTEXT=curCtx;
const cwrap=$('cwrap'),cfab=$('cfab');
function paintCtxFab(){
  const meta=CTX.find(c=>c.id===curCtx)||CTX[0];
  const mark=$('cfabMark'),ic=$('cfabIc');
  if(meta.kind==='mh'){mark.hidden=false;ic.hidden=true;ic.setAttribute('hidden','');mark.removeAttribute('hidden');mark.textContent='MH';ic.innerHTML=''}
  else{mark.hidden=true;mark.setAttribute('hidden','');ic.hidden=false;ic.removeAttribute('hidden');ic.dataset.ic=meta.ic;delete ic.dataset.done;paintIcons(cfab)}
  cfab.setAttribute('aria-label',meta.label);cfab.dataset.tip=meta.label;
  const alts=CTX.filter(c=>c.id!==curCtx);
  cwrap.querySelectorAll('.cmini').forEach(b=>{
    const i=alts.findIndex(c=>c.id===b.dataset.ctx);
    const show=i>=0;
    b.hidden=!show;b.classList.toggle('on',false);
    b.classList.remove('c1','c2','c3');
    if(show)b.classList.add(i===0?'c1':'c2');
  });
}
function openCtx(){closeMenu();closeLeft();closeTop();closeVote();closeCreate(true);cwrap.classList.add('open');catcher.classList.add('on');paintCtxFab()}
function closeCtx(){if(!cwrap)return;cwrap.classList.remove('open');syncCatcher()}
function switchCtx(id){
  if(!CTX.some(c=>c.id===id))return;
  try{sessionStorage.setItem('mh.context',id)}catch(e){}
  const u=new URL(location.href);
  if(id==='mh')u.searchParams.delete('ctx');else u.searchParams.set('ctx',id);
  // keep hash
  location.href=u.pathname+u.search+u.hash;
}
cwrap.addEventListener('click',e=>e.stopPropagation());
cfab.addEventListener('click',()=>{cwrap.classList.contains('open')?closeCtx():openCtx()});
cwrap.querySelectorAll('.cmini').forEach(b=>b.onclick=e=>{e.stopPropagation();const id=b.dataset.ctx;if(id===curCtx)return closeCtx();switchCtx(id)});
paintCtxFab();
document.body.dataset.ctx=curCtx;

const lwrap=$('lwrap'),lfab=$('lfab'),cres=$('cres');
const PATH=(window.TOPIC_PATH&&window.TOPIC_PATH.length)?window.TOPIC_PATH:['Modern Hippie'];
const ctxQS=()=>{const c=window.MH_CONTEXT||'mh';return c&&c!=='mh'?'&ctx='+encodeURIComponent(c):''};
const hrefFor=i=>{
  if(i==0)return 'home7.html'+(curCtx&&curCtx!=='mh'?'?ctx='+encodeURIComponent(curCtx):'');
  return 'subtopic3.html?t='+encodeURIComponent(PATH[i])+'&path='+encodeURIComponent(PATH.slice(0,i+1).join('>'))+ctxQS();
};
function openLeft(){closeMenu();closeTop();closeCtx();closeVote();closeCreate(true);lwrap.classList.add('open');catcher.classList.add('on');setIc('plus','lfabIc');lfab.setAttribute('aria-label','Create');lfab.dataset.tip='Create'}
function closeLeft(){if(!lwrap)return;lwrap.classList.remove('open');syncCatcher();setIc('menu','lfabIc');lfab.setAttribute('aria-label','Menu');lfab.dataset.tip='Menu';cres.classList.remove('on')}
lwrap.addEventListener('click',e=>e.stopPropagation());
lfab.addEventListener('click',()=>{if(!lwrap.classList.contains('open'))return openLeft();openCreatePicker()});
$('lX').onclick=closeLeft;
window.hasParent=PATH.length>1;
window.parentHref=PATH.length>1?hrefFor(PATH.length-2):null;
const pp=$('pathPop'),pl=$('pathList');
pl.innerHTML=PATH.map((n,i)=>`<a class="prow${i==PATH.length-1?' cur':''}${i==0?' root':''}" href="${hrefFor(i)}"><span class="pdot"></span><span class="pname">${n}</span><span class="plev">${i==0?'Root':i==PATH.length-1?'You are here':'Level '+i}</span></a>`).join('');
$('pathDepth').textContent=PATH.length==1?'Top level':PATH.length+' levels';
$('pathNote').textContent=PATH.length>1?'Swipe right to go back one level':'You are at the top level';
$('lRoot').onclick=()=>{closeLeft();pp.classList.add('on');pl.scrollTop=pl.scrollHeight};
$('pathDone').onclick=()=>pp.classList.remove('on');
pp.addEventListener('click',e=>{e.stopPropagation();if(e.target.id=='pathPop')pp.classList.remove('on')});
window.openPath=()=>{pp.classList.add('on');pl.scrollTop=pl.scrollHeight};
window.pathPop=pp;
if(location.hash=='#path'){openPath();history.replaceState(null,'',location.pathname+location.search)}
syncSearchPh();
})();
