import type { Comparacao, Empresa, Resultado } from './engine.ts';

export function exportCsv(linhas: { e: Empresa; r: Resultado; cmp: Comparacao }[]) {
  const head = ['CNPJ', 'Filial', 'Empresa', 'Faturamento', 'Margem atual %', 'Custo %', 'Carga Lucro Presumido', 'Carga Lucro Real', 'DAS Simples', 'Comparação com', 'Diferença vs Presumido (+ economia)', 'Melhor regime'];
  const rows = linhas.map(({ e, r, cmp }) => [
    e.grupo,
    e.codigo,
    e.nome,
    r.receita.toFixed(2),
    (e.margemAtual * 100).toFixed(2),
    (r.custo * 100).toFixed(1),
    r.presumido.total.toFixed(2),
    r.real.total.toFixed(2),
    r.simples == null ? '' : r.simples.toFixed(2),
    cmp.alt.nome,
    cmp.difAlt.toFixed(2),
    cmp.melhor.nome,
  ]);
  const csv = [head, ...rows].map((l) => l.map((c) => '"' + String(c).split('"').join('""') + '"').join(';')).join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'metro-farma-demonstrativo.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}
