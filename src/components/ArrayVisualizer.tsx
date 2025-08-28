import React, { useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { AlgorithmType, VisualizerState } from './AlgorithmVisualizer';
import { bubbleSort, selectionSort, insertionSort, mergeSort, quickSort, linearSearch, binarySearch, jumpSearch, interpolationSearch, exponentialSearch } from '../utils/algorithms';

interface ArrayVisualizerProps {
  speed: number;
  onStateChange: React.Dispatch<React.SetStateAction<VisualizerState>>;
}

interface ArrayElement {
  value: number;
  state: 'default' | 'comparing' | 'visited' | 'current' | 'path' | 'found';
  id: string;
}

const ArrayVisualizer = forwardRef<any, ArrayVisualizerProps>(({ speed, onStateChange }, ref) => {
  const [array, setArray] = useState<ArrayElement[]>([]);
  const [animationId, setAnimationId] = useState<NodeJS.Timeout | null>(null);

  // Generate random array
  const generateNewArray = useCallback(() => {
    const newArray: ArrayElement[] = [];
    for (let i = 0; i < 20; i++) {
      newArray.push({
        value: Math.floor(Math.random() * 90) + 10,
        state: 'default',
        id: `element-${i}`,
      });
    }
    setArray(newArray);
  }, []);

  // Initialize with random array on mount
  React.useEffect(() => {
    generateNewArray();
  }, [generateNewArray]);

  const resetVisualization = useCallback(() => {
    setArray(prev => prev.map(el => ({ ...el, state: 'default' })));
    onStateChange(prev => ({ ...prev, currentStep: 0, totalSteps: 0 }));
  }, [onStateChange]);

  const stopAnimation = useCallback(() => {
    if (animationId) {
      clearTimeout(animationId);
      setAnimationId(null);
    }
  }, [animationId]);

  const animateStep = useCallback((
    newArray: ArrayElement[],
    stepNumber: number,
    totalSteps: number
  ): Promise<void> => {
    return new Promise((resolve) => {
      const id = setTimeout(() => {
        setArray([...newArray]);
        onStateChange(prev => ({ 
          ...prev, 
          currentStep: stepNumber + 1, 
          totalSteps 
        }));
        resolve();
      }, speed);
      setAnimationId(id);
    });
  }, [speed, onStateChange]);

  const startAlgorithm = useCallback(async (algorithm: AlgorithmType, searchTarget?: number) => {
    resetVisualization();
    
    const arrayValues = array.map(el => el.value);
    let steps: any[] = [];

    try {
      switch (algorithm) {
        case 'bubble':
          steps = bubbleSort([...arrayValues]);
          break;
        case 'selection':
          steps = selectionSort([...arrayValues]);
          break;
        case 'insertion':
          steps = insertionSort([...arrayValues]);
          break;
        case 'merge':
          steps = mergeSort([...arrayValues]);
          break;
        case 'quick':
          steps = quickSort([...arrayValues]);
          break;
        case 'linear':
          if (searchTarget !== undefined) {
            steps = linearSearch([...arrayValues], searchTarget);
          }
          break;
        case 'binary':
        case 'jump':
        case 'interpolation':
        case 'exponential':
          if (searchTarget !== undefined) {
            // Sort array first for these search algorithms
            const sortedArray = [...arrayValues].sort((a, b) => a - b);
            setArray(prev => prev.map((el, idx) => ({ ...el, value: sortedArray[idx] })));
            await new Promise(resolve => setTimeout(resolve, speed));
            
            if (algorithm === 'binary') {
              steps = binarySearch(sortedArray, searchTarget);
            } else if (algorithm === 'jump') {
              steps = jumpSearch(sortedArray, searchTarget);
            } else if (algorithm === 'interpolation') {
              steps = interpolationSearch(sortedArray, searchTarget);
            } else if (algorithm === 'exponential') {
              steps = exponentialSearch(sortedArray, searchTarget);
            }
          }
          break;
        default:
          return;
      }

      onStateChange(prev => ({ ...prev, totalSteps: steps.length }));

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const newArray = [...array];

        // Reset all states
        newArray.forEach(el => el.state = 'default');

        // Apply step-specific states
        if (step.type === 'compare') {
          step.indices.forEach((idx: number) => {
            if (newArray[idx]) newArray[idx].state = 'comparing';
          });
        } else if (step.type === 'swap') {
          if (step.indices.length >= 2) {
            const [i, j] = step.indices;
            if (newArray[i] && newArray[j]) {
              const temp = newArray[i].value;
              newArray[i].value = newArray[j].value;
              newArray[j].value = temp;
              newArray[i].state = 'current';
              newArray[j].state = 'current';
            }
          }
        } else if (step.type === 'sorted') {
          step.indices.forEach((idx: number) => {
            if (newArray[idx]) newArray[idx].state = 'path';
          });
        } else if (step.type === 'visit') {
          if (newArray[step.index]) {
            newArray[step.index].state = 'visited';
          }
        } else if (step.type === 'current') {
          if (newArray[step.index]) {
            newArray[step.index].state = 'current';
          }
        } else if (step.type === 'found') {
          if (newArray[step.index]) {
            newArray[step.index].state = 'found';
          }
        }

        await animateStep(newArray, i, steps.length);
      }
    } catch (error) {
      console.error('Animation error:', error);
    }
  }, [array, animateStep, resetVisualization, onStateChange, speed]);

  useImperativeHandle(ref, () => ({
    startAlgorithm,
    stopAnimation,
    resetVisualization,
    generateNewArray,
  }));

  const getBarHeight = (value: number) => {
    return Math.max((value / 100) * 300, 20);
  };

  const getStateClass = (state: string) => {
    switch (state) {
      case 'comparing': return 'comparing';
      case 'visited': return 'visited';
      case 'current': return 'current';
      case 'path': return 'path';
      case 'found': return 'path';
      default: return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Array Visualization</h3>
        <p className="text-muted-foreground text-sm">
          Each bar represents a number. Watch the algorithm compare and sort them step by step.
        </p>
      </div>
      
      <div className="flex items-end justify-center gap-1 min-h-[350px] p-4 bg-secondary/20 rounded-lg overflow-x-auto">
        {array.map((element, index) => (
          <div
            key={element.id}
            className="flex flex-col items-center gap-2 min-w-[24px]"
          >
            <div
              className={`algo-bar ${getStateClass(element.state)} min-w-[20px] flex items-end justify-center`}
              style={{ height: `${getBarHeight(element.value)}px` }}
            >
              <span className="text-xs font-mono text-white mb-1 transform rotate-0">
                {element.value}
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {index}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

ArrayVisualizer.displayName = 'ArrayVisualizer';

export { ArrayVisualizer };