/* LE — Leland's repository of work, and the one skill that draws on it. */
const $=id=>document.getElementById(id);
let M={brand:{},assets:[],posts:[]},COPY={voice:{},items:[]},BRIEF='',GUIDE=null;
let state={kind:null,tab:'kit',q:'',chip:'all'};
const A=id=>M.assets.find(a=>a.id===id);
const byGroup=(...g)=>M.assets.filter(a=>g.includes(a.group));
const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const js=v=>esc(JSON.stringify(v));                     // a JS literal that is safe inside a double-quoted attribute
const plain=s=>String(s||'').replace(/[\[\]]/g,'');
const base=()=>location.href.replace(/[#?].*$/,'').replace(/[^/]*$/,'');
const SCREENS=['make','pick','lib','editor','projects','skill','motion','brand'];
const PAL={yellow:'#FFD96F',blue:'#80ACED',slate:'#869AA6',beige:'#F3F1E6',tan:'#EBD4B5',paper:'#F9F8F3',ink:'#010101',neutral:'#222222',white:'#fff'};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const calm=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- boot ---------- */
async function boot(){
  mountLogo();
  try{M=await (await fetch('data/manifest.json')).json()}catch(e){toast('Could not load data/manifest.json. Serve the folder rather than opening the file.')}
  try{COPY=await (await fetch('data/copy.json')).json()}catch(e){}
  try{BRIEF=await (await fetch('BRAND-BRIEF.md')).text()}catch(e){}
  renderPicks();restoreProjects();initSearch();
  route();window.addEventListener('hashchange',route);
}
document.addEventListener('DOMContentLoaded',boot);

/* ---------- routing (hash = back button works everywhere) ---------- */
const once={};
function route(){
  const h=location.hash.slice(1)||'make';const [scr,arg]=h.split('/');
  if(scr==='asset'&&arg){showPreview(arg,true);return}
  if(scr==='present'&&window.openPresent){openPresent(arg);return}
  if(window.closePresent)closePresent(true);
  closePreview(true);
  const id=SCREENS.includes(scr)?scr:'make';
  document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on',s.id===id));
  document.querySelectorAll('.side a').forEach(a=>a.classList.toggle('on',a.id==='s-'+(id==='pick'||id==='editor'?'make':id)));
  $('main').scrollTop=0;stopPicks(id==='make');
  if(id==='lib'){if(arg){state.tab=arg;state.chip='all';state.q='';$('q').value='';$('search').classList.remove('has')}renderLib()}
  if(id==='pick')renderPick(arg);
  if(id==='editor'&&!state.kind){location.replace('#make');return}
  if(id==='projects')renderProjects();
  if(['skill','motion','brand'].includes(id)&&!once[id]){once[id]=1;({skill:renderSkill,motion:renderMotion,brand:renderBrand})[id]()}
}
function go(id,arg){location.hash=id+(arg?'/'+arg:'')}
const isOn=id=>$(id).classList.contains('on');
document.addEventListener('keydown',e=>{const typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
  if(e.key==='Escape'){closeSugg();closeDrawer();if($('pv').classList.contains('on'))closePreview();$('ov').classList.remove('on');document.activeElement.blur()}
  if($('pv').classList.contains('on')&&!typing){if(e.key==='ArrowRight')stepPreview(1);if(e.key==='ArrowLeft')stepPreview(-1)}
  if((e.metaKey||e.ctrlKey)&&e.key==='Enter'&&isOn('editor'))exportCurrent()});
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('on');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('on'),2600)}
function copyText(s,msg){(navigator.clipboard?navigator.clipboard.writeText(s):Promise.reject()).then(()=>toast(msg||'Copied')).catch(()=>{prompt('Copy:',s)})}
function busy(on,msg){$('ov').classList.toggle('on',!!on);if(msg)$('ovp').textContent=msg}

/* ---------- the mark (js/mark.js, from the chat interface guidelines) ---------- */
let lmN=0;
function mountMark(host,opts){const id='_lm'+(lmN++);host.innerHTML=LM_SVG.replace(/__S/g,id);return LelandIntro(host,id,opts||{})}
/* top-left: the // bars paint down and sweep into the curves once, then it rests as the mark. Hover plays it again. */
function mountLogo(){const host=$('lemark');if(!host||!window.LelandIntro)return;const api=mountMark(host,{phase:'draw'});const end=api.T.hold[0]+.3;let raf=0;
  const play=()=>{cancelAnimationFrame(raf);if(calm()){api.render(end);return}const t0=performance.now();const f=now=>{const t=(now-t0)/1000;api.render(Math.min(end,t));if(t<end)raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f)};
  api.render(0);play();host.parentNode.addEventListener('mouseenter',play)}

/* ---------- Make ---------- */
let pickTimers=[];
function renderPicks(){
  const cyc=list=>list.map((s,i)=>`<img src="${s}" class="${i?'':'on'}" alt="">`).join('');
  const tpl=(window.TEMPLATES||[]).map(t=>`assets/templates/${t.id}.jpg`);
  const decks=(window.DECK?DECK.types:[]).map(t=>`assets/templates/deck-${t.id}.jpg`);
  const clip=byGroup('scene').find(a=>a.from==='film-get-there-with-the-people-whove-been-there'&&a.style==='product')||byGroup('scene')[0]||{};
  $('picks').innerHTML=`
  <button class="pick" onclick="go('pick','image')"><div class="art" data-cycle="1">${cyc(tpl)}</div><b>Image</b></button>
  <button class="pick" onclick="go('pick','deck')"><div class="art" data-cycle="1">${cyc(decks)}</div><b>Deck</b></button>
  <div class="pick soon"><div class="art"><video muted loop playsinline autoplay poster="${clip.poster||''}" src="${clip.src||''}"></video></div><b>Video</b><span>Coming soon</span></div>`;
  stopPicks(isOn('make'))}
function stopPicks(start){pickTimers.forEach(clearInterval);pickTimers=[];if(!start)return;
  document.querySelectorAll('#picks .art[data-cycle]').forEach(el=>{const imgs=[...el.querySelectorAll('img')];let i=0;pickTimers.push(setInterval(()=>{i=(i+1)%imgs.length;imgs.forEach((im,k)=>im.classList.toggle('on',k===i))},2600))});
  document.querySelectorAll('#picks video').forEach(v=>v.play().catch(()=>{}))}

/* ---------- Pick a type ---------- */
function renderPick(kind){
  if(kind==='image'){$('pickTitle').textContent='Which kind of image?';
    $('pickBody').innerHTML=`<div class="types">${(window.TEMPLATES||[]).map(t=>`<button class="type" onclick="startImage('${t.id}')"><div class="th r45"><img src="assets/templates/${t.id}.jpg" alt=""></div><b>${esc(t.name)}</b></button>`).join('')}</div>`}
  else if(kind==='deck'){$('pickTitle').textContent='Which kind of deck?';
    $('pickBody').innerHTML=`<div class="types wide">${DECK.types.map(t=>`<button class="type" onclick="startDeck('${t.id}')"><div class="th r169"><img src="assets/templates/deck-${t.id}.jpg" alt=""></div><b>${esc(t.name)}</b></button>`).join('')}</div>`}
  else go('make')}

/* ---------- Editor shell ---------- */
let ED={};
function openEditor(kind,title,saved){let from=location.hash;if(/^#asset/.test(from)){history.replaceState(null,'','#lib/'+state.tab);from='#lib/'+state.tab}state.kind=kind;ED={pid:saved&&saved.id||null};$('etitle').value=title;const name=/^#pick/.test(from)?'Types':/^#lib|^#asset/.test(from)?'Library':/^#projects/.test(from)?'Projects':'Make';$('eback').lastChild.textContent=name;$('eback').onclick=()=>{if(from&&from!=='#editor')history.back();else go('make')};
  $('prbtn').style.display=kind==='deck'?'':'none';$('canvasImg').removeAttribute('src');$('slides').innerHTML='';$('stagebar').innerHTML='';$('stage').className='stage';
  if(location.hash!=='#editor')history.pushState(null,'','#editor');route()}
const SW_CONTAIN=['graphic','illustration','icon','org'];
const swBtn=(a,on,fn)=>`<button class="${on?'on':''}" style="background-image:url('${a.thumb||a.poster||a.src}');${SW_CONTAIN.includes(a.group)?'background-size:contain;background-repeat:no-repeat;background-color:#fff':''}" title="${esc(a.title)}" onclick="${fn}"></button>`;
function field(f,v,on){
  if(f.type==='text')return `<div class="f"><label>${esc(f.label)}</label>${(f.max||0)>70?`<textarea oninput="${on}">${esc(v)}</textarea>`:`<input value="${esc(v)}" oninput="${on}" placeholder="${f.optional?'Optional':''}">`}</div>`;
  if(f.type==='color')return `<div class="f"><label>${esc(f.label)}</label><div class="pal">${(f.options||Object.keys(PAL)).map(c=>`<button class="${v===c?'on':''}" style="background:${PAL[c]}" title="${c}" onclick="${on.replace('this.value',`'${c}'`)}"></button>`).join('')}</div></div>`;
  if(f.type==='choice')return `<div class="f"><label>${esc(f.label)}</label><div class="seg">${f.options.map(o=>`<button class="${v===o?'on':''}" onclick="${on.replace('this.value',`'${o}'`)}">${esc(o[0].toUpperCase()+o.slice(1))}</button>`).join('')}</div></div>`;
  if(f.type==='asset'){const cur=A(v);let items=byGroup(...f.groups).slice(0,f.optional?6:7);if(cur&&!items.includes(cur))items=[cur].concat(items.slice(0,f.optional?5:6));return `<div class="f"><label>${esc(f.label)}<button class="link" onclick='openDrawer(${JSON.stringify(f.groups)},"${f.key}")'>Browse</button></label><div class="sw">${items.map(a=>swBtn(a,v===a.id,on.replace('this.value',`'${a.id}'`))).join('')}${f.optional?`<button class="more ${!v?'on':''}" onclick="${on.replace('this.value','null')}">×</button>`:''}</div></div>`}
  return ''}
function helpers(){const T=window.TPL_HELPERS||{};return {A,byGroup,loadImg,wrapText,drawRich,roundRect,PAL,logo:T.logo,mark:T.mark,cover:T.cover}}
const SIZES={'':[1920,1080],r11:[1080,1080],r45:[1080,1350],r916:[1080,1920]};
const RNAME={'':'16:9',r11:'1:1',r45:'4:5',r916:'9:16'};

/* ---------- Image: a template, its fields, a canvas ---------- */
function startImage(tid,saved){const t=TEMPLATES.find(x=>x.id===tid);if(!t)return;openEditor('image',saved?saved.t:t.name,saved);
  ED={pid:ED.pid,t,d:{...t.defaults,...(saved&&saved.d||{})},ratio:saved?saved.ratio:t.ratios[0]};
  $('stagebar').innerHTML=`<div class="seg" id="ratio">${t.ratios.map(r=>`<button class="${ED.ratio===r?'on':''}" onclick="ED.ratio='${r}';imageSync();renderStagebar()">${RNAME[r]}</button>`).join('')}</div>`;
  renderImagePanel();imageSync()}
function renderStagebar(){document.querySelectorAll('#ratio button').forEach(b=>b.classList.toggle('on',b.textContent===RNAME[ED.ratio]))}
function renderImagePanel(){const t=ED.t;const first=t.fields.find(f=>f.key==='head');
  $('panel').innerHTML=`<div class="sec"><h3>${esc(t.name)} <button class="link" onclick="history.replaceState(null,'','#pick/image');route()">Change</button></h3>${t.fields.map(f=>field(f,ED.d[f.key],`setField('${f.key}',this.value,true)`)).join('')}</div>
  ${first?`<div class="sec"><h3>Taglines</h3><div class="copylist">${copyItems('tagline').slice(0,6).map(c=>`<button onclick="setField('${first.key}',${js(c.text)})">${esc(plain(c.text))}</button>`).join('')}</div></div>`:''}`}
function setField(k,v,fromInput){ED.d[k]=v;const f=ED.t.fields.find(x=>x.key===k);if(k==='expert'&&A(v)){ED.d.name=A(v).title;ED.d.role='Leland expert'}if(!fromInput||(f&&f.type!=='text'))renderImagePanel();imageSync()}
let imgT=null,saveT=null;
function autosave(fn){clearTimeout(saveT);saveT=setTimeout(()=>{try{const p=fn();if(!p)return;p.id=ED.pid=ED.pid||(crypto.randomUUID?crypto.randomUUID():String(Date.now()));const i=projects.findIndex(q=>q.id===p.id);if(i>=0)projects[i]={...projects[i],...p,at:new Date().toISOString()};else projects.unshift({...p,at:new Date().toISOString()});localStorage.setItem('le-projects',JSON.stringify(projects.slice(0,60)));renderProjects()}catch(e){}},1500)}
function imageSync(){clearTimeout(imgT);imgT=setTimeout(async()=>{const [W,H]=SIZES[ED.ratio];const s=Math.min(1,1000/W);const c=document.createElement('canvas');c.width=W*s;c.height=H*s;const x=c.getContext('2d');x.scale(s,s);await fontsReady();try{await ED.t.render(x,W,H,ED.d,helpers())}catch(e){console.error(e);toast('Render error: '+e.message)}$('canvasImg').src=c.toDataURL('image/jpeg',.92);$('stage').className='stage '+ED.ratio;autosave(()=>({t:$('etitle').value,m:ED.t.name+' · '+SIZES[ED.ratio].join('×'),th:$('canvasImg').src,kind:'image',tid:ED.t.id,d:ED.d,ratio:ED.ratio}))},40)}
async function renderImageFull(){const [W,H]=SIZES[ED.ratio];const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');await fontsReady();await ED.t.render(x,W,H,ED.d,helpers());return new Promise(r=>c.toBlob(r,'image/png'))}

/* ---------- Deck: a type, pasted text, slides ---------- */
function startDeck(tid,saved){const t=DECK.types.find(x=>x.id===tid)||DECK.types[0];openEditor('deck',saved?saved.t:t.name+' deck',saved);ED={pid:ED.pid,type:t,text:saved?saved.deck.text:DECK.sample(t.id),slides:[],i:0};buildDeck();
  if(!saved&&DECK.ready)DECK.ready(t.id).then(txt=>{if(ED.type===t&&txt&&ED.text!==txt&&!ED.slides.some(s=>s.edited)){ED.text=txt;buildDeck()}})}
function buildDeck(){const prev=ED.slides||[];ED.slides=DECK.parse(ED.text,ED.type.id);ED.slides.forEach((s,i)=>{const p=prev[i];if(p&&p.kind===s.kind&&p.edited)Object.assign(s.data,p.edited),s.edited=p.edited});ED.i=Math.min(ED.i,ED.slides.length-1);renderDeckPanel();deckSync(true)}
function renderDeckPanel(){const s=ED.slides[ED.i];const k=s?DECK.kinds[s.kind]:null;
  $('panel').innerHTML=`<div class="sec"><h3>${esc(ED.type.name)} deck <button class="link" onclick="history.replaceState(null,'','#pick/deck');route()">Change</button></h3><div class="f"><textarea id="deckText" style="min-height:160px;font-size:.8125rem" oninput="ED.text=this.value">${esc(ED.text)}</textarea></div><button class="btn sm" onclick="buildDeck()">Rebuild slides</button></div>
  ${s?`<div class="sec"><h3>Slide ${ED.i+1} · ${esc(k.name||s.kind)}</h3>${(k.fields||[]).map(f=>field(f,s.data[f.key]??'',`ED.slides[${ED.i}].data['${f.key}']=this.value;(ED.slides[${ED.i}].edited=ED.slides[${ED.i}].edited||{})['${f.key}']=this.value;deckSync(true)`)).join('')}</div>`:''}
  <div class="sec"><button class="link" onclick="exportDeck('png')">Download as PNGs instead</button></div>`}
let deckT=null;
function deckSync(thumbs){clearTimeout(deckT);deckT=setTimeout(async()=>{const h=helpers();await fontsReady();const s=ED.slides[ED.i];if(!s)return;const c=document.createElement('canvas');c.width=1280;c.height=720;const x=c.getContext('2d');await DECK.render(x,1280,720,{...s,index:ED.i,total:ED.slides.length},h);$('canvasImg').src=c.toDataURL('image/jpeg',.9);$('stage').className='stage r169';
    if(thumbs||!ED.thumbs){const out=[];for(let i=0;i<ED.slides.length;i++){const t=document.createElement('canvas');t.width=320;t.height=180;const tx=t.getContext('2d');await DECK.render(tx,320,180,{...ED.slides[i],index:i,total:ED.slides.length},h);out.push(t.toDataURL('image/jpeg',.8))}ED.thumbs=out}
    $('slides').innerHTML=ED.thumbs.map((src,i)=>`<div class="slide ${i===ED.i?'on':''}" style="background-image:url('${src}')" onclick="ED.i=${i};renderDeckPanel();deckSync()"><span class="n">${i+1}</span></div>`).join('');autosave(()=>({t:$('etitle').value,m:'Deck · '+ED.slides.length+' slides',th:ED.thumbs[0],kind:'deck',deck:{type:ED.type.id,text:ED.text}}))},30)}
async function exportDeck(kind){const name=slug($('etitle').value);const h=helpers();await fontsReady();busy(true,'Rendering '+ED.slides.length+' slides');
  const cs=[];for(let i=0;i<ED.slides.length;i++){const c=document.createElement('canvas');c.width=1920;c.height=1080;await DECK.render(c.getContext('2d'),1920,1080,{...ED.slides[i],index:i,total:ED.slides.length},h);cs.push(c)}
  if(kind==='png'){for(let i=0;i<cs.length;i++){await new Promise(r=>cs[i].toBlob(b=>{dl(b,`${name}-${String(i+1).padStart(2,'0')}.png`);setTimeout(r,250)},'image/png'))}}
  else{try{await loadJsPDF();const {jsPDF}=window.jspdf;const pdf=new jsPDF({unit:'px',format:[1920,1080],orientation:'landscape',hotfixes:['px_scaling']});cs.forEach((c,i)=>{if(i)pdf.addPage([1920,1080],'landscape');pdf.addImage(c.toDataURL('image/jpeg',.92),'JPEG',0,0,1920,1080)});pdf.save(`${name}.pdf`)}catch(e){busy(false);await exportDeck('png');toast('PDF library unreachable, so the slides came down as PNGs');return}}
  busy(false);addProject({t:$('etitle').value,m:'Deck · '+ED.slides.length+' slides',th:ED.thumbs&&ED.thumbs[0],kind:'deck',deck:{type:ED.type.id,text:ED.text}});toast(kind==='png'?ED.slides.length+' slides downloaded':'Deck downloaded')}
function loadJsPDF(){if(window.jspdf)return Promise.resolve();const load=src=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)});return load('js/vendor/jspdf.umd.min.js').catch(()=>load('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'))}

/* ---------- drawer (asset picker inside the editor) ---------- */
let dgroups=[],dkey='',dtab='';
const DNAMES={background:'Backgrounds',photo:'Photos',hero:'Launch kit',header:'Launch kit',card:'Launch kit',aipost:'Launch kit',aibp:'Launch kit',expert:'Experts',illustration:'Illustrations',org:'Logos',graphic:'Graphics',icon:'Icons',gif:'GIFs',scene:'Scenes'};
function openDrawer(groups,key){dgroups=groups;dkey=key;dtab=DNAMES[groups[0]]||groups[0];$('dq').value='';renderDrawer();$('drawer').classList.add('on')}
function closeDrawer(){$('drawer').classList.remove('on')}
function renderDrawer(){const tabs=[...new Set(dgroups.map(g=>DNAMES[g]||g))];$('dtabs').innerHTML=tabs.map(t=>`<button class="${dtab===t?'on':''}" onclick="dtab='${t}';renderDrawer()">${t}</button>`).join('');
  const gs=dgroups.filter(g=>(DNAMES[g]||g)===dtab);const q=$('dq').value.toLowerCase();const items=byGroup(...gs).filter(a=>!q||((a.title||'')+' '+(a.tags||[]).join(' ')).toLowerCase().includes(q));
  $('dgrid').className='grid'+(gs.includes('icon')?' icons':gs.includes('illustration')?' ills':gs.includes('org')?' orgs':'');
  $('dgrid').innerHTML=items.map(a=>card(a,`pickAsset('${a.id}')`)).join('')||'<div class="empty">Nothing matches.</div>'}
function pickAsset(id){if(state.kind==='image'){setField(dkey,id)}else if(state.kind==='deck'){const s=ED.slides[ED.i];s.data[dkey]=id;(s.edited=s.edited||{})[dkey]=id;renderDeckPanel();deckSync(true)}closeDrawer()}

/* ---------- library: shelves, sub-shelves beneath. Nothing carries a count; nothing moves when you switch. ---------- */
const LIB=[
 ['images','Images',[['kit','Launch kit',['hero','header','card','aibp','aipost']],['bg','Backgrounds',['background']],['photo','Photos',['photo']],['expert','Experts',['expert']],['illustration','Illustrations',['illustration']],['graphic','Graphics',['graphic']],['org','Logos',['org']],['icon','Icons',['icon']]]],
 ['gifs','GIFs',[['gif','Sales and marketing',['gif']],['leo','Leo',['pack']]]],
 ['videos','Videos',[['film','Films',['film','kit']],['scene','Scenes',['scene']],['music','Music',['music']]]],
 ['copy','Copy',[['tagline','Taglines',[]],['voice','Voice',[]],['post','Posts',[]]]],
 ['fonts','Fonts',[['font','Fonts',['font']]]]];
const COPY_SHOWN=['tagline','post'];                    // the rest of data/copy.json stays in the file, off the shelves
const subOf=k=>{for(const t of LIB)for(const s of t[2])if(s[0]===k)return {tab:t,sub:s};return {tab:LIB[0],sub:LIB[0][2][0]}};
const CHIPS={scene:[['all','All'],['intro','Intros'],['text','Text'],['product','Product'],['outro','Outros']],org:[['all','All'],['school','Schools'],['company','Companies']],illustration:[['all','All'],['social','Communication'],['work','Work'],['growth','Growth']],post:[['all','All'],['community','Community'],['aibp','AI Builder'],['coaching','Coaching'],['jobs','Jobs']]};
function renderTabs(){const cur=state.q?null:subOf(state.tab).tab[0];$('tabs').innerHTML=LIB.map(([k,n,subs])=>`<button class="${cur===k?'on':''}" onclick="go('lib','${subs[0][0]}')">${n}</button>`).join('')}
function renderChips(){const {tab,sub}=subOf(state.tab);const el=$('chips');if(state.q){el.innerHTML='';return}
  let h=tab[2].length>1?tab[2].map(s=>`<button class="${s[0]===sub[0]?'on':''}" onclick="go('lib','${s[0]}')">${s[1]}</button>`).join(''):'';
  const c=CHIPS[sub[0]];if(c)h+=`<span class="filters">${c.map(([k,n])=>`<button class="${state.chip===k?'on':''}" onclick="state.chip='${k}';renderLib()">${n}</button>`).join('')}</span>`;
  el.innerHTML=h}
const hay=a=>((a.title||'')+' '+(a.tags||[]).join(' ')+' '+(a.text||'')).toLowerCase();
function chipMatch(a){const c=state.chip;if(!c||c==='all')return true;if(a.group==='scene')return a.style===c;if(a.group==='org')return a.kind===c;if(a.group==='illustration')return a.set===c;if(a.group==='copy')return a.for===c;return true}
const tip=a=>`title="${esc(plain(a.title))}"`;
/* a card is the thing itself. A name sits under it only where the picture cannot identify it: logos, people, music. */
function card(a,act){
  const on=`onclick="${act||`openAsset('${a.id}')`}" ${tip(a)}`;
  if(a.type==='copy')return `<button class="line ${a.kind}" onclick="copyText(${js(a.text)},'Copied')">${esc(plain(a.text))}</button>`;
  if(a.type==='font')return fontRow(a);
  if(a.type==='pack')return `<div class="card pack" ${on}><div class="th"><iframe src="${a.preview}" title="" tabindex="-1" loading="lazy"></iframe></div></div>`;
  if(a.type==='video')return `<div class="card vid" ${on} onmouseenter="hoverPlay(this,1)" onmouseleave="hoverPlay(this,0)"><div class="th" style="background-image:url('${a.poster}')"><video muted loop playsinline preload="none" poster="${a.poster}" data-src="${a.src}"></video></div></div>`;
  if(a.type==='gif')return `<div class="card gif" ${on} onmouseenter="this.querySelector('img').src='${a.src}'" onmouseleave="this.querySelector('img').src='${a.poster}'"><div class="th"><img loading="lazy" src="${a.poster}" alt=""></div></div>`;
  if(a.type==='audio')return `<div class="card" ${on}><div class="th" style="background-image:url('${a.thumb}')"></div><div class="t">${esc(a.title)}</div></div>`;
  if(a.type==='icon')return `<div class="card" ${on}><div class="th icon"><img loading="lazy" src="${a.src}" alt=""></div></div>`;
  if(a.group==='org')return `<div class="card org" ${on}><div class="th"><img loading="lazy" src="${a.src}" alt=""></div><div class="t">${esc(a.title)}</div></div>`;
  if(a.group==='illustration')return `<div class="card" ${on}><div class="th ill"><img loading="lazy" src="${a.src}" alt=""></div></div>`;
  if(a.group==='graphic')return `<div class="card" ${on}><div class="th contain ${a.dark?'dark':''}"><img loading="lazy" src="${a.src}" alt=""></div></div>`;
  if(a.group==='expert')return `<div class="card" ${on}><div class="th sq" style="background-image:url('${a.thumb}')"></div><div class="t">${esc(a.title)}</div></div>`;
  return `<div class="card" ${on}><div class="th ${a.group==='photo'?'r32':''}" style="background-image:url('${a.thumb||a.src}')"></div></div>`}
/* photos at their true shape: rows of three, every photo in a row the same height, nothing cropped */
function photoRows(items,per=3){let h='';for(let i=0;i<items.length;i+=per){const row=items.slice(i,i+per);const ars=row.map(a=>(a.w&&a.h)?a.w/a.h:1.5);
    const fill=row.length<per?`<i style="flex:${(ars.reduce((s,v)=>s+v,0)/row.length*(per-row.length)).toFixed(3)} 1 0"></i>`:'';
    h+=`<div class="prow">${row.map((a,k)=>`<div class="card" onclick="openAsset('${a.id}')" ${tip(a)} style="flex:${ars[k].toFixed(4)} 1 0;aspect-ratio:${ars[k].toFixed(4)}"><img loading="lazy" src="${a.thumb||a.src}" alt=""></div>`).join('')}${fill}</div>`}return h}
function hoverPlay(el,on){const v=el.querySelector('video');if(!v)return;if(on){if(!v.src)v.src=v.dataset.src;v.currentTime=0;v.play().catch(()=>{})}else{v.pause()}}
function copyItems(kind){const items=(COPY.items||[]).filter(c=>COPY_SHOWN.includes(c.kind)).map(c=>({id:c.id,type:'copy',group:'copy',kind:c.kind,for:c.for,title:c.kind==='post'?c.text.split('\n')[0].slice(0,60):plain(c.text),text:c.text,tags:[c.kind,c.for]}));
  const tags=(M.brand.taglines||[]).map((t,i)=>({id:'tag-'+i,type:'copy',group:'copy',kind:'tagline',for:'brand',title:t,text:t,tags:['tagline']}));
  const norm=s=>plain(s).replace(/’/g,"'");
  const all=items.concat(tags.filter(t=>!items.some(i=>norm(i.text)===norm(t.text))));return kind?all.filter(c=>c.kind===kind):all}
function allItems(){return M.assets.concat(copyItems())}
const fontsLoaded={};
function fontRow(a){const fam='lef-'+a.id;if(!fontsLoaded[fam]){fontsLoaded[fam]=1;new FontFace(fam,`url(${a.src})`).load().then(f=>document.fonts.add(f)).catch(()=>{})}
  const line=(kind,re)=>((COPY.items||[]).find(c=>c.kind===kind&&re.test(c.text))||{}).text;
  /* Season says a tagline; Macan says a longer one; the plain-question-mark cuts say a real line that ends in one */
  const say=/season/i.test(a.family||a.title)?line('tagline',/./):a.plainQuestionMark?line('hook',/\?$/):line('tagline',/,/);
  return `<div class="font"><p style="font-family:'${fam}'">${esc(say||a.title)}</p><div><b>${esc(a.title)}</b><a class="link" href="${a.src}" download>Download</a></div></div>`}
const rules=list=>`<ul class="rules">${(list||[]).map((r,i)=>`<li><span>${i+1}</span><div>${esc(r)}</div></li>`).join('')}</ul>`;
function voiceHTML(){const v=COPY.voice||{};return `<p class="lead">${esc(v.summary)}</p>${rules(v.rules)}<div class="examples">${(v.examples||[]).map(e=>`<div class="${e.bad?'bad':''}"><p>${esc(e.good||e.bad)}</p><span>${esc(e.why)}</span></div>`).join('')}</div>`}
function renderLib(){
  const {sub}=subOf(state.tab);const t=sub[0];renderTabs();renderChips();const g=$('grid');
  if(state.q){const q=state.q;g.className='grid';g.innerHTML=allItems().filter(a=>hay(a).includes(q)).slice(0,300).map(a=>card(a)).join('')||'<div class="empty">Nothing matches.</div>';return}
  if(t==='voice'){g.className='voice';g.innerHTML=voiceHTML();return}
  const items=(COPY_SHOWN.includes(t)?copyItems(t):byGroup(...sub[2])).filter(chipMatch);
  if(t==='photo'){g.className='rows';g.innerHTML=photoRows(items);return}
  g.className=({icon:'grid icons',film:'grid video',scene:'grid three',gif:'grid three',leo:'grid three',graphic:'grid three',org:'grid orgs',illustration:'grid ills',expert:'grid people',tagline:'lines',post:'posts',font:'fonts'})[t]||'grid';
  g.innerHTML=items.map(a=>card(a)).join('')||'<div class="empty">Nothing matches.</div>'}

/* ---------- search: a typed-through placeholder, suggestions as you type ---------- */
function searchExamples(){const t=(g,re)=>(byGroup(g).find(a=>re.test(a.title))||{}).title;
  return [t('org',/stanford/i),'photos',t('film',/jobs/i),t('org',/mckinsey/i),'taglines',t('photo',/crosswalk|stairs/i),t('org',/harvard/i),t('illustration',/./)].filter(Boolean)}
let sg=[],sgi=-1;
function initSearch(){const inp=$('q'),ph=$('qph'),box=$('search');const ex=searchExamples();
  (async()=>{if(!ex.length)return;if(calm()){ph.textContent=ex[0];return}
    for(let i=0;;i++){const w=ex[i%ex.length];for(let k=1;k<=w.length;k++){ph.textContent=w.slice(0,k);await sleep(48+Math.random()*50)}await sleep(1800);for(let k=w.length-1;k>=0;k--){ph.textContent=w.slice(0,k);await sleep(20)}await sleep(380)}})();
  inp.addEventListener('input',()=>{box.classList.toggle('has',!!inp.value);suggest(inp.value);if(!inp.value&&state.q){state.q='';renderLib()}});
  inp.addEventListener('focus',()=>suggest(inp.value));
  inp.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){if(!sg.length)return;e.preventDefault();sgi=(sgi+(e.key==='ArrowDown'?1:-1)+sg.length+(sgi<0&&e.key==='ArrowUp'?1:0))%sg.length;paintSugg()}
    else if(e.key==='Enter'){e.preventDefault();if(sgi>=0)pickSugg(sgi);else searchAll(inp.value)}});
  document.addEventListener('mousedown',e=>{if(!e.target.closest('#search'))closeSugg()})}
function closeSugg(){sg=[];sgi=-1;const el=$('sugg');if(el){el.classList.remove('on');el.innerHTML=''}}
function suggest(raw){const q=raw.trim().toLowerCase();if(!q){closeSugg();return}
  const rank=a=>{const t=plain(a.title||'').toLowerCase();return t.startsWith(q)?0:t.includes(q)?1:2};
  const groups=[];const shelves=[];
  LIB.forEach(t=>t[2].forEach(s=>{const name=t[2].length>1?s[1]:t[1];if(name.toLowerCase().includes(q)||(t[1].toLowerCase().startsWith(q)&&s===t[2][0]))shelves.push({shelf:s[0],title:name})}));
  if(shelves.length)groups.push(['Library',shelves.slice(0,3),-1]);
  LIB.forEach(t=>t[2].forEach(s=>{if(s[0]==='voice')return;const hits=(COPY_SHOWN.includes(s[0])?copyItems(s[0]):byGroup(...s[2])).filter(a=>hay(a).includes(q)).sort((a,b)=>rank(a)-rank(b));if(hits.length)groups.push([s[1],hits.slice(0,3),rank(hits[0])])}));
  const top=groups.sort((a,b)=>a[2]-b[2]).slice(0,5);
  sg=[];sgi=-1;const el=$('sugg');
  el.innerHTML=top.map(([name,items])=>`<div class="sgroup"><h4>${name}</h4>${items.map(a=>{const i=sg.push(a)-1;const im=a.shelf||a.type==='copy'||a.type==='font'||a.type==='pack'?'':`<img src="${a.poster||a.thumb||a.src}" alt="">`;return `<button data-i="${i}" onmousedown="event.preventDefault()" onclick="pickSugg(${i})">${im}<span>${esc(plain(a.title))}</span></button>`}).join('')}</div>`).join('')||'<div class="none">Nothing matches.</div>';
  el.classList.add('on')}
function paintSugg(){document.querySelectorAll('#sugg button').forEach(b=>{const on=+b.dataset.i===sgi;b.classList.toggle('on',on);if(on)b.scrollIntoView({block:'nearest'})})}
function pickSugg(i){const a=sg[i];if(!a)return;closeSugg();$('q').blur();
  if(a.shelf)go('lib',a.shelf);else if(a.type==='copy')copyText(a.text,'Copied');else if(a.type==='font')go('lib','font');else openAsset(a.id)}
function searchAll(raw){const q=raw.trim().toLowerCase();closeSugg();$('q').blur();if(!q)return;state.q=q;if(isOn('lib')){history.replaceState(null,'','#lib');renderLib()}else{history.pushState(null,'','#lib');route()}}

/* ---------- preview (in place, back route) ---------- */
let pvList=[],pvIdx=-1,pvPushed=false;
function openAsset(id){pvList=[...document.querySelectorAll('.screen.on .card')].map(el=>{const m=(el.getAttribute('onclick')||'').match(/openAsset\('([^']+)'\)/);return m?m[1]:null}).filter(Boolean);if(!pvList.length)pvList=[id];pvIdx=pvList.indexOf(id);if(pvIdx<0){pvList=[id];pvIdx=0}pvPushed=true;location.hash='asset/'+id}
function stepPreview(d){if(!pvList.length)return;pvIdx=(pvIdx+d+pvList.length)%pvList.length;history.replaceState(null,'','#asset/'+pvList[pvIdx]);showPreview(pvList[pvIdx])}
function showPreview(id){
  const a=allItems().find(x=>x.id===id);if(!a)return;const st=$('pvstage'),sd=$('pvside');st.className='stage';
  if(a.type==='video')st.innerHTML=`<video src="${a.src}" poster="${a.poster}" controls autoplay playsinline ${a.group==='scene'?'loop muted':''}></video>`;
  else if(a.type==='pack'){st.classList.add('pack');st.innerHTML=`<iframe src="${a.preview}" title="${esc(a.title)}"></iframe>`}
  else if(a.type==='audio')st.innerHTML=`<div style="width:100%"><img src="${a.art||a.thumb}" style="width:100%;margin-bottom:14px" alt=""><audio src="${a.src}" controls autoplay></audio></div>`;
  else if(a.type==='icon'){st.classList.add('icon');st.innerHTML=`<img src="${a.src}" alt="">`}
  else if(a.group==='org')st.innerHTML=`<div class="logo3"><div><img src="${a.src}" alt=""></div><div><img src="${a.mono?a.mono.black:a.src}" alt=""></div><div class="dark"><img src="${a.mono?a.mono.white:a.src}" alt=""></div></div>`;
  else if(a.group==='illustration'){st.classList.add('ill');st.innerHTML=`<img src="${a.src}" alt="">`}
  else{if(a.dark)st.classList.add('dark');st.innerHTML=`<img src="${a.src}" alt="">`}
  const useIn=(tid,key,label)=>`<button class="btn black" onclick="closePreview(true);startImage('${tid}');setField('${key}','${a.id}')">${label}</button>`;
  const down=(src,label,black)=>`<a class="btn ${black?'black':''}" href="${src}" download>${label||'Download'}</a>`;
  let actions;
  if(a.type==='gif')actions=down(a.src,'Download GIF',1)+down(a.mp4,'Download MP4')+`<a class="btn" href="${base()}assets/gifs/src/${a.src.split('/').pop().replace('.gif','.html')}" target="_blank">Open the source</a>`;
  else if(a.type==='pack')actions=down(a.src,'Download the pack',1)+(a.files||[]).map(f=>down(f,f.split('/').pop())).join('');
  else if(a.type==='icon')actions=`<button class="btn black" onclick="copySvg('${a.src}')">Copy SVG</button>`+down(a.src);
  else if(a.group==='org')actions=down(a.src,'Download color',1)+(a.mono?`<div class="two">${down(a.mono.black,'Black')}${down(a.mono.white,'White')}</div>`:'');
  else if(a.group==='illustration')actions=useIn('three-illustrations','ill1','Use in an image')+`<button class="btn" onclick="copySvg('${a.src}')">Copy SVG</button>`+down(a.src);
  else if(a.group==='expert')actions=useIn('expert-spotlight','expert','Use in an image')+down(a.src);
  else if(['background','photo','hero','header','aibp'].includes(a.group))actions=useIn('photo-lockup','photo','Use as the photo')+down(a.src);
  else if(['card','aipost'].includes(a.group))actions=useIn('product-moment','shot','Use as the product shot')+down(a.src);
  else actions=down(a.src,'Download',1);
  sd.innerHTML=`<h2>${esc(plain(a.title))}</h2>${actions}`;
  $('pv').classList.add('on');
}
function closePreview(silent){const pv=$('pv');if(!pv.classList.contains('on'))return;pv.classList.remove('on');pv.querySelectorAll('video,audio').forEach(v=>v.pause());$('pvstage').innerHTML='';if(!silent&&location.hash.startsWith('#asset/')){if(pvPushed)history.back();else location.hash=state.tab?'lib/'+state.tab:'lib'}pvPushed=false}
async function copySvg(src){try{const t=await (await fetch(src)).text();copyText(t,'SVG copied')}catch(e){copyText(base()+src,'Link copied')}}

/* ---------- export helpers ---------- */
function loadImg(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src})}
function wrapText(ctx,text,maxW){const words=String(text||'').split(' '),lines=[];let line='';for(const w of words){const t=line?line+' '+w:w;if(ctx.measureText(t.replace(/[\[\]]/g,'')).width>maxW&&line){lines.push(line);line=w}else line=t}if(line)lines.push(line);if(lines.length>1&&lines[lines.length-1].split(' ').length===1){const prev=lines[lines.length-2].split(' ');if(prev.length>1){lines[lines.length-1]=prev.pop()+' '+lines[lines.length-1];lines[lines.length-2]=prev.join(' ')}}return lines}
function roundRect(x,X,Y,w,h,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()}
function drawRich(x,line,ax,y,align,ink,accent){const parts=line.split(/(\[[^\]]+\])/).filter(Boolean);const widths=parts.map(p=>x.measureText(p.replace(/[\[\]]/g,'')).width);const tw=widths.reduce((a,b)=>a+b,0);let cx=align==='center'?ax-tw/2:align==='right'?ax-tw:ax;x.textAlign='left';parts.forEach((p,i)=>{const b=p.startsWith('[');x.fillStyle=b?(accent||PAL.blue):ink;x.fillText(p.replace(/[\[\]]/g,''),cx,y);cx+=widths[i]})}
async function fontsReady(){try{await document.fonts.load('500 100px Season');await document.fonts.load('500 100px "Season Mix"');await document.fonts.load('400 40px Macan');await document.fonts.load('600 40px Macan')}catch(e){}}
function dl(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),3000)}
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')||'le';
async function exportCurrent(){const name=slug($('etitle').value);
  if(state.kind==='image'){const b=await renderImageFull();dl(b,`${name}-${SIZES[ED.ratio].join('x')}.png`);addProject({t:$('etitle').value,m:ED.t.name+' · '+SIZES[ED.ratio].join('×'),th:$('canvasImg').src,kind:'image',tid:ED.t.id,d:ED.d,ratio:ED.ratio});toast('Downloaded')}
  else if(state.kind==='deck')exportDeck('pdf')}

/* ---------- projects ---------- */
let projects=[],delAsk=null;
const saveProjects=()=>{try{localStorage.setItem('le-projects',JSON.stringify(projects))}catch(e){}};
function restoreProjects(){try{projects=JSON.parse(localStorage.getItem('le-projects')||'[]')}catch(e){projects=[]}renderProjects()}
function addProject(p){const id=ED.pid||p.id||(crypto.randomUUID?crypto.randomUUID():String(Date.now()));projects=projects.filter(q=>q.id!==id);projects.unshift({...p,id,at:new Date().toISOString()});projects=projects.slice(0,60);saveProjects();renderProjects()}
function renderProjects(){$('projnew').style.visibility=projects.length?'visible':'hidden';
  $('projlist').innerHTML=projects.length?`<div class="pgrid">${projects.map((p,i)=>`<div class="proj"><div class="th" onclick="openProject(${i})" style="background-image:url('${p.th||''}')"></div><div class="prow2"><span class="t" onclick="openProject(${i})">${esc(p.t)}</span>${delAsk===p.id?`<span class="ask"><button onclick="deleteProject('${p.id}')">Confirm</button><button onclick="delAsk=null;renderProjects()">Cancel</button></span>`:`<button class="del" onclick="delAsk='${p.id}';renderProjects()">Delete</button>`}</div></div>`).join('')}</div>`:`<div class="empty big"><button class="btn black" onclick="go('make')">Make something</button></div>`}
function deleteProject(id){projects=projects.filter(p=>p.id!==id);delAsk=null;saveProjects();renderProjects();toast('Deleted')}
function openProject(i){const p=projects[i];if(p.kind==='image'&&p.tid&&TEMPLATES.find(t=>t.id===p.tid))startImage(p.tid,p);else if(p.kind==='deck'&&p.deck)startDeck(p.deck.type,p);else toast('Coming soon')}

/* ---------- what the brief and the guidelines say, read from the files themselves ---------- */
function brief(name){const s=('\n'+BRIEF).split(/\n## /).find(x=>x.toLowerCase().startsWith(name.toLowerCase()));if(!s)return [];
  return s.split('\n').slice(1).map(l=>l.trim()).filter(l=>/^(\d+\.|-)\s/.test(l)).map(l=>l.replace(/^(\d+\.|-)\s+/,'').replace(/`/g,''))}
const briefPaletteRules=()=>((BRIEF.match(/\nRules: (.*)/)||[])[1]||'').split(/(?<=\.)\s+/).filter(Boolean).map(s=>s[0].toUpperCase()+s.slice(1));
async function guide(){if(GUIDE)return GUIDE;try{GUIDE=new DOMParser().parseFromString(await (await fetch('brand/chat-guidelines.html')).text(),'text/html')}catch(e){GUIDE=document.implementation.createHTMLDocument('')}return GUIDE}
const guideRules=(doc,id)=>[...doc.querySelectorAll(`#${id} .rules li`)].map(li=>{const c=li.cloneNode(true);const n=c.querySelector('span');if(n)n.remove();return c.textContent.trim()});

/* ---------- motion: the rules, with the guidelines' own live demos ---------- */
const FILM_RULES=[
  'Typed. Characters arrive left to right from where the finished line sits. Fast, about 45 characters a second; the rhythm comes from pauses, not slow letters.',
  'Words. Each word fades up from below with a touch of blur, a tenth of a second apart. The house treatment for taglines and end cards.',
  'Rise. A whole line or card rises and fades in. Used for UI cards and stacked status lines, never a hero headline.',
  'Dissolve. A 0.35s cross-dissolve between scenes. Lockups and typed headlines leave on a hard cut.',
  'The mark draws on stroke by stroke, holds a beat, then the wordmark types in while the lockup re-centres. This is what the films do.',
  'On dark end cards the finished lockup fades in over a quarter second above a headline that already landed.'];
async function renderMotion(){const g=await guide();const sec=(id,title,demo)=>`<section><h2>${title}</h2>${demo||''}${rules(guideRules(g,id))}</section>`;
  $('motionbody').innerHTML=sec('motion','Motion')
    +sec('logo','Logo','<div class="gstage"><div class="logohero"><div class="lmw" id="m-lm"></div></div></div><div class="phases" id="m-phases"></div>')
    +sec('orb','Orb','<div class="og" id="m-og"></div>')
    +sec('voice','Voice','<div class="gstage"><div class="chat" id="m-voice"></div></div>')
    +`<section><h2>Films</h2>${rules(FILM_RULES)}</section>`;
  /* the demos below are the guidelines' own, lifted as they are */
  const vis=new Set();const io=new IntersectionObserver(es=>es.forEach(e=>{e.target.__vis=e.isIntersecting;e.isIntersecting?vis.add(e.target):vis.delete(e.target)}),{threshold:.05});
  const loop=(el,fn)=>{io.observe(el);(async()=>{while(el.isConnected){if(vis.has(el))await fn();else await sleep(300)}})()};
  const lmv=(host,opts)=>{const a=mountMark(host,opts);host.__vis=false;io.observe(host);a.start();return a};
  lmv($('m-lm'),{phase:'all'});
  [['draw','Draw in'],['retract','Into dots'],['spin','Spin'],['form','Form the cube'],['rubik','Rubik turns'],['turn','Turn around'],['flat','Flatten'],['tumble','Tumble']].forEach(([p,n])=>{const d=document.createElement('div');d.innerHTML=`<div class="lmw"></div><span>${n}</span>`;$('m-phases').appendChild(d);lmv(d.querySelector('.lmw'),{phase:p})});
  [['Rest',o=>{}],['Arrive',o=>setInterval(()=>o.appear(),2600)],['Think',o=>o.think(true)],['Busy',o=>{o.set('solving');o.busy(true)}],['Correct',o=>o.glyph('check')],['Continue',o=>o.glyph('right')],['Operator',o=>o.glyph('operator')],['Analyst',o=>o.glyph('analyst')],['Creator',o=>o.glyph('creator')],['Builder',o=>o.glyph('builder')],['Reappear',o=>setInterval(()=>{o.vanish();setTimeout(()=>o.appear(),300)},2400)],['On photos',o=>o.think(true),1]].forEach(([n,f,dk])=>{const d=document.createElement('div');if(dk)d.className='dark';d.innerHTML=`<canvas></canvas><span>${n}</span>`;$('m-og').appendChild(d);const o=Orbs.mount(d.querySelector('canvas'),dk?{display:44,ink:'#ffffff'}:{display:44});o.appear();setTimeout(()=>f(o),400)});
  async function speak(p,text){p.textContent='';const ws=text.split(' ');for(let i=0;i<ws.length;i++){let w=ws[i];const em=/^\*.*\*[.,?!]*$/.test(w);if(em){w=w.replace(/\*/g,'');await sleep(260)}const s=document.createElement('span');s.className='w';s.textContent=w;p.appendChild(s);if(i<ws.length-1)p.append(' ');requestAnimationFrame(()=>s.classList.add('on'));let d=58+Math.min(w.length,10)*8;if(/[,;]$/.test(w))d+=170;else if(/[.?!]$/.test(w))d+=340;if(em)d+=200;await sleep(d)}}
  function aiRow(host){const r=document.createElement('div');r.className='ai';r.innerHTML='<canvas></canvas><p></p>';host.appendChild(r);const o=Orbs.mount(r.querySelector('canvas'),{display:24});o.appear();return{r,o,p:r.querySelector('p')}}
  loop($('m-voice'),async()=>{const h=$('m-voice');h.innerHTML='';const a=aiRow(h);a.o.think(true);a.p.className='think';a.p.textContent='Taking in “Design”';await sleep(1600);a.p.className='';await speak(a.p,'Got it. Which tasks take up *most* of your week?');a.o.think(false);await sleep(3000)})}

/* ---------- brand: the board and the brief, then the chat interface guidelines whole ---------- */
function renderBrand(){
  const sw=(n,hex,dark)=>`<div style="background:${hex}${dark?';color:#fff':''}"><b>${n}</b><span>${hex}</span></div>`;
  const board=byGroup('photo').filter(a=>/^photo-board-([1-9]|10)$/.test(a.id));
  const sec=(title,body,list)=>`<section><h2>${title}</h2>${body}${rules(list)}</section>`;
  $('brandbody').innerHTML=`
  <div class="board"><iframe src="brand/board.html" title="Leland 2.0 brand board"></iframe></div>
  ${sec('Leonardo 3.0 rules','',brief('Leonardo 3.0 rules'))}
  ${sec('Colour',`<div class="sw">${sw('Yellow','#FFD96F')}${sw('Blue','#80ACED')}${sw('Slate','#869AA6',1)}${sw('Beige','#F3F1E6')}${sw('Tan','#EBD4B5')}${sw('Paper','#F9F8F3')}${sw('Ink','#010101',1)}${sw('White','#FFFFFF')}</div>`,briefPaletteRules())}
  ${sec('Lockup',`<div class="lockups"><div><img src="assets/brand/logo.svg" alt=""></div><div style="background:#80ACED"><img src="assets/brand/logo-white.svg" alt=""></div><div style="background:#010101"><img src="assets/brand/logo-white.svg" alt=""></div><div style="background:#FFD96F"><img src="assets/brand/mark.svg" class="mk" alt=""></div></div>`,brief('Lockups'))}
  ${sec('Type',`<div class="typebox"><div><span class="s">${esc(((M.brand.taglines||[])[3])||'')}</span><small>Season Mix 500</small></div><div><span class="m">${esc((M.brand.pitch||{}).oneliner||'')}</span><small>Macan 400 / 500 / 600</small></div></div>`,brief('Type'))}
  ${sec('Photography',`<div class="rows">${photoRows(board)}</div>`,brief('Photography'))}
  ${sec('Illustration',`<div class="illrow">${byGroup('illustration').filter((a,i)=>i%37===0).slice(0,8).map(a=>`<div onclick="openAsset('${a.id}')" ${tip(a)}><img src="${a.src}" alt=""></div>`).join('')}</div>`,brief('Illustration'))}
  <iframe id="guide" src="brand/chat-guidelines.html" title="Chat interface guidelines" scrolling="no"></iframe>`}
addEventListener('message',e=>{if(e.origin===location.origin&&e.data&&e.data.leGuideH&&$('guide'))$('guide').style.height=e.data.leGuideH+'px'});

/* ---------- the skill: assembled from the repository's own documents ---------- */
const PUBLIC='https://mwatterson1991.github.io/LE/';
function SKILL(b){b=b||(/^https?:\/\/(localhost|127\.)/.test(base())||location.protocol==='file:'?PUBLIC:base());
  const groups={};M.assets.forEach(a=>groups[a.group]=(groups[a.group]||0)+1);const n=g=>groups[g]||0;
  const org=byGroup('org').find(a=>/stanford/i.test(a.title))||byGroup('org')[0]||{};const ph=byGroup('photo').find(a=>/stairs/i.test(a.title))||byGroup('photo')[0]||{};
  const num=l=>l.map((r,i)=>`${i+1}. ${r}`).join('\n'),dash=l=>l.map(r=>`- ${r}`).join('\n');
  const v=COPY.voice||{};
  return `---
name: le
description: LE is Leland's repository of marketing work — the images, photos, logos, GIFs, films, fonts, taglines and posts people draw from — plus the brand rules. Use it whenever making any Leland marketing asset (post, image, deck, video, email, page) to fetch the approved asset or line and stay inside the rules. Trigger on "Leland asset", "on brand", "launch kit", "/le".
---
# LE — Leland's repository

LE is the repository. You are the hands. Nobody needs to open LE to use it.

## 1. Read these first
- Manifest, every asset: ${b}data/manifest.json
- Copy, every line with its source: ${b}data/copy.json
- Brand brief: ${b}BRAND-BRIEF.md
- Sales-deck rules: ${b}SALES-DECK.md
- Chat interface guidelines (logo, orb, voice, answers, widgets, icons, type, colour, images, intro, section screens, motion, scores, ten rules): ${b}brand/chat-guidelines.html
- Brand board: ${b}brand/board.html

Fetch the manifest and the brief before making anything. If a file cannot be fetched, say so; do not work from memory.

## 2. Leonardo 3.0 rules (verbatim from BRAND-BRIEF.md)
${num(brief('Leonardo 3.0 rules'))}

## 3. Fetch an asset by group and title
\`manifest.assets[]\` is a flat list. Every entry has \`id\`, \`type\`, \`group\`, \`title\`, \`tags[]\` and \`src\`. \`src\` is relative: the file is at ${b} + src.

1. Pick the group from the table below.
2. Filter \`assets\` to that group.
3. Match the ask against \`title\` first, then \`tags\`, case-insensitive. If several match, prefer the title that starts with the ask.
4. Return ${b} + \`src\`. If nothing matches, say so and offer the closest titles. Never invent an asset or a URL.

Example: the ask is "the ${org.title} logo" → group \`org\`, title "${org.title}" → ${b}${org.src}
Example: the ask is "a photo of someone on stairs" → group \`photo\`, title "${ph.title}" → ${b}${ph.src}

| group | what it is | count | extra fields |
|---|---|---|---|
| photo | photography, true size | ${n('photo')} | w, h, thumb |
| background | sky, texture and abstract fields | ${n('background')} | thumb |
| hero, header, card, aibp, aipost | launch kit images we posted | ${n('hero')+n('header')+n('card')+n('aibp')+n('aipost')} | thumb |
| expert | expert headshots | ${n('expert')} | thumb |
| illustration | blue line illustrations (SVG) | ${n('illustration')} | set |
| graphic | brand lockups and product graphics | ${n('graphic')} | dark (needs a dark field) |
| org | school and company logos | ${n('org')} | kind (school or company), mono.black, mono.white |
| icon | interface icons (SVG) | ${n('icon')} | |
| gif | looping sales and marketing concepts | ${n('gif')} | mp4, poster |
| film, kit | finished films | ${n('film')+n('kit')} | poster, duration |
| scene | single scenes cut from the films | ${n('scene')} | style (intro, text, product, outro), from, poster |
| music | film soundtracks | ${n('music')} | duration |
| font | Season Mix and Macan (woff2) | ${n('font')} | family, weight, plainQuestionMark |
| pack | Leo, the animated face (zip) | ${n('pack')} | preview, files |

Photo titles describe the scene or the action. Never describe a person by race or ethnicity when choosing, captioning or tagging a photo.

## 4. Copy
Use lines from \`copy.json\` as they are written; every item has \`kind\`, \`text\`, \`for\`, \`platform\` and \`source\`. Do not write new marketing copy when a line exists. The shelves are \`tagline\` and \`post\`; \`headline\`, \`hook\`, \`cta\`, \`subject\`, \`ad\`, \`bio\` and \`quote\` are in the file too.

Approved taglines: ${(M.brand.taglines||[]).join(' · ')}

Voice (copy.json → voice.summary): ${v.summary||''}

Voice rules (copy.json → voice.rules, verbatim):
${num(v.rules||[])}

## 5. Brand (verbatim from BRAND-BRIEF.md)
Palette rules: ${briefPaletteRules().join(' ')}

Type:
${dash(brief('Type'))}

Lockups:
${dash(brief('Lockups'))}

Photography:
${dash(brief('Photography'))}

Illustration:
${dash(brief('Illustration'))}

## 6. Fonts
- Season Mix 500: ${b}fonts/SeasonMix-Medium.woff2
- Macan 400 / 500 / 600 with a plain question mark: ${b}fonts/Macan-Book-Q.woff2, ${b}fonts/Macan-Medium-Q.woff2, ${b}fonts/Macan-SemiBold-Q.woff2
- From the chat interface guidelines: "A plain question mark, never Macan's." Use the -Q files, or map U+003F to Helvetica Neue in CSS: \`@font-face{font-family:'QMark';src:local('Helvetica Neue'),local('Helvetica'),local('Arial');unicode-range:U+003F}\` and put 'QMark' first in the font stack.

## 7. Guardrails (verbatim from the launch kit, manifest.brand.guardrails)
${dash(M.brand.guardrails||[])}

## 8. Decks
Follow ${b}SALES-DECK.md. It sits on top of the Leonardo 3.0 rules, which still govern fields, type, lockup and text limits.
`}
/* a small reader for the skill's own markdown */
function mdHTML(md){const inl=s=>esc(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/(https?:\/\/[^\s<,]+[^\s<,.])/g,'<a href="$1" target="_blank" rel="noopener">$1</a>');
  const L=md.split('\n');let h='',i=0;
  if(L[0]==='---'){const e=L.indexOf('---',1);h+=`<pre>${esc(L.slice(1,e).join('\n'))}</pre>`;i=e+1}
  for(;i<L.length;i++){const l=L[i];
    if(/^# /.test(l)){continue}
    if(/^## /.test(l)){h+=`<h2>${inl(l.slice(3))}</h2>`;continue}
    if(/^\|/.test(l)){const rows=[];while(i<L.length&&/^\|/.test(L[i])){rows.push(L[i]);i++}i--;const cells=r=>r.split('|').slice(1,-1).map(c=>c.trim());h+=`<table>${rows.filter(r=>!/^\|[-| ]+\|$/.test(r)).map((r,k)=>`<tr>${cells(r).map(c=>k?`<td>${inl(c)}</td>`:`<th>${inl(c)}</th>`).join('')}</tr>`).join('')}</table>`;continue}
    if(/^(\d+\.|-) /.test(l)){const ol=/^\d/.test(l);const items=[];while(i<L.length&&/^(\d+\.|-) /.test(L[i])){items.push(L[i].replace(/^(\d+\.|-) /,''));i++}i--;h+=ol?`<ul class="rules">${items.map((t,k)=>`<li><span>${k+1}</span><div>${inl(t)}</div></li>`).join('')}</ul>`:`<ul class="dash">${items.map(t=>`<li>${inl(t)}</li>`).join('')}</ul>`;continue}
    if(l.trim())h+=`<p>${inl(l)}</p>`}
  return h}
function renderSkill(){$('skillbody').innerHTML=mdHTML(SKILL())}
function downloadSkill(){dl(new Blob([SKILL()],{type:'text/markdown'}),'SKILL.md');toast('Downloaded')}
