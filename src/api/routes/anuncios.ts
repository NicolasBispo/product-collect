import { Router } from 'express';
import { prisma } from '../config/database';
import { HybridClassificationService } from '../../core/services/HybridClassificationService';
import { LogService } from '../../core/services/LogService';

const router = Router();
const hybridClassifier = new HybridClassificationService();
const logService = new LogService();

// DELETE /api/anuncios/clear - Limpa todos os anúncios
router.delete('/clear', async (_req, res) => {
  try {
    await prisma.anuncio.deleteMany({});
    
    logService.logInfo('Todos os anúncios foram removidos com sucesso', 'AnunciosController');
    
    res.json({
      sucesso: true,
      mensagem: 'Todos os anúncios foram removidos com sucesso'
    });
  } catch (erro) {
    logService.logError(erro as Error, 'AnunciosController.clear');
    console.error('Erro ao limpar anúncios:', erro);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor',
      mensagem: 'Não foi possível limpar os anúncios'
    });
  }
});

// POST /api/anuncios/classify - Testar classificação híbrida
router.post('/classify', async (req, res) => {
  try {
    const { title } = req.body;
    
    if (!title) {
      logService.logWarning('Tentativa de classificação sem título', 'AnunciosController.classify');
      return res.status(400).json({
        sucesso: false,
        erro: 'Título é obrigatório'
      });
    }

    logService.logInfo(`Iniciando classificação para título: ${title}`, 'AnunciosController.classify');
    
    const result = await hybridClassifier.classifyWithHybrid(title);
    
    logService.logInfo(`Classificação concluída: ${result.type} (confiança: ${result.confidence})`, 'AnunciosController.classify');
    
    return res.json({
      sucesso: true,
      resultado: result,
      estatisticas: hybridClassifier.getClassificationStats()
    });
  } catch (erro) {
    logService.logError(erro as Error, 'AnunciosController.classify');
    console.error('Erro na classificação:', erro);
    return res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor',
      mensagem: 'Não foi possível realizar a classificação'
    });
  }
});

// GET /api/anuncios - Lista todos os anúncios
router.get('/', async (_req, res) => {
  try {
    const anuncios = await prisma.anuncio.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    logService.logInfo(`Listados ${anuncios.length} anúncios`, 'AnunciosController.list');

    return res.json({
      sucesso: true,
      quantidade: anuncios.length,
      anuncios: anuncios
    });
  } catch (erro) {
    logService.logError(erro as Error, 'AnunciosController.list');
    console.error('Erro ao buscar anúncios:', erro);
    return res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor',
      mensagem: 'Não foi possível buscar os anúncios'
    });
  }
});

// GET /api/anuncios/logs - Visualizar logs recentes
router.get('/logs', async (req, res) => {
  try {
    const { type = 'errors', limit = 50 } = req.query;
    
    let logs: string[] = [];
    
    if (type === 'errors') {
      logs = logService.getRecentErrors(Number(limit));
    } else if (type === 'api') {
      logs = logService.getRecentApiLogs(Number(limit));
    } else {
      return res.status(400).json({
        sucesso: false,
        erro: 'Tipo de log inválido',
        mensagem: 'Use "errors" ou "api"'
      });
    }
    
    return res.json({
      sucesso: true,
      tipo: type,
      quantidade: logs.length,
      logs: logs
    });
  } catch (erro) {
    logService.logError(erro as Error, 'AnunciosController.logs');
    return res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor',
      mensagem: 'Não foi possível buscar os logs'
    });
  }
});

// DELETE /api/anuncios/logs - Limpar logs
router.delete('/logs', async (_req, res) => {
  try {
    logService.clearLogs();
    
    return res.json({
      sucesso: true,
      mensagem: 'Logs limpos com sucesso'
    });
  } catch (erro) {
    logService.logError(erro as Error, 'AnunciosController.clearLogs');
    return res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor',
      mensagem: 'Não foi possível limpar os logs'
    });
  }
});

// GET /api/anuncios/custo-beneficio - Lista anúncios ordenados por custo-benefício
router.get('/filtros/custo-beneficio', async (req, res) => {
  try {
    const { tipoProduto, provedorDaBusca } = req.query;
    
    logService.logInfo('Buscando anúncios ordenados por custo-benefício', 'AnunciosController.custoBeneficio');
    
    // Construir filtros
    const where: any = {
      disponivel: true,
      quantidadeEmItens: {
        not: null
      },
      precoEmCentavos: {
        gt: 0
      }
    };
    
    if (tipoProduto) {
      where.tipoProduto = tipoProduto;
    }
    
    if (provedorDaBusca) {
      where.provedorDaBusca = provedorDaBusca;
    }
    
    // Buscar anúncios com quantidade e preço válidos
    const anuncios = await prisma.anuncio.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Calcular custo-benefício e ordenar
    const anunciosComCustoBeneficio = anuncios
      .map(anuncio => {
        const precoEmReais = anuncio.precoEmCentavos / 100;
        const custoBeneficio = precoEmReais / anuncio.quantidadeEmItens!;
        
        return {
          ...anuncio,
          precoEmReais,
          custoBeneficio,
          precoPorUnidade: custoBeneficio
        };
      })
      .sort((a, b) => a.custoBeneficio - b.custoBeneficio); // Menor custo-benefício primeiro (melhor)
    
    logService.logInfo(`Encontrados ${anunciosComCustoBeneficio.length} anúncios com melhor custo-benefício`, 'AnunciosController.custoBeneficio');
    
    return res.json({
      sucesso: true,
      quantidade: anunciosComCustoBeneficio.length,
      ordenacao: 'Menor custo-benefício primeiro (melhor oferta)',
      anuncios: anunciosComCustoBeneficio.map(anuncio => ({
        id: anuncio.id,
        tituloAnuncio: anuncio.tituloAnuncio,
        precoEmReais: anuncio.precoEmReais,
        precoEmCentavos: anuncio.precoEmCentavos,
        quantidadeEmItens: anuncio.quantidadeEmItens,
        precoPorUnidade: anuncio.precoPorUnidade,
        custoBeneficio: anuncio.custoBeneficio,
        tipoProduto: anuncio.tipoProduto,
        provedorDaBusca: anuncio.provedorDaBusca,
        link: anuncio.link,
        disponivel: anuncio.disponivel,
        createdAt: anuncio.createdAt
      }))
    });
  } catch (erro) {
    logService.logError(erro as Error, 'AnunciosController.custoBeneficio');
    console.error('Erro ao buscar anúncios por custo-benefício:', erro);
    return res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor',
      mensagem: 'Não foi possível buscar os anúncios por custo-benefício'
    });
  }
});

// GET /api/anuncios/custo-beneficio/estatisticas - Estatísticas de custo-benefício
router.get('/custo-beneficio/estatisticas', async (req, res) => {
  try {
    const { tipoProduto, provedorDaBusca } = req.query;
    
    logService.logInfo('Gerando estatísticas de custo-benefício', 'AnunciosController.custoBeneficioStats');
    
    // Construir filtros
    const where: any = {
      disponivel: true,
      quantidadeEmItens: {
        not: null
      },
      precoEmCentavos: {
        gt: 0
      }
    };
    
    if (tipoProduto) {
      where.tipoProduto = tipoProduto;
    }
    
    if (provedorDaBusca) {
      where.provedorDaBusca = provedorDaBusca;
    }
    
    // Buscar anúncios com quantidade e preço válidos
    const anuncios = await prisma.anuncio.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Calcular estatísticas
    const anunciosComCustoBeneficio = anuncios.map(anuncio => {
      const precoEmReais = anuncio.precoEmCentavos / 100;
      const custoBeneficio = precoEmReais / anuncio.quantidadeEmItens!;
      return { ...anuncio, precoEmReais, custoBeneficio };
    });
    
    if (anunciosComCustoBeneficio.length === 0) {
      return res.json({
        sucesso: true,
        mensagem: 'Nenhum anúncio encontrado com dados válidos para cálculo de custo-benefício',
        estatisticas: {
          totalAnuncios: 0,
          mediaPrecoPorUnidade: 0,
          menorPrecoPorUnidade: 0,
          maiorPrecoPorUnidade: 0,
          desvioPadrao: 0,
          porTipoProduto: []
        }
      });
    }
    
    const precosPorUnidade = anunciosComCustoBeneficio.map(a => a.custoBeneficio);
    const media = precosPorUnidade.reduce((sum, preco) => sum + preco, 0) / precosPorUnidade.length;
    const menor = Math.min(...precosPorUnidade);
    const maior = Math.max(...precosPorUnidade);
    
    // Calcular desvio padrão
    const variancia = precosPorUnidade.reduce((sum, preco) => sum + Math.pow(preco - media, 2), 0) / precosPorUnidade.length;
    const desvioPadrao = Math.sqrt(variancia);
    
    // Agrupar por tipo de produto
    const porTipoProduto = anunciosComCustoBeneficio.reduce((acc, anuncio) => {
      const tipo = anuncio.tipoProduto;
      if (!acc[tipo]) {
        acc[tipo] = [];
      }
      acc[tipo].push(anuncio);
      return acc;
    }, {} as Record<string, any[]>);
    
    const estatisticasPorTipo = Object.entries(porTipoProduto).map(([tipo, anuncios]) => {
      const precos = anuncios.map(a => a.custoBeneficio);
      const mediaTipo = precos.reduce((sum, preco) => sum + preco, 0) / precos.length;
      const menorTipo = Math.min(...precos);
      const maiorTipo = Math.max(...precos);
      
      return {
        tipoProduto: tipo,
        quantidade: anuncios.length,
        mediaPrecoPorUnidade: mediaTipo,
        menorPrecoPorUnidade: menorTipo,
        maiorPrecoPorUnidade: maiorTipo
      };
    });
    
    logService.logInfo(`Estatísticas geradas para ${anunciosComCustoBeneficio.length} anúncios`, 'AnunciosController.custoBeneficioStats');
    
    return res.json({
      sucesso: true,
      estatisticas: {
        totalAnuncios: anunciosComCustoBeneficio.length,
        mediaPrecoPorUnidade: media,
        menorPrecoPorUnidade: menor,
        maiorPrecoPorUnidade: maior,
        desvioPadrao: desvioPadrao,
        porTipoProduto: estatisticasPorTipo
      }
    });
  } catch (erro) {
    logService.logError(erro as Error, 'AnunciosController.custoBeneficioStats');
    console.error('Erro ao gerar estatísticas de custo-benefício:', erro);
    return res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor',
      mensagem: 'Não foi possível gerar as estatísticas de custo-benefício'
    });
  }
});

// GET /api/anuncios/custo-beneficio/faixa-preco - Busca anúncios por faixa de preço por unidade
router.get('/custo-beneficio/faixa-preco', async (req, res) => {
  try {
    const { minPreco, maxPreco, tipoProduto, provedorDaBusca } = req.query;
    
    if (!minPreco || !maxPreco) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Parâmetros obrigatórios',
        mensagem: 'minPreco e maxPreco são obrigatórios'
      });
    }
    
    logService.logInfo(`Buscando anúncios com preço por unidade entre R$ ${minPreco} e R$ ${maxPreco}`, 'AnunciosController.custoBeneficioFaixa');
    
    // Construir filtros
    const where: any = {
      disponivel: true,
      quantidadeEmItens: {
        not: null
      },
      precoEmCentavos: {
        gt: 0
      }
    };
    
    if (tipoProduto) {
      where.tipoProduto = tipoProduto;
    }
    
    if (provedorDaBusca) {
      where.provedorDaBusca = provedorDaBusca;
    }
    
    // Buscar anúncios com quantidade e preço válidos
    const anuncios = await prisma.anuncio.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Calcular custo-benefício e filtrar por faixa
    const anunciosComCustoBeneficio = anuncios
      .map(anuncio => {
        const precoEmReais = anuncio.precoEmCentavos / 100;
        const custoBeneficio = precoEmReais / anuncio.quantidadeEmItens!;
        return { ...anuncio, precoEmReais, custoBeneficio };
      })
      .filter(anuncio => {
        const precoPorUnidade = anuncio.custoBeneficio;
        return precoPorUnidade >= Number(minPreco) && precoPorUnidade <= Number(maxPreco);
      })
      .sort((a, b) => a.custoBeneficio - b.custoBeneficio); // Menor custo-benefício primeiro
    
    logService.logInfo(`Encontrados ${anunciosComCustoBeneficio.length} anúncios na faixa de preço especificada`, 'AnunciosController.custoBeneficioFaixa');
    
    return res.json({
      sucesso: true,
      quantidade: anunciosComCustoBeneficio.length,
      faixaPreco: {
        min: Number(minPreco),
        max: Number(maxPreco)
      },
      ordenacao: 'Menor custo-benefício primeiro (melhor oferta)',
      anuncios: anunciosComCustoBeneficio.map(anuncio => ({
        id: anuncio.id,
        tituloAnuncio: anuncio.tituloAnuncio,
        precoEmReais: anuncio.precoEmReais,
        precoEmCentavos: anuncio.precoEmCentavos,
        quantidadeEmItens: anuncio.quantidadeEmItens,
        precoPorUnidade: anuncio.custoBeneficio,
        tipoProduto: anuncio.tipoProduto,
        provedorDaBusca: anuncio.provedorDaBusca,
        link: anuncio.link,
        disponivel: anuncio.disponivel,
        createdAt: anuncio.createdAt
      }))
    });
  } catch (erro) {
    logService.logError(erro as Error, 'AnunciosController.custoBeneficioFaixa');
    console.error('Erro ao buscar anúncios por faixa de preço:', erro);
    return res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor',
      mensagem: 'Não foi possível buscar os anúncios por faixa de preço'
    });
  }
});

// GET /api/anuncios/:id - Busca anúncio específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    logService.logInfo(`Buscando anúncio com ID: ${id}`, 'AnunciosController.getById');
    
    const anuncio = await prisma.anuncio.findUnique({
      where: { id }
    });

    if (!anuncio) {
      logService.logWarning(`Anúncio com ID ${id} não encontrado`, 'AnunciosController.getById');
      return res.status(404).json({
        sucesso: false,
        erro: 'Anúncio não encontrado',
        mensagem: `Anúncio com ID ${id} não foi encontrado`
      });
    }

    logService.logInfo(`Anúncio ${id} encontrado com sucesso`, 'AnunciosController.getById');

    return res.json({
      sucesso: true,
      anuncio: anuncio
    });
  } catch (erro) {
    logService.logError(erro as Error, 'AnunciosController.getById');
    console.error('Erro ao buscar anúncio:', erro);
    return res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor',
      mensagem: 'Não foi possível buscar o anúncio'
    });
  }
});

export { router as anunciosRouter }; 