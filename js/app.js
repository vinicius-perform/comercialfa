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
    'view-projects': document.getElementById('view-projects'),
    'view-sdrs': document.getElementById('view-sdrs'),
    'view-closers': document.getElementById('view-closers'),
    'view-history': document.getElementById('view-history')
  };

  // Links da Sidebar
  const navLinks = {
    'view-dashboard': document.getElementById('nav-dashboard'),
    'view-projects': document.getElementById('nav-projects'),
    'view-sdrs': document.getElementById('nav-sdrs'),
    'view-closers': document.getElementById('nav-closers'),
    'view-history': document.getElementById('nav-history')
  };

  const closerChips = document.querySelectorAll('.closer-chip');

  // Botões de navegação rápida
  const btnQuickGotoSdr = document.getElementById('btn-quick-goto-sdr');
  const btnQuickGotoCloser = document.getElementById('btn-quick-goto-closer');
  const btnCopyTeamLink = document.getElementById('btn-copy-team-link');
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

  // --- FILTROS TOPBAR & CONEXÃO SUPABASE ---
  const dashFilterClient = document.getElementById('dash-filter-client');
  const dashFilterMonth = document.getElementById('dash-filter-month');
  const supabaseCloudStatus = document.getElementById('supabase-cloud-status');
  const supabaseCloudText = document.getElementById('supabase-cloud-text');
  const closerClientSelect = document.getElementById('closer-client-select');
  const sdrClientSelect = document.getElementById('sdr-client-select');

  // --- ELEMENTOS DA ABA PROJETOS & CLIENTES ---
  const btnOpenCreateClient = document.getElementById('btn-open-create-client');
  const projectsClientsContainer = document.getElementById('projects-clients-container');
  const projectsActiveCount = document.getElementById('projects-active-count');
  const pStatTotalClients = document.getElementById('p-stat-total-clients');
  const pStatPlannedRev = document.getElementById('p-stat-planned-rev');
  const pStatActualRev = document.getElementById('p-stat-actual-rev');
  const pStatAchievement = document.getElementById('p-stat-achievement');
  const projectsSearchInput = document.getElementById('projects-search-input');
  const projectsStatusTabs = document.getElementById('projects-status-tabs');

  let projectsSearchQuery = '';
  let projectsStatusFilter = 'all';

  // Modal de Cliente
  const modalClient = document.getElementById('modal-client');
  const modalClientTitle = document.getElementById('modal-client-title');
  const clientFormId = document.getElementById('client-form-id');
  const clientName = document.getElementById('client-name');
  const clientSegment = document.getElementById('client-segment');
  const clientStatus = document.getElementById('client-status');
  const btnCloseClient = document.getElementById('btn-close-client');
  const btnCancelClient = document.getElementById('btn-cancel-client');
  const btnSaveClient = document.getElementById('btn-save-client');

  // Modal de Planejamento Mensal
  const modalPlanning = document.getElementById('modal-planning');
  const planningClientId = document.getElementById('planning-client-id');
  const planningClientName = document.getElementById('planning-client-name');
  const planningClientTag = document.getElementById('planning-client-tag');
  const planningMonthPicker = document.getElementById('planning-month-picker');
  const btnCopyPrevPlan = document.getElementById('btn-copy-prev-plan');
  const planRevenueGoal = document.getElementById('plan-revenue-goal');
  const planSalesGoal = document.getElementById('plan-sales-goal');
  const planMeetingsGoal = document.getElementById('plan-meetings-goal');
  const planMoneyTable = document.getElementById('plan-money-table');
  const planNotes = document.getElementById('plan-notes');
  const planPreviewTicket = document.getElementById('plan-preview-ticket');
  const planPreviewConv = document.getElementById('plan-preview-conv');
  const planningHistoryTableBody = document.getElementById('planning-history-table-body');
  const btnClosePlanning = document.getElementById('btn-close-planning');
  const btnCancelPlanning = document.getElementById('btn-cancel-planning');
  const btnSavePlanning = document.getElementById('btn-save-planning');

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
  setupCurrencyInput(planRevenueGoal);
  setupCurrencyInput(planMoneyTable);

  // ============================================================
  // LOCAL STORAGE HELPERS
  // ============================================================
  function getStoredCloserReports() {
    try {
      const data1 = localStorage.getItem(STORAGE_CLOSER_REPORTS);
      const data2 = localStorage.getItem('closerReports_v2');
      const r1 = data1 ? JSON.parse(data1) : [];
      const r2 = data2 ? JSON.parse(data2) : [];
      
      const map = new Map();
      r1.forEach(r => map.set(r.id, r));
      r2.forEach(r => {
        const existing = map.get(r.id) || {};
        map.set(r.id, { ...existing, ...r });
      });

      return Array.from(map.values()).filter(r => r.closer !== 'Muller');
    } catch (e) {
      console.error('Erro ao ler relatórios dos closers', e);
      return [];
    }
  }

  function saveStoredCloserReports(reports) {
    try {
      localStorage.setItem(STORAGE_CLOSER_REPORTS, JSON.stringify(reports));
      localStorage.setItem('closerReports_v2', JSON.stringify(reports));

      // Sincroniza com Supabase Cloud se disponível
      if (typeof dbSyncCloserReport === 'function' && Array.isArray(reports)) {
        reports.forEach(r => dbSyncCloserReport(r));
      }
    } catch (e) {
      console.error('Erro ao salvar relatórios dos closers', e);
    }
  }

  function getStoredSdrReports() {
    try {
      const data1 = localStorage.getItem(STORAGE_SDR_REPORTS);
      const data2 = localStorage.getItem('sdrReports_v2');
      const r1 = data1 ? JSON.parse(data1) : [];
      const r2 = data2 ? JSON.parse(data2) : [];

      const map = new Map();
      r1.forEach(r => map.set(r.id, r));
      r2.forEach(r => {
        const existing = map.get(r.id) || {};
        map.set(r.id, { ...existing, ...r });
      });

      return Array.from(map.values());
    } catch (e) {
      console.error('Erro ao ler relatórios dos SDRs', e);
      return [];
    }
  }

  function saveStoredSdrReports(reports) {
    try {
      localStorage.setItem(STORAGE_SDR_REPORTS, JSON.stringify(reports));
      localStorage.setItem('sdrReports_v2', JSON.stringify(reports));

      // Sincroniza com Supabase Cloud se disponível
      if (typeof dbSyncSdrReport === 'function' && Array.isArray(reports)) {
        reports.forEach(r => dbSyncSdrReport(r));
      }
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
    } else if (viewId === 'view-projects') {
      renderProjectsView();
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
  if (btnCopyTeamLink) {
    btnCopyTeamLink.addEventListener('click', () => {
      const currentUrl = window.location.href;
      let baseUrl = currentUrl.split('#')[0];
      if (baseUrl.endsWith('index.html')) {
        baseUrl = baseUrl.substring(0, baseUrl.lastIndexOf('index.html'));
      }
      if (!baseUrl.endsWith('/')) {
        baseUrl += '/';
      }
      const teamUrl = baseUrl + 'relatorio.html';

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(teamUrl).then(() => {
          showToast('Link da equipe copiado! Envie no WhatsApp.');
        }).catch(() => {
          window.open(teamUrl, '_blank');
        });
      } else {
        window.open(teamUrl, '_blank');
      }
    });
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

  // Sincronização automática quando relatórios forem enviados pela equipe no portal relatorio.html
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_CLOSER_REPORTS || e.key === STORAGE_SDR_REPORTS) {
      updateExecDashboard();
      if (typeof renderConsolidatedHistory === 'function') {
        renderConsolidatedHistory();
      }
      showToast('Novos dados de relatório recebidos da equipe!');
    }
  });

  // ============================================================
  // DASHBOARD EXECUTIVO GERAL • CÁLCULOS, ANDAMENTO & PROJEÇÃO
  // ============================================================
  function updateExecDashboard() {
    const selectedClientId = dashFilterClient ? dashFilterClient.value : 'all';
    const selectedMonth = dashFilterMonth ? dashFilterMonth.value : currentMonthKey;

    // Extrai ano e mês selecionados
    const [selY, selM] = (selectedMonth || currentMonthKey).split('-').map(Number);
    const totalDaysInMonth = new Date(selY, selM, 0).getDate();
    const isCurrentMonth = (selectedMonth === currentMonthKey);
    const isPastMonth = (selectedMonth < currentMonthKey);

    let passedDays = 0;
    let remainingDays = 0;
    let timeElapsedPct = 0;

    if (isPastMonth) {
      passedDays = totalDaysInMonth;
      remainingDays = 0;
      timeElapsedPct = 100;
    } else if (isCurrentMonth) {
      passedDays = Math.max(1, today.getDate());
      remainingDays = Math.max(0, totalDaysInMonth - passedDays);
      timeElapsedPct = Math.round((passedDays / totalDaysInMonth) * 100);
    } else {
      passedDays = 0;
      remainingDays = totalDaysInMonth;
      timeElapsedPct = 0;
    }

    const winRate = getPipelineWinRate();

    // Carrega registros
    const closerReports = getStoredCloserReports();
    const sdrReports = getStoredSdrReports();

    let monthCloserReports = closerReports.filter(r => (r.date || '').startsWith(selectedMonth));
    let monthSdrReports = sdrReports.filter(r => (r.date || '').startsWith(selectedMonth));

    // Se filtrou por um cliente específico
    if (selectedClientId !== 'all') {
      monthCloserReports = monthCloserReports.filter(r => r.clientId === selectedClientId);
      monthSdrReports = monthSdrReports.filter(r => r.clientId === selectedClientId);
    }

    // Busca metas de planejamento para o mês e cliente selecionados
    let goal = 0;
    let tableMoney = 0;
    const plannings = JSON.parse(localStorage.getItem('projects_planning_v2') || '[]');

    if (selectedClientId !== 'all') {
      const plan = plannings.find(p => p.client_id === selectedClientId && p.year_month === selectedMonth);
      if (plan) {
        goal = Number(plan.revenue_goal) || 0;
        tableMoney = Number(plan.money_on_table) || 0;
      } else {
        goal = getMonthlyGoal();
        tableMoney = getMoneyOnTable();
      }
    } else {
      const monthPlans = plannings.filter(p => p.year_month === selectedMonth);
      if (monthPlans.length > 0) {
        goal = monthPlans.reduce((sum, p) => sum + (Number(p.revenue_goal) || 0), 0);
        tableMoney = monthPlans.reduce((sum, p) => sum + (Number(p.money_on_table) || 0), 0);
      } else {
        goal = getMonthlyGoal();
        tableMoney = getMoneyOnTable();
      }
    }

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
      totalSdrPipeline += parseMoneyToNumber(r.pipeline || r.pipelineVal);
    });

    const effectiveTableMoney = tableMoney + (totalSdrPipeline > 0 ? totalSdrPipeline * 0.5 : 0);

    // Cálculos de Projeção & Run-Rate
    const dailyPace = passedDays > 0 ? (totalRevenue / passedDays) : 0;
    let runRateTotal = 0;
    let projectedTotal = 0;
    let goalPct = goal > 0 ? Math.round((totalRevenue / goal) * 100) : 0;
    let projectionGoalPct = 0;
    let goalGap = Math.max(0, goal - totalRevenue);
    let requiredDailyPace = 0;

    if (isPastMonth) {
      runRateTotal = totalRevenue;
      projectedTotal = totalRevenue;
      projectionGoalPct = goalPct;
      requiredDailyPace = 0;
    } else {
      runRateTotal = dailyPace * totalDaysInMonth;
      const tableForecastBonus = effectiveTableMoney * (winRate / 100);
      projectedTotal = totalRevenue + (dailyPace * remainingDays) + tableForecastBonus;
      projectionGoalPct = goal > 0 ? Math.round((projectedTotal / goal) * 100) : 0;
      requiredDailyPace = remainingDays > 0 ? (goalGap / remainingDays) : 0;
    }

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
    if (execProjectionMetaPct) {
      if (isPastMonth) {
        execProjectionMetaPct.textContent = `Mês finalizado com ${goalPct}% da meta`;
      } else {
        execProjectionMetaPct.textContent = `${projectionGoalPct}% da meta esperada`;
      }
    }

    // Atualização da Barra de Pacing
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const selectedMonthName = monthNames[selM - 1] || 'Mês';

    if (execMonthDisplay) {
      if (selectedClientId !== 'all') {
        const allClients = JSON.parse(localStorage.getItem('projects_clients_v2') || '[]');
        const targetClient = allClients.find(c => c.id === selectedClientId);
        execMonthDisplay.textContent = `${targetClient ? targetClient.name : 'Cliente'} • ${selectedMonthName} ${selY}`;
      } else {
        execMonthDisplay.textContent = `Consolidado • ${selectedMonthName} ${selY}`;
      }
    }

    if (execGoalLabel) execGoalLabel.textContent = formatNumberToMoney(goal);
    if (execTimeElapsedLabel) {
      if (isPastMonth) {
        execTimeElapsedLabel.textContent = `100% (Mês Encerrado • ${totalDaysInMonth} dias)`;
      } else {
        execTimeElapsedLabel.textContent = `${timeElapsedPct}% (Dia ${passedDays} de ${totalDaysInMonth})`;
      }
    }
    if (execMetaElapsedLabel) execMetaElapsedLabel.textContent = `${goalPct}% (${formatNumberToMoney(totalRevenue)})`;

    if (pacingBarTime) pacingBarTime.style.width = `${Math.min(100, timeElapsedPct)}%`;
    if (pacingPinTime) pacingPinTime.style.left = `${Math.min(100, timeElapsedPct)}%`;
    if (pacingBarMoney) pacingBarMoney.style.width = `${Math.min(100, goalPct)}%`;
    if (pinDayNum) pinDayNum.textContent = isPastMonth ? totalDaysInMonth : passedDays;

    // Status do Ritmo (Pacing)
    if (execPacingPill && execPacingStatusText) {
      if (isPastMonth) {
        if (totalRevenue >= goal && goal > 0) {
          execPacingPill.className = 'pacing-status-pill';
          execPacingStatusText.textContent = `🎯 Mês Encerrado: Meta Batida! (${goalPct}%)`;
        } else {
          execPacingPill.className = 'pacing-status-pill warning';
          execPacingStatusText.textContent = `🏁 Mês Encerrado (${goalPct}% atingido)`;
        }
      } else {
        const pacingDiff = goalPct - timeElapsedPct;
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
    }

    if (statDaysPassed) statDaysPassed.textContent = `${passedDays} dias`;
    if (statDaysRemaining) statDaysRemaining.textContent = isPastMonth ? '0 dias (encerrado)' : `${remainingDays} dias restantes`;
    if (statCurrentDailyPace) statCurrentDailyPace.textContent = `${formatNumberToMoney(dailyPace)} / dia`;
    if (statRequiredDailyPace) statRequiredDailyPace.textContent = isPastMonth ? '—' : `${formatNumberToMoney(requiredDailyPace)} / dia`;

    const statGapStatus = document.getElementById('stat-gap-status');
    const gapBox = document.querySelector('.gap-danger-box');
    if (statGoalGap) {
      if (goalGap <= 0) {
        statGoalGap.textContent = 'Meta Batida! 🎯';
        statGoalGap.classList.remove('highlight-red');
        statGoalGap.classList.add('highlight-lime');
        if (statGapStatus) statGapStatus.textContent = 'Superavit comercial';
        if (gapBox) {
          gapBox.style.background = 'rgba(91, 227, 54, 0.08)';
          gapBox.style.borderColor = 'rgba(91, 227, 54, 0.3)';
        }
      } else {
        statGoalGap.textContent = formatNumberToMoney(goalGap);
        statGoalGap.classList.remove('highlight-lime');
        statGoalGap.classList.add('highlight-red');
        if (statGapStatus) statGapStatus.textContent = isPastMonth ? 'Gap final não atingido' : 'Faltam fechar';
        if (gapBox) {
          gapBox.style.background = '';
          gapBox.style.borderColor = '';
        }
      }
    }

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
          <span style="font-weight:700; color:${m.sales > 0 ? 'var(--text-dark)' : 'var(--text-secondary)'};">${isCloser ? m.sales : '—'}</span>
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
      if (sdrClientSelect) sdrClientSelect.value = entry.clientId || '';
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
      if (sdrClientSelect) sdrClientSelect.value = '';
    }

    updateSdrDashboard();
  }

  function saveSdrReport(showFeedback = true) {
    const selectedDate = sdrReportDate ? sdrReportDate.value : formattedToday;
    const customName = inputSdrNameCustom ? inputSdrNameCustom.value.trim() : '';

    const newRecord = {
      id: `${currentSdr}_${selectedDate}`,
      sdr: currentSdr,
      clientId: sdrClientSelect ? sdrClientSelect.value || null : null,
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
              <span style="font-size:10px; color:#8da2bd; text-transform:uppercase; font-weight:600; letter-spacing:0.04em;">REUNIÕES AGENDADAS</span>
              <div style="font-size:24px; font-weight:700; color:var(--accent-lime); font-family:var(--font-display); letter-spacing:-0.03em; font-variant-numeric:tabular-nums;">${scheduled}</div>
              <span style="font-size:10px; color:#cbd5e1;">${qualified} qualificadas no ICP</span>
            </div>
            <div style="background:#0f1422; border:1px solid #1a2336; padding:12px; border-radius:8px;">
              <span style="font-size:10px; color:#8da2bd; text-transform:uppercase; font-weight:600; letter-spacing:0.04em;">CONTATOS EFETIVOS</span>
              <div style="font-size:24px; font-weight:700; color:#ffffff; font-family:var(--font-display); letter-spacing:-0.03em; font-variant-numeric:tabular-nums;">${contacts}</div>
              <span style="font-size:10px; color:#cbd5e1;">${contactRate}% de conexão</span>
            </div>
            <div style="background:#0f1422; border:1px solid #1a2336; padding:12px; border-radius:8px;">
              <span style="font-size:10px; color:#8da2bd; text-transform:uppercase; font-weight:600; letter-spacing:0.04em;">TX. AGENDAMENTO</span>
              <div style="font-size:24px; font-weight:700; color:var(--accent-lime); font-family:var(--font-display); letter-spacing:-0.03em; font-variant-numeric:tabular-nums;">${scheduleRate}%</div>
              <span style="font-size:10px; color:#cbd5e1;">Agendadas / Conexões</span>
            </div>
            <div style="background:#0f1422; border:1px solid #1a2336; padding:12px; border-radius:8px;">
              <span style="font-size:10px; color:#8da2bd; text-transform:uppercase; font-weight:600; letter-spacing:0.04em;">PIPELINE GERADO</span>
              <div style="font-size:22px; font-weight:700; color:#ffffff; font-family:var(--font-display); letter-spacing:-0.03em; font-variant-numeric:tabular-nums;">${pipeline}</div>
              <span style="font-size:10px; color:#8da2bd;">Encaminhado aos Closers</span>
            </div>
          </div>

          <div style="background:#0f1422; border:1px solid #1a2336; padding:16px; border-radius:8px; margin-bottom: 12px;">
            <span style="font-size:11px; font-weight:700; color:var(--accent-lime); letter-spacing:0.04em; text-transform:uppercase;">01 • ESFORÇO & VOLUME DE PROSPECÇÃO</span>
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 10px;">
              <div><span style="font-size:10px; color:#8da2bd; text-transform:uppercase; font-weight:600; letter-spacing:0.03em;">LEADS ABORDADOS</span><div style="font-size:18px; font-weight:700; color:#ffffff; font-variant-numeric:tabular-nums;">${leads}</div></div>
              <div><span style="font-size:10px; color:#8da2bd; text-transform:uppercase; font-weight:600; letter-spacing:0.03em;">LIGAÇÕES FEITAS</span><div style="font-size:18px; font-weight:700; color:#ffffff; font-variant-numeric:tabular-nums;">${calls}</div></div>
              <div><span style="font-size:10px; color:#8da2bd; text-transform:uppercase; font-weight:600; letter-spacing:0.03em;">MENSAGENS WHATSAPP</span><div style="font-size:18px; font-weight:700; color:#ffffff; font-variant-numeric:tabular-nums;">${whatsapp}</div></div>
            </div>
          </div>

          <div style="background:#0f1422; border:1px solid #1a2336; padding:16px; border-radius:8px;">
            <span style="font-size:11px; font-weight:700; color:var(--accent-lime); letter-spacing:0.04em; text-transform:uppercase;">02 • CONVERSÃO & QUALIFICAÇÃO</span>
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 10px;">
              <div><span style="font-size:10px; color:#8da2bd; text-transform:uppercase; font-weight:600; letter-spacing:0.03em;">REUNIÕES AGENDADAS</span><div style="font-size:18px; font-weight:700; color:var(--accent-lime); font-variant-numeric:tabular-nums;">${scheduled}</div></div>
              <div><span style="font-size:10px; color:#8da2bd; text-transform:uppercase; font-weight:600; letter-spacing:0.03em;">REUNIÕES QUALIFICADAS</span><div style="font-size:18px; font-weight:700; color:#ffffff; font-variant-numeric:tabular-nums;">${qualified}</div></div>
              <div><span style="font-size:10px; color:#8da2bd; text-transform:uppercase; font-weight:600; letter-spacing:0.03em;">NO-SHOWS (FALTAS)</span><div style="font-size:18px; font-weight:700; color:#f87171; font-variant-numeric:tabular-nums;">${noshow}</div></div>
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
      if (closerClientSelect) closerClientSelect.value = entry.clientId || '';
    } else {
      inputLeads.value = 0;
      inputFollowups.value = 0;
      inputProspeccoes.value = 0;
      inputMeetingsScheduled.value = 0;
      inputMeetingsHeld.value = 0;
      inputSales.value = 0;
      inputContractVal.value = 'R$ 0,00';
      inputCashCollected.value = 'R$ 0,00';
      if (closerClientSelect) closerClientSelect.value = '';
    }

    updateCloserDashboard();
  }

  function saveCurrentReport(showFeedback = true) {
    const selectedDate = dateInput ? dateInput.value : formattedToday;

    const newRecord = {
      id: `${currentCloser}_${selectedDate}`,
      closer: currentCloser,
      clientId: closerClientSelect ? closerClientSelect.value || null : null,
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
  // POVOAMENTO DE FILTROS DA TOPBAR (CLIENTES & MESES)
  // ============================================================
  async function populateTopBarFilters() {
    const clients = await dbFetchClients();

    [dashFilterClient, closerClientSelect, sdrClientSelect].forEach(selectElem => {
      if (!selectElem) return;
      const isDash = (selectElem === dashFilterClient);
      const currentVal = selectElem.value || (isDash ? 'all' : '');

      selectElem.innerHTML = isDash
        ? '<option value="all">🌐 Visão Consolidada (Todos os Clientes)</option>'
        : '<option value="">🌐 Geral / Todos os Projetos</option>';

      clients.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.name} (${c.segment || 'Geral'})`;
        selectElem.appendChild(opt);
      });

      if (Array.from(selectElem.options).some(o => o.value === currentVal)) {
        selectElem.value = currentVal;
      } else {
        selectElem.value = isDash ? 'all' : '';
      }
    });
  }

  function populateMonthFilter() {
    if (!dashFilterMonth) return;
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const months = new Set();
    months.add(currentMonthKey);

    // Adiciona últimos 5 meses
    for (let i = 1; i <= 5; i++) {
      const d = new Date(yyyy, today.getMonth() - i, 1);
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.add(mKey);
    }

    // Adiciona meses com planejamento
    const plannings = JSON.parse(localStorage.getItem('projects_planning_v2') || '[]');
    plannings.forEach(p => {
      if (p.year_month) months.add(p.year_month);
    });

    const sortedMonths = Array.from(months).sort().reverse();
    const currentVal = dashFilterMonth.value || currentMonthKey;

    dashFilterMonth.innerHTML = '';
    sortedMonths.forEach(mKey => {
      const [mY, mM] = mKey.split('-').map(Number);
      const mName = monthNames[mM - 1] || mKey;
      const opt = document.createElement('option');
      opt.value = mKey;
      opt.textContent = mKey === currentMonthKey ? `${mName} • ${mY} (Atual)` : `${mName} • ${mY}`;
      dashFilterMonth.appendChild(opt);
    });

    if (Array.from(dashFilterMonth.options).some(o => o.value === currentVal)) {
      dashFilterMonth.value = currentVal;
    } else {
      dashFilterMonth.value = currentMonthKey;
    }
  }

  if (dashFilterClient) {
    dashFilterClient.addEventListener('change', () => {
      updateExecDashboard();
    });
  }

  if (dashFilterMonth) {
    dashFilterMonth.addEventListener('change', () => {
      updateExecDashboard();
      if (currentView === 'view-projects') {
        renderProjectsView();
      }
    });
  }

  // ============================================================
  // STATUS DE CONEXÃO COM O SUPABASE CLOUD
  // ============================================================
  async function initSupabaseHealth() {
    if (!supabaseCloudStatus || !supabaseCloudText) return;
    try {
      const isHealthy = await checkSupabaseHealth();
      if (isHealthy) {
        supabaseCloudStatus.classList.remove('pending');
        supabaseCloudStatus.classList.add('connected');
        supabaseCloudText.textContent = 'Supabase Conectado';
        supabaseCloudStatus.title = 'Banco de Dados Supabase Cloud ativo e conectado.';
      } else {
        supabaseCloudStatus.classList.remove('connected');
        supabaseCloudStatus.classList.add('pending');
        supabaseCloudText.textContent = 'Nuvem: Executar SQL';
        supabaseCloudStatus.title = 'Tabelas do Supabase pendentes. Clique para ver instruções.';
      }
    } catch (e) {
      supabaseCloudStatus.classList.add('pending');
      supabaseCloudText.textContent = 'Nuvem: Pendente';
    }
  }

  if (supabaseCloudStatus) {
    supabaseCloudStatus.addEventListener('click', () => {
      alert("Conexão com Supabase Cloud:\n\n• URL: https://gaerznidutdufqcfhpst.supabase.co\n• Status Atual: " + (supabaseCloudText ? supabaseCloudText.textContent : '') + "\n\nPara ativar o banco na nuvem:\n1. Acesse o painel do Supabase da sua conta.\n2. Abra o 'SQL Editor'.\n3. Copie e cole todo o conteúdo do arquivo 'supabase-schema.sql' e clique em 'Run'.\n\nEnquanto isso, toda a sua aplicação funciona 100% no cache local seguro sem perdas!");
    });
  }

  // ============================================================
  // GESTÃO DE PROJETOS, CLIENTES & PLANEJAMENTO MENSAL
  // ============================================================
  let activePlanningClient = null;

  async function renderProjectsView() {
    if (!projectsClientsContainer) return;

    const clients = await dbFetchClients();
    const plannings = await dbFetchPlannings();
    const closerReports = getStoredCloserReports();

    // Determina o mês de referência para o resumo dos projetos
    const refMonth = dashFilterMonth ? dashFilterMonth.value : currentMonthKey;

    // Métricas Globais da Barra de Projetos
    const activeClientsCount = clients.filter(c => c.status === 'active').length;
    let totalPlannedRev = 0;
    let totalActualRev = 0;

    // Calcula somatórios por cliente no mês de referência
    const clientStatsMap = {};

    clients.forEach(c => {
      const plan = plannings.find(p => p.client_id === c.id && p.year_month === refMonth);
      const plannedRev = plan ? Number(plan.revenue_goal) || 0 : 0;
      const plannedSales = plan ? Number(plan.sales_goal) || 0 : 0;
      const plannedMeetings = plan ? Number(plan.meetings_goal) || 0 : 0;
      const moneyTable = plan ? Number(plan.money_on_table) || 0 : 0;
      const notes = plan ? (plan.notes || '') : '';

      // Relatórios associados ao cliente
      const reports = closerReports.filter(r => {
        if (!r.date || !r.date.startsWith(refMonth)) return false;
        return r.clientId === c.id;
      });

      const actualRev = reports.reduce((sum, r) => sum + parseMoneyToNumber(r.cashCollected), 0);
      const actualSales = reports.reduce((sum, r) => sum + (parseInt(r.sales, 10) || 0), 0);
      const actualMeetings = reports.reduce((sum, r) => sum + (parseInt(r.meetingsHeld, 10) || 0), 0);

      totalPlannedRev += plannedRev;
      totalActualRev += actualRev;

      clientStatsMap[c.id] = {
        plannedRev,
        plannedSales,
        plannedMeetings,
        moneyTable,
        notes,
        actualRev,
        actualSales,
        actualMeetings,
        pct: plannedRev > 0 ? Math.round((actualRev / plannedRev) * 100) : 0
      };
    });

    const globalPct = totalPlannedRev > 0 ? Math.round((totalActualRev / totalPlannedRev) * 100) : 0;

    // Atualiza Strip Superior
    if (pStatTotalClients) pStatTotalClients.textContent = `${activeClientsCount} / ${clients.length}`;
    if (pStatPlannedRev) pStatPlannedRev.textContent = formatNumberToMoney(totalPlannedRev);
    if (pStatActualRev) pStatActualRev.textContent = formatNumberToMoney(totalActualRev);
    if (pStatAchievement) pStatAchievement.textContent = `${globalPct}%`;
    if (projectsActiveCount) projectsActiveCount.textContent = `${clients.length} cliente(s) cadastrado(s)`;

    // Filtra lista de clientes por busca e por status
    let filteredClients = [...clients];
    if (projectsStatusFilter && projectsStatusFilter !== 'all') {
      filteredClients = filteredClients.filter(c => (c.status || 'active') === projectsStatusFilter);
    }
    if (projectsSearchQuery && projectsSearchQuery.trim()) {
      const q = projectsSearchQuery.trim().toLowerCase();
      filteredClients = filteredClients.filter(c => 
        (c.name && c.name.toLowerCase().includes(q)) || 
        (c.segment && c.segment.toLowerCase().includes(q))
      );
    }

    if (projectsActiveCount) {
      if (filteredClients.length !== clients.length) {
        projectsActiveCount.textContent = `${filteredClients.length} de ${clients.length} cliente(s)`;
      } else {
        projectsActiveCount.textContent = `${clients.length} cliente(s) cadastrado(s)`;
      }
    }

    // Renderiza Cards
    projectsClientsContainer.innerHTML = '';
    if (clients.length === 0) {
      projectsClientsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: #fff; border: 1px dashed var(--border-card); border-radius: var(--radius-lg);">
          <p style="font-size: 15px; color: var(--text-secondary); margin-bottom: 12px;">Nenhum cliente ou projeto cadastrado no momento.</p>
          <button type="button" class="btn-apple-primary" id="btn-empty-add-client">Cadastrar Primeiro Cliente</button>
        </div>
      `;
      const btnEmpty = document.getElementById('btn-empty-add-client');
      if (btnEmpty) btnEmpty.addEventListener('click', () => openClientModal());
      return;
    }

    if (filteredClients.length === 0) {
      projectsClientsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: #fff; border: 1px dashed var(--border-card); border-radius: var(--radius-lg);">
          <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 12px;">Nenhum cliente encontrado para os filtros selecionados.</p>
          <button type="button" class="btn-apple-secondary" id="btn-clear-project-filter" style="font-size: 12px; padding: 6px 14px;">Limpar Filtros</button>
        </div>
      `;
      const btnClear = document.getElementById('btn-clear-project-filter');
      if (btnClear) {
        btnClear.addEventListener('click', () => {
          projectsSearchQuery = '';
          projectsStatusFilter = 'all';
          if (projectsSearchInput) projectsSearchInput.value = '';
          if (projectsStatusTabs) {
            projectsStatusTabs.querySelectorAll('.p-tab-btn').forEach(b => {
              b.classList.toggle('active', b.getAttribute('data-status') === 'all');
            });
          }
          renderProjectsView();
        });
      }
      return;
    }

    filteredClients.forEach(c => {
      const stats = clientStatsMap[c.id] || {
        plannedRev: 0,
        plannedSales: 0,
        plannedMeetings: 0,
        moneyTable: 0,
        notes: '',
        actualRev: 0,
        actualSales: 0,
        actualMeetings: 0,
        pct: 0
      };

      const card = document.createElement('div');
      card.className = 'project-card';
      card.dataset.clientId = c.id;

      card.innerHTML = `
        <div class="project-card-header">
          <div class="project-card-title-box">
            <h3 class="project-card-name">${c.name}</h3>
            <span class="project-card-segment">${c.segment || 'Segmento B2B'}</span>
          </div>
          <span class="project-status-pill status-${c.status || 'active'}">
            ${c.status === 'active' ? '🟢 Ativo' : c.status === 'onboarding' ? '🟡 Onboarding' : '⚪ Pausado'}
          </span>
        </div>

        <div class="project-card-stats">
          <div class="p-card-stat">
            <span class="p-card-stat-label">META DO MÊS (${refMonth})</span>
            <span class="p-card-stat-val highlight-lime">${formatNumberToMoney(stats.plannedRev)}</span>
          </div>
          <div class="p-card-stat">
            <span class="p-card-stat-label">FATURAMENTO REALIZADO</span>
            <span class="p-card-stat-val" style="color: ${stats.actualRev >= stats.plannedRev && stats.plannedRev > 0 ? '#10b981' : 'var(--text-dark)'};">
              ${formatNumberToMoney(stats.actualRev)}
            </span>
          </div>
          <div class="p-card-stat">
            <span class="p-card-stat-label">VENDAS (UN)</span>
            <span class="p-card-stat-val">${stats.actualSales} / ${stats.plannedSales} un</span>
          </div>
          <div class="p-card-stat">
            <span class="p-card-stat-label">DINHEIRO NA MESA</span>
            <span class="p-card-stat-val">${formatNumberToMoney(stats.moneyTable)}</span>
          </div>
        </div>

        <div class="project-progress-box">
          <div class="project-progress-label-row">
            <span>Atingimento da Meta</span>
            <span class="font-bold">${stats.pct}%</span>
          </div>
          <div class="project-progress-track">
            <div class="project-progress-fill" style="width: ${Math.min(100, stats.pct)}%;"></div>
          </div>
        </div>

        ${stats.notes ? `<div style="font-size: 11px; color: var(--text-secondary); background: #fbfbfc; padding: 6px 10px; border-radius: 6px; border-left: 2px solid var(--accent-lime); font-style: italic;">“${stats.notes}”</div>` : ''}

        <div class="project-card-footer">
          <div class="project-card-actions">
            <button type="button" class="project-btn-action btn-client-dash" data-id="${c.id}" title="Ver métricas deste cliente no Dashboard">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              <span>Dashboard</span>
            </button>
            <button type="button" class="project-btn-action btn-client-plan" data-id="${c.id}" title="Configurar Planejamento Mensal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>Metas</span>
            </button>
            <button type="button" class="project-btn-icon btn-client-edit" data-id="${c.id}" title="Editar cliente">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button type="button" class="project-btn-icon btn-client-del" data-id="${c.id}" title="Excluir cliente">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </div>
      `;

      projectsClientsContainer.appendChild(card);
    });

    // Eventos dos botões dos cards
    projectsClientsContainer.querySelectorAll('.btn-client-dash').forEach(btn => {
      btn.addEventListener('click', () => {
        const cId = btn.getAttribute('data-id');
        if (dashFilterClient) {
          dashFilterClient.value = cId;
        }
        showView('view-dashboard');
        updateExecDashboard();
        const targetCli = clients.find(c => c.id === cId);
        showToast(`Exibindo métricas de "${targetCli ? targetCli.name : 'Cliente'}" no Dashboard.`);
      });
    });

    projectsClientsContainer.querySelectorAll('.btn-client-plan').forEach(btn => {
      btn.addEventListener('click', () => {
        const cId = btn.getAttribute('data-id');
        const client = clients.find(c => c.id === cId);
        if (client) openPlanningModal(client);
      });
    });

    projectsClientsContainer.querySelectorAll('.btn-client-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const cId = btn.getAttribute('data-id');
        const client = clients.find(c => c.id === cId);
        if (client) openClientModal(client);
      });
    });

    projectsClientsContainer.querySelectorAll('.btn-client-del').forEach(btn => {
      btn.addEventListener('click', async () => {
        const cId = btn.getAttribute('data-id');
        const client = clients.find(c => c.id === cId);
        if (client && confirm(`Deseja realmente excluir o cliente "${client.name}"?`)) {
          await dbDeleteClient(cId);
          await populateTopBarFilters();
          await renderProjectsView();
          updateExecDashboard();
          showToast(`Cliente excluído com sucesso.`);
        }
      });
    });

    const emptyAddBtn = projectsClientsContainer.querySelector('#btn-empty-add-client');
    if (emptyAddBtn) {
      emptyAddBtn.addEventListener('click', () => openClientModal());
    }
  }

  // --- MODAL DE CLIENTE ---
  function openClientModal(client = null) {
    if (!modalClient) return;
    if (client) {
      if (modalClientTitle) modalClientTitle.textContent = 'Editar Cliente / Projeto';
      if (clientFormId) clientFormId.value = client.id;
      if (clientName) clientName.value = client.name || '';
      if (clientSegment) clientSegment.value = client.segment || '';
      if (clientStatus) clientStatus.value = client.status || 'active';
    } else {
      if (modalClientTitle) modalClientTitle.textContent = 'Novo Cliente / Projeto';
      if (clientFormId) clientFormId.value = '';
      if (clientName) clientName.value = '';
      if (clientSegment) clientSegment.value = '';
      if (clientStatus) clientStatus.value = 'active';
    }
    modalClient.classList.add('open');
    if (clientName) clientName.focus();
  }

  function closeClientModal() {
    if (modalClient) modalClient.classList.remove('open');
  }

  async function saveClientModalData() {
    if (!clientName || !clientName.value.trim()) {
      alert('Por favor, informe o nome do cliente / empresa.');
      if (clientName) clientName.focus();
      return;
    }

    const id = clientFormId.value || `cli_${Date.now()}`;
    const newClient = {
      id,
      name: clientName.value.trim(),
      segment: clientSegment ? clientSegment.value.trim() : '',
      responsible: '',
      status: clientStatus ? clientStatus.value : 'active'
    };

    await dbSaveClient(newClient);
    closeClientModal();
    await populateTopBarFilters();
    await renderProjectsView();
    updateExecDashboard();
    showToast(`Cliente "${newClient.name}" salvo com sucesso!`);
  }

  if (btnOpenCreateClient) btnOpenCreateClient.addEventListener('click', () => openClientModal());
  if (btnCloseClient) btnCloseClient.addEventListener('click', closeClientModal);
  if (btnCancelClient) btnCancelClient.addEventListener('click', closeClientModal);
  if (btnSaveClient) btnSaveClient.addEventListener('click', saveClientModalData);

  if (modalClient) {
    modalClient.addEventListener('click', (e) => {
      if (e.target === modalClient) closeClientModal();
    });
  }

  // --- FILTROS & BUSCA DE PROJETOS ---
  if (projectsSearchInput) {
    projectsSearchInput.addEventListener('input', (e) => {
      projectsSearchQuery = e.target.value;
      renderProjectsView();
    });
  }

  if (projectsStatusTabs) {
    projectsStatusTabs.querySelectorAll('.p-tab-btn').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        projectsStatusTabs.querySelectorAll('.p-tab-btn').forEach(b => b.classList.remove('active'));
        tabBtn.classList.add('active');
        projectsStatusFilter = tabBtn.getAttribute('data-status') || 'all';
        renderProjectsView();
      });
    });
  }

  // Helper para retroceder 1 mês no formato YYYY-MM
  function getPreviousYearMonth(ym) {
    if (!ym || !ym.includes('-')) return '';
    const [yStr, mStr] = ym.split('-');
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10);
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    return `${y}-${String(m).padStart(2, '0')}`;
  }

  // Atualiza preview de ticket médio e taxa de conversão no modal de metas
  function updatePlanningKpiPreview() {
    const rev = parseMoneyToNumber(planRevenueGoal ? planRevenueGoal.value : 0);
    const sales = parseInt(planSalesGoal ? planSalesGoal.value : 0, 10) || 0;
    const meetings = parseInt(planMeetingsGoal ? planMeetingsGoal.value : 0, 10) || 0;

    const ticket = sales > 0 ? rev / sales : 0;
    const conv = meetings > 0 ? Math.round((sales / meetings) * 100) : 0;

    if (planPreviewTicket) {
      planPreviewTicket.textContent = formatNumberToMoney(ticket);
    }
    if (planPreviewConv) {
      planPreviewConv.textContent = `${conv}%`;
    }
  }

  // --- MODAL DE PLANEJAMENTO MENSAL ---
  function openPlanningModal(client) {
    if (!modalPlanning || !client) return;
    activePlanningClient = client;

    if (planningClientId) planningClientId.value = client.id;
    if (planningClientName) planningClientName.textContent = `Planejamento • ${client.name}`;
    if (planningClientTag) planningClientTag.textContent = client.segment || 'PROJETO';

    const currentPickerMonth = dashFilterMonth ? dashFilterMonth.value : currentMonthKey;
    if (planningMonthPicker) {
      planningMonthPicker.value = currentPickerMonth;
    }

    loadPlanningValuesForMonth(client.id, currentPickerMonth);
    renderPlanningHistoryTable(client.id);

    modalPlanning.classList.add('open');
  }

  function closePlanningModal() {
    if (modalPlanning) modalPlanning.classList.remove('open');
    activePlanningClient = null;
  }

  function loadPlanningValuesForMonth(clientId, monthKey) {
    const plannings = JSON.parse(localStorage.getItem('projects_planning_v2') || '[]');
    const plan = plannings.find(p => p.client_id === clientId && p.year_month === monthKey);

    if (plan) {
      if (planRevenueGoal) planRevenueGoal.value = formatNumberToMoney(Number(plan.revenue_goal) || 0);
      if (planSalesGoal) planSalesGoal.value = plan.sales_goal ?? 5;
      if (planMeetingsGoal) planMeetingsGoal.value = plan.meetings_goal ?? 15;
      if (planMoneyTable) planMoneyTable.value = formatNumberToMoney(Number(plan.money_on_table) || 0);
      if (planNotes) planNotes.value = plan.notes || '';
    } else {
      if (planRevenueGoal) planRevenueGoal.value = 'R$ 50.000,00';
      if (planSalesGoal) planSalesGoal.value = 5;
      if (planMeetingsGoal) planMeetingsGoal.value = 15;
      if (planMoneyTable) planMoneyTable.value = 'R$ 25.000,00';
      if (planNotes) planNotes.value = '';
    }

    updatePlanningKpiPreview();
  }

  function renderPlanningHistoryTable(clientId) {
    if (!planningHistoryTableBody) return;
    const plannings = JSON.parse(localStorage.getItem('projects_planning_v2') || '[]');
    const clientPlans = plannings.filter(p => p.client_id === clientId).sort((a,b) => b.year_month.localeCompare(a.year_month));
    const closerReports = getStoredCloserReports();

    planningHistoryTableBody.innerHTML = '';
    if (clientPlans.length === 0) {
      planningHistoryTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 16px;">
            Nenhum planejamento registrado para este cliente ainda.
          </td>
        </tr>
      `;
      return;
    }

    clientPlans.forEach(p => {
      const reports = closerReports.filter(r => (r.date || '').startsWith(p.year_month) && (r.clientId === clientId || !r.clientId));
      const actualRev = reports.reduce((sum, r) => sum + parseMoneyToNumber(r.cashCollected), 0);
      const actualSales = reports.reduce((sum, r) => sum + (parseInt(r.sales, 10) || 0), 0);
      const goal = Number(p.revenue_goal) || 0;
      const pct = goal > 0 ? Math.round((actualRev / goal) * 100) : 0;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${p.year_month}</strong></td>
        <td>${formatNumberToMoney(goal)}</td>
        <td style="color: ${actualRev >= goal && goal > 0 ? '#10b981' : 'var(--text-dark)'}; font-weight: 600;">
          ${formatNumberToMoney(actualRev)}
        </td>
        <td>
          <span class="pacing-status-pill ${pct >= 100 ? '' : 'warning'}" style="font-size: 10px; padding: 2px 7px;">
            ${pct}%
          </span>
        </td>
        <td>${actualSales} / ${p.sales_goal} un</td>
        <td style="text-align: right;">
          <button type="button" class="btn-apple-secondary btn-plan-edit-month" data-month="${p.year_month}" style="padding: 3px 8px; font-size: 11px;">
            Carregar
          </button>
        </td>
      `;
      planningHistoryTableBody.appendChild(tr);
    });

    planningHistoryTableBody.querySelectorAll('.btn-plan-edit-month').forEach(btn => {
      btn.addEventListener('click', () => {
        const m = btn.getAttribute('data-month');
        if (planningMonthPicker) planningMonthPicker.value = m;
        loadPlanningValuesForMonth(clientId, m);
      });
    });
  }

  if (planningMonthPicker) {
    planningMonthPicker.addEventListener('change', () => {
      if (planningClientId && planningClientId.value) {
        loadPlanningValuesForMonth(planningClientId.value, planningMonthPicker.value);
      }
    });
  }

  async function savePlanningModalData() {
    const clientId = planningClientId ? planningClientId.value : null;
    const yearMonth = planningMonthPicker ? planningMonthPicker.value : null;
    if (!clientId || !yearMonth) {
      alert('Erro: Dados do cliente ou mês de referência inválidos.');
      return;
    }

    const revGoal = parseMoneyToNumber(planRevenueGoal.value);
    const salesGoal = parseInt(planSalesGoal.value, 10) || 0;
    const meetingsGoal = parseInt(planMeetingsGoal.value, 10) || 0;
    const moneyTable = parseMoneyToNumber(planMoneyTable.value);
    const notes = planNotes ? planNotes.value.trim() : '';

    await dbSavePlanning({
      client_id: clientId,
      year_month: yearMonth,
      revenue_goal: revGoal,
      sales_goal: salesGoal,
      meetings_goal: meetingsGoal,
      money_on_table: moneyTable,
      notes: notes
    });

    closePlanningModal();
    populateMonthFilter();
    await renderProjectsView();
    updateExecDashboard();
    showToast(`Planejamento de ${yearMonth} salvo com sucesso!`);
  }

  if (btnClosePlanning) btnClosePlanning.addEventListener('click', closePlanningModal);
  if (btnCancelPlanning) btnCancelPlanning.addEventListener('click', closePlanningModal);
  if (btnSavePlanning) btnSavePlanning.addEventListener('click', savePlanningModalData);

  // Recálculo dinâmico ao digitar nas metas
  if (planRevenueGoal) planRevenueGoal.addEventListener('input', updatePlanningKpiPreview);
  if (planSalesGoal) planSalesGoal.addEventListener('input', updatePlanningKpiPreview);
  if (planMeetingsGoal) planMeetingsGoal.addEventListener('input', updatePlanningKpiPreview);

  // Copiar metas do mês anterior
  if (btnCopyPrevPlan) {
    btnCopyPrevPlan.addEventListener('click', () => {
      const clientId = planningClientId ? planningClientId.value : (activePlanningClient ? activePlanningClient.id : null);
      if (!clientId) return;
      const currentMonth = planningMonthPicker ? planningMonthPicker.value : currentMonthKey;
      const prevMonth = getPreviousYearMonth(currentMonth);
      const plannings = JSON.parse(localStorage.getItem('projects_planning_v2') || '[]');
      const prevPlan = plannings.find(p => p.client_id === clientId && p.year_month === prevMonth);

      if (prevPlan) {
        if (planRevenueGoal) planRevenueGoal.value = formatNumberToMoney(Number(prevPlan.revenue_goal) || 0);
        if (planSalesGoal) planSalesGoal.value = prevPlan.sales_goal ?? 5;
        if (planMeetingsGoal) planMeetingsGoal.value = prevPlan.meetings_goal ?? 15;
        if (planMoneyTable) planMoneyTable.value = formatNumberToMoney(Number(prevPlan.money_on_table) || 0);
        if (planNotes && prevPlan.notes) planNotes.value = prevPlan.notes;
        updatePlanningKpiPreview();
        showToast(`Metas de ${prevMonth} copiadas com sucesso!`);
      } else {
        showToast(`Nenhum planejamento encontrado para o mês anterior (${prevMonth}).`, true);
      }
    });
  }

  if (modalPlanning) {
    modalPlanning.addEventListener('click', (e) => {
      if (e.target === modalPlanning) closePlanningModal();
    });
  }

  // ============================================================
  // INICIALIZAÇÃO DO SISTEMA
  // ============================================================
  // Limpa projetos demo do cache local conforme solicitado
  try {
    localStorage.setItem('projects_clients_v2', JSON.stringify([]));
    localStorage.setItem('projects_planning_v2', JSON.stringify([]));
  } catch (e) {}

  initializeSeedDataIfEmpty();
  populateTopBarFilters();
  populateMonthFilter();
  initSupabaseHealth();

  // Roteamento inicial por Hash
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash === 'sdrs') {
    showView('view-sdrs');
  } else if (initialHash === 'closers') {
    showView('view-closers');
  } else if (initialHash === 'projects') {
    showView('view-projects');
  } else if (initialHash === 'history') {
    showView('view-history');
  } else {
    showView('view-dashboard');
  }

  selectCloser('Tales');
  selectSdr('SDR 1');
});
