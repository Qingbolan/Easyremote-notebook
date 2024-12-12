// Sidebar.jsx
import React, { useState, useCallback, memo } from 'react';
import {
  Database,
  FileSearch,
  GitBranch,
  Binary,
  LineChart,
  CheckCircle2,
  ArrowRight,
  MenuIcon,
  ChevronDown,
  ChevronRight
} from 'lucide-react';


const ProcessSteps = [
  {
    id: 'data-prep',
    title: 'Data Preparation',
    icon: Database,
    status: 'completed',
    steps: [
      { id: 'load', name: 'Load Data', status: 'completed' },
      { id: 'explore', name: 'Data Exploration', status: 'completed' },
      { id: 'clean', name: 'Data Cleaning', status: 'completed' }
    ]
  },
  {
    id: 'eda',
    title: 'Exploratory Analysis',
    icon: FileSearch,
    status: 'in-progress',
    steps: [
      { id: 'stats', name: 'Statistical Analysis', status: 'completed' },
      { id: 'viz', name: 'Data Visualization', status: 'in-progress' },
      { id: 'hypothesis', name: 'Hypothesis Testing', status: 'pending' }
    ]
  },
  {
    id: 'feature-eng',
    title: 'Feature Engineering',
    icon: GitBranch,
    status: 'pending',
    steps: [
      { id: 'transform', name: 'Feature Transformation', status: 'pending' },
      { id: 'select', name: 'Feature Selection', status: 'pending' },
      { id: 'create', name: 'Feature Creation', status: 'pending' }
    ]
  },
  {
    id: 'modeling',
    title: 'Model Training',
    icon: Binary,
    status: 'pending',
    steps: [
      { id: 'split', name: 'Data Split', status: 'pending' },
      { id: 'train', name: 'Model Training', status: 'pending' },
      { id: 'tune', name: 'Parameter Tuning', status: 'pending' }
    ]
  },
  {
    id: 'evaluation',
    title: 'Model Evaluation',
    icon: LineChart,
    status: 'pending',
    steps: [
      { id: 'metrics', name: 'Evaluation Metrics', status: 'pending' },
      { id: 'validate', name: 'Cross Validation', status: 'pending' },
      { id: 'compare', name: 'Model Comparison', status: 'pending' }
    ]
  }
];

const StatusStyles = {
  colors: {
    completed: 'text-rose-600 bg-white/20 shadow-inner shadow-white/40',
    'in-progress': 'text-amber-600 bg-white/20 shadow-inner shadow-white/40',
    pending: 'text-gray-400 bg-white/10 shadow-inner shadow-white/30'
  },
  steps: {
    completed: 'bg-gradient-to-r from-rose-500 to-orange-500 shadow-sm',
    'in-progress': 'bg-gradient-to-r from-amber-500 to-orange-400 shadow-sm',
    pending: 'bg-gray-300/50 shadow-inner shadow-white/50'
  }
};

const StatusIcon = memo(({ status }) => {
  if (status === 'completed') {
    return <CheckCircle2 size={24} className="text-rose-500" />;
  }
  if (status === 'in-progress') {
    return <div className="w-6 h-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />;
  }
  return null;
});

const StepButton = memo(({ step, onClick }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-4 py-3 rounded-lg
      transition-all duration-300 text-lg tracking-wide relative
      ${step.status === 'in-progress'
        ? 'bg-white/10 text-amber-700 shadow-inner shadow-white/10'
        : 'hover:bg-white/5 text-gray-700'}
    `}
  >
    <div className={`
      w-3 h-3 rounded-full flex-shrink-0
      ${StatusStyles.steps[step.status]}
    `} />
    <span className="font-normal">{step.name}</span>
    {step.status === 'in-progress' && (
      <ArrowRight size={20} className="ml-auto text-amber-600" />
    )}
  </button>
));

const PhaseSection = memo(({ phase, isExpanded, onToggle, onStepSelect }) => {
  const handleStepClick = useCallback((stepId) => {
    onStepSelect(phase.id, stepId);
  }, [phase.id, onStepSelect]);

  return (
    <div className="px-2">
      <div className="rounded-xl transition-all duration-300">
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg transition-all duration-300 relative group"
        >
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center
            ${StatusStyles.colors[phase.status]}
            transition-all duration-300
            before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-b before:from-white/5 before:to-transparent
          `}>
            <phase.icon size={24} />
          </div>
          <div className="flex-1 min-w-0 flex items-center">
            <h3 className="text-xl font-medium tracking-wide text-gray-800">{phase.title}</h3>
          </div>
          <div className="relative">
            {isExpanded ?
              <ChevronDown size={20} className="text-gray-600" /> :
              <ChevronRight size={20} className="text-gray-600" />
            }
          </div>
          <StatusIcon status={phase.status} />
        </button>

        <div className={`
          pl-10 mt-1 overflow-hidden transition-all duration-300
          ${isExpanded ? 'max-h-96' : 'max-h-0'}
        `}>
          {phase.steps.map((step) => (
            <StepButton
              key={step.id}
              step={step}
              onClick={() => handleStepClick(step.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
});


const MiniSidebar = memo(({ currentPhase, onPhaseClick }) => (
  <div className="w-16 h-full flex flex-col bg-gradient-to-b from-rose-50/80 to-orange-50/80">
    <div className="h-16 flex items-center justify-center border-b border-white/10 bg-white/5">
      <button
        onClick={() => onPhaseClick(null)}
        className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300"
        aria-label="Expand sidebar"
      >
        <MenuIcon size={24} className="text-gray-700" />
      </button>
    </div>
    <div className="flex-1 py-2">
      {ProcessSteps.map((phase) => (
        <button
          key={phase.id}
          onClick={() => onPhaseClick(phase.id)}
          className={`
            w-full p-2 flex items-center justify-center
            hover:bg-white/10 transition-all duration-300
            ${phase.status === 'completed' ? 'text-rose-600' : 
              phase.status === 'in-progress' ? 'text-amber-600' : 'text-gray-400'}
            ${currentPhase === phase.id ? 'bg-white/10' : ''}
          `}
          title={phase.title}
        >
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            ${StatusStyles.colors[phase.status]}
            transition-all duration-300
            relative
          `}>
            <phase.icon size={24} />
            {phase.status === 'completed' && (
              <div className="absolute -top-1 -right-1">
                <CheckCircle2 size={12} className="text-rose-500" />
              </div>
            )}
            {phase.status === 'in-progress' && (
              <div className="absolute -top-1 -right-1 w-3 h-3">
                <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-amber-500" />
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  </div>
));

const OutlineSidebar = ({ isCollapsed, currentStep, onStepSelect, onToggleCollapse }) => {
  const [expandedSections, setExpandedSections] = useState(() => 
    ProcessSteps.reduce((acc, phase) => {
      acc[phase.id] = phase.status === 'in-progress';
      return acc;
    }, {})
  );
  const [currentPhase, setCurrentPhase] = useState(null);

  const toggleSection = useCallback((sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  const handlePhaseClick = useCallback((phaseId) => {
    if (phaseId === null) {
      onToggleCollapse();
    } else {
      setCurrentPhase(phaseId);
      setExpandedSections(prev => ({
        ...prev,
        [phaseId]: true
      }));
    }
  }, [onToggleCollapse]);

  if (isCollapsed) {
    return <MiniSidebar currentPhase={currentPhase} onPhaseClick={handlePhaseClick} />;
  }

  return (
    <div className="relative h-full flex flex-col isolate overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-50/80 to-orange-50/80 -z-20" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj4NCjxmaWx0ZXIgaWQ9ImEiIHg9IjAiIHk9IjAiPg0KPGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPg0KPC9maWx0ZXI+DQo8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIwLjA1Ii8+DQo8L3N2Zz4=')] opacity-20 -z-10" />
      <div className="absolute inset-0 backdrop-blur-[8px] backdrop-saturate-150 -z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent shadow-inner -z-10" />

      {/* Header with MenuIcon */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 bg-white/5 backdrop-blur-sm relative">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 relative"
          aria-label="Collapse sidebar"
        >
          <MenuIcon size={20} className="text-gray-700" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent hover:scrollbar-thumb-white/50">
        <style jsx global>{`
          .scrollbar-thin::-webkit-scrollbar {
            width: 4px;
          }
          .scrollbar-thin::-webkit-scrollbar-track {
            background: transparent;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 4px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
          }
          .scrollbar-thin {
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
          }
        `}</style>

        <div className="py-2">
          {ProcessSteps.map((phase) => (
            <PhaseSection
              key={phase.id}
              phase={phase}
              isExpanded={expandedSections[phase.id]}
              onToggle={() => toggleSection(phase.id)}
              onStepSelect={onStepSelect}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="h-16 px-4 flex items-center border-t border-white/10 bg-white/5 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-400 mr-3 animate-pulse shadow-lg" />
        <span className="text-lg font-medium tracking-wide text-amber-700 relative">Analysis in Progress</span>
      </div>
    </div>
  );
};

export default memo(OutlineSidebar);