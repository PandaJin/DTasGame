-- 迁移 003: 周期归档 + 每日备注
-- 变更: cycles 添加 is_archived 字段, 新建 daily_notes 表

BEGIN;

-- ============================================
-- 1. cycles 表添加 is_archived 字段
-- ============================================
ALTER TABLE public.cycles ADD COLUMN is_archived BOOLEAN DEFAULT false NOT NULL;

-- 归档的周期自动取消活跃状态
-- (通过触发器保障一致性)
CREATE OR REPLACE FUNCTION public.archive_deactivates_cycle()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_archived = true THEN
    NEW.is_active := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_archived_not_active
  BEFORE INSERT OR UPDATE ON public.cycles
  FOR EACH ROW
  WHEN (NEW.is_archived = true)
  EXECUTE FUNCTION public.archive_deactivates_cycle();

-- ============================================
-- 2. 新建 daily_notes 表
-- ============================================
CREATE TABLE public.daily_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  content TEXT DEFAULT '' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_notes_user_date ON public.daily_notes(user_id, date);

-- updated_at 自动更新
CREATE TRIGGER update_daily_notes_updated_at
  BEFORE UPDATE ON public.daily_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- RLS
ALTER TABLE public.daily_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily notes" ON public.daily_notes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily notes" ON public.daily_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily notes" ON public.daily_notes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own daily notes" ON public.daily_notes
  FOR DELETE USING (auth.uid() = user_id);

COMMIT;
