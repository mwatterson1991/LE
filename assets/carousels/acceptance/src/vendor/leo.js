/* Leo — the Leland mark, alive. Engine from Leo.html; mounted as the top-left logo in LE. */
(function(){

/* ---------- Geometry: every arc in the mark shares one center ---------- */
const C=[473,1145];
const D2R=Math.PI/180;
const P=(r,a)=>[C[0]+r*Math.cos(a*D2R), C[1]-r*Math.sin(a*D2R)];
const R_IN=266, R_OUT=439, RC=(R_IN+R_OUT)/2, W0=R_OUT-R_IN;   // bottom arc
const BAND={rin:498, rout:678};
const EYE={L:[352,792], R:[594,792], r:76};
const BASE={big:512, small:430};
const $$=id=>document.getElementById(id);
const lerp=(a,b,u)=>a+(b-a)*u;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const poly=pts=>'M'+pts.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L')+'Z';
const arc=(r,a0,a1,n)=>{const o=[];for(let i=0;i<=n;i++)o.push(P(r,a0+(a1-a0)*i/n));return o};

// Big ear = traced logo clipped to everything outside the band's top edge (so it can move on its own)
const SEP=[265,499], SEPA=Math.atan2(C[1]-SEP[1],SEP[0]-C[0])/D2R;
const EARS={"big":[[301.0,14.2],[298.0,19.7],[295.0,25.2],[295.0,27.5],[291.5,33.9],[288.0,40.2],[288.0,42.5],[284.5,48.9],[281.0,55.2],[281.0,57.5],[277.5,63.9],[274.0,70.2],[274.0,72.5],[270.5,78.8],[267.0,85.2],[267.0,87.5],[263.5,93.8],[260.0,100.2],[260.0,102.5],[256.5,108.8],[253.0,115.2],[253.0,117.5],[249.5,123.8],[246.0,130.2],[246.0,132.5],[242.5,138.8],[239.0,145.2],[239.0,147.5],[235.5,153.8],[232.0,160.2],[232.0,162.5],[228.5,168.8],[225.0,175.2],[225.0,177.5],[221.5,183.8],[218.0,190.2],[218.0,192.5],[214.5,198.8],[211.0,205.2],[211.0,207.5],[207.5,213.8],[204.0,220.2],[204.0,222.5],[200.5,228.8],[197.0,235.2],[197.0,237.5],[193.5,243.8],[190.0,250.2],[190.0,252.5],[186.5,258.9],[183.0,265.2],[183.0,267.5],[179.0,274.9],[175.0,282.2],[175.0,284.5],[171.5,290.9],[168.0,297.2],[168.0,299.5],[164.5,305.9],[161.0,312.2],[161.0,314.5],[157.5,320.9],[154.0,327.2],[154.0,329.5],[150.5,335.9],[147.0,342.2],[147.0,344.5],[143.5,350.9],[140.0,357.2],[140.0,359.5],[136.5,365.9],[133.0,372.2],[133.0,374.5],[129.5,380.9],[126.0,387.2],[126.0,389.5],[122.5,395.9],[119.0,402.2],[119.0,404.5],[115.5,410.9],[112.0,417.2],[112.0,419.5],[108.5,425.9],[105.0,432.2],[105.0,434.5],[101.5,440.9],[98.0,447.2],[98.0,449.5],[94.5,455.9],[91.0,462.2],[91.0,464.5],[87.5,470.9],[84.0,477.2],[84.0,479.5],[80.5,485.9],[77.0,492.2],[77.0,494.5],[73.5,500.9],[70.0,507.2],[70.0,509.5],[66.5,515.9],[63.0,522.2],[63.0,524.5],[59.0,531.9],[55.0,539.2],[55.0,541.5],[51.5,547.9],[48.0,554.2],[48.0,556.5],[44.5,562.9],[41.0,569.2],[41.0,571.5],[37.5,577.9],[34.0,584.2],[34.0,586.5],[31.2,592.3],[28.4,598.0],[25.6,603.8],[22.8,609.6],[20.0,615.4],[17.2,621.1],[14.4,626.9],[11.6,632.7],[8.8,638.4],[6.0,644.2],[6.0,646.5],[3.0,652.8],[0.0,659.0],[0.0,662.1],[2.6,659.5],[10.3,652.1],[18.2,644.9],[26.1,637.8],[34.2,630.8],[42.4,623.9],[50.7,617.2],[59.1,610.6],[67.5,604.1],[76.1,597.8],[84.8,591.6],[93.6,585.5],[102.5,579.6],[111.5,573.8],[120.6,568.1],[129.7,562.7],[139.0,557.3],[148.3,552.1],[157.7,547.0],[167.2,542.1],[176.7,537.4],[186.4,532.8],[196.1,528.3],[205.8,524.0],[215.7,519.9],[225.6,515.9],[235.6,512.1],[245.6,508.4],[253.9,505.5],[253.8,505.5],[256.4,500.0],[258.9,494.5],[261.5,489.0],[264.1,483.5],[266.6,478.0],[269.2,472.5],[271.8,467.0],[274.3,461.5],[276.9,456.0],[279.5,450.6],[282.0,445.1],[284.6,439.6],[287.1,434.1],[289.7,428.6],[292.3,423.1],[294.8,417.6],[297.4,412.1],[300.0,406.6],[302.5,401.1],[305.1,395.6],[307.7,390.1],[310.2,384.6],[312.8,379.1],[315.4,373.6],[317.9,368.1],[320.5,362.6],[323.1,357.1],[325.6,351.7],[328.2,346.2],[330.8,340.7],[333.3,335.2],[335.9,329.7],[338.5,324.2],[341.0,318.7],[343.6,313.2],[346.1,307.7],[348.7,302.2],[351.3,296.7],[353.8,291.2],[356.4,285.7],[359.0,280.2],[361.5,274.7],[364.1,269.2],[366.7,263.7],[369.2,258.2],[371.8,252.8],[374.4,247.3],[376.9,241.8],[379.5,236.3],[382.1,230.8],[384.6,225.3],[387.2,219.8],[389.8,214.3],[392.3,208.8],[394.9,203.3],[397.5,197.8],[400.0,192.3],[402.6,186.8],[405.1,181.3],[407.7,175.8],[410.3,170.3],[412.8,164.8],[415.4,159.3],[418.0,153.8],[420.5,148.4],[423.1,142.9],[425.7,137.4],[428.2,131.9],[430.8,126.4],[433.4,120.9],[435.9,115.4],[438.5,109.9],[441.1,104.4],[443.6,98.9],[446.2,93.4],[448.8,87.9],[451.3,82.4],[453.9,76.9],[456.5,71.4],[459.0,65.9],[461.6,60.4],[464.1,54.9],[466.7,49.5],[469.3,44.0],[471.8,38.5],[474.4,33.0],[477.0,27.5],[479.5,22.0],[482.1,16.5],[484.7,11.0],[487.2,5.5],[489.8,0.0],[483.6,0.0],[477.4,0.0],[471.3,0.0],[465.1,0.0],[458.9,0.0],[452.7,0.0],[446.6,0.0],[440.4,0.0],[434.2,0.0],[428.0,0.0],[421.8,0.0],[415.7,0.0],[409.5,0.0],[403.3,0.0],[397.1,0.0],[391.0,0.0],[384.8,0.0],[378.6,0.0],[372.4,0.0],[366.2,0.0],[360.1,0.0],[353.9,0.0],[347.7,0.0],[341.5,0.0],[335.4,0.0],[329.2,0.0],[323.0,0.0],[322.5,1.0],[319.2,1.0],[312.2,4.0],[306.6,9.1]],"small":[[715.5,5.0],[705.8,0.0],[699.7,0.0],[693.6,0.0],[687.5,0.0],[681.4,0.0],[675.2,0.0],[669.1,0.0],[663.0,0.0],[656.9,0.0],[650.8,0.0],[644.7,0.0],[638.6,0.0],[632.5,0.0],[626.3,0.0],[620.2,0.0],[614.1,0.0],[608.0,0.0],[601.9,0.0],[595.8,0.0],[589.7,0.0],[583.6,0.0],[577.4,0.0],[571.3,0.0],[565.2,0.0],[559.1,0.0],[553.0,0.0],[550.0,8.5],[546.8,14.9],[543.5,21.4],[540.2,27.8],[537.0,34.2],[537.0,36.5],[534.0,41.9],[531.0,47.2],[531.0,49.5],[528.0,54.9],[525.0,60.2],[525.0,62.5],[522.0,67.8],[519.0,73.2],[519.0,75.5],[516.0,80.8],[513.0,86.2],[513.0,88.5],[510.3,94.0],[507.6,99.6],[504.9,105.1],[502.1,110.6],[499.4,116.1],[496.7,121.7],[494.0,127.2],[494.0,129.5],[491.0,134.8],[488.0,140.2],[488.0,142.5],[485.0,147.8],[482.0,153.2],[482.0,155.5],[479.0,160.8],[476.0,166.2],[476.0,168.5],[473.0,173.8],[470.0,179.2],[470.0,181.5],[467.0,186.8],[464.0,192.2],[464.0,194.5],[461.3,200.0],[458.6,205.6],[455.9,211.1],[453.1,216.6],[450.4,222.1],[447.7,227.7],[445.0,233.2],[445.0,235.5],[442.0,240.8],[439.0,246.2],[439.0,248.5],[436.0,253.8],[433.0,259.2],[433.0,261.5],[430.0,266.9],[427.0,272.2],[427.0,274.5],[424.0,279.9],[421.0,285.2],[421.0,287.5],[418.0,292.9],[415.0,298.2],[415.0,300.5],[412.0,305.9],[409.0,311.2],[409.0,313.5],[405.8,319.9],[402.5,326.4],[399.2,332.8],[396.0,339.2],[396.0,341.5],[393.0,346.9],[390.0,352.2],[390.0,354.5],[387.0,359.9],[384.0,365.2],[384.0,367.5],[381.0,372.9],[378.0,378.2],[378.0,380.5],[375.0,385.9],[372.0,391.2],[372.0,393.5],[369.0,398.9],[366.0,404.2],[366.0,406.5],[363.3,412.1],[360.6,417.6],[357.9,423.2],[355.2,428.8],[363.9,427.8],[372.5,426.8],[373.2,425.8],[379.5,425.8],[380.2,424.8],[388.9,424.3],[397.5,423.8],[398.2,422.8],[405.6,422.5],[413.1,422.1],[420.5,421.8],[421.2,420.8],[428.9,420.8],[436.5,420.8],[437.2,419.8],[443.4,419.8],[449.6,419.8],[455.8,419.8],[462.0,419.8],[468.2,419.8],[474.5,419.8],[480.7,419.8],[486.9,419.8],[493.1,419.8],[499.3,419.8],[505.5,419.8],[506.2,420.8],[514.9,420.8],[523.5,420.8],[524.2,421.8],[532.5,422.1],[540.8,422.5],[543.8,416.5],[546.8,410.5],[546.8,408.2],[549.8,402.9],[552.8,397.5],[552.8,395.2],[555.8,389.9],[558.8,384.5],[558.8,382.2],[562.3,375.9],[565.8,369.5],[565.8,367.2],[568.8,361.9],[571.8,356.5],[571.8,354.2],[574.8,348.9],[577.8,343.5],[577.8,341.2],[580.8,335.9],[583.8,330.5],[583.8,328.2],[586.8,322.9],[589.8,317.5],[589.8,315.2],[592.8,309.9],[595.8,304.5],[595.8,302.2],[598.8,296.9],[601.8,291.5],[601.8,289.2],[604.8,283.9],[607.8,278.5],[607.8,276.2],[610.8,270.9],[613.8,265.5],[613.8,263.2],[616.8,257.9],[619.8,252.5],[619.8,250.2],[623.0,243.8],[626.3,237.3],[629.5,230.9],[632.8,224.5],[632.8,222.2],[635.8,216.8],[638.8,211.5],[638.8,209.2],[641.8,203.8],[644.8,198.5],[644.8,196.2],[647.8,190.8],[650.8,185.5],[650.8,183.2],[653.8,177.8],[656.8,172.5],[656.8,170.2],[659.8,164.8],[662.8,159.5],[662.8,157.2],[665.8,151.8],[668.8,146.5],[668.8,144.2],[671.8,138.8],[674.8,133.5],[674.8,131.2],[677.8,125.8],[680.8,120.5],[680.8,118.2],[683.8,112.8],[686.8,107.5],[686.8,105.2],[690.3,98.8],[693.8,92.5],[693.8,90.2],[696.8,84.1],[699.8,78.0],[702.8,71.8],[705.8,65.7],[708.8,59.6],[711.8,53.5],[711.8,51.2],[714.8,45.9],[717.8,40.5],[717.8,38.2],[721.8,31.5],[722.8,24.2],[723.8,23.5],[722.8,16.2],[720.8,11.2]]};
/* Ears deform as one continuous shape: the base never moves, so joints never tear.
   fold: the small ear curls over its middle like a floppy dog ear. */
const EAR_B=[447,424], EAR_U=[.409,-.913], EAR_N=[.913,.409], FOLD_AT=175, FOLD_LEN=260;
function bendEar(pts,Y0,sk,st,fold){
  const th=fold*D2R, k=Math.abs(th)>1e-4?th/FOLD_LEN:0, R0=k?1/k:0, tn=Math.tan(sk*D2R);
  return pts.map(p=>{let x=p[0], y=p[1];
    if(k){const dx=x-EAR_B[0], dy=y-EAR_B[1], a=dx*EAR_U[0]+dy*EAR_U[1], b=dx*EAR_N[0]+dy*EAR_N[1];
      if(a>FOLD_AT){const ap=Math.min(a-FOLD_AT,FOLD_LEN), ph=k*ap, r=R0-b;
        let na=FOLD_AT+r*Math.sin(ph), nb=R0-r*Math.cos(ph); const e=a-FOLD_AT-FOLD_LEN;
        if(e>0){na+=e*Math.cos(ph); nb+=e*Math.sin(ph);}
        x=EAR_B[0]+na*EAR_U[0]+nb*EAR_N[0]; y=EAR_B[1]+na*EAR_U[1]+nb*EAR_N[1];}}
    if(y<Y0){const d=Y0-y; y=Y0-d*st; x+=tn*Y0*Math.pow(d/Y0,1.5);}
    return [x,y];});
}

/* ---------- Bent strip: an arc segment with optional rounded ends ----------
   M: midpoint of centerline, L: length, w: thickness, k: curvature (+ = ∩, − = ∪),
   rho: end rounding, rot: rotation (deg) around M. Covers band, brow→smile, arc halves→balls. */
function strip(M,L,w,k,rho,rot){
  rho=clamp(rho,0,Math.min(w/2,L/2)); const h=w/2-rho, Lc=Math.max(0,L/2-rho);
  const c=s=>Math.abs(k)<1e-7?[s,k*s*s/2]:[Math.sin(k*s)/k,(1-Math.cos(k*s))/k];
  const T=s=>[Math.cos(k*s),Math.sin(k*s)], N=s=>[Math.sin(k*s),-Math.cos(k*s)];
  const pts=[], add=(p,q,a)=>pts.push([p[0]+q[0]*a,p[1]+q[1]*a]);
  const n=64, nc=10;
  const side=(sgn,from,to)=>{for(let i=0;i<=n;i++){const s=lerp(from,to,i/n),cc=c(s),nn=N(s);add(cc,nn,sgn*w/2)}};
  const corner=(s,hs,A,B)=>{const cc=c(s),nn=N(s),base=[cc[0]+nn[0]*hs,cc[1]+nn[1]*hs];
    for(let i=1;i<nc;i++){const f=i/nc*Math.PI/2,co=Math.cos(f),si=Math.sin(f);
      pts.push([base[0]+rho*(co*A[0]+si*B[0]),base[1]+rho*(co*A[1]+si*B[1])])}};
  const neg=v=>[-v[0],-v[1]];
  side(1,-Lc,Lc);
  if(rho>.5) corner(Lc,h,N(Lc),T(Lc));
  if(rho>.5) corner(Lc,-h,T(Lc),neg(N(Lc)));
  side(-1,Lc,-Lc);
  if(rho>.5) corner(-Lc,-h,neg(N(-Lc)),neg(T(-Lc)));
  if(rho>.5) corner(-Lc,h,neg(T(-Lc)),N(-Lc));
  const cr=Math.cos(rot*D2R), sr=Math.sin(rot*D2R);
  return pts.map(p=>[M[0]+p[0]*cr-p[1]*sr, M[1]+p[0]*sr+p[1]*cr]);
}
// half of the bottom arc centred at polar angle a (deg), on radius rc
const halfStrip=(a,rc,L,w,rho,dx=0,dy=0)=>{const M=P(rc,a);return strip([M[0]+dx,M[1]+dy],L,w,1/rc,rho,90-a)};
const polar=p=>[Math.hypot(p[0]-C[0],C[1]-p[1]), Math.atan2(C[1]-p[1],p[0]-C[0])/D2R];
const EL=polar(EYE.L);   // eye position in arc space

/* ---------- Eye expressions on the finished ball ---------- */
function eyePath(cx,cy,R,b,h){
  const pts=[];
  for(let i=0;i<160;i++){const th=i/160*Math.PI*2; let x=cx+R*Math.cos(th), y=cy+R*Math.sin(th);
    if(h>0){const ccy=cy+R*(2.25-1.65*h), rc=R*1.15, dx=x-cx;
      if(Math.abs(dx)<rc){const top=ccy-Math.sqrt(rc*rc-dx*dx); if(y>top)y=top;}}
    if(b>0){const u=clamp((x-cx)/R,-1,1); y=cy+(y-cy)*(1-.85*b)+b*.3*R*(1-u*u);}
    pts.push([x,y]);}
  return poly(pts);
}
// arc half → split → rolls into a ball.  side: -1 left, +1 right
function morphPath(side,m,R,ox,oy){
  const mir=a=>side<0?a:180-a;
  const L0=RC*45.4*D2R;
  if(m<=0.32){ // separate in the middle: gap opens, corners soften
    const u=E.io(m/.32);
    const a0=lerp(89.6,97,u), a1=lerp(135,133,u);
    const L=RC*(a1-a0)*D2R;
    return poly(halfStrip(mir((a0+a1)/2),RC,L,lerp(W0,W0-6,u),lerp(0,34,u)));
  }
  const u=E.io((m-.32)/.68);               // roll into a ball
  const a=lerp(115,EL[1],u), rc=lerp(RC,EL[0],u);
  const L1=RC*36*D2R;
  return poly(halfStrip(mir(a),rc,lerp(L1,2*R,u),lerp(W0-6,2*R,u),lerp(34,R,u),ox*u*u,oy*u*u));
}


/* ---------- Eyes: ball + lids (blink, happy, squint, determined slope) ---------- */
function eyePath2(cx,cy,R,b,h,sq,ls,side){
  const pts=[];
  for(let i=0;i<160;i++){const th=i/160*Math.PI*2; let x=cx+R*Math.cos(th), y=cy+R*Math.sin(th);
    if(h>0){const ccy=cy+R*(2.25-1.65*h), rc=R*1.15, dx=x-cx;
      if(Math.abs(dx)<rc){const top=ccy-Math.sqrt(rc*rc-dx*dx); if(y>top)y=top;}}
    if(sq>0||ls>0){const lid=cy-R*(1-1.15*sq)+ls*.42*(x-cx)*(side<0?1:-1)*Math.min(1,sq*2.5+.0001); if(y<lid)y=lid;}
    if(b>0){const u=clamp((x-cx)/R,-1,1); y=cy+(y-cy)*(1-.85*b)+b*.3*R*(1-u*u);}
    pts.push([x,y]);}
  return poly(pts);
}

/* ---------- Expressions: each is a short clip that starts and ends neutral ---------- */
const E={
  l:x=>x, io:x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2, out:x=>1-Math.pow(1-x,3), in:x=>x*x*x,
  s:x=>-(Math.cos(Math.PI*x)-1)/2,
  back:x=>{const c1=1.7,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)},
  bounce:x=>{const n=7.5625,d=2.75;if(x<1/d)return n*x*x;if(x<2/d)return n*(x-=1.5/d)*x+.75;if(x<2.5/d)return n*(x-=2.25/d)*x+.9375;return n*(x-=2.625/d)*x+.984375}
};
const DEF={m:0,sc:1,b:0,wink:0,h:0,sm:0,orb:0,turn:0,lx:0,ly:0,tilt:0,fold:0,flop:0,er:0,el:0,es:1,eb:1,
  hy:0,sy:1,bl:0,btilt:0,ea:0,sqL:0,sqR:0,ls:0,spin:0,zs:0,earIn:1,fade:1};
const hold=(v,a,b,e1='io',e2='io',d=.3)=>[[a-d,0],[a,v,e1],[b,v],[b+d,0,e2]]; // ramp in, hold, ramp out
const typing=(()=>{const o=[[0,0],[.3,0]];for(let t=.3;t<2.4;t+=.16)o.push([t+.08,5,'out'],[t+.16,0,'in']);return o})();
const scan=(()=>{const o=[[0,0]];let s=-1;for(let t=.3;t<2.4;t+=.3){o.push([t,.5*s,'io']);s*=-1}o.push([2.7,0,'io']);return o})();
const BEATS={
  hold:{d:1.2,k:{}}, rest:{d:.6,k:{}},
  // loader: arcs orbit around the shared center
  toSpin:{d:.7,k:{earIn:[[0,1],[.3,0,'in']], zs:[[.1,0],[.6,1,'io']], spin:[[0,0],[.15,0],[.7,90,'in']]}},
  spinLoop:{d:.9,k:{spin:[[0,90],[.9,450,'l']]}},
  fromSpin:{d:2.25,k:{spin:[[0,-270],[1.5,0,'out']], zs:[[0,1],[.85,1],[1.55,0,'io']],
    earIn:[[0,0],[1.3,0],[1.8,1,'back'],[1.9,1]],
    es:[[1.75,1],[1.88,.86,'out'],[2.05,1.05,'io'],[2.22,1,'io']], eb:[[1.75,1],[1.88,.92,'out'],[2.05,1.03,'io'],[2.22,1,'io']]}},
  fromSpinQ:{d:1.1,k:{spin:[[0,-270],[.8,0,'out']], zs:[[0,1],[.3,1],[.85,0,'io']], earIn:[[0,0],[.6,0],[.95,1,'back'],[1.05,1]]}},
  // logo → face: the arc splits in the middle and rolls into two balls
  wake:{d:2.05,k:{m:[[0,0],[.25,0],[1.05,1,'l']], sc:[[.9,1],[1.05,.9],[1.25,1.12,'out'],[1.5,1,'io']],
    b:[[0,0],[1.55,0],[1.62,1,'in'],[1.72,0,'out'],[1.82,0],[1.9,1,'in'],[2.0,0,'out']],
    er:[[0,0],[.25,-7,'io'],[.6,14,'out'],[.8,-5,'io'],[1.0,4,'io'],[1.2,0,'io']],
    el:[[0,0],[.25,2.5,'io'],[.6,-4,'out'],[.85,1.5,'io'],[1.1,0,'io']],
    es:[[0,1],[.25,.9,'io'],[.6,1.1,'out'],[.9,.97,'io'],[1.1,1,'io']], eb:[[0,1],[.25,.95,'io'],[.6,1.05,'out'],[1.0,1,'io']],
    hy:[[0,0],[.25,10,'io'],[.62,-46,'out'],[.95,0,'in'],[1.07,-8,'out'],[1.19,0,'in']],
    sy:[[0,1],[.25,.93,'io'],[.5,1.05,'out'],[.9,1,'io'],[.97,.93,'out'],[1.17,1,'io']],
    bl:[[1.15,0],[1.27,-16,'out'],[1.7,0,'io']]}},
  bye:{d:1.35,k:{b:[[0,0],[.08,1,'in'],[.18,0,'out']], sc:[[.08,1],[.23,.95]], m:[[.23,1],[1.03,0,'l']],
    er:[[.28,0],[.53,-5,'io'],[.98,3,'io'],[1.18,0,'io']], el:[[.88,0],[1.03,1.5],[1.23,0]],
    es:[[.28,1],[.53,.94,'io'],[.98,1.02,'io'],[1.18,1,'io']], eb:[[.28,1],[.58,.97,'io'],[1.08,1,'io']],
    hy:[[.9,0],[1.02,-6,'out'],[1.16,0,'in']], sy:[[.96,1],[1.06,.95,'out'],[1.26,1,'io']]}},
  look:{d:1.85,k:{turn:[[0,0],[.3,-6,'io'],[.75,-6],[1.1,6,'io'],[1.5,6],[1.75,0,'io']],
    lx:[[0,0],[.25,-.85,'io'],[.75,-.85],[1.1,.85,'io'],[1.5,.85],[1.75,0,'io']]}},
  dogEar:{d:1.65,k:{lx:[[0,0],[.35,.6,'io'],[1.2,.6],[1.4,0,'io']], ly:[[0,0],[.35,-.85,'io'],[1.2,-.85],[1.4,0,'io']],
    bl:[[0,0],[.35,-12,'io'],[1.2,-12],[1.4,0,'io']],
    fold:[[0,0],[.45,140,'bounce'],[.7,128,'io'],[.95,140,'io'],[1.06,148,'io'],[1.24,-6,'out'],[1.38,3,'io'],[1.52,0,'io']],
    flop:[[0,0],[.15,8,'io'],[.45,4,'io'],[1.06,6],[1.24,1,'out'],[1.4,0,'io']],
    b:[[.45,0],[.52,1,'in'],[.62,0,'out']], es:[[1.08,1],[1.26,1.08,'out'],[1.5,1,'io']], hy:[[1.12,0],[1.26,-14,'out'],[1.4,0,'in']]}},
  // brow orbits like the loader (1½ turns) and comes round under the eyes as a smile, then keeps going home
  smile:{d:2.7,k:{sm:[[0,0],[.35,1,'io'],[2.2,1],[2.6,0,'io']], orb:[[.08,0],[1.05,540,'io'],[2.05,540],[2.6,720,'io']],
    h:[[.75,0],[.95,1,'out'],[2.0,1],[2.2,0,'io']], er:[[1.0,0],[1.1,10],[1.22,-4],[1.34,10],[1.46,-4],[1.6,0]],
    el:[[1.0,0],[1.12,-3],[1.26,2],[1.38,-3],[1.5,0]], hy:[[.95,0],[1.1,-14,'out'],[1.26,0,'in']]}},
  wink:{d:1.25,k:{tilt:[[0,0],[.3,-7,'out'],[.9,-7],[1.15,0,'io']], wink:[[.25,0],[.35,1,'in'],[.75,1],[.85,0,'out']],
    er:[[0,0],[.3,7,'io'],[.9,7],[1.15,0,'io']]}},
  blink:{d:.45,k:{b:[[0,0],[.07,1,'in'],[.17,0,'out']]}},
  // eyes up and to the side, brow raised on one side, ear tapping like a finger
  thinking:{d:2.7,k:{lx:hold(-.55,.35,2.2), ly:hold(-.8,.35,2.2), btilt:hold(-5,.4,2.2), bl:hold(-8,.4,2.2),
    turn:hold(-3,.4,2.2), ea:hold(.06,.4,2.2), sqR:hold(.35,.4,2.2),
    er:[[.6,0],[.85,7,'io'],[1.1,0,'io'],[1.35,7,'io'],[1.6,0,'io'],[1.85,7,'io'],[2.1,0,'io']],
    b:[[1.45,0],[1.52,1,'in'],[1.62,0,'out']]}},
  // head tilt, one eye big one small, ear half-droops like a question mark
  puzzled:{d:2.45,k:{tilt:[[0,0],[.3,9,'back'],[2.0,9],[2.35,0,'io']], ea:[[0,0],[.3,.18,'out'],[2.0,.18],[2.35,0,'io']],
    sqR:[[0,0],[.3,.3,'out'],[2.0,.3],[2.35,0,'io']], btilt:[[0,0],[.3,6,'out'],[2.0,6],[2.35,0,'io']],
    fold:[[0,0],[.4,60,'bounce'],[2.0,60],[2.3,0,'io']], el:[[.3,0],[.45,-3],[.6,0]],
    b:[[1.1,0],[1.17,1,'in'],[1.27,0,'out'],[1.36,0],[1.43,1,'in'],[1.53,0,'out']]}},
  // brow down, lids focused, eyes scanning lines, little typing bob, ears pinned back
  work:{d:2.8,k:{bl:hold(22,.25,2.45), sqL:hold(.42,.25,2.45), sqR:hold(.42,.25,2.45), ls:hold(.7,.25,2.45),
    ly:hold(.55,.25,2.45), lx:scan, hy:typing, es:[[0,1],[.25,.86,'io'],[2.45,.86],[2.75,1,'io']],
    eb:[[0,1],[.25,.94,'io'],[2.45,.94],[2.75,1,'io']], er:hold(-9,.25,2.45), el:hold(-2,.25,2.45)}},
  surprised:{d:1.7,k:{sc:[[0,1],[.12,1.22,'out'],[1.2,1.18],[1.5,1,'io']], bl:[[0,0],[.12,-30,'out'],[1.2,-26],[1.5,0,'io']],
    hy:[[0,0],[.12,-26,'out'],[.32,0,'in']], es:[[0,1],[.12,1.16,'out'],[.45,1.05,'io'],[1.4,1,'io']],
    eb:[[0,1],[.12,1.08,'out'],[.45,1.03,'io'],[1.4,1,'io']], er:[[.1,0],[.2,-8],[.32,6],[.44,-3],[.56,0]],
    b:[[1.0,0],[1.07,1,'in'],[1.17,0,'out']]}},
  sleepy:{d:2.7,k:{b:[[0,0],[.5,.72,'io'],[1.0,.6],[1.4,.95,'io'],[1.6,.5,'out'],[2.2,.7],[2.55,0,'io']],
    fold:[[0,0],[.7,95,'io'],[2.2,95],[2.5,0,'io']], bl:hold(10,.6,2.2), hy:[[0,0],[1.35,9,'io'],[1.55,-5,'out'],[1.8,0,'io']],
    tilt:[[0,0],[1.35,-4,'io'],[1.6,0,'out']]}}
};
const FACES=['look','dogEar','smile','wink','blink','thinking','puzzled','work','surprised','sleepy'];
const MASTER=['hold','wake','look','thinking','dogEar','puzzled','smile','work','surprised','wink','sleepy','bye','hold','toSpin','spinLoop','spinLoop','fromSpin'];


/* ---------- Player: queues expression clips; each clip starts and ends neutral ---------- */
const evk=(a,t)=>{ if(t<=a[0][0])return a[0][1]; if(t>=a[a.length-1][0])return a[a.length-1][1];
  for(let i=0;i<a.length-1;i++){const p=a[i],q=a[i+1]; if(t<q[0]){const u=(t-p[0])/(q[0]-p[0]);return p[1]+(q[1]-p[1])*(E[q[2]||'s'])(u)}}};
class Player{
  constructor(held,queue,autoplay,blinks){this.held={...DEF,...held};this.cur=null;this.curName='';this.lt=0;
    this.queue=queue;this.autoplay=autoplay;this.loading=false;this.blinks=blinks;this.nextBlink=0;this.onChange=()=>{};}
  val(k){return (this.cur&&this.cur.k[k])?evk(this.cur.k[k],this.lt):this.held[k]}
  endVal(k){if(this.cur&&this.cur.k[k]){const a=this.cur.k[k];return a[a.length-1][1]}return this.held[k]}
  get spun(){return this.endVal('zs')>.5} get face(){return this.endVal('m')>.5}
  next(){
    if(!this.queue.length){ if(this.loading) this.queue.push('spinLoop'); else if(this.autoplay) this.queue.push(...MASTER); }
    this.curName=this.queue.shift()||''; this.cur=BEATS[this.curName]||null; this.onChange();
  }
  advance(dt,now){
    if(!this.cur) this.next();
    if(!this.cur){ if(this.blinks&&this.held.m>.99&&now>this.nextBlink){ if(this.nextBlink){this.queue.push('blink');this.next();}
      this.nextBlink=now+2500+Math.random()*3000; } return; }
    this.lt+=dt;
    while(this.cur&&this.lt>=this.cur.d){
      for(const k in this.cur.k){const a=this.cur.k[k];this.held[k]=a[a.length-1][1]}
      if(this.curName==='spinLoop') this.held.spin=90;
      this.held.orb%=360; this.lt-=this.cur.d; this.next(); if(!this.cur) this.lt=0; }
  }
  // play an expression from wherever we are (the current clip finishes first)
  play(target,after=[]){
    this.autoplay=false; const q=[];
    if(target==='loading'){ this.loading=true; if(this.face&&!this.spun)q.push('bye'); if(!this.spun)q.push('toSpin'); this.queue=q; this.onChange(); return; }
    this.loading=false;
    if(this.spun) q.push('fromSpin');
    if(target==='logo'){ if(this.face&&!this.spun) q.push('bye'); }
    else if(target==='wake'){ if(!this.face||this.spun) q.push('wake'); else q.push('blink'); }
    else { if(!this.face||this.spun) q.push('wake'); q.push(target); }
    this.queue=[...q,...after]; this.onChange();
  }
}

/* ---------- Instances: the same character, drawn at different levels of detail ---------- */
function makeInstance(svgEl,p,opts){
  svgEl.insertAdjacentHTML('beforeend',`<defs><clipPath id="${p}toe" clipPathUnits="userSpaceOnUse"><rect data-k="toeRect" x="-400" y="-700" width="1600" height="2000"/></clipPath></defs>
  <g data-k="char" ${opts.gid?`id="${opts.gid}"`:''}><g data-k="zoom"><g data-k="turn">
    <g data-k="head"><path data-k="band" class="ink"/>
      <g data-k="earBig"><path class="ink" clip-path="url(#${p}toe)"/></g><g data-k="earSmall"><path class="ink"/></g></g>
    <g data-k="eyes"><path data-k="eyeL" class="ink"/><path data-k="eyeR" class="ink"/>
      <g data-k="shine" class="shine" opacity="0"><circle data-k="sL1"/><circle data-k="sL2"/><circle data-k="sR1"/><circle data-k="sR2"/></g></g>
  </g></g></g>`);
  const el={}; svgEl.querySelectorAll('[data-k]').forEach(n=>el[n.dataset.k]=n);
  return {svg:svgEl, el, pl:opts.player, eyeK:opts.eyeK||1, shine:opts.shine!==false, interactive:!!opts.interactive,
    spr:{s:{x:0,v:0},b:{x:0,v:0}}, prevAng:null};
}
function stepSprings(I,ang,dt){
  if(I.prevAng===null||dt<=0){I.prevAng=ang;return}
  const vel=clamp((ang-I.prevAng)/dt,-120,120); I.prevAng=ang;
  for(const [k,g] of [['s',-.5],['b',-.22]]){const o=I.spr[k]; const a=-170*(o.x-g*vel)-9*o.v; o.v+=a*dt; o.x+=o.v*dt;}
}

/* ---------- Render one instance ---------- */
const f2=n=>n.toFixed(2);
const BAND_RC=(BAND.rin+BAND.rout)/2, BAND_MID=[473,C[1]-BAND_RC], ORBIT=[473,760];
const REST_BAND=poly(strip(BAND_MID,BAND_RC*Math.PI/2,BAND.rout-BAND.rin,1/BAND_RC,0,0));
let ptr={x:0,y:0,at:-1e9}, follow=0, boopAt=-1e9;
function render(I,now,dt){
  const pl=I.pl, val=k=>pl.val(k), el=I.el, set=(k,a,v)=>el[k].setAttribute(a,v);
  const m=val('m'), live=clamp((m-.6)/.4,0,1), clock=now/1000;
  let lookX=val('lx'), lookY=val('ly'), boop=0, boopHop=0, boopEar=0, pdx=0;
  if(I.interactive){
    const want=(now-ptr.at<2200&&live>.98&&!pl.cur)?1:0; follow+=(want-follow)*.08;
    pdx=clamp((ptr.x-473)/420,-1,1); const pdy=clamp((ptr.y-760)/380,-1,1);
    lookX=lerp(lookX,pdx,follow); lookY=lerp(lookY,pdy,follow); pdx*=follow;
    const bt=(now-boopAt)/1000; boop=bt<1.1?(bt<.12?E.out(bt/.12):bt<.7?1:1-E.io((bt-.7)/.4)):0;
    boopHop=bt<.36?-26*Math.sin(Math.PI*bt/.36):0; boopEar=bt<.8?Math.sin(bt*26)*12*(1-bt/.8):0;
  }
  // loader: pull back so the orbit around the shared center fits
  const zs=val('zs'), z=lerp(1,.42,zs), px=lerp(471,C[0],zs), py=lerp(445,C[1],zs);
  set('zoom','transform',`translate(471 445) scale(${z.toFixed(4)}) translate(${-px} ${-py})`);
  const turnA=val('turn')+pdx*3, tilt=val('tilt');
  stepSprings(I,turnA+tilt,dt);
  set('turn','transform',`rotate(${f2(val('spin')+turnA)} ${C})`);

  const idle=live*Math.sin(clock*2.3)*3;
  const h=Math.max(val('h'),boop*.9), b=val('b')*(1-boop);
  const sy=val('sy'), sx=1+(1-sy)*.8, hy=val('hy')+boopHop+idle;
  set('char','transform',`translate(0 ${f2(hy)}) rotate(${f2(tilt)} 473 700) translate(473 960) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(-473 -960)`);
  set('head','transform',`translate(0 ${f2(val('bl')-6*boop)}) rotate(${f2(val('btilt'))} 473 560)`);

  // brow: shrinks, orbits the face like the loader, comes round underneath as a smile
  const sm=val('sm'), su=1-Math.pow(1-sm,3), orb=val('orb');
  const sc_b=lerp(1,.38,su);
  const bulge=orb<=540?150*Math.sin(Math.PI*clamp(orb/540,0,1)):150*Math.sin(Math.PI*clamp((orb-540)/180,0,1));
  set('band','d',REST_BAND);
  set('band','transform',`rotate(${f2(orb)} ${ORBIT}) translate(0 ${f2(-bulge)}) translate(${BAND_MID}) scale(${sc_b.toFixed(4)}) translate(${-BAND_MID[0]} ${-BAND_MID[1]})`);

  // ears: slide in along their slant, bend from a fixed base, the small one can fold like a dog's
  const ein=val('earIn'), land=Math.max(0,ein-1), slide=(1-Math.min(ein,1))*720, sl=`translate(${f2(slide*.43)} ${f2(-slide*.9)})`;
  const vis=ein>0.001?1:0;
  const ear=(k,pts,yb,sk,st,fold,pre='')=>{const g=el[k]; g.style.opacity=vis; g.setAttribute('transform',`${sl} ${pre}`);
    g.firstElementChild.setAttribute('d',poly(bendEar(pts,yb,sk,st,fold)));};
  ear('earSmall',EARS.small,BASE.small,(val('er')+boopEar+I.spr.s.x+live*Math.sin(clock*1.7)*1.6)*.55,
      val('es')*(1-land*.9)+boop*.04, val('fold'), `rotate(${f2(val('flop'))} 447 424)`);
  ear('earBig',EARS.big,BASE.big,(val('el')-boopEar*.25+I.spr.b.x+live*Math.sin(clock*1.3+1)*.8)*.7,
      val('eb')*(1-land*.5)+boop*.02, 0);
  set('toeRect','height',f2(lerp(2000,BASE.big+700-6,su)));   // big ear stands on its own while the brow is away

  // eyes (bigger at small sizes so they still read)
  const R=EYE.r*I.eyeK*val('sc')*(1+.05*boop), ea=val('ea'), RL=R*(1+ea), RR=R*(1-ea*.8);
  const ox=lookX*EYE.r*.45, oy=lookY*EYE.r*.32+live*Math.sin(clock*2.3+.6)*1.2;
  const wink=val('wink'), sqL=val('sqL'), sqR=val('sqR'), ls=val('ls');
  const L=[EYE.L[0]+ox,EYE.L[1]+oy], Rr=[EYE.R[0]+ox,EYE.R[1]+oy];
  if(m<1){ set('eyeL','d',morphPath(-1,m,R,ox,oy)); set('eyeR','d',morphPath(1,m,R,ox,oy)); }
  else { set('eyeL','d',eyePath2(L[0],L[1],RL,b,h,sqL,ls,-1)); set('eyeR','d',eyePath2(Rr[0],Rr[1],RR,Math.max(b,wink),h,sqR,ls,1)); }
  if(I.shine){
    const open=m>=1?clamp(1-Math.max(b,clamp((h-.4)/.6,0,1))*1.6,0,1):0; set('shine','opacity',f2(open));
    const sh=(k,c,r_,sq,dx,dy,r)=>{set(k,'cx',c[0]+dx*r_+lookX*6);set(k,'cy',c[1]+dy*r_+lookY*5+sq*r_*.95);set(k,'r',r*r_*(1-sq*.35))};
    sh('sL1',L,RL,sqL,-.3,-.34,.21); sh('sL2',L,RL,0,.3,.3,.08); sh('sR1',Rr,RR,sqR,-.3,-.34,.21); sh('sR2',Rr,RR,0,.3,.3,.08);
    const rOpen=clamp(1-wink*2,0,1); set('sR1','opacity',rOpen); set('sR2','opacity',rOpen);
  }
}


/* ---------- mount ---------- */
const host=document.getElementById('leo');if(!host)return;
host.setAttribute('viewBox','-30 -40 1000 1010');
const pl=new Player({},[],false,true);               // starts as the logo, blinks when awake
const I=makeInstance(host,'leo_',{player:pl,eyeK:1.38,shine:false,interactive:true});
let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;pl.advance(dt,now);render(I,now,dt);requestAnimationFrame(frame)}
requestAnimationFrame(frame);
// pointer tracking in the logo's own space
function toSvg(e){const pt=host.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;return pt.matrixTransform(host.getScreenCTM().inverse())}
addEventListener('pointermove',e=>{const p=toSvg(e);ptr={x:p.x,y:p.y,at:performance.now()}});
// peek: wake, glance around, go back to being the logo
const PEEKS=['look','smile','wink','thinking','puzzled','dogEar','surprised'];
function peek(f){if(pl.cur)return;pl.play(f||PEEKS[Math.floor(Math.random()*PEEKS.length)],['bye'])}
host.addEventListener('pointerenter',()=>peek('look'));
host.addEventListener('pointerdown',e=>{e.preventDefault();if(!pl.face||pl.spun)pl.play('wake',['smile','bye']);else boopAt=performance.now()});
setTimeout(()=>peek('look'),1800);
setInterval(()=>{if(document.visibilityState==='visible'&&Math.random()<.6)peek()},14000);
/* bake: render the loader → logo settle as frames for the video outro */
async function bake(size,dark){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','-30 -40 1000 1010');svg.setAttribute('width',size);svg.setAttribute('height',size);svg.style.position='fixed';svg.style.left='-9999px';document.body.appendChild(svg);
  const p2=new Player({zs:1,earIn:0,spin:90},['spinLoop','fromSpinQ'],false,false);const inst=makeInstance(svg,'bake_',{player:p2,eyeK:1,shine:false});
  const frames=[];const fps=30,T=2.0;let now=0;
  for(let i=0;i<=T*fps;i++){p2.advance(1/fps,now);now+=1000/fps;render(inst,now,1/fps);
    const s=new XMLSerializer().serializeToString(svg).replace(/class="ink"/g,`fill="${dark?'#fff':'#111'}"`).replace(/ style="[^"]*"/,'');
    const im=new Image();await new Promise(r=>{im.onload=r;im.onerror=r;im.src='data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(s)))});frames.push(im)}
  svg.remove();return frames}
window.leo={peek,work:()=>pl.play('loading'),rest:()=>pl.play('logo'),player:pl,bake};
})();
