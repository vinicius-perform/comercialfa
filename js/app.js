/**
 * Fazendo Acontecer™ - Hub Closers Gestão
 * Modern uifry Dashboard Logic, Live Currency Mask & Real-time Visual Synchronizer
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- CONFIGURAÇÃO & ESTADO ---
  const closers = ['Tales', 'José', 'Muller', 'Elinaldo'];
  let currentCloser = null;

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

  function showToast(message, isWarning = false) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${isWarning ? 'toast-warning' : ''}`;
    toast.innerHTML = isWarning
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
           <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
           <line x1="12" y1="9" x2="12" y2="13"></line>
           <line x1="12" y1="17" x2="12.01" y2="17"></line>
         </svg>
         <span>${message}</span>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
           <polyline points="20 6 9 17 4 12"></polyline>
         </svg>
         <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 20);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
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

  function parseMoneyToNumber(raw) {
    if (raw === undefined || raw === null) return 0;
    if (typeof raw === 'number') return raw;
    const digits = String(raw).replace(/\D/g, '');
    if (!digits) return 0;
    return parseInt(digits, 10) / 100;
  }

  function formatNumberToMoney(num) {
    if (num === undefined || num === null || isNaN(num)) return 'R$ 0,00';
    return `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function getMonthNameBR(yearMonthStr) {
    if (!yearMonthStr) return 'Mês Atual';
    const parts = yearMonthStr.split('-');
    if (parts.length < 2) return yearMonthStr;
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${monthNames[monthIdx] || parts[1]} de ${year}`;
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

  // --- VALIDAÇÃO DE SELEÇÃO OBRIGATÓRIA ---
  function validateCloserSelected() {
    if (!currentCloser) {
      showToast('⚠️ Selecione um nome antes de continuar!', true);
      const grid = document.querySelector('.closers-grid');
      if (grid) {
        grid.classList.remove('highlight-error');
        void grid.offsetWidth; // Força reflow para reiniciar animação
        grid.classList.add('highlight-error');
        setTimeout(() => grid.classList.remove('highlight-error'), 1200);
      }
      return false;
    }
    return true;
  }

  // --- SELEÇÃO DE MEMBRO ---
  function selectCloser(closerName) {
    currentCloser = closerName;
    isDataSaved = false;

    const grid = document.querySelector('.closers-grid');
    if (grid) grid.classList.remove('highlight-error');

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
    if (printCloserName) printCloserName.innerHTML = `Nome: <strong>${closerName.toUpperCase()}</strong>`;

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
    if (!currentCloser) {
      inputLeads.value = 0;
      inputFollowups.value = 0;
      inputProspeccoes.value = 0;
      inputMeetingsScheduled.value = 0;
      inputMeetingsHeld.value = 0;
      inputSales.value = 0;
      inputContractVal.value = 'R$ 0,00';
      inputCashCollected.value = 'R$ 0,00';
      updateDashboard();
      return;
    }

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
    if (!validateCloserSelected()) return false;

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

  function renderMonthGrid(container, year, month) {
    if (!container) return;
    container.innerHTML = '';

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = domingo
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Determina o intervalo efetivo para destaque visual
    let effectiveStart = filterStartDate;
    let effectiveEnd = filterEndDate;

    if (pickerSelectionStep === 1 && tempRangeStart) {
      effectiveStart = tempRangeStart;
      effectiveEnd = hoveredDate || tempRangeStart;
      if (effectiveEnd < effectiveStart) {
        const t = effectiveStart;
        effectiveStart = effectiveEnd;
        effectiveEnd = t;
      }
    }

    // 1. Dias do mês anterior (fora do mês)
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDay = daysInPrevMonth - i;
      const cell = document.createElement('div');
      cell.className = 'cal-day-cell outside-month';
      cell.textContent = prevDay;
      container.appendChild(cell);
    }

    // 2. Dias do mês corrente
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const cell = document.createElement('div');
      cell.className = 'cal-day-cell';
      cell.textContent = day;
      cell.dataset.date = dayStr;

      if (filterActivePreset !== 'all' || pickerSelectionStep === 1) {
        if (dayStr === effectiveStart) {
          cell.classList.add('range-start');
        }
        if (dayStr === effectiveEnd) {
          cell.classList.add('range-end');
        }
        if (dayStr > effectiveStart && dayStr < effectiveEnd) {
          if (pickerSelectionStep === 1) {
            cell.classList.add('hover-in-range');
          } else {
            cell.classList.add('in-range');
          }
        }
      }

      cell.addEventListener('click', (e) => {
        e.stopPropagation();
        handleDayClick(dayStr);
      });

      cell.addEventListener('mouseenter', () => {
        if (pickerSelectionStep === 1) {
          hoveredDate = dayStr;
          renderCalendarDual();
        }
      });

      container.appendChild(cell);
    }

    // 3. Dias do próximo mês para completar a grade
    const totalRendered = firstDayIndex + daysInMonth;
    const remaining = (totalRendered % 7 === 0) ? 0 : 7 - (totalRendered % 7);
    for (let nextDay = 1; nextDay <= remaining; nextDay++) {
      const cell = document.createElement('div');
      cell.className = 'cal-day-cell outside-month';
      cell.textContent = nextDay;
      container.appendChild(cell);
    }
  }

  function renderCalendarDual() {
    const leftYear = calendarBaseDate.getFullYear();
    const leftMonth = calendarBaseDate.getMonth();

    const rightDate = new Date(leftYear, leftMonth + 1, 1);
    const rightYear = rightDate.getFullYear();
    const rightMonth = rightDate.getMonth();

    if (calLeftTitle) {
      calLeftTitle.textContent = `${monthNamesPT[leftMonth]} ${leftYear}`;
    }
    if (calRightTitle) {
      calRightTitle.textContent = `${monthNamesPT[rightMonth]} ${rightYear}`;
    }

    renderMonthGrid(calLeftDays, leftYear, leftMonth);
    renderMonthGrid(calRightDays, rightYear, rightMonth);
  }

  function handleDayClick(dateStr) {
    if (pickerSelectionStep === 0) {
      tempRangeStart = dateStr;
      pickerSelectionStep = 1;
      hoveredDate = dateStr;
      filterActivePreset = null;
      updatePresetButtonsUI();
      renderCalendarDual();
    } else if (pickerSelectionStep === 1) {
      if (dateStr < tempRangeStart) {
        filterStartDate = dateStr;
        filterEndDate = tempRangeStart;
      } else {
        filterStartDate = tempRangeStart;
        filterEndDate = dateStr;
      }
      pickerSelectionStep = 0;
      tempRangeStart = null;
      hoveredDate = null;
      filterActivePreset = null;
      updatePresetButtonsUI();
      updateDateRangeButtonText();
      renderCalendarDual();
      renderHistory();
      closeDateRangePopover();
    }
  }

  function applyPreset(presetKey) {
    const now = new Date();
    const currentY = now.getFullYear();
    const currentM = now.getMonth();

    if (presetKey === 'today') {
      filterStartDate = toYYYYMMDD(now);
      filterEndDate = toYYYYMMDD(now);
    } else if (presetKey === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      filterStartDate = toYYYYMMDD(y);
      filterEndDate = toYYYYMMDD(y);
    } else if (presetKey === 'last7days') {
      const s = new Date(now);
      s.setDate(s.getDate() - 6);
      filterStartDate = toYYYYMMDD(s);
      filterEndDate = toYYYYMMDD(now);
    } else if (presetKey === 'thisMonth') {
      const f = new Date(currentY, currentM, 1);
      filterStartDate = toYYYYMMDD(f);
      filterEndDate = toYYYYMMDD(now);
    } else if (presetKey === 'lastMonth') {
      const lmFirst = new Date(currentY, currentM - 1, 1);
      const lmLast = new Date(currentY, currentM, 0);
      filterStartDate = toYYYYMMDD(lmFirst);
      filterEndDate = toYYYYMMDD(lmLast);
    } else if (presetKey === 'all') {
      filterStartDate = '2000-01-01';
      filterEndDate = '2099-12-31';
    }

    filterActivePreset = presetKey;
    pickerSelectionStep = 0;
    tempRangeStart = null;
    hoveredDate = null;

    if (presetKey !== 'all') {
      calendarBaseDate = new Date(filterStartDate + 'T00:00:00');
    } else {
      calendarBaseDate = new Date(currentY, currentM, 1);
    }

    updatePresetButtonsUI();
    updateDateRangeButtonText();
    renderCalendarDual();
    renderHistory();
    closeDateRangePopover();
  }

  function openDateRangePopover() {
    if (dateRangePopover) dateRangePopover.classList.add('open');
    if (dateRangeFilterWrapper) dateRangeFilterWrapper.classList.add('open');
    if (closerDropdownMenu) closerDropdownMenu.classList.remove('open');
    if (closerFilterWrapper) closerFilterWrapper.classList.remove('open');
    renderCalendarDual();
  }

  function closeDateRangePopover() {
    if (dateRangePopover) dateRangePopover.classList.remove('open');
    if (dateRangeFilterWrapper) dateRangeFilterWrapper.classList.remove('open');
    pickerSelectionStep = 0;
    tempRangeStart = null;
    hoveredDate = null;
  }

  function openCloserDropdown() {
    if (closerDropdownMenu) closerDropdownMenu.classList.add('open');
    if (closerFilterWrapper) closerFilterWrapper.classList.add('open');
    if (dateRangePopover) dateRangePopover.classList.remove('open');
    if (dateRangeFilterWrapper) dateRangeFilterWrapper.classList.remove('open');
  }

  function closeCloserDropdown() {
    if (closerDropdownMenu) closerDropdownMenu.classList.remove('open');
    if (closerFilterWrapper) closerFilterWrapper.classList.remove('open');
  }

  // --- FILTRO DOS REGISTROS SALVOS ---
  function getFilteredReports() {
    const allReports = getStoredReports();

    return allReports.filter(r => {
      // Filtro de Data (Intervalo)
      if (filterStartDate && filterEndDate) {
        if (!r.date || r.date < filterStartDate || r.date > filterEndDate) {
          return false;
        }
      }
      // Filtro de Closer
      if (filterSelectedCloser !== 'all') {
        if (r.closer !== filterSelectedCloser) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }

  // --- RENDERIZAÇÃO DO HISTÓRICO CONSOLIDADO ---
  function renderHistory() {
    const filtered = getFilteredReports();

    if (historyTotalCount) {
      historyTotalCount.textContent = `${filtered.length} registro(s)`;
    }

    // Totais Globais
    let totalLeads = 0;
    let totalFollowups = 0;
    let totalProspeccoes = 0;
    let totalMeetingsScheduled = 0;
    let totalMeetingsHeld = 0;
    let totalSales = 0;
    let totalContractsVal = 0;
    let totalCashCollected = 0;

    // Consolidação por Closer
    const closersMap = {};
    const defaultClosers = ['Tales', 'José', 'Muller', 'Elinaldo'];
    defaultClosers.forEach(c => {
      if (filterSelectedCloser === 'all' || filterSelectedCloser === c) {
        closersMap[c] = {
          closer: c,
          days: 0,
          leads: 0,
          followups: 0,
          prospeccoes: 0,
          meetingsScheduled: 0,
          meetingsHeld: 0,
          sales: 0,
          contractsVal: 0,
          cashCollected: 0
        };
      }
    });

    filtered.forEach(r => {
      const leads = parseInt(r.leads, 10) || 0;
      const followups = parseInt(r.followups, 10) || 0;
      const prospeccoes = parseInt(r.prospeccoes, 10) || 0;
      const scheduled = parseInt(r.meetingsScheduled, 10) || 0;
      const held = parseInt(r.meetingsHeld, 10) || 0;
      const sales = parseInt(r.sales, 10) || 0;
      const cVal = parseMoneyToNumber(r.contractVal);
      const cCash = parseMoneyToNumber(r.cashCollected);

      totalLeads += leads;
      totalFollowups += followups;
      totalProspeccoes += prospeccoes;
      totalMeetingsScheduled += scheduled;
      totalMeetingsHeld += held;
      totalSales += sales;
      totalContractsVal += cVal;
      totalCashCollected += cCash;

      if (!closersMap[r.closer]) {
        closersMap[r.closer] = {
          closer: r.closer,
          days: 0,
          leads: 0,
          followups: 0,
          prospeccoes: 0,
          meetingsScheduled: 0,
          meetingsHeld: 0,
          sales: 0,
          contractsVal: 0,
          cashCollected: 0
        };
      }

      closersMap[r.closer].days += 1;
      closersMap[r.closer].leads += leads;
      closersMap[r.closer].followups += followups;
      closersMap[r.closer].prospeccoes += prospeccoes;
      closersMap[r.closer].meetingsScheduled += scheduled;
      closersMap[r.closer].meetingsHeld += held;
      closersMap[r.closer].sales += sales;
      closersMap[r.closer].contractsVal += cVal;
      closersMap[r.closer].cashCollected += cCash;
    });

    const totalEffort = totalFollowups + totalProspeccoes;
    const generalAttendance = totalMeetingsScheduled > 0 ? Math.round((totalMeetingsHeld / totalMeetingsScheduled) * 100) : 0;
    const generalConversion = totalMeetingsHeld > 0 ? Math.round((totalSales / totalMeetingsHeld) * 100) : 0;

    // Atualiza os Cards de KPIs Consolidados
    if (histKpiSales) histKpiSales.textContent = totalSales;
    if (histKpiConversion) histKpiConversion.textContent = `${generalConversion}% conversão`;
    if (histKpiContracts) histKpiContracts.textContent = formatNumberToMoney(totalContractsVal);
    if (histKpiCash) histKpiCash.textContent = formatNumberToMoney(totalCashCollected);
    if (histKpiEffort) histKpiEffort.textContent = totalEffort;
    if (histKpiEffortSub) histKpiEffortSub.textContent = `${totalFollowups} flw • ${totalProspeccoes} prosp`;
    if (histKpiMeetings) histKpiMeetings.textContent = `${totalMeetingsHeld} / ${totalMeetingsScheduled}`;
    if (histKpiMeetingsSub) histKpiMeetingsSub.textContent = `${generalAttendance}% comparecimento`;
    if (histKpiLeads) histKpiLeads.textContent = totalLeads;
    if (histKpiLeadsSub) histKpiLeadsSub.textContent = `${filtered.length} lançamentos`;

    // Renderiza Tabela de Performance por Closer
    const activeClosersList = Object.values(closersMap).sort((a, b) => b.cashCollected - a.cashCollected || b.sales - a.sales);
    const activeWithEntries = activeClosersList.filter(c => c.days > 0);

    if (histClosersCount) {
      histClosersCount.textContent = `${activeWithEntries.length} ativo(s)`;
    }

    if (closersPerformanceBody) {
      closersPerformanceBody.innerHTML = '';

      if (activeClosersList.length === 0) {
        closersPerformanceBody.innerHTML = `
          <tr><td colspan="11" style="text-align:center; padding: 24px; color: var(--text-muted);">Nenhum dado de closer para exibir no período.</td></tr>
        `;
      } else {
        activeClosersList.forEach(c => {
          const attendance = c.meetingsScheduled > 0 ? Math.round((c.meetingsHeld / c.meetingsScheduled) * 100) : 0;
          const conversion = c.meetingsHeld > 0 ? Math.round((c.sales / c.meetingsHeld) * 100) : 0;
          const initial = (c.closer || 'C').charAt(0).toUpperCase();
          const isActive = c.days > 0;

          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>
              <div class="closer-table-cell">
                <span class="closer-mini-badge">${initial}</span>
                <span class="closer-name-text">${c.closer}</span>
              </div>
            </td>
            <td style="text-align: center;">${isActive ? `<span style="font-weight:700; color:#ffffff;">${c.days} d</span>` : '<span class="muted-dash">—</span>'}</td>
            <td style="text-align: center;">${isActive && c.leads > 0 ? c.leads : (isActive ? '0' : '<span class="muted-dash">—</span>')}</td>
            <td style="text-align: center;">${isActive && c.followups > 0 ? c.followups : (isActive ? '0' : '<span class="muted-dash">—</span>')}</td>
            <td style="text-align: center;">${isActive && c.prospeccoes > 0 ? c.prospeccoes : (isActive ? '0' : '<span class="muted-dash">—</span>')}</td>
            <td style="text-align: center;">${isActive ? `${c.meetingsScheduled} / ${c.meetingsHeld}` : '<span class="muted-dash">—</span>'}</td>
            <td style="text-align: center;">${isActive && c.meetingsScheduled > 0 ? `<span class="tbl-pill-badge">${attendance}%</span>` : '<span class="muted-dash">—</span>'}</td>
            <td style="text-align: center;">${isActive && c.meetingsHeld > 0 ? `<span class="tbl-pill-badge ${conversion > 0 ? 'lime-pill' : ''}">${conversion}%</span>` : '<span class="muted-dash">—</span>'}</td>
            <td style="text-align: center;">${isActive && c.sales > 0 ? `<span class="sales-highlight">${c.sales}</span>` : (isActive ? '0' : '<span class="muted-dash">—</span>')}</td>
            <td style="text-align: right;">${isActive && c.contractsVal > 0 ? formatNumberToMoney(c.contractsVal) : (isActive ? 'R$ 0,00' : '<span class="muted-dash">—</span>')}</td>
            <td style="text-align: right;">${isActive && c.cashCollected > 0 ? `<span class="cash-highlight">${formatNumberToMoney(c.cashCollected)}</span>` : (isActive ? 'R$ 0,00' : '<span class="muted-dash">—</span>')}</td>
          `;
          closersPerformanceBody.appendChild(tr);
        });

        // Linha de Total Geral no rodapé da tabela
        const totalTr = document.createElement('tr');
        totalTr.className = 'table-total-row';
        totalTr.innerHTML = `
          <td><strong>Total da Equipe</strong></td>
          <td style="text-align: center;"><strong>${filtered.length} reg.</strong></td>
          <td style="text-align: center;"><strong>${totalLeads}</strong></td>
          <td style="text-align: center;"><strong>${totalFollowups}</strong></td>
          <td style="text-align: center;"><strong>${totalProspeccoes}</strong></td>
          <td style="text-align: center;"><strong>${totalMeetingsScheduled} / ${totalMeetingsHeld}</strong></td>
          <td style="text-align: center;"><strong>${totalMeetingsScheduled > 0 ? `<span class="tbl-pill-badge">${generalAttendance}%</span>` : '—'}</strong></td>
          <td style="text-align: center;"><strong>${totalMeetingsHeld > 0 ? `<span class="tbl-pill-badge lime-pill">${generalConversion}%</span>` : '—'}</strong></td>
          <td style="text-align: center;"><strong class="sales-highlight">${totalSales}</strong></td>
          <td style="text-align: right;"><strong>${formatNumberToMoney(totalContractsVal)}</strong></td>
          <td style="text-align: right;"><strong class="cash-highlight">${formatNumberToMoney(totalCashCollected)}</strong></td>
        `;
        closersPerformanceBody.appendChild(totalTr);
      }
    }
  }

  // --- EXPORTAÇÃO EM PDF DO RELATÓRIO CONSOLIDADO ---
  function exportConsolidatedPDF() {
    const filtered = getFilteredReports();
    if (filtered.length === 0) {
      showToast('Nenhum registro encontrado no filtro atual para gerar o relatório PDF.', true);
      return;
    }

    const periodTitle = (filterActivePreset === 'all')
      ? 'HISTÓRICO COMPLETO CONSOLIDADO'
      : `${formatDateBR(filterStartDate)} A ${formatDateBR(filterEndDate)}`;

    const closerTitle = filterSelectedCloser === 'all'
      ? 'TODA A EQUIPE COMERCIAL'
      : `${filterSelectedCloser.toUpperCase()}`;

    // Totais Globais
    let totalLeads = 0;
    let totalFollowups = 0;
    let totalProspeccoes = 0;
    let totalMeetingsScheduled = 0;
    let totalMeetingsHeld = 0;
    let totalSales = 0;
    let totalContractsVal = 0;
    let totalCashCollected = 0;

    const closersMap = {};
    filtered.forEach(r => {
      const leads = parseInt(r.leads, 10) || 0;
      const followups = parseInt(r.followups, 10) || 0;
      const prospeccoes = parseInt(r.prospeccoes, 10) || 0;
      const scheduled = parseInt(r.meetingsScheduled, 10) || 0;
      const held = parseInt(r.meetingsHeld, 10) || 0;
      const sales = parseInt(r.sales, 10) || 0;
      const cVal = parseMoneyToNumber(r.contractVal);
      const cCash = parseMoneyToNumber(r.cashCollected);

      totalLeads += leads;
      totalFollowups += followups;
      totalProspeccoes += prospeccoes;
      totalMeetingsScheduled += scheduled;
      totalMeetingsHeld += held;
      totalSales += sales;
      totalContractsVal += cVal;
      totalCashCollected += cCash;

      if (!closersMap[r.closer]) {
        closersMap[r.closer] = {
          closer: r.closer,
          days: 0,
          leads: 0,
          followups: 0,
          prospeccoes: 0,
          meetingsScheduled: 0,
          meetingsHeld: 0,
          sales: 0,
          contractsVal: 0,
          cashCollected: 0
        };
      }

      closersMap[r.closer].days += 1;
      closersMap[r.closer].leads += leads;
      closersMap[r.closer].followups += followups;
      closersMap[r.closer].prospeccoes += prospeccoes;
      closersMap[r.closer].meetingsScheduled += scheduled;
      closersMap[r.closer].meetingsHeld += held;
      closersMap[r.closer].sales += sales;
      closersMap[r.closer].contractsVal += cVal;
      closersMap[r.closer].cashCollected += cCash;
    });

    const totalEffort = totalFollowups + totalProspeccoes;
    const generalAttendance = totalMeetingsScheduled > 0 ? Math.round((totalMeetingsHeld / totalMeetingsScheduled) * 100) : 0;
    const generalConversion = totalMeetingsHeld > 0 ? Math.round((totalSales / totalMeetingsHeld) * 100) : 0;

    const sortedClosers = Object.values(closersMap).sort((a, b) => b.cashCollected - a.cashCollected || b.sales - a.sales);

    // Linhas da Tabela de Closers
    let closersRowsHtml = '';
    sortedClosers.forEach(c => {
      const att = c.meetingsScheduled > 0 ? Math.round((c.meetingsHeld / c.meetingsScheduled) * 100) : 0;
      const conv = c.meetingsHeld > 0 ? Math.round((c.sales / c.meetingsHeld) * 100) : 0;
      closersRowsHtml += `
        <tr>
          <td style="font-weight:700; color:#ffffff;">${c.closer}</td>
          <td>${c.days} d</td>
          <td>${c.leads}</td>
          <td>${c.followups}</td>
          <td>${c.prospeccoes}</td>
          <td>${c.meetingsScheduled} / ${c.meetingsHeld}</td>
          <td>${c.meetingsScheduled > 0 ? `${att}%` : '—'}</td>
          <td style="color:${conv > 0 ? 'var(--accent-lime)' : '#a0aec0'}; font-weight:700;">${c.meetingsHeld > 0 ? `${conv}%` : '—'}</td>
          <td style="font-weight:800; color:#ffffff;">${c.sales}</td>
          <td>${formatNumberToMoney(c.contractsVal)}</td>
          <td style="color:var(--accent-lime); font-weight:800;">${formatNumberToMoney(c.cashCollected)}</td>
        </tr>
      `;
    });

    const nowBR = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    if (printConsolidatedReport) {
      printConsolidatedReport.innerHTML = `
        <div class="consolidated-print-header">
          <div class="print-brand">
            <img src="assets/logo.png" alt="FAZENDO ACONTECER™" class="print-logo-img">
            <span class="print-brand-sub">HUB COMERCIAL • CONSOLIDADO MENSAL</span>
          </div>
          <div class="print-meta">
            <span class="print-title">RELATÓRIO CONSOLIDADO DE PERFORMANCE</span>
            <div class="print-details">
              <span>Período: <strong>${periodTitle}</strong></span>
              <span class="print-separator">•</span>
              <span>Filtro: <strong>${closerTitle}</strong></span>
              <span class="print-separator">•</span>
              <span>Emissão: <strong>${nowBR}</strong></span>
            </div>
          </div>
        </div>

        <div class="consolidated-kpis-row">
          <div class="consolidated-kpi-box">
            <span class="history-kpi-label">TOTAL VENDAS</span>
            <span class="history-kpi-val highlight-lime">${totalSales}</span>
            <span class="history-kpi-sub">${generalConversion}% conversão geral</span>
          </div>
          <div class="consolidated-kpi-box">
            <span class="history-kpi-label">VALOR CONTRATOS</span>
            <span class="history-kpi-val">${formatNumberToMoney(totalContractsVal)}</span>
            <span class="history-kpi-sub">Contratos enviados</span>
          </div>
          <div class="consolidated-kpi-box">
            <span class="history-kpi-label">CASH COLETADO</span>
            <span class="history-kpi-val highlight-lime">${formatNumberToMoney(totalCashCollected)}</span>
            <span class="history-kpi-sub">Receita recebida</span>
          </div>
          <div class="consolidated-kpi-box">
            <span class="history-kpi-label">ESFORÇO ATIVO</span>
            <span class="history-kpi-val">${totalEffort}</span>
            <span class="history-kpi-sub">${totalFollowups} flw • ${totalProspeccoes} prosp</span>
          </div>
          <div class="consolidated-kpi-box">
            <span class="history-kpi-label">REUNIÕES REALIZADAS</span>
            <span class="history-kpi-val">${totalMeetingsHeld} / ${totalMeetingsScheduled}</span>
            <span class="history-kpi-sub">${generalAttendance}% comparecimento</span>
          </div>
          <div class="consolidated-kpi-box">
            <span class="history-kpi-label">LEADS TOTAIS</span>
            <span class="history-kpi-val">${totalLeads}</span>
            <span class="history-kpi-sub">${filtered.length} lançamentos</span>
          </div>
        </div>

        <div class="consolidated-print-table-section">
          <span class="consolidated-print-table-title">PERFORMANCE</span>
          <table class="consolidated-print-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Dias</th>
                <th>Leads</th>
                <th>Follow-ups</th>
                <th>Prospecção</th>
                <th>Reuniões (Ag/Real)</th>
                <th>Tx. Comp.</th>
                <th>Tx. Conv.</th>
                <th>Vendas</th>
                <th>Valor Contratos</th>
                <th>Cash Coletado</th>
              </tr>
            </thead>
            <tbody>
              ${closersRowsHtml}
              <tr class="table-total-row">
                <td><strong>TOTAL GERAL</strong></td>
                <td><strong>${filtered.length} reg.</strong></td>
                <td><strong>${totalLeads}</strong></td>
                <td><strong>${totalFollowups}</strong></td>
                <td><strong>${totalProspeccoes}</strong></td>
                <td><strong>${totalMeetingsScheduled} / ${totalMeetingsHeld}</strong></td>
                <td><strong>${totalMeetingsScheduled > 0 ? `${generalAttendance}%` : '—'}</strong></td>
                <td><strong style="color:var(--accent-lime);">${totalMeetingsHeld > 0 ? `${generalConversion}%` : '—'}</strong></td>
                <td><strong>${totalSales}</strong></td>
                <td><strong>${formatNumberToMoney(totalContractsVal)}</strong></td>
                <td style="color:var(--accent-lime);"><strong>${formatNumberToMoney(totalCashCollected)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="consolidated-print-footer">
          <span>Fazendo Acontecer™ • Hub Comercial • Documento Confidencial de Gestão</span>
          <span>Consolidado Oficial de Performance • Emitido em ${nowBR}</span>
        </div>
      `;
    }

    // Ativa modo consolidado de impressão
    document.body.classList.add('print-mode-consolidated');

    const cleanupPrintMode = () => {
      document.body.classList.remove('print-mode-consolidated');
      window.removeEventListener('afterprint', cleanupPrintMode);
    };
    window.addEventListener('afterprint', cleanupPrintMode);

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('print-mode-consolidated');
      }, 2000);
    }, 100);
  }

  // --- EXPORTAÇÃO CSV ---
  function exportCSV() {
    const filtered = getFilteredReports();
    if (filtered.length === 0) {
      showToast('Nenhum registro no filtro selecionado para exportar.', true);
      return;
    }

    let csv = 'Data,Closer,Leads,Followups,Prospeccoes,ReunioesAgendadas,ReunioesRealizadas,Vendas,ValorContrato,CashColetado\n';
    filtered.forEach(r => {
      csv += `"${formatDateBR(r.date)}","${r.closer}",${r.leads ?? 0},${r.followups ?? 0},${r.prospeccoes ?? 0},${r.meetingsScheduled ?? 0},${r.meetingsHeld ?? 0},${r.sales ?? 0},"${formatMoneyString(r.contractVal)}","${formatMoneyString(r.cashCollected)}"\n`;
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

  // --- EVENT LISTENERS DOS FILTROS EM PÍLULA & DATE RANGE ---

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
      isDataSaved = false;
      loadDayData();
    });
  }

  // Atualização em Tempo Real nos Inputs
  allInputs.forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        isDataSaved = false;
        updateDashboard();
      });
    }
  });

  // Botões Gerar Relatório PDF
  if (btnGeneratePdf) {
    btnGeneratePdf.addEventListener('click', () => {
      if (!validateCloserSelected()) return;
      openConfirmModal('generate_pdf');
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

  // Eventos do Modal de Confirmação
  if (btnCloseConfirmModal) {
    btnCloseConfirmModal.addEventListener('click', closeConfirmModal);
  }

  if (btnCancelConfirm) {
    btnCancelConfirm.addEventListener('click', closeConfirmModal);
  }

  if (confirmModal) {
    confirmModal.addEventListener('click', (e) => {
      if (e.target === confirmModal) {
        closeConfirmModal();
      }
    });
  }

  if (btnExecuteConfirm) {
    btnExecuteConfirm.addEventListener('click', () => {
      const action = confirmCallback;
      closeConfirmModal();
      if (action) {
        action();
      }
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
  // Inicia com valores zerados e sem closer pré-selecionado (obrigatório selecionar)
  loadDayData();
});
