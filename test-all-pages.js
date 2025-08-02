const { ScrapperService } = require('./dist/core/services/ScrapperService');

async function testAllPages() {
  console.log('🧪 Iniciando teste de coleta de páginas...');
  
  const scrapperService = new ScrapperService();
  
  try {
    // Configuração para testar com número limitado de páginas
    const config = {
      headless: false, // Mantém o browser visível para debug
      delay: 1000, // Delay reduzido para debug
      maxPages: 5 // Testa com 5 páginas para verificar se funciona
    };
    
    console.log('⚙️ Configuração:', config);
    console.log('🎯 Objetivo: Coletar 5 páginas para teste');
    
    // Executa busca com um termo que provavelmente tenha menos páginas
    const results = await scrapperService.searchInScrapper(
      'mercadolivre',
      ['macbook air'], // Termo de busca específico que deve ter menos páginas
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
      console.log(`   - Modo: 5 páginas limitadas`);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await scrapperService.closeAllScrapers();
    console.log('✅ Teste finalizado');
  }
}

// Executa o teste
testAllPages().catch(console.error); 