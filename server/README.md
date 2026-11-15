# Pośrednik /api/nip

Strona pyta `GET /api/nip?nip=…` i dostaje `{ "type": "jdg"|"spzoo", "name": "…", "representative": "…" }`.

Wdrożenie (Cloudflare, w tym folderze):
1. `npx wrangler login`
2. `npx wrangler deploy`
3. (opcjonalnie) `npx wrangler secret put ENGINE_URL` i `ENGINE_KEY` — dane z silnika Szałańskiego zamiast Białej Listy VAT.

Kod nie był testowany na żywo. Sprawdź kilka prawdziwych NIP-ów (JDG i spółka).
