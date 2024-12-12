import {create} from 'zustand'

const useMarkdownStore = create((set) => ({
    editingCellId: null,
    setEditingCellId: (id) => set({ editingCellId: id }),
    // 添加新方法用于新建cell时设置编辑状态
    // setNewCellEditing: (id) => set({ editingCellId: id }),
  }));
  
export default useMarkdownStore