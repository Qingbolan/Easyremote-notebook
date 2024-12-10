// src/components/Notebook/NotebookApp.jsx
import React, { useState, useRef, useEffect } from 'react';
import CodeCell from '../Editor/CodeCell';
import MarkdownCell from '../Editor/MarkdownCell';
import FileCell from '../Editor/FileCell';
import Sidebar from './OutlineSidebar';
import ErrorAlert from '../UI/ErrorAlert';
import { Bot, PlusCircle, Play, Save, MenuIcon, ArrowUp, ArrowDown } from 'lucide-react';
import useStore from '../../store/notebookStore';

const NotebookApp = () => {
  const [error, setError] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState('full');
  const [currentStep, setCurrentStep] = useState(0);
  const { cells = [], addCell, deleteCell, updateCell } = useStore(); // Provide default empty array
  const [aiPrompt, setAiPrompt] = useState('');
  const contentRef = useRef(null);
  const [lastAddedCellId, setLastAddedCellId] = useState(null);

  // Effect to scroll newly added cell into view
  useEffect(() => {
    if (lastAddedCellId) {
      setTimeout(() => {
        const cellElement = document.getElementById(`cell-${lastAddedCellId}`);
        if (cellElement) {
          cellElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setLastAddedCellId(null);
        }
      }, 0);
    }
  }, [lastAddedCellId]);

  const handleAddCell = (type, index = null) => {
    try {
      const newCellId = Date.now().toString();
      // If cells is empty or index is null, add to the end
      const targetIndex = index !== null ? index : cells.length;
      
      const newCell = {
        id: newCellId,
        type,
        content: '',
        output: null
      };

      addCell(newCell, targetIndex);
      setLastAddedCellId(newCellId);
    } catch (err) {
      console.error('Error adding cell:', err);
      setError('Failed to add cell. Please try again.');
    }
  };

  const handleRunAll = async () => {
    // Implement logic to run all code cells
  };

  const handleSave = async () => {
    // Implement logic to save notebook
  };

  const CellDivider = ({ index }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div 
        className="h-2 group relative my-1 transition-all duration-200"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isHovered && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
            flex items-center gap-2 bg-white shadow-lg rounded-lg p-1 z-10">
            <button
              onClick={() => handleAddCell('code', index)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 
                hover:bg-gray-100 rounded-md transition-colors"
            >
              <PlusCircle size={16} />
              Add Code Cell
            </button>
            <button
              onClick={() => handleAddCell('markdown', index)}
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
  };

  const renderCells = () => {
    if (viewMode === 'guided') {
      const currentCell = cells[currentStep];
      if (!currentCell) {
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-500 mb-4">No cells in guided mode</p>
            <button
              onClick={() => handleAddCell('code')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white 
                rounded-xl hover:bg-purple-700 transition-colors"
            >
              <PlusCircle size={20} />
              Add First Cell
            </button>
          </div>
        );
      }

      return (
        <div className="max-w-7xl mx-auto">
          <div className="p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-medium text-gray-800">
                Step {currentStep + 1}: {currentCell.title || 'Untitled Step'}
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  disabled={currentStep === 0}
                  className="px-5 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 
                    disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium
                    transition-all duration-200"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={currentStep === cells.length - 1}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 
                    text-white rounded-xl hover:from-purple-700 hover:to-blue-700 
                    disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium
                    transition-all duration-200"
                >
                  Next
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              {cells.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                    idx <= currentStep
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {renderCell(currentCell)}
          </div>
        </div>
      );
    }

    // Full mode rendering with empty state
    if (cells.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
          <p className="text-gray-500 mb-4">No cells yet. Start by adding one!</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleAddCell('code')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white 
                rounded-xl hover:bg-purple-700 transition-colors"
            >
              <PlusCircle size={20} />
              Add Code Cell
            </button>
            <button
              onClick={() => handleAddCell('markdown')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white 
                rounded-xl hover:bg-blue-700 transition-colors"
            >
              <PlusCircle size={20} />
              Add Text Cell
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto">
        <CellDivider index={0} />
        {cells.map((cell, index) => (
          <React.Fragment key={cell.id}>
            <div id={`cell-${cell.id}`} className="relative">
              {renderCell(cell)}
            </div>
            <CellDivider index={index + 1} />
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderCell = (cell) => {
    if (!cell) return null;
    
    switch (cell.type) {
      case 'code':
        return (
          <CodeCell
            key={cell.id}
            cell={cell}
            onDelete={deleteCell}
            onUpdate={updateCell}
          />
        );
      case 'markdown':
        return (
          <MarkdownCell
            key={cell.id}
            cell={cell}
            onDelete={deleteCell}
            onUpdate={updateCell}
          />
        );
      case 'file':
        return (
          <FileCell
            key={cell.id}
            cell={cell}
            onDelete={deleteCell}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex bg-slate-50">
      <Sidebar
        isCollapsed={isCollapsed}
        currentStep={currentStep}
        onStepSelect={(phaseId, stepId) => {/* Implement step selection logic */}}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-6">
              <button
                onClick={() => handleAddCell('code', cells.length)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 
                  rounded-xl transition-colors text-base"
              >
                <PlusCircle size={20} />
                Add Code Cell
              </button>
              <button
                onClick={() => handleAddCell('markdown', cells.length)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 
                  rounded-xl transition-colors text-base"
              >
                <PlusCircle size={20} />
                Add Text Cell
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunAll}
              className="flex items-center gap-2 px-4 py-2 text-base font-medium"
              disabled={cells.length === 0}
            >
              <Play size={20} />
              Run All
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 
                rounded-xl hover:bg-gray-50 transition-colors text-base"
              disabled={cells.length === 0}
            >
              <Save size={20} />
              Save
            </button>
          </div>
        </div>

        <div
          ref={contentRef}
          className="pt-3 pb-4 flex-1 overflow-y-auto px-4
            scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 
            hover:scrollbar-thumb-gray-300 scroll-smooth"
        >
          {renderCells()}
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

export default NotebookApp;