-- CyclePlan 重构迁移
-- 版本: 2.0
-- 变更: quarters → cycles, tasks 独立于周期, 新增 cycle_tasks 多对多关联
--
-- 使用方法:
--   在 Supabase Dashboard → SQL Editor 中执行此脚本
--   或使用 supabase db push（如果配置了 Supabase CLI）
--
-- 注意: Supabase SQL Editor 默认自动包裹在事务中，
--       如果任何语句失败，整个迁移会回滚。

BEGIN;

-- ============================================
-- 1. 重命名 quarters → cycles
-- ============================================

-- 先删除旧的 ensure_single_active_quarter 触发器（引用旧函数）
DROP TRIGGER IF EXISTS ensure_single_active_quarter ON public.quarters;
ALTER TABLE public.quarters RENAME TO cycles;

-- 更新索引名称
ALTER INDEX idx_quarters_user RENAME TO idx_cycles_user;
ALTER INDEX idx_quarters_active RENAME TO idx_cycles_active;

-- 更新 updated_at 触发器名称
ALTER TRIGGER update_quarters_updated_at ON public.cycles RENAME TO update_cycles_updated_at;

-- 重建函数（RENAME 不会更新函数体中的表引用）
CREATE OR REPLACE FUNCTION public.set_active_cycle()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE public.cycles
    SET is_active = false
    WHERE user_id = NEW.user_id AND id != NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 删除旧函数（如果没有其他依赖）
-- 注意：先更新触发器指向新函数，再删旧函数
DROP TRIGGER IF EXISTS ensure_single_active_cycle ON public.cycles;
CREATE TRIGGER ensure_single_active_cycle
  BEFORE INSERT OR UPDATE ON public.cycles
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION public.set_active_cycle();

DROP FUNCTION IF EXISTS public.set_active_quarter();

-- 更新 RLS 策略（需要先删再建，因为无法重命名策略）
DROP POLICY "Users can view own quarters" ON public.cycles;
DROP POLICY "Users can insert own quarters" ON public.cycles;
DROP POLICY "Users can update own quarters" ON public.cycles;
DROP POLICY "Users can delete own quarters" ON public.cycles;

CREATE POLICY "Users can view own cycles" ON public.cycles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cycles" ON public.cycles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cycles" ON public.cycles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cycles" ON public.cycles
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 2. tasks 表改造：添加 user_id，使 quarter_id 可选
-- ============================================
ALTER TABLE public.tasks ADD COLUMN user_id UUID REFERENCES public.profiles(id);

-- 从现有数据填充 user_id
UPDATE public.tasks SET user_id = c.user_id FROM public.cycles c WHERE tasks.quarter_id = c.id;

-- 设置 NOT NULL
ALTER TABLE public.tasks ALTER COLUMN user_id SET NOT NULL;

-- quarter_id 变为可选
ALTER TABLE public.tasks ALTER COLUMN quarter_id DROP NOT NULL;

-- 添加 user_id 索引
CREATE INDEX idx_tasks_user ON public.tasks(user_id);
CREATE INDEX idx_tasks_user_archived ON public.tasks(user_id, is_archived);

-- ============================================
-- 3. 新建 cycle_tasks 关联表
-- ============================================
CREATE TABLE public.cycle_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_id UUID REFERENCES public.cycles(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  weekly_target_hours NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cycle_id, task_id)
);

CREATE INDEX idx_cycle_tasks_cycle ON public.cycle_tasks(cycle_id);
CREATE INDEX idx_cycle_tasks_task ON public.cycle_tasks(task_id);

-- 迁移现有 task-quarter 关联到 cycle_tasks
INSERT INTO public.cycle_tasks (cycle_id, task_id, weekly_target_hours)
SELECT quarter_id, id, weekly_target_hours
FROM public.tasks
WHERE quarter_id IS NOT NULL;

-- ============================================
-- 4. 启用 RLS 并设置策略
-- ============================================

-- cycle_tasks RLS
ALTER TABLE public.cycle_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cycle_tasks" ON public.cycle_tasks
  FOR SELECT USING (
    cycle_id IN (SELECT id FROM public.cycles WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can insert own cycle_tasks" ON public.cycle_tasks
  FOR INSERT WITH CHECK (
    cycle_id IN (SELECT id FROM public.cycles WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can update own cycle_tasks" ON public.cycle_tasks
  FOR UPDATE USING (
    cycle_id IN (SELECT id FROM public.cycles WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can delete own cycle_tasks" ON public.cycle_tasks
  FOR DELETE USING (
    cycle_id IN (SELECT id FROM public.cycles WHERE user_id = auth.uid())
  );

-- 更新 tasks RLS：改为基于 user_id
DROP POLICY "Users can view own tasks" ON public.tasks;
DROP POLICY "Users can insert own tasks" ON public.tasks;
DROP POLICY "Users can update own tasks" ON public.tasks;
DROP POLICY "Users can delete own tasks" ON public.tasks;

CREATE POLICY "Users can view own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- 更新 time_entries RLS：简化为通过 task 的 user_id
DROP POLICY "Users can view own time entries" ON public.time_entries;
DROP POLICY "Users can insert own time entries" ON public.time_entries;
DROP POLICY "Users can update own time entries" ON public.time_entries;
DROP POLICY "Users can delete own time entries" ON public.time_entries;

CREATE POLICY "Users can view own time entries" ON public.time_entries
  FOR SELECT USING (
    task_id IN (SELECT id FROM public.tasks WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can insert own time entries" ON public.time_entries
  FOR INSERT WITH CHECK (
    task_id IN (SELECT id FROM public.tasks WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can update own time entries" ON public.time_entries
  FOR UPDATE USING (
    task_id IN (SELECT id FROM public.tasks WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can delete own time entries" ON public.time_entries
  FOR DELETE USING (
    task_id IN (SELECT id FROM public.tasks WHERE user_id = auth.uid())
  );

COMMIT;
