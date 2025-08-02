import { ScrapperService } from './core/services/ScrapperService';
import { ScrapperBuilder } from './core/builders/ScrapperBuilder';
import { ScrapperFactory } from './core/factories/ScrapperFactory';

/**
 * Teste da nova arquitetura
 * Verifica se todos os componentes estão funcionando corretamente
 */
async function testArchitecture() {
  console.log('🧪 Testando a nova arquitetura...\n');

  try {
    // Teste 1: Factory
    console.log('1. Testando Factory...');
    const availableScrapers = ScrapperFactory.getAvailableScrappers();
    console.log(`   Scrapers disponíveis: ${availableScrapers.join(', ')}`);
    
    const isSupported = ScrapperFactory.isSupported('mercadolivre');
    console.log(`   MercadoLivre suportado: ${isSupported}`);
    
    // Teste do builder
    console.log('\n🔧 Testando ScrapperBuilder...');
    const scrapperBuilder = new ScrapperBuilder()
      .withType('mercadolivre')
      .withHeadless(false)
      .withDelay(3000)
      .withMaxPages(2)
      .build();

    console.log('✅ ScrapperBuilder funcionando corretamente');
    console.log(`   Tipo do scrapper: ${scrapperBuilder.constructor.name}`);
    
    // Teste 3: Service
    console.log('\n3. Testando Service...');
    const service = new ScrapperService();
    const stats = service.getScrapperStats();
    console.log(`   Estatísticas: ${JSON.stringify(stats)}`);
    
    // Teste 4: Busca simples
    console.log('\n4. Testando busca simples...');
    const results = await service.searchInScrapper('mercadolivre', ['dieta enteral'], {
      headless: true,
      maxPages: 1,
      delay: 1000
    });
    
    console.log(`   Resultados obtidos: ${results.size} termos buscados`);
    results.forEach((products, term) => {
      console.log(`   - "${term}": ${products.length} produtos`);
    });
    
    console.log('\n✅ Todos os testes passaram!');
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
  } finally {
    // Limpar recursos
    const service = new ScrapperService();
    await service.closeAllScrapers();
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  testArchitecture().catch(console.error);
}

export { testArchitecture }; 