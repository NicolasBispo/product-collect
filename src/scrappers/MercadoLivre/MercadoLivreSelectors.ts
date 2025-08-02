/**
 * Seletores CSS específicos do Mercado Livre
 * Centraliza todos os seletores para facilitar manutenção
 */
export class MercadoLivreSelectors {
  // Campo de busca
  readonly searchInput = '#cb1-edit';

  // Container de produtos
  readonly productsContainer = '#root-app > div > div.ui-search-main.ui-search-main--without-header.ui-search-main--only-products > section';

  readonly productItem = "li.ui-search-layout__item";

  // Elementos dos produtos
  readonly title = '.poly-component__title';
  readonly price = '.andes-money-amount__fraction';
  readonly link = '.poly-component__title-wrapper a';
  readonly image = 'img';

  // Navegação
  readonly nextPageButton = '#root-app > div > div.ui-search-main.ui-search-main--only-products.ui-search-main--with-topkeywords > section > div:nth-child(6) > nav > ul > li.andes-pagination__button.andes-pagination__button--next > a';

  // Outros seletores úteis
  readonly searchResultsContainer = '#root-app > div > div.ui-search-main.ui-search-main--only-products.ui-search-main--with-topkeywords > section > div:nth-child(5) > ol';
  readonly productTitleWrapper = '.component__title-wrapper > a';
} 