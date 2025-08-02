-- CreateTable
CREATE TABLE "Anuncio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "link" TEXT NOT NULL,
    "tituloAnuncio" TEXT NOT NULL,
    "precoEmCentavos" INTEGER NOT NULL,
    "quantidadeEmItens" INTEGER NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tipoProduto" TEXT NOT NULL,
    "anuncioPrincipalId" TEXT,
    "slug" TEXT NOT NULL,
    "provedorDaBusca" TEXT NOT NULL,
    CONSTRAINT "Anuncio_anuncioPrincipalId_fkey" FOREIGN KEY ("anuncioPrincipalId") REFERENCES "Anuncio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Anuncio_link_key" ON "Anuncio"("link");

-- CreateIndex
CREATE UNIQUE INDEX "Anuncio_slug_key" ON "Anuncio"("slug");
