// Shared iOS-style swipe-right-to-go-back. Load after fab3.js (uses window.parentHref).
(function(){
const THRESH=80;
function swipe(el,{onMove,onCommit,onCancel,canCommit}){
  let id=null,x0=0,y0=0,dx=0,mode=null;
  el.addEventListener('pointerdown',e=>{if(e.button>0)return;id=e.pointerId;x0=e.clientX;y0=e.clientY;dx=0;mode=null});
  el.addEventListener('pointermove',e=>{
    if(e.pointerId!==id)return;
    const mx=e.clientX-x0,my=e.clientY-y0;
    if(!mode){if(Math.abs(mx)<8&&Math.abs(my)<8)return;
      // mostly horizontal and to the right -> our gesture; otherwise leave it to scrolling
      mode=(mx>0&&Math.abs(mx)>Math.abs(my)*1.5)?'h':'v';
      if(mode=='h'){try{el.setPointerCapture(id)}catch(_){}}}
    if(mode!='h')return;
    e.preventDefault();dx=Math.max(0,mx);onMove(dx,canCommit());
  });
  const end=e=>{
    if(e.pointerId!==id)return;id=null;
    if(mode=='h'){
      // swallow the click that follows a drag
      const stop=ev=>{ev.stopPropagation();ev.preventDefault()};window.addEventListener('click',stop,{capture:true,once:true});setTimeout(()=>window.removeEventListener('click',stop,{capture:true}),50);
      (dx>=THRESH&&canCommit()&&e.type=='pointerup')?onCommit():onCancel();}
    mode=null;
  };
  el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
}
// page swipe
const main=document.querySelector('main');
const set=(x,anim)=>{main.style.transition=anim?'transform .26s cubic-bezier(.2,.8,.2,1)':'none';main.style.transform=x?`translateX(${x}px)`:''};
swipe(main,{
  canCommit:()=>!!window.parentHref,
  onMove:(dx,ok)=>{document.body.classList.add('swiping');set(ok?dx:Math.min(60,dx*0.25))},
  onCommit:()=>{set(window.innerWidth,true);setTimeout(()=>location.href=window.parentHref,240)},
  onCancel:()=>{set(0,true);setTimeout(()=>{document.body.classList.remove('swiping');main.style.transition=''},270)}
});
// swipe inside the path pop-up: close it and go to the parent page
const card=document.querySelector('#pathPop .pathcard');
if(card){const cs=(x,anim)=>{card.style.transition=anim?'transform .22s ease':'none';card.style.transform=x?`translateX(${x}px)`:''};
swipe(card,{
  canCommit:()=>!!window.parentHref,
  onMove:(dx,ok)=>cs(ok?Math.min(dx*0.5,90):Math.min(30,dx*0.2)),
  onCommit:()=>{cs(window.innerWidth,true);document.getElementById('pathPop').style.transition='opacity .2s';document.getElementById('pathPop').style.opacity='0';setTimeout(()=>location.href=window.parentHref,200)},
  onCancel:()=>cs(0,true)});}
card&&card.addEventListener('dragstart',e=>e.preventDefault());main.addEventListener('dragstart',e=>e.preventDefault());
window.__swipe=swipe;
})();
