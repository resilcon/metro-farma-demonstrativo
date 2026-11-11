import type { Empresa, Resultado } from './engine.ts';

export function exportCsv(linhas: { e: Empresa; r: Resultado; melhor: string }[]) {
  const head = ['Código', 'Loja', 'Meses', 'Receita', 'Custo %', 'Carga Lucro Real', 'Carga Lucro Presumido', 'DAS Simples', 'Melhor regime'];
  const rows = linhas.map(({ e, r, melhor }) => [
    e.id,
    e.nome,
    e.meses.length,
    r.receita.toFixed(2),
    (r.custo * 100).toFixed(1),
    r.real.total.toFixed(2),
    r.presumido.total.toFixed(2),
    r.simples == null ? '' : r.simples.toFixed(2),
    melhor,
  ]);
  const csv = [head, ...rows].map((l) => l.map((c) => '"' + String(c).split('"').join('""') + '"').join(';')).join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'metro-farma-demonstrativo.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}
