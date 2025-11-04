import React from 'react';

function getAlgorithmExplanation(algorithm) {
  switch (algorithm.toLowerCase()) {
    case 'bubble sort':
      return 'Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. It is simple but inefficient for large datasets.';
    case 'insertion sort':
      return 'Insertion Sort builds the sorted array one item at a time, inserting each new element into its correct position. It is efficient for small or nearly sorted datasets.';
    case 'merge sort':
      return 'Merge Sort is a divide-and-conquer algorithm that splits the array into halves, sorts each half, and merges them. It is efficient and stable, with O(n log n) complexity.';
    default:
      return 'No explanation available.';
  }
}

const AnalysisReport = ({
  algorithm,
  currentStep,
  pseudocodeLine,
  treeData,
  complexityStats,
  explanation,
  onDownload
}) => {
  // Generate a markdown/text report
  const report = `
Algorithm Analysis Report
========================

Algorithm: ${algorithm}

Current Step: ${currentStep?.index ?? 'N/A'}
Current Action: ${currentStep?.type ?? 'N/A'}
Pseudocode Line: ${pseudocodeLine ?? 'N/A'}

Algorithm Explanation:
${getAlgorithmExplanation(algorithm)}

Complexity Stats:
${complexityStats ? Object.entries(complexityStats).map(([k, v]) => `${k}: ${v}`).join('\n') : 'N/A'}

Tree Graph Data:
${treeData ? JSON.stringify(treeData, null, 2) : 'N/A'}

Step Details:
${currentStep ? JSON.stringify(currentStep, null, 2) : 'N/A'}

Additional Explanation:
${explanation ?? 'N/A'}
`;

  function handleDownload() {
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${algorithm.replace(/\s+/g, '_')}_analysis_report.txt`;
    a.click();
    URL.revokeObjectURL(url);
    if (onDownload) onDownload(report);
  }

  return (
    <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--component-bg)', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h3 style={{ color: 'var(--text-color)' }}>Analysis Report</h3>
      <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', background: 'var(--bg-color)', color: 'var(--text-color)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-color)', maxHeight: '300px', overflow: 'auto' }}>{report}</pre>
      <button onClick={handleDownload} style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', fontWeight: 'bold', background: '#4A90E2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Download Report
      </button>
    </div>
  );
};

export default AnalysisReport;
