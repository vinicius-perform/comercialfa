/**
 * Fazendo Acontecer™ - Painel Comercial Executivo & Gestão
 * Multi-View SPA System: Executive Dashboard, SDR Hub, Closers Hub & Consolidated Data
 */

document.addEventListener('DOMContentLoaded', () => {
  // ============================================================
  // CONFIGURAÇÃO, CONSTANTES & ESTADO GLOBAL
  // ============================================================
  const closersList = ['Tales', 'José', 'Elinaldo'];
  
  let currentView = 'view-dashboard';

  // Chaves do LocalStorage de Produção
  const STORAGE_CLOSER_REPORTS = 'fa_prod_closer_reports_v1';
  const STORAGE_CLIENTS_KEY = 'fa_prod_clients_v1';
  const STORAGE_PLANNING_KEY = 'fa_prod_planning_v1';
  const STORAGE_GOAL = 'fa_monthly_goal_v1';

  // Data atual padrão (YYYY-MM-DD)
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const formattedToday = `${yyyy}-${mm}-${dd}`;
  const currentMonthKey = `${yyyy}-${mm}`;

  // ============================================================
  // LIMPEZA AUTOMÁTICA DE DADOS FICTÍCIOS ANTERIORES DO CACHE
  // ============================================================
  const legacyKeysToPurge = [
    'fa_closers_uifry_reports_v1',
    'closerReports_v2',
    'fa_sdr_reports_v1',
    'sdrReports_v2',
    'fa_prod_sdr_reports_v1',
    'projects_clients_v2',
    'projects_planning_v2',
    'fa_money_table_v1',
    'money_on_table',
    'fa_win_rate_v1',
    'fa_team_reports_unified_v1',
    'fa_storage_cleaned_v1',
    'fa_storage_cleaned_v2',
    'fa_storage_cleaned_v3',
    'fa_storage_cleaned_v4'
  ];
  legacyKeysToPurge.forEach(k => localStorage.removeItem(k));

  // ============================================================
  // ELEMENTOS DO DOM
  // ============================================================
  // Views
  const views = {
    'view-dashboard': document.getElementById('view-dashboard'),
    'view-projects': document.getElementById('view-projects'),
    'view-history': document.getElementById('view-history')
  };

  // Links da Sidebar
  const navLinks = {
    'view-dashboard': document.getElementById('nav-dashboard'),
    'view-projects': document.getElementById('nav-projects'),
    'view-history': document.getElementById('nav-history')
  };

  // Botão de navegação rápida
  const btnCopyTeamLink = document.getElementById('btn-copy-team-link');

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
  const planNotes = document.getElementById('plan-notes');
  const planPreviewTicket = document.getElementById('plan-preview-ticket');
  const planPreviewConv = document.getElementById('plan-preview-conv');
  const planningHistoryTableBody = document.getElementById('planning-history-table-body');
  const btnClosePlanning = document.getElementById('btn-close-planning');
  const btnCancelPlanning = document.getElementById('btn-cancel-planning');
  const btnSavePlanning = document.getElementById('btn-save-planning');


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

  const settingMonthlyGoal = document.getElementById('setting-monthly-goal');

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
  window.showToast = showToast;

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

  setupCurrencyInput(settingMonthlyGoal);
  setupCurrencyInput(planRevenueGoal);

  // ============================================================
  // LOCAL STORAGE HELPERS
  // ============================================================
  function getStoredCloserReports() {
    try {
      const data = localStorage.getItem(STORAGE_CLOSER_REPORTS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.filter(r => r.closer !== 'Muller') : [];
    } catch (e) {
      console.error('Erro ao ler relatórios dos closers', e);
      return [];
    }
  }

  function saveStoredCloserReports(reports) {
    try {
      localStorage.setItem(STORAGE_CLOSER_REPORTS, JSON.stringify(reports));

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
      const data = localStorage.getItem(STORAGE_SDR_REPORTS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Erro ao ler relatórios dos SDRs', e);
      return [];
    }
  }

  function saveStoredSdrReports(reports) {
    try {
      localStorage.setItem(STORAGE_SDR_REPORTS, JSON.stringify(reports));

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





  // Sincronização automática quando relatórios forem enviados pela equipe no portal relatorio.html
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_CLOSER_REPORTS || e.key === STORAGE_SDR_REPORTS) {
      updateExecDashboard();
      if (typeof renderConsolidatedHistory === 'function') {
        renderConsolidatedHistory();
      }
      if (typeof renderProjectsView === 'function') {
        renderProjectsView();
      }
      showToast('Novos dados de relatório recebidos da equipe!');
    }
  });

  // ============================================================
  // DASHBOARD EXECUTIVO GERAL • CÁLCULOS, ANDAMENTO & PROJEÇÃO
  // ============================================================
  function updateExecDashboard() {
    try {
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

    // Carrega registros
    const closerReports = getStoredCloserReports();
    let monthCloserReports = closerReports.filter(r => (r.date || '').startsWith(selectedMonth));

    // Se filtrou por um cliente específico
    if (selectedClientId !== 'all') {
      monthCloserReports = monthCloserReports.filter(r => r.clientId === selectedClientId);
    }

    // Busca metas de planejamento para o mês e cliente selecionados
    let goal = 0;
    const plannings = JSON.parse(localStorage.getItem(STORAGE_PLANNING_KEY) || '[]');

    if (selectedClientId !== 'all') {
      const plan = plannings.find(p => p.client_id === selectedClientId && p.year_month === selectedMonth);
      if (plan) {
        goal = Number(plan.revenue_goal) || 0;
      } else {
        goal = getMonthlyGoal();
      }
    } else {
      const monthPlans = plannings.filter(p => p.year_month === selectedMonth);
      if (monthPlans.length > 0) {
        goal = monthPlans.reduce((sum, p) => sum + (Number(p.revenue_goal) || 0), 0);
      } else {
        goal = getMonthlyGoal();
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
      projectedTotal = totalRevenue + (dailyPace * remainingDays);
      projectionGoalPct = goal > 0 ? Math.round((projectedTotal / goal) * 100) : 0;
      requiredDailyPace = remainingDays > 0 ? (goalGap / remainingDays) : 0;
    }

    // Atualização dos 3 Cards Executivos Superiores
    if (execRevenueTotal) execRevenueTotal.textContent = formatNumberToMoney(totalRevenue);
    if (execRevenuePct) execRevenuePct.textContent = `${goalPct}% da meta`;
    if (execRevenueSalesCount) execRevenueSalesCount.textContent = `${totalSales} vendas fechadas`;

    if (execContractsTotal) execContractsTotal.textContent = formatNumberToMoney(totalContracts);
    if (execContractsCount) execContractsCount.textContent = `${totalContractCount} emitido(s)`;
    if (execContractsAvg) {
      const avg = totalContractCount > 0 ? (totalContracts / totalContractCount) : 0;
      execContractsAvg.textContent = `Ticket médio: ${formatNumberToMoney(avg)}`;
    }

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
        const allClients = JSON.parse(localStorage.getItem(STORAGE_CLIENTS_KEY) || '[]');
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
    const grandLeads = totalCloserLeads;
    const grandContacts = totalCloserEffort;
    const grandScheduled = totalMeetingsScheduled;
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

    renderExecRankingTable(monthCloserReports);
    } catch (e) {
      console.error('[Dashboard] Erro ao atualizar dashboard:', e);
    }
  }

  // Tabela de Ranking Executivo da Equipe Comercial
  function renderExecRankingTable(closerReports) {
    if (!execRankingTableBody) return;
    execRankingTableBody.innerHTML = '';

    // Membros Oficiais da Equipe Comercial (Tales, José, Elinaldo)
    const closerData = {};
    closersList.forEach(c => {
      closerData[c] = { name: c, role: 'Comercial', effort: 0, scheduled: 0, held: 0, sales: 0, contracts: 0, cash: 0 };
    });

    if (Array.isArray(closerReports)) {
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
    }

    const members = Object.values(closerData);
    members.sort((a, b) => b.cash - a.cash || b.sales - a.sales || b.scheduled - a.scheduled);

    members.forEach(m => {
      const tr = document.createElement('tr');
      const convRate = m.held > 0 ? Math.round((m.sales / m.held) * 100) : 0;

      tr.innerHTML = `
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <strong style="color:var(--text-dark);">${m.name}</strong>
          </div>
        </td>
        <td>
          <span style="font-size:11px; font-weight:700; padding:2px 8px; border-radius:10px; background:#f4f5f6; color:var(--text-dark);">${m.role}</span>
        </td>
        <td style="text-align: center;">${m.effort}</td>
        <td style="text-align: center;">${m.scheduled} / ${m.held}</td>
        <td style="text-align: center;">
          <span style="font-weight:700; color:${convRate > 0 ? '#10b981' : 'var(--text-secondary)'};">${convRate}%</span>
        </td>
        <td style="text-align: center;">
          <span style="font-weight:700; color:${m.sales > 0 ? 'var(--text-dark)' : 'var(--text-secondary)'};">${m.sales}</span>
        </td>
        <td style="text-align: right;">${formatNumberToMoney(m.contracts)}</td>
        <td style="text-align: right;">
          <strong style="color:#10b981;">${formatNumberToMoney(m.cash)}</strong>
        </td>
      `;
      execRankingTableBody.appendChild(tr);
    });
  }

  // Exportação CSV do Ranking Comercial
  if (btnExportExecCsv) {
    btnExportExecCsv.addEventListener('click', () => {
      const closerReports = getStoredCloserReports();
      const closerData = {};
      closersList.forEach(c => {
        closerData[c] = { name: c, role: 'Comercial', effort: 0, scheduled: 0, held: 0, sales: 0, contracts: 0, cash: 0 };
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

      const members = Object.values(closerData);
      members.sort((a, b) => b.cash - a.cash || b.sales - a.sales || b.scheduled - a.scheduled);

      let csv = 'Membro,Funcao,Esforco_Contatos,Reunioes_Agendadas,Reunioes_Realizadas,Tx_Conversao,Vendas,Contratos,Cash_Coletado\n';
      members.forEach(m => {
        const convRate = m.held > 0 ? Math.round((m.sales / m.held) * 100) : 0;
        csv += `"${m.name}","${m.role}",${m.effort},${m.scheduled},${m.held},"${convRate}%",${m.sales},"${formatNumberToMoney(m.contracts)}","${formatNumberToMoney(m.cash)}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `comercial_fa_ranking_${formattedToday}.csv`;
      link.click();
      showToast('Ranking da equipe exportado em CSV!');
    });
  }

  // ============================================================
  // HISTÓRICO COMERCIAL CONSOLIDADO
  // ============================================================
  function renderConsolidatedHistory() {
    if (!historyTableBody) return;
    const closerReports = getStoredCloserReports();
    const selectedMember = historyFilterMember ? historyFilterMember.value : 'all';

    let allEntries = [];

    closerReports.forEach(r => {
      allEntries.push({
        date: r.date,
        name: r.closer,
        role: 'Comercial',
        leads: r.leads || 0,
        followups: (parseInt(r.followups, 10) || 0) + (parseInt(r.prospeccoes, 10) || 0),
        scheduled: r.meetingsScheduled || 0,
        held: r.meetingsHeld || 0,
        sales: r.sales || 0,
        contracts: r.contractVal || 'R$ 0,00',
        cash: r.cashCollected || 'R$ 0,00'
      });
    });

    // Filtro por membro
    if (selectedMember !== 'all') {
      allEntries = allEntries.filter(e => e.name === selectedMember);
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
            Nenhum registro comercial encontrado com os filtros selecionados.
          </td>
        </tr>
      `;
      return;
    }

    allEntries.forEach(entry => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${formatDateBR(entry.date)}</strong></td>
        <td><strong style="color:var(--text-dark);">${entry.name}</strong></td>
        <td>
          <span style="font-size:11px; font-weight:700; padding:2px 8px; border-radius:10px; background:#f4f5f6; color:var(--text-dark);">
            ${entry.role}
          </span>
        </td>
        <td style="text-align: center;">${entry.leads}</td>
        <td style="text-align: center;">${entry.followups}</td>
        <td style="text-align: center;">${entry.scheduled}</td>
        <td style="text-align: center;">${entry.held}</td>
        <td style="text-align: center;"><strong style="color:${entry.sales > 0 ? '#10b981' : 'inherit'};">${entry.sales}</strong></td>
        <td style="text-align: right;">${entry.contracts}</td>
        <td style="text-align: right;"><strong style="color:#10b981;">${entry.cash}</strong></td>
      `;
      historyTableBody.appendChild(tr);
    });


  }

  if (historyFilterMember) {
    historyFilterMember.addEventListener('change', renderConsolidatedHistory);
  }

  // Exportar CSV do Histórico Comercial
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      const closerReports = getStoredCloserReports();

      let csv = 'Data,Membro,Papel,Leads,Followups_Prospeccoes,Reunioes_Agendadas,Reunioes_Realizadas,Vendas,Contratos,Cash_Coletado\n';

      closerReports.forEach(r => {
        csv += `"${formatDateBR(r.date)}","${r.closer}","Comercial",${r.leads ?? 0},${(parseInt(r.followups, 10) || 0) + (parseInt(r.prospeccoes, 10) || 0)},${r.meetingsScheduled ?? 0},${r.meetingsHeld ?? 0},${r.sales ?? 0},"${formatMoneyString(r.contractVal)}","${formatMoneyString(r.cashCollected)}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `comercial_fa_historico_${formattedToday}.csv`;
      link.click();
      showToast('Histórico comercial exportado em CSV!');
    });
  }

  // Limpar Histórico do Banco de Dados e Cache
  if (btnClearHistory) {
    btnClearHistory.addEventListener('click', async () => {
      if (confirm('Tem certeza de que deseja apagar todo o histórico de lançamentos do banco de dados e do painel?')) {
        localStorage.removeItem(STORAGE_CLOSER_REPORTS);
        localStorage.removeItem('closerReports_v2');
        localStorage.removeItem('sdrReports_v2');
        localStorage.removeItem('fa_team_reports_unified_v1');

        if (typeof dbClearAllReports === 'function') {
          await dbClearAllReports();
        }

        renderConsolidatedHistory();
        updateExecDashboard();
        showToast('Histórico do banco de dados apagado com sucesso.');
      }
    });
  }

  // ============================================================
  // MODAL DE CONFIGURAÇÃO DE META MENSAL
  // ============================================================
  function openSettingsModal() {
    if (settingMonthlyGoal) settingMonthlyGoal.value = formatNumberToMoney(getMonthlyGoal());
    if (modalSettings) modalSettings.classList.add('open');
  }

  function closeSettingsModal() {
    if (modalSettings) modalSettings.classList.remove('open');
  }

  [btnOpenSettings, btnNavQuickConfig, btnOpenGoalModal].forEach(btn => {
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

      localStorage.setItem(STORAGE_GOAL, newGoal.toString());

      if (typeof dbSaveSetting === 'function') {
        dbSaveSetting('monthly_goal', newGoal);
      }

      closeSettingsModal();
      updateExecDashboard();
      showToast('Meta mensal atualizada com sucesso!');
    });
  }

  // ============================================================
  // POVOAMENTO DE FILTROS DA TOPBAR (CLIENTES & MESES)
  // ============================================================
  async function populateTopBarFilters() {
    const clients = await dbFetchClients();
    const primaryId = localStorage.getItem('fa_primary_project_id_v1');

    [dashFilterClient, closerClientSelect, sdrClientSelect].forEach(selectElem => {
      if (!selectElem) return;
      const isDash = (selectElem === dashFilterClient);
      const currentVal = selectElem.value || (isDash ? 'all' : '');

      selectElem.innerHTML = isDash
        ? '<option value="all">🌐 Visão Consolidada (Todos os Clientes)</option>'
        : '<option value="">🌐 Geral / Todos os Projetos</option>';

      clients.forEach(c => {
        const isPrimary = Boolean(primaryId && String(c.id) === String(primaryId));
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = isPrimary ? `⭐ ${c.name} (Principal)` : `${c.name} (${c.segment || 'Geral'})`;
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
    const plannings = JSON.parse(localStorage.getItem(STORAGE_PLANNING_KEY) || '[]');
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
      const notes = plan ? (plan.notes || '') : '';

      // Relatórios associados ao cliente
      const reports = closerReports.filter(r => {
        if (!r.date || !r.date.startsWith(refMonth)) return false;
        return r.clientId === c.id;
      });

      const actualRev = reports.reduce((sum, r) => sum + parseMoneyToNumber(r.cashCollected), 0);
      const actualContracts = reports.reduce((sum, r) => sum + parseMoneyToNumber(r.contractVal), 0);
      const actualSales = reports.reduce((sum, r) => sum + (parseInt(r.sales, 10) || 0), 0);
      const actualMeetings = reports.reduce((sum, r) => sum + (parseInt(r.meetingsHeld, 10) || 0), 0);

      totalPlannedRev += plannedRev;
      totalActualRev += actualRev;

      clientStatsMap[c.id] = {
        plannedRev,
        plannedSales,
        plannedMeetings,
        actualContracts,
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

    // Identifica e valida o Projeto Principal
    let primaryProjectId = localStorage.getItem('fa_primary_project_id_v1');
    if (typeof dbGetPrimaryProjectId === 'function') {
      const remotePrimary = await dbGetPrimaryProjectId();
      if (remotePrimary) primaryProjectId = remotePrimary;
    }

    // Se existem clientes mas nenhum foi marcado como principal, define o primeiro ativo
    if (!primaryProjectId && clients.length > 0) {
      const defaultPrimary = clients.find(c => c.status === 'active') || clients[0];
      if (defaultPrimary) {
        primaryProjectId = defaultPrimary.id;
        if (typeof dbSetPrimaryProjectId === 'function') {
          dbSetPrimaryProjectId(primaryProjectId);
        } else {
          localStorage.setItem('fa_primary_project_id_v1', primaryProjectId);
        }
      }
    }

    // Se o ID salvo não existe mais na lista de clientes, limpa ou redefine
    if (primaryProjectId && !clients.some(c => String(c.id) === String(primaryProjectId))) {
      primaryProjectId = clients.length > 0 ? clients[0].id : null;
      if (primaryProjectId) {
        if (typeof dbSetPrimaryProjectId === 'function') dbSetPrimaryProjectId(primaryProjectId);
      } else {
        localStorage.removeItem('fa_primary_project_id_v1');
      }
    }

    // Atualiza indicador de Projeto Principal na barra superior
    const projectsPrimaryPill = document.getElementById('projects-primary-pill');
    const projectsPrimaryName = document.getElementById('projects-primary-name');
    if (projectsPrimaryPill && projectsPrimaryName) {
      const primaryClientObj = clients.find(c => String(c.id) === String(primaryProjectId));
      if (primaryClientObj) {
        projectsPrimaryName.textContent = primaryClientObj.name;
        projectsPrimaryPill.style.display = 'inline-flex';
      } else {
        projectsPrimaryPill.style.display = 'none';
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
        actualContracts: 0,
        notes: '',
        actualRev: 0,
        actualSales: 0,
        actualMeetings: 0,
        pct: 0
      };

      const isPrimary = Boolean(primaryProjectId && String(c.id) === String(primaryProjectId));
      const card = document.createElement('div');
      card.className = `project-card ${isPrimary ? 'is-primary-card' : ''}`;
      card.dataset.clientId = c.id;

      card.innerHTML = `
        <div class="project-card-header">
          <div class="project-card-title-box">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <h3 class="project-card-name">${c.name}</h3>
              ${isPrimary ? '<span class="badge-primary-project" title="Projeto Principal definido para novos relatórios">⭐ Principal</span>' : ''}
            </div>
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
            <span class="p-card-stat-label">CONTRATOS ENVIADOS</span>
            <span class="p-card-stat-val">${formatNumberToMoney(stats.actualContracts)}</span>
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
            <button type="button" class="project-btn-action btn-set-primary ${isPrimary ? 'is-active' : ''}" data-id="${c.id}" title="${isPrimary ? 'Projeto Principal atual (selecionado automaticamente nos relatórios)' : 'Definir como Projeto Principal para novos relatórios'}">
              <svg viewBox="0 0 24 24" fill="${isPrimary ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>${isPrimary ? 'Principal' : 'Tornar Principal'}</span>
            </button>
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
    projectsClientsContainer.querySelectorAll('.btn-set-primary').forEach(btn => {
      btn.addEventListener('click', async () => {
        const cId = btn.getAttribute('data-id');
        const targetCli = clients.find(c => String(c.id) === String(cId));
        if (!targetCli) return;

        btn.disabled = true;
        if (typeof dbSetPrimaryProjectId === 'function') {
          await dbSetPrimaryProjectId(cId);
        } else {
          localStorage.setItem('fa_primary_project_id_v1', cId);
        }
        await renderProjectsView();
        showToast(`⭐ Projeto "${targetCli.name}" definido como Principal para os relatórios!`);
      });
    });

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
          const currentPrimary = localStorage.getItem('fa_primary_project_id_v1');
          if (String(currentPrimary) === String(cId)) {
            if (typeof dbSetPrimaryProjectId === 'function') {
              await dbSetPrimaryProjectId('');
            } else {
              localStorage.removeItem('fa_primary_project_id_v1');
            }
          }
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
    const clientIsPrimary = document.getElementById('client-is-primary');
    const currentPrimary = localStorage.getItem('fa_primary_project_id_v1');

    if (client) {
      if (modalClientTitle) modalClientTitle.textContent = 'Editar Cliente / Projeto';
      if (clientFormId) clientFormId.value = client.id;
      if (clientName) clientName.value = client.name || '';
      if (clientSegment) clientSegment.value = client.segment || '';
      if (clientStatus) clientStatus.value = client.status || 'active';
      if (clientIsPrimary) clientIsPrimary.checked = Boolean(currentPrimary && String(client.id) === String(currentPrimary));
    } else {
      if (modalClientTitle) modalClientTitle.textContent = 'Novo Cliente / Projeto';
      if (clientFormId) clientFormId.value = '';
      if (clientName) clientName.value = '';
      if (clientSegment) clientSegment.value = '';
      if (clientStatus) clientStatus.value = 'active';
      const hasClients = Boolean(localStorage.getItem(STORAGE_CLIENTS_KEY) && JSON.parse(localStorage.getItem(STORAGE_CLIENTS_KEY) || '[]').length > 0);
      if (clientIsPrimary) clientIsPrimary.checked = !hasClients;
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

    // Salva ou remove o status de Projeto Principal
    const clientIsPrimary = document.getElementById('client-is-primary');
    if (clientIsPrimary) {
      if (clientIsPrimary.checked) {
        if (typeof dbSetPrimaryProjectId === 'function') {
          await dbSetPrimaryProjectId(id);
        } else {
          localStorage.setItem('fa_primary_project_id_v1', id);
        }
      } else {
        const currentPrimary = localStorage.getItem('fa_primary_project_id_v1');
        if (String(currentPrimary) === String(id)) {
          if (typeof dbSetPrimaryProjectId === 'function') {
            await dbSetPrimaryProjectId('');
          } else {
            localStorage.removeItem('fa_primary_project_id_v1');
          }
        }
      }
    }

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
    const plannings = JSON.parse(localStorage.getItem(STORAGE_PLANNING_KEY) || '[]');
    const plan = plannings.find(p => p.client_id === clientId && p.year_month === monthKey);

    if (plan) {
      if (planRevenueGoal) planRevenueGoal.value = formatNumberToMoney(Number(plan.revenue_goal) || 0);
      if (planSalesGoal) planSalesGoal.value = plan.sales_goal ?? 0;
      if (planMeetingsGoal) planMeetingsGoal.value = plan.meetings_goal ?? 0;
      if (planNotes) planNotes.value = plan.notes || '';
    } else {
      if (planRevenueGoal) planRevenueGoal.value = 'R$ 0,00';
      if (planSalesGoal) planSalesGoal.value = 0;
      if (planMeetingsGoal) planMeetingsGoal.value = 0;
      if (planNotes) planNotes.value = '';
    }

    updatePlanningKpiPreview();
  }

  function renderPlanningHistoryTable(clientId) {
    if (!planningHistoryTableBody) return;
    const plannings = JSON.parse(localStorage.getItem(STORAGE_PLANNING_KEY) || '[]');
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
    const notes = planNotes ? planNotes.value.trim() : '';

    await dbSavePlanning({
      client_id: clientId,
      year_month: yearMonth,
      revenue_goal: revGoal,
      sales_goal: salesGoal,
      meetings_goal: meetingsGoal,
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
      const plannings = JSON.parse(localStorage.getItem(STORAGE_PLANNING_KEY) || '[]');
      const prevPlan = plannings.find(p => p.client_id === clientId && p.year_month === prevMonth);

      if (prevPlan) {
        if (planRevenueGoal) planRevenueGoal.value = formatNumberToMoney(Number(prevPlan.revenue_goal) || 0);
        if (planSalesGoal) planSalesGoal.value = prevPlan.sales_goal ?? 0;
        if (planMeetingsGoal) planMeetingsGoal.value = prevPlan.meetings_goal ?? 0;
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
  // INICIALIZAÇÃO DO SISTEMA & SINCRONIZAÇÃO COM O SUPABASE
  // ============================================================
  async function loadDataFromSupabase() {
    try {
      if (typeof dbFetchSettings === 'function') await dbFetchSettings();
      if (typeof dbFetchClients === 'function') await dbFetchClients();
      if (typeof dbFetchPlannings === 'function') await dbFetchPlannings();
      if (typeof dbFetchCloserReports === 'function') await dbFetchCloserReports();
    } catch (e) {
      console.warn('[Supabase Sync] Falha ao sincronizar com o banco:', e);
    }

    populateTopBarFilters();
    updateExecDashboard();
    renderConsolidatedHistory();
    renderProjectsView();
  }

  populateTopBarFilters();
  populateMonthFilter();
  initSupabaseHealth();
  loadDataFromSupabase();

  // Roteamento inicial por Hash
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash === 'projects') {
    showView('view-projects');
  } else if (initialHash === 'history') {
    showView('view-history');
  } else {
    showView('view-dashboard');
  }
});
