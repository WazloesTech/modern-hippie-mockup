// Shared topic title pill + info card + report pop-up. Used by home7 and subtopic3.
// Page markup needs: <button class="titlebtn" id="tbtn"><span id="tt"></span></button>
// Then call initTopic({title:'Mind', back:'subtopic3.html?t=Mind'}).
function initTopic(opt){
const T=opt.title;
document.body.insertAdjacentHTML('beforeend',`<div class="pop" id="info"><div class="card" role="dialog" aria-label="Topic info">
  <div class="ihead"><div class="ititle" id="it">Mind</div><div class="iacts"><button class="icbtn" id="sEditBtn" aria-label="Edit" data-tip="Edit" data-tip-side="b" hidden><i data-ic="pencil"></i></button><button class="icbtn" id="sDelBtn" aria-label="Delete" data-tip="Delete" data-tip-side="b" hidden><i data-ic="trash-2"></i></button><button class="icbtn" id="flagBtn" aria-label="Report" data-tip="Report" data-tip-side="b"><i data-ic="flag"></i></button></div></div>
  <div class="ibody"><button class="ph" id="img" aria-label="Open images">image</button>
  <p id="idesc">What this topic covers, who it is for, and why it matters. Members write this summary together and vote for the best version. Start with the top subtopics, then ask questions in the feed. <a href="#" id="more">See more</a></p></div>
  <div class="acts"><button class="icbtn tog" data-g="ld" aria-label="Like"><i data-ic="thumbs-up"></i></button><button class="icbtn tog" data-g="ld" aria-label="Dislike"><i data-ic="thumbs-down"></i></button><button class="icbtn tog" aria-label="Save"><i data-ic="bookmark"></i></button></div>
  <div class="lab">Difficulty <span id="dv"></span></div>
  <div class="bars" id="bars"></div>
  <div class="bands"><span>Basic</span><span>Intermediate</span><span>Hard</span><span>Advanced</span></div>
  <div class="lab">Importance <span id="iv"></span></div>
  <div class="ruler" id="rImp"><div class="base"></div></div>
  <div class="bands rb"><span>Extra</span><span>Useful</span><span>Core</span><span>Essential</span></div>
  <div class="lab">Political <span id="pv"></span></div>
  <div class="ruler" id="rPol"><div class="base"></div></div>
  <div class="bands rb"><span>Not political</span><span>Slightly</span><span>Political</span><span>Very political</span></div>
  <div class="btns" style="margin-top:4px"><button class="pri" id="done">Done</button></div>
</div></div>

<div class="pop" id="report" style="z-index:60"><div class="card" role="dialog" aria-label="Report">
  <div id="rform"><h3>Report this topic</h3><p class="hint">Why is it inappropriate?</p>
  <label class="radio"><input type="radio" name="why" value="Spam">Spam</label><label class="radio"><input type="radio" name="why" value="Harassment or bullying">Harassment or bullying</label><label class="radio"><input type="radio" name="why" value="Hate speech">Hate speech</label><label class="radio"><input type="radio" name="why" value="Violence or dangerous content">Violence or dangerous content</label><label class="radio"><input type="radio" name="why" value="Sexual or explicit content">Sexual or explicit content</label><label class="radio"><input type="radio" name="why" value="Misinformation">Misinformation</label><label class="radio"><input type="radio" name="why" value="Illegal content">Illegal content</label><label class="radio"><input type="radio" name="why" value="Off-topic or wrong place">Off-topic or wrong place</label><label class="radio"><input type="radio" name="why" value="Other">Other</label>
  <textarea id="other" placeholder="Tell us more"></textarea>
  <div class="btns"><button id="rCancel">Cancel</button><button class="pri" id="rSend" disabled>Report</button></div></div>
  <div id="rdone" style="display:none"><h3>Thanks</h3><p class="sent">Your report was sent. Our team will review it.</p><div class="btns"><button class="pri" id="rOk">OK</button></div></div>
</div></div>`);
if(window.paintIcons)paintIcons();
const $=id=>document.getElementById(id);
$('tt').textContent=T;$('it').textContent=T;document.title=T;
const q=()=>'t='+encodeURIComponent(T)+'&from='+encodeURIComponent(opt.back);
function fit(){const b=$('tbtn'),t=$('tt');let f=26;t.style.fontSize=f+'px';while(t.scrollWidth>b.clientWidth-32&&f>11){f--;t.style.fontSize=f+'px'}}
function fitTitle(){const t=$('it');let f=22;const ok=()=>t.scrollWidth<=t.clientWidth+1&&t.scrollHeight<=Math.ceil(f*1.2*2)+2;t.style.fontSize=f+'px';while(!ok()&&f>12){f--;t.style.fontSize=f+'px'}}
// info card
function openInfo(){$('info').classList.add('on');fitTitle()}
$('tbtn').onclick=openInfo;$('done').onclick=()=>$('info').classList.remove('on');
$('info').addEventListener('click',e=>{if(e.target.id=='info')$('info').classList.remove('on')});
$('img').onclick=()=>location.href='image3.html?'+q();
$('more').onclick=e=>{e.preventDefault();location.href='description3.html?'+q()};
document.querySelectorAll('.tog').forEach(b=>b.onclick=()=>{const on=!b.classList.contains('on');if(b.dataset.g)document.querySelectorAll('[data-g='+b.dataset.g+']').forEach(x=>x.classList.remove('on'));b.classList.toggle('on',on)});
// pointer drag helper
function draggable(el,set){const val=e=>{const r=el.getBoundingClientRect();return Math.min(16,Math.max(1,Math.round((e.clientX-r.left)/r.width*15)+1))};
el.addEventListener('pointerdown',e=>{el.setPointerCapture(e.pointerId);el.classList.add('drag');set(val(e))});
el.addEventListener('pointermove',e=>{if(el.hasPointerCapture(e.pointerId))set(val(e))});
['pointerup','pointercancel'].forEach(t=>el.addEventListener(t,()=>el.classList.remove('drag')));}
const cols=['#6f9a5b','#c9a646','#d07a3a','#b5473a'],band=(arr,v)=>arr[Math.floor((v-1)/4)];
const bars=$('bars');for(let i=1;i<=16;i++){const b=document.createElement('i');b.style.background=cols[Math.floor((i-1)/4)];b.style.height=(10+i*1.25)+'px';bars.appendChild(b)}
function setD(v){[...bars.children].forEach((b,i)=>b.classList.toggle('on',i<v));$('dv').textContent=band(['Basic','Intermediate','Hard','Advanced'],v)+' '+v+'/16'}
// bars: map pointer x to the bar under it
const barVal=e=>{const r=bars.getBoundingClientRect();return Math.min(16,Math.max(1,Math.floor((e.clientX-r.left)/r.width*16)+1))};
bars.addEventListener('pointerdown',e=>{bars.setPointerCapture(e.pointerId);setD(barVal(e))});
bars.addEventListener('pointermove',e=>{if(bars.hasPointerCapture(e.pointerId))setD(barVal(e))});
function ruler(id,labId,names,start){const r=$(id);for(let i=0;i<16;i++){const t=document.createElement('div');t.className='t'+(i%4==0||i==15?' big':'');t.style.left=(i/15*100)+'%';r.appendChild(t)}
const k=document.createElement('div');k.className='knob';r.appendChild(k);
const set=v=>{k.style.left=((v-1)/15*100)+'%';$(labId).textContent=band(names,v)+' '+v+'/16'};draggable(r,set);set(start)}
setD(6);ruler('rImp','iv',['Extra','Useful','Core','Essential'],10);ruler('rPol','pv',['Not political','Slightly','Political','Very political'],3);
// report
const rp=$('report');
$('flagBtn').onclick=()=>{$('rform').style.display='';$('rdone').style.display='none';rp.classList.add('on')};
rp.querySelectorAll('input[name=why]').forEach(r=>r.onchange=()=>{$('rSend').disabled=false;$('other').classList.toggle('on',r.value=='Other'&&r.checked);if(r.value=='Other')$('other').focus()});
const closeR=()=>{rp.classList.remove('on');rp.querySelectorAll('input').forEach(x=>x.checked=false);$('other').classList.remove('on');$('rSend').disabled=true};
$('rCancel').onclick=closeR;$('rOk').onclick=closeR;rp.addEventListener('click',e=>{if(e.target.id=='report')closeR()});
$('rSend').onclick=()=>{$('rform').style.display='none';$('rdone').style.display=''};
// edit / delete this subtopic (not the home page or the six focuses)
const path=()=>window.TOPIC_PATH||['Modern Hippie'];
const canEdit=()=>path().length>2;
$('sEditBtn').hidden=$('sDelBtn').hidden=!canEdit();
const escH=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
$('sEditBtn').onclick=()=>{if(!window.MHOwner)return;
  const cur=path()[path().length-1];
  MHOwner.form({title:'Edit subtopic',id:'editSub',html:
    `<label class="cfield"><span>Name</span><input id="eSubN" maxlength="60" value="${escH(cur)}"></label>`+
    `<label class="cfield"><span>Short description</span><textarea id="eSubD" rows="4">${escH($('idesc').firstChild.textContent.trim())}</textarea></label>`,
    onOk(){const v=$('eSubN').value.trim();if(!v)return false;
      const p=path();p[p.length-1]=v;$('tt').textContent=v;$('it').textContent=v;document.title=v;fit();fitTitle();
      $('idesc').firstChild.textContent=$('eSubD').value.trim()+' ';MHOwner.toast('Subtopic updated')}});
};
$('sDelBtn').onclick=()=>{if(!window.MHOwner)return;
  const p=path(),cur=p[p.length-1],parent=p[p.length-2],kids=(window.SUB_ITEMS||[]).length;
  MHOwner.confirm({title:'Delete “'+cur+'”?',id:'delSub',ok:'Delete',
    text:kids?`Its ${kids} subtopics will move up to <b>${escH(parent)}</b>. They are not deleted.`:`It has no subtopics. You will go back to <b>${escH(parent)}</b>.`,
    note:'You can’t undo this.',
    onOk(){MHOwner.flash(kids?`${cur} deleted. Its subtopics moved to ${parent}.`:`${cur} deleted.`);location.href=window.parentHref||'home7.html'}});
};
fit();
if(location.hash=='#info')openInfo();
if(location.hash=='#report'){openInfo();$('flagBtn').click()}

}
