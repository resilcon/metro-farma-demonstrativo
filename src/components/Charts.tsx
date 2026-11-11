import type { ReactNode } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import type { Impostos } from '../lib/engine.ts';
import { brl, brlCompact, pct } from '../lib/format.ts';

export const COR = { real: '#077890', pres: '#f25c54', simples: '#6f6b69' };
export const COR_REGIME: Record<string, string> = { 'Lucro Real': COR.real, 'Lucro Presumido': COR.pres, 'Simples Nacional': COR.simples };
const AXIS = { fontSize: 12, fill: '#6f6b69' };
const TIP = { borderRadius: 14, border: '1px solid rgba(3,50,60,.1)', boxShadow: '0 12px 32px -12px rgba(3,50,60,.3)', fontSize: 13 };

export function ChartCard({ title, sub, children, className = '' }: { title: string; sub?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`card lift p-5 sm:p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-teal-900">{title}</h3>
      {sub && <p className="mt-0.5 text-sm text-stone-brand">{sub}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function RegimeChart({ data }: { data: { name: string; valor: number }[] }) {
  const min = Math.min(...data.map((d) => d.valor));
  return (
    <div className="h-[300px]">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 28, right: 8, left: 0, bottom: 0 }} barCategoryGap="22%">
          <CartesianGrid vertical={false} stroke="rgba(3,50,60,.08)" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ ...AXIS, fontWeight: 600 }} />
          <YAxis tickLine={false} axisLine={false} tick={AXIS} tickFormatter={brlCompact} width={70} />
          <Tooltip cursor={{ fill: 'rgba(7,120,144,.06)' }} contentStyle={TIP} formatter={(v) => brl(Number(v))} />
          <Bar dataKey="valor" radius={[12, 12, 0, 0]} isAnimationActive animationDuration={700}>
            {data.map((d) => (
              <Cell key={d.name} fill={COR_REGIME[d.name]} fillOpacity={d.valor === min ? 1 : 0.55} />
            ))}
            <LabelList dataKey="valor" position="top" formatter={(v) => brlCompact(Number(v))} style={{ fontSize: 13, fontWeight: 700, fill: '#03323c' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const TRIB: { k: keyof Impostos; label: string; cor: string }[] = [
  { k: 'icms', label: 'ICMS', cor: '#054a58' },
  { k: 'fopag', label: 'Folha (FOPAG)', cor: '#f25c54' },
  { k: 'irpj', label: 'IRPJ', cor: '#1c93ab' },
  { k: 'csll', label: 'CSLL', cor: '#f99a93' },
  { k: 'cofins', label: 'COFINS', cor: '#6f6b69' },
  { k: 'pis', label: 'PIS', cor: '#b5b1af' },
  { k: 'ipi', label: 'IPI', cor: '#a8dbe5' },
  { k: 'iss', label: 'ISS', cor: '#fcc2be' },
];

export function CompositionChart({ real, pres }: { real: Impostos; pres: Impostos }) {
  const ativos = TRIB.filter((t) => real[t.k] + pres[t.k] > 0.5);
  const data = [
    { name: 'Lucro Real', ...real },
    { name: 'Lucro Presumido', ...pres },
  ];
  return (
    <div>
      <div className="h-[190px]">
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 0 }} barCategoryGap="28%">
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={118} tick={{ ...AXIS, fontWeight: 600 }} />
            <Tooltip cursor={{ fill: 'rgba(7,120,144,.06)' }} contentStyle={TIP} formatter={(v, n) => [brl(Number(v)), n]} />
            {ativos.map((t, i) => (
              <Bar key={t.k} dataKey={t.k} name={t.label} stackId="a" fill={t.cor} radius={i === ativos.length - 1 ? [0, 10, 10, 0] : 0} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-stone-brand">
        {ativos.map((t) => (
          <li key={t.k} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-[4px]" style={{ background: t.cor }} /> {t.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MonthlyChart({ data }: { data: { mes: string; receita: number; icms: number }[] }) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gRec" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#077890" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#077890" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gIcms" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f25c54" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#f25c54" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(3,50,60,.08)" />
          <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={AXIS} tickFormatter={(m: string) => m.slice(0, 3)} />
          <YAxis tickLine={false} axisLine={false} tick={AXIS} tickFormatter={brlCompact} width={70} />
          <Tooltip contentStyle={TIP} formatter={(v, n) => [brl(Number(v)), n]} />
          <Area type="monotone" dataKey="receita" name="Receita bruta" stroke="#077890" strokeWidth={3} fill="url(#gRec)" />
          <Area type="monotone" dataKey="icms" name="ICMS pago" stroke="#f25c54" strokeWidth={3} fill="url(#gIcms)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EfetivaChart({ data }: { data: { nome: string; aliquota: number; regime: string }[] }) {
  const h = Math.max(200, data.length * 40 + 30);
  return (
    <div style={{ height: h }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 56, left: 0, bottom: 0 }} barCategoryGap="24%">
          <XAxis type="number" hide domain={[0, 'dataMax']} />
          <YAxis type="category" dataKey="nome" tickLine={false} axisLine={false} width={100} tick={{ ...AXIS, fontWeight: 600 }} />
          <Tooltip cursor={{ fill: 'rgba(7,120,144,.06)' }} contentStyle={TIP} formatter={(v, _n, p) => [pct(Number(v), 2), p.payload.regime]} />
          <Bar dataKey="aliquota" radius={[0, 10, 10, 0]}>
            {data.map((d) => (
              <Cell key={d.nome} fill={COR_REGIME[d.regime]} />
            ))}
            <LabelList dataKey="aliquota" position="right" formatter={(v) => pct(Number(v))} style={{ fontSize: 12, fontWeight: 700, fill: '#03323c' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
