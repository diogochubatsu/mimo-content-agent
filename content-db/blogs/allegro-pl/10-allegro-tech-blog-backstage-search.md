---
title: "Znajdowanie igły w stogu siana - zarządzanie 150,000+ encji w Backstage"
source: "Allegro Tech Blog"
url: "https://blog.allegro.tech/2026/06/taming-backstage-entities-with-a-type-safe-search-and-command-palette.html"
date: "2026-06-16"
summary: "Jak Allegro zbudowało 'Commander' - paletę poleceń ⌘+K do przeszukiwania i zarządzania ponad 150,000 encji w portalu dla deweloperów opartym o Backstage od Spotify."
tags: ["allegro", "tech", "frontend", "Backstage", "TypeScript", "developer portal", "search"]
---

# Znajdowanie igły w stogu siana - Commander w Backstage

## Wyzwanie

Allegro korzysta z Backstage (framework open-source od Spotify) jako portalu dla deweloperów. Problem: ponad 150,000 encji (serwisów, API, bibliotek, zespołów) do przeszukiwania i zarządzania.

## Rozwiązanie: Commander

Commander to stworzona przez Allegro paleta poleceń ⌘+K (keyboard-first) umożliwiająca błyskawiczne wyszukiwanie i zarządzanie encjami.

### Architektura stack-based mini-router

Commander opiera się na innowacyjnej architekturze łączącej:
- **Zaawansowany TypeScript** - zero-boilerplate type safety
- **Zod** - walidacja schema w runtime
- **Client-side caching** - natychmiastowa wydajność

### Kluczowe cechy

1. **Type safety od końca do końca** - dzięki TypeScript i Zod
2. **Instant performance** - cache po stronie klienta
3. **Keyboard-first** - nawigacja wyłącznie z klawiatury
4. **Scalable** - obsługa 150,000+ encji bez spowolnień

## Zastosowane technologie

- TypeScript
- Zod (schema validation)
- React
- Backstage framework
