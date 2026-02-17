# CyclePlan - 周期计划管理

帮助你规划周期目标，追踪时间投入，确保重要的事情得到足够的时间。

## 功能概览

- **周期管理** — 创建、切换、归档周期，直观查看进度和活动日历
- **任务追踪** — 按优先级（P1-P4）管理任务，记录时间投入，预测完成进度
- **本周视图** — 每日时间分布一览，支持每日备注记录收获感悟
- **计时器** — 内置计时器，一键开始/暂停，自动记录时间
- **数据分析** — 优先级分布、每周趋势图、进度预测

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 15 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS + shadcn/ui |
| 数据库 | Supabase (PostgreSQL + Auth + RLS) |
| 图表 | Recharts |
| 部署 | Vercel |

## 快速开始

```bash
cd quarter-plan
npm install
```

创建 `.env.local` 文件：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

启动开发服务器：

```bash
npm run dev
```

访问 http://localhost:3000

## 数据库迁移

在 Supabase Dashboard 的 SQL Editor 中按顺序执行：

1. `quarter-plan/supabase/migrations/002_cycles_refactor.sql` — quarters 迁移至 cycles 体系
2. `quarter-plan/supabase/migrations/003_archive_and_daily_notes.sql` — 周期归档 + 每日备注

## 项目结构

```
quarter-plan/
├── src/
│   ├── app/dashboard/       # 页面路由
│   │   ├── tasks/           # 任务管理
│   │   ├── week/            # 本周视图
│   │   ├── cycles/          # 周期管理
│   │   └── me/              # 个人设置
│   ├── components/
│   │   ├── analytics/       # 数据分析组件
│   │   ├── calendar/        # 活动日历 & 圆环
│   │   ├── cycle/           # 周期切换器 & 管理
│   │   ├── task/            # 任务相关对话框
│   │   ├── timer/           # 计时器面板
│   │   ├── tracking/        # 时间记录 & 本周卡片
│   │   └── ui/              # shadcn/ui 基础组件
│   ├── lib/supabase/        # Supabase 客户端
│   ├── stores/              # Zustand 状态管理
│   └── types/               # TypeScript 类型定义
└── supabase/migrations/     # 数据库迁移脚本
```
