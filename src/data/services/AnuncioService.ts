import { prisma, TipoProduto } from '../../core/prisma';
import { kebabCase } from 'lodash';

export class AnuncioService {
  private prisma = prisma;

  /**
   * Gera um slug único baseado no título
   * Se o slug já existir, adiciona um sufixo numérico
   */
  private async gerarSlugUnico(titulo: string): Promise<string> {
    let slug = kebabCase(titulo);
    let contador = 1;
    let slugFinal = slug;

    // Verifica se o slug já existe
    while (true) {
      const slugExistente = await this.prisma.anuncio.findUnique({
        where: { slug: slugFinal }
      });

      if (!slugExistente) {
        break; // Slug é único
      }

      // Adiciona sufixo numérico
      slugFinal = `${slug}-${contador}`;
      contador++;
    }

    return slugFinal;
  }

  async listarAnuncios() {
    try {
      const anuncios = await this.prisma.anuncio.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
      return anuncios;
    } catch (erro) {
      throw new Error(`Erro ao listar anúncios: ${erro}`);
    }
  }

  async criarAnuncio(dadosAnuncio: {
    link: string;
    tituloAnuncio: string;
    precoEmCentavos: number;
    quantidadeEmItens: number;
    disponivel?: boolean;
    anuncioPrincipalId?: string;
    provedorDaBusca: string;
    tipoProduto: TipoProduto;
  }) {
    try {
      const slug = await this.gerarSlugUnico(dadosAnuncio.tituloAnuncio);
      
      const anuncio = await this.prisma.anuncio.create({
        data: {
          ...dadosAnuncio,
          slug,
          disponivel: dadosAnuncio.disponivel ?? true
        }
      });

      return anuncio;
    } catch (erro) {
      throw new Error(`Erro ao criar anúncio: ${erro}`);
    }
  }

  async atualizarAnuncio(
    id: string,
    dadosAtualizacao: {
      link?: string;
      tituloAnuncio?: string;
      precoEmCentavos?: number;
      quantidadeEmItens?: number;
      disponivel?: boolean;
      anuncioPrincipalId?: string;
    }
  ) {
    try {
      const dadosParaAtualizar: any = { ...dadosAtualizacao };
      
      // Se o título foi alterado, gerar novo slug único
      if (dadosAtualizacao.tituloAnuncio) {
        dadosParaAtualizar.slug = await this.gerarSlugUnico(dadosAtualizacao.tituloAnuncio);
      }

      const anuncio = await this.prisma.anuncio.update({
        where: { id },
        data: dadosParaAtualizar
      });

      return anuncio;
    } catch (erro) {
      throw new Error(`Erro ao atualizar anúncio: ${erro}`);
    }
  }


  async encontrarAnuncioPorLink(link: string) {
    const anuncio = await this.prisma.anuncio.findUnique({
      where: { link }
    });
    return anuncio;
  }

} 