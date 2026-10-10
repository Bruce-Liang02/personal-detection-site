import { create } from 'zustand'
import { creditApi } from '@/api'

interface CreditState {
  balance: number
  total_recharged: number
  total_consumed: number
  frozen: number
  packages: Record<string, { name: string; credits: number; price: number }>
  transactions: { id: number; amount: number; type: string; reference: string | null; description: string | null; balance_after: number; created_at: string }[]
  loading: boolean
  refresh: () => Promise<void>
  loadPackages: () => Promise<void>
  loadTransactions: (page?: number) => Promise<void>
}

export const useCreditStore = create<CreditState>((set) => ({
  balance: 0,
  total_recharged: 0,
  total_consumed: 0,
  frozen: 0,
  packages: {},
  transactions: [],
  loading: false,

  refresh: async () => {
    try {
      const res = await creditApi.getAccount()
      set({
        balance: res.data.balance,
        total_recharged: res.data.total_recharged,
        total_consumed: res.data.total_consumed,
        frozen: res.data.frozen,
      })
    } catch {}
  },

  loadPackages: async () => {
    try {
      const res = await creditApi.listPackages()
      set({ packages: res.data })
    } catch {}
  },

  loadTransactions: async (page = 1) => {
    try {
      const res = await creditApi.listTransactions(page)
      set({ transactions: res.data.items })
    } catch {}
  },
}))
