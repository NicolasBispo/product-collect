# Arquitetura Java-like para Scrapers

Esta arquitetura implementa padrões de design inspirados em Java para criar um sistema de scraping robusto, extensível e manutenível.

## 🏗️ Padrões Implementados

### 1. **Interface Segregation Principle**
- `IScrapper`: Interface base para todos os scrapers
- `IScrapperStrategy`: Interface para estratégias específicas de sites

### 2. **Abstract Classes**
- `BaseScrapper`: Classe abstrata com comportamentos comuns
- Força implementação de métodos específicos nas subclasses

### 3. **Strategy Pattern**
- `MercadoLivreStrategy`: Estratégia específica para o Mercado Livre
- Permite diferentes abordagens para diferentes sites

### 4. **Factory Pattern**
- `ScrapperFactory`: Centraliza criação de scrapers
- Facilita adição de novos scrapers

### 5. **Builder Pattern**
- `ScrapperBuilder`: Configuração fluente e encadeada
- Permite configuração complexa de forma legível

### 6. **Service Layer**
- `ScrapperService`: Lógica de negócio centralizada
- Gerencia múltiplos scrapers

## 📁 Estrutura de Diretórios

```
src/
├── core/
│   ├── interfaces/
│   │   ├── IScrapper.ts
│   │   └── IScrapperStrategy.ts
│   ├── types/
│   │   └── ProductData.ts
│   ├── abstract/
│   │   └── BaseScrapper.ts
│   ├── factories/
│   │   └── ScrapperFactory.ts
│   ├── builders/
│   │   └── ScrapperBuilder.ts
│   ├── services/
│   │   └── ScrapperService.ts
│   └── index.ts
├── scrappers/
│   └── MercadoLivre/
│       ├── MercadoLivreScrapper.ts
│       ├── MercadoLivreStrategy.ts
│       ├── MercadoLivreSelectors.ts
│       └── index.ts
└── examples/
    └── ScrapperExample.ts
```

## 🚀 Como Usar

### Uso Básico com Builder Pattern

```typescript
import { ScrapperBuilder } from './core/builders/ScrapperBuilder';

const scrapper = new ScrapperBuilder()
  .withType('mercadolivre')
  .withHeadless(true)
  .withDelay(3000)
  .withMaxPages(2)
  .build();

await scrapper.initialize();
const results = await scrapper.searchMultiple(['dieta enteral', 'suplemento']);
await scrapper.close();
```

### Uso com Service Layer

```typescript
import { ScrapperService } from './core/services/ScrapperService';

const service = new ScrapperService();
const results = await service.searchInScrapper('mercadolivre', ['dieta enteral'], {
  headless: true,
  maxPages: 1
});
```

### Múltiplos Scrapers

```typescript
const results = await service.searchInMultipleScrapers(
  ['mercadolivre', 'amazon'], // quando implementado
  ['dieta enteral'],
  { headless: true }
);
```

## 🔧 Adicionando Novos Scrapers

1. **Criar Strategy**:
```typescript
export class AmazonStrategy implements IScrapperStrategy {
  // Implementar métodos da interface
}
```

2. **Criar Scrapper**:
```typescript
export class AmazonScrapper extends BaseScrapper {
  // Implementar métodos abstratos
}
```

3. **Registrar no Factory**:
```typescript
private static readonly SCRAPPERS = {
  'mercadolivre': MercadoLivreScrapper,
  'amazon': AmazonScrapper, // Adicionar aqui
};
```

## 🎯 Vantagens da Nova Arquitetura

### ✅ **Extensibilidade**
- Fácil adição de novos scrapers
- Estratégias intercambiáveis
- Configuração flexível

### ✅ **Manutenibilidade**
- Código organizado e modular
- Responsabilidades bem definidas
- Fácil teste unitário

### ✅ **Reutilização**
- Comportamentos comuns na classe base
- Estratégias reutilizáveis
- Configurações padronizadas

### ✅ **Robustez**
- Tratamento de erros centralizado
- Validações consistentes
- Recursos gerenciados automaticamente

## 🔄 Migração da Arquitetura Antiga

A arquitetura antiga ainda é suportada para compatibilidade:

```typescript
// ❌ Antigo (deprecated)
import MercadoLivre from './scrappers/MercadoLivre';

// ✅ Novo
import { MercadoLivreScrapper } from './scrappers/MercadoLivre';
```

## 🧪 Testando

```typescript
import { ScrapperExample } from './examples/ScrapperExample';

const example = new ScrapperExample();
await example.runAllExamples();
```

## 📈 Próximos Passos

1. **Implementar mais scrapers** (Amazon, Magazine Luiza, etc.)
2. **Adicionar persistência** com Repository Pattern
3. **Implementar cache** para evitar requisições desnecessárias
4. **Adicionar métricas** e monitoramento
5. **Implementar retry logic** para falhas temporárias 