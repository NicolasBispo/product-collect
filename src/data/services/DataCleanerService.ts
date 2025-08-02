export default class DataCleanerService {
  static limparStringPreco(price: string) {
    let precoLimpo = price.replace(/\./g, '').replace(',', '.');
    precoLimpo = precoLimpo.replace('R$', '').trim();
    const valor = Number(precoLimpo);

    return {
      valor,

      transformPriceToCentavos() {
        return valor * 100;
      }
    };
  }
}
