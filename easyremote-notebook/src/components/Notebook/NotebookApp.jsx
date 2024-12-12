// NotebookApp.jsx
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import CodeCell from '../Editor/CodeCell';
import MarkdownCell from '../Editor/MarkdownCell';
import FileCell from '../Editor/FileCell';
import OutlineSidebar from './OutlineSidebar';
import ErrorAlert from '../UI/ErrorAlert';
import { Play, Save, MenuIcon, PlusCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import useStore from '../../store/notebookStore';

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

const EmptyState = memo(({ onAddCell }) => (
  <div className="flex flex-col items-center justify-center h-full">
    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-rose-500 to-orange-500 
      text-transparent bg-clip-text">
      WELCOME Easyremote-NoteBook
    </h1>
    <span className="text-gray-400 text-base mb-5">@silan.tech</span>
    <p className="text-gray-500 text-lg mb-6">No cells yet. Start by adding one!</p>
    <div className="flex gap-4">
      <button
        onClick={() => onAddCell('code')}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-orange-500 
          text-white text-lg font-medium rounded-lg hover:opacity-90 transition-all"
      >
        <PlusCircle size={24} />
        Add Code Cell
      </button>
      <button
        onClick={() => onAddCell('markdown')}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-orange-500 
          text-white text-lg font-medium rounded-lg hover:opacity-90 transition-all"
      >
        <PlusCircle size={24} />
        Add Text Cell
      </button>
    </div>
  </div>
));

const CellDivider = memo(({ index, onAddCell, viewMode }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="h-2 group relative my-2 w-full max-w-screen-xl mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && viewMode === 'complete' && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
          flex items-center gap-2 bg-white shadow-lg rounded-lg p-1 z-10">
          <button
            onClick={() => onAddCell('code', index)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 
              hover:bg-gray-100 rounded-md transition-colors"
          >
            <PlusCircle size={16} />
            Add Code Cell
          </button>
          <button
            onClick={() => onAddCell('markdown', index)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 
              hover:bg-gray-100 rounded-md transition-colors"
          >
            <PlusCircle size={16} />
            Add Text Cell
          </button>
        </div>
      )}
    </div>
  );
});

const StepNavigation = memo(({ currentStep, totalSteps, onPrevious, onNext }) => (
  <div className="h-20 flex items-center justify-between px-8 bg-white border-t border-gray-200 shadow-lg">
    <button
      onClick={onPrevious}
      disabled={currentStep === 0}
      className="flex items-center gap-2 px-6 py-2.5 border-2 border-gray-200 
        text-yellow-700 rounded-lg hover:text-pink-700 disabled:opacity-50 
        disabled:cursor-not-allowed transition-colors font-medium"
    >
      <ArrowLeft size={20} />
      Previous Step
    </button>
    <div className="flex items-center gap-3">
      {totalSteps > 0 && Array.from({ length: totalSteps }).map((_, idx) => (
        <div
          key={idx}
          className={`h-2 w-2 rounded-full transition-all duration-400 ${
            idx <= currentStep ? 'bg-orange-600' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
    <button
      onClick={onNext}
      disabled={currentStep === totalSteps - 1}
      className="flex items-center gap-2 px-6 py-2.5 bg-yellow-600 text-white 
        rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed 
        transition-colors font-medium"
    >
      Next Step
      <ArrowRight size={20} />
    </button>
  </div>
));

const NotebookApp = () => {
  const [error, setError] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState('complete');
  const [currentStep, setCurrentStep] = useState(0);
  const { cells = [], addCell, deleteCell, updateCell } = useStore();
  const [lastAddedCellId, setLastAddedCellId] = useState(null);

  // 监听 cells 变化，确保 currentStep 在有效范围内
  useEffect(() => {
    if (cells.length === 0) {
      setCurrentStep(0);
    } else if (currentStep >= cells.length) {
      setCurrentStep(cells.length - 1);
    }
  }, [cells.length, currentStep]);

  const handleAddCell = useCallback((type, index = null) => {
    try {
      const newCellId = Date.now().toString();
      const targetIndex = index !== null ? index : cells.length;
      
      const newCell = {
        id: newCellId,
        type,
        content: '',
        output: null,
        isNewCell: true // 添加标记
      };
      
      addCell(newCell, targetIndex);
      setLastAddedCellId(newCellId);
    } catch (err) {
      console.error('Error adding cell:', err);
      setError('Failed to add cell. Please try again.');
    }
  }, [cells.length, addCell]);

  const handleRunAll = useCallback(async () => {
    // Implement logic to run all code cells
  }, []);

  const handleSave = useCallback(async () => {
    // Implement logic to save notebook
  }, []);

  const handlePreviousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  const handleNextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(cells.length - 1, prev + 1));
  }, [cells.length]);

  useEffect(() => {
    if (lastAddedCellId) {
      const cellElement = document.getElementById(`cell-${lastAddedCellId}`);
      cellElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setLastAddedCellId(null);
    }
  }, [lastAddedCellId]);


  const renderCell = useCallback((cell) => {
    if (!cell) return null;

    const commonProps = {
      key: cell.id,
      cell,
      onDelete: viewMode === 'complete' ? deleteCell : null,
      onUpdate: updateCell,
      className: "w-full",
      viewMode,
      isNewCell: cell.isNewCell // 传递新建标记
    };

    switch (cell.type) {
      case 'code':
        return <CodeCell {...commonProps} />;
      case 'markdown':
        return <MarkdownCell {...commonProps} />;
      case 'file':
        return <FileCell {...commonProps} />;
      default:
        return null;
    }
  }, [viewMode, deleteCell, updateCell]);

  const renderStepContent = useCallback(() => {
    if (cells.length === 0) {
      return <EmptyState onAddCell={handleAddCell} />;
    }

    const currentCell = cells[currentStep];
    if (!currentCell) {
      return null;
    }

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-gray-800">
              Step {currentStep + 1} of {cells.length}
            </h2>
          </div>
          {renderCell(currentCell)}
        </div>
        <StepNavigation 
          currentStep={currentStep}
          totalSteps={cells.length}
          onPrevious={handlePreviousStep}
          onNext={handleNextStep}
        />
      </div>
    );
  }, [cells, currentStep, handleAddCell, renderCell, handlePreviousStep, handleNextStep]);

  return (
    <div className="h-screen flex bg-white">
      <div className={`
        ${isCollapsed ? 'w-16' : 'w-96'} 
        transition-all duration-300 ease-in-out relative
      `}>
        <OutlineSidebar
          isCollapsed={isCollapsed}
          currentStep={currentStep}
          onStepSelect={setCurrentStep}
          onToggleCollapse={() => setIsCollapsed(prev => !prev)}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <ModeToggle viewMode={viewMode} onModeChange={setViewMode} />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunAll}
              className="flex items-center gap-2 px-4 py-2 text-base font-medium
                hover:bg-gray-100 rounded-lg transition-colors"
              disabled={cells.length === 0}
            >
              <Play size={20} />
              Run All
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 
                rounded-lg hover:bg-gray-50 transition-colors text-base"
              disabled={cells.length === 0}
            >
              <Save size={20} />
              Save
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent 
          scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 scroll-smooth">
          {cells.length === 0 ? (
            <EmptyState onAddCell={handleAddCell} />
          ) : viewMode === 'step' ? (
            renderStepContent()
          ) : (
            <div className="w-full max-w-screen-xl mx-auto px-4 lg:px-8">
              <div className="relative space-y-4">
                <empty className='h-4 w-full'></empty>
                <CellDivider index={0} onAddCell={handleAddCell} viewMode={viewMode} />
                {cells.map((cell, index) => (
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
          )}
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