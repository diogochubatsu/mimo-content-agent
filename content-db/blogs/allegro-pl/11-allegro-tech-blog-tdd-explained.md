---
title: "Dwie szkoły TDD wyjaśnione - podejście czarne i interakcje"
source: "Allegro Tech Blog"
url: "https://blog.allegro.tech/2026/05/two-schools-of-TDD-explained.html"
date: "2026-05-13"
summary: "Porównanie dwóch podejść do Test-Driven Development: klasyczne (black-box, weryfikacja stanu) vs. podejście oparte na interakcjach. Praktyczne przykłady z Kotlin."
tags: ["allegro", "tech", "TDD", "testing", "Kotlin", "software engineering"]
---

# Dwie szkoły TDD wyjaśnione

## Klasyczne podejście TDD (State-based)

W klasycznym podejściu obiekty traktowane są jako "czarne skrzynki". Weryfikacja opiera się na stanie obiektu po wykonaniu operacji.

### Charakterystyka
- Obiekt jest badany z zewnątrz
- Sprawdzamy wynik (stan) po akcji
- Nie interesuje nas wewnętrzna implementacja
- Testy są odporne na zmiany implementacji

## Podejście oparte na interakcjach

W tym podejściu koncentrujemy się na tym, jak obiekty ze sobą współpracują. Sprawdzamy, czy obiekt wywołał oczekiwane metody na swoich zależnościach.

### Charakterystyka
- Sprawdzamy wywołane metody (interakcje)
- Koncentrujemy się na komunikacji między obiektami
- Useful przy testingu złożonych orchestracji
- Wymaga precyzyjnego definiowania mocków

## Kiedy używać którego podejścia

| Podejście | Kiedy używać |
|-----------|-------------|
| State-based | Proste obiekty, logika biznesowa, czyste funkcje |
| Interaction-based | Złożone serwisy, integracje, orchestra pattern |

## Praktyczne wskazówki

1. Zacznij od podejścia state-based - jest prostsze
2. Używaj interakcji gdy testujesz zachowanie w kontekście zależności
3. Nie mieszaj obu podejść w jednym teście
4. Pamiętaj o SOLID - Interakcje są naturalne przy DI
