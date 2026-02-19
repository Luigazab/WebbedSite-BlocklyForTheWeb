import { create } from 'zustand'

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  activeModal: null,   // e.g. 'createLesson' | 'deleteConfirm' | null
  toasts: [],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  openModal: (modalName) => set({ activeModal: modalName }),
  closeModal: () => set({ activeModal: null }),

  addToast: (message, type = 'info') =>
    set((state) => ({
      toasts: [...state.toasts, { id: Date.now(), message, type }]
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
}))