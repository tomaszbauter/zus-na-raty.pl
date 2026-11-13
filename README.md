# zus-na-raty.pl — landing (wersja 4.0)

Statyczna strona: HTML + CSS + JavaScript bez bibliotek i bez budowania.

```
index.html          struktura, SEO (title, meta, JSON-LD)
css/style.css       wszystkie style (media queries: 900 / 700 / 560 / 400 px)
js/app.js           logika: wybór pakietu i płatności, rabat Black Friday,
                    walidacja formularza, okno promocji, film
assets/video.mp4    film (15 s, bez dźwięku, 1920x1080)
assets/poster.jpg   klatka podglądowa filmu
assets/hero.webp    zdjęcie w górnej części strony
```

Uruchomienie lokalne: `python3 -m http.server` w tym folderze i otwórz http://localhost:8000

## Do zrobienia przed wdrożeniem
- Strona ma `<meta name="robots" content="noindex, nofollow">` — usuń przy publikacji.
- Brak zaplecza: zamówienie pokazuje tylko podgląd potwierdzenia; brak płatności (BLIK, karta, PayPo) i pobierania danych firmy po NIP. Kontrola NIP to tylko suma kontrolna w przeglądarce.
- Brak regulaminu i polityki prywatności (zgoda w formularzu bez linków).
- Black Friday: okno po 10 s (js/app.js, setTimeout 10000), rabat −20% po kliknięciu oferty, liczony od netto; strona nie sprawdza daty — okno trzeba wyłączyć ręcznie po 30 listopada.
- Ceny: JDG 699 zł netto, spółka z o.o. 1 499 zł netto, VAT 23% (stałe BASE w js/app.js oraz teksty w index.html i JSON-LD).
- Czcionka Figtree z Google Fonts (link w index.html).
- Dane firmy: Inter-Sellers Group Sp. z o.o., Złota 75A, 00-819 Warszawa, KRS 0000810683, NIP 6762572985, bok@zus-na-raty.pl.
