# QuarterPlan - 季度计划管理应用

## 产品需求文档 (PRD)

**版本**: v1.0
**日期**: 2024-01
**作者**: Product Team

---

## 1. 概述

### 1.1 背景与问题

在知识工作者的日常工作中，普遍存在一个矛盾：

- **重要但不紧急的任务**（如学习新技能、战略项目、长期规划）往往被搁置
- **紧急但不重要的任务**（如临时会议、即时消息、琐碎事务）却占用了大量时间

这导致一个季度结束时，真正重要的目标反而没有完成。用户需要一个工具来：
1. 明确季度内最重要的3-4项任务
2. 追踪每个任务的时间投入
3. 确保时间分配与优先级匹配
4. 及时发现偏离并调整

### 1.2 产品定位

**QuarterPlan** 是一款面向个人的季度目标时间管理工具，帮助用户：
- 规划季度内的核心任务
- 追踪每日时间投入
- 分析时间分配是否符合优先级
- 预测目标完成情况

**核心价值主张**: 让时间投入与优先级对齐，确保重要的事情得到足够的时间。

### 1.3 目标用户

| 用户类型 | 特征 | 痛点 |
|---------|------|------|
| 知识工作者 | 有季度/年度目标，工作内容灵活 | 被日常琐事占用时间，重要目标推进慢 |
| 自由职业者 | 多项目并行，自我管理时间 | 难以平衡客户工作与个人发展 |
| 学习者 | 有学习计划，需要持续投入 | 学习时间被挤压，进度难以保证 |

---

## 2. 产品目标与成功指标

### 2.1 产品目标

**短期目标 (MVP)**:
- 用户能够设置季度任务并追踪时间
- 用户能够看到进度是否符合预期

**中期目标**:
- 用户能够获得优先级分析洞察
- 用户养成每日记录时间的习惯

**长期目标**:
- 用户的季度目标完成率显著提升
- 时间分配与优先级的匹配度提高

### 2.2 成功指标 (KPIs)

| 指标 | 目标值 | 衡量方式 |
|------|--------|---------|
| 周活跃用户留存率 | > 60% | 每周至少记录一次时间 |
| 日均时间记录次数 | > 2次/用户 | 手动记录 + 计时器 |
| 季度目标完成率 | > 70% | 用户自评 + 进度百分比 |
| 优先级对齐分数 | > 75分 | 系统计算 |

---

## 3. 功能需求

### 3.1 功能概览

```
┌─────────────────────────────────────────────────────────────┐
│                      QuarterPlan                            │
├─────────────────────────────────────────────────────────────┤
│  认证系统          季度管理          任务管理               │
│  - 注册            - 创建季度        - 创建任务             │
│  - 登录            - 设置日期        - 设置优先级           │
│  - 登出            - 激活季度        - 预估时间             │
├─────────────────────────────────────────────────────────────┤
│  时间追踪                          数据分析                 │
│  - 手动记录                        - 进度概览               │
│  - 计时器                          - 趋势图表               │
│  - 今日/本周视图                   - 优先级分析             │
│  - 历史记录                        - 完成预测               │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 详细功能规格

#### 3.2.1 用户认证

**FR-AUTH-01: 用户注册**
- 输入: 邮箱、密码
- 验证: 邮箱格式、密码强度（至少8位）
- 输出: 创建账户，发送验证邮件
- 异常: 邮箱已存在提示

**FR-AUTH-02: 用户登录**
- 输入: 邮箱、密码
- 输出: 登录成功，跳转到仪表板
- 异常: 凭据错误提示

**FR-AUTH-03: 登出**
- 清除本地会话，跳转到登录页

**FR-AUTH-04: 路由保护**
- 未登录用户访问 /dashboard/* 自动跳转到 /login

---

#### 3.2.2 季度管理

**FR-QTR-01: 创建季度**
- 输入:
  - 名称（如 "2024 Q1"）
  - 开始日期
  - 结束日期
- 验证: 结束日期 > 开始日期
- 输出: 新建季度记录

**FR-QTR-02: 编辑季度**
- 可修改名称和日期
- 已有任务不受影响

**FR-QTR-03: 删除季度**
- 需二次确认
- 级联删除关联任务和时间记录

**FR-QTR-04: 设置活跃季度**
- 同一时间只有一个活跃季度
- 活跃季度作为默认显示

**FR-QTR-05: 季度列表**
- 显示所有季度
- 按时间倒序排列
- 显示每个季度的任务数量和总进度

---

#### 3.2.3 任务管理

**FR-TASK-01: 创建任务**
- 输入:
  - 任务名称（必填，最长100字符）
  - 描述（可选，最长500字符）
  - 优先级（必填，1-4，1最高）
  - 预估总时间（必填，小时数）
  - 颜色（可选，用于图表区分）
- 验证: 每个季度最多10个任务
- 输出: 新建任务，自动计算每周目标

**FR-TASK-02: 编辑任务**
- 所有字段可编辑
- 修改预估时间后重新计算进度

**FR-TASK-03: 删除任务**
- 需二次确认
- 级联删除时间记录

**FR-TASK-04: 归档任务**
- 软删除，不显示但保留数据
- 可恢复

**FR-TASK-05: 任务排序**
- 默认按优先级排序（P1在前）
- 支持拖拽自定义排序

**FR-TASK-06: 自动计算每周目标**
```
每周目标时间 = 预估总时间 / 季度总周数
调整后目标 = 剩余时间 / 剩余周数
```

---

#### 3.2.4 时间追踪

**FR-TIME-01: 手动记录时间**
- 输入:
  - 选择任务
  - 日期（默认今天）
  - 时长（小时:分钟）
  - 备注（可选）
- 输出: 创建时间记录，更新进度

**FR-TIME-02: 编辑时间记录**
- 可修改时长、备注
- 不可修改日期和任务（需删除重建）

**FR-TIME-03: 删除时间记录**
- 直接删除，无需确认

**FR-TIME-04: 计时器 - 开始**
- 选择任务后启动计时
- 全局显示当前计时状态
- 同一时间只能有一个活跃计时器

**FR-TIME-05: 计时器 - 暂停/继续**
- 暂停后可继续
- 暂停期间时间不累计

**FR-TIME-06: 计时器 - 停止并保存**
- 停止计时器
- 自动创建时间记录（类型=timer）
- 可编辑备注后保存

**FR-TIME-07: 计时器 - 跨设备同步**
- 使用实时数据库同步计时器状态
- 在另一设备上显示当前计时任务和时长

**FR-TIME-08: 今日视图**
- 显示今日所有时间记录
- 显示今日总计时长
- 按任务分组或按时间排序

**FR-TIME-09: 本周视图**
- 按任务 × 日期的网格展示
- 可直接在格子中输入时间
- 显示每日/每任务小计

**FR-TIME-10: 历史记录**
- 按日期范围筛选
- 按任务筛选
- 导出为 CSV（P3）

---

#### 3.2.5 数据分析与可视化

**FR-ANALYTICS-01: 进度概览**
- 季度整体进度（已用天数/总天数）
- 每个任务的进度百分比
- 本周投入 vs 本周目标

**FR-ANALYTICS-02: 任务进度卡片**
显示每个任务的：
- 已投入时间 / 预估时间
- 进度百分比（进度条）
- 本周投入时间
- 状态标签: ✅ 正常 / ⚠️ 有风险 / ❌ 严重落后 / 🚀 超前

**FR-ANALYTICS-03: 进度预测**
基于过去4周的投入速度，预测：
- 按当前速度，预计完成日期
- 是否能在季度结束前完成
- 需要的每周投入时间（如需追赶）

计算逻辑：
```
周均速度 = 过去4周总投入 / 4
剩余时间 = 预估时间 - 已投入时间
预计完成日期 = 今天 + (剩余时间 / 周均速度) 周
```

**FR-ANALYTICS-04: 优先级分析**
分析时间分配是否符合优先级：

| 优先级 | 建议占比 |
|--------|---------|
| P1 | 40% |
| P2 | 30% |
| P3 | 20% |
| P4 | 10% |

输出：
- 实际分配 vs 建议分配对比图
- 对齐分数（0-100）
- 具体洞察，如：
  - "P1任务「xxx」本周仅投入 5%，远低于建议的 40%"
  - "P3任务投入过多，建议将时间转移到更高优先级任务"

**FR-ANALYTICS-05: 趋势图表**
- 每周时间投入折线图
- 按任务堆叠的面积图
- 累计进度曲线 vs 理想曲线

**FR-ANALYTICS-06: 时间分布饼图**
- 按任务显示时间占比
- 按优先级显示时间占比

---

#### 3.2.6 提醒与通知（P2）

**FR-NOTIFY-01: 进度预警**
- 当任务进度落后预期 >20% 时，在仪表板显示提醒

**FR-NOTIFY-02: 每日提醒**
- 可配置每日提醒时间
- 提醒记录今日时间

**FR-NOTIFY-03: 每周总结**
- 每周末发送邮件总结
- 包含本周投入、进度、优先级分析

---

### 3.3 用户故事

**US-01**: 作为用户，我想创建季度计划，以便明确这个季度的重点任务。

**US-02**: 作为用户，我想为每个任务设置优先级和预估时间，以便系统帮我规划每周目标。

**US-03**: 作为用户，我想在工作时使用计时器，以便自动记录时间投入。

**US-04**: 作为用户，我想手动补录时间，以便记录没有使用计时器的工作。

**US-05**: 作为用户，我想看到每个任务的进度，以便了解是否符合预期。

**US-06**: 作为用户，我想看到时间分配是否符合优先级，以便及时调整工作重心。

**US-07**: 作为用户，我想获得完成预测，以便评估目标的可达性。

**US-08**: 作为用户，我想收到进度预警，以便在偏离时及时纠正。

---

## 4. 非功能需求

### 4.1 性能要求

| 场景 | 要求 |
|------|------|
| 页面首屏加载 | < 2秒 (LCP) |
| 页面交互响应 | < 100ms (FID) |
| 计时器更新频率 | 1秒 |
| 数据同步延迟 | < 500ms |

### 4.2 可用性要求

- 支持响应式设计（桌面、平板、手机）
- 支持主流浏览器（Chrome, Firefox, Safari, Edge 最新2个版本）
- 支持键盘导航
- 符合 WCAG 2.1 AA 标准

### 4.3 安全要求

- 所有数据传输使用 HTTPS
- 密码使用 bcrypt 加密存储
- 实施 Row Level Security，用户只能访问自己的数据
- API 请求需携带有效 JWT Token
- 防止 XSS 和 CSRF 攻击

### 4.4 可靠性要求

- 服务可用性 > 99.5%
- 数据每日自动备份
- 支持数据导出

### 4.5 可扩展性要求

- 支持未来添加团队协作功能
- 支持未来添加日历集成
- 数据模型预留扩展字段

---

## 5. 数据模型

### 5.1 实体关系图

```
┌──────────────┐       ┌──────────────────┐       ┌─────────────────┐
│   profiles   │       │     quarters     │       │      tasks      │
├──────────────┤       ├──────────────────┤       ├─────────────────┤
│ id (PK)      │──┐    │ id (PK)          │──┐    │ id (PK)         │
│ email        │  │    │ user_id (FK)     │  │    │ quarter_id (FK) │
│ display_name │  └───>│ name             │  └───>│ name            │
│ settings     │       │ start_date       │       │ description     │
│ created_at   │       │ end_date         │       │ priority (1-4)  │
└──────────────┘       │ is_active        │       │ estimated_hours │
                       │ created_at       │       │ weekly_target   │
                       └──────────────────┘       │ color           │
                                                  │ sort_order      │
                                                  │ is_archived     │
                                                  │ created_at      │
                                                  └────────┬────────┘
                                                           │
                       ┌──────────────────┐                │
                       │   time_entries   │<───────────────┘
                       ├──────────────────┤
                       │ id (PK)          │
                       │ task_id (FK)     │
                       │ date             │
                       │ duration_minutes │
                       │ entry_type       │  (manual | timer)
                       │ started_at       │
                       │ ended_at         │
                       │ notes            │
                       │ created_at       │
                       └──────────────────┘

                       ┌──────────────────┐
                       │  timer_sessions  │  (活跃计时器)
                       ├──────────────────┤
                       │ id (PK)          │
                       │ user_id (FK)     │
                       │ task_id (FK)     │
                       │ started_at       │
                       │ is_active        │
                       └──────────────────┘
```

### 5.2 字段说明

#### profiles (用户配置)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键，来自 Supabase Auth |
| email | TEXT | 用户邮箱 |
| display_name | TEXT | 显示名称 |
| settings | JSONB | 用户设置（默认视图、周起始日等） |
| created_at | TIMESTAMPTZ | 创建时间 |

#### quarters (季度)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 外键，关联用户 |
| name | TEXT | 季度名称，如 "2024 Q1" |
| start_date | DATE | 开始日期 |
| end_date | DATE | 结束日期 |
| is_active | BOOLEAN | 是否为当前活跃季度 |
| created_at | TIMESTAMPTZ | 创建时间 |

#### tasks (任务)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| quarter_id | UUID | 外键，关联季度 |
| name | TEXT | 任务名称 |
| description | TEXT | 任务描述 |
| priority | INTEGER | 优先级 1-4，1最高 |
| estimated_hours | NUMERIC | 预估总时间（小时） |
| weekly_target_hours | NUMERIC | 每周目标时间 |
| color | TEXT | 颜色代码，用于图表 |
| sort_order | INTEGER | 排序顺序 |
| is_archived | BOOLEAN | 是否已归档 |
| created_at | TIMESTAMPTZ | 创建时间 |

#### time_entries (时间记录)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| task_id | UUID | 外键，关联任务 |
| date | DATE | 记录日期 |
| duration_minutes | INTEGER | 时长（分钟） |
| entry_type | TEXT | 类型: 'manual' 或 'timer' |
| started_at | TIMESTAMPTZ | 开始时间（计时器类型） |
| ended_at | TIMESTAMPTZ | 结束时间（计时器类型） |
| notes | TEXT | 备注 |
| created_at | TIMESTAMPTZ | 创建时间 |

#### timer_sessions (计时器会话)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 外键，关联用户 |
| task_id | UUID | 外键，关联任务 |
| started_at | TIMESTAMPTZ | 开始时间 |
| is_active | BOOLEAN | 是否活跃 |

---

## 6. 界面设计

### 6.1 页面结构

```
/                       # 着陆页（未登录展示产品介绍）
/login                  # 登录页
/signup                 # 注册页

/dashboard              # 仪表板主页（概览）
/dashboard/quarters     # 季度列表
/dashboard/quarters/new # 新建季度
/dashboard/quarters/:id # 季度详情（含任务列表）
/dashboard/track        # 时间追踪（今日视图 + 计时器）
/dashboard/analytics    # 数据分析
/dashboard/settings     # 用户设置
```

### 6.2 核心页面线框图

#### 6.2.1 仪表板主页

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌─────┐  QuarterPlan              [🔔]  [⏱ 01:23:45 ▶]  [头像 ▼] │
│  │ ≡   │                                                           │
├──┼─────┼───────────────────────────────────────────────────────────┤
│  │     │                                                           │
│  │ 📊  │   Q1 2024 进度概览                      剩余 45 天        │
│  │概览 │   ████████████░░░░░░░░░░░░░░░░░  42%                      │
│  │     │                                                           │
│  │ 📅  │   ┌────────────────────────────────────────────────────┐  │
│  │季度 │   │  本周概览                              查看详情 →  │  │
│  │     │   │                                                    │  │
│  │ ⏱️  │   │  已投入 12.5h / 目标 20h                           │  │
│  │追踪 │   │  ████████████░░░░░░░░░░░░░░░░░  62.5%              │  │
│  │     │   └────────────────────────────────────────────────────┘  │
│  │ 📈  │                                                           │
│  │分析 │   任务进度                                                │
│  │     │   ┌────────────┐ ┌────────────┐ ┌────────────┐           │
│  │ ⚙️  │   │ P1 项目A   │ │ P2 项目B   │ │ P3 学习C   │           │
│  │设置 │   │ ████░ 60%  │ │ ███░░ 40%  │ │ █░░░░ 20%  │           │
│  │     │   │ 本周: 8h   │ │ 本周: 3h   │ │ 本周: 1.5h │           │
│  │     │   │ ✅ 正常    │ │ ⚠️ 有风险  │ │ ❌ 落后    │           │
│  │     │   └────────────┘ └────────────┘ └────────────┘           │
│  │     │                                                           │
│  │     │   ⚠️ 优先级提醒                                           │
│  │     │   ┌────────────────────────────────────────────────────┐  │
│  │     │   │ P1任务「项目A」本周投入时间低于目标，建议增加 2h   │  │
│  │     │   └────────────────────────────────────────────────────┘  │
│  │     │                                                           │
└──┴─────┴───────────────────────────────────────────────────────────┘
```

#### 6.2.2 时间追踪页

```
┌─────────────────────────────────────────────────────────────────────┐
│  时间追踪                                      📅 2024-01-15 (今天) │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ⏱️ 计时器                                                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │              ┌─────────────────────┐                        │   │
│  │              │     01:23:45        │                        │   │
│  │              └─────────────────────┘                        │   │
│  │                                                             │   │
│  │              任务: [ 项目A - 功能开发       ▼ ]             │   │
│  │                                                             │   │
│  │              [  ⏸️ 暂停  ]    [  ⏹️ 停止并保存  ]            │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  📝 今日记录                                      [ + 手动添加 ]   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  任务          │ 时长      │ 类型    │ 备注       │ 操作    │   │
│  ├────────────────┼───────────┼─────────┼────────────┼─────────┤   │
│  │  项目A         │ 2h 30m    │ ⏱️ 计时 │ 完成API    │ ✏️  🗑️  │   │
│  │  项目B         │ 1h 00m    │ ✍️ 手动 │ 会议       │ ✏️  🗑️  │   │
│  │  学习C         │ 0h 45m    │ ⏱️ 计时 │ -          │ ✏️  🗑️  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  今日总计: 4h 15m                                                  │
│                                                                     │
│  ────────────────────────────────────────────────────────────────  │
│                                                                     │
│  📊 本周视图                                                       │
│  ┌─────────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬────┐ │
│  │ 任务    │ 周一 │ 周二 │ 周三 │ 周四 │ 周五 │ 周六 │ 周日 │ 合计│ │
│  ├─────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼────┤ │
│  │ 项目A   │ 2.5h │ 3h   │ 2h   │ -    │ -    │ -    │ -    │7.5h│ │
│  │ 项目B   │ 1h   │ -    │ 2h   │ -    │ -    │ -    │ -    │ 3h │ │
│  │ 学习C   │ 0.5h │ 1h   │ 0.5h │ -    │ -    │ -    │ -    │ 2h │ │
│  ├─────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼────┤ │
│  │ 合计    │ 4h   │ 4h   │ 4.5h │ -    │ -    │ -    │ -    │12.5│ │
│  └─────────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### 6.2.3 数据分析页

```
┌─────────────────────────────────────────────────────────────────────┐
│  数据分析                                                    Q1 2024│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐│
│  │  优先级对齐分数              │  │  时间分布                    ││
│  │                              │  │                              ││
│  │        ┌───────┐             │  │      ┌─────────────┐         ││
│  │        │  78   │             │  │     /    P1: 45%    \        ││
│  │        │  /100 │             │  │    │    P2: 30%     │        ││
│  │        └───────┘             │  │    │    P3: 15%     │        ││
│  │                              │  │     \   P4: 10%    /         ││
│  │   ✅ 时间分配较为合理        │  │      └─────────────┘         ││
│  └──────────────────────────────┘  └──────────────────────────────┘│
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  每周趋势                                                    │  │
│  │                                                              │  │
│  │  25h │                                    ┌──┐               │  │
│  │      │                          ┌──┐     │  │               │  │
│  │  20h │              ┌──┐        │  │     │  │               │  │
│  │      │    ┌──┐      │  │  ┌──┐  │  │     │  │               │  │
│  │  15h │    │  │      │  │  │  │  │  │     │  │               │  │
│  │      │    │  │  ┌──┐│  │  │  │  │  │     │  │               │  │
│  │  10h │────┴──┴──┴──┴┴──┴──┴──┴──┴──┴─────┴──┴───────────    │  │
│  │      │   W1   W2   W3   W4   W5   W6   W7   ...              │  │
│  │                                                              │  │
│  │  ── 实际投入   ‥‥ 目标线                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  💡 洞察与建议                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ⚠️  P1任务「项目A」过去2周投入下降 20%，需要关注              │  │
│  │ 💡 建议每周至少投入 10h 在P1任务上以保持进度                  │  │
│  │ ✅ P2任务「项目B」进度正常，预计可提前完成                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. 技术架构

### 7.1 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         客户端 (浏览器)                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Next.js 前端                         │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────────┐   │   │
│  │  │ React     │  │ Zustand   │  │ React Query       │   │   │
│  │  │ 组件      │  │ 状态管理  │  │ 数据缓存          │   │   │
│  │  └───────────┘  └───────────┘  └───────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Vercel Edge Network                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           Next.js Server (API Routes / RSC)             │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Supabase                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐     │
│  │ Auth        │  │ PostgreSQL  │  │ Realtime            │     │
│  │ 身份认证    │  │ 数据库      │  │ 实时订阅            │     │
│  └─────────────┘  └─────────────┘  └─────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 技术栈清单

| 类别 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 框架 | Next.js | 14.x | 全栈框架 |
| 语言 | TypeScript | 5.x | 类型安全 |
| 样式 | Tailwind CSS | 3.x | 原子化CSS |
| UI组件 | shadcn/ui | latest | 组件库 |
| 状态管理 | Zustand | 4.x | 客户端状态 |
| 数据请求 | React Query | 5.x | 服务端状态 |
| 图表 | Recharts | 2.x | 数据可视化 |
| 日期 | date-fns | 3.x | 日期处理 |
| 数据库 | Supabase | latest | BaaS |
| 部署 | Vercel | - | 托管平台 |

---

## 8. 发布计划

### 8.1 版本路线图

| 版本 | 时间 | 主要功能 |
|------|------|---------|
| v0.1 (MVP) | Week 1-2 | 认证、季度任务管理、手动时间记录、基础进度展示 |
| v0.2 | Week 3 | 计时器功能、跨设备同步 |
| v0.3 | Week 4 | 进度预测、优先级分析、图表 |
| v1.0 | Week 5 | Bug修复、性能优化、正式发布 |

### 8.2 MVP 范围

**必须有 (Must Have)**:
- [x] 用户注册/登录
- [x] 创建季度和任务
- [x] 手动记录时间
- [x] 查看任务进度百分比

**应该有 (Should Have)**:
- [ ] 计时器
- [ ] 进度预测
- [ ] 优先级分析

**可以有 (Could Have)**:
- [ ] 数据导出
- [ ] 每周邮件总结
- [ ] 暗黑模式

**不做 (Won't Have)**:
- [ ] 团队协作
- [ ] 移动App
- [ ] 日历集成

---

## 9. 技术实现计划

### 9.1 项目结构

```
quarter-plan/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # 认证相关页面（无侧边栏布局）
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/              # 仪表板页面（有侧边栏布局）
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # 主仪表板
│   │   │   ├── quarters/
│   │   │   │   ├── page.tsx          # 季度列表
│   │   │   │   ├── new/page.tsx      # 新建季度
│   │   │   │   └── [id]/page.tsx     # 季度详情
│   │   │   ├── track/page.tsx        # 时间追踪
│   │   │   ├── analytics/page.tsx    # 数据分析
│   │   │   └── settings/page.tsx     # 设置
│   │   ├── api/                      # API Routes（如需要）
│   │   ├── layout.tsx                # 根布局
│   │   ├── page.tsx                  # 着陆页
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui 基础组件
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── progress.tsx
│   │   │   └── ...
│   │   ├── layout/                   # 布局组件
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── mobile-nav.tsx
│   │   ├── quarter/                  # 季度相关组件
│   │   │   ├── quarter-card.tsx
│   │   │   ├── quarter-form.tsx
│   │   │   └── quarter-selector.tsx
│   │   ├── task/                     # 任务相关组件
│   │   │   ├── task-list.tsx
│   │   │   ├── task-card.tsx
│   │   │   ├── task-form.tsx
│   │   │   └── priority-badge.tsx
│   │   ├── timer/                    # 计时器组件
│   │   │   ├── timer-widget.tsx
│   │   │   ├── timer-display.tsx
│   │   │   └── floating-timer.tsx
│   │   ├── tracking/                 # 时间记录组件
│   │   │   ├── time-entry-form.tsx
│   │   │   ├── time-entry-list.tsx
│   │   │   └── weekly-grid.tsx
│   │   └── analytics/                # 分析图表组件
│   │       ├── progress-overview.tsx
│   │       ├── priority-analysis.tsx
│   │       ├── weekly-trend-chart.tsx
│   │       └── time-distribution.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # 浏览器端 Supabase 客户端
│   │   │   ├── server.ts             # 服务器端 Supabase 客户端
│   │   │   └── middleware.ts         # Auth 中间件
│   │   ├── api/                      # 数据操作函数
│   │   │   ├── quarters.ts
│   │   │   ├── tasks.ts
│   │   │   └── time-entries.ts
│   │   ├── algorithms/               # 核心算法
│   │   │   ├── weekly-target.ts      # 每周目标计算
│   │   │   ├── progress-prediction.ts # 进度预测
│   │   │   └── priority-analysis.ts  # 优先级分析
│   │   ├── utils.ts                  # 工具函数
│   │   └── constants.ts              # 常量定义
│   │
│   ├── hooks/                        # 自定义 Hooks
│   │   ├── use-auth.ts
│   │   ├── use-quarters.ts
│   │   ├── use-tasks.ts
│   │   ├── use-time-entries.ts
│   │   └── use-timer.ts
│   │
│   ├── stores/                       # Zustand 状态管理
│   │   └── timer-store.ts
│   │
│   └── types/                        # TypeScript 类型定义
│       ├── database.ts               # 数据库表类型
│       └── index.ts
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql    # 数据库迁移文件
│
├── public/
├── .env.local                        # 环境变量
├── middleware.ts                     # Next.js 中间件（路由保护）
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 9.2 实现阶段与详细步骤

#### Phase 1: 项目初始化 (Day 1)

**Step 1.1: 创建 Next.js 项目**
```bash
npx create-next-app@latest quarter-plan --typescript --tailwind --eslint --app --src-dir
```

**Step 1.2: 安装核心依赖**
```bash
# Supabase
npm install @supabase/supabase-js @supabase/ssr

# 状态管理与数据请求
npm install @tanstack/react-query zustand

# 日期处理与图表
npm install date-fns recharts

# 工具库
npm install lucide-react class-variance-authority clsx tailwind-merge
```

**Step 1.3: 安装 shadcn/ui**
```bash
npx shadcn@latest init
npx shadcn@latest add button card input dialog progress badge form label select tabs toast alert
```

**Step 1.4: 配置环境变量**
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

#### Phase 2: 数据库配置 (Day 1-2)

**Step 2.1: 创建 Supabase 项目**
- 访问 supabase.com 创建新项目
- 记录 Project URL 和 anon key

**Step 2.2: 执行数据库迁移**

创建 `supabase/migrations/001_initial_schema.sql`:

```sql
-- 用户配置表
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  settings JSONB DEFAULT '{"defaultView": "week", "weekStartDay": 1}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 季度表
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

-- 任务表
CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quarter_id UUID REFERENCES public.quarters(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  priority INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 4),
  estimated_hours NUMERIC(6,2) NOT NULL,
  weekly_target_hours NUMERIC(5,2),
  color TEXT DEFAULT '#3B82F6',
  sort_order INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 时间记录表
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

-- 计时器会话表
CREATE TABLE public.timer_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_quarters_user ON public.quarters(user_id);
CREATE INDEX idx_tasks_quarter ON public.tasks(quarter_id);
CREATE INDEX idx_time_entries_task ON public.time_entries(task_id);
CREATE INDEX idx_time_entries_date ON public.time_entries(date);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quarters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timer_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own data" ON public.profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own quarters" ON public.quarters
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own tasks" ON public.tasks
  FOR ALL USING (
    quarter_id IN (SELECT id FROM public.quarters WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage own time entries" ON public.time_entries
  FOR ALL USING (
    task_id IN (
      SELECT t.id FROM public.tasks t
      JOIN public.quarters q ON t.quarter_id = q.id
      WHERE q.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own timer sessions" ON public.timer_sessions
  FOR ALL USING (auth.uid() = user_id);

-- 触发器：新用户注册时自动创建 profile
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
```

**Step 2.3: 配置 Supabase 客户端**

创建 `src/lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

创建 `src/lib/supabase/server.ts`:
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

---

#### Phase 3: 认证系统 (Day 2-3)

**Step 3.1: 创建认证布局和页面**
- `src/app/(auth)/layout.tsx` - 居中卡片布局
- `src/app/(auth)/login/page.tsx` - 登录表单
- `src/app/(auth)/signup/page.tsx` - 注册表单

**Step 3.2: 配置路由保护中间件**

创建 `middleware.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 创建响应
  let response = NextResponse.next({ request })

  // 创建 Supabase 客户端
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // 获取用户会话
  const { data: { user } } = await supabase.auth.getUser()

  // 保护 dashboard 路由
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 已登录用户访问登录页，重定向到 dashboard
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
}
```

**Step 3.3: 创建认证 Hook**

创建 `src/hooks/use-auth.ts`:
```typescript
'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const supabase = createClient()
  const router = useRouter()

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) router.push('/dashboard')
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return { signIn, signUp, signOut }
}
```

---

#### Phase 4: 仪表板布局 (Day 3-4)

**Step 4.1: 创建布局组件**
- `src/components/layout/sidebar.tsx` - 侧边导航栏
- `src/components/layout/header.tsx` - 顶部栏（用户信息、计时器状态）
- `src/components/layout/mobile-nav.tsx` - 移动端底部导航

**Step 4.2: 创建仪表板布局**

`src/app/(dashboard)/layout.tsx`:
```typescript
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar className="hidden md:flex" />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

---

#### Phase 5: 季度与任务管理 (Day 4-6)

**Step 5.1: 创建数据操作函数**

`src/lib/api/quarters.ts`:
```typescript
import { createClient } from '@/lib/supabase/client'
import type { Quarter } from '@/types/database'

export async function getQuarters() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('quarters')
    .select('*')
    .order('start_date', { ascending: false })
  return { data, error }
}

export async function createQuarter(quarter: Omit<Quarter, 'id' | 'created_at'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('quarters')
    .insert(quarter)
    .select()
    .single()
  return { data, error }
}

// ... updateQuarter, deleteQuarter, setActiveQuarter
```

**Step 5.2: 创建 React Query Hooks**

`src/hooks/use-quarters.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getQuarters, createQuarter, updateQuarter } from '@/lib/api/quarters'

export function useQuarters() {
  return useQuery({
    queryKey: ['quarters'],
    queryFn: getQuarters,
  })
}

export function useCreateQuarter() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createQuarter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quarters'] })
    },
  })
}
```

**Step 5.3: 创建页面和组件**
- `src/app/(dashboard)/quarters/page.tsx` - 季度列表
- `src/app/(dashboard)/quarters/new/page.tsx` - 新建季度
- `src/app/(dashboard)/quarters/[id]/page.tsx` - 季度详情（任务列表）
- `src/components/quarter/quarter-form.tsx` - 季度表单
- `src/components/task/task-form.tsx` - 任务表单
- `src/components/task/task-card.tsx` - 任务卡片

---

#### Phase 6: 时间追踪 (Day 6-8)

**Step 6.1: 手动时间记录**
- `src/components/tracking/time-entry-form.tsx` - 时间记录表单
- `src/components/tracking/time-entry-list.tsx` - 今日记录列表
- `src/app/(dashboard)/track/page.tsx` - 时间追踪页面

**Step 6.2: 计时器功能**

创建 Zustand Store `src/stores/timer-store.ts`:
```typescript
import { create } from 'zustand'

interface TimerState {
  isRunning: boolean
  taskId: string | null
  startTime: Date | null
  elapsedSeconds: number

  startTimer: (taskId: string) => void
  stopTimer: () => void
  tick: () => void
}

export const useTimerStore = create<TimerState>((set, get) => ({
  isRunning: false,
  taskId: null,
  startTime: null,
  elapsedSeconds: 0,

  startTimer: (taskId) => set({
    isRunning: true,
    taskId,
    startTime: new Date(),
    elapsedSeconds: 0,
  }),

  stopTimer: () => {
    const { taskId, elapsedSeconds } = get()
    // 保存时间记录到数据库
    return { taskId, duration: elapsedSeconds }
  },

  tick: () => set((state) => ({
    elapsedSeconds: state.isRunning
      ? Math.floor((Date.now() - state.startTime!.getTime()) / 1000)
      : state.elapsedSeconds
  })),
}))
```

**Step 6.3: 创建计时器组件**
- `src/components/timer/timer-widget.tsx` - 主计时器组件
- `src/components/timer/floating-timer.tsx` - 全局悬浮计时器

---

#### Phase 7: 数据分析 (Day 8-10)

**Step 7.1: 实现核心算法**

`src/lib/algorithms/progress-prediction.ts`:
```typescript
export function predictProgress(task, timeEntries, quarterDates) {
  // 计算当前进度
  const totalLogged = timeEntries.reduce((sum, e) => sum + e.duration_minutes, 0) / 60
  const progress = (totalLogged / task.estimated_hours) * 100

  // 计算周均速度（过去4周）
  const recentWeeks = getRecentWeeks(timeEntries, 4)
  const weeklyVelocity = recentWeeks.totalHours / recentWeeks.weeks

  // 预测完成日期
  const remainingHours = task.estimated_hours - totalLogged
  const weeksToComplete = remainingHours / weeklyVelocity
  const predictedDate = addWeeks(new Date(), weeksToComplete)

  // 判断状态
  const status = determineStatus(progress, expectedProgress)

  return { progress, weeklyVelocity, predictedDate, status }
}
```

`src/lib/algorithms/priority-analysis.ts`:
```typescript
const RECOMMENDED_DISTRIBUTION = { 1: 40, 2: 30, 3: 20, 4: 10 }

export function analyzePriority(tasks, timeEntries) {
  // 按优先级汇总时间
  const actualDistribution = calculateDistribution(tasks, timeEntries)

  // 计算对齐分数
  const alignmentScore = calculateAlignmentScore(
    actualDistribution,
    RECOMMENDED_DISTRIBUTION
  )

  // 生成洞察
  const insights = generateInsights(tasks, actualDistribution)

  return { actualDistribution, alignmentScore, insights }
}
```

**Step 7.2: 创建图表组件**
- `src/components/analytics/progress-overview.tsx` - 进度概览
- `src/components/analytics/weekly-trend-chart.tsx` - 周趋势图（Recharts）
- `src/components/analytics/priority-analysis.tsx` - 优先级分析
- `src/components/analytics/time-distribution.tsx` - 时间分布饼图

**Step 7.3: 创建分析页面**
- `src/app/(dashboard)/analytics/page.tsx`

---

#### Phase 8: 主仪表板 (Day 10-11)

**Step 8.1: 整合所有组件**

`src/app/(dashboard)/page.tsx`:
```typescript
export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <QuarterProgress />
      <WeeklyOverview />
      <TaskProgressGrid />
      <PriorityAlerts />
    </div>
  )
}
```

---

#### Phase 9: 测试与优化 (Day 11-12)

**Step 9.1: 功能测试清单**
- [ ] 用户注册、登录、登出
- [ ] 创建季度、编辑、删除
- [ ] 创建任务、设置优先级
- [ ] 手动记录时间
- [ ] 计时器启动、停止、保存
- [ ] 进度计算准确性
- [ ] 优先级分析准确性
- [ ] 响应式布局（桌面/移动端）

**Step 9.2: 性能优化**
- React Query 缓存策略优化
- 组件懒加载
- 图片优化

---

#### Phase 10: 部署 (Day 12)

**Step 10.1: Vercel 部署**
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

**Step 10.2: 配置环境变量**
- 在 Vercel Dashboard 添加 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### 9.3 关键代码示例

#### 9.3.1 任务进度卡片组件

```typescript
// src/components/task/task-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { PriorityBadge } from './priority-badge'

interface TaskCardProps {
  task: TaskWithProgress
}

export function TaskCard({ task }: TaskCardProps) {
  const statusConfig = {
    on_track: { label: '正常', variant: 'success', icon: '✅' },
    at_risk: { label: '有风险', variant: 'warning', icon: '⚠️' },
    behind: { label: '落后', variant: 'destructive', icon: '❌' },
    ahead: { label: '超前', variant: 'default', icon: '🚀' },
  }

  const status = statusConfig[task.status]

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{task.name}</CardTitle>
          <PriorityBadge priority={task.priority} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>{task.logged_hours}h / {task.estimated_hours}h</span>
              <span>{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="h-2" />
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              本周: {task.logged_this_week}h
            </span>
            <Badge variant={status.variant}>
              {status.icon} {status.label}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

#### 9.3.2 计时器组件

```typescript
// src/components/timer/timer-widget.tsx
'use client'
import { useEffect } from 'react'
import { useTimerStore } from '@/stores/timer-store'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Play, Pause, Square } from 'lucide-react'

export function TimerWidget({ tasks }) {
  const { isRunning, taskId, elapsedSeconds, startTimer, stopTimer, tick } = useTimerStore()

  // 每秒更新
  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [isRunning, tick])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleStop = async () => {
    const result = stopTimer()
    // 保存到数据库
    await saveTimeEntry({
      task_id: result.taskId,
      duration_minutes: Math.ceil(result.duration / 60),
      entry_type: 'timer',
    })
  }

  return (
    <div className="p-6 border rounded-lg">
      <div className="text-5xl font-mono text-center mb-6">
        {formatTime(elapsedSeconds)}
      </div>

      <Select
        value={taskId}
        onValueChange={(id) => !isRunning && setTaskId(id)}
        disabled={isRunning}
      >
        {tasks.map(task => (
          <SelectItem key={task.id} value={task.id}>
            {task.name}
          </SelectItem>
        ))}
      </Select>

      <div className="flex gap-2 mt-4">
        {!isRunning ? (
          <Button onClick={() => startTimer(taskId)} disabled={!taskId}>
            <Play className="mr-2 h-4 w-4" /> 开始
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={pauseTimer}>
              <Pause className="mr-2 h-4 w-4" /> 暂停
            </Button>
            <Button variant="destructive" onClick={handleStop}>
              <Square className="mr-2 h-4 w-4" /> 停止并保存
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
```

#### 9.3.3 优先级分析组件

```typescript
// src/components/analytics/priority-analysis.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e']

export function PriorityAnalysis({ analysis }) {
  const { alignmentScore, actualDistribution, insights } = analysis

  const pieData = Object.entries(actualDistribution).map(([priority, value]) => ({
    name: `P${priority}`,
    value: Math.round(value),
  }))

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>优先级对齐分数</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-6xl font-bold text-center">
            {alignmentScore}
            <span className="text-2xl text-muted-foreground">/100</span>
          </div>
          <p className="text-center text-muted-foreground mt-2">
            {alignmentScore >= 80 ? '✅ 时间分配合理' :
             alignmentScore >= 60 ? '⚠️ 需要调整' : '❌ 严重偏离'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>时间分布</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name">
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>洞察与建议</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {insights.map((insight, i) => (
            <Alert key={i} variant={insight.type === 'warning' ? 'destructive' : 'default'}>
              <AlertDescription>{insight.message}</AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
```

---

### 9.4 测试与验证

#### 功能验证清单

| 功能 | 验证方式 | 预期结果 |
|------|---------|---------|
| 用户注册 | 输入邮箱密码，提交 | 跳转到仪表板，数据库有记录 |
| 创建季度 | 填写表单，提交 | 列表显示新季度 |
| 创建任务 | 设置优先级和预估时间 | 自动计算每周目标 |
| 手动记录 | 选择任务，输入时长 | 进度更新 |
| 计时器 | 开始→停止→保存 | 时间记录入库 |
| 进度预测 | 查看任务详情 | 显示预测完成日期 |
| 优先级分析 | 查看分析页 | 显示对齐分数和洞察 |

#### 边界测试

- 零时间记录时的进度显示
- 季度结束后的状态处理
- 超长任务名称的显示
- 移动端布局适配

---

## 10. 风险与缓解

| 风险 | 影响 | 可能性 | 缓解措施 |
|------|------|--------|---------|
| 计时器跨设备同步延迟 | 中 | 中 | 使用Supabase Realtime，设计离线重连机制 |
| 用户不习惯记录时间 | 高 | 高 | 提供计时器减少手动输入，发送提醒 |
| 数据量增大后性能下降 | 中 | 低 | 分页查询，索引优化，数据归档 |
| Supabase免费额度不足 | 低 | 低 | 监控用量，必要时升级或自托管 |

---

## 10. 附录

### 10.1 术语表

| 术语 | 定义 |
|------|------|
| 季度 (Quarter) | 用户设定的时间周期，通常为3个月 |
| 任务 (Task) | 季度内的核心目标项 |
| 优先级 (Priority) | 任务的重要程度，1最高，4最低 |
| 时间记录 (Time Entry) | 单次时间投入的记录 |
| 计时器 (Timer) | 自动计时工具 |
| 进度 (Progress) | 已投入时间 / 预估时间 的百分比 |
| 对齐分数 (Alignment Score) | 时间分配与优先级匹配程度的分数 |

### 10.2 参考资料

- [艾森豪威尔矩阵](https://en.wikipedia.org/wiki/Eisenhower_matrix)
- [OKR方法论](https://www.atlassian.com/agile/agile-at-scale/okr)
- [时间块工作法](https://todoist.com/productivity-methods/time-blocking)
