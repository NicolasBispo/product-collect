# API de Custo-Benefício - Product Collect

## 📊 Endpoints Disponíveis

### 1. Listar Anúncios por Custo-Benefício
```bash
GET /api/anuncios/filtros/custo-beneficio
```

**Parâmetros de Query (opcionais):**
- `tipoProduto` (opcional): Filtrar por tipo de produto (frasco, equipo, equipo_e_frasco, seringa, outro)
- `provedorDaBusca` (opcional): Filtrar por provedor da busca

**Exemplo de uso:**
```bash
GET /api/anuncios/filtros/custo-beneficio?tipoProduto=frasco
```

**Resposta:**
```json
{
  "sucesso": true,
  "quantidade": 150,
  "ordenacao": "Menor custo-benefício primeiro (melhor oferta)",
  "anuncios": [
    {
      "id": "uuid",
      "tituloAnuncio": "Frasco Nutrição Enteral 300ml",
      "precoEmReais": 25.00,
      "precoEmCentavos": 2500,
      "quantidadeEmItens": 100,
      "precoPorUnidade": 0.25,
      "custoBeneficio": 0.25,
      "tipoProduto": "frasco",
      "provedorDaBusca": "mercadolivre",
      "link": "https://...",
      "disponivel": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. Estatísticas de Custo-Benefício
```bash
GET /api/anuncios/custo-beneficio/estatisticas
```

**Parâmetros de Query (opcionais):**
- `tipoProduto` (opcional): Filtrar por tipo de produto
- `provedorDaBusca` (opcional): Filtrar por provedor da busca

**Exemplo de uso:**
```bash
GET /api/anuncios/custo-beneficio/estatisticas?tipoProduto=equipo_e_frasco
```

**Resposta:**
```json
{
  "sucesso": true,
  "estatisticas": {
    "totalAnuncios": 75,
    "mediaPrecoPorUnidade": 0.35,
    "menorPrecoPorUnidade": 0.15,
    "maiorPrecoPorUnidade": 0.85,
    "desvioPadrao": 0.12,
    "porTipoProduto": [
      {
        "tipoProduto": "equipo_e_frasco",
        "quantidade": 45,
        "mediaPrecoPorUnidade": 0.32,
        "menorPrecoPorUnidade": 0.18,
        "maiorPrecoPorUnidade": 0.65
      }
    ]
  }
}
```

### 3. Buscar por Faixa de Preço
```bash
GET /api/anuncios/custo-beneficio/faixa-preco
```

**Parâmetros de Query (obrigatórios):**
- `minPreco`: Preço mínimo por unidade
- `maxPreco`: Preço máximo por unidade

**Parâmetros de Query (opcionais):**
- `tipoProduto` (opcional): Filtrar por tipo de produto
- `provedorDaBusca` (opcional): Filtrar por provedor da busca

**Exemplo de uso:**
```bash
GET /api/anuncios/custo-beneficio/faixa-preco?minPreco=0.20&maxPreco=0.50&tipoProduto=frasco
```

**Resposta:**
```json
{
  "sucesso": true,
  "quantidade": 25,
  "faixaPreco": {
    "min": 0.20,
    "max": 0.50
  },
  "ordenacao": "Menor custo-benefício primeiro (melhor oferta)",
  "anuncios": [
    {
      "id": "uuid",
      "tituloAnuncio": "Produto Y 200ml",
      "precoEmReais": 40.00,
      "precoEmCentavos": 4000,
      "quantidadeEmItens": 200,
      "precoPorUnidade": 0.20,
      "tipoProduto": "frasco",
      "provedorDaBusca": "mercadolivre",
      "link": "https://...",
      "disponivel": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## 🧮 Como o Custo-Benefício é Calculado

O custo-benefício é calculado usando a fórmula:

```
Custo-Benefício = Preço Total (R$) / Quantidade de Itens
```

**Exemplo:**
- Produto: R$ 25,00 por 100ml
- Custo-benefício: R$ 25,00 ÷ 100 = R$ 0,25 por ml

**Interpretação:**
- **Menor valor** = Melhor custo-benefício
- **Maior valor** = Pior custo-benefício

## 🔍 Filtros Disponíveis

### Por Tipo de Produto:
- `frasco`: Frascos e embalagens
- `equipo`: Equipamentos
- `equipo_e_frasco`: Equipos e frascos (kits)
- `seringa`: Seringas
- `outro`: Outros tipos

### Por Provedor da Busca:
- `mercadolivre`: Anúncios do Mercado Livre
- Outros provedores conforme implementados

## ⚠️ Observações Importantes

1. **Apenas anúncios com quantidade válida** são considerados no cálculo
2. **Apenas anúncios disponíveis** são retornados
3. **Preços em centavos** são convertidos para reais automaticamente
4. **Ordenação sempre do menor para o maior** custo-benefício
5. **Logs detalhados** são gerados para monitoramento
6. **Sem limite de resultados** - retorna todos os dados disponíveis

## 🚀 Exemplos de Uso Prático

### Buscar todos os anúncios ordenados por custo-benefício:
```bash
curl "http://localhost:3000/api/anuncios/filtros/custo-beneficio"
```

### Estatísticas apenas para frascos:
```bash
curl "http://localhost:3000/api/anuncios/custo-beneficio/estatisticas?tipoProduto=frasco"
```

### Estatísticas apenas para equipos e frascos:
```bash
curl "http://localhost:3000/api/anuncios/custo-beneficio/estatisticas?tipoProduto=equipo_e_frasco"
```

### Estatísticas apenas para seringas:
```bash
curl "http://localhost:3000/api/anuncios/custo-beneficio/estatisticas?tipoProduto=seringa"
```

### Anúncios com preço por unidade entre R$ 0,30 e R$ 0,80:
```bash
curl "http://localhost:3000/api/anuncios/custo-beneficio/faixa-preco?minPreco=0.30&maxPreco=0.80"
```

## 📈 Classificação de Produtos

O sistema classifica automaticamente os produtos em:

- **frasco**: Produtos que contêm apenas frascos
- **equipo**: Produtos que contêm apenas equipos
- **equipo_e_frasco**: Produtos que contêm frascos e equipos (kits)
- **seringa**: Produtos que contêm apenas seringas
- **outro**: Outros tipos de produtos

A classificação é feita usando:
1. **Análise de palavras-chave** no título do anúncio
2. **IA com modelo BERT** para casos complexos
3. **Sistema híbrido** que combina ambos os métodos 