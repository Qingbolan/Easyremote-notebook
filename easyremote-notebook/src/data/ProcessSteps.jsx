// src/data/ProcessSteps.js

export const processSteps = {
    steps: [],
    
    addStep: (stepData) => {
      processSteps.steps.push(stepData)
    },
  
    updateStep: (stepIndex, newData) => {
      processSteps.steps[stepIndex] = { ...processSteps.steps[stepIndex], ...newData }
    },
  
    deleteStep: (stepIndex) => {
      processSteps.steps.splice(stepIndex, 1)
    }
  }
  