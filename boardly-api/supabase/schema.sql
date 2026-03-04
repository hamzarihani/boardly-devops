-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Users Table (Private profiles linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'MEMBER')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Backward-compatible migration for existing databases
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Create Company Settings Table (1 row per tenant)
CREATE TABLE IF NOT EXISTS company_settings (
  tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  work_start TEXT NOT NULL,
  work_end TEXT NOT NULL,
  work_days TEXT[] NOT NULL DEFAULT ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  primary_color TEXT NOT NULL DEFAULT '#6366F1',
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION set_company_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_company_settings_updated_at ON company_settings;
CREATE TRIGGER trg_company_settings_updated_at
BEFORE UPDATE ON company_settings
FOR EACH ROW
EXECUTE PROCEDURE set_company_settings_updated_at();

-- Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Function to check user role without recursion
-- SECURITY DEFINER allows the function to bypass RLS on the 'users' table
CREATE OR REPLACE FUNCTION public.check_user_role(p_tenant_id UUID, p_required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() 
    AND tenant_id = p_tenant_id 
    AND role = p_required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for Tenants
CREATE POLICY "Allow all for tenants" ON tenants
  FOR ALL USING (true) WITH CHECK (true);

-- Policies for Users
CREATE POLICY "Allow all for users" ON users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for company settings" ON company_settings
  FOR ALL USING (true) WITH CHECK (true);

-- Create Sprints Table
CREATE TABLE IF NOT EXISTS sprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('PLANNED', 'ACTIVE', 'COMPLETED')) DEFAULT 'PLANNED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Stories Table
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'MEDIUM',
  status TEXT NOT NULL CHECK (status IN ('BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE')) DEFAULT 'BACKLOG',
  estimation INTEGER,
  assignee TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  type TEXT NOT NULL CHECK (type IN ('STORY', 'BUG')) DEFAULT 'STORY',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE')) DEFAULT 'TODO',
  assignee TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for agile tables
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policies for agile tables
CREATE POLICY "Allow all for sprints" ON sprints
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for stories" ON stories
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for tasks" ON tasks
  FOR ALL USING (true) WITH CHECK (true);
