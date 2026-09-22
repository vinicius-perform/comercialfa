/**
 * Fazendo Acontecer™ - Painel Comercial Executivo & Gestão
 * Multi-View SPA System: Executive Dashboard, SDR Hub, Closers Hub & Consolidated Data
 */

document.addEventListener('DOMContentLoaded', () => {
  // ============================================================
  // CONFIGURAÇÃO, CONSTANTES & ESTADO GLOBAL
  // ============================================================
  const closersList = ['Tales', 'José', 'Elinaldo'];
  const sdrsList = ['SDR 1', 'SDR 2', 'SDR 3', 'SDR 4'];
  
  let currentCloser = 'Tales';
  let currentSdr = 'SDR 1';
  let currentView = 'view-dashboard';

  // Chaves do LocalStorage
  const STORAGE_CLOSER_REPORTS = 'fa_closers_uifry_reports_v1';
  const STORAGE_SDR_REPORTS = 'fa_sdr_reports_v1';
  const STORAGE_GOAL = 'fa_monthly_goal_v1';
  const STORAGE_MONEY_TABLE = 'fa_money_table_v1';
  const STORAGE_WIN_RATE = 'fa_win_rate_v1';

  // Data atual padrão (YYYY-MM-DD)
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const formattedToday = `${yyyy}-${mm}-${dd}`;
  const currentMonthKey = `${yyyy}-${mm}`;

  // ============================================================
  // SEED DE DADOS INICIAIS (Se não houver registros salvos)
  // ============================================================
  function initializeSeedDataIfEmpty() {
    const existingClosers = getStoredCloserReports();
    if (existingClosers.length === 0) {
      const seedCloserReports = [
        {
          id: `Tales_${yyyy}-${mm}-18`,
          closer: 'Tales',
          date: `${yyyy}-${mm}-18`,
          leads: 18,
          followups: 32,
          prospeccoes: 15,
          meetingsScheduled: 6,
          meetingsHeld: 5,
          sales: 2,
          contractVal: 'R$ 24.000,00',
          cashCollected: 'R$ 18.000,00',
          updatedAt: new Date().toISOString()
        },
        {
          id: `José_${yyyy}-${mm}-19`,
          closer: 'José',
          date: `${yyyy}-${mm}-19`,
          leads: 14,
          followups: 26,
          prospeccoes: 12,
          meetingsScheduled: 5,
          meetingsHeld: 4,
          sales: 1,
          contractVal: 'R$ 15.000,00',
          cashCollected: 'R$ 12.500,00',
          updatedAt: new Date().toISOString()
        },
        {
          id: `Elinaldo_${yyyy}-${mm}-20`,
          closer: 'Elinaldo',
          date: `${yyyy}-${mm}-20`,
          leads: 16,
          followups: 28,
          prospeccoes: 14,
          meetingsScheduled: 5,
          meetingsHeld: 4,
          sales: 2,
          contractVal: 'R$ 20.000,00',
          cashCollected: 'R$ 15.000,00',
          updatedAt: new Date().toISOString()
        }
      ];
      saveStoredCloserReports(seedCloserReports);
    }

    const existingSdrs = getStoredSdrReports();
    if (existingSdrs.length === 0) {
      const seedSdrReports = [
        {
          id: `SDR 1_${formattedToday}`,
          sdr: 'SDR 1',
          date: formattedToday,
          leads: 45,
          calls: 38,
          whatsapp: 52,
          contacts: 24,
          scheduled: 7,
          qualified: 5,
          noshow: 1,
          pipeline: 'R$ 55.000,00',
          updatedAt: new Date().toISOString()
        },
        {
          id: `SDR 2_${yyyy}-${mm}-21`,
          sdr: 'SDR 2',
          date: `${yyyy}-${mm}-21`,
          leads: 40,
          calls: 32,
          whatsapp: 48,
          contacts: 20,
          scheduled: 5,
          qualified: 4,
          noshow: 0,
          pipeline: 'R$ 40.000,00',
          updatedAt: new Date().toISOString()
        }
      ];
      saveStoredSdrReports(seedSdrReports);
    }
  }

  // ============================================================
  // ELEMENTOS DO DOM
  // ============================================================
  // Views
  const views = {
    'view-dashboard': document.getElementById('view-dashboard'),
    'view-sdrs': document.getElementById('view-sdrs'),
    'view-closers': document.getElementById('view-closers'),
    'view-history': document.getElementById('view-history')
  };

  // Links da Sidebar
  const navLinks = {
    'view-dashboard': document.getElementById('nav-dashboard'),
    'view-sdrs': document.getElementById('nav-sdrs'),
    'view-closers': document.getElementById('nav-closers'),
    'view-history': document.getElementById('nav-history')
  };

  const closerChips = document.querySelectorAll('.closer-chip');

  // Botões de navegação rápida
  const btnQuickGotoSdr = document.getElementById('btn-quick-goto-sdr');
  const btnQuickGotoCloser = document.getElementById('btn-quick-goto-closer');
  const bannerGoSdr = document.getElementById('banner-go-sdr');
  const bannerGoCloser = document.getElementById('banner-go-closer');
  const btnSdrToDashboard = document.getElementById('btn-sdr-to-dashboard');
  const btnCloserToDashboard = document.getElementById('btn-closer-to-dashboard');

  // Toast Container
  const toastContainer = document.getElementById('toast-container');

  // --- ELEMENTOS DO DASHBOARD EXECUTIVO ---
  const execMonthDisplay = document.getElementById('exec-month-display');
  const execRevenueTotal = document.getElementById('exec-revenue-total');
  const execRevenuePct = document.getElementById('exec-revenue-pct');
  const execRevenueSalesCount = document.getElementById('exec-revenue-sales-count');
  const execContractsTotal = document.getElementById('exec-contracts-total');
  const execContractsCount = document.getElementById('exec-contracts-count');
  const execContractsAvg = document.getElementById('exec-contracts-avg');
  const execMoneyOnTable = document.getElementById('exec-money-on-table');
  const execProjectionTotal = document.getElementById('exec-projection-total');
  const execProjectionMetaPct = document.getElementById('exec-projection-meta-pct');
  
  // Pacing
  const execPacingPill = document.getElementById('exec-pacing-pill');
  const execPacingStatusText = document.getElementById('exec-pacing-status-text');
  const execGoalLabel = document.getElementById('exec-goal-label');
  const execTimeElapsedLabel = document.getElementById('exec-time-elapsed-label');
  const execMetaElapsedLabel = document.getElementById('exec-meta-elapsed-label');
  const pacingBarTime = document.getElementById('pacing-bar-time');
  const pacingPinTime = document.getElementById('pacing-pin-time');
  const pacingBarMoney = document.getElementById('pacing-bar-money');
  const pinDayNum = document.getElementById('pin-day-num');

  const statDaysPassed = document.getElementById('stat-days-passed');
  const statDaysRemaining = document.getElementById('stat-days-remaining');
  const statCurrentDailyPace = document.getElementById('stat-current-daily-pace');
  const statRequiredDailyPace = document.getElementById('stat-required-daily-pace');
  const statGoalGap = document.getElementById('stat-goal-gap');

  // Funil Comercial
  const funnelLeadsVal = document.getElementById('funnel-leads-val');
  const funnelContactsVal = document.getElementById('funnel-contacts-val');
  const funnelScheduledVal = document.getElementById('funnel-scheduled-val');
  const funnelHeldVal = document.getElementById('funnel-held-val');
  const funnelSalesVal = document.getElementById('funnel-sales-val');
  const funnelTotalCashSub = document.getElementById('funnel-total-cash-sub');
  const funnelConvContact = document.getElementById('funnel-conv-contact');
  const funnelConvSchedule = document.getElementById('funnel-conv-schedule');
  const funnelConvHeld = document.getElementById('funnel-conv-held');
  const funnelConvSales = document.getElementById('funnel-conv-sales');

  const execRankingTableBody = document.getElementById('exec-ranking-table-body');
  const btnExportExecCsv = document.getElementById('btn-export-exec-csv');

  // --- ELEMENTOS DO HUB DE SDRs ---
  const sdrReportDate = document.getElementById('sdr-report-date');
  if (sdrReportDate) sdrReportDate.value = formattedToday;

  const headerSdrName = document.getElementById('header-sdr-name');
  const sdrSegmentedBtns = document.querySelectorAll('#sdr-segmented-selector .segmented-btn');

  const sdrKpiScheduled = document.getElementById('sdr-kpi-scheduled');
  const sdrKpiQualifiedSub = document.getElementById('sdr-kpi-qualified-sub');
  const sdrKpiContacts = document.getElementById('sdr-kpi-contacts');
  const sdrKpiContactRate = document.getElementById('sdr-kpi-contact-rate');
  const sdrKpiPipeline = document.getElementById('sdr-kpi-pipeline');

  const inputSdrLeads = document.getElementById('input-sdr-leads');
  const inputSdrCalls = document.getElementById('input-sdr-calls');
  const inputSdrWhatsapp = document.getElementById('input-sdr-whatsapp');
  const inputSdrContacts = document.getElementById('input-sdr-contacts');
  const inputSdrNameCustom = document.getElementById('input-sdr-name-custom');
  const inputSdrScheduled = document.getElementById('input-sdr-scheduled');
  const inputSdrQualified = document.getElementById('input-sdr-qualified');
  const inputSdrNoshow = document.getElementById('input-sdr-noshow');
  const inputSdrPipeline = document.getElementById('input-sdr-pipeline');

  const sdrBubbleScheduleRate = document.getElementById('sdr-bubble-schedule-rate');
  const sdrBubbleContactRate = document.getElementById('sdr-bubble-contact-rate');
  const sdrBubbleEffort = document.getElementById('sdr-bubble-effort');

  const btnGenerateSdrPdf = document.getElementById('btn-generate-sdr-pdf');
  const btnSaveSdrReport = document.getElementById('btn-save-sdr-report');
  const btnResetSdrForm = document.getElementById('btn-reset-sdr-form');
  const sdrHistoryTableBody = document.getElementById('sdr-history-table-body');
  const btnExportSdrCsv = document.getElementById('btn-export-sdr-csv');

  // Área de impressão SDR
  const printSdrReport = document.getElementById('print-sdr-report');
  const printSdrName = document.getElementById('print-sdr-name');
  const printSdrDate = document.getElementById('print-sdr-date');
  const printSdrBodyContent = document.getElementById('print-sdr-body-content');

  // --- ELEMENTOS DO HUB DE CLOSERS ---
  const dateInput = document.getElementById('report-date');
  if (dateInput) dateInput.value = formattedToday;

  const headerCloserName = document.getElementById('header-closer-name');
  const printCloserName = document.getElementById('print-closer-name');
  const printReportDate = document.getElementById('print-report-date');
  const btnPdfLabel = document.getElementById('btn-pdf-label');

  const kpiSalesNum = document.getElementById('kpi-sales-num');
  const kpiSalesSub = document.getElementById('kpi-sales-sub');
  const kpiContractNum = document.getElementById('kpi-contract-num');
  const kpiCashNum = document.getElementById('kpi-cash-num');

  const inputLeads = document.getElementById('input-leads');
  const inputFollowups = document.getElementById('input-followups');
  const inputProspeccoes = document.getElementById('input-prospeccoes');
  const inputMeetingsScheduled = document.getElementById('input-meetings-scheduled');
  const inputMeetingsHeld = document.getElementById('input-meetings-held');
  const inputSales = document.getElementById('input-sales');
  const inputContractVal = document.getElementById('input-contract-val');
  const inputCashCollected = document.getElementById('input-cash-collected');

  const closerSegmentedBtns = document.querySelectorAll('.closer-selector-segmented .segmented-btn');

  const bubbleConversionRate = document.getElementById('bubble-conversion-rate');
  const bubbleAttendanceRate = document.getElementById('bubble-attendance-rate');
  const bubbleEffortTotal = document.getElementById('bubble-effort-total');
  const compBarSales = document.getElementById('comp-bar-sales');
  const compBarMeetings = document.getElementById('comp-bar-meetings');

  const btnGeneratePdf = document.getElementById('btn-generate-pdf');
  const btnSaveLog = document.getElementById('btn-save-log');
  const btnResetForm = document.getElementById('btn-reset-form');

  // --- ELEMENTOS DO HISTÓRICO CONSOLIDADO ---
  const historyTotalCount = document.getElementById('history-total-count');
  const historyTableBody = document.getElementById('history-table-body');
  const historyFilterMember = document.getElementById('history-filter-member');
  const historyFilterType = document.getElementById('history-filter-type');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnClearHistory = document.getElementById('btn-clear-history');

  // --- ELEMENTOS DO MODAL DE CONFIGURAÇÕES ---
  const modalSettings = document.getElementById('modal-settings');
  const btnOpenSettings = document.getElementById('btn-open-settings');
  const btnCloseSettings = document.getElementById('btn-close-settings');
  const btnCancelSettings = document.getElementById('btn-cancel-settings');
  const btnSaveSettings = document.getElementById('btn-save-settings');
  const btnNavQuickConfig = document.getElementById('nav-btn-quick-config');
  const btnOpenGoalModal = document.getElementById('btn-open-goal-modal');
  const btnEditTableMoney = document.getElementById('btn-edit-table-money');

  const settingMonthlyGoal = document.getElementById('setting-monthly-goal');
  const settingMoneyTable = document.getElementById('setting-money-table');
  const settingCloseRate = document.getElementById('setting-close-rate');

  // ============================================================
  // FUNÇÕES DE UTILIDADE E FORMATAÇÃO
  // ============================================================
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

  // Máscara monetária ao digitar
  function setupCurrencyInput(input) {
    if (!input) return;

    input.value = formatMoneyString(input.value);

    input.addEventListener('input', () => {
      input.value = formatMoneyString(input.value);
      setTimeout(() => {
        input.setSelectionRange(input.value.length, input.value.length);
      }, 0);
    });

    input.addEventListener('keydown', (e) => {
      const isAllSelected = (input.selectionStart === 0 && input.selectionEnd === input.value.length);
      if ((e.key === 'Backspace' || e.key === 'Delete') && isAllSelected) {
        e.preventDefault();
        input.value = 'R$ 0,00';
        input.setSelectionRange(input.value.length, input.value.length);
        return;
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        const digits = input.value.replace(/\D/g, '');
        const newDigits = digits.slice(0, -1);
        input.value = formatMoneyString(newDigits);
        input.setSelectionRange(input.value.length, input.value.length);
      }
    });

    input.addEventListener('focus', () => {
      setTimeout(() => {
        input.setSelectionRange(input.value.length, input.value.length);
      }, 0);
    });

    input.addEventListener('blur', () => {
      input.value = formatMoneyString(input.value);
    });
  }

  setupCurrencyInput(inputContractVal);
  setupCurrencyInput(inputCashCollected);
  setupCurrencyInput(inputSdrPipeline);
  setupCurrencyInput(settingMonthlyGoal);
  setupCurrencyInput(settingMoneyTable);

  // ============================================================
  // LOCAL STORAGE HELPERS
  // ============================================================
  function getStoredCloserReports() {
    try {
      const data = localStorage.getItem(STORAGE_CLOSER_REPORTS);
      const reports = data ? JSON.parse(data) : [];
      return reports.filter(r => r.closer !== 'Muller');
    } catch (e) {
      console.error('Erro ao ler relatórios dos closers', e);
      return [];
    }
  }

  function saveStoredCloserReports(reports) {
    try {
      localStorage.setItem(STORAGE_CLOSER_REPORTS, JSON.stringify(reports));
    } catch (e) {
      console.error('Erro ao salvar relatórios dos closers', e);
    }
  }

  function getStoredSdrReports() {
    try {
      const data = localStorage.getItem(STORAGE_SDR_REPORTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Erro ao ler relatórios dos SDRs', e);
      return [];
    }
  }

  function saveStoredSdrReports(reports) {
    try {
      localStorage.setItem(STORAGE_SDR_REPORTS, JSON.stringify(reports));
    } catch (e) {
      console.error('Erro ao salvar relatórios dos SDRs', e);
    }
  }

  function getMonthlyGoal() {
    const val = localStorage.getItem(STORAGE_GOAL);
    return val ? parseFloat(val) : 100000;
  }

  function getMoneyOnTable() {
    const val = localStorage.getItem(STORAGE_MONEY_TABLE);
    return val ? parseFloat(val) : 45000;
  }

  function getPipelineWinRate() {
    const val = localStorage.getItem(STORAGE_WIN_RATE);
    return val ? parseFloat(val) : 30;
  }

  // ============================================================
  // SPA VIEW SWITCHER (Alternância de telas sem reload)
  // ============================================================
  function showView(viewId) {
    if (!views[viewId]) return;

    currentView = viewId;

    // Atualiza classes ativas nas seções de view
    Object.keys(views).forEach(key => {
      if (key === viewId) {
        views[key].classList.add('active');
      } else {
        views[key].classList.remove('active');
      }
    });

    // Atualiza links da sidebar
    Object.keys(navLinks).forEach(key => {
      if (navLinks[key]) {
        if (key === viewId) {
          navLinks[key].classList.add('active');
        } else {
          navLinks[key].classList.remove('active');
        }
      }
    });

    // Hash da URL
    const hash = viewId.replace('view-', '');
    if (window.location.hash !== `#${hash}`) {
      window.history.replaceState(null, '', `#${hash}`);
    }

    // Scroll para o topo
    const mainCanvas = document.querySelector('.main-canvas');
    if (mainCanvas) mainCanvas.scrollTop = 0;

    // Recalcula conforme a visão
    if (viewId === 'view-dashboard') {
      updateExecDashboard();
    } else if (viewId === 'view-sdrs') {
      loadSdrDayData();
      renderSdrHistory();
    } else if (viewId === 'view-closers') {
      loadDayData();
    } else if (viewId === 'view-history') {
      renderConsolidatedHistory();
    }
  }

  // Event Listeners de Navegação da Sidebar
  Object.keys(navLinks).forEach(viewId => {
    if (navLinks[viewId]) {
      navLinks[viewId].addEventListener('click', (e) => {
        e.preventDefault();
        showView(viewId);
      });
    }
  });

  // Atalhos de navegação no Dashboard
  if (btnQuickGotoSdr) {
    btnQuickGotoSdr.addEventListener('click', () => showView('view-sdrs'));
  }
  if (btnQuickGotoCloser) {
    btnQuickGotoCloser.addEventListener('click', () => showView('view-closers'));
  }
  if (bannerGoSdr) {
    bannerGoSdr.addEventListener('click', () => showView('view-sdrs'));
  }
  if (bannerGoCloser) {
    bannerGoCloser.addEventListener('click', () => showView('view-closers'));
  }
  if (btnSdrToDashboard) {
    btnSdrToDashboard.addEventListener('click', () => showView('view-dashboard'));
  }
  if (btnCloserToDashboard) {
    btnCloserToDashboard.addEventListener('click', () => showView('view-dashboard'));
  }

  // ============================================================
  // DASHBOARD EXECUTIVO GERAL • CÁLCULOS, ANDAMENTO & PROJEÇÃO
  // ============================================================
  function updateExecDashboard() {
    const goal = getMonthlyGoal();
    const tableMoney = getMoneyOnTable();
    const winRate = getPipelineWinRate();

    // Dias do mês
    const totalDaysInMonth = new Date(yyyy, today.getMonth() + 1, 0).getDate();
    const passedDays = Math.max(1, today.getDate());
    const remainingDays = Math.max(0, totalDaysInMonth - passedDays);
    const timeElapsedPct = Math.round((passedDays / totalDaysInMonth) * 100);

    // Carrega registros do mês corrente
    const closerReports = getStoredCloserReports();
    const sdrReports = getStoredSdrReports();

    const monthCloserReports = closerReports.filter(r => (r.date || '').startsWith(currentMonthKey));
    const monthSdrReports = sdrReports.filter(r => (r.date || '').startsWith(currentMonthKey));

    // Totais de Closers
    let totalRevenue = 0;
    let totalContracts = 0;
    let totalContractCount = 0;
    let totalSales = 0;
    let totalMeetingsHeld = 0;
    let totalMeetingsScheduled = 0;
    let totalCloserLeads = 0;
    let totalCloserEffort = 0;

    monthCloserReports.forEach(r => {
      const cash = parseMoneyToNumber(r.cashCollected);
      const contract = parseMoneyToNumber(r.contractVal);
      const sales = parseInt(r.sales, 10) || 0;

      totalRevenue += cash;
      totalContracts += contract;
      if (contract > 0) totalContractCount += 1;
      totalSales += sales;
      totalMeetingsHeld += parseInt(r.meetingsHeld, 10) || 0;
      totalMeetingsScheduled += parseInt(r.meetingsScheduled, 10) || 0;
      totalCloserLeads += parseInt(r.leads, 10) || 0;
      totalCloserEffort += (parseInt(r.followups, 10) || 0) + (parseInt(r.prospeccoes, 10) || 0);
    });

    // Totais de SDRs
    let totalSdrLeads = 0;
    let totalSdrContacts = 0;
    let totalSdrScheduled = 0;
    let totalSdrPipeline = 0;

    monthSdrReports.forEach(r => {
      totalSdrLeads += parseInt(r.leads, 10) || 0;
      totalSdrContacts += parseInt(r.contacts, 10) || 0;
      totalSdrScheduled += parseInt(r.scheduled, 10) || 0;
      totalSdrPipeline += parseMoneyToNumber(r.pipeline);
    });

    // Adiciona o pipeline gerado pelos SDRs ao dinheiro na mesa se aplicável
    const effectiveTableMoney = tableMoney + (totalSdrPipeline > 0 ? totalSdrPipeline * 0.5 : 0);

    // Cálculos de Projeção & Run-Rate
    const dailyPace = passedDays > 0 ? (totalRevenue / passedDays) : 0;
    const runRateTotal = dailyPace * totalDaysInMonth;
    const tableForecastBonus = effectiveTableMoney * (winRate / 100);
    const projectedTotal = totalRevenue + (dailyPace * remainingDays) + tableForecastBonus;

    const goalPct = goal > 0 ? Math.round((totalRevenue / goal) * 100) : 0;
    const projectionGoalPct = goal > 0 ? Math.round((projectedTotal / goal) * 100) : 0;
    const goalGap = Math.max(0, goal - totalRevenue);
    const requiredDailyPace = remainingDays > 0 ? (goalGap / remainingDays) : 0;

    // Atualização dos 4 Cards Executivos Superiores
    if (execRevenueTotal) execRevenueTotal.textContent = formatNumberToMoney(totalRevenue);
    if (execRevenuePct) execRevenuePct.textContent = `${goalPct}% da meta`;
    if (execRevenueSalesCount) execRevenueSalesCount.textContent = `${totalSales} vendas fechadas`;

    if (execContractsTotal) execContractsTotal.textContent = formatNumberToMoney(totalContracts);
    if (execContractsCount) execContractsCount.textContent = `${totalContractCount} emitido(s)`;
    if (execContractsAvg) {
      const avg = totalContractCount > 0 ? (totalContracts / totalContractCount) : 0;
      execContractsAvg.textContent = `Ticket médio: ${formatNumberToMoney(avg)}`;
    }

    if (execMoneyOnTable) execMoneyOnTable.textContent = formatNumberToMoney(effectiveTableMoney);
    if (execProjectionTotal) execProjectionTotal.textContent = formatNumberToMoney(projectedTotal);
    if (execProjectionMetaPct) execProjectionMetaPct.textContent = `${projectionGoalPct}% da meta esperada`;

    // Atualização da Barra de Pacing
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const currentMonthName = monthNames[today.getMonth()] || 'Mês';

    if (execMonthDisplay) execMonthDisplay.textContent = `${currentMonthName} • ${yyyy}`;
    if (execGoalLabel) execGoalLabel.textContent = formatNumberToMoney(goal);
    if (execTimeElapsedLabel) execTimeElapsedLabel.textContent = `${timeElapsedPct}% (Dia ${passedDays} de ${totalDaysInMonth})`;
    if (execMetaElapsedLabel) execMetaElapsedLabel.textContent = `${goalPct}% (${formatNumberToMoney(totalRevenue)})`;

    if (pacingBarTime) pacingBarTime.style.width = `${Math.min(100, timeElapsedPct)}%`;
    if (pacingPinTime) pacingPinTime.style.left = `${Math.min(100, timeElapsedPct)}%`;
    if (pacingBarMoney) pacingBarMoney.style.width = `${Math.min(100, goalPct)}%`;
    if (pinDayNum) pinDayNum.textContent = passedDays;

    // Status do Ritmo (Pacing)
    const pacingDiff = goalPct - timeElapsedPct;
    if (execPacingPill && execPacingStatusText) {
      if (pacingDiff >= 0) {
        execPacingPill.className = 'pacing-status-pill';
        execPacingStatusText.textContent = `⚡ Ritmo Excelente (+${pacingDiff}% adiantado)`;
      } else if (pacingDiff >= -15) {
        execPacingPill.className = 'pacing-status-pill warning';
        execPacingStatusText.textContent = `⚠️ Pacing Moderado (${Math.abs(pacingDiff)}% abaixo da data)`;
      } else {
        execPacingPill.className = 'pacing-status-pill warning';
        execPacingStatusText.textContent = `⚠️ Atenção Comercial: Acelerar Fechamento`;
      }
    }

    if (statDaysPassed) statDaysPassed.textContent = `${passedDays} dias`;
    if (statDaysRemaining) statDaysRemaining.textContent = `${remainingDays} dias restantes`;
    if (statCurrentDailyPace) statCurrentDailyPace.textContent = `${formatNumberToMoney(dailyPace)} / dia`;
    if (statRequiredDailyPace) statRequiredDailyPace.textContent = `${formatNumberToMoney(requiredDailyPace)} / dia`;
    if (statGoalGap) statGoalGap.textContent = formatNumberToMoney(goalGap);

    // Atualização do Funil Comercial Consolidado
    const grandLeads = Math.max(totalSdrLeads, totalCloserLeads, 1);
    const grandContacts = Math.max(totalSdrContacts, totalCloserEffort, 1);
    const grandScheduled = Math.max(totalSdrScheduled, totalMeetingsScheduled);
    const grandHeld = totalMeetingsHeld;
    const grandSales = totalSales;

    if (funnelLeadsVal) funnelLeadsVal.textContent = grandLeads;
    if (funnelContactsVal) funnelContactsVal.textContent = grandContacts;
    if (funnelScheduledVal) funnelScheduledVal.textContent = grandScheduled;
    if (funnelHeldVal) funnelHeldVal.textContent = grandHeld;
    if (funnelSalesVal) funnelSalesVal.textContent = grandSales;
    if (funnelTotalCashSub) funnelTotalCashSub.textContent = formatNumberToMoney(totalRevenue);

    if (funnelConvContact) {
      const rate = grandLeads > 0 ? Math.round((grandContacts / grandLeads) * 100) : 0;
      funnelConvContact.textContent = `${rate}%`;
    }
    if (funnelConvSchedule) {
      const rate = grandContacts > 0 ? Math.round((grandScheduled / grandContacts) * 100) : 0;
      funnelConvSchedule.textContent = `${rate}%`;
    }
    if (funnelConvHeld) {
      const rate = grandScheduled > 0 ? Math.round((grandHeld / grandScheduled) * 100) : 0;
      funnelConvHeld.textContent = `${rate}%`;
    }
    if (funnelConvSales) {
      const rate = grandHeld > 0 ? Math.round((grandSales / grandHeld) * 100) : 0;
      funnelConvSales.textContent = `${rate}%`;
    }

    renderExecRankingTable(monthCloserReports, monthSdrReports);
  }

  // Tabela de Ranking Executivo da Equipe
  function renderExecRankingTable(closerReports, sdrReports) {
    if (!execRankingTableBody) return;
    execRankingTableBody.innerHTML = '';

    // Agrega Closers
    const closerData = {};
    closersList.forEach(c => {
      closerData[c] = { name: c, role: 'Closer', effort: 0, scheduled: 0, held: 0, sales: 0, contracts: 0, cash: 0 };
    });

    closerReports.forEach(r => {
      if (closerData[r.closer]) {
        closerData[r.closer].effort += (parseInt(r.followups, 10) || 0) + (parseInt(r.prospeccoes, 10) || 0);
        closerData[r.closer].scheduled += parseInt(r.meetingsScheduled, 10) || 0;
        closerData[r.closer].held += parseInt(r.meetingsHeld, 10) || 0;
        closerData[r.closer].sales += parseInt(r.sales, 10) || 0;
        closerData[r.closer].contracts += parseMoneyToNumber(r.contractVal);
        closerData[r.closer].cash += parseMoneyToNumber(r.cashCollected);
      }
    });

    // Agrega SDRs
    const sdrData = {};
    sdrsList.forEach(s => {
      sdrData[s] = { name: s, role: 'SDR', effort: 0, scheduled: 0, held: 0, sales: 0, contracts: 0, cash: 0, pipeline: 0 };
    });

    sdrReports.forEach(r => {
      if (sdrData[r.sdr]) {
        sdrData[r.sdr].effort += parseInt(r.contacts, 10) || 0;
        sdrData[r.sdr].scheduled += parseInt(r.scheduled, 10) || 0;
        sdrData[r.sdr].pipeline += parseMoneyToNumber(r.pipeline);
      }
    });

    const members = [...Object.values(closerData), ...Object.values(sdrData)];
    members.sort((a, b) => b.cash - a.cash || b.sales - a.sales || b.scheduled - a.scheduled);

    members.forEach(m => {
      const tr = document.createElement('tr');
      const isCloser = m.role === 'Closer';
      const convRate = isCloser 
        ? (m.held > 0 ? Math.round((m.sales / m.held) * 100) : 0)
        : (m.effort > 0 ? Math.round((m.scheduled / m.effort) * 100) : 0);

      tr.innerHTML = `
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="chip-avatar" style="width:26px; height:26px; font-size:11px; background:${isCloser ? 'rgba(98, 230, 36, 0.2)' : 'rgba(56, 189, 248, 0.2)'}; color:${isCloser ? 'var(--accent-lime)' : '#38bdf8'};">${m.name.charAt(0)}</span>
            <strong style="color:var(--text-dark);">${m.name}</strong>
          </div>
        </td>
        <td>
          <span style="font-size:11px; font-weight:700; padding:2px 8px; border-radius:10px; background:${isCloser ? '#f4f5f6' : 'rgba(56, 189, 248, 0.1)'}; color:${isCloser ? 'var(--text-dark)' : '#0284c7'};">${m.role}</span>
        </td>
        <td style="text-align: center;">${m.effort}</td>
        <td style="text-align: center;">${isCloser ? `${m.scheduled} / ${m.held}` : `${m.scheduled} agend.`}</td>
        <td style="text-align: center;">
          <span style="font-weight:700; color:${convRate > 0 ? '#10b981' : 'var(--text-secondary)'};">${convRate}%</span>
        </td>
        <td style="text-align: center;">
          <span style="font-weight:800; color:${m.sales > 0 ? 'var(--text-dark)' : 'var(--text-secondary)'};">${isCloser ? m.sales : '—'}</span>
        </td>
        <td style="text-align: right;">${isCloser ? formatNumberToMoney(m.contracts) : '—'}</td>
        <td style="text-align: right;">
          <strong style="color:${isCloser ? '#10b981' : '#38bdf8'};">${isCloser ? formatNumberToMoney(m.cash) : formatNumberToMoney(m.pipeline)}</strong>
        </td>
      `;
      execRankingTableBody.appendChild(tr);
    });
  }

  // ============================================================
  // HUB DOS SDRs • LÓGICA & EMISSÃO DE PDF A4
  // ============================================================
  function selectSdr(sdrName) {
    currentSdr = sdrName;

    sdrSegmentedBtns.forEach(btn => {
      if (btn.dataset.sdr === sdrName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (headerSdrName) headerSdrName.textContent = sdrName;
    loadSdrDayData();
  }

  sdrSegmentedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectSdr(btn.dataset.sdr);
    });
  });

  if (sdrReportDate) {
    sdrReportDate.addEventListener('change', () => {
      loadSdrDayData();
    });
  }

  function updateSdrDashboard() {
    const leads = Math.max(0, parseInt(inputSdrLeads.value, 10) || 0);
    const calls = Math.max(0, parseInt(inputSdrCalls.value, 10) || 0);
    const whatsapp = Math.max(0, parseInt(inputSdrWhatsapp.value, 10) || 0);
    const contacts = Math.max(0, parseInt(inputSdrContacts.value, 10) || 0);
    const scheduled = Math.max(0, parseInt(inputSdrScheduled.value, 10) || 0);
    const qualified = Math.max(0, parseInt(inputSdrQualified.value, 10) || 0);
    const formattedPipeline = formatMoneyString(inputSdrPipeline.value);

    const contactRate = leads > 0 ? Math.min(100, Math.round((contacts / leads) * 100)) : 0;
    const scheduleRate = contacts > 0 ? Math.min(100, Math.round((scheduled / contacts) * 100)) : 0;
    const totalActivities = calls + whatsapp + contacts;

    if (sdrKpiScheduled) sdrKpiScheduled.textContent = scheduled;
    if (sdrKpiQualifiedSub) sdrKpiQualifiedSub.textContent = `${qualified} qualificada(s)`;
    if (sdrKpiContacts) sdrKpiContacts.textContent = contacts;
    if (sdrKpiContactRate) sdrKpiContactRate.textContent = `${contactRate}% conexão`;
    if (sdrKpiPipeline) sdrKpiPipeline.textContent = formattedPipeline;

    if (sdrBubbleScheduleRate) sdrBubbleScheduleRate.textContent = `${scheduleRate}%`;
    if (sdrBubbleContactRate) sdrBubbleContactRate.textContent = `${contactRate}%`;
    if (sdrBubbleEffort) sdrBubbleEffort.textContent = totalActivities;
  }

  [inputSdrLeads, inputSdrCalls, inputSdrWhatsapp, inputSdrContacts, inputSdrScheduled, inputSdrQualified, inputSdrNoshow, inputSdrPipeline].forEach(input => {
    if (input) {
      input.addEventListener('input', updateSdrDashboard);
    }
  });

  function loadSdrDayData() {
    const selectedDate = sdrReportDate ? sdrReportDate.value : formattedToday;
    const reports = getStoredSdrReports();
    const entry = reports.find(r => r.sdr === currentSdr && r.date === selectedDate);

    if (entry) {
      inputSdrLeads.value = entry.leads ?? 0;
      inputSdrCalls.value = entry.calls ?? 0;
      inputSdrWhatsapp.value = entry.whatsapp ?? 0;
      inputSdrContacts.value = entry.contacts ?? 0;
      inputSdrScheduled.value = entry.scheduled ?? 0;
      inputSdrQualified.value = entry.qualified ?? 0;
      inputSdrNoshow.value = entry.noshow ?? 0;
      inputSdrPipeline.value = formatMoneyString(entry.pipeline);
      if (inputSdrNameCustom) inputSdrNameCustom.value = entry.customName || '';
    } else {
      inputSdrLeads.value = 0;
      inputSdrCalls.value = 0;
      inputSdrWhatsapp.value = 0;
      inputSdrContacts.value = 0;
      inputSdrScheduled.value = 0;
      inputSdrQualified.value = 0;
      inputSdrNoshow.value = 0;
      inputSdrPipeline.value = 'R$ 0,00';
      if (inputSdrNameCustom) inputSdrNameCustom.value = '';
    }

    updateSdrDashboard();
  }

  function saveSdrReport(showFeedback = true) {
    const selectedDate = sdrReportDate ? sdrReportDate.value : formattedToday;
    const customName = inputSdrNameCustom ? inputSdrNameCustom.value.trim() : '';

    const newRecord = {
      id: `${currentSdr}_${selectedDate}`,
      sdr: currentSdr,
      customName: customName,
      date: selectedDate,
      leads: parseInt(inputSdrLeads.value, 10) || 0,
      calls: parseInt(inputSdrCalls.value, 10) || 0,
      whatsapp: parseInt(inputSdrWhatsapp.value, 10) || 0,
      contacts: parseInt(inputSdrContacts.value, 10) || 0,
      scheduled: parseInt(inputSdrScheduled.value, 10) || 0,
      qualified: parseInt(inputSdrQualified.value, 10) || 0,
      noshow: parseInt(inputSdrNoshow.value, 10) || 0,
      pipeline: formatMoneyString(inputSdrPipeline.value),
      updatedAt: new Date().toISOString()
    };

    let reports = getStoredSdrReports();
    const existingIndex = reports.findIndex(r => r.id === newRecord.id);

    if (existingIndex >= 0) {
      reports[existingIndex] = newRecord;
    } else {
      reports.unshift(newRecord);
    }

    saveStoredSdrReports(reports);
    renderSdrHistory();
    updateExecDashboard();

    if (showFeedback) {
      showToast(`Relatório de ${currentSdr} salvo com sucesso!`);
    }
  }

  if (btnSaveSdrReport) {
    btnSaveSdrReport.addEventListener('click', () => saveSdrReport(true));
  }

  if (btnResetSdrForm) {
    btnResetSdrForm.addEventListener('click', () => {
      inputSdrLeads.value = 0;
      inputSdrCalls.value = 0;
      inputSdrWhatsapp.value = 0;
      inputSdrContacts.value = 0;
      inputSdrScheduled.value = 0;
      inputSdrQualified.value = 0;
      inputSdrNoshow.value = 0;
      inputSdrPipeline.value = 'R$ 0,00';
      if (inputSdrNameCustom) inputSdrNameCustom.value = '';
      updateSdrDashboard();
      showToast('Campos do SDR resetados.');
    });
  }

  function renderSdrHistory() {
    if (!sdrHistoryTableBody) return;
    const reports = getStoredSdrReports();
    sdrHistoryTableBody.innerHTML = '';

    if (reports.length === 0) {
      sdrHistoryTableBody.innerHTML = `
        <tr>
          <td colspan="11" style="text-align:center; padding: 24px; color: var(--text-secondary);">
            Nenhum relatório de SDR salvo no histórico ainda.
          </td>
        </tr>
      `;
      return;
    }

    reports.forEach(r => {
      const contactRate = r.leads > 0 ? Math.round((r.contacts / r.leads) * 100) : 0;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${formatDateBR(r.date)}</strong></td>
        <td><span style="font-weight:700; color:var(--text-dark);">${r.customName ? `${r.customName} (${r.sdr})` : r.sdr}</span></td>
        <td>${r.leads}</td>
        <td>${r.calls}</td>
        <td>${r.whatsapp}</td>
        <td><strong>${r.contacts}</strong></td>
        <td><span class="tbl-pill-badge">${contactRate}%</span></td>
        <td><strong style="color:#10b981;">${r.scheduled}</strong></td>
        <td>${r.qualified}</td>
        <td><strong style="color:var(--text-dark);">${r.pipeline}</strong></td>
        <td>
          <button type="button" class="btn-uifry-sec btn-load-sdr-entry" data-sdr="${r.sdr}" data-date="${r.date}" style="padding: 4px 8px; font-size: 11px;">
            Carregar
          </button>
        </td>
      `;
      sdrHistoryTableBody.appendChild(tr);
    });

    document.querySelectorAll('.btn-load-sdr-entry').forEach(btn => {
      btn.addEventListener('click', () => {
        const s = btn.dataset.sdr;
        const d = btn.dataset.date;
        if (sdrReportDate) sdrReportDate.value = d;
        selectSdr(s);
        showToast(`Registro de ${s} (${formatDateBR(d)}) carregado!`);
      });
    });
  }

  // Geração de PDF do SDR em formato A4 perfeito
  if (btnGenerateSdrPdf) {
    btnGenerateSdrPdf.addEventListener('click', () => {
      saveSdrReport(false);

      const selectedDate = sdrReportDate ? sdrReportDate.value : formattedToday;
      const displayName = inputSdrNameCustom && inputSdrNameCustom.value.trim() 
        ? inputSdrNameCustom.value.trim().toUpperCase() 
        : currentSdr.toUpperCase();

      const leads = parseInt(inputSdrLeads.value, 10) || 0;
      const calls = parseInt(inputSdrCalls.value, 10) || 0;
      const whatsapp = parseInt(inputSdrWhatsapp.value, 10) || 0;
      const contacts = parseInt(inputSdrContacts.value, 10) || 0;
      const scheduled = parseInt(inputSdrScheduled.value, 10) || 0;
      const qualified = parseInt(inputSdrQualified.value, 10) || 0;
      const noshow = parseInt(inputSdrNoshow.value, 10) || 0;
      const pipeline = formatMoneyString(inputSdrPipeline.value);

      const contactRate = leads > 0 ? Math.round((contacts / leads) * 100) : 0;
      const scheduleRate = contacts > 0 ? Math.round((scheduled / contacts) * 100) : 0;

      if (printSdrName) printSdrName.innerHTML = `SDR: <strong>${displayName}</strong>`;
      if (printSdrDate) printSdrDate.innerHTML = `Data: <strong>${formatDateBR(selectedDate)}</strong>`;

      if (printSdrBodyContent) {
        printSdrBodyContent.innerHTML = `
          <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 12px;">
            <div style="background:#0f1422; border:1px solid #1a2336; padding:12px; border-radius:8px;">
              <span style="font-size:10px; color:#8da2bd; text-transform:uppercase; font-weight:800;">REUNIÕES AGENDADAS</span>
              <div style="font-size:24px; font-weight:800; color:var(--accent-lime); font-family:var(--font-mono);">${scheduled}</div>
              <span style="font-size:10px; color:#cbd5e1;">${qualified} qualificadas no ICP</span>
            </div>
            <div style="background:#0f1422; border:1px solid #1a2336; padding:12px; border-radius:8px;">
              <span style="font-size:10px; color:#8da2bd; text-transform:uppercase; font-weight:800;">CONTATOS EFETIVOS</span>
              <div style="font-size:24px; font-weight:800; color:#ffffff; font-family:var(--font-mono);">${contacts}</div>
              <span style="font-size:10px; color:#cbd5e1;">${contactRate}% de conexão</span>
            </div>
            <div style="background:#0f1422; border:1px solid #1a2336; padding:12px; border-radius:8px;">
              <span style="font-size:10px; color:#8da2bd; text-transform:uppercase; font-weight:800;">TX. AGENDAMENTO</span>
              <div style="font-size:24px; font-weight:800; color:var(--accent-lime); font-family:var(--font-mono);">${scheduleRate}%</div>
              <span style="font-size:10px; color:#cbd5e1;">Agendadas / Conexões</span>
            </div>
            <div style="background:#0f1422; border:1px solid #1a2336; padding:12px; border-radius:8px;">
              <span style="font-size:10px; color:#8da2bd; text-transform:uppercase; font-weight:800;">PIPELINE GERADO</span>
              <div style="font-size:22px; font-weight:800; color:#ffffff; font-family:var(--font-mono);">${pipeline}</div>
              <span style="font-size:10px; color:#8da2bd;">Encaminhado aos Closers</span>
            </div>
          </div>

          <div style="background:#0f1422; border:1px solid #1a2336; padding:16px; border-radius:8px; margin-bottom: 12px;">
            <span style="font-size:11px; font-weight:800; color:var(--accent-lime); letter-spacing:0.8px; text-transform:uppercase;">01 • ESFORÇO & VOLUME DE PROSPECÇÃO</span>
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 10px;">
              <div><span style="font-size:10px; color:#8da2bd;">LEADS ABORDADOS</span><div style="font-size:18px; font-weight:800; color:#ffffff;">${leads}</div></div>
              <div><span style="font-size:10px; color:#8da2bd;">LIGAÇÕES FEITAS</span><div style="font-size:18px; font-weight:800; color:#ffffff;">${calls}</div></div>
              <div><span style="font-size:10px; color:#8da2bd;">MENSAGENS WHATSAPP</span><div style="font-size:18px; font-weight:800; color:#ffffff;">${whatsapp}</div></div>
            </div>
          </div>

          <div style="background:#0f1422; border:1px solid #1a2336; padding:16px; border-radius:8px;">
            <span style="font-size:11px; font-weight:800; color:var(--accent-lime); letter-spacing:0.8px; text-transform:uppercase;">02 • CONVERSÃO & QUALIFICAÇÃO</span>
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 10px;">
              <div><span style="font-size:10px; color:#8da2bd;">REUNIÕES AGENDADAS</span><div style="font-size:18px; font-weight:800; color:var(--accent-lime);">${scheduled}</div></div>
              <div><span style="font-size:10px; color:#8da2bd;">REUNIÕES QUALIFICADAS</span><div style="font-size:18px; font-weight:800; color:#ffffff;">${qualified}</div></div>
              <div><span style="font-size:10px; color:#8da2bd;">NO-SHOWS (FALTAS)</span><div style="font-size:18px; font-weight:800; color:#f87171;">${noshow}</div></div>
            </div>
          </div>
        `;
      }

      document.body.classList.add('print-mode-sdr');

      const cleanupSdrPrint = () => {
        document.body.classList.remove('print-mode-sdr');
        window.removeEventListener('afterprint', cleanupSdrPrint);
      };
      window.addEventListener('afterprint', cleanupSdrPrint);

      setTimeout(() => {
        window.print();
        setTimeout(() => document.body.classList.remove('print-mode-sdr'), 1500);
      }, 100);
    });
  }

  // ============================================================
  // HUB DOS CLOSERS • LÓGICA & EMISSÃO DE PDF A4
  // ============================================================
  function selectCloser(closerName) {
    currentCloser = closerName;

    closerChips.forEach(chip => {
      if (chip.dataset.closer === closerName) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    closerSegmentedBtns.forEach(btn => {
      if (btn.dataset.closer === closerName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (headerCloserName) headerCloserName.textContent = closerName;
    if (btnPdfLabel) btnPdfLabel.textContent = `GERAR RELATÓRIO DE ${closerName.toUpperCase()} (PDF)`;
    if (printCloserName) printCloserName.innerHTML = `Nome: <strong>${closerName.toUpperCase()}</strong>`;

    loadDayData();
  }

  closerChips.forEach(chip => {
    chip.addEventListener('click', () => {
      showView('view-closers');
      selectCloser(chip.dataset.closer);
    });
  });

  closerSegmentedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectCloser(btn.dataset.closer);
    });
  });

  function updateCloserDashboard() {
    const leads = Math.max(0, parseInt(inputLeads.value, 10) || 0);
    const followups = Math.max(0, parseInt(inputFollowups.value, 10) || 0);
    const prospeccoes = Math.max(0, parseInt(inputProspeccoes.value, 10) || 0);
    const scheduled = Math.max(0, parseInt(inputMeetingsScheduled.value, 10) || 0);
    const held = Math.max(0, parseInt(inputMeetingsHeld.value, 10) || 0);
    const sales = Math.max(0, parseInt(inputSales.value, 10) || 0);

    const formattedContract = formatMoneyString(inputContractVal.value);
    const formattedCash = formatMoneyString(inputCashCollected.value);
    const totalEffort = followups + prospeccoes;

    if (kpiSalesNum) kpiSalesNum.textContent = `${sales} un`;
    if (kpiSalesSub) kpiSalesSub.textContent = `${sales} nova(s)`;
    if (kpiContractNum) kpiContractNum.textContent = formattedContract;
    if (kpiCashNum) kpiCashNum.textContent = formattedCash;

    const attendanceRate = scheduled > 0 ? Math.min(100, Math.round((held / scheduled) * 100)) : (held > 0 ? 100 : 0);
    const conversionRate = held > 0 ? Math.min(100, Math.round((sales / held) * 100)) : (sales > 0 ? 100 : 0);

    if (bubbleConversionRate) bubbleConversionRate.textContent = `${conversionRate}%`;
    if (bubbleAttendanceRate) bubbleAttendanceRate.textContent = `${attendanceRate}%`;
    if (bubbleEffortTotal) bubbleEffortTotal.textContent = totalEffort;

    if (compBarSales) {
      const salesPct = Math.min(100, sales > 0 ? Math.max(25, sales * 33) : 10);
      compBarSales.style.width = `${salesPct}%`;
    }
    if (compBarMeetings) {
      const meetPct = scheduled > 0 ? Math.min(100, Math.max(20, (held / scheduled) * 100)) : 15;
      compBarMeetings.style.width = `${meetPct}%`;
    }

    const selectedDate = dateInput ? dateInput.value : formattedToday;
    if (printReportDate) printReportDate.innerHTML = `Data: <strong>${formatDateBR(selectedDate)}</strong>`;

    [inputLeads, inputFollowups, inputProspeccoes, inputMeetingsScheduled, inputMeetingsHeld, inputSales, inputContractVal, inputCashCollected].forEach(input => {
      if (input) input.setAttribute('value', input.value);
    });
  }

  [inputLeads, inputFollowups, inputProspeccoes, inputMeetingsScheduled, inputMeetingsHeld, inputSales, inputContractVal, inputCashCollected].forEach(input => {
    if (input) {
      input.addEventListener('input', updateCloserDashboard);
    }
  });

  if (dateInput) {
    dateInput.addEventListener('change', () => {
      loadDayData();
    });
  }

  function loadDayData() {
    const selectedDate = dateInput ? dateInput.value : formattedToday;
    const reports = getStoredCloserReports();
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

    updateCloserDashboard();
  }

  function saveCurrentReport(showFeedback = true) {
    const selectedDate = dateInput ? dateInput.value : formattedToday;

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

    let reports = getStoredCloserReports();
    const existingIndex = reports.findIndex(r => r.id === newRecord.id);

    if (existingIndex >= 0) {
      reports[existingIndex] = newRecord;
    } else {
      reports.unshift(newRecord);
    }

    saveStoredCloserReports(reports);
    updateExecDashboard();

    if (showFeedback) {
      showToast(`Métricas de ${currentCloser} salvas no histórico!`);
    }
  }

  if (btnSaveLog) {
    btnSaveLog.addEventListener('click', () => saveCurrentReport(true));
  }

  if (btnResetForm) {
    btnResetForm.addEventListener('click', () => {
      inputLeads.value = 0;
      inputFollowups.value = 0;
      inputProspeccoes.value = 0;
      inputMeetingsScheduled.value = 0;
      inputMeetingsHeld.value = 0;
      inputSales.value = 0;
      inputContractVal.value = 'R$ 0,00';
      inputCashCollected.value = 'R$ 0,00';
      updateCloserDashboard();
      showToast('Campos do Closer resetados para zero.');
    });
  }

  // Botão Gerar Relatório do Closer em PDF
  if (btnGeneratePdf) {
    btnGeneratePdf.addEventListener('click', () => {
      saveCurrentReport(false);
      updateCloserDashboard();
      window.print();
    });
  }

  // ============================================================
  // HISTÓRICO CONSOLIDADO (Closers & SDRs)
  // ============================================================
  function renderConsolidatedHistory() {
    if (!historyTableBody) return;
    const closerReports = getStoredCloserReports();
    const sdrReports = getStoredSdrReports();

    const selectedMember = historyFilterMember ? historyFilterMember.value : 'all';
    const selectedType = historyFilterType ? historyFilterType.value : 'all';

    let allEntries = [];

    if (selectedType === 'all' || selectedType === 'closer') {
      closerReports.forEach(r => {
        allEntries.push({
          date: r.date,
          name: r.closer,
          role: 'Closer',
          leads: r.leads,
          followups: (parseInt(r.followups, 10) || 0) + (parseInt(r.prospeccoes, 10) || 0),
          scheduled: r.meetingsScheduled,
          held: r.meetingsHeld,
          sales: r.sales,
          contracts: r.contractVal,
          cash: r.cashCollected,
          type: 'closer'
        });
      });
    }

    if (selectedType === 'all' || selectedType === 'sdr') {
      sdrReports.forEach(r => {
        allEntries.push({
          date: r.date,
          name: r.customName ? `${r.customName} (${r.sdr})` : r.sdr,
          rawSdr: r.sdr,
          role: 'SDR',
          leads: r.leads,
          followups: r.contacts,
          scheduled: r.scheduled,
          held: '—',
          sales: '—',
          contracts: '—',
          cash: r.pipeline,
          type: 'sdr'
        });
      });
    }

    // Filtro por membro
    if (selectedMember !== 'all') {
      allEntries = allEntries.filter(e => e.name.includes(selectedMember) || e.rawSdr === selectedMember);
    }

    allEntries.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    if (historyTotalCount) {
      historyTotalCount.textContent = `${allEntries.length} registro(s)`;
    }

    historyTableBody.innerHTML = '';

    if (allEntries.length === 0) {
      historyTableBody.innerHTML = `
        <tr>
          <td colspan="11" style="text-align:center; padding: 28px; color: var(--text-secondary);">
            Nenhum registro encontrado com os filtros selecionados.
          </td>
        </tr>
      `;
      return;
    }

    allEntries.forEach(entry => {
      const isCloser = entry.type === 'closer';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${formatDateBR(entry.date)}</strong></td>
        <td><strong style="color:var(--text-dark);">${entry.name}</strong></td>
        <td>
          <span style="font-size:11px; font-weight:700; padding:2px 8px; border-radius:10px; background:${isCloser ? '#f4f5f6' : 'rgba(56, 189, 248, 0.1)'}; color:${isCloser ? 'var(--text-dark)' : '#0284c7'};">
            ${entry.role}
          </span>
        </td>
        <td>${entry.leads}</td>
        <td>${entry.followups}</td>
        <td>${entry.scheduled}</td>
        <td>${entry.held}</td>
        <td><strong style="color:${entry.sales > 0 ? '#10b981' : 'inherit'};">${entry.sales}</strong></td>
        <td>${entry.contracts}</td>
        <td><strong style="color:${isCloser ? 'var(--text-dark)' : '#0284c7'};">${entry.cash}</strong></td>
        <td>
          <button type="button" class="btn-uifry-sec btn-quick-load-history" data-type="${entry.type}" data-name="${entry.rawSdr || entry.name}" data-date="${entry.date}" style="padding: 4px 8px; font-size: 11px;">
            Carregar
          </button>
        </td>
      `;
      historyTableBody.appendChild(tr);
    });

    document.querySelectorAll('.btn-quick-load-history').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        const name = btn.dataset.name;
        const d = btn.dataset.date;

        if (type === 'closer') {
          showView('view-closers');
          if (dateInput) dateInput.value = d;
          selectCloser(name);
        } else {
          showView('view-sdrs');
          if (sdrReportDate) sdrReportDate.value = d;
          selectSdr(name);
        }
        showToast(`Registro de ${name} (${formatDateBR(d)}) carregado!`);
      });
    });
  }

  if (historyFilterMember) {
    historyFilterMember.addEventListener('change', renderConsolidatedHistory);
  }
  if (historyFilterType) {
    historyFilterType.addEventListener('change', renderConsolidatedHistory);
  }

  // Exportar CSV Consolidado
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      const closerReports = getStoredCloserReports();
      const sdrReports = getStoredSdrReports();

      let csv = 'Data,Membro,Papel,Leads,Followups_Conexoes,Reunioes_Agendadas,Reunioes_Realizadas,Vendas,Contratos,Cash_Pipeline\n';

      closerReports.forEach(r => {
        csv += `"${formatDateBR(r.date)}","${r.closer}","Closer",${r.leads ?? 0},${(parseInt(r.followups, 10) || 0) + (parseInt(r.prospeccoes, 10) || 0)},${r.meetingsScheduled ?? 0},${r.meetingsHeld ?? 0},${r.sales ?? 0},"${formatMoneyString(r.contractVal)}","${formatMoneyString(r.cashCollected)}"\n`;
      });

      sdrReports.forEach(r => {
        csv += `"${formatDateBR(r.date)}","${r.customName || r.sdr}","SDR",${r.leads ?? 0},${r.contacts ?? 0},${r.scheduled ?? 0},0,0,"R$ 0,00","${formatMoneyString(r.pipeline)}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `comercial_fa_historico_${formattedToday}.csv`;
      link.click();
      showToast('Histórico consolidado exportado em CSV!');
    });
  }

  // Limpar Histórico
  if (btnClearHistory) {
    btnClearHistory.addEventListener('click', () => {
      if (confirm('Tem certeza de que deseja apagar todo o histórico de lançamentos?')) {
        localStorage.removeItem(STORAGE_CLOSER_REPORTS);
        localStorage.removeItem(STORAGE_SDR_REPORTS);
        renderConsolidatedHistory();
        updateExecDashboard();
        showToast('Histórico apagado com sucesso.');
      }
    });
  }

  // ============================================================
  // MODAL DE CONFIGURAÇÃO DE METAS & DINHEIRO NA MESA
  // ============================================================
  function openSettingsModal() {
    if (settingMonthlyGoal) settingMonthlyGoal.value = formatNumberToMoney(getMonthlyGoal());
    if (settingMoneyTable) settingMoneyTable.value = formatNumberToMoney(getMoneyOnTable());
    if (settingCloseRate) settingCloseRate.value = getPipelineWinRate();
    if (modalSettings) modalSettings.classList.add('open');
  }

  function closeSettingsModal() {
    if (modalSettings) modalSettings.classList.remove('open');
  }

  [btnOpenSettings, btnNavQuickConfig, btnOpenGoalModal, btnEditTableMoney].forEach(btn => {
    if (btn) btn.addEventListener('click', openSettingsModal);
  });

  if (btnCloseSettings) btnCloseSettings.addEventListener('click', closeSettingsModal);
  if (btnCancelSettings) btnCancelSettings.addEventListener('click', closeSettingsModal);

  if (modalSettings) {
    modalSettings.addEventListener('click', (e) => {
      if (e.target === modalSettings) closeSettingsModal();
    });
  }

  if (btnSaveSettings) {
    btnSaveSettings.addEventListener('click', () => {
      const newGoal = parseMoneyToNumber(settingMonthlyGoal.value);
      const newMoneyTable = parseMoneyToNumber(settingMoneyTable.value);
      const newWinRate = parseFloat(settingCloseRate.value) || 30;

      localStorage.setItem(STORAGE_GOAL, newGoal.toString());
      localStorage.setItem(STORAGE_MONEY_TABLE, newMoneyTable.toString());
      localStorage.setItem(STORAGE_WIN_RATE, newWinRate.toString());

      closeSettingsModal();
      updateExecDashboard();
      showToast('Configurações de Meta e Pipeline salvas com sucesso!');
    });
  }

  // ============================================================
  // INICIALIZAÇÃO DO SISTEMA
  // ============================================================
  initializeSeedDataIfEmpty();

  // Roteamento inicial por Hash
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash === 'sdrs') {
    showView('view-sdrs');
  } else if (initialHash === 'closers') {
    showView('view-closers');
  } else if (initialHash === 'history') {
    showView('view-history');
  } else {
    showView('view-dashboard');
  }

  selectCloser('Tales');
  selectSdr('SDR 1');
});
