import { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

const ease = [0.22, 1, 0.36, 1] as const;

export default function Splash({ onEnter }: { onEnter: () => void }) {
  const calmo = useReducedMotion();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        onEnter();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onEnter]);

  const flutuar = (dx: number, dy: number, dur: number) =>
    calmo ? {} : { x: [0, dx, 0], y: [0, dy, 0], transition: { duration: dur, repeat: Infinity, ease: 'easeInOut' as const } };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Abertura: análise tributária do Grupo Metrô Farma"
      onClick={onEnter}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08, filter: 'blur(14px)', transition: { duration: 0.75, ease } }}
      className="fixed inset-0 z-[100] cursor-pointer overflow-y-auto overflow-x-hidden bg-teal-950 text-white"
    >
      {/* fundo */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,#066276_0%,#03323c_55%,#021f26_100%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.55) 1px, transparent 1px)', backgroundSize: '34px 34px', maskImage: 'radial-gradient(70% 60% at 50% 45%, #000 20%, transparent 80%)' }}
      />
      <motion.div animate={flutuar(60, 40, 14)} className="pointer-events-none absolute -left-24 top-10 h-[420px] w-[420px] rounded-full bg-coral-500/25 blur-[110px]" />
      <motion.div animate={flutuar(-50, -30, 17)} className="pointer-events-none absolute -right-20 bottom-0 h-[460px] w-[460px] rounded-full bg-teal-400/25 blur-[120px]" />
      <motion.img
        src="./brand/mark.png"
        alt=""
        aria-hidden
        initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
        animate={calmo ? { opacity: 0.07, scale: 1 } : { opacity: 0.07, scale: 1, rotate: 360 }}
        transition={calmo ? { duration: 1 } : { opacity: { duration: 1.4 }, scale: { duration: 1.4, ease }, rotate: { duration: 120, repeat: Infinity, ease: 'linear' } }}
        className="pointer-events-none absolute left-1/2 top-1/2 w-[780px] max-w-none -translate-x-1/2 -translate-y-1/2"
      />

      <div className="relative mx-auto flex min-h-full max-w-5xl flex-col items-center justify-center px-5 py-12 text-center">
        <motion.p
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
          className="text-[11px] font-bold uppercase tracking-[0.35em] text-coral-300 sm:text-xs"
        >
          Resilcon Contabilidade Consultiva apresenta
        </motion.p>

        {/* logos */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, x: -70, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.25, ease }}
            className="rounded-3xl bg-white px-6 py-4 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)]"
          >
            <img src="./brand/logo-horizontal.png" alt="Resilcon Contabilidade Consultiva" className="h-14 w-auto sm:h-[72px]" />
          </motion.div>
          <motion.span
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease }}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-white/10 font-display text-lg text-coral-300 backdrop-blur"
          >
            ×
          </motion.span>
          <motion.div
            initial={{ opacity: 0, x: 70, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.4, ease }}
          >
            <img src="./brand/metro-farma.png" alt="Metrô Farma Popular" className="h-16 w-auto drop-shadow-[0_24px_40px_rgba(0,0,0,0.55)] sm:h-[88px]" />
          </motion.div>
        </div>

        {/* título */}
        <h1 className="mt-10 font-display text-4xl font-semibold leading-[1.05] sm:text-6xl">
          {['Análise', 'Tributária'].map((w, i) => (
            <motion.span
              key={w}
              initial={{ opacity: 0, y: 36, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.9 + i * 0.12, ease }}
              className="mr-3 inline-block last:mr-0"
            >
              {w}
            </motion.span>
          ))}
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, delay: 1.2, ease }}
          className="mt-2 font-display text-3xl font-semibold text-coral-300 sm:text-5xl"
        >
          Grupo Metrô Farma
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 1.5, ease }}
          className="shimmer mt-6 rounded-full border border-white/25 bg-white/10 px-6 py-2 font-display text-lg font-semibold tracking-wide backdrop-blur sm:text-xl"
        >
          2026–2027
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          className="mt-5 max-w-xl text-sm text-teal-100/80 sm:text-base"
        >
          Lucro Presumido · Lucro Real · Simples Nacional
        </motion.p>

        {/* chamada para entrar */}
        <motion.button
          autoFocus
          onClick={onEnter}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.1, ease }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="pulse-ring group mt-10 flex items-center gap-3 rounded-full bg-coral-500 px-8 py-3.5 text-base font-semibold text-white shadow-[0_20px_50px_-12px_rgba(242,92,84,0.85)] outline-none focus-visible:ring-4 focus-visible:ring-coral-300/60"
        >
          Clique para começar
          <motion.span animate={calmo ? {} : { x: [0, 6, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}>
            <ArrowRight size={20} />
          </motion.span>
        </motion.button>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5, duration: 0.8 }} className="mt-3 text-xs text-teal-200/60">
          ou pressione Enter
        </motion.p>
      </div>
    </motion.div>
  );
}
