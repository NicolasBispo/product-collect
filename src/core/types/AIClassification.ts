import { TipoProduto } from "../prisma";

export interface ClassificationResult {
  type: TipoProduto;
  confidence: number;
  extractedInfo: {
    quantity?: number | undefined;
    components?: string[] | undefined;
    brand?: string | undefined;
  };
  method: 'ai' | 'mechanical' | 'hybrid';
}

export interface AIClassificationResponse {
  label: string;
  score: number;
}

export interface HybridClassificationConfig {
  aiConfidenceThreshold: number;
  mechanicalConfidenceThreshold: number;
  enableAI: boolean;
} 