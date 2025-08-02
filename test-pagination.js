const { ScrapperService } = require('./dist/core/services/ScrapperService');

async function testPagination() {
  console.log('🧪 Iniciando teste de paginação...');
  
  const scrapperService = new ScrapperService();
  
  try {
    // Configuração para testar paginação
    const config = {
      headless: false, // Mantém o browser visível para debug
      delay: 3000, // Delay maior para debug
      maxPages: 3 // Testa até 3 páginas
    };
    
    console.log('⚙️ Configuração:', config);
    
    // Executa busca em uma página específica
    const results = await scrapperService.searchInScrapper(
      'mercadolivre',
      ['iphone'], // Termo de busca simples
      config
    );
    
    console.log('\n📊 Resultados:');
    for (const [term, products] of results) {
      console.log(`\n🔍 Termo: "${term}"`);
      console.log(`📦 Produtos encontrados: ${products.length}`);
      
      // Mostra alguns produtos como exemplo
      products.slice(0, 3).forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.title.substring(0, 60)}...`);
        console.log(`     💰 ${product.price}`);
        console.log(`     🔗 ${product.link.substring(0, 80)}...`);
      });
      
      // Mostra estatísticas de paginação
      console.log(`\n📈 Estatísticas de Paginação:`);
      console.log(`   - Total de produtos: ${products.length}`);
      console.log(`   - Produtos por página estimado: ~50`);
      console.log(`   - Páginas processadas estimadas: ${Math.ceil(products.length / 50)}`);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await scrapperService.closeAllScrapers();
    console.log('✅ Teste finalizado');
  }
}

// Executa o teste
testPagination().catch(console.error); 