# zus-na-raty.pl — landing (wersja 4.1)

Statyczna strona: HTML + CSS + JavaScript bez bibliotek i bez budowania.

Landing nie przyjmuje zamówień i nie zbiera danych. Jego zadaniem jest odesłać
zainteresowanego do generatora wniosku, który prowadzi Szałański i Partnerzy
Kancelaria Restrukturyzacyjna sp. z o.o. Tam klient wypełnia formularz, płaci
i pobiera dokumenty.

```
index.html          struktura, SEO (title, meta, JSON-LD), linki do generatora
css/style.css       wszystkie style (media queries: 900 / 700 / 560 px)
js/app.js           dopisywanie utm_* do linku generatora, film
assets/video.mp4    film (15 s, bez dźwięku, 1920x1080)
assets/poster.jpg   klatka podglądowa filmu
assets/hero.webp    zdjęcie w górnej części strony
```

Uruchomienie lokalne: `python3 -m http.server` w tym folderze i otwórz http://localhost:8000

## Link partnerski

Każdy przycisk „Przejdź do generatora” (klasa `js-gen`, 5 miejsc w `index.html`) prowadzi na:

```
https://szalanskikancelaria.pl/raty-zus/?ref=calmya
```

- `ref=calmya` to kod partnera. Po nim kancelaria przypisuje zamówienie i liczy prowizję. Nie zmieniaj go bez uzgodnienia.
- `js/app.js` dopisuje do linku znaczniki `utm_*` z adresu landingu, żeby kampanie były widoczne po stronie generatora. Inne parametry są pomijane.
- Do linku nie wolno dopisywać danych osobowych (e-mail, telefon, NIP).

## Zasady treści

- Ceny muszą być takie jak w generatorze: JDG 599 zł netto, spółka z o.o. 1 499 zł netto, VAT 23%. Ceny są w trzech miejscach `index.html`: karty pakietów, FAQ i JSON-LD.
- Rabaty i promocje tylko po potwierdzeniu przez kancelarię. Generator ich nie nalicza.
- Nie obiecujemy decyzji ZUS ani jej terminu. Nie używamy słów „gwarancja”, „oddłużenie”, „umorzenie”.
- Nie przypisujemy usłudze elementów, których nie ma: weryfikacji przez specjalistę, złożenia wniosku za klienta, gotowego wniosku „w kilka minut”. Wypełnienie zajmuje około 20 minut.
- Na stronie musi zostać informacja, kto świadczy usługę i wystawia fakturę, oraz zdanie o tym, że decyzję podejmuje ZUS.

## Do zrobienia przed wdrożeniem

- Strona ma `<meta name="robots" content="noindex, nofollow">`. Zostaje do zakończenia testu.
- Generator musi obsługiwać parametr `ref`. Do tego czasu link działa, ale zamówienie nie zostanie przypisane do partnera.
- Bezpośrednie linki do regulaminu i polityki prywatności generatora: dziś strona odsyła po nie do generatora. Podmienić, gdy kancelaria poda adresy.
- Treść oznaczenia o wynagrodzeniu za polecenie (stopka i FAQ) do potwierdzenia z kancelarią.
- Własna polityka prywatności i baner zgód, jeśli dojdzie analityka albo piksele reklamowe. Dziś strona ich nie ma.
- Czcionka Figtree ładuje się z Google Fonts (link w `index.html`), co przekazuje adres IP odwiedzającego do Google. Rozważyć hostowanie lokalne.
- `canonical`, `og:url` i JSON-LD wskazują `https://zus-na-raty.pl/`. Poprawić, jeśli strona zostaje pod innym adresem.
- Dane firmy w stopce: Inter-Sellers Group Sp. z o.o., Złota 75A, 00-819 Warszawa, KRS 0000810683, NIP 6762572985, bok@zus-na-raty.pl.
