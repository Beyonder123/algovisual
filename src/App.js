import React, { useState, useRef, useEffect } from "react";
import InteractiveAlgorithmVisualizer from "./InteractiveAlgorithmVisualizer";
import AlgorithmPseudocode from "./AlgorithmPseudocode";
import StepExplanation from "./StepExplanation";
import StateTransitionMap from "./StateTransitionMap";
import ComplexityMeter from "./ComplexityMeter";
import AnalysisReport from "./AnalysisReport";
import './App.css';

function App() {
  const [isDark, setIsDark] = useState(true);
  const [vizStep, setVizStep] = useState({ 
    index: 0, 
    step: {
      type: null,
      stats: { comparisons: 0, swaps: 0, writes: 0 }
    }, 
    algorithm: 'Bubble Sort',
    arraySize: 20
  });

  function handleStepChange(index, step, algorithm, size) {
    // Ensure we always have a valid state object
    const state = step ? {
      type: step.type,
      indices: step.indices,
      index: step.index,
      value: step.value,
      stats: step.stats || { comparisons: 0, swaps: 0, writes: 0 }
    } : null;
    
    setVizStep({ index, step: state, algorithm, arraySize: size });
  }

  // Helper to get pseudocode line and annotation
  const getPseudocodeLine = () => {
    if (!vizStep.step) return 'N/A';
    // Use the same mapping logic as AlgorithmPseudocode
    const algorithm = vizStep.algorithm;
    const step = vizStep.step;
    if (!algorithm || !step) return 'N/A';
    if (algorithm === 'Bubble Sort') {
      if (step.type === 'compare') return 4;
      if (step.type === 'swap') return 5;
      if (step.type === 'markSorted') return 6;
      return 3;
    }
    if (algorithm === 'Insertion Sort') {
      if (step.type === 'compare') return 5;
      if (step.type === 'overwrite') return 7;
      return 2;
    }
    if (algorithm === 'Merge Sort') {
      if (step.type === 'compare') return 8;
      if (step.type === 'overwrite') return 9;
      return 5;
    }
    return 'N/A';
  };

  // Tree graph data from StateTransitionMap
  const [treeData, setTreeData] = useState(null);
  const handleTreeData = (data) => setTreeData(data);

  // Explanation from StepExplanation
  const getStepExplanation = () => {
    if (!vizStep.step) return '';
    const step = vizStep.step;
    const algorithm = vizStep.algorithm;
    if (!algorithm || !step) return '';
    if (algorithm === 'Bubble Sort') {
      if (step.type === 'compare') return `Comparing indices ${step.indices?.join(' and ')}`;
      if (step.type === 'swap') return `Swapping indices ${step.indices?.join(' and ')}`;
      if (step.type === 'markSorted') return `Index ${step.index} marked sorted`;
      return step.type;
    }
    if (algorithm === 'Insertion Sort') {
      if (step.type === 'compare') return `Comparing ${step.indices?.join(' and ')}`;
      if (step.type === 'overwrite') return `Write ${step.value} to index ${step.index}`;
      return step.type;
    }
    if (algorithm === 'Merge Sort') {
      if (step.type === 'compare') return `Comparing left and right (indices ${step.indices?.join(',')})`;
      if (step.type === 'overwrite') return `Writing ${step.value} to merged array at index ${step.index}`;
      return step.type;
    }
    return step.type || '';
  };

  // Complexity stats
  const complexityStats = vizStep.step?.stats || {};

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <div className="app-container">
      <InteractiveAlgorithmVisualizer onStepChange={handleStepChange} isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />

      <div style={{ marginTop: 20, display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '1rem', flex: '1 1 100%' }}>
          <AlgorithmPseudocode algorithm={vizStep.algorithm} step={vizStep.step} />
          <StepExplanation algorithm={vizStep.algorithm} step={vizStep.step} />
          <StateTransitionMap 
            algorithm={vizStep.algorithm.toLowerCase()} 
            currentStep={vizStep.index}
            algorithmState={vizStep.step}
          />
        </div>
        <ComplexityMeter 
          algorithm={vizStep.algorithm}
          currentStats={vizStep.step?.stats || { comparisons: 0, swaps: 0, writes: 0 }}
          arraySize={vizStep.arraySize}
        />
      </div>

      {/* Analysis Report Integration */}
      <AnalysisReport
        algorithm={vizStep.algorithm}
        currentStep={vizStep.step}
        pseudocodeLine={getPseudocodeLine()}
        treeData={null} // Could be wired from StateTransitionMap if needed
        complexityStats={complexityStats}
        explanation={getStepExplanation()}
      />
    </div>
  );
}

export default App;
