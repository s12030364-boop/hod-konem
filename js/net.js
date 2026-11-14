// Онлайн-игра без аккаунтов: маленький клиент MQTT 3.1.1 поверх WebSocket.
// Игроки встречаются в «комнате» на бесплатных публичных MQTT-серверах.
// Каждый игрок хранит там retained-сообщение со своим цветом и списком ходов.
// Last Will стирает его, если связь оборвалась.
(function(){
var BROKERS=['wss://broker.emqx.io:8084/mqtt','wss://broker.hivemq.com:8884/mqtt'];
try{var q=new URLSearchParams(location.search).get('broker');if(q)BROKERS=q.split(',')}catch(e){}
var PFX='hodkonem/v1/',enc=new TextEncoder(),dec=new TextDecoder();

function str(s){var b=enc.encode(s);return [b.length>>8,b.length&255].concat(Array.from(b))}
function vlen(n){var o=[];do{var x=n%128;n=Math.floor(n/128);if(n>0)x|=128;o.push(x)}while(n>0);return o}
function pkt(h,body){return new Uint8Array([h].concat(vlen(body.length),body))}

function Conn(url,cid,will,onMsg,onUp,onDown){
  var self=this,ws=null,buf=new Uint8Array(0),ping=null,alive=false,stop=false,retry=null,pid=1;
  self.up=false;
  function send(a){try{if(ws&&ws.readyState===1)ws.send(a)}catch(e){}}
  self.pub=function(topic,payload){if(!self.up)return;var p=Array.from(enc.encode(payload));send(pkt(0x31,str(topic).concat(p)))};
  function open(){if(stop)return;
    try{ws=new WebSocket(url,'mqtt')}catch(e){later();return}
    ws.binaryType='arraybuffer';alive=false;
    ws.onopen=function(){var body=str('MQTT').concat([4,0x02|0x04|0x20,0,30],str(cid),str(will),[0,0]);send(pkt(0x10,body))};
    ws.onmessage=function(ev){var d=new Uint8Array(ev.data),n=new Uint8Array(buf.length+d.length);n.set(buf);n.set(d,buf.length);buf=n;parse()};
    ws.onclose=ws.onerror=function(){if(ping){clearInterval(ping);ping=null}var was=self.up;self.up=false;ws=null;if(was)onDown();later()}}
  function later(){if(stop||retry)return;retry=setTimeout(function(){retry=null;open()},3000)}
  function parse(){for(;;){if(buf.length<2)return;var m=1,len=0,i=1,b;
      do{if(i>=buf.length)return;b=buf[i++];len+=(b&127)*m;m*=128}while(b&128);
      if(buf.length<i+len)return;var t=buf[0],body=buf.slice(i,i+len);buf=buf.slice(i+len);handle(t,body)}}
  function handle(t,body){var ty=t>>4;
    if(ty===2){if(body[1]!==0){try{ws.close()}catch(e){}return}
      self.up=true;send(pkt(0x82,[0,pid++&255||1].concat(str(PFX+self.room+'/+'),[0])));
      ping=setInterval(function(){send(new Uint8Array([0xC0,0]))},20000);onUp()}
    else if(ty===3){var tl=(body[0]<<8)|body[1],topic=dec.decode(body.slice(2,2+tl)),o=2+tl;if(((t>>1)&3)>0)o+=2;onMsg(topic,dec.decode(body.slice(o)))}}
  self.close=function(){stop=true;if(retry)clearTimeout(retry);if(ws){send(new Uint8Array([0xE0,0]));try{ws.close()}catch(e){}}};
  self.kick=function(){if(!ws&&!stop){if(retry){clearTimeout(retry);retry=null}open()}};
  open()}

function join(room){return new Promise(function(res,rej){
  var me=Math.random().toString(36).slice(2,10),topic=PFX+room+'/'+me,pres=null,maps=[],subs=[],conns=[],done=false,lostT=null,lostOn=false;
  function peers(){var all={};maps.forEach(function(mp){for(var k in mp){if(!all[k]||mp[k].t>all[k].t)all[k]=mp[k]}});
    return Object.keys(all).map(function(k){return {id:k,sameTab:k===me,kind:'viewer',presence:all[k].p}})}
  function emit(){var p=peers();subs.forEach(function(s){try{s.cb({peers:p})}catch(e){}})}
  function anyUp(){return conns.some(function(c){return c.up})}
  function push(){if(pres)conns.forEach(function(c){c.pub(topic,JSON.stringify({p:pres,t:Date.now()}))})}
  var api={
    presence:function(o){pres=pres||{};for(var k in o)pres[k]=o[k];push();return Promise.resolve()},
    onPeers:function(cb,lost,back){var s={cb:cb,lost:lost,back:back};subs.push(s);emit();return function(){subs=subs.filter(function(x){return x!==s})}},
    leave:function(){conns.forEach(function(c){c.pub(topic,'');c.close()});subs=[];window.removeEventListener('visibilitychange',vis)}};
  function vis(){if(document.visibilityState==='visible')conns.forEach(function(c){c.kick()})}
  window.addEventListener('visibilitychange',vis);
  BROKERS.forEach(function(url,bi){var mp={};maps.push(mp);
    var c=new Conn(url,'hk'+me+bi,topic,function(t,msg){var id=t.slice(t.lastIndexOf('/')+1);
        if(!msg){delete mp[id]}else{try{var o=JSON.parse(msg);if(o&&o.p)mp[id]={p:o.p,t:+o.t||0}}catch(e){}}
        emit()},
      function(){push();if(lostT){clearTimeout(lostT);lostT=null}if(lostOn){lostOn=false;subs.forEach(function(s){if(s.back)s.back()})}
        if(!done){done=true;res(api)}},
      function(){for(var k in mp)delete mp[k];emit();
        if(!anyUp()&&!lostT)lostT=setTimeout(function(){lostT=null;if(!anyUp()){lostOn=true;subs.forEach(function(s){if(s.lost)s.lost()})}},6000)});
    c.room=room;conns.push(c)});
  setTimeout(function(){if(!done){done=true;conns.forEach(function(c){c.close()});rej({code:'offline'})}},12000)})}

window.HKNet={join:join};
})();
