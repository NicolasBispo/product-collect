import { IScrapper } from '../interfaces/IScrapper';
import { ProductData } from '../types/ProductData';

/**
 * Classe abstrata base para todos os scrapers
 * Implementa comportamentos comuns e força implementação de métodos específicos
 */
export abstract class BaseScrapper implements IScrapper {
  protected initialized: boolean = false;
  protected readonly source: string;

  constructor(source: string) {
    this.source = source;
  }

  /**
   * Inicializa o scrapper - deve ser implementado pelas subclasses
   */
  abstract initialize(): Promise<void>;

  /**
   * Executa busca para um termo específico - deve ser implementado pelas subclasses
   */
  abstract search(term: string): Promise<ProductData[]>;

  /**
   * Fecha recursos do scrapper - deve ser implementado pelas subclasses
   */
  abstract close(): Promise<void>;

  /**
   * Verifica se o scrapper está inicializado
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Executa busca para múltiplos termos
   * Implementação padrão que pode ser sobrescrita
   */
  async searchMultiple(terms: string[]): Promise<Map<string, ProductData[]>> {
    const results = new Map<string, ProductData[]>();

    for (const term of terms) {
      try {
        console.log(`🔍 Buscando: ${term}`);
        const products = await this.search(term);
        results.set(term, products);
        
        // Delay entre buscas para evitar bloqueio
        await this.delay(2000);
      } catch (error) {
        console.error(`❌ Erro ao buscar "${term}":`, error);
        results.set(term, []);
      }
    }

    return results;
  }

  /**
   * Adiciona metadados aos produtos extraídos
   */
  protected enrichProductData(products: Omit<ProductData, 'source' | 'extractedAt'>[]): ProductData[] {
    return products.map(product => ({
      ...product,
      source: this.source,
      extractedAt: new Date()
    }));
  }

  /**
   * Delay utilitário
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Valida se o scrapper está inicializado
   */
  protected validateInitialized(): void {
    if (!this.initialized) {
      throw new Error(`Scrapper ${this.source} não foi inicializado. Execute initialize() primeiro.`);
    }
  }
} 