// Shared owner tools for detail pages: '…' owner menu (icon-only, hover labels on desktop),
// frosted confirm / form pop-ups, and a one-time toast carried to the next page.
(function(){
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let tt;
function toast(t){let el=document.getElementById('toast');if(!el){el=document.createElement('div');el.id='toast';el.className='toast';document.body.appendChild(el)}
  el.textContent=t;el.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>el.classList.remove('on'),2200)}
if(!window.toast)window.toast=toast;
// owner menu: '…' opens pencil + trash next to it
function menu(mount,{onEdit,onDelete,editTip,deleteTip}){
  const w=document.createElement('div');w.className='omenu';
  w.innerHTML=`<button type="button" class="icbtn oact" id="oEdit" aria-label="${esc(editTip||'Edit')}" data-tip="${esc(editTip||'Edit')}" data-tip-side="b" hidden><i data-ic="pencil"></i></button>`+
    `<button type="button" class="icbtn oact" id="oDel" aria-label="${esc(deleteTip||'Delete')}" data-tip="${esc(deleteTip||'Delete')}" data-tip-side="b" hidden><i data-ic="trash-2"></i></button>`+
    `<button type="button" class="icbtn" id="oMore" aria-label="More" aria-expanded="false" data-tip="More" data-tip-side="b"><i data-ic="ellipsis"></i></button>`;
  mount.appendChild(w);if(window.paintIcons)paintIcons(w);
  const more=w.querySelector('#oMore'),acts=w.querySelectorAll('.oact');
  const set=o=>{acts.forEach(a=>a.hidden=!o);more.classList.toggle('on',o);more.setAttribute('aria-expanded',o)};
  more.onclick=e=>{e.stopPropagation();set(more.getAttribute('aria-expanded')!=='true')};
  w.querySelector('#oEdit').onclick=e=>{e.stopPropagation();set(false);onEdit&&onEdit()};
  w.querySelector('#oDel').onclick=e=>{e.stopPropagation();set(false);onDelete&&onDelete()};
  document.addEventListener('click',e=>{if(!w.contains(e.target))set(false)});
  return {open:()=>set(true),close:()=>set(false)};
}
// frosted pop-up (same .pop/.card as Report): content is centred on the glass
function pop(id,inner){
  let p=document.getElementById(id);if(p)p.remove();
  p=document.createElement('div');p.className='pop on';p.id=id;p.style.zIndex=60;
  p.innerHTML=`<div class="card" role="dialog" aria-modal="true">${inner}</div>`;
  document.body.appendChild(p);if(window.paintIcons)paintIcons(p);
  p.addEventListener('click',e=>{if(e.target===p)p.remove()});
  return p;
}
function confirm({title,text,note,ok,onOk,id}){
  const p=pop(id||'confirmPop',`<h3>${esc(title)}</h3><p class="dbody">${text}</p>${note?`<p class="asnote">${note}</p>`:''}<div class="btns"><button type="button" class="pcancel">Cancel</button><button type="button" class="pri pok">${esc(ok||'Delete')}</button></div>`);
  p.querySelector('.pcancel').onclick=()=>p.remove();
  p.querySelector('.pok').onclick=()=>{p.remove();onOk&&onOk()};
  return p;
}
function form({title,html,ok,onOk,id}){
  const p=pop(id||'formPop',`<h3>${esc(title)}</h3><div class="cform">${html}</div><div class="btns"><button type="button" class="pcancel">Cancel</button><button type="button" class="pri pok">${esc(ok||'Save')}</button></div>`);
  p.querySelector('.pcancel').onclick=()=>p.remove();
  p.querySelector('.pok').onclick=()=>{if(onOk&&onOk(p)===false)return;p.remove()};
  return p;
}
// one-time message for the next page (e.g. after a delete)
function flash(msg,extra){try{sessionStorage.setItem('mh.flash',JSON.stringify({msg,...(extra||{})}))}catch(e){}}
function takeFlash(){try{const v=sessionStorage.getItem('mh.flash');if(!v)return null;sessionStorage.removeItem('mh.flash');return JSON.parse(v)}catch(e){return null}}
// scroll the page so an element is in view (also works inside flow-map frames)
function reveal(el,offset){if(!el)return;const y=el.getBoundingClientRect().top+scrollY-(offset==null?140:offset);scrollTo(0,Math.max(0,y))}
window.MHOwner={menu,confirm,form,flash,takeFlash,reveal,esc,toast};
})();
