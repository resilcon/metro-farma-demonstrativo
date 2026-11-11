import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { RotateCcw, Users } from 'lucide-react';
import { brl, brlCompact } from '../lib/format.ts';

const TIP = { borderRadius: 14, border: '1px solid rgba(3,50,60,.1)', boxShadow: '0 12px 32px -12px rgba(3,50,60,.3)', fontSize: 13 };

interface ControleProps {
  valor: number; // 0..1
  alterado: boolean;
  onChange: (v: number) => void;
  onReset: () => void;
  folhaTotal: number; // folha a 100%, em R$
  escopo: string;
}

export function FolhaControle({ valor, alterado, onChange, onReset, folhaTotal, escopo }: ControleProps) {
  const v = Math.max(0, Math.min(100, valor * 100));
  const mantida = folhaTotal * (v / 100);
  return (
    <section className="card lift flex h-full flex-col px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-coral-100 text-coral-600">
            <Users size={16} />
          </span>
          <div className="leading-tight">
            <h3 className="text-base font-semibold text-teal-900">Folha de pagamento considerada</h3>
            <p className="text-xs text-stone-brand">Aplicado a {escopo}</p>
          </div>
        </div>
        {alterado && (
          <button onClick={onReset} className="flex items-center gap-1.5 rounded-full border border-teal-700/25 px-3 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-50">
            <RotateCcw size={13} /> Voltar a 100%
          </button>
        )}
      </div>
      <p className="mt-3 text-xs text-stone-brand">
        Percentual da folha que continua nas empresas atuais. Ex.: 60% significa que 40% da folha passa para uma nova empresa, o que reduz os tributos de folha pagos hoje.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="min-w-[180px] flex-1">
          <input
            aria-label="Percentual da folha considerado"
            type="range"
            min={0}
            max={100}
            step={1}
            value={v}
            style={{ ['--p' as string]: `${v}%` }}
            className="slider w-full"
            onChange={(e) => onChange(Number(e.target.value) / 100)}
          />
          <div className="mt-1 flex justify-between text-[10px] text-stone-brand">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
        <label className="flex items-center gap-1 rounded-xl border-2 border-teal-600/30 bg-white px-3 py-1 focus-within:border-teal-600">
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={Number(v.toFixed(0))}
            onChange={(e) => onChange(Math.max(0, Math.min(100, Number(e.target.value))) / 100)}
            className="num w-14 bg-transparent text-right font-display text-xl font-semibold text-teal-900 outline-none"
          />
          <span className="font-display text-lg font-semibold text-coral-500">%</span>
        </label>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg bg-teal-50 px-3 py-2">
          <dt className="text-stone-brand">Folha total</dt>
          <dd className="num mt-0.5 text-sm font-semibold text-teal-900">{brl(folhaTotal)}</dd>
        </div>
        <div className="rounded-lg bg-teal-50 px-3 py-2">
          <dt className="text-stone-brand">Mantida</dt>
          <dd className="num mt-0.5 text-sm font-semibold text-teal-900">{brl(mantida)}</dd>
        </div>
        <div className="rounded-lg bg-coral-50 px-3 py-2">
          <dt className="text-stone-brand">Transferida</dt>
          <dd className="num mt-0.5 text-sm font-semibold text-coral-600">{brl(folhaTotal - mantida)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-[11px] text-stone-brand">
        Simula só a queda dos tributos de folha das empresas atuais; não inclui os tributos da nova empresa nem altera o DAS informado.
      </p>
    </section>
  );
}

interface ImpactoProps {
  pct: number; // 0..1
  alt: string;
  cheia: { pres: number; alt: number };
  simulada: { pres: number; alt: number };
}

export function FolhaImpacto({ pct, alt, cheia, simulada }: ImpactoProps) {
  const rotulo = Math.round(pct * 100) + '% da folha';
  const igual = pct >= 0.995;
  const data = [
    { nome: 'Lucro Presumido', cheia: cheia.pres, simulada: simulada.pres },
    { nome: alt, cheia: cheia.alt, simulada: simulada.alt },
  ];
  const redPres = cheia.pres - simulada.pres;
  const redAlt = cheia.alt - simulada.alt;
  const melhor = simulada.pres <= simulada.alt ? 'Lucro Presumido' : alt;
  return (
    <section className="card lift h-full px-4 py-4 sm:px-5">
      <h3 className="text-base font-semibold text-teal-900">Efeito da folha na carga tributária</h3>
      <p className="text-xs text-stone-brand">{igual ? 'Mova o controle ao lado para simular a transferência de folha' : 'Carga com 100% da folha × com ' + rotulo}</p>
      <div className="mt-3 h-[190px]">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 22, right: 8, left: 0, bottom: 0 }} barCategoryGap="28%">
            <CartesianGrid vertical={false} stroke="rgba(3,50,60,.08)" />
            <XAxis dataKey="nome" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6f6b69', fontWeight: 600 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6f6b69' }} tickFormatter={brlCompact} width={64} />
            <Tooltip cursor={{ fill: 'rgba(7,120,144,.06)' }} contentStyle={TIP} formatter={(v, n) => [brl(Number(v)), n]} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="cheia" name="100% da folha" fill="#b5b1af" radius={[8, 8, 0, 0]} animationDuration={700}>
              <LabelList dataKey="cheia" position="top" formatter={(v) => brlCompact(Number(v))} style={{ fontSize: 11, fontWeight: 700, fill: '#6f6b69' }} />
            </Bar>
            <Bar dataKey="simulada" name={igual ? 'Sem simulação' : rotulo} fill="#f25c54" radius={[8, 8, 0, 0]} animationDuration={700}>
              <LabelList dataKey="simulada" position="top" formatter={(v) => brlCompact(Number(v))} style={{ fontSize: 11, fontWeight: 700, fill: '#03323c' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        <div className="rounded-lg bg-teal-50 px-3 py-2">
          <p className="text-stone-brand">Redução no Lucro Presumido</p>
          <p className="num mt-0.5 text-sm font-semibold text-teal-800">{redPres > 0.5 ? '− ' + brl(redPres) : 'Sem redução'}</p>
        </div>
        <div className="rounded-lg bg-teal-50 px-3 py-2">
          <p className="text-stone-brand">Redução em {alt}</p>
          <p className="num mt-0.5 text-sm font-semibold text-teal-800">{redAlt > 0.5 ? '− ' + brl(redAlt) : 'Sem redução'}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-stone-brand">
        {igual ? 'Com a folha atual' : 'Com ' + rotulo}, a menor carga é <b className="text-teal-900">{melhor}</b>.
      </p>
    </section>
  );
}
