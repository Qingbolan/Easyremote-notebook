// store/notebookStore.js
import { create } from 'zustand';
import { parseMarkdownCells, findCellsByPhase, findCellsByStep } from '../utils/markdownParser';

const useStore = create((set, get) => ({
  // 基础状态
  cells: [],
  tasks: [],
  currentPhaseId: null,
  currentStepIndex: 0,
  viewMode: 'complete',
  currentCellId: null,

  // 单元格操作
  addCell: (newCell, index) => set(state => {
    const updatedCells = [...state.cells];
    const targetIndex = index === null ? updatedCells.length : index;
    updatedCells.splice(targetIndex, 0, newCell);

    const tasks = parseMarkdownCells(updatedCells);

    return { 
      cells: updatedCells,
      tasks 
    };
  }),

  deleteCell: (cellId) => set(state => {
    const updatedCells = state.cells.filter(cell => cell.id !== cellId);
    const tasks = parseMarkdownCells(updatedCells);

    // 如果删除的是当前阶段的最后一个单元格，清除当前阶段
    const currentPhaseCells = findCellsByPhase(tasks, state.currentPhaseId);
    if (currentPhaseCells.length === 0) {
      return { 
        cells: updatedCells,
        tasks,
        currentPhaseId: null,
        currentStepIndex: 0
      };
    }

    // 如果删除的单元格是当前选中的单元格，清除 currentCellId
    if (state.currentCellId === cellId) {
      return { 
        cells: updatedCells,
        tasks,
        currentCellId: null
      };
    }

    return { 
      cells: updatedCells,
      tasks 
    };
  }),

  updateCell: (cellId, newContent) => set(state => {
    const updatedCells = state.cells.map(cell => 
      cell.id === cellId ? { ...cell, content: newContent } : cell
    );

    const tasks = parseMarkdownCells(updatedCells);

    return { 
      cells: updatedCells,
      tasks 
    };
  }),

  // 视图控制
  setViewMode: (mode) => set(state => {
    const updates = { viewMode: mode };
    
    if (mode === 'step') {
      // 如果没有当前阶段，设置第一个可用的阶段
      if (!state.currentPhaseId && state.tasks.length > 0) {
        const firstTask = state.tasks[0];
        if (firstTask.phases.length > 0) {
          updates.currentPhaseId = firstTask.phases[0].id;
          updates.currentStepIndex = 0;
        }
      }
    } else {
      // Complete 模式时重置步骤索引
      updates.currentStepIndex = 0;
    }

    return updates;
  }),

  setCurrentPhase: (phaseId) => set(state => ({ 
    currentPhaseId: phaseId,
    currentStepIndex: 0 // 切换阶段时重置步骤索引
  })),

  setCurrentStepIndex: (index) => set({ currentStepIndex: index }),

  setCurrentCell: (cellId) => set({ currentCellId: cellId }),

  // 获取当前视图内容
  getCurrentViewCells: () => {
    const state = get();
    if (state.viewMode === 'complete' || !state.currentPhaseId) {
      return state.cells;
    }

    const phase = get().getPhaseById(state.currentPhaseId);
    if (!phase || !phase.steps.length) {
      return findCellsByPhase(state.tasks, state.currentPhaseId);
    }

    // 在步骤模式下，获取当前步骤的单元格
    const currentStep = phase.steps[state.currentStepIndex];
    if (!currentStep) return [];

    return findCellsByStep(state.tasks, state.currentPhaseId, currentStep.id);
  },

  // 辅助方法
  getPhaseById: (phaseId) => {
    const state = get();
    for (const task of state.tasks) {
      const phase = task.phases.find(p => p.id === phaseId);
      if (phase) return phase;
    }
    return null;
  },

  getTaskByPhaseId: (phaseId) => {
    const state = get();
    return state.tasks.find(task => 
      task.phases.some(phase => phase.id === phaseId)
    );
  },

  // 获取当前阶段的总步骤数
  getTotalSteps: () => {
    const state = get();
    const phase = get().getPhaseById(state.currentPhaseId);
    return phase ? phase.steps.length : 0;
  },

  // 获取当前阶段的信息
  getCurrentPhaseInfo: () => {
    const state = get();
    if (!state.currentPhaseId) return null;

    const phase = get().getPhaseById(state.currentPhaseId);
    if (!phase) return null;

    const task = get().getTaskByPhaseId(state.currentPhaseId);
    const phaseIndex = task.phases.findIndex(p => p.id === state.currentPhaseId);

    return {
      phase,
      task,
      isFirstPhase: phaseIndex === 0,
      isLastPhase: phaseIndex === task.phases.length - 1
    };
  },

  // 导航方法
  navigateToNextPhase: () => {
    const state = get();
    const phaseInfo = state.getCurrentPhaseInfo();
    if (!phaseInfo || phaseInfo.isLastPhase) return;

    // 使用 findIndex 确保正确获取阶段索引
    const currentPhaseIndex = phaseInfo.task.phases.findIndex(p => p.id === phaseInfo.phase.id);
    const nextPhase = phaseInfo.task.phases[currentPhaseIndex + 1];
    if (nextPhase) {
      set({
        currentPhaseId: nextPhase.id,
        currentStepIndex: 0
      });
    }
  },

  navigateToPreviousPhase: () => {
    const state = get();
    const phaseInfo = state.getCurrentPhaseInfo();
    if (!phaseInfo || phaseInfo.isFirstPhase) return;

    // 使用 findIndex 确保正确获取阶段索引
    const currentPhaseIndex = phaseInfo.task.phases.findIndex(p => p.id === phaseInfo.phase.id);
    const previousPhase = phaseInfo.task.phases[currentPhaseIndex - 1];
    if (previousPhase) {
      set({
        currentPhaseId: previousPhase.id,
        currentStepIndex: 0
      });
    }
  },

  // 运行所有单元格的逻辑
  runAllCells: async () => {
    try {
      const state = get();
      const codeCells = state.cells.filter(cell => cell.type === 'code');

      for (const cell of codeCells) {
        // 假设有一个执行代码的API或方法
        // 这里使用一个模拟的执行过程
        // 您需要根据实际情况替换此部分
        await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟延迟

        // 更新单元格的输出
        set(state => ({
          cells: state.cells.map(c => 
            c.id === cell.id ? { ...c, output: { type: 'text', content: 'Execution result...' } } : c
          )
        }));
      }
    } catch (error) {
      console.error('运行所有单元格时出错:', error);
      // 您可以在这里设置错误状态以在UI中显示
    }
  },

  // 保存笔记本的逻辑
  saveNotebook: async () => {
    try {
      const state = get();
      // 假设有一个保存笔记本的API
      // 这里使用一个模拟的保存过程
      // 您需要根据实际情况替换此部分
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟延迟

      console.log('Notebook saved successfully:', state.cells);
      // 您可以在这里设置成功状态以在UI中显示
    } catch (error) {
      console.error('保存笔记本时出错:', error);
      // 您可以在这里设置错误状态以在UI中显示
    }
  }
}));

export default useStore;
