// iframe-nav.js — fòse tout lyen entèn chaje anndan iframe a
(function(){
  function fixLinks(){
    var links = document.querySelectorAll('a[href]');
    links.forEach(function(a){
      var href = a.getAttribute('href');
      // Sèlman lyen entèn (pa #anchor, pa mailto, pa http externe, pa javascript)
      if(!href) return;
      if(href.startsWith('#')) return;
      if(href.startsWith('mailto')) return;
      if(href.startsWith('javascript')) return;
      if(href.startsWith('http') && href.indexOf('bneiohr') === -1) return;
      // Si déjà gen target, pa chanje
      if(a.target && a.target !== '' && a.target !== '_self') return;
      a.target = 'site-frame';
    });
  }
  // Run ositò paj la chaje
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', fixLinks);
  } else {
    fixLinks();
  }
  // Re-run pou kontni dinamik (ex: menu ki louvri apre)
  setTimeout(fixLinks, 800);
})();
