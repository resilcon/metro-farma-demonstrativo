import clsx from 'clsx';
import type { Impostos, Resultado } from '../lib/engine.ts';
import { brl, pct } from '../lib/format.ts';

const LINHAS: { k: keyof Impostos; label: string; nota?: string }[] = [
  { k: 'icms', label: 'ICMS', nota: 'líquido de créditos' },
  { k: 'pis', label: 'PIS', nota: 'líquido de créditos' },
  { k: 'cofins', label: 'COFINS', nota: 'líquido de créditos' },
  { k: 'ipi', label: 'IPI' },
  { k: 'iss', label: 'Imposto sobre serviços (ISS)' },
  { k: 'irpj', label: 'IRPJ', nota: 'inclui adicional' },
  { k: 'csll', label: 'CSLL' },
  { k: 'fopag', label: 'Encargos da folha (FOPAG)' },
];

export default function TaxTable({ r }: { r: Resultado }) {
  const rec = r.receita || 1;
  const Cel = ({ v, win }: { v: number; win: boolean }) => (
    <>
      <td className={clsx('num px-4 py-3 text-right font-semibold', win ? 'text-teal-700' : 'text-ink')}>{brl(v)}</td>
      <td className="num px-4 py-3 text-right text-stone-brand">{pct(v / rec)}</td>
    </>
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b-2 border-teal-900/10 text-xs uppercase tracking-wider text-stone-brand">
            <th className="px-4 py-3 text-left font-semibold">Tributo</th>
            <th colSpan={2} className="px-4 py-3 text-center font-semibold text-teal-700">Lucro Real</th>
            <th colSpan={2} className="px-4 py-3 text-center font-semibold text-coral-600">Lucro Presumido</th>
          </tr>
        </thead>
        <tbody>
          {LINHAS.filter((l) => r.real.impostos[l.k] + r.presumido.impostos[l.k] > 0.5).map((l) => {
            const a = r.real.impostos[l.k];
            const b = r.presumido.impostos[l.k];
            return (
              <tr key={l.k} className="border-b border-teal-900/5 transition hover:bg-teal-50/60">
                <td className="px-4 py-3 font-medium text-teal-900">
                  {l.label} {l.nota && <span className="ml-1 text-xs font-normal text-stone-brand">· {l.nota}</span>}
                </td>
                <Cel v={a} win={a < b - 0.5} />
                <Cel v={b} win={b < a - 0.5} />
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-teal-900 text-white">
            <td className="rounded-bl-2xl px-4 py-4 font-display font-semibold">Carga tributária total</td>
            <td className="num px-4 py-4 text-right text-base font-bold">{brl(r.real.total)}</td>
            <td className="num px-4 py-4 text-right text-teal-200">{pct(r.real.total / rec)}</td>
            <td className="num px-4 py-4 text-right text-base font-bold">{brl(r.presumido.total)}</td>
            <td className="num rounded-br-2xl px-4 py-4 text-right text-teal-200">{pct(r.presumido.total / rec)}</td>
          </tr>
          <tr className="text-stone-brand">
            <td className="px-4 py-3 font-medium">Lucro após impostos sobre o lucro</td>
            <td className="num px-4 py-3 text-right font-semibold text-ink">{brl(r.real.lucroAposImpostos)}</td>
            <td className="num px-4 py-3 text-right">{pct(r.real.lucroAposImpostos / rec)}</td>
            <td className="num px-4 py-3 text-right font-semibold text-ink">{brl(r.presumido.lucroAposImpostos)}</td>
            <td className="num px-4 py-3 text-right">{pct(r.presumido.lucroAposImpostos / rec)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
