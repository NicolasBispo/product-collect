import { ProductData } from '../types/ProductData';

/**
 * Interface base para todos os scrapers
 * Define o contrato que todos os scrapers devem implementar
 */
export interface IScrapper {
  /**
   * Inicializa o scrapper
   */
  initialize(): Promise<void>;

  /**
   * Executa o scraping para um termo de busca
   */
  search(term: string): Promise<ProductData[]>;

  /**
   * Executa o scraping para múltiplos termos
   */
  searchMultiple(terms: string[]): Promise<Map<string, ProductData[]>>;

  /**
   * Fecha recursos do scrapper
   */
  close(): Promise<void>;

  /**
   * Verifica se o scrapper está inicializado
   */
  isInitialized(): boolean;
} 