import { Router } from 'express';
import { prisma } from '../config/database';

const router = Router();

// DELETE /api/anuncios/clear - Limpa todos os anúncios
router.delete('/clear', async (req, res) => {
  try {
    await prisma.anuncio.deleteMany({});
    
    res.json({
      sucesso: true,
      mensagem: 'Todos os anúncios foram removidos com sucesso'
    });
  } catch (erro) {
    console.error('Erro ao limpar anúncios:', erro);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor',
      mensagem: 'Não foi possível limpar os anúncios'
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

    res.json({
      sucesso: true,
      quantidade: anuncios.length,
      anuncios: anuncios
    });
  } catch (erro) {
    console.error('Erro ao buscar anúncios:', erro);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor',
      mensagem: 'Não foi possível buscar os anúncios'
    });
  }
});

// GET /api/anuncios/:id - Busca anúncio específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const anuncio = await prisma.anuncio.findUnique({
      where: { id }
    });

    if (!anuncio) {
      return res.status(404).json({
        sucesso: false,
        erro: 'Anúncio não encontrado',
        mensagem: `Anúncio com ID ${id} não foi encontrado`
      });
    }

    res.json({
      sucesso: true,
      anuncio: anuncio
    });
  } catch (erro) {
    console.error('Erro ao buscar anúncio:', erro);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor',
      mensagem: 'Não foi possível buscar o anúncio'
    });
  }
});

export { router as anunciosRouter }; 