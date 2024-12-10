// src/store/notebookStore.js
import { create } from 'zustand'

const useStore = create((set) => ({
  cells: [],
  aiMessages: [],
  connectedStatus: false,
  
  addCell: (newCell) => set((state) => ({
    cells: [...state.cells, newCell]
  })),
  
  updateCell: (id, content) => set((state) => ({
    cells: state.cells.map(cell =>
      cell.id === id ? { ...cell, content } : cell
    )
  })),
  
  deleteCell: (id) => set((state) => ({
    cells: state.cells.filter(cell => cell.id !== id)
  })),
  
  addAIMessage: (message) => set((state) => ({
    aiMessages: [...state.aiMessages, message]
  })),

  setConnectedStatus: (status) => set({
    connectedStatus: status
  })
}))

export default useStore