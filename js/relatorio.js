/**
 * PORTAL DA EQUIPE • FAZENDO ACONTECER™
 * Lógica do Formulário, Máscaras Monetárias, Revisão e Exportação (PDF & Imagem PNG)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Chaves do LocalStorage (Sincronizadas com o Dashboard Executivo)
  const STORAGE_CLOSER_REPORTS = 'closerReports_v2';
  const STORAGE_SDR_REPORTS = 'sdrReports_v2';

  // Elementos de Navegação e Estado
  let currentRole = 'closer'; // 'closer' | 'sdr'
  let currentName = 'Tales';

  // Elementos do DOM
  const btnRoleCloser = document.getElementById('btn-role-closer');
  const btnRoleSdr = document.getElementById('btn-role-sdr');
  const boxClosersNames = document.getElementById('closers-names-box');
  const boxSdrsNames = document.getElementById('sdrs-names-box');
  const sectionCloserFields = document.getElementById('section-closer-fields');
  const sectionSdrFields = document.getElementById('section-sdr-fields');
  const boxSdrCustomName = document.getElementById('box-sdr-custom-name');
  const inputCustomName = document.getElementById('input-custom-name');

  const inputReportDate = document.getElementById('input-report-date');
  const btnSetToday = document.getElementById('btn-set-today');
  const displayTodayText = document.getElementById('display-today-text');
  const selectClientId = document.getElementById('report-client-id');

  // Carrega clientes disponíveis no seletor
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

  // Closer Inputs
  const inputCLeads = document.getElementById('c-leads');
  const inputCFollowups = document.getElementById('c-followups');
  const inputCProspeccoes = document.getElementById('c-prospeccoes');
  const inputCScheduled = document.getElementById('c-scheduled');
  const inputCHeld = document.getElementById('c-held');
  const inputCSales = document.getElementById('c-sales');
  const inputCContracts = document.getElementById('c-contracts');
  const inputCCash = document.getElementById('c-cash');

  // SDR Inputs
  const inputSLeads = document.getElementById('s-leads');
  const inputSCalls = document.getElementById('s-calls');
  const inputSWhatsapp = document.getElementById('s-whatsapp');
  const inputSContacts = document.getElementById('s-contacts');
  const inputSScheduled = document.getElementById('s-scheduled');
  const inputSQualified = document.getElementById('s-qualified');
  const inputSNoshow = document.getElementById('s-noshow');
  const inputSPipeline = document.getElementById('s-pipeline');

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
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  }

  function formatDateExtenso(isoDate) {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
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
        return;
      }
      const num = parseInt(val, 10) / 100;
      e.target.value = num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    });

    inputElem.addEventListener('focus', (e) => {
      if (!e.target.value || e.target.value === '0' || e.target.value === 'R$ 0,00') {
        e.target.value = 'R$ 0,00';
      }
    });
  }

  attachMoneyMask(inputCContracts);
  attachMoneyMask(inputCCash);
  attachMoneyMask(inputSPipeline);

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
  // ALTERNÂNCIA DE PAPEL (CLOSER VS SDR)
  // ============================================================
  function switchRole(role) {
    currentRole = role;
    if (role === 'closer') {
      btnRoleCloser.classList.add('active');
      btnRoleSdr.classList.remove('active');
      boxClosersNames.style.display = 'block';
      boxSdrsNames.style.display = 'none';
      sectionCloserFields.style.display = 'block';
      sectionSdrFields.style.display = 'none';

      // Restaurar seleção do Closer ativo
      const activeCloserChip = boxClosersNames.querySelector('.name-chip.active');
      currentName = activeCloserChip ? activeCloserChip.dataset.name : 'Tales';
    } else {
      btnRoleSdr.classList.add('active');
      btnRoleCloser.classList.remove('active');
      boxClosersNames.style.display = 'none';
      boxSdrsNames.style.display = 'block';
      sectionCloserFields.style.display = 'none';
      sectionSdrFields.style.display = 'block';

      // Restaurar seleção do SDR ativo
      const activeSdrChip = boxSdrsNames.querySelector('.name-chip.active');
      if (activeSdrChip) {
        if (activeSdrChip.dataset.name === 'outro') {
          boxSdrCustomName.style.display = 'block';
          currentName = inputCustomName.value.trim() || 'SDR Convidado';
        } else {
          boxSdrCustomName.style.display = 'none';
          currentName = activeSdrChip.dataset.name;
        }
      }
    }
  }

  if (btnRoleCloser) {
    btnRoleCloser.addEventListener('click', () => switchRole('closer'));
  }
  if (btnRoleSdr) {
    btnRoleSdr.addEventListener('click', () => switchRole('sdr'));
  }

  // Seleção de Chips de Nome
  const closerChips = boxClosersNames.querySelectorAll('.name-chip');
  closerChips.forEach(chip => {
    chip.addEventListener('click', () => {
      closerChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentName = chip.dataset.name;
    });
  });

  const sdrChips = boxSdrsNames.querySelectorAll('.name-chip');
  sdrChips.forEach(chip => {
    chip.addEventListener('click', () => {
      sdrChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      if (chip.dataset.name === 'outro') {
        boxSdrCustomName.style.display = 'block';
        inputCustomName.focus();
        currentName = inputCustomName.value.trim() || 'SDR Convidado';
      } else {
        boxSdrCustomName.style.display = 'none';
        currentName = chip.dataset.name;
      }
    });
  });

  if (inputCustomName) {
    inputCustomName.addEventListener('input', (e) => {
      currentName = e.target.value.trim() || 'SDR Convidado';
    });
  }

  // ============================================================
  // MODAL DE CONFERÊNCIA ("CONFIRMAR SE TÁ TUDO CORRETO")
  // ============================================================
  let pendingReportData = null;

  function gatherCurrentReportData() {
    const selectedDate = inputReportDate.value || getTodayIso();
    const effectiveName = currentName || (currentRole === 'closer' ? 'Tales' : 'SDR 1');

    if (currentRole === 'closer') {
      const leads = Math.max(0, parseInt(inputCLeads.value, 10) || 0);
      const followups = Math.max(0, parseInt(inputCFollowups.value, 10) || 0);
      const prospeccoes = Math.max(0, parseInt(inputCProspeccoes.value, 10) || 0);
      const scheduled = Math.max(0, parseInt(inputCScheduled.value, 10) || 0);
      const held = Math.max(0, parseInt(inputCHeld.value, 10) || 0);
      const sales = Math.max(0, parseInt(inputCSales.value, 10) || 0);
      const contracts = formatMoneyString(inputCContracts.value);
      const cash = formatMoneyString(inputCCash.value);

      const totalEffort = followups + prospeccoes;
      const attendanceRate = scheduled > 0 ? Math.min(100, Math.round((held / scheduled) * 100)) : (held > 0 ? 100 : 0);
      const convRate = held > 0 ? Math.min(100, Math.round((sales / held) * 100)) : (sales > 0 ? 100 : 0);
      const selectedClientId = selectClientId ? selectClientId.value : null;

      return {
        role: 'closer',
        name: effectiveName,
        clientId: selectedClientId,
        date: selectedDate,
        leads,
        followups,
        prospeccoes,
        totalEffort,
        scheduled,
        held,
        sales,
        contracts,
        cash,
        attendanceRate,
        convRate
      };
    } else {
      const leads = Math.max(0, parseInt(inputSLeads.value, 10) || 0);
      const calls = Math.max(0, parseInt(inputSCalls.value, 10) || 0);
      const whatsapp = Math.max(0, parseInt(inputSWhatsapp.value, 10) || 0);
      const contacts = Math.max(0, parseInt(inputSContacts.value, 10) || 0);
      const scheduled = Math.max(0, parseInt(inputSScheduled.value, 10) || 0);
      const qualified = Math.max(0, parseInt(inputSQualified.value, 10) || 0);
      const noshow = Math.max(0, parseInt(inputSNoshow.value, 10) || 0);
      const pipeline = formatMoneyString(inputSPipeline.value);
      const selectedClientId = selectClientId ? selectClientId.value : null;

      const contactRate = leads > 0 ? Math.min(100, Math.round((contacts / leads) * 100)) : 0;
      const scheduleRate = contacts > 0 ? Math.min(100, Math.round((scheduled / contacts) * 100)) : 0;

      return {
        role: 'sdr',
        name: effectiveName,
        clientId: selectedClientId,
        date: selectedDate,
        leads,
        calls,
        whatsapp,
        contacts,
        scheduled,
        qualified,
        noshow,
        pipeline,
        contactRate,
        scheduleRate
      };
    }
  }

  function openReviewModal() {
    pendingReportData = gatherCurrentReportData();
    const isCloser = pendingReportData.role === 'closer';

    let html = `
      <div class="review-info-badge">
        <div>
          <span style="color:var(--text-muted); font-size:10px; text-transform:uppercase;">MEMBRO:</span>
          <strong style="color:var(--text-white); margin-left:4px;">${pendingReportData.name}</strong>
          <span style="margin-left:6px; font-size:10px; padding:2px 6px; border-radius:6px; background:${isCloser ? 'var(--accent-lime-subtle)' : 'var(--accent-cyan-subtle)'}; color:${isCloser ? 'var(--accent-lime)' : 'var(--accent-cyan)'}; font-weight:700;">${isCloser ? 'CLOSER' : 'SDR'}</span>
        </div>
        <div>
          <span style="color:var(--text-muted); font-size:10px; text-transform:uppercase;">DATA:</span>
          <strong style="color:var(--text-white); margin-left:4px;">${formatDateBR(pendingReportData.date)}</strong>
        </div>
      </div>
    `;

    if (isCloser) {
      html += `
        <div class="review-grid">
          <div class="review-stat-item">
            <span class="review-stat-label">VENDAS FECHADAS</span>
            <span class="review-stat-val highlight-green">${pendingReportData.sales} un</span>
          </div>
          <div class="review-stat-item">
            <span class="review-stat-label">CASH COLETADO</span>
            <span class="review-stat-val highlight-green">${pendingReportData.cash}</span>
          </div>
          <div class="review-stat-item">
            <span class="review-stat-label">VALOR EM CONTRATOS</span>
            <span class="review-stat-val">${pendingReportData.contracts}</span>
          </div>
          <div class="review-stat-item">
            <span class="review-stat-label">REUNIÕES (HELD / AGEND)</span>
            <span class="review-stat-val">${pendingReportData.held} / ${pendingReportData.scheduled}</span>
          </div>
          <div class="review-stat-item">
            <span class="review-stat-label">TAXA DE CONVERSÃO</span>
            <span class="review-stat-val">${pendingReportData.convRate}%</span>
          </div>
          <div class="review-stat-item">
            <span class="review-stat-label">ESFORÇO ATIVO</span>
            <span class="review-stat-val">${pendingReportData.totalEffort} contatos</span>
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="review-grid">
          <div class="review-stat-item">
            <span class="review-stat-label">REUNIÕES AGENDADAS</span>
            <span class="review-stat-val highlight-green">${pendingReportData.scheduled} agend.</span>
          </div>
          <div class="review-stat-item">
            <span class="review-stat-label">PIPELINE GERADO</span>
            <span class="review-stat-val highlight-green">${pendingReportData.pipeline}</span>
          </div>
          <div class="review-stat-item">
            <span class="review-stat-label">CONTATOS EFETIVOS</span>
            <span class="review-stat-val">${pendingReportData.contacts}</span>
          </div>
          <div class="review-stat-item">
            <span class="review-stat-label">QUALIFICADAS NO ICP</span>
            <span class="review-stat-val">${pendingReportData.qualified}</span>
          </div>
          <div class="review-stat-item">
            <span class="review-stat-label">LEADS ABORDADOS</span>
            <span class="review-stat-val">${pendingReportData.leads}</span>
          </div>
          <div class="review-stat-item">
            <span class="review-stat-label">NO-SHOWS (FALTAS)</span>
            <span class="review-stat-val" style="color:#f87171;">${pendingReportData.noshow}</span>
          </div>
        </div>
      `;
    }

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
  // CONFIRMAR & SALVAR NO LOCALSTORAGE
  // ============================================================
  function saveReportToStorage(data) {
    if (!data) return;

    if (data.role === 'closer') {
      let reports = [];
      try {
        const raw = localStorage.getItem('closerReports_v2') || localStorage.getItem('fa_closers_uifry_reports_v1');
        reports = raw ? JSON.parse(raw) : [];
      } catch (err) {
        reports = [];
      }

      const reportId = `${data.name}_${data.date}`;
      const record = {
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
        updatedAt: new Date().toISOString()
      };

      const existingIndex = reports.findIndex(r => r.id === reportId);
      if (existingIndex >= 0) {
        reports[existingIndex] = record;
      } else {
        reports.unshift(record);
      }
      localStorage.setItem('closerReports_v2', JSON.stringify(reports));
      localStorage.setItem('fa_closers_uifry_reports_v1', JSON.stringify(reports));

      // Sincronização em nuvem via Supabase
      if (typeof dbSyncCloserReport === 'function') {
        dbSyncCloserReport(record);
      }

    } else {
      let reports = [];
      try {
        const raw = localStorage.getItem('sdrReports_v2') || localStorage.getItem('fa_sdr_reports_v1');
        reports = raw ? JSON.parse(raw) : [];
      } catch (err) {
        reports = [];
      }

      const sdrKey = data.name.startsWith('SDR') ? data.name : 'SDR 1';
      const customName = data.name.startsWith('SDR') ? '' : data.name;
      const reportId = `${data.name}_${data.date}`;

      const record = {
        id: reportId,
        sdr: sdrKey,
        clientId: data.clientId || null,
        customName: customName,
        date: data.date,
        leads: data.leads,
        calls: data.calls,
        whatsapp: data.whatsapp,
        contacts: data.contacts,
        scheduled: data.scheduled,
        qualified: data.qualified,
        noshow: data.noshow,
        pipeline: data.pipeline,
        pipelineVal: data.pipeline,
        updatedAt: new Date().toISOString()
      };

      const existingIndex = reports.findIndex(r => r.id === reportId);
      if (existingIndex >= 0) {
        reports[existingIndex] = record;
      } else {
        reports.unshift(record);
      }
      localStorage.setItem('sdrReports_v2', JSON.stringify(reports));
      localStorage.setItem('fa_sdr_reports_v1', JSON.stringify(reports));

      // Sincronização em nuvem via Supabase
      if (typeof dbSyncSdrReport === 'function') {
        dbSyncSdrReport(record);
      }
    }
  }

  // Preencher Card Oficial de Exportação
  function populateExportCard(data) {
    if (!data) return;
    const isCloser = data.role === 'closer';

    cardMetaRole.textContent = isCloser ? 'CLOSER' : 'SDR';
    cardMetaRole.style.background = isCloser ? 'var(--accent-lime)' : 'var(--accent-cyan)';
    cardMetaDate.textContent = formatDateBR(data.date);
    cardMemberName.textContent = data.name.toUpperCase();
    cardMemberRoleBadge.textContent = isCloser ? 'EQUIPE DE FECHAMENTO' : 'EQUIPE DE PROSPECÇÃO';
    cardTimestamp.textContent = `Salvo em ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    let metricsHtml = '';

    if (isCloser) {
      metricsHtml = `
        <div class="card-metric-box">
          <span class="metric-box-label">VENDAS FECHADAS</span>
          <span class="metric-box-val lime-val">${data.sales} un</span>
        </div>
        <div class="card-metric-box">
          <span class="metric-box-label">CASH COLETADO</span>
          <span class="metric-box-val lime-val">${data.cash}</span>
        </div>
        <div class="card-metric-box">
          <span class="metric-box-label">VALOR CONTRATOS</span>
          <span class="metric-box-val">${data.contracts}</span>
        </div>
        <div class="card-metric-box">
          <span class="metric-box-label">REUNIÕES REALIZADAS</span>
          <span class="metric-box-val">${data.held} / ${data.scheduled}</span>
        </div>
        <div class="card-metric-box">
          <span class="metric-box-label">TAXA DE CONVERSÃO</span>
          <span class="metric-box-val lime-val">${data.convRate}%</span>
        </div>
        <div class="card-metric-box">
          <span class="metric-box-label">ESFORÇO ATIVO</span>
          <span class="metric-box-val">${data.totalEffort} contatos</span>
        </div>
      `;
    } else {
      metricsHtml = `
        <div class="card-metric-box">
          <span class="metric-box-label">REUNIÕES AGENDADAS</span>
          <span class="metric-box-val lime-val">${data.scheduled}</span>
        </div>
        <div class="card-metric-box">
          <span class="metric-box-label">PIPELINE GERADO</span>
          <span class="metric-box-val cyan-val">${data.pipeline}</span>
        </div>
        <div class="card-metric-box">
          <span class="metric-box-label">CONTATOS EFETIVOS</span>
          <span class="metric-box-val">${data.contacts}</span>
        </div>
        <div class="card-metric-box">
          <span class="metric-box-label">QUALIFICADAS ICP</span>
          <span class="metric-box-val">${data.qualified}</span>
        </div>
        <div class="card-metric-box">
          <span class="metric-box-label">LEADS ABORDADOS</span>
          <span class="metric-box-val">${data.leads}</span>
        </div>
        <div class="card-metric-box">
          <span class="metric-box-label">NO-SHOWS (FALTAS)</span>
          <span class="metric-box-val" style="color:#f87171;">${data.noshow}</span>
        </div>
      `;
    }

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
      const isCloser = pendingReportData.role === 'closer';

      let text = `*FAZENDO ACONTECER™ • RELATÓRIO DO DIA*\n`;
      text += `📅 *Data:* ${formatDateBR(pendingReportData.date)}\n`;
      text += `👤 *Responsável:* ${pendingReportData.name} (${isCloser ? 'Closer' : 'SDR'})\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;

      if (isCloser) {
        text += `💰 *Cash Coletado:* ${pendingReportData.cash}\n`;
        text += `📄 *Valor em Contratos:* ${pendingReportData.contracts}\n`;
        text += `🎯 *Vendas Fechadas:* ${pendingReportData.sales} un\n`;
        text += `🤝 *Reuniões Realizadas:* ${pendingReportData.held} de ${pendingReportData.scheduled} agendadas\n`;
        text += `📈 *Taxa de Conversão:* ${pendingReportData.convRate}%\n`;
        text += `📞 *Esforço Ativo:* ${pendingReportData.totalEffort} follow-ups/prospecções\n`;
      } else {
        text += `📅 *Reuniões Agendadas:* ${pendingReportData.scheduled}\n`;
        text += `💎 *Pipeline Gerado:* ${pendingReportData.pipeline}\n`;
        text += `⭐ *Qualificadas no ICP:* ${pendingReportData.qualified}\n`;
        text += `📞 *Contatos Efetivos:* ${pendingReportData.contacts}\n`;
        text += `👥 *Leads Abordados:* ${pendingReportData.leads}\n`;
        text += `❌ *No-Shows (Faltas):* ${pendingReportData.noshow}\n`;
      }
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
      // Resetar formulário
      inputCLeads.value = 0;
      inputCFollowups.value = 0;
      inputCProspeccoes.value = 0;
      inputCScheduled.value = 0;
      inputCHeld.value = 0;
      inputCSales.value = 0;
      inputCContracts.value = 'R$ 0,00';
      inputCCash.value = 'R$ 0,00';

      inputSLeads.value = 0;
      inputSCalls.value = 0;
      inputSWhatsapp.value = 0;
      inputSContacts.value = 0;
      inputSScheduled.value = 0;
      inputSQualified.value = 0;
      inputSNoshow.value = 0;
      inputSPipeline.value = 'R$ 0,00';

      successScreen.style.display = 'none';
      formContainer.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

});
