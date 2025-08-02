import { IScrapper } from '../interfaces/IScrapper';
import { ScrapperFactory, BaseScrapperConfig } from '../factories/ScrapperFactory';

/**
 * Builder para configuração de scrapers
 * Permite configuração fluente e encadeada
 */
export class ScrapperBuilder {
  private type: string = 'mercadolivre';
  private config: BaseScrapperConfig = {};
  private headless: boolean = false;
  private delay: number = 2000;
  private maxPages: number = 1;

  /**
   * Define o tipo de scrapper
   */
  withType(type: string): ScrapperBuilder {
    this.type = type;
    return this;
  }

  /**
   * Define se deve rodar em modo headless
   */
  withHeadless(headless: boolean): ScrapperBuilder {
    this.headless = headless;
    return this;
  }

  /**
   * Define o delay entre buscas
   */
  withDelay(delay: number): ScrapperBuilder {
    this.delay = delay;
    return this;
  }

  /**
   * Define o número máximo de páginas para buscar
   */
  withMaxPages(maxPages: number): ScrapperBuilder {
    this.maxPages = maxPages;
    return this;
  }

  /**
   * Adiciona configuração customizada
   */
  withConfig(config: Partial<BaseScrapperConfig>): ScrapperBuilder {
    this.config = { ...this.config, ...config };
    return this;
  }

  /**
   * Constrói o scrapper com as configurações definidas
   */
  build(): IScrapper {
    const finalConfig = {
      ...this.config,
      headless: this.headless,
      delay: this.delay,
      maxPages: this.maxPages
    };

    return ScrapperFactory.createScrapper(this.type as 'mercadolivre', finalConfig);
  }
} 