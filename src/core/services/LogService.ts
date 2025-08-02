import fs from 'fs';
import path from 'path';

export class LogService {
  private logDir: string;
  private errorLogPath: string;
  private apiLogPath: string;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.errorLogPath = path.join(this.logDir, 'errors.log');
    this.apiLogPath = path.join(this.logDir, 'api.log');
    
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private writeToFile(filePath: string, message: string) {
    try {
      const logEntry = `[${this.formatTimestamp()}] ${message}\n`;
      fs.appendFileSync(filePath, logEntry);
    } catch (error) {
      console.error('Erro ao escrever no arquivo de log:', error);
    }
  }

  logError(error: Error, context?: string) {
    const errorMessage = `ERROR ${context ? `[${context}]` : ''}: ${error.message}\nStack: ${error.stack}`;
    console.error(errorMessage);
    this.writeToFile(this.errorLogPath, errorMessage);
  }

  logApiError(error: Error, endpoint: string, method: string, userId?: string) {
    const errorMessage = `API ERROR [${method} ${endpoint}] ${userId ? `[User: ${userId}]` : ''}: ${error.message}\nStack: ${error.stack}`;
    console.error(errorMessage);
    this.writeToFile(this.errorLogPath, errorMessage);
  }

  logApiRequest(method: string, endpoint: string, statusCode: number, responseTime: number, userId?: string) {
    const logMessage = `API REQUEST [${method} ${endpoint}] Status: ${statusCode} Time: ${responseTime}ms ${userId ? `[User: ${userId}]` : ''}`;
    this.writeToFile(this.apiLogPath, logMessage);
  }

  logInfo(message: string, context?: string) {
    const logMessage = `INFO ${context ? `[${context}]` : ''}: ${message}`;
    console.log(logMessage);
    this.writeToFile(this.apiLogPath, logMessage);
  }

  logWarning(message: string, context?: string) {
    const logMessage = `WARNING ${context ? `[${context}]` : ''}: ${message}`;
    console.warn(logMessage);
    this.writeToFile(this.errorLogPath, logMessage);
  }

  getRecentErrors(limit: number = 50): string[] {
    try {
      if (!fs.existsSync(this.errorLogPath)) {
        return [];
      }
      
      const content = fs.readFileSync(this.errorLogPath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      return lines.slice(-limit);
    } catch (error) {
      console.error('Erro ao ler arquivo de log:', error);
      return [];
    }
  }

  getRecentApiLogs(limit: number = 50): string[] {
    try {
      if (!fs.existsSync(this.apiLogPath)) {
        return [];
      }
      
      const content = fs.readFileSync(this.apiLogPath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      return lines.slice(-limit);
    } catch (error) {
      console.error('Erro ao ler arquivo de log da API:', error);
      return [];
    }
  }

  clearLogs() {
    try {
      if (fs.existsSync(this.errorLogPath)) {
        fs.unlinkSync(this.errorLogPath);
      }
      if (fs.existsSync(this.apiLogPath)) {
        fs.unlinkSync(this.apiLogPath);
      }
      this.logInfo('Logs limpos com sucesso', 'LogService');
    } catch (error) {
      console.error('Erro ao limpar logs:', error);
    }
  }
} 