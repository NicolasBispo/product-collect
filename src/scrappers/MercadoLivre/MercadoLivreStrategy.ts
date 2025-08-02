import { Page, ElementHandle } from "puppeteer";
import { IScrapperStrategy } from "../../core/interfaces/IScrapperStrategy";
import { ProductData } from "../../core/types/ProductData";
import { MercadoLivreSelectors } from "./MercadoLivreSelectors";

/**
 * Estratégia específica para scraping do Mercado Livre
 * Implementa a lógica de extração específica do site
 */
export class MercadoLivreStrategy implements IScrapperStrategy {
  private page: Page | null = null;
  private readonly baseUrl = "https://www.mercadolivre.com.br";
  private selectors: MercadoLivreSelectors;

  constructor() {
    this.selectors = new MercadoLivreSelectors();
  }

  /**
   * Inicializa a estratégia com a página
   */
  async initialize(page: Page): Promise<void> {
    this.page = page;
    await this.navigateToHomePage();
  }

  /**
   * Navega para a página inicial do Mercado Livre
   */
  private async navigateToHomePage(): Promise<void> {
    if (!this.page) {
      throw new Error("Página não inicializada");
    }

    try {
      await this.page.goto(this.baseUrl, { waitUntil: "networkidle2" });
      console.log("✅ Navegou para a página inicial do Mercado Livre");
    } catch (error) {
      console.error("❌ Erro ao navegar para a página inicial:", error);
      throw error;
    }
  }

  /**
   * Realiza busca por um termo específico
   */
  async performSearch(term: string): Promise<void> {
    if (!this.page) {
      throw new Error("Página não inicializada");
    }

    try {
      // Aguarda o campo de busca estar disponível
      const inputSearch = await this.page.waitForSelector(this.selectors.searchInput, {
        timeout: 10000,
      });

      await inputSearch?.click();
      await inputSearch?.type(term);
      await this.page.keyboard.press("Enter");

      console.log(`✅ Busca realizada para: "${term}"`);
    } catch (error) {
      console.error(`❌ Erro ao buscar "${term}":`, error);
      throw error;
    }
  }

  /**
   * Extrai dados de produtos da página atual usando seletores nativos do Puppeteer
   */
  async extractProducts(): Promise<Omit<ProductData, 'source' | 'extractedAt'>[]> {
    if (!this.page) {
      throw new Error("Página não inicializada");
    }

    try {
      // Aguarda os resultados carregarem
      console.log("Aguardando resultados carregarem");
      //await new Promise(resolve => setTimeout(resolve, 100000));

      const productsContainer = await this.page.waitForSelector(this.selectors.productsContainer, {
        timeout: 10000,
      });

      if(!productsContainer) {
        throw new Error("Não foi possível encontrar o container de produtos");
      }

      // Obtém todos os elementos de produtos
      const productElements  = await productsContainer.$$(this.selectors.productItem);
      console.log(productElements);
      const productsData: Omit<ProductData, 'source' | 'extractedAt'>[] = [];

      // Processa cada produto individualmente
      for (const element of productElements) {
        try {
          const product = await this.extractProductData(element);
          if (product) {
            productsData.push(product);
          }
        } catch (error) {
          console.warn("⚠️ Erro ao extrair produto individual:", error);
          // Continua processando outros produtos
        }
      }

      console.log(`✅ Extraídos ${productsData.length} produtos da página atual`);
      return productsData;
    } catch (error) {
      console.error("❌ Erro ao extrair dados dos produtos:", error);
      throw error;
    }
  }

  /**
   * Extrai dados de um produto individual usando seletores nativos
   */
  private async extractProductData(element: ElementHandle<any>): Promise<Omit<ProductData, 'source' | 'extractedAt'> | null> {
    try {
      // Extrai título
      const titleElement = await element.$(this.selectors.title);
      const title = titleElement ? await titleElement.evaluate(el => el.textContent?.trim() || "") : "";

      // Extrai preço
      const priceElement = await element.$(this.selectors.price);
      const price = priceElement ? await priceElement.evaluate(el => el.textContent?.trim() || "") : "";

      // Extrai link
      const linkElement = await element.$(this.selectors.link);
      const link = linkElement ? await linkElement.evaluate(el => {
        const anchor = el as any;
        return anchor.href || "";
      }) : "";

      // Extrai imagem
      const imageElement = await element.$(this.selectors.image);
      const image = imageElement ? await imageElement.evaluate(el => {
        const img = el as any;
        return img.src;
      }) : undefined;

      // Valida se tem os dados mínimos necessários
      if (title && price && link) {
        return {
          title,
          price,
          link,
          image
        };
      }

      return null;
    } catch (error) {
      console.warn("⚠️ Erro ao extrair dados do produto:", error);
      return null;
    }
  }

  /**
   * Navega para a próxima página
   */
  async goToNextPage(): Promise<boolean> {
    if (!this.page) {
      throw new Error("Página não inicializada");
    }

    try {
      const nextPageButton = await this.page.$(this.selectors.nextPageButton);
      
      if (nextPageButton) {
        await nextPageButton.click();
        await this.page.waitForNavigation(); // Aguarda carregamento
        console.log("✅ Navegou para a próxima página");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("❌ Erro ao navegar para próxima página:", error);
      return false;
    }
  }

  /**
   * Verifica se há mais páginas para navegar
   */
  async hasNextPage(): Promise<boolean> {
    if (!this.page) {
      throw new Error("Página não inicializada");
    }

    try {
      const nextPageButton = await this.page.$(this.selectors.nextPageButton);
      return nextPageButton !== null;
    } catch (error) {
      console.error("❌ Erro ao verificar próxima página:", error);
      return false;
    }
  }
} 