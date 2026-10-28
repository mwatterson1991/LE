/* LE — Leland's asset engine */
const $=id=>document.getElementById(id);
let M={brand:{},assets:[],posts:[]};
let state={kind:'still',tab:'kit',sub:'kit',q:'',bg:null,shot:null,center:false,dark:false,music:null,slide:0,chip:'all',logoMode:'color'};
const A=id=>M.assets.find(a=>a.id===id);
const byGroup=(...g)=>M.assets.filter(a=>g.includes(a.group));
const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const blue=s=>esc(s).replace(/\[([^\]]+)\]/g,'<em>$1</em>');
const plain=s=>String(s||'').replace(/[\[\]]/g,'');
const base=()=>location.href.replace(/[#?].*$/,'').replace(/[^/]*$/,'');
const SCREENS=['make','lib','editor','projects','connect','motion','brand'];

/* ---------- boot ---------- */
async function boot(){
  try{M=await (await fetch('data/manifest.json')).json()}catch(e){toast('Could not load data/manifest.json. Serve the folder (npx serve .) rather than opening the file.');}
  loadMotion();renderTabs();renderLib();renderBrand();renderProjects();renderConnect();renderMotion();renderSw();renderGfxSw();renderShotSw();renderMusic();
  setCopy('Own your future.','Work 1:1 with a coach who got in.','Find a coach');state.bg='bg-crosswalk';renderSw();sync();
  route();window.addEventListener('hashchange',route);
  document.fonts.ready.then(()=>{const s=document.fonts.check('500 16px Season'),m=document.fonts.check('400 16px Macan');if(!(s&&m))toast('Fonts missing — check fonts/')});
  opusNote();restoreProjects();
}
document.addEventListener('DOMContentLoaded',boot);

/* ---------- routing (hash = back button works everywhere) ---------- */
function route(){
  const h=location.hash.slice(1)||'make';const [scr,arg]=h.split('/');
  if(scr==='asset'&&arg){showPreview(arg,true);return}
  closePreview(true);
  const id=SCREENS.includes(scr)?scr:'make';
  document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on',s.id===id));
  document.querySelectorAll('.side a').forEach(a=>a.classList.toggle('on',a.id==='s-'+id));
  $('main').scrollTop=0;stopPlay();
  if(id==='lib'){if(arg){state.tab=arg;state.chip='all'}renderLib()}
  
  if(id==='projects')renderProjects();if(id==='connect')renderConnect();
}
function go(id,arg){location.hash=id+(arg?'/'+arg:'')}
const isOn=id=>$(id).classList.contains('on');
function menu(id){const m=$(id),on=m.classList.contains('on');closeMenus();if(!on)m.classList.add('on')}
function closeMenus(){document.querySelectorAll('.menu').forEach(m=>m.classList.remove('on'))}
document.addEventListener('click',e=>{if(!e.target.closest('.menu')&&!e.target.closest('.top .right'))closeMenus()});
document.addEventListener('keydown',e=>{const typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
  if(e.key==='Escape'){closeMenus();closeDrawer();if($('pv').classList.contains('on'))closePreview();$('ov').classList.remove('on');document.activeElement.blur()}
  if($('pv').classList.contains('on')&&!typing){if(e.key==='ArrowRight')stepPreview(1);if(e.key==='ArrowLeft')stepPreview(-1)}
  if((e.metaKey||e.ctrlKey)&&e.key==='Enter'&&isOn('editor'))exportCurrent();
  if(e.key===' '&&!typing&&isOn('editor')&&state.kind==='video'){e.preventDefault();togglePlay()}});
function toast(m,act){if(window.leo&&/error/i.test(m))leo.peek('puzzled');const t=$('toast');t.innerHTML=m+(act?`<b onclick="${act}">Open</b>`:'');t.classList.add('on');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('on'),3000)}
function copyText(s,msg){(navigator.clipboard?navigator.clipboard.writeText(s):Promise.reject()).then(()=>toast(msg||'Copied')).catch(()=>{prompt('Copy:',s)})}

/* ---------- library: four shelves, sub-shelves beneath ---------- */
const LIB=[
 ['images','Images','<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="M21 16l-5-5-8 8"/>',[['kit','Launch kit',['hero','header','card','aibp','aipost']],['bg','Backgrounds',['background']],['photo','Photos',['photo']],['expert','Experts',['expert']],['illustration','Illustrations',['illustration']],['graphic','Graphics',['graphic']],['org','Logos',['org']],['icon','Icons',['icon']]]],
 ['gifs','GIFs','<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 12h2M12 9v6M15 9h3M15 12h2"/>',[['gif','Sales',['gif']]]],
 ['videos','Videos','<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z"/>',[['film','Films',['film','kit']],['scene','Scenes',['scene']],['music','Music',['music']]]],
 ['copy','Copy','<path d="M5 6h14M5 12h10M5 18h7"/>',[['tagline','Taglines',['tagline']],['post','Posts',['post']]]]];
const subOf=k=>{for(const t of LIB)for(const s of t[3])if(s[0]===k)return {tab:t,sub:s};return {tab:LIB[0],sub:LIB[0][3][0]}};
const CHIPS={scene:[['all','All'],['intro','Intros'],['text','Text'],['product','Product'],['outro','Outros']],org:[['all','All'],['school','Schools'],['company','Companies']],illustration:[['all','All'],['social','Communication'],['work','Work'],['growth','Growth']]};
function count(g){return g[0]==='tagline'?(M.brand.taglines||[]).length:g[0]==='post'?M.posts.length:byGroup(...g).length}
function renderTabs(){const cur=subOf(state.tab).tab[0];$('tabs').innerHTML=LIB.map(([k,n,ic,subs])=>`<button class="${cur===k?'on':''}" onclick="go('lib','${subs[0][0]}')"><svg class="ico" viewBox="0 0 24 24">${ic}</svg>${n}</button>`).join('')}
function renderChips(){const {tab,sub}=subOf(state.tab);const el=$('chips');if(state.q){el.innerHTML='';return}
  let h=tab[3].map(s=>`<button class="${s[0]===sub[0]?'on':''}" onclick="go('lib','${s[0]}')">${s[1]}<small>${count(s)}</small></button>`).join('');
  const c=CHIPS[sub[0]];if(c)h+=`<span class="seg sm" style="margin-left:auto">${c.map(([k,n])=>`<button class="${state.chip===k?'on':''}" onclick="state.chip='${k}';renderLib()">${n}</button>`).join('')}</span>`;
  if(sub[0]==='org')h+=`<span class="seg sm">${['color','black','white'].map(m=>`<button class="${state.logoMode===m?'on':''}" onclick="state.logoMode='${m}';renderLib()">${m[0].toUpperCase()+m.slice(1)}</button>`).join('')}</span>`;
  el.innerHTML=h}
function searchLib(q){state.q=q.toLowerCase();if(!isOn('lib'))go('lib');renderLib()}
function match(a){const q=state.q;if(!q)return true;return ((a.title||'')+' '+(a.sub||'')+' '+(a.tags||[]).join(' ')+' '+(a.text||'')).toLowerCase().includes(q)}
function chipMatch(a){const c=state.chip;if(!c||c==='all')return true;if(a.group==='scene')return a.style===c;if(a.group==='org')return a.kind===c;if(a.group==='illustration')return a.set===c;return true}
const logoSrc=a=>state.logoMode==='color'||!a.mono?a.src:a.mono[state.logoMode];
function card(a){
  if(a.type==='video')return `<div class="card vid" onclick="openAsset('${a.id}')" onmouseenter="hoverPlay(this,1)" onmouseleave="hoverPlay(this,0)"><div class="th" style="background-image:url('${a.poster}')"><video muted loop playsinline preload="none" poster="${a.poster}" data-src="${a.src}"></video>${a.duration?`<span class="dur">${fmtDur(a.duration)}</span>`:''}</div><div class="t">${esc(a.title)}</div><div class="m">${esc(a.sub||a.group)}</div></div>`;
  if(a.type==='gif')return `<div class="card gif" onclick="openAsset('${a.id}')" onmouseenter="this.querySelector('img').src='${a.src}'" onmouseleave="this.querySelector('img').src='${a.poster}'"><div class="th"><img src="${a.poster}" alt=""><span class="dur">${a.duration}s · loop</span></div><div class="t">${esc(plain(a.title))}</div><div class="m">${esc(a.sub)}</div></div>`;
  if(a.type==='audio')return `<div class="card" onclick="openAsset('${a.id}')"><div class="th" style="background-image:url('${a.thumb}')"></div><div class="t">${esc(a.title)}</div><div class="m">${a.duration}s</div></div>`;
  if(a.type==='icon')return `<div class="card" onclick="openAsset('${a.id}')"><div class="th icon"><img loading="lazy" src="${a.src}" alt=""></div><div class="m" style="text-align:center;margin-top:6px">${esc(a.title)}</div></div>`;
  if(a.group==='org')return `<div class="card" onclick="openAsset('${a.id}')"><div class="th contain sq ${state.logoMode==='white'?'dark':''}"><img loading="lazy" src="${logoSrc(a)}" alt=""></div><div class="t">${esc(a.title)}</div></div>`;
  if(a.group==='illustration')return `<div class="card" onclick="openAsset('${a.id}')"><div class="th ill"><img loading="lazy" src="${a.src}" alt=""></div><div class="t">${esc(a.title)}</div></div>`;
  if(a.group==='graphic')return `<div class="card" onclick="openAsset('${a.id}')"><div class="th contain r43"><img loading="lazy" src="${a.src}" alt=""></div><div class="t">${esc(a.title)}</div></div>`;
  if(a.group==='expert')return `<div class="card" onclick="openAsset('${a.id}')"><div class="th sq" style="background-image:url('${a.thumb}')"></div><div class="t">${esc(a.title)}</div></div>`;
  if(a.group==='copy')return `<div class="card copy" onclick="openAsset('${a.id}')"><div class="th">${esc(a.title)}</div><div class="m">${esc(a.sub)}</div></div>`;
  return `<div class="card" onclick="openAsset('${a.id}')"><div class="th ${a.group==='photo'?'r43':''}" style="background-image:url('${a.thumb||a.src}')"></div><div class="t">${esc(a.title)}</div><div class="m">${esc(a.group==='background'?(a.tags||[]).filter(t=>t!=='background').slice(0,3).join(' · '):a.sub||a.group)}</div></div>`}
const fmtDur=d=>`${Math.floor(d/60)}:${String(Math.round(d%60)).padStart(2,'0')}`;
function hoverPlay(el,on){const v=el.querySelector('video');if(!v)return;if(on){if(!v.src)v.src=v.dataset.src;v.currentTime=0;v.play().catch(()=>{})}else{v.pause()}}
function copyItems(kind){const t=(M.brand.taglines||[]).map((t,i)=>({id:'tag-'+i,type:'copy',group:'copy',kind:'tagline',title:t,sub:'Approved tagline',text:t,tags:['tagline']}));const p=M.posts.map(p=>({id:'post-'+p.id,type:'copy',group:'copy',kind:'post',title:p.title,sub:`Post idea ${p.num} · ${p.platform}${p.group==='aibp'?' · AIBP':''}`,text:p.text,idea:p.idea,works:p.works,assets:p.assets,tags:['post',p.platform,p.group]}));return kind==='tagline'?t:kind==='post'?p:t.concat(p)}
function allItems(){return M.assets.concat(copyItems())}
function renderLib(){
  const {sub}=subOf(state.tab);const t=sub[0];let items=state.q?allItems():(t==='tagline'||t==='post'?copyItems(t):byGroup(...sub[2]));
  items=items.filter(match).filter(chipMatch);renderTabs();renderChips();const g=$('grid');
  g.className='grid'+(state.q?'':t==='icon'?' icons':t==='film'?' video':t==='scene'||t==='gif'?' scenes':t==='org'?' orgs':t==='illustration'?' ills':t==='expert'?' coaches':'');
  g.innerHTML=items.map(card).join('')||'<div class="empty">Nothing matches.</div>'}

/* ---------- preview (in place, back route) ---------- */
let pvList=[],pvIdx=-1,pvPushed=false;
function openAsset(id){pvList=[...document.querySelectorAll('#grid .card')].map(el=>{const m=(el.getAttribute('onclick')||'').match(/openAsset\('([^']+)'\)/);return m?m[1]:null}).filter(Boolean);if(!pvList.length)pvList=[id];pvIdx=pvList.indexOf(id);if(pvIdx<0){pvList=[id];pvIdx=0}pvPushed=true;location.hash='asset/'+id}
function stepPreview(d){if(!pvList.length)return;pvIdx=(pvIdx+d+pvList.length)%pvList.length;location.hash='asset/'+pvList[pvIdx]}
function showPreview(id){
  const a=allItems().find(x=>x.id===id);if(!a)return;const st=$('pvstage'),sd=$('pvside');st.className='stage';
  if(a.type==='video')st.innerHTML=`<video src="${a.src}" poster="${a.poster}" controls autoplay playsinline ${a.group==='scene'?'loop muted':''}></video>`;
  else if(a.type==='gif')st.innerHTML=`<img src="${a.src}" alt="">`;
  else if(a.type==='audio')st.innerHTML=`<div style="width:100%"><img src="${a.art||a.thumb}" style="width:100%;border-radius:10px;margin-bottom:14px" alt=""><audio src="${a.src}" controls autoplay></audio></div>`;
  else if(a.type==='icon'){st.classList.add('icon');st.innerHTML=`<img src="${a.src}" alt="">`}
  else if(a.type==='copy')st.innerHTML=`<div class="copytext ${a.text.length>80?'post':''}">${esc(a.text)}</div>`;
  else if(a.group==='org')st.innerHTML=`<div class="logo3"><div><img src="${a.src}" alt=""></div><div><img src="${a.mono?a.mono.black:a.src}" alt=""></div><div class="dark"><img src="${a.mono?a.mono.white:a.src}" alt=""></div></div>`;
  else if(a.group==='illustration'){st.classList.add('ill');st.innerHTML=`<img src="${a.src}" alt="">`}
  else st.innerHTML=`<img src="${a.src}" alt="">`;
  const tags=(a.tags||[]).slice(0,5).map(t=>`<span class="tag">${esc(t)}</span>`).join('');
  let actions='';
  if(a.type==='copy')actions=`<button class="btn black" onclick="copyText(${JSON.stringify(a.text)},'Copied')">Copy text</button>${a.id.startsWith('tag')?`<button class="btn" onclick="useTagline(${JSON.stringify(a.text)})">Use as headline</button>`:''}`;
  else if(a.type==='audio')actions=`<button class="btn black" onclick="closePreview(true);pickMusic('${a.id}');start('video')">Use in a video</button><a class="btn" href="${a.src}" download>Download</a>`;
  else if(a.type==='gif')actions=`<a class="btn black" href="${a.src}" download>Download GIF</a><a class="btn" href="${a.mp4}" download>Download MP4</a><button class="btn" onclick="closePreview(true);start('video',true);addScene('clip','${a.id}')">Add to a video</button><a class="btn" href="${base()}assets/gifs/src/${a.src.split('/').pop().replace('.gif','.html')}" target="_blank">Open source</a>`;
  else if(a.group==='scene')actions=`<button class="btn black" onclick="closePreview(true);start('video',true);addScene('clip','${a.id}')">Add to a video</button><a class="btn" href="${a.src}" download>Download clip</a>`;
  else if(a.type==='video')actions=`<a class="btn black" href="${a.src}" download>Download</a><button class="btn" onclick="closePreview(true);go('lib','scene');state.q='';$('q').value='';setTimeout(()=>{searchLib(${JSON.stringify((a.title||'').toLowerCase())})},50)">See its scenes</button>`;
  else if(a.type==='icon')actions=`<button class="btn black" onclick="copySvg('${a.src}')">Copy SVG</button><a class="btn" href="${a.src}" download>Download</a>`;
  else if(a.group==='org')actions=`<button class="btn black" onclick="closePreview(true);start('still',true);useGfx('${a.id}')">Add to an image</button><a class="btn" href="${a.src}" download>Download color</a>${a.mono?`<div class="two"><a class="btn" href="${a.mono.black}" download>Black</a><a class="btn" href="${a.mono.white}" download>White</a></div>`:''}`;
  else if(a.group==='illustration')actions=`<button class="btn black" onclick="closePreview(true);start('still',true);useGfx('${a.id}')">Add to an image</button><button class="btn" onclick="copySvg('${a.src}')">Copy SVG</button><a class="btn" href="${a.src}" download>Download</a>`;
  else if(a.group==='expert')actions=`<button class="btn black" onclick="closePreview(true);start('still',true);useGfx('${a.id}')">Add to an image</button><a class="btn" href="${a.src}" download>Download</a>`;
  else{const isBg=['background','photo','hero','header','aibp'].includes(a.group),isGfx=['graphic'].includes(a.group),isShot=['card','aipost','hero','upload'].includes(a.group);
    actions=`${isBg?`<button class="btn black" onclick="closePreview(true);useBg('${a.id}');start('still',true)">Use as background</button>`:''}${isGfx?`<button class="btn black" onclick="closePreview(true);start('still',true);useGfx('${a.id}')">Add to an image</button>`:''}${isShot?`<button class="btn ${isBg?'':'black'}" onclick="closePreview(true);start('video',true);addScene('shot','${a.id}')">Use in a video</button><button class="btn" onclick="closePreview(true);start('still',true);useShot('${a.id}')">Add to an image</button>`:''}<a class="btn" href="${a.src}" download>Download</a>`}
  sd.innerHTML=`<h2>${esc(a.title)}</h2><div class="m">${esc(a.sub||'')}${a.best?`<br><b style="color:var(--ink)">Best for:</b> ${esc(a.best)}`:''}${a.idea?`<br><br>${esc(a.idea)}`:''}</div><div class="tags">${tags}</div>${actions}`;
  $('pv').classList.add('on');
}
function closePreview(silent){const pv=$('pv');if(!pv.classList.contains('on'))return;pv.classList.remove('on');pv.querySelectorAll('video,audio').forEach(v=>v.pause());$('pvstage').innerHTML='';if(!silent&&location.hash.startsWith('#asset/')){if(pvPushed)history.back();else location.hash=state.tab?'lib/'+state.tab:'lib'}pvPushed=false}
async function copySvg(src){try{const t=await (await fetch(src)).text();copyText(t,'SVG copied')}catch(e){copyText(base()+src,'Link copied')}}

/* ---------- motion presets: measured from the five launch films ---------- */
const MOTION_DEFAULT={
  text:[{id:'typed',name:'Typed',desc:'Characters arrive left to right from where the finished line sits. Fast, ~45 characters a second; the rhythm comes from pauses, not slow letters.',speed:.65,ease:'linear'},
        {id:'words',name:'Words',desc:'Each word fades up from below with a touch of blur, a tenth of a second apart. The house treatment for taglines and end cards.',speed:.45,stagger:.1,ease:'out'},
        {id:'rise',name:'Rise',desc:'A whole line or card rises and fades in. Used for UI cards and stacked status lines, never a hero headline.',speed:.4,stagger:.1,ease:'out'}],
  transition:[{id:'fade',name:'Dissolve',desc:'A 0.35s cross-dissolve between scenes. Lockups and typed headlines leave on a hard cut.',dur:.35},{id:'cut',name:'Cut',desc:'No transition.',dur:0},{id:'push',name:'Push',desc:'The next scene pushes up from below. Not in the films; use sparingly.',dur:.45}],
  logo:[{id:'draw',name:'Draws on',desc:'The mark draws on stroke by stroke (~0.55s), holds a beat, then the wordmark types in while the lockup re-centres. This is what the films do.',dur:1.5},
        {id:'fade',name:'Fade',desc:'The finished lockup fades in over a quarter second above a headline that already landed. Dark end cards.',dur:.25},
        {id:'leo',name:'Leo spins in',desc:'The loader spins, the ears land, Leo settles into the mark. For the Community product only.',dur:1.5}],
  defaults:{text:'words',transition:'fade',logo:'draw',scene:3}
};
let MOTION=null,MREF={};
function loadMotion(){try{MOTION=JSON.parse(localStorage.getItem('le-motion')||'null')}catch(e){}if(!MOTION||!MOTION.logo.find(p=>p.id==='draw'))MOTION=JSON.parse(JSON.stringify(MOTION_DEFAULT));fetch('data/motion-ref.json').then(r=>r.json()).then(d=>{MREF=d;if(isOn('motion'))renderMotion()}).catch(()=>{})}
function saveMotion(){try{localStorage.setItem('le-motion',JSON.stringify(MOTION))}catch(e){}}
const preset=(kind,id)=>(MOTION[kind]||[]).find(p=>p.id===id)||MOTION[kind][0];
const EASE={linear:t=>t,out:t=>1-Math.pow(1-t,3),inout:t=>t<.5?2*t*t:-1+(4-2*t)*t};
function refClips(k,id){if(k==='logo')id=id==='draw'?'leo':id==='leo'?'none':id;const r=((MREF[k]||{})[id]||{}).refs||[];return r.map(A).filter(Boolean).slice(0,3)}
function renderMotion(){const groups=[['text','Text',['speed','stagger','ease']],['logo','Logo',['dur']],['transition','Transitions',['dur']]];
  $('motionlist').innerHTML=(MREF.summary?`<div class="msum">${MREF.summary.map(s=>`<p>${esc(s)}</p>`).join('')}</div>`:'')+groups.map(([k,n,fields])=>`<div class="mgroup"><h2>${n}</h2>${MOTION[k].map(p=>{const refs=refClips(k,p.id);return `<div class="mrow ${MOTION.defaults[k]===p.id?'def':''}">
    <div class="mdemo" id="demo-${k}-${p.id}" onmouseenter="demoMotion('${k}','${p.id}')"><span>${k==='logo'?'<img src="assets/logomark.png" alt=""><b>Leland</b>':k==='text'?'Own your <em>future</em>.':'Scene'}</span></div>
    <div class="mbody"><b>${esc(p.name)}</b><span>${esc(p.desc)}</span><div class="mfields">${fields.filter(f=>f in p).map(f=>f==='ease'?`<label>Ease<select onchange="MOTION.${k}.find(x=>x.id==='${p.id}').ease=this.value;saveMotion()">${['linear','out','inout'].map(e=>`<option ${p.ease===e?'selected':''}>${e}</option>`).join('')}</select></label>`:`<label>${({speed:'Speed',stagger:'Stagger',dur:'Duration'})[f]}<input type="number" step=".05" min="0" value="${p[f]}" onchange="MOTION.${k}.find(x=>x.id==='${p.id}').${f}=+this.value;saveMotion()"></label>`).join('')}<button class="link" onclick="MOTION.defaults.${k}='${p.id}';saveMotion();renderMotion()">${MOTION.defaults[k]===p.id?'Default':'Make default'}</button></div></div>
    <div class="mrefs">${refs.map(a=>`<div class="mref" onclick="openAsset('${a.id}')" onmouseenter="hoverPlay(this,1)" onmouseleave="hoverPlay(this,0)"><video muted loop playsinline preload="none" poster="${a.poster}" data-src="${a.src}"></video><span>${esc(a.title)}</span></div>`).join('')||'<div class="mref none">Not in the films</div>'}</div></div>`}).join('')}</div>`).join('')+
  `<div class="mgroup"><h2>Scenes</h2><div class="mrow"><div class="mdemo"><span>3s</span></div><div class="mbody"><b>Default scene length</b><span>Finished headlines hold 0.25–1s; end cards hold 2–2.5s with the store badges arriving 0.4s after the tagline.</span><div class="mfields"><label>Duration<input type="number" step=".5" min="1" value="${MOTION.defaults.scene}" onchange="MOTION.defaults.scene=+this.value;saveMotion()"></label></div></div><div class="mrefs"></div></div></div>`}
function demoMotion(k,id){const el=$(`demo-${k}-${id}`);el.classList.remove('go');void el.offsetWidth;el.dataset.anim=id;el.classList.add('go')}
function motionReset(){MOTION=JSON.parse(JSON.stringify(MOTION_DEFAULT));saveMotion();renderMotion();toast('Presets reset to what the films do')}
function motionExport(){dl(new Blob([JSON.stringify(MOTION,null,2)],{type:'application/json'}),'le-motion.json');toast('Presets exported')}

/* ---------- editor ---------- */
const DEF_LAYERS=()=>({copy:{x:.07,y:.62,w:.72},gfx:{id:null,x:.62,y:.12,s:.3},shot:{id:null,x:.56,y:.18,s:.42}});
Object.assign(state,{layers:DEF_LAYERS(),sel:'copy',outro:'draw',size:1,scenes:[],scene:0});
const defScenes=()=>[{type:'text',text:'One conversation could [open the door].',anim:MOTION.defaults.text,dur:3},{type:'shot',asset:'card-kevin',dur:3},{type:'outro',tag:'Talk to a [Human].',dur:3}];
function start(k,keep){state.kind=k;stopPlay();
  if(!keep){state.layers=DEF_LAYERS();state.size=1;$('fSize').value=1;
    if(k==='still'){setCopy('Own your future.','Work 1:1 with a coach who got in.','Find a coach');state.bg='bg-crosswalk';$('etitle').value='Untitled image'}
    if(k==='video'){state.scenes=defScenes();state.scene=0;$('etitle').value='Untitled video';if(!state.music)state.music='audio-onconversation'}
    if(k==='deck'){$('etitle').value='Untitled deck';initDeck()}
    if(k==='story'){$('etitle').value='Untitled story';storyInit()}}
  if(k==='video'&&!state.scenes.length){state.scenes=defScenes();state.scene=0}
  renderSw();renderGfxSw();renderShotSw();renderMusic();
  ratio(k==='video'?'':k==='still'?'r11':k==='story'?'r45':'');$('ask').value='';
  history.replaceState(null,'','#editor');route();sync();setTimeout(()=>$('ask').focus(),60)}
function setCopy(h,s,c){$('fHead').value=h||'';$('fSub').value=s||'';$('fCta').value=c||''}
function useTagline(t){setCopy(t,'','');closePreview(true);start('still',true);sync();toast('Tagline applied')}
function useBg(id){state.bg=id;renderSw();sync()}
function useGfx(id){state.layers.gfx.id=id;state.sel='gfx';if((A(id)||{}).group==='expert')state.layers.gfx.s=.28;renderGfxSw();sync()}
function useShot(id){state.shot=id;if(state.kind==='still'){state.layers.shot.id=id;state.sel='shot'}renderShotSw();sync()}
function uploadShot(f){if(!f)return;const r=new FileReader();r.onload=()=>{const id='upload-'+Date.now();M.assets.push({id,type:'image',group:'upload',title:f.name,src:r.result,thumb:r.result,tags:['upload']});if(state.kind==='video')addScene('shot',id);else useShot(id)};r.readAsDataURL(f)}
function ratio(c){state.ratio=c;document.querySelectorAll('#ratio button').forEach(b=>b.classList.toggle('on',(b.textContent==='16:9'&&!c)||(b.textContent==='1:1'&&c==='r11')||(b.textContent==='4:5'&&c==='r45')||(b.textContent==='9:16'&&c==='r916')));sync()}
function align(el,c){state.center=c;el.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el));sync()}
function vtheme(el,d){state.dark=d;el.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el));sync()}
function setOutro(el,a){state.outro=a;el.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el))}
const swBtn=(a,on,fn)=>`<button class="${on?'on':''}" style="background-image:url('${a.thumb||a.src}');${['graphic','illustration','icon','org'].includes(a.group)?'background-size:contain;background-repeat:no-repeat;background-color:#fff':''}" title="${esc(a.title)}" onclick="${fn}"></button>`;
function renderSw(){$('sw').innerHTML=byGroup('background').slice(0,6).concat(byGroup('hero').slice(0,3)).map(a=>swBtn(a,state.bg===a.id,`useBg('${a.id}')`)).join('')+`<button class="more" onclick="openDrawer('bg')">…</button>`}
function renderGfxSw(){const g=state.layers.gfx;$('gfxsw').innerHTML=`<button class="more ${!g.id?'on':''}" onclick="state.layers.gfx.id=null;renderGfxSw();sync()">×</button>`+byGroup('illustration').slice(0,8).map(a=>swBtn(a,g.id===a.id,`useGfx('${a.id}')`)).join('')+`<button class="more" onclick="openDrawer('gfx')">…</button>`;$('gfxSizeWrap').style.display=g.id?'':'none';$('gfxSize').value=g.s}
function renderShotSw(){const cur=state.layers.shot.id;$('shotsw').innerHTML=`<button class="more ${!cur?'on':''}" onclick="state.layers.shot.id=null;renderShotSw();sync()">×</button>`+byGroup('card','aipost','upload').slice(0,8).map(a=>swBtn(a,cur===a.id,`useShot('${a.id}')`)).join('')+`<button class="more" onclick="openDrawer('shot')">…</button>`}
function renderMusic(){$('music').innerHTML=byGroup('music').map(a=>`<button class="${state.music===a.id?'on':''}" onclick="pickMusic('${a.id}')"><img src="${a.thumb}" alt="">${esc(a.title)}<small>${a.duration}s</small></button>`).join('')+`<button class="${state.music===null?'on':''}" onclick="pickMusic(null)"><span style="width:34px"></span>No music</button>`}
function pickMusic(id){state.music=id;renderMusic()}
function hsFor(){const f=$('frame');return Math.min(f.clientWidth,f.clientHeight)*.085}
function sync(){
  const f=$('frame'),k=state.kind,bg=A(state.bg)||{},L=state.layers;const isVid=k==='video',isDeck=k==='deck',isStory=k==='story';
  const gfx=A(L.gfx.id),shot=A(L.shot.id);
  f.className='frame '+(state.ratio||'')+(isVid?' vid'+(state.dark?' dark':''):isStory?' story':(bg.src?' photo'+(bg.light?' light':''):' light'))+(state.center?' center':'')+(gfx?' has-gfx':'')+(shot?' has-shotL':'')+(gfx&&gfx.group==='expert'?' round':'');
  f.style.backgroundImage=isVid||isStory?'none':`url('${bg.src||''}')`;if((!isVid&&!bg.src)||isStory)f.style.backgroundColor='#fff';
  f.style.setProperty('--hs',hsFor()+'px');f.style.setProperty('--sz',state.size);
  $('pHead').innerHTML=blue($('fHead').value);$('pSub').textContent=$('fSub').value;$('pCta').textContent=$('fCta').value;$('fSizeV').textContent=Math.round(state.size*100)+'%';
  const cp=$('copy');cp.style.left=L.copy.x*100+'%';cp.style.top=L.copy.y*100+'%';cp.style.width=L.copy.w*100+'%';cp.style.transform=state.center?'translateX(-50%)':'';cp.style.textAlign=state.center?'center':'left';
  const g=$('gfxLayer');g.style.left=L.gfx.x*100+'%';g.style.top=L.gfx.y*100+'%';g.style.width=L.gfx.s*100+'%';$('gfxImg').src=gfx?(gfx.group==='org'&&!bg.src?gfx.src:gfx.group==='org'&&gfx.mono?gfx.mono[bg.light||!bg.src?'black':'white']:gfx.src):'';
  const s=$('shotLayer');s.style.left=L.shot.x*100+'%';s.style.top=L.shot.y*100+'%';s.style.width=L.shot.s*100+'%';$('shotImg').src=shot?shot.src:'';
  ['copy','gfxLayer','shotLayer'].forEach(id=>$(id).classList.toggle('sel',state.sel===({copy:'copy',gfxLayer:'gfx',shotLayer:'shot'}[id])&&!isVid&&!isStory));
  ['copy','lgLayer','gfxLayer','shotLayer'].forEach(id=>$(id).style.display=isVid||isStory?'none':'');
  $('storyImg').style.display=isStory?'block':'none';
  ['secCopy','secBg','secGfx','secShot'].forEach(id=>$(id).style.display=isVid||isStory?'none':'');
  ['secScene','secTheme','secMusic'].forEach(id=>$(id).style.display=isVid?'':'none');
  ['secStory','secStoryOut'].forEach(id=>$(id).style.display=isStory?'':'none');
  $('vidctl').style.display=isVid?'flex':'none';$('beats').style.display=isVid?'':'none';$('blocks').style.display=isVid?'':'none';$('egrid').classList.toggle('video',isVid);$('slides').style.display=isDeck||isStory?'':'none';$('ratio').style.display=isDeck||isStory?'none':'';
  $('ratio').style.display=isDeck||isStory?'none':'';$('layerbar').innerHTML=isVid||isStory?'':`<button class="layerbtn ${state.sel==='copy'?'on':''}" onclick="state.sel='copy';sync()">Text</button>${gfx?`<button class="layerbtn ${state.sel==='gfx'?'on':''}" onclick="state.sel='gfx';sync()">${gfx.group==='expert'?'Expert':gfx.group==='org'?'Logo':'Illustration'}</button>`:''}${shot?`<button class="layerbtn ${state.sel==='shot'?'on':''}" onclick="state.sel='shot';sync()">Shot</button>`:''}`;
  $('cookbtn').innerHTML=(isVid?'Render video':isDeck?'Download slides':isStory?'Download carousel':'Download PNG')+'<span class="kbd">⌘⏎</span>';
  $('cooknote').textContent=isVid?'Renders in your browser with the music mixed in.':isDeck?'Every slide as a 1920×1080 PNG.':isStory?'5 slides · PDF for LinkedIn':({'':'1920×1080',r11:'1080×1080',r45:'1080×1350',r916:'1080×1920'}[state.ratio||'']);
  if(isVid){syncScenes();showScene(curScene)}else ['bHook','bShot','bClip','bOutro'].forEach(id=>$(id).classList.remove('on'));
  if(isDeck&&slides[state.slide]){slides[state.slide].h=$('fHead').value;slides[state.slide].s=$('fSub').value;slides[state.slide].bg=state.bg;renderSlides()}
  if(isStory)storySync();
}
window.addEventListener('resize',()=>{if(isOn('editor'))sync()});
/* drag layers on the canvas */
(function(){const f=document.getElementById('frame');let drag=null;
  f.addEventListener('pointerdown',e=>{if(state.kind!=='still'&&state.kind!=='deck')return;const el=e.target.closest('.layer.copy,.layer.gfx,.layer.shotL');if(!el)return;const key=el.classList.contains('copy')?'copy':el.classList.contains('gfx')?'gfx':'shot';state.sel=key;const r=f.getBoundingClientRect();const L=state.layers[key];drag={key,sx:e.clientX,sy:e.clientY,ox:L.x,oy:L.y,r,moved:false};el.setPointerCapture(e.pointerId);sync()});
  f.addEventListener('pointermove',e=>{if(!drag)return;const dx=(e.clientX-drag.sx)/drag.r.width,dy=(e.clientY-drag.sy)/drag.r.height;if(Math.abs(dx)+Math.abs(dy)>.004)drag.moved=true;const L=state.layers[drag.key];L.x=Math.max(-.2,Math.min(.95,drag.ox+dx));L.y=Math.max(-.2,Math.min(.95,drag.oy+dy));sync()});
  f.addEventListener('pointerup',e=>{if(drag&&!drag.moved&&drag.key==='copy')$('fHead').focus();drag=null});
  f.addEventListener('wheel',e=>{if(state.kind!=='still'||!['gfx','shot'].includes(state.sel))return;e.preventDefault();const L=state.layers[state.sel];L.s=Math.max(.08,Math.min(.9,L.s*(e.deltaY<0?1.05:.95)));if(state.sel==='gfx')$('gfxSize').value=L.s;sync()},{passive:false});
  document.addEventListener('keydown',e=>{if(!isOn('editor')||state.kind!=='still'||/INPUT|TEXTAREA/.test(document.activeElement.tagName))return;const L=state.layers[state.sel];if(!L)return;const st=e.shiftKey?.05:.01;if(e.key==='ArrowLeft'){L.x-=st}else if(e.key==='ArrowRight'){L.x+=st}else if(e.key==='ArrowUp'){L.y-=st}else if(e.key==='ArrowDown'){L.y+=st}else if((e.key==='Backspace'||e.key==='Delete')&&state.sel!=='copy'){L.id=null;state.sel='copy';renderGfxSw();renderShotSw()}else return;e.preventDefault();sync()});
})();
/* inline drawer */
const DTABS={bg:[['bg','Backgrounds',['background']],['kit','Launch kit',['hero','header']],['photo','Photos',['photo']]],gfx:[['illustration','Illustrations',['illustration']],['expert','Experts',['expert']],['org','Logos',['org']],['graphic','Graphics',['graphic']],['icon','Icons',['icon']]],shot:[['card','Launch kit',['card','aipost','hero']],['upload','Uploads',['upload']]],clip:[['scene','Scenes',['scene']],['gif','GIFs',['gif']]],logo:[['org','Logos',['org']]]};
let dmode='bg',dtab='bg';
function openDrawer(mode){dmode=mode;dtab=DTABS[mode][0][0];$('dq').value='';renderDrawer();$('drawer').classList.add('on')}
function closeDrawer(){$('drawer').classList.remove('on')}
function renderDrawer(){const tabs=DTABS[dmode];$('dtabs').innerHTML=tabs.map(t=>`<button class="${dtab===t[0]?'on':''}" onclick="dtab='${t[0]}';renderDrawer()">${t[1]}<small>${byGroup(...t[2]).length}</small></button>`).join('');
  const q=$('dq').value.toLowerCase();const t=tabs.find(x=>x[0]===dtab);let items=byGroup(...t[2]).filter(a=>!q||((a.title||'')+' '+(a.tags||[]).join(' ')).toLowerCase().includes(q));
  const fn={bg:'useBg',gfx:'useGfx',shot:'useShot',clip:'pickClip',logo:'storyLogo'}[dmode];
  $('dgrid').className='grid'+(dtab==='icon'?' icons':dtab==='illustration'?' ills':dtab==='scene'?' scenes':'');
  $('dgrid').innerHTML=items.map(a=>{const contain=['graphic','illustration','icon','org'].includes(a.group);const cls=a.group==='icon'?'icon':a.group==='illustration'?'ill':contain?'contain sq':a.group==='photo'||a.group==='expert'?(a.group==='expert'?'sq':'r43'):'';
    return `<div class="card" onclick="${fn}('${a.id}')"><div class="th ${cls}" style="${contain?'':`background-image:url('${a.poster||a.thumb||a.src}')`}">${contain?`<img loading="lazy" src="${a.src}" alt="">`:''}${a.duration?`<span class="dur">${a.duration}s</span>`:''}</div>${a.group==='icon'?'':`<div class="t">${esc(a.title)}</div>`}</div>`}).join('')||'<div class="empty">Nothing matches.</div>'}
function pickClip(id){addScene('clip',id);closeDrawer()}

/* ---------- video: scenes ---------- */
let curScene=0,playing=false,tPos=0,raf=null,lastTs=0,musicEl=null;
const SCENE_TYPES=[['text','Text animation'],['shot','Product shot'],['clip','Animated UI'],['intro','Intro'],['outro','Outro']];
const sceneDur=s=>s.type==='clip'?((A(s.asset)||{}).duration||3):s.dur;
const clipSrc=a=>a.mp4||a.src;
const total=()=>state.scenes.reduce((a,s)=>a+sceneDur(s),0);
function addScene(type,asset){const sc={type,dur:MOTION.defaults.scene};
  if(type==='text')sc.text='Your next move [starts here].',sc.anim=MOTION.defaults.text;
  if(type==='shot')sc.asset=asset||'card-kevin';
  if(type==='clip'){sc.asset=asset||(byGroup('scene').find(a=>a.style==='product')||{}).id}
  if(type==='gif'){sc.type='clip';sc.asset=asset||(byGroup('gif')[0]||{}).id}
  if(type==='intro'){const a=byGroup('scene').find(x=>x.style==='intro');sc.type='clip';sc.asset=asset||(a&&a.id)}
  if(type==='outro')sc.tag='Talk to a [Human].';
  const at=type==='intro'?0:type==='outro'?state.scenes.length:(state.scenes[state.scenes.length-1]||{}).type==='outro'?state.scenes.length-1:state.scenes.length;
  state.scenes.splice(at,0,sc);state.scene=at;seekScene(at);sync()}
function removeScene(i){if(state.scenes.length<=1)return;state.scenes.splice(i,1);state.scene=Math.max(0,i-1);seekScene(state.scene);sync()}
function moveScene(i,d){const j=i+d;if(j<0||j>=state.scenes.length)return;const s=state.scenes;[s[i],s[j]]=[s[j],s[i]];state.scene=j;seekScene(j);sync()}
function sceneThumb(s){const a=A(s.asset)||{};
  if(s.type==='text')return `<div class="bt text ${state.dark?'dark':''}"><span>${blue(s.text)}</span></div>`;
  if(s.type==='shot')return `<div class="bt shot ${state.dark?'dark':''}"><img src="${a.thumb||a.src||''}" alt=""></div>`;
  if(s.type==='clip')return `<div class="bt clip" style="background-image:url('${a.poster||''}')"></div>`;
  return `<div class="bt outro ${state.dark?'dark':''}"><img src="assets/logomark.png" alt=""><b>Leland</b></div>`}
const BLOCKS=[['text','Text','A headline, animated the house way'],['shot','Product shot','A screenshot in a soft frame'],['intro','Intro','A real intro from the films'],['clip','UI clip','A product scene from the films'],['gif','Concept','A looping sales concept'],['outro','Outro','Lockup, tagline, store badges']];
function blockThumb(k){const sc=byGroup('scene');const pick=k==='intro'?sc.find(a=>a.style==='intro'):k==='clip'?sc.find(a=>a.style==='product'):k==='gif'?byGroup('gif')[0]:null;
  if(k==='text')return `<div class="bt text"><span>Your next <em>move</em>.</span></div>`;
  if(k==='shot')return `<div class="bt shot"><img src="${(A('card-kevin')||{}).thumb||''}" alt=""></div>`;
  if(k==='outro')return `<div class="bt outro"><img src="assets/logomark.png" alt=""><b>Leland</b></div>`;
  return `<div class="bt clip" style="background-image:url('${(pick||{}).poster||''}')"></div>`}
function syncScenes(){const S=state.scenes;
  $('beats').innerHTML=S.map((s,i)=>{const a=A(s.asset)||{};const label=s.type==='text'?plain(s.text):s.type==='shot'?(a.title||'Pick a shot'):s.type==='clip'?(a.title?plain(a.title):'Pick a clip'):'Leland · '+plain(s.tag);
    return `<div class="blk ${state.scene===i?'on':''}" style="--w:${sceneDur(s)}" draggable="true" ondragstart="dragScene=${i}" ondragover="event.preventDefault()" ondrop="dropScene(${i})" onclick="state.scene=${i};seekScene(${i});sync()">${sceneThumb(s)}<div class="bl"><span>${esc(label)}</span><i>${sceneDur(s)}s</i></div></div>`}).join('')+`<div class="blk end"><span>${total().toFixed(1)}s</span></div>`;
  $('blocks').innerHTML=BLOCKS.map(([k,n,d])=>`<button class="block" onclick="addScene('${k}')">${blockThumb(k)}<b>${n}</b><span>${d}</span></button>`).join('');
  const s=S[state.scene];if(!s)return;const i=state.scene;
  $('sceneTitle').innerHTML=`${({text:'Text',shot:'Product shot',clip:'Clip',outro:'Outro'})[s.type]} <span><button class="link" onclick="moveScene(${i},-1)">←</button><button class="link" onclick="moveScene(${i},1)">→</button><button class="link" onclick="removeScene(${i})">Remove</button></span>`;
  let body='';
  if(s.type==='text')body=`<div class="f"><label>Text</label><input value="${esc(s.text)}" oninput="state.scenes[${i}].text=this.value;sync()"></div><div class="f"><label>Arrives</label><div class="seg" style="display:inline-flex">${MOTION.text.map(p=>`<button class="${s.anim===p.id?'on':''}" onclick="state.scenes[${i}].anim='${p.id}';sync()">${esc(p.name)}</button>`).join('')}</div></div>`;
  if(s.type==='shot')body=`<div class="sw">${byGroup('card','aipost','upload').slice(0,8).map(a=>swBtn(a,s.asset===a.id,`state.scenes[${i}].asset='${a.id}';sync()`)).join('')}</div><label class="btn sm" style="margin-top:10px">Upload screenshot<input type="file" accept="image/*" style="display:none" onchange="state.scene=${i};uploadScene(this.files[0])"></label>`;
  if(s.type==='clip')body=`<div class="clippick" onclick="openDrawer('clip')"><img src="${(A(s.asset)||{}).poster||''}" alt=""><span>${esc(plain((A(s.asset)||{}).title||'Pick a clip'))}</span></div>`;
  if(s.type==='outro')body=`<div class="f"><label>Tagline</label><input value="${esc(s.tag)}" oninput="state.scenes[${i}].tag=this.value;sync()"></div>`;
  if(s.type!=='clip')body+=`<div class="f" style="margin-top:8px"><label>Length</label><div class="slider"><input type="range" min="1" max="8" step=".5" value="${s.dur}" oninput="state.scenes[${i}].dur=+this.value;sync()"><b>${s.dur}s</b></div></div>`;
  $('sceneBody').innerHTML=body;$('time').textContent=tPos.toFixed(1)+'s / '+total().toFixed(1)+'s';
  $('outroanim').innerHTML=MOTION.logo.map(p=>`<button class="${state.outro===p.id?'on':''}" onclick="setOutro(this,'${p.id}')">${esc(p.name)}</button>`).join('')}
let dragScene=null;
function dropScene(i){if(dragScene===null||dragScene===i)return;const s=state.scenes;const [m]=s.splice(dragScene,1);s.splice(i,0,m);state.scene=i;dragScene=null;seekScene(i);sync()}
function uploadScene(f){if(!f)return;const r=new FileReader();r.onload=()=>{const id='upload-'+Date.now();M.assets.push({id,type:'image',group:'upload',title:f.name,src:r.result,thumb:r.result,tags:['upload']});state.scenes[state.scene].asset=id;sync()};r.readAsDataURL(f)}
function sceneAt(t){let acc=0;for(let i=0;i<state.scenes.length;i++){acc+=sceneDur(state.scenes[i]);if(t<acc)return i}return state.scenes.length-1}
function sceneStart(i){let acc=0;for(let j=0;j<i;j++)acc+=sceneDur(state.scenes[j]);return acc}
function showScene(i){curScene=i;const s=state.scenes[i];if(!s)return;const t=s.type;
  $('bHook').classList.toggle('on',t==='text');$('bShot').classList.toggle('on',t==='shot');$('bClip').classList.toggle('on',t==='clip');$('bOutro').classList.toggle('on',t==='outro');$('bOutro').dataset.logo=state.outro;if(t==='outro'){const o=$('bOutro');o.classList.remove('go');void o.offsetWidth;o.classList.add('go')}
  if(t==='text')$('vHook').innerHTML=blue(s.text);if(t==='shot')$('vShot').src=(A(s.asset)||{}).src||'';if(t==='outro')$('vTag').innerHTML=blue(s.tag);
  const v=$('vClip');if(t==='clip'){const a=A(s.asset)||{};const src=clipSrc(a);if(src&&!v.src.endsWith(src)){v.src=src}if(playing){v.play().catch(()=>{})}}else{v.pause()}
  document.querySelectorAll('.beat-c').forEach((el,j)=>el.classList.toggle('on',j===i))}
function seekScene(i){tPos=sceneStart(i);showScene(i);const s=state.scenes[i];if(s&&s.type==='clip'){const v=$('vClip');try{v.currentTime=0}catch(e){}}$('prog').style.width=(tPos/total()*100)+'%';$('time').textContent=tPos.toFixed(1)+'s / '+total().toFixed(1)+'s'}
function togglePlay(){playing?stopPlay():startPlay()}
function startPlay(){playing=true;if(tPos>=total())tPos=0;$('playico').innerHTML='<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>';
  if(state.music){musicEl=new Audio((A(state.music)||{}).src);musicEl.currentTime=tPos;musicEl.volume=.9;musicEl.play().catch(()=>{})}
  showScene(sceneAt(tPos));const v=$('vClip');if(state.scenes[curScene].type==='clip'){v.currentTime=tPos-sceneStart(curScene);v.play().catch(()=>{})}
  lastTs=performance.now();const step=ts=>{if(!playing)return;tPos+=(ts-lastTs)/1000;lastTs=ts;if(tPos>=total()){tPos=total();stopPlay();return}const i=sceneAt(tPos);if(i!==curScene){showScene(i);if(state.scenes[i].type==='clip'){v.currentTime=0;v.play().catch(()=>{})}}$('prog').style.width=(tPos/total()*100)+'%';$('time').textContent=tPos.toFixed(1)+'s / '+total().toFixed(1)+'s';raf=requestAnimationFrame(step)};raf=requestAnimationFrame(step)}
function stopPlay(){if(!playing)return;playing=false;cancelAnimationFrame(raf);if(musicEl){musicEl.pause();musicEl=null}$('vClip').pause();if($('playico'))$('playico').innerHTML='<path d="M8 5v14l11-7z"/>'}
/* deck */
let slides=[];
function initDeck(){slides=[{h:'The home for ambition.',s:'Leland · Q4 2026',bg:null},{h:'Learn from people who’ve done it',s:'Experts with real names and verified backgrounds.',bg:'hero-learn'},{h:'Ask anything. Get real answers.',s:'Questions, livestreams and experts in one feed.',bg:'bg-godrays-03'},{h:'Own your future.',s:'joinleland.com',bg:'bg-crosswalk'}];state.slide=0;pickSlide(0)}
function renderSlides(){$('slides').innerHTML=slides.map((s,i)=>{const b=A(s.bg)||{};return `<div class="slide ${b.src?'photo':''} ${i===state.slide?'on':''}" style="background-image:url('${b.thumb||b.src||''}')" onclick="pickSlide(${i})"><b>${esc(plain(s.h))}</b><span class="n">${i+1}</span></div>`}).join('')+`<div class="slide add" onclick="slides.push({h:'New slide',s:'',bg:null});pickSlide(slides.length-1)">+</div>`}
function pickSlide(i){state.slide=i;const s=slides[i];setCopy(s.h,s.s,'');state.bg=s.bg;renderSw();sync()}

/* ---------- Opus ---------- */
const CFG={get api(){return localStorage.getItem('le-api')||''},set api(v){localStorage.setItem('le-api',v)},get key(){return localStorage.getItem('le-key')||''},set key(v){localStorage.setItem('le-key',v)}};
const hasOpus=()=>!!(CFG.api||CFG.key);
async function opus(system,user,max=900){const body={model:'claude-opus-4-1',max_tokens:max,system,messages:[{role:'user',content:user}]};let r;
  if(CFG.api)r=await fetch(CFG.api.replace(/\/$/,'')+'/opus',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
  else if(CFG.key)r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':CFG.key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify(body)});
  else return null;if(!r.ok)throw new Error('Opus '+r.status);const j=await r.json();return (j.content||[]).filter(c=>c.type==='text').map(c=>c.text).join('')}
const SYSTEM=()=>`You write marketing copy for Leland (joinleland.com). ${M.brand.pitch?M.brand.pitch.oneliner:''} Voice: confident, warm, specific, no hype, no exclamation marks, no emojis. Approved taglines: ${(M.brand.taglines||[]).join(' | ')}. Guardrails: ${(M.brand.guardrails||[]).join(' ')} In headlines, wrap the one phrase that should be blue in [square brackets], e.g. "One conversation could [open the door]." Respond ONLY with JSON.`;
const jsonOf=s=>{try{return JSON.parse(s.replace(/```json|```/g,'').trim())}catch(e){const m=s.match(/\{[\s\S]*\}/);return m?JSON.parse(m[0]):null}};
function connectOpus(){const k=prompt('Paste an Anthropic API key (stays in this browser). Leave blank to use a proxy URL.');if(k===null)return;if(k.trim()){CFG.key=k.trim();CFG.api=''}else{const u=prompt('Proxy URL (your Cloudflare Worker)');if(u&&u.trim()){CFG.api=u.trim()}}opusNote();renderConnect();toast(hasOpus()?'Opus connected':'Not connected')}
function opusNote(){$('opusst').textContent=hasOpus()?'on':''}
async function brief(){const p=$('ask').value.trim();if(!p){toast('Say what it’s for, or just edit on the right');$('ask').focus();return}
  if(state.kind==='story')return storyBrief(p);
  const l=p.toLowerCase();
  if(hasOpus()){$('ov').classList.add('on');$('ovp').textContent='Opus is reading the brief';window.leo&&leo.work();try{const out=jsonOf(await opus(SYSTEM(),`Brief: ${p}\nFormat: ${state.kind}.\nReturn JSON {"title":"short project title","headline":"<=48 chars, with one [blue phrase]","subhead":"<=110 chars or empty","cta":"2-3 words or empty","tagline":"one of the approved taglines or a 4-6 word closer with a [blue phrase]","background":"black|white|crosswalk|traveler|grass|sky|godrays|hero-learn|hero-ask|hero-next|hero-people|hero-accomplish","ratio":"16:9|1:1|4:5|9:16"}`));
    if(out){applyBrief(out);$('ov').classList.remove('on');window.leo&&leo.rest();toast('Opus drafted it. Everything on the right is yours.');return}}catch(e){toast('Opus error. Using the scripted draft.')}$('ov').classList.remove('on')}
  let out={title:'New asset'};
  if(/invite/.test(l))out={title:'Invites launch',headline:'Invites is here.',subhead:'Earn when your friends book their first session.',cta:'Invite a friend'};
  else if(/job/.test(l))out={title:'Jobs',headline:'Your next job is [already looking for you].',tagline:'Your next job is [already looking for you].',background:'white'};
  else if(/clip/.test(l))out={title:'Clips',headline:'Increase your reach, [with Clips].',tagline:'Increase your reach, [with Clips].',background:'white'};
  else if(/community|conversation/.test(l))out={title:'Community',headline:'One conversation could [open the door].',subhead:'Learn from people who’ve done it.',cta:'Come ask',tagline:'Talk to a [Human].',background:'hero-learn'};
  else if(/mba/.test(l))out={title:'MBA',headline:'Own your future.',subhead:'Work 1:1 with a coach who got in.',cta:'Find a coach',background:'crosswalk'};
  else if(/ai builder|aibp/.test(l))out={title:'AIBP',headline:'Built something with AI? [Show us].',subhead:'AI Builder Program grads: post your build on Leland.',cta:'Post it',background:'godrays'};
  else{const h=p.split(/[.,!—-]/)[0].slice(0,44);out={title:h.slice(0,28),headline:h.charAt(0).toUpperCase()+h.slice(1)}}
  if(/9:16|reel|stor/.test(l))out.ratio='9:16';else if(/1:1|square|meta|instagram/.test(l))out.ratio='1:1';
  if(/dark|black/.test(l))out.background='black';else if(/white|clean/.test(l))out.background='white';else if(/sky/.test(l))out.background='sky';
  applyBrief(out);toast('Drafted. Connect Opus under Me for real writing.')}
function applyBrief(out){setCopy(out.headline,out.subhead,out.cta);if(out.title)$('etitle').value=out.title;
  if(state.kind==='video'){const t=state.scenes.find(s=>s.type==='text');if(t&&out.headline)t.text=out.headline;const o=state.scenes.find(s=>s.type==='outro');if(o&&out.tagline)o.tag=out.tagline}
  applyBgWord(out.background);if(out.ratio)ratio({'16:9':'','1:1':'r11','4:5':'r45','9:16':'r916'}[out.ratio]||'');sync()}
function applyBgWord(w){if(!w)return;const map={crosswalk:'bg-crosswalk',traveler:'bg-traveler',grass:'bg-grass',sky:'bg-sky-1',godrays:'bg-godrays-'+String(1+Math.floor(Math.random()*12)).padStart(2,'0'),black:'bg-streaks',white:null};if(w.startsWith('hero-'))useBg(w);else if(w in map){if(map[w])useBg(map[w]);else{state.bg=null;renderSw()}}if(state.kind==='video'){state.dark=/black|godrays/.test(w);document.querySelectorAll('#themeseg button').forEach((b,i)=>b.classList.toggle('on',i===(state.dark?1:0)))}}
async function rewrite(){if(hasOpus()){$('ov').classList.add('on');$('ovp').textContent='Rewriting';try{const out=jsonOf(await opus(SYSTEM(),`Rewrite, sharper, same idea. Headline <=48 chars with one [blue phrase]. Subhead <=110.\nHeadline: ${$('fHead').value}\nSubhead: ${$('fSub').value}\nReturn JSON {"headline","subhead","cta"}`));if(out){setCopy(out.headline,out.subhead,out.cta);sync()}}catch(e){toast('Opus error')}$('ov').classList.remove('on');return}
  const alts=[['Get there, with the people [who’ve been there].','Learn from people who’ve done it.','Come ask'],['Ask anything. [Get real answers].','Questions, livestreams and experts in one feed.','Follow along'],['Your next move [starts here].','Free on iOS and Android.','Get the app'],['Talk to a [Human].','One conversation could open the door.','']];const a=alts[Math.floor(Math.random()*alts.length)];setCopy(...a);sync();toast('Rewritten (scripted). Connect Opus for real writing.')}

/* ---------- export ---------- */
const SIZES={'':[1920,1080],r11:[1080,1080],r45:[1080,1350],r916:[1080,1920]};
function loadImg(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src})}
function wrapText(ctx,text,maxW){const words=text.split(' '),lines=[];let line='';for(const w of words){const t=line?line+' '+w:w;if(ctx.measureText(t.replace(/[\[\]]/g,'')).width>maxW&&line){lines.push(line);line=w}else line=t}if(line)lines.push(line);if(lines.length>1&&lines[lines.length-1].split(' ').length===1){const prev=lines[lines.length-2].split(' ');if(prev.length>1){lines[lines.length-1]=prev.pop()+' '+lines[lines.length-1];lines[lines.length-2]=prev.join(' ')}}return lines}
function roundRect(x,X,Y,w,h,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()}
function drawRich(x,line,ax,y,align,ink){const parts=line.split(/(\[[^\]]+\])/).filter(Boolean);const widths=parts.map(p=>x.measureText(p.replace(/[\[\]]/g,'')).width);const tw=widths.reduce((a,b)=>a+b,0);let cx=align==='center'?ax-tw/2:align==='right'?ax-tw:ax;x.textAlign='left';parts.forEach((p,i)=>{const b=p.startsWith('[');x.fillStyle=b?'#2f5fd6':ink;x.fillText(p.replace(/[\[\]]/g,''),cx,y);cx+=widths[i]})}
async function fontsReady(){try{await document.fonts.load('500 100px Season');await document.fonts.load('400 40px Macan');await document.fonts.load('600 40px Macan')}catch(e){}}
async function renderStill(ratioKey,opts={}){const [W,H]=SIZES[ratioKey];const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');await fontsReady();
  const bg=A(opts.bg!==undefined?opts.bg:state.bg)||{};let light=!!bg.light;const L=opts.layers||state.layers;
  if(bg.src){const im=await loadImg(bg.src);const s=Math.max(W/im.width,H/im.height);x.drawImage(im,(W-im.width*s)/2,(H-im.height*s)/2,im.width*s,im.height*s);const g=x.createLinearGradient(0,0,0,H);if(light){g.addColorStop(0,'rgba(255,255,255,.05)');g.addColorStop(1,'rgba(255,255,255,.5)')}else{g.addColorStop(0,'rgba(0,0,0,.02)');g.addColorStop(1,'rgba(0,0,0,.5)')}x.fillStyle=g;x.fillRect(0,0,W,H)}else{x.fillStyle='#fff';x.fillRect(0,0,W,H);light=true}
  const ink=light?'#111':'#fff',m=Math.min(W,H),pad=W*.06,lm=await loadImg('assets/logomark.png');const lh=H*.042,lw=lm.width/lm.height*lh;x.save();if(!light)x.filter='invert(1)';x.drawImage(lm,pad,H*.06,lw,lh);x.restore();
  const gfx=A(L.gfx.id);if(gfx){const src=gfx.group==='org'&&gfx.mono&&bg.src?gfx.mono[light?'black':'white']:gfx.src;const im=await loadImg(src);const gw=W*L.gfx.s,gh=im.height/im.width*gw;if(gfx.group==='expert'){x.save();x.beginPath();x.arc(W*L.gfx.x+gw/2,H*L.gfx.y+gw/2,gw/2,0,Math.PI*2);x.clip();x.drawImage(im,W*L.gfx.x,H*L.gfx.y,gw,gw);x.restore()}else x.drawImage(im,W*L.gfx.x,H*L.gfx.y,gw,gh)}
  const shot=A(L.shot.id);if(shot){const im=await loadImg(shot.src);const sw=W*L.shot.s,sh=im.height/im.width*sw,sx=W*L.shot.x,sy=H*L.shot.y;x.save();x.shadowColor='rgba(0,0,0,.25)';x.shadowBlur=m*.03;x.shadowOffsetY=m*.01;roundRect(x,sx,sy,sw,sh,sw*.04);x.fillStyle='#fff';x.fill();x.restore();x.save();roundRect(x,sx,sy,sw,sh,sw*.04);x.clip();x.drawImage(im,sx,sy,sw,sh);x.restore()}
  const head=opts.head??$('fHead').value,sub=opts.sub??$('fSub').value,cta=opts.cta??$('fCta').value,sz=opts.size||state.size,hs=Math.round(m*.085*sz),ss=Math.round(hs*.36),cs=Math.round(hs*.31),maxW=W*L.copy.w;
  x.font=`500 ${hs}px Season, Georgia, serif`;const hl=wrapText(x,head,maxW);x.font=`400 ${ss}px Macan, sans-serif`;const sl=sub?wrapText(x,sub,Math.min(maxW,ss*36)):[];
  const align=state.center?'center':'left';const ax=W*L.copy.x;x.textBaseline='top';
  let y=H*L.copy.y;x.font=`500 ${hs}px Season, Georgia, serif`;hl.forEach(l=>{drawRich(x,l,ax,y,align,ink);y+=hs*1.05});
  if(sl.length){y+=ss*.7;x.font=`400 ${ss}px Macan, sans-serif`;x.globalAlpha=.85;x.textAlign=align;x.fillStyle=ink;sl.forEach(l=>{x.fillText(l,ax,y);y+=ss*1.35});x.globalAlpha=1}
  if(cta){y+=cs*.8;x.font=`600 ${cs}px Macan, sans-serif`;const tw=x.measureText(cta).width,bw=tw+cs*1.6,bh=cs*2;const bx=state.center?ax-bw/2:ax;x.fillStyle=light?'#111':'#fff';roundRect(x,bx,y,bw,bh,cs*.4);x.fill();x.fillStyle=light?'#fff':'#111';x.textAlign='left';x.fillText(cta,bx+cs*.8,y+cs*.5)}
  return new Promise(r=>c.toBlob(r,'image/png'))}
function dl(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),3000)}
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')||'le';
async function exportCurrent(){const name=slug($('etitle').value);
  if(state.kind==='still'){const r=state.ratio||'';const b=await renderStill(r);dl(b,`${name}-${SIZES[r].join('x')}.png`);addProject({t:$('etitle').value,m:'Image · '+SIZES[r].join('×'),th:(A(state.bg)||{}).thumb,kind:'still',bg:state.bg,head:$('fHead').value,sub:$('fSub').value,cta:$('fCta').value,layers:state.layers,size:state.size,center:state.center,ratio:r});toast('Downloaded')}
  else if(state.kind==='deck'){for(let i=0;i<slides.length;i++){const s=slides[i];const b=await renderStill('',{bg:s.bg,head:s.h,sub:s.s,cta:'',layers:DEF_LAYERS()});dl(b,`${name}-slide-${i+1}.png`);await new Promise(r=>setTimeout(r,250))}addProject({t:$('etitle').value,m:'Deck · '+slides.length+' slides',th:(A(slides[1]&&slides[1].bg)||{}).thumb,kind:'deck'});toast(slides.length+' slides downloaded')}
  else if(state.kind==='story')exportStory('carousel');
  else exportVideo()}
async function exportVideo(){stopPlay();const r=state.ratio||'';const [W,H]=SIZES[r];toast('Rendering '+total().toFixed(0)+'s of video in your browser…');
  const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');await fontsReady();
  const lm=await loadImg('assets/logomark.png');const dark=state.dark,ink=dark?'#fff':'#111',bgc=dark?'#111':'#fff',m=Math.min(W,H);
  const S=state.scenes;const media=[];for(const s of S){if(s.type==='shot'){media.push(await loadImg((A(s.asset)||{}).src))}else if(s.type==='clip'){const v=document.createElement('video');v.muted=true;v.playsInline=true;v.src=clipSrc(A(s.asset)||{});await new Promise(res=>{v.oncanplaythrough=res;v.onerror=res;v.load()});media.push(v)}else media.push(null)}
  let leoFrames=null;if(state.outro==='leo'&&S.some(s=>s.type==='outro')&&window.leo&&leo.bake){try{leoFrames=await leo.bake(Math.round(m*.5),dark)}catch(e){console.warn('leo bake',e)}}
  const stream=c.captureStream(30);let musicNode=null;
  if(state.music){try{const actx=new (window.AudioContext||window.webkitAudioContext)();const au=new Audio((A(state.music)||{}).src);au.crossOrigin='anonymous';await new Promise(r=>{au.oncanplaythrough=r;au.onerror=r;au.load()});const src=actx.createMediaElementSource(au);const dest=actx.createMediaStreamDestination();const gain=actx.createGain();gain.gain.value=.9;src.connect(gain).connect(dest);dest.stream.getAudioTracks().forEach(t=>stream.addTrack(t));musicNode={au,gain,actx}}catch(e){console.warn('music mix failed',e)}}
  const mime=['video/mp4;codecs=avc1','video/webm;codecs=vp9','video/webm'].find(mm=>MediaRecorder.isTypeSupported(mm))||'video/webm';const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:8e6});const chunks=[];rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);
  const T=total(),tr=preset('transition',MOTION.defaults.transition),fadeD=Math.max(.15,tr.dur||.3);
  const ease=EASE.inout,eo=EASE.out;
  function drawText(s,local,a){const hs=Math.round(m*.062);x.font=`500 ${hs}px Macan, sans-serif`;const lines=wrapText(x,s.text,W*.8);const y0=H/2-(lines.length-1)/2*hs*1.25;const p=preset('text',s.anim),E=EASE[p.ease]||eo;
    if(s.anim==='typed'){const n=Math.floor(plain(s.text).length*Math.min(1,local/(p.speed||1.2)));let shown=0;x.globalAlpha=a;lines.forEach((l,i)=>{const pl=plain(l);const take=Math.max(0,Math.min(pl.length,n-shown));shown+=pl.length+1;let cut='',seen=0;for(const ch of l){if(ch==='['||ch===']'){cut+=ch;continue}if(seen<take){cut+=ch;seen++}}drawRich(x,cut,W/2,y0+i*hs*1.25,'center',ink)});x.globalAlpha=1}
    else if(s.anim==='rise'){lines.forEach((l,i)=>{const u=Math.max(0,Math.min(1,(local-i*(p.stagger||.18))/(p.speed||.6)));x.globalAlpha=a*E(u);drawRich(x,l,W/2,y0+i*hs*1.25+(1-E(u))*hs*.6,'center',ink)});x.globalAlpha=1}
    else{let k=0;lines.forEach((l,i)=>{const parts=l.split(/(\[[^\]]+\])/).filter(Boolean);const words=[];parts.forEach(pp=>{const b=pp.startsWith('[');pp.replace(/[\[\]]/g,'').split(' ').forEach(w=>w&&words.push({w,b}))});x.textAlign='left';const tw=words.reduce((ss,w)=>ss+x.measureText(w.w+' ').width,0);let cx=W/2-tw/2;words.forEach(w=>{const u=Math.max(0,Math.min(1,(local-k*(p.stagger||.12))/(p.speed||.35)));k++;x.globalAlpha=a*E(u);x.fillStyle=w.b?'#2f5fd6':ink;x.save();x.translate(cx,y0+i*hs*1.25);x.scale(.85+.15*E(u),.85+.15*E(u));x.fillText(w.w,0,0);x.restore();cx+=x.measureText(w.w+' ').width})});x.globalAlpha=1}}
  function drawOutro(s,local,a,fout){const lh=m*.07;x.font=`600 ${Math.round(m*.052)}px Macan, sans-serif`;const ww=x.measureText('Leland').width;const lw=lm.width/lm.height*lh;const totalW=lw+m*.02+ww;const y=H/2-m*.09;const tag=s.tag||'Talk to a [Human].';const L=preset('logo',state.outro);const mode=leoFrames?'leo':state.outro==='leo'?'draw':state.outro;
    const wordP=preset('text','words'),E=EASE.out;
    if(mode==='leo'){const lf=leoFrames;const spinT=Math.min(1,local/1.1);const fi=Math.min(lf.length-1,Math.floor(spinT*(lf.length-1)));const settle=Math.max(0,Math.min(1,(local-1.1)/.4));const big=m*.5,size=big+(lh*1.6-big)*ease(settle);const cx=W/2+(W/2-totalW/2+lw/2-W/2)*ease(settle),cy=H/2+(y-H/2)*ease(settle);x.globalAlpha=Math.min(fout,1);x.drawImage(lf[fi],cx-size/2,cy-size/2,size,size);
      x.globalAlpha=settle*fout;x.fillStyle=ink;x.textAlign='left';x.fillText('Leland',W/2-totalW/2+lw+m*.02,y+m*.004)}
    else if(mode==='draw'){const d=L.dur||1.5;const drawT=Math.min(1,local/(d*.37)),hold=d*.37+.2,typeT=Math.max(0,Math.min(1,(local-hold)/(d*.3)));const shift=E(typeT);const mx=W/2-lw/2+(W/2-totalW/2-(W/2-lw/2))*shift;
      x.save();x.globalAlpha=Math.min(fout,1);x.beginPath();x.rect(mx-lw*.05,y-lh/2-lh*.1,lw*1.1*E(drawT),lh*1.2);x.clip();if(dark)x.filter='invert(1)';x.drawImage(lm,mx,y-lh/2,lw,lh);x.restore();
      const n=Math.floor(6*typeT);x.globalAlpha=fout;x.fillStyle=ink;x.textAlign='left';x.fillText('Leland'.slice(0,n),mx+lw+m*.02,y+m*.004)}
    else{const f=Math.min(1,local/(L.dur||.25));x.globalAlpha=f*a;x.save();if(dark)x.filter='invert(1)';x.drawImage(lm,W/2-totalW/2,y-lh/2,lw,lh);x.restore();x.fillStyle=ink;x.textAlign='left';x.fillText('Leland',W/2-totalW/2+lw+m*.02,y+m*.004)}
    const tagStart=mode==='fade'?.1:(L.dur||1.5)*.75;const tl=Math.max(0,local-tagStart);x.font=`500 ${Math.round(m*.05)}px Macan, sans-serif`;
    {const words=[];tag.split(/(\[[^\]]+\])/).filter(Boolean).forEach(pp=>{const b=pp.startsWith('[');pp.replace(/[\[\]]/g,'').split(' ').forEach(w=>w&&words.push({w,b}))});x.textAlign='left';const tw=words.reduce((ss,w)=>ss+x.measureText(w.w+' ').width,0);let cx=W/2-tw/2;words.forEach((w,k)=>{const u=Math.max(0,Math.min(1,(tl-k*(wordP.stagger||.1))/(wordP.speed||.45)));x.globalAlpha=E(u)*fout;x.fillStyle=w.b?'#2f5fd6':ink;x.fillText(w.w,cx,H/2+m*.02+(1-E(u))*m*.015);cx+=x.measureText(w.w+' ').width})}
    const ba=Math.max(0,Math.min(1,(tl-.4)/.4))*fout;x.globalAlpha=ba;x.font=`600 ${Math.round(m*.02)}px Macan, sans-serif`;const bs=['App Store','Google Play'];let bx=W/2-(x.measureText(bs[0]).width+x.measureText(bs[1]).width+m*.1)/2;const by=H/2+m*.11;bs.forEach(ss=>{const tw=x.measureText(ss).width+m*.03;x.strokeStyle=ink;x.lineWidth=2;roundRect(x,bx,by,tw,m*.045,m*.008);x.stroke();x.fillStyle=ink;x.textBaseline='middle';x.fillText(ss,bx+m*.015,by+m*.0225);bx+=tw+m*.04});x.globalAlpha=1}
  let lastIdx=-1;
  function draw(t){x.fillStyle=bgc;x.fillRect(0,0,W,H);const i=sceneAt(t);const s=S[i];const local=t-sceneStart(i);const D=sceneDur(s);const fin=Math.min(1,local/fadeD),fout=Math.min(1,(D-local)/fadeD);const a=Math.min(fin,fout);x.textBaseline='middle';
    if(i!==lastIdx){lastIdx=i;if(s.type==='clip'){const v=media[i];try{v.currentTime=0;v.play()}catch(e){}}}
    const push=tr.id==='push'&&local<fadeD?(1-eo(local/fadeD))*H*.08:0;x.save();x.translate(0,push);
    if(s.type==='text')drawText(s,local,a);
    else if(s.type==='shot'){const im=media[i];const sc=.72,sw=W*sc,sh=im.height/im.width*sw,sy=(H-sh)/2+(1-ease(fin))*H*.06;x.globalAlpha=a;x.save();x.shadowColor='rgba(0,0,0,.18)';x.shadowBlur=m*.06;x.shadowOffsetY=m*.02;roundRect(x,(W-sw)/2,sy,sw,sh,m*.012);x.fillStyle='#fff';x.fill();x.restore();x.save();roundRect(x,(W-sw)/2,sy,sw,sh,m*.012);x.clip();x.drawImage(im,(W-sw)/2,sy,sw,sh);x.restore();x.globalAlpha=1}
    else if(s.type==='clip'){const v=media[i];if(v&&v.videoWidth){const sc=Math.max(W/v.videoWidth,H/v.videoHeight);const vw=v.videoWidth*sc,vh=v.videoHeight*sc;x.globalAlpha=a;x.drawImage(v,(W-vw)/2,(H-vh)/2,vw,vh);x.globalAlpha=1}}
    else if(s.type==='outro')drawOutro(s,local,a,fout);
    x.restore();x.textAlign='left'}
  draw(0);rec.start(100);if(musicNode){musicNode.au.currentTime=0;musicNode.au.play().catch(()=>{})}const start=performance.now();
  await new Promise(done=>{const tick=()=>{const t=(performance.now()-start)/1000;if(t>=T){draw(T-.01);return done()}draw(t);requestAnimationFrame(tick)};requestAnimationFrame(tick)});
  if(musicNode){try{musicNode.gain.gain.linearRampToValueAtTime(0,musicNode.actx.currentTime+.4)}catch(e){}await new Promise(r=>setTimeout(r,450));musicNode.au.pause()}
  rec.stop();await new Promise(r=>rec.onstop=r);const ext=mime.includes('mp4')?'mp4':'webm';dl(new Blob(chunks,{type:mime}),`${slug($('etitle').value)}-${W}x${H}.${ext}`);
  const sh=S.find(s=>s.type==='shot'||s.type==='clip');addProject({t:$('etitle').value,m:'Video · '+T.toFixed(0)+'s · '+S.length+' scenes',th:sh?((A(sh.asset)||{}).poster||(A(sh.asset)||{}).thumb):'',kind:'video',scenes:S,music:state.music,dark:state.dark});toast('Video downloaded'+(ext==='webm'?' as .webm — Safari exports .mp4 natively':''))}

/* ---------- projects ---------- */
let projects=[];
function restoreProjects(){try{projects=JSON.parse(localStorage.getItem('le-projects')||'[]')}catch(e){projects=[]}renderProjects()}
function addProject(p){projects.unshift({...p,at:new Date().toISOString()});projects=projects.slice(0,60);try{localStorage.setItem('le-projects',JSON.stringify(projects))}catch(e){}renderProjects()}
function renderProjects(){$('projlist').innerHTML=projects.length?projects.map((p,i)=>`<div class="row" onclick="openProject(${i})"><div class="th" style="background-image:url('${p.th||''}')"></div><div><div class="t">${esc(p.t)}</div><div class="m">${esc(p.m)} · ${new Date(p.at).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</div></div><div class="r"><span class="tag">${p.kind}</span></div></div>`).join(''):`<div class="empty big"><button class="btn black" onclick="go('make')">Make something</button></div>`}
function openProject(i){const p=projects[i];if(p.kind==='still'){state.kind='still';setCopy(p.head,p.sub,p.cta);if(p.layers)state.layers=JSON.parse(JSON.stringify(p.layers));state.size=p.size||1;state.center=!!p.center;state.bg=p.bg;$('etitle').value=p.t;start('still',true);ratio(p.ratio||'')}
  else if(p.kind==='video'&&p.scenes){state.scenes=JSON.parse(JSON.stringify(p.scenes));state.music=p.music;state.dark=!!p.dark;state.scene=0;$('etitle').value=p.t;start('video',true)}
  else if(p.kind==='story'&&p.story){storyLoad(p.story);$('etitle').value=p.t;start('story',true)}
  else toast(p.m)}

/* ---------- connect ---------- */
const CONNS={create:[
  {id:'figma',n:'Figma',d:'Product illustrations, brand file',st:()=>'Connected · 299 illustrations'},
  {id:'drive',n:'Google Drive',d:'Brand library, coach images, launch kit',st:()=>'Connected · brand library'},
  {id:'notion',n:'Notion',d:'Case study drafts, post copy',st:()=>'Connected'},
  {id:'opus',n:'Claude Opus',d:'Writes copy inside the guardrails',st:()=>hasOpus()?'Connected':'',act:'connectOpus()'},
  {id:'slack',n:'Slack',d:'Where requests come from',st:()=>'Connected'}],
  dist:[
  {id:'linkedin',n:'LinkedIn',d:'Posts, carousels, company page',st:()=>''},
  {id:'instagram',n:'Instagram',d:'Posts, reels, stories',st:()=>''},
  {id:'meta',n:'Meta Ads',d:'Spend and results per creative',st:()=>''},
  {id:'gads',n:'Google Ads',d:'Spend and results per creative',st:()=>''},
  {id:'youtube',n:'YouTube',d:'Films and clips',st:()=>''},
  {id:'posthog',n:'PostHog',d:'What happens after the click',st:()=>''}]};
const LOGO_SVG={figma:'<path d="M9 3h6a3 3 0 010 6H9zM9 9h6a3 3 0 010 6H9zM9 15h3a3 3 0 11-3 3z"/><path d="M15 9a3 3 0 110 6 3 3 0 010-6z"/>',drive:'<path d="M8 4h8l5 9-4 7H7l-4-7z"/><path d="M8 4l4 9h9M12 13l-4 7"/>',notion:'<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 16V8l6 8V8"/>',opus:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',slack:'<path d="M9 4v6M15 14v6M4 15h6M14 9h6M9 10a2 2 0 11-2-2M15 14a2 2 0 112 2M10 15a2 2 0 11-2 2M14 9a2 2 0 112-2"/>',linkedin:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 10v6M8 7v.5M12 16v-3.5a2 2 0 014 0V16"/>',instagram:'<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.5"/><path d="M17 7v.5"/>',meta:'<path d="M3 16c2-8 5-8 9 0 4-8 7-8 9 0"/>',gads:'<path d="M6 17l6-10 6 10"/><circle cx="6" cy="17" r="2"/>',youtube:'<rect x="3" y="6" width="18" height="12" rx="4"/><path d="M10 9l5 3-5 3z"/>',posthog:'<path d="M4 18l6-6 4 4 6-6"/>'};
function renderConnect(){const row=c=>{const s=c.st();return `<div class="conn ${s?'on':''}"><svg class="ico" viewBox="0 0 24 24">${LOGO_SVG[c.id]||''}</svg><div><b>${c.n}</b><span>${c.d}</span></div><button class="btn sm ${s?'':'black'}" onclick="${c.act||`connReq('${c.n}')`}">${s||'Connect'}</button></div>`};
  $('connCreate').innerHTML=CONNS.create.map(row).join('');$('connDist').innerHTML=CONNS.dist.map(row).join('');
  const rows=projects.map(p=>`<div class="prow"><div class="th" style="background-image:url('${p.th||''}')"></div><div class="t">${esc(p.t)}</div><div>${esc(p.m)}</div><div>${p.where||'Downloaded'}</div><div class="dim">—</div><div class="dim">—</div></div>`).join('');
  $('placements').innerHTML=`<div class="prow head"><div></div><div>Asset</div><div>Format</div><div>Where</div><div>Spend</div><div>Results</div></div>${rows||'<div class="empty">Nothing made yet.</div>'}`}
function connReq(n){copyText(`LE needs ${n} access: an API token or ad-account read access so assets can be matched to spend and results.`,`${n} isn’t wired yet. Request text copied for the dev team.`)}

/* ---------- brand ---------- */
let B=null;
async function renderBrand(){try{B=await (await fetch('data/brand.json')).json()}catch(e){B=null}const b=M.brand;
  const ills=byGroup('illustration');const pick=[0,37,74,111,148,185,222,259].map(i=>ills[i]).filter(Boolean);
  const secs=[['thesis','Thesis'],['principles','Principles'],['voice','Voice'],['rules','Do and don’t'],['look','Look'],['audience','Who it’s for']];
  $('bnav').innerHTML=secs.map(([k,n])=>`<a href="#brand" onclick="event.preventDefault();$('b-${k}').scrollIntoView({behavior:'smooth',block:'start'})">${n}</a>`).join('');
  if(!B){$('brandbody').innerHTML='<div class="empty">data/brand.json is missing.</div>';return}
  $('brandbody').innerHTML=`
  <section class="bsec" id="b-thesis"><h2 class="big">${blue(B.thesis.headline)}</h2><div class="prose">${B.thesis.body.map(p=>`<p>${esc(p)}</p>`).join('')}</div></section>
  <section class="bsec" id="b-principles"><h2>Principles</h2><div class="pgrid">${B.principles.map(p=>`<div><b>${esc(p.name)}</b><span>${esc(p.desc)}</span></div>`).join('')}</div></section>
  <section class="bsec" id="b-voice"><h2>Voice</h2><p class="lead">${esc(B.voice.summary)}</p><div class="two">
    <div class="vcol"><h3>Sounds like</h3><ul>${B.voice.sounds_like.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></div>
    <div class="vcol"><h3>Not like</h3><ul class="no">${B.voice.not_like.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></div></div>
    <div class="two" style="margin-top:20px"><div class="vcol"><h3>Words we use</h3><div class="words">${B.voice.words_we_use.map(s=>`<span>${esc(s)}</span>`).join('')}</div></div><div class="vcol"><h3>Words we avoid</h3><div class="words no">${B.voice.words_we_avoid.map(s=>`<span>${esc(s)}</span>`).join('')}</div></div></div>
    <h3 style="margin-top:28px">Taglines</h3><div class="list" id="taglist">${(b.taglines||[]).map(t=>`<div class="row" onclick="useTagline(${JSON.stringify(t)})"><div class="t" style="font-family:var(--serif);font-weight:500;font-size:1.125rem">${esc(t)}</div><span class="r link">Use</span></div>`).join('')}</div></section>
  <section class="bsec" id="b-rules"><h2>Do and don’t</h2><div class="two"><div class="rulecol do">${B.dos.map(s=>`<div><i>Do</i>${esc(s)}</div>`).join('')}</div><div class="rulecol dont">${B.donts.map(s=>`<div><i>Don’t</i>${esc(s)}</div>`).join('')}</div></div></section>
  <section class="bsec" id="b-look"><h2>Look</h2>
    <div class="kit">
      <div class="kcard"><div class="hd"><h2>Logo</h2></div><div class="logos"><div style="background:#fff;color:#111"><img src="assets/logomark.png" alt="">Leland</div><div style="background:#111;color:#fff"><img src="assets/logomark.png" alt="" style="filter:invert(1)">Leland</div><div style="background:var(--g2);color:#111"><img src="assets/logomark.png" alt=""></div></div><p class="note">${esc(B.visual.logo)}</p></div>
      <div class="kcard"><div class="hd"><h2>Type</h2></div><div class="specimen"><div class="s" style="font-family:var(--serif)">Season</div><div class="m">Headlines · Medium</div></div><div class="specimen"><div class="s" style="font-family:var(--sans);font-weight:600">Macan</div><div class="m">Everything else · Book, Medium, SemiBold</div></div><p class="note">${esc(B.visual.type)}</p></div>
      <div class="kcard"><div class="hd"><h2>Color</h2></div><div class="swatches"><div style="background:#111"></div><div style="background:#4c4c4c"></div><div style="background:#767676"></div><div style="background:#eee"></div><div style="background:#fff"></div><div style="background:#2f5fd6"></div><div style="background:#80aced"></div><div style="background:#ffd667"></div></div><p class="note">${esc(B.visual.color)}</p></div>
      <div class="kcard"><div class="hd"><h2>Photography</h2><button class="link" onclick="go('lib','photo')">Photos</button></div><div class="photorow">${byGroup('photo').slice(0,3).map(a=>`<div style="background-image:url('${a.thumb||a.src}')" onclick="openAsset('${a.id}')"></div>`).join('')}</div><p class="note">${esc(B.visual.photography)}</p></div>
      <div class="kcard wide"><div class="hd"><h2>Illustration</h2><button class="link" onclick="go('lib','illustration')">All 299</button></div><div class="illrow">${pick.map(a=>`<div onclick="openAsset('${a.id}')"><img src="${a.src}" alt=""></div>`).join('')}</div><p class="note">${esc(B.visual.illustration)}</p></div>
      <div class="kcard wide"><div class="hd"><h2>Motion</h2><button class="link" onclick="go('motion')">Presets</button></div><p class="note">${esc(B.visual.motion)}</p></div>
    </div></section>
  <section class="bsec" id="b-audience"><h2>Who it’s for</h2><div class="pgrid">${B.audience.map(p=>`<div><b>${esc(p.name)}</b><span>${esc(p.desc)}</span></div>`).join('')}</div></section>`}
const SKILL=()=>`---
name: le
description: Leland's brand asset library. Use whenever making any Leland marketing asset, post, image, video, case study or deck — to find approved images, videos, scenes, illustrations, logos, coach photos, music, taglines and post copy, and to stay inside the brand guardrails.
---
# LE — Leland asset library

Manifest: ${base()}data/manifest.json
Fetch it first. Every entry has id, type, group, title, tags and src (relative to ${base()}).

Groups: hero, header, card, aibp, aipost (launch kit images) · film, kit (videos) · scene (video scenes, style: intro|text|product|outro) · gif (looping sales concepts, src .gif, mp4) · background, photo · expert (headshots) · graphic · illustration (299 blue line illustrations, set: social|work|growth) · org (199 logos, kind: school|company, mono.black / mono.white) · icon · music (thumb = waveform art).
Copy: manifest.posts (12 post ideas, verbatim) and manifest.brand.taglines.

Rules (manifest.brand.guardrails):
${(M.brand.guardrails||[]).map(g=>'- '+g).join('\n')}

Type: Season for headlines (weight 500), Macan for everything else. Monochrome plus photography. One blue phrase per headline, never more. Logomark never yellow.
Case studies: company logo from org, headline with one number, who they are, before, what they built (person, role, build, result), one quote, close with "let's chat". Outputs: LinkedIn carousel (5 slides 4:5), web page, post text.
When asked for an asset, pick from the manifest by tags and return the full URL. Do not invent assets.`;
