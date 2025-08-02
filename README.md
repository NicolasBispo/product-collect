# Product Collect - Coletor de Produtos do Mercado Livre

Este projeto implementa um sistema de coleta automatizada de dados de produtos do Mercado Livre usando Puppeteer e TypeScript.

## 🚀 Funcionalidades

- ✅ Navegação automatizada no Mercado Livre
- ✅ Busca por múltiplos termos de pesquisa
- ✅ Extração de dados de produtos (título, preço, link, imagem)
- ✅ Tratamento de erros robusto
- ✅ Interface TypeScript bem tipada
- ✅ Logs detalhados do processo

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- Yarn ou npm

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd product-collect
```

2. Instale as dependências:
```bash
yarn install
```

## 🎯 Como usar

### Execução direta
```bash
yarn scrape
```

### Desenvolvimento
```bash
yarn dev
```

### Build para produção
```bash
yarn build
yarn start
```

## 📁 Estrutura do Projeto

```
product-collect/
├── src/
│   ├── scrappers/
│   │   └── MercadoLivre.ts    # Classe principal do scraper
│   ├── static/
│   │   └── ItensBuscaveis.ts  # Lista de itens para busca
│   └── index.ts               # Ponto de entrada da aplicação
├── prisma/
│   └── schema.prisma          # Schema do banco de dados
├── package.json
└── tsconfig.json
```

## 🔧 Configuração

### Itens de Busca
Edite o arquivo `src/static/ItensBuscaveis.ts` para adicionar ou modificar os termos de busca:

```typescript
export const ITENS_BUSCAVEIS = [
  "Frasco de dieta enteral",
  "Equipo de dieta enteral",
  "Seringa 20ML de dieta enteral",
  // Adicione mais itens aqui...
];
```

### Configurações do Scraper
No arquivo `src/scrappers/MercadoLivre.ts`, você pode ajustar:

- **Headless mode**: Altere `headless: false` para `true` em produção
- **Timeouts**: Ajuste os valores de timeout conforme necessário
- **User Agent**: Modifique o user agent se necessário

## 📊 Dados Coletados

Para cada produto encontrado, são extraídos:

- **Título**: Nome do produto
- **Preço**: Valor do produto
- **Link**: URL da página do produto
- **Imagem**: URL da imagem do produto (opcional)

## ⚠️ Considerações Importantes

1. **Respeito aos Termos de Uso**: Este scraper deve ser usado de forma responsável e respeitando os termos de uso do Mercado Livre.

2. **Rate Limiting**: O código inclui delays entre as buscas para evitar sobrecarga no servidor.

3. **User Agent**: Utiliza um user agent realista para evitar detecção de bot.

4. **Tratamento de Erros**: Implementa tratamento robusto de erros para garantir estabilidade.

## 🐛 Solução de Problemas

### Erro de inicialização do browser
- Verifique se o Chrome/Chromium está instalado
- Em sistemas Linux, pode ser necessário instalar dependências adicionais

### Timeout nas buscas
- Aumente os valores de timeout no código
- Verifique a conexão com a internet

### Elementos não encontrados
- O Mercado Livre pode ter alterado a estrutura da página
- Atualize os seletores CSS conforme necessário

## 📝 Logs

O sistema gera logs detalhados durante a execução:

- ✅ Sucessos (verde)
- ❌ Erros (vermelho)
- 🔍 Informações de busca
- 📊 Estatísticas de resultados

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## ⚡ Performance

- **Tempo médio por busca**: ~5-10 segundos
- **Produtos por busca**: ~20-50 produtos
- **Memória utilizada**: ~100-200MB

## 🔮 Próximas Melhorias

- [ ] Suporte a múltiplas páginas de resultados
- [ ] Filtros por preço e categoria
- [ ] Exportação para CSV/JSON
- [ ] Interface web para configuração
- [ ] Integração com banco de dados
- [ ] Sistema de cache para evitar buscas repetidas 