/* LE — Story: case studies and customer wins. One brief → carousel, web page, post. */
let story={co:'',logo:null,head:'',who:'',before:'',built:[],quote:'',by:'',cta:'Let’s chat.',slide:0};
const SAMPLE={co:'ASU+GSV',logo:null,head:'33 people, [building together].',who:'The team behind the ASU+GSV Summit — partnerships, marketing and programs — went through the AI Builder Program together.',before:'Most of the team used AI for simple productivity work. Now they build real systems.',built:['Lucy Baldwin, VP Product — meeting prep triggered from Slack — 8 hours a week back','Uma Sankar Reddy — a daily Slack digest from Slack, Airtable, Granola and email — 50% of her time freed','Genny Velazquez, SVP Partnerships — a proposal generator in her voice — 2 hours to 30 minutes'],quote:'It put everyone in a builder mindset.',by:'Lucy Baldwin, VP Product',cta:'Let’s chat.'};
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
  $('slides').innerHTML=sl.map(([k,n],i)=>`<div class="slide story ${i===story.slide?'on':''}" style="background-image:url('${thumbs[i]}')" onclick="story.slide=${i};storySync()"><span class="n">${n}</span></div>`).join('')},60)}
const BLUE='#2f5fd6',SOFT='#80aced';
async function renderStorySlide(kind,W,H){const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');await fontsReady();const u=W/1080;
  const BG={cover:'#FFD96F',who:'#F9F8F3',before:'#F9F8F3',built:'#F9F8F3',quote:'#F3F1E6',close:'#FFD96F'};x.fillStyle=BG[kind]||'#F9F8F3';x.fillRect(0,0,W,H);x.fillStyle='#111';x.textBaseline='top';
  const lm=await loadImg('assets/brand/mark.svg');const pad=96*u;
  const eyebrow=(t)=>{x.font=`600 ${30*u}px Macan`;x.fillStyle='#767676';x.fillText(t.toUpperCase(),pad,pad);x.fillStyle='#111'};
  const lockup=(y,size)=>{const lh=size,lw=lm.width/lm.height*lh;x.drawImage(lm,pad,y,lw,lh);x.font=`600 ${size*.95}px Macan`;x.fillStyle='#111';x.textBaseline='middle';x.fillText('Leland',pad+lw+size*.35,y+lh/2);x.textBaseline='top'};
  const body=(t,y,size,maxW,ink='#111',lh=1.3)=>{x.font=`400 ${size}px Macan`;x.fillStyle=ink;const ls=wrapText(x,t,maxW);ls.forEach(l=>{x.fillText(l,pad,y);y+=size*lh});return y};
  const accent=(BG[kind]==='#FFD96F')?'#010101':'#3963D7';const head=(t,y,size,maxW)=>{x.font=`500 ${size}px Season, Georgia, serif`;const ls=wrapText(x,t,maxW);ls.forEach(l=>{drawRich(x,l,pad,y,'left','#111',accent);y+=size*1.06});return y};
  const lg=A(story.logo);
  if(kind==='cover'){eyebrow('AI Builder Program');
    if(lg){const im=await loadImg(lg.src);const s=220*u;roundRect(x,pad,pad+90*u,s,s,s*.18);x.save();x.clip();x.drawImage(im,pad,pad+90*u,s,s);x.restore()}
    else{x.font=`600 ${64*u}px Macan`;x.fillText(story.co,pad,pad+110*u)}
    head(story.head||story.co,H*.48,100*u,W-pad*2);
    if(lg){x.font=`500 ${34*u}px Macan`;x.fillStyle='#767676';x.fillText(story.co,pad,H-pad-120*u)}lockup(H-pad-40*u,40*u)}
  else if(kind==='who'){eyebrow(story.co);head('Who they are',pad+90*u,84*u,W-pad*2);body(story.who,pad+260*u,44*u,W-pad*2,'#4c4c4c',1.4);lockup(H-pad-40*u,40*u)}
  else if(kind==='before'){eyebrow(story.co);head('Before',pad+90*u,84*u,W-pad*2);body(story.before,pad+260*u,44*u,W-pad*2,'#4c4c4c',1.4);lockup(H-pad-40*u,40*u)}
  else if(kind==='built'){eyebrow(story.co);let y=head('What they [built]',pad+90*u,84*u,W-pad*2)+40*u;
    story.built.slice(0,4).forEach(item=>{const parts=item.split('—').map(s=>s.trim());x.font=`600 ${36*u}px Macan`;x.fillStyle='#111';x.fillText(parts[0]||'',pad,y);y+=50*u;
      if(parts[1]){y=body(parts[1],y,34*u,W-pad*2,'#4c4c4c',1.35)}
      if(parts[2]){x.font=`600 ${34*u}px Macan`;x.fillStyle=BLUE;x.fillText(parts[2],pad,y);y+=48*u}
      y+=36*u});lockup(H-pad-40*u,40*u)}
  else if(kind==='quote'){eyebrow(story.co);x.font=`500 ${200*u}px Season, Georgia, serif`;x.fillStyle=SOFT;x.fillText('“',pad-10*u,pad+70*u);
    let y=head(story.quote,pad+260*u,80*u,W-pad*2);x.font=`400 ${36*u}px Macan`;x.fillStyle='#767676';x.fillText(story.by,pad,y+40*u);lockup(H-pad-40*u,40*u)}
  else if(kind==='close'){const s=120*u;x.drawImage(lm,pad,H*.3,lm.width/lm.height*s,s);head('Want this for [your team]?',H*.3+s+60*u,96*u,W-pad*2);
    x.font=`500 ${40*u}px Macan`;x.fillStyle='#111';x.fillText(story.cta,pad,H*.3+s+60*u+96*u*2.4);x.fillStyle='#767676';x.fillText('leland.ai',pad,H-pad-40*u)}
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
  let by='';if(qm){const after=prose.slice(prose.indexOf(qm[0])+qm[0].length);const bm=after.match(/^[\s,]*(?:said|says|—|-)?\s*([A-Z][a-z]+ [A-Z][a-z]+(?:,\s*[^.]{3,40})?)/);if(bm)by=bm[1].trim();else{const pre=prose.slice(0,prose.indexOf(qm[0]));const pm=pre.match(/([A-Z][a-z]+ [A-Z][a-z]+)(?:,\s*([^.]{3,40}))?[^.]{0,30}$/);if(pm)by=pm[1]+(pm[2]?', '+pm[2]:'')}}
  const sents=prose.replace(qm?qm[0]:'','').split(/(?<=[.!?])\s+/).map(s=>s.trim()).filter(s=>s.length>3);
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
.eye{font-size:13px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#767676}h1{font-family:Season,Georgia,serif;font-weight:500;font-size:clamp(40px,7vw,72px);line-height:1.02;letter-spacing:-.01em;margin:16px 0 24px}em{font-style:normal;color:#2f5fd6}
h2{font-family:Season,Georgia,serif;font-weight:500;font-size:32px;margin:56px 0 12px}p{font-size:19px;line-height:1.5;color:#4c4c4c;margin:0 0 16px}.logo{width:96px;height:96px;border-radius:18px;object-fit:cover;margin-bottom:28px}
.b{padding:20px 0;border-top:1px solid #eee}.b b{display:block;font-size:19px}.b span{display:block;color:#4c4c4c;font-size:17px;margin-top:4px}.b i{display:block;font-style:normal;color:#2f5fd6;font-weight:600;margin-top:6px}
blockquote{margin:56px 0;font-family:Season,Georgia,serif;font-weight:500;font-size:36px;line-height:1.15}blockquote cite{display:block;font-family:Macan;font-style:normal;font-size:16px;color:#767676;margin-top:16px}
.cta{margin-top:72px;padding:40px;background:#f6f6f6;border-radius:16px}.cta a{display:inline-block;margin-top:12px;background:#111;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600}
.lk{display:flex;align-items:center;gap:8px;font-weight:600;margin-bottom:48px}.lk img{height:22px}</style></head><body><div class="w">
<div class="lk"><img src="${base()}assets/logomark.png" alt="">Leland</div>
<div class="eye">AI Builder Program · Customer story</div>${lg?`<img class="logo" src="${base()+lg.src}" alt="${esc(story.co)}">`:''}
<h1>${blue(story.head)}</h1>
${story.who?`<p>${esc(story.who)}</p>`:''}
${story.before?`<h2>Before</h2><p>${esc(story.before)}</p>`:''}
${story.built.length?`<h2>What they built</h2>${story.built.map(i=>{const p=i.split('—').map(s=>s.trim());return `<div class="b"><b>${esc(p[0]||'')}</b>${p[1]?`<span>${esc(p[1])}</span>`:''}${p[2]?`<i>${esc(p[2])}</i>`:''}</div>`}).join('')}`:''}
${story.quote?`<blockquote>“${esc(story.quote)}”<cite>${esc(story.by)}</cite></blockquote>`:''}
<div class="cta"><h2 style="margin-top:0">Want this for <em>your team</em>?</h2><p>${esc(story.cta)}</p><a href="https://leland.ai">Talk to us</a></div>
</div></body></html>`}
async function exportStory(kind){storyRead();const name=slug($('etitle').value||story.co||'story');const sl=storySlides();
  if(kind==='post'){copyText(storyPost(),'Post copied');return}
  if(kind==='page'){dl(new Blob([storyPage()],{type:'text/html'}),`${name}.html`);toast('Web page downloaded — drop it at leland.ai/customers/'+name)}
  else if(kind==='png'){for(const [k] of sl){const c=await renderStorySlide(k,1080,1350);await new Promise(r=>c.toBlob(b=>{dl(b,`${name}-${k}.png`);setTimeout(r,250)},'image/png'))}toast(sl.length+' slides downloaded')}
  else{toast('Building the PDF');try{if(!window.jspdf){await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
    const {jsPDF}=window.jspdf;const pdf=new jsPDF({unit:'px',format:[1080,1350],orientation:'portrait',hotfixes:['px_scaling']});
    for(let i=0;i<sl.length;i++){const c=await renderStorySlide(sl[i][0],1080,1350);if(i)pdf.addPage([1080,1350],'portrait');pdf.addImage(c.toDataURL('image/jpeg',.92),'JPEG',0,0,1080,1350)}
    pdf.save(`${name}-carousel.pdf`);toast('Carousel PDF downloaded — upload it as a LinkedIn document post')}catch(e){console.warn(e);toast('PDF library blocked — downloading PNGs instead');return exportStory('png')}}
  addProject({t:$('etitle').value,m:'Story · '+sl.length+' slides',th:(A(story.logo)||{}).src||'',kind:'story',story:JSON.parse(JSON.stringify(story))})}
