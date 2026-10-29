/* LE — Leland's asset engine */
const $=id=>document.getElementById(id);
let M={brand:{},assets:[],posts:[]},COPY={voice:{},items:[]};
let state={kind:null,tab:'kit',q:'',chip:'all',logoMode:'color',music:'audio-onconversation',dark:false,outro:'draw'};
const A=id=>M.assets.find(a=>a.id===id);
const byGroup=(...g)=>M.assets.filter(a=>g.includes(a.group));
const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const blue=s=>esc(s).replace(/\[([^\]]+)\]/g,'<em>$1</em>');
const plain=s=>String(s||'').replace(/[\[\]]/g,'');
const base=()=>location.href.replace(/[#?].*$/,'').replace(/[^/]*$/,'');
const SCREENS=['make','pick','lib','editor','projects','connect','motion','brand'];
const PAL={yellow:'#FFD96F',blue:'#80ACED',slate:'#869AA6',beige:'#F3F1E6',tan:'#EBD4B5',paper:'#F9F8F3',ink:'#010101',neutral:'#222222',follow:'#3963D7',white:'#fff'};

/* ---------- boot ---------- */
async function boot(){
  try{M=await (await fetch('data/manifest.json')).json()}catch(e){toast('Could not load data/manifest.json. Serve the folder rather than opening the file.')}
  try{COPY=await (await fetch('data/copy.json')).json()}catch(e){}
  loadMotion();renderPicks();renderLib();renderBrand();renderProjects();renderConnect();renderMotion();
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
  document.querySelectorAll('.side a').forEach(a=>a.classList.toggle('on',a.id==='s-'+(id==='pick'||id==='editor'?'make':id)));
  $('main').scrollTop=0;stopPicks(id==='make');
  if(id==='lib'){if(arg){state.tab=arg;state.chip='all'}renderLib()}
  if(id==='pick')renderPick(arg);
  if(id==='editor'&&!state.kind){location.replace('#make');return}
  if(id==='projects')renderProjects();if(id==='connect')renderConnect();if(id==='motion')renderMotion();
}
function go(id,arg){location.hash=id+(arg?'/'+arg:'')}
const isOn=id=>$(id).classList.contains('on');
function menu(id){const m=$(id),on=m.classList.contains('on');closeMenus();if(!on)m.classList.add('on')}
function closeMenus(){document.querySelectorAll('.menu').forEach(m=>m.classList.remove('on'))}
document.addEventListener('click',e=>{if(!e.target.closest('.menu')&&!e.target.closest('.top .right'))closeMenus()});
document.addEventListener('keydown',e=>{const typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
  if(e.key==='Escape'){closeMenus();closeDrawer();if($('pv').classList.contains('on'))closePreview();$('ov').classList.remove('on');document.activeElement.blur()}
  if($('pv').classList.contains('on')&&!typing){if(e.key==='ArrowRight')stepPreview(1);if(e.key==='ArrowLeft')stepPreview(-1)}
  if((e.metaKey||e.ctrlKey)&&e.key==='Enter'&&isOn('editor'))exportCurrent()});
function toast(m,act){if(window.leo&&/error/i.test(m))leo.peek('puzzled');const t=$('toast');t.innerHTML=m+(act?`<b onclick="${act}">Open</b>`:'');t.classList.add('on');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('on'),3200)}
function copyText(s,msg){(navigator.clipboard?navigator.clipboard.writeText(s):Promise.reject()).then(()=>toast(msg||'Copied')).catch(()=>{prompt('Copy:',s)})}
function busy(on,msg){$('ov').classList.toggle('on',!!on);if(msg)$('ovp').textContent=msg;if(window.leo){on?leo.work():leo.rest()}}

/* ---------- Make: four things, each shown as the real thing ---------- */
const KINDS=[
  {id:'image',name:'Image',desc:'A post for LinkedIn or Instagram, an ad, an email hero.'},
  {id:'video',name:'Video',desc:'A launch film from your story and three screenshots.'},
  {id:'deck',name:'Deck',desc:'Paste what it should say. Get the slides.'},
  {id:'story',name:'Case study',desc:'A customer win as a carousel, a page and a post.'}];
let pickTimers=[];
function renderPicks(){
  const tpl=['field-headline','photo-lockup','stat','three-illustrations'].map(t=>`assets/templates/${t}.jpg`);
  const decks=(window.DECK?DECK.types:[]).map(t=>`assets/templates/deck-${t.id}.jpg`);
  const clip=byGroup('scene').find(a=>a.from==='film-get-there-with-the-people-whove-been-there'&&a.style==='product')||byGroup('scene')[0]||{};
  $('picks').innerHTML=`
  <button class="pick" onclick="go('pick','image')"><div class="art r45" data-cycle="1">${tpl.map((s,i)=>`<img src="${s}" class="${i?'':'on'}" alt="">`).join('')}</div><div class="body"><b>Image</b></div></button>
  <button class="pick" onclick="startVideo()"><div class="art r169"><video muted loop playsinline autoplay poster="${clip.poster||''}" src="${clip.src||''}"></video></div><div class="body"><b>Video</b></div></button>
  <button class="pick" onclick="go('pick','deck')"><div class="art r169" data-cycle="1">${decks.map((s,i)=>`<img src="${s}" class="${i?'':'on'}" alt="">`).join('')}</div><div class="body"><b>Deck</b></div></button>
  <button class="pick" onclick="startStory()"><div class="art" data-cycle="1" id="storyArt"><img src="assets/templates/stat.jpg" class="on" alt=""></div><div class="body"><b>Case study</b></div></button>`;
  stopPicks(true);storyArt()}
async function storyArt(){if(!window.renderStorySlide||!$('storyArt'))return;try{await fontsReady();if(!story.co)story={...JSON.parse(JSON.stringify(SAMPLE)),slide:0};const imgs=[];for(const k of ['cover','built','quote']){const c=await renderStorySlide(k,432,540);imgs.push(c.toDataURL('image/jpeg',.85))}$('storyArt').innerHTML=imgs.map((s,i)=>`<img src="${s}" class="${i?'':'on'}" alt="">`).join('');stopPicks(isOn('make'))}catch(e){}}
function stopPicks(start){pickTimers.forEach(clearInterval);pickTimers=[];if(!start)return;
  document.querySelectorAll('#picks .art[data-cycle]').forEach(el=>{const imgs=[...el.querySelectorAll('img')];let i=0;pickTimers.push(setInterval(()=>{i=(i+1)%imgs.length;imgs.forEach((im,k)=>im.classList.toggle('on',k===i))},2600))});
  document.querySelectorAll('#picks video').forEach(v=>v.play().catch(()=>{}))}

/* ---------- Pick a type ---------- */
function renderPick(kind){
  if(kind==='image'){$('pickTitle').textContent='Which kind of image?';
    $('pickBody').innerHTML=`<div class="types">${(window.TEMPLATES||[]).map(t=>`<button class="type" onclick="startImage('${t.id}')"><div class="th r45"><img src="assets/templates/${t.id}.jpg" alt=""></div><b>${esc(t.name)}</b></button>`).join('')}</div>
    <h2 class="sub">Or start from something we posted</h2><div class="grid">${byGroup('hero','header','card','aibp').slice(0,10).map(a=>`<div class="card" onclick="openAsset('${a.id}')"><div class="th" style="background-image:url('${a.thumb||a.src}')"></div><div class="t">${esc(a.title)}</div></div>`).join('')}</div>`}
  else if(kind==='deck'){$('pickTitle').textContent='Which kind of deck?';
    $('pickBody').innerHTML=`<div class="types four">${DECK.types.map(t=>`<button class="type" onclick="startDeck('${t.id}')"><div class="th r169"><img src="assets/templates/deck-${t.id}.jpg" alt=""></div><b>${esc(t.name)}</b></button>`).join('')}</div>`}
  else go('make')}

/* ---------- Editor shell ---------- */
let ED={};
function openEditor(kind,title,saved){let from=location.hash;if(/^#asset/.test(from)){history.replaceState(null,'','#lib/'+state.tab);from='#lib/'+state.tab}state.kind=kind;ED={pid:saved&&saved.id||null};$('etitle').value=title;const name=/^#pick/.test(from)?'Types':/^#lib|^#asset/.test(from)?'Library':/^#projects/.test(from)?'Projects':'Make';$('eback').lastChild.textContent=name;$('eback').onclick=()=>{if(/^#asset/.test(from))go('lib',state.tab);else if(from&&from!=='#editor')history.back();else go('make')};
  $('dlbtn').textContent='Download';$('dlbtn').disabled=false;$('canvasImg').style.display='';$('canvasImg').removeAttribute('src');$('resultVid').style.display='none';$('resultVid').removeAttribute('src');$('slides').innerHTML='';$('stagebar').innerHTML='';$('stage').className='stage';
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
  ${first?`<div class="sec"><h3>Lines we've used <button class="link" onclick="go('lib','headline')">All</button></h3><div class="copylist">${copyFor('headline').slice(0,6).map(c=>`<button onclick='setField("${first.key}",${JSON.stringify(c.text)})'>${esc(plain(c.text))}</button>`).join('')}</div></div>`:''}
`}
function setField(k,v,fromInput){ED.d[k]=v;const f=ED.t.fields.find(x=>x.key===k);if(k==='expert'&&A(v)){ED.d.name=A(v).title;ED.d.role='Leland expert'}if(!fromInput||(f&&f.type!=='text'))renderImagePanel();imageSync()}
let imgT=null,saveT=null;
function autosave(fn){clearTimeout(saveT);saveT=setTimeout(()=>{try{const p=fn();if(!p)return;p.id=ED.pid=ED.pid||(crypto.randomUUID?crypto.randomUUID():String(Date.now()));const i=projects.findIndex(q=>q.id===p.id);if(i>=0)projects[i]={...projects[i],...p,at:new Date().toISOString()};else projects.unshift({...p,at:new Date().toISOString()});localStorage.setItem('le-projects',JSON.stringify(projects.slice(0,60)));renderProjects()}catch(e){}},1500)}
function imageSync(){clearTimeout(imgT);imgT=setTimeout(async()=>{const [W,H]=SIZES[ED.ratio];const s=Math.min(1,1000/W);const c=document.createElement('canvas');c.width=W*s;c.height=H*s;const x=c.getContext('2d');x.scale(s,s);await fontsReady();try{await ED.t.render(x,W,H,ED.d,helpers())}catch(e){console.error(e);toast('Render error: '+e.message)}$('canvasImg').src=c.toDataURL('image/jpeg',.92);$('stage').className='stage '+ED.ratio;autosave(()=>({t:$('etitle').value,m:ED.t.name+' · '+SIZES[ED.ratio].join('×'),th:$('canvasImg').src,kind:'image',tid:ED.t.id,d:ED.d,ratio:ED.ratio}))},40)}
async function renderImageFull(){const [W,H]=SIZES[ED.ratio];const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');await fontsReady();await ED.t.render(x,W,H,ED.d,helpers());return new Promise(r=>c.toBlob(r,'image/png'))}
function copyFor(kind,prod){return (COPY.items||[]).filter(c=>c.kind===kind&&(!prod||c.for===prod))}

/* ---------- Video: a form, then a film ---------- */
function startVideo(saved){openEditor('video',saved?saved.t:'Untitled video',saved);const v=saved&&saved.video||{};ED={pid:ED.pid,shots:saved?saved.shots||[]:[],story:saved?saved.story||'':'',dur:v.dur||20,vibe:'vibe' in v?v.vibe:'audio-onconversation',dark:!!v.dark,blob:null,tag:v.tag||'Own your future.',badges:'badges' in v?v.badges:false};$('stage').className='stage r169 empty';renderVideoPanel()}
function renderVideoPanel(){
  const shots=ED.shots.map(id=>A(id)).filter(Boolean);
  $('panel').innerHTML=`<div class="sec"><h3>The story</h3><div class="f"><textarea id="vStory" style="min-height:96px" oninput="ED.story=this.value;renderVideoBtn()" placeholder="Jobs is live. Drop your resume and your next job finds you.">${esc(ED.story)}</textarea></div></div>
  <div class="sec"><h3>Three screenshots <small>${shots.length}</small></h3><div class="shotlist">${shots.map((a,i)=>`<div class="shotc"><img src="${a.thumb||a.poster||a.src}" alt=""><button class="x" onclick="ED.shots.splice(${i},1);renderVideoPanel()">×</button></div>`).join('')}<label class="shotc add">+<input type="file" accept="image/*" multiple style="display:none" onchange="uploadShots(this.files)"></label></div><button class="link" onclick="openDrawer(['card','aipost','hero','gif'],'shots')">From the library</button></div>
  <div class="sec"><h3>Length</h3><div class="seg">${[15,20,30].map(d=>`<button class="${ED.dur===d?'on':''}" onclick="ED.dur=${d};renderVideoPanel()">${d}s</button>`).join('')}</div></div>
  <div class="sec"><h3>Music</h3><div class="music">${byGroup('music').map(a=>`<button class="${ED.vibe===a.id?'on':''}" onclick="ED.vibe='${a.id}';renderVideoPanel()"><img src="${a.thumb}" alt="">${esc(a.title)}<small>${a.duration}s</small></button>`).join('')}<button class="${ED.vibe===null?'on':''}" onclick="ED.vibe=null;renderVideoPanel()"><span style="width:34px"></span>No music</button></div></div>
  <div class="sec"><h3>Close with</h3><div class="f"><input value="${esc(ED.tag)}" oninput="ED.tag=this.value"></div><div class="copylist">${(M.brand.taglines||[]).filter(t=>t!==ED.tag).map(t=>`<button onclick='ED.tag=${JSON.stringify(t)};renderVideoPanel()'>${esc(t)}</button>`).join('')}</div><div class="f" style="margin-top:10px"><div class="seg"><button class="${ED.badges?'on':''}" onclick="ED.badges=true;renderVideoPanel()">App badges</button><button class="${!ED.badges?'on':''}" onclick="ED.badges=false;renderVideoPanel()">No badges</button></div></div></div>
  <div class="sec"><h3>Look</h3><div class="seg"><button class="${!ED.dark?'on':''}" onclick="ED.dark=false;renderVideoPanel()">White</button><button class="${ED.dark?'on':''}" onclick="ED.dark=true;renderVideoPanel()">Black</button></div></div>
  <div class="cook"><button class="btn black" id="vgo" onclick="makeVideo()">Make the film</button></div>`;renderVideoBtn();
  if(ED.blob){$('resultVid').style.display='';$('stage').className='stage r169'}}
function renderVideoBtn(){const ok=ED.shots.length>=3&&!!ED.story.trim();const b=$('vgo');if(b)b.disabled=!ok;const d=$('dlbtn');d.textContent=ED.blob?'Download':'Make the film';d.disabled=!ok&&!ED.blob}
function uploadShots(files){[...files].forEach(f=>{const r=new FileReader();r.onload=()=>{const id='upload-'+Date.now()+Math.random().toString(36).slice(2,6);M.assets.push({id,type:'image',group:'upload',title:f.name,src:r.result,thumb:r.result,tags:['upload']});ED.shots.push(id);renderVideoPanel()};r.readAsDataURL(f)})}
async function makeVideo(){const story=ED.story.trim();busy(true,'Writing the hook');
  let hook=story.split(/(?<=[.!?])\s/)[0].replace(/!/g,'.').slice(0,60),tag=ED.tag||'Own your future.';
  if(hasOpus()){try{const out=jsonOf(await opus(SYSTEM(),`Story: ${story}\nReturn JSON {"hook":"<=48 chars, one [blue phrase], the first line of a launch film","tagline":"<=6 words closer with one [blue phrase]","title":"3 word title"}`));if(out){hook=out.hook||hook;tag=out.tagline||tag;if(out.title)$('etitle').value=out.title}}catch(e){}}
  if(!/\[/.test(hook)){const w=hook.split(' ');if(w.length>=2){const k=w.length>3?w.length-2:w.length-1;hook=w.slice(0,k).join(' ')+' ['+w.slice(k).join(' ').replace(/\.$/,'')+'].'}}
  const n=ED.shots.length,per=Math.max(2,Math.min(4,(ED.dur-5.5)/n));
  const S=[{type:'text',text:hook,anim:MOTION.defaults.text,dur:2.5},...ED.shots.map(id=>({type:(A(id)||{}).type==='gif'?'clip':'shot',asset:id,dur:per})),{type:'outro',tag,badges:ED.badges,dur:3}];
  state.dark=ED.dark;state.music=ED.vibe;state.outro=MOTION.defaults.logo;
  busy(true,'Rendering '+Math.round(S.reduce((a,s)=>a+sceneDur(s),0))+' seconds in your browser');
  try{const {blob,ext,T}=await renderVideo(S);ED.blob=blob;ED.ext=ext;const v=$('resultVid');v.src=URL.createObjectURL(blob);v.style.display='';$('canvasImg').style.display='none';$('stage').className='stage r169';$('main').scrollTop=0;v.play().catch(()=>{});
    addProject({t:$('etitle').value,m:'Video · '+T.toFixed(0)+'s',th:(A(ED.shots[0])||{}).thumb,kind:'video',shots:ED.shots.filter(id=>!id.startsWith('upload')),story:ED.story,video:{dur:ED.dur,vibe:ED.vibe,dark:ED.dark,tag:ED.tag,badges:ED.badges}});toast('Play it, then download.')}catch(e){console.error(e);toast('Render error: '+e.message)}
  busy(false)}

/* ---------- Deck: a type, pasted text, slides ---------- */
function startDeck(tid,saved){const t=DECK.types.find(x=>x.id===tid)||DECK.types[0];openEditor('deck',saved?saved.t:t.name+' deck',saved);ED={pid:ED.pid,type:t,text:saved?saved.deck.text:DECK.sample(t.id),slides:[],i:0};buildDeck()}
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
function loadJsPDF(){if(window.jspdf)return Promise.resolve();return new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s)})}

/* ---------- Story (story.js renders; this is the shell) ---------- */
function startStory(saved){openEditor('story',saved?saved.t:'Untitled story',saved);$('stage').className='stage r45';
  $('panel').innerHTML=`<div class="sec"><h3>Paste the story</h3><div class="f"><textarea id="stPaste" style="min-height:80px" placeholder="A post, notes, anything about the customer"></textarea></div><button class="btn sm" onclick="storyBrief($('stPaste').value)">Read it</button></div>
  <div class="sec"><h3>Story <button class="link" onclick="openDrawer(['org'],'storyLogo')">Logo</button></h3>
  <div class="f"><label>Company</label><input id="stCo" oninput="storySync()"></div><div class="f"><label>Headline</label><input id="stHead" oninput="storySync()"></div><div class="f"><label>Who they are</label><textarea id="stWho" oninput="storySync()"></textarea></div><div class="f"><label>Before</label><textarea id="stBefore" oninput="storySync()"></textarea></div><div class="f"><label>What they built, one per line</label><textarea id="stBuilt" oninput="storySync()" style="min-height:90px"></textarea></div><div class="f"><label>Quote</label><textarea id="stQuote" oninput="storySync()"></textarea></div><div class="f"><label>Said by</label><input id="stBy" oninput="storySync()"></div><div class="f"><label>Close</label><input id="stCta" oninput="storySync()"></div></div>
  <div class="sec"><h3>Outputs</h3><div class="outs"><button class="btn sm" onclick="exportStory('carousel')">Carousel PDF</button><button class="btn sm" onclick="exportStory('png')">Slides PNG</button><button class="btn sm" onclick="exportStory('page')">Web page</button><button class="btn sm" onclick="exportStory('post')">Post text</button></div></div>
`;
  if(saved&&saved.story)storyLoad(saved.story);else storyInit();storySync()}

/* ---------- drawer (asset picker) ---------- */
let dgroups=[],dkey='',dtab='';
const DNAMES={background:'Backgrounds',photo:'Photos',hero:'Launch kit',header:'Launch kit',card:'Launch kit',aipost:'Launch kit',aibp:'Launch kit',expert:'Experts',illustration:'Illustrations',org:'Logos',graphic:'Graphics',icon:'Icons',gif:'GIFs',upload:'Uploads',scene:'Scenes'};
function openDrawer(groups,key){dgroups=groups;dkey=key;const tabs=[...new Set(groups.map(g=>DNAMES[g]||g))];dtab=tabs[0];$('dq').value='';renderDrawer();$('drawer').classList.add('on')}
function closeDrawer(){$('drawer').classList.remove('on')}
function renderDrawer(){const tabs=[...new Set(dgroups.map(g=>DNAMES[g]||g))];$('dtabs').innerHTML=tabs.map(t=>`<button class="${dtab===t?'on':''}" onclick="dtab='${t}';renderDrawer()">${t}</button>`).join('');
  const gs=dgroups.filter(g=>(DNAMES[g]||g)===dtab);const q=$('dq').value.toLowerCase();const items=byGroup(...gs).filter(a=>!q||((a.title||'')+' '+(a.tags||[]).join(' ')).toLowerCase().includes(q));
  $('dgrid').className='grid'+(gs.includes('icon')?' icons':gs.includes('illustration')?' ills':gs.includes('org')?' orgs':'');
  $('dgrid').innerHTML=items.map(a=>{const contain=SW_CONTAIN.includes(a.group);const cls=a.group==='icon'?'icon':a.group==='illustration'?'ill':contain?'contain sq':a.group==='photo'?'r43':a.group==='expert'?'sq':'';
    return `<div class="card" onclick="pickAsset('${a.id}')"><div class="th ${cls}" style="${contain?'':`background-image:url('${a.poster||a.thumb||a.src}')`}">${contain?`<img loading="lazy" src="${a.src}" alt="">`:''}</div>${a.group==='icon'?'':`<div class="t">${esc(a.title)}</div>`}</div>`}).join('')||'<div class="empty">Nothing matches.</div>'}
function pickAsset(id){if(dkey==='shots'){ED.shots.push(id);renderVideoPanel()}else if(dkey==='storyLogo'){storyLogo(id)}else if(state.kind==='image'){setField(dkey,id)}else if(state.kind==='deck'){const s=ED.slides[ED.i];s.data[dkey]=id;(s.edited=s.edited||{})[dkey]=id;renderDeckPanel();deckSync(true)}closeDrawer()}

/* ---------- library: four shelves, sub-shelves beneath ---------- */
const LIB=[
 ['images','Images','<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="M21 16l-5-5-8 8"/>',[['kit','Launch kit',['hero','header','card','aibp','aipost']],['bg','Backgrounds',['background']],['photo','Photos',['photo']],['expert','Experts',['expert']],['illustration','Illustrations',['illustration']],['graphic','Graphics',['graphic']],['org','Logos',['org']],['icon','Icons',['icon']]]],
 ['gifs','GIFs','<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 12h2M12 9v6M15 9h3M15 12h2"/>',[['gif','Sales and marketing',['gif']]]],
 ['videos','Videos','<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z"/>',[['film','Films',['film','kit']],['scene','Scenes',['scene']],['music','Music',['music']]]],
 ['copy','Copy','<path d="M5 6h14M5 12h10M5 18h7"/>',[['post','Posts',[]],['headline','Headlines',[]],['hook','Hooks',[]],['tagline','Taglines',[]],['cta','Calls to action',[]],['subject','Subject lines',[]],['ad','Ads',[]],['bio','Bios',[]]]]];
const COPY_KINDS=['post','headline','hook','tagline','cta','subject','ad','bio','quote'];
const subOf=k=>{for(const t of LIB)for(const s of t[3])if(s[0]===k)return {tab:t,sub:s};return {tab:LIB[0],sub:LIB[0][3][0]}};
const CHIPS={scene:[['all','All'],['intro','Intros'],['text','Text'],['product','Product'],['outro','Outros']],org:[['all','All'],['school','Schools'],['company','Companies']],illustration:[['all','All'],['social','Communication'],['work','Work'],['growth','Growth']],post:[['all','All'],['community','Community'],['aibp','AI Builder'],['coaching','Coaching'],['jobs','Jobs']]};
function count(s){return COPY_KINDS.includes(s[0])?copyItems(s[0]).length:byGroup(...s[2]).length}
function renderTabs(){const cur=state.q?null:subOf(state.tab).tab[0];$('tabs').innerHTML=LIB.map(([k,n,ic,subs])=>`<button class="${cur===k?'on':''}" onclick="go('lib','${subs[0][0]}')"><svg class="ico" viewBox="0 0 24 24">${ic}</svg>${n}</button>`).join('')}
function renderChips(){const {tab,sub}=subOf(state.tab);const el=$('chips');if(state.q){el.innerHTML='';return}
  let h=tab[3].map(s=>`<button class="${s[0]===sub[0]?'on':''}" onclick="go('lib','${s[0]}')">${s[1]}<small>${count(s)}</small></button>`).join('');
  const c=CHIPS[sub[0]];if(c)h+=`<span class="filters">${c.map(([k,n])=>`<button class="${state.chip===k?'on':''}" onclick="state.chip='${k}';renderLib()">${n}</button>`).join('')}</span>`;
  if(sub[0]==='org')h+=`<span class="filters">${['color','black','white'].map(m=>`<button class="${state.logoMode===m?'on':''}" onclick="state.logoMode='${m}';renderLib()">${m[0].toUpperCase()+m.slice(1)}</button>`).join('')}</span>`;
  el.innerHTML=h}
function searchLib(q){state.q=q.toLowerCase();if(!isOn('lib'))go('lib');renderLib()}
function match(a){const q=state.q;if(!q)return true;return ((a.title||'')+' '+(a.sub||'')+' '+(a.tags||[]).join(' ')+' '+(a.text||'')).toLowerCase().includes(q)}
function chipMatch(a){const c=state.chip;if(!c||c==='all')return true;if(a.group==='scene')return a.style===c;if(a.group==='org')return a.kind===c;if(a.group==='illustration')return a.set===c;if(a.group==='copy')return a.for===c;return true}
const logoSrc=a=>state.logoMode==='color'||!a.mono?a.src:a.mono[state.logoMode];
function card(a){
  if(a.type==='video')return `<div class="card vid" onclick="openAsset('${a.id}')" onmouseenter="hoverPlay(this,1)" onmouseleave="hoverPlay(this,0)"><div class="th" style="background-image:url('${a.poster}')"><video muted loop playsinline preload="none" poster="${a.poster}" data-src="${a.src}"></video>${a.duration?`<span class="dur">${fmtDur(a.duration)}</span>`:''}</div><div class="t">${esc(a.title)}</div><div class="m">${esc(a.sub||a.group)}</div></div>`;
  if(a.type==='gif')return `<div class="card gif" onclick="openAsset('${a.id}')" onmouseenter="this.querySelector('img').src='${a.src}'" onmouseleave="this.querySelector('img').src='${a.poster}'"><div class="th"><img src="${a.poster}" alt=""></div><div class="t">${esc(plain(a.title))}</div><div class="m">${esc(a.sub)}</div></div>`;
  if(a.type==='audio')return `<div class="card" onclick="openAsset('${a.id}')"><div class="th" style="background-image:url('${a.thumb}')"></div><div class="t">${esc(a.title)}</div><div class="m">${a.duration}s</div></div>`;
  if(a.type==='icon')return `<div class="card" onclick="openAsset('${a.id}')"><div class="th icon"><img loading="lazy" src="${a.src}" alt=""></div><div class="m" style="text-align:center;margin-top:6px">${esc(a.title)}</div></div>`;
  if(a.group==='org')return `<div class="card" onclick="openAsset('${a.id}')"><div class="th contain sq ${state.logoMode==='white'?'dark':''}"><img loading="lazy" src="${logoSrc(a)}" alt=""></div><div class="t">${esc(a.title)}</div></div>`;
  if(a.group==='illustration')return `<div class="card" onclick="openAsset('${a.id}')"><div class="th ill"><img loading="lazy" src="${a.src}" alt=""></div><div class="t">${esc(a.title)}</div></div>`;
  if(a.group==='graphic')return `<div class="card" onclick="openAsset('${a.id}')"><div class="th contain r43"><img loading="lazy" src="${a.src}" alt=""></div><div class="t">${esc(a.title)}</div></div>`;
  if(a.group==='expert')return `<div class="card" onclick="openAsset('${a.id}')"><div class="th sq" style="background-image:url('${a.thumb}')"></div><div class="t">${esc(a.title)}</div></div>`;
  if(a.group==='copy')return `<div class="card copy ${a.kind==='post'?'post':''}" onclick="openAsset('${a.id}')"><div class="th">${esc(a.kind==='post'?a.text.split('\n')[0]:plain(a.text))}</div><div class="m">${esc(a.sub)}</div></div>`;
  return `<div class="card" onclick="openAsset('${a.id}')"><div class="th ${a.group==='photo'?'r43':''}" style="background-image:url('${a.thumb||a.src}')"></div><div class="t">${esc(a.title)}</div><div class="m">${esc(a.group==='background'?(a.tags||[]).filter(t=>t!=='background').slice(0,3).join(' · '):a.sub||a.group)}</div></div>`}
const fmtDur=d=>`${Math.floor(d/60)}:${String(Math.round(d%60)).padStart(2,'0')}`;
function hoverPlay(el,on){const v=el.querySelector('video');if(!v)return;if(on){if(!v.src)v.src=v.dataset.src;v.currentTime=0;v.play().catch(()=>{})}else{v.pause()}}
function copyItems(kind){const items=(COPY.items||[]).map(c=>({id:c.id,type:'copy',group:'copy',kind:c.kind,for:c.for,title:c.kind==='post'?c.text.split('\n')[0].slice(0,60):plain(c.text),sub:[c.for,c.platform].filter(x=>x&&x!=='any').join(' · ')+(c.performed?' · performed':''),text:c.text,note:c.note,source:c.source,tags:[c.kind,c.for,c.platform]}));
  const tags=(M.brand.taglines||[]).map((t,i)=>({id:'tag-'+i,type:'copy',group:'copy',kind:'tagline',for:'brand',title:t,sub:'Approved tagline',text:t,tags:['tagline']}));
  const all=items.concat(tags.filter(t=>!items.some(i=>plain(i.text)===t.text)));return kind?all.filter(c=>c.kind===kind):all}
function allItems(){return M.assets.concat(copyItems())}
function renderLib(){
  const {sub}=subOf(state.tab);const t=sub[0];let items=state.q?allItems():(COPY_KINDS.includes(t)?copyItems(t):byGroup(...sub[2]));
  items=items.filter(match).filter(chipMatch);renderTabs();renderChips();const g=$('grid');
  g.className='grid'+(state.q?'':t==='icon'?' icons':t==='film'?' video':t==='scene'||t==='gif'?' scenes':t==='org'?' orgs':t==='illustration'?' ills':t==='expert'?' coaches':t==='post'?' posts':'');
  g.innerHTML=items.map(card).join('')||'<div class="empty">Nothing matches.</div>'}

/* ---------- preview (in place, back route) ---------- */
let pvList=[],pvIdx=-1,pvPushed=false;
function openAsset(id){pvList=[...document.querySelectorAll('.screen.on .card')].map(el=>{const m=(el.getAttribute('onclick')||'').match(/openAsset\('([^']+)'\)/);return m?m[1]:null}).filter(Boolean);if(!pvList.length)pvList=[id];pvIdx=pvList.indexOf(id);if(pvIdx<0){pvList=[id];pvIdx=0}pvPushed=true;location.hash='asset/'+id}
function stepPreview(d){if(!pvList.length)return;pvIdx=(pvIdx+d+pvList.length)%pvList.length;history.replaceState(null,'','#asset/'+pvList[pvIdx]);showPreview(pvList[pvIdx])}
function showPreview(id){
  const a=allItems().find(x=>x.id===id);if(!a)return;const st=$('pvstage'),sd=$('pvside');st.className='stage';
  if(a.type==='video')st.innerHTML=`<video src="${a.src}" poster="${a.poster}" controls autoplay playsinline ${a.group==='scene'?'loop muted':''}></video>`;
  else if(a.type==='gif')st.innerHTML=`<img src="${a.src}" alt="">`;
  else if(a.type==='audio')st.innerHTML=`<div style="width:100%"><img src="${a.art||a.thumb}" style="width:100%;border-radius:10px;margin-bottom:14px" alt=""><audio src="${a.src}" controls autoplay></audio></div>`;
  else if(a.type==='icon'){st.classList.add('icon');st.innerHTML=`<img src="${a.src}" alt="">`}
  else if(a.type==='copy')st.innerHTML=`<div class="copytext ${a.kind==='post'?'post':''}">${esc(a.text)}</div>`;
  else if(a.group==='org')st.innerHTML=`<div class="logo3"><div><img src="${a.src}" alt=""></div><div><img src="${a.mono?a.mono.black:a.src}" alt=""></div><div class="dark"><img src="${a.mono?a.mono.white:a.src}" alt=""></div></div>`;
  else if(a.group==='illustration'){st.classList.add('ill');st.innerHTML=`<img src="${a.src}" alt="">`}
  else st.innerHTML=`<img src="${a.src}" alt="">`;
  let actions='';const useIn=(tid,key)=>`closePreview(true);startImage('${tid}');setField('${key}','${a.id}')`;
  if(a.type==='copy')actions=`<button class="btn black" onclick="copyText(${JSON.stringify(a.text).replace(/"/g,'&quot;')},'Copied')">Copy text</button>${a.kind!=='post'?`<button class="btn" onclick="closePreview(true);startImage('field-headline');setField('head',${JSON.stringify(a.text).replace(/"/g,'&quot;')})">Make an image</button>`:''}`;
  else if(a.type==='audio')actions=`<button class="btn black" onclick="closePreview(true);startVideo();ED.vibe='${a.id}';renderVideoPanel()">Use in a film</button><a class="btn" href="${a.src}" download>Download</a>`;
  else if(a.type==='gif')actions=`<a class="btn black" href="${a.src}" download>Download GIF</a><a class="btn" href="${a.mp4}" download>Download MP4</a><a class="btn" href="${base()}assets/gifs/src/${a.src.split('/').pop().replace('.gif','.html')}" target="_blank">Open the source</a>`;
  else if(a.type==='video')actions=`<a class="btn black" href="${a.src}" download>Download</a>`;
  else if(a.type==='icon')actions=`<button class="btn black" onclick="copySvg('${a.src}')">Copy SVG</button><a class="btn" href="${a.src}" download>Download</a>`;
  else if(a.group==='org')actions=`<a class="btn black" href="${a.src}" download>Download color</a>${a.mono?`<div class="two"><a class="btn" href="${a.mono.black}" download>Black</a><a class="btn" href="${a.mono.white}" download>White</a></div>`:''}`;
  else if(a.group==='illustration')actions=`<button class="btn black" onclick="${useIn('three-illustrations','ill1')}">Use in an image</button><button class="btn" onclick="copySvg('${a.src}')">Copy SVG</button><a class="btn" href="${a.src}" download>Download</a>`;
  else if(a.group==='expert')actions=`<button class="btn black" onclick="${useIn('expert-spotlight','expert')}">Expert spotlight</button><a class="btn" href="${a.src}" download>Download</a>`;
  else if(['background','photo','hero','header','aibp'].includes(a.group))actions=`<button class="btn black" onclick="${useIn('photo-lockup','photo')}">Use as the photo</button><a class="btn" href="${a.src}" download>Download</a>`;
  else if(['card','aipost','upload'].includes(a.group))actions=`<button class="btn black" onclick="${useIn('product-moment','shot')}">Use as the product shot</button><button class="btn" onclick="closePreview(true);startVideo();ED.shots=['${a.id}'];renderVideoPanel()">Start a film with it</button><a class="btn" href="${a.src}" download>Download</a>`;
  else actions=`<a class="btn black" href="${a.src}" download>Download</a>`;
  sd.innerHTML=`<h2>${esc(plain(a.title))}</h2><div class="m">${esc(a.sub||'')}${a.note&&!/manifest/i.test(a.note)?`<br><br>${esc(a.note)}`:''}${a.source?`<br><br><span class="dim">${esc(String(a.source).split(';')[0])}</span>`:''}${a.best?`<br><b style="color:var(--ink)">Best for:</b> ${esc(a.best)}`:''}${a.idea?`<br><br>${esc(a.idea)}`:''}</div>${actions}`;
  $('pv').classList.add('on');
}
function closePreview(silent){const pv=$('pv');if(!pv.classList.contains('on'))return;pv.classList.remove('on');pv.querySelectorAll('video,audio').forEach(v=>v.pause());$('pvstage').innerHTML='';if(!silent&&location.hash.startsWith('#asset/')){if(pvPushed)history.back();else location.hash=state.tab?'lib/'+state.tab:'lib'}pvPushed=false}
async function copySvg(src){try{const t=await (await fetch(src)).text();copyText(t,'SVG copied')}catch(e){copyText(base()+src,'Link copied')}}

/* ---------- motion presets: measured from the five launch films ---------- */
const MOTION_DEFAULT={
  text:[{id:'typed',name:'Typed',desc:'Characters arrive left to right from where the finished line sits. Fast, about 45 characters a second; the rhythm comes from pauses, not slow letters.',speed:.65,ease:'linear'},
        {id:'words',name:'Words',desc:'Each word fades up from below with a touch of blur, a tenth of a second apart. The house treatment for taglines and end cards.',speed:.45,stagger:.1,ease:'out'},
        {id:'rise',name:'Rise',desc:'A whole line or card rises and fades in. Used for UI cards and stacked status lines, never a hero headline.',speed:.4,stagger:.1,ease:'out'}],
  transition:[{id:'fade',name:'Dissolve',desc:'A 0.35s cross-dissolve between scenes. Lockups and typed headlines leave on a hard cut.',dur:.35},{id:'cut',name:'Cut',desc:'No transition.',dur:0}],
  logo:[{id:'draw',name:'Draws on',desc:'The mark draws on stroke by stroke, holds a beat, then the wordmark types in while the lockup re-centres. This is what the films do.',dur:1.5},
        {id:'fade',name:'Fade',desc:'The finished lockup fades in over a quarter second above a headline that already landed. Dark end cards.',dur:.25},
        {id:'leo',name:'Leo spins in',desc:'The loader spins, the ears land, Leo settles into the mark. Community only.',dur:1.5}],
  defaults:{text:'words',transition:'fade',logo:'draw',scene:3}
};
let MOTION=null,MREF={};
function loadMotion(){try{MOTION=JSON.parse(localStorage.getItem('le-motion')||'null')}catch(e){}if(!MOTION||!MOTION.logo.find(p=>p.id==='draw'))MOTION=JSON.parse(JSON.stringify(MOTION_DEFAULT));fetch('data/motion-ref.json').then(r=>r.json()).then(d=>{MREF=d;if(isOn('motion'))renderMotion()}).catch(()=>{})}
function saveMotion(){try{localStorage.setItem('le-motion',JSON.stringify(MOTION))}catch(e){}}
const preset=(kind,id)=>(MOTION[kind]||[]).find(p=>p.id===id)||MOTION[kind][0];
const EASE={linear:t=>t,out:t=>1-Math.pow(1-t,3),inout:t=>t<.5?2*t*t:-1+(4-2*t)*t};
function refClips(k,id){if(k==='logo')id=id==='draw'?'leo':id==='leo'?'none':id;const r=((MREF[k]||{})[id]||{}).refs||[];return r.map(A).filter(Boolean).slice(0,3)}
function renderMotion(){const groups=[['text','Text',['speed','stagger','ease']],['logo','Logo',['dur']],['transition','Transitions',['dur']]];
  $('motionlist').innerHTML=groups.map(([k,n,fields])=>`<div class="mgroup"><h2>${n}</h2>${MOTION[k].map(p=>{const refs=refClips(k,p.id);return `<div class="mrow ${MOTION.defaults[k]===p.id?'def':''}">
    <div class="mdemo" id="demo-${k}-${p.id}" onmouseenter="demoMotion('${k}','${p.id}')"><span>${k==='logo'?'<img src="assets/brand/mark.svg" alt=""><b>Leland</b>':k==='text'?'Own your <em>future</em>.':'Scene'}</span></div>
    <div class="mbody"><b>${esc(p.name)}</b><span>${esc(p.desc)}</span><div class="mfields">${fields.filter(f=>f in p).map(f=>f==='ease'?`<label>Ease<select onchange="MOTION.${k}.find(x=>x.id==='${p.id}').ease=this.value;saveMotion()">${['linear','out','inout'].map(e=>`<option ${p.ease===e?'selected':''}>${e}</option>`).join('')}</select></label>`:`<label>${({speed:'Speed',stagger:'Stagger',dur:'Duration'})[f]}<input type="number" step=".05" min="0" value="${p[f]}" onchange="MOTION.${k}.find(x=>x.id==='${p.id}').${f}=+this.value;saveMotion()"></label>`).join('')}<button class="link" onclick="MOTION.defaults.${k}='${p.id}';saveMotion();renderMotion()">${MOTION.defaults[k]===p.id?'Default':'Make default'}</button></div></div>
    <div class="mrefs">${refs.map(a=>`<div class="mref" onclick="openAsset('${a.id}')" onmouseenter="hoverPlay(this,1)" onmouseleave="hoverPlay(this,0)"><video muted loop playsinline preload="none" poster="${a.poster}" data-src="${a.src}"></video><span>${esc(a.title)}</span></div>`).join('')||'<div class="mref none">Not in the films</div>'}</div></div>`}).join('')}</div>`).join('')}
function demoMotion(k,id){const el=$(`demo-${k}-${id}`);el.classList.remove('go');void el.offsetWidth;el.dataset.anim=id;el.classList.add('go')}
function motionReset(){MOTION=JSON.parse(JSON.stringify(MOTION_DEFAULT));saveMotion();renderMotion();toast('Presets reset to what the films do')}
function motionExport(){dl(new Blob([JSON.stringify(MOTION,null,2)],{type:'application/json'}),'le-motion.json');toast('Presets exported')}

/* ---------- Opus ---------- */
const CFG={get api(){return localStorage.getItem('le-api')||''},set api(v){localStorage.setItem('le-api',v)},get key(){return localStorage.getItem('le-key')||''},set key(v){localStorage.setItem('le-key',v)}};
const hasOpus=()=>!!(CFG.api||CFG.key);
async function opus(system,user,max=900){const body={model:'claude-opus-4-1',max_tokens:max,system,messages:[{role:'user',content:user}]};let r;
  if(CFG.api)r=await fetch(CFG.api.replace(/\/$/,'')+'/opus',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
  else if(CFG.key)r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':CFG.key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify(body)});
  else return null;if(!r.ok)throw new Error('Opus '+r.status);const j=await r.json();return (j.content||[]).filter(c=>c.type==='text').map(c=>c.text).join('')}
const SYSTEM=()=>`You write marketing copy for Leland (joinleland.com). ${M.brand.pitch?M.brand.pitch.oneliner:''} Voice: ${(COPY.voice&&COPY.voice.summary)||'direct, concrete, warm, no hype'}. Rules: ${((COPY.voice&&COPY.voice.rules)||[]).join(' ')} Approved taglines: ${(M.brand.taglines||[]).join(' | ')}. Guardrails: ${(M.brand.guardrails||[]).join(' ')} In headlines, wrap the one phrase that should be blue in [square brackets]. Respond ONLY with JSON.`;
const jsonOf=s=>{try{return JSON.parse(s.replace(/```json|```/g,'').trim())}catch(e){const m=s.match(/\{[\s\S]*\}/);return m?JSON.parse(m[0]):null}};
function connectOpus(){const k=prompt('Paste an Anthropic API key (stays in this browser). Leave blank to use a proxy URL.');if(k===null)return;if(k.trim()){CFG.key=k.trim();CFG.api=''}else{const u=prompt('Proxy URL (your Cloudflare Worker)');if(u&&u.trim()){CFG.api=u.trim()}}opusNote();renderConnect();toast(hasOpus()?'Opus connected':'Not connected')}
function opusNote(){$('opusst').textContent=hasOpus()?'on':''}

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
  else if(state.kind==='deck')exportDeck('pdf');
  else if(state.kind==='story')exportStory('carousel');
  else if(state.kind==='video'){if(ED.blob)dl(ED.blob,`${name}-1920x1080.${ED.ext}`);else makeVideo()}}

/* ---------- video render engine: scenes → blob ---------- */
const sceneDur=s=>s.type==='clip'?((A(s.asset)||{}).duration||3):s.dur;
const clipSrc=a=>a.mp4||a.src;
async function renderVideo(S,ratioKey=''){const [W,H]=SIZES[ratioKey];const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');await fontsReady();
  const dark=state.dark,ink=dark?'#fff':PAL.ink,bgc=dark?PAL.ink:'#fff',m=Math.min(W,H),T=S.reduce((a,s)=>a+sceneDur(s),0);const TH=window.TPL_HELPERS||{};
  const media=[];for(const s of S){if(s.type==='shot'){media.push(await loadImg((A(s.asset)||{}).src))}else if(s.type==='clip'){const v=document.createElement('video');v.muted=true;v.playsInline=true;v.src=clipSrc(A(s.asset)||{});await new Promise(res=>{v.oncanplaythrough=res;v.onerror=res;v.load()});media.push(v)}else media.push(null)}
  let leoFrames=null;if(state.outro==='leo'&&S.some(s=>s.type==='outro')&&window.leo&&leo.bake){try{leoFrames=await leo.bake(Math.round(m*.5),dark)}catch(e){}}
  const stream=c.captureStream(30);let musicNode=null;
  if(state.music){try{const actx=new (window.AudioContext||window.webkitAudioContext)();const au=new Audio((A(state.music)||{}).src);au.crossOrigin='anonymous';await new Promise(r=>{au.oncanplaythrough=r;au.onerror=r;au.load()});const src=actx.createMediaElementSource(au);const dest=actx.createMediaStreamDestination();const gain=actx.createGain();gain.gain.value=.9;src.connect(gain).connect(dest);dest.stream.getAudioTracks().forEach(t=>stream.addTrack(t));musicNode={au,gain,actx}}catch(e){}}
  const mime=['video/mp4;codecs=avc1','video/webm;codecs=vp9','video/webm'].find(mm=>MediaRecorder.isTypeSupported(mm))||'video/webm';const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:8e6});const chunks=[];rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);
  const tr=preset('transition',MOTION.defaults.transition),fadeD=Math.max(.15,tr.dur||.3),ease=EASE.inout,eo=EASE.out;
  const sceneStart=i=>S.slice(0,i).reduce((a,s)=>a+sceneDur(s),0),sceneAt=t=>{let acc=0;for(let i=0;i<S.length;i++){acc+=sceneDur(S[i]);if(t<acc)return i}return S.length-1};
  const col=dark?'white':'ink';const drawMark=(mx,my,h)=>{if(TH.mark)TH.mark(x,mx,my,h,col)};
  function drawText(s,local,a){const hs=Math.round(m*.082);x.font=`500 ${hs}px Macan, sans-serif`;const lines=wrapText(x,s.text,W*.8);const y0=H/2-(lines.length-1)/2*hs*1.25;const p=preset('text',s.anim),E=EASE[p.ease]||eo;
    if(s.anim==='typed'){const n=Math.floor(plain(s.text).length*Math.min(1,local/(p.speed||.65)));let shown=0;x.globalAlpha=a;lines.forEach((l,i)=>{const pl=plain(l);const take=Math.max(0,Math.min(pl.length,n-shown));shown+=pl.length+1;let cut='',seen=0;for(const ch of l){if(ch==='['||ch===']'){cut+=ch;continue}if(seen<take){cut+=ch;seen++}}drawRich(x,cut,W/2,y0+i*hs*1.25,'center',ink)});x.globalAlpha=1}
    else if(s.anim==='rise'){lines.forEach((l,i)=>{const u=Math.max(0,Math.min(1,(local-i*(p.stagger||.1))/(p.speed||.4)));x.globalAlpha=a*E(u);drawRich(x,l,W/2,y0+i*hs*1.25+(1-E(u))*hs*.6,'center',ink)});x.globalAlpha=1}
    else{let k=0;lines.forEach((l,i)=>{const parts=l.split(/(\[[^\]]+\])/).filter(Boolean);const words=[];parts.forEach(pp=>{const b=pp.startsWith('[');pp.replace(/[\[\]]/g,'').split(' ').forEach(w=>{if(!w)return;if(/^[.,!?:;]+$/.test(w)&&words.length)words[words.length-1].w+=w;else words.push({w,b})})});x.textAlign='left';const tw=words.reduce((ss,w)=>ss+x.measureText(w.w+' ').width,0);let cx=W/2-tw/2;words.forEach(w=>{const u=Math.max(0,Math.min(1,(local-k*(p.stagger||.1))/(p.speed||.45)));k++;x.globalAlpha=a*E(u);x.fillStyle=w.b?PAL.blue:ink;x.fillText(w.w,cx,y0+i*hs*1.25+(1-E(u))*hs*.3);cx+=x.measureText(w.w+' ').width})});x.globalAlpha=1}}
  function drawOutro(s,local,a,fout){const lh=m*.07;x.font=`600 ${Math.round(m*.052)}px Macan, sans-serif`;const ww=x.measureText('Leland').width;const lw=lh;const totalW=lw+m*.02+ww;const y=H/2-m*.09;const tag=s.tag||'Own your future.';const L=preset('logo',state.outro);const mode=leoFrames?'leo':state.outro==='leo'?'draw':state.outro;const wordP=preset('text','words'),E=EASE.out;
    if(mode==='leo'){const lf=leoFrames;const spinT=Math.min(1,local/1.1);const fi=Math.min(lf.length-1,Math.floor(spinT*(lf.length-1)));const settle=Math.max(0,Math.min(1,(local-1.1)/.4));const big=m*.5,size=big+(lh*1.6-big)*ease(settle);const cx=W/2+(W/2-totalW/2+lw/2-W/2)*ease(settle),cy=H/2+(y-H/2)*ease(settle);x.globalAlpha=Math.min(fout,1);x.drawImage(lf[fi],cx-size/2,cy-size/2,size,size);x.globalAlpha=settle*fout;x.fillStyle=ink;x.textAlign='left';x.fillText('Leland',W/2-totalW/2+lw+m*.02,y+m*.004)}
    else if(mode==='draw'){const d=L.dur||1.5;const drawT=Math.min(1,local/(d*.37)),hold=d*.37+.2,typeT=Math.max(0,Math.min(1,(local-hold)/(d*.3)));const shift=E(typeT);const mx=W/2-lw/2+(W/2-totalW/2-(W/2-lw/2))*shift;
      x.save();x.globalAlpha=Math.min(fout,1);x.beginPath();x.rect(mx-lw*.05,y-lh/2-lh*.1,lw*1.1*E(drawT),lh*1.2);x.clip();drawMark(mx,y-lh/2,lh);x.restore();
      const n=Math.floor(6*typeT);x.globalAlpha=fout;x.fillStyle=ink;x.textAlign='left';x.textBaseline='middle';x.fillText('Leland'.slice(0,n),mx+lw+m*.02,y+m*.004)}
    else{const f=Math.min(1,local/(L.dur||.25));x.globalAlpha=f*a;drawMark(W/2-totalW/2,y-lh/2,lh);x.fillStyle=ink;x.textAlign='left';x.textBaseline='middle';x.fillText('Leland',W/2-totalW/2+lw+m*.02,y+m*.004)}
    const tagStart=mode==='fade'?.1:(L.dur||1.5)*.75;const tl=Math.max(0,local-tagStart);x.font=`500 ${Math.round(m*.05)}px Macan, sans-serif`;x.textBaseline='middle';
    {const words=[];tag.split(/(\[[^\]]+\])/).filter(Boolean).forEach(pp=>{const b=pp.startsWith('[');pp.replace(/[\[\]]/g,'').split(' ').forEach(w=>{if(!w)return;if(/^[.,!?:;]+$/.test(w)&&words.length)words[words.length-1].w+=w;else words.push({w,b})})});x.textAlign='left';const tw=words.reduce((ss,w)=>ss+x.measureText(w.w+' ').width,0);let cx=W/2-tw/2;words.forEach((w,k)=>{const u=Math.max(0,Math.min(1,(tl-k*(wordP.stagger||.1))/(wordP.speed||.45)));x.globalAlpha=E(u)*fout;x.fillStyle=w.b?PAL.blue:ink;x.fillText(w.w,cx,H/2+m*.02+(1-E(u))*m*.015);cx+=x.measureText(w.w+' ').width})}
    const ba=(s.badges===false?0:1)*Math.max(0,Math.min(1,(tl-.4)/.4))*fout;x.globalAlpha=ba;x.font=`600 ${Math.round(m*.02)}px Macan, sans-serif`;const bs=['App Store','Google Play'];let bx=W/2-(x.measureText(bs[0]).width+x.measureText(bs[1]).width+m*.1)/2;const by=H/2+m*.11;bs.forEach(ss=>{const tw=x.measureText(ss).width+m*.03;x.strokeStyle=ink;x.lineWidth=2;roundRect(x,bx,by,tw,m*.045,m*.008);x.stroke();x.fillStyle=ink;x.fillText(ss,bx+m*.015,by+m*.0225);bx+=tw+m*.04});x.globalAlpha=1}
  let lastIdx=-1;
  function draw(t){x.fillStyle=bgc;x.fillRect(0,0,W,H);const i=sceneAt(t);const s=S[i];const local=t-sceneStart(i);const D=sceneDur(s);const fin=Math.min(1,local/fadeD),fout=Math.min(1,(D-local)/fadeD);const a=Math.min(fin,fout);x.textBaseline='middle';
    if(i!==lastIdx){lastIdx=i;if(s.type==='clip'){const v=media[i];try{v.currentTime=0;v.play()}catch(e){}}}
    if(s.type==='text')drawText(s,local,a);
    else if(s.type==='shot'){const im=media[i];const sc=.72,sw=W*sc,sh=im.height/im.width*sw,sy=(H-sh)/2+(1-ease(fin))*H*.06;x.globalAlpha=a;x.save();x.shadowColor='rgba(0,0,0,.18)';x.shadowBlur=m*.06;x.shadowOffsetY=m*.02;roundRect(x,(W-sw)/2,sy,sw,sh,m*.012);x.fillStyle='#fff';x.fill();x.restore();x.save();roundRect(x,(W-sw)/2,sy,sw,sh,m*.012);x.clip();x.drawImage(im,(W-sw)/2,sy,sw,sh);x.restore();x.globalAlpha=1}
    else if(s.type==='clip'){const v=media[i];if(v&&v.videoWidth){const sc=Math.max(W/v.videoWidth,H/v.videoHeight);const vw=v.videoWidth*sc,vh=v.videoHeight*sc;x.globalAlpha=a;x.drawImage(v,(W-vw)/2,(H-vh)/2,vw,vh);x.globalAlpha=1}}
    else if(s.type==='outro')drawOutro(s,local,a,fout);
    x.textAlign='left'}
  draw(0);rec.start(100);if(musicNode){musicNode.au.currentTime=0;musicNode.au.play().catch(()=>{})}const start=performance.now();
  await new Promise(done=>{const tick=()=>{const t=(performance.now()-start)/1000;if(t>=T){draw(T-.01);return done()}draw(t);requestAnimationFrame(tick)};requestAnimationFrame(tick)});
  if(musicNode){try{musicNode.gain.gain.linearRampToValueAtTime(0,musicNode.actx.currentTime+.4)}catch(e){}await new Promise(r=>setTimeout(r,450));musicNode.au.pause()}
  rec.stop();await new Promise(r=>rec.onstop=r);const ext=mime.includes('mp4')?'mp4':'webm';return {blob:new Blob(chunks,{type:mime}),ext,T}}

/* ---------- projects ---------- */
let projects=[];
function restoreProjects(){try{projects=JSON.parse(localStorage.getItem('le-projects')||'[]')}catch(e){projects=[]}renderProjects()}
function addProject(p){const id=ED.pid||p.id||(crypto.randomUUID?crypto.randomUUID():String(Date.now()));projects=projects.filter(q=>q.id!==id);projects.unshift({...p,id,at:new Date().toISOString()});projects=projects.slice(0,60);try{localStorage.setItem('le-projects',JSON.stringify(projects))}catch(e){}renderProjects()}
function renderProjects(){const nb=document.querySelector('#projects .hrow .btn');if(nb)nb.style.display=projects.length?'':'none';$('projlist').innerHTML=projects.length?`<div class="pgrid2">${projects.map((p,i)=>`<div class="proj" onclick="openProject(${i})"><div class="th" style="background-image:url('${p.th||''}')"></div><div class="t">${esc(p.t)}</div><div class="m">${esc(p.m)} · ${new Date(p.at).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</div></div>`).join('')}</div>`:`<div class="empty big"><button class="btn black" onclick="go('make')">Make something</button></div>`}
function openProject(i){const p=projects[i];if(p.kind==='image'&&p.tid)startImage(p.tid,p);else if(p.kind==='deck'&&p.deck)startDeck(p.deck.type,p);else if(p.kind==='story'&&p.story)startStory(p);else if(p.kind==='video')startVideo(p);else toast(p.m)}

/* ---------- connect ---------- */
const CONNS={create:[
  {id:'figma',n:'Figma',d:'Product illustrations, brand file',st:()=>'Imported · 299 illustrations'},
  {id:'drive',n:'Google Drive',d:'Brand library, expert photos, launch kit',st:()=>'Imported · brand library'},
  {id:'notion',n:'Notion',d:'Case study drafts, post copy',st:()=>'Imported · copy'},
  {id:'opus',n:'Claude Opus',d:'Writes copy inside the guardrails',st:()=>hasOpus()?'Connected':'',act:'connectOpus()',label:'Connect'},
  {id:'slack',n:'Slack',d:'Where requests and the voice come from',st:()=>'Imported · voice'}],
  dist:[
  {id:'linkedin',n:'LinkedIn',d:'Posts, carousels, company page',st:()=>''},
  {id:'instagram',n:'Instagram',d:'Posts, reels, stories',st:()=>''},
  {id:'meta',n:'Meta Ads',d:'Spend and results per creative',st:()=>''},
  {id:'gads',n:'Google Ads',d:'Spend and results per creative',st:()=>''},
  {id:'youtube',n:'YouTube',d:'Films and clips',st:()=>''},
  {id:'posthog',n:'PostHog',d:'What happens after the click',st:()=>''}]};
const LOGO_SVG={figma:'<path d="M9 3h6a3 3 0 010 6H9zM9 9h6a3 3 0 010 6H9zM9 15h3a3 3 0 11-3 3z"/><path d="M15 9a3 3 0 110 6 3 3 0 010-6z"/>',drive:'<path d="M8 4h8l5 9-4 7H7l-4-7z"/><path d="M8 4l4 9h9M12 13l-4 7"/>',notion:'<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 16V8l6 8V8"/>',opus:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',slack:'<path d="M9 4v6M15 14v6M4 15h6M14 9h6M9 10a2 2 0 11-2-2M15 14a2 2 0 112 2M10 15a2 2 0 11-2 2M14 9a2 2 0 112-2"/>',linkedin:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 10v6M8 7v.5M12 16v-3.5a2 2 0 014 0V16"/>',instagram:'<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.5"/><path d="M17 7v.5"/>',meta:'<path d="M3 16c2-8 5-8 9 0 4-8 7-8 9 0"/>',gads:'<path d="M6 17l6-10 6 10"/><circle cx="6" cy="17" r="2"/>',youtube:'<rect x="3" y="6" width="18" height="12" rx="4"/><path d="M10 9l5 3-5 3z"/>',posthog:'<path d="M4 18l6-6 4 4 6-6"/>'};
function renderConnect(){const row=c=>{const s=c.st();return `<div class="conn ${s?'on':''}"><svg class="ico" viewBox="0 0 24 24">${LOGO_SVG[c.id]||''}</svg><div><b>${c.n}</b><span>${c.d}</span></div><button class="btn sm" onclick="${c.act||`connReq('${c.n}')`}">${s||c.label||'Needs a developer'}</button></div>`};
  $('connCreate').innerHTML=CONNS.create.map(row).join('');$('connDist').innerHTML=CONNS.dist.map(row).join('');
  const rows=projects.map(p=>`<div class="prow"><div class="th" style="background-image:url('${p.th||''}')"></div><div class="t">${esc(p.t)}</div><div>${esc(p.m)}</div><div>Saved</div><div class="dim">—</div><div class="dim">—</div></div>`).join('');
  $('placements').innerHTML=`<div class="prow head"><div></div><div>Asset</div><div>Format</div><div>Where</div><div>Spend</div><div>Results</div></div>${rows||'<div class="empty">Nothing made yet.</div>'}`}
function connReq(n){window.open('DEVELOPERS.md','_blank')}

/* ---------- brand: the board, then what it means ---------- */
let B=null;
async function renderBrand(){try{B=await (await fetch('data/brand.json')).json()}catch(e){B=null}
  const v=COPY.voice||{};const ex=(v.examples||[]);
  const swatch=(n,hex,dark)=>`<div class="swatch" style="background:${hex}${dark?';color:#fff':''}"><b>${n}</b><span>${hex}</span></div>`;
  const photos=['board-2','board-6','board-10','board-4','board-8'].map(n=>`assets/brand/${n}.webp`);
  const posts=byGroup('hero','header','card').slice(0,5);
  $('brandbody').innerHTML=`
  <div class="board"><iframe src="brand/board.html" title="Leland 2.0 brand board" loading="lazy"></iframe></div>
  <section class="bsec"><h2>Color</h2><div class="swatches">${swatch('Yellow','#FFD96F')}${swatch('Blue','#80ACED')}${swatch('Slate','#869AA6',1)}${swatch('Beige','#F3F1E6')}${swatch('Tan','#EBD4B5')}${swatch('Paper','#F9F8F3')}${swatch('Ink','#010101',1)}</div><div class="rule3"><div><i>One field per tile.</i>Yellow is the brand color. Blue, slate, beige and tan are the others. Never two on one surface.</div><div><i>Ink on light, white on dark.</i>Type and the mark are ink on yellow, beige, tan and paper; white on blue, slate, black and photos.</div><div><i>No green. No gradients.</i>The old brand is gone. The mark is never colored yellow itself; it sits on yellow.</div></div></section>
  <section class="bsec"><h2>Lockup</h2><div class="lockups"><div style="background:#FFD96F"><img src="assets/brand/logo.svg" alt=""></div><div style="background:#80ACED"><img src="assets/brand/logo-white.svg" alt=""></div><div style="background:#010101"><img src="assets/brand/logo-white.svg" alt=""></div><div style="background:#EBD4B5"><img src="assets/brand/mark.svg" class="mk" alt=""></div><div style="background:#F3F1E6"><img src="assets/brand/mark.svg" class="mk" alt=""></div></div></section>
  <section class="bsec"><h2>Type</h2><div class="typeboard"><div class="t1">Get there, with the people who’ve been there.</div><div class="t2">Season Mix Medium for headlines. Sentence case, four to eight words, letter-spacing pulled in. One phrase may be blue.</div><div class="t3">Macan for everything else. Book for body, Medium for labels, SemiBold for buttons and names.</div></div></section>
  <section class="bsec"><h2>Photography</h2><div class="photos">${photos.map(p=>`<div style="background-image:url('${p}')"></div>`).join('')}</div><p class="bnote">Real people, mid-stride, in real cities. Stairs, crosswalks, doorways, warm light, a little grain. The lockup goes on top in white.</p></section>
  <section class="bsec"><h2>Illustration</h2><div class="illrow">${byGroup('illustration').filter((a,i)=>i%37===0).slice(0,8).map(a=>`<div onclick="openAsset('${a.id}')"><img src="${a.src}" alt=""></div>`).join('')}</div><p class="bnote">Black line, blue fill. One or three at a time on paper or beige. Never as a pattern.</p></section>
  <section class="bsec"><h2>What it looks like when it ships</h2><div class="grid" style="grid-template-columns:repeat(5,1fr)">${posts.map(a=>`<div class="card" onclick="openAsset('${a.id}')"><div class="th" style="background-image:url('${a.thumb||a.src}')"></div></div>`).join('')}</div></section>
  <section class="bsec"><h2>Voice</h2><p class="lead">${esc(v.summary||'Direct, concrete and warm. A smart friend who has done it, telling you how.')}</p>
    <div class="two"><div class="vcol"><h3>Rules</h3><ul>${(v.rules||[]).slice(0,10).map(r=>`<li>${esc(r)}</li>`).join('')}</ul></div><div class="vcol"><h3>Real lines</h3>${ex.map(e=>`<div class="exline ${e.good?'good':'bad'}"><b>${esc(e.good||e.bad)}</b><span>${esc(e.why)}</span></div>`).join('')}</div></div></section>
  ${B?`<section class="bsec"><h2>Why it looks this way</h2><div class="prose">${B.thesis.body.slice(1,4).map(p=>`<p>${esc(p)}</p>`).join('')}</div></section>
  <section class="bsec"><h2>Do and don’t</h2><div class="two"><div class="rulecol do">${B.dos.slice(0,8).map(s=>`<div><i>Do</i>${esc(s)}</div>`).join('')}</div><div class="rulecol dont">${B.donts.slice(0,8).map(s=>`<div><i>Don’t</i>${esc(s)}</div>`).join('')}</div></div></section>`:''}`}
const SKILL=()=>`---
name: le
description: Leland's brand asset library. Use whenever making any Leland marketing asset, post, image, video, case study or deck — to find approved images, videos, GIFs, illustrations, logos, expert photos, music, taglines and real post copy, and to stay inside the brand.
---
# LE — Leland asset library

Manifest: ${base()}data/manifest.json · Copy: ${base()}data/copy.json · Brand brief: ${base()}BRAND-BRIEF.md
Fetch the manifest first. Every entry has id, type, group, title, tags and src (relative to ${base()}).

Groups: hero, header, card, aibp, aipost (launch kit) · film, kit, scene (video) · gif (looping sales concepts, .gif + mp4) · background, photo · expert (headshots) · graphic · illustration (299 blue line illustrations) · org (199 logos, mono.black / mono.white) · icon · music.
Copy: copy.json items by kind (post, headline, hook, tagline, cta, subject, ad, bio, quote) with source; voice rules in copy.voice.

Palette: yellow #FFD96F, blue #80ACED, slate #869AA6, beige #F3F1E6, tan #EBD4B5, paper #F9F8F3, ink #010101. One field color per surface. Season Mix 500 headlines, Macan body. Lockup: ${base()}assets/brand/logo.svg (and logo-white.svg, mark.svg).
Rules: ${(M.brand.guardrails||[]).join(' ')}
When asked for an asset, pick from the manifest by tags and return the full URL. Do not invent assets or numbers.`;
