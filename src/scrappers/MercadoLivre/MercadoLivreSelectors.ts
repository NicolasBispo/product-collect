/**
 * Seletores CSS específicos do Mercado Livre
 * Centraliza todos os seletores para facilitar manutenção
 */
export class MercadoLivreSelectors {
  // Campo de busca
  readonly searchInput = '#cb1-edit';

  // Container de produtos - seletores alternativos para maior compatibilidade
  readonly productsContainer = '#root-app > div > div.ui-search-main.ui-search-main--without-header.ui-search-main--only-products > section, .ui-search-main .ui-search-results';

  readonly productItem = "li.ui-search-layout__item, .ui-search-layout__item";

  // Elementos dos produtos
  readonly title = '.poly-component__title, .ui-search-item__title';
  readonly price = '.andes-money-amount__fraction, .price-tag-fraction';
  readonly link = '.poly-component__title-wrapper a, .ui-search-item__title a';
  readonly image = 'img';

  // Navegação - múltiplos seletores para maior compatibilidade
  readonly nextPageButton = '.andes-pagination__button--next a, .andes-pagination__button.andes-pagination__button--next a, [data-testid="pagination-next"], .andes-pagination__button--next, .ui-search-pagination__next';

  // Outros seletores úteis
  readonly searchResultsContainer = '#root-app > div > div.ui-search-main.ui-search-main--only-products.ui-search-main--with-topkeywords > section > div:nth-child(5) > ol';
  readonly productTitleWrapper = '.component__title-wrapper > a';
} 