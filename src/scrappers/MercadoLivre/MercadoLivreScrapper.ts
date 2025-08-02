import puppeteer, { Browser, Page } from "puppeteer";
import { BaseScrapper } from "../../core/abstract/BaseScrapper";
import { ProductData } from "../../core/types/ProductData";
import { MercadoLivreStrategy } from "./MercadoLivreStrategy";

/**
 * Scrapper específico para o Mercado Livre
 * Implementa a lógica específica do site
 */
export class MercadoLivreScrapper extends BaseScrapper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private strategy: MercadoLivreStrategy;
  private config: MercadoLivreConfig;

  constructor(config: MercadoLivreConfig = {}) {
    super('mercadolivre');
    this.config = {
      headless: false,
      delay: 1000, // Reduzido de 2000ms para 1000ms
      maxPages: 3, // Aumenta o padrão para 3 páginas
      ...config
    };
    this.strategy = new MercadoLivreStrategy();
  }

  /**
   * Inicializa o browser e a página
   */
  async initialize(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        headless: this.config?.headless ?? false,
        defaultViewport: null,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      this.page = await this.browser.newPage();

      // Configurar user agent para evitar detecção de bot
      await this.page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      // Inicializar a estratégia
      await this.strategy.initialize(this.page);

      this.initialized = true;
      console.log("✅ MercadoLivre Scrapper inicializado com sucesso");
    } catch (error) {
      console.error("❌ Erro ao inicializar MercadoLivre Scrapper:", error);
      throw error;
    }
  }

  /**
   * Executa busca para um termo específico
   */
  async search(term: string): Promise<ProductData[]> {
    this.validateInitialized();

    try {
      console.log(`🔍 Buscando no MercadoLivre: ${term}`);
      console.log(`⚙️ Configuração: maxPages=${this.config?.maxPages ?? 1}, delay=${this.config?.delay ?? 2000}ms`);
      
      // 1. Navegar para homepage e realizar busca
      console.log("🏠 Navegando para página inicial...");
      await this.strategy.navigateToHomePage();
      
      console.log("🔍 Realizando busca...");
      await this.strategy.performSearch(term);
      
      const allProducts: Omit<ProductData, 'source' | 'extractedAt'>[] = [];
      let currentPage = 1;

      // 2. Extrair produtos de todas as páginas disponíveis
      while (this.shouldContinuePagination(currentPage)) {
        console.log(`\n📄 === PROCESSANDO PÁGINA ${currentPage} ===`);
        
        // Aguarda um pouco para garantir que a página carregou completamente
        console.log("⏳ Aguardando carregamento da página...");
        await this.delay(500); // Reduzido de 1000ms para 500ms
        
        // Extrai produtos da página atual
        console.log("🔄 Iniciando extração de produtos da página atual...");
        const products = await this.strategy.extractProducts();
        allProducts.push(...products);
        
        console.log(`📊 Total de produtos coletados até agora: ${allProducts.length}`);

        // Debug dos seletores após extração
        console.log("🔍 Executando debug dos seletores...");
        await this.strategy.debugSelectors();

        // 3. Verificar se há próxima página
        console.log("🔍 Verificando se há próxima página disponível...");
        const hasNext = await this.strategy.hasNextPage();
        
        if (hasNext && this.shouldContinuePagination(currentPage + 1)) {
          console.log(`➡️ Navegando para página ${currentPage + 1}...`);
          const navigationSuccess = await this.strategy.goToNextPage();
          
          if (navigationSuccess) {
            console.log(`⏳ Aguardando ${this.config?.delay ?? 1000}ms antes da próxima coleta...`);
            await this.delay(this.config?.delay ?? 1000);
            currentPage++;
            console.log(`✅ Navegação para página ${currentPage} concluída`);
          } else {
            console.log("⚠️ Falha ao navegar para próxima página, parando coleta");
            break;
          }
        } else {
          if (!hasNext) {
            console.log("🏁 Não há mais páginas disponíveis, finalizando coleta");
          } else {
            console.log(`🏁 Atingiu o limite de páginas, finalizando coleta`);
          }
          break;
        }
      }

      // 4. Enriquecer dados com metadados
      console.log("🔄 Enriquecendo dados com metadados...");
      const enrichedProducts = this.enrichProductData(allProducts);
      
      console.log(`\n🎉 === COLETA FINALIZADA ===`);
      console.log(`✅ Extraídos ${enrichedProducts.length} produtos do MercadoLivre para "${term}"`);
      console.log(`📊 Páginas processadas: ${currentPage - 1}`);
      console.log(`📈 Produtos por página média: ${enrichedProducts.length > 0 ? Math.round(enrichedProducts.length / (currentPage - 1)) : 0}`);
      
      return enrichedProducts;
    } catch (error) {
      console.error(`❌ Erro ao buscar "${term}" no MercadoLivre:`, error);
      throw error;
    }
  }

  /**
   * Verifica se deve continuar a paginação baseado na configuração
   */
  private shouldContinuePagination(currentPage: number): boolean {
    const maxPages = this.config?.maxPages ?? 3;
    
    if (maxPages === 'allPages') {
      return true; // Sempre continua se configurado para todas as páginas
    }
    
    // Se maxPages é um número, verifica se não excedeu o limite
    if (typeof maxPages === 'number') {
      return currentPage <= maxPages;
    }
    
    // Fallback para 3 páginas se não especificado
    return currentPage <= 3;
  }

  /**
   * Fecha recursos do scrapper
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      this.initialized = false;
      console.log("✅ MercadoLivre Scrapper fechado com sucesso");
    }
  }
}

/**
 * Configuração do scrapper do MercadoLivre
 */
export interface MercadoLivreConfig {
  headless?: boolean;
  delay?: number;
  maxPages?: number | 'allPages'; // Suporta número específico ou 'allPages'
} 