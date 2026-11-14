(function(){
var $=function(id){return document.getElementById(id)};
function pc(k,c){return '<svg class="pc '+c+'" viewBox="0 0 45 45" aria-hidden="true"><use href="#p'+k+'"/></svg>'}
function glyph(p){return pc(p.toLowerCase(),colOf(p))}
function sq(n){return (8-(+n[1]))*8+(n.charCodeAt(0)-97)}
function parseFen(f){var p=f.split(' '),b=[],i,k,ch;
  for(i=0;i<p[0].length;i++){ch=p[0][i];if(ch==='/')continue;if(ch>='1'&&ch<='8'){for(k=0;k<+ch;k++)b.push(null)}else b.push(ch)}
  var c={K:0,Q:0,k:0,q:0};if(p[2]&&p[2]!=='-')for(i=0;i<p[2].length;i++)c[p[2][i]]=1;
  var ep=-1;if(p[3]&&p[3]!=='-')ep=sq(p[3]);
  return {b:b,t:p[1]||'w',c:c,ep:ep}}
function paint(el,st,o){o=o||{};var h='',v,i,p,cls,x,tg=o.tg||{},mk=o.mk||{};
  var chk=(st.b.indexOf('K')>=0&&st.b.indexOf('k')>=0&&inCheck(st))?kingSq(st.b,st.t):-1;
  for(v=0;v<64;v++){i=o.flip?63-v:v;p=st.b[i];cls='sq '+(((i>>3)+(i&7))%2?'d':'l');
    if(o.last&&(i===o.last.f||i===o.last.t))cls+=' lm';
    if(mk[i])cls+=' mk';
    if(o.hint&&(i===o.hint.f||i===o.hint.t))cls+=' hn';
    if(i===chk)cls+=' ck';if(i===o.sel)cls+=' sl';
    if(p)cls+=' '+colOf(p);if(p&&o.grab===colOf(p))cls+=' gr';if(tg[i])cls+=p?' cp':' tg';
    x='';if(o.bdg&&o.bdg.i===i)x+='<em class="'+o.bdg.k+'">'+o.bdg.s+'</em>';
    if(v%8===0)x+='<i class="rk">'+(8-(i>>3))+'</i>';if(v>=56)x+='<i class="fl">'+'abcdefgh'[i&7]+'</i>';
    h+='<div class="'+cls+'" data-i="'+i+'">'+(p?'<b>'+glyph(p)+'</b>':'')+x+'</div>'}
  el.innerHTML=h}
function mark(el,i,tg){[].forEach.call(el.children,function(c){var k=+c.getAttribute('data-i');c.classList.remove('sl','tg','cp');
  if(k===i)c.classList.add('sl');if(tg[k])c.classList.add(c.querySelector('b')?'cp':'tg')})}
function sqOf(e){var el=e.target.closest?e.target.closest('[data-i]'):null;return el?+el.getAttribute('data-i'):-1}
function targets(ms,f){var t={};ms.forEach(function(m){if(m.f===f)t[m.t]=1});return t}
function dragify(el,can,pick,drop,tap,oth){var d=null,tsq=-1,lastTouch=0;el.classList.add('lock');
  function sqEl(e){return e.target&&e.target.closest?e.target.closest('[data-i]'):null}
  function under(){var y=d.y-(d.touch?d.sz*0.6:0),t=document.elementFromPoint(d.x,y),s=t&&t.closest?t.closest('[data-i]'):null;return s&&el.contains(s)?s:null}
  function place(){d.g.style.left=d.x+'px';d.g.style.top=(d.y-(d.touch?d.sz*0.6:0))+'px';
    var s=d.mv?under():null;if(s!==d.ov){if(d.ov)d.ov.classList.remove('ov');if(s)s.classList.add('ov');d.ov=s}}
  function begin(i,src,x,y,touch,tid){var pb=src.querySelector('b');if(!pb)return;
    var was=pick(i),sz=el.getBoundingClientRect().width/8,g=document.createElement('div');
    g.className='ghost '+(src.classList.contains('w')?'w':'b');g.innerHTML='<b>'+pb.innerHTML+'</b>';g.style.fontSize=(sz*0.8)+'px';document.body.appendChild(g);
    d={i:i,g:g,was:was,x0:x,y0:y,x:x,y:y,mv:false,touch:touch,tid:tid,sz:sz,src:src,ov:null};
    src.classList.add('drg');if(touch)document.documentElement.classList.add('dragging');place()}
  function moveTo(x,y){d.x=x;d.y=y;if(Math.abs(x-d.x0)+Math.abs(y-d.y0)>6)d.mv=true;place()}
  function finish(){var D=d,s=D.mv?under():null,to=s?+s.getAttribute('data-i'):-1;d=null;
    D.g.remove();D.src.classList.remove('drg');if(D.ov)D.ov.classList.remove('ov');document.documentElement.classList.remove('dragging');
    if(to>=0&&to!==D.i)drop(D.i,to);else tap(D.i,D.was,D.mv)}
  function findT(e){for(var k=0;k<e.changedTouches.length;k++)if(e.changedTouches[k].identifier===d.tid)return e.changedTouches[k];return null}
  el.addEventListener('touchstart',function(e){lastTouch=Date.now();if(e.cancelable)e.preventDefault();if(d||e.touches.length>1)return;
    var t=e.changedTouches[0],s=sqEl(e);if(!s)return;var i=+s.getAttribute('data-i');
    if(can(i)){tsq=-1;begin(i,s,t.clientX,t.clientY,true,t.identifier)}else tsq=i},{passive:false});
  document.addEventListener('touchmove',function(e){if(!d||!d.touch)return;if(e.cancelable)e.preventDefault();var t=findT(e);if(t)moveTo(t.clientX,t.clientY)},{passive:false});
  function tend(e){lastTouch=Date.now();
    if(d&&d.touch){var t=findT(e);if(!t)return;if(e.type==='touchend')moveTo(t.clientX,t.clientY);if(e.cancelable)e.preventDefault();finish();return}
    if(tsq>=0){var i=tsq;tsq=-1;if(e.type!=='touchend')return;var t2=e.changedTouches[0],s=document.elementFromPoint(t2.clientX,t2.clientY),q=s&&s.closest?s.closest('[data-i]'):null;
      if(q&&el.contains(q)&&+q.getAttribute('data-i')===i){if(e.cancelable)e.preventDefault();oth(i)}}}
  document.addEventListener('touchend',tend,{passive:false});document.addEventListener('touchcancel',tend,{passive:false});
  el.addEventListener('mousedown',function(e){if(e.button||d||Date.now()-lastTouch<800)return;var s=sqEl(e);if(!s)return;var i=+s.getAttribute('data-i');if(!can(i))return;e.preventDefault();begin(i,s,e.clientX,e.clientY,false,null)});
  document.addEventListener('mousemove',function(e){if(d&&!d.touch)moveTo(e.clientX,e.clientY)});
  document.addEventListener('mouseup',function(e){if(d&&!d.touch){moveTo(e.clientX,e.clientY);finish()}});
  el.addEventListener('click',function(e){if(Date.now()-lastTouch<800)return;var s=sqEl(e);if(!s)return;var i=+s.getAttribute('data-i');if(!can(i))oth(i)});
  el.addEventListener('contextmenu',function(e){e.preventDefault()})}

var store={stats:{w:0,l:0,d:0},solved:{},read:{},game:null,set:{lv:2,col:'w',tc:0,board:'sky',mode:'bot'},rating:800,arch:[],v2:1};
try{var raw=JSON.parse(localStorage.getItem('hodkonem1'));if(raw){var old=!raw.v2,mp=[0,2,3];for(var k in raw)store[k]=raw[k];
  if(old){store.v2=1;store.set.lv=mp[store.set.lv]===undefined?2:mp[store.set.lv];(store.arch||[]).forEach(function(a){a.lv=mp[a.lv]||0});store.game=null}}}catch(e){}
if(store.set.tc===undefined)store.set.tc=0;if(!store.set.board)store.set.board='sky';if(!store.set.mode||store.set.mode==='net')store.set.mode='bot';if(!store.rating)store.rating=800;if(!store.arch)store.arch=[];
document.documentElement.setAttribute('data-board',store.set.board);
function save(){try{if(Gm&&Gm.mode!=='net'&&!busy)store.game=Gm;localStorage.setItem('hodkonem1',JSON.stringify(store))}catch(e){}}

var BOT=[{r:400,d:1,z:260,rnd:0.25},{r:700,d:1,z:110,rnd:0.08},{r:1000,d:2,z:60},{r:1300,d:3,z:25},{r:1600,d:4,ms:500},{r:1900,d:9,ms:1000}];
if(!(store.set.lv>=0&&store.set.lv<BOT.length))store.set.lv=2;
var ACC={p:'пешку',n:'коня',b:'слона',r:'ладью',q:'ферзя'};
var Gm=null,H=[],sel=-1,hint=null,busy=false,promo=null;
var NR=null,netOff=[];
function posKey(s){return fen(s).slice(0,-4)}
function uci(m){return sqn(m.f)+sqn(m.t)+(m.p||'')}
function other(c){return c==='w'?'b':'w'}
function cname(c,cap){return c==='w'?(cap?'Белые':'белые'):(cap?'Чёрные':'чёрные')}
function view(){return Gm.mode==='two'?Gm.S.t:(Gm.me||'w')}
function mySide(){return Gm.mode==='two'?Gm.S.t:Gm.me}
function canPlay(){if(busy||Gm.over||promo)return false;if(Gm.mode==='two')return true;return !!Gm.me&&Gm.S.t===Gm.me}
function botMove(s,L){var ls=legal(s);if(!ls.length)return null;
  if(L.rnd&&Math.random()<L.rnd)return ls[Math.floor(Math.random()*ls.length)];
  if(L.z){var best=null,bv=-1e9;scoreAll(s,L.d).forEach(function(x){var v=x.v+Math.random()*L.z;if(v>bv){bv=v;best=x.m}});return best}
  return think(s,L.ms,L.d).m}
function why(s,m){var p=s.b[m.f].toLowerCase(),cap=s.b[m.t],r=m.f>>3,c=m.t&7,tr=m.t>>3;
  if(p==='k'&&Math.abs(m.t-m.f)===2)return 'Рокировка: король в укрытии, ладья входит в игру.';
  if(m.p)return 'Пешка дошла до края доски и превратилась.';
  if(cap)return 'Взятие: '+ACC[cap.toLowerCase()]+' на '+sqn(m.t)+'.';
  if(m.ep)return 'Взятие пешки на проходе.';
  if((p==='n'||p==='b')&&(r===0||r===7))return 'Развитие: фигура выходит с последней линии.';
  if(p==='p'&&c>=3&&c<=4&&tr>=3&&tr<=4)return 'Пешка занимает центр.';
  if(p==='p'&&c>=2&&c<=5)return 'Пешка поддерживает центр.';
  return ''}
function rate(d){if(d<10)return ['лучший ход','good','★','best'];if(d<40)return ['отличный ход','good','!','exc'];if(d<90)return ['хороший ход','good','👍','ok'];if(d<200)return ['неточность','warn','?!','inac'];if(d<400)return ['ошибка','bad','?','mist'];return ['зевок','bad','??','blun']}
function newG(mode,col,lv){
  var tc=mode==='bot'?store.set.tc:0;
  Gm={mode:mode,S:newGame(),me:col,lv:lv,tc:tc,tm:tc*1000,MV:[],UCI:[],RT:[],POS:[],hm:0,last:null,over:null,settled:false,evw:0,best:null,bdg:null,lab:'Партия началась',labc:'tip',ai:'',
    co:mode==='two'?'Игра вдвоём на одном устройстве. Первыми ходят белые. После хода доска поворачивается к сопернику.':mode==='net'?'':col==='w'?'Вы играете белыми против бота '+BOT[lv].r+'. Начните с центра: пешки на e4 или d4 открывают дорогу слону и ферзю.':'Вы играете чёрными против бота '+BOT[lv].r+'. На ход в центр ответьте своим: e5 или d5.'};
  Gm.POS.push(posKey(Gm.S));H=[];sel=-1;hint=null;promo=null;busy=false;
  if(mode==='bot'&&col==='b'){busy=true;renderPlay();setTimeout(engineStep,60)}else{renderPlay();save()}}
function insufficient(b){var a=[];b.forEach(function(p){if(p&&p.toLowerCase()!=='k')a.push(p.toLowerCase())});return a.length===0||(a.length===1&&(a[0]==='n'||a[0]==='b'))}
function finish(o){if(!Gm.over)Gm.over=o}
function mateOver(wc){
  if(Gm.mode==='two')return {t:'Мат. Победили '+cname(wc),wc:wc};
  if(Gm.mode==='net')return {t:wc===Gm.me?'Мат. Вы победили':'Мат. Победил соперник',wc:wc};
  return wc===Gm.me?{t:'Мат. Вы победили',r:'w',wc:wc}:{t:'Мат. Победил бот',r:'l',wc:wc}}
function checkOver(){var S=Gm.S,ls=legal(S),n=0,k=Gm.POS[Gm.POS.length-1];
  Gm.POS.forEach(function(x){if(x===k)n++});
  if(!ls.length)finish(inCheck(S)?mateOver(other(S.t)):{t:'Пат. Ничья',r:'d',wc:null});
  else if(n>=3)finish({t:'Ничья: позиция повторилась трижды',r:'d',wc:null});
  else if(Gm.hm>=100)finish({t:'Ничья по правилу 50 ходов',r:'d',wc:null});
  else if(insufficient(S.b))finish({t:'Ничья: фигур не хватает для мата',r:'d',wc:null})}
function settle(){if(!Gm.over||Gm.settled)return;Gm.settled=true;if(Gm.mode!=='bot')return;
  var o=Gm.over;store.stats[o.r]++;
  var sc=o.r==='w'?1:o.r==='d'?0.5:0,ex=1/(1+Math.pow(10,(BOT[Gm.lv].r-store.rating)/400)),dr=Math.round(32*(sc-ex));
  store.rating=Math.max(100,store.rating+dr);Gm.dr=dr;
  var n=Gm.RT.length,acc=0;Gm.RT.forEach(function(r){acc+=Math.max(0,100-r.d/5)});
  store.arch.unshift({r:o.r,lv:Gm.lv,n:Math.ceil(Gm.MV.length/2),a:n?Math.round(acc/n):0,dr:dr,d:new Date().toLocaleDateString('ru-RU',{day:'numeric',month:'short'})});
  store.arch=store.arch.slice(0,10)}
function applyMove(m){var p=Gm.S.b[m.f].toLowerCase(),cap=Gm.S.b[m.t]||m.ep;
  Gm.MV.push(san(Gm.S,m));Gm.UCI.push(uci(m));Gm.S=make(Gm.S,m);Gm.last={f:m.f,t:m.t};Gm.hm=(p==='p'||cap)?0:Gm.hm+1;Gm.POS.push(posKey(Gm.S));Gm.best=null;checkOver()}
function evalLater(){var ref=Gm.S;setTimeout(function(){if(Gm.S!==ref||Gm.over||busy||Gm.mode==='net')return;
  var a=think(Gm.S,250,8);Gm.evw=a.v*(Gm.S.t==='w'?1:-1);Gm.best=a.m?{f:a.m.f,t:a.m.t,p:a.m.p||''}:null;evalUI();save()},40)}
function engineStep(){var S=Gm.S,m=botMove(S,BOT[Gm.lv]),pre=Gm.co;
  if(m){var sn=san(S,m),w=why(S,m);applyMove(m);
    Gm.co=(pre?pre+' ':'')+'Бот сыграл '+sn+'. '+w+(!Gm.over&&inCheck(Gm.S)?' Вам шах: уйдите королём, закройтесь или возьмите атакующую фигуру.':'')}
  busy=false;renderPlay();save();if(!Gm.over)evalLater()}
function userMove(mv){var S0=Gm.S,idx=Gm.MV.length;
  if(Gm.mode==='bot')H.push(JSON.stringify(Gm));
  applyMove(mv);sel=-1;hint=null;Gm.ai='';Gm.bdg=null;
  if(Gm.mode==='two'){Gm.lab=Gm.MV[idx];Gm.labc='tip';Gm.co=Gm.over?'Партия окончена.':'Ход сделан. Теперь ходят '+cname(Gm.S.t)+': передайте устройство.';renderPlay();save();if(!Gm.over)evalLater();return}
  if(Gm.mode==='net'){Gm.lab=Gm.MV[idx];Gm.labc='tip';Gm.co=Gm.over?'Партия окончена.':'Ход отправлен. Ждём ответа соперника.';if(NR)NR.presence({m:Gm.UCI.join(' ')}).catch(function(){});renderPlay();return}
  busy=true;Gm.lab=Gm.MV[idx];Gm.labc='tip';Gm.co='Оцениваю ваш ход…';renderPlay();
  setTimeout(function(){
    var a=think(S0,350,8),same=a.m&&a.m.f===mv.f&&a.m.t===mv.t&&(a.m.p||'')===(mv.p||''),pv=same?a.v:childVal(S0,mv,a.d,300),d=Math.max(0,a.v-pv),r=rate(d),pre,alt='';
    if(r[3]==='best'&&!same)r=['отличный ход','good','!','exc'];
    var pc=S0.b[mv.f].toLowerCase(),cp=S0.b[mv.t],n1=make(S0,mv);
    if(d<10&&pc!=='p'&&pc!=='k'&&a.v<700&&a.v>-300&&VAL[pc]-(cp?VAL[cp.toLowerCase()]:0)>=200&&attacked(n1.b,mv.t,n1.t)&&!attacked(n1.b,mv.t,S0.t))r=['блестящий ход','good','!!','brl'];
    if(a.v>50000&&pv<50000){r=['упущен мат','warn','?!','inac'];alt=san(S0,a.m);pre='Был мат: '+alt+'.'}
    else if(d>=90&&a.m){alt=san(S0,a.m);pre='Сильнее было '+alt+'.'}
    else pre=why(S0,mv);
    Gm.RT.push({i:idx,l:r[0],c:r[1],s:r[2],d:Math.min(d,1000),b:alt});Gm.bdg={i:mv.t,s:r[2],k:r[3]};
    Gm.lab=Gm.MV[idx]+' '+r[2]+' · '+r[0];Gm.labc=r[1];Gm.co=pre;Gm.evw=pv*(Gm.me==='w'?1:-1);
    if(Gm.over){busy=false;renderPlay();save();return}
    renderPlay();setTimeout(engineStep,40)},40)}
function capt(col){var need={p:8,n:2,b:2,r:2,q:1},s='',v=0;
  Gm.S.b.forEach(function(p){if(p&&colOf(p)===col&&need[p.toLowerCase()]!==undefined)need[p.toLowerCase()]--});
  ['q','r','b','n','p'].forEach(function(k){for(var i=0;i<need[k];i++){s+=pc(k,col);v+=VAL[k]}});
  return {s:s,v:v}}
function evalUI(){var x=$('evx');x.hidden=Gm.mode==='net';if(Gm.mode==='net')return;
  var two=Gm.mode==='two',va=two?'w':Gm.me,nA=two?'Белые':'Вы',nB=two?'Чёрные':'Бот',p,t,cp;
  if(Gm.over){p=Gm.over.wc?(Gm.over.wc===va?100:0):50;t=!Gm.over.wc?'ничья':two?'победа '+(Gm.over.wc==='w'?'белых':'чёрных'):Gm.over.wc===va?'победа':'поражение'}
  else{cp=(Gm.evw||0)*(va==='w'?1:-1);
    if(cp>50000){p=99;t=two?'мат у белых':'мат за вас'}else if(cp<-50000){p=1;t=two?'мат у чёрных':'мат вам'}
    else{p=Math.max(1,Math.min(99,Math.round(100/(1+Math.pow(10,-cp/400)))));var pw=Math.abs(cp)/100;
      t=pw<0.3?'равно':(cp>0?(two?'белые +':'вы +'):(two?'чёрные +':'бот +'))+pw.toFixed(1)}}
  $('evA').textContent=nA+' '+p+'%';$('evB').textContent=(100-p)+'% '+nB;$('evt').textContent=t;$('evf').style.width=p+'%'}
function renderPlay(){if(Gm.over&&!busy)settle();
  var S=Gm.S,my=canPlay(),V=view(),md=Gm.mode,chk=!Gm.over&&inCheck(S);
  paint($('bd'),S,{flip:V==='b',sel:sel,tg:sel>=0&&my?targets(legal(S),sel):{},last:Gm.last,hint:hint,bdg:Gm.bdg,grab:my?mySide():null});
  $('opp').textContent=md==='bot'?'Бот '+BOT[Gm.lv].r:md==='two'?cname(other(V),1):'Соперник';
  $('meN').textContent=md==='bot'?'Вы':md==='two'?cname(V,1):'Вы'+(Gm.me?' ('+cname(Gm.me)+')':'');
  $('status').textContent=Gm.over?Gm.over.t:md==='bot'?(busy||S.t!==Gm.me?'Бот думает…':chk?'Вам шах. Ваш ход':'Ваш ход'):
    md==='two'?(chk?'Шах. ':'')+'Ход '+(S.t==='w'?'белых':'чёрных'):
    !Gm.me||!Gm.seen?'Ждём соперника…':!Gm.opp?'Соперник не в сети':S.t===Gm.me?(chk?'Вам шах. Ваш ход':'Ваш ход'):'Ход соперника';
  var mine=capt(other(V)),his=capt(V);
  $('capB').innerHTML=mine.s;$('capT').innerHTML=his.s;
  var dm=Math.round((mine.v-his.v)/100);$('diff').textContent=dm>0?'+'+dm:dm<0?''+dm:'';
  evalUI();
  $('lab').textContent=Gm.lab;$('lab').className='lab '+Gm.labc;$('co').textContent=Gm.co;
  $('bHint').hidden=md==='net';$('bHint').disabled=!my;
  $('bUndo').disabled=busy||!H.length||!!Gm.over||md!=='bot';$('bRes').disabled=busy||!!Gm.over||!Gm.MV.length;
  var h='',i,rt={};Gm.RT.forEach(function(r){rt[r.i]=r});
  function cl(i){return rt[i]?rt[i].c:''}function tx(i){return (Gm.MV[i]||'')+(rt[i]&&rt[i].s?' '+rt[i].s:'')}
  for(i=0;i<Gm.MV.length;i+=2)h+='<span class="no">'+(i/2+1)+'.</span><span class="'+cl(i)+'">'+tx(i)+'</span><span class="'+cl(i+1)+'">'+tx(i+1)+'</span>';
  $('mv').innerHTML=h;$('mvE').hidden=Gm.MV.length>0;$('mv').scrollTop=$('mv').scrollHeight;
  var n=Gm.RT.length,acc=0,w=0,e=0,b=0;
  Gm.RT.forEach(function(r){acc+=Math.max(0,100-r.d/5);if(r.l==='неточность'||r.l==='упущен мат')w++;else if(r.l==='ошибка')e++;else if(r.l==='зевок')b++});
  $('sumCard').hidden=!Gm.over||!n||md!=='bot';
  if(n){$('sAcc').textContent=Math.round(acc/n);$('sW').textContent=w;$('sE').textContent=e;$('sB').textContent=b;$('sumT').textContent=Gm.over?Gm.over.t+'. Рейтинг '+(Gm.dr>=0?'+':'')+(Gm.dr||0):'Итоги партии'}
  $('promo').hidden=!promo;
  $('statline').textContent='Рейтинг '+store.rating+' · Победы '+store.stats.w;updClk()}
function tryMove(f,t){var c=legal(Gm.S).filter(function(m){return m.f===f&&m.t===t});if(!c.length)return false;
  if(c[0].p){promo=c;var h='';['q','r','b','n'].forEach(function(x){h+='<button data-p="'+x+'" aria-label="'+{q:'Ферзь',r:'Ладья',b:'Слон',n:'Конь'}[x]+'">'+pc(x,Gm.S.t)+'</button>'});$('promoB').innerHTML=h;renderPlay()}
  else userMove(c[0]);return true}
dragify($('bd'),function(i){return canPlay()&&colOf(Gm.S.b[i])===mySide()},
  function(i){var was=sel===i;sel=i;mark($('bd'),i,targets(legal(Gm.S),i));return was},
  function(f,t){if(!tryMove(f,t)){sel=-1;renderPlay()}},
  function(i,was,mv){if(was&&!mv)sel=-1;renderPlay()},
  function(i){if(!canPlay())return;if(sel>=0&&tryMove(sel,i))return;sel=-1;renderPlay()});
$('promoB').addEventListener('click',function(e){var b=e.target.closest('[data-p]');if(!b||!promo)return;var x=b.getAttribute('data-p'),m=promo.filter(function(q){return q.p===x})[0];promo=null;if(m)userMove(m)});
function bestNow(){var b=Gm.best,m=null;if(b)m=legal(Gm.S).filter(function(x){return x.f===b.f&&x.t===b.t&&(x.p||'')===b.p})[0];return m||think(Gm.S,300,8).m}
$('bHint').addEventListener('click',function(){if(!canPlay()||Gm.mode==='net')return;var m=bestNow();if(!m)return;hint=m;sel=-1;Gm.lab='Подсказка';Gm.labc='tip';Gm.co='Попробуйте '+san(Gm.S,m)+'. '+why(Gm.S,m)+' Клетки хода отмечены на доске.';renderPlay()});
$('bUndo').addEventListener('click',function(){if(busy||!H.length||Gm.over||Gm.mode!=='bot')return;Gm=JSON.parse(H.pop());sel=-1;hint=null;promo=null;renderPlay();save()});
$('bRes').addEventListener('click',function(){if(busy||Gm.over||!Gm.MV.length)return;
  if(Gm.mode==='bot')finish({t:'Вы сдались',r:'l',wc:other(Gm.me)});
  else if(Gm.mode==='two')finish({t:cname(Gm.S.t,1)+' сдались',wc:other(Gm.S.t)});
  else{if(!Gm.me)return;if(NR)NR.presence({r:1}).catch(function(){});finish({t:'Вы сдались',wc:other(Gm.me)})}
  sel=-1;promo=null;Gm.lab='Партия окончена';Gm.labc='tip';Gm.co=Gm.mode==='bot'?'Сдаваться не стыдно. Посмотрите итоги и начните новую партию.':'Партия окончена.';renderPlay();save()});
var lastTick=Date.now();
function fmt(ms){var s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+(s%60<10?'0':'')+s%60}
function updClk(){var c=$('clk');c.hidden=!Gm.tc;if(Gm.tc){c.textContent=fmt(Gm.tm);c.className='clk'+(Gm.tm<30000?' low':'')}}
setInterval(function(){var now=Date.now(),dt=now-lastTick;lastTick=now;
  if(!Gm||!Gm.tc||Gm.over||busy||Gm.S.t!==Gm.me||!Gm.MV.length)return;
  Gm.tm-=Math.min(dt,2000);
  if(Gm.tm<=0){Gm.tm=0;finish({t:'Время вышло. Победил бот',r:'l',wc:other(Gm.me)});Gm.lab='Партия окончена';Gm.labc='tip';Gm.co='Время закончилось. Попробуйте контроль подлиннее или партию без часов.';sel=-1;promo=null;renderPlay();save()}
  else updClk()},500);
function segInit(id,key,num,cb){var el=$(id);function upd(){[].forEach.call(el.children,function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-x')===String(store.set[key])))})}
  el.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var x=b.getAttribute('data-x');store.set[key]=num?+x:x;upd();if(cb)cb();save()});upd()}
function modeUI(){var m=store.set.mode;$('optBot').hidden=m!=='bot';$('optTwo').hidden=m!=='two';$('rowNew').hidden=m==='net'}
segInit('segM','mode',0,modeUI);segInit('segL','lv',1);segInit('segC','col');segInit('segT','tc',1);
segInit('segB','board',0,function(){document.documentElement.setAttribute('data-board',store.set.board)});
$('bNew').addEventListener('click',function(){if(busy)return;netLeave();
  if(store.set.mode==='two')newG('two','w',0);
  else{var c=store.set.col;if(c==='r')c=Math.random()<0.5?'w':'b';newG('bot',c,store.set.lv)}
  window.scrollTo(0,0)});

function netLeave(){netOff.forEach(function(f){try{f()}catch(e){}});netOff=[];if(NR){try{NR.leave()}catch(e){}NR=null}}
var PZ1=["2r5/1R1nN2k/1n1N3b/3p2B1/3Pp3/1Pq2P1Q/4P1PP/3K1B1R w - -", "5rk1/5pp1/3R1p2/1p2n2p/1pp5/4PqPP/3K1P1R/r4B2 b - -", "r1b1r1k1/1p1p1p1n/4p2p/p3QN2/4P3/P4PP1/1PP3P1/R3KB1R w KQ -", "5rk1/5p2/2pbqQ1p/rp1p2pN/8/2P2P1b/6n1/1RR3K1 w - -", "1K4k1/8/8/8/3q4/8/2p5/4r1qq b - -", "2q1r3/r2n1k2/4p2R/pb2Q3/7P/P2P1N2/1P2BP2/1K4R1 w - -", "2r2rk1/pK3p2/3b4/p4P1p/1n4pP/3R4/8/1r3B1R b - -", "k3r3/8/6p1/ppp1np2/4q1p1/2P1b2r/3p4/R2R1K2 b - -", "6kr/1p3R2/1P2R1B1/r6p/P2P1B1P/8/2P3P1/6K1 w - -", "2kr4/1b1p1pp1/p7/P1p5/8/1Pp1n1pr/R3P3/1q1NKBR1 b - -", "1r6/kpNbn1q1/1r6/3pn1N1/P7/1RPB1P1P/R4Q2/7K w - -", "7k/2R5/8/p1pB2P1/r7/2PP4/3K1PP1/1R6 w - -", "2b3rk/1p3p1p/8/2p1b3/1P4PR/5n2/1q2N3/3K1B2 b - -", "rnb1k3/6P1/p3p3/3pP3/2p1pP2/4K3/2r1PRB1/1q3R2 b - -", "r1bq1k1r/pp5p/2pp1p2/3B1p1Q/1b5P/4P3/P1P2PP1/R4KNR w - -", "r1k5/1q1nQ2R/2b5/1p2B3/p1pP1P2/3P2P1/PP5N/2KR4 w - -", "r1b1kbnr/pp1pnp1p/6p1/4B3/4Q3/5N2/PqP1PPPP/RN2KB1R b KQkq -", "2k5/7Q/1p1pp3/p2P1p2/nqPQ1P2/5P2/6B1/2K2R1R w - -", "r6r/1p6/p1n4k/2bp1Q1p/4P2P/P1q5/3N1P2/2B1K1R1 w - -", "7k/1r6/8/p7/K1nN1p1p/7B/4P2P/8 b - -", "2kr3r/pp1q3p/8/2P5/1p3bn1/8/8/4K3 b - -", "1nbqk3/r2p1p2/6n1/1P4Np/P1Q1P2P/8/5PB1/RR4K1 w - -", "4kb1r/1N3p1p/7p/4n3/1pP1q3/3p4/2r5/1N1Q2K1 b k -", "r4kr1/2Q3p1/1p4Pp/p7/P7/8/RP2P2P/4KBR1 w - -"];
var PZ2=["2r1kb1N/Rbqn1N1Q/1n6/3p2B1/3Pp3/1PP2P2/4P1PP/3K1B1R w - -", "5rk1/5pp1/3R1p2/1p2n2p/1pp5/4PqPP/r4P1R/4KB2 b - -", "6rk/8/2n4p/1p2p2b/3p1p2/5P1K/7R/7r b - -", "2k5/1p2pR2/4r1p1/1PPQ4/5P2/8/7P/5RK1 w - -", "6k1/8/8/K5p1/6qp/8/2p5/5r2 b - -", "k3r2r/3n4/1p4p1/p1p2p2/P1q3pP/2P1b3/3p4/1R1R3K b - -", "7r/1p4k1/1P2RRB1/r6p/P2P1B1P/8/2P3P1/6K1 w - -", "2kr4/1b1p1pp1/p7/P1p5/4q3/1Pp1n1pr/RN2P3/4KBR1 b - -", "kr6/1ppbn1q1/1r6/1N1pn1N1/P7/1RPB1P1P/R4Q2/7K w - -", "4r1k1/8/2p5/8/3K1p2/7P/6p1/4q3 b - -", "1r1q1rk1/2p3pp/p1p5/2bn2B1/1PP1K3/P2p4/Q3p2P/RN2R3 b - -", "7k/2bR4/8/p1pB2P1/8/r1PP4/3K1PP1/1R6 w - -"];
var PZ=[];PZ1.forEach(function(f){PZ.push({f:f,n:1})});PZ2.forEach(function(f){PZ.push({f:f,n:2})});
$('pzSub').textContent='Найдите ход, который ставит мат. Первые '+PZ1.length+' задачи решаются в один ход, остальные '+PZ2.length+' в два.';
var pi=0,ps=null,pstep=0,psel=-1,phint=null,plast=null,pdone=false,T=null;
function mates1(s){return legal(s).filter(function(m){var n=make(s,m);return inCheck(n)&&!legal(n).length})}
function forced2(s,m){var n=make(s,m),rs=legal(n);return rs.length>0&&rs.every(function(r){return mates1(make(n,r)).length>0})}
function pzSide(){return parseFen(PZ[pi].f).t}
function pzLoad(i){pi=i;ps=parseFen(PZ[i].f);pstep=0;psel=-1;phint=null;plast=null;pdone=false;$('pzF').textContent='';$('pzF').className='fb';pzRender()}
function pzRender(){var my=!pdone&&ps.t===pzSide();
  paint($('pzB'),ps,{grab:my?pzSide():null,flip:pzSide()==='b',sel:psel,tg:psel>=0&&my?targets(legal(ps),psel):{},hint:phint,last:plast});
  var left=PZ[pi].n-pstep;
  $('pzC').hidden=!!T;$('pzS').hidden=!!T;$('pzR').hidden=!!T;$('pzN').textContent=T?'Прервать тест':'Следующая';$('tGo').disabled=!!T;
  $('pzT').textContent=(T?'Тест рейтинга. Задание '+(T.k+1)+' из '+T.q.length:'Задача '+(pi+1))+'. Ход '+(pzSide()==='w'?'белых':'чёрных')+', мат в '+(left===2?'два хода':'один ход');
  var h='';PZ.forEach(function(p,j){h+='<button data-j="'+j+'" aria-pressed="'+(j===pi)+'" class="'+(store.solved[j]?'done':'')+'" aria-label="Задача '+(j+1)+(store.solved[j]?', решена':'')+'">'+(j+1)+'</button>'});
  $('pzC').innerHTML=h}
function pzFb(t,c){$('pzF').textContent=t;$('pzF').className='fb '+(c||'')}
function pzCan(){return !pdone&&ps.t===pzSide()}
function pzTry(f,i){var c=legal(ps).filter(function(m){return m.f===f&&m.t===i&&(!m.p||m.p==='q')});if(!c.length)return false;
    var m=c[0],n=make(ps,m);psel=-1;phint=null;
      if(inCheck(n)&&!legal(n).length){ps=n;plast=m;pdone=true;store.solved[pi]=1;save();pzFb('Мат. Задача решена.','good');if(T)tDone(true)}
      else if(PZ[pi].n===2&&pstep===0&&forced2(ps,m)){var rs=legal(n),r=rs[0],rsn=san(n,r);ps=make(n,r);plast=r;pstep=1;pzFb('Верно. Соперник ответил '+rsn+'. Теперь поставьте мат.','good')}
      else if(T){var sm=mates1(ps)[0]||legal(ps).filter(function(x){return forced2(ps,x)})[0];pdone=true;tDone(false,sm?san(ps,sm):'')}
      else pzFb('Этот ход не ведёт к мату. Попробуйте другой.','bad');
      pzRender();return true}
dragify($('pzB'),function(i){return pzCan()&&colOf(ps.b[i])===pzSide()},
  function(i){var was=psel===i;psel=i;mark($('pzB'),i,targets(legal(ps),i));return was},
  function(f,t){if(!pzTry(f,t)){psel=-1;pzRender()}},
  function(i,was,mv){if(was&&!mv)psel=-1;pzRender()},
  function(i){if(!pzCan())return;if(psel>=0&&pzTry(psel,i))return;psel=-1;pzRender()});
$('pzC').addEventListener('click',function(e){var b=e.target.closest('[data-j]');if(b)pzLoad(+b.getAttribute('data-j'))});
$('pzS').addEventListener('click',function(){if(pdone)return;var m=mates1(ps)[0];if(!m)m=legal(ps).filter(function(x){return forced2(ps,x)})[0];if(!m)return;phint=m;psel=-1;pzFb('Решение: '+san(ps,m)+'. Сделайте этот ход на доске.','');pzRender()});
$('pzR').addEventListener('click',function(){pzLoad(pi)});
$('pzN').addEventListener('click',function(){if(T){T=null;pzLoad(pi);$('tRes').textContent='Тест прерван. Рейтинг не изменился.';$('tRes').className='fb';return}pzLoad((pi+1)%PZ.length)});
function shuf(a){for(var i=a.length-1;i>0;i--){var k=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[k];a[k]=t}return a}
function tStart(){var a=[],b=[],i;for(i=0;i<PZ1.length;i++)a.push(i);for(i=0;i<PZ2.length;i++)b.push(PZ1.length+i);
  T={q:shuf(a).slice(0,4).concat(shuf(b).slice(0,4)),k:0,pts:0,ok:0,t0:Date.now(),id:Date.now()};$('tRes').textContent='';pzLoad(T.q[0])}
function tDone(ok,sol){var sec=(Date.now()-T.t0)/1000,base=PZ[pi].n===2?190:95,id=T.id;
  if(ok){T.ok++;T.pts+=base+(sec<20?25:sec<45?10:0)}
  pzFb(ok?'Верно.':'Неверно.'+(sol?' Правильный ход: '+sol+'.':''),ok?'good':'bad');
  setTimeout(function(){if(!T||T.id!==id)return;T.k++;
    if(T.k<T.q.length){pzLoad(T.q[T.k]);T.t0=Date.now()}
    else{var est=Math.round((400+T.pts)/10)*10,n=T.ok,q=T.q.length;T=null;store.rating=est;save();pzLoad(pi);
      $('tRes').textContent='Решено '+n+' из '+q+'. Ваш примерный рейтинг: '+est+'. Он сохранён и дальше меняется после партий.';$('tRes').className='fb good';renderPlay()}},ok?1100:2400)}
$('tGo').addEventListener('click',function(){if(!T)tStart()});
$('hmT').addEventListener('click',function(){location.hash='#puzzles';if(!T)tStart()});

var LS=[
{t:'Как ходят фигуры',f:'4k3/8/2n5/5b2/8/1R6/3P1Q2/4K3 w - -',mk:[],p:['Нажмите на любую фигуру на доске: точки покажут, куда она может пойти.','Ладья ходит по прямым линиям, слон по диагоналям, ферзь умеет и то и другое. Конь прыгает буквой «Г» и единственный перепрыгивает через фигуры. Король ходит на одну клетку в любую сторону.','Пешка идёт только вперёд на одну клетку, с начальной позиции может шагнуть на две, а бьёт по диагонали. Дойдя до последней горизонтали, она превращается в любую фигуру, обычно в ферзя.']},
{t:'Сколько стоят фигуры',f:'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -',mk:[],vals:1,p:['Чтобы понять, выгоден ли размен, фигуры считают в пешках. Король бесценен: без него партия проиграна.','Отдать коня за ладью выгодно, отдать ферзя за ладью почти всегда плохо. Перед каждым взятием спросите себя: что я отдаю и что получаю?','Оценка под доской в разделе «Игра» считает так же: «вы +3.0» значит, что у вас перевес примерно в коня или слона.']},
{t:'Три правила дебюта',f:'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq -',mk:['e4','e5','d4','d5'],p:['Первое: займите центр пешкой. Клетки e4, d4, e5 и d5 отмечены на доске. Фигуры в центре достают до любого фланга.','Второе: выводите коней и слонов. Каждый ход в начале партии вводит в игру новую фигуру. Не ходите одной фигурой дважды без причины и не спешите с ферзём.','Третье: сделайте рокировку. Король уходит в угол за пешки, ладья выходит к центру. Белые на доске выполнили все три правила за четыре хода.']},
{t:'Вилка',f:'r3k3/8/8/3N4/8/8/8/4K3 w - -',mk:['c7'],p:['Вилка: одна фигура нападает сразу на две. Защитить обе одним ходом нельзя, поэтому одна теряется.','Белый конь может прыгнуть на отмеченную клетку c7. Оттуда он даёт шах королю и одновременно нападает на ладью a8. Король обязан уйти, и конь забирает ладью.','Кони лучше всех ставят вилки, но это умеет любая фигура, даже пешка. Перед своим ходом проверяйте, не стоят ли ваши фигуры под двойным ударом.']},
{t:'Связка',f:'4k3/8/2n5/8/B7/8/8/4K3 w - -',mk:['c6'],p:['Связка: фигура не может уйти, потому что за ней стоит более ценная. Слон a4 смотрит сквозь коня c6 прямо на короля e8.','Нажмите на чёрного коня: у него нет ни одного хода. Уйти ему запрещают правила, иначе король окажется под шахом.','Связанную фигуру выгодно атаковать ещё раз, например пешкой: убежать она не может. Свои фигуры старайтесь не ставить на одну линию с королём или ферзём.']},
{t:'Мат двумя ладьями',f:'6k1/R7/1R6/8/8/8/8/6K1 w - -',mk:['b8'],p:['Линейный мат ставят две ладьи, по очереди отрезая королю горизонтали. Ладья a7 уже закрыла седьмую горизонталь, король заперт на восьмой.','Осталось дать шах на последней линии: ладья с b6 идёт на отмеченную клетку b8. Королю некуда отступить, закрыться нечем, взять ладью нельзя. Это мат.','Тот же приём работает с ферзём и ладьёй. Запомните рисунок: одна фигура держит линию, вторая даёт шах на соседней.']},
{t:'Детский мат и защита',f:'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq -',mk:['f7'],p:['Самая частая ловушка для новичков. Белые вывели ферзя на h5 и слона на c4. Оба смотрят на пешку f7, которую защищает только король. Грозит взятие на f7 с матом.','Защита простая: пешка g6 закрывает ферзю дорогу. Если ферзь отступит на f3 и снова прицелится на f7, выведите коня на f6.','После этого ранний выход ферзя оборачивается против белых: ваши фигуры развиваются с нападением на него. Перед каждым ходом смотрите, чем грозит соперник.']},
{t:'Рокировка',f:'r3k2r/pppq1ppp/2npbn2/2b1p3/2B1P3/2NPBN2/PPPQ1PPP/R3K2R w KQkq -',mk:['g1','c1'],p:['Рокировка: единственный ход, когда двигаются сразу две фигуры. Король шагает на две клетки к ладье, а ладья перепрыгивает через него. Нажмите на белого короля: отмеченные клетки g1 и c1 и есть рокировка.','Она разрешена, если король и эта ладья ещё не ходили, между ними нет фигур, король не под шахом и не проходит через клетку под ударом.','Короткая рокировка (в сторону королевского фланга) быстрее и безопаснее. Постарайтесь сделать её в первые десять ходов.']},
{t:'Взятие на проходе',f:'4k3/8/8/3pP3/8/8/8/4K3 w - d6',mk:['d6'],p:['Редкое правило, которое удивляет новичков. Чёрная пешка только что прыгнула с d7 на d5 и встала рядом с белой пешкой e5.','Белые могут взять её так, будто она прошла только одну клетку: пешка e5 бьёт на отмеченную клетку d6, а чёрная пешка d5 снимается с доски. Нажмите на белую пешку, чтобы увидеть этот ход.','Такое взятие возможно только сразу, следующим ходом. Позже право пропадает.']},
{t:'Пат: ничья вместо победы',f:'7k/5Q2/8/8/8/8/8/6K1 b - -',mk:[],p:['Пат: у игрока нет ни одного разрешённого хода, но шаха ему нет. Партия сразу заканчивается вничью.','Нажмите на чёрного короля: ходить ему некуда, ферзь отнял все клетки. Шаха при этом нет. У белых лишний ферзь, а результат ничья.','Когда у вас большой перевес, перед каждым ходом проверяйте, что у соперника остаётся ход, или давайте шах. Обидно упустить победу из-за спешки.']}
];
var OP=[
{t:'Итальянская партия',m:'e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 c2c3 g8f6 d2d3 d7d6 e1g1 e8g8',x:'Лучший первый дебют. Белые быстро выводят коня и слона, целятся на пешку f7 и готовят рокировку. Все три правила дебюта выполняются сами собой.'},
{t:'Испанская партия',m:'e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6 e1g1 f8e7 f1e1 b7b5 a4b3 d7d6',x:'Слон давит на коня, который защищает пешку e5. Игра получается медленной и позиционной: белые долго сохраняют небольшое давление.'},
{t:'Сицилианская защита',m:'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6',x:'Самый боевой ответ на e4. Чёрные меняют фланговую пешку на центральную и получают полуоткрытую линию c для контригры. Позиции острые, ошибаться нельзя обеим сторонам.'},
{t:'Французская защита',m:'e2e4 e7e6 d2d4 d7d5 b1c3 g8f6 c1g5 f8e7 e4e5 f6d7',x:'Чёрные строят прочную пешечную цепь и сразу атакуют центр ходом d5. Цена прочности: слон c8 долго остаётся запертым за своей пешкой e6.'},
{t:'Ферзевый гамбит',m:'d2d4 d7d5 c2c4 e7e6 b1c3 g8f6 c1g5 f8e7 e2e3 e8g8 g1f3',x:'Белые предлагают пешку c4, чтобы отвлечь чёрную пешку от центра. Чаще всего чёрные её не берут и спокойно развиваются. Классическое начало для игры от d4.'},
{t:'Лондонская система',m:'d2d4 d7d5 c1f4 g8f6 e2e3 e7e6 g1f3 c7c5 c2c3 b8c6 b1d2',x:'Одна и та же расстановка почти против любых ходов чёрных: слон на f4, пешки d4, e3, c3. Мало теории, прочная позиция, удобно для начинающих.'},
{t:'Защита Каро-Канн',m:'e2e4 c7c6 d2d4 d7d5 b1c3 d5e4 c3e4 c8f5 e4g3 f5g6',x:'Похожа на французскую, но слон c8 успевает выйти на свободу до хода e6. Надёжный выбор, если вам нравится крепкая позиция без слабостей.'},
{t:'Шотландская партия',m:'e2e4 e7e5 g1f3 b8c6 d2d4 e5d4 f3d4 g8f6 d4c6 b7c6',x:'Белые сразу вскрывают центр ходом d4. Игра открытая, фигуры быстро входят в бой. Хороша, чтобы научиться играть в открытых позициях.'}
];
var li=0,lst=null,lsel=-1,lmode='l',oi=0,ost=[],osan=[],olast=[],ok=0;
$('lsSub').textContent=LS.length+' коротких уроков и '+OP.length+' дебютов. В уроках нажмите на фигуру, чтобы увидеть её ходы.';
function lsLoad(i){lmode='l';li=i;lst=parseFen(LS[i].f);lsel=-1;store.read[i]=1;save();lsRender()}
function opLoad(i){lmode='o';oi=i;ost=[newGame()];osan=[];olast=[null];ok=0;
  OP[i].m.split(' ').forEach(function(u){var s=ost[ost.length-1],m=legal(s).filter(function(x){return sqn(x.f)+sqn(x.t)===u})[0];if(!m)return;osan.push(san(s,m));ost.push(make(s,m));olast.push({f:m.f,t:m.t})});
  lsRender()}
function lsRender(){var h='',c='';
  [].forEach.call($('lsMode').children,function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-x')===lmode))});
  if(lmode==='l'){var L=LS[li],mk={},tg={};L.mk.forEach(function(n){mk[sq(n)]=1});
    if(lsel>=0){var cl=colOf(lst.b[lsel]),s={b:lst.b,t:cl,c:lst.c,ep:cl===lst.t?lst.ep:-1};tg=targets(legal(s),lsel)}
    paint($('lsB'),lst,{sel:lsel,tg:tg,mk:mk});
    $('lsT').textContent='Урок '+(li+1)+'. '+L.t;
    if(L.vals){h+='<div class="vals">';[['p',1],['n',3],['b',3],['r',5],['q',9]].forEach(function(v){h+='<div>'+pc(v[0],'w')+'<b>'+v[1]+'</b></div>'});h+='</div>'}
    L.p.forEach(function(p){h+='<p>'+p+'</p>'});
    LS.forEach(function(x,j){c+='<button data-j="'+j+'" aria-pressed="'+(j===li)+'" class="'+(store.read[j]?'done':'')+'" aria-label="Урок '+(j+1)+'">'+(j+1)+'</button>'});
    $('lsP').textContent='Назад';$('lsP').disabled=li===0;$('lsN').disabled=false;$('lsN').textContent=li===LS.length-1?'К дебютам':'Дальше'}
  else{var O=OP[oi];paint($('lsB'),ost[ok],{last:olast[ok]});
    $('lsT').textContent=O.t;h='<p>'+O.x+'</p><p class="line">';
    osan.forEach(function(sn,j){h+=(j%2?'':(j/2+1)+'. ')+(j===ok-1?'<b>'+sn+'</b>':sn)+' '});
    h+='</p><p>'+(ok===0?'Нажимайте «Ход вперёд» или на доску, чтобы пройти вариант по ходам.':ok===osan.length?'Вариант пройден. Дальше начинается середина партии.':'Ход '+(ok%2?'белых':'чёрных')+': '+osan[ok-1]+'.')+'</p>';
    OP.forEach(function(x,j){c+='<button class="txt" data-j="'+j+'" aria-pressed="'+(j===oi)+'">'+x.t+'</button>'});
    $('lsP').textContent='Ход назад';$('lsP').disabled=ok===0;$('lsN').textContent='Ход вперёд';$('lsN').disabled=ok===osan.length}
  $('lsX').innerHTML=h;$('lsC').innerHTML=c}
$('lsB').addEventListener('click',function(e){if(lmode==='o'){if(ok<osan.length){ok++;lsRender()}return}
  var i=sqOf(e);if(i<0)return;lsel=lst.b[i]?(lsel===i?-1:i):-1;lsRender()});
$('lsC').addEventListener('click',function(e){var b=e.target.closest('[data-j]');if(!b)return;var n=+b.getAttribute('data-j');if(lmode==='l')lsLoad(n);else opLoad(n)});
$('lsMode').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.getAttribute('data-x')==='l')lsLoad(li);else opLoad(oi)});
$('lsP').addEventListener('click',function(){if(lmode==='o'){if(ok>0){ok--;lsRender()}}else if(li>0)lsLoad(li-1)});
$('lsN').addEventListener('click',function(){if(lmode==='o'){if(ok<osan.length){ok++;lsRender()}}else if(li<LS.length-1)lsLoad(li+1);else opLoad(0)});

var RES={w:'Победа',l:'Поражение',d:'Ничья'};
function daily(){return Math.floor(Date.now()/864e5)%PZ.length}
function nextLesson(){for(var i=0;i<LS.length;i++)if(!store.read[i])return i;return 0}
function renderHome(){var st=store.stats,d=daily(),nl=nextLesson(),h='',who=Gm.mode==='bot'?'против бота '+BOT[Gm.lv].r:Gm.mode==='two'?'вдвоём на одном устройстве':'онлайн';
  paint($('hmB'),Gm.S,{flip:view()==='b',last:Gm.last});
  $('hmS').textContent=Gm.over?'Партия окончена: '+Gm.over.t+'.':Gm.MV.length?'Идёт партия '+who+', сделано ходов: '+Math.ceil(Gm.MV.length/2)+'.':'Новая партия '+who+'.';
  $('hmGo').textContent=Gm.over?'Открыть партию':Gm.MV.length?'Продолжить игру':'Начать игру';
  $('hR').textContent=store.rating;$('hW').textContent=st.w;$('hD').textContent=st.d;$('hL').textContent=st.l;
  var ds=parseFen(PZ[d].f).t;
  $('hmP').textContent='Задача '+(d+1)+': ход '+(ds==='w'?'белых':'чёрных')+', мат в '+(PZ[d].n===2?'два хода':'один ход')+'.'+(store.solved[d]?' Уже решена.':'');
  var rd=0;LS.forEach(function(x,i){if(store.read[i])rd++});
  $('hmL').textContent='Пройдено уроков: '+rd+' из '+LS.length+'. Следующий: «'+LS[nl].t+'».';
  store.arch.forEach(function(a){h+='<div class="arow"><span class="pill '+a.r+'">'+RES[a.r]+'</span><span>Бот '+(BOT[a.lv]?BOT[a.lv].r:'')+', '+a.n+' ход.</span><span class="mono">'+a.a+'% · '+(a.dr>=0?'+':'')+a.dr+' · '+a.d+'</span></div>'});
  $('hmA').innerHTML=h||'<div class="empty">Сыгранные с ботом партии появятся здесь: результат, точность и изменение рейтинга.</div>'}
$('hmPB').addEventListener('click',function(){pzLoad(daily());location.hash='#puzzles'});
$('hmLB').addEventListener('click',function(){lsLoad(nextLesson());location.hash='#lessons'});
$('hmOB').addEventListener('click',function(){opLoad(oi);location.hash='#lessons'});

var VIEWS=['home','play','puzzles','lessons'];
function route(){var v=(location.hash||'').slice(1);if(VIEWS.indexOf(v)<0)v='home';if(v==='home')renderHome();
  VIEWS.forEach(function(x){$('v-'+x).hidden=x!==v});
  [].forEach.call(document.querySelectorAll('nav.tabs a'),function(a){if(a.getAttribute('data-v')===v)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')})}
window.addEventListener('hashchange',route);
function start(d){var g=(d&&d.game)||store.game;
  if(g&&g.S&&g.S.b&&g.S.b.length===64&&g.UCI&&(g.mode==='bot'||g.mode==='two')&&BOT[g.lv]){Gm=g;H=[];
    if(Gm.mode==='bot'&&!Gm.over&&Gm.S.t!==Gm.me){busy=true;renderPlay();setTimeout(engineStep,60)}else renderPlay()}
  else newG('bot','w',store.set.lv);
  modeUI();pzLoad(0);li=0;lst=parseFen(LS[0].f);lsRender();route()}
start({});
})();
