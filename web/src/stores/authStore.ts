import { create } from 'zustand'
import { authApi, userApi } from '@/api'
import { api } from '@/api/request'

export interface User {
  id: number; username: string; phone: string | null; email: string | null;
  nickname: string; avatar: string | null; bio: string | null;
  referral_code: string | null; notification_enabled: boolean;
  email_notification: boolean; created_at: string; last_login_at: string | null;
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  register: (data: { username: string; password: string; phone?: string; nickname?: string; referral_code?: string }) => Promise<void>
  logout: () => void
  fetchProfile: () => Promise<void>
  updateProfile: (data: Record<string, unknown>) => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('access_token'),
  loading: false,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null })
    try {
      const res = await authApi.login({ username, password })
      api.setToken(res.data.access_token)
      set({ token: res.data.access_token })
      await get().fetchProfile()
    } catch (e: any) {
      set({ error: e.message })
      throw e
    } finally {
      set({ loading: false })
    }
  },

  register: async (data) => {
    set({ loading: true, error: null })
    try {
      await authApi.register(data)
    } catch (e: any) {
      set({ error: e.message })
      throw e
    } finally {
      set({ loading: false })
    }
  },

  logout: () => {
    api.clearToken()
    set({ user: null, token: null })
  },

  fetchProfile: async () => {
    try {
      const res = await userApi.getMe()
      set({ user: res.data })
    } catch {
      // Silently fail if not authenticated
    }
  },

  updateProfile: async (data) => {
    const res = await userApi.updateMe(data)
    set({ user: res.data as User })
  },

  clearError: () => set({ error: null }),
}))
