import { Crosshair } from 'lucide-react';
import clsx from 'clsx';
import type { Comparacao, Empresa, Resultado } from '../lib/engine.ts';
import { brl, nomeLoja, pct } from '../lib/format.ts';
import { COR_REGIME } from './Charts.tsx';

export interface Linha {
  e: Empresa;
  r: Resultado;
  cmp: Comparacao;
  melhor: Comparacao['melhor'];
}
interface Props {
  linhas: Linha[];
  total: Resultado;
  totalCmp: Comparacao;
  onCusto: (id: string, v: number) => void;
  onIsolar: (id: string) => void;
  onSimples: (id: string, v: boolean) => void;
}

function Val({ v, destaque, off }: { v: number | null; destaque: boolean; off: boolean }) {
  if (off) return <span className="text-stone-300">—</span>;
  if (v == null) return <span className="text-stone-400">N/D</span>;
  return <span className={destaque ? 'rounded-md bg-teal-100 px-2 py-1 font-bold text-teal-800' : ''}>{brl(v)}</span>;
}

function Dif({ c }: { c: Comparacao }) {
  const d = c.difAlt;
  if (Math.abs(d) < 0.5) return <span className="text-stone-brand">—</span>;
  return (
    <span className={clsx('font-semibold', d > 0 ? 'text-teal-700' : 'text-coral-600')}>
      {d > 0 ? '− ' : '+ '}
      {brl(Math.abs(d))}
      <span className="block text-[10px] font-medium uppercase tracking-wide text-stone-brand">{d > 0 ? 'economia' : 'a mais'}</span>
    </span>
  );
}

export default function StoresTable({ linhas, total, totalCmp, onCusto, onIsolar, onSimples }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1180px] text-sm">
        <thead>
          <tr className="border-b-2 border-teal-900/10 text-xs uppercase tracking-wider text-stone-brand">
            <th className="px-3 py-2 text-left font-semibold">Empresa</th>
            <th className="px-3 py-2 text-right font-semibold">Faturamento</th>
            <th className="px-3 py-2 text-right font-semibold">Margem atual</th>
            <th className="px-3 py-2 text-right font-semibold">Custo %</th>
            <th className="px-3 py-2 text-right font-semibold text-coral-600">Presumido (atual)</th>
            <th className="px-3 py-2 text-right font-semibold text-teal-700">Lucro Real</th>
            <th className="px-3 py-2 text-right font-semibold">Simples</th>
            <th className="px-3 py-2 text-right font-semibold">Dif. vs Presumido</th>
            <th className="px-3 py-2 text-left font-semibold">Melhor regime</th>
            <th className="px-3 py-2 text-center font-semibold">Simples</th>
            <th className="no-print px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {linhas.map(({ e, r, cmp, melhor }) => {
            const temDas = r.simples != null;
            return (
              <tr key={e.id} className="border-b border-teal-900/5 transition hover:bg-teal-50/60">
                <td className="px-3 py-2">
                  <p className="font-display font-semibold text-teal-900">{nomeLoja(e.nome)}</p>
                  <p className="num text-xs text-stone-brand">
                    CNPJ {e.grupo} · filial {e.codigo}
                  </p>
                </td>
                <td className="num px-3 py-2 text-right font-semibold">{brl(r.receita)}</td>
                <td className="num px-3 py-2 text-right text-stone-brand">{pct(e.margemAtual, 2)}</td>
                <td className="px-3 py-2 text-right">
                  <label className="inline-flex items-center gap-1 rounded-lg border border-teal-900/15 bg-white px-2 py-1 focus-within:border-teal-600">
                    <input
                      aria-label={'Custo da empresa ' + e.nome}
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={Number((r.custo * 100).toFixed(1))}
                      onChange={(ev) => onCusto(e.id, Math.max(0, Math.min(100, Number(ev.target.value))) / 100)}
                      className="num w-16 bg-transparent text-right font-semibold outline-none"
                    />
                    <span className="text-stone-brand">%</span>
                  </label>
                </td>
                <td className="num px-3 py-2 text-right">
                  <Val v={r.presumido.total} destaque={melhor.nome === 'Lucro Presumido'} off={false} />
                </td>
                <td className="num px-3 py-2 text-right">
                  <Val v={r.real.total} destaque={melhor.nome === 'Lucro Real'} off={cmp.usaSimples} />
                </td>
                <td className="num px-3 py-2 text-right">
                  <Val v={r.simples} destaque={melhor.nome === 'Simples Nacional'} off={!cmp.usaSimples && temDas} />
                </td>
                <td className="num px-3 py-2 text-right">
                  <Dif c={cmp} />
                </td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: COR_REGIME[melhor.nome] }}>
                    {melhor.nome}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    role="switch"
                    aria-checked={cmp.usaSimples}
                    aria-label={'Comparar ' + e.nome + ' com o Simples'}
                    disabled={!temDas}
                    title={temDas ? 'Ligar ou desligar o Simples nesta empresa' : 'Sem DAS informado — preencha na aba Simples (DAS)'}
                    onClick={() => onSimples(e.id, !cmp.usaSimples)}
                    className={clsx(
                      'relative h-6 w-11 rounded-full transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-40',
                      cmp.usaSimples ? 'bg-teal-600' : 'bg-stone-300',
                    )}
                  >
                    <span className={clsx('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-300', cmp.usaSimples ? 'left-[22px]' : 'left-0.5')} />
                  </button>
                </td>
                <td className="no-print px-3 py-2 text-right">
                  <button
                    onClick={() => onIsolar(e.id)}
                    title="Ver só esta empresa"
                    aria-label={'Ver só a empresa ' + e.nome}
                    className="rounded-lg p-2 text-teal-700 transition hover:bg-teal-100"
                  >
                    <Crosshair size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
        {linhas.length > 1 && (
          <tfoot>
            <tr className="bg-teal-900 text-white">
              <td className="rounded-bl-2xl px-3 py-3 font-display font-semibold">Consolidado</td>
              <td className="num px-3 py-3 text-right font-bold">{brl(total.receita)}</td>
              <td />
              <td />
              <td className="num px-3 py-3 text-right font-bold">{brl(total.presumido.total)}</td>
              <td className="num px-3 py-3 text-right font-bold">{totalCmp.usaSimples ? '—' : brl(total.real.total)}</td>
              <td className="num px-3 py-3 text-right font-bold">{totalCmp.usaSimples && total.simples != null ? brl(total.simples) : '—'}</td>
              <td className="num px-3 py-3 text-right font-bold">
                {Math.abs(totalCmp.difAlt) < 0.5 ? '—' : (totalCmp.difAlt > 0 ? '− ' : '+ ') + brl(Math.abs(totalCmp.difAlt))}
              </td>
              <td className="px-3 py-3 text-xs font-bold">{totalCmp.melhor.nome}</td>
              <td />
              <td className="rounded-br-2xl" />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
