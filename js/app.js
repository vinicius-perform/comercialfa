/**
 * Fazendo Acontecer™ - Hub Closers Gestão
 * Modern uifry Dashboard Logic, Live Currency Mask & Real-time Visual Synchronizer
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- CONFIGURAÇÃO & ESTADO ---
  const closers = ['Tales', 'José', 'Muller', 'Elinaldo'];
  let currentCloser = 'Muller';

  // Data atual padrão (YYYY-MM-DD)
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const formattedToday = `${yyyy}-${mm}-${dd}`;

  // --- ELEMENTOS DO DOM ---
  const dateInput = document.getElementById('report-date');
  if (dateInput) dateInput.value = formattedToday;

  // Header & Sidebar Tags
  const headerCloserName = document.getElementById('header-closer-name');
  const sidebarUserName = document.getElementById('sidebar-user-name');
  const sidebarUserAvatar = document.getElementById('sidebar-user-avatar');
  const printCloserName = document.getElementById('print-closer-name');
  const printReportDate = document.getElementById('print-report-date');
  const btnPdfLabel = document.getElementById('btn-pdf-label');

  // 3 KPIs Superiores (Estilo uifry)
  const kpiSalesNum = document.getElementById('kpi-sales-num');
  const kpiSalesSub = document.getElementById('kpi-sales-sub');
  const kpiContractNum = document.getElementById('kpi-contract-num');
  const kpiCashNum = document.getElementById('kpi-cash-num');

  // Inputs do Formulário
  const inputLeads = document.getElementById('input-leads');
  const inputFollowups = document.getElementById('input-followups');
  const inputProspeccoes = document.getElementById('input-prospeccoes');
  const inputMeetingsScheduled = document.getElementById('input-meetings-scheduled');
  const inputMeetingsHeld = document.getElementById('input-meetings-held');
  const inputSales = document.getElementById('input-sales');
  const inputContractVal = document.getElementById('input-contract-val');
  const inputCashCollected = document.getElementById('input-cash-collected');

  const allInputs = [
    inputLeads,
    inputFollowups,
    inputProspeccoes,
    inputMeetingsScheduled,
    inputMeetingsHeld,
    inputSales,
    inputContractVal,
    inputCashCollected
  ];

  // Elementos Visuais Dinâmicos
  const overviewTooltipText = document.getElementById('overview-tooltip-text');
  const bubbleConversionRate = document.getElementById('bubble-conversion-rate');
  const bubbleAttendanceRate = document.getElementById('bubble-attendance-rate');
  const bubbleEffortTotal = document.getElementById('bubble-effort-total');
  const compBarSales = document.getElementById('comp-bar-sales');
  const compBarMeetings = document.getElementById('comp-bar-meetings');

  // Seletores de Closer (Sidebar Chips & Segmented no Card)
  const closerChips = document.querySelectorAll('.closer-chip');
  const segmentedBtns = document.querySelectorAll('.segmented-btn');

  // Botões de Ação
  const btnGeneratePdf = document.getElementById('btn-generate-pdf');
  const navBtnPdf = document.getElementById('nav-btn-pdf');
  const btnCopyWhatsapp = document.getElementById('btn-copy-whatsapp');
  const btnSaveLog = document.getElementById('btn-save-log');
  const btnResetForm = document.getElementById('btn-reset-form');
  const btnToggleTheme = document.getElementById('btn-toggle-theme');

  // Tabela de Histórico
  const historyTableBody = document.getElementById('history-table-body');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnClearHistory = document.getElementById('btn-clear-history');

  // Toast Container
  const toastContainer = document.getElementById('toast-container');

  // --- LOCAL STORAGE ---
  const STORAGE_KEY = 'fa_closers_uifry_reports_v1';

  function getStoredReports() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Erro ao ler localStorage', e);
      return [];
    }
  }

  function saveStoredReports(reports) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    } catch (e) {
      console.error('Erro ao salvar no localStorage', e);
    }
  }

  function showToast(message) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 20);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function formatDateBR(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
  }

  // --- MÁSCARA AUTOMÁTICA DE MOEDA (AO DIGITAR) ---
  function formatMoneyString(raw) {
    if (raw === undefined || raw === null) return 'R$ 0,00';
    const digits = String(raw).replace(/\D/g, '');
    if (!digits || parseInt(digits, 10) === 0) {
      return 'R$ 0,00';
    }
    const cents = parseInt(digits, 10) / 100;
    return `R$ ${cents.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function setupCurrencyInput(input) {
    if (!input) return;

    input.value = formatMoneyString(input.value);

    input.addEventListener('input', () => {
      input.value = formatMoneyString(input.value);
      setTimeout(() => {
        input.setSelectionRange(input.value.length, input.value.length);
      }, 0);
      updateDashboard();
    });

    input.addEventListener('keydown', (e) => {
      const isAllSelected = (input.selectionStart === 0 && input.selectionEnd === input.value.length);
      if ((e.key === 'Backspace' || e.key === 'Delete') && isAllSelected) {
        e.preventDefault();
        input.value = 'R$ 0,00';
        input.setSelectionRange(input.value.length, input.value.length);
        updateDashboard();
        return;
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        const digits = input.value.replace(/\D/g, '');
        const newDigits = digits.slice(0, -1);
        input.value = formatMoneyString(newDigits);
        input.setSelectionRange(input.value.length, input.value.length);
        updateDashboard();
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text') || '';
      let digits = text.replace(/\D/g, '');
      if (!digits) return;
      if (!text.includes(',') && !text.includes('.') && parseInt(digits, 10) < 100000) {
        digits = digits + '00';
      }
      input.value = formatMoneyString(digits);
      input.setSelectionRange(input.value.length, input.value.length);
      updateDashboard();
    });

    input.addEventListener('focus', () => {
      setTimeout(() => {
        input.setSelectionRange(input.value.length, input.value.length);
      }, 0);
    });

    input.addEventListener('blur', () => {
      input.value = formatMoneyString(input.value);
      updateDashboard();
    });
  }

  setupCurrencyInput(inputContractVal);
  setupCurrencyInput(inputCashCollected);

  // --- SELEÇÃO DE CLOSER ---
  function selectCloser(closerName) {
    currentCloser = closerName;

    // Atualiza chips da sidebar
    closerChips.forEach(chip => {
      if (chip.dataset.closer === closerName) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    // Atualiza segmented buttons no card
    segmentedBtns.forEach(btn => {
      if (btn.dataset.closer === closerName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Atualiza labels de UI
    if (headerCloserName) headerCloserName.textContent = closerName;
    if (sidebarUserName) sidebarUserName.textContent = `${closerName} Closer`;
    if (sidebarUserAvatar) sidebarUserAvatar.textContent = closerName.charAt(0).toUpperCase();
    if (btnPdfLabel) btnPdfLabel.textContent = `GERAR RELATÓRIO DE ${closerName.toUpperCase()} (PDF)`;
    if (printCloserName) printCloserName.innerHTML = `Closer: <strong>${closerName.toUpperCase()}</strong>`;

    loadDayData();
  }

  // --- ATUALIZAÇÃO DOS KPIS E ELEMENTOS VISUAIS EM TEMPO REAL ---
  function updateDashboard() {
    const leads = Math.max(0, parseInt(inputLeads.value, 10) || 0);
    const followups = Math.max(0, parseInt(inputFollowups.value, 10) || 0);
    const prospeccoes = Math.max(0, parseInt(inputProspeccoes.value, 10) || 0);
    const scheduled = Math.max(0, parseInt(inputMeetingsScheduled.value, 10) || 0);
    const held = Math.max(0, parseInt(inputMeetingsHeld.value, 10) || 0);
    const sales = Math.max(0, parseInt(inputSales.value, 10) || 0);

    const formattedContract = formatMoneyString(inputContractVal.value);
    const formattedCash = formatMoneyString(inputCashCollected.value);
    const totalEffort = followups + prospeccoes;

    // 1. Atualiza os 3 Cards Superiores
    if (kpiSalesNum) kpiSalesNum.textContent = `${sales} un`;
    if (kpiSalesSub) kpiSalesSub.textContent = `${sales} nova(s)`;
    if (kpiContractNum) kpiContractNum.textContent = formattedContract;
    if (kpiCashNum) kpiCashNum.textContent = formattedCash;

    // 2. Atualiza Tooltip Flutuante do Gráfico de Overview (Estilo uifry "from 766 $")
    if (overviewTooltipText) {
      if (formattedCash !== 'R$ 0,00') {
        overviewTooltipText.textContent = `from ${formattedCash} $`;
      } else if (formattedContract !== 'R$ 0,00') {
        overviewTooltipText.textContent = `from ${formattedContract} $`;
      } else {
        overviewTooltipText.textContent = `from R$ 766 $`;
      }
    }

    // 3. Atualiza os Círculos Sobrepostos do Card Activity
    const attendanceRate = scheduled > 0 ? Math.min(100, Math.round((held / scheduled) * 100)) : (held > 0 ? 100 : 0);
    const conversionRate = held > 0 ? Math.min(100, Math.round((sales / held) * 100)) : (sales > 0 ? 100 : 0);

    if (bubbleConversionRate) bubbleConversionRate.textContent = `${conversionRate}%`;
    if (bubbleAttendanceRate) bubbleAttendanceRate.textContent = `${attendanceRate}%`;
    if (bubbleEffortTotal) bubbleEffortTotal.textContent = totalEffort;

    // 4. Atualiza Barras de Metas (Comparison)
    if (compBarSales) {
      const salesPct = Math.min(100, sales > 0 ? Math.max(25, sales * 33) : 10);
      compBarSales.style.width = `${salesPct}%`;
    }
    if (compBarMeetings) {
      const meetPct = scheduled > 0 ? Math.min(100, Math.max(20, (held / scheduled) * 100)) : 15;
      compBarMeetings.style.width = `${meetPct}%`;
    }

    // 5. Atualiza Cabeçalho de Impressão
    const selectedDate = dateInput.value || formattedToday;
    if (printReportDate) printReportDate.innerHTML = `Data: <strong>${formatDateBR(selectedDate)}</strong>`;

    // Sincroniza atributos value para impressão exata
    allInputs.forEach(input => {
      if (input) input.setAttribute('value', input.value);
    });
  }

  // --- CARREGAR DADOS DO DIA ---
  function loadDayData() {
    const selectedDate = dateInput.value || formattedToday;
    const reports = getStoredReports();
    const entry = reports.find(r => r.closer === currentCloser && r.date === selectedDate);

    if (entry) {
      inputLeads.value = entry.leads ?? 0;
      inputFollowups.value = entry.followups ?? 0;
      inputProspeccoes.value = entry.prospeccoes ?? 0;
      inputMeetingsScheduled.value = entry.meetingsScheduled ?? 0;
      inputMeetingsHeld.value = entry.meetingsHeld ?? 0;
      inputSales.value = entry.sales ?? 0;
      inputContractVal.value = formatMoneyString(entry.contractVal);
      inputCashCollected.value = formatMoneyString(entry.cashCollected);
    } else {
      inputLeads.value = 0;
      inputFollowups.value = 0;
      inputProspeccoes.value = 0;
      inputMeetingsScheduled.value = 0;
      inputMeetingsHeld.value = 0;
      inputSales.value = 0;
      inputContractVal.value = 'R$ 0,00';
      inputCashCollected.value = 'R$ 0,00';
    }

    updateDashboard();
    renderHistory();
  }

  // --- SALVAR REGISTRO ---
  function saveCurrentReport(showFeedback = true) {
    const selectedDate = dateInput.value || formattedToday;

    const newRecord = {
      id: `${currentCloser}_${selectedDate}`,
      closer: currentCloser,
      date: selectedDate,
      leads: parseInt(inputLeads.value, 10) || 0,
      followups: parseInt(inputFollowups.value, 10) || 0,
      prospeccoes: parseInt(inputProspeccoes.value, 10) || 0,
      meetingsScheduled: parseInt(inputMeetingsScheduled.value, 10) || 0,
      meetingsHeld: parseInt(inputMeetingsHeld.value, 10) || 0,
      sales: parseInt(inputSales.value, 10) || 0,
      contractVal: formatMoneyString(inputContractVal.value),
      cashCollected: formatMoneyString(inputCashCollected.value),
      updatedAt: new Date().toISOString()
    };

    let reports = getStoredReports();
    const existingIndex = reports.findIndex(r => r.id === newRecord.id);

    if (existingIndex >= 0) {
      reports[existingIndex] = newRecord;
    } else {
      reports.unshift(newRecord);
    }

    saveStoredReports(reports);
    renderHistory();

    if (showFeedback) {
      showToast(`Métricas de ${currentCloser} salvas no histórico!`);
    }
  }

  // --- COPIAR WHATSAPP ---
  function copyWhatsAppSummary() {
    const selectedDate = dateInput.value || formattedToday;
    const leads = parseInt(inputLeads.value, 10) || 0;
    const followups = parseInt(inputFollowups.value, 10) || 0;
    const prospeccoes = parseInt(inputProspeccoes.value, 10) || 0;
    const scheduled = parseInt(inputMeetingsScheduled.value, 10) || 0;
    const held = parseInt(inputMeetingsHeld.value, 10) || 0;
    const sales = parseInt(inputSales.value, 10) || 0;
    const contractVal = formatMoneyString(inputContractVal.value);
    const cashCollected = formatMoneyString(inputCashCollected.value);

    const attendanceRate = scheduled > 0 ? Math.round((held / scheduled) * 100) : 0;
    const conversionRate = held > 0 ? Math.round((sales / held) * 100) : 0;

    let summary = `*FAZENDO ACONTECER™ | RELATÓRIO DIÁRIO*\n`;
    summary += `👤 *Closer:* ${currentCloser}\n`;
    summary += `📅 *Data:* ${formatDateBR(selectedDate)}\n`;
    summary += `─────────────────────────\n`;
    summary += `🎯 *MÉTRICA DE ESFORÇO & LEADS*\n`;
    summary += `• Leads recebidos: *${leads}*\n`;
    summary += `• Follow-ups realizados: *${followups}*\n`;
    summary += `• Prospecções no dia: *${prospeccoes}*\n`;
    summary += `─────────────────────────\n`;
    summary += `💼 *PERFORMANCE COMERCIAL*\n`;
    summary += `• Reuniões agendadas: *${scheduled}*\n`;
    summary += `• Reuniões realizadas: *${held}* (${attendanceRate}% comparecimento)\n`;
    summary += `• Vendas: *${sales}* (${conversionRate}% conversão)\n`;
    if (contractVal !== 'R$ 0,00') summary += `• Valor Contrato: *${contractVal}*\n`;
    if (cashCollected !== 'R$ 0,00') summary += `• Cash Coletado: *${cashCollected}*\n`;
    summary += `─────────────────────────\n`;
    summary += `⚡ _Gerado via Dashboard uifry • Hub Closers_`;

    navigator.clipboard.writeText(summary).then(() => {
      showToast('Relatório copiado para o WhatsApp!');
    }).catch(err => {
      console.error('Erro ao copiar', err);
      const ta = document.createElement('textarea');
      ta.value = summary;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Relatório copiado para o WhatsApp!');
    });
  }

  // --- LIMPAR VALORES ---
  function resetFormValues() {
    inputLeads.value = 0;
    inputFollowups.value = 0;
    inputProspeccoes.value = 0;
    inputMeetingsScheduled.value = 0;
    inputMeetingsHeld.value = 0;
    inputSales.value = 0;
    inputContractVal.value = 'R$ 0,00';
    inputCashCollected.value = 'R$ 0,00';
    updateDashboard();
    showToast('Campos resetados para zero.');
  }

  // --- RENDERIZAR TABELA DE HISTÓRICO (Transaction History) ---
  function renderHistory() {
    if (!historyTableBody) return;
    const reports = getStoredReports();
    historyTableBody.innerHTML = '';

    if (reports.length === 0) {
      historyTableBody.innerHTML = `
        <tr>
          <td colspan="11" style="text-align:center; padding: 28px; color: var(--text-secondary);">
            Nenhum relatório salvo no histórico ainda. Preencha e clique em "Salvar".
          </td>
        </tr>
      `;
      return;
    }

    reports.forEach(report => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${formatDateBR(report.date)}</strong></td>
        <td><span style="font-weight:700; color:var(--text-dark);">${report.closer}</span></td>
        <td>${report.leads}</td>
        <td>${report.followups}</td>
        <td>${report.prospeccoes}</td>
        <td>${report.meetingsScheduled}</td>
        <td>${report.meetingsHeld}</td>
        <td><span style="font-weight:800; color:#10b981;">${report.sales}</span></td>
        <td>${report.contractVal}</td>
        <td><strong style="color:var(--text-dark);">${report.cashCollected}</strong></td>
        <td>
          <button type="button" class="btn-uifry-sec btn-load-entry" data-closer="${report.closer}" data-date="${report.date}" style="padding: 4px 8px; font-size: 11px;">
            Carregar
          </button>
        </td>
      `;
      historyTableBody.appendChild(tr);
    });

    document.querySelectorAll('.btn-load-entry').forEach(btn => {
      btn.addEventListener('click', () => {
        const c = btn.dataset.closer;
        const d = btn.dataset.date;
        dateInput.value = d;
        selectCloser(c);
        showToast(`Registro de ${c} (${formatDateBR(d)}) carregado!`);
      });
    });
  }

  function exportCSV() {
    const reports = getStoredReports();
    if (reports.length === 0) {
      showToast('Nenhum registro para exportar.');
      return;
    }

    let csv = 'Data,Closer,Leads,Followups,Prospeccoes,ReunioesAgendadas,ReunioesRealizadas,Vendas,ValorContrato,CashColetado\n';
    reports.forEach(r => {
      csv += `"${formatDateBR(r.date)}","${r.closer}",${r.leads},${r.followups},${r.prospeccoes},${r.meetingsScheduled},${r.meetingsHeld},${r.sales},"${r.contractVal}","${r.cashCollected}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historico_closers_${formattedToday}.csv`;
    link.click();
    showToast('Histórico exportado com sucesso em CSV!');
  }

  function clearAllHistory() {
    if (confirm('Tem certeza de que deseja apagar todo o histórico de relatórios salvos?')) {
      localStorage.removeItem(STORAGE_KEY);
      renderHistory();
      showToast('Histórico completamente limpo.');
    }
  }

  // --- EVENT LISTENERS ---

  // Seleção de closer via Chips da Sidebar
  closerChips.forEach(chip => {
    chip.addEventListener('click', () => {
      selectCloser(chip.dataset.closer);
    });
  });

  // Seleção de closer via Segmented Buttons do Card
  segmentedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectCloser(btn.dataset.closer);
    });
  });

  // Mudança de Data
  if (dateInput) {
    dateInput.addEventListener('change', () => {
      loadDayData();
    });
  }

  // Atualização em Tempo Real nos Inputs Numéricos
  [inputLeads, inputFollowups, inputProspeccoes, inputMeetingsScheduled, inputMeetingsHeld, inputSales].forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        updateDashboard();
      });
    }
  });

  // Botões Gerar Relatório PDF
  if (btnGeneratePdf) {
    btnGeneratePdf.addEventListener('click', () => {
      saveCurrentReport(false);
      updateDashboard();
      window.print();
    });
  }
  if (navBtnPdf) {
    navBtnPdf.addEventListener('click', (e) => {
      e.preventDefault();
      saveCurrentReport(false);
      updateDashboard();
      window.print();
    });
  }

  // Botão Copiar WhatsApp
  if (btnCopyWhatsapp) {
    btnCopyWhatsapp.addEventListener('click', () => {
      copyWhatsAppSummary();
    });
  }

  // Botão Salvar Registro
  if (btnSaveLog) {
    btnSaveLog.addEventListener('click', () => {
      saveCurrentReport(true);
    });
  }

  // Botão Limpar Formulário
  if (btnResetForm) {
    btnResetForm.addEventListener('click', () => {
      resetFormValues();
    });
  }

  // Exportar / Limpar Histórico
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', exportCSV);
  }
  if (btnClearHistory) {
    btnClearHistory.addEventListener('click', clearAllHistory);
  }

  // Botão Tema (Informa que o dashboard usa a estética híbrida uifry)
  if (btnToggleTheme) {
    btnToggleTheme.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Estilo uifry ativado: Dark Sidebar + Clean Canvas');
    });
  }

  // --- INICIALIZAÇÃO ---
  selectCloser('Muller');
});
