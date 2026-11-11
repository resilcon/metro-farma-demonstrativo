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
    <div className="rounded-xl bg-teal-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-brand">{label}</p>
      <p className={`num mt-1 flex items-center gap-1.5 text-lg font-semibold ${same ? 'text-stone-brand' : d < 0 ? 'text-teal-700' : 'text-coral-600'}`}>
        {!same && <Icon size={18} />}
        {same ? 'Sem alteração' : `${d > 0 ? '+' : '−'}${brl(Math.abs(d))}`}
      </p>
    </div>
  );
}

export default function CostControl({ valor, misto, alterado, onChange, onReset, deltaReal, deltaPres, escopo }: Props) {
  const v = Math.max(0, Math.min(100, valor * 100));
  return (
    <section className="card relative overflow-hidden p-5 sm:p-7">
      <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-coral-500 to-coral-300" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-coral-100 text-coral-600">
            <SlidersHorizontal size={22} />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-teal-900">Custo da empresa</h2>
            <p className="text-sm text-stone-brand">
              Percentual de custo sobre a receita · aplicado a {escopo}. Altera o cálculo do lucro real.
            </p>
          </div>
        </div>
        {alterado && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 rounded-full border border-teal-700/25 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
          >
            <RotateCcw size={15} /> Voltar ao valor da planilha
          </button>
        )}
      </div>

      <div className="mt-6 grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
        <div>
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
          <div className="mt-2 flex justify-between text-xs text-stone-brand">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
        <label className="flex items-center gap-2 rounded-2xl border-2 border-teal-600/30 bg-white px-4 py-2 focus-within:border-teal-600">
          <input
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={Number(v.toFixed(1))}
            onChange={(e) => onChange(Math.max(0, Math.min(100, Number(e.target.value))) / 100)}
            className="num w-24 bg-transparent text-right font-display text-3xl font-semibold text-teal-900 outline-none"
          />
          <span className="font-display text-2xl font-semibold text-coral-500">%</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Delta d={deltaReal} label="Carga Lucro Real" />
          <Delta d={deltaPres} label="Carga Lucro Presumido" />
        </div>
      </div>
      {misto && !alterado && (
        <p className="mt-4 text-xs text-stone-brand">
          Cada loja tem um custo próprio na planilha — o valor acima é a média ponderada pela receita ({pct(valor)}). Ao
          mexer, o mesmo percentual passa a valer para todas as selecionadas.
        </p>
      )}
    </section>
  );
}
