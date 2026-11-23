/* LE — Story: case studies and customer wins. One brief → carousel, web page, post. */
let story={co:'',logo:null,head:'',who:'',before:'',built:[],quote:'',by:'',cta:'Let’s chat.',slide:0};
const SAMPLE={co:'ASU+GSV',logo:null,head:'33 people, [building together].',who:'The team behind the ASU+GSV Summit, partnerships, marketing and programs, went through the AI Builder Program together.',before:'Most of the team used AI for simple productivity work. Now they build real systems.',built:['Lucy Baldwin, VP Product — meeting prep triggered from Slack — 8 hours a week back','Uma Sankar Reddy — a daily Slack digest from Slack, Airtable, Granola and email — 50% of her time freed','Genny Velazquez, SVP Partnerships — a proposal generator in her voice — 2 hours to 30 minutes'],quote:'It put everyone in a builder mindset.',by:'Lucy Baldwin, VP Product',cta:'Let’s chat.'};
function storyInit(){story={...JSON.parse(JSON.stringify(SAMPLE)),slide:0};storyFill()}
function storyLoad(s){story={...s,slide:0};storyFill()}
function storyFill(){$('stCo').value=story.co;$('stHead').value=story.head;$('stWho').value=story.who;$('stBefore').value=story.before;$('stBuilt').value=story.built.join('\n');$('stQuote').value=story.quote;$('stBy').value=story.by;$('stCta').value=story.cta}
function storyRead(){story.co=$('stCo').value;story.head=$('stHead').value;story.who=$('stWho').value;story.before=$('stBefore').value;story.built=$('stBuilt').value.split('\n').map(s=>s.trim()).filter(Boolean);story.quote=$('stQuote').value;story.by=$('stBy').value;story.cta=$('stCta').value}
function storyLogo(id){story.logo=id;closeDrawer();storySync()}
function storySlides(){const s=[['cover','Cover']];if(story.who)s.push(['who','Who']);if(story.before)s.push(['before','Before']);if(story.built.length)s.push(['built','What they built']);if(story.quote)s.push(['quote','Quote']);s.push(['close','Close']);return s}
let stT=null;
function storySync(){storyRead();clearTimeout(stT);stT=setTimeout(async()=>{const sl=storySlides();if(story.slide>=sl.length)story.slide=0;
  const c=await renderStorySlide(sl[story.slide][0],864,1080);$('canvasImg').src=c.toDataURL();$('stage').className='stage r45';
  const thumbs=[];for(const [k] of sl){const t=await renderStorySlide(k,160,200);thumbs.push(t.toDataURL())}
  $('slides').innerHTML=sl.map(([k,n],i)=>`<div class="slide story ${i===story.slide?'on':''}" style="background-image:url('${thumbs[i]}')" onclick="story.slide=${i};storySync()"><span class="n">${i+1}</span></div>`).join('');if(window.autosave)autosave(()=>({t:$('etitle').value,m:'Story · '+sl.length+' slides',th:$('canvasImg').src,kind:'story',story:JSON.parse(JSON.stringify(story))}))},60)}
/* Leonardo 3.0: white field, the headline alone (no eyebrow, no subcopy), one blue phrase, the vector lockup small, Season + Macan, three items at most */
const ST_BLUE='#80ACED',ST_INK='#010101',ST_BODY='#222222',ST_DIM='rgba(1,1,1,.58)';
async function renderStorySlide(kind,W,H){const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');await fontsReady();const u=W/1080;
  x.fillStyle=kind==='quote'?'#F9F8F3':'#FFFFFF';x.fillRect(0,0,W,H);x.textBaseline='top';x.textAlign='left';
  const pad=86*u,cw=W-pad*2,lockH=Math.max(10,Math.round(20*u));const TH=window.TPL_HELPERS||{};
  const lockup=()=>{if(TH.logo)TH.logo(x,pad,H-pad-lockH,lockH,'ink')};
  const seasonFont=(px)=>{x.font=`500 ${px}px "Season Mix", Season, Georgia, serif`;x.letterSpacing=(-.022*px).toFixed(2)+'px'};
  const macan=(w,px)=>{x.font=`${w} ${px}px Macan, sans-serif`;x.letterSpacing='0px'};
  const body=(t,y,size,maxW,ink=ST_BODY,lh=1.35,w=400)=>{macan(w,size);x.fillStyle=ink;const ls=wrapText(x,t,maxW);ls.forEach(l=>{x.fillText(l,pad,y);y+=size*lh});return y};
  /* the largest display size (start -> min) whose lines fit */
  const head=(t,y,start,maxW,maxH,min)=>{let px=start,ls;for(;;){seasonFont(px);ls=wrapText(x,t,maxW);const h=ls.length*px*1.04;if(h<=maxH||px<=(min||40*u))break;px=Math.max(min||40*u,Math.round(px*.94))}seasonFont(px);ls.forEach(l=>{drawRich(x,l,pad,y,'left',ST_INK,ST_BLUE);y+=px*1.04});return y};
  const lg=A(story.logo);
  if(kind==='cover'){let y=pad;
    if(lg){const im=await loadImg(lg.src);const s=120*u;roundRect(x,pad,y,s,s,s*.18);x.save();x.clip();x.drawImage(im,pad,y,s,s);x.restore()}
    const top=H*.3;head(story.head||story.co,top,104*u,cw,H*.5,48*u);lockup();
    /* the company name sits on the lockup's line, bottom right, never above the headline */
    if(!lg&&story.co){macan(500,26*u);x.fillStyle=ST_INK;x.textAlign='right';x.textBaseline='alphabetic';x.fillText(story.co,W-pad,H-pad-lockH*.1);x.textAlign='left';x.textBaseline='top'}}
  else if(kind==='who'||kind==='before'){let y=head(kind==='who'?'Who they are':'Before',pad,92*u,cw,H*.3,48*u);body(kind==='who'?story.who:story.before,y+44*u,42*u,cw,ST_BODY,1.38);lockup()}
  else if(kind==='built'){let y=head('What they [built]',pad,92*u,cw,H*.25,48*u)+44*u;
    const items=story.built.slice(0,3),rowGap=34*u;
    items.forEach((item,i)=>{const parts=item.split(/\s+—\s+|\s+-\s+|\s*\|\s*/).map(s=>s.trim()).filter(Boolean);
      if(i){x.fillStyle='rgba(1,1,1,.14)';x.fillRect(pad,y,cw,Math.max(1,Math.round(1.5*u)));y+=rowGap}
      y=body(parts[0]||'',y,36*u,cw,ST_INK,1.25,600)+6*u;
      if(parts[1])y=body(parts[1],y,32*u,cw,ST_BODY,1.35);
      if(parts[2])y=body(parts[2],y+4*u,32*u,cw,ST_BLUE,1.35,500);
      y+=rowGap});lockup()}
  else if(kind==='quote'){seasonFont(220*u);x.fillStyle=ST_BLUE;x.fillText('“',pad-14*u,H*.2-30*u);
    let y=head(story.quote,H*.2+150*u,92*u,cw,H*.45,48*u);macan(400,34*u);x.fillStyle=ST_DIM;wrapText(x,story.by,cw).forEach(l=>{x.fillText(l,pad,y+36*u);y+=34*u*1.35});lockup()}
  else if(kind==='close'){const t=story.cta||'Let’s chat.';let px=112*u;seasonFont(px);const ls=wrapText(x,t,cw);const h=ls.length*px*1.04;head(t,(H-h)/2-20*u,px,cw,H*.6,48*u);lockup()}
  return c}
async function storyBrief(p){
  if(hasOpus()){$('ov').classList.add('on');$('ovp').textContent='Opus is reading the story';window.leo&&leo.work();
    try{const out=jsonOf(await opus(SYSTEM(),`Turn this into a customer story. Keep the facts, do not invent numbers.\n\n${p}\n\nReturn JSON {"company":"","headline":"<=40 chars with one number and one [blue phrase]","who":"<=160 chars","before":"<=160 chars","built":["Name, Role — what they built — result",...],"quote":"","by":"Name, Role","cta":"Let’s chat.","post":"a LinkedIn post in John's voice, <=1300 chars, ends with 'If you want to help your team get set up for this next chapter of AI change, let's chat.'"}`));
      if(out){story={...story,co:out.company||story.co,head:out.headline||story.head,who:out.who||'',before:out.before||'',built:out.built||[],quote:out.quote||'',by:out.by||'',cta:out.cta||story.cta,post:out.post};$('etitle').value=out.company||'Story';storyFill();storyMatchLogo();storySync();$('ov').classList.remove('on');window.leo&&leo.rest();toast('Opus drafted the story. Everything on the right is yours.');return}}catch(e){toast('Opus error. Using the scripted read.')}$('ov').classList.remove('on')}
  // scripted read: sentences, bullets, quotes, a speaker, a company
  const text=p.replace(/\s+-\s+/g,'\n- ').replace(/•/g,'\n- ');
  const lines=text.split('\n').map(s=>s.trim()).filter(Boolean);
  const built=lines.filter(l=>/^-\s*/.test(l)).map(l=>l.replace(/^-\s*/,'').replace(/\.$/,''));
  const prose=lines.filter(l=>!/^-\s*/.test(l)).join(' ');
  const qm=prose.match(/[“"]([^”"]{8,})[”"]/);let q=qm?qm[1].replace(/[,\s]+$/,''):'';
  let by='';if(qm){const after=prose.slice(prose.indexOf(qm[0])+qm[0].length);const bm=after.match(/^[\s,]*(?:said|says|—|-)?\s*([A-Z][a-z]+ [A-Z][a-z]+)(?:,\s*(?:their|the|our|its)?\s*([^.,]{3,40}))?/);if(bm)by=bm[1]+(bm[2]?', '+bm[2].trim():'');else{const pre=prose.slice(0,prose.indexOf(qm[0]));const pm=pre.match(/(?:As\s+)?([A-Z][a-z]+ [A-Z][a-z]+)(?:,\s*(?:their|the|our|its)?\s*([^.,]{3,40}))?,?\s*(?:put it|said|says|explains|told)[^.]*$/);if(pm)by=pm[1]+(pm[2]?', '+pm[2].trim():'')}}
  const sents=prose.replace(qm?qm[0]:'','').replace(/(?:As\s+)?[A-Z][a-z]+ [A-Z][a-z]+(?:,[^.:]{0,40})?,?\s*(?:put it|said|says)[:,]?\s*/,'').split(/(?<=[.!?])\s+/).map(s=>s.trim()).filter(s=>s.length>3);
  const first=sents[0]||'';const cm=first.match(/^((?:[A-Z][\w+&.]*\s?){1,3})(?=\s+(?:team|marketing|sales|ops|operations|is|was|had|put|went|built|launched|just))/);const co=cm?cm[1].trim():first.split(' ').slice(0,2).join(' ');
  const num=(prose.match(/\d[\d,]*\+?/)||[''])[0];const numSent=sents.find(s=>num&&s.includes(num))||'';
  const before=sents.slice(1).find(s=>/before|used to|old way|putting off|never|by hand|manual|hours|years|needed/i.test(s))||sents[1]||'';
  const after=sents.find(s=>/got it done|now|in weeks|instead|today/i.test(s)&&s!==before)||'';
  const head=num?`${num} ${(numSent.replace(num,'').trim().split(' ').slice(0,3).join(' ')).replace(/[.,]$/,'')}, [done in weeks].`:`${co}, [building].`;
  story={...story,co,head:num&&numSent?head:`${co}, [building].`,who:first,before,built:built.length?built:(after?[after]:[]),quote:q,by,post:p};
  $('etitle').value=co||'Story';storyFill();storyMatchLogo();storySync();toast('Read it. Connect Opus under Me for a real draft.')}
function storyMatchLogo(){const n=(story.co||'').toLowerCase().replace(/[^a-z0-9]/g,'');if(!n)return;const hit=byGroup('org').find(a=>a.title.toLowerCase().replace(/[^a-z0-9]/g,'').includes(n)||n.includes(a.title.toLowerCase().replace(/[^a-z0-9]/g,'')));if(hit)story.logo=hit.id}
function storyPost(){if(story.post)return story.post;const b=story.built.map(i=>'- '+i.replace(/ — /g,': ').replace(/: ([^:]+)$/,'. $1.')).join('\n');return `${story.who}\n\n${story.before}\n\nA few things they built:\n\n${b}\n\n${story.by.split(',')[0]||'They'} said it best:\n\n"${story.quote}"\n\nThat's the whole point of the AI Builder Program. It's not a learning experience, it's a building experience.\n\nIf you want to help your team get set up for this next chapter of AI change, let's chat.`}
function storyPage(){const lg=A(story.logo);const f=base()+'fonts/';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(story.co)} · Leland</title>
<style>@font-face{font-family:Season;src:url(${f}SeasonMix-Medium.woff2);font-weight:500}@font-face{font-family:Macan;src:url(${f}Macan-Book.woff2);font-weight:400}@font-face{font-family:Macan;src:url(${f}Macan-SemiBold.woff2);font-weight:600}
body{margin:0;font-family:Macan,-apple-system,sans-serif;color:#111;background:#fff;-webkit-font-smoothing:antialiased}.w{max-width:760px;margin:0 auto;padding:72px 24px}
h1{font-family:Season,Georgia,serif;font-weight:500;font-size:clamp(40px,7vw,72px);line-height:1.02;letter-spacing:-.02em;margin:0 0 24px}em{font-style:normal;color:#80ACED}
h2{font-family:Season,Georgia,serif;font-weight:500;font-size:32px;margin:56px 0 12px}p{font-size:19px;line-height:1.5;color:#4c4c4c;margin:0 0 16px}.logo{width:96px;height:96px;border-radius:18px;object-fit:cover;margin-bottom:28px}
.b{padding:20px 0;border-top:1px solid #eee}.b b{display:block;font-size:19px}.b span{display:block;color:#4c4c4c;font-size:17px;margin-top:4px}.b i{display:block;font-style:normal;color:#80ACED;font-weight:600;margin-top:6px}
blockquote{margin:56px 0;font-family:Season,Georgia,serif;font-weight:500;font-size:36px;line-height:1.15}blockquote cite{display:block;font-family:Macan;font-style:normal;font-size:16px;color:#767676;margin-top:16px}
.cta{margin-top:72px;padding-top:40px;border-top:1px solid #eee}.cta a{display:inline-block;margin-top:12px;background:#111;color:#fff;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:600}
.lk{display:block;margin-bottom:48px}.lk img{height:22px;display:block}</style></head><body><div class="w">
<div class="lk"><img src="${base()}assets/brand/logo.svg" alt="Leland"></div>
${lg?`<img class="logo" src="${base()+lg.src}" alt="${esc(story.co)}">`:''}
<h1>${blue(story.head)}</h1>
${story.who?`<p>${esc(story.who)}</p>`:''}
${story.before?`<h2>Before</h2><p>${esc(story.before)}</p>`:''}
${story.built.length?`<h2>What they built</h2>${story.built.map(i=>{const p=i.split('—').map(s=>s.trim());return `<div class="b"><b>${esc(p[0]||'')}</b>${p[1]?`<span>${esc(p[1])}</span>`:''}${p[2]?`<i>${esc(p[2])}</i>`:''}</div>`}).join('')}`:''}
${story.quote?`<blockquote>“${esc(story.quote)}”<cite>${esc(story.by)}</cite></blockquote>`:''}
<div class="cta"><h2 style="margin-top:0">${esc(story.cta)}</h2><a href="https://www.joinleland.com/ai">Talk to us</a></div>
</div></body></html>`}
async function exportStory(kind){storyRead();const name=slug($('etitle').value||story.co||'story');const sl=storySlides();
  if(kind==='post'){copyText(storyPost(),'Post copied');return}
  if(kind==='page'){dl(new Blob([storyPage()],{type:'text/html'}),`${name}.html`);toast('Web page downloaded. Drop it at leland.ai/customers/'+name)}
  else if(kind==='png'){for(const [k] of sl){const c=await renderStorySlide(k,1080,1350);await new Promise(r=>c.toBlob(b=>{dl(b,`${name}-${k}.png`);setTimeout(r,250)},'image/png'))}toast(sl.length+' slides downloaded')}
  else{toast('Building the PDF');try{await loadJsPDF();
    const {jsPDF}=window.jspdf;const pdf=new jsPDF({unit:'px',format:[1080,1350],orientation:'portrait',hotfixes:['px_scaling']});
    for(let i=0;i<sl.length;i++){const c=await renderStorySlide(sl[i][0],1080,1350);if(i)pdf.addPage([1080,1350],'portrait');pdf.addImage(c.toDataURL('image/jpeg',.92),'JPEG',0,0,1080,1350)}
    pdf.save(`${name}-carousel.pdf`);toast('Carousel PDF downloaded. Upload it as a LinkedIn document post')}catch(e){console.warn(e);toast('PDF library blocked, downloading PNGs instead');return exportStory('png')}}
  addProject({t:$('etitle').value,m:'Story · '+sl.length+' slides',th:$('canvasImg').src||'',kind:'story',story:JSON.parse(JSON.stringify(story))})}
