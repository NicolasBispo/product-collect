import { IScrapper } from '../interfaces/IScrapper';
import { ProductData } from '../types/ProductData';
import { ScrapperBuilder } from '../builders/ScrapperBuilder';
import { BaseScrapperConfig } from '../factories/ScrapperFactory';

/**
 * Serviço para gerenciar operações de scraping
 * Implementa a lógica de negócio relacionada aos scrapers
 */
export class ScrapperService {
  private scrapers: Map<string, IScrapper> = new Map();

  /**
   * Cria e configura um scrapper
   */
  async createScrapper(type: string, config?: BaseScrapperConfig): Promise<IScrapper> {
    const scrapper = new ScrapperBuilder()
      .withType(type)
      .withConfig(config || {})
      .build();

    await scrapper.initialize();
    this.scrapers.set(type, scrapper);
    
    return scrapper;
  }

  /**
   * Executa busca em múltiplos scrapers
   */
  async searchInMultipleScrapers(
    types: string[], 
    terms: string[], 
    config?: BaseScrapperConfig
  ): Promise<Map<string, Map<string, ProductData[]>>> {
    const results = new Map<string, Map<string, ProductData[]>>();

    for (const type of types) {
      try {
        const scrapper = await this.createScrapper(type, config);
        const scrapperResults = await scrapper.searchMultiple(terms);
        results.set(type, scrapperResults);
        await scrapper.close();
      } catch (error) {
        console.error(`❌ Erro ao executar scrapper ${type}:`, error);
        results.set(type, new Map());
      }
    }

    return results;
  }

  /**
   * Executa busca em um scrapper específico
   */
  async searchInScrapper(
    type: string, 
    terms: string[], 
    config?: BaseScrapperConfig
  ): Promise<Map<string, ProductData[]>> {
    const scrapper = await this.createScrapper(type, config);
    
    try {
      return await scrapper.searchMultiple(terms);
    } finally {
      await scrapper.close();
    }
  }

  /**
   * Fecha todos os scrapers ativos
   */
  async closeAllScrapers(): Promise<void> {
    const closePromises = Array.from(this.scrapers.values()).map(scrapper => 
      scrapper.close().catch(error => 
        console.error('Erro ao fechar scrapper:', error)
      )
    );
    
    await Promise.all(closePromises);
    this.scrapers.clear();
  }

  /**
   * Obtém estatísticas dos scrapers
   */
  getScrapperStats(): { active: number; types: string[] } {
    return {
      active: this.scrapers.size,
      types: Array.from(this.scrapers.keys())
    };
  }
} 