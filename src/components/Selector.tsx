import { motion } from 'motion/react';
import { Check, Layers, User } from 'lucide-react';
import clsx from 'clsx';
import type { Empresa } from '../lib/engine.ts';
import { nomeLoja } from '../lib/format.ts';

export type Modo = 'individual' | 'consolidado';

const MODOS = [
  { m: 'individual' as const, l: 'Individual', Icon: User },
  { m: 'consolidado' as const, l: 'Consolidado', Icon: Layers },
];

export function ModoToggle({ modo, onModo }: { modo: Modo; onModo: (m: Modo) => void }) {
  return (
    <div role="radiogroup" aria-label="Modo de análise" className="relative flex shrink-0 rounded-full bg-teal-50 p-1 text-sm font-semibold shadow-inner">
      {MODOS.map(({ m, l, Icon }) => (
        <button
          key={m}
          role="radio"
          aria-checked={modo === m}
          onClick={() => onModo(m)}
          className={clsx(
            'relative z-10 flex items-center gap-2 rounded-full px-3.5 py-1.5 transition-colors active:scale-95 sm:px-4',
            modo === m ? 'text-white' : 'text-teal-700 hover:text-teal-900',
          )}
        >
          {modo === m && (
            <motion.span
              layoutId="modo-pill"
              className="absolute inset-0 -z-10 rounded-full bg-coral-500 shadow-[0_6px_16px_-4px_rgba(242,92,84,0.8)]"
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            />
          )}
          <Icon size={15} /> <span className="hidden sm:inline">{l}</span>
        </button>
      ))}
    </div>
  );
}

interface Props {
  empresas: Empresa[];
  grupos: string[];
  sel: Set<string>;
  modo: Modo;
  onToggle: (id: string) => void;
  onSet: (ids: string[]) => void;
}

export default function Selector({ empresas, grupos, sel, modo, onToggle, onSet }: Props) {
  const multi = modo === 'consolidado';
  const controles = (
    <div className="ml-auto flex shrink-0 items-center gap-1">
      <button onClick={() => onSet(empresas.map((e) => e.id))} className="rounded-full bg-teal-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-teal-800 active:scale-95">
        Todas
      </button>
      <button onClick={() => onSet([])} className="rounded-full px-3 py-1.5 text-xs font-semibold text-stone-brand transition hover:bg-stone-100 active:scale-95">
        Limpar
      </button>
    </div>
  );
  return (
    <div className="flex flex-col py-1" aria-label="Empresas do grupo">
      {grupos.map((g, i) => (
        <div key={g} className="flex flex-wrap items-center gap-1.5 border-t border-teal-900/5 py-1.5 first:border-t-0">
          <button
            disabled={!multi}
            onClick={() => onSet(empresas.filter((e) => e.grupo === g).map((e) => e.id))}
            title={multi ? 'Selecionar todo o CNPJ ' + g : undefined}
            className={clsx(
              'w-[76px] shrink-0 rounded-md bg-coral-100 px-2 py-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-coral-700',
              multi && 'transition hover:bg-coral-200 active:scale-95',
            )}
          >
            CNPJ {g}
          </button>
          {empresas
            .filter((e) => e.grupo === g)
            .map((e) => {
              const on = sel.has(e.id);
              return (
                <button
                  key={e.id}
                  onClick={() => onToggle(e.id)}
                  aria-pressed={on}
                  title={'CNPJ ' + e.grupo + ' · filial ' + e.codigo}
                  className={clsx(
                    'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] font-semibold transition-all duration-200 active:scale-95',
                    on
                      ? 'border-teal-600 bg-gradient-to-br from-teal-600 to-teal-800 text-white shadow-[0_8px_18px_-8px_rgba(7,120,144,0.9)]'
                      : 'border-teal-900/15 bg-white text-teal-900 hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md',
                  )}
                >
                  {on && <Check size={13} strokeWidth={3} />}
                  {nomeLoja(e.nome)}
                  <span className={clsx('num text-[10px] font-medium', on ? 'text-teal-100' : 'text-stone-brand')}>{e.codigo}</span>
                </button>
              );
            })}
          {i === 0 && multi && controles}
        </div>
      ))}
    </div>
  );
}
