// Graph algorithm implementations for pathfinding visualization

interface GridCell {
  type: 'empty' | 'wall' | 'start' | 'end';
  state: 'default' | 'visited' | 'path' | 'current';
  row: number;
  col: number;
}

interface PathfindingResult {
  visited: [number, number][];
  path?: [number, number][];
}

// Helper function to get valid neighbors
function getNeighbors(grid: GridCell[][], row: number, col: number): [number, number][] {
  const neighbors: [number, number][] = [];
  const directions = [
    [-1, 0], // up
    [1, 0],  // down
    [0, -1], // left
    [0, 1],  // right
  ];
  
  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    
    if (
      newRow >= 0 && 
      newRow < grid.length && 
      newCol >= 0 && 
      newCol < grid[0].length &&
      grid[newRow][newCol].type !== 'wall'
    ) {
      neighbors.push([newRow, newCol]);
    }
  }
  
  return neighbors;
}

// Depth-First Search (DFS)
export function dfs(
  grid: GridCell[][], 
  start: [number, number], 
  end: [number, number]
): PathfindingResult {
  const visited: [number, number][] = [];
  const visitedSet = new Set<string>();
  const path: [number, number][] = [];
  const parent = new Map<string, [number, number]>();
  
  function dfsRecursive(row: number, col: number): boolean {
    const key = `${row},${col}`;
    
    if (visitedSet.has(key)) return false;
    
    visitedSet.add(key);
    visited.push([row, col]);
    
    // Check if we reached the end
    if (row === end[0] && col === end[1]) {
      // Reconstruct path
      let current: [number, number] | undefined = [row, col];
      while (current) {
        path.unshift(current);
        current = parent.get(`${current[0]},${current[1]}`);
      }
      return true;
    }
    
    // Explore neighbors
    const neighbors = getNeighbors(grid, row, col);
    for (const [nr, nc] of neighbors) {
      const neighborKey = `${nr},${nc}`;
      if (!visitedSet.has(neighborKey)) {
        parent.set(neighborKey, [row, col]);
        if (dfsRecursive(nr, nc)) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  dfsRecursive(start[0], start[1]);
  
  return { visited, path: path.length > 0 ? path : undefined };
}

// Breadth-First Search (BFS)
export function bfs(
  grid: GridCell[][], 
  start: [number, number], 
  end: [number, number]
): PathfindingResult {
  const visited: [number, number][] = [];
  const visitedSet = new Set<string>();
  const queue: [number, number][] = [start];
  const parent = new Map<string, [number, number]>();
  
  visitedSet.add(`${start[0]},${start[1]}`);
  
  while (queue.length > 0) {
    const [row, col] = queue.shift()!;
    visited.push([row, col]);
    
    // Check if we reached the end
    if (row === end[0] && col === end[1]) {
      // Reconstruct path
      const path: [number, number][] = [];
      let current: [number, number] | undefined = [row, col];
      while (current) {
        path.unshift(current);
        current = parent.get(`${current[0]},${current[1]}`);
      }
      return { visited, path };
    }
    
    // Explore neighbors
    const neighbors = getNeighbors(grid, row, col);
    for (const [nr, nc] of neighbors) {
      const neighborKey = `${nr},${nc}`;
      if (!visitedSet.has(neighborKey)) {
        visitedSet.add(neighborKey);
        parent.set(neighborKey, [row, col]);
        queue.push([nr, nc]);
      }
    }
  }
  
  return { visited };
}

// A* Pathfinding Algorithm
export function aStar(
  grid: GridCell[][], 
  start: [number, number], 
  end: [number, number]
): PathfindingResult {
  const visited: [number, number][] = [];
  const openSet: [number, number][] = [start];
  const closedSet = new Set<string>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const parent = new Map<string, [number, number]>();
  
  // Heuristic function (Manhattan distance)
  const heuristic = (pos: [number, number]): number => {
    return Math.abs(pos[0] - end[0]) + Math.abs(pos[1] - end[1]);
  };
  
  const startKey = `${start[0]},${start[1]}`;
  gScore.set(startKey, 0);
  fScore.set(startKey, heuristic(start));
  
  while (openSet.length > 0) {
    // Find node in openSet with lowest fScore
    let current = openSet[0];
    let currentIdx = 0;
    
    for (let i = 1; i < openSet.length; i++) {
      const key = `${openSet[i][0]},${openSet[i][1]}`;
      const currentKey = `${current[0]},${current[1]}`;
      if ((fScore.get(key) || Infinity) < (fScore.get(currentKey) || Infinity)) {
        current = openSet[i];
        currentIdx = i;
      }
    }
    
    openSet.splice(currentIdx, 1);
    const currentKey = `${current[0]},${current[1]}`;
    closedSet.add(currentKey);
    visited.push(current);
    
    // Check if we reached the end
    if (current[0] === end[0] && current[1] === end[1]) {
      // Reconstruct path
      const path: [number, number][] = [];
      let pathCurrent: [number, number] | undefined = current;
      while (pathCurrent) {
        path.unshift(pathCurrent);
        pathCurrent = parent.get(`${pathCurrent[0]},${pathCurrent[1]}`);
      }
      return { visited, path };
    }
    
    // Explore neighbors
    const neighbors = getNeighbors(grid, current[0], current[1]);
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor[0]},${neighbor[1]}`;
      
      if (closedSet.has(neighborKey)) continue;
      
      const tentativeGScore = (gScore.get(currentKey) || Infinity) + 1;
      
      if (!openSet.some(pos => pos[0] === neighbor[0] && pos[1] === neighbor[1])) {
        openSet.push(neighbor);
      } else if (tentativeGScore >= (gScore.get(neighborKey) || Infinity)) {
        continue;
      }
      
      parent.set(neighborKey, current);
      gScore.set(neighborKey, tentativeGScore);
      fScore.set(neighborKey, tentativeGScore + heuristic(neighbor));
    }
  }
  
  return { visited };
}