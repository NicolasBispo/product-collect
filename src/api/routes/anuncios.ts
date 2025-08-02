import { Router } from 'express';
import { prisma } from '../config/database';
import { HybridClassificationService } from '../../core/services/HybridClassificationService';
import { LogService } from '../../core/services/LogService';

const router = Router();
const hybridClassifier = new HybridClassificationService();
const logService = new LogService();

// DELETE /api/anuncios/clear - Limpa todos os anúncios
router.delete('/clear', async (req, res) => {
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
    
    res.json({
      sucesso: true,
      resultado: result,
      estatisticas: hybridClassifier.getClassificationStats()
    });
  } catch (erro) {
    logService.logError(erro as Error, 'AnunciosController.classify');
    console.error('Erro na classificação:', erro);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor',
      mensagem: 'Não foi possível realizar a classificação'
    });
  }
});

// GET /api/anuncios - Lista todos os anúncios
router.get('/', async (req, res) => {
  try {
    const anuncios = await prisma.anuncio.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    logService.logInfo(`Listados ${anuncios.length} anúncios`, 'AnunciosController.list');

    res.json({
      sucesso: true,
      quantidade: anuncios.length,
      anuncios: anuncios
    });
  } catch (erro) {
    logService.logError(erro as Error, 'AnunciosController.list');
    console.error('Erro ao buscar anúncios:', erro);
    res.status(500).json({
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
    
    res.json({
      sucesso: true,
      tipo: type,
      quantidade: logs.length,
      logs: logs
    });
  } catch (erro) {
    logService.logError(erro as Error, 'AnunciosController.logs');
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor',
      mensagem: 'Não foi possível buscar os logs'
    });
  }
});

// DELETE /api/anuncios/logs - Limpar logs
router.delete('/logs', async (req, res) => {
  try {
    logService.clearLogs();
    
    res.json({
      sucesso: true,
      mensagem: 'Logs limpos com sucesso'
    });
  } catch (erro) {
    logService.logError(erro as Error, 'AnunciosController.clearLogs');
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor',
      mensagem: 'Não foi possível limpar os logs'
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

    res.json({
      sucesso: true,
      anuncio: anuncio
    });
  } catch (erro) {
    logService.logError(erro as Error, 'AnunciosController.getById');
    console.error('Erro ao buscar anúncio:', erro);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor',
      mensagem: 'Não foi possível buscar o anúncio'
    });
  }
});

export { router as anunciosRouter }; 