// Interfaces
export type { IScrapper } from './interfaces/IScrapper';
export type { IScrapperStrategy } from './interfaces/IScrapperStrategy';

// Types
export type { ProductData } from './types/ProductData';

// Abstract classes
export { BaseScrapper } from './abstract/BaseScrapper';

// Factories
export { ScrapperFactory } from './factories/ScrapperFactory';

// Builders
export { ScrapperBuilder } from './builders/ScrapperBuilder';

// Services
export { ScrapperService } from './services/ScrapperService';

// IA Services
export { AIClassificationService } from './services/AIClassificationService';
export { HybridClassificationService } from './services/HybridClassificationService';

// Logging Services
export { LogService } from './services/LogService';

// IA Types
export * from './types/AIClassification';

// Database
export { prisma, desconectarPrisma } from './prisma';
export type { PrismaClient } from './prisma'; 