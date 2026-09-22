-- ==============================================================================
-- FAZENDO ACONTECER™ • ESTRUTURA DO BANCO DE DADOS SUPABASE
-- Schema completo para Clientes, Planejamento Mensal, Relatórios e Configurações
-- Execute este script no SQL Editor do Supabase (https://gaerznidutdufqcfhpst.supabase.co)
-- ==============================================================================

-- 1. TABELA DE CLIENTES / PROJETOS
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  segment TEXT,
  responsible TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'onboarding'
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA DE PLANEJAMENTO MENSAL POR CLIENTE
CREATE TABLE IF NOT EXISTS public.client_planning (
  id TEXT PRIMARY KEY, -- formato: {client_id}_{year_month}, ex: cli_123_2026-09
  client_id TEXT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  year_month TEXT NOT NULL, -- formato: YYYY-MM, ex: 2026-09
  revenue_goal NUMERIC DEFAULT 0 NOT NULL, -- Meta de faturamento em R$
  sales_goal INTEGER DEFAULT 0 NOT NULL, -- Meta de vendas em unidades
  meetings_goal INTEGER DEFAULT 0 NOT NULL, -- Meta de reuniões agendadas/held
  money_on_table NUMERIC DEFAULT 0 NOT NULL, -- Pipeline previsto na mesa
  notes TEXT, -- Estratégia e anotações do mês
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_client_month UNIQUE (client_id, year_month)
);

-- 3. TABELA DE RELATÓRIOS DOS CLOSERS (FECHAMENTO)
CREATE TABLE IF NOT EXISTS public.closer_reports (
  id TEXT PRIMARY KEY, -- formato: {closer}_{date} ou UUID
  closer TEXT NOT NULL,
  client_id TEXT REFERENCES public.clients(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  leads INTEGER DEFAULT 0,
  followups INTEGER DEFAULT 0,
  prospeccoes INTEGER DEFAULT 0,
  meetings_scheduled INTEGER DEFAULT 0,
  meetings_held INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  contract_val TEXT DEFAULT 'R$ 0,00',
  cash_collected TEXT DEFAULT 'R$ 0,00',
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA DE RELATÓRIOS DOS SDRS (PROSPECÇÃO)
CREATE TABLE IF NOT EXISTS public.sdr_reports (
  id TEXT PRIMARY KEY, -- formato: {sdr}_{date} ou UUID
  sdr TEXT NOT NULL,
  client_id TEXT REFERENCES public.clients(id) ON DELETE SET NULL,
  custom_name TEXT,
  date DATE NOT NULL,
  leads INTEGER DEFAULT 0,
  calls INTEGER DEFAULT 0,
  whatsapp INTEGER DEFAULT 0,
  contacts INTEGER DEFAULT 0,
  scheduled INTEGER DEFAULT 0,
  qualified INTEGER DEFAULT 0,
  noshow INTEGER DEFAULT 0,
  pipeline_val TEXT DEFAULT 'R$ 0,00',
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABELA DE CONFIGURAÇÕES GERAIS DO DASHBOARD
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- HABILITAR POLÍTICAS DE ACESSO (ROW LEVEL SECURITY - RLS)
-- Permite leitura e escrita pelo frontend com a chave pública anon
-- ==============================================================================

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_planning ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.closer_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sdr_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para public.clients
CREATE POLICY "Permitir leitura pública clients" ON public.clients FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Permitir inserção pública clients" ON public.clients FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Permitir atualização pública clients" ON public.clients FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Permitir exclusão pública clients" ON public.clients FOR DELETE TO anon, authenticated USING (true);

-- Políticas para public.client_planning
CREATE POLICY "Permitir leitura pública planning" ON public.client_planning FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Permitir inserção pública planning" ON public.client_planning FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Permitir atualização pública planning" ON public.client_planning FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Permitir exclusão pública planning" ON public.client_planning FOR DELETE TO anon, authenticated USING (true);

-- Políticas para public.closer_reports
CREATE POLICY "Permitir leitura pública closer_reports" ON public.closer_reports FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Permitir inserção pública closer_reports" ON public.closer_reports FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Permitir atualização pública closer_reports" ON public.closer_reports FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Permitir exclusão pública closer_reports" ON public.closer_reports FOR DELETE TO anon, authenticated USING (true);

-- Políticas para public.sdr_reports
CREATE POLICY "Permitir leitura pública sdr_reports" ON public.sdr_reports FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Permitir inserção pública sdr_reports" ON public.sdr_reports FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Permitir atualização pública sdr_reports" ON public.sdr_reports FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Permitir exclusão pública sdr_reports" ON public.sdr_reports FOR DELETE TO anon, authenticated USING (true);

-- Políticas para public.system_settings
CREATE POLICY "Permitir leitura pública settings" ON public.system_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Permitir inserção pública settings" ON public.system_settings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Permitir atualização pública settings" ON public.system_settings FOR UPDATE TO anon, authenticated USING (true);

-- ==============================================================================
-- DADOS INICIAIS (SEED) PARA DEMONSTRAÇÃO IMEDIATA
-- ==============================================================================

INSERT INTO public.clients (id, name, segment, responsible, status)
VALUES 
  ('cli_fazendo_acontecer', 'Projeto Interno • Fazendo Acontecer™', 'Comercial B2B', 'Tales', 'active'),
  ('cli_alpha_group', 'Grupo Alpha Consultoria', 'Consultoria Empresarial', 'José', 'active'),
  ('cli_nexustech', 'Nexus Tech Soluções', 'SaaS / Tecnologia', 'Elinaldo', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.client_planning (id, client_id, year_month, revenue_goal, sales_goal, meetings_goal, money_on_table, notes)
VALUES
  ('cli_fazendo_acontecer_2026-09', 'cli_fazendo_acontecer', '2026-09', 100000, 10, 25, 45000, 'Meta principal do mês de Setembro • Foco em fechamento acelerado'),
  ('cli_alpha_group_2026-09', 'cli_alpha_group', '2026-09', 60000, 6, 18, 30000, 'Expansão de contas enterprise'),
  ('cli_alpha_group_2026-08', 'cli_alpha_group', '2026-08', 50000, 5, 15, 0, 'Mês encerrado • Superavit atingido'),
  ('cli_nexustech_2026-09', 'cli_nexustech', '2026-09', 40000, 4, 12, 20000, 'Prospecção ativa ICP TI e Software')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.system_settings (key, value)
VALUES 
  ('monthly_goal', '100000'),
  ('money_on_table', '45000'),
  ('win_rate', '40')
ON CONFLICT (key) DO NOTHING;
