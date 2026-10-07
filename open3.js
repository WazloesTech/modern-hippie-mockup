// Deep-link states for the flow map (flows.html). Load last on a page.
// ?open=<state> opens a menu, pop-up or screen after load. Normal use (no params) is unchanged.
//   home7 / subtopic3: info, report, path, menu, create (&type=sub|feed|res, &info=1), tools, search (&q=),
//     sort (&dd=1), view, vote, context, top, profile, notifications, settings, finance (&bill=none|member),
//     card (&bill=none|member)
//   feed-detail: reply · people-detail: follow · resource-detail: open
// &flowmap=1 = shown inside the flow map: no focus stealing, no animations.
(function(){
const P=new URLSearchParams(location.search);
const open=(P.get('open')||'').toLowerCase();
if(P.get('flowmap')==='1'){
  document.documentElement.classList.add('flowmap');
  HTMLElement.prototype.focus=function(){};
  const st=document.createElement('style');
  st.textContent='*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent}';
  document.head.appendChild(st);
  // keep scrollIntoView inside this frame (the default also scrolls the flow map around it)
  Element.prototype.scrollIntoView=function(o){
    const end=o&&typeof o==='object'&&o.block==='end';
    for(let p=this.parentElement;p&&p!==document.body;p=p.parentElement){
      const oy=getComputedStyle(p).overflowY;
      if(p.scrollHeight>p.clientHeight&&/(auto|scroll|hidden)/.test(oy)){
        const d=this.getBoundingClientRect().top-p.getBoundingClientRect().top;
        p.scrollTop+=end?d-p.clientHeight+this.offsetHeight:d;return;
      }
    }
  };
}
if(!open)return;
const $=id=>document.getElementById(id);
const click=el=>{if(el)el.click()};
const later=(fn,ms)=>setTimeout(fn,ms||60);
const screens={profile:'Profile',notifications:'Notifications',settings:'Settings'};
function run(){
  if(screens[open]&&window.openScreen)return openScreen(screens[open]);
  switch(open){
    case 'info':return click($('tbtn'));
    case 'report':click($('tbtn'));return click($('flagBtn'));
    case 'path':return window.openPath&&openPath();
    case 'menu':return click($('lfab'));
    case 'create':{
      click($('lfab'));click($('lfab'));
      const t=P.get('type');if(!t)return;
      click(document.querySelector('.ctyp[data-k="'+t+'"]'));
      if(t==='sub'&&P.get('info')==='1')later(()=>click(document.querySelector('.cprow.cur .cinfo')),120);
      return;
    }
    case 'tools':return window.openToolsChrome&&openToolsChrome();
    case 'search':{
      click($('fab'));const q=P.get('q');const sq=$('sq');
      if(q&&sq){sq.value=q;sq.dispatchEvent(new Event('input'))}
      return;
    }
    case 'sort':click($('fabSF'));if(P.get('dd')==='1')click($('ddBtn'));return;
    case 'view':return click($('fabView'));
    case 'vote':{const b=document.querySelector('section.on .num button');if(b&&window.openVote)openVote(b);return}
    case 'context':return click($('cfab'));
    case 'top':return click($('tfab'));
    case 'finance':return window.openScreen&&openScreen('Finance',P.get('bill')||undefined);
    case 'card':if(window.openScreen){openScreen('Finance',P.get('bill')||undefined);openScreen('Card')}return;
    case 'reply':return click(document.querySelector('.creply[data-reply="'+(P.get('cid')||'c1a')+'"]'));
    case 'follow':return click($('follow'));
    case 'open':return click($('open'));
  }
}
if(document.readyState==='complete')later(run);else addEventListener('load',()=>later(run));
})();
