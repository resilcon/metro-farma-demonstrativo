import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Layers, MousePointerClick, User } from 'lucide-react';
import { EMPRESAS, GRUPOS, QSA } from './lib/data.ts';
import { calcular, consolidar, melhorRegime } from './lib/engine.ts';
import type { Resultado } from './lib/engine.ts';
import { MESES, nomeLoja, pct, brl } from './lib/format.ts';
import { exportCsv } from './lib/exportCsv.ts';
import Header from './components/Header.tsx';
import Tabs from './components/Tabs.tsx';
import type { Aba } from './components/Tabs.tsx';
import Selector, { ModoToggle } from './components/Selector.tsx';
import type { Modo } from './components/Selector.tsx';
import Kpis from './components/Kpis.tsx';
import CostControl from './components/CostControl.tsx';
import { ChartCard, CompositionChart, EfetivaChart, MonthlyChart, RegimeChart } from './components/Charts.tsx';
import TaxTable from './components/TaxTable.tsx';
import StoresTable from './components/StoresTable.tsx';
import type { Linha } from './components/StoresTable.tsx';
import SimplesEditor, { dasTotal } from './components/SimplesEditor.tsx';
import type { DasEdit } from './components/SimplesEditor.tsx';
import Qsa from './components/Qsa.tsx';
import Footer from './components/Footer.tsx';

const TODAS = EMPRESAS.map((e) => e.id);

function periodoLabel(): string {
  const idx = EMPRESAS.flatMap((e) => e.meses.map((m) => MESES.indexOf(m.mes))).filter((i) => i >= 0);
  if (!idx.length) return 'Período apurado';
  return MESES[Math.min(...idx)] + ' a ' + MESES[Math.max(...idx)];
}
const PERIODO = periodoLabel();

export default function App() {
  const [aba, setAba] = useState<Aba>('resumo');
  const [modo, setModo] = useState<Modo>('consolidado');
  const [sel, setSel] = useState<Set<string>>(new Set(TODAS));
  const [custoGlobal, setCustoGlobal] = useState<number | null>(null);
  const [custoLoja, setCustoLoja] = useState<Record<string, number>>({});
  const [dasEdit, setDasEdit] = useState<DasEdit>({});
  const tabsRef = useRef<HTMLDivElement>(null);
  const primeira = useRef(true);

  useEffect(() => {
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    const el = tabsRef.current;
    if (el && window.scrollY > el.offsetTop) window.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
  }, [aba]);

  const selecionadas = useMemo(() => EMPRESAS.filter((e) => sel.has(e.id)), [sel]);

  const calc = useMemo(() => {
    const linhas: Linha[] = selecionadas.map((e) => {
      const r = calcular(e, custoLoja[e.id] ?? custoGlobal ?? e.p.custo, dasTotal(e, dasEdit));
      return { e, r, melhor: melhorRegime(r) };
    });
    const base = consolidar(selecionadas.map((e) => ({ e, r: calcular(e) })));
    const total: Resultado = consolidar(linhas.map(({ e, r }) => ({ e, r })));
    const comSimples = linhas.filter((l) => l.r.simples != null).length;
    const simplesCompleto = linhas.length > 0 && comSimples === linhas.length;
    if (!simplesCompleto) total.simples = null;
    const melhor = linhas.length ? melhorRegime(total) : null;
    const somaMelhores = linhas.reduce((s, l) => s + l.melhor.valor, 0);
    const otimizado = melhor && linhas.length > 1 ? { total: somaMelhores, economia: melhor.valor - somaMelhores } : null;
    return {
      linhas,
      total,
      base,
      melhor,
      otimizado,
      simplesCompleto,
      simplesInfo: 'DAS informado em ' + comSimples + ' de ' + linhas.length + ' lojas',
    };
  }, [selecionadas, custoGlobal, custoLoja, dasEdit]);

  const { linhas, total, melhor } = calc;
  const custos = new Set(linhas.map((l) => l.r.custo.toFixed(4)));
  const alterado = custoGlobal !== null || selecionadas.some((e) => custoLoja[e.id] !== undefined);

  const mensal = useMemo(() => {
    const m = new Map<string, { mes: string; receita: number; icms: number }>();
    for (const e of selecionadas) {
      for (const x of e.meses) {
        const c = m.get(x.mes) ?? { mes: x.mes, receita: 0, icms: 0 };
        c.receita += x.vendas + x.servicos;
        c.icms += x.icms;
        m.set(x.mes, c);
      }
    }
    return [...m.values()].sort((a, b) => MESES.indexOf(a.mes) - MESES.indexOf(b.mes));
  }, [selecionadas]);

  const toggle = (id: string) => {
    if (modo === 'individual') {
      setSel(new Set([id]));
      return;
    }
    setSel((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };
  const trocarModo = (m: Modo) => {
    setModo(m);
    if (m === 'individual') setSel((s) => new Set([[...s][0] ?? TODAS[0]]));
  };
  const alterarCusto = (v: number) => {
    if (selecionadas.length === 1) {
      const id = selecionadas[0].id;
      setCustoLoja((c) => ({ ...c, [id]: v }));
    } else {
      setCustoGlobal(v);
      setCustoLoja((c) => {
        const n = { ...c };
        selecionadas.forEach((e) => delete n[e.id]);
        return n;
      });
    }
  };
  const resetarCusto = () => {
    setCustoGlobal(null);
    setCustoLoja((c) => {
      const n = { ...c };
      selecionadas.forEach((e) => delete n[e.id]);
      return n;
    });
  };
  const alterarDas = (id: string, mes: string, v: number | null) =>
    setDasEdit((d) => {
      const loja = { ...(d[id] ?? {}) };
      if (v === null) delete loja[mes];
      else loja[mes] = v;
      return { ...d, [id]: loja };
    });
  const resetarDas = (id: string) =>
    setDasEdit((d) => {
      const n = { ...d };
      delete n[id];
      return n;
    });
  const isolar = (id: string) => {
    setModo('individual');
    setSel(new Set([id]));
    setAba('resumo');
  };


  const titulo = selecionadas.length === 1 ? nomeLoja(selecionadas[0].nome) : 'Consolidado · ' + selecionadas.length + ' lojas';
  const escopo = selecionadas.length === 1 ? 'esta loja' : 'todas as lojas selecionadas';
  const vazio = selecionadas.length === 0 && aba !== 'socios';

  const conteudo = () => {
    switch (aba) {
      case 'resumo':
        return (
          <div className="space-y-8">
            <Kpis
              r={total}
              melhor={melhor}
              simplesCompleto={calc.simplesCompleto}
              simplesInfo={calc.simplesInfo}
              otimizado={calc.otimizado}
              nLojas={selecionadas.length}
            />
            <CostControl
              valor={total.custo}
              misto={custos.size > 1}
              alterado={alterado}
              onChange={alterarCusto}
              onReset={resetarCusto}
              deltaReal={total.real.total - calc.base.real.total}
              deltaPres={total.presumido.total - calc.base.presumido.total}
              escopo={escopo}
            />
          </div>
        );
      case 'comparativo':
        return (
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Carga tributária por regime" sub="Quanto cada regime custaria no período apurado">
              <RegimeChart
                data={[
                  { name: 'Lucro Real', valor: total.real.total },
                  { name: 'Lucro Presumido', valor: total.presumido.total },
                  ...(total.simples != null ? [{ name: 'Simples Nacional', valor: total.simples }] : []),
                ]}
              />
            </ChartCard>
            <ChartCard title="De onde vem a carga" sub="Composição dos tributos em cada regime">
              <CompositionChart real={total.real.impostos} pres={total.presumido.impostos} />
            </ChartCard>
            <ChartCard title="Receita e ICMS mês a mês" sub="Soma das lojas selecionadas · lojas com menos meses apurados entram só a partir do 1º mês com dados">
              <MonthlyChart data={mensal} />
            </ChartCard>
            <ChartCard title="Alíquota efetiva por loja" sub="Carga do melhor regime sobre a receita">
              <EfetivaChart
                data={linhas
                  .map((l) => ({
                    nome: nomeLoja(l.e.nome),
                    aliquota: l.r.receita ? l.melhor.valor / l.r.receita : 0,
                    regime: l.melhor.nome as string,
                  }))
                  .sort((a, b) => b.aliquota - a.aliquota)}
              />
            </ChartCard>
          </div>
        );
      case 'detalhe':
        return (
          <ChartCard title="Detalhamento dos tributos" sub="Lucro Real × Lucro Presumido, tributo a tributo">
            <TaxTable r={total} />
          </ChartCard>
        );
      case 'lojas':
        return (
          <ChartCard title="Visão por loja" sub="Edite o custo de cada loja individualmente — o consolidado recalcula na hora">
            <StoresTable
              linhas={linhas}
              total={total}
              onCusto={(id, v) => setCustoLoja((c) => ({ ...c, [id]: v }))}
              onIsolar={isolar}
            />
          </ChartCard>
        );
      case 'simples':
        return (
          <ChartCard
            title="Simples Nacional · DAS por mês"
            sub={
              calc.simplesCompleto
                ? 'Total do DAS na seleção: ' + brl(total.simples ?? 0)
                : calc.simplesInfo + ' — preencha os meses que faltam para comparar'
            }
          >
            <SimplesEditor empresas={selecionadas} edit={dasEdit} onChange={alterarDas} onReset={resetarDas} />
          </ChartCard>
        );
      case 'socios':
        return <Qsa dados={QSA} />;
    }
  };

  return (
    <>
      <Header onCsv={() => exportCsv(linhas.map((l) => ({ e: l.e, r: l.r, melhor: l.melhor.nome })))} />
      <div ref={tabsRef} className="sticky top-0 z-40 border-b border-teal-900/10 bg-white/85 shadow-[0_12px_32px_-18px_rgba(3,50,60,0.45)] backdrop-blur-xl">
        <div className="mx-auto max-w-[1320px] space-y-1 px-4 py-2 sm:px-8">
          <Tabs aba={aba} onAba={setAba} right={<ModoToggle modo={modo} onModo={trocarModo} />} />
          <Selector
            empresas={EMPRESAS}
            grupos={GRUPOS}
            sel={sel}
            modo={modo}
            onToggle={toggle}
            onSet={(ids) => setSel(new Set(ids))}
          />
        </div>
      </div>

      <main className="relative z-10 mx-auto max-w-[1320px] space-y-6 px-4 pb-4 pt-6 sm:px-8">
        {aba !== 'socios' && selecionadas.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 rounded-full bg-teal-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-900/25">
              {selecionadas.length === 1 ? <User size={16} /> : <Layers size={16} />} {titulo}
            </span>
            <span className="text-sm text-stone-brand">
              {PERIODO} · custo {custos.size > 1 ? 'médio ' : ''}
              {pct(total.custo)}
            </span>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={aba + (vazio ? 'v' : '')}
            initial={{ opacity: 0, y: 18, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(3px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {vazio ? (
              <div className="card grid place-items-center gap-3 p-14 text-center">
                <MousePointerClick size={40} className="text-coral-500" />
                <h2 className="text-xl font-semibold text-teal-900">Nenhuma empresa selecionada</h2>
                <p className="max-w-md text-stone-brand">Escolha uma ou mais lojas na barra acima para montar o demonstrativo.</p>
              </div>
            ) : (
              conteudo()
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}
