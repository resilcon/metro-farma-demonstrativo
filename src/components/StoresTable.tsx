import { Crosshair } from 'lucide-react';
import type { Empresa, RegimeNome, Resultado } from '../lib/engine.ts';
import { brl, nomeLoja, pct } from '../lib/format.ts';
import { COR_REGIME } from './Charts.tsx';

export interface Linha {
  e: Empresa;
  r: Resultado;
  melhor: { nome: RegimeNome; valor: number; economia: number };
}
interface Props {
  linhas: Linha[];
  total: Resultado;
  onCusto: (id: string, v: number) => void;
  onIsolar: (id: string) => void;
}

function Val({ v, r }: { v: number | null; r: Resultado }) {
  if (v == null) return <span className="text-stone-400">N/D</span>;
  const min = Math.min(r.real.total, r.presumido.total, r.simples ?? Infinity);
  return <span className={Math.abs(v - min) < 0.5 ? 'rounded-md bg-teal-100 px-2 py-1 font-bold text-teal-800' : ''}>{brl(v)}</span>;
}

export default function StoresTable({ linhas, total, onCusto, onIsolar }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-sm">
        <thead>
          <tr className="border-b-2 border-teal-900/10 text-xs uppercase tracking-wider text-stone-brand">
            <th className="px-3 py-3 text-left font-semibold">Loja</th>
            <th className="px-3 py-3 text-right font-semibold">Meses</th>
            <th className="px-3 py-3 text-right font-semibold">Receita</th>
            <th className="px-3 py-3 text-right font-semibold">Custo %</th>
            <th className="px-3 py-3 text-right font-semibold">Lucro Real</th>
            <th className="px-3 py-3 text-right font-semibold">Presumido</th>
            <th className="px-3 py-3 text-right font-semibold">Simples</th>
            <th className="px-3 py-3 text-left font-semibold">Melhor regime</th>
            <th className="px-3 py-3 text-right font-semibold">Alíq. efetiva</th>
            <th className="no-print px-3 py-3" />
          </tr>
        </thead>
        <tbody>
          {linhas.map(({ e, r, melhor }) => (
            <tr key={e.id} className="border-b border-teal-900/5 transition hover:bg-teal-50/60">
              <td className="px-3 py-3">
                <p className="font-display font-semibold text-teal-900">{nomeLoja(e.nome)}</p>
                <p className="num text-xs text-stone-brand">{e.id}</p>
              </td>
              <td className="num px-3 py-3 text-right text-stone-brand">{e.meses.length}</td>
              <td className="num px-3 py-3 text-right font-semibold">{brl(r.receita)}</td>
              <td className="px-3 py-3 text-right">
                <label className="inline-flex items-center gap-1 rounded-lg border border-teal-900/15 bg-white px-2 py-1 focus-within:border-teal-600">
                  <input
                    aria-label={'Custo da loja ' + e.nome}
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
              <td className="num px-3 py-3 text-right"><Val v={r.real.total} r={r} /></td>
              <td className="num px-3 py-3 text-right"><Val v={r.presumido.total} r={r} /></td>
              <td className="num px-3 py-3 text-right"><Val v={r.simples} r={r} /></td>
              <td className="px-3 py-3">
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: COR_REGIME[melhor.nome] }}>
                  {melhor.nome}
                </span>
              </td>
              <td className="num px-3 py-3 text-right font-semibold">{pct(r.receita ? melhor.valor / r.receita : 0)}</td>
              <td className="no-print px-3 py-3 text-right">
                <button onClick={() => onIsolar(e.id)} title="Ver só esta loja" aria-label={'Ver só a loja ' + e.nome} className="rounded-lg p-2 text-teal-700 transition hover:bg-teal-100">
                  <Crosshair size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        {linhas.length > 1 && (
          <tfoot>
            <tr className="bg-teal-900 text-white">
              <td className="rounded-bl-2xl px-3 py-4 font-display font-semibold">Consolidado</td>
              <td />
              <td className="num px-3 py-4 text-right font-bold">{brl(total.receita)}</td>
              <td className="num px-3 py-4 text-right text-teal-200">{pct(total.custo)} méd.</td>
              <td className="num px-3 py-4 text-right font-bold">{brl(total.real.total)}</td>
              <td className="num px-3 py-4 text-right font-bold">{brl(total.presumido.total)}</td>
              <td className="num px-3 py-4 text-right font-bold">{total.simples == null ? 'N/D' : brl(total.simples)}</td>
              <td />
              <td />
              <td className="rounded-br-2xl" />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
