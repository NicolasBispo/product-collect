import { PrismaClient } from '../../../generated/prisma';

// Instância global do Prisma Client
const prisma = new PrismaClient();

// Função para conectar ao banco
export async function conectarBanco() {
  try {
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados');
  } catch (erro) {
    console.error('❌ Erro ao conectar ao banco:', erro);
    process.exit(1);
  }
}

// Função para desconectar do banco
export async function desconectarBanco() {
  await prisma.$disconnect();
  console.log('🔌 Desconectado do banco de dados');
}

export { prisma }; 