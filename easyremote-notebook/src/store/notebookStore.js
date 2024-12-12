import { create } from 'zustand'

const useStore = create((set) => ({
  cells: [],
  addCell: (newCell, index) => set((state) => {
    const updatedCells = [...state.cells]
    updatedCells.splice(index, 0, newCell)
    return { cells: updatedCells }
  }),
  deleteCell: (cellId) => set((state) => {
    const updatedCells = state.cells.filter(cell => cell.id !== cellId)
    return { cells: updatedCells }
  }),
  updateCell: (cellId, newContent) => set((state) => {
    const updatedCells = state.cells.map(cell => 
      cell.id === cellId ? { ...cell, content: newContent } : cell
    )
    return { cells: updatedCells }
  }),
}))

export default useStore
