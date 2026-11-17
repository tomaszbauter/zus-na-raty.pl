# Tracking zus-na-raty.pl

## Wdrożenie na stronie
W `<head>` strony (przed `style.css`), jako PIERWSZY skrypt:
`<script src="js/tracking.js"></script>` (na produkcji ścieżka wg układu plików, np. `tracking.js` obok `style.css`).
Style baneru: dopisane na końcu `css/style.css` (na produkcji `style.css`).
Wpisz `GTM_ID` w `js/tracking.js`.

## Zdarzenia dataLayer
| Zdarzenie | Kiedy | Użycie |
|---|---|---|
| `nip_submit` | wysłanie formularza NIP (przejście do generatora) | **lead**, konwersja główna Ads/Meta (Lead) |
| `cta_click` | klik w CTA | mikrokonwersja |
| `video_start` | start filmu | mikrokonwersja |
| `contact_email_click` | klik w mail | mikrokonwersja |
| `consent_update` | wybór w banerze | wyzwalacz tagów |

## GTM (do zrobienia w kontenerze)
1. GA4 Configuration: ID pomiaru, zgoda analytics_storage; ustawienia „Konfiguruj domeny” (cross-domain): `szalanskikancelaria.pl`.
2. GA4 Event `generate_lead` na `nip_submit`; zdarzenia pozostałe jak w tabeli.
3. Google Ads: Conversion Linker (zawsze) + tag konwersji „Lead” na `nip_submit` (zgoda ad_storage, ad_user_data).
4. Meta Pixel (szablon Meta): PageView + `Lead` na `nip_submit`; wymaga zgody (ads) — Additional Consent Check.
5. Remarketing: Ads + Meta po zgodzie.

## Zakup (zamówienie opłacone)
Dzieje się na `szalanskikancelaria.pl/raty-zus/` (osobna domena): landing przekazuje `gclid/fbclid/utm_*/ref`
w URL. Zakup mierzyć tam (to wariant C z issue #5: webhook serwerowy + Data Manager/Meta CAPI).
Bez tego Ads/Meta zobaczą tylko Lead, nie sprzedaż.

## Założone konta (17.11.2026)
- GTM: `GTM-5RW5FQSD` (konto „zus-na-raty.pl"), w `js/tracking.js`.
- GA4: usługa „zus-na-raty.pl" (konto 416648444, usługa 564761101), strumień Web, ID pomiaru `G-Y2CDE99DKR`.
  Branża „Biznes i przemysł" (nie „Finanse": ta kategoria ogranicza remarketing), udostępnianie danych Google wyłączone.
- Uwaga: GA4 przy tworzeniu strumienia pokazał własny kontener `GTM-P4QHSLMK`; nie używać, tag GA4 idzie przez nasz GTM.

## Do ustalenia
- Polityka prywatności/cookies (brak linku na stronie; baner jej nie wskazuje).
- ID: GTM, GA4, Google Ads (ID + etykieta konwersji), Meta Pixel (konta nowe, do założenia).

## Umami (własna instancja)
- Serwer: Mikrus ruth119, `/opt/umami` (Umami + Postgres 16 w Dockerze, port 8091, 512 MB + 384 MB limitu pamięci). Strona „zus-na-raty" ma ID `51dbd152-8294-46f3-bef2-1a6ec11b5015`.
- Hasło admina: w Bitwarden Secrets (projekt obsidian-os, klucz `UMAMI_ADMIN_PASSWORD`, serwer EU), plik na serwerze usunięty; nie w repo.
- Publiczny HTTPS: do zrobienia domena w Cytrusie (cel `[IPv6]:8091`, wzorzec jak JARVIS), potem `UMAMI_HOST` jest już ustawiony na https://umami.heyoffice.si (CNAME umami -> backend.strony.me w Spaceship, Cytrus -> [IPv6]:8091, LIVE 17.11.2026; backup: root crontab 3:17, pg_dump do /opt/umami/dumps, 7 kopii; restic -> B2 od 17.11.2026: /opt/umami w paths.txt, bez /opt/umami/db).
- Mierzy bez cookies; zdarzenia jak w dataLayer (`nip_submit`, `cta_click`, `video_start`, `contact_email_click`).

## Meta (konto SiP, 17.11.2026)
- Decyzja: reklamy z konta SiP (portfolio „Szałański i Partnerzy"), Google Ads na razie nie zakładamy.
- Konto reklamowe: „zus-na-raty (SiP)", ID `1860283758731768` (PLN, Europe/Warsaw), brak metody płatności (do dodania przez Mateusza).
- Zestaw danych / Pixel: „zus-na-raty.pl", ID `1801516394259543`, połączony tylko z tym kontem. Osobny od Pixela SiP `796199526884938` (szalanskikancelaria.pl, w `sz-consent`).
- GTM (kontener GTM-5RW5FQSD): tagi `Meta Pixel - PageView` (All Pages) i `Meta Pixel - Lead (nip_submit)`, OPUBLIKOWANE w wersji 3 (17.11.2026), szablon Meta Pixel, wymagana zgoda `ad_storage` + `ad_user_data`, opt-in do „Meta-enabled CAPI" ODZNACZONY (CAPI robimy własne).
- Uwaga: zakup i `Lead` z generatora lecą do Pixela SiP (raty-tracking.js używa `fbq` z sz-consent), nie do Pixela zus-na-raty. Do optymalizacji kampanii na sprzedaż: CAPI na Pixel `1801516394259543` albo dodać drugi `fbq('init')` w generatorze.
- Do zrobienia: weryfikacja domeny `zus-na-raty.pl` w Meta (rekord DNS u Tomasza), metoda płatności, polityka reklam przed startem, test w podglądzie GTM po wgraniu landingu.
