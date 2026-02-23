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
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'MEMBER')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

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
