import { Crosshair } from 'lucide-react';
import clsx from 'clsx';
import { comparar, consolidar } from '../lib/engine.ts';
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
  fora: Set<string>; // empresas desmarcadas (não entram na soma do rodapé)
  onFora: (id: string, fora: boolean) => void;
  onTodas: (marcar: boolean) => void;
  simplesGrupo: boolean;
  onCusto: (id: string, v: number) => void;
  onIsolar: (id: string) => void;
  onSimples: (id: string, v: boolean) => void;
}

const CURTO: Record<string, string> = { 'Lucro Presumido': 'Presumido', 'Lucro Real': 'Real', 'Simples Nacional': 'Simples' };

function Dif({ d }: { d: number }) {
  if (Math.abs(d) < 0.5) return <span className="text-stone-brand">—</span>;
  return (
    <span className={clsx('whitespace-nowrap font-semibold leading-tight', d > 0 ? 'text-teal-700' : 'text-coral-600')}>
      {(d > 0 ? '− ' : '+ ') + brl(Math.abs(d))}
      <span className="block text-[10px] font-medium uppercase tracking-wide text-stone-brand">{d > 0 ? 'economia' : 'a mais'}</span>
    </span>
  );
}

export default function StoresTable({ linhas, fora, onFora, onTodas, simplesGrupo, onCusto, onIsolar, onSimples }: Props) {
  // O rodapé soma SÓ as empresas marcadas (cada empresa é tributada separadamente e os resultados são somados).
  const marcadas = linhas.filter((l) => !fora.has(l.e.id));
  const sub: Resultado = consolidar(marcadas.map(({ e, r }) => ({ e, r })));
  if (!marcadas.every((l) => l.r.simples != null)) sub.simples = null;
  const subCmp = comparar(sub, simplesGrupo);
  const recMarcadas = marcadas.reduce((s, l) => s + l.r.receita, 0);
  const margemMarcadas = recMarcadas ? marcadas.reduce((s, l) => s + l.e.margemAtual * l.r.receita, 0) / recMarcadas : 0;
  const nenhuma = marcadas.length === 0;
  const tdNum = 'num whitespace-nowrap px-2 py-2 text-right';

  return (
    <div className="overflow-x-auto rounded-xl">
      <table className="w-full min-w-[1020px] text-[13px]">
        <thead>
          <tr className="border-b-2 border-teal-900/10 text-[11px] uppercase tracking-wider text-stone-brand">
            <th className="w-9 px-2 py-2">
              <input
                type="checkbox"
                aria-label="Marcar ou desmarcar todas as empresas na soma"
                title="Marcar ou desmarcar todas"
                checked={marcadas.length === linhas.length}
                ref={(el) => {
                  if (el) el.indeterminate = marcadas.length > 0 && marcadas.length < linhas.length;
                }}
                onChange={(ev) => onTodas(ev.target.checked)}
                className="h-4 w-4 cursor-pointer accent-teal-600"
              />
            </th>
            <th className="px-2 py-2 text-left font-semibold">Empresa</th>
            <th className="px-2 py-2 text-right font-semibold">Faturamento</th>
            <th className="px-2 py-2 text-right font-semibold">Margem atual</th>
            <th className="px-2 py-2 text-right font-semibold">Custo</th>
            <th className="px-2 py-2 text-right font-semibold text-coral-600">Presumido (atual)</th>
            <th className="px-2 py-2 text-right font-semibold text-teal-700">Alternativa</th>
            <th className="px-2 py-2 text-right font-semibold">Dif. vs Presumido</th>
            <th className="px-2 py-2 text-left font-semibold">Melhor</th>
            <th className="px-2 py-2 text-center font-semibold">Simples</th>
            <th className="no-print w-9 px-1 py-2" />
          </tr>
        </thead>
        <tbody>
          {linhas.map(({ e, r, cmp, melhor }) => {
            const temDas = r.simples != null;
            return (
              <tr key={e.id} className={clsx('border-b border-teal-900/5 transition hover:bg-teal-50/60', fora.has(e.id) && 'opacity-45')}>
                <td className="px-2 py-2">
                  <input
                    type="checkbox"
                    aria-label={'Somar ' + e.nome + ' no rodapé'}
                    title="Marcar para entrar na soma do rodapé"
                    checked={!fora.has(e.id)}
                    onChange={(ev) => onFora(e.id, !ev.target.checked)}
                    className="h-4 w-4 cursor-pointer accent-teal-600"
                  />
                </td>
                <td className="whitespace-nowrap px-2 py-2">
                  <p className="font-display font-semibold leading-tight text-teal-900">{nomeLoja(e.nome)}</p>
                  <p className="num text-[11px] leading-tight text-stone-brand">
                    CNPJ {e.grupo} · filial {e.codigo}
                  </p>
                </td>
                <td className={clsx(tdNum, 'font-semibold')}>{brl(r.receita)}</td>
                <td className={clsx(tdNum, 'text-stone-brand')}>{pct(e.margemAtual, 2)}</td>
                <td className="px-2 py-2 text-right">
                  <label className="inline-flex items-center gap-0.5 rounded-lg border border-teal-900/15 bg-white px-1.5 py-0.5 focus-within:border-teal-600">
                    <input
                      aria-label={'Custo da empresa ' + e.nome}
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={Number((r.custo * 100).toFixed(1))}
                      onChange={(ev) => onCusto(e.id, Math.max(0, Math.min(100, Number(ev.target.value))) / 100)}
                      className="num w-11 bg-transparent text-right font-semibold outline-none"
                    />
                    <span className="text-stone-brand">%</span>
                  </label>
                </td>
                <td className={tdNum}>
                  <span className={melhor.nome === 'Lucro Presumido' ? 'rounded-md bg-teal-100 px-1.5 py-0.5 font-bold text-teal-800' : ''}>{brl(r.presumido.total)}</span>
                </td>
                <td className={tdNum}>
                  <span className={cmp.melhor.nome === cmp.alt.nome ? 'rounded-md bg-teal-100 px-1.5 py-0.5 font-bold text-teal-800' : ''}>{brl(cmp.alt.valor)}</span>
                  <span className="block text-[10px] font-medium uppercase tracking-wide text-stone-brand">{CURTO[cmp.alt.nome]}</span>
                </td>
                <td className={tdNum}>
                  <Dif d={cmp.difAlt} />
                </td>
                <td className="px-2 py-2">
                  <span className="inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white" style={{ background: COR_REGIME[melhor.nome] }}>
                    {CURTO[melhor.nome]}
                  </span>
                </td>
                <td className="px-2 py-2 text-center">
                  <button
                    role="switch"
                    aria-checked={cmp.usaSimples}
                    aria-label={'Comparar ' + e.nome + ' com o Simples'}
                    disabled={!temDas}
                    title={temDas ? 'Comparar Presumido × Simples nesta empresa' : 'Sem DAS informado — preencha na aba Simples (DAS)'}
                    onClick={() => onSimples(e.id, !cmp.usaSimples)}
                    className={clsx(
                      'relative h-5 w-9 rounded-full transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-40',
                      cmp.usaSimples ? 'bg-teal-600' : 'bg-stone-300',
                    )}
                  >
                    <span className={clsx('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-300', cmp.usaSimples ? 'left-[18px]' : 'left-0.5')} />
                  </button>
                </td>
                <td className="no-print px-1 py-2 text-right">
                  <button
                    onClick={() => onIsolar(e.id)}
                    title="Ver só esta empresa"
                    aria-label={'Ver só a empresa ' + e.nome}
                    className="rounded-lg p-1.5 text-teal-700 transition hover:bg-teal-100"
                  >
                    <Crosshair size={15} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-teal-900 text-white">
            <td colSpan={2} className="whitespace-nowrap rounded-bl-xl px-3 py-3 font-display font-semibold">
              {nenhuma ? 'Nenhuma marcada' : marcadas.length === linhas.length ? 'Consolidado' : 'Soma das marcadas'}
              <span className="ml-2 text-[11px] font-medium text-teal-200">
                {marcadas.length} de {linhas.length}
              </span>
            </td>
            <td className="num whitespace-nowrap px-2 py-3 text-right font-bold">{nenhuma ? '—' : brl(sub.receita)}</td>
            <td className="num whitespace-nowrap px-2 py-3 text-right text-teal-200">{nenhuma ? '' : pct(margemMarcadas, 2)}</td>
            <td />
            <td className="num whitespace-nowrap px-2 py-3 text-right font-bold">{nenhuma ? '—' : brl(sub.presumido.total)}</td>
            <td className="num whitespace-nowrap px-2 py-3 text-right font-bold">
              {nenhuma ? '—' : brl(subCmp.alt.valor)}
              {!nenhuma && <span className="block text-[10px] font-medium uppercase tracking-wide text-teal-200">{CURTO[subCmp.alt.nome]}</span>}
            </td>
            <td className="num whitespace-nowrap px-2 py-3 text-right font-bold">
              {nenhuma || Math.abs(subCmp.difAlt) < 0.5 ? '—' : (subCmp.difAlt > 0 ? '− ' : '+ ') + brl(Math.abs(subCmp.difAlt))}
            </td>
            <td className="whitespace-nowrap px-2 py-3 text-xs font-bold">{nenhuma ? '' : CURTO[subCmp.melhor.nome]}</td>
            <td />
            <td className="rounded-br-xl" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
