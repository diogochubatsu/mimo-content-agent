# MiMo Content Agent

Fork do [MiMo-Code](https://github.com/XiaomiMiMo/MiMo-Code) especializado em criação de conteúdo automatizado para nichos de importação/sourcing.

## Visão Geral

Sistema autônomo de produção de conteúdo que utiliza:
- **MiMo v2.5** (tokens gratuitos limitados)
- **Arquitetura Medallion** (Bronze → Silver → Gold)
- **Anti-footprint** para evitar penalidades do Google
- **Múltiplos agentes** especializados

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERNET GLOBAL                          │
│         (ZH, EN, ES, PT - Multi-idioma)                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  CAMADA BRONZE (Data Lake)                                  │
│  - Scrapers de 1688, Alibaba, Reddit, TikTok               │
│  - JSONs brutos multi-idioma                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  CAMADA SILVER (Enxame de Agentes)                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │  Scout   │───▶│  Writer  │───▶│  Editor  │             │
│  │ (Busca)  │    │ (Escrita)│    │(Anti-    │             │
│  │          │    │          │    │ Footprint)│             │
│  └──────────┘    └──────────┘    └──────────┘             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  CAMADA GOLD (Conversão)                                    │
│  - Relatórios premium                                      │
│  - Funil para SaaS                                         │
│  - Inteligência de mercado                                  │
└─────────────────────────────────────────────────────────────┘
```

## Agentes

### Scout Agent
- Monitora 1688, Alibaba, Reddit, TikTok
- Encontra produtos trending
- Coleta dados de preços e fornecedores
- Retorna dados estruturados em JSON

### Writer Agent
- Gera artigos SEO-otimizados
- Suporta 3 tiers: Bronze, Silver, Gold
- Inclui tabelas de preço e análise de margem
- Template padronizado

### Editor Agent
- Anti-footprint (evita detecção de IA)
- Reescreve por perfil de site
- Varia sintaxe e vocabulário
- Mantém precisão dos dados

## Quick Start

```bash
# Clonar
git clone https://github.com/diogochubatsu/mimo-content-agent.git
cd mimo-content-agent

# Instalar
bun install

# Rodar workflow diário
mimo run daily-hunt

# Ou rodar agentes individualmente
mimo agent scout "Find trending LED products on 1688"
mimo agent writer "Write bronze article about LED strips"
```

## Configuração

### Agentes
Edite os arquivos em `.mimocode/agents/`:
- `scout.md` - Comportamento do Scout
- `writer.md` - Templates e regras de escrita
- `editor.md` - Técnicas anti-footprint

### Templates
Edite os templates em `content-db/templates/`:
- `bronze.md` - Template para artigos curtos (800-1200 palavras)
- `silver.md` - Template para artigos médios (1500-2500 palavras)
- `gold.md` - Template para artigos premium (3000+ palavras)

### Workflows
Edite os workflows em `.mimocode/workflows/`:
- `daily-hunt.js` - Pipeline diário de produção

---

## Roadmap de Adaptações

### Fase 1: Fundação (Atual)
- [x] Estrutura de agentes (Scout, Writer, Editor)
- [x] Templates Bronze/Silver/Gold
- [x] Workflow diário (daily-hunt)
- [x] Skill content-factory

### Fase 2: Integração com Scrapers
- [ ] Integrar agentes de scraping existentes (1688, Alibaba, ML+Amazon)
- [ ] Criar pipeline de dados Bronze → Silver
- [ ] Implementar cache de dados para reduzir chamadas API
- [ ] Adicionar monitoramento de preços em tempo real

### Fase 3: Publicação Automatizada
- [ ] Integrar com WordPress/Next.js para publicação
- [ ] Criar sistema de agendamento de publicações
- [ ] Implementar A/B testing de títulos
- [ ] Adicionar analytics e tracking de performance

### Fase 4: Otimização Contínua
- [ ] Criar agente de feedback (analisa performance)
- [ ] Implementar learning loop (aprende com dados)
- [ ] Adicionar suporte a múltiplos idiomas
- [ ] Otimizar para Google Discover e News

### Fase 5: Escala
- [ ] Sistema de multiplicação de agentes
- [ ] Infraestrutura de vetores para busca semântica
- [ ] Dashboard de monitoramento
- [ ] API para integração com outros sistemas

---

## Como Outros Agentes Trabalham Neste Fork

### Princípios

1. **Agentes são independentes** - Cada agente tem seu escopo e não depende diretamente de outros
2. **Comunicação via dados** - Agentes se comunicam através de JSON estruturado
3. **Templates definem formato** - Todo conteúdo segue templates predefinidos
4. **Anti-footprint é obrigatório** - Todo conteúdo passa pelo Editor antes de publicar

### Fluxo de Trabalho

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   SCOUT     │────▶│   WRITER    │────▶│   EDITOR    │
│  (Busca)    │     │  (Escrita)  │     │  (Revisão)  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
  [Dados JSON]        [Artigo MD]        [Artigo Único]
```

### Integração com Agentes Existentes

Os agentes de scraping existentes (1688, Alibaba, ML+Amazon) podem se integrar de duas formas:

#### Opção 1: Via Scout Agent
Os agentes de scraping alimentam o Scout com dados brutos:
```
Agente 1688 → Scout → Writer → Editor → Publicação
```

#### Opção 2: Via Pipeline Independente
Os agentes de scraping publicam dados diretamente no content-db:
```
Agente 1688 → content-db/sources.json → Scout lê → Writer → Editor
```

### Adicionando Novos Agentes

Para adicionar um novo agente:

1. Crie o arquivo `.mimocode/agents/nome-agente.md`
2. Defina seu escopo e formato de saída
3. Integre ao workflow existente ou crie novo workflow
4. Teste individualmente antes de integrar ao pipeline

### Exemplo: Agente de Preços

```markdown
# Price Monitor Agent

## Função
Monitorar mudanças de preços em tempo real

## Input
- Lista de produtos para monitorar
- Plataformas alvo

## Output
```json
{
  "product": "LED Strip",
  "old_price": 12.50,
  "new_price": 10.00,
  "change_percent": -20,
  "platform": "1688",
  "detected_at": "2026-07-23T10:00:00Z"
}
```

## Integração
- Alimenta Writer com dados de preço atualizados
- Dispara alertas quando mudança > 10%
```

---

## Estrutura de Diretórios

```
mimo-content-agent/
├── .mimocode/
│   ├── agents/
│   │   ├── scout.md
│   │   ├── writer.md
│   │   └── editor.md
│   ├── workflows/
│   │   └── daily-hunt.js
│   └── skills/
│       └── content-factory/
│           └── SKILL.md
├── content-db/
│   ├── templates/
│   │   ├── bronze.md
│   │   ├── silver.md
│   │   └── gold.md
│   ├── articles/
│   └── sources/
├── packages/
│   └── opencode/
│       └── src/
│           └── ...
└── README.md
```

## Licença

Apache 2.0 (mesma licença do MiMo-Code original)
