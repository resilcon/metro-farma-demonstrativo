import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { Empresa } from '../lib/engine.ts';
import { brl, brlCompact, nomeLoja } from '../lib/format.ts';
import AnimatedNumber from './AnimatedNumber.tsx';

interface Props {
  total: number;
  mensal: { mes: string; receita: number }[];
  empresas: Empresa[];
}

const TIP = { borderRadius: 14, border: '1px solid rgba(3,50,60,.1)', boxShadow: '0 12px 32px -12px rgba(3,50,60,.3)', fontSize: 13 };

export default function FaturamentoCard({ total, mensal, empresas }: Props) {
  const melhor = mensal.reduce((m, x) => (x.receita > m.receita ? x : m), { mes: '', receita: 0 });
  const media = mensal.length ? total / mensal.length : 0;
  const ranking = [...empresas].map((e) => ({ e, v: e.vendas + e.servicos })).sort((a, b) => b.v - a.v);
  return (
    <section id="faturamento" className="card lift p-4 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,300px)_1fr]">
        <div>
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-100 text-teal-700">
            <TrendingUp size={16} />
          </span>
          <p className="mt-2.5 text-[11px] font-bold uppercase tracking-wider text-stone-brand">Faturamento no período</p>
          <p className="font-display mt-0.5 text-2xl font-semibold text-teal-900">
            <AnimatedNumber value={total} format={brl} />
          </p>
          <dl className="mt-3 space-y-1.5 text-xs">
            <div className="flex justify-between gap-3 rounded-lg bg-teal-50 px-3 py-1.5">
              <dt className="text-stone-brand">Média mensal</dt>
              <dd className="num font-semibold text-teal-900">{brl(media)}</dd>
            </div>
            {melhor.mes && (
              <div className="flex justify-between gap-3 rounded-lg bg-teal-50 px-3 py-1.5">
                <dt className="text-stone-brand">Maior mês ({melhor.mes})</dt>
                <dd className="num font-semibold text-teal-900">{brl(melhor.receita)}</dd>
              </div>
            )}
          </dl>
          {ranking.length > 1 && (
            <ul className="mt-3 space-y-1 text-xs">
              {ranking.slice(0, 5).map(({ e, v }) => (
                <li key={e.id} className="flex justify-between gap-3">
                  <span className="font-medium text-teal-900">{nomeLoja(e.nome)}</span>
                  <span className="num text-stone-brand">{brl(v)}</span>
                </li>
              ))}
              {ranking.length > 5 && <li className="text-xs text-stone-brand">+ {ranking.length - 5} empresas no gráfico “Faturamento por empresa”</li>}
            </ul>
          )}
        </div>
        <div>
          <h3 className="text-base font-semibold text-teal-900">Faturamento mês a mês</h3>
          <p className="text-xs text-stone-brand">Receita bruta de vendas e serviços das empresas selecionadas</p>
          <div className="mt-2 h-[210px]">
            <ResponsiveContainer>
              <BarChart data={mensal} margin={{ top: 24, right: 8, left: 0, bottom: 0 }} barCategoryGap="22%">
                <CartesianGrid vertical={false} stroke="rgba(3,50,60,.08)" />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6f6b69' }} tickFormatter={(m: string) => m.slice(0, 3)} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6f6b69' }} tickFormatter={brlCompact} width={70} />
                <Tooltip cursor={{ fill: 'rgba(7,120,144,.06)' }} contentStyle={TIP} formatter={(v) => [brl(Number(v)), 'Faturamento']} />
                <Bar dataKey="receita" fill="#077890" radius={[10, 10, 0, 0]} animationDuration={700}>
                  <LabelList dataKey="receita" position="top" formatter={(v) => brlCompact(Number(v))} style={{ fontSize: 11, fontWeight: 700, fill: '#03323c' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
