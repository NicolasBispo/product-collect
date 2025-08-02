import express from 'express';
import { anunciosRouter } from './routes/anuncios';
import { conectarBanco, desconectarBanco } from './config/database';
import { requestLogger, errorLogger } from './middleware/errorLogger';
import { LogService } from '../core/services/LogService';

const app = express();
const PORT = process.env.PORT || 3000;
const logService = new LogService();

// Middleware para JSON
app.use(express.json());

// Middleware de logging de requisições
app.use(requestLogger);

// Rotas
app.use('/api/anuncios', anunciosRouter);

// Rota de teste
app.get('/', (_req, res) => {
  res.json({ mensagem: 'API de Anúncios funcionando!' });
});

// Middleware de tratamento de erros (deve ser o último)
app.use(errorLogger);

// Inicializar servidor
async function iniciarServidor() {
  try {
    // Conectar ao banco
    await conectarBanco();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      logService.logInfo(`🚀 Servidor rodando na porta ${PORT}`, 'Server');
      logService.logInfo(`📡 API disponível em http://localhost:${PORT}`, 'Server');
      logService.logInfo(`📋 Endpoints disponíveis:`, 'Server');
      logService.logInfo(`   GET / - Status da API`, 'Server');
      logService.logInfo(`   GET /api/anuncios - Listar todos os anúncios`, 'Server');
      logService.logInfo(`   GET /api/anuncios/:id - Buscar anúncio específico`, 'Server');
      logService.logInfo(`   DELETE /api/anuncios/clear - Limpar todos os anúncios`, 'Server');
      logService.logInfo(`   POST /api/anuncios/classify - Testar classificação híbrida`, 'Server');
      logService.logInfo(`   GET /api/anuncios/logs - Visualizar logs recentes`, 'Server');
      logService.logInfo(`   DELETE /api/anuncios/logs - Limpar logs`, 'Server');
    });
  } catch (erro) {
    logService.logError(erro as Error, 'Server');
    console.error('❌ Erro ao iniciar servidor:', erro);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logService.logInfo('🛑 Encerrando servidor...', 'Server');
  console.log('\n🛑 Encerrando servidor...');
  await desconectarBanco();
  process.exit(0);
});

// Capturar erros não tratados
process.on('uncaughtException', (error) => {
  logService.logError(error, 'UncaughtException');
  console.error('❌ Erro não tratado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logService.logError(new Error(`Unhandled Rejection at: ${promise}, reason: ${reason}`), 'UnhandledRejection');
  console.error('❌ Promise rejeitada não tratada:', reason);
  process.exit(1);
});

iniciarServidor();

export default app; 