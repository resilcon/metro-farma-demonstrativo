import { Download, Printer } from 'lucide-react';

export default function Header({ onCsv }: { onCsv: () => void }) {
  return (
    <header className="no-print-bar relative z-40 border-b border-teal-900/10 bg-white">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-4 py-2.5 sm:px-8">
        <div className="flex items-center gap-4">
          <img src="./brand/logo-horizontal.png" alt="Resilcon Contabilidade Consultiva" className="h-10 w-auto sm:h-12" />
          <span className="hidden h-8 w-px bg-teal-900/15 md:block" />
          <span className="hidden text-sm font-semibold text-stone-brand md:block">
            Demonstrativo · <span className="text-teal-700">Grupo Metrô Farma</span>
          </span>
        </div>
        <div className="no-print flex items-center gap-2">
          <button
            onClick={onCsv}
            className="flex items-center gap-2 rounded-full border border-teal-900/15 bg-white px-4 py-2 text-sm font-semibold text-teal-800 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-teal-600 hover:bg-teal-50 hover:shadow-md active:scale-95"
          >
            <Download size={16} /> <span className="hidden sm:inline">Exportar CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-full bg-coral-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-coral-500/30 transition duration-300 hover:-translate-y-0.5 hover:bg-coral-600 hover:shadow-xl hover:shadow-coral-500/40 active:scale-95"
          >
            <Printer size={16} /> <span className="hidden sm:inline">Imprimir / PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
}
