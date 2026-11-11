/**
 * Motor de cálculo — réplica fiel das fórmulas da planilha "Comparativa Tributária"
 * (abas por loja). Cada loja é uma empresa/estabelecimento tributado de forma
 * independente; o consolidado é a SOMA dos resultados de cada loja selecionada.
 */
export interface Params {
  c12: number; c13: number; c14: number; icms: number; pis: number; cofins: number; iss: number;
  custo: number; fopagPct: number; encargos: number; fopagTrib: number; despesas: number;
  csll: number; irpj: number; adicional: number; meses: number;
  g12: number; g15: number; g16: number; g17: number; g22: number; g24: number; g26: number; g27: number;
  g30: number; g31: number; g33: number; g34: number; g35: number; g36: number;
}
export interface Mes { mes: string; vendas: number; servicos: number; icms: number; fopag: number; das: number }
export interface Empresa {
  id: string; grupo: string; codigo: string; nome: string; aba: string;
  meses: Mes[]; vendas: number; servicos: number; compras: number; fopag: number; proLabore: number;
  das: number; icmsPago: number; margemAtual: number; p: Params;
  planilha: { real: number; presumido: number; simples: number; melhor: string; lucroLiquidoReal: number; lucroReal: number };
}

export interface Impostos { pis: number; cofins: number; ipi: number; iss: number; icms: number; irpj: number; csll: number; fopag: number }
export interface Regime {
  impostos: Impostos;
  total: number;
  lucroLiquido: number; // antes do IRPJ/CSLL
  lucroAposImpostos: number;
}
export interface Resultado {
  receita: number;
  custo: number; // % usado
  real: Regime;
  presumido: Regime;
  simples: number | null;
}

const soma = (o: Impostos) => o.pis + o.cofins + o.ipi + o.iss + o.icms + o.irpj + o.csll + o.fopag;

export function calcular(e: Empresa, custoPct: number = e.p.custo, das: number = e.das): Resultado {
  const p = e.p;
  const R = e.vendas + e.servicos;
  const F = e.fopag, PL = e.proLabore;

  // ---------- Lucro Real ----------
  const d12 = R * p.c12, d13 = R * p.c13;
  const d15 = -d13 * p.icms, d16 = -d12 * p.pis, d17 = -d12 * p.cofins, d18 = -R * p.iss;
  const d25 = -R * custoPct;
  const d20 = -(d25 * p.c13) * p.icms;
  const d21 = -(d25 * p.c12) * p.c14;
  const d22 = -(d25 * p.c12) * p.pis;
  const d23 = -(d25 * p.c12) * p.cofins;
  const d14 = -(R * p.c14) + d21;
  const d24 = R + d15 + d16 + d17 + d18 + d20 + d21 + d22 + d23;
  const d26 = d24 + d25;
  const d27 = -R * p.fopagPct;
  const d28 = -p.encargos * F;
  const d29 = (d27 + d28) * p.fopagTrib - PL * 0.2;
  const d30 = -(R * p.despesas) - F * 0.08;
  const d31 = d26 + d27 + d28 + d29 + d30;
  const d33 = -(d31 * p.csll > 0 ? d31 * p.csll : 0);
  const d34 = -(d31 * p.irpj > 0 ? d31 * p.irpj : 0);
  const lim = 20000 * p.meses;
  const d37 = -(d31 > lim ? (d31 - lim) * p.adicional : 0);
  const realTotal = -(d15 + d20 + d16 + d17 + d29 + d22 + d23 + d33 + d34 + d37 + d14 + d18 + d21);
  const real: Regime = {
    impostos: {
      pis: -(d16 + d22), cofins: -(d17 + d23), ipi: -(d14 + d21), iss: -d18,
      icms: -(d15 + d20), irpj: -(d34 + d37), csll: -d33, fopag: -d29,
    },
    total: realTotal, lucroLiquido: d31, lucroAposImpostos: d31 + d33 + d34 + d37,
  };

  // ---------- Lucro Presumido ----------
  const h12 = R * p.g12;
  const h15 = -h12 * p.g15, h16 = -h12 * p.g16, h17 = -(p.g17 * R);
  const h14 = d14 + d21;
  const h13 = d15, h19 = d20;
  const h21 = R + h13 + h15 + h16 + h19 + h17 + h14;
  const h22 = -R * custoPct;
  const h23 = h21 + h22;
  const h24 = -R * p.g24;
  const h25 = d28;
  const h26 = (h24 + h25) * p.g26 - PL * 0.2;
  const h27 = -R * p.g27;
  const h28 = h23 + h24 + h25 + h26 + h27;
  const h30 = e.vendas * p.g30, h31 = -h30 * p.g31;
  const h33 = e.vendas * p.g33, h34 = -h33 * p.g34;
  const lim2 = 20000 * p.g36;
  const h36 = -(h33 > lim2 ? (h33 - lim2) * p.g35 : 0);
  const presTotal = -(h13 + h15 + h16 + h19 + h26 + h31 + h34 + (h36 + h14 + h17));
  const presumido: Regime = {
    impostos: {
      pis: -h15, cofins: -h16, ipi: -h14, iss: -h17, icms: -(h13 + h19),
      irpj: -(h34 + h36), csll: -h31, fopag: -h26,
    },
    total: presTotal, lucroLiquido: h28, lucroAposImpostos: h28 + h31 + h34 + h36,
  };

  return { receita: R, custo: custoPct, real, presumido, simples: das > 0 ? das : null };
}

export type RegimeNome = 'Lucro Real' | 'Lucro Presumido' | 'Simples Nacional';
export function melhorRegime(r: Resultado): { nome: RegimeNome; valor: number; economia: number } {
  const opts: { nome: RegimeNome; valor: number }[] = [
    { nome: 'Lucro Real', valor: r.real.total },
    { nome: 'Lucro Presumido', valor: r.presumido.total },
  ];
  if (r.simples != null) opts.push({ nome: 'Simples Nacional', valor: r.simples });
  opts.sort((a, b) => a.valor - b.valor);
  const pior = opts[opts.length - 1].valor;
  return { ...opts[0], economia: pior - opts[0].valor };
}

/** Consolida várias lojas: soma regime a regime (cada CNPJ é tributado em separado). */
export function consolidar(lista: { e: Empresa; r: Resultado }[]): Resultado {
  const z = (): Regime => ({
    impostos: { pis: 0, cofins: 0, ipi: 0, iss: 0, icms: 0, irpj: 0, csll: 0, fopag: 0 },
    total: 0, lucroLiquido: 0, lucroAposImpostos: 0,
  });
  const out: Resultado = { receita: 0, custo: 0, real: z(), presumido: z(), simples: null };
  let ponderado = 0, temSimples = false, simples = 0;
  for (const { r } of lista) {
    out.receita += r.receita;
    ponderado += r.custo * r.receita;
    for (const k of ['real', 'presumido'] as const) {
      const a = out[k], b = r[k];
      for (const t of Object.keys(a.impostos) as (keyof Impostos)[]) a.impostos[t] += b.impostos[t];
      a.total += b.total; a.lucroLiquido += b.lucroLiquido; a.lucroAposImpostos += b.lucroAposImpostos;
    }
    if (r.simples != null) { temSimples = true; simples += r.simples; }
  }
  out.custo = out.receita ? ponderado / out.receita : 0;
  out.simples = temSimples ? simples : null;
  return out;
}
export { soma as somaImpostos };

/**
 * Comparação pedida pelo cliente: o Lucro Presumido é SEMPRE a referência (tributação atual).
 * - Simples ligado  -> Presumido x Simples Nacional (sem Lucro Real)
 * - Simples desligado -> Presumido x Lucro Real
 * `difAlt` = Presumido - alternativa (positivo = a alternativa é mais barata, ou seja, economia).
 */
export interface Comparacao {
  usaSimples: boolean;
  pres: number;
  alt: { nome: RegimeNome; valor: number };
  melhor: { nome: RegimeNome; valor: number; economia: number };
  difAlt: number;
}
export function comparar(r: Resultado, quer: boolean): Comparacao {
  const usaSimples = quer && r.simples != null;
  const alt = usaSimples
    ? { nome: 'Simples Nacional' as RegimeNome, valor: r.simples as number }
    : { nome: 'Lucro Real' as RegimeNome, valor: r.real.total };
  const pres = r.presumido.total;
  const altMelhor = alt.valor < pres;
  const melhor = altMelhor ? alt : { nome: 'Lucro Presumido' as RegimeNome, valor: pres };
  return { usaSimples, pres, alt, melhor: { ...melhor, economia: pres - melhor.valor }, difAlt: pres - alt.valor };
}
