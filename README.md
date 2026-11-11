# Demonstrativo Tributário · Grupo Metrô Farma

Painel web da **Resilcon Contabilidade Consultiva** construído a partir da planilha comparativa tributária do grupo
(10 lojas, códigos 49, 53 e 15).

- Modo **Individual** (uma loja) ou **Consolidado** (qualquer combinação de lojas, somadas em uma tela)
- **Custo da empresa editável** no consolidado e por loja; Lucro Real e Presumido recalculam na hora
- Comparativo Lucro Real × Presumido × Simples (DAS), composição dos tributos, receita mensal e quadro societário (QSA)
- Exportação CSV e impressão/PDF

Stack: React 19, TypeScript, Vite, Tailwind CSS 4, Motion, Recharts, Lucide.

## Rodar localmente

    npm install
    npm run dev          # http://localhost:5173
    npm run build        # gera a pasta dist/ (site estático)
    npm run test:engine  # confere o motor de cálculo contra os valores da planilha

## Publicar (acessar de qualquer lugar)

A pasta `dist/` é um site estático: funciona em Vercel, Netlify, Cloudflare Pages, GitHub Pages ou qualquer servidor web.
Os dados do cliente ficam embutidos no site; para uso externo, proteja o acesso (senha da hospedagem ou link privado).

## Atualizar os dados

    python scripts/extract.py "caminho/para/planilha.xlsx" src/data/grupo.json
    npm run test:engine && npm run build
