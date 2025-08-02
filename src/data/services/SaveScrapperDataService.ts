import { AnuncioService } from "./AnuncioService";
import { ProductData } from "../../core";
import { classificaProduto, extrairTotalDeUnidadesDoTitulo } from "../../static/itens_buscaveis";
import DataCleanerService from "./DataCleanerService";
import { HybridClassificationService } from "../../core/services/HybridClassificationService";

export default class SaveScrapperDataService {
  private anuncioService = new AnuncioService();
  private hybridClassifier = new HybridClassificationService();

  async saveData(data: Map<string, ProductData[]>, provedorDaBusca: string) {
    for (const [_, products] of data) {
      for (const product of products) {
        const anuncioExistente = await this.anuncioService.encontrarAnuncioPorLink(product.link);
        if (anuncioExistente) {
          console.log(`Anúncio ${product.title} com link ${product.link} já existe`);
          continue;
        } else {
          const precoEmCentavos = DataCleanerService.limparStringPreco(product.price).transformPriceToCentavos();
          
          // Usar classificação híbrida
          const classification = await this.hybridClassifier.classifyWithHybrid(product.title);
          
          await this.anuncioService.criarAnuncio({
            link: product.link,
            tituloAnuncio: product.title,
            precoEmCentavos,
            quantidadeEmItens: classification.extractedInfo.quantity || extrairTotalDeUnidadesDoTitulo(product.title),
            provedorDaBusca: provedorDaBusca,
            tipoProduto: classification.type,
          })
        }
      }
    }
  }
}