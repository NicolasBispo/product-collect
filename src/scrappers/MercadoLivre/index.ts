// Re-exportações para manter compatibilidade
export { MercadoLivreScrapper } from './MercadoLivreScrapper';
export { MercadoLivreStrategy } from './MercadoLivreStrategy';
export { MercadoLivreSelectors } from './MercadoLivreSelectors';
export type { MercadoLivreConfig } from './MercadoLivreScrapper';

// Classe legacy para compatibilidade (deprecated)
import { MercadoLivreScrapper } from './MercadoLivreScrapper';

/**
 * @deprecated Use MercadoLivreScrapper instead
 */
export default class MercadoLivre extends MercadoLivreScrapper {
  constructor(config?: any) {
    super(config);
    console.warn('⚠️  MercadoLivre class is deprecated. Use MercadoLivreScrapper instead.');
  }
}
