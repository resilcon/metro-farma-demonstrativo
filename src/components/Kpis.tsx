import { Award, Landmark, Percent, PiggyBank, Receipt } from 'lucide-react';
import { motion } from 'motion/react';
import clsx from 'clsx';
import type { Comparacao, Empresa, Resultado } from '../lib/engine.ts';
import { brl, nomeLoja, pct } from '../lib/format.ts';
import AnimatedNumber from './AnimatedNumber.tsx';

interface Props {
  r: Resultado;
  cmp: Comparacao;
  empresas: Empresa[];
  otimizado: { total: number; economia: number } | null;
  consolidado: boolean;
}

export function MargemAtual({ empresas }: { empresas: Empresa[] }) {
  const rec = empresas.reduce((s, e) => s + e.vendas + e.servicos, 0);
  const media = rec ? empresas.reduce((s, e) => s + e.margemAtual * (e.vendas + e.servicos), 0) / rec : 0;
  return (
    <section className="card px-4 py-3.5 sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-100 text-teal-700">
            <Percent size={16} />
          </span>
          <div className="leading-tight">
            <h3 className="text-base font-semibold text-teal-900">Margem atual</h3>
            <p className="text-xs text-stone-brand">Informada na planilha · valor fixo, não muda com as simulações</p>
          </div>
        </div>
        {empresas.length > 1 && (
          <p className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
            Média ponderada: <span className="num">{pct(media, 2)}</span>
          </p>
        )}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
        {empresas.map((e) => (
          <li key={e.id} className="flex items-center justify-between gap-2 rounded-lg border border-teal-900/10 bg-teal-50/50 px-3 py-1.5 transition hover:border-teal-300 hover:bg-white">
            <span className="truncate text-xs font-semibold text-teal-900">{nomeLoja(e.nome)}</span>
            <span className="num text-sm font-semibold text-coral-600">{pct(e.margemAtual, 2)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Kpis({ r, cmp, empresas, otimizado, consolidado }: Props) {
  const altIsSimples = cmp.alt.nome === 'Simples Nacional';
  const presMelhor = cmp.melhor.nome === 'Lucro Presumido';
  const cards = [
    { k: 'pres', label: 'Lucro Presumido', value: cmp.pres, sub: 'Tributação atual · referência da comparação', Icon: Receipt, tone: 'coral', best: presMelhor },
    {
      k: 'alt',
      label: altIsSimples ? 'Simples Nacional (DAS)' : 'Lucro Real',
      value: cmp.alt.valor,
      sub: altIsSimples ? 'Alternativa comparada ao Presumido' : 'Alternativa comparada ao Presumido',
      Icon: altIsSimples ? PiggyBank : Landmark,
      tone: altIsSimples ? 'stone' : 'teal',
      best: !presMelhor,
    },
  ];
  const sinal = cmp.difAlt;
  const economiaAlt = sinal > 0.5;
  return (
    <div id="resumo" className="space-y-3">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {cards.map((c, i) => (
          <motion.div
            key={c.k}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 220, damping: 24 }}
            className={clsx('card lift relative overflow-hidden p-4', c.best && 'ring-2 ring-coral-400 shadow-[0_24px_48px_-20px_rgba(242,92,84,0.55)]')}
          >
            {c.best && (
              <span className="pulse-ring absolute right-4 top-3 flex items-center gap-1 rounded-full bg-coral-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                <Award size={12} /> Menor carga
              </span>
            )}
            <span
              className={clsx(
                'grid h-8 w-8 place-items-center rounded-lg',
                c.tone === 'teal' && 'bg-teal-100 text-teal-700',
                c.tone === 'coral' && 'bg-coral-100 text-coral-600',
                c.tone === 'stone' && 'bg-stone-200 text-stone-brand',
              )}
            >
              <c.Icon size={16} />
            </span>
            <p className="mt-2.5 text-[11px] font-semibold uppercase tracking-wider text-stone-brand">{'Carga · ' + c.label}</p>
            <p className="font-display mt-0.5 text-2xl font-semibold text-teal-900">
              <AnimatedNumber value={c.value} format={brl} />
            </p>
            <p className="mt-0.5 text-[11px] text-stone-brand">{c.sub}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        layout
        className="shimmer relative overflow-hidden rounded-2xl bg-gradient-to-r from-coral-500 to-coral-400 p-4 text-white shadow-xl shadow-coral-500/25 sm:p-5"
      >
        <img src="./brand/mark.png" alt="" aria-hidden className="pointer-events-none absolute -right-8 -top-10 w-36 opacity-15 brightness-200" />
        <div className="relative grid gap-4 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/80">Melhor tributação {consolidado ? 'para a seleção' : 'para a empresa'}</p>
            <h3 className="font-display mt-1 text-2xl font-semibold sm:text-3xl">{cmp.melhor.nome}</h3>
            <p className="mt-1.5 max-w-xl text-sm text-white/90">
              {presMelhor ? (
                <>
                  O Lucro Presumido, tributação atual, continua sendo a opção mais vantajosa. {cmp.alt.nome} custaria{' '}
                  <b className="num">{brl(-sinal)}</b> a mais no período.
                </>
              ) : (
                <>
                  {cmp.melhor.nome} reduz a carga em <b className="num">{brl(cmp.melhor.economia)}</b> no período em relação ao Lucro Presumido.
                </>
              )}
              {otimizado && otimizado.economia > 1 && (
                <>
                  {' '}Escolhendo o melhor regime <b>empresa a empresa</b>, a economia sobre o Presumido sobe para{' '}
                  <b className="num">{brl(otimizado.economia)}</b>.
                </>
              )}
            </p>
          </div>
          <div className="rounded-xl bg-white/15 p-3.5 backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
              {cmp.alt.nome} × Lucro Presumido
            </p>
            <p className="font-display mt-0.5 text-2xl font-semibold sm:text-3xl">
              <AnimatedNumber value={Math.abs(sinal)} format={brl} />
            </p>
            <p className="mt-0.5 text-xs text-white/90">
              {Math.abs(sinal) < 0.5 ? 'Sem diferença entre os regimes' : economiaAlt ? 'de economia em relação ao Presumido' : 'de custo adicional em relação ao Presumido'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
