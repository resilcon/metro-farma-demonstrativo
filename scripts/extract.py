"""Extrai os dados da planilha GRUPO METRO FARMA para src/data/grupo.json."""
import json, sys, re, openpyxl
SRC = sys.argv[1]; OUT = sys.argv[2]
wb = openpyxl.load_workbook(SRC); wv = openpyxl.load_workbook(SRC, data_only=True)

def num(x):
    return float(x) if isinstance(x, (int, float)) else 0.0

companies = []
for name in wv.sheetnames:
    m = re.match(r'^(\d+)\.(\d+)\s*-\s*(.+)$', name)
    if not m: continue
    ws = wv[name]
    hdr = {}
    for c in ws[9]:
        if c.value and c.column >= 10:
            t = re.sub(r'\s+', ' ', str(c.value)).strip().upper()
            hdr.setdefault(t, c.column_letter)
    def col(*keys):
        for k in keys:
            if k in hdr: return hdr[k]
        return None
    cF = col('FOPAG'); cP = col('PRO LABORE'); cD = col('DAS'); cM = col('ICMS')
    months = []
    for r in range(11, 23):
        mes = ws[f'J{r}'].value
        v, s = num(ws[f'K{r}'].value), num(ws[f'L{r}'].value)
        if not (v or s): continue
        g = lambda c: num(ws[f'{c}{r}'].value) if c else 0.0
        months.append(dict(mes=str(mes).strip(), vendas=v, servicos=s, icms=g(cM), fopag=g(cF), das=g(cD)))
    g = lambda k: num(ws[k].value)
    tot = lambda c: num(ws[f'{c}23'].value) if c else 0.0
    d7 = g('D7')
    quebra = {}
    for r in range(28, 46):
        lab = str(ws[f'J{r}'].value or '').strip().upper()
        if lab in ('PIS', 'COFINS', 'IPI', 'ISS', 'ICMS', 'IRPJ', 'CSLL', 'FOPAG'):
            quebra[lab.lower()] = dict(real=num(ws[f'K{r}'].value), presumido=num(ws[f'L{r}'].value))
    somaMeses = dict(vendas=sum(m['vendas'] for m in months), servicos=sum(m['servicos'] for m in months))
    companies.append(dict(
        id=f'{m.group(1)}.{m.group(2)}', grupo=m.group(1), codigo=m.group(2), nome=m.group(3).strip(), aba=name,
        meses=months,
        vendas=g('K23'), servicos=g('L23'), compras=g('K25'),
        fopag=tot(cF), proLabore=tot(cP), das=d7, icmsPago=tot(cM),
        p=dict(c12=g('C12'), c13=g('C13'), c14=g('C14'), icms=g('C15'), pis=g('C16'), cofins=g('C17'), iss=g('C18'),
               custo=g('C25'), fopagPct=g('C27'), encargos=g('C28'), fopagTrib=g('C29'), despesas=g('C30'),
               csll=g('C33'), irpj=g('C34'), adicional=g('C36'), meses=g('C37'),
               g12=g('G12'), g15=g('G15'), g16=g('G16'), g17=g('G17'), g22=g('G22'), g24=g('G24'), g26=g('G26'), g27=g('G27'),
               g30=g('G30'), g31=g('G31'), g33=g('G33'), g34=g('G34'), g35=g('G35'), g36=g('G36')),
        planilha=dict(real=g('D5'), presumido=g('D6'), simples=d7, melhor=str(ws['H43'].value).strip(),
                      lucroLiquidoReal=g('D31'), lucroReal=g('D40'), lucroLiquidoPres=g('H28'), quebra=quebra, somaMeses=somaMeses),
    ))
qsa = []
if 'QSA' in wv.sheetnames:
    for r in wv['QSA'].iter_rows(min_row=3, min_col=2, max_col=4, values_only=True):
        if r[0]: qsa.append(dict(empresa=str(r[0]).strip(), socios=[str(x).strip() for x in r[1:] if x]))
ws = wv['Anexos Simples']
anexos = [[num(ws.cell(r, c).value) for c in (1, 2, 3, 4, 5, 6, 7)] for r in range(2, 22)]
json.dump(dict(empresas=companies, qsa=qsa, anexosSimples=anexos), open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(companies), 'empresas', [(c['id'], len(c['meses'])) for c in companies])
