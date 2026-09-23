/**
 * PORTAL DA EQUIPE • FAZENDO ACONTECER™
 * Lógica do Formulário Geral Unificado, Máscaras Monetárias, Revisão e Exportação (PDF & Imagem PNG)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Chaves do LocalStorage de Produção
  const STORAGE_CLOSER_REPORTS = 'fa_prod_closer_reports_v1';
  const STORAGE_SDR_REPORTS = 'fa_prod_sdr_reports_v1';
  const STORAGE_TEAM_REPORTS = 'fa_prod_team_reports_v1';

  // Estado do Membro Ativo
  let currentName = 'Tales';

  // Elementos do DOM: Seleção de Nome
  const teamNamesBox = document.getElementById('team-names-box');

  // Elementos de Data e Cliente
  const inputReportDate = document.getElementById('input-report-date');
  const btnSetToday = document.getElementById('btn-set-today');
  const displayTodayText = document.getElementById('display-today-text');
  const selectClientId = document.getElementById('report-client-id');

  // Carrega clientes cadastrados no seletor
  if (selectClientId && typeof dbFetchClients === 'function') {
    dbFetchClients().then(clients => {
      if (Array.isArray(clients)) {
        clients.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c.id;
          opt.textContent = `${c.name} (${c.segment || 'Geral'})`;
          selectClientId.appendChild(opt);
        });
      }
    }).catch(err => console.warn('Erro ao buscar clientes no portal:', err));
  }

  // Inputs das Métricas Gerais (Exatamente os 8 campos solicitados)
  const inputRepLeads = document.getElementById('rep-leads');
  const inputRepFollowups = document.getElementById('rep-followups');
  const inputRepProspeccoes = document.getElementById('rep-prospeccoes');

  const inputRepScheduled = document.getElementById('rep-scheduled');
  const inputRepHeld = document.getElementById('rep-held');
  const inputRepSales = document.getElementById('rep-sales');
  const inputRepContracts = document.getElementById('rep-contract-val') || document.getElementById('rep-contracts');
  const inputRepCash = document.getElementById('rep-cash-collected') || document.getElementById('rep-cash');

  // Preview KPI cards (Live)
  const liveKpiSales = document.getElementById('live-kpi-sales');
  const liveKpiSalesSub = document.getElementById('live-kpi-sales-sub');
  const liveKpiContract = document.getElementById('live-kpi-contract');
  const liveKpiCash = document.getElementById('live-kpi-cash');
  const liveKpiEffort = document.getElementById('live-kpi-effort');

  function updateLiveKpis() {
    const sales = parseInt(inputRepSales ? inputRepSales.value : 0, 10) || 0;
    const contract = inputRepContracts ? (inputRepContracts.value || 'R$ 0,00') : 'R$ 0,00';
    const cash = inputRepCash ? (inputRepCash.value || 'R$ 0,00') : 'R$ 0,00';
    const followups = parseInt(inputRepFollowups ? inputRepFollowups.value : 0, 10) || 0;
    const prospeccoes = parseInt(inputRepProspeccoes ? inputRepProspeccoes.value : 0, 10) || 0;
    const totalEffort = followups + prospeccoes;

    if (liveKpiSales) liveKpiSales.textContent = sales;
    if (liveKpiSalesSub) liveKpiSalesSub.textContent = `${sales} nova(s)`;
    if (liveKpiContract) liveKpiContract.textContent = contract;
    if (liveKpiCash) liveKpiCash.textContent = cash;
    if (liveKpiEffort) liveKpiEffort.textContent = totalEffort;
  }

  // Modal de Revisão
  const btnOpenReview = document.getElementById('btn-open-review');
  const modalReview = document.getElementById('modal-review');
  const reviewSummaryBody = document.getElementById('review-summary-body');
  const btnEditAgain = document.getElementById('btn-edit-again');
  const btnConfirmSave = document.getElementById('btn-confirm-save');

  // Tela de Sucesso & Exportação
  const formContainer = document.getElementById('form-container');
  const successScreen = document.getElementById('success-screen');
  const successMessageText = document.getElementById('success-message-text');
  const btnExportImage = document.getElementById('btn-export-image');
  const btnExportPdf = document.getElementById('btn-export-pdf');
  const btnCopyWhatsapp = document.getElementById('btn-copy-whatsapp');
  const btnNewReport = document.getElementById('btn-new-report');

  // Card Oficial Exportável
  const exportableReportCard = document.getElementById('exportable-report-card');
  const cardMetaRole = document.getElementById('card-meta-role');
  const cardMetaDate = document.getElementById('card-meta-date');
  const cardMemberName = document.getElementById('card-member-name');
  const cardMemberRoleBadge = document.getElementById('card-member-role-badge');
  const cardMetricsContainer = document.getElementById('card-metrics-container');
  const cardTimestamp = document.getElementById('card-timestamp');
  const portalToast = document.getElementById('portal-toast');

  // ============================================================
  // UTILITÁRIOS DE DATA E MOEDA
  // ============================================================
  function getTodayIso() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function formatDateBR(isoDate) {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }

  function formatDateExtenso(isoDate) {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    const [year, month, day] = parts;
    const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    return dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  // Inicializar Data
  const todayIso = getTodayIso();
  if (inputReportDate) {
    inputReportDate.value = todayIso;
  }
  if (displayTodayText) {
    displayTodayText.textContent = formatDateExtenso(todayIso);
  }

  if (btnSetToday) {
    btnSetToday.addEventListener('click', () => {
      inputReportDate.value = getTodayIso();
      showToast('Data definida para hoje!');
    });
  }

  // Toast Notification
  function showToast(msg) {
    if (!portalToast) return;
    portalToast.textContent = msg;
    portalToast.classList.add('show');
    setTimeout(() => portalToast.classList.remove('show'), 2800);
  }

  // ============================================================
  // MÁSCARA MONETÁRIA (R$ 0,00) EM TEMPO REAL
  // ============================================================
  function attachMoneyMask(inputElem) {
    if (!inputElem) return;
    inputElem.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (!val) {
        e.target.value = 'R$ 0,00';
        updateLiveKpis();
        return;
      }
      const num = parseInt(val, 10) / 100;
      e.target.value = num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      updateLiveKpis();
    });

    inputElem.addEventListener('focus', (e) => {
      if (!e.target.value || e.target.value === '0' || e.target.value === 'R$ 0,00') {
        e.target.value = 'R$ 0,00';
      }
    });
  }

  attachMoneyMask(inputRepContracts);
  attachMoneyMask(inputRepCash);

  // Ouvintes para atualização dos cards de KPI no topo em tempo real
  [inputRepSales, inputRepFollowups, inputRepProspeccoes].forEach(el => {
    if (el) {
      el.addEventListener('input', updateLiveKpis);
      el.addEventListener('change', updateLiveKpis);
    }
  });

  function formatMoneyString(rawStr) {
    if (!rawStr) return 'R$ 0,00';
    if (typeof rawStr === 'number') {
      return rawStr.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    const cleanStr = rawStr.toString().replace(/[^\d]/g, '');
    const cents = parseInt(cleanStr, 10) || 0;
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // ============================================================
  // SELEÇÃO UNIFICADA DE MEMBRO DA EQUIPE
  // ============================================================
  if (teamNamesBox) {
    const chips = teamNamesBox.querySelectorAll('.name-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentName = chip.dataset.name || 'Tales';
      });
    });
  }

  // ============================================================
  // COLETA DE DADOS DO FORMULÁRIO GERAL (8 CAMPOS)
  // ============================================================
  let pendingReportData = null;

  function gatherCurrentReportData() {
    const selectedDate = inputReportDate ? (inputReportDate.value || getTodayIso()) : getTodayIso();
    const effectiveName = currentName || 'Tales';
    const selectedClientId = selectClientId ? selectClientId.value : null;

    // Seção 1: Esforço & Volume de Leads
    const leads = Math.max(0, parseInt(inputRepLeads ? inputRepLeads.value : 0, 10) || 0);
    const followups = Math.max(0, parseInt(inputRepFollowups ? inputRepFollowups.value : 0, 10) || 0);
    const prospeccoes = Math.max(0, parseInt(inputRepProspeccoes ? inputRepProspeccoes.value : 0, 10) || 0);

    // Seção 2: Performance Comercial
    const scheduled = Math.max(0, parseInt(inputRepScheduled ? inputRepScheduled.value : 0, 10) || 0);
    const held = Math.max(0, parseInt(inputRepHeld ? inputRepHeld.value : 0, 10) || 0);
    const sales = Math.max(0, parseInt(inputRepSales ? inputRepSales.value : 0, 10) || 0);
    const contracts = formatMoneyString(inputRepContracts ? inputRepContracts.value : 0);
    const cash = formatMoneyString(inputRepCash ? inputRepCash.value : 0);

    // Métricas Calculadas
    const totalEffort = followups + prospeccoes;
    const attendanceRate = scheduled > 0 ? Math.min(100, Math.round((held / scheduled) * 100)) : (held > 0 ? 100 : 0);
    const convRate = held > 0 ? Math.min(100, Math.round((sales / held) * 100)) : (sales > 0 ? 100 : 0);

    let clientLabel = '🌐 Geral / Fazendo Acontecer™';
    if (selectClientId && selectClientId.selectedIndex >= 0) {
      const opt = selectClientId.options[selectClientId.selectedIndex];
      if (opt && opt.value) clientLabel = opt.textContent;
    }

    return {
      name: effectiveName,
      clientId: selectedClientId,
      clientLabel: clientLabel,
      date: selectedDate,
      leads,
      followups,
      prospeccoes,
      totalEffort,
      scheduled,
      held,
      attendanceRate,
      convRate,
      sales,
      contracts,
      cash,
      calls: 0,
      whatsapp: 0,
      contacts: 0,
      qualified: 0,
      noshow: Math.max(0, scheduled - held),
      pipeline: 'R$ 0,00'
    };
  }

  // ============================================================
  // MODAL DE CONFERÊNCIA ("CONFIRMAR SE TÁ TUDO CORRETO")
  // ============================================================
  function openReviewModal() {
    pendingReportData = gatherCurrentReportData();

    let html = `
      <div class="review-info-badge">
        <div>
          <span style="color:var(--text-muted); font-size:10px; text-transform:uppercase;">MEMBRO DA EQUIPE:</span>
          <strong style="color:var(--text-white); margin-left:4px;">${pendingReportData.name}</strong>
          <span style="margin-left:6px; font-size:10px; padding:2px 8px; border-radius:6px; background:var(--accent-lime-subtle); color:var(--accent-lime); font-weight:700;">EQUIPE</span>
        </div>
        <div>
          <span style="color:var(--text-muted); font-size:10px; text-transform:uppercase;">DATA:</span>
          <strong style="color:var(--text-white); margin-left:4px;">${formatDateBR(pendingReportData.date)}</strong>
        </div>
      </div>

      <div style="font-size:12px; color:var(--text-secondary); margin-bottom:14px; background:rgba(255,255,255,0.03); padding:8px 12px; border-radius:8px; border:1px solid var(--border-light);">
        <span style="color:var(--text-muted);">PROJETO OU CLIENTE:</span> <strong style="color:var(--text-white); margin-left:4px;">${pendingReportData.clientLabel}</strong>
      </div>

      <div class="review-grid">
        <div class="review-stat-item">
          <span class="review-stat-label">LEAD RECEBIDOS</span>
          <span class="review-stat-val">${pendingReportData.leads}</span>
        </div>
        <div class="review-stat-item">
          <span class="review-stat-label">FOLLOW-UP FEITOS</span>
          <span class="review-stat-val">${pendingReportData.followups}</span>
        </div>
        <div class="review-stat-item">
          <span class="review-stat-label">PROSPECÇÃO NO DIA</span>
          <span class="review-stat-val">${pendingReportData.prospeccoes}</span>
        </div>
        <div class="review-stat-item">
          <span class="review-stat-label">REUNIÃO AGENDADA</span>
          <span class="review-stat-val">${pendingReportData.scheduled}</span>
        </div>
        <div class="review-stat-item">
          <span class="review-stat-label">REUNIÃO REALIZADA</span>
          <span class="review-stat-val">${pendingReportData.held}</span>
        </div>
        <div class="review-stat-item">
          <span class="review-stat-label">CONVERSÃO (V/R)</span>
          <span class="review-stat-val">${pendingReportData.convRate}%</span>
        </div>
      </div>

      <div style="margin-top:16px; padding-top:14px; border-top:1px solid var(--border-light);">
        <span style="font-size:10px; font-weight:700; color:var(--text-muted); letter-spacing:0.06em; text-transform:uppercase;">RESULTADO FINAL / RESUMO</span>
        <div class="review-grid" style="margin-top:10px;">
          <div class="review-stat-item">
            <span class="review-stat-label">TOTAL VENDAS</span>
            <span class="review-stat-val highlight-green">${pendingReportData.sales} un</span>
          </div>
          <div class="review-stat-item">
            <span class="review-stat-label">VALOR CONTRATO</span>
            <span class="review-stat-val">${pendingReportData.contracts}</span>
          </div>
          <div class="review-stat-item" style="border: 1px solid rgba(163,230,53,0.3); background: rgba(30,41,25,0.4);">
            <span class="review-stat-label" style="color:var(--accent-lime); font-weight:800;">CASH COLETADO</span>
            <span class="review-stat-val highlight-green" style="color:var(--accent-lime);">${pendingReportData.cash}</span>
          </div>
          <div class="review-stat-item">
            <span class="review-stat-label">ESFORÇO ATIVO</span>
            <span class="review-stat-val highlight-green">${pendingReportData.totalEffort}</span>
          </div>
        </div>
      </div>
    `;

    reviewSummaryBody.innerHTML = html;
    modalReview.classList.add('open');
  }

  if (btnOpenReview) {
    btnOpenReview.addEventListener('click', openReviewModal);
  }

  if (btnEditAgain) {
    btnEditAgain.addEventListener('click', () => {
      modalReview.classList.remove('open');
    });
  }

  // ============================================================
  // CONFIRMAR & SALVAR NOS STORAGES E NA NUVEM
  // ============================================================
  function saveReportToStorage(data) {
    if (!data) return;

    const reportId = `${data.name}_${data.date}`;
    const updatedAt = new Date().toISOString();

    // 1. Registro Geral da Equipe
    const unifiedRecord = {
      id: reportId,
      member: data.name,
      closer: data.name,
      sdr: data.name,
      clientId: data.clientId || null,
      date: data.date,
      // Atividades
      leads: data.leads,
      calls: data.calls,
      whatsapp: data.whatsapp,
      contacts: data.contacts,
      followups: data.followups,
      prospeccoes: data.prospeccoes,
      // Reuniões
      meetingsScheduled: data.scheduled,
      meetingsHeld: data.held,
      scheduled: data.scheduled,
      qualified: data.qualified,
      noshow: data.noshow,
      // Financeiro
      sales: data.sales,
      contractVal: data.contracts,
      contracts: data.contracts,
      cashCollected: data.cash,
      cash: data.cash,
      pipeline: data.pipeline,
      pipelineVal: data.pipeline,
      updatedAt: updatedAt
    };

    // Salva na coleção geral da equipe
    try {
      let teamReports = [];
      const rawTeam = localStorage.getItem(STORAGE_TEAM_REPORTS);
      teamReports = rawTeam ? JSON.parse(rawTeam) : [];
      const idxT = teamReports.findIndex(r => r.id === reportId);
      if (idxT >= 0) teamReports[idxT] = unifiedRecord;
      else teamReports.unshift(unifiedRecord);
      localStorage.setItem(STORAGE_TEAM_REPORTS, JSON.stringify(teamReports));

      if (typeof dbSyncTeamReport === 'function') {
        dbSyncTeamReport(unifiedRecord);
      }
    } catch (e) {
      console.warn('Erro ao salvar teamReports:', e);
    }

    // 2. Sincroniza com closerReports (Alimenta métricas de receita, vendas e reuniões no Dashboard)
    try {
      let closerReports = [];
      const rawC = localStorage.getItem(STORAGE_CLOSER_REPORTS);
      closerReports = rawC ? JSON.parse(rawC) : [];
      const closerRecord = {
        id: reportId,
        closer: data.name,
        clientId: data.clientId || null,
        date: data.date,
        leads: data.leads,
        followups: data.followups,
        prospeccoes: data.prospeccoes,
        meetingsScheduled: data.scheduled,
        meetingsHeld: data.held,
        sales: data.sales,
        contractVal: data.contracts,
        cashCollected: data.cash,
        updatedAt: updatedAt
      };
      const idxC = closerReports.findIndex(r => r.id === reportId);
      if (idxC >= 0) closerReports[idxC] = closerRecord;
      else closerReports.unshift(closerRecord);
      localStorage.setItem(STORAGE_CLOSER_REPORTS, JSON.stringify(closerReports));

      if (typeof dbSyncCloserReport === 'function') {
        dbSyncCloserReport(closerRecord);
      }
    } catch (e) {
      console.warn('Erro ao sincronizar com closerReports:', e);
    }

    // 3. Sincroniza com sdrReports (Alimenta métricas de pipeline, contatos e reuniões agendadas)
    try {
      let sdrReports = [];
      const rawS = localStorage.getItem(STORAGE_SDR_REPORTS);
      sdrReports = rawS ? JSON.parse(rawS) : [];
      const sdrKey = data.name.startsWith('SDR') ? data.name : 'SDR 1';
      const customName = data.name.startsWith('SDR') ? '' : data.name;
      const sdrRecord = {
        id: reportId,
        sdr: sdrKey,
        clientId: data.clientId || null,
        customName: customName,
        date: data.date,
        leads: data.leads,
        calls: data.calls || 0,
        whatsapp: data.whatsapp || 0,
        contacts: (data.followups || 0) + (data.prospeccoes || 0),
        scheduled: data.scheduled,
        qualified: data.held || 0,
        noshow: 0,
        pipeline: data.contracts || 'R$ 0,00',
        pipelineVal: data.contracts || 'R$ 0,00',
        updatedAt: updatedAt
      };
      const idxS = sdrReports.findIndex(r => r.id === reportId);
      if (idxS >= 0) sdrReports[idxS] = sdrRecord;
      else sdrReports.unshift(sdrRecord);
      localStorage.setItem(STORAGE_SDR_REPORTS, JSON.stringify(sdrReports));

      if (typeof dbSyncSdrReport === 'function') {
        dbSyncSdrReport(sdrRecord);
      }
    } catch (e) {
      console.warn('Erro ao sincronizar com sdrReports:', e);
    }
  }

  // ============================================================
  // PREENCHER CARD OFICIAL DE EXPORTAÇÃO
  // ============================================================
  function populateExportCard(data) {
    if (!data) return;

    cardMetaRole.textContent = 'RELATÓRIO COMERCIAL';
    cardMetaRole.style.background = 'var(--accent-lime)';
    cardMetaRole.style.color = '#0f1115';
    cardMetaDate.textContent = formatDateBR(data.date);
    cardMemberName.textContent = data.name.toUpperCase();
    cardMemberRoleBadge.textContent = 'EQUIPE COMERCIAL';
    cardTimestamp.textContent = `Salvo às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    let metricsHtml = `
      <!-- Métricas Operacionais (Esforço & Reuniões) -->
      <div class="card-metric-box">
        <span class="metric-box-label">LEAD RECEBIDOS</span>
        <span class="metric-box-val">${data.leads}</span>
      </div>
      <div class="card-metric-box">
        <span class="metric-box-label">FOLLOW-UP FEITOS</span>
        <span class="metric-box-val">${data.followups}</span>
      </div>
      <div class="card-metric-box">
        <span class="metric-box-label">PROSPECÇÃO NO DIA</span>
        <span class="metric-box-val">${data.prospeccoes}</span>
      </div>
      <div class="card-metric-box">
        <span class="metric-box-label">REUNIÃO AGENDADA</span>
        <span class="metric-box-val">${data.scheduled}</span>
      </div>
      <div class="card-metric-box">
        <span class="metric-box-label">REUNIÃO REALIZADA</span>
        <span class="metric-box-val">${data.held}</span>
      </div>
      <div class="card-metric-box">
        <span class="metric-box-label">CONVERSÃO (V/R)</span>
        <span class="metric-box-val lime-val">${data.convRate}%</span>
      </div>

      <!-- RESULTADO FINAL / RESUMO NO FINAL DO RELATÓRIO -->
      <div style="grid-column: 1 / -1; margin-top: 6px; padding-top: 10px; border-top: 1px solid #1e283d;">
        <span style="font-size: 9px; font-weight: 700; color: #8da2bd; letter-spacing: 0.05em; text-transform: uppercase; display: block; margin-bottom: 8px;">
          RESULTADO FINAL / RESUMO
        </span>
        <div class="card-summary-grid">
          <div class="card-metric-box">
            <span class="metric-box-label">TOTAL VENDAS</span>
            <span class="metric-box-val">${data.sales}</span>
            <span style="font-size: 8.5px; color: #8da2bd; margin-top: 2px;">${data.sales} nova(s)</span>
          </div>
          <div class="card-metric-box">
            <span class="metric-box-label">VALOR CONTRATO</span>
            <span class="metric-box-val">${data.contracts}</span>
            <span style="font-size: 8.5px; color: #8da2bd; margin-top: 2px;">Contratos enviados</span>
          </div>
          <div class="card-metric-box" style="background: rgba(30, 41, 25, 0.6); border: 1px solid rgba(163, 230, 53, 0.35);">
            <span class="metric-box-label" style="color: #a3e635; font-weight: 800;">CASH COLETADO</span>
            <span class="metric-box-val lime-val">${data.cash}</span>
            <span style="font-size: 8.5px; color: #a3e635; opacity: 0.85; margin-top: 2px;">Receita recebida</span>
          </div>
          <div class="card-metric-box">
            <span class="metric-box-label">ESFORÇO ATIVO</span>
            <span class="metric-box-val">${data.totalEffort}</span>
            <span style="font-size: 8.5px; color: #8da2bd; margin-top: 2px;">Follow-ups + Prospecções</span>
          </div>
        </div>
      </div>
    `;

    cardMetricsContainer.innerHTML = metricsHtml;
  }

  if (btnConfirmSave) {
    btnConfirmSave.addEventListener('click', () => {
      if (!pendingReportData) return;
      saveReportToStorage(pendingReportData);
      populateExportCard(pendingReportData);

      modalReview.classList.remove('open');
      formContainer.style.display = 'none';
      successScreen.style.display = 'block';

      successMessageText.textContent = `Relatório de ${pendingReportData.name} (${formatDateBR(pendingReportData.date)}) registrado com sucesso!`;
      showToast('Relatório salvo com sucesso!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ============================================================
  // EXPORTAÇÃO 1: BAIXAR COMO IMAGEM (PNG) VIA HTML2CANVAS
  // ============================================================
  if (btnExportImage) {
    btnExportImage.addEventListener('click', () => {
      if (!exportableReportCard || typeof html2canvas === 'undefined') {
        showToast('Biblioteca de imagem carregando...');
        return;
      }

      showToast('Gerando imagem em alta resolução...');

      html2canvas(exportableReportCard, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#0f1422',
        logging: false
      }).then(canvas => {
        const link = document.createElement('a');
        const filename = `Relatorio_${pendingReportData.name}_${pendingReportData.date}.png`;
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Imagem PNG baixada com sucesso!');
      }).catch(err => {
        console.error('Erro ao gerar imagem:', err);
        showToast('Erro ao exportar imagem. Tente a opção em PDF.');
      });
    });
  }

  // ============================================================
  // EXPORTAÇÃO 2: GERAR RELATÓRIO EM PDF
  // ============================================================
  if (btnExportPdf) {
    btnExportPdf.addEventListener('click', () => {
      window.print();
    });
  }

  // ============================================================
  // EXPORTAÇÃO 3: COPIAR RESUMO TEXTUAL PARA WHATSAPP
  // ============================================================
  if (btnCopyWhatsapp) {
    btnCopyWhatsapp.addEventListener('click', () => {
      if (!pendingReportData) return;

      let text = `📊 *FAZENDO ACONTECER™ • RELATÓRIO DO DIA*\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `👤 *Membro:* ${pendingReportData.name}\n`;
      text += `📅 *Data:* ${formatDateBR(pendingReportData.date)}\n`;
      if (pendingReportData.clientLabel && !pendingReportData.clientLabel.includes('Geral')) {
        text += `🏢 *Projeto:* ${pendingReportData.clientLabel}\n`;
      }
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `📥 *Leads Recebidos:* ${pendingReportData.leads}\n`;
      text += `🔄 *Follow-ups Feitos:* ${pendingReportData.followups}\n`;
      text += `🚀 *Prospecções no Dia:* ${pendingReportData.prospeccoes}\n`;
      text += `📅 *Reuniões Agendadas:* ${pendingReportData.scheduled}\n`;
      text += `🤝 *Reuniões Realizadas:* ${pendingReportData.held}\n`;
      text += `📈 *Conversão (V/R):* ${pendingReportData.convRate}%\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `🏁 *RESULTADO FINAL / RESUMO:*\n`;
      text += `🎯 *TOTAL VENDAS:* ${pendingReportData.sales} un\n`;
      text += `📄 *VALOR CONTRATO:* ${pendingReportData.contracts}\n`;
      text += `💵 *CASH COLETADO:* ${pendingReportData.cash}\n`;
      text += `⚡ *ESFORÇO ATIVO:* ${pendingReportData.totalEffort} (Follow-ups + Prospecções)\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `_Gerado via Portal Comercial • Fazendo Acontecer™_`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          showToast('Resumo copiado! Cole no WhatsApp.');
        }).catch(() => {
          fallbackCopyText(text);
        });
      } else {
        fallbackCopyText(text);
      }
    });
  }

  function fallbackCopyText(text) {
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = text;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    try {
      document.execCommand('copy');
      showToast('Resumo copiado! Cole no WhatsApp.');
    } catch (e) {
      showToast('Não foi possível copiar automaticamente.');
    }
    document.body.removeChild(tempTextArea);
  }

  // ============================================================
  // NOVO RELATÓRIO
  // ============================================================
  if (btnNewReport) {
    btnNewReport.addEventListener('click', () => {
      // Resetar formulário com os 8 campos exatos
      if (inputRepLeads) inputRepLeads.value = 0;
      if (inputRepFollowups) inputRepFollowups.value = 0;
      if (inputRepProspeccoes) inputRepProspeccoes.value = 0;

      if (inputRepScheduled) inputRepScheduled.value = 0;
      if (inputRepHeld) inputRepHeld.value = 0;
      if (inputRepSales) inputRepSales.value = 0;

      if (inputRepContracts) inputRepContracts.value = 'R$ 0,00';
      if (inputRepCash) inputRepCash.value = 'R$ 0,00';

      updateLiveKpis();

      successScreen.style.display = 'none';
      formContainer.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Inicializar preview dos KPIs no topo
  updateLiveKpis();

});
