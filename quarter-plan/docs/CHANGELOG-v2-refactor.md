# CyclePlan v2 重构变更记录

**日期**：2026-02-17
**版本**：v2.0

---

## 概览

将 QuarterPlan 重构为 CyclePlan，核心变更：
1. 任务独立于周期（跨周期支持）
2. "季度 (Quarter)" → "周期 (Cycle)" 全量重命名
3. 任务成为第一入口
4. TikTok 风格底部"+"计时按钮
5. 多项 UI 优化

---

## 数据库迁移

**文件**：`supabase/migrations/002_cycles_refactor.sql`

| 变更 | 说明 |
|------|------|
| `quarters` → `cycles` | 表名、索引、触发器、RLS 策略全部重命名 |
| `tasks.user_id` | 新增列，从 cycles 表回填 |
| `tasks.quarter_id` | 从 NOT NULL 变为可选 |
| `cycle_tasks` 表 | 新建多对多关联表（cycle_id, task_id, weekly_target_hours） |
| RLS 策略 | tasks 和 time_entries 改为基于 user_id 验证 |
| `set_active_cycle()` | 重建函数（函数体引用新表名） |

### 执行方式
在 Supabase Dashboard → SQL Editor 中执行 `002_cycles_refactor.sql`，脚本包含 `BEGIN/COMMIT` 事务保护。

---

## 新建文件

| 文件 | 说明 |
|------|------|
| `src/app/dashboard/tasks/page.tsx` | 任务列表页（第一入口） |
| `src/app/dashboard/tasks/[id]/page.tsx` | 任务详情页 |
| `src/app/dashboard/tasks/[id]/edit-button.tsx` | 编辑按钮客户端组件 |
| `src/app/dashboard/tasks/[id]/daily-chart.tsx` | 30 天每日投入柱形图 |
| `src/app/dashboard/cycles/page.tsx` | 周期列表页 |
| `src/app/dashboard/cycles/[id]/page.tsx` | 周期详情页 |
| `src/app/dashboard/me/page.tsx` | "我的"页（设置+周期管理） |
| `src/components/timer/timer-panel.tsx` | 计时底部面板（选择任务/控制计时） |
| `src/components/timer/timer-notes-dialog.tsx` | 计时停止备注对话框 |
| `src/components/timer/timer-nav-button.tsx` | 导航栏中间"+"按钮 |
| `src/components/tracking/expandable-entry.tsx` | 可展开的时间记录项 |
| `src/components/task/add-task-to-cycle-dialog.tsx` | 将已有任务添加到周期 |

---

## 修改文件

| 文件 | 变更摘要 |
|------|----------|
| `src/types/database.ts` | Quarter→Cycle 类型，Task 加 user_id，新增 CycleTask |
| `src/stores/timer-store.ts` | 新增 taskColor 状态，stopTimer 返回 taskName |
| `src/components/layout/mobile-nav.tsx` | 5 项导航（含中间 TimerNavButton） |
| `src/components/layout/sidebar.tsx` | 更新路由 + 计时入口 |
| `src/components/layout/header.tsx` | 桌面端计时状态显示 |
| `src/components/task/add-task-dialog.tsx` | quarterId→cycleId 可选，改为 user_id 插入 |
| `src/components/task/edit-task-dialog.tsx` | 简化，去掉 quarter 关联逻辑 |
| `src/components/tracking/time-entry-list.tsx` | 使用 ExpandableEntry |
| `src/components/tracking/week-day-card.tsx` | 更紧凑布局，compact "+" 按钮 |
| `src/components/tracking/time-entry-form.tsx` | 新增 compact 模式 |
| `src/components/analytics/weekly-trend-chart.tsx` | LineChart → BarChart |
| `src/components/analytics/priority-analysis.tsx` | 删除对齐分数部分 |
| `src/components/quarter/quarter-actions.tsx` | quarters→cycles 表名，类型别名兼容 |
| `src/app/dashboard/page.tsx` | redirect → /dashboard/tasks |
| `src/app/dashboard/week/page.tsx` | 查询改为 user_id，新增周小结 |
| `src/app/layout.tsx` | 添加 Toaster（sonner），标题改为 CyclePlan |
| `src/app/page.tsx` | QuarterPlan→CyclePlan，季度→周期 |
| `src/lib/supabase/middleware.ts` | redirect → /dashboard/tasks |

---

## 删除文件

| 文件/目录 | 原因 |
|-----------|------|
| `src/app/dashboard/today/` | 计时功能移到"+"面板 |
| `src/app/dashboard/quarters/` | 移到 `cycles/` |
| `src/app/dashboard/settings/` | 合并到 `me/` |
| `src/components/timer/timer-widget.tsx` | 替换为 timer-panel |
| `src/components/timer/timer-widget-wrapper.tsx` | 替换为 timer-panel |

---

## 新增依赖

| 包 | 用途 |
|----|------|
| `sonner` | Toast 通知（计时保存确认等） |

---

## 构建验证

`npm run build` 通过，零编译错误。
