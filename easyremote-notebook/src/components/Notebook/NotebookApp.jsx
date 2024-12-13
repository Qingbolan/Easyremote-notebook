// components/NotebookApp.js
import React, { useState, useEffect, useCallback, memo } from 'react';
import CodeCell from '../Editor/CodeCell';
import MarkdownCell from '../Editor/MarkdownCell';
import FileCell from '../Editor/FileCell';
import OutlineSidebar from './OutlineSidebar';
import ErrorAlert from '../UI/ErrorAlert';
import { Play, Save, PlusCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import useStore from '../../store/notebookStore';
import useMarkdownStore from '../../store/markdownStore'; // 确保正确导入
import { findCellsByStep } from '../../utils/markdownParser';

// ModeToggle 组件用于切换视图模式
const ModeToggle = memo(({ viewMode, onModeChange }) => (
  <div className="flex items-center gap-2 rounded-lg">
    <button
      onClick={() => onModeChange('complete')}
      className={`px-4 py-2 rounded-md text-lg font-medium transition-colors ${
        viewMode === 'complete'
          ? 'bg-white text-orange-600'
          : 'text-gray-600 hover:bg-gray-200'
      }`}
    >
      Complete Mode
    </button>
    <button
      onClick={() => onModeChange('step')}
      className={`px-4 py-2 rounded-md text-lg font-medium transition-colors ${
        viewMode === 'step'
          ? 'bg-white text-yellow-600'
          : 'text-gray-600 hover:bg-gray-200'
      }`}
    >
      Step Mode
    </button>
  </div>
));

// EmptyState 组件在没有单元格时显示欢迎信息
const EmptyState = memo(({ onAddCell }) => (
  <div className="flex flex-col items-center justify-center h-full">
    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-rose-500 to-orange-500 text-transparent bg-clip-text">
      WELCOME Easyremote-NoteBook
    </h1>
    <span className="text-gray-400 text-base mb-5">@silan.tech</span>
    <p className="text-gray-500 text-lg mb-6">Start your data science journey by adding cells!</p>
    <div className="flex gap-4">
      <button
        onClick={() => onAddCell('markdown')}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-lg font-medium rounded-lg hover:opacity-90 transition-all"
      >
        <PlusCircle size={24} />
        Add Title & Steps
      </button>
      <button
        onClick={() => onAddCell('code')}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-lg font-medium rounded-lg hover:opacity-90 transition-all"
      >
        <PlusCircle size={24} />
        Add Code Cell
      </button>
    </div>
  </div>
));

// CellDivider 组件用于在单元格之间添加分隔符并提供添加新单元格的选项
const CellDivider = memo(({ index, onAddCell, viewMode }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="h-2 group relative my-2 w-full max-w-screen-xl mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && viewMode === 'complete' && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 bg-white shadow-lg rounded-lg p-1 z-10">
          <button
            onClick={() => onAddCell('code', index)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <PlusCircle size={16} />
            Add Code Cell
          </button>
          <button
            onClick={() => onAddCell('markdown', index)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <PlusCircle size={16} />
            Add Text Cell
          </button>
        </div>
      )}
    </div>
  );
});

// StepNavigation 组件用于在 step mode 下导航阶段和步骤
const StepNavigation = memo(({
  currentPhase,
  currentStepIndex,
  totalSteps,
  onPrevious,
  onNext,
  onPreviousPhase,
  onNextPhase,
  isFirstPhase,
  isLastPhase
}) => {
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // 决定显示哪个"上一步"按钮
  const renderPreviousButton = () => {
    if (isFirstStep) {
      // 在第一个步骤时，显示"上一阶段"按钮（如果不是第一个阶段）
      if (!isFirstPhase) {
        return (
          <button
            onClick={onPreviousPhase}
            className="flex items-center gap-2 px-6 py-2.5 border-2 border-gray-200 
              text-rose-600 rounded-lg hover:text-pink-700 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            Previous Stage
          </button>
        );
      }
      return null;
    }
    
    // 不是第一个步骤时，显示"上一步"按钮
    return (
      <button
        onClick={onPrevious}
        className="flex items-center gap-2 px-6 py-2.5 border-2 border-gray-200 
          text-yellow-700 rounded-lg hover:text-pink-700 transition-colors font-medium"
      >
        <ArrowLeft size={20} />
        Previous Step
      </button>
    );
  };

  // 决定显示哪个"下一步"按钮
  const renderNextButton = () => {
    if (isLastStep) {
      // 在最后一个步骤时，显示"下一阶段"按钮（如果不是最后一个阶段）
      if (!isLastPhase) {
        return (
          <button
            onClick={onNextPhase}
            className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white 
              rounded-lg hover:bg-rose-700 transition-colors font-medium"
          >
            Next Stage
            <ArrowRight size={20} />
          </button>
        );
      }
      return null;
    }
    
    // 不是最后一个步骤时，显示"下一步"按钮
    return (
      <button
        onClick={onNext}
        className="flex items-center gap-2 px-6 py-2.5 bg-yellow-600 text-white 
          rounded-lg hover:bg-rose-700 transition-colors font-medium"
      >
        Next Step
        <ArrowRight size={20} />
      </button>
    );
  };

  return (
    <div className="h-20 flex items-center justify-between px-8 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex items-center gap-2">
        {renderPreviousButton()}
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="text-lg font-medium text-gray-700">{currentPhase?.title}</span>
        <div className="flex items-center gap-3">
          {totalSteps > 0 && Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={`h-2 w-2 rounded-full transition-all duration-400 ${
                idx === currentStepIndex ? 'bg-orange-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {renderNextButton()}
      </div>
    </div>
  );
});

// NotebookApp 组件是整个笔记本应用的主组件
const NotebookApp = () => {
  const [error, setError] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [lastAddedCellId, setLastAddedCellId] = useState(null);

  const {
    cells,
    tasks,
    viewMode,
    currentPhaseId,
    currentStepIndex,
    addCell,
    deleteCell,
    updateCell,
    setViewMode,
    setCurrentPhase,
    setCurrentStepIndex,
    setCurrentCell,
    getCurrentViewCells,
    getTotalSteps,
    runAllCells,
    saveNotebook
  } = useStore();

  const { setEditingCellId } = useMarkdownStore(); // 获取 setEditingCellId 方法

  // 添加单元格的处理函数
  const handleAddCell = useCallback((type, index = null) => {
    try {
      const newCellId = Date.now().toString();
      const newCell = {
        id: newCellId,
        type,
        content: '',
        output: null,
        isNewCell: true
      };

      addCell(newCell, index);
      setLastAddedCellId(newCellId);
    } catch (err) {
      console.error('Error adding cell:', err);
      setError('Failed to add cell. Please try again.');
    }
  }, [addCell]);

  // 运行所有单元格
  const handleRunAll = useCallback(async () => {
    try {
      await runAllCells();
    } catch (err) {
      console.error('Error running all cells:', err);
      setError('Failed to run all cells. Please try again.');
    }
  }, [runAllCells]);

  // 保存笔记本
  const handleSave = useCallback(async () => {
    try {
      await saveNotebook();
    } catch (err) {
      console.error('Error saving notebook:', err);
      setError('Failed to save notebook. Please try again.');
    }
  }, [saveNotebook]);

  // 查找当前阶段的索引
  const findPhaseIndex = useCallback(() => {
    for (const task of tasks) {
      const phaseIndex = task.phases.findIndex(p => p.id === currentPhaseId);
      if (phaseIndex !== -1) {
        return { task, phaseIndex };
      }
    }
    return null;
  }, [tasks, currentPhaseId]);

  // 处理切换到前一个阶段
  const handlePreviousPhase = useCallback(() => {
    const result = findPhaseIndex();
    if (result) {
      const { task, phaseIndex } = result;
      if (phaseIndex > 0) {
        const previousPhase = task.phases[phaseIndex - 1];
        setCurrentPhase(previousPhase.id);
        setCurrentStepIndex(0);
      }
    }
  }, [findPhaseIndex, setCurrentPhase, setCurrentStepIndex]);

  // 处理切换到下一个阶段
  const handleNextPhase = useCallback(() => {
    const result = findPhaseIndex();
    if (result) {
      const { task, phaseIndex } = result;
      if (phaseIndex < task.phases.length - 1) {
        const nextPhase = task.phases[phaseIndex + 1];
        setCurrentPhase(nextPhase.id);
        setCurrentStepIndex(0);
      }
    }
  }, [findPhaseIndex, setCurrentPhase, setCurrentStepIndex]);

  // 处理切换到前一个步骤
  const handlePreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex, setCurrentStepIndex]);

  // 处理切换到下一个步骤
  const handleNextStep = useCallback(() => {
    const totalSteps = getTotalSteps();
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  }, [currentStepIndex, getTotalSteps, setCurrentStepIndex]);

  // 处理视图模式切换
  const handleModeChange = useCallback((mode) => {
    if (mode === 'step' && !currentPhaseId && tasks.length > 0) {
      // 如果切换到步骤模式且没有选中的阶段，选择第一个可用的阶段
      const firstTask = tasks[0];
      if (firstTask.phases.length > 0) {
        setCurrentPhase(firstTask.phases[0].id);
      }
    }
    setViewMode(mode);
    setCurrentCell(null);
    setEditingCellId(null); // 切换视图模式时清除编辑状态
  }, [setViewMode, setCurrentCell, setCurrentPhase, tasks, currentPhaseId, setEditingCellId]);

  // 渲染单元格
  const renderCell = useCallback((cell) => {
    if (!cell) return null;

    // 从 commonProps 中移除 key
    const { key, ...otherProps } = {
      cell,
      onDelete: viewMode === 'complete' ? deleteCell : null,
      onUpdate: updateCell,
      className: "w-full",
      viewMode,
      isNewCell: cell.isNewCell
    };

    switch (cell.type) {
      case 'code':
        return <CodeCell key={cell.id} {...otherProps} />;
      case 'markdown':
        return <MarkdownCell key={cell.id} {...otherProps} />;
      case 'file':
        return <FileCell key={cell.id} {...otherProps} />;
      default:
        return null;
    }
  }, [viewMode, deleteCell, updateCell]);

  // 渲染步骤导航
  const renderStepNavigation = useCallback(() => {
    const result = findPhaseIndex();
    if (!result) return null;

    const { task, phaseIndex } = result;
    const currentPhase = task.phases[phaseIndex];
    const isFirstPhase = phaseIndex === 0;
    const isLastPhase = phaseIndex === task.phases.length - 1;

    return (
      <StepNavigation
        currentPhase={currentPhase}
        currentStepIndex={currentStepIndex}
        totalSteps={getTotalSteps()}
        onPrevious={handlePreviousStep}
        onNext={handleNextStep}
        onPreviousPhase={handlePreviousPhase}
        onNextPhase={handleNextPhase}
        isFirstPhase={isFirstPhase}
        isLastPhase={isLastPhase}
      />
    );
  }, [
    findPhaseIndex,
    currentStepIndex,
    getTotalSteps,
    handlePreviousStep,
    handleNextStep,
    handlePreviousPhase,
    handleNextPhase
  ]);

  // 渲染内容
  const renderContent = useCallback(() => {
    if (cells.length === 0) {
      return <EmptyState onAddCell={handleAddCell} />;
    }

    if (viewMode === 'step') {
      if (!currentPhaseId) {
        return <div className="text-center text-gray-500">请选择一个阶段</div>;
      }

      // 获取当前阶段的信息
      const phase = tasks.find(task => task.phases.some(p => p.id === currentPhaseId))
        ?.phases.find(p => p.id === currentPhaseId);

      if (!phase) {
        console.warn(`Phase with id "${currentPhaseId}" not found.`);
        console.log('Available phases:', tasks.flatMap(task => task.phases.map(p => p.id)));
        return <div className="text-center text-gray-500">当前阶段不存在</div>;
      }

      const currentStep = phase.steps[currentStepIndex];

      if (!currentStep) {
        console.warn(`Step with index "${currentStepIndex}" not found in phase "${currentPhaseId}".`);
        return <div className="text-center text-gray-500">当前步骤不存在</div>;
      }

      // 获取当前步骤的单元格
      const stepCells = findCellsByStep(tasks, currentPhaseId, currentStep.id, cells);

      if (stepCells.length === 0) {
        console.warn(`No cells found for step "${currentStep.id}" in phase "${currentPhaseId}".`);
        return <div className="text-center text-gray-500">当前步骤没有单元格</div>;
      }

      return (
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-12">
            <div className="w-full max-w-screen-xl mx-auto">
              <div className="relative space-y-4">
                {stepCells.map((cell) => (
                  <div
                    key={cell.id}
                    id={`cell-${cell.id}`}
                    className="relative w-full bg-white rounded-lg transition-all duration-300"
                  >
                    {renderCell(cell)}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {renderStepNavigation()}
        </div>
      );
    }

    // Complete Mode
    const visibleCells = getCurrentViewCells();

    return (
      <div className="w-full max-w-screen-xl mx-auto px-4 lg:px-8">
        <div className="relative space-y-4">
          {/* 使用 <div> 代替无效的 <empty> 标签 */}
          <div className='h-4 w-full'></div>
          <CellDivider index={0} onAddCell={handleAddCell} viewMode={viewMode} />
          {visibleCells.map((cell, index) => (
            <React.Fragment key={cell.id}>
              <div
                id={`cell-${cell.id}`}
                className="relative w-full bg-white rounded-lg"
              >
                {renderCell(cell)}
              </div>
              <CellDivider
                index={index + 1}
                onAddCell={handleAddCell}
                viewMode={viewMode}
              />
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }, [
    cells.length,
    viewMode,
    currentPhaseId,
    currentStepIndex,
    tasks,
    getCurrentViewCells,
    handleAddCell,
    renderCell,
    renderStepNavigation,
    findPhaseIndex,
    findCellsByStep
  ]);

  // 滚动到最后添加的单元格
  useEffect(() => {
    if (lastAddedCellId) {
      const cellElement = document.getElementById(`cell-${lastAddedCellId}`);
      cellElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setLastAddedCellId(null);
    }
  }, [lastAddedCellId]);

  // Add keyboard event handler for navigation and mode switching
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt + Left Arrow for previous step/phase
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        if (viewMode === 'step') {
          if (currentStepIndex > 0) {
            handlePreviousStep();
          } else {
            handlePreviousPhase();
          }
        }
      }
      
      // Alt + Right Arrow for next step/phase
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        if (viewMode === 'step') {
          const totalSteps = getTotalSteps();
          if (currentStepIndex < totalSteps - 1) {
            handleNextStep();
          } else {
            handleNextPhase();
          }
        }
      }

      // Alt + Ctrl for mode switching
      if (e.altKey && e.ctrlKey) {
        e.preventDefault();
        handleModeChange(viewMode === 'complete' ? 'step' : 'complete');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    viewMode,
    currentStepIndex,
    handlePreviousStep,
    handleNextStep,
    handlePreviousPhase,
    handleNextPhase,
    handleModeChange,
    getTotalSteps
  ]);

  return (
    <div className="h-screen flex bg-white">
      <div className={`${isCollapsed ? 'w-16' : 'w-96'} transition-all duration-300 ease-in-out relative`}>
        <OutlineSidebar
          tasks={tasks}
          currentPhaseId={currentPhaseId}
          currentStepIndex={currentStepIndex}
          isCollapsed={isCollapsed}
          onPhaseSelect={setCurrentPhase}
          onToggleCollapse={() => setIsCollapsed(prev => !prev)}
          viewMode={viewMode}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <ModeToggle viewMode={viewMode} onModeChange={handleModeChange} />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunAll}
              className="flex items-center gap-2 px-4 py-2 text-base font-medium hover:bg-gray-100 rounded-lg transition-colors"
              disabled={cells.length === 0}
            >
              <Play size={20} />
              Run All
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-base"
              disabled={cells.length === 0}
            >
              <Save size={20} />
              Save
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 scroll-smooth">
          {renderContent()}
        </div>

        {error && (
          <ErrorAlert
            message={error}
            onClose={() => setError(null)}
          />
        )}
      </div>
    </div>
  );
};

export default memo(NotebookApp);
