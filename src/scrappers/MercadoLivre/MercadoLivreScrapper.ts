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
      delay: 2000,
      maxPages: 1,
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
      
      // Realizar busca
      await this.strategy.performSearch(term);
      
      const allProducts: Omit<ProductData, 'source' | 'extractedAt'>[] = [];
      let currentPage = 1;

      // Extrair produtos de todas as páginas configuradas
      while (currentPage <= (this.config?.maxPages ?? 1)) {
        const products = await this.strategy.extractProducts();
        allProducts.push(...products);

        // Verificar se há próxima página
        if (currentPage < (this.config?.maxPages ?? 1) && await this.strategy.hasNextPage()) {
          await this.strategy.goToNextPage();
          await this.delay(this.config?.delay ?? 2000);
          currentPage++;
        } else {
          break;
        }
      }

      // Enriquecer dados com metadados
      const enrichedProducts = this.enrichProductData(allProducts);
      
      console.log(`✅ Extraídos ${enrichedProducts.length} produtos do MercadoLivre`);
      return enrichedProducts;
    } catch (error) {
      console.error(`❌ Erro ao buscar "${term}" no MercadoLivre:`, error);
      throw error;
    }
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
  maxPages?: number;
} 