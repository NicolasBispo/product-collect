import { HfInference } from '@huggingface/inference';
import { ClassificationResult, AIClassificationResponse } from '../types/AIClassification';
import { TipoProduto } from '../prisma';
import { LogService } from './LogService';

export class AIClassificationService {
  private hf?: HfInference;
  private isEnabled: boolean;
  private logService: LogService;
  
  constructor() {
    const token = process.env.HUGGINGFACE_TOKEN;
    this.isEnabled = !!token;
    this.logService = new LogService();
    
    if (this.isEnabled && token) {
      this.hf = new HfInference(token);
      this.logService.logInfo('Serviço de IA habilitado com token do Hugging Face', 'AIClassificationService');
    } else {
      this.logService.logWarning('Serviço de IA desabilitado - token não encontrado', 'AIClassificationService');
    }
  }

  async classifyProduct(title: string): Promise<ClassificationResult> {
    if (!this.isEnabled || !this.hf) {
      this.logService.logInfo('Usando classificação mecânica (IA desabilitada)', 'AIClassificationService');
      return this.fallbackClassification(title);
    }

    try {
      this.logService.logInfo(`Iniciando classificação IA para: ${title}`, 'AIClassificationService');
      
      // Usar modelo mais simples e disponível
      const result = await this.hf.textClassification({
        model: 'microsoft/DialoGPT-medium', // Modelo mais simples e disponível
        inputs: title,
      });

      this.logService.logInfo(`Classificação IA concluída com ${result.length} resultados`, 'AIClassificationService');
      return this.mapClassificationResult(title, result);
    } catch (error) {
      this.logService.logError(error as Error, 'AIClassificationService.classifyProduct');
      console.error('Erro na classificação IA:', error);
      return this.fallbackClassification(title);
    }
  }

  private mapClassificationResult(title: string, result: AIClassificationResponse[]): ClassificationResult {
    const topResult = result[0];
    
    if (!topResult) {
      this.logService.logWarning('Nenhum resultado da IA encontrado, usando fallback', 'AIClassificationService');
      return this.fallbackClassification(title);
    }
    
    // Mapeamento de labels para tipos do sistema
    const labelMapping: Record<string, TipoProduto> = {
      'kit': 'equipo_e_frasco',
      'frasco': 'frasco', 
      'equipo': 'equipo',
      'seringa': 'seringa',
      'outro': 'outro'
    };

    const mappedType = labelMapping[topResult.label] || 'outro';
    this.logService.logInfo(`IA classificou como: ${topResult.label} -> ${mappedType} (confiança: ${topResult.score})`, 'AIClassificationService');

    return {
      type: mappedType,
      confidence: topResult.score,
      extractedInfo: this.extractInfoFromTitle(title),
      method: 'ai'
    };
  }

  private extractInfoFromTitle(title: string) {
    // Extração básica de informações do título
    const lowerTitle = title.toLowerCase();
    
    const components: string[] = [];
    if (lowerTitle.includes('frasco')) components.push('frasco');
    if (lowerTitle.includes('equipo')) components.push('equipo');
    if (lowerTitle.includes('seringa')) components.push('seringa');

    return {
      quantity: this.extractQuantityFromTitle(title),
      components: components.length > 0 ? components : undefined,
      brand: this.extractBrandFromTitle(title)
    };
  }

  private extractQuantityFromTitle(title: string): number | undefined {
    // Extração básica de quantidade usando regex
    const quantityMatch = title.match(/(\d+)/);
    return quantityMatch && quantityMatch[1] ? parseInt(quantityMatch[1]) : undefined;
  }

  private extractBrandFromTitle(title: string): string | undefined {
    // Extração básica de marca
    const brands = ['nutrimed', 'nestle', 'trophic', 'biobase'];
    const lowerTitle = title.toLowerCase();
    
    for (const brand of brands) {
      if (lowerTitle.includes(brand)) {
        return brand;
      }
    }
    
    return undefined;
  }

  private fallbackClassification(title: string): ClassificationResult {
    // Fallback para classificação básica
    const lowerTitle = title.toLowerCase();
    
    let type: TipoProduto = 'outro';
    let confidence = 0.5;

    const temFrasco = lowerTitle.includes('frasco');
    const temEquipo = lowerTitle.includes('equipo');
    const temSeringa = lowerTitle.includes('seringa');
    const temKit = lowerTitle.includes('kit');

    if (temKit) {
      // Se tem "kit" no título, precisa verificar o conteúdo
      if (temFrasco && temEquipo) {
        type = 'equipo_e_frasco';
        confidence = 0.8;
      } else if (temSeringa && !temFrasco && !temEquipo) {
        type = 'seringa';
        confidence = 0.8;
      } else if (temFrasco && !temEquipo && !temSeringa) {
        type = 'frasco';
        confidence = 0.8;
      } else if (temEquipo && !temFrasco && !temSeringa) {
        type = 'equipo';
        confidence = 0.8;
      } else {
        type = 'equipo_e_frasco';
        confidence = 0.7;
      }
    } else if (temFrasco && temEquipo) {
      type = 'equipo_e_frasco';
      confidence = 0.8;
    } else if (temFrasco) {
      type = 'frasco';
      confidence = 0.7;
    } else if (temEquipo) {
      type = 'equipo';
      confidence = 0.7;
    } else if (temSeringa) {
      type = 'seringa';
      confidence = 0.7;
    }

    this.logService.logInfo(`Classificação mecânica: ${type} (confiança: ${confidence})`, 'AIClassificationService');

    return {
      type,
      confidence,
      extractedInfo: this.extractInfoFromTitle(title),
      method: 'mechanical'
    };
  }
} 