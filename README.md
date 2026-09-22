# Relatório Diário de Closers • Fazendo Acontecer™

Interface web dark-tech de alta fidelidade para preenchimento de métricas diárias dos closers comerciais da **Fazendo Acontecer™**, inspirada no modelo do hub de gestão `closers.fazendoacontecer.site`.

---

## 👥 Closers Integrados
- **Tales**
- **José**
- **Muller**
- **Elinaldo**

---

## 📊 Métricas e Campos Disponíveis

### 1. Métrica de esforço e volume de Leads
- **Lead recebidos**: contagem de novos contatos / leads distribuídos no dia.
- **Quantidade de follow-up feitos**: contatos ativos de acompanhamento na base.
- **Quantas prospecção no dia**: abordagem ativa e prospecções realizadas.

### 2. Performance Comercial
- **Reunião agendada**: reuniões comerciais marcadas.
- **Reunião realizada**: reuniões de fechamento ou apresentação executadas.
- **Vendas**: contratos fechados / clientes convertidos.
- *Campo complementar opcional:* Valor Total Faturado / Contratos (R$) e Observações do dia.

---

## ⚡ Recursos Principais
1. **Cards de KPIs Dinâmicos**: cálculo automático e imediato de:
   - Volume total de leads recebidos
   - Esforço ativo diário (Follow-ups + Prospecções)
   - Taxa de comparecimento em reuniões (`Realizadas / Agendadas`)
   - Taxa de conversão de vendas (`Vendas / Realizadas`)
2. **Gerador de Relatório PDF**: botão executivo de exportação direta formatado para A4 com cabeçalho corporativo limpo (`@media print`).
3. **Persistência Local (LocalStorage)**: os dados ficam salvos no navegador por data e por closer.
4. **Histórico da Equipe & Exportação CSV**: visualize todos os lançamentos passados e exporte relatórios consolidados em planilha `.csv`.

---

## 🚀 Como Executar

### Opção 1: Abrir diretamente no navegador
Basta dar dois cliques no arquivo `index.html` ou executar no terminal:
```bash
open index.html
```

### Opção 2: Servidor Local (Python)
```bash
python3 -m http.server 3000
```
Em seguida, acesse no navegador: `http://localhost:3000`

---

## 📁 Estrutura de Arquivos
```
comercial-fa/
├── index.html         # Interface HTML5 completa
├── css/
│   └── styles.css     # Estilos dark tech com acentos neon lime (#C5FF29)
├── js/
│   └── app.js         # Lógica reativa, cálculos, persistência e exportações
├── assets/
│   └── logo.png       # Logomarca oficial Fazendo Acontecer™
└── README.md          # Documentação do projeto
```
