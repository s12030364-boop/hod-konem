var PST={
p:[0,0,0,0,0,0,0,0,50,50,50,50,50,50,50,50,10,10,20,30,30,20,10,10,5,5,10,25,25,10,5,5,0,0,0,20,20,0,0,0,5,-5,-10,0,0,-10,-5,5,5,10,10,-20,-20,10,10,5,0,0,0,0,0,0,0,0],
n:[-50,-40,-30,-30,-30,-30,-40,-50,-40,-20,0,0,0,0,-20,-40,-30,0,10,15,15,10,0,-30,-30,5,15,20,20,15,5,-30,-30,0,15,20,20,15,0,-30,-30,5,10,15,15,10,5,-30,-40,-20,0,5,5,0,-20,-40,-50,-40,-30,-30,-30,-30,-40,-50],
b:[-20,-10,-10,-10,-10,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,10,10,5,0,-10,-10,5,5,10,10,5,5,-10,-10,0,10,10,10,10,0,-10,-10,10,10,10,10,10,10,-10,-10,5,0,0,0,0,5,-10,-20,-10,-10,-10,-10,-10,-10,-20],
r:[0,0,0,0,0,0,0,0,5,10,10,10,10,10,10,5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,0,0,0,5,5,0,0,0],
q:[-20,-10,-10,-5,-5,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,5,5,5,0,-10,-5,0,5,5,5,5,0,-5,0,0,5,5,5,5,0,-5,-10,5,5,5,5,5,0,-10,-10,0,5,0,0,0,0,-10,-20,-10,-10,-5,-5,-10,-10,-20],
k:[-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-20,-30,-30,-40,-40,-30,-30,-20,-10,-20,-20,-20,-20,-20,-20,-10,20,20,0,0,0,0,20,20,20,30,10,0,0,10,30,20],
e:[-50,-40,-30,-20,-20,-30,-40,-50,-30,-20,-10,0,0,-10,-20,-30,-30,-10,20,30,30,20,-10,-30,-30,-10,30,40,40,30,-10,-30,-30,-10,30,40,40,30,-10,-30,-30,-10,20,30,30,20,-10,-30,-30,-30,0,0,0,0,-30,-30,-50,-30,-30,-30,-30,-30,-30,-50]};
function evalB(b){
  var i,p,k,w,mw=0,mb=0,sc=0,bw=0,bb=0,kw=-1,kb=-1;
  for(i=0;i<64;i++){p=b[i];if(!p)continue;k=p.toLowerCase();w=p!==k;
    if(k==='k'){if(w)kw=i;else kb=i;continue}
    if(k!=='p'){if(w)mw+=VAL[k];else mb+=VAL[k]}
    if(k==='b'){if(w)bw++;else bb++}
    sc+=w?VAL[k]+PST[k][i]:-(VAL[k]+PST[k][i^56])}
  var end=mw+mb<=1700,kt=end?PST.e:PST.k;
  if(kw>=0)sc+=kt[kw];if(kb>=0)sc-=kt[kb^56];
  if(bw>=2)sc+=30;if(bb>=2)sc-=30;
  if(end&&kw>=0&&kb>=0&&Math.abs(sc)>=400){
    var lk=sc>0?kb:kw,r=lk>>3,c=lk&7,cd=Math.max(Math.abs(r-3.5),Math.abs(c-3.5)),
        dist=Math.abs((kw>>3)-(kb>>3))+Math.abs((kw&7)-(kb&7)),bonus=cd*12+(14-dist)*5;
    sc+=sc>0?bonus:-bonus}
  return sc}
var NODES=0,DEADLINE=0,STOP=false,KILL=[];
function tick(){if(((++NODES)&1023)===0&&Date.now()>DEADLINE)STOP=true}
function order2(s,ms,ply){var k=KILL[ply]||[],i,m,v,code;
  for(i=0;i<ms.length;i++){m=ms[i];v=s.b[m.t];code=m.f*64+m.t;
    m.o=v?10000+VAL[v.toLowerCase()]*10-VAL[s.b[m.f].toLowerCase()]:m.p?9000:m.ep?10900:(code===k[0]?5000:code===k[1]?4900:0)}
  ms.sort(function(a,b){return b.o-a.o});return ms}
function qs(s,a,be,d){tick();if(STOP)return 0;
  var sp=evalB(s.b)*(s.t==='w'?1:-1);if(sp>=be)return sp;if(sp>a)a=sp;if(d===0)return sp;
  var best=sp,ms=order2(s,gen(s).filter(function(m){return s.b[m.t]||m.p||m.ep}),63),i,v;
  for(i=0;i<ms.length;i++){if(!isLegal(s,ms[i]))continue;v=-qs(make(s,ms[i]),-be,-a,d-1);if(STOP)return 0;
    if(v>best){best=v;if(v>a)a=v;if(a>=be)break}}
  return best}
function hasPieces(s){var w=s.t==='w',i,p;for(i=0;i<64;i++){p=s.b[i];if(p&&(p===p.toUpperCase())===w&&p.toLowerCase()!=='p'&&p.toLowerCase()!=='k')return true}return false}
function ab(s,d,a,be,ply,nullOk){
  if(STOP)return 0;
  var chk=inCheck(s);if(chk&&ply<24)d++;
  if(d<=0)return qs(s,a,be,6);
  tick();var v;
  if(nullOk&&!chk&&d>=3&&be<50000&&hasPieces(s)){
    v=-ab({b:s.b,t:s.t==='w'?'b':'w',c:s.c,ep:-1},d-3,-be,-be+1,ply+1,false);if(STOP)return 0;if(v>=be)return be}
  var ms=order2(s,gen(s),ply),best=-1e9,any=false,i,m;
  for(i=0;i<ms.length;i++){m=ms[i];if(!isLegal(s,m))continue;any=true;
    v=-ab(make(s,m),d-1,-be,-a,ply+1,true);if(STOP)return 0;
    if(v>best){best=v;if(v>a)a=v;
      if(a>=be){if(!s.b[m.t]){var k=KILL[ply]||(KILL[ply]=[]),code=m.f*64+m.t;if(k[0]!==code){k[1]=k[0];k[0]=code}}break}}}
  if(!any)return chk?-100000+ply:0;
  return best}
function think(s,ms,maxD){
  NODES=0;STOP=false;DEADLINE=Date.now()+ms;KILL=[];
  var moves=order2(s,legal(s),0),best=null,bv=0,dd=0,d,i,a,cb,cv,v,t0=Date.now();
  if(!moves.length)return {m:null,v:inCheck(s)?-100000:0,d:0};
  best=moves[0];
  for(d=1;d<=maxD;d++){a=-1e9;cb=null;cv=-1e9;
    for(i=0;i<moves.length;i++){v=-ab(make(s,moves[i]),d-1,-1e9,-a,1,true);if(STOP)break;if(v>cv){cv=v;cb=moves[i]}if(v>a)a=v}
    if(cb&&(!STOP||d>1)){best=cb;bv=cv;if(!STOP)dd=d;moves.splice(moves.indexOf(cb),1);moves.unshift(cb)}
    if(STOP||Math.abs(bv)>50000||Date.now()-t0>ms*0.55)break}
  if(!dd)dd=1;
  return {m:best,v:bv,d:dd}}
function scoreAll(s,d){
  NODES=0;STOP=false;DEADLINE=Date.now()+4000;KILL=[];
  return legal(s).map(function(m){return {m:m,v:-ab(make(s,m),d-1,-1e9,1e9,1,true)}})}
function childVal(s,mv,d,ms){
  STOP=false;DEADLINE=Date.now()+ms;var n=make(s,mv),val=null,k,v;
  for(k=0;k<d;k++){v=-ab(n,k,-1e9,1e9,1,true);if(STOP)break;val=v}
  if(val===null){STOP=false;DEADLINE=Date.now()+2000;val=-qs(n,-1e9,1e9,6)}
  return val}
