// Deep-link states for the flow map (flows.html). Load last on a page.
// ?open=<state> opens a menu, pop-up or screen after load. Normal use (no params) is unchanged.
//   home7 / subtopic3: info, report, path, menu, create (&type=sub|feed|res, &info=1), tools, search (&q=),
//     sort (&dd=1), view, vote, context, top, profile, notifications, settings, finance (&bill=none|member),
//     card (&bill=none|member)
//     editprofile, cancel (Finance > Cancel plan), settings (&item=notifications|language|theme|privacy|account),
//     sedit / sdel (edit / delete this subtopic from its info card)
//   feed-detail: reply, more, edit, delete, cmenu / cedit / cdel / cgone (&cid=), &hl=<cid> highlights a comment
//   people-detail: follow · resource-detail: open, more, edit, delete · pod-detail: join
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
if(P.get('hl'))addEventListener('load',()=>setTimeout(()=>{const n=document.querySelector('.cnode.hl');if(n&&window.MHOwner)MHOwner.reveal(n,200)},60));
if(!open)return;
const $=id=>document.getElementById(id);
const click=el=>{if(el)el.click()};
const later=(fn,ms)=>setTimeout(fn,ms||60);
const screens={profile:'Profile',notifications:'Notifications',settings:'Settings'};
function run(){
  if(open==='settings'&&P.get('item')&&window.openScreen){openScreen('Settings');return window.openSetting&&openSetting(P.get('item'))}
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
    case 'more':return click($('oMore'));
    case 'edit':return click($('oEdit'));
    case 'delete':return click($('oDel'));
    case 'cmenu':case 'cedit':case 'cdel':{
      const id=P.get('cid')||'c4',m=document.querySelector('.cmore[data-c="'+id+'"]');
      if(window.MHOwner)MHOwner.reveal(m&&m.closest('.cnode'),open==='cmenu'?260:200);
      click(m);if(open==='cedit')click(document.querySelector('.cedit[data-c="'+id+'"]'));if(open==='cdel')click(document.querySelector('.cdel[data-c="'+id+'"]'));return;
    }
    case 'cgone':{
      const id=P.get('cid')||'c4',c=document.querySelector('.dcomposer');
      if(window.MHComments){MHComments.remove(id);c&&c._rerender&&c._rerender()}
      if(window.MHOwner)MHOwner.reveal(document.querySelector('.cnode[data-id="'+id+'"]'),260);return;
    }
    case 'editprofile':if(window.openScreen){openScreen('Profile');window.openEditProfile&&openEditProfile()}return;
    case 'cancel':if(window.openScreen){openScreen('Finance','member');window.openCancelPlan&&openCancelPlan()}return;
    case 'sedit':click($('tbtn'));return click($('sEditBtn'));
    case 'sdel':click($('tbtn'));return click($('sDelBtn'));
    case 'join':return click($('join'));
    case 'follow':return click($('follow'));
    case 'open':return click($('open'));
  }
}
if(document.readyState==='complete')later(run);else addEventListener('load',()=>later(run));
})();
