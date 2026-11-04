-- =========================================================================
-- StakeFit 🔥 Complete Supabase Database Schema & Seed Data
-- =========================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/vlbxiwybyeowqkewmttn
-- 2. Click "SQL Editor" on the left navigation bar.
-- 3. Click "+ New query", paste this entire file, and click "RUN" (green button).
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  streak_days INT DEFAULT 0,
  streak_weeks INT DEFAULT 0,
  shields_available INT DEFAULT 1,
  baseline_weight_kg NUMERIC(5,2) DEFAULT 75.0,
  current_weight_kg NUMERIC(5,2) DEFAULT 75.0,
  target_weight_kg NUMERIC(5,2) DEFAULT 70.0,
  baseline_photo_url TEXT,
  current_photo_url TEXT,
  body_fat_pct_baseline NUMERIC(4,1) DEFAULT 20.0,
  body_fat_pct_current NUMERIC(4,1) DEFAULT 20.0,
  upi_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. GROUPS (Pact Squads)
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  avatar TEXT DEFAULT '🔥',
  invite_code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  currency TEXT DEFAULT '₹' CHECK (currency IN ('₹', '$', '€', '£')),
  penalty_per_missed_day NUMERIC(10,2) NOT NULL DEFAULT 250.00,
  target_days_per_week INT NOT NULL DEFAULT 4 CHECK (target_days_per_week BETWEEN 1 AND 7),
  pool_type TEXT NOT NULL DEFAULT 'dividend' CHECK (pool_type IN ('dividend', 'bounty')),
  bounty_total NUMERIC(10,2) DEFAULT 0.00,
  bounty_goal_description TEXT,
  kickoff_date DATE DEFAULT CURRENT_DATE,
  cycle_number INT DEFAULT 1,
  current_cycle_start DATE DEFAULT CURRENT_DATE,
  current_cycle_end DATE DEFAULT (CURRENT_DATE + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. GROUP MEMBERS
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  is_double_down BOOLEAN DEFAULT FALSE,
  shield_active BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- 4. SETTLEMENT CYCLES
CREATE TABLE IF NOT EXISTS public.settlement_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  cycle_number INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_penalties NUMERIC(10,2) DEFAULT 0.00,
  total_dividends NUMERIC(10,2) DEFAULT 0.00,
  pool_type TEXT NOT NULL DEFAULT 'dividend',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'settled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CHECK-INS / WORKOUT PROOFS
CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  workout_type TEXT NOT NULL CHECK (workout_type IN ('Gym', 'Running', 'Calisthenics', 'Swimming', 'Sports', 'HIIT', 'Cycling')),
  caption TEXT,
  image_url TEXT NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 45,
  distance_km NUMERIC(5,2),
  calories INT DEFAULT 350,
  heart_rate_bpm INT,
  location_tag TEXT DEFAULT 'Gold''s Gym - Sector 29',
  exif_metadata JSONB DEFAULT '{"device": "Camera Live API", "matchScore": 99, "isVerified": true}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'disputed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. VOUCHES (Peer Verification)
CREATE TABLE IF NOT EXISTS public.vouches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_in_id UUID REFERENCES public.check_ins(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(check_in_id, user_id)
);

-- 7. DISPUTES / CALL-OUTS
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_in_id UUID REFERENCES public.check_ins(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. DEBT TRANSACTIONS (Splitwise-style peer-to-peer debts)
CREATE TABLE IF NOT EXISTS public.debt_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID REFERENCES public.settlement_cycles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT '₹',
  is_settled BOOLEAN DEFAULT FALSE,
  settled_at TIMESTAMPTZ,
  payment_ref TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. WEIGH-INS & PHYSIQUE PROGRESS
CREATE TABLE IF NOT EXISTS public.weigh_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  weight_kg NUMERIC(5,2) NOT NULL,
  body_fat_pct NUMERIC(4,1),
  waist_cm NUMERIC(5,1),
  notes TEXT,
  photo_url TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weigh_ins ENABLE ROW LEVEL SECURITY;

-- Permissive public read & write policies for prototype flexibility
DROP POLICY IF EXISTS "Public access profiles" ON public.profiles;
CREATE POLICY "Public access profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access groups" ON public.groups;
CREATE POLICY "Public access groups" ON public.groups FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access group_members" ON public.group_members;
CREATE POLICY "Public access group_members" ON public.group_members FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access settlement_cycles" ON public.settlement_cycles;
CREATE POLICY "Public access settlement_cycles" ON public.settlement_cycles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access check_ins" ON public.check_ins;
CREATE POLICY "Public access check_ins" ON public.check_ins FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access vouches" ON public.vouches;
CREATE POLICY "Public access vouches" ON public.vouches FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access disputes" ON public.disputes;
CREATE POLICY "Public access disputes" ON public.disputes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access debt_transactions" ON public.debt_transactions;
CREATE POLICY "Public access debt_transactions" ON public.debt_transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access weigh_ins" ON public.weigh_ins;
CREATE POLICY "Public access weigh_ins" ON public.weigh_ins FOR ALL USING (true) WITH CHECK (true);

-- =========================================================================
-- OPTIONAL: AUTO-CREATE PROFILE ON SUPABASE AUTH SIGNUP
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, handle, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'handle', '@' || split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =========================================================================
-- SEED INITIAL SQUAD & PROFILES (Ready to test immediately!)
-- =========================================================================
INSERT INTO public.profiles (id, name, handle, avatar_url, role, streak_days, streak_weeks, shields_available, baseline_weight_kg, current_weight_kg, target_weight_kg, upi_id)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'Rahul Sharma', '@rahul_lift', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', 'admin', 28, 4, 1, 82.5, 78.1, 75.0, 'rahul.fit@okhdfcbank'),
  ('a2222222-2222-2222-2222-222222222222', 'Priya Patel', '@priya_runs', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', 'member', 35, 5, 2, 64.0, 60.5, 58.0, 'priya.athletic@axisbank'),
  ('a3333333-3333-3333-3333-333333333333', 'Marcus Chen', '@marcus_cali', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', 'member', 14, 2, 0, 75.0, 73.8, 72.0, 'marcus.chen@icici'),
  ('a4444444-4444-4444-4444-444444444444', 'Sarah Jenkins', '@sarah_jfit', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80', 'member', 8, 1, 1, 68.0, 66.5, 63.0, 'sarah.j@paytm'),
  ('a5555555-5555-5555-5555-555555555555', 'Dev Malik', '@dev_gains', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', 'member', 0, 0, 0, 89.0, 88.5, 80.0, 'dev.malik@okaxis')
ON CONFLICT (id) DO NOTHING;

-- Seed Flagship Group
INSERT INTO public.groups (id, name, description, avatar, invite_code, created_by, currency, penalty_per_missed_day, target_days_per_week, pool_type, cycle_number)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Iron Titans Squad',
  'High-intensity 4-day pact. No excuses, no shortcuts. Miss a day, pay the dividend.',
  '🔥',
  'TITAN-4482',
  'a1111111-1111-1111-1111-111111111111',
  '₹',
  250.00,
  4,
  'dividend',
  4
)
ON CONFLICT (id) DO NOTHING;

-- Seed Group Members
INSERT INTO public.group_members (group_id, user_id, role, is_double_down, shield_active)
VALUES 
  ('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'admin', true, false),
  ('b1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'member', false, false),
  ('b1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 'member', false, false),
  ('b1111111-1111-1111-1111-111111111111', 'a4444444-4444-4444-4444-444444444444', 'member', false, true),
  ('b1111111-1111-1111-1111-111111111111', 'a5555555-5555-5555-5555-555555555555', 'member', false, false)
ON CONFLICT (group_id, user_id) DO NOTHING;

-- Seed Sample Check-in
INSERT INTO public.check_ins (id, group_id, user_id, workout_type, caption, image_url, duration_minutes, calories, heart_rate_bpm, status)
VALUES (
  'c1111111-1111-1111-1111-111111111111',
  'b1111111-1111-1111-1111-111111111111',
  'a2222222-2222-2222-2222-222222222222',
  'Running',
  'Sunrise 8K interval tempo run. Target met for the week (4/4)! 🏃‍♀️🔥',
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&auto=format&fit=crop&q=80',
  44,
  460,
  162,
  'verified'
)
ON CONFLICT (id) DO NOTHING;
