# zus-na-raty.pl: paczka do wgrania na serwer (Landing 4.1)

Strona statyczna: HTML + CSS + JavaScript. Bez budowania, bez bazy danych, bez PHP/Node.

## Pliki (wszystkie w jednym folderze)
| Plik | Co to |
|---|---|
| rar.html | strona główna z formularzem (JavaScript wpisany w pliku) |
| style.css | wszystkie style, podpięte do rar.html |
| regulamin.html | regulamin (link ze strony i ze stopki) |
| hero.webp | zdjęcie w górnej części strony (przezroczyste tło) |
| poster.jpg | miniatura filmu |
| video.mp4 | film „Zobacz, jak to działa" (ok. 4,3 MB) |

Wymagania: dowolny hosting plików statycznych z HTTPS (Nginx, Apache, Cloudflare Pages, Netlify, serwer współdzielony). Wszystkie ścieżki są względne, więc folder może leżeć w katalogu głównym albo w podkatalogu.
Czcionka Figtree ładuje się z Google Fonts (fonts.googleapis.com). Poza tym jedyne zewnętrzne zapytanie to Biała Lista VAT (patrz niżej).

## Test po wgraniu
1. Otwórz /rar.html: widać zdjęcie, film się odtwarza, nie ma błędów w konsoli.
2. Punkt 2: wpisz NIP, np. 8471625287. Pola mają się uzupełnić z Białej Listy VAT (wl-api.mf.gov.pl). W podglądzie Claude to nie działa, na waszej domenie ma działać.
3. Sprawdź JDG i spółkę: pole o utracie prawa odstąpienia widać tylko dla JDG i bez niego zamówienia nie da się złożyć.
4. Popup Black Friday pojawia się po 10 s i uwzględnia rabat −20%.
5. Otwórz /regulamin.html i link „Wróć na stronę główną".

## Co zmienić przed startem
- **noindex:** w rar.html (linia 9) jest `<meta name="robots" content="noindex, nofollow">`. Usuń ją, żeby Google mogło indeksować stronę.
- **Adres strony:** `canonical` i `og:url` wskazują https://zus-na-raty.pl/. Jeśli strona ma być pod samą domeną, zmień nazwę rar.html na index.html i w regulamin.html popraw dwa linki `rar.html` na `index.html`.
- **Black Friday:** popup wyłączysz pod koniec listopada (sekcja `<!-- BLACK FRIDAY -->` w rar.html, czyli `#bf-popup` i `#bf-pill`).
- **Silnik Szałańskiego:** w rar.html zmienna `ADRES_SILNIKA` (linia ok. 463) jest pusta. Gdy Mariusz poda adres, wpisz go tam; adres ma zwracać JSON `{ "type": "jdg"|"spzoo", "name": "...", "representative": "..." }`. Do tego czasu dane idą z Białej Listy VAT.
- **E-mail:** kontakt to bok@zus-na-raty.pl (stopka i regulamin).

## Dane firmy (stopka, regulamin, dane strukturalne)
Szałański i Partnerzy Kancelaria Restrukturyzacyjna sp. z o.o., Piękna 24/26A, 00-549 Warszawa, KRS 0000839157, NIP 7010980104, REGON 385968105.

## Ceny na stronie
JDG 699 zł netto / 859,77 zł brutto; spółka z o.o. 1 499 zł netto / 1 843,77 zł brutto (VAT 23%). Z rabatem −20%: JDG 559,20 / 687,82 zł, spółka 1 199,20 / 1 475,02 zł. Ceny są w skrypcie (`BASE`, wartości w groszach). W regulaminie Szałańskiego cena JDG to 599 zł netto, więc do uzgodnienia.

## Czego strona jeszcze NIE robi
- Przycisk „Zamawiam plan spłaty" tylko pokazuje potwierdzenie. Nie zapisuje zamówienia, nie wysyła e-maila i nie obsługuje płatności (BLIK, PayPo). To wymaga zaplecza.
- Nie wysyła klientowi e-mailem treści zgody na utratę prawa odstąpienia (regulamin zakłada, że tak będzie).
- Brak polityki prywatności (do dodania; NIP trafia do Ministerstwa Finansów w zapytaniu do Białej Listy VAT).
- Treść regulaminu i zgody warto pokazać prawnikowi przed startem.
