import React, { useState } from 'react';
import './StepExplanation.css';

// Convert algorithm steps to natural language explanations
function getStepExplanation(algorithm, step) {
  if (!step) return { simple: 'Ready to start...', detailed: '' };

  const values = step.stats?.values || [];
  const currentValue = step.value !== undefined ? step.value : null;
  
  switch (algorithm) {
    case 'Bubble Sort': {
      if (step.type === 'compare') {
        const [i, j] = step.indices || [];
        const val1 = values[i];
        const val2 = values[j];
        const needsSwap = val1 > val2;
        
        return {
          simple: `Looking at positions ${i} and ${j}: comparing ${val1 || '?'} with ${val2 || '?'}.`,
          detailed: needsSwap 
            ? `We found ${val1} is greater than ${val2} - these need to be swapped to maintain ascending order.`
            : `${val1} is already less than or equal to ${val2}, so they're in the correct order.`
        };
      }
      if (step.type === 'swap') {
        const [i, j] = step.indices || [];
        const val1 = values[i];
        const val2 = values[j];
        return {
          simple: `Swapping values: ${val1} ↔ ${val2}`,
          detailed: `Moving the larger value (${val1}) to position ${j} and the smaller value (${val2}) to position ${i}.`
        };
      }
      if (step.type === 'markSorted') {
        return {
          simple: `Position ${step.index} is now in its final sorted spot!`,
          detailed: `After each pass through the array, we know that the largest unsorted element has "bubbled up" to its correct position. Position ${step.index} is now sorted.`
        };
      }
      break;
    }

    case 'Insertion Sort': {
      if (step.type === 'compare') {
        const [current, next] = step.indices || [];
        const val1 = values[current];
        const val2 = values[next];
        return {
          simple: `Checking if ${val1} should move before ${val2}.`,
          detailed: `In Insertion Sort, we're building a sorted portion from left to right. We're checking if ${val1} belongs before ${val2} in our sorted sequence.`
        };
      }
      if (step.type === 'overwrite') {
        return {
          simple: `Moving ${currentValue} into position ${step.index}.`,
          detailed: `Found the right spot for ${currentValue}. We shift larger elements right until we find where this value belongs in our sorted sequence.`
        };
      }
      break;
    }

    case 'Merge Sort': {
      if (step.type === 'compare') {
        const [left, right] = step.indices || [];
        const leftVal = values[left];
        const rightVal = values[right];
        return {
          simple: `Comparing ${leftVal} from left half with ${rightVal} from right half.`,
          detailed: `During merging, we pick the smaller value between left (${leftVal}) and right (${rightVal}) to build our sorted result.`
        };
      }
      if (step.type === 'overwrite') {
        return {
          simple: `Placing ${currentValue} at position ${step.index}.`,
          detailed: `Adding ${currentValue} to our merged result. We're combining our sorted halves in order from smallest to largest.`
        };
      }
      break;
    }
  }

  // Default case when step type isn't recognized
  return { 
    simple: 'Processing next step...',
    detailed: 'The algorithm is working through its sorting steps.'
  };
}

export default function StepExplanation({ algorithm, step }) {
  const [showDetail, setShowDetail] = useState(false);
  const explanation = getStepExplanation(algorithm, step);

  return (
    <div className="step-explanation">
      <h3>Algorithm Steps Explained</h3>
      
      <div className="explanation-box">
        <p className="simple-explanation">{explanation.simple}</p>
        
        <button 
          className="detail-toggle" 
          onClick={() => setShowDetail(!showDetail)}
          aria-expanded={showDetail}
        >
          {showDetail ? 'Show less' : 'Explain this step in detail'}
        </button>

        {showDetail && (
          <div className="detailed-explanation">
            <p>{explanation.detailed}</p>
          </div>
        )}
      </div>
    </div>
  );
}