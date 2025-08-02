import { ProductData } from '../types/ProductData';

/**
 * Interface para estratégias de scraping específicas
 * Permite diferentes abordagens para extrair dados
 */
export interface IScrapperStrategy {
  /**
   * Navega para a página inicial do site
   */
  navigateToHomePage(): Promise<void>;

  /**
   * Extrai dados de produtos da página atual
   */
  extractProducts(): Promise<Omit<ProductData, 'source' | 'extractedAt'>[]>;

  /**
   * Navega para a próxima página
   */
  goToNextPage(): Promise<boolean>;

  /**
   * Verifica se há mais páginas para navegar
   */
  hasNextPage(): Promise<boolean>;

  /**
   * Realiza busca por um termo específico
   */
  performSearch(term: string): Promise<void>;
} 