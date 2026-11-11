import { RotateCcw, SlidersHorizontal, TrendingDown, TrendingUp } from 'lucide-react';
import { brl, pct } from '../lib/format.ts';

interface Props {
  valor: number;
  misto: boolean;
  alterado: boolean;
  onChange: (v: number) => void;
  onReset: () => void;
  deltaReal: number;
  deltaPres: number;
  escopo: string;
}

function Delta({ d, label }: { d: number; label: string }) {
  const same = Math.abs(d) < 1;
  const Icon = d <= 0 ? TrendingDown : TrendingUp;
  return (
    <div className="rounded-lg bg-teal-50 px-3 py-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-brand">{label}</p>
      <p className={`num flex items-center gap-1 text-sm font-semibold ${same ? 'text-stone-brand' : d < 0 ? 'text-teal-700' : 'text-coral-600'}`}>
        {!same && <Icon size={14} />}
        {same ? 'Sem alteração' : `${d > 0 ? '+' : '−'}${brl(Math.abs(d))}`}
      </p>
    </div>
  );
}

export default function CostControl({ valor, misto, alterado, onChange, onReset, deltaReal, deltaPres, escopo }: Props) {
  const v = Math.max(0, Math.min(100, valor * 100));
  return (
    <section className="card relative overflow-hidden px-4 py-3.5 sm:px-5">
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-coral-500 to-coral-300" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-coral-100 text-coral-600">
            <SlidersHorizontal size={16} />
          </span>
          <div className="leading-tight">
            <h2 className="text-base font-semibold text-teal-900">Custo da empresa</h2>
            <p className="text-xs text-stone-brand">% de custo sobre a receita · aplicado a {escopo}</p>
          </div>
        </div>
        {alterado && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-full border border-teal-700/25 px-3 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-50"
          >
            <RotateCcw size={13} /> Valor da planilha
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="min-w-[200px] flex-1">
          <input
            aria-label="Percentual de custo"
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={v}
            style={{ ['--p' as string]: `${v}%` }}
            className="slider w-full"
            onChange={(e) => onChange(Number(e.target.value) / 100)}
          />
        </div>
        <label className="flex items-center gap-1 rounded-xl border-2 border-teal-600/30 bg-white px-3 py-1 focus-within:border-teal-600">
          <input
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={Number(v.toFixed(1))}
            onChange={(e) => onChange(Math.max(0, Math.min(100, Number(e.target.value))) / 100)}
            className="num w-16 bg-transparent text-right font-display text-xl font-semibold text-teal-900 outline-none"
          />
          <span className="font-display text-lg font-semibold text-coral-500">%</span>
        </label>
        <div className="flex gap-2">
          <Delta d={deltaReal} label="Carga Lucro Real" />
          <Delta d={deltaPres} label="Carga Presumido" />
        </div>
      </div>
      {misto && !alterado && (
        <p className="mt-2 text-[11px] text-stone-brand">Média ponderada ({pct(valor)}): cada empresa tem custo próprio na planilha. Ao mexer, o mesmo % vale para todas as selecionadas.</p>
      )}
    </section>
  );
}
