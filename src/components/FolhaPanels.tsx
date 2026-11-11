import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { RotateCcw, TrendingDown, Users } from 'lucide-react';
import { brl, brlCompact } from '../lib/format.ts';
import AnimatedNumber from './AnimatedNumber.tsx';

const TIP = { borderRadius: 14, border: '1px solid rgba(3,50,60,.1)', boxShadow: '0 12px 32px -12px rgba(3,50,60,.3)', fontSize: 13 };

interface ControleProps {
  valor: number; // 0..1
  alterado: boolean;
  onChange: (v: number) => void;
  onReset: () => void;
  folhaTotal: number; // folha a 100%, em R$
  escopo: string;
}

export function FolhaControle({ valor, alterado, onChange, onReset, folhaTotal, escopo }: ControleProps) {
  const v = Math.max(0, Math.min(100, valor * 100));
  const transferida = folhaTotal * (1 - v / 100);
  return (
    <section className="card lift flex h-full flex-col px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-coral-100 text-coral-600">
            <Users size={16} />
          </span>
          <div className="leading-tight">
            <h3 className="text-base font-semibold text-teal-900">Folha de pagamento considerada</h3>
            <p className="text-xs text-stone-brand">% da folha mantida · {escopo}</p>
          </div>
        </div>
        {alterado && (
          <button onClick={onReset} className="flex items-center gap-1.5 rounded-full border border-teal-700/25 px-3 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-50">
            <RotateCcw size={13} /> Voltar a 100%
          </button>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="min-w-[180px] flex-1">
          <input
            aria-label="Percentual da folha considerado"
            type="range"
            min={0}
            max={100}
            step={1}
            value={v}
            style={{ ['--p' as string]: `${v}%` }}
            className="slider w-full"
            onChange={(e) => onChange(Number(e.target.value) / 100)}
          />
          <div className="mt-1 flex justify-between text-[10px] text-stone-brand">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
        <label className="flex items-center gap-1 rounded-xl border-2 border-teal-600/30 bg-white px-3 py-1 focus-within:border-teal-600">
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={Number(v.toFixed(0))}
            onChange={(e) => onChange(Math.max(0, Math.min(100, Number(e.target.value))) / 100)}
            className="num w-14 bg-transparent text-right font-display text-xl font-semibold text-teal-900 outline-none"
          />
          <span className="font-display text-lg font-semibold text-coral-500">%</span>
        </label>
      </div>

      <p className="mt-auto pt-4 text-xs text-stone-brand">
        Folha transferida: <b className="num text-coral-600">{brl(transferida)}</b> de <span className="num">{brl(folhaTotal)}</span>
      </p>
    </section>
  );
}

interface ImpactoProps {
  pct: number; // 0..1
  alt: string;
  cheia: { pres: number; alt: number };
  simulada: { pres: number; alt: number };
}

function Reducao({ titulo, valor }: { titulo: string; valor: number }) {
  const tem = valor > 0.5;
  return (
    <div className={tem ? 'rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 px-4 py-3 text-white shadow-lg shadow-teal-700/25' : 'rounded-xl bg-teal-50 px-4 py-3 text-stone-brand'}>
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider opacity-85">
        <TrendingDown size={14} /> Redução de imposto · {titulo}
      </p>
      <p className="font-display mt-0.5 text-2xl font-semibold">
        {tem ? <AnimatedNumber value={valor} format={brl} /> : 'Sem redução'}
      </p>
    </div>
  );
}

export function FolhaImpacto({ pct, alt, cheia, simulada }: ImpactoProps) {
  const rotulo = Math.round(pct * 100) + '% da folha';
  const igual = pct >= 0.995;
  const data = [
    { nome: 'Lucro Presumido', cheia: cheia.pres, simulada: simulada.pres },
    { nome: alt, cheia: cheia.alt, simulada: simulada.alt },
  ];
  return (
    <section className="card lift h-full px-4 py-4 sm:px-5">
      <h3 className="text-base font-semibold text-teal-900">Redução de imposto com a folha simulada</h3>
      <p className="text-xs text-stone-brand">{igual ? 'Mova o controle ao lado para simular' : '100% da folha × ' + rotulo}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Reducao titulo="Lucro Presumido" valor={cheia.pres - simulada.pres} />
        <Reducao titulo={alt} valor={cheia.alt - simulada.alt} />
      </div>
      <div className="mt-3 h-[150px]">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 20, right: 8, left: 0, bottom: 0 }} barCategoryGap="28%">
            <CartesianGrid vertical={false} stroke="rgba(3,50,60,.08)" />
            <XAxis dataKey="nome" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6f6b69', fontWeight: 600 }} />
            <YAxis hide />
            <Tooltip cursor={{ fill: 'rgba(7,120,144,.06)' }} contentStyle={TIP} formatter={(v, n) => [brl(Number(v)), n]} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="cheia" name="100% da folha" fill="#b5b1af" radius={[8, 8, 0, 0]} animationDuration={700}>
              <LabelList dataKey="cheia" position="top" formatter={(v) => brlCompact(Number(v))} style={{ fontSize: 11, fontWeight: 700, fill: '#6f6b69' }} />
            </Bar>
            <Bar dataKey="simulada" name={igual ? 'Sem simulação' : rotulo} fill="#f25c54" radius={[8, 8, 0, 0]} animationDuration={700}>
              <LabelList dataKey="simulada" position="top" formatter={(v) => brlCompact(Number(v))} style={{ fontSize: 11, fontWeight: 700, fill: '#03323c' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
