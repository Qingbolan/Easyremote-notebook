// store/markdownStore.js
import { create } from 'zustand';

/**
 * 用于管理 Markdown 单元格编辑状态的 Zustand 存储。
 */
const useMarkdownStore = create((set) => ({
  // 当前正在编辑的 Markdown 单元格的 ID
  editingCellId: null,

  /**
   * 设置当前正在编辑的 Markdown 单元格的 ID。
   * @param {string|null} id - Markdown 单元格的 ID，或 `null` 表示没有正在编辑的单元格。
   */
  setEditingCellId: (id) => set({ editingCellId: id }),
}));

export default useMarkdownStore;
