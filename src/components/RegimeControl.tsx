import clsx from 'clsx';

interface Props {
  ligado: boolean;
  disponivel: boolean;
  onChange: (v: boolean) => void;
  consolidado: boolean;
  aviso?: string;
}

export default function RegimeControl({ ligado, disponivel, onChange, consolidado, aviso }: Props) {
  const on = ligado && disponivel;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <button
        role="switch"
        aria-checked={on}
        aria-label="Comparar com o Simples Nacional"
        disabled={!disponivel}
        onClick={() => onChange(!ligado)}
        className={clsx(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-40',
          on ? 'bg-teal-600' : 'bg-stone-300',
        )}
      >
        <span className={clsx('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-300', on ? 'left-[18px]' : 'left-0.5')} />
      </button>
      <span className="font-semibold text-teal-900">Simples Nacional {consolidado ? 'no consolidado' : 'nesta empresa'}</span>
      <span className="text-xs text-stone-brand">
        {on ? 'Comparando Presumido × Simples' : 'Comparando Presumido × Lucro Real'}
        {!disponivel && aviso ? ' · ' + aviso : ''}
      </span>
    </div>
  );
}
