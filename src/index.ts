import { ScrapperService } from './core/services/ScrapperService';
import { AnuncioService } from './data/services/AnuncioService';
import SaveScrapperDataService from './data/services/SaveScrapperDataService';
import { ITENS_BUSCAVEIS } from './static/itens_buscaveis';

async function main() {
  const service = new ScrapperService();
  
  try {
    console.log('🚀 Iniciando coleta de dados do Mercado Livre...');
    console.log(`📋 Itens a serem buscados: ${ITENS_BUSCAVEIS.join(', ')}`);
    
    // Executa o scraping usando a nova arquitetura
    const results = await service.searchInScrapper('mercadolivre', ITENS_BUSCAVEIS, {
      headless: false, // Para debug, alterar para true em produção
      maxPages: 1,
      delay: 2000
    });

    const saveScrapperDataService = new SaveScrapperDataService();
    await saveScrapperDataService.saveData(results, 'mercadolivre');

    
    // Exibe os resultados
    console.log('\n📊 Resultados obtidos:');
    console.log('='.repeat(50));
    
    results.forEach((products, searchTerm) => {
      console.log(`\n🔍 "${searchTerm}":`);
      console.log(`   Encontrados: ${products.length} produtos`);
      
      if (products.length > 0) {
        products.slice(0, 3).forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.title}`);
          console.log(`      Preço: ${product.price}`);
          console.log(`      Link: ${product.link}`);
          if (product.image) {
            console.log(`      Imagem: ${product.image}`);
          }
          console.log(`      Fonte: ${product.source}`);
          console.log(`      Extraído em: ${product.extractedAt.toLocaleString()}`);
          console.log('');
        });
        
        if (products.length > 3) {
          console.log(`   ... e mais ${products.length - 3} produtos`);
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Erro durante a execução:', error);
  } finally {
    // Garante que todos os scrapers sejam fechados
    await service.closeAllScrapers();
  }
}

// Executa o programa
if (require.main === module) {
  main().catch(console.error);
}

export default main;
