/* zus-na-raty.pl: analityka i piksele reklamowe (GTM + Consent Mode v2 + baner zgody).
   Jedyne miejsce do uzupełnienia: GTM_ID. Tagi (GA4, Google Ads, Meta Pixel) konfiguruje się w GTM,
   wg docs/TRACKING.md. Bez zgody nie wczytuje się nic poza GTM z odmową zgód. */
(function () {
  var GTM_ID = 'GTM-5RW5FQSD';
  var KEY = 'znr_consent_v1', w = window, d = document;

  w.dataLayer = w.dataLayer || [];
  function gtag() { w.dataLayer.push(arguments); }

  function read() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }

  function apply(c) {
    gtag('consent', 'update', {
      analytics_storage: c.analytics ? 'granted' : 'denied',
      ad_storage: c.ads ? 'granted' : 'denied',
      ad_user_data: c.ads ? 'granted' : 'denied',
      ad_personalization: c.ads ? 'granted' : 'denied'
    });
    w.dataLayer.push({ event: 'consent_update', consent_analytics: !!c.analytics, consent_ads: !!c.ads });
  }

  /* 1. Domyślnie wszystko odmówione (przed GTM) */
  gtag('consent', 'default', {
    analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied',
    ad_personalization: 'denied', wait_for_update: 500
  });
  gtag('set', 'url_passthrough', true);
  gtag('set', 'ads_data_redaction', true);
  var saved = read();
  if (saved) apply(saved);

  /* 2. GTM */
  if (GTM_ID.indexOf('XXXX') === -1) {
    w.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    var s = d.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    d.head.appendChild(s);
  }

  /* 2b. Umami (własna instancja, bez cookies i bez localStorage, anonimowe, szanuje Do Not Track).
         Włączy się po wpisaniu UMAMI_HOST (adres po domenie w Cytrusie, bez ukośnika na końcu). */
  var UMAMI_HOST = 'https://umami.heyoffice.si'; /* wymaga domeny w Cytrusie + DNS, inaczej skrypt cicho się nie załaduje */
  var UMAMI_ID = '51dbd152-8294-46f3-bef2-1a6ec11b5015';
  if (UMAMI_HOST) {
    var us = d.createElement('script');
    us.defer = true; us.src = UMAMI_HOST + '/script.js';
    us.setAttribute('data-website-id', UMAMI_ID);
    us.setAttribute('data-do-not-track', 'true');
    d.head.appendChild(us);
  }

  /* 3. Zdarzenia (dataLayer + Umami) */
  function ev(name, extra) {
    var o = { event: name }; for (var k in extra) o[k] = extra[k];
    w.dataLayer.push(o);
    try { if (w.umami && w.umami.track) w.umami.track(name, extra || {}); } catch (e) {}
  }
  function validNip(n) {   /* ta sama suma kontrolna co w formularzu, żeby nie liczyć błędnych NIP-ów */
    if (!/^\d{10}$/.test(n)) return false;
    var k = [6, 5, 7, 2, 3, 4, 5, 6, 7], s = 0, i;
    for (i = 0; i < 9; i++) s += k[i] * Number(n.charAt(i));
    return (s % 11) === Number(n.charAt(9));
  }
  d.addEventListener('submit', function (e) {
    if (e.target && e.target.id === 'nip-form') {   /* poprawny NIP = przejście do generatora = lead */
      var f = d.getElementById('z-nip'), n = f ? String(f.value || '').replace(/^\s*PL/i, '').replace(/\D/g, '') : '';
      if (validNip(n)) ev('nip_submit');
    }
  }, true);
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#pakiet"], a.cta, a.btn-main');
    if (a) ev('cta_click', { cta_text: (a.textContent || '').trim().slice(0, 60) });
    var m = e.target.closest && e.target.closest('a[href^="mailto:"]');
    if (m) ev('contact_email_click');
  }, true);
  var v = d.querySelector('video');
  if (v) v.addEventListener('play', function () { ev('video_start'); }, { once: true });

  /* 3b. Ta sama osoba w GA4 po przejściu do generatora (inna domena): client_id z cookie _ga trafia do adresu
         jako utm_znr_cid; formularz NIP przekazuje parametry utm_* dalej, a generator (raty-tracking.js) go odczytuje.
         Tylko gdy jest zgoda analityczna (bez zgody nie ma cookie _ga). */
  function stitch() {
    try {
      var c = read(); if (!c || !c.analytics) return;
      var m = /(?:^|;\s*)_ga=GA\d\.\d\.(\d+\.\d+)/.exec(d.cookie); if (!m) return;
      var u = new URL(location.href);
      if (u.searchParams.get('utm_znr_cid') === m[1]) return;
      u.searchParams.set('utm_znr_cid', m[1]);
      history.replaceState(null, '', u.pathname + u.search + u.hash);
    } catch (e) {}
  }
  [800, 2500, 6000].forEach(function (t) { setTimeout(stitch, t); });
  d.addEventListener('submit', stitch, true);

  /* 4. Baner zgody */
  var CSS = '#znr-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:760px;margin:0 auto;background:#fff;color:#1b2b3c;border:1px solid #d5dde6;border-radius:14px;box-shadow:0 10px 40px rgba(10,30,60,.22);padding:16px 18px;display:flex;gap:16px;align-items:center;flex-wrap:wrap;font-size:14px;line-height:1.45}#znr-consent p{margin:0;flex:1 1 320px}#znr-consent div{display:flex;gap:8px;flex-wrap:wrap}#znr-consent button{font:inherit;font-weight:700;padding:11px 16px;border-radius:10px;border:0;cursor:pointer;background:#1565C0;color:#fff;min-height:44px}#znr-consent button.alt{background:#eef2f6;color:#1b2b3c}';
  function banner() {
    if (read()) return;
    if (!d.getElementById('znr-consent-css')) { var st = d.createElement('style'); st.id = 'znr-consent-css'; st.textContent = CSS; d.head.appendChild(st); }
    var b = d.createElement('div');
    b.id = 'znr-consent'; b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', 'Zgoda na cookies');
    b.innerHTML =
      '<p>Używamy cookies analitycznych i reklamowych (Google, Meta), aby mierzyć skuteczność strony i reklam. ' +
      'Bez Twojej zgody nie zapisujemy ich na urządzeniu. Zgodę możesz cofnąć w każdej chwili (link „Ustawienia cookies” w stopce).</p>' +
      '<div><button type="button" data-a="all">Akceptuję wszystkie</button>' +
      '<button type="button" data-a="none" class="alt">Tylko niezbędne</button></div>';
    d.body.appendChild(b);
    b.addEventListener('click', function (e) {
      var a = e.target.getAttribute && e.target.getAttribute('data-a');
      if (!a) return;
      var c = { analytics: a === 'all', ads: a === 'all', t: Date.now() };
      save(c); apply(c); b.remove();
      /* Tagi zablokowane brakiem zgody nie odpalają się po fakcie, więc dajemy im wyzwalacz po kliknięciu
         (tylko tutaj, nie przy odtwarzaniu zapisanej zgody, żeby nie dublować PageView). */
      if (c.ads) w.dataLayer.push({ event: 'znr_ads_consent' });
    });
  }
  function footerLink() {
    var f = d.querySelector('footer .wrap'); if (!f || d.getElementById('znr-cs')) return;
    var p = d.createElement('p'); p.className = 'ft-note';
    p.innerHTML = '<a href="#" id="znr-cs" style="color:inherit;text-decoration:underline">Ustawienia cookies</a>';
    f.appendChild(p);
    p.firstChild.addEventListener('click', function (e) {
      e.preventDefault(); try { localStorage.removeItem(KEY); } catch (x) {} banner();
    });
  }
  function init() { banner(); footerLink(); }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
})();
