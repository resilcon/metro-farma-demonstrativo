import { Award, Banknote, Landmark, PiggyBank, Receipt } from 'lucide-react';
import { motion } from 'motion/react';
import clsx from 'clsx';
import type { Resultado, RegimeNome } from '../lib/engine.ts';
import { brl, pct } from '../lib/format.ts';
import AnimatedNumber from './AnimatedNumber.tsx';

interface Props {
  r: Resultado;
  melhor: { nome: RegimeNome; valor: number; economia: number } | null;
  simplesCompleto: boolean;
  simplesInfo: string;
  otimizado: { total: number; economia: number } | null;
  nLojas: number;
}

export default function Kpis({ r, melhor, simplesCompleto, simplesInfo, otimizado, nLojas }: Props) {
  const cards = [
    { k: 'receita', label: 'Receita bruta', value: r.receita, sub: `${nLojas} ${nLojas === 1 ? 'loja' : 'lojas'} no período apurado`, Icon: Banknote, tone: 'teal', na: false, best: false },
    { k: 'real', label: 'Carga · Lucro Real', value: r.real.total, sub: `${pct(r.receita ? r.real.total / r.receita : 0)} da receita`, Icon: Landmark, tone: 'teal', na: false, best: melhor?.nome === 'Lucro Real' },
    { k: 'pres', label: 'Carga · Lucro Presumido', value: r.presumido.total, sub: `${pct(r.receita ? r.presumido.total / r.receita : 0)} da receita`, Icon: Receipt, tone: 'coral', na: false, best: melhor?.nome === 'Lucro Presumido' },
    {
      k: 'simp', label: 'Simples Nacional (DAS)', value: r.simples ?? 0, na: !simplesCompleto,
      sub: simplesCompleto ? `${pct(r.receita ? (r.simples ?? 0) / r.receita : 0)} da receita` : simplesInfo,
      Icon: PiggyBank, tone: 'stone', best: melhor?.nome === 'Simples Nacional',
    },
  ];
  return (
    <div id="resumo" className="scroll-mt-24 space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.k}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 220, damping: 24 }}
            className={clsx('card lift relative overflow-hidden p-5', c.best && 'ring-2 ring-coral-400 shadow-[0_24px_48px_-20px_rgba(242,92,84,0.55)]')}
          >
            {c.best && (
              <span className="absolute right-4 top-4 pulse-ring flex items-center gap-1 rounded-full bg-coral-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                <Award size={12} /> Menor carga
              </span>
            )}
            <span
              className={clsx(
                'grid h-10 w-10 place-items-center rounded-xl',
                c.tone === 'teal' && 'bg-teal-100 text-teal-700',
                c.tone === 'coral' && 'bg-coral-100 text-coral-600',
                c.tone === 'stone' && 'bg-stone-200 text-stone-brand',
              )}
            >
              <c.Icon size={20} />
            </span>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-stone-brand">{c.label}</p>
            <p className="font-display mt-1 text-3xl font-semibold text-teal-900">
              {c.na ? <span className="text-stone-400">N/D</span> : <AnimatedNumber value={c.value} format={brl} />}
            </p>
            <p className="mt-1 text-xs text-stone-brand">{c.sub}</p>
          </motion.div>
        ))}
      </div>

      {melhor && (
        <motion.div
          layout
          className="relative overflow-hidden shimmer rounded-3xl bg-gradient-to-r from-coral-500 to-coral-400 p-6 text-white shadow-xl shadow-coral-500/25 sm:p-8"
        >
          <img src="./brand/mark.png" alt="" aria-hidden className="pointer-events-none absolute -right-8 -top-10 w-52 opacity-15 brightness-200" />
          <div className="relative grid gap-6 md:grid-cols-[1.3fr_1fr] md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/80">Melhor tributação {nLojas > 1 ? 'para a seleção' : 'para a loja'}</p>
              <h3 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">{melhor.nome}</h3>
              <p className="mt-2 max-w-xl text-white/90">
                Economia de <b className="num">{brl(melhor.economia)}</b> no período em relação à pior alternativa
                {otimizado && otimizado.economia > 1 && (
                  <>
                    . Escolhendo o melhor regime <b>loja a loja</b>, a carga cairia para <b className="num">{brl(otimizado.total)}</b>
                    {' '}(−<span className="num">{brl(otimizado.economia)}</span> vs. regime único).
                  </>
                )}
              </p>
            </div>
            <div className="rounded-2xl bg-white/15 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Alíquota efetiva</p>
              <p className="font-display mt-1 text-5xl font-semibold">
                <AnimatedNumber value={r.receita ? melhor.valor / r.receita : 0} format={(n) => pct(n, 2)} />
              </p>
              <p className="mt-1 text-sm text-white/85">
                <span className="num">{brl(melhor.valor)}</span> sobre <span className="num">{brl(r.receita)}</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
