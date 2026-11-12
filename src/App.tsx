import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Layers, MousePointerClick, User, Users } from 'lucide-react';
import { EMPRESAS, GRUPOS, QSA } from './lib/data.ts';
import { calcular, comparar, consolidar } from './lib/engine.ts';
import type { Resultado } from './lib/engine.ts';
import { MESES, nomeLoja, brl } from './lib/format.ts';
import { exportCsv } from './lib/exportCsv.ts';
import Header from './components/Header.tsx';
import Tabs from './components/Tabs.tsx';
import type { Aba } from './components/Tabs.tsx';
import Selector, { ModoToggle } from './components/Selector.tsx';
import type { Modo } from './components/Selector.tsx';
import Kpis, { MargemAtual } from './components/Kpis.tsx';
import CostControl from './components/CostControl.tsx';
import RegimeControl from './components/RegimeControl.tsx';
import FaturamentoCard from './components/FaturamentoCard.tsx';
import { FolhaControle, FolhaImpacto } from './components/FolhaPanels.tsx';
import Splash from './components/Splash.tsx';
import { ChartCard, CompositionChart, RegimeChart } from './components/Charts.tsx';
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
  const [simplesLoja, setSimplesLoja] = useState<Record<string, boolean>>({});
  const [simplesGrupo, setSimplesGrupo] = useState(false);
  const [fora, setFora] = useState<Set<string>>(new Set()); // empresas desmarcadas na soma do rodapé (aba Por empresa)
  const [painelAberto, setPainelAberto] = useState(true);
  const [folhaGlobal, setFolhaGlobal] = useState<number | null>(null);
  const [folhaLoja, setFolhaLoja] = useState<Record<string, number>>({});
  const [abertura, setAbertura] = useState(true); // tela de abertura: só volta ao recarregar (F5)
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
    // Custo: em qualquer visão (individual ou consolidado) o % de custo só altera IRPJ e CSLL;
    // os créditos de ICMS/PIS/COFINS ficam no custo original da planilha.
    // Folha: o % da folha reduz os tributos de folha.
    const folhaDe = (e: (typeof EMPRESAS)[number]) => folhaLoja[e.id] ?? folhaGlobal ?? 1;
    const opts = (e: (typeof EMPRESAS)[number], folha: number) => ({ folha, custoCreditos: e.p.custo });
    const linhas: Linha[] = selecionadas.map((e) => {
      const r = calcular(e, custoLoja[e.id] ?? custoGlobal ?? e.p.custo, dasTotal(e, dasEdit), opts(e, folhaDe(e)));
      const cmp = comparar(r, simplesLoja[e.id] ?? true);
      return { e, r, cmp, melhor: cmp.melhor };
    });
    // referência para o efeito do custo: mesmo cenário, com o custo original
    const base = consolidar(selecionadas.map((e) => ({ e, r: calcular(e, e.p.custo, dasTotal(e, dasEdit), { folha: folhaDe(e) }) })));
    // referência para o efeito da folha: mesmo cenário, com 100% da folha
    const semFolha = consolidar(
      selecionadas.map((e) => ({
        e,
        r: calcular(e, custoLoja[e.id] ?? custoGlobal ?? e.p.custo, dasTotal(e, dasEdit), opts(e, 1)),
      })),
    );
    const total: Resultado = consolidar(linhas.map(({ e, r }) => ({ e, r })));
    const comSimples = linhas.filter((l) => l.r.simples != null).length;
    const simplesCompleto = linhas.length > 0 && comSimples === linhas.length;
    if (!simplesCompleto) {
      total.simples = null;
      semFolha.simples = null;
    }
    const totalCmp = comparar(total, simplesGrupo);
    const somaMelhores = linhas.reduce((s, l) => s + l.melhor.valor, 0);
    const otimizado = linhas.length > 1 ? { total: somaMelhores, economia: total.presumido.total - somaMelhores } : null;
    const folhaTotal = selecionadas.reduce((s, e) => s + e.fopag, 0);
    const folhaPct = folhaTotal ? selecionadas.reduce((s, e) => s + folhaDe(e) * e.fopag, 0) / folhaTotal : folhaGlobal ?? 1;
    return { linhas, total, base, semFolha, totalCmp, otimizado, simplesCompleto, comSimples, folhaTotal, folhaPct };
  }, [selecionadas, custoGlobal, custoLoja, dasEdit, simplesLoja, simplesGrupo, folhaGlobal, folhaLoja]);

  const { linhas, total, totalCmp } = calc;
  const unica = selecionadas.length === 1;
  const cmpAtual = unica ? linhas[0].cmp : totalCmp;
  const alterado = custoGlobal !== null || selecionadas.some((e) => custoLoja[e.id] !== undefined);
  const alteradoFolha = folhaGlobal !== null || selecionadas.some((e) => folhaLoja[e.id] !== undefined);
  const custosDistintos = new Set(linhas.map((l) => l.r.custo.toFixed(4))).size > 1;

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
    if (unica) {
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
  // "Limpar tudo": desmarca as empresas E devolve custo e % da folha aos valores originais
  const limparTudo = () => {
    setSel(new Set());
    setCustoGlobal(null);
    setCustoLoja({});
    setFolhaGlobal(null);
    setFolhaLoja({});
    setFora(new Set());
  };
  const alterarFolha = (v: number) => {
    if (unica) {
      const id = selecionadas[0].id;
      setFolhaLoja((c) => ({ ...c, [id]: v }));
    } else {
      setFolhaGlobal(v);
      setFolhaLoja((c) => {
        const n = { ...c };
        selecionadas.forEach((e) => delete n[e.id]);
        return n;
      });
    }
  };
  const resetarFolha = () => {
    setFolhaGlobal(null);
    setFolhaLoja((c) => {
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

  const titulo = unica ? nomeLoja(selecionadas[0].nome) : 'Consolidado · ' + selecionadas.length + ' empresas';
  const escopo = unica ? 'esta empresa' : 'todas as empresas selecionadas';
  const vazio = selecionadas.length === 0 && aba !== 'socios';

  const conteudo = () => {
    switch (aba) {
      case 'resumo':
        return (
          <div className="space-y-3">
            {unica ? (
              <RegimeControl
                consolidado={false}
                ligado={simplesLoja[linhas[0].e.id] ?? true}
                disponivel={linhas[0].r.simples != null}
                aviso="Sem DAS informado para esta empresa — preencha na aba Simples (DAS)."
                onChange={(v) => setSimplesLoja((s) => ({ ...s, [linhas[0].e.id]: v }))}
              />
            ) : (
              <RegimeControl
                consolidado
                ligado={simplesGrupo}
                disponivel={calc.simplesCompleto}
                aviso={'DAS informado em ' + calc.comSimples + ' de ' + linhas.length + ' empresas — preencha na aba Simples (DAS).'}
                onChange={setSimplesGrupo}
              />
            )}
            <Kpis r={total} cmp={cmpAtual} empresas={selecionadas} otimizado={calc.otimizado} consolidado={!unica} />
            <CostControl
              valor={total.custo}
              misto={custosDistintos}
              alterado={alterado}
              onChange={alterarCusto}
              onReset={resetarCusto}
              deltaReal={total.real.total - calc.base.real.total}
              deltaPres={total.presumido.total - calc.base.presumido.total}
              escopo={escopo}
            />
            <MargemAtual empresas={selecionadas} />
          </div>
        );
      case 'comparativo':
        return (
          <div className="space-y-6">
            <FaturamentoCard total={total.receita} mensal={mensal} empresas={selecionadas} />
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Carga tributária: Presumido × alternativa" sub={'Lucro Presumido (atual) comparado com ' + cmpAtual.alt.nome}>
              <RegimeChart
                data={[
                  { name: 'Lucro Presumido', valor: cmpAtual.pres },
                  { name: cmpAtual.alt.nome, valor: cmpAtual.alt.valor },
                ]}
              />
            </ChartCard>
            <ChartCard title="De onde vem a carga" sub="Composição dos tributos em cada regime">
              <CompositionChart real={total.real.impostos} pres={total.presumido.impostos} />
            </ChartCard>
            <FolhaControle
              valor={calc.folhaPct}
              alterado={alteradoFolha}
              onChange={alterarFolha}
              onReset={resetarFolha}
              folhaTotal={calc.folhaTotal}
              escopo={escopo}
            />
            <FolhaImpacto
              pct={calc.folhaPct}
              alt={cmpAtual.alt.nome}
              cheia={{ pres: calc.semFolha.presumido.total, alt: cmpAtual.usaSimples ? cmpAtual.alt.valor : calc.semFolha.real.total }}
              simulada={{ pres: cmpAtual.pres, alt: cmpAtual.alt.valor }}
            />
          </div>
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
          <ChartCard title="Visão por empresa" sub="Edite o custo e ligue ou desligue o Simples de cada empresa — o consolidado recalcula na hora">
            <StoresTable
              linhas={linhas}
              fora={fora}
              onFora={(id, f) =>
                setFora((s) => {
                  const n = new Set(s);
                  if (f) n.add(id);
                  else n.delete(id);
                  return n;
                })
              }
              onTodas={(marcar) => setFora(marcar ? new Set() : new Set(linhas.map((l) => l.e.id)))}
              onCusto={(id, v) => setCustoLoja((c) => ({ ...c, [id]: v }))}
              onIsolar={isolar}
              onSimples={(id, v) => setSimplesLoja((s) => ({ ...s, [id]: v }))}
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
                : 'DAS informado em ' + calc.comSimples + ' de ' + linhas.length + ' empresas — preencha os meses que faltam para comparar'
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
      <AnimatePresence>{abertura && <Splash onEnter={() => setAbertura(false)} />}</AnimatePresence>
      <Header onCsv={() => exportCsv(linhas.map((l) => ({ e: l.e, r: l.r, cmp: l.cmp })))} />

      <div ref={tabsRef} className="sticky top-0 z-40 border-b border-teal-900/10 bg-white/85 shadow-[0_12px_32px_-18px_rgba(3,50,60,0.45)] backdrop-blur-xl">
        <div className="mx-auto max-w-[1320px] space-y-1 px-4 py-2 sm:px-8">
          <Tabs aba={aba} onAba={setAba} right={<ModoToggle modo={modo} onModo={trocarModo} />} />
          <button
            onClick={() => setPainelAberto((v) => !v)}
            aria-expanded={painelAberto}
            aria-controls="painel-empresas"
            className="no-print group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-1.5 text-left transition hover:bg-teal-50"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-teal-900">
              <Users size={16} className="text-teal-600" />
              Empresas
              <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-800">
                {selecionadas.length === 0 ? 'nenhuma selecionada' : titulo}
              </span>
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-stone-brand transition group-hover:text-teal-700">
              {painelAberto ? 'Recolher' : 'Expandir'}
              <ChevronDown size={16} className={'transition-transform duration-300 ' + (painelAberto ? 'rotate-180' : '')} />
            </span>
          </button>
          <div
            id="painel-empresas"
            className="grid transition-[grid-template-rows,opacity] duration-300 ease-out"
            style={{ gridTemplateRows: painelAberto ? '1fr' : '0fr', opacity: painelAberto ? 1 : 0 }}
            aria-hidden={!painelAberto}
          >
            <div className="min-h-0 overflow-hidden">
              <Selector
                empresas={EMPRESAS}
                grupos={GRUPOS}
                sel={sel}
                modo={modo}
                onToggle={toggle}
                onSet={(ids) => setSel(new Set(ids))}
                onLimparTudo={limparTudo}
              />
            </div>
          </div>
        </div>
      </div>

      <main className="relative z-10 mx-auto max-w-[1320px] space-y-6 px-4 pb-4 pt-6 sm:px-8">
        {aba !== 'socios' && selecionadas.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 rounded-full bg-teal-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-900/25">
              {unica ? <User size={16} /> : <Layers size={16} />} {titulo}
            </span>
            <span className="text-sm text-stone-brand">{PERIODO}</span>
            {alterado && (
              <span className="rounded-full bg-coral-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-coral-700">Custo simulado</span>
            )}
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
                <p className="max-w-md text-stone-brand">Escolha uma ou mais empresas na barra acima para montar o demonstrativo.</p>
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
