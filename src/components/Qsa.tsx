import { Users } from 'lucide-react';

const iniciais = (n: string) =>
  n.split(' ').filter((p) => p.length > 2).slice(0, 2).map((p) => p.charAt(0)).join('').toUpperCase();

export default function Qsa({ dados }: { dados: { empresa: string; socios: string[] }[] }) {
  return (
    <section id="socios" className="scroll-mt-24">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-100 text-teal-700">
          <Users size={20} />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-teal-900">Quadro societário (QSA)</h2>
          <p className="text-sm text-stone-brand">Empresas e sócios do grupo</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {dados.map((d) => (
          <article key={d.empresa} className="card p-5">
            <h3 className="font-display text-base font-semibold text-teal-900">{d.empresa}</h3>
            <ul className="mt-4 space-y-3">
              {d.socios.map((s) => (
                <li key={s} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-teal-600 to-teal-800 text-xs font-bold text-white">
                    {iniciais(s)}
                  </span>
                  <span className="text-sm font-medium">{s}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
