import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './Visualizer.module.css';

const ALGORITHMS = ['Bubble Sort', 'Insertion Sort', 'Merge Sort'];
const randInt = (min,max)=> Math.floor(Math.random()*(max-min+1))+min;
function generateRandomArray(size,min=5,max=100){ return Array.from({length:size},()=>randInt(min,max)); }

// --- Algorithm steps ---
function bubbleSortSteps(arr){ 
  const steps=[]; 
  const a=arr.slice(); 
  const n=a.length;
  let comparisons = 0;
  let swaps = 0;
  
  for(let i=0;i<n-1;i++){ 
    for(let j=0;j<n-i-1;j++){ 
      steps.push({type:'compare',indices:[j,j+1], stats: { comparisons: ++comparisons, swaps }}); 
      if(a[j]>a[j+1]){ 
        steps.push({type:'swap',indices:[j,j+1], stats: { comparisons, swaps: ++swaps }}); 
        [a[j],a[j+1]]=[a[j+1],a[j]]; 
      } 
    } 
    steps.push({type:'markSorted',index:n-i-1, stats: { comparisons, swaps }}); 
  } 
  
  if(n>0) steps.push({type:'markSorted',index:0, stats: { comparisons, swaps }}); 
  return steps; 
}

function insertionSortSteps(arr){ 
  const steps=[]; 
  const a=arr.slice(); 
  const n=a.length;
  let comparisons = 0;
  let writes = 0;
  
  for(let i=1;i<n;i++){
    let key=a[i];
    let j=i-1;
    steps.push({type:'compare',indices:[j,i], stats: { comparisons: ++comparisons, writes }});
    
    // Store the key value separately to avoid it being overwritten
    const valueToInsert = key;
    
    while(j>=0 && a[j]>key){
      steps.push({type:'overwrite',index:j+1,value:a[j], stats: { comparisons, writes: ++writes }});
      a[j+1]=a[j];
      j--;
      if(j>=0) steps.push({type:'compare',indices:[j,i], stats: { comparisons: ++comparisons, writes }});
    }
    
    // Use the preserved value for insertion
    steps.push({type:'overwrite',index:j+1,value:valueToInsert, stats: { comparisons, writes: ++writes }});
    a[j+1]=valueToInsert;
  }
  
  for(let i=0;i<n;i++) steps.push({type:'markSorted',index:i, stats: { comparisons, writes }});
  return steps;
}

function mergeSortSteps(arr){ 
  const steps=[]; 
  const a=arr.slice();
  let comparisons = 0;
  let writes = 0;
  let recursionDepth = 0;
  let maxRecursionDepth = 0;
  
  function merge(l,m,r){ 
    const left=a.slice(l,m+1); 
    const right=a.slice(m+1,r+1); 
    let i=0,j=0,k=l;
    
    while(i<left.length && j<right.length){ 
      steps.push({type:'compare',indices:[l+i,m+1+j], stats: { comparisons: ++comparisons, writes, recursionDepth, maxRecursionDepth }}); 
      if(left[i]<=right[j]){ 
        steps.push({type:'overwrite',index:k,value:left[i], stats: { comparisons, writes: ++writes, recursionDepth, maxRecursionDepth }}); 
        a[k++]=left[i++]; 
      } else { 
        steps.push({type:'overwrite',index:k,value:right[j], stats: { comparisons, writes: ++writes, recursionDepth, maxRecursionDepth }}); 
        a[k++]=right[j++]; 
      } 
    }
    
    while(i<left.length){ 
      steps.push({type:'overwrite',index:k,value:left[i], stats: { comparisons, writes: ++writes, recursionDepth, maxRecursionDepth }}); 
      a[k++]=left[i++]; 
    }
    
    while(j<right.length){ 
      steps.push({type:'overwrite',index:k,value:right[j], stats: { comparisons, writes: ++writes, recursionDepth, maxRecursionDepth }}); 
      a[k++]=right[j++]; 
    }
  }
  
  function mergeSort(l,r){ 
    recursionDepth++;
    maxRecursionDepth = Math.max(maxRecursionDepth, recursionDepth);
    
    if(l>=r) {
      recursionDepth--;
      return; 
    } 
    
    const m=Math.floor((l+r)/2); 
    mergeSort(l,m); 
    mergeSort(m+1,r); 
    merge(l,m,r); 
    
    recursionDepth--;
  }
  
  mergeSort(0,a.length-1); 
  
  for(let i=0;i<a.length;i++) 
    steps.push({type:'markSorted',index:i, stats: { comparisons, writes, recursionDepth: 0, maxRecursionDepth }}); 
  
  return steps; 
}

function getSteps(algorithm,array){ switch(algorithm){ case 'Bubble Sort': return bubbleSortSteps(array); case 'Insertion Sort': return insertionSortSteps(array); case 'Merge Sort': return mergeSortSteps(array); default: return []; } }

function applyStep(arr,step){ if(step.type==='swap'){ const [i,j]=step.indices; [arr[i],arr[j]]=[arr[j],arr[i]]; } else if(step.type==='overwrite'){ arr[step.index]=step.value; } }

function buildSnapshots(initialArray,steps){ const snapshots=[initialArray.slice()]; const a=initialArray.slice(); for(const step of steps){ applyStep(a,step); snapshots.push(a.slice()); } return snapshots; }

function stepExplanation(algorithm,step){ if(!step) return 'Ready.'; switch(step.type){ case 'compare': return `Comparing indices ${step.indices[0]} and ${step.indices[1]}.`; case 'swap': return `Swapping elements at indices ${step.indices[0]} and ${step.indices[1]}.`; case 'overwrite': return `Writing value ${step.value} to index ${step.index}.`; case 'markSorted': return `Index ${step.index} is now in its final sorted position.`; default: return 'Running...'; } }

export default function InteractiveAlgorithmVisualizer(){
  const [algorithm,setAlgorithm]=useState(ALGORITHMS[0]);
  const [size,setSize]=useState(20);
  const [baseArray,setBaseArray]=useState(()=>generateRandomArray(20,10,100));
  const [array,setArray]=useState(baseArray.slice());
  const [steps,setSteps]=useState([]);
  const [snapshots,setSnapshots]=useState([]);
  const [currentStepIndex,setCurrentStepIndex]=useState(0);
  const [isRunning,setIsRunning]=useState(false);
  const [highlight,setHighlight]=useState({type:null,indices:[]});
  const [dark,setDark]=useState(true);
  const [speed,setSpeed]=useState(100);
  const [activeTab, setActiveTab] = useState('visualization'); // 'visualization' or 'insight'
  const [currentStats, setCurrentStats] = useState({ comparisons: 0, swaps: 0, writes: 0, recursionDepth: 0, maxRecursionDepth: 0 });
  const intervalRef=useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    // No return value or return a cleanup function
  }, [dark]);

  useEffect(()=>{
    const s=getSteps(algorithm,baseArray.slice());
    const snaps=buildSnapshots(baseArray.slice(),s);
    setSteps(s); setSnapshots(snaps); setCurrentStepIndex(0);
    setHighlight({type:null,indices:[]}); setIsRunning(false); setArray(baseArray.slice());
  },[algorithm,baseArray]);

  useEffect(()=>setBaseArray(generateRandomArray(size,10,100)),[size]);

  useEffect(()=>{    if(isRunning){      intervalRef.current=setInterval(()=>{        setCurrentStepIndex(idx=>{          if(idx>=steps.length){ clearInterval(intervalRef.current); setIsRunning(false); return idx; }          const step=steps[idx]; const next=idx+1;          if(step) {
            setHighlight({type:step.type,indices:step.indices||[step.index]});
            // Update current statistics if available
            if (step.stats) {
              setCurrentStats(step.stats);
            }
          }
          setArray(snapshots[next]||snapshots[snapshots.length-1]);
          if(next>=steps.length){ clearInterval(intervalRef.current); setIsRunning(false); }
          return next;
        });
      },Math.max(8,speed));
    } else if(intervalRef.current){ clearInterval(intervalRef.current); }
    return ()=>{ if(intervalRef.current) clearInterval(intervalRef.current); };
  },[isRunning,speed,steps,snapshots]);

  function regenerate(){ setBaseArray(generateRandomArray(size,10,100)); }
  function handleCustomArray(){ const custom=prompt('Enter comma-separated integers'); if(custom){ const arr=custom.split(',').map(s=>Number(s.trim())).filter(v=>!Number.isNaN(v)); if(arr.length>0)setBaseArray(arr); } }
  function handleStartPause(){ if(isRunning){ setIsRunning(false); return; } if(currentStepIndex>=steps.length){ setCurrentStepIndex(0); setArray(snapshots[0]||baseArray.slice()); } if(steps.length>0) setIsRunning(true); }
  const stepForward=()=>{ 
    if(currentStepIndex>=steps.length) return; 
    const next=Math.min(steps.length,currentStepIndex+1); 
    const step=steps[currentStepIndex]; 
    if(step) {
      setHighlight({type:step.type,indices:step.indices||[step.index]});
      // Update current statistics if available
      if (step.stats) {
        setCurrentStats(step.stats);
      }
    } 
    setCurrentStepIndex(next); 
    setArray(snapshots[next]||snapshots[snapshots.length-1]); 
  };
  const stepBackward=()=>{ 
    const prev=Math.max(0,currentStepIndex-1); 
    setCurrentStepIndex(prev); 
    const step=steps[prev-1]; 
    if(step) {
      setHighlight({type:step.type,indices:step.indices||[step.index]});
      // Update current statistics if available
      if (step.stats) {
        setCurrentStats(step.stats);
      }
    } else {
      setHighlight({type:null,indices:[]});
      setCurrentStats({ comparisons: 0, swaps: 0, writes: 0, recursionDepth: 0, maxRecursionDepth: 0 });
    } 
    setArray(snapshots[prev]||snapshots[0]); 
  };

  const maxVal=Math.max(...array,100);

  // Calculate theoretical time complexity based on algorithm and array size
  const getTheoreticalComplexity = () => {
    const n = array.length;
    switch(algorithm) {
      case 'Bubble Sort':
        return {
          average: `O(n²) = ${n}² = ${n*n} operations`,
          best: `O(n) = ${n} operations`,
          worst: `O(n²) = ${n}² = ${n*n} operations`,
          space: 'O(1) - constant space'
        };
      case 'Insertion Sort':
        return {
          average: `O(n²) = ${n}² = ${n*n} operations`,
          best: `O(n) = ${n} operations`,
          worst: `O(n²) = ${n}² = ${n*n} operations`,
          space: 'O(1) - constant space'
        };
      case 'Merge Sort':
        return {
          average: `O(n log n) ≈ ${n} × ${Math.round(Math.log2(n))} = ${n * Math.round(Math.log2(n))} operations`,
          best: `O(n log n) ≈ ${n} × ${Math.round(Math.log2(n))} = ${n * Math.round(Math.log2(n))} operations`,
          worst: `O(n log n) ≈ ${n} × ${Math.round(Math.log2(n))} = ${n * Math.round(Math.log2(n))} operations`,
          space: `O(n) = ${n} extra space`
        };
      default:
        return { average: 'Unknown', best: 'Unknown', worst: 'Unknown', space: 'Unknown' };
    }
  };

  // Calculate actual performance based on current statistics
  const getActualPerformance = () => {
    const n = array.length;
    const { comparisons, swaps, writes } = currentStats;
    const operations = algorithm === 'Merge Sort' ? comparisons + writes : comparisons + (swaps || 0);
    
    let theoretical;
    switch(algorithm) {
      case 'Bubble Sort':
      case 'Insertion Sort':
        theoretical = n * n; // O(n²)
        break;
      case 'Merge Sort':
        theoretical = n * Math.log2(n); // O(n log n)
        break;
      default:
        theoretical = n * n; // Default
    }
    
    // Calculate efficiency ratio (lower is better)
    const ratio = operations / theoretical;
    
    return {
      operations,
      theoretical: Math.round(theoretical),
      ratio: ratio.toFixed(2),
      assessment: ratio <= 0.8 ? 'Better than expected' : 
                 ratio <= 1.2 ? 'As expected' : 'Worse than expected'
    };
  };

  return (
    <div className={`${styles.container} ${dark?'':styles.light}`}>
      <div className={styles.header}>
        <div>
          <h1>Interactive Algorithm Visualizer</h1>
          <p>Learn algorithms with stable, step-by-step visualizations.</p>
        </div>
        <div className={styles.buttons}>
          <button onClick={()=>setDark(!dark)}>{dark?'Light':'Dark'}</button>
          <span style={{fontSize:'0.65rem',opacity:0.8}}>By Hrichik, Priyanshu & Harsh</span>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <section className={styles.controls}>
          <label>Algorithm</label>
          <select value={algorithm} onChange={e=>setAlgorithm(e.target.value)}>
            {ALGORITHMS.map(a=><option key={a}>{a}</option>)}
          </select>

          <label>Array Size: {size}</label>
          <input type="range" min={5} max={80} value={size} onChange={e=>setSize(Number(e.target.value))}/>

          <div className={styles.playback}>
            <button className={styles.primary} onClick={regenerate}>Generate New Array</button>
            <button className={styles.secondary} onClick={handleCustomArray}>Custom</button>
          </div>

          <label>Speed: {speed} ms</label>
          <input type="range" min={8} max={600} value={speed} onChange={e=>setSpeed(Number(e.target.value))}/>

          <div className={styles.playback}>
            <button className={styles.primary} onClick={handleStartPause}>{isRunning?'Pause':'Start'}</button>
            <button className={styles.secondary} onClick={stepBackward} disabled={currentStepIndex===0}>◀ Step</button>
            <button className={styles.secondary} onClick={stepForward} disabled={currentStepIndex>=steps.length}>Step ▶</button>
          </div>

          <div className={styles.explanation}>{stepExplanation(algorithm,steps[currentStepIndex-1])}</div>
        </section>

        <section className={styles.visualizationSection}>
          <div className={styles.tabHeader}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'visualization' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('visualization')}
            >
              Visualization
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'insight' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('insight')}
            >
              Algorithm Insight Mode
            </button>
            <span style={{marginLeft: 'auto'}}>Max value: {maxVal}</span>
          </div>
          
          {activeTab === 'visualization' ? (
            <div className={styles.visualizationBars}>
              {array.map((v,i)=>{
                const heightPct=Math.max(6,Math.round((v/maxVal)*100));
                const isComparing=highlight.type==='compare'&&(highlight.indices||[]).includes(i);
                const isSwapping=highlight.type==='swap'&&(highlight.indices||[]).includes(i);
                const isSorted=steps.some((s,idx)=>idx<currentStepIndex && s.type==='markSorted' && s.index===i);

                const clsNames=[styles.bar];
                if(isComparing) clsNames.push(styles.compare);
                if(isSwapping) clsNames.push(styles.swap);
                if(isSorted) clsNames.push(styles.sorted);

                return (
                  <motion.div key={i} layout transition={{duration:Math.max(0.06,speed/1000)}} style={{height:`${heightPct}%`,width:`${Math.max(4,100/array.length)}%`}} className={clsNames.join(' ')}>
                    <div>{v}</div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className={styles.insightContainer}>
              <div className={styles.statsSection}>
                <h3>Real-time Statistics</h3>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <div className={styles.statTitle}>Comparisons</div>
                    <div className={styles.statValue}>{currentStats.comparisons}</div>
                  </div>
                  
                  {algorithm !== 'Merge Sort' ? (
                    <div className={styles.statCard}>
                      <div className={styles.statTitle}>Swaps</div>
                      <div className={styles.statValue}>{currentStats.swaps || 0}</div>
                    </div>
                  ) : (
                    <div className={styles.statCard}>
                      <div className={styles.statTitle}>Array Writes</div>
                      <div className={styles.statValue}>{currentStats.writes || 0}</div>
                    </div>
                  )}
                  
                  {algorithm === 'Merge Sort' && (
                    <div className={styles.statCard}>
                      <div className={styles.statTitle}>Current Recursion Depth</div>
                      <div className={styles.statValue}>{currentStats.recursionDepth || 0}</div>
                    </div>
                  )}
                  
                  {algorithm === 'Merge Sort' && (
                    <div className={styles.statCard}>
                      <div className={styles.statTitle}>Max Recursion Depth</div>
                      <div className={styles.statValue}>{currentStats.maxRecursionDepth || 0}</div>
                    </div>
                  )}
                  
                  <div className={styles.statCard}>
                    <div className={styles.statTitle}>Progress</div>
                    <div className={styles.statValue}>
                      {steps.length > 0 ? Math.round((currentStepIndex / steps.length) * 100) : 0}%
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.complexitySection}>
                <h3>Time Complexity Analysis</h3>
                <div className={styles.complexityGrid}>
                  <div className={styles.complexityCard}>
                    <h4>Theoretical Complexity</h4>
                    <ul>
                      <li><strong>Average Case:</strong> {getTheoreticalComplexity().average}</li>
                      <li><strong>Best Case:</strong> {getTheoreticalComplexity().best}</li>
                      <li><strong>Worst Case:</strong> {getTheoreticalComplexity().worst}</li>
                      <li><strong>Space Complexity:</strong> {getTheoreticalComplexity().space}</li>
                    </ul>
                  </div>
                  
                  <div className={styles.complexityCard}>
                    <h4>Actual Performance</h4>
                    <ul>
                      <li><strong>Total Operations:</strong> {getActualPerformance().operations}</li>
                      <li><strong>Theoretical Estimate:</strong> {getActualPerformance().theoretical}</li>
                      <li><strong>Efficiency Ratio:</strong> {getActualPerformance().ratio}</li>
                      <li><strong>Assessment:</strong> <span className={styles.assessment}>{getActualPerformance().assessment}</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <footer>Built as a learning tool • Prototype: Bubble / Insertion / Merge.</footer>
    </div>
  );
}
