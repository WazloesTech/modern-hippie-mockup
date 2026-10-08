// Nested Reddit-style comments for feed-detail + continue-thread (lo-fi mock).
(function(){
const MAX_DEPTH=6; // phone ~390px: indent 0..5, then Continue thread
const FOLKS=['@river','@sage','@juniper','@ash','@wren','@cedar','@moss','@fern'];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// Deep sample tree so Continue thread appears under the long branch
const SAMPLE=[
  {id:'c1',w:'@sage',m:'2h',t:'Start with the basics and take it slow. Two minutes is enough at first.',kids:[
    {id:'c1a',w:'@juniper',m:'1h',t:'Good tip. I set an alarm so I don’t forget.',kids:[
      {id:'c1a1',w:'@ash',m:'50m',t:'An alarm works for me too.',kids:[
        {id:'c1a1a',w:'@wren',m:'40m',t:'I put my mat next to the bed. Then I can’t skip it.',kids:[
          {id:'c1a1a1',w:'@cedar',m:'35m',t:'Smart. Do you stretch before or after coffee?',kids:[
            {id:'c1a1a1a',w:'@moss',m:'30m',t:'Before. Coffee is my reward.',kids:[
              {id:'c1a1a1a1',w:'@fern',m:'25m',t:'Ha, same. It makes mornings easier.',kids:[
                {id:'c1a1a1a1a',w:'@river',m:'20m',t:'Has anyone tried it in the evening instead?',kids:[
                  {id:'c1a1a1a1a1',w:'@sage',m:'15m',t:'Yes. It helps me sleep, but I go slower.',kids:[
                    {id:'c1a1a1a1a1a',w:'@juniper',m:'10m',t:'Good to know. I will try it tonight.',kids:[
                      {id:'c1a1a1a1a1a1',w:'@ash',m:'5m',t:'Let us know how it goes.',kids:[]}
                    ]}
                  ]}
                ]}
              ]}
            ]}
          ]}
        ]}
      ]}
    ]}
  ]},
  {id:'c4',w:'@you',m:'30m',t:'I tried this for a week. The breathing part helps me the most.',kids:[
    {id:'c4a',w:'@moss',m:'20m',t:'Same for me. I do it before bed too.',kids:[]}
  ]},
  {id:'c2',w:'@ash',m:'1h',t:'Thanks for sharing. Saving this.',kids:[
    {id:'c2a',w:'@wren',m:'45m',t:'Me too. Starting tomorrow.',kids:[]}
  ]},
  {id:'c3',w:'@cedar',m:'40m',t:'How long until you felt a change?',kids:[]}
];

function clone(n){return {id:n.id,w:n.w,m:n.m,t:n.t,del:!!n.del,edited:!!n.edited,kids:(n.kids||[]).map(clone)}}
let TREE=SAMPLE.map(clone);

function findNode(list,id){
  for(const n of list){
    if(n.id===id)return n;
    const f=findNode(n.kids||[],id);
    if(f)return f;
  }
  return null;
}
function findParent(list,id,parent=null){
  for(const n of list){
    if(n.id===id)return parent;
    const f=findParent(n.kids||[],id,n);
    if(f!==undefined&&f!==null||(f===null&&findNode(n.kids||[],id))){
      const inner=findParent(n.kids||[],id,n);
      if(inner!==undefined)return inner;
    }
  }
  return undefined;
}
// simpler parent finder
function parentOf(list,id){
  for(const n of list){
    if((n.kids||[]).some(k=>k.id===id))return n;
    const p=parentOf(n.kids||[],id);
    if(p)return p;
  }
  return null;
}

function uid(){return 'u'+Math.random().toString(36).slice(2,9)}

function nodeHTML(n,depth,opts){
  const {postT,fromUrl,rootId,basePath}=opts;
  const kids=n.kids||[];
  const atLimit=depth>=MAX_DEPTH-1;
  let kidsHTML='';
  if(kids.length){
    if(atLimit){
      const contQ=new URLSearchParams({t:postT,cid:n.id,from:fromUrl});
      kidsHTML=`<a class="ccontin" href="continue-thread.html?${contQ.toString()}">Continue thread <span>(${countAll(kids)})</span></a>`;
    } else {
      kidsHTML=`<div class="ckids">${kids.map(k=>nodeHTML(k,depth+1,opts)).join('')}</div>`;
    }
  }
  const mine=n.w==='@you'&&!n.del;
  const id=esc(n.id);
  const acts=n.del?'':`<div class="cacts"><button type="button" class="creply" data-reply="${id}">Reply</button>${mine?`<span class="comenu"><button type="button" class="icbtn cedit" data-c="${id}" aria-label="Edit" data-tip="Edit" data-tip-side="b" hidden><i data-ic="pencil"></i></button><button type="button" class="icbtn cdel" data-c="${id}" aria-label="Delete" data-tip="Delete" data-tip-side="b" hidden><i data-ic="trash-2"></i></button><button type="button" class="icbtn cmore" data-c="${id}" aria-label="More" aria-expanded="false" data-tip="More" data-tip-side="b"><i data-ic="ellipsis"></i></button></span>`:''}</div>`;
  return `<div class="cnode${n.del?' cgone':''}${opts.hl===n.id?' hl':''}" data-id="${id}" data-depth="${depth}">
    <div class="cmain">
      <b>${n.del?'[deleted]':esc(n.w)}</b><span class="dmeta">${esc(n.m)}${n.edited&&!n.del?' · edited':''}</span>
      <p class="cbody">${n.del?'[deleted]':esc(n.t)}</p>
      ${acts}
    </div>
    ${kidsHTML}
  </div>`;
}
function countAll(list){return list.reduce((a,n)=>a+1+countAll(n.kids||[]),0)}

function renderThread(rootList,mount,opts){
  mount.innerHTML=rootList.length
    ? rootList.map(n=>nodeHTML(n,0,opts)).join('')
    : '<p class="asnote">No comments yet.</p>';
  if(window.paintIcons)paintIcons(mount);
}

window.MHComments={
  MAX_DEPTH,
  getTree:()=>TREE,
  reset:()=>{TREE=SAMPLE.map(clone)},
  find:id=>findNode(TREE,id),
  parentOf:id=>parentOf(TREE,id),
  addReply(parentId,text){
    const body=(text||'').trim();if(!body)return null;
    const node={id:uid(),w:'@you',m:'Just now',t:body,kids:[]};
    if(!parentId){TREE.push(node);return node}
    const p=findNode(TREE,parentId);
    if(!p){TREE.push(node);return node}
    p.kids=p.kids||[];p.kids.push(node);return node;
  },
  edit(id,text){const n=findNode(TREE,id);const v=(text||'').trim();if(!n||!v)return null;n.t=v;n.edited=true;return n},
  // Reddit-style: a deleted comment with replies stays as [deleted]; without replies it goes away
  remove(id){
    const n=findNode(TREE,id);if(!n)return;
    if((n.kids||[]).length){n.del=true;n.t='[deleted]';return 'kept'}
    const p=parentOf(TREE,id);const list=p?p.kids:TREE;const i=list.findIndex(k=>k.id===id);if(i>=0)list.splice(i,1);return 'gone';
  },
  // subtree rooted at cid (the continue-thread root comment itself)
  branch(cid){
    const n=findNode(TREE,cid);
    return n?clone(n):null;
  },
  render(mount,opts){
    renderThread(TREE,mount,opts);
  },
  renderBranch(cid,mount,opts){
    const n=findNode(TREE,cid);
    if(!n){mount.innerHTML='<p class="asnote">Thread not found.</p>';return}
    // show this comment as root (depth 0) with its kids
    mount.innerHTML=nodeHTML(n,0,opts);
    if(window.paintIcons)paintIcons(mount);
  },
  wire(mount,composer,opts){
    opts=opts||{};
    let replyTo=opts.defaultParent||null;
    const input=composer.querySelector('input,textarea');
    const btn=composer.querySelector('button');
    const hint=composer.querySelector('.creplyhint');
    const setHint=()=>{
      if(!hint)return;
      const n=replyTo?findNode(TREE,replyTo):null;
      const isDef=replyTo&&replyTo===opts.defaultParent&&!opts._picked;
      if(replyTo&&n&&opts._picked){
        hint.hidden=false;hint.textContent='Replying to '+n.w;
      } else {hint.hidden=true;hint.textContent=''}
      if(input)input.placeholder=(replyTo&&opts._picked)?'Write a reply':(opts.defaultParent?'Write a reply':'Write a comment');
      if(btn)btn.textContent=(replyTo&&opts._picked)||opts.defaultParent?'Reply':'Comment';
    };
    let editing=null;
    const closeMenus=except=>mount.querySelectorAll('.comenu').forEach(m=>{if(m===except)return;m.querySelectorAll('.cedit,.cdel').forEach(x=>x.hidden=true);const mm=m.querySelector('.cmore');mm.classList.remove('on');mm.setAttribute('aria-expanded','false')});
    const startEdit=id=>{
      const n=findNode(TREE,id);if(!n)return;
      editing=id;replyTo=opts.defaultParent||null;opts._picked=false;
      if(input){input.value=n.t;input.placeholder='Edit your comment'}
      if(btn)btn.textContent='Save';
      if(hint){hint.hidden=false;hint.textContent='Editing your comment'}
      input&&input.focus();
    };
    const askDelete=id=>{
      const n=findNode(TREE,id);if(!n)return;
      const has=(n.kids||[]).length;
      const done=()=>{MHComments.remove(id);if(editing===id){editing=null;if(input)input.value='';setHint()}if(composer._rerender)composer._rerender();window.toast&&toast('Comment deleted')};
      if(window.MHOwner)MHOwner.confirm({title:'Delete this comment?',id:'delComment',ok:'Delete',
        text:has?'Your comment will show as [deleted]. The replies under it will stay.':'Your comment will be removed.',
        note:'You can’t undo this.',onOk:done});
      else done();
    };
    mount.addEventListener('click',e=>{
      const m=e.target.closest('.cmore');
      if(m){const wrap=m.closest('.comenu'),open=m.getAttribute('aria-expanded')!=='true';closeMenus(wrap);
        wrap.querySelectorAll('.cedit,.cdel').forEach(x=>x.hidden=!open);m.classList.toggle('on',open);m.setAttribute('aria-expanded',open);return}
      const ed=e.target.closest('.cedit');if(ed){closeMenus();startEdit(ed.dataset.c);return}
      const dl=e.target.closest('.cdel');if(dl){closeMenus();askDelete(dl.dataset.c);return}
      const b=e.target.closest('.creply');if(!b)return;
      editing=null;if(input)input.value='';
      replyTo=b.dataset.reply;opts._picked=true;setHint();input&&input.focus();
    });
    btn&&(btn.onclick=()=>{
      const v=(input&&input.value||'').trim();if(!v)return;
      if(editing){MHComments.edit(editing,v);editing=null}
      else MHComments.addReply(replyTo,v);
      if(input)input.value='';
      replyTo=opts.defaultParent||null;opts._picked=false;setHint();
      if(composer._rerender)composer._rerender();
    });
    composer._startEdit=startEdit;composer._askDelete=askDelete;
    setHint();
    return {getReplyTo:()=>replyTo,clearReply:()=>{replyTo=opts.defaultParent||null;opts._picked=false;setHint()}};
  }
};
})();
