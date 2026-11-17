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

  /* 3. Zdarzenia (dataLayer) */
  function ev(name, extra) {
    var o = { event: name }; for (var k in extra) o[k] = extra[k];
    w.dataLayer.push(o);
  }
  d.addEventListener('submit', function (e) {
    if (e.target && e.target.id === 'nip-form') ev('nip_submit');   /* przejście do generatora = lead */
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
  function banner() {
    if (read()) return;
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
