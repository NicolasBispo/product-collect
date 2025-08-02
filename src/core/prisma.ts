import { PrismaClient } from '../../generated/prisma';

// Instância única do PrismaClient para toda a aplicação
export const prisma = new PrismaClient();

// Função para desconectar o prisma
export async function desconectarPrisma() {
  await prisma.$disconnect();
}

// Export do tipo PrismaClient para uso em outros arquivos
export * from '../../generated/prisma'; 