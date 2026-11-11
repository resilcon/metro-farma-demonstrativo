import { RotateCcw, Info } from 'lucide-react';
import clsx from 'clsx';
import type { Empresa } from '../lib/engine.ts';
import { brl, MESES, nomeLoja, pct } from '../lib/format.ts';

export type DasEdit = Record<string, Record<string, number>>;

export const dasOriginal = (e: Empresa, mes: string) => e.meses.find((m) => m.mes === mes)?.das ?? 0;
export const dasMes = (e: Empresa, edit: DasEdit, mes: string) => edit[e.id]?.[mes] ?? dasOriginal(e, mes);
export const dasTotal = (e: Empresa, edit: DasEdit) => MESES.reduce((s, m) => s + dasMes(e, edit, m), 0);

interface Props {
  empresas: Empresa[];
  edit: DasEdit;
  onChange: (id: string, mes: string, v: number | null) => void;
  onReset: (id: string) => void;
}

export default function SimplesEditor({ empresas, edit, onChange, onReset }: Props) {
  return (
    <div>
      <div className="mb-5 flex items-start gap-3 rounded-2xl bg-teal-50 p-4 text-sm text-teal-900">
        <Info size={18} className="mt-0.5 shrink-0 text-teal-600" />
        <p>
          Valores do <b>DAS</b> (Simples Nacional) pago por mês. Edite qualquer valor da planilha ou preencha os meses que estão vazios — o
          total da empresa e o comparativo entre regimes recalculam na hora. Células alteradas ficam destacadas.
        </p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-teal-900/10">
        <table className="w-full min-w-[1580px] text-sm">
          <thead>
            <tr className="bg-teal-50 text-xs uppercase tracking-wider text-stone-brand">
              <th className="sticky left-0 z-10 bg-teal-50 px-3 py-3 text-left font-semibold">Empresa</th>
              {MESES.map((m) => (
                <th key={m} className="px-1 py-3 text-center font-semibold">{m.slice(0, 3)}</th>
              ))}
              <th className="px-3 py-3 text-right font-semibold">Total DAS</th>
              <th className="px-3 py-3 text-right font-semibold">% receita</th>
              <th className="no-print px-2" />
            </tr>
          </thead>
          <tbody>
            {empresas.map((e) => {
              const tot = dasTotal(e, edit);
              const rec = e.vendas + e.servicos;
              const faltam = e.meses.filter((m) => m.vendas + m.servicos > 0 && dasMes(e, edit, m.mes) === 0).map((m) => m.mes);
              const mexido = !!edit[e.id] && Object.keys(edit[e.id]).length > 0;
              return (
                <tr key={e.id} className="border-t border-teal-900/5 transition hover:bg-teal-50/50">
                  <td className="sticky left-0 z-10 bg-white px-3 py-1.5">
                    <p className="font-display font-semibold text-teal-900">{nomeLoja(e.nome)}</p>
                    <p className="num text-[11px] text-stone-brand">CNPJ {e.grupo} · filial {e.codigo}</p>
                    {tot > 0 && faltam.length > 0 && (
                      <p className="mt-0.5 text-[11px] font-semibold text-coral-600" title="Meses com faturamento e sem DAS informado">
                        ⚠ sem DAS em: {faltam.map((m) => m.slice(0, 3)).join(', ')}
                      </p>
                    )}
                  </td>
                  {MESES.map((m) => {
                    const orig = dasOriginal(e, m);
                    const v = dasMes(e, edit, m);
                    const alterado = edit[e.id]?.[m] !== undefined && edit[e.id][m] !== orig;
                    return (
                      <td key={m} className="px-1 py-2">
                        <input
                          aria-label={'DAS ' + m + ' ' + e.nome}
                          type="number"
                          min={0}
                          step={0.01}
                          placeholder="—"
                          value={v === 0 ? '' : Number(v.toFixed(2))}
                          onChange={(ev) => {
                            const n = ev.target.value === '' ? 0 : Math.max(0, Number(ev.target.value));
                            onChange(e.id, m, n === orig ? null : n);
                          }}
                          className={clsx(
                            'num w-[104px] rounded-lg border px-2 py-1.5 text-right text-[13px] outline-none transition',
                            alterado
                              ? 'border-coral-400 bg-coral-50 font-semibold text-coral-700 shadow-[0_0_0_3px_rgba(242,92,84,0.12)]'
                              : v > 0
                                ? 'border-teal-900/15 bg-white focus:border-teal-600 focus:shadow-[0_0_0_3px_rgba(7,120,144,0.15)]'
                                : 'border-dashed border-teal-900/20 bg-stone-50 focus:border-teal-600 focus:bg-white',
                          )}
                        />
                      </td>
                    );
                  })}
                  <td className="num px-3 py-2 text-right font-bold text-teal-900">{tot > 0 ? brl(tot) : <span className="text-stone-400">N/D</span>}</td>
                  <td className="num px-3 py-2 text-right text-stone-brand">{tot > 0 && rec ? pct(tot / rec) : '—'}</td>
                  <td className="no-print px-2 py-2 text-right">
                    {mexido && (
                      <button onClick={() => onReset(e.id)} title="Restaurar valores da planilha" aria-label={'Restaurar DAS de ' + e.nome} className="rounded-lg p-2 text-coral-600 transition hover:bg-coral-100">
                        <RotateCcw size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
