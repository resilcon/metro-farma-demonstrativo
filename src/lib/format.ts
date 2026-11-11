const brlF = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const compactF = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });

export const brl = (n: number) => brlF.format(Math.round(n) + 0);
export const brlCompact = (n: number) => `R$ ${compactF.format(n)}`;
export const pct = (n: number, d = 1) =>
  `${(n * 100).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d })}%`;
export const num = (n: number) => Math.round(n).toLocaleString('pt-BR');

const ACENTOS: Record<string, string> = { Carapicuiba: 'Carapicuíba', Sacomã: 'Sacomã' };
export const nomeLoja = (n: string) => ACENTOS[n] ?? n;
export const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
