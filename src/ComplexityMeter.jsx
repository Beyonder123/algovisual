import React, { useEffect, useRef } from 'react';
import styles from './ComplexityMeter.module.css';

const ComplexityMeter = ({ algorithm, currentStats, arraySize }) => {
  const canvasRef = useRef(null);
  const graphData = useRef([]);

  // Calculate efficiency score (0-100)
  const calculateEfficiencyScore = () => {
    const { comparisons, swaps, writes } = currentStats;
    const n = arraySize; // Using actual array size
    
    // Calculate actual operations
      const algo = algorithm.toLowerCase();
      let totalOperations;
      let best, average, worst;

      if (algo === 'merge sort') {
        // Merge sort typically does ~n log n comparisons and writes combined.
        totalOperations = comparisons + writes * 0.5; // writes have smaller impact than comparisons
        const base = n * Math.log2(n);

        // Use realistic scaling constants
        best = base * 0.8;      // Best: nearly optimal divide and conquer
        average = base * 1.0;   // Average: close to ideal
        worst = base * 1.2;     // Worst: due to recursion overhead or extra writes
      } 
      else if (algo === 'bubble sort') {
        totalOperations = comparisons + swaps;
        best = n;               // Already sorted
        average = n * n / 1.5;  // Mid-performance
        worst = n * n;          // Completely unsorted
      } 
      else if (algo === 'insertion sort') {
        totalOperations = comparisons + swaps;
        best = n;               // Already sorted
        average = (n * n) / 2;  // Typical mid-case
        worst = n * n;          // Reverse sorted
      } 
      else {
        totalOperations = comparisons + swaps + writes;
        best = n;
        average = n * n / 2;
        worst = n * n;
      }

      // Normalize the score
      let efficiency;
      if (totalOperations <= best) efficiency = 100;
      else if (totalOperations <= average) {
        const deviation = (totalOperations - best) / (average - best);
        efficiency = 100 - deviation * 25;
      } else if (totalOperations <= worst) {
        const deviation = (totalOperations - average) / (worst - average);
        efficiency = 75 - deviation * 25;
      } else {
        const range = worst - best;
        efficiency = Math.max(0, 50 - ((totalOperations - worst) / (range || 1)) * 25);
      }

      // Clamp to 0–100
      return Math.min(100, Math.max(0, Math.round(efficiency)));
  };

  // Update graph
  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    const { width, height } = canvasRef.current;

    // Add new data point
    const { comparisons, swaps, writes } = currentStats;
    graphData.current.push(comparisons + (swaps || 0) + (writes || 0));
    if (graphData.current.length > 50) graphData.current.shift();

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw graph
    const max = Math.max(...graphData.current, 1);
    const points = graphData.current.map((value, index) => ({
      x: (index / (graphData.current.length - 1)) * width,
      y: height - (value / max) * height
    }));

    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.strokeStyle = '#4A90E2';
    ctx.stroke();

    // Fill area under line
    ctx.lineTo(points[points.length - 1].x, height);
    ctx.lineTo(points[0].x, height);
    ctx.fillStyle = 'rgba(74, 144, 226, 0.1)';
    ctx.fill();
  }, [currentStats, algorithm]);

  const efficiencyScore = calculateEfficiencyScore();
  const getMeterColor = (score) => {
    if (score >= 75) return '#38A169'; // Green
    if (score >= 50) return '#ECC94B'; // Yellow
    return '#E53E3E'; // Red
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Complexity Analysis</h3>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Comparisons</div>
          <div className={styles.statValue}>{currentStats.comparisons}</div>
        </div>
        {algorithm !== 'Merge Sort' ? (
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Swaps</div>
            <div className={styles.statValue}>{currentStats.swaps || 0}</div>
          </div>
        ) : (
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Array Writes</div>
            <div className={styles.statValue}>{currentStats.writes || 0}</div>
          </div>
        )}
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Operations</div>
          <div className={styles.statValue}>
            {currentStats.comparisons + (currentStats.swaps || 0) + (currentStats.writes || 0)}
          </div>
        </div>
      </div>

      {/* Efficiency Score removed as requested */}

      <div className={styles.graphContainer}>
        <div className={styles.graphLabel}>Operations Over Time</div>
        <canvas 
          ref={canvasRef}
          className={styles.graph}
          width={500}
          height={200}
        />
      </div>
    </div>
  );
};

export default ComplexityMeter;