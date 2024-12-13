// utils/markdownParser.js
import {
    Database,
    FileSearch,
    GitBranch,
    Binary,
    LineChart,
    Settings,
    Activity,
    Box,
    Cpu,
    Filter,
    Book
} from 'lucide-react';

const DEFAULT_ICONS = [
    Database,
    FileSearch,
    GitBranch,
    Binary,
    LineChart,
    Settings,
    Activity,
    Box,
    Cpu,
    Filter
];

export function parseMarkdownCells(cells) {
    let currentTask = null;
    let currentPhase = null;
    const tasks = [];

    // Helper to create new task
    const createTask = (title) => ({
        title,
        phases: [],
        cells: []
    });

    // Helper to create new phase
    const createPhase = (title, cellId, icon = null) => ({
        id: `phase-${cellId}`,
        title,
        icon: icon || DEFAULT_ICONS[Math.floor(Math.random() * DEFAULT_ICONS.length)],
        status: 'pending',
        steps: [],
        cells: [],
        stepRanges: {} // 添加 stepRanges 来存储每个步骤的起始和结束索引
    });

    let introPhase = null;
    let introStartCell = null;
    let firstH2Found = false;

    // 第一次遍历：构建基本结构
    cells.forEach((cell, index) => {
        if (cell.type !== 'markdown') {
            if (introPhase && !firstH2Found) {
                introPhase.cells.push(cell);
            } else if (currentPhase) {
                currentPhase.cells.push(cell);
            }
            return;
        }

        const lines = cell.content.split('\n');
        let foundH1 = false;
        let foundH2 = false;
        let foundH3 = false;

        for (const line of lines) {
            const h1Match = line.match(/^# (.+)/);
            const h2Match = line.match(/^## (.+)/);
            const h3Match = line.match(/^### (.+)/);

            if (h1Match) {
                foundH1 = true;
                currentTask = createTask(h1Match[1]);
                tasks.push(currentTask);

                introPhase = createPhase('Intro && Input', `intro-${cell.id}`, Book);
                introStartCell = cell;
                currentTask.phases.push(introPhase);
                introPhase.cells.push(cell);
                currentPhase = null;

            } else if (h2Match && currentTask) {
                foundH2 = true;
                firstH2Found = true;

                if (currentPhase) {
                    // 如果当前阶段还没有步骤，添加一个默认的Intro && Input步骤
                    if (currentPhase.steps.length === 0) {
                        const prepStepId = `step-prep-${currentPhase.id}`;
                        currentPhase.steps.push({
                            id: prepStepId,
                            name: 'Intro && Input',
                            status: 'pending'
                        });
                    }
                }

                currentPhase = createPhase(h2Match[1], cell.id);
                currentTask.phases.push(currentPhase);
                currentPhase.cells.push(cell);

            } else if (h3Match && currentPhase) {
                foundH3 = true;
                const stepId = `step-${cell.id}-${currentPhase.steps.length}`;
                currentPhase.steps.push({
                    id: stepId,
                    name: h3Match[1],
                    status: 'pending'
                });
                currentPhase.stepRanges[stepId] = { start: cell };

                // 如果有前一个步骤，设置其结束点
                const prevStep = currentPhase.steps[currentPhase.steps.length - 2];
                if (prevStep) {
                    currentPhase.stepRanges[prevStep.id].end = cell;
                }
            }
        }

        // 添加非标题 markdown cell
        if (!foundH1 && !foundH2 && !foundH3) {
            if (!firstH2Found && introPhase) {
                introPhase.cells.push(cell);
            } else if (currentPhase) {
                currentPhase.cells.push(cell);
            }
        }
    });

    // 确保每个阶段都有至少一个步骤
    tasks.forEach(task => {
        task.phases.forEach(phase => {
            if (phase.steps.length === 0 && phase.title !== 'Intro && Input') {
                const prepStepId = `step-prep-${phase.id}`;
                phase.steps.push({
                    id: prepStepId,
                    name: 'Intro && Input',
                    status: 'pending'
                });
                phase.stepRanges[prepStepId] = {
                    start: phase.cells[0],
                    end: phase.cells[phase.cells.length - 1]
                };
            }
        });
    });

    // 设置最后一个步骤的结束点
    tasks.forEach(task => {
        task.phases.forEach(phase => {
            const lastStep = phase.steps[phase.steps.length - 1];
            if (lastStep && !phase.stepRanges[lastStep.id]?.end) {
                phase.stepRanges[lastStep.id] = {
                    ...phase.stepRanges[lastStep.id],
                    end: phase.cells[phase.cells.length - 1]
                };
            }
        });
    });

    // 更新阶段状态
    tasks.forEach(task => {
        task.phases.forEach((phase, phaseIndex) => {
            if (phaseIndex === 0) {
                phase.status = 'in-progress';
            } else {
                const previousPhase = task.phases[phaseIndex - 1];
                phase.status = previousPhase.status === 'completed' ? 'in-progress' : 'pending';
            }
        });
    });

    return tasks;
}

export function findCellsByPhase(tasks, phaseId) {
    if (!phaseId || !tasks || tasks.length === 0) {
        return [];
    }

    for (const task of tasks) {
        const phase = task.phases.find(p => p.id === phaseId);
        if (phase) {
            return phase.cells;
        }
    }

    return [];
}

export function findCellsByStep(tasks, phaseId, stepId) {
    if (!phaseId || !stepId || !tasks) {
        return [];
    }

    for (const task of tasks) {
        const phase = task.phases.find(p => p.id === phaseId);
        if (phase) {
            if (phase.title === 'Intro && Input') {
                return phase.cells;
            }

            const stepCells = [];
            const stepRange = phase.stepRanges[stepId];

            if (stepRange) {
                let isWithinRange = false;
                for (const cell of phase.cells) {
                    if (cell === stepRange.start) {
                        isWithinRange = true;
                    }

                    if (isWithinRange) {
                        stepCells.push(cell);
                    }

                    if (cell === stepRange.end) {
                        break;
                    }
                }
            }

            if (stepCells.length === 0 && phase.cells.length > 0) {
                // 如果是Intro && Input步骤，返回阶段标题到第一个三级标题之间的内容
                if (stepId.includes('step-prep')) {
                    for (const cell of phase.cells) {
                        stepCells.push(cell);
                        if (cell.type === 'markdown' && cell.content.includes('### ')) {
                            break;
                        }
                    }
                }
            }

            return stepCells;
        }
    }

    return [];
}