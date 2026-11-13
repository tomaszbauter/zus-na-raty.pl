(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Link do generatora: kod partnera (ref) jest w atrybucie href w index.html.
     Tu dopisujemy tylko znaczniki kampanii utm_* z adresu tej strony. Żadnych danych osobowych. */
  (function () {
    var utm = [];
    (window.location.search || '').replace(/^\?/, '').split('&').forEach(function (p) {
      if (/^utm_[a-z]+=[A-Za-z0-9_.~%+-]{1,100}$/.test(p)) utm.push(p);
    });
    if (!utm.length) return;
    $$('a.js-gen').forEach(function (a) {
      a.href = a.getAttribute('href') + '&' + utm.join('&');
    });
  })();


  /* Film: autoplay bez dźwięku, pauza dostępna; bez autoodtwarzania przy ograniczonym ruchu */
  (function () {
    var v = $('#hero-video'), b = $('#vpause');
    function label() { b.textContent = v.paused ? 'Odtwórz' : 'Pauza'; b.setAttribute('aria-label', v.paused ? 'Odtwórz film' : 'Zatrzymaj film'); }
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        en.forEach(function (e) {
          if (e.isIntersecting) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
          else v.pause();
        });
      }, { threshold: 0.4 }).observe(v);
    }
    b.addEventListener('click', function () { if (v.paused) v.play(); else v.pause(); });
    v.addEventListener('play', label); v.addEventListener('pause', label);
    label();
  })();
})();
