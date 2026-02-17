export interface Profile {
  id: string
  email: string | null
  display_name: string | null
  settings: UserSettings
  created_at: string
  updated_at: string
}

export interface UserSettings {
  defaultView: 'day' | 'week' | 'month'
  weekStartDay: 0 | 1 // 0=周日, 1=周一
  workingHoursPerDay?: number
}

export interface Cycle {
  id: string
  user_id: string
  name: string
  start_date: string
  end_date: string
  is_active: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
}

/** @deprecated Use Cycle instead */
export type Quarter = Cycle

export interface Task {
  id: string
  user_id: string
  quarter_id?: string | null
  name: string
  description: string | null
  priority: 1 | 2 | 3 | 4
  estimated_hours: number
  weekly_target_hours: number | null
  color: string
  sort_order: number
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface CycleTask {
  id: string
  cycle_id: string
  task_id: string
  weekly_target_hours: number | null
  created_at: string
}

export interface TimeEntry {
  id: string
  task_id: string
  date: string
  duration_minutes: number
  entry_type: 'manual' | 'timer'
  started_at: string | null
  ended_at: string | null
  notes: string | null
  created_at: string
}

export interface TimerSession {
  id: string
  user_id: string
  task_id: string
  started_at: string
  is_active: boolean
  created_at: string
}

// 带进度计算的扩展类型
export interface TaskWithProgress extends Task {
  total_logged_minutes: number
  logged_this_week: number
  progress_percentage: number
  status: 'on_track' | 'at_risk' | 'behind' | 'ahead'
}

export interface CycleWithTasks extends Cycle {
  tasks: TaskWithProgress[]
  total_progress: number
}

/** @deprecated Use CycleWithTasks instead */
export type QuarterWithTasks = CycleWithTasks

export interface DailyNote {
  id: string
  user_id: string
  date: string
  content: string
  created_at: string
  updated_at: string
}

// 分析相关类型
export interface ProgressPrediction {
  current_progress: number
  expected_progress: number
  progress_delta: number
  predicted_completion: string | null
  will_complete_on_time: boolean
  days_ahead_or_behind: number
  weekly_velocity: number
  required_weekly_velocity: number
  velocity_trend: 'increasing' | 'stable' | 'decreasing'
  status: 'on_track' | 'at_risk' | 'behind' | 'ahead'
  confidence: number
}

export interface PriorityInsight {
  type: 'warning' | 'suggestion' | 'positive'
  severity: 'high' | 'medium' | 'low'
  message: string
  task_id?: string
  recommendation?: string
}

export interface PriorityAnalysis {
  is_aligned_with_priority: boolean
  alignment_score: number
  actual_distribution: Record<number, number>
  recommended_distribution: Record<number, number>
  insights: PriorityInsight[]
}
