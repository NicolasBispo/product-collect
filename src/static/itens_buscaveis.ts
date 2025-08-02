import { TipoProduto } from "../core/prisma";

export const ITENS_BUSCAVEIS = [
  "Seringa dosadora 20ML",
];

export function classificaProduto(titulo: string): TipoProduto {
  const lower = titulo.toLowerCase();

  const temFrasco = ["frasco", "garrafa", "recipiente", "frs"].some(p => lower.includes(p));
  const temEquipo = ["equipo", "extensor", "tubo", "sonda", "equipos"].some(p => lower.includes(p));
  const temSeringa = ["seringa", "seringas"].some(p => lower.includes(p));
  const temKit = ["kit"].some(p => lower.includes(p));

  // Se tem "kit" no título, precisa verificar o conteúdo
  if (temKit) {
    // Se tem frasco e equipo (com ou sem seringa), é equipo e frasco
    if (temFrasco && temEquipo) return "equipo_e_frasco";
    // Se tem apenas seringas, é seringa
    if (temSeringa && !temFrasco && !temEquipo) return "seringa";
    // Se tem apenas frascos, é frasco
    if (temFrasco && !temEquipo && !temSeringa) return "frasco";
    // Se tem apenas equipos, é equipo
    if (temEquipo && !temFrasco && !temSeringa) return "equipo";
    // Se tem frasco e seringa (sem equipo), é frasco
    if (temFrasco && temSeringa && !temEquipo) return "frasco";
    // Se tem equipo e seringa (sem frasco), é equipo
    if (temEquipo && temSeringa && !temFrasco) return "equipo";
    // Caso padrão para kits mistos: equipo e frasco
    return "equipo_e_frasco";
  }
  
  // Se tem frasco e equipo (sem ser kit), é equipo e frasco
  if (temFrasco && temEquipo) return "equipo_e_frasco";
  
  if (temFrasco) return "frasco";
  if (temEquipo) return "equipo";
  if (temSeringa) return "seringa";

  return "outro";
}

export function extrairTotalDeUnidadesDoTitulo(titulo: string): number | null {
  const lower = titulo.toLowerCase();

  // Padroniza abreviações e remove pontos
  const texto = lower.replace(/\./g, '').replace(/und\b/g, 'unidades').replace(/unid\b/g, 'unidades');

  // 1. "Kit com 100 unidades" - padrão mais específico primeiro
  const match1 = texto.match(/kit\s*com\s*(\d+)\s+unidade[s]?/);
  if (match1 && match1[1]) return parseInt(match1[1]);

  // 2. "Kit 30 Und" ou "Kit 30" - número direto após kit
  const match2 = texto.match(/kit\s*(\d+)(?:\s+und?)?/);
  if (match2 && match2[1]) return parseInt(match2[1]);

  // 3. "Kit 30un" - número junto com un
  const match3 = texto.match(/kit\s*(\d+)un/);
  if (match3 && match3[1]) return parseInt(match3[1]);

  // 4. "Kit Nutrição Enteral 20 Frs + 20 Seringas + 20 Equipos" - captura o primeiro número
  const match4 = texto.match(/kit[^0-9]*(\d+)\s+frs?/);
  if (match4 && match4[1]) return parseInt(match4[1]);

  // 5. "20 Frascos + Equipo" - captura o número de frascos
  const match5 = texto.match(/(\d+)\s+frs?/);
  if (match5 && match5[1]) return parseInt(match5[1]);

  // 6. "Kit 50un" - número junto com un
  const match6 = texto.match(/kit\s*(\d+)un/);
  if (match6 && match6[1]) return parseInt(match6[1]);

  // 7. "Kit 5 Frascos + 5 Equipos" - captura o primeiro número
  const match7 = texto.match(/kit[^0-9]*(\d+)\s+frascos/);
  if (match7 && match7[1]) return parseInt(match7[1]);

  // 8. "Dieta Nutrição Alimentação Enteral Kit 40 Frs + 40 Equipos" - captura o número
  const match8 = texto.match(/kit\s*(\d+)\s+frs/);
  if (match8 && match8[1]) return parseInt(match8[1]);

  // 9. "Kit 10 Und- Equipo Dieta Enteral, Frasco 300ml, Seringa 20ml" - captura o número após kit
  const match9 = texto.match(/kit\s*(\d+)\s+und?/);
  if (match9 && match9[1]) return parseInt(match9[1]);

  // 10. "Frasco E Equipo Nutrição Dieta Enteral Por Sonda - Kit 50un" - captura o número
  const match10 = texto.match(/kit\s*(\d+)un/);
  if (match10 && match10[1]) return parseInt(match10[1]);

  // 11. "Kit C/ 50 Frasco" - padrão com "C/"
  const match11 = texto.match(/kit\s*c\/\s*(\d+)/);
  if (match11 && match11[1]) return parseInt(match11[1]);

  // 12. "Kit 25 Unidades" - padrão com "Unidades"
  const match12 = texto.match(/kit\s*(\d+)\s+unidade[s]?/);
  if (match12 && match12[1]) return parseInt(match12[1]);

  // 13. "Kit 100 Equipo + 100 Frasco" - captura o primeiro número
  const match13 = texto.match(/kit\s*(\d+)\s+equipo/);
  if (match13 && match13[1]) return parseInt(match13[1]);

  // 14. "Kit 12 Nutri Enteral" - padrão com produtos específicos
  const match14 = texto.match(/kit\s*(\d+)\s+nutri/);
  if (match14 && match14[1]) return parseInt(match14[1]);

  // 15. "Kit C/ 30" - padrão com "C/" no final
  const match15 = texto.match(/kit\s*c\/\s*(\d+)/);
  if (match15 && match15[1]) return parseInt(match15[1]);

  // 16. "Kit10 Und. De Cada" - padrão com "De Cada"
  const match16 = texto.match(/kit\s*(\d+)\s+und?\.?\s+de\s+cada/);
  if (match16 && match16[1]) return parseInt(match16[1]);

  // 17. "Kit 25 Unidades De Cada" - padrão com "De Cada"
  const match17 = texto.match(/kit\s*(\d+)\s+unidade[s]?\s+de\s+cada/);
  if (match17 && match17[1]) return parseInt(match17[1]);

  // 18. "5 Frascos C/ 5 Equipos" - captura o primeiro número
  const match18 = texto.match(/(\d+)\s+frascos?\s*c\/\s*\d+/);
  if (match18 && match18[1]) return parseInt(match18[1]);

  // 19. "Kit 2x Isosource" - padrão com "x"
  const match19 = texto.match(/kit\s*(\d+)x/);
  if (match19 && match19[1]) return parseInt(match19[1]);

  // 20. "Kit Com 6 Unidades" - padrão com "Com"
  const match20 = texto.match(/kit\s*com\s*(\d+)\s+unidade[s]?/);
  if (match20 && match20[1]) return parseInt(match20[1]);

  // 21. "Kit Equipo P/ Dieta Enteral + Frasco 300ml - 20 Und. De Cada" - padrão com "Und. De Cada"
  const match21 = texto.match(/kit[^0-9]*(\d+)\s+und?\.?\s+de\s+cada/);
  if (match21 && match21[1]) return parseInt(match21[1]);

  // 22. "Kit Dieta Enteral Frasco 300ml+ Equipo Nutrição 100 Unidades" - padrão com "Unidades"
  const match22 = texto.match(/kit[^0-9]*(\d+)\s+unidade[s]?/);
  if (match22 && match22[1]) return parseInt(match22[1]);

  // 23. "Kit Para Dieta Enteral Equipo Escalonado + Frasco 300ml 50un" - padrão com "un" no final
  const match23 = texto.match(/kit[^0-9]*(\d+)un/);
  if (match23 && match23[1]) return parseInt(match23[1]);

  // 24. "Kit Para Nutrição Enteral Frasco 300ml + Equipo - 25un" - padrão com "un" no final
  const match24 = texto.match(/kit[^0-9]*(\d+)un/);
  if (match24 && match24[1]) return parseInt(match24[1]);

  // 25. "Kit Alimentação Enteral Por Sonda Equipo + Frasco 300ml 10un" - padrão com "un" no final
  const match25 = texto.match(/kit[^0-9]*(\d+)un/);
  if (match25 && match25[1]) return parseInt(match25[1]);

  // 26. "Kit Equipo P/ Dieta Enteral + Frasco 300ml - 30 Und. De Cada" - padrão com "Und. De Cada"
  const match26 = texto.match(/kit[^0-9]*(\d+)\s+und?\.?\s+de\s+cada/);
  if (match26 && match26[1]) return parseInt(match26[1]);

  // 27. "Kit Para Dieta Enteral Equipo Escalonado + Frasco 300ml 50un" - padrão com "un" no final
  const match27 = texto.match(/kit[^0-9]*(\d+)un/);
  if (match27 && match27[1]) return parseInt(match27[1]);

  // 28. "Kit Equipo P/ Dieta Enteral + Frasco 300ml - 20 Und. De Cada" - padrão com "Und. De Cada"
  const match28 = texto.match(/kit[^0-9]*(\d+)\s+und?\.?\s+de\s+cada/);
  if (match28 && match28[1]) return parseInt(match28[1]);

  return null;
}
