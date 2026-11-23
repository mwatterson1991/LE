/* Lifted unchanged from the chat interface guidelines (brand/chat-guidelines.html). */
/* Leland thinking orb: a living 3x3x3 dot cube.
   - Corner-on it's the hexagon lattice, face-on a square, pushed out a sphere.
   - It keeps solving itself: Rubik's-style slice turns, faster while thinking.
   - It can morph into dot-matrix glyphs (arrows, check, plus).
   API: Orbs.mount(canvas,{state,display,ink,paper}) -> {set,think,glyph,pulse,speed,ink,destroy} */
var Orbs=(function(){
  var lerp=function(a,b,k){return a+(b-a)*k};
  var ease=function(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2};
  function hex(h){var n=parseInt(h.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255]}
  var ISO_X=Math.atan(1/Math.SQRT2),ISO_Y=Math.PI/4;
  var OTH=[[1,2],[2,0],[0,1]];
  // dot-matrix glyphs on a 5x5 grid (col,row)
  // dot-matrix glyphs built from strokes on a 5x5 grid, dots every half step
  function strokes(list){var out=[],seen={};list.forEach(function(sg){var a=sg[0],b=sg[1],n=Math.round(Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]))/.85);for(var i=0;i<=n;i++){var x=a[0]+(b[0]-a[0])*i/(n||1),y=a[1]+(b[1]-a[1])*i/(n||1),k=x.toFixed(2)+','+y.toFixed(2);if(!seen[k]){seen[k]=1;out.push([x,y])}}});return out}
  // 8-dot glyphs, hand placed on a 5x5 grid
  var G={
    down:[[2,0],[2,1.3],[2,2.6],[2,4],[.7,2.7],[3.3,2.7],[1.35,3.35],[2.65,3.35]],
    up:[[2,4],[2,2.7],[2,1.4],[2,0],[.7,1.3],[3.3,1.3],[1.35,.65],[2.65,.65]],
    right:[[0,2],[1.3,2],[2.6,2],[4,2],[2.7,.7],[2.7,3.3],[3.35,1.35],[3.35,2.65]],
    left:[[4,2],[2.7,2],[1.4,2],[0,2],[1.3,.7],[1.3,3.3],[.65,1.35],[.65,2.65]],
    upright:[[0,4],[1.3,2.7],[2.6,1.4],[4,0],[2.2,0],[3.1,0],[4,.9],[4,1.8]],
    check:[[0,2],[1,3],[2,4],[2.75,3.05],[3.5,2.1],[4.25,1.15],[5,.2],[2,4]],
    plus:[[2,0],[2,1],[2,3],[2,4],[0,2],[1,2],[3,2],[4,2]],
    // archetypes: every dot at least 1.33 apart so they never touch
    operator:[[1,0],[3,0],[1,1.33],[3,1.33],[1,2.67],[3,2.67],[1,4],[3,4]],
    analyst:[[0,4],[1.33,4],[1.33,2.67],[2.67,4],[2.67,2.67],[4,4],[4,2.67],[4,1.33]],
    creator:[[2,0],[2,4],[0,2],[4,2],[.8,.8],[3.2,.8],[.8,3.2],[3.2,3.2]],
    builder:[[0,4],[1.33,4],[2.67,4],[4,4],[.67,2.67],[2,2.67],[3.33,2.67],[2,1.33]]
  };
  var P={
    breathing:{rx:ISO_X,ry:ISO_Y,spin:0,sphere:0,lines:1,pulse:0,wob:0,rate:.45},
    listening:{rx:ISO_X,ry:ISO_Y,spin:0,sphere:0,lines:1,pulse:0,wob:0,rate:.35},
    connecting:{rx:ISO_X,ry:ISO_Y,spin:.2,sphere:0,lines:1.4,pulse:0,wob:0,rate:.7},
    solving:{rx:ISO_X,ry:ISO_Y,spin:0,sphere:0,lines:1,pulse:0,wob:0,rate:1.6},
    working:{rx:ISO_X,ry:ISO_Y,spin:.12,sphere:0,lines:1,pulse:0,wob:0,rate:1.3},
    searching:{rx:ISO_X,ry:ISO_Y,spin:.7,sphere:1,lines:.7,pulse:0,wob:0,rate:.5},
    weaving:{rx:ISO_X,ry:ISO_Y,spin:.5,sphere:.45,lines:1,pulse:0,wob:0,rate:1.2},
    shaping:{rx:ISO_X,ry:ISO_Y,spin:.25,sphere:-1,lines:1,pulse:0,wob:0,rate:.9},
    composing:{rx:ISO_X,ry:ISO_Y,spin:.3,sphere:.2,lines:1,pulse:0,wob:0,rate:.9}
  };
  function mount(canvas,o){
    o=o||{};var D=o.display||64,dpr=Math.min(2,window.devicePixelRatio||1);
    canvas.width=D*dpr;canvas.height=D*dpr;canvas.style.width=D+'px';canvas.style.height=D+'px';
    var noBlue=!!o.noBlue||String(o.ink||'').toLowerCase()==='#ffffff';var ctx=canvas.getContext('2d'),ink=hex(o.ink||'#0f0f10'),paper=hex(o.paper||'#ffffff'),spd=o.speed||1,small=D<44;
    var pos=[];for(var x=-1;x<=1;x++)for(var y=-1;y<=1;y++)for(var z=-1;z<=1;z++){var nz=(x?1:0)+(y?1:0)+(z?1:0);if(nz===3)pos.push([x,y,z])}
    var edges=[];function rebuild(){edges=[];for(var i=0;i<pos.length;i++)for(var j=i+1;j<pos.length;j++){var a=pos[i],b=pos[j];if(Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])===1)edges.push([i,j])}}rebuild();
    var tgt=P[o.state]||P.breathing,cur={};for(var k in P.breathing)cur[k]=tgt[k];
    var appearT=9,vanishT=-1,busy=0,thinking=0,thinkT=0,move=null,lastMove=null,wait=.6,glyphName=null,gk=0,gmap=null,proj=[],pulseT=-1;
    var t=0,last=performance.now(),spinA=0,alive=true,raf;
    function col(alpha){return 'rgba('+ink.join(',')+','+alpha+')'}
    function newMove(){
      var a,l,tries=0;do{a=Math.floor(Math.random()*3);l=Math.floor(Math.random()*3)-1;tries++}while(lastMove&&lastMove.a===a&&lastMove.l===l&&tries<10);
      move={a:a,l:l,dir:Math.random()<.5?1:-1,t:0,dur:thinking?.34:.7};lastMove=move;
    }
    function rot(p,a,ang){var b=OTH[a][0],c=OTH[a][1],q=p.slice(),cs=Math.cos(ang),sn=Math.sin(ang);q[b]=p[b]*cs-p[c]*sn;q[c]=p[b]*sn+p[c]*cs;return q}
    function assignGlyph(name){
      var g=G[name];if(!g){gmap=null;return}if(g.length>pos.length){var step=g.length/pos.length,sg=[];for(var q=0;q<pos.length;q++)sg.push(g[Math.floor(q*step)]);g=sg}
      var S=D*dpr,c=S/2,u=S*.13,gp=g.map(function(q){return[c+(q[0]-2)*u,c+(q[1]-2)*u]});
      var used={},map=new Array(pos.length);
      // each glyph point grabs its nearest free dot, the rest stack on their nearest glyph point
      gp.forEach(function(q,gi){var best=-1,bd=1e9;for(var i=0;i<pos.length;i++){if(used[i]||!proj[i])continue;var d=Math.hypot(proj[i][0]-q[0],proj[i][1]-q[1]);if(d<bd){bd=d;best=i}}if(best>-1){used[best]=1;map[best]=q}});
      for(var i=0;i<pos.length;i++)if(!map[i]){var bd=1e9,bq=gp[0];gp.forEach(function(q){var d=proj[i]?Math.hypot(proj[i][0]-q[0],proj[i][1]-q[1]):0;if(d<bd){bd=d;bq=q}});map[i]=bq}
      gmap=map;
    }
    function frame(now){
      if(!alive)return;var dt=Math.min(.05,Math.max(0,(now-last)/1000))*spd;last=now;t+=dt;appearT+=dt;if(vanishT>=0)vanishT+=dt;
      var kk=1-Math.pow(.03,dt);
      for(var q in cur){var g=tgt[q];if(q==='sphere'&&g<0)g=(Math.sin(t*1.3)+1)/2;cur[q]=lerp(cur[q],g,kk)}
      thinkT=lerp(thinkT,thinking||busy,1-Math.pow(.01,dt));var live=Math.max(thinkT,0);
      spinA+=(cur.spin*live+thinkT*.9)*dt*1.3;if(live<.05){spinA=lerp(spinA,Math.round(spinA/(Math.PI/2))*(Math.PI/2),1-Math.pow(.02,dt))}
      // slice turns: the cube keeps solving itself
      if(move){move.t+=dt/move.dur;if(move.t>=1){var m=move;pos=pos.map(function(p){return p[m.a]===m.l?rot(p,m.a,m.dir*Math.PI/2).map(Math.round):p});rebuild();move=null;wait=(thinking?.08:1/Math.max(.1,cur.rate))*(.6+Math.random()*.8)}}
      else if(gk<.3&&(thinking||busy)){wait-=dt;if(wait<=0)newMove()}
      var mang=move?move.dir*Math.PI/2*ease(Math.min(1,move.t)):0;
      // glyph morph amount
      gk=lerp(gk,glyphName?1:0,1-Math.pow(.004,dt));
      var rx=lerp(ISO_X,cur.rx,live)+cur.wob*live*Math.sin(t*.8),ry=lerp(ISO_Y,cur.ry,live)+spinA+cur.wob*live*Math.sin(t*.6+1);
      var cx=Math.cos(rx),sx=Math.sin(rx),cy=Math.cos(ry),sy=Math.sin(ry);
      var S=D*dpr,c=S/2,pul=1+cur.pulse*Math.sin(t*2.4);if(pulseT>=0){pulseT+=dt;pul*=1+.12*Math.sin(Math.min(1,pulseT/.35)*Math.PI);if(pulseT>.35)pulseT=-1}
      var sc=S*.36/1.63*pul,sph=Math.max(0,Math.min(1,cur.sphere))*live;
      var rotV=function(v){var x1=v[0]*cy+v[2]*sy,z1=-v[0]*sy+v[2]*cy;return[x1,v[1]*cx-z1*sx,v[1]*sx+z1*cx]};
      var nz=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].map(function(n){var r=rotV(n)[2],v=(r+.02)/.2;return v<0?0:v>1?1:v*v*(3-2*v)});
      var pts=pos.map(function(p){
        var v=(move&&p[move.a]===move.l)?rot(p,move.a,mang):p.slice();
        var vis=0;for(var a=0;a<3;a++){if(v[a]>.6)vis=Math.max(vis,nz[a*2]);if(v[a]<-.6)vis=Math.max(vis,nz[a*2+1])}
        if(sph>0){var L=Math.hypot(v[0],v[1],v[2]),R=1.45;v=[lerp(v[0],v[0]/L*R,sph),lerp(v[1],v[1]/L*R,sph),lerp(v[2],v[2]/L*R,sph)]}
        var r=rotV(v);if(sph>0){var d=(r[2]+.35)/.6;d=d<0?0:d>1?1:d;vis=lerp(vis,d,sph)}
        var rr=Math.hypot(r[0],r[1])/1.633,band=(rr>.28&&rr<.72)?1:0;vis*=1-band*(1-live)*(1-gk);
        return[c+r[0]*sc,c-r[1]*sc,r[2],vis,(move&&p[move.a]===move.l)?Math.sin(Math.min(1,move.t)*Math.PI):0];
      });
      proj=pts;
      if(glyphName&&!gmap)assignGlyph(glyphName);
      var e5=ease(Math.min(1,gk));
      if(gmap&&gk>.001)pts=pts.map(function(p,i){var g=gmap[i];return[lerp(p[0],g[0],e5),lerp(p[1],g[1],e5),p[2],lerp(p[3],1,e5),0]});
      if(!glyphName&&gk<.002)gmap=null;
      if(appearT<3||vanishT>=0){var nP=pts.length;pts=pts.map(function(p,i){
          var k=vanishT>=0?1-Math.min(1,vanishT/.22):Math.max(0,Math.min(1,(appearT-i*.075)/.5));var e=ease(k),ang=(1-e)*2.4,dx=p[0]-c,dy=p[1]-c;
          return[c+(dx*Math.cos(ang)-dy*Math.sin(ang))*e,c+(dx*Math.sin(ang)+dy*Math.cos(ang))*e,p[2],p[3]*Math.min(1,k*1.6),p[4],e]});}
      ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,S,S);
      var la=0;
      if(la>.01){ctx.lineWidth=Math.max(1,S*(small?.014:.007));ctx.lineCap='round';
        for(var e=0;e<edges.length;e++){var A=pts[edges[e][0]],B=pts[edges[e][1]],al=Math.min(A[3],B[3]);if(al<.02)continue;ctx.strokeStyle=col(al*la);ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);ctx.stroke()}}
      var r0=S*(small?.085:D>200?.042:.058)*(1-e5*.42);
      var ord=pts.map(function(p,i){return i}).sort(function(a,b){return pts[a][2]-pts[b][2]});
      for(var n=0;n<ord.length;n++){var p=pts[ord[n]];if(p[3]<.02)continue;ctx.fillStyle=p[4]>.02&&!noBlue?'rgba('+[Math.round(lerp(ink[0],128,p[4])),Math.round(lerp(ink[1],172,p[4])),Math.round(lerp(ink[2],237,p[4]))].join(',')+','+p[3]+')':col(p[3]);ctx.beginPath();ctx.arc(p[0],p[1],r0*(p[5]==null?1:.35+.65*p[5]),0,7);ctx.fill()}
      raf=requestAnimationFrame(frame);
    }
    raf=requestAnimationFrame(frame);
    return{
      set:function(s){tgt=P[s]||P.breathing},
      appear:function(){appearT=0;vanishT=-1;spinA=0},vanish:function(){vanishT=0},
      busy:function(b){busy=b?1:0;if(b&&!move)wait=0},
      think:function(b){thinking=b?1:0;if(b&&!move&&!glyphName)wait=0},
      glyph:function(name){glyphName=name||null;gmap=null},
      pulse:function(){pulseT=0},
      speed:function(v){spd=v},ink:function(h){ink=hex(h)},destroy:function(){alive=false;cancelAnimationFrame(raf)}
    };
  }
  return{mount:mount,states:Object.keys(P),glyphs:Object.keys(G)};
})();
