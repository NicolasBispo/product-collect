import { TipoProduto } from "../core/prisma";

export const ITENS_BUSCAVEIS = [
  "Frasco de dieta enteral",
  "Equipo de dieta enteral",
  "Seringa 20ML de dieta enteral",
];

export function classificaProduto(titulo: string): TipoProduto {
  const lower = titulo.toLowerCase();

  const temFrasco = ["frasco", "garrafa", "recipiente"].some(p => lower.includes(p));
  const temEquipo = ["equipo", "extensor", "tubo", "sonda"].some(p => lower.includes(p));

  if (temFrasco && temEquipo) return "kit";
  if (temFrasco) return "frasco";
  if (temEquipo) return "equipo";

  return "outro";
}