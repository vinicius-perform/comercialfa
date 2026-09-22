/**
 * FAZENDO ACONTECER™ • SUPABASE INTEGRATION ENGINE
 * Conexão com Supabase Cloud, CRUD de Clientes, Planejamento Mensal e Relatórios
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

// Estado de Conexão com o Banco
let isSupabaseConnected = false;

/**
 * Verifica se as tabelas do Supabase já estão criadas e respondendo
 */
async function checkSupabaseHealth() {
  if (!supabaseClient) return false;
  try {
    const { data, error } = await supabaseClient.from('clients').select('id').limit(1);
    if (error) {
      console.warn('[Supabase Health] Tabela clients ainda não criada ou inacessível:', error.message);
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
const STORAGE_CLIENTS_KEY = 'projects_clients_v2';

// Projetos & Clientes (Inicia vazio conforme solicitado pelo usuário)
const SEED_CLIENTS = [];

// Limpa dados de projetos anteriores do cache local
try {
  localStorage.setItem(STORAGE_CLIENTS_KEY, JSON.stringify([]));
} catch (e) {}

// Limpa também do Supabase Cloud se conectado
if (supabaseClient) {
  try {
    supabaseClient.from('client_planning').delete().neq('id', '___none___').then(() => {}).catch(() => {});
    supabaseClient.from('clients').delete().neq('id', '___none___').then(() => {}).catch(() => {});
  } catch (e) {}
}

async function dbFetchClients() {
  // Tenta buscar no Supabase
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
      console.warn('[Supabase] Erro ao buscar clients, usando cache local:', e);
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
  // Salva no LocalStorage
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
    clients.unshift({ ...client, created_at: new Date().toISOString() });
  }
  localStorage.setItem(STORAGE_CLIENTS_KEY, JSON.stringify(clients));

  // Tenta salvar no Supabase
  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from('clients').upsert([client]);
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
      await supabaseClient.from('clients').delete().eq('id', clientId);
    } catch (e) {}
  }
}

// ============================================================
// 2. PLANEJAMENTO MENSAL POR CLIENTE (CRUD)
// ============================================================
const STORAGE_PLANNING_KEY = 'projects_planning_v2';

const SEED_PLANNINGS = [];

// Limpa planejamentos de demonstração do cache local
try {
  localStorage.setItem(STORAGE_PLANNING_KEY, JSON.stringify([]));
} catch (e) {}

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
      console.warn('[Supabase] Erro ao buscar planning, usando cache local:', e);
    }
  }

  // Fallback LocalStorage
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
  // Salva no LocalStorage
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
  if (idx >= 0) {
    plannings[idx] = record;
  } else {
    plannings.push(record);
  }
  localStorage.setItem(STORAGE_PLANNING_KEY, JSON.stringify(plannings));

  // Salva no Supabase
  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from('client_planning').upsert([record]);
      if (error) console.warn('[Supabase] Erro ao salvar planning:', error.message);
    } catch (e) {
      console.warn('[Supabase] Erro ao sincronizar planning:', e);
    }
  }

  return record;
}

// ============================================================
// 3. SINCRONIZAÇÃO DE RELATÓRIOS (CLOSERS & SDRS)
// ============================================================
async function dbSyncCloserReport(report) {
  if (!supabaseClient) return;
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

async function dbSyncSdrReport(report) {
  if (!supabaseClient) return;
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
      pipeline_val: report.pipelineVal || 'R$ 0,00',
      updated_at: new Date().toISOString()
    };
    await supabaseClient.from('sdr_reports').upsert([cloudRecord]);
  } catch (e) {
    console.warn('[Supabase] Erro ao enviar sdr_report para nuvem:', e);
  }
}

async function dbSyncTeamReport(report) {
  if (!supabaseClient) return;
  try {
    const cloudRecord = {
      id: report.id,
      member_name: report.member || report.name,
      client_id: report.clientId || null,
      date: report.date,
      leads: report.leads || 0,
      calls: report.calls || 0,
      whatsapp: report.whatsapp || 0,
      contacts: report.contacts || 0,
      followups: report.followups || 0,
      prospeccoes: report.prospeccoes || 0,
      meetings_scheduled: report.meetingsScheduled || report.scheduled || 0,
      meetings_held: report.meetingsHeld || report.held || 0,
      meetings_qualified: report.meetingsQualified || report.qualified || 0,
      noshow: report.noshow || 0,
      sales: report.sales || 0,
      contract_val: report.contractVal || report.contracts || 'R$ 0,00',
      cash_collected: report.cashCollected || report.cash || 'R$ 0,00',
      pipeline_val: report.pipelineVal || report.pipeline || 'R$ 0,00',
      updated_at: new Date().toISOString()
    };
    await supabaseClient.from('team_reports').upsert([cloudRecord]);
  } catch (e) {
    console.warn('[Supabase] Erro ao enviar team_report para nuvem:', e);
  }
}

// Exportações Globais
window.dbFetchClients = dbFetchClients;
window.dbSaveClient = dbSaveClient;
window.dbDeleteClient = dbDeleteClient;
window.dbFetchPlannings = dbFetchPlannings;
window.dbSavePlanning = dbSavePlanning;
window.dbSyncCloserReport = dbSyncCloserReport;
window.dbSyncSdrReport = dbSyncSdrReport;
window.dbSyncTeamReport = dbSyncTeamReport;
window.checkSupabaseHealth = checkSupabaseHealth;
window.supabaseClient = supabaseClient;

