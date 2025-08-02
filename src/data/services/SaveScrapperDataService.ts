import { AnuncioService } from "./AnuncioService";
import { ProductData } from "../../core";
import { classificaProduto, extrairTotalDeUnidadesDoTitulo } from "../../static/itens_buscaveis";
import DataCleanerService from "./DataCleanerService";

export default class SaveScrapperDataService {
  private anuncioService = new AnuncioService();


  async saveData(data: Map<string, ProductData[]>, provedorDaBusca: string) {
    for (const [_, products] of data) {
      for (const product of products) {
        const anuncioExistente = await this.anuncioService.encontrarAnuncioPorLink(product.link);
        if (anuncioExistente) {
          console.log(`Anúncio ${product.title} com link ${product.link} já existe`);
          continue;
        } else {
          const precoEmCentavos = DataCleanerService.limparStringPreco(product.price).transformPriceToCentavos();
          await this.anuncioService.criarAnuncio({
            link: product.link,
            tituloAnuncio: product.title,
            precoEmCentavos,
            quantidadeEmItens: extrairTotalDeUnidadesDoTitulo(product.title),
            provedorDaBusca: provedorDaBusca,
            tipoProduto: classificaProduto(product.title),
          })
        }
      }
    }
  }



}