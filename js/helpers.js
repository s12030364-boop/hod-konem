var LT={k:'Кр',q:'Ф',r:'Л',b:'С',n:'К'};
function sqn(i){return 'abcdefgh'[i&7]+(8-(i>>3))}
function san(s,m){
  var p=s.b[m.f].toLowerCase(),cap=s.b[m.t]||m.ep,r,n=make(s,m),suf='';
  if(inCheck(n))suf=legal(n).length?'+':'#';
  if(p==='k'&&Math.abs(m.t-m.f)===2)return (m.t>m.f?'O-O':'O-O-O')+suf;
  if(p==='p')return (cap?sqn(m.f)[0]+'x':'')+sqn(m.t)+(m.p?'='+LT[m.p]:'')+suf;
  var o=legal(s).filter(function(x){return x.f!==m.f&&x.t===m.t&&s.b[x.f]===s.b[m.f]}),d='';
  if(o.length){
    if(!o.some(function(x){return (x.f&7)===(m.f&7)}))d=sqn(m.f)[0];
    else if(!o.some(function(x){return (x.f>>3)===(m.f>>3)}))d=sqn(m.f)[1];
    else d=sqn(m.f);
  }
  return LT[p]+d+(cap?'x':'')+sqn(m.t)+suf;
}
function fen(s){
  var o='',r,c,e,p;
  for(r=0;r<8;r++){e=0;for(c=0;c<8;c++){p=s.b[r*8+c];if(p){if(e){o+=e;e=0}o+=p}else e++}if(e)o+=e;if(r<7)o+='/'}
  var cs=(s.c.K?'K':'')+(s.c.Q?'Q':'')+(s.c.k?'k':'')+(s.c.q?'q':'');
  return o+' '+s.t+' '+(cs||'-')+' '+(s.ep>=0?sqn(s.ep):'-')+' 0 1';
}
function analyse(s,d){
  var ms=order(s,legal(s)),best=null,bv=-1e9,i,v;
  for(i=0;i<ms.length;i++){v=-search(make(s,ms[i]),d-1,-1e9,-bv);if(v>bv){bv=v;best=ms[i]}}
  return {m:best,v:bv};
}
