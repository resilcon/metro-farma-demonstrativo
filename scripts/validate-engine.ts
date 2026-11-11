import { readFileSync } from 'node:fs';
import { calcular, consolidar } from '../src/lib/engine.ts';
const d = JSON.parse(readFileSync(new URL('../src/data/grupo.json', import.meta.url), 'utf8'));
const TOL = 0.01;
let checks = 0, bad = 0;
const eq = (nome: string, a: number, b: number) => {
  checks++;
  if (Math.abs(a - b) > TOL) { bad++; console.log('  DIVERGE', nome, 'app=' + a.toFixed(2), 'planilha=' + b.toFixed(2)); }
};
const lista: any[] = [];
for (const e of d.empresas) {
  const r = calcular(e);
  const p = e.planilha;
  eq(e.id + ' receita (vendas+serviços)', r.receita, e.planilha.somaMeses.vendas + e.planilha.somaMeses.servicos);
  eq(e.id + ' carga Lucro Real', r.real.total, p.real);
  eq(e.id + ' carga Lucro Presumido', r.presumido.total, p.presumido);
  eq(e.id + ' lucro líquido Real (D31)', r.real.lucroLiquido, p.lucroLiquidoReal);
  eq(e.id + ' lucro Real após IR/CSLL (D40)', r.real.lucroAposImpostos, p.lucroReal);
  eq(e.id + ' lucro líquido Presumido (H28)', r.presumido.lucroLiquido, p.lucroLiquidoPres);
  for (const t of ['pis', 'cofins', 'ipi', 'iss', 'icms', 'irpj', 'csll', 'fopag'] as const) {
    const q = p.quebra[t];
    if (!q) { console.log('  sem linha', t, e.id); continue; }
    eq(e.id + ' ' + t + ' Real', r.real.impostos[t], q.real);
    eq(e.id + ' ' + t + ' Presumido', r.presumido.impostos[t], q.presumido);
  }
  if (e.das > 0) eq(e.id + ' DAS', r.simples ?? 0, e.das);
  lista.push({ e, r });
}
const c = consolidar(lista);
const soma = (f: (e: any) => number) => d.empresas.reduce((s: number, e: any) => s + f(e), 0);
eq('CONSOLIDADO receita', c.receita, soma((e) => e.planilha.somaMeses.vendas + e.planilha.somaMeses.servicos));
eq('CONSOLIDADO carga Real', c.real.total, soma((e) => e.planilha.real));
eq('CONSOLIDADO carga Presumido', c.presumido.total, soma((e) => e.planilha.presumido));
console.log(`\nConferidos ${checks} valores (10 lojas, tributo a tributo + consolidado): ${bad ? bad + ' DIVERGÊNCIAS' : 'todos idênticos à planilha (tolerância R$ 0,01)'}`);
console.log('Consolidado → receita', c.receita.toFixed(2), '| Real', c.real.total.toFixed(2), '| Presumido', c.presumido.total.toFixed(2));

// --- regras novas pedidas pelo cliente ---
for (const e of d.empresas) {
  const base = calcular(e);
  // consolidado: mudar o custo só altera IRPJ e CSLL (créditos e demais tributos ficam como na planilha)
  const sim = calcular(e, 0.65, e.das, { custoCreditos: e.p.custo });
  for (const t of ['pis', 'cofins', 'ipi', 'iss', 'icms', 'fopag'] as const) {
    eq(e.id + ' consolidado: ' + t + ' Real não muda com o custo', sim.real.impostos[t], base.real.impostos[t]);
    eq(e.id + ' consolidado: ' + t + ' Presumido não muda com o custo', sim.presumido.impostos[t], base.presumido.impostos[t]);
  }
  eq(e.id + ' consolidado: Presumido total não muda com o custo', sim.presumido.total, base.presumido.total);
  // folha: os tributos de folha caem na mesma proporção
  const f60 = calcular(e, e.p.custo, e.das, { folha: 0.6 });
  eq(e.id + ' folha 60% -> FOPAG Real', f60.real.impostos.fopag, base.real.impostos.fopag * 0.6);
  eq(e.id + ' folha 60% -> FOPAG Presumido', f60.presumido.impostos.fopag, base.presumido.impostos.fopag * 0.6);
  eq(e.id + ' folha 100% idêntica', calcular(e, e.p.custo, e.das, { folha: 1 }).real.total, base.real.total);
}
console.log(`Com as regras novas: ${checks} valores conferidos, ${bad ? bad + ' divergências' : 'sem divergências'}`);
process.exit(bad ? 1 : 0);
