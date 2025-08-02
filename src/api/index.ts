import express from 'express';
import { anunciosRouter } from './routes/anuncios';
import { conectarBanco, desconectarBanco } from './config/database';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para JSON
app.use(express.json());

// Rotas
app.use('/api/anuncios', anunciosRouter);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ mensagem: 'API de Anúncios funcionando!' });
});

// Inicializar servidor
async function iniciarServidor() {
  try {
    // Conectar ao banco
    await conectarBanco();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📡 API disponível em http://localhost:${PORT}`);
      console.log(`📋 Endpoints disponíveis:`);
      console.log(`   GET / - Status da API`);
      console.log(`   GET /api/anuncios - Listar todos os anúncios`);
      console.log(`   GET /api/anuncios/:id - Buscar anúncio específico`);
    });
  } catch (erro) {
    console.error('❌ Erro ao iniciar servidor:', erro);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  await desconectarBanco();
  process.exit(0);
});

iniciarServidor();

export default app; 