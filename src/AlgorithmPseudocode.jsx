import React, { useEffect, useRef, useState } from "react";
import "./AlgorithmPseudocode.css";

// Pseudocode definitions for the algorithms available in the visualizer.
const PSEUDOCODES = {
  'Bubble Sort': [
    'function bubbleSort(array):',
    '  n = length(array)',
    '  for i = 0 to n-2:',
    '    for j = 0 to n-i-2:',
    '      if array[j] > array[j+1]:',
    '        swap array[j] and array[j+1]',
    '    mark array[n-i-1] as sorted',
  ],
  'Insertion Sort': [
    'function insertionSort(array):',
    '  for i = 1 to length(array)-1:',
    '    key = array[i]',
    '    j = i - 1',
    '    while j >= 0 and array[j] > key:',
    '      array[j+1] = array[j]  // shift right',
    '      j = j - 1',
    '    array[j+1] = key',
  ],
  'Merge Sort': [
    'function mergeSort(array):',
    '  if length(array) <= 1: return array',
    '  mid = floor(length/2)',
    '  left = mergeSort(array[0:mid])',
    '  right = mergeSort(array[mid:])',
    '  return merge(left, right)',
    'function merge(left,right):',
    '  while left and right:',
    '    if left[0] <= right[0]:',
    '      append left[0] to result',
    '    else:',
    '      append right[0] to result',
  ]
};

function mapStepToLineAndAnnotation(algorithm, step) {
  // Returns { line: 0-based index, annotation: string, inline: string }
  if (!step) return { line: 0, annotation: 'Ready.', inline: '' };

  const idxs = step.indices || (step.index !== undefined ? [step.index] : []);
  switch (algorithm) {
    case 'Bubble Sort': {
      if (step.type === 'compare') return { line: 4, annotation: `Comparing indices ${idxs[0]} and ${idxs[1]}`, inline: '' };
      if (step.type === 'swap') return { line: 5, annotation: `Swapping indices ${idxs[0]} and ${idxs[1]}`, inline: '' };
      if (step.type === 'markSorted') return { line: 6, annotation: `Index ${step.index} marked sorted`, inline: '' };
      return { line: 3, annotation: step.type, inline: '' };
    }
    case 'Insertion Sort': {
      if (step.type === 'compare') return { line: 5, annotation: `Comparing ${idxs[0]} and ${idxs[1] || 'key'}`, inline: '' };
      if (step.type === 'overwrite') {
        // If overwrite writing the key into position (insertion), show that inline.
        if (step.index !== undefined && step.value !== undefined) return { line: 7, annotation: `Write ${step.value} to index ${step.index}`, inline: `value=${step.value}` };
        return { line: 6, annotation: `Shift into index ${step.index}`, inline: `-> index ${step.index}` };
      }
      return { line: 2, annotation: step.type, inline: '' };
    }
    case 'Merge Sort': {
      if (step.type === 'compare') return { line: 8, annotation: `Comparing left and right (indices ${idxs.join(',')})`, inline: '' };
      if (step.type === 'overwrite') return { line: 9, annotation: `Writing ${step.value} to merged array at index ${step.index}`, inline: `value=${step.value}` };
      return { line: 5, annotation: step.type, inline: '' };
    }
    default:
      return { line: 0, annotation: step.type || 'Running', inline: '' };
  }
}

export default function AlgorithmPseudocode({ algorithm = 'Bubble Sort', step = null, interactive = false }) {
  const pseudocode = PSEUDOCODES[algorithm] || PSEUDOCODES['Bubble Sort'];
  const [current, setCurrent] = useState(0);
  const [annotation, setAnnotation] = useState('Ready.');
  const [inlineAnnotation, setInlineAnnotation] = useState('');
  const [animate, setAnimate] = useState(false);

  // When parent provides a step, map it to a pseudocode line and highlight it with annotation.
  useEffect(() => {
    if (step === undefined || step === null) return;
    const { line, annotation: ann, inline } = mapStepToLineAndAnnotation(algorithm, step);
    setCurrent(line);
    setAnnotation(ann || '');
    setInlineAnnotation(inline || '');

    // trigger a brief animation class
    setAnimate(true);
    const t = setTimeout(() => setAnimate(false), 500);

    // NOTE: removed automatic scrollIntoView per request — we keep a smooth highlight animation only.

    return () => clearTimeout(t);
  }, [step, algorithm]);

  // Interactive local stepping (optional)
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef(null);
  useEffect(() => {
    if (!interactive) return;
    if (playing) {
      timerRef.current = setInterval(() => {
        setCurrent((c) => Math.min(c + 1, pseudocode.length - 1));
      }, 700);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, interactive, pseudocode.length]);

  return (
    <div className="pseudocode-root">
      <h3 className="pseudocode-title">{algorithm} — Pseudocode</h3>

      <div className="pseudocode-box" role="list" aria-label="algorithm pseudocode">
        {pseudocode.map((line, i) => (
          <div
            role="listitem"
            key={i}
            className={"pseudocode-line " + (i === current ? `active ${animate ? 'animate' : ''}` : '')}
          >
            <span className="line-number">{i + 1}</span>
            <pre className="line-text">{line} {i === current && inlineAnnotation ? (<span className="line-value">{inlineAnnotation}</span>) : null}</pre>
          </div>
        ))}
      </div>

      <div className="pseudocode-annotation" aria-live="polite">{annotation}</div>

      <div className="pseudocode-controls">
        <button onClick={() => setCurrent((c) => Math.max(0, c - 1))}>◀ Prev</button>
        <button onClick={() => setPlaying((p) => !p)}>{playing ? 'Pause' : 'Play'}</button>
        <button onClick={() => setCurrent((c) => Math.min(pseudocode.length - 1, c + 1))}>Next ▶</button>
        <button onClick={() => { setCurrent(0); setPlaying(false); setAnnotation('Ready.'); }}>Reset</button>
      </div>
    </div>
  );
}
