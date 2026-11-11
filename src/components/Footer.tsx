export default function Footer() {
  return (
    <footer className="mt-16 bg-teal-950 text-teal-100">
      <div className="mx-auto grid max-w-[1320px] gap-8 px-4 py-12 sm:px-8 md:grid-cols-[auto_1fr] md:items-center">
        <img src="./brand/logo-vertical.png" alt="Resilcon" className="h-28 w-auto rounded-2xl bg-white p-3" />
        <div className="space-y-3 text-sm leading-relaxed">
          <p className="font-display text-lg font-semibold text-white">Resilcon Contabilidade Consultiva</p>
          <p>
            <b className="text-white">Metodologia:</b> a carga tributária de cada empresa é calculada com as mesmas fórmulas da planilha
            comparativa. O Lucro Presumido (tributação atual) é sempre a referência: com o Simples ligado compara-se Presumido × Simples (DAS informado); desligado, Presumido × Lucro Real. No consolidado, cada empresa é tributada
            separadamente e os resultados são somados. Valores em R$ no período apurado.
          </p>
          <p className="text-teal-300/80">
            Material de apoio à decisão, baseado em estimativas e premissas informadas; não substitui a apuração fiscal oficial.
          </p>
        </div>
      </div>
    </footer>
  );
}
