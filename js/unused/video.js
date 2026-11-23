/* The video maker, parked on Nov 23. Not loaded by index.html: Make > Video reads "Coming soon".
   This is the form, the scene renderer (canvas + MediaRecorder), the motion presets it read, and the Opus helper it used,
   exactly as they were in js/le.js. To bring it back: load this file after js/le.js, add 'video' back to the editor (a <video id="resultVid"> in the stage),
   and call startVideo() from the Make card. */

/* ---------- Video: a form, then a film ---------- */
function startVideo(saved){openEditor('video',saved?saved.t:'Untitled video',saved);const v=saved&&saved.video||{};ED={pid:ED.pid,shots:saved?saved.shots||[]:[],story:saved?saved.story||'':'',dur:v.dur||20,vibe:'vibe' in v?v.vibe:'audio-onconversation',dark:!!v.dark,blob:null,tag:v.tag||'Own your future.',badges:'badges' in v?v.badges:false};$('stage').className='stage r169 empty';renderVideoPanel()}
function renderVideoPanel(){
  const shots=ED.shots.map(id=>A(id)).filter(Boolean);
  $('panel').innerHTML=`<div class="sec"><h3>The story</h3><div class="f"><textarea id="vStory" style="min-height:96px" oninput="ED.story=this.value;renderVideoBtn()" placeholder="Jobs is live. Drop your resume and your next job finds you.">${esc(ED.story)}</textarea></div></div>
  <div class="sec"><h3>Three screenshots</h3><div class="shotlist">${shots.map((a,i)=>`<div class="shotc"><img src="${a.thumb||a.poster||a.src}" alt=""><button class="x" onclick="ED.shots.splice(${i},1);renderVideoPanel()">×</button></div>`).join('')}<label class="shotc add">+<input type="file" accept="image/*" multiple style="display:none" onchange="uploadShots(this.files)"></label></div><button class="link" onclick="openDrawer(['card','aipost','hero','gif'],'shots')">From the library</button></div>
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
    addProject({t:$('etitle').value,m:'Video · '+T.toFixed(0)+'s',th:(A(ED.shots[0])||{}).thumb,kind:'video',shots:ED.shots.filter(id=>!id.startsWith('upload')),story:ED.story,video:{dur:ED.dur,vibe:ED.vibe,dark:ED.dark,tag:ED.tag,badges:ED.badges}});renderVideoBtn();toast('Play it, then download.')}catch(e){console.error(e);toast('Render error: '+e.message)}
  busy(false)}

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
function opusNote(){const b=$('opusbtn');if(b)b.textContent=hasOpus()?'Opus connected':'Connect Opus'}

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
    if(s.anim==='typed'){const n=Math.floor(plain(s.text).length*Math.min(1,local/(p.speed||.65)));let shown=0;x.globalAlpha=a;lines.forEach((l,i)=>{const pl=plain(l);const take=Math.max(0,Math.min(pl.length,n-shown));shown+=pl.length+1;let cut='',seen=0;for(const ch of l){if(ch==='['||ch===']'){cut+=ch;continue}if(seen<take){cut+=ch;seen++}}drawRich(x,cut,W/2,y0+i*hs*1.25,'center',ink,PAL.blue)});x.globalAlpha=1}
    else if(s.anim==='rise'){lines.forEach((l,i)=>{const u=Math.max(0,Math.min(1,(local-i*(p.stagger||.1))/(p.speed||.4)));x.globalAlpha=a*E(u);drawRich(x,l,W/2,y0+i*hs*1.25+(1-E(u))*hs*.6,'center',ink,PAL.blue)});x.globalAlpha=1}
    else{let k=0;lines.forEach((l,i)=>{const parts=l.split(/(\[[^\]]+\])/).filter(Boolean);const words=[];parts.forEach(pp=>{const b=pp.startsWith('[');pp.replace(/[\[\]]/g,'').split(' ').forEach(w=>{if(!w)return;if(/^[.,!?:;]+$/.test(w)&&words.length)words[words.length-1].w+=w;else words.push({w,b})})});x.textAlign='left';const tw=words.reduce((ss,w)=>ss+x.measureText(w.w+' ').width,0);let cx=W/2-tw/2;words.forEach(w=>{const u=Math.max(0,Math.min(1,(local-k*(p.stagger||.1))/(p.speed||.45)));k++;x.globalAlpha=a*E(u);x.fillStyle=w.b?(PAL.blue):ink;x.fillText(w.w,cx,y0+i*hs*1.25+(1-E(u))*hs*.3);cx+=x.measureText(w.w+' ').width})});x.globalAlpha=1}}
  function drawOutro(s,local,a,fout){const lh=m*.07;x.font=`600 ${Math.round(m*.052)}px Macan, sans-serif`;const ww=x.measureText('Leland').width;const lw=lh;const totalW=lw+m*.02+ww;const y=H/2-m*.09;const tag=s.tag||'Own your future.';const L=preset('logo',state.outro);const mode=leoFrames?'leo':state.outro==='leo'?'draw':state.outro;const wordP=preset('text','words'),E=EASE.out;
    if(mode==='leo'){const lf=leoFrames;const spinT=Math.min(1,local/1.1);const fi=Math.min(lf.length-1,Math.floor(spinT*(lf.length-1)));const settle=Math.max(0,Math.min(1,(local-1.1)/.4));const big=m*.5,size=big+(lh*1.6-big)*ease(settle);const cx=W/2+(W/2-totalW/2+lw/2-W/2)*ease(settle),cy=H/2+(y-H/2)*ease(settle);x.globalAlpha=Math.min(fout,1);x.drawImage(lf[fi],cx-size/2,cy-size/2,size,size);x.globalAlpha=settle*fout;x.fillStyle=ink;x.textAlign='left';x.fillText('Leland',W/2-totalW/2+lw+m*.02,y+m*.004)}
    else if(mode==='draw'){const d=L.dur||1.5;const drawT=Math.min(1,local/(d*.37)),hold=d*.37+.2,typeT=Math.max(0,Math.min(1,(local-hold)/(d*.3)));const shift=E(typeT);const mx=W/2-lw/2+(W/2-totalW/2-(W/2-lw/2))*shift;
      x.save();x.globalAlpha=Math.min(fout,1);x.beginPath();x.rect(mx-lw*.05,y-lh/2-lh*.1,lw*1.1*E(drawT),lh*1.2);x.clip();drawMark(mx,y-lh/2,lh);x.restore();
      const n=Math.floor(6*typeT);x.globalAlpha=fout;x.fillStyle=ink;x.textAlign='left';x.textBaseline='middle';x.fillText('Leland'.slice(0,n),mx+lw+m*.02,y+m*.004)}
    else{const f=Math.min(1,local/(L.dur||.25));x.globalAlpha=f*a;drawMark(W/2-totalW/2,y-lh/2,lh);x.fillStyle=ink;x.textAlign='left';x.textBaseline='middle';x.fillText('Leland',W/2-totalW/2+lw+m*.02,y+m*.004)}
    const tagStart=mode==='fade'?.1:(L.dur||1.5)*.75;const tl=Math.max(0,local-tagStart);x.font=`500 ${Math.round(m*.05)}px Macan, sans-serif`;x.textBaseline='middle';
    {const words=[];tag.split(/(\[[^\]]+\])/).filter(Boolean).forEach(pp=>{const b=pp.startsWith('[');pp.replace(/[\[\]]/g,'').split(' ').forEach(w=>{if(!w)return;if(/^[.,!?:;]+$/.test(w)&&words.length)words[words.length-1].w+=w;else words.push({w,b})})});x.textAlign='left';const tw=words.reduce((ss,w)=>ss+x.measureText(w.w+' ').width,0);let cx=W/2-tw/2;words.forEach((w,k)=>{const u=Math.max(0,Math.min(1,(tl-k*(wordP.stagger||.1))/(wordP.speed||.45)));x.globalAlpha=E(u)*fout;x.fillStyle=w.b?(PAL.blue):ink;x.fillText(w.w,cx,H/2+m*.02+(1-E(u))*m*.015);cx+=x.measureText(w.w+' ').width})}
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

/* ---------- connect (removed from the nav on Nov 23; DEVELOPERS.md is linked from Skill) ---------- */
const CONNS={create:[
  {id:'figma',n:'Figma',d:'Product illustrations, brand file',st:()=>'Imported'},
  {id:'drive',n:'Google Drive',d:'Brand library, expert photos, launch kit',st:()=>'Imported'},
  {id:'notion',n:'Notion',d:'Case study drafts, post copy',st:()=>'Imported'},
  {id:'opus',n:'Claude Opus',d:'Writes copy inside the guardrails',st:()=>hasOpus()?'Connected':'',act:'connectOpus()',label:'Connect'},
  {id:'slack',n:'Slack',d:'Where requests and the voice come from',st:()=>'Imported'}],
  dist:[
  {id:'linkedin',n:'LinkedIn',d:'Posts, carousels, company page',st:()=>''},
  {id:'instagram',n:'Instagram',d:'Posts, reels, stories',st:()=>''},
  {id:'meta',n:'Meta Ads',d:'Spend and results per creative',st:()=>''},
  {id:'gads',n:'Google Ads',d:'Spend and results per creative',st:()=>''},
  {id:'youtube',n:'YouTube',d:'Films and clips',st:()=>''},
  {id:'posthog',n:'PostHog',d:'What happens after the click',st:()=>''}]};
const LOGO_SVG={figma:'<path d="M9 3h6a3 3 0 010 6H9zM9 9h6a3 3 0 010 6H9zM9 15h3a3 3 0 11-3 3z"/><path d="M15 9a3 3 0 110 6 3 3 0 010-6z"/>',drive:'<path d="M8 4h8l5 9-4 7H7l-4-7z"/><path d="M8 4l4 9h9M12 13l-4 7"/>',notion:'<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 16V8l6 8V8"/>',opus:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',slack:'<path d="M9 4v6M15 14v6M4 15h6M14 9h6M9 10a2 2 0 11-2-2M15 14a2 2 0 112 2M10 15a2 2 0 11-2 2M14 9a2 2 0 112-2"/>',linkedin:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 10v6M8 7v.5M12 16v-3.5a2 2 0 014 0V16"/>',instagram:'<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.5"/><path d="M17 7v.5"/>',meta:'<path d="M3 16c2-8 5-8 9 0 4-8 7-8 9 0"/>',gads:'<path d="M6 17l6-10 6 10"/><circle cx="6" cy="17" r="2"/>',youtube:'<rect x="3" y="6" width="18" height="12" rx="4"/><path d="M10 9l5 3-5 3z"/>',posthog:'<path d="M4 18l6-6 4 4 6-6"/>'};
function renderConnect(){const row=c=>{const s=c.st();return `<div class="conn ${s?'on':''}"><svg class="ico" viewBox="0 0 24 24">${LOGO_SVG[c.id]||''}</svg><div><b>${c.n}</b></div><button class="btn sm" onclick="${c.act||`connReq('${c.n}')`}">${s||c.label||'Needs a developer'}</button></div>`};
  $('connCreate').innerHTML=CONNS.create.map(row).join('');$('connDist').innerHTML=CONNS.dist.map(row).join('');
  const rows=projects.map(p=>`<div class="prow"><div class="th" style="background-image:url('${p.th||''}')"></div><div class="t">${esc(p.t)}</div><div>${esc(p.m)}</div><div>Saved</div><div class="dim">—</div><div class="dim">—</div></div>`).join('');
  $('placements').innerHTML=`<div class="prow head"><div></div><div>Asset</div><div>Format</div><div>Where</div><div>Spend</div><div>Results</div></div>${rows||'<div class="empty">Nothing made yet.</div>'}`}
function connReq(n){window.open('DEVELOPERS.md','_blank')}
