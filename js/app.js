(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var P = {
    jdg:   { name: 'JDG', net: '699,00', vat: '160,77', gross: '859,77' },
    spzoo: { name: 'Spółka z o.o.', net: '1 499,00', vat: '344,77', gross: '1 843,77' }
  };
  var state = { pkg: 'jdg', pay: 'blik', accept: false, bf: false };
  var BASE = { jdg: 69900, spzoo: 149900 };
  function zl(c) { var n = Math.round(c) / 100; return n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0'); }
  function calc(k) {
    var net = BASE[k], disc = state.bf ? Math.round(net * 0.2) : 0, n = net - disc, vat = Math.round(n * 0.23);
    return { orig: net, disc: disc, net: n, vat: vat, gross: n + vat };
  }
  function priceHtml(k, short) {
    var c = calc(k), o = zl(BASE[k]).replace(',00', '');
    if (!state.bf) return o + ' zł' + (short ? '' : ' <small>netto</small>');
    return '<s style="opacity:.55;font-weight:500">' + o + ' zł</s> ' + zl(c.net) + ' zł' + (short ? '' : ' <small>netto</small>');
  }

  function setText(sel, txt) { $$(sel).forEach(function (e) { e.textContent = txt; }); }

  function render() {
    if (state.pkg !== 'jdg' && state.pay === 'later') state.pay = 'blik';
    $('#pay-later').hidden = state.pkg !== 'jdg';
    var p = P[state.pkg], c = calc(state.pkg);
    p = { name: p.name, net: zl(c.net), vat: zl(c.vat), gross: zl(c.gross) };
    $('#bf-row').hidden = !state.bf;
    setText('#v-disc', zl(c.disc));
    ['jdg', 'spzoo'].forEach(function (k) {
      var b = $('.pkg[data-pkg="' + k + '"]'), g = calc(k);
      b.querySelector('.price').innerHTML = priceHtml(k, false);
      b.querySelector('.gross').textContent = zl(g.gross) + ' zł brutto (VAT 23%)';
    });
    $$('.pkg').forEach(function (b) {
      var on = b.getAttribute('data-pkg') === state.pkg;
      b.classList.toggle('sel', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    $('#f-jdg').hidden = state.pkg !== 'jdg';
    $('#f-spzoo').hidden = state.pkg !== 'spzoo';
    var payBtn = null;
    $$('.pay').forEach(function (b) {
      var on = b.getAttribute('data-pay') === state.pay;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on) payBtn = b;
    });
    var later = state.pay === 'later';
    $('#later-note').hidden = !later;
    $('#s-later').hidden = !later;
    setText('#s-pkg', p.name);
    setText('.v-net', p.net);
    setText('#v-vat', p.vat);
    setText('.v-gross', p.gross);
    setText('#s-pay', payBtn ? payBtn.getAttribute('data-label') : '');
    setText('#v-due', later ? '0,00 zł' : p.gross + ' zł');
    var chk = $('#chk');
    chk.classList.toggle('on', state.accept);
    chk.setAttribute('aria-pressed', state.accept ? 'true' : 'false');
  }

  $$('.pkg').forEach(function (b) {
    b.addEventListener('click', function () { state.pkg = b.getAttribute('data-pkg'); render(); });
  });
  $$('.pay').forEach(function (b) {
    b.addEventListener('click', function () { state.pay = b.getAttribute('data-pay'); render(); });
  });
  $('#chk').addEventListener('click', function () {
    state.accept = !state.accept;
    $('#chk-err').hidden = true;
    $('#chk').classList.remove('bad');
    render();
  });
  function checkOrder() {
    var jdg = state.pkg === 'jdg';
    var list = [
      ['#z-nip', function (v) { return validNip(v.replace(/\D/g, '')); }, 'NIP (10 cyfr)'],
      [jdg ? '#j-name' : '#s-name', function (v) { return v.trim().length > 2; }, jdg ? 'imię i nazwisko' : 'nazwę spółki'],
      jdg ? null : ['#s-rep', function (v) { return v.trim().length > 2; }, 'osobę reprezentującą'],
      [jdg ? '#j-mail' : '#s-mail', function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }, 'poprawny e-mail'],
      [jdg ? '#j-tel' : '#s-tel', function (v) { return v.replace(/\D/g, '').length >= 9; }, 'telefon (min. 9 cyfr)']
    ].filter(Boolean);
    var bad = [], first = null;
    list.forEach(function (it) {
      var el = $(it[0]), ok = it[1](el.value || '');
      el.classList.toggle('bad-in', !ok);
      if (!ok) { bad.push(it[2]); if (!first) first = el; }
    });
    var box = $('#ord-err');
    if (bad.length) {
      box.textContent = 'Uzupełnij: ' + bad.join(', ') + '.';
      box.hidden = false;
      first.focus();
      return false;
    }
    box.hidden = true;
    return true;
  }
  $$('input').forEach(function (i) {
    i.addEventListener('input', function () { i.classList.remove('bad-in'); });
  });
  $('#order').addEventListener('click', function () {
    if (!checkOrder()) return;
    if (!state.accept) {
      $('#chk-err').hidden = false;
      $('#chk').classList.add('bad');
      return;
    }
    setText('#d-pkg', P[state.pkg].name);
    setText('#d-pay', $('.pay.on').getAttribute('data-label'));
    $('#sum').hidden = true;
    $('#done').hidden = false;
  });
  $('#reset').addEventListener('click', function () {
    $('#done').hidden = true;
    $('#sum').hidden = false;
  });

  /* NIP: lokalna kontrola sumy; dane firmy z rejestr.io po podłączeniu zaplecza */
  function validNip(d) {
    if (d.length !== 10) return false;
    var w = [6, 5, 7, 2, 3, 4, 5, 6, 7], s = 0, i;
    for (i = 0; i < 9; i++) s += w[i] * Number(d.charAt(i));
    return (s % 11) === Number(d.charAt(9));
  }
  $('#nip-load').addEventListener('click', function () {
    var d = ($('#z-nip').value || '').replace(/\D/g, '');
    var msg = $('#nip-msg');
    msg.hidden = false;
    if (validNip(d)) {
      msg.textContent = 'NIP poprawny. Uzupełnij dane poniżej.';
      msg.style.color = '#1B6B3F';
    } else {
      msg.textContent = 'Sprawdź NIP: powinien mieć 10 cyfr i poprawną sumę kontrolną.';
      msg.style.color = '#B3261E';
    }
  });
  $('#z-nip').addEventListener('input', function () {
    $('#nip-msg').hidden = true;
  });

  /* Black Friday: okno po 10 s, przycisk po dłuższym czytaniu końca strony, raz */
  var closed = false, timer = null, dwell = null;
  try { if (window.localStorage.getItem('bf26') === '1') closed = true; } catch (e) {}
  function bfClose() {
    closed = true;
    clearTimeout(timer); clearTimeout(dwell);
    try { window.localStorage.setItem('bf26', '1'); } catch (e) {}
    $('#bf-popup').hidden = true;
    $('#bf-pill').hidden = true;
  }
  $$('[data-bf-close]').forEach(function (e) { e.addEventListener('click', bfClose); });
  $$('.bf-go, .bf-pill a').forEach(function (e) {
    e.addEventListener('click', function () { state.bf = true; render(); });
  });
  if (!closed) {
    timer = setTimeout(function () {
      if (closed) return;
      var showBf = function () {
        if (closed) return;
        var a = document.activeElement;
        if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA')) { timer = setTimeout(showBf, 15000); return; }
        $('#bf-pill').hidden = true; $('#bf-popup').hidden = false;
        var cb = $('#bf-popup [data-bf-close]'); if (cb) cb.focus();
      };
      showBf();
    }, 10000);
    window.addEventListener('scroll', function () {
      if (closed) return;
      var el = document.documentElement;
      var nearEnd = (window.innerHeight + (window.scrollY || el.scrollTop)) >= (el.scrollHeight - 260);
      if (nearEnd) {
        if (!dwell) {
          dwell = setTimeout(function () {
            dwell = null;
            if (!closed && $('#bf-popup').hidden) $('#bf-pill').hidden = false;
          }, 8000);
        }
      } else if (dwell) { clearTimeout(dwell); dwell = null; }
    }, { passive: true });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !$('#bf-popup').hidden) bfClose();
  });

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

  render();
})();
