import { motion } from 'motion/react';
import { BarChart3, Calculator, Gauge, Table2, Users, Wallet } from 'lucide-react';
import type { ReactNode } from 'react';
import clsx from 'clsx';

export type Aba = 'resumo' | 'comparativo' | 'detalhe' | 'lojas' | 'simples' | 'socios';
export const ABAS: { id: Aba; label: string; Icon: typeof Gauge }[] = [
  { id: 'resumo', label: 'Resumo', Icon: Gauge },
  { id: 'comparativo', label: 'Comparativo', Icon: BarChart3 },
  { id: 'detalhe', label: 'Detalhamento', Icon: Table2 },
  { id: 'lojas', label: 'Por loja', Icon: Calculator },
  { id: 'simples', label: 'Simples (DAS)', Icon: Wallet },
  { id: 'socios', label: 'Sócios', Icon: Users },
];

export default function Tabs({ aba, onAba, right }: { aba: Aba; onAba: (a: Aba) => void; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <nav role="tablist" aria-label="Seções do demonstrativo" className="scrollbar-none flex gap-1 overflow-x-auto">
        {ABAS.map(({ id, label, Icon }) => {
          const on = aba === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={on}
              onClick={() => onAba(id)}
              className={clsx(
                'relative flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors duration-200 active:scale-95',
                on ? 'text-white' : 'text-stone-brand hover:bg-teal-50 hover:text-teal-800',
              )}
            >
              {on && (
                <motion.span
                  layoutId="aba-ativa"
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 shadow-[0_8px_20px_-6px_rgba(7,120,144,0.7)]"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <Icon size={16} className="relative z-10" />
              <span className="relative z-10 whitespace-nowrap">{label}</span>
            </button>
          );
        })}
      </nav>
      {right}
    </div>
  );
}
