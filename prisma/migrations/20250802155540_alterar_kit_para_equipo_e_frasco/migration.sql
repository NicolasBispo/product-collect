-- Alterar o enum TipoProduto de 'kit' para 'equipo_e_frasco'
-- Primeiro, atualizar os dados existentes
UPDATE "Anuncio" SET "tipoProduto" = 'equipo_e_frasco' WHERE "tipoProduto" = 'kit';

-- Recriar o enum com o novo valor
-- SQLite não suporta alteração direta de enums, então recriamos a tabela
CREATE TABLE "Anuncio_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "link" TEXT NOT NULL UNIQUE,
    "tituloAnuncio" TEXT NOT NULL,
    "precoEmCentavos" INTEGER NOT NULL,
    "quantidadeEmItens" INTEGER,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tipoProduto" TEXT NOT NULL CHECK ("tipoProduto" IN ('frasco', 'equipo', 'equipo_e_frasco', 'seringa', 'outro')),
    "anuncioPrincipalId" TEXT,
    "slug" TEXT NOT NULL UNIQUE,
    "provedorDaBusca" TEXT NOT NULL,
    FOREIGN KEY ("anuncioPrincipalId") REFERENCES "Anuncio"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Copiar dados da tabela antiga para a nova
INSERT INTO "Anuncio_new" SELECT * FROM "Anuncio";

-- Remover tabela antiga
DROP TABLE "Anuncio";

-- Renomear nova tabela
ALTER TABLE "Anuncio_new" RENAME TO "Anuncio";

-- Recriar índices
CREATE INDEX "Anuncio_tipoProduto_idx" ON "Anuncio"("tipoProduto");
CREATE INDEX "Anuncio_createdAt_idx" ON "Anuncio"("createdAt");
CREATE INDEX "Anuncio_anuncioPrincipalId_idx" ON "Anuncio"("anuncioPrincipalId");