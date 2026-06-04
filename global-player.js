/* global-player.js — Bnei Ohr persistent music bar */
(function(){

var PLAYLIST = [
  { title: 'Malkout nan Eklè',      sc: 'https://soundcloud.com/bnei-ohr/malkout-nan-ekl' },
  { title: 'Bore Bore',              sc: 'https://soundcloud.com/bnei-ohr/bore-bore-2' },
  { title: 'Poto Mitan',             sc: 'https://soundcloud.com/bnei-ohr/poto-mitan' },
  { title: 'Pot Bnei Ohr',           sc: 'https://soundcloud.com/bnei-ohr/pot-bnei-ohr' },
  { title: 'Mélodie Ocre Noire III', sc: 'https://soundcloud.com/bnei-ohr/melodie-ocre-noire-3' },
  { title: 'Mélodie Ocre Noire IV',  sc: 'https://soundcloud.com/bnei-ohr/melodie-ocre-noire-4' }
];

var idx     = 0;
var playing = false;
var widget  = null;
var scReady = false;

/* ── CSS ── */
var css = `
#gp-bar{
  position:fixed;bottom:0;left:0;right:0;height:64px;z-index:9999;
  background:linear-gradient(90deg,#090612,#07040d 50%,#090612);
  border-top:1px solid rgba(212,175,55,.22);
  display:flex;align-items:center;gap:0;padding:0 12px;
  font-family:'Cinzel',serif;
}
#gp-bar *{box-sizing:border-box}
#gp-prog-wrap{
  position:absolute;top:0;left:0;right:0;height:2px;
  background:rgba(212,175,55,.1);cursor:pointer;
}
#gp-prog-bar{
  height:100%;width:0%;
  background:linear-gradient(90deg,#b8973a,#d4af37,#f0d060);
  pointer-events:none;transition:width .4s linear;
}
.gp-nav-btn{
  width:30px;height:30px;background:none;border:none;
  color:rgba(212,175,55,.5);cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;transition:color .2s;padding:0;
}
.gp-nav-btn:hover{color:#d4af37}
.gp-nav-btn svg{width:15px;height:15px;fill:currentColor}
#gp-play-btn{
  width:40px;height:40px;border-radius:50%;flex-shrink:0;
  background:rgba(212,175,55,.1);
  border:1px solid rgba(212,175,55,.3);
  color:#d4af37;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:background .2s,transform .15s;margin:0 6px;
}
#gp-play-btn:hover{background:rgba(212,175,55,.2);transform:scale(1.08)}
#gp-play-btn svg{width:16px;height:16px;fill:#d4af37}
#gp-info{flex:1;min-width:0;padding:0 8px;overflow:hidden}
#gp-title{
  font-size:.48rem;letter-spacing:.14em;color:#d4af37;
  text-transform:uppercase;white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis;
}
#gp-sub{
  font-family:'Cormorant Garamond',serif;
  font-size:.68rem;color:rgba(212,175,55,.35);
  letter-spacing:.05em;margin-top:2px;
}
#gp-time{
  font-size:.38rem;letter-spacing:.08em;
  color:rgba(212,175,55,.3);white-space:nowrap;
  flex-shrink:0;margin:0 4px;
}
#gp-sc-frame{
  position:absolute;width:1px;height:1px;
  opacity:0;pointer-events:none;left:-9999px;top:-9999px;
}
/* Espace pou player la anba paj la */
body{ padding-bottom: 64px !important; }
`;

/* ── BUILD DOM ── */
function buildBar(){
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var bar = document.createElement('div');
  bar.id = 'gp-bar';
  bar.innerHTML = `
    <div id="gp-prog-wrap"><div id="gp-prog-bar"></div></div>
    <button class="gp-nav-btn" id="gp-prev">
      <svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
    </button>
    <button id="gp-play-btn">
      <svg id="gp-icon-play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      <svg id="gp-icon-pause" viewBox="0 0 24 24" style="display:none"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
    </button>
    <button class="gp-nav-btn" id="gp-next">
      <svg viewBox="0 0 24 24"><path d="M6 18 14.5 12 6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/></svg>
    </button>
    <div id="gp-info">
      <div id="gp-title">Bnei Ohr</div>
      <div id="gp-sub">Mizik Sakre</div>
    </div>
    <div id="gp-time"></div>
    <iframe id="gp-sc-frame" allow="autoplay" src=""></iframe>
  `;
  document.body.appendChild(bar);
}

/* ── HELPERS ── */
function fmt(ms){
  if(!ms||isNaN(ms)) return '';
  var s=Math.floor(ms/1000), m=Math.floor(s/60);
  s=s%60; return m+':'+(s<10?'0':'')+s;
}
function setIcons(p){
  playing = p;
  document.getElementById('gp-icon-play').style.display  = p?'none':'';
  document.getElementById('gp-icon-pause').style.display = p?'':'none';
}
function updateInfo(){
  document.getElementById('gp-title').textContent = PLAYLIST[idx].title;
  document.getElementById('gp-sub').textContent   = 'Bnei Ohr';
  document.getElementById('gp-prog-bar').style.width = '0%';
  document.getElementById('gp-time').textContent = '';
}

/* ── SOUNDCLOUD WIDGET ── */
function initWidget(){
  var frame = document.getElementById('gp-sc-frame');
  var enc   = encodeURIComponent(PLAYLIST[idx].sc);
  frame.src = 'https://w.soundcloud.com/player/?url='+enc
    +'&color=%23d4af37&auto_play=false&hide_related=true'
    +'&show_comments=false&show_user=false&show_reposts=false';

  // Charge l'API si pas encore chargée
  if(window.SC){
    connectWidget(frame);
  } else {
    var api = document.createElement('script');
    api.src = 'https://w.soundcloud.com/player/api.js';
    api.onload = function(){ connectWidget(frame); };
    document.head.appendChild(api);
  }
}

function connectWidget(frame){
  widget = SC.Widget(frame);
  widget.bind(SC.Widget.Events.READY, function(){
    scReady = true;
    // Restore état depuis localStorage
    try {
      var saved = JSON.parse(localStorage.getItem('gp_state')||'{}');
      if(saved.idx !== undefined){ idx = saved.idx; updateInfo(); }
    } catch(e){}
  });
  widget.bind(SC.Widget.Events.PLAY,  function(){ setIcons(true); saveState(); });
  widget.bind(SC.Widget.Events.PAUSE, function(){ setIcons(false); saveState(); });
  widget.bind(SC.Widget.Events.FINISH, function(){
    idx = (idx+1) % PLAYLIST.length;
    loadTrack(idx, true);
  });
  widget.bind(SC.Widget.Events.PLAY_PROGRESS, function(e){
    widget.getDuration(function(dur){
      if(!dur) return;
      var pct = (e.currentPosition/dur)*100;
      document.getElementById('gp-prog-bar').style.width = pct+'%';
      document.getElementById('gp-time').textContent = fmt(e.currentPosition)+' / '+fmt(dur);
    });
  });
}

function loadTrack(i, autoplay){
  idx = i; updateInfo();
  if(!widget){ return; }
  widget.load(PLAYLIST[i].sc, {
    auto_play: !!autoplay,
    buying:false, sharing:false, download:false,
    show_artwork:false, show_comments:false,
    show_playcount:false, show_user:false
  });
  if(autoplay) setIcons(true);
  saveState();
}

function saveState(){
  try{ localStorage.setItem('gp_state', JSON.stringify({idx:idx, playing:playing})); }catch(e){}
}

/* ── EVENTS ── */
function bindEvents(){
  document.getElementById('gp-play-btn').addEventListener('click', function(){
    if(!scReady) return;
    if(playing){ widget.pause(); } else { widget.play(); }
  });
  document.getElementById('gp-prev').addEventListener('click', function(){
    loadTrack((idx-1+PLAYLIST.length)%PLAYLIST.length, playing);
  });
  document.getElementById('gp-next').addEventListener('click', function(){
    loadTrack((idx+1)%PLAYLIST.length, playing);
  });
  document.getElementById('gp-prog-wrap').addEventListener('click', function(e){
    if(!widget||!scReady) return;
    var rect = this.getBoundingClientRect();
    var pct  = (e.clientX - rect.left) / rect.width;
    widget.getDuration(function(dur){ widget.seekTo(Math.floor(pct*dur)); });
  });
}

/* ── INIT ── */
function init(){
  buildBar();
  bindEvents();
  initWidget();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
