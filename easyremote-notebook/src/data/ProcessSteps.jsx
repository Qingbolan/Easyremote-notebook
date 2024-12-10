// src/data/ProcessSteps.js

import {
Database, 
FileSearch,
GitBranch,
Binary,
LineChart,
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

export default ProcessSteps;
