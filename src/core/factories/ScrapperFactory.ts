import { IScrapper } from '../interfaces/IScrapper';
import { MercadoLivreScrapper, MercadoLivreConfig } from '../../scrappers/MercadoLivre';

/**
 * Configuração base para todos os scrapers
 */
export interface BaseScrapperConfig {
  headless?: boolean;
  delay?: number;
  maxPages?: number;
}

/**
 * Factory para criação de scrapers
 * Centraliza a criação de diferentes tipos de scrapers
 */
export class ScrapperFactory {
  private static readonly SCRAPPERS = {
    'mercadolivre': MercadoLivreScrapper,
    // Adicionar outros scrapers aqui
  } as const;

  /**
   * Cria um scrapper baseado no tipo especificado
   */
  static createScrapper(type: 'mercadolivre', config?: MercadoLivreConfig): IScrapper;
  static createScrapper(type: string, config?: BaseScrapperConfig): IScrapper {
    const ScrapperClass = this.SCRAPPERS[type as keyof typeof this.SCRAPPERS];
    
    if (!ScrapperClass) {
      throw new Error(`Scrapper não suportado: ${type}. Disponíveis: ${this.getAvailableScrappers().join(', ')}`);
    }

    return new ScrapperClass(config);
  }

  /**
   * Retorna lista de scrapers disponíveis
   */
  static getAvailableScrappers(): readonly string[] {
    return Object.keys(this.SCRAPPERS) as readonly string[];
  }

  /**
   * Verifica se um tipo de scrapper é suportado
   */
  static isSupported(type: string): type is keyof typeof this.SCRAPPERS {
    return type in this.SCRAPPERS;
  }
} 