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
  async navigateToHomePage(): Promise<void> {
    if (!this.page) {
      throw new Error("Página não inicializada");
    }

    try {
      console.log("🌐 Navegando para a página inicial do Mercado Livre...");
      console.log("⏳ Aguardando carregamento da página (timeout: 60s)...");
      
      await this.page.goto(this.baseUrl, { 
        waitUntil: "networkidle2",
        timeout: 60000 // Aumenta timeout para 60 segundos
      });
      
      console.log("✅ Navegou para a página inicial do Mercado Livre");
      console.log(`🌐 URL atual: ${this.page.url()}`);
    } catch (error) {
      console.error("❌ Erro ao navegar para a página inicial:", error);
      console.log("🔍 Tentando verificar se a página carregou parcialmente...");
      
      try {
        const currentUrl = this.page.url();
        console.log(`🌐 URL atual após erro: ${currentUrl}`);
        
        if (currentUrl.includes('mercadolivre.com.br')) {
          console.log("✅ Página carregou parcialmente, continuando...");
          return;
        }
      } catch (urlError) {
        console.error("❌ Não foi possível obter URL atual:", urlError);
      }
      
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
      console.log(`🔍 Iniciando busca por: "${term}"`);
      
      // Aguarda o campo de busca estar disponível
      console.log("⏳ Aguardando campo de busca estar disponível...");
      const inputSearch = await this.page.waitForSelector(this.selectors.searchInput, {
        timeout: 10000,
      });

      if (!inputSearch) {
        throw new Error("Campo de busca não encontrado");
      }

      console.log("📝 Preenchendo campo de busca...");
      await inputSearch.click();
      await this.page.keyboard.down('Control');
      await this.page.keyboard.press('KeyA');
      await this.page.keyboard.up('Control');
      await inputSearch.type(term);
      
      console.log("↵ Pressionando Enter para realizar busca...");
      await this.page.keyboard.press("Enter");

      console.log("⏳ Aguardando resultados da busca carregarem...");
      await this.page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 });

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
      console.log("🔍 Iniciando extração de produtos da página atual...");
      
      // Aguarda os resultados carregarem
      console.log("⏳ Aguardando container de produtos carregar...");
      const productsContainer = await this.page.waitForSelector(this.selectors.productsContainer, {
        timeout: 15000,
      });

      if(!productsContainer) {
        throw new Error("Não foi possível encontrar o container de produtos");
      }

      console.log("✅ Container de produtos encontrado");

      // Obtém todos os elementos de produtos
      console.log("🔍 Buscando elementos de produtos...");
      const productElements = await productsContainer.$$(this.selectors.productItem);
      console.log(`📊 Encontrados ${productElements.length} elementos de produtos na página`);

      const productsData: Omit<ProductData, 'source' | 'extractedAt'>[] = [];

      // Processa cada produto individualmente
      console.log("🔄 Iniciando processamento individual dos produtos...");
      for (let i = 0; i < productElements.length; i++) {
        try {
          console.log(`📦 Processando produto ${i + 1}/${productElements.length}...`);
          const element = productElements[i];
          if (element) {
            const product = await this.extractProductData(element);
            if (product) {
              productsData.push(product);
              console.log(`✅ Produto ${i + 1} extraído com sucesso: ${product.title.substring(0, 50)}...`);
            } else {
              console.log(`⚠️ Produto ${i + 1} não pôde ser extraído (dados insuficientes)`);
            }
          } else {
            console.log(`⚠️ Elemento ${i + 1} é undefined, pulando...`);
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao extrair produto ${i + 1}:`, error);
          // Continua processando outros produtos
        }
      }

      console.log(`✅ Extraídos ${productsData.length} produtos válidos da página atual`);
      
      // Log adicional sobre navegação
      console.log("🔍 Verificando disponibilidade de próxima página...");
      const hasNext = await this.hasNextPage();
      if (hasNext) {
        console.log("📄 Há mais páginas disponíveis para coleta");
      } else {
        console.log("🏁 Última página alcançada");
      }
      
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
      console.log("🔍 Verificando se existe botão de próxima página...");
      
      // Aguarda um pouco para garantir que a página carregou completamente
      await new Promise(resolve => setTimeout(resolve, 1000)); // Reduzido de 2000ms para 1000ms
      
      const nextPageButton = await this.page.$(this.selectors.nextPageButton);
      
      if (nextPageButton) {
        console.log("✅ Botão de próxima página encontrado");
        
        // Verifica se o botão está visível e habilitado
        const isVisible = await nextPageButton.isVisible();
        const isEnabled = await nextPageButton.evaluate(el => {
          const button = el as any;
          return !button.disabled && !button.classList.contains('disabled');
        });
        
        console.log(`📊 Status do botão - Visível: ${isVisible}, Habilitado: ${isEnabled}`);
        
        if (!isVisible || !isEnabled) {
          console.log("⚠️ Botão de próxima página não está disponível para clique");
          return false;
        }
        
        console.log("➡️ Navegando para a próxima página...");
        
        // Aguarda o botão estar clicável
        await this.page.waitForSelector(this.selectors.nextPageButton, { 
          visible: true, 
          timeout: 5000 
        });
        
        // Clica no botão
        await nextPageButton.click();
        
        console.log("⏳ Aguardando navegação completar...");
        
        // Aguarda a navegação completar
        await this.page.waitForNavigation({ 
          waitUntil: 'networkidle2',
          timeout: 15000 
        });
        
        console.log("✅ Navegou para a próxima página com sucesso");
        
        // Aguarda um pouco mais para garantir que a nova página carregou
        await new Promise(resolve => setTimeout(resolve, 1500)); // Reduzido de 3000ms para 1500ms
        
        return true;
      } else {
        console.log("ℹ️ Não há botão de próxima página disponível");
        return false;
      }
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
      console.log("🔍 Verificando se há próxima página disponível...");
      
      // Aguarda um pouco para garantir que a página carregou
      await new Promise(resolve => setTimeout(resolve, 500)); // Reduzido de 1000ms para 500ms
      
      const nextPageButton = await this.page.$(this.selectors.nextPageButton);
      
      if (nextPageButton) {
        console.log("✅ Botão de próxima página encontrado");
        
        // Verifica se o botão está visível e habilitado
        const isVisible = await nextPageButton.isVisible();
        const isEnabled = await nextPageButton.evaluate(el => {
          const button = el as any;
          return !button.disabled && !button.classList.contains('disabled');
        });
        
        const hasNext = isVisible && isEnabled;
        console.log(`📊 Status da próxima página - Visível: ${isVisible}, Habilitado: ${isEnabled}, Disponível: ${hasNext}`);
        return hasNext;
      }
      
      console.log("ℹ️ Não há botão de próxima página");
      return false;
    } catch (error) {
      console.error("❌ Erro ao verificar próxima página:", error);
      return false;
    }
  }

  /**
   * Função de debug para verificar seletores na página atual
   */
  async debugSelectors(): Promise<void> {
    if (!this.page) {
      throw new Error("Página não inicializada");
    }

    try {
      console.log("🔍 === DEBUG SELETORES ===");
      
      // Verifica container de produtos
      const productsContainer = await this.page.$(this.selectors.productsContainer);
      console.log(`📦 Container de produtos encontrado: ${productsContainer ? 'SIM' : 'NÃO'}`);
      
      if (productsContainer) {
        const productItems = await productsContainer.$$(this.selectors.productItem);
        console.log(`📊 Elementos de produtos encontrados: ${productItems.length}`);
      }
      
      // Verifica botão de próxima página
      const nextPageButton = await this.page.$(this.selectors.nextPageButton);
      console.log(`➡️ Botão próxima página encontrado: ${nextPageButton ? 'SIM' : 'NÃO'}`);
      
      if (nextPageButton) {
        const isVisible = await nextPageButton.isVisible();
        const isEnabled = await nextPageButton.evaluate(el => {
          const button = el as any;
          return !button.disabled && !button.classList.contains('disabled');
        });
        console.log(`📊 Status do botão - Visível: ${isVisible}, Habilitado: ${isEnabled}`);
      }
      
      // Verifica URL atual
      const currentUrl = this.page.url();
      console.log(`🌐 URL atual: ${currentUrl}`);
      
      console.log("🔍 === FIM DEBUG SELETORES ===");
    } catch (error) {
      console.error("❌ Erro no debug de seletores:", error);
    }
  }
} 