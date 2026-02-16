import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TimerState {
  isRunning: boolean
  isPaused: boolean
  taskId: string | null
  taskName: string | null
  startTime: number | null
  pausedTime: number
  elapsedSeconds: number

  startTimer: (taskId: string, taskName: string) => void
  pauseTimer: () => void
  resumeTimer: () => void
  stopTimer: () => { taskId: string; duration: number } | null
  tick: () => void
  reset: () => void
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      isRunning: false,
      isPaused: false,
      taskId: null,
      taskName: null,
      startTime: null,
      pausedTime: 0,
      elapsedSeconds: 0,

      startTimer: (taskId, taskName) => {
        set({
          isRunning: true,
          isPaused: false,
          taskId,
          taskName,
          startTime: Date.now(),
          pausedTime: 0,
          elapsedSeconds: 0,
        })
      },

      pauseTimer: () => {
        const state = get()
        if (!state.isRunning || state.isPaused) return

        set({
          isPaused: true,
          pausedTime: state.pausedTime + (Date.now() - (state.startTime || Date.now())),
          startTime: null,
        })
      },

      resumeTimer: () => {
        const state = get()
        if (!state.isRunning || !state.isPaused) return

        set({
          isPaused: false,
          startTime: Date.now(),
        })
      },

      stopTimer: () => {
        const state = get()
        if (!state.taskId) return null

        const totalMs = state.isPaused
          ? state.pausedTime
          : state.pausedTime + (Date.now() - (state.startTime || Date.now()))

        const result = {
          taskId: state.taskId,
          duration: Math.ceil(totalMs / 1000),
        }

        set({
          isRunning: false,
          isPaused: false,
          taskId: null,
          taskName: null,
          startTime: null,
          pausedTime: 0,
          elapsedSeconds: 0,
        })

        return result
      },

      tick: () => {
        const state = get()
        if (!state.isRunning || state.isPaused) return

        const elapsed = state.pausedTime + (Date.now() - (state.startTime || Date.now()))
        set({ elapsedSeconds: Math.floor(elapsed / 1000) })
      },

      reset: () => {
        set({
          isRunning: false,
          isPaused: false,
          taskId: null,
          taskName: null,
          startTime: null,
          pausedTime: 0,
          elapsedSeconds: 0,
        })
      },
    }),
    {
      name: 'timer-storage',
    }
  )
)
