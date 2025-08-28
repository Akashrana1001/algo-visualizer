// Sorting and searching algorithm implementations that return animation steps

export interface AlgorithmStep {
  type: 'compare' | 'swap' | 'sorted' | 'visit' | 'current' | 'found' | 'not_found';
  indices?: number[];
  index?: number;
  value?: number;
}

// Bubble Sort Implementation
export function bubbleSort(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const n = arr.length;
  
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Compare adjacent elements
      steps.push({
        type: 'compare',
        indices: [j, j + 1]
      });
      
      if (arr[j] > arr[j + 1]) {
        // Swap elements
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        steps.push({
          type: 'swap',
          indices: [j, j + 1]
        });
      }
    }
    
    // Mark the last element as sorted
    steps.push({
      type: 'sorted',
      indices: [n - i - 1]
    });
  }
  
  // Mark all elements as sorted
  steps.push({
    type: 'sorted',
    indices: Array.from({ length: n }, (_, i) => i)
  });
  
  return steps;
}

// Selection Sort Implementation
export function selectionSort(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const n = arr.length;
  
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    
    // Mark current position
    steps.push({
      type: 'current',
      index: i
    });
    
    for (let j = i + 1; j < n; j++) {
      // Compare with current minimum
      steps.push({
        type: 'compare',
        indices: [minIdx, j]
      });
      
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    
    // Swap if needed
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      steps.push({
        type: 'swap',
        indices: [i, minIdx]
      });
    }
    
    // Mark position as sorted
    steps.push({
      type: 'sorted',
      indices: [i]
    });
  }
  
  // Mark all elements as sorted
  steps.push({
    type: 'sorted',
    indices: Array.from({ length: n }, (_, i) => i)
  });
  
  return steps;
}

// Insertion Sort Implementation
export function insertionSort(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const n = arr.length;
  
  // First element is considered sorted
  steps.push({
    type: 'sorted',
    indices: [0]
  });
  
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;
    
    // Mark current element
    steps.push({
      type: 'current',
      index: i
    });
    
    // Move elements that are greater than key one position ahead
    while (j >= 0 && arr[j] > key) {
      steps.push({
        type: 'compare',
        indices: [j, j + 1]
      });
      
      arr[j + 1] = arr[j];
      steps.push({
        type: 'swap',
        indices: [j, j + 1]
      });
      
      j = j - 1;
    }
    
    arr[j + 1] = key;
    
    // Mark sorted portion
    steps.push({
      type: 'sorted',
      indices: Array.from({ length: i + 1 }, (_, idx) => idx)
    });
  }
  
  return steps;
}

// Linear Search Implementation
export function linearSearch(arr: number[], target: number): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  
  for (let i = 0; i < arr.length; i++) {
    // Visit current element
    steps.push({
      type: 'current',
      index: i
    });
    
    // Compare with target
    steps.push({
      type: 'compare',
      indices: [i],
      value: target
    });
    
    if (arr[i] === target) {
      // Found the target
      steps.push({
        type: 'found',
        index: i
      });
      return steps;
    } else {
      // Mark as visited
      steps.push({
        type: 'visit',
        index: i
      });
    }
  }
  
  // Target not found
  steps.push({
    type: 'not_found'
  });
  
  return steps;
}

// Binary Search Implementation (assumes sorted array)
export function binarySearch(arr: number[], target: number): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    // Show current search range
    steps.push({
      type: 'compare',
      indices: [left, right],
      value: target
    });
    
    // Mark middle element
    steps.push({
      type: 'current',
      index: mid
    });
    
    if (arr[mid] === target) {
      // Found the target
      steps.push({
        type: 'found',
        index: mid
      });
      return steps;
    } else if (arr[mid] < target) {
      // Mark visited elements on the left
      for (let i = left; i <= mid; i++) {
        steps.push({
          type: 'visit',
          index: i
        });
      }
      left = mid + 1;
    } else {
      // Mark visited elements on the right
      for (let i = mid; i <= right; i++) {
        steps.push({
          type: 'visit',
          index: i
        });
      }
      right = mid - 1;
    }
  }
  
  // Target not found
  steps.push({
    type: 'not_found'
  });
  
  return steps;
}