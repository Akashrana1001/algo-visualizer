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

// Merge Sort Implementation
export function mergeSort(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const auxiliaryArray = [...arr];
  
  function merge(left: number, mid: number, right: number) {
    const leftArray = arr.slice(left, mid + 1);
    const rightArray = arr.slice(mid + 1, right + 1);
    
    let i = 0, j = 0, k = left;
    
    while (i < leftArray.length && j < rightArray.length) {
      // Compare elements from both subarrays
      steps.push({
        type: 'compare',
        indices: [left + i, mid + 1 + j]
      });
      
      if (leftArray[i] <= rightArray[j]) {
        arr[k] = leftArray[i];
        steps.push({
          type: 'current',
          index: k
        });
        i++;
      } else {
        arr[k] = rightArray[j];
        steps.push({
          type: 'current',
          index: k
        });
        j++;
      }
      k++;
    }
    
    // Copy remaining elements
    while (i < leftArray.length) {
      arr[k] = leftArray[i];
      steps.push({
        type: 'current',
        index: k
      });
      i++;
      k++;
    }
    
    while (j < rightArray.length) {
      arr[k] = rightArray[j];
      steps.push({
        type: 'current',
        index: k
      });
      j++;
      k++;
    }
    
    // Mark merged section as sorted
    steps.push({
      type: 'sorted',
      indices: Array.from({ length: right - left + 1 }, (_, idx) => left + idx)
    });
  }
  
  function mergeSortHelper(left: number, right: number) {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      
      mergeSortHelper(left, mid);
      mergeSortHelper(mid + 1, right);
      merge(left, mid, right);
    }
  }
  
  mergeSortHelper(0, arr.length - 1);
  return steps;
}

// Quick Sort Implementation
export function quickSort(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  
  function partition(low: number, high: number): number {
    const pivot = arr[high];
    let i = low - 1;
    
    // Mark pivot
    steps.push({
      type: 'current',
      index: high
    });
    
    for (let j = low; j < high; j++) {
      // Compare with pivot
      steps.push({
        type: 'compare',
        indices: [j, high]
      });
      
      if (arr[j] < pivot) {
        i++;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          steps.push({
            type: 'swap',
            indices: [i, j]
          });
        }
      }
    }
    
    // Place pivot in correct position
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    steps.push({
      type: 'swap',
      indices: [i + 1, high]
    });
    
    return i + 1;
  }
  
  function quickSortHelper(low: number, high: number) {
    if (low < high) {
      const pi = partition(low, high);
      
      // Mark pivot as sorted
      steps.push({
        type: 'sorted',
        indices: [pi]
      });
      
      quickSortHelper(low, pi - 1);
      quickSortHelper(pi + 1, high);
    }
  }
  
  quickSortHelper(0, arr.length - 1);
  
  // Mark all elements as sorted
  steps.push({
    type: 'sorted',
    indices: Array.from({ length: arr.length }, (_, i) => i)
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

// Jump Search Implementation (assumes sorted array)
export function jumpSearch(arr: number[], target: number): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const n = arr.length;
  const stepSize = Math.floor(Math.sqrt(n));
  let prev = 0;
  let currentStep = stepSize;
  
  // Find the block where element is present
  while (arr[Math.min(currentStep, n) - 1] < target) {
    // Mark current jump position
    steps.push({
      type: 'current',
      index: Math.min(currentStep, n) - 1
    });
    
    steps.push({
      type: 'compare',
      indices: [Math.min(currentStep, n) - 1],
      value: target
    });
    
    // Mark visited range
    for (let i = prev; i < Math.min(currentStep, n); i++) {
      steps.push({
        type: 'visit',
        index: i
      });
    }
    
    prev = currentStep;
    currentStep += stepSize;
    
    if (prev >= n) {
      steps.push({
        type: 'not_found'
      });
      return steps;
    }
  }
  
  // Linear search in the identified block
  while (arr[prev] < target) {
    steps.push({
      type: 'current',
      index: prev
    });
    
    steps.push({
      type: 'compare',
      indices: [prev],
      value: target
    });
    
    steps.push({
      type: 'visit',
      index: prev
    });
    
    prev++;
    
    if (prev === Math.min(currentStep, n)) {
      steps.push({
        type: 'not_found'
      });
      return steps;
    }
  }
  
  // Check if element is found
  steps.push({
    type: 'current',
    index: prev
  });
  
  if (arr[prev] === target) {
    steps.push({
      type: 'found',
      index: prev
    });
  } else {
    steps.push({
      type: 'not_found'
    });
  }
  
  return steps;
}

// Interpolation Search Implementation (assumes sorted array with uniform distribution)
export function interpolationSearch(arr: number[], target: number): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  let low = 0;
  let high = arr.length - 1;
  
  while (low <= high && target >= arr[low] && target <= arr[high]) {
    // Calculate position using interpolation formula
    const pos = low + Math.floor(((target - arr[low]) / (arr[high] - arr[low])) * (high - low));
    
    // Show current search range
    steps.push({
      type: 'compare',
      indices: [low, high],
      value: target
    });
    
    // Mark interpolated position
    steps.push({
      type: 'current',
      index: pos
    });
    
    if (arr[pos] === target) {
      steps.push({
        type: 'found',
        index: pos
      });
      return steps;
    }
    
    if (arr[pos] < target) {
      // Mark visited elements on the left
      for (let i = low; i <= pos; i++) {
        steps.push({
          type: 'visit',
          index: i
        });
      }
      low = pos + 1;
    } else {
      // Mark visited elements on the right
      for (let i = pos; i <= high; i++) {
        steps.push({
          type: 'visit',
          index: i
        });
      }
      high = pos - 1;
    }
  }
  
  steps.push({
    type: 'not_found'
  });
  
  return steps;
}

// Exponential Search Implementation (assumes sorted array)
export function exponentialSearch(arr: number[], target: number): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const n = arr.length;
  
  // If target is at first position
  steps.push({
    type: 'current',
    index: 0
  });
  
  if (arr[0] === target) {
    steps.push({
      type: 'found',
      index: 0
    });
    return steps;
  }
  
  // Find range for binary search
  let i = 1;
  while (i < n && arr[i] <= target) {
    steps.push({
      type: 'current',
      index: i
    });
    
    steps.push({
      type: 'compare',
      indices: [i],
      value: target
    });
    
    if (arr[i] === target) {
      steps.push({
        type: 'found',
        index: i
      });
      return steps;
    }
    
    // Mark visited
    steps.push({
      type: 'visit',
      index: i
    });
    
    i = i * 2;
  }
  
  // Perform binary search on the found range
  const binarySteps = binarySearchRange(arr, target, Math.floor(i / 2), Math.min(i, n - 1));
  steps.push(...binarySteps);
  
  return steps;
}

// Helper function for exponential search
function binarySearchRange(arr: number[], target: number, left: number, right: number): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    steps.push({
      type: 'compare',
      indices: [left, right],
      value: target
    });
    
    steps.push({
      type: 'current',
      index: mid
    });
    
    if (arr[mid] === target) {
      steps.push({
        type: 'found',
        index: mid
      });
      return steps;
    } else if (arr[mid] < target) {
      for (let i = left; i <= mid; i++) {
        steps.push({
          type: 'visit',
          index: i
        });
      }
      left = mid + 1;
    } else {
      for (let i = mid; i <= right; i++) {
        steps.push({
          type: 'visit',
          index: i
        });
      }
      right = mid - 1;
    }
  }
  
  steps.push({
    type: 'not_found'
  });
  
  return steps;
}