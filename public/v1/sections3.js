// Shared sections (Subtopics / Feed / Community / Resources): data, the four views, add rows, section switching.
(function(){
const names={sub:'Subtopics',feed:'Feed',people:'Community',res:'Resources'};
const adds={sub:'Add a subtopic',feed:'Write a post',res:'Add a resource'};
const VIEWS=['list','compact','post','full'];
const main=document.querySelector('main');
const LOREM=['A short summary from members about what this covers and who it helps. Most people start here.',
 'Members say this is a good first step. It is easy to follow and takes a few minutes a day.',
 'Simple ideas you can try this week. Read the top comments for tips from people who tried them.'];
const subs=(window.SUB_ITEMS||[]).map((x,i)=>({t:x.t,chips:x.c,href:x.h,text:LOREM[i%3]}));
const from=subs.map(s=>s.t);const src=i=>from.length?from[i%from.length]:'this topic';
const mk=(k,rows)=>rows.map((x,i)=>{
  const type=x[2]||'';
  const video=type==='video';
  return {t:x[0],meta:x[1],tag:'from '+src(i+1),text:LOREM[(i+1)%3],chips:[x[1]],video,type:type||undefined,kind:x[3]||'',by:x[4]||FOLKS[(i+4)%FOLKS.length]};
});
const FOLKS=['@river','@sage','@juniper','@ash','@wren','@cedar','@moss','@fern'];
const PEOPLE_META=['Joined · 2y','Active · 3h','Joined · 8mo','Active · 1d','Joined · 1y','Active · 12m','Joined · 4mo','Active · 2d'];
const BIOS=['I help people build calm morning habits.','Runner and new dad. Learning to cook.','Yoga teacher. I read a lot.','I run a small bakery in my town.','Mother of three. We garden together.','I organise neighbourhood clean-ups.','Learning to meditate, one day at a time.','Hiking every weekend, rain or shine.'];
const PODS=[['Morning movers',8,'Body'],['Calm minds',12,'Mind'],['Small business circle',6,'Business'],['Young parents',10,'Family'],['Soul readers',7,'Soul'],['Neighbourhood gardeners',9,'Community']]
  .map(([t,n,f])=>({t,meta:n+' members',tag:'',text:'A small group that meets online each week.',chips:[f],kind:'pod',members:n,focus:f}));
let podTab=new URLSearchParams(location.search).get('tab')==='pods'?'pods':'people';
const PEOPLE_CHIPS=[['Guide','Mind'],['Member','Body'],['Host','Soul'],['Member','Business'],['Guide','Family'],['Member','Community'],['Host','Mind'],['Member','Body']];
const DATA={sub:subs,
 feed:mk('feed',[
   ['Example video post: a two-minute morning routine','1h · 46 likes · 12 comments','video',,'@you'],
   ['Example photo post: a short update with a photo','2h · 14 likes · 5 comments','photo'],
   ['Example written post: what worked for me this week','5h · 31 likes · 18 comments','written'],
   ['Example photo post: a question for the group','1d · 8 likes · 3 comments','photo'],
   ['Example written post: a small win to share','2d · 22 likes · 9 comments','written']
 ]),
 people:FOLKS.map((h,i)=>({t:h,meta:PEOPLE_META[i],tag:'',text:BIOS[i],chips:PEOPLE_CHIPS[i],kind:'person',type:undefined,video:false})),
 res:mk('res',[['Example resource: a beginner guide','Article · 8 min read',,'link','@you'],['Example resource: a recommended book','Book · 240 pages',,'file'],['Example resource: a short video course','Video · 45 min',,'link'],['Example resource: a printable checklist','PDF · 2 pages',,'file']])};
const GLOBAL_TAKEN=['Modern Hippie','Body','Mind','Soul','Business','Family','Community','Focus and attention','Sleep','Learning new skills','Calm under stress','Habits','Running','Fitness'];
const CTX_ID=(()=>{const q=new URLSearchParams(location.search).get('ctx');if(q&&['mh','follow','personal'].includes(q))return q;try{const s=sessionStorage.getItem('mh.context');if(s&&['mh','follow','personal'].includes(s))return s}catch(e){}return window.MH_CONTEXT||'mh'})();
window.MH_CONTEXT=window.MH_CONTEXT||CTX_ID;
function flavorChips(base,i){
  if(CTX_ID==='follow')return ['From '+FOLKS[i%FOLKS.length],'Following'].concat((base||[]).slice(0,1));
  if(CTX_ID==='personal')return [i%2?'Saved':'Created by you'].concat((base||[]).filter(c=>!/members/i.test(c)).slice(0,2));
  return base||[];
}
function flavorTag(tag,i){
  if(CTX_ID==='follow')return 'from '+FOLKS[i%FOLKS.length];
  if(CTX_ID==='personal')return i%2?'saved by you':'created by you';
  return tag;
}
function flavorMeta(meta,i){
  if(CTX_ID==='follow')return (meta||'')+' · following';
  if(CTX_ID==='personal')return (meta||'')+' · yours';
  return meta;
}
DATA.sub=DATA.sub.map((x,i)=>({...x,chips:flavorChips(x.chips,i)}));
['feed','people','res'].forEach(k=>{DATA[k]=DATA[k].map((x,i)=>({...x,tag:flavorTag(x.tag,i),meta:flavorMeta(x.meta,i),chips:flavorChips(x.chips,i)}))});
const key=k=>'mh.view.'+k;
// ?view=list|compact|post sets the view for this page load only (used by the flow map); nothing is saved
let VQ=new URLSearchParams(location.search).get('view');if(!['list','compact','post'].includes(VQ))VQ=null;
const viewOf=k=>{if(VQ)return VQ;const v=localStorage.getItem(key(k));if(v==='full')return 'compact';return ['list','compact','post'].includes(v)?v:'compact'};
let cur='sub',filterQ='';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const chips=a=>`<div class="chips">${(a||[]).map(c=>`<span>${esc(c)}</span>`).join('')}</div>`;
const num=(k,i)=>k=='sub'?`<div class="num"><button onclick="openVote(this,event)">${i+1}</button></div>`:`<div class="num"><span class="nstat">${i+1}</span></div>`;
const vtile=(cls='')=>`<div class="vtile ${cls}"><i data-ic="video"></i><span>Video</span></div>`;
const typeChip=t=>t?`<span class="typechip">${esc(t)}</span>`:'';
const feedType=x=>x.type||(x.video?'video':'written');
const tabs='<div class="tabs"><span class="on">Trending</span><span>For you</span><span>Top</span></div>';
// Community: People / Pods tabs
const ptabs=()=>`<div class="tabs ctabs" role="tablist">${[['people','People'],['pods','Pods']].map(([k,l])=>`<span role="tab" tabindex="0" data-tab="${k}" aria-selected="${podTab===k}"${podTab===k?' class="on"':''}>${l}</span>`).join('')}</div>`;
const items=k=>k==='people'&&podTab==='pods'?PODS:DATA[k];
function detailHref(k,i,x){
  const t=encodeURIComponent(x.t);
  const ctxQ=(window.MH_CONTEXT&&window.MH_CONTEXT!=='mh')?'&ctx='+encodeURIComponent(window.MH_CONTEXT):'';
  const from=encodeURIComponent(location.pathname.split('/').pop()+location.search+(location.hash||'#'+k));
  const byQ=x.by?'&by='+encodeURIComponent(x.by):'';
  if(x.kind==='pod')return `pod-detail.html?t=${t}&n=${x.members}&f=${encodeURIComponent(x.focus)}&from=${from}`;
  if(k==='people')return `people-detail.html?t=${t}&from=${from}`;
  if(k==='res')return `resource-detail.html?t=${t}&type=${encodeURIComponent(x.kind||'link')}${byQ}&from=${from}`;
  if(k==='feed'){
    const ty=feedType(x);
    return `feed-detail.html?t=${t}&type=${encodeURIComponent(ty)}${ty==='video'?'&video=1':''}${byQ}&from=${from}`;
  }
  return '';
}
function mediaHTML(k,x,v){
  if(k!=='feed'&&k!=='people'){
    if(x.video)return vtile(v==='post'?'pimg':(v==='full'?'fsbg vfs':'vsm'));
    if(v==='post')return `<div class="ph pimg">photo${k=='sub'?`<span class="pnum">${num(k,0)}</span>`:''}</div>`;
    return '';
  }
  if(k==='people'){
    if(v==='post')return `<div class="ph pimg"><i data-ic="${x.kind==='pod'?'users':'user'}"></i></div>`;
    if(v==='compact')return '';
    return '';
  }
  const ty=feedType(x);
  if(ty==='video')return vtile(v==='post'?'pimg':(v==='full'?'fsbg vfs':(v==='compact'?'vsm':'')));
  if(ty==='photo'){
    if(v==='list')return '';
    if(v==='compact')return `<div class="ph phsm">photo</div>`;
    if(v==='post')return `<div class="ph pimg">photo</div>`;
    return `<div class="fsbg">image</div>`;
  }
  // written: no media tile; tiny cue in list/compact
  return '';
}
function itemHTML(k,x,i,v){
  const d=`data-i="${i}"`;
  const ty=k==='feed'?feedType(x):'';
  if(v=='list'){
    const cue=k==='feed'?(ty==='video'?'<i class="lvid" data-ic="video"></i>':typeChip(ty)):(x.video?'<i class="lvid" data-ic="video"></i>':'');
    return `<div class="lrow" ${d}>${num(k,i)}<span class="lt">${esc(x.t)}</span>${cue}<span class="chev">&#8250;</span></div>`;
  }
  if(v=='compact'){
    if(k=='sub')return `<div class="row" ${d}>${num(k,i)}<div class="ph">photo</div><div class="rinfo"><b>${esc(x.t)}</b>${chips(x.chips)}</div></div>`;
    if(k==='people')return `<div class="row" ${d}><div class="ph phav"><i data-ic="${x.kind==='pod'?'users':'user'}"></i></div><div class="rinfo"><b>${esc(x.t)}</b><span class="meta">${esc(x.meta)}</span>${chips(x.chips)}</div></div>`;
    const media=mediaHTML(k,x,v);
    const cue=k==='feed'&&ty!=='video'?typeChip(ty):'';
    return `<div class="item" ${d}><span class="tag">${esc(x.tag)}</span>${esc(x.t)}${cue}${media}<span class="meta">${esc(x.meta)}</span></div>`;
  }
  if(v=='post'){
    const media=k==='feed'?mediaHTML(k,x,v):(x.video?vtile('pimg'):`<div class="ph pimg">${k==='people'?'':'photo'}${k=='sub'?`<span class="pnum">${num(k,i)}</span>`:''}${k==='people'?`<i data-ic="${x.kind==='pod'?'users':'user'}"></i>`:''}</div>`);
    return `<article class="pcard" ${d}>${media}
    ${x.tag?`<span class="tag">${esc(x.tag)}</span>`:''}${k==='feed'?typeChip(ty):''}<h4>${esc(x.t)}</h4><p>${esc(x.text)}</p>${chips(x.chips)}</article>`;
  }
  const bg=k==='feed'?(ty==='video'?vtile('fsbg vfs'):(ty==='photo'?'<div class="fsbg">image</div>':'<div class="fsbg fswritten">written</div>')):(x.video?vtile('fsbg vfs'):'<div class="fsbg">image</div>');
  return `<div class="fsi" ${d}>${bg}<div class="fsgrad"></div>
    <div class="fsact"><button aria-label="Like"><i data-ic="thumbs-up"></i></button><small>${120+i*37}</small><button aria-label="Save"><i data-ic="bookmark"></i></button><small>Save</small><button aria-label="Comments"><i data-ic="message-circle"></i></button><small>${8+i*5}</small></div>
    <div class="fstext">${x.tag?`<span class="fstag">${esc(x.tag)}</span>`:`<span class="fstag">#${i+1} in ${names[k]}</span>`}<h3>${esc(x.t)}</h3><p>${esc(x.text)}</p>${chips(x.chips)}</div></div>`;
}
function visibleItems(k){
  const q=filterQ.trim().toLowerCase();
  const list=items(k);
  if(!q)return list.map((x,i)=>({x,i}));
  return list.map((x,i)=>({x,i})).filter(({x})=>x.t.toLowerCase().includes(q)||(x.text||'').toLowerCase().includes(q)||(x.meta||'').toLowerCase().includes(q));
}
function render(k){
  const s=document.getElementById(k);if(!s)return;const v=viewOf(k),vis=visibleItems(k);
  s.dataset.view=v;
  if(v=='full'){
    s.innerHTML=`<div class="fs" id="fs-${k}"><div class="fshead">${names[k]}<span class="sep">·</span><span id="fsn-${k}">1 / ${vis.length||1}</span></div>${vis.length?vis.map(({x,i})=>itemHTML(k,x,i,v)).join(''):'<p class="emptyq">No matches in this section</p>'}</div>`;
    const fs=s.querySelector('.fs');if(fs&&vis.length)fs.addEventListener('scroll',()=>{const n=Math.round(fs.scrollTop/fs.clientHeight)+1;document.getElementById('fsn-'+k).textContent=n+' / '+vis.length},{passive:true});
  } else s.innerHTML=(k=='sub'?'':k==='people'?ptabs():tabs)+`<div class="vlist v-${v}">`+(vis.length?vis.map(({x,i})=>itemHTML(k,x,i,v)).join(''):'<p class="emptyq">No matches in this section</p>')+'</div>';
  if(window.paintIcons)paintIcons(s);
  syncBody();
}
function syncBody(){const full=viewOf(cur)=='full';if(full&&!document.body.classList.contains('fs-on'))scrollTo(0,0);document.body.classList.toggle('fs-on',full)}
for(const k of Object.keys(names)){if(!document.getElementById(k)){const s=document.createElement('section');s.id=k;main.appendChild(s)}render(k)}
// clicks: item navigation
main.addEventListener('click',e=>{
  if(e.target.closest('.num,.fsact'))return;
  const tb=e.target.closest('.ctabs [data-tab]');
  if(tb){podTab=tb.dataset.tab;const u=new URL(location.href);if(podTab==='pods')u.searchParams.set('tab','pods');else u.searchParams.delete('tab');history.replaceState(null,'',u.pathname+u.search+u.hash);render('people');if(window.onSectionChange)window.onSectionChange(cur);return}
  const it=e.target.closest('[data-i]');if(!it)return;const k=it.closest('section').id,x=items(k)[+it.dataset.i];
  if(k=='sub'){const ctx=(window.MH_CONTEXT&&window.MH_CONTEXT!=='mh')?'&ctx='+encodeURIComponent(window.MH_CONTEXT):'';let base=x.href||('subtopic3.html?t='+encodeURIComponent(x.t)+'&path='+encodeURIComponent([...(window.TOPIC_PATH||['Modern Hippie']),x.t].join('>')));if(ctx&&!base.includes('ctx='))base+=ctx;location.href=base}
  else{const href=detailHref(k,+it.dataset.i,x);if(href)location.href=href;else toast('Open: coming soon')}
});
main.addEventListener('click',e=>{const b=e.target.closest('.fsact button');if(b){e.stopPropagation();b.classList.toggle('on')}},true);
let tt;function toast(t){let el=document.getElementById('toast');if(!el){el=document.createElement('div');el.id='toast';el.className='toast';document.body.appendChild(el)}
 el.textContent=t;el.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>el.classList.remove('on'),1800)}
function show(s){cur=s;document.getElementById('toast')?.classList.remove('on');document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('on',b.dataset.s==s));document.querySelectorAll('main section').forEach(x=>x.classList.toggle('on',x.id==s));syncBody();if(window.onSectionChange)window.onSectionChange(s)}
document.querySelectorAll('.nav button').forEach(b=>b.onclick=()=>show(b.dataset.s));
const h=location.hash.slice(1);show(names[h]?h:'sub');
// a section hash (#feed, #people…) should not scroll the page down to the section
if(names[h])addEventListener('load',()=>{if(scrollY>0)scrollTo(0,0)});
// one-time message from the page before (e.g. "Post deleted"): remove that item here too
try{const f=JSON.parse(sessionStorage.getItem('mh.flash')||'null');
  if(f){sessionStorage.removeItem('mh.flash');
    if(f.k&&DATA[f.k]){DATA[f.k]=DATA[f.k].filter(x=>x.t!==f.t);render(f.k);show(f.k)}
    setTimeout(()=>toast(f.msg),300)}}catch(e){}
window.showSection=show;
window.getView=()=>viewOf(cur);
window.setView=v=>{if(v==='full'||v==='video'){if(window.toast)toast('Full screen coming soon');return}if(!['list','compact','post'].includes(v))return;if(VQ)VQ=v;else localStorage.setItem(key(cur),v);render(cur)};
window.currentSection=()=>cur;
window.sectionLabel=()=>names[cur];
window.sectionSearchNoun=()=>({sub:'subtopics',feed:'posts',people:podTab==='pods'?'pods':'people',res:'resources'}[cur]||'items');
window.toast=toast;
window.filterSection=q=>{filterQ=q||'';render(cur);return visibleItems(cur).map(({x})=>({t:x.t,meta:x.meta||'',video:!!x.video,type:x.type||''}))};
window.clearSectionFilter=()=>{filterQ='';render(cur)};
window.getSectionMatches=q=>{
  const qq=(q||'').trim().toLowerCase();
  return items(cur).filter(x=>!qq||x.t.toLowerCase().includes(qq)||(x.text||'').toLowerCase().includes(qq)||(x.meta||'').toLowerCase().includes(qq));
};
window.addPlaceholderItem=(k,item)=>{
  const type=item.type||(item.video?'video':'');
  const row={t:item.t,meta:item.meta||'Just now',tag:item.tag||'from you',text:item.text||LOREM[0],chips:item.chips||['New'],video:!!item.video||type==='video',type:type||undefined,kind:item.kind||'',href:item.href||'',by:'@you'};
  DATA[k].unshift(row);if(k==='sub')GLOBAL_TAKEN.push(item.t);filterQ='';render(k);show(k);return row;
};
window.isSubtopicTaken=name=>{
  const n=(name||'').trim().toLowerCase();
  if(!n)return false;
  const taken=new Set([...GLOBAL_TAKEN,...DATA.sub.map(x=>x.t)].map(s=>s.toLowerCase()));
  return taken.has(n);
};
window.CREATE_TYPES=[
  {k:'sub',label:'New subtopic',ic:'git-fork'},
  {k:'feed',label:'Write a post',ic:'image-plus'},
  {k:'res',label:'Add a resource',ic:'bookmark'}
];
})();
