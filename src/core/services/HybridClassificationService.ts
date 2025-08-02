import { AIClassificationService } from './AIClassificationService';
import { ClassificationResult, HybridClassificationConfig } from '../types/AIClassification';
import { TipoProduto } from '../prisma';
import { classificaProduto, extrairTotalDeUnidadesDoTitulo } from '../../static/itens_buscaveis';
import { LogService } from './LogService';

export class HybridClassificationService {
  private aiService: AIClassificationService;
  private config: HybridClassificationConfig;
  private logService: LogService;
  
  constructor(config?: Partial<HybridClassificationConfig>) {
    this.aiService = new AIClassificationService();
    this.logService = new LogService();
    this.config = {
      aiConfidenceThreshold: 0.8,
      mechanicalConfidenceThreshold: 0.7,
      enableAI: false, // Desabilitar IA por padrão devido a problemas com modelos
      ...config
    };
    
    this.logService.logInfo(`Serviço híbrido inicializado - IA: ${this.config.enableAI}`, 'HybridClassificationService');
  }

  async classifyWithHybrid(title: string): Promise<ClassificationResult> {
    this.logService.logInfo(`Iniciando classificação híbrida para: ${title}`, 'HybridClassificationService');
    
    // 1. Análise mecânica (rápida)
    const mechanicalResult = this.mechanicalAnalysis(title);
    this.logService.logInfo(`Análise mecânica: ${mechanicalResult.type} (confiança: ${mechanicalResult.confidence})`, 'HybridClassificationService');
    
    // 2. Se confiança alta, usar resultado mecânico
    if (mechanicalResult.confidence >= this.config.mechanicalConfidenceThreshold) {
      this.logService.logInfo('Usando resultado mecânico (confiança alta)', 'HybridClassificationService');
      return mechanicalResult;
    }
    
    // 3. Se IA habilitada e confiança mecânica baixa, usar IA
    if (this.config.enableAI) {
      try {
        this.logService.logInfo('Tentando classificação com IA', 'HybridClassificationService');
        const aiResult = await this.aiService.classifyProduct(title);
        
        // 4. Comparar e escolher melhor resultado
        if (aiResult.confidence > mechanicalResult.confidence) {
          this.logService.logInfo(`IA melhor que mecânica: ${aiResult.confidence} > ${mechanicalResult.confidence}`, 'HybridClassificationService');
          return {
            ...aiResult,
            method: 'hybrid' as const
          };
        } else {
          this.logService.logInfo(`Mecânica melhor que IA: ${mechanicalResult.confidence} >= ${aiResult.confidence}`, 'HybridClassificationService');
        }
      } catch (error) {
        this.logService.logError(error as Error, 'HybridClassificationService.classifyWithHybrid');
        console.error('Erro na classificação IA, usando mecânica:', error);
      }
    } else {
      this.logService.logInfo('IA desabilitada, usando apenas classificação mecânica', 'HybridClassificationService');
    }
    
    return mechanicalResult;
  }

  private mechanicalAnalysis(title: string): ClassificationResult {
    const type = classificaProduto(title);
    const quantity = extrairTotalDeUnidadesDoTitulo(title);
    const confidence = this.calculateMechanicalConfidence(title, type);
    
    this.logService.logInfo(`Análise mecânica: tipo=${type}, quantidade=${quantity}, confiança=${confidence}`, 'HybridClassificationService');
    
    return {
      type,
      confidence,
      extractedInfo: { 
        quantity: quantity || undefined,
        components: this.extractComponentsFromTitle(title),
        brand: this.extractBrandFromTitle(title)
      },
      method: 'mechanical'
    };
  }

  private calculateMechanicalConfidence(title: string, type: TipoProduto): number {
    const lowerTitle = title.toLowerCase();
    
    // Palavras-chave específicas para cada tipo
    const keywords: Record<TipoProduto, string[]> = {
      equipo_e_frasco: ['kit', 'combo', 'pacote', 'conjunto'],
      frasco: ['frasco', 'garrafa', 'recipiente', 'frs'],
      equipo: ['equipo', 'tubo', 'sonda', 'extensor'],
      seringa: ['seringa', 'seringas'],
      outro: []
    };
    
    const relevantKeywords = keywords[type] || [];
    if (relevantKeywords.length === 0) return 0.5;
    
    const matches = relevantKeywords.filter(keyword => 
      lowerTitle.includes(keyword)
    ).length;
    
    const confidence = Math.min(matches / relevantKeywords.length, 1);
    this.logService.logInfo(`Confiança mecânica calculada: ${matches}/${relevantKeywords.length} = ${confidence}`, 'HybridClassificationService');
    
    return confidence;
  }

  private extractComponentsFromTitle(title: string): string[] {
    const lowerTitle = title.toLowerCase();
    const components: string[] = [];
    
    if (lowerTitle.includes('frasco') || lowerTitle.includes('frs')) {
      components.push('frasco');
    }
    if (lowerTitle.includes('equipo') || lowerTitle.includes('equipos')) {
      components.push('equipo');
    }
    if (lowerTitle.includes('seringa') || lowerTitle.includes('seringas')) {
      components.push('seringa');
    }
    
    return components;
  }

  private extractBrandFromTitle(title: string): string | undefined {
    const brands = ['nutrimed', 'nestle', 'trophic', 'biobase', 'isosource'];
    const lowerTitle = title.toLowerCase();
    
    for (const brand of brands) {
      if (lowerTitle.includes(brand)) {
        return brand;
      }
    }
    
    return undefined;
  }

  // Método para atualizar configuração
  updateConfig(newConfig: Partial<HybridClassificationConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.logService.logInfo(`Configuração atualizada: ${JSON.stringify(newConfig)}`, 'HybridClassificationService');
  }

  // Método para obter estatísticas de classificação
  getClassificationStats(): { aiEnabled: boolean; config: HybridClassificationConfig } {
    return {
      aiEnabled: this.config.enableAI,
      config: this.config
    };
  }
} 