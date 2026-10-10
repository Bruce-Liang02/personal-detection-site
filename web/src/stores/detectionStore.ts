import { create } from 'zustand'

interface DetectionState {
  file: File | null
  paperTitle: string
  authorName: string
  setFile: (file: File | null) => void
  setPaperTitle: (title: string) => void
  setAuthorName: (name: string) => void
  clear: () => void
}

export const useDetectionStore = create<DetectionState>(set => ({
  file: null,
  paperTitle: '',
  authorName: '',
  setFile: (file) => set({ file }),
  setPaperTitle: (paperTitle) => set({ paperTitle }),
  setAuthorName: (authorName) => set({ authorName }),
  clear: () => set({ file: null, paperTitle: '', authorName: '' }),
}))
