import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Tree from 'react-d3-tree';
import styles from './StateTransitionMap.module.css';

const StateTransitionMap = ({ algorithm, currentStep, algorithmState }) => {
  const [treeData, setTreeData] = useState(null);

  const treeConfig = useMemo(() => ({
    orientation: "horizontal",
    pathFunc: "step",
    translate: { x: 50, y: 150 },
    nodeSize: { x: 180, y: 100 },
    separation: { siblings: 1.5, nonSiblings: 2 },
    enableLegacyTransitions: false,
    transitionDuration: 0,
    shouldCollapseNeighborNodes: false,
    scaleExtent: { min: 0.5, max: 1.5 },
    zoom: 1,
    styles: {
      nodes: {
        node: {
          circle: {
            fill: "#4A90E2"
          },
          attributes: {
            stroke: "none"
          }
        },
        leafNode: {
          circle: {
            fill: "#38A169"
          }
        }
      }
    }
  }), []);

  const buildTreeData = useCallback((algorithmState, algorithm, currentStep) => {
    if (!algorithmState || !algorithm) return null;

    const stats = algorithmState.stats || {};
    
    // Create root node based on algorithm type
    const root = {
      name: `${algorithm} State`,
      attributes: {
        step: `Step ${currentStep}`,
        comparisons: `Comparisons: ${stats.comparisons || 0}`,
        ...(stats.swaps !== undefined && { swaps: `Swaps: ${stats.swaps}` }),
        ...(stats.writes !== undefined && { writes: `Writes: ${stats.writes}` }),
        ...(stats.recursionDepth !== undefined && { depth: `Depth: ${stats.recursionDepth}` })
      },
      children: []
    };

    // Add current action node if there's an action
    if (algorithmState.type) {
      let actionDetails = '';
      switch (algorithmState.type) {
        case 'compare':
          actionDetails = `Comparing elements at [${algorithmState.indices?.join(' & ')}]`;
          break;
        case 'swap':
          actionDetails = `Swapping elements at [${algorithmState.indices?.join(' ↔ ')}]`;
          break;
        case 'overwrite':
          actionDetails = `Writing ${algorithmState.value} to index ${algorithmState.index}`;
          break;
        case 'markSorted':
          actionDetails = `Marking index ${algorithmState.index} as sorted`;
          break;
        default:
          actionDetails = 'Processing';
      }

      root.children.push({
        name: 'Current Action',
        attributes: {
          type: algorithmState.type,
          details: actionDetails
        }
      });
    }

    // Add progress node
    const progress = Math.min(100, Math.round((currentStep / (stats.writes || stats.comparisons || 1)) * 100));
    root.children.push({
      name: 'Progress',
      attributes: {
        percentage: `${progress}% Complete`
      }
    });

    return root;
  }, []);

  useEffect(() => {
    const newTreeData = buildTreeData(algorithmState, algorithm, currentStep);
    if (JSON.stringify(newTreeData) !== JSON.stringify(treeData)) {
      setTreeData(newTreeData);
    }
  }, [algorithm, currentStep, algorithmState, buildTreeData, treeData]);

  if (!treeData) {
    return (
      <div className={styles.container}>
        <div className={styles.placeholder}>Waiting for algorithm steps...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Algorithm State Tree</h3>
      <div className={styles.treeContainer}>
        <Tree
          data={treeData}
          {...treeConfig}
          pathFunc="step"
          orientation="vertical"
          nodeSize={{ x: 220, y: 80 }}
          translate={{ x: 150, y: 50 }}
          rootNodeClassName={styles.node}
        />
      </div>
    </div>
  );
};

export default StateTransitionMap;