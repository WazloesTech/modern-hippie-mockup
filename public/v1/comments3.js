// Nested Reddit-style comments for feed-detail + continue-thread (lo-fi mock).
(function(){
const MAX_DEPTH=6; // phone ~390px: indent 0..5, then Continue thread
const FOLKS=['@river','@sage','@juniper','@ash','@wren','@cedar','@moss','@fern'];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// Deep sample tree so Continue thread appears under the long branch
const SAMPLE=[
  {id:'c1',w:'@sage',m:'2h',t:'Placeholder reply — start with the basics and take it slow.',kids:[
    {id:'c1a',w:'@juniper',m:'1h',t:'Another example reply with a tip from experience.',kids:[
      {id:'c1a1',w:'@ash',m:'50m',t:'Short agreeing reply.',kids:[
        {id:'c1a1a',w:'@wren',m:'40m',t:'Example nested reply — keep going one level deeper.',kids:[
          {id:'c1a1a1',w:'@cedar',m:'35m',t:'Example reply at this level.',kids:[
            {id:'c1a1a1a',w:'@moss',m:'30m',t:'Example reply — nesting is getting deep.',kids:[
              {id:'c1a1a1a1',w:'@fern',m:'25m',t:'Example reply past the phone indent limit.',kids:[
                {id:'c1a1a1a1a',w:'@river',m:'20m',t:'Example deep reply — open Continue thread to read more.',kids:[
                  {id:'c1a1a1a1a1',w:'@sage',m:'15m',t:'Example reply on the continue page.',kids:[
                    {id:'c1a1a1a1a1a',w:'@juniper',m:'10m',t:'Example nested reply on the continue branch.',kids:[
                      {id:'c1a1a1a1a1a1',w:'@ash',m:'5m',t:'Example leaf reply.',kids:[]}
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
  {id:'c2',w:'@ash',m:'1h',t:'Short agreeing reply.',kids:[
    {id:'c2a',w:'@wren',m:'45m',t:'Example follow-up under this comment.',kids:[]}
  ]},
  {id:'c3',w:'@cedar',m:'40m',t:'Example comment with no replies yet.',kids:[]}
];

function clone(n){return {id:n.id,w:n.w,m:n.m,t:n.t,kids:(n.kids||[]).map(clone)}}
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
  return `<div class="cnode" data-id="${esc(n.id)}" data-depth="${depth}">
    <div class="cmain">
      <b>${esc(n.w)}</b><span class="dmeta">${esc(n.m)}</span>
      <p class="cbody">${esc(n.t)}</p>
      <button type="button" class="creply" data-reply="${esc(n.id)}">Reply</button>
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
    mount.addEventListener('click',e=>{
      const b=e.target.closest('.creply');if(!b)return;
      replyTo=b.dataset.reply;opts._picked=true;setHint();input&&input.focus();
    });
    btn&&(btn.onclick=()=>{
      const v=(input&&input.value||'').trim();if(!v)return;
      MHComments.addReply(replyTo,v);
      if(input)input.value='';
      replyTo=opts.defaultParent||null;opts._picked=false;setHint();
      if(composer._rerender)composer._rerender();
    });
    setHint();
    return {getReplyTo:()=>replyTo,clearReply:()=>{replyTo=opts.defaultParent||null;opts._picked=false;setHint()}};
  }
};
})();
