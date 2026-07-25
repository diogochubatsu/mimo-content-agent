---
title: "Quickstart: Uruchomienie MCP Server na JVM z integracją Copilot"
source: "Allegro Tech Blog"
url: "https://blog.allegro.tech/2025/12/mcp-server-jvm-copilot-quickstart.html"
date: "2025-12-02"
summary: "Poradnik uruchomienia serwera MCP (Model Context Protocol) na JVM i udostępnienia go w Copilot. Wykorzystanie Spring AI do ekspozycji logiki biznesowej na modele AI."
tags: ["allegro", "tech", "AI", "MCP", "JVM", "Spring AI", "Copilot"]
---

# Quickstart: MCP Server na JVM z integracją Copilot

## Czym jest MCP?

MCP (Model Context Protocol) to protokół umożliwiający rozszerzanie możliwości modeli językowych (LLM) o własne narzędzia i zasoby. Pozwala na udostępnianie logiki biznesowej bezpośrednio modelom AI.

## Dlaczego MCP na JVM?

- **Dojrzały ekosystem** - Java/Kotlin mają bogaty ekosystem bibliotek
- **Spring AI** - dedykowane wsparcie dla AI w Spring
- **Wydajność** - JVM oferuje wysoką wydajność dla obciążeń serwerowych
- **Kompatybilność** - istniejące serwisy JVM mogą być łatwo udostępniane

## Kroki uruchomienia

### 1. Utworzenie projektu Spring Boot

```java
@SpringBootApplication
public class McpServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(McpServerApplication.class, args);
    }
}
```

### 2. Konfiguracja MCP Tools

Zdefiniuj narzędzia (tools), które chcesz udostępnić modelowi AI. Każde narzędzie to metoda z opisem, parametrami i logiką biznesową.

### 3. Integracja z Copilot

Skonfiguruj endpoint MCP, aby Copilot mógł odkrywać i wywoływać Twoje narzędzia.

### 4. Testowanie lokalne

Uruchom serwer lokalnie i przetestuj integrację z Copilot w VS Code lub IntelliJ.

## Zastosowania

- Ekspozycja istniejących API na modele AI
- Automatyzacja zadań biznesowych przez AI
- Rozszerzanie Copilot o domenową wiedzę
- Budowanie AI-powered workflow
