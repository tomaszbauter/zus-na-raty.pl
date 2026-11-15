// Pośrednik /api/nip dla zus-na-raty.pl (Cloudflare Worker; ten sam kod działa w Node 18+ po drobnej zmianie eksportu).
// Strona wywołuje: GET /api/nip?nip=1234567890  ->  { "type": "jdg"|"spzoo", "name": "...", "representative": "..." }
//
// Zmienne środowiskowe:
//   ENGINE_URL  (opcjonalnie) adres silnika generatora, np. https://.../api/nip  (zapytanie: ?nip=...)
//   ENGINE_KEY  (opcjonalnie) klucz API silnika, wysyłany jako nagłówek Authorization: Bearer ...
// Bez ENGINE_URL dane idą z publicznej Białej Listy VAT Ministerstwa Finansów.
//
// UWAGA: kod nie był uruchamiany na żywo (brak dostępu do tych usług w środowisku, w którym powstał).
// Przed wdrożeniem przetestuj na kilku prawdziwych numerach NIP (JDG i spółka).

function validNip(d) {
  if (!/^\d{10}$/.test(d)) return false;
  const w = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  let s = 0;
  for (let i = 0; i < 9; i++) s += w[i] * Number(d[i]);
  return s % 11 === Number(d[9]);
}

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

function fromBialaLista(subject) {
  if (!subject) return null;
  const isCompany = !!subject.krs && /sp(ó|o)łk|s\.?a\.?|sp\.\s*z\s*o\.?o/i.test(subject.name || '');
  const rep = (subject.representatives || []).map(r => [r.firstName, r.lastName].filter(Boolean).join(' ') || r.companyName).filter(Boolean)[0] || '';
  return { type: isCompany ? 'spzoo' : 'jdg', name: subject.name || '', representative: isCompany ? rep : '' };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/nip' || request.method !== 'GET') return json({ error: 'not_found' }, 404);
    const nip = (url.searchParams.get('nip') || '').replace(/\D/g, '');
    if (!validNip(nip)) return json({ error: 'bad_nip' }, 400);

    try {
      if (env.ENGINE_URL) {
        const r = await fetch(`${env.ENGINE_URL}?nip=${nip}`, {
          headers: env.ENGINE_KEY ? { Authorization: `Bearer ${env.ENGINE_KEY}` } : {},
        });
        if (!r.ok) return json({ error: 'upstream' }, 502);
        const d = await r.json();
        return json({ type: d.type, name: d.name, representative: d.representative });
      }
      const day = new Date().toISOString().slice(0, 10);
      const r = await fetch(`https://wl-api.mf.gov.pl/api/search/nip/${nip}?date=${day}`, { headers: { Accept: 'application/json' } });
      if (!r.ok) return json({ error: 'upstream' }, 502);
      const d = await r.json();
      const out = fromBialaLista(d && d.result && d.result.subject);
      return out ? json(out) : json({ error: 'not_found' }, 404);
    } catch (e) {
      return json({ error: 'upstream' }, 502);
    }
  },
};
