/* LE — Leland's asset engine */
const $=id=>document.getElementById(id);
let M={brand:{},assets:[],posts:[]};
let state={kind:'still',tab:'kit',q:'',bg:null,shot:null,pos:'bot',center:false,dark:false,music:null,slide:0};
const A=id=>M.assets.find(a=>a.id===id);
const byGroup=(...g)=>M.assets.filter(a=>g.includes(a.group));
const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const blue=s=>esc(s).replace(/\[([^\]]+)\]/g,'<em>$1</em>');
const plain=s=>String(s||'').replace(/[\[\]]/g,'');
const base=()=>location.href.replace(/[#?].*$/,'').replace(/[^/]*$/,'');

/* ---------- boot ---------- */
async function boot(){
  try{M=await (await fetch('data/manifest.json')).json()}catch(e){toast('Could not load data/manifest.json. Serve the folder (npx serve .) rather than opening the file.');}
  renderTabs();renderLib();if($('queue'))renderQueue();renderBrand();renderProjects();renderSw();renderGfxSw();renderShotSw();renderMusic();
  setCopy('Own your future.','Work 1:1 with a coach who got in.','Find a coach');state.bg='bg-crosswalk';renderSw();sync();
  route();window.addEventListener('hashchange',route);
  document.fonts.ready.then(()=>{const s=document.fonts.check('500 16px Season'),m=document.fonts.check('400 16px Macan');$('fontst').textContent=s&&m?'Season + Macan loaded':s?'Season loaded · Macan missing':'Fonts missing — check fonts/'});
  opusNote();restoreProjects();
}
document.addEventListener('DOMContentLoaded',boot);

/* ---------- routing (hash = back button works everywhere) ---------- */
function route(){
  const h=location.hash.slice(1)||'make';const [scr,arg]=h.split('/');
  if(scr==='asset'&&arg){showPreview(arg,true);return}
  closePreview(true);
  const id=['make','lib','editor','projects','brand'].includes(scr)?scr:'make';
  document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on',s.id===id));
  document.querySelectorAll('.side a').forEach(a=>a.classList.toggle('on',a.id==='s-'+id));
  $('main').scrollTop=0;stopPlay();
  if(id==='lib'&&arg){state.tab=arg;renderTabs();renderLib()}
  if(id==='brand'&&arg==='claude')setTimeout(()=>$('claude').scrollIntoView({behavior:'smooth'}),50);
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

/* ---------- library ---------- */
const TABS=[['kit','Launch kit',['hero','header','card','aibp','aipost']],['video','Videos',['film','kit']],['bg','Backgrounds',['background']],['photo','Photos',['photo']],['graphic','Graphics',['graphic']],['category','Illustrations',['category']],['org','Logos',['org']],['icon','Icons',['icon']],['music','Music',['music']],['copy','Copy',['copy']]];
function renderTabs(){$('tabs').innerHTML=TABS.map(([k,n,g])=>`<button class="${state.tab===k?'on':''}" onclick="go('lib','${k}')">${n}<small>${k==='copy'?M.posts.length+(M.brand.taglines||[]).length:byGroup(...g).length}</small></button>`).join('')}
function searchLib(q){state.q=q.toLowerCase();if(!isOn('lib'))go('lib');renderLib()}
function match(a){const q=state.q;if(!q)return true;return ((a.title||'')+' '+(a.sub||'')+' '+(a.tags||[]).join(' ')+' '+(a.text||'')).toLowerCase().includes(q)}
function card(a){
  const q=state.q;
  if(a.type==='video')return `<div class="card" onclick="openAsset('${a.id}')"><div class="th" style="background-image:url('${a.poster}')"><span class="pl"><svg width="13" height="13" viewBox="0 0 24 24" fill="#111"><path d="M8 5v14l11-7z"/></svg></span>${a.duration?`<span class="dur">0:${String(a.duration).padStart(2,'0')}</span>`:''}</div><div class="t">${esc(a.title)}</div><div class="m">${esc(a.sub||a.group)}</div></div>`;
  if(a.type==='audio')return `<div class="card music" onclick="openAsset('${a.id}')"><div class="th">${wave()}</div><div class="t">${esc(a.title)}</div><div class="m">${a.duration}s · from the launch film</div></div>`;
  if(a.type==='icon')return `<div class="card" onclick="openAsset('${a.id}')"><div class="th icon"><img loading="lazy" src="${a.src}" alt=""></div><div class="m" style="text-align:center;margin-top:6px">${esc(a.title)}</div></div>`;
  if(a.group==='graphic'||a.group==='category'||a.group==='org')return `<div class="card" onclick="openAsset('${a.id}')"><div class="th contain ${a.group==='org'?'sq':'r43'}"><img loading="lazy" src="${a.src}" alt=""></div><div class="t">${esc(a.title)}</div></div>`;
  if(a.group==='copy')return `<div class="card copy" onclick="openAsset('${a.id}')"><div class="th">${esc(a.title)}</div><div class="m">${esc(a.sub)}</div></div>`;
  return `<div class="card" onclick="openAsset('${a.id}')"><div class="th ${a.group==='photo'?'r43':''}" style="background-image:url('${a.thumb||a.src}')"></div><div class="t">${esc(a.title)}</div><div class="m">${esc(a.group==='background'?(a.tags||[]).filter(t=>t!=='background').slice(0,3).join(' · '):a.sub||a.group)}</div></div>`}
function copyItems(){return (M.brand.taglines||[]).map((t,i)=>({id:'tag-'+i,type:'copy',group:'copy',title:t,sub:'Approved tagline',text:t,tags:['tagline']})).concat(M.posts.map(p=>({id:'post-'+p.id,type:'copy',group:'copy',title:p.title,sub:`Post idea ${p.num} · ${p.platform}${p.group==='aibp'?' · AIBP':''}`,text:p.text,idea:p.idea,works:p.works,assets:p.assets,tags:['post',p.platform,p.group]})))}
function allItems(){return M.assets.concat(copyItems())}
function renderLib(){
  const tab=TABS.find(t=>t[0]===state.tab)||TABS[0];let items=state.q?allItems():(tab[0]==='copy'?copyItems():byGroup(...tab[2]));
  items=items.filter(match);const g=$('grid');g.className='grid'+(tab[0]==='icon'&&!state.q?' icons':'')+(tab[0]==='video'?' wide':'')+(tab[0]==='org'?' icons':'');
  g.innerHTML=items.map(card).join('')||'<div class="empty">Nothing matches.</div>';
  $("libnote").textContent=""}
const wave=()=>'<div class="wave">'+Array.from({length:14},()=>`<i style="height:${15+Math.random()*85}%"></i>`).join('')+'</div>';

/* ---------- preview (in place, back route) ---------- */
let pvList=[],pvIdx=-1,pvPushed=false;
function openAsset(id){pvList=[...document.querySelectorAll('#grid .card, #queue .qitem')].map(el=>el.dataset.id||null).filter(Boolean);if(!pvList.length)pvList=[id];pvIdx=pvList.indexOf(id);if(pvIdx<0){pvList=[id];pvIdx=0}pvPushed=true;location.hash='asset/'+id}
function stepPreview(d){if(!pvList.length)return;pvIdx=(pvIdx+d+pvList.length)%pvList.length;location.hash='asset/'+pvList[pvIdx]}
function showPreview(id){
  const a=allItems().find(x=>x.id===id);if(!a)return;const st=$('pvstage'),sd=$('pvside');st.className='stage';
  const url=base()+a.src;
  if(a.type==='video')st.innerHTML=`<video src="${a.src}" poster="${a.poster}" controls autoplay playsinline></video>`;
  else if(a.type==='audio')st.innerHTML=`<div style="width:100%"><div style="background:#111;border-radius:10px;padding:40px;display:flex;justify-content:center;margin-bottom:14px">${wave()}</div><audio src="${a.src}" controls autoplay></audio></div>`;
  else if(a.type==='icon'){st.classList.add('icon');st.innerHTML=`<img src="${a.src}" alt="">`}
  else if(a.type==='copy')st.innerHTML=`<div class="copytext ${a.text.length>80?'post':''}">${esc(a.text)}</div>`;
  else st.innerHTML=`<img src="${a.src}" alt="">`;
  const tags=(a.tags||[]).slice(0,5).map(t=>`<span class="tag">${esc(t)}</span>`).join('');
  let actions='';
  if(a.type==='copy')actions=`<button class="btn black" onclick="copyText(${JSON.stringify(a.text)},'Copied')">Copy text</button>${a.id.startsWith('tag')?`<button class="btn" onclick="useTagline(${JSON.stringify(a.text)})">Use as headline</button>`:''}`;
  else if(a.type==='audio')actions=`<button class="btn black" onclick="closePreview(true);pickMusic('${a.id}');start('video')">Use in a video</button><a class="btn" href="${a.src}" download>Download</a>`;
  else if(a.type==='video')actions=`<a class="btn black" href="${a.src}" download>Download</a>`;
  else if(a.type==='icon')actions=`<button class="btn black" onclick="copySvg('${a.src}')">Copy SVG</button><a class="btn" href="${a.src}" download>Download</a>`;
  else{const isBg=['background','photo','hero','header','aibp'].includes(a.group),isGfx=['graphic','category','icon','org'].includes(a.group),isShot=['card','aipost','hero','upload'].includes(a.group);
    actions=`${isBg?`<button class="btn black" onclick="closePreview(true);useBg('${a.id}');start('still',true)">Use as background</button>`:''}${isGfx?`<button class="btn black" onclick="closePreview(true);start('still',true);useGfx('${a.id}')">Add to an image</button>`:''}${isShot?`<button class="btn ${isBg?'':'black'}" onclick="closePreview(true);useShot('${a.id}');start('video',true)">Use in a video</button><button class="btn" onclick="closePreview(true);start('still',true);useShot('${a.id}')">Add to an image</button>`:''}<a class="btn" href="${a.src}" download>Download</a>`}
  sd.innerHTML=`<h2>${esc(a.title)}</h2><div class="m">${esc(a.sub||'')}${a.best?`<br><b style="color:var(--ink)">Best for:</b> ${esc(a.best)}`:''}${a.idea?`<br><br>${esc(a.idea)}`:''}</div><div class="tags">${tags}</div>${actions}<div class="spacer"></div><button class="btn ghost" onclick="copyText('LE asset: ${esc(a.title)} — ${a.type==='copy'?'':url}${a.type==='copy'?JSON.stringify(a.text).slice(1,-1):''}','Copied for Claude')">Copy for Claude</button>`;
  $('pv').classList.add('on');
}
function closePreview(silent){const pv=$('pv');if(!pv.classList.contains('on'))return;pv.classList.remove('on');pv.querySelectorAll('video,audio').forEach(v=>v.pause());$('pvstage').innerHTML='';if(!silent&&location.hash.startsWith('#asset/')){if(pvPushed)history.back();else location.hash=state.tab?'lib/'+state.tab:'lib'}pvPushed=false}
async function copySvg(src){try{const t=await (await fetch(src)).text();copyText(t,'SVG copied')}catch(e){copyText(base()+src,'Link copied')}}

/* ---------- ready to post (3 clicks) ---------- */
const PLATFORMS=['LinkedIn','Instagram','X','TikTok','Email'];
const WHEN=['Now','Tomorrow 9am','Mon 9am','Thu 9am'];
let queue=[];
function defaultQueue(){const picks=[['idea-1','hero-learn'],['idea-4','card-kevin'],['idea-10','aibp-community']];return picks.map(([pid,aid])=>{const p=M.posts.find(x=>x.id===pid);return{id:'q-'+pid,post:pid,asset:aid,title:p?p.title:'',text:p?p.text:'',platform:p?({linkedin:'LinkedIn',x:'X'}[p.platform]||'LinkedIn'):'LinkedIn',when:'Tomorrow 9am'}})}
function renderQueue(){
  try{queue=JSON.parse(localStorage.getItem('le-queue')||'null')||defaultQueue()}catch(e){queue=defaultQueue()}
  const q=$('queue');q.innerHTML=queue.slice(0,6).map(it=>{const a=A(it.asset)||{};const th=a.poster||a.thumb||a.src||'';return `<div class="qitem ${it.done?'done':''}" data-id="${it.asset}"><div class="th" style="background-image:url('${th}')" onclick="openAsset('${it.asset}')">${a.type==='video'?'<span class="pl"><svg width="13" height="13" viewBox="0 0 24 24" fill="#111"><path d="M8 5v14l11-7z"/></svg></span>':''}</div><div class="body"><div class="t">${esc(it.title)}</div><div class="m">${esc((it.text||'').split('\n')[0])}</div>
    <div class="row"><select class="sel sm" onchange="qset('${it.id}','platform',this.value)">${PLATFORMS.map(p=>`<option ${p===it.platform?'selected':''}>${p}</option>`).join('')}</select><select class="sel sm" onchange="qset('${it.id}','when',this.value)">${WHEN.map(w=>`<option ${w===it.when?'selected':''}>${w}</option>`).join('')}</select><button class="btn sm black" onclick="schedule('${it.id}')">${it.done?'Scheduled':'Schedule'}</button></div></div></div>`}).join('');
  $('qnote').textContent=queue.filter(x=>!x.done).length+' waiting · pick where, pick when, done';
}
function qset(id,k,v){const it=queue.find(x=>x.id===id);if(it){it[k]=v;it.done=false;saveQueue()}}
function saveQueue(){try{localStorage.setItem('le-queue',JSON.stringify(queue))}catch(e){}}
function schedule(id){const it=queue.find(x=>x.id===id);if(!it)return;it.done=true;it.at=new Date().toISOString();saveQueue();
  const a=A(it.asset)||{};addProject({t:it.title,m:`Scheduled · ${it.platform} · ${it.when}`,th:a.poster||a.thumb||a.src,kind:'post',asset:it.asset});
  copyText(it.text,`Scheduled for ${it.platform}, ${it.when}. Post text copied — paste it when it goes out.`);renderQueue();
  setTimeout(()=>{queue=queue.filter(x=>!x.done).concat(queue.filter(x=>x.done));saveQueue();renderQueue()},1500)}
function queueAsset(aid){const a=A(aid);const p=M.posts.find(p=>(p.assets||[]).includes(aid))||M.posts[0];queue.unshift({id:'q-'+Date.now(),post:p.id,asset:aid,title:a.title,text:p.text,platform:'LinkedIn',when:'Tomorrow 9am'});saveQueue();closePreview();go('make');toast('Added to Ready to post')}
function queueFromPost(pid){const p=M.posts.find(x=>x.id===pid);if(!p)return;queue.unshift({id:'q-'+Date.now(),post:pid,asset:p.assets[0],title:p.title,text:p.text,platform:{linkedin:'LinkedIn',x:'X'}[p.platform]||'LinkedIn',when:'Tomorrow 9am'});saveQueue();closePreview();go('make');toast('Added to Ready to post')}

/* ---------- editor ---------- */
const DEF_LAYERS=()=>({copy:{x:.07,y:.62,w:.72},gfx:{id:null,x:.62,y:.12,s:.3},shot:{id:null,x:.56,y:.18,s:.42}});
Object.assign(state,{layers:DEF_LAYERS(),sel:'copy',anim:'typed',outro:'leo',size:1});
function start(k,keep){state.kind=k;stopPlay();
  if(!keep){state.layers=DEF_LAYERS();state.size=1;$('fSize').value=1;
    if(k==='still'){setCopy('Own your future.','Work 1:1 with a coach who got in.','Find a coach');state.bg='bg-crosswalk';$('etitle').value='Untitled image'}
    if(k==='video'){setCopy('One conversation could [open the door].','','');$('etitle').value='Untitled video';state.shot='card-kevin';state.tag='Talk to a [Human].';if(!state.music)state.music='audio-onconversation'}
    if(k==='deck'){$('etitle').value='Untitled deck';initDeck()}}
  renderSw();renderGfxSw();renderShotSw();renderMusic();
  ratio(k==='video'?'':k==='still'?'r11':'');$('ask').value='';
  history.replaceState(null,'','#editor');route();sync();setTimeout(()=>$('ask').focus(),60)}
function setCopy(h,s,c){$('fHead').value=h||'';$('fSub').value=s||'';$('fCta').value=c||''}
function useTagline(t){setCopy(t,'','');closePreview(true);start('still',true);sync();toast('Tagline applied')}
function useBg(id){state.bg=id;renderSw();sync()}
function useGfx(id){state.layers.gfx.id=id;state.sel='gfx';renderGfxSw();sync()}
function useShot(id){state.shot=id;if(state.kind==='still'){state.layers.shot.id=id;state.sel='shot'}renderShotSw();sync()}
function uploadShot(f){if(!f)return;const r=new FileReader();r.onload=()=>{const id='upload-'+Date.now();M.assets.push({id,type:'image',group:'upload',title:f.name,src:r.result,thumb:r.result,tags:['upload']});useShot(id)};r.readAsDataURL(f)}
function ratio(c){state.ratio=c;document.querySelectorAll('#ratio button').forEach(b=>b.classList.toggle('on',(b.textContent==='16:9'&&!c)||(b.textContent==='1:1'&&c==='r11')||(b.textContent==='4:5'&&c==='r45')||(b.textContent==='9:16'&&c==='r916')));sync()}
function align(el,c){state.center=c;el.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el));sync()}
function vtheme(el,d){state.dark=d;el.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el));sync()}
function setAnim(el,a){state.anim=a;el.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el))}
function setOutro(el,a){state.outro=a;el.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el))}
function renderPos(){}
const swBtn=(a,on,fn)=>`<button class="${on?'on':''}" style="background-image:url('${a.thumb||a.src}');${a.group==='graphic'||a.group==='category'||a.group==='icon'?'background-size:contain;background-repeat:no-repeat;background-color:#fff':''}" title="${esc(a.title)}" onclick="${fn}"></button>`;
function renderSw(){$('sw').innerHTML=byGroup('background').slice(0,6).concat(byGroup('hero').slice(0,3)).map(a=>swBtn(a,state.bg===a.id,`useBg('${a.id}')`)).join('')+`<button class="more" onclick="openDrawer('bg')">…</button>`}
function renderGfxSw(){const g=state.layers.gfx;$('gfxsw').innerHTML=`<button class="more ${!g.id?'on':''}" onclick="state.layers.gfx.id=null;renderGfxSw();sync()">×</button>`+byGroup('graphic').concat(byGroup('category')).slice(0,8).map(a=>swBtn(a,g.id===a.id,`useGfx('${a.id}')`)).join('')+`<button class="more" onclick="openDrawer('gfx')">…</button>`;$('gfxSizeWrap').style.display=g.id?'':'none';$('gfxSize').value=g.s}
function renderShotSw(){const cur=state.kind==='still'?state.layers.shot.id:state.shot;$('shotsw').innerHTML=(state.kind==='still'?`<button class="more ${!cur?'on':''}" onclick="state.layers.shot.id=null;renderShotSw();sync()">×</button>`:'')+byGroup('card','aipost','upload').slice(0,8).map(a=>swBtn(a,cur===a.id,`useShot('${a.id}')`)).join('')+`<button class="more" onclick="openDrawer('shot')">…</button>`}
function renderMusic(){$('music').innerHTML=byGroup('music').map(a=>`<button class="${state.music===a.id?'on':''}" onclick="pickMusic('${a.id}')">${wave()}${esc(a.title)}<small>${a.duration}s</small></button>`).join('')+`<button class="${state.music===null?'on':''}" onclick="pickMusic(null)"><span style="width:34px"></span>No music</button>`}
function pickMusic(id){state.music=id;renderMusic()}
function hsFor(){const f=$('frame');return Math.min(f.clientWidth,f.clientHeight)*.085}
function sync(){
  const f=$('frame'),k=state.kind,bg=A(state.bg)||{},L=state.layers;const isVid=k==='video',isDeck=k==='deck';
  const gfx=A(L.gfx.id),shot=A(L.shot.id);
  f.className='frame '+(state.ratio||'')+(isVid?' vid'+(state.dark?' dark':''):(bg.src?' photo'+(bg.light?' light':''):' light'))+(state.center?' center':'')+(gfx?' has-gfx':'')+(shot?' has-shotL':'');
  f.style.backgroundImage=isVid?'':`url('${bg.src||''}')`;if(!isVid&&!bg.src)f.style.backgroundColor='#fff';
  f.style.setProperty('--hs',hsFor()+'px');f.style.setProperty('--sz',state.size);
  $('pHead').innerHTML=blue($('fHead').value);$('pSub').textContent=$('fSub').value;$('pCta').textContent=$('fCta').value;$('fSizeV').textContent=Math.round(state.size*100)+'%';
  const cp=$('copy');cp.style.left=L.copy.x*100+'%';cp.style.top=L.copy.y*100+'%';cp.style.width=L.copy.w*100+'%';cp.style.transform=state.center?'translateX(-50%)':'';cp.style.textAlign=state.center?'center':'left';
  const g=$('gfxLayer');g.style.left=L.gfx.x*100+'%';g.style.top=L.gfx.y*100+'%';g.style.width=L.gfx.s*100+'%';$('gfxImg').src=gfx?gfx.src:'';
  const s=$('shotLayer');s.style.left=L.shot.x*100+'%';s.style.top=L.shot.y*100+'%';s.style.width=L.shot.s*100+'%';$('shotImg').src=shot?shot.src:'';
  ['copy','gfxLayer','shotLayer'].forEach(id=>$(id).classList.toggle('sel',state.sel===({copy:'copy',gfxLayer:'gfx',shotLayer:'shot'}[id])&&!isVid));
  $('vHook').innerHTML=blue($('fHead').value);const vs=A(state.shot)||{};$('vShot').src=vs.src||'';if(document.activeElement!==$('fTag'))$('fTag').value=state.tag||'';$('vTag').innerHTML=blue(state.tag||'Talk to a [Human].');
  ['copy','lgLayer','gfxLayer','shotLayer'].forEach(id=>$(id).style.display=isVid?'none':'');
  ['secBg','secGfx','fCtaWrap','fSubWrap','fSizeWrap','fAlignWrap'].forEach(id=>$(id).style.display=isVid?'none':'');
  ['secMotion','secTiming','secMusic','fTagWrap'].forEach(id=>$(id).style.display=isVid?'':'none');
  $('secShot').style.display='';$('lHead').textContent=isVid?'Hook':'Headline';
  $('vidctl').style.display=isVid?'flex':'none';$('beats').style.display=isVid?'':'none';$('slides').style.display=isDeck?'':'none';$('ratio').style.display=isDeck?'none':'';
  $('layerbar').innerHTML=isVid?'':`<button class="layerbtn ${state.sel==='copy'?'on':''}" onclick="state.sel='copy';sync()">Text</button>${gfx?`<button class="layerbtn ${state.sel==='gfx'?'on':''}" onclick="state.sel='gfx';sync()">Illustration</button>`:''}${shot?`<button class="layerbtn ${state.sel==='shot'?'on':''}" onclick="state.sel='shot';sync()">Shot</button>`:''}`;
  $('cookbtn').innerHTML=(isVid?'Render video':isDeck?'Download slides':'Download PNG')+'<span class="kbd">⌘⏎</span>';
  $('cooknote').textContent=isVid?'Renders in your browser with the music mixed in.':isDeck?'Every slide as a 1920×1080 PNG.':({'':'1920×1080',r11:'1080×1080',r45:'1080×1350',r916:'1080×1920'}[state.ratio||'']);
  if(isVid){syncBeats();showBeat(curBeat)}
  if(isDeck&&slides[state.slide]){slides[state.slide].h=$('fHead').value;slides[state.slide].s=$('fSub').value;slides[state.slide].bg=state.bg;renderSlides()}
}
window.addEventListener('resize',()=>{if(isOn('editor'))sync()});
/* drag layers on the canvas */
(function(){const f=document.getElementById('frame');let drag=null;
  f.addEventListener('pointerdown',e=>{if(state.kind==='video')return;const el=e.target.closest('.layer.copy,.layer.gfx,.layer.shotL');if(!el)return;const key=el.classList.contains('copy')?'copy':el.classList.contains('gfx')?'gfx':'shot';state.sel=key;const r=f.getBoundingClientRect();const L=state.layers[key];drag={key,sx:e.clientX,sy:e.clientY,ox:L.x,oy:L.y,r,moved:false};el.setPointerCapture(e.pointerId);sync()});
  f.addEventListener('pointermove',e=>{if(!drag)return;const dx=(e.clientX-drag.sx)/drag.r.width,dy=(e.clientY-drag.sy)/drag.r.height;if(Math.abs(dx)+Math.abs(dy)>.004)drag.moved=true;const L=state.layers[drag.key];L.x=Math.max(-.2,Math.min(.95,drag.ox+dx));L.y=Math.max(-.2,Math.min(.95,drag.oy+dy));sync()});
  f.addEventListener('pointerup',e=>{if(drag&&!drag.moved&&drag.key==='copy')$('fHead').focus();drag=null});
  f.addEventListener('wheel',e=>{if(state.kind==='video'||!['gfx','shot'].includes(state.sel))return;e.preventDefault();const L=state.layers[state.sel];L.s=Math.max(.08,Math.min(.9,L.s*(e.deltaY<0?1.05:.95)));if(state.sel==='gfx')$('gfxSize').value=L.s;sync()},{passive:false});
  document.addEventListener('keydown',e=>{if(!isOn('editor')||state.kind==='video'||/INPUT|TEXTAREA/.test(document.activeElement.tagName))return;const L=state.layers[state.sel];if(!L)return;const st=e.shiftKey?.05:.01;if(e.key==='ArrowLeft'){L.x-=st}else if(e.key==='ArrowRight'){L.x+=st}else if(e.key==='ArrowUp'){L.y-=st}else if(e.key==='ArrowDown'){L.y+=st}else if((e.key==='Backspace'||e.key==='Delete')&&state.sel!=='copy'){L.id=null;state.sel='copy';renderGfxSw();renderShotSw()}else return;e.preventDefault();sync()});
})();
/* inline drawer */
const DTABS={bg:[['bg','Backgrounds',['background']],['kit','Launch kit',['hero','header']],['photo','Photos',['photo']]],gfx:[['graphic','Graphics',['graphic']],['category','Illustrations',['category']],['icon','Icons',['icon']],['org','Logos',['org']]],shot:[['card','Launch kit',['card','aipost','hero']],['upload','Uploads',['upload']]]};
let dmode='bg',dtab='bg';
function openDrawer(mode){dmode=mode;dtab=DTABS[mode][0][0];$('dq').value='';renderDrawer();$('drawer').classList.add('on')}
function closeDrawer(){$('drawer').classList.remove('on')}
function renderDrawer(){const tabs=DTABS[dmode];$('dtabs').innerHTML=tabs.map(t=>`<button class="${dtab===t[0]?'on':''}" onclick="dtab='${t[0]}';renderDrawer()">${t[1]}<small>${byGroup(...t[2]).length}</small></button>`).join('');
  const q=$('dq').value.toLowerCase();const t=tabs.find(x=>x[0]===dtab);let items=byGroup(...t[2]).filter(a=>!q||((a.title||'')+' '+(a.tags||[]).join(' ')).toLowerCase().includes(q));
  const fn={bg:'useBg',gfx:'useGfx',shot:'useShot'}[dmode];
  $('dgrid').className='grid'+(dtab==='icon'?' icons':'');
  $('dgrid').innerHTML=items.map(a=>{const contain=['graphic','category','icon','org'].includes(a.group);return `<div class="card" onclick="${fn}('${a.id}');${dmode==='bg'?'':''}"><div class="th ${contain?(a.group==='icon'?'icon':'contain r43'):(a.group==='photo'?'r43':'')}" style="${contain?'':`background-image:url('${a.thumb||a.src}')`}">${contain?`<img loading="lazy" src="${a.src}" alt="">`:''}</div>${a.group==='icon'?'':`<div class="t">${esc(a.title)}</div>`}</div>`}).join('')||'<div class="empty">Nothing matches.</div>'}
/* video beats */
const beatDur=()=>[+$('dHook').value,+$('dShot').value,+$('dOutro').value];
const total=()=>beatDur().reduce((a,b)=>a+b,0);
function syncBeats(){const d=beatDur();$('dHookV').textContent=d[0]+'s';$('dShotV').textContent=d[1]+'s';$('dOutroV').textContent=d[2]+'s';
  const names=[['Hook',plain($('fHead').value)],['Product',(A(state.shot)||{}).title||'Pick a shot'],['Outro','Leland · '+plain(state.tag||'Talk to a Human.')]];
  $('beats').innerHTML=names.map((n,i)=>`<div class="beat-c ${curBeat===i?'on':''}" style="--w:${d[i]}" onclick="seekBeat(${i})"><b>${n[0]}</b><span>${esc(n[1])}</span><div class="d">${d[i]}s</div></div>`).join('');$('time').textContent=tPos.toFixed(1)+'s / '+total().toFixed(1)+'s'}
let curBeat=0,playing=false,tPos=0,raf=null,lastTs=0,musicEl=null;
function beatAt(t){const d=beatDur();if(t<d[0])return 0;if(t<d[0]+d[1])return 1;return 2}
function showBeat(i){curBeat=i;['bHook','bShot','bOutro'].forEach((id,j)=>$(id).classList.toggle('on',j===i));document.querySelectorAll('.beat-c').forEach((el,j)=>el.classList.toggle('on',j===i))}
function seekBeat(i){const d=beatDur();tPos=i===0?0:i===1?d[0]:d[0]+d[1];showBeat(i);$('prog').style.width=(tPos/total()*100)+'%';$('time').textContent=tPos.toFixed(1)+'s / '+total().toFixed(1)+'s'}
function togglePlay(){playing?stopPlay():startPlay()}
function startPlay(){playing=true;if(tPos>=total())tPos=0;$('playico').innerHTML='<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>';
  if(state.music){musicEl=new Audio((A(state.music)||{}).src);musicEl.currentTime=tPos;musicEl.volume=.9;musicEl.play().catch(()=>{})}
  lastTs=performance.now();const step=ts=>{if(!playing)return;tPos+=(ts-lastTs)/1000;lastTs=ts;if(tPos>=total()){tPos=total();stopPlay();return}showBeat(beatAt(tPos));$('prog').style.width=(tPos/total()*100)+'%';$('time').textContent=tPos.toFixed(1)+'s / '+total().toFixed(1)+'s';raf=requestAnimationFrame(step)};raf=requestAnimationFrame(step)}
function stopPlay(){if(!playing)return;playing=false;cancelAnimationFrame(raf);if(musicEl){musicEl.pause();musicEl=null}if($('playico'))$('playico').innerHTML='<path d="M8 5v14l11-7z"/>'}
/* deck */
let slides=[];
function initDeck(){slides=[{h:'The home for ambition.',s:'Leland · Q4 2026',bg:null},{h:'Learn from people who’ve done it',s:'Experts with real names and verified backgrounds.',bg:'hero-learn'},{h:'Ask anything. Get real answers.',s:'Questions, livestreams and experts in one feed.',bg:'bg-godrays-03'},{h:'Own your future.',s:'joinleland.com',bg:'bg-crosswalk'}];state.slide=0;pickSlide(0)}
function renderSlides(){$('slides').innerHTML=slides.map((s,i)=>{const b=A(s.bg)||{};return `<div class="slide ${b.src?'photo':''} ${i===state.slide?'on':''}" style="background-image:url('${b.thumb||b.src||''}')" onclick="pickSlide(${i})"><b>${esc(plain(s.h))}</b><span class="n">${i+1}</span></div>`}).join('')+`<div class="slide add" onclick="slides.push({h:'New slide',s:'',bg:null});pickSlide(slides.length-1)">+</div>`}
function pickSlide(i){state.slide=i;const s=slides[i];setCopy(s.h,s.s,'');state.bg=s.bg;renderSw();sync()}

/* ---------- Opus ---------- */
const CFG={get api(){return localStorage.getItem('le-api')||''},set api(v){localStorage.setItem('le-api',v)},get key(){return localStorage.getItem('le-key')||''},set key(v){localStorage.setItem('le-key',v)}};
const hasOpus=()=>!!(CFG.api||CFG.key);
async function opus(system,user,max=600){const body={model:'claude-opus-4-1',max_tokens:max,system,messages:[{role:'user',content:user}]};let r;
  if(CFG.api)r=await fetch(CFG.api.replace(/\/$/,'')+'/opus',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
  else if(CFG.key)r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':CFG.key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify(body)});
  else return null;if(!r.ok)throw new Error('Opus '+r.status);const j=await r.json();return (j.content||[]).filter(c=>c.type==='text').map(c=>c.text).join('')}
const SYSTEM=()=>`You write marketing copy for Leland (joinleland.com). ${M.brand.pitch?M.brand.pitch.oneliner:''} Voice: confident, warm, specific, no hype, no exclamation marks, no emojis. Approved taglines: ${(M.brand.taglines||[]).join(' | ')}. Guardrails: ${(M.brand.guardrails||[]).join(' ')} In headlines, wrap the one phrase that should be blue in [square brackets], e.g. "One conversation could [open the door]." Respond ONLY with JSON.`;
const jsonOf=s=>{try{return JSON.parse(s.replace(/```json|```/g,'').trim())}catch(e){const m=s.match(/\{[\s\S]*\}/);return m?JSON.parse(m[0]):null}};
function connectOpus(){const k=prompt('Paste an Anthropic API key (stays in this browser). Leave blank to use a proxy URL.');if(k===null)return;if(k.trim()){CFG.key=k.trim();CFG.api=''}else{const u=prompt('Proxy URL (your Cloudflare Worker)');if(u&&u.trim()){CFG.api=u.trim()}}opusNote();toast(hasOpus()?'Opus connected':'Not connected')}
function opusNote(){const n=$('opusnote');if(n)n.textContent=CFG.api?'Connected through your proxy.':CFG.key?'Connected with a key stored in this browser.':'Not connected. The brief bar, Rewrite and scheduling copy use a scripted fallback until you connect.';$('opusst').textContent=hasOpus()?'on':''}
async function brief(){const p=$('ask').value.trim();if(!p){toast('Say what it’s for, or just edit on the right');$('ask').focus();return}
  const l=p.toLowerCase();
  if(hasOpus()){$('ov').classList.add('on');$('ovp').textContent='Opus is reading the brief';window.leo&&leo.work();try{const out=jsonOf(await opus(SYSTEM(),`Brief: ${p}\nFormat: ${state.kind}.\nReturn JSON {"title":"short project title","headline":"<=48 chars, with one [blue phrase]","subhead":"<=110 chars or empty","cta":"2-3 words or empty","tagline":"one of the approved taglines or a 4-6 word closer with a [blue phrase]","background":"black|white|crosswalk|traveler|grass|sky|godrays|hero-learn|hero-ask|hero-next|hero-people|hero-accomplish","ratio":"16:9|1:1|4:5|9:16"}`));
    if(out){setCopy(out.headline,out.subhead,out.cta);if(out.title)$('etitle').value=out.title;if(out.tagline)state.tag=out.tagline;applyBgWord(out.background);ratio({'16:9':'','1:1':'r11','4:5':'r45','9:16':'r916'}[out.ratio]||'');sync();$('ov').classList.remove('on');window.leo&&leo.rest();toast('Opus drafted it. Everything on the right is yours.');return}}catch(e){toast('Opus error. Using the scripted draft.')}$('ov').classList.remove('on')}
  let title='New asset';
  if(/invite/.test(l)){setCopy('Invites is here.','Earn when your friends book their first session.','Invite a friend');title='Invites launch'}
  else if(/job/.test(l)){setCopy('Your next job is [already looking for you].','','');state.tag='Your next job is [already looking for you].';title='Jobs';applyBgWord('white')}
  else if(/clip/.test(l)){setCopy('Increase your reach, [with Clips].','','');state.tag='Increase your reach, [with Clips].';title='Clips';applyBgWord('white')}
  else if(/community|conversation/.test(l)){setCopy('One conversation could [open the door].','Learn from people who’ve done it.','Come ask');state.tag='Talk to a [Human].';title='Community';applyBgWord('hero-learn')}
  else if(/mba/.test(l)){setCopy('Own your future.','Work 1:1 with a coach who got in.','Find a coach');title='MBA';applyBgWord('crosswalk')}
  else if(/ai builder|aibp/.test(l)){setCopy('Built something with AI? [Show us].','AI Builder Program grads: post your build on Leland.','Post it');title='AIBP';applyBgWord('godrays')}
  else{const h=p.split(/[.,!—-]/)[0].slice(0,44);setCopy(h.charAt(0).toUpperCase()+h.slice(1),'','');title=h.slice(0,28)}
  $('etitle').value=title;if(/9:16|reel|stor/.test(l))ratio('r916');else if(/1:1|square|meta|instagram/.test(l))ratio('r11');
  if(/dark|black/.test(l))applyBgWord('black');else if(/white|clean/.test(l))applyBgWord('white');else if(/sky/.test(l))applyBgWord('sky');
  sync();toast('Drafted. Connect Opus under Me for real writing.')}
function applyBgWord(w){if(!w)return;const map={crosswalk:'bg-crosswalk',traveler:'bg-traveler',grass:'bg-grass',sky:'bg-sky-1',godrays:'bg-godrays-'+String(1+Math.floor(Math.random()*12)).padStart(2,'0'),black:'bg-streaks',white:null};if(w.startsWith('hero-'))useBg(w);else if(w in map){if(map[w])useBg(map[w]);else{state.bg=null;renderSw()}}if(state.kind==='video'){state.dark=/black|godrays/.test(w);document.querySelectorAll('#secTiming .seg button').forEach((b,i)=>b.classList.toggle('on',i===(state.dark?1:0)))}}
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
  const gfx=A(L.gfx.id);if(gfx){const im=await loadImg(gfx.src);const gw=W*L.gfx.s,gh=im.height/im.width*gw;x.drawImage(im,W*L.gfx.x,H*L.gfx.y,gw,gh)}
  const shot=A(L.shot.id);if(shot){const im=await loadImg(shot.src);const sw=W*L.shot.s,sh=im.height/im.width*sw,sx=W*L.shot.x,sy=H*L.shot.y;x.save();x.shadowColor='rgba(0,0,0,.25)';x.shadowBlur=m*.03;x.shadowOffsetY=m*.01;roundRect(x,sx,sy,sw,sh,sw*.04);x.fillStyle='#fff';x.fill();x.restore();x.save();roundRect(x,sx,sy,sw,sh,sw*.04);x.clip();x.drawImage(im,sx,sy,sw,sh);x.restore()}
  const head=opts.head??$('fHead').value,sub=opts.sub??$('fSub').value,cta=opts.cta??$('fCta').value,sz=opts.size||state.size,hs=Math.round(m*.085*sz),ss=Math.round(hs*.36),cs=Math.round(hs*.31),maxW=W*L.copy.w;
  x.font=`500 ${hs}px Season, Georgia, serif`;const hl=wrapText(x,head,maxW);x.font=`400 ${ss}px Macan, sans-serif`;const sl=sub?wrapText(x,sub,Math.min(maxW,ss*36)):[];
  const align=state.center?'center':'left';const ax=state.center?W*L.copy.x:W*L.copy.x;x.textBaseline='top';
  let y=H*L.copy.y;x.font=`500 ${hs}px Season, Georgia, serif`;hl.forEach(l=>{drawRich(x,l,ax,y,align,ink);y+=hs*1.05});
  if(sl.length){y+=ss*.7;x.font=`400 ${ss}px Macan, sans-serif`;x.globalAlpha=.85;x.textAlign=align;x.fillStyle=ink;sl.forEach(l=>{x.fillText(l,ax,y);y+=ss*1.35});x.globalAlpha=1}
  if(cta){y+=cs*.8;x.font=`600 ${cs}px Macan, sans-serif`;const tw=x.measureText(cta).width,bw=tw+cs*1.6,bh=cs*2;const bx=state.center?ax-bw/2:ax;x.fillStyle=light?'#111':'#fff';roundRect(x,bx,y,bw,bh,cs*.4);x.fill();x.fillStyle=light?'#fff':'#111';x.textAlign='left';x.fillText(cta,bx+cs*.8,y+cs*.5)}
  return new Promise(r=>c.toBlob(r,'image/png'))}
function dl(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),3000)}
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')||'le';
async function exportCurrent(){const name=slug($('etitle').value);
  if(state.kind==='still'){const r=state.ratio||'';const b=await renderStill(r);dl(b,`${name}-${SIZES[r].join('x')}.png`);addProject({t:$('etitle').value,m:'Image · '+SIZES[r].join('×'),th:(A(state.bg)||{}).thumb,kind:'still',bg:state.bg,head:$('fHead').value,sub:$('fSub').value,cta:$('fCta').value,layers:state.layers,size:state.size,center:state.center,ratio:r});toast('Downloaded')}
  else if(state.kind==='deck'){for(let i=0;i<slides.length;i++){const s=slides[i];const b=await renderStill('',{bg:s.bg,head:s.h,sub:s.s,cta:'',layers:DEF_LAYERS()});dl(b,`${name}-slide-${i+1}.png`);await new Promise(r=>setTimeout(r,250))}addProject({t:$('etitle').value,m:'Deck · '+slides.length+' slides',th:(A(slides[1]&&slides[1].bg)||{}).thumb,kind:'deck'});toast(slides.length+' slides downloaded')}
  else exportVideo()}
async function exportVideo(){stopPlay();const r=state.ratio||'';const [W,H]=SIZES[r];toast('Rendering '+total().toFixed(0)+'s of video in your browser…');
  const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');await fontsReady();
  const lm=await loadImg('assets/logomark.png');const shot=A(state.shot);const shotIm=shot?await loadImg(shot.src):null;
  const dark=state.dark,ink=dark?'#fff':'#111',bgc=dark?'#111':'#fff',m=Math.min(W,H);
  let leoFrames=null;if(state.outro==='leo'&&window.leo&&leo.bake){try{leoFrames=await leo.bake(Math.round(m*.5),dark)}catch(e){console.warn('leo bake',e)}}
  const stream=c.captureStream(30);let musicNode=null;
  if(state.music){try{const actx=new (window.AudioContext||window.webkitAudioContext)();const au=new Audio((A(state.music)||{}).src);au.crossOrigin='anonymous';await new Promise(r=>{au.oncanplaythrough=r;au.onerror=r;au.load()});const src=actx.createMediaElementSource(au);const dest=actx.createMediaStreamDestination();const gain=actx.createGain();gain.gain.value=.9;src.connect(gain).connect(dest);dest.stream.getAudioTracks().forEach(t=>stream.addTrack(t));musicNode={au,gain,actx}}catch(e){console.warn('music mix failed',e)}}
  const mime=['video/mp4;codecs=avc1','video/webm;codecs=vp9','video/webm'].find(mm=>MediaRecorder.isTypeSupported(mm))||'video/webm';const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:8e6});const chunks=[];rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);
  const d=beatDur(),T=total(),head=$('fHead').value,tag=state.tag||'Talk to a [Human].',anim=state.anim;
  const ease=t=>t<.5?2*t*t:-1+(4-2*t)*t,eo=t=>1-Math.pow(1-t,3);
  function hookLines(){x.font=`500 ${Math.round(m*.062)}px Macan, sans-serif`;return wrapText(x,head,W*.8)}
  function drawHook(local,a){const hs=Math.round(m*.062);x.font=`500 ${hs}px Macan, sans-serif`;const lines=hookLines();const y0=H/2-(lines.length-1)/2*hs*1.25;
    if(anim==='typed'){const n=Math.floor(plain(head).length*Math.min(1,local/1.2));let shown=0;x.globalAlpha=a;lines.forEach((l,i)=>{const pl=plain(l);const take=Math.max(0,Math.min(pl.length,n-shown));shown+=pl.length+1;let cut='',seen=0;for(const ch of l){if(ch==='['||ch===']'){cut+=ch;continue}if(seen<take){cut+=ch;seen++}}drawRich(x,cut,W/2,y0+i*hs*1.25,'center',ink)});x.globalAlpha=1}
    else if(anim==='rise'){lines.forEach((l,i)=>{const u=Math.max(0,Math.min(1,(local-i*.18)/.6));x.globalAlpha=a*eo(u);drawRich(x,l,W/2,y0+i*hs*1.25+(1-eo(u))*hs*.6,'center',ink)});x.globalAlpha=1}
    else{let k=0;lines.forEach((l,i)=>{const parts=l.split(/(\[[^\]]+\])/).filter(Boolean);const words=[];parts.forEach(p=>{const b=p.startsWith('[');p.replace(/[\[\]]/g,'').split(' ').forEach(w=>w&&words.push({w,b}))});x.textAlign='left';const tw=words.reduce((s,w)=>s+x.measureText(w.w+' ').width,0);let cx=W/2-tw/2;words.forEach(w=>{const u=Math.max(0,Math.min(1,(local-k*.12)/.35));k++;x.globalAlpha=a*eo(u);x.fillStyle=w.b?'#2f5fd6':ink;x.save();x.translate(cx,y0+i*hs*1.25);x.scale(.85+.15*eo(u),.85+.15*eo(u));x.fillText(w.w,0,0);x.restore();cx+=x.measureText(w.w+' ').width})});x.globalAlpha=1}}
  function draw(t){x.fillStyle=bgc;x.fillRect(0,0,W,H);const b=beatAt(t);const local=b===0?t:b===1?t-d[0]:t-d[0]-d[1];const fin=Math.min(1,local/.4),fout=Math.min(1,(d[b]-local)/.3);const a=Math.min(fin,fout);x.textBaseline='middle';
    if(b===0)drawHook(local,a);
    else if(b===1&&shotIm){const sc=.72,sw=W*sc,sh=shotIm.height/shotIm.width*sw,sy=(H-sh)/2+(1-ease(fin))*H*.06;x.globalAlpha=a;x.save();x.shadowColor='rgba(0,0,0,.18)';x.shadowBlur=m*.06;x.shadowOffsetY=m*.02;roundRect(x,(W-sw)/2,sy,sw,sh,m*.012);x.fillStyle='#fff';x.fill();x.restore();x.save();roundRect(x,(W-sw)/2,sy,sw,sh,m*.012);x.clip();x.drawImage(shotIm,(W-sw)/2,sy,sw,sh);x.restore();x.globalAlpha=1}
    else if(b===2){const lh=m*.07;x.font=`600 ${Math.round(m*.052)}px Macan, sans-serif`;const ww=x.measureText('Leland').width;const lw=lm.width/lm.height*lh;const totalW=lw+m*.02+ww;const y=H/2-m*.09;
      if(leoFrames&&leoFrames.length){const lf=leoFrames;const spinT=Math.min(1,local/1.1);const fi=Math.min(lf.length-1,Math.floor(spinT*(lf.length-1)));const settle=Math.max(0,Math.min(1,(local-1.1)/.4));const big=m*.5,size=big+(lh*1.6-big)*ease(settle);const cx=W/2+(W/2-totalW/2+lw/2-W/2)*ease(settle),cy=H/2+(y-H/2)*ease(settle);x.globalAlpha=Math.min(fout,1);x.drawImage(lf[fi],cx-size/2,cy-size/2,size,size);
        x.globalAlpha=settle*fout;x.fillStyle=ink;x.textAlign='left';x.fillText('Leland',W/2-totalW/2+lw+m*.02,y+m*.004);x.font=`500 ${Math.round(m*.05)}px Macan, sans-serif`;drawRich(x,tag,W/2,H/2+m*.02,'center',ink)}
      else{x.globalAlpha=a;x.save();if(dark)x.filter='invert(1)';x.drawImage(lm,W/2-totalW/2,y-lh/2,lw,lh);x.restore();x.fillStyle=ink;x.textAlign='left';x.fillText('Leland',W/2-totalW/2+lw+m*.02,y+m*.004);x.font=`500 ${Math.round(m*.05)}px Macan, sans-serif`;drawRich(x,tag,W/2,H/2+m*.02,'center',ink)}
      const ba=leoFrames?Math.max(0,Math.min(1,(local-1.3)/.4))*fout:a;x.globalAlpha=ba;x.font=`600 ${Math.round(m*.02)}px Macan, sans-serif`;const bs=['App Store','Google Play'];let bx=W/2-(x.measureText(bs[0]).width+x.measureText(bs[1]).width+m*.1)/2;const by=H/2+m*.11;bs.forEach(s=>{const tw=x.measureText(s).width+m*.03;x.strokeStyle=ink;x.lineWidth=2;roundRect(x,bx,by,tw,m*.045,m*.008);x.stroke();x.fillStyle=ink;x.textBaseline='middle';x.fillText(s,bx+m*.015,by+m*.0225);bx+=tw+m*.04});x.globalAlpha=1}
    x.textAlign='left'}
  draw(0);rec.start(100);if(musicNode){musicNode.au.currentTime=0;musicNode.au.play().catch(()=>{})}const start=performance.now();
  await new Promise(done=>{const tick=()=>{const t=(performance.now()-start)/1000;if(t>=T){draw(T-.01);return done()}draw(t);requestAnimationFrame(tick)};requestAnimationFrame(tick)});
  if(musicNode){try{musicNode.gain.gain.linearRampToValueAtTime(0,musicNode.actx.currentTime+.4)}catch(e){}await new Promise(r=>setTimeout(r,450));musicNode.au.pause()}
  rec.stop();await new Promise(r=>rec.onstop=r);const ext=mime.includes('mp4')?'mp4':'webm';dl(new Blob(chunks,{type:mime}),`${slug($('etitle').value)}-${W}x${H}.${ext}`);
  addProject({t:$('etitle').value,m:'Video · '+T.toFixed(0)+'s',th:(A(state.shot)||{}).thumb,kind:'video'});toast('Video downloaded'+(ext==='webm'?' as .webm — Safari exports .mp4 natively':''))}

/* ---------- projects ---------- */
let projects=[];
function restoreProjects(){try{projects=JSON.parse(localStorage.getItem('le-projects')||'[]')}catch(e){projects=[]}renderProjects()}
function addProject(p){projects.unshift({...p,at:new Date().toISOString()});projects=projects.slice(0,60);try{localStorage.setItem('le-projects',JSON.stringify(projects))}catch(e){}renderProjects()}
function renderProjects(){$('projlist').innerHTML=projects.length?projects.map((p,i)=>`<div class="row" onclick="openProject(${i})"><div class="th" style="background-image:url('${p.th||''}')"></div><div><div class="t">${esc(p.t)}</div><div class="m">${esc(p.m)} · ${new Date(p.at).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</div></div><div class="r"><span class="tag">${p.kind}</span></div></div>`).join(''):'<div class="empty">Nothing yet. Make something, or schedule a post.</div>'}
function openProject(i){const p=projects[i];if(p.kind==='still'){state.kind='still';setCopy(p.head,p.sub,p.cta);if(p.layers)state.layers=JSON.parse(JSON.stringify(p.layers));state.size=p.size||1;state.center=!!p.center;state.bg=p.bg;$('etitle').value=p.t;start('still',true);ratio(p.ratio||'')}else if(p.kind==='post'&&p.asset){openAsset(p.asset)}else toast(p.m)}

/* ---------- brand ---------- */
function renderBrand(){const b=M.brand;$('taglist').innerHTML=(b.taglines||[]).map(t=>`<div class="row" onclick="useTagline(${JSON.stringify(t)})"><div class="t" style="font-family:var(--serif);font-weight:500;font-size:1.125rem">${esc(t)}</div><span class="r link">Use</span></div>`).join('');
  $('pitch').innerHTML=b.pitch?`<b>${esc(b.pitch.headline)}</b><br>${esc(b.pitch.oneliner)} ${esc(b.pitch.core||'')}`:'';
  $('rules').innerHTML=(b.guardrails||[]).map(g=>`<li>${esc(g)}</li>`).join('');
  $('skilltext').textContent=SKILL();}
const SKILL=()=>`---
name: le
description: Leland's brand asset library. Use whenever making any Leland marketing asset, post, image, video or deck — to find approved images, videos, icons, music, taglines and post copy, and to stay inside the brand guardrails.
---
# LE — Leland asset library

Manifest: ${base()}data/manifest.json
Fetch it first. Every entry has id, type, group, title, tags and src (relative to ${base()}).

Groups: hero, header, card, aibp, aipost (launch kit images) · film, kit (videos) · background, photo (photography) · graphic · icon · music.
Copy: manifest.posts (12 post ideas, verbatim) and manifest.brand.taglines.

Rules (manifest.brand.guardrails):
${(M.brand.guardrails||[]).map(g=>'- '+g).join('\n')}

Type: Season for headlines (weight 500), Macan for everything else. Monochrome plus photography. One blue phrase per headline, never more. Logomark never yellow.
When asked for an asset, pick from the manifest by tags and return the full URL. Do not invent assets.`;
