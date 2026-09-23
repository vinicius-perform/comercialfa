/**
 * FAZENDO ACONTECER™ • SUPABASE INTEGRATION ENGINE
 * Conexão com Supabase Cloud, CRUD de Clientes, Planejamento Mensal, Relatórios e Autenticação
 */

const SUPABASE_CONFIG = {
  url: 'https://gaerznidutdufqcfhpst.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZXJ6bmlkdXRkdWZxY2ZocHN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwOTkxMDgsImV4cCI6MjEwNTY3NTEwOH0.YMe6aQ7oCgVMhJzBHamr98o6ToAmKSUx1dgqlhHm-Qc'
};

// Instância do Cliente Supabase
let supabaseClient = null;

if (typeof supabase !== 'undefined' && supabase.createClient) {
  try {
    supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    console.log('[Supabase] Cliente inicializado com sucesso.');
  } catch (err) {
    console.warn('[Supabase] Falha ao inicializar cliente:', err);
  }
}

let isSupabaseConnected = false;

/**
 * Verifica se o banco Supabase está online e respondendo
 */
async function checkSupabaseHealth() {
  if (!supabaseClient) return false;
  try {
    const { data, error } = await supabaseClient.from('system_settings').select('key').limit(1);
    if (error) {
      console.warn('[Supabase Health] Tabela inacessível:', error.message);
      isSupabaseConnected = false;
      return false;
    }
    isSupabaseConnected = true;
    return true;
  } catch (err) {
    isSupabaseConnected = false;
    return false;
  }
}

// ============================================================
// 1. CLIENTES / PROJETOS (CRUD)
// ============================================================
const STORAGE_CLIENTS_KEY = 'fa_prod_clients_v1';

async function dbFetchClients() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        localStorage.setItem(STORAGE_CLIENTS_KEY, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('[Supabase] Erro ao buscar clients:', e);
    }
  }

  // Fallback LocalStorage
  try {
    const local = localStorage.getItem(STORAGE_CLIENTS_KEY);
    if (local !== null) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {}

  return [];
}

async function dbSaveClient(client) {
  let clients = [];
  try {
    const raw = localStorage.getItem(STORAGE_CLIENTS_KEY);
    clients = raw ? JSON.parse(raw) : [];
  } catch (e) {
    clients = [];
  }

  const idx = clients.findIndex(c => c.id === client.id);
  if (idx >= 0) {
    clients[idx] = { ...clients[idx], ...client, updated_at: new Date().toISOString() };
  } else {
    clients.unshift({ ...client, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  }
  localStorage.setItem(STORAGE_CLIENTS_KEY, JSON.stringify(clients));

  if (supabaseClient) {
    try {
      const cloudRecord = {
        id: client.id,
        name: client.name,
        segment: client.segment || null,
        responsible: client.responsible || null,
        status: client.status || 'active',
        updated_at: new Date().toISOString()
      };
      const { error } = await supabaseClient.from('clients').upsert([cloudRecord]);
      if (error) console.warn('[Supabase] Erro ao salvar client:', error.message);
    } catch (e) {
      console.warn('[Supabase] Erro ao sincronizar client com a nuvem:', e);
    }
  }

  return client;
}

async function dbDeleteClient(clientId) {
  let clients = [];
  try {
    const raw = localStorage.getItem(STORAGE_CLIENTS_KEY);
    clients = raw ? JSON.parse(raw) : [];
  } catch (e) {}

  clients = clients.filter(c => c.id !== clientId);
  localStorage.setItem(STORAGE_CLIENTS_KEY, JSON.stringify(clients));

  if (supabaseClient) {
    try {
      await supabaseClient.from('client_planning').delete().eq('client_id', clientId);
      await supabaseClient.from('clients').delete().eq('id', clientId);
    } catch (e) {
      console.warn('[Supabase] Erro ao excluir client:', e);
    }
  }
}

// ============================================================
// 2. PLANEJAMENTO MENSAL POR CLIENTE (CRUD)
// ============================================================
const STORAGE_PLANNING_KEY = 'fa_prod_planning_v1';

async function dbFetchPlannings(clientId = null) {
  if (supabaseClient) {
    try {
      let query = supabaseClient.from('client_planning').select('*');
      if (clientId) query = query.eq('client_id', clientId);
      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        let localPlannings = [];
        try {
          const raw = localStorage.getItem(STORAGE_PLANNING_KEY);
          localPlannings = raw ? JSON.parse(raw) : [];
        } catch (e) {}

        data.forEach(cloudItem => {
          const idx = localPlannings.findIndex(p => p.id === cloudItem.id);
          if (idx >= 0) localPlannings[idx] = cloudItem;
          else localPlannings.push(cloudItem);
        });
        localStorage.setItem(STORAGE_PLANNING_KEY, JSON.stringify(localPlannings));

        return clientId ? data : localPlannings;
      }
    } catch (e) {
      console.warn('[Supabase] Erro ao buscar planning:', e);
    }
  }

  let localPlannings = [];
  try {
    const raw = localStorage.getItem(STORAGE_PLANNING_KEY);
    if (raw) localPlannings = JSON.parse(raw);
  } catch (e) {}

  if (clientId) {
    return localPlannings.filter(p => p.client_id === clientId);
  }
  return localPlannings;
}

async function dbSavePlanning(planning) {
  let plannings = [];
  try {
    const raw = localStorage.getItem(STORAGE_PLANNING_KEY);
    plannings = raw ? JSON.parse(raw) : [];
  } catch (e) {}

  const planningId = `${planning.client_id}_${planning.year_month}`;
  const record = {
    ...planning,
    id: planningId,
    updated_at: new Date().toISOString()
  };

  const idx = plannings.findIndex(p => p.id === planningId);
  if (idx >= 0) plannings[idx] = record;
  else plannings.push(record);
  localStorage.setItem(STORAGE_PLANNING_KEY, JSON.stringify(plannings));

  if (supabaseClient) {
    try {
      const cloudRecord = {
        id: planningId,
        client_id: planning.client_id,
        year_month: planning.year_month,
        revenue_goal: planning.revenue_goal || 0,
        sales_goal: planning.sales_goal || 0,
        meetings_goal: planning.meetings_goal || 0,
        money_on_table: planning.money_on_table || 0,
        notes: planning.notes || null,
        updated_at: new Date().toISOString()
      };
      const { error } = await supabaseClient.from('client_planning').upsert([cloudRecord]);
      if (error) console.warn('[Supabase] Erro ao salvar planning:', error.message);
    } catch (e) {
      console.warn('[Supabase] Erro ao sincronizar planning:', e);
    }
  }

  return record;
}

// ============================================================
// 3. RELATÓRIOS DOS CLOSERS (LEITURA, GRAVAÇÃO & EXCLUSÃO)
// ============================================================
const STORAGE_CLOSER_REPORTS = 'fa_prod_closer_reports_v1';

async function dbFetchCloserReports() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('closer_reports')
        .select('*')
        .order('date', { ascending: false });

      if (!error && Array.isArray(data)) {
        const mapped = data.map(r => ({
          id: r.id,
          closer: r.closer,
          clientId: r.client_id,
          date: r.date,
          leads: r.leads || 0,
          followups: r.followups || 0,
          prospeccoes: r.prospeccoes || 0,
          meetingsScheduled: r.meetings_scheduled || 0,
          meetingsHeld: r.meetings_held || 0,
          sales: r.sales || 0,
          contractVal: r.contract_val || 'R$ 0,00',
          cashCollected: r.cash_collected || 'R$ 0,00',
          updatedAt: r.updated_at
        }));
        localStorage.setItem(STORAGE_CLOSER_REPORTS, JSON.stringify(mapped));
        return mapped;
      }
    } catch (e) {
      console.warn('[Supabase] Erro ao buscar closer_reports:', e);
    }
  }

  try {
    const raw = localStorage.getItem(STORAGE_CLOSER_REPORTS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

async function dbSyncCloserReport(report) {
  if (!report) return;

  // Atualiza cache local
  try {
    let reports = [];
    const raw = localStorage.getItem(STORAGE_CLOSER_REPORTS);
    reports = raw ? JSON.parse(raw) : [];
    const idx = reports.findIndex(r => r.id === report.id);
    if (idx >= 0) reports[idx] = report;
    else reports.unshift(report);
    localStorage.setItem(STORAGE_CLOSER_REPORTS, JSON.stringify(reports));
  } catch (e) {}

  // Grava no Supabase Cloud
  if (supabaseClient) {
    try {
      const cloudRecord = {
        id: report.id,
        closer: report.closer,
        client_id: report.clientId || null,
        date: report.date,
        leads: report.leads || 0,
        followups: report.followups || 0,
        prospeccoes: report.prospeccoes || 0,
        meetings_scheduled: report.meetingsScheduled || 0,
        meetings_held: report.meetingsHeld || 0,
        sales: report.sales || 0,
        contract_val: report.contractVal || 'R$ 0,00',
        cash_collected: report.cashCollected || 'R$ 0,00',
        updated_at: new Date().toISOString()
      };
      await supabaseClient.from('closer_reports').upsert([cloudRecord]);
    } catch (e) {
      console.warn('[Supabase] Erro ao enviar closer_report para nuvem:', e);
    }
  }
}

async function dbDeleteCloserReport(id) {
  try {
    let reports = [];
    const raw = localStorage.getItem(STORAGE_CLOSER_REPORTS);
    reports = raw ? JSON.parse(raw) : [];
    reports = reports.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_CLOSER_REPORTS, JSON.stringify(reports));
  } catch (e) {}

  if (supabaseClient) {
    try {
      await supabaseClient.from('closer_reports').delete().eq('id', id);
    } catch (e) {
      console.warn('[Supabase] Erro ao excluir closer_report:', e);
    }
  }
}

// ============================================================
// 4. RELATÓRIOS DOS SDRS (LEITURA, GRAVAÇÃO & EXCLUSÃO)
// ============================================================
const STORAGE_SDR_REPORTS = 'fa_prod_sdr_reports_v1';

async function dbFetchSdrReports() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('sdr_reports')
        .select('*')
        .order('date', { ascending: false });

      if (!error && Array.isArray(data)) {
        const mapped = data.map(r => ({
          id: r.id,
          sdr: r.sdr,
          clientId: r.client_id,
          customName: r.custom_name,
          date: r.date,
          leads: r.leads || 0,
          calls: r.calls || 0,
          whatsapp: r.whatsapp || 0,
          contacts: r.contacts || 0,
          scheduled: r.scheduled || 0,
          qualified: r.qualified || 0,
          noshow: r.noshow || 0,
          pipeline: r.pipeline_val || 'R$ 0,00',
          pipelineVal: r.pipeline_val || 'R$ 0,00',
          updatedAt: r.updated_at
        }));
        localStorage.setItem(STORAGE_SDR_REPORTS, JSON.stringify(mapped));
        return mapped;
      }
    } catch (e) {
      console.warn('[Supabase] Erro ao buscar sdr_reports:', e);
    }
  }

  try {
    const raw = localStorage.getItem(STORAGE_SDR_REPORTS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

async function dbSyncSdrReport(report) {
  if (!report) return;

  // Atualiza cache local
  try {
    let reports = [];
    const raw = localStorage.getItem(STORAGE_SDR_REPORTS);
    reports = raw ? JSON.parse(raw) : [];
    const idx = reports.findIndex(r => r.id === report.id);
    if (idx >= 0) reports[idx] = report;
    else reports.unshift(report);
    localStorage.setItem(STORAGE_SDR_REPORTS, JSON.stringify(reports));
  } catch (e) {}

  if (supabaseClient) {
    try {
      const cloudRecord = {
        id: report.id,
        sdr: report.sdr,
        client_id: report.clientId || null,
        custom_name: report.customName || null,
        date: report.date,
        leads: report.leads || 0,
        calls: report.calls || 0,
        whatsapp: report.whatsapp || 0,
        contacts: report.contacts || 0,
        scheduled: report.scheduled || 0,
        qualified: report.qualified || 0,
        noshow: report.noshow || 0,
        pipeline_val: report.pipelineVal || report.pipeline || 'R$ 0,00',
        updated_at: new Date().toISOString()
      };
      await supabaseClient.from('sdr_reports').upsert([cloudRecord]);
    } catch (e) {
      console.warn('[Supabase] Erro ao enviar sdr_report para nuvem:', e);
    }
  }
}

async function dbDeleteSdrReport(id) {
  try {
    let reports = [];
    const raw = localStorage.getItem(STORAGE_SDR_REPORTS);
    reports = raw ? JSON.parse(raw) : [];
    reports = reports.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_SDR_REPORTS, JSON.stringify(reports));
  } catch (e) {}

  if (supabaseClient) {
    try {
      await supabaseClient.from('sdr_reports').delete().eq('id', id);
    } catch (e) {
      console.warn('[Supabase] Erro ao excluir sdr_report:', e);
    }
  }
}

async function dbClearAllReports() {
  localStorage.removeItem(STORAGE_CLOSER_REPORTS);
  localStorage.removeItem(STORAGE_SDR_REPORTS);
  localStorage.removeItem('fa_prod_team_reports_v1');
  localStorage.removeItem('closerReports_v2');
  localStorage.removeItem('sdrReports_v2');
  localStorage.removeItem('fa_closers_uifry_reports_v1');
  localStorage.removeItem('fa_sdr_reports_v1');
  localStorage.removeItem('fa_team_reports_unified_v1');

  if (supabaseClient) {
    try {
      await supabaseClient.from('closer_reports').delete().neq('id', '___none___');
      await supabaseClient.from('sdr_reports').delete().neq('id', '___none___');
    } catch (e) {
      console.warn('[Supabase] Erro ao limpar relatórios:', e);
    }
  }
}

// ============================================================
// 5. CONFIGURAÇÕES GERAIS (METAS MENSAL)
// ============================================================
async function dbFetchSettings() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('system_settings').select('*');
      if (!error && Array.isArray(data)) {
        data.forEach(item => {
          if (item.key === 'monthly_goal') localStorage.setItem('fa_monthly_goal_v1', item.value);
        });
        return data;
      }
    } catch (e) {
      console.warn('[Supabase] Erro ao buscar settings:', e);
    }
  }
  return [];
}

async function dbSaveSetting(key, value) {
  if (key === 'monthly_goal') localStorage.setItem('fa_monthly_goal_v1', value);

  if (supabaseClient) {
    try {
      await supabaseClient.from('system_settings').upsert([{ key, value: String(value), updated_at: new Date().toISOString() }]);
    } catch (e) {
      console.warn('[Supabase] Erro ao salvar setting:', e);
    }
  }
}

// ============================================================
// 6. VERIFICAÇÃO DE CREDENCIAIS DE LOGIN NO SUPABASE
// ============================================================
async function dbVerifyCredentials(login, password) {
  if (!login || !password) return false;

  const cleanUser = login.trim().toLowerCase();
  const cleanPass = password.trim();

  // 1. Consulta as credenciais cadastradas no Supabase
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('system_settings')
        .select('key, value')
        .in('key', ['auth_admin_user', 'auth_admin_pass', 'admin_credentials']);

      if (!error && Array.isArray(data) && data.length > 0) {
        let expectedUser = null;
        let expectedPass = null;

        const credsRow = data.find(d => d.key === 'admin_credentials');
        if (credsRow && credsRow.value) {
          try {
            const parsed = JSON.parse(credsRow.value);
            expectedUser = parsed.login;
            expectedPass = parsed.password;
          } catch (e) {}
        }

        if (!expectedUser) {
          const uRow = data.find(d => d.key === 'auth_admin_user');
          if (uRow) expectedUser = uRow.value;
        }
        if (!expectedPass) {
          const pRow = data.find(d => d.key === 'auth_admin_pass');
          if (pRow) expectedPass = pRow.value;
        }

        if (expectedUser && expectedPass) {
          const isUserMatch = cleanUser === expectedUser.trim().toLowerCase();
          const isPassMatch = cleanPass === expectedPass.trim();
          return isUserMatch && isPassMatch;
        }
      }
    } catch (e) {
      console.warn('[Supabase] Falha ao verificar credenciais no banco:', e);
    }
  }

  // Fallback seguro caso banco esteja temporariamente offline
  return cleanUser === 'admin@fa' && cleanPass === 'admin@FA1';
}

// ============================================================
// EXPORTAÇÕES GLOBAIS
// ============================================================
window.dbFetchClients = dbFetchClients;
window.dbSaveClient = dbSaveClient;
window.dbDeleteClient = dbDeleteClient;

window.dbFetchPlannings = dbFetchPlannings;
window.dbSavePlanning = dbSavePlanning;

window.dbFetchCloserReports = dbFetchCloserReports;
window.dbSyncCloserReport = dbSyncCloserReport;
window.dbDeleteCloserReport = dbDeleteCloserReport;

window.dbFetchSdrReports = dbFetchSdrReports;
window.dbSyncSdrReport = dbSyncSdrReport;
window.dbDeleteSdrReport = dbDeleteSdrReport;

window.dbClearAllReports = dbClearAllReports;
window.dbFetchSettings = dbFetchSettings;
window.dbSaveSetting = dbSaveSetting;
window.dbVerifyCredentials = dbVerifyCredentials;

window.checkSupabaseHealth = checkSupabaseHealth;
window.supabaseClient = supabaseClient;
