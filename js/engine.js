function newGame(){
  var s='rnbqkbnrpppppppp'+'                                '+'PPPPPPPPRNBQKBNR';
  return {b:s.split('').map(function(c){return c===' '?null:c}),t:'w',c:{K:1,Q:1,k:1,q:1},ep:-1};
}
function colOf(p){return p?(p===p.toUpperCase()?'w':'b'):null}
var ND=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
var KD=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
var RD=[[-1,0],[1,0],[0,-1],[0,1]], BD=[[-1,-1],[-1,1],[1,-1],[1,1]];
function attacked(b,sq,by){
  var r=sq>>3,c=sq&7,i,j,rr,cc,p,w=by==='w';
  var pr=w?r+1:r-1;
  if(pr>=0&&pr<8){
    if(c>0&&b[pr*8+c-1]===(w?'P':'p'))return true;
    if(c<7&&b[pr*8+c+1]===(w?'P':'p'))return true;
  }
  for(i=0;i<8;i++){
    rr=r+ND[i][0];cc=c+ND[i][1];
    if(rr>=0&&rr<8&&cc>=0&&cc<8&&b[rr*8+cc]===(w?'N':'n'))return true;
    rr=r+KD[i][0];cc=c+KD[i][1];
    if(rr>=0&&rr<8&&cc>=0&&cc<8&&b[rr*8+cc]===(w?'K':'k'))return true;
  }
  for(j=0;j<2;j++){
    var D=j?BD:RD,a=w?(j?'B':'R'):(j?'b':'r'),q=w?'Q':'q';
    for(i=0;i<4;i++){
      rr=r+D[i][0];cc=c+D[i][1];
      while(rr>=0&&rr<8&&cc>=0&&cc<8){
        p=b[rr*8+cc];
        if(p){if(p===a||p===q)return true;break}
        rr+=D[i][0];cc+=D[i][1];
      }
    }
  }
  return false;
}
function gen(s){
  var b=s.b,w=s.t==='w',m=[],sq,p,r,c,i,rr,cc,t,k,D;
  for(sq=0;sq<64;sq++){
    p=b[sq]; if(!p||colOf(p)!==s.t)continue;
    r=sq>>3;c=sq&7;k=p.toLowerCase();
    if(k==='p'){
      var d=w?-1:1,st=w?6:1,pm=w?0:7;rr=r+d;
      if(rr<0||rr>7)continue;
      var add=function(f,to,ep){
        if((to>>3)===pm){['q','r','b','n'].forEach(function(x){m.push({f:f,t:to,p:x})})}
        else m.push(ep?{f:f,t:to,ep:1}:{f:f,t:to});
      };
      if(!b[rr*8+c]){
        add(sq,rr*8+c);
        if(r===st&&!b[(r+2*d)*8+c])m.push({f:sq,t:(r+2*d)*8+c});
      }
      for(i=-1;i<=1;i+=2){
        cc=c+i;if(cc<0||cc>7)continue;t=rr*8+cc;
        if(b[t]&&colOf(b[t])!==s.t)add(sq,t);
        else if(t===s.ep&&!b[t])add(sq,t,1);
      }
    } else if(k==='n'||k==='k'){
      D=k==='n'?ND:KD;
      for(i=0;i<8;i++){
        rr=r+D[i][0];cc=c+D[i][1];
        if(rr<0||rr>7||cc<0||cc>7)continue;t=rr*8+cc;
        if(colOf(b[t])!==s.t)m.push({f:sq,t:t});
      }
      if(k==='k'){
        var o=w?'b':'w',h=w?60:4;
        if(sq===h&&!attacked(b,h,o)){
          if(s.c[w?'K':'k']&&!b[h+1]&&!b[h+2]&&b[h+3]===(w?'R':'r')&&!attacked(b,h+1,o)&&!attacked(b,h+2,o))m.push({f:h,t:h+2});
          if(s.c[w?'Q':'q']&&!b[h-1]&&!b[h-2]&&!b[h-3]&&b[h-4]===(w?'R':'r')&&!attacked(b,h-1,o)&&!attacked(b,h-2,o))m.push({f:h,t:h-2});
        }
      }
    } else {
      var Ds=k==='r'?[RD]:k==='b'?[BD]:[RD,BD];
      for(var j=0;j<Ds.length;j++)for(i=0;i<4;i++){
        rr=r+Ds[j][i][0];cc=c+Ds[j][i][1];
        while(rr>=0&&rr<8&&cc>=0&&cc<8){
          t=rr*8+cc;
          if(!b[t])m.push({f:sq,t:t});
          else{if(colOf(b[t])!==s.t)m.push({f:sq,t:t});break}
          rr+=Ds[j][i][0];cc+=Ds[j][i][1];
        }
      }
    }
  }
  return m;
}
function make(s,m){
  var b=s.b.slice(),p=b[m.f],w=s.t==='w',k=p.toLowerCase();
  var c={K:s.c.K,Q:s.c.Q,k:s.c.k,q:s.c.q},ep=-1;
  b[m.t]=m.p?(w?m.p.toUpperCase():m.p):p;b[m.f]=null;
  if(m.ep)b[m.t+(w?8:-8)]=null;
  if(k==='k'&&Math.abs(m.t-m.f)===2){
    if(m.t>m.f){b[m.t-1]=b[m.t+1];b[m.t+1]=null}
    else{b[m.t+1]=b[m.t-2];b[m.t-2]=null}
  }
  if(k==='p'&&Math.abs(m.t-m.f)===16)ep=(m.f+m.t)/2;
  [m.f,m.t].forEach(function(x){
    if(x===60){c.K=0;c.Q=0}if(x===4){c.k=0;c.q=0}
    if(x===63)c.K=0;if(x===56)c.Q=0;if(x===7)c.k=0;if(x===0)c.q=0;
  });
  return {b:b,t:w?'b':'w',c:c,ep:ep};
}
function kingSq(b,col){return b.indexOf(col==='w'?'K':'k')}
function inCheck(s){return attacked(s.b,kingSq(s.b,s.t),s.t==='w'?'b':'w')}
function isLegal(s,m){var n=make(s,m);return !attacked(n.b,kingSq(n.b,s.t),n.t)}
function legal(s){return gen(s).filter(function(m){return isLegal(s,m)})}
var VAL={p:100,n:320,b:330,r:500,q:900,k:0};
function evalB(b){
  var sc=0,i,p,k,r,c,v,w,cd;
  for(i=0;i<64;i++){
    p=b[i];if(!p)continue;k=p.toLowerCase();w=p!==k;r=i>>3;c=i&7;
    cd=Math.max(Math.abs(r-3.5),Math.abs(c-3.5));
    v=VAL[k];
    if(k==='p')v+=(w?6-r:r-1)*6+(c>1&&c<6?(3.5-cd)*6:0);
    else if(k==='n'||k==='b')v+=(3.5-cd)*10;
    else if(k==='q')v+=(3.5-cd)*2;
    else if(k==='k')v+=(cd-3.5)*-12*0+((w?r===7:r===0)?(c<3||c>5?25:0):-20);
    sc+=w?v:-v;
  }
  return sc;
}
function order(s,ms){
  ms.forEach(function(m){var v=s.b[m.t];m.o=(v?VAL[v.toLowerCase()]*10-VAL[s.b[m.f].toLowerCase()]:0)+(m.p?800:0)});
  ms.sort(function(a,b){return b.o-a.o});return ms;
}
function quies(s,a,be,d){
  var sp=evalB(s.b)*(s.t==='w'?1:-1);
  if(sp>=be)return be;if(sp>a)a=sp;if(d===0)return a;
  var ms=order(s,gen(s).filter(function(m){return s.b[m.t]||m.p||m.ep})),i,n,v;
  for(i=0;i<ms.length;i++){
    if(!isLegal(s,ms[i]))continue;
    n=make(s,ms[i]);v=-quies(n,-be,-a,d-1);
    if(v>=be)return be;if(v>a)a=v;
  }
  return a;
}
function search(s,d,a,be){
  if(d===0)return quies(s,a,be,4);
  var ms=order(s,gen(s)),i,n,v,any=false;
  for(i=0;i<ms.length;i++){
    if(!isLegal(s,ms[i]))continue;any=true;
    n=make(s,ms[i]);v=-search(n,d-1,-be,-a);
    if(v>=be)return be;if(v>a)a=v;
  }
  if(!any)return inCheck(s)?-100000-d:0;
  return a;
}
function bestMove(s,depth){
  var ms=order(s,legal(s)),best=null,bv=-1e9,i,v;
  for(i=0;i<ms.length;i++){
    v=-search(make(s,ms[i]),depth-1,-1e9,-(bv-15))+Math.random()*10;
    if(v>bv){bv=v;best=ms[i]}
  }
  return best;
}
if(typeof module!=='undefined')module.exports={newGame:newGame,legal:legal,make:make,bestMove:bestMove,inCheck:inCheck};
