-- QuarterPlan 数据库 Schema
-- 版本: 1.0

-- ============================================
-- 用户配置表
-- ============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  settings JSONB DEFAULT '{"defaultView": "week", "weekStartDay": 1}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 季度表
-- ============================================
CREATE TABLE public.quarters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- ============================================
-- 任务表
-- ============================================
CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quarter_id UUID REFERENCES public.quarters(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  priority INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 4),
  estimated_hours NUMERIC(6,2) NOT NULL CHECK (estimated_hours > 0),
  weekly_target_hours NUMERIC(5,2),
  color TEXT DEFAULT '#3B82F6',
  sort_order INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 时间记录表
-- ============================================
CREATE TABLE public.time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  entry_type TEXT NOT NULL CHECK (entry_type IN ('manual', 'timer')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 计时器会话表 (活跃计时器状态)
-- ============================================
CREATE TABLE public.timer_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 索引
-- ============================================
CREATE INDEX idx_quarters_user ON public.quarters(user_id);
CREATE INDEX idx_quarters_active ON public.quarters(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_tasks_quarter ON public.tasks(quarter_id);
CREATE INDEX idx_tasks_priority ON public.tasks(quarter_id, priority);
CREATE INDEX idx_time_entries_task ON public.time_entries(task_id);
CREATE INDEX idx_time_entries_date ON public.time_entries(date);
CREATE INDEX idx_time_entries_task_date ON public.time_entries(task_id, date);
CREATE INDEX idx_timer_sessions_user_active ON public.timer_sessions(user_id) WHERE is_active = true;

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quarters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timer_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies - Profiles
-- ============================================
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- RLS Policies - Quarters
-- ============================================
CREATE POLICY "Users can view own quarters" ON public.quarters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quarters" ON public.quarters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quarters" ON public.quarters
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quarters" ON public.quarters
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RLS Policies - Tasks
-- ============================================
CREATE POLICY "Users can view own tasks" ON public.tasks
  FOR SELECT USING (
    quarter_id IN (SELECT id FROM public.quarters WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own tasks" ON public.tasks
  FOR INSERT WITH CHECK (
    quarter_id IN (SELECT id FROM public.quarters WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE USING (
    quarter_id IN (SELECT id FROM public.quarters WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own tasks" ON public.tasks
  FOR DELETE USING (
    quarter_id IN (SELECT id FROM public.quarters WHERE user_id = auth.uid())
  );

-- ============================================
-- RLS Policies - Time Entries
-- ============================================
CREATE POLICY "Users can view own time entries" ON public.time_entries
  FOR SELECT USING (
    task_id IN (
      SELECT t.id FROM public.tasks t
      JOIN public.quarters q ON t.quarter_id = q.id
      WHERE q.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own time entries" ON public.time_entries
  FOR INSERT WITH CHECK (
    task_id IN (
      SELECT t.id FROM public.tasks t
      JOIN public.quarters q ON t.quarter_id = q.id
      WHERE q.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own time entries" ON public.time_entries
  FOR UPDATE USING (
    task_id IN (
      SELECT t.id FROM public.tasks t
      JOIN public.quarters q ON t.quarter_id = q.id
      WHERE q.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own time entries" ON public.time_entries
  FOR DELETE USING (
    task_id IN (
      SELECT t.id FROM public.tasks t
      JOIN public.quarters q ON t.quarter_id = q.id
      WHERE q.user_id = auth.uid()
    )
  );

-- ============================================
-- RLS Policies - Timer Sessions
-- ============================================
CREATE POLICY "Users can view own timer sessions" ON public.timer_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own timer sessions" ON public.timer_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own timer sessions" ON public.timer_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own timer sessions" ON public.timer_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 触发器：新用户注册时自动创建 profile
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 触发器：更新 updated_at 时间戳
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quarters_updated_at
  BEFORE UPDATE ON public.quarters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 函数：设置活跃季度时取消其他季度的活跃状态
-- ============================================
CREATE OR REPLACE FUNCTION public.set_active_quarter()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE public.quarters
    SET is_active = false
    WHERE user_id = NEW.user_id AND id != NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_active_quarter
  BEFORE INSERT OR UPDATE ON public.quarters
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION public.set_active_quarter();
