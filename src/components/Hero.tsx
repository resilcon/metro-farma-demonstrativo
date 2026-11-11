import { Building2, CalendarRange, ShieldCheck } from 'lucide-react';

export default function Hero({ lojas, periodo }: { lojas: number; periodo: string }) {
  const chips = [
    { Icon: Building2, t: `${lojas} lojas do grupo` },
    { Icon: CalendarRange, t: periodo },
    { Icon: ShieldCheck, t: 'Cálculos conferidos com a planilha' },
  ];
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-teal-950 via-teal-900 to-teal-700 text-white">
      <img
        src="./brand/mark.png"
        alt=""
        aria-hidden
        className="pointer-events-none float-slow absolute -right-24 -top-24 w-[560px] opacity-[0.08] sm:-right-10"
      />
      <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_85%_0%,rgba(242,92,84,0.28),transparent_60%)]" />
      <div className="relative mx-auto max-w-[1320px] px-4 pb-40 pt-12 sm:px-8 sm:pt-16">
        <p className="rise text-xs font-semibold uppercase tracking-[0.28em] text-coral-300">
          Comparativo tributário · Grupo Metrô Farma
        </p>
        <h1 className="rise mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] sm:text-6xl" style={{ animationDelay: '.08s' }}>
          Qual o melhor regime <span className="text-coral-400">para o grupo?</span>
        </h1>
        <p className="rise mt-5 max-w-2xl text-lg text-teal-100/90" style={{ animationDelay: '.16s' }}>
          Analise cada loja individualmente ou combine as empresas que quiser e veja a carga tributária somada em uma
          única tela — com o custo editável em tempo real.
        </p>
        <div className="rise mt-8 flex flex-wrap gap-3 text-sm" style={{ animationDelay: '.24s' }}>
          {chips.map(({ Icon, t }) => (
            <span key={t} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
              <Icon size={16} className="text-coral-300" /> {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
