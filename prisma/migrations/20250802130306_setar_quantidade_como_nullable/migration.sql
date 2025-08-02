-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Anuncio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "link" TEXT NOT NULL,
    "tituloAnuncio" TEXT NOT NULL,
    "precoEmCentavos" INTEGER NOT NULL,
    "quantidadeEmItens" INTEGER,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tipoProduto" TEXT NOT NULL,
    "anuncioPrincipalId" TEXT,
    "slug" TEXT NOT NULL,
    "provedorDaBusca" TEXT NOT NULL,
    CONSTRAINT "Anuncio_anuncioPrincipalId_fkey" FOREIGN KEY ("anuncioPrincipalId") REFERENCES "Anuncio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Anuncio" ("anuncioPrincipalId", "createdAt", "disponivel", "id", "link", "precoEmCentavos", "provedorDaBusca", "quantidadeEmItens", "slug", "tipoProduto", "tituloAnuncio", "updatedAt") SELECT "anuncioPrincipalId", "createdAt", "disponivel", "id", "link", "precoEmCentavos", "provedorDaBusca", "quantidadeEmItens", "slug", "tipoProduto", "tituloAnuncio", "updatedAt" FROM "Anuncio";
DROP TABLE "Anuncio";
ALTER TABLE "new_Anuncio" RENAME TO "Anuncio";
CREATE UNIQUE INDEX "Anuncio_link_key" ON "Anuncio"("link");
CREATE UNIQUE INDEX "Anuncio_slug_key" ON "Anuncio"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
