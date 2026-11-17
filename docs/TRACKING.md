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
- Hasło admina: tylko na serwerze (`/opt/umami/admin-password.txt`), nie w repo.
- Publiczny HTTPS: do zrobienia domena w Cytrusie (cel `[IPv6]:8091`, wzorzec jak JARVIS), potem `UMAMI_HOST` jest już ustawiony na https://umami.heyoffice.si (CNAME umami -> backend.strony.me w Spaceship, Cytrus -> [IPv6]:8091, LIVE 17.11.2026; BACKUP bazy NIE skonfigurowany, do zrobienia).
- Mierzy bez cookies; zdarzenia jak w dataLayer (`nip_submit`, `cta_click`, `video_start`, `contact_email_click`).
