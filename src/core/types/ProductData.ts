/**
 * Dados de um produto extraído pelo scrapper
 */
export interface ProductData {
  title: string;
  price: string;
  link: string;
  image?: string;
  source: string; // Origem do produto (ex: "mercadolivre", "amazon")
  extractedAt: Date;
} 