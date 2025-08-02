import { Request, Response, NextFunction } from 'express';
import { LogService } from '../../core/services/LogService';

const logService = new LogService();

export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const responseTime = Date.now() - startTime;
  
  // Log do erro
  logService.logApiError(
    error,
    req.path,
    req.method,
    req.headers['user-id'] as string
  );

  // Log da requisição
  logService.logApiRequest(
    req.method,
    req.path,
    res.statusCode || 500,
    responseTime,
    req.headers['user-id'] as string
  );

  // Se não foi enviada resposta ainda, enviar erro padrão
  if (!res.headersSent) {
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor',
      mensagem: 'Ocorreu um erro inesperado'
    });
  }

  next(error);
};

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Interceptar o final da resposta
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    logService.logApiRequest(
      req.method,
      req.path,
      res.statusCode,
      responseTime,
      req.headers['user-id'] as string
    );
  });

  next();
};

export const logServiceInstance = logService; 