import { ScrapperService } from '../core/services/ScrapperService';
import { ScrapperBuilder } from '../core/builders/ScrapperBuilder';
import { BaseScrapperConfig } from '../core/factories/ScrapperFactory';

/**
 * Exemplo de uso da nova arquitetura de scrapers
 * Demonstra os padrões Java-like implementados
 */
export class ScrapperExample {
  private service: ScrapperService;

  constructor() {
    this.service = new ScrapperService();
  }

  /**
   * Exemplo 1: Uso básico com Builder Pattern
   */
  async basicUsage(): Promise<void> {
    console.log('🚀 Exemplo 1: Uso básico com Builder Pattern');
    
    const scrapper = new ScrapperBuilder()
      .withType('mercadolivre')
      .withHeadless(true)
      .withDelay(3000)
      .withMaxPages(2)
      .build();

    try {
      await scrapper.initialize();
      const results = await scrapper.searchMultiple(['dieta enteral', 'suplemento']);
      console.log('✅ Resultados:', results);
    } finally {
      await scrapper.close();
    }
  }

  /**
   * Exemplo 2: Uso com Service Layer
   */
  async serviceLayerUsage(): Promise<void> {
    console.log('🚀 Exemplo 2: Uso com Service Layer');
    
    const terms = ['dieta enteral', 'suplemento alimentar'];
    const config: BaseScrapperConfig = {
      headless: true,
      maxPages: 1
    };
    
    const results = await this.service.searchInScrapper('mercadolivre', terms, config);

    console.log('✅ Resultados do serviço:', results);
  }

  /**
   * Exemplo 3: Múltiplos scrapers (quando implementados)
   */
  async multipleScrapersUsage(): Promise<void> {
    console.log('🚀 Exemplo 3: Múltiplos scrapers');
    
    const scrapers = ['mercadolivre']; // Adicionar outros quando implementados
    const terms = ['dieta enteral'];
    const config: BaseScrapperConfig = {
      headless: true,
      maxPages: 1
    };
    
    const results = await this.service.searchInMultipleScrapers(scrapers, terms, config);

    console.log('✅ Resultados de múltiplos scrapers:', results);
  }

  /**
   * Exemplo 4: Configuração avançada
   */
  async advancedConfiguration(): Promise<void> {
    console.log('🚀 Exemplo 4: Configuração avançada');
    
    const scrapper = new ScrapperBuilder()
      .withType('mercadolivre')
      .withHeadless(false) // Para debug
      .withDelay(5000) // Delay maior
      .withMaxPages(3) // Mais páginas
      .withConfig({
        // Configurações específicas do MercadoLivre
        headless: false,
        delay: 5000,
        maxPages: 3
      })
      .build();

    try {
      await scrapper.initialize();
      const results = await scrapper.search('dieta enteral');
      console.log('✅ Resultados com configuração avançada:', results);
    } finally {
      await scrapper.close();
    }
  }

  /**
   * Executa todos os exemplos
   */
  async runAllExamples(): Promise<void> {
    console.log('🎯 Executando todos os exemplos da nova arquitetura...\n');

    try {
      await this.basicUsage();
      console.log('\n' + '='.repeat(50) + '\n');
      
      await this.serviceLayerUsage();
      console.log('\n' + '='.repeat(50) + '\n');
      
      await this.multipleScrapersUsage();
      console.log('\n' + '='.repeat(50) + '\n');
      
      await this.advancedConfiguration();
      
      console.log('\n✅ Todos os exemplos executados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao executar exemplos:', error);
    } finally {
      await this.service.closeAllScrapers();
    }
  }
} 