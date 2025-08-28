import React, { useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { AlgorithmType, VisualizerState } from './AlgorithmVisualizer';
import { dfs, bfs, aStar } from '../utils/graphAlgorithms';

interface GraphVisualizerProps {
  speed: number;
  onStateChange: React.Dispatch<React.SetStateAction<VisualizerState>>;
}

type CellType = 'empty' | 'wall' | 'start' | 'end';
type CellState = 'default' | 'visited' | 'path' | 'current';

interface GridCell {
  type: CellType;
  state: CellState;
  row: number;
  col: number;
}

const GRID_ROWS = 15;
const GRID_COLS = 25;

const GraphVisualizer = forwardRef<any, GraphVisualizerProps>(({ speed, onStateChange }, ref) => {
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [startPos, setStartPos] = useState<[number, number]>([2, 2]);
  const [endPos, setEndPos] = useState<[number, number]>([GRID_ROWS - 3, GRID_COLS - 3]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<'wall' | 'empty'>('wall');
  const [animationId, setAnimationId] = useState<NodeJS.Timeout | null>(null);

  const initializeGrid = useCallback(() => {
    const newGrid: GridCell[][] = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      const currentRow: GridCell[] = [];
      for (let col = 0; col < GRID_COLS; col++) {
        currentRow.push({
          type: 'empty',
          state: 'default',
          row,
          col,
        });
      }
      newGrid.push(currentRow);
    }
    
    // Set start and end positions
    newGrid[startPos[0]][startPos[1]].type = 'start';
    newGrid[endPos[0]][endPos[1]].type = 'end';
    
    setGrid(newGrid);
  }, [startPos, endPos]);

  const generateNewGrid = useCallback(() => {
    const newGrid: GridCell[][] = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      const currentRow: GridCell[] = [];
      for (let col = 0; col < GRID_COLS; col++) {
        let type: CellType = 'empty';
        
        // Add some random walls (20% chance)
        if (Math.random() < 0.2 && 
            !(row === startPos[0] && col === startPos[1]) && 
            !(row === endPos[0] && col === endPos[1])) {
          type = 'wall';
        }
        
        currentRow.push({
          type,
          state: 'default',
          row,
          col,
        });
      }
      newGrid.push(currentRow);
    }
    
    // Set start and end positions
    newGrid[startPos[0]][startPos[1]].type = 'start';
    newGrid[endPos[0]][endPos[1]].type = 'end';
    
    setGrid(newGrid);
  }, [startPos, endPos]);

  // Initialize grid on mount
  React.useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  const resetVisualization = useCallback(() => {
    setGrid(prev => prev.map(row => 
      row.map(cell => ({
        ...cell,
        state: 'default'
      }))
    ));
    onStateChange(prev => ({ ...prev, currentStep: 0, totalSteps: 0 }));
  }, [onStateChange]);

  const stopAnimation = useCallback(() => {
    if (animationId) {
      clearTimeout(animationId);
      setAnimationId(null);
    }
  }, [animationId]);

  const animateStep = useCallback((
    visitedCell?: [number, number],
    pathCells?: [number, number][],
    currentCell?: [number, number],
    stepNumber?: number,
    totalSteps?: number
  ): Promise<void> => {
    return new Promise((resolve) => {
      const id = setTimeout(() => {
        setGrid(prev => {
          const newGrid = prev.map(row => row.map(cell => ({ ...cell })));
          
          // Mark visited cell
          if (visitedCell) {
            const [row, col] = visitedCell;
            if (newGrid[row] && newGrid[row][col] && newGrid[row][col].type === 'empty') {
              newGrid[row][col].state = 'visited';
            }
          }
          
          // Mark path cells
          if (pathCells) {
            pathCells.forEach(([row, col]) => {
              if (newGrid[row] && newGrid[row][col] && newGrid[row][col].type === 'empty') {
                newGrid[row][col].state = 'path';
              }
            });
          }
          
          // Mark current cell
          if (currentCell) {
            const [row, col] = currentCell;
            if (newGrid[row] && newGrid[row][col] && newGrid[row][col].type === 'empty') {
              newGrid[row][col].state = 'current';
            }
          }
          
          return newGrid;
        });
        
        if (stepNumber !== undefined && totalSteps !== undefined) {
          onStateChange(prev => ({ 
            ...prev, 
            currentStep: stepNumber + 1, 
            totalSteps 
          }));
        }
        
        resolve();
      }, speed);
      setAnimationId(id);
    });
  }, [speed, onStateChange]);

  const startAlgorithm = useCallback(async (algorithm: AlgorithmType) => {
    resetVisualization();
    
    try {
      let result: { visited: [number, number][], path?: [number, number][] } = { visited: [] };
      
      switch (algorithm) {
        case 'dfs':
          result = dfs(grid, startPos, endPos);
          break;
        case 'bfs':
          result = bfs(grid, startPos, endPos);
          break;
        case 'astar':
          result = aStar(grid, startPos, endPos);
          break;
        default:
          return;
      }

      const { visited, path } = result;
      onStateChange(prev => ({ ...prev, totalSteps: visited.length + (path?.length || 0) }));

      // Animate visited cells
      for (let i = 0; i < visited.length; i++) {
        await animateStep(visited[i], undefined, visited[i], i, visited.length + (path?.length || 0));
      }

      // Animate path if found
      if (path && path.length > 0) {
        for (let i = 0; i < path.length; i++) {
          await animateStep(undefined, path.slice(0, i + 1), undefined, visited.length + i, visited.length + path.length);
        }
      }
    } catch (error) {
      console.error('Graph algorithm error:', error);
    }
  }, [grid, startPos, endPos, animateStep, resetVisualization, onStateChange]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (grid[row] && grid[row][col]) {
      const cell = grid[row][col];
      
      if (cell.type === 'start' || cell.type === 'end') {
        return; // Can't modify start or end cells
      }

      setGrid(prev => {
        const newGrid = prev.map(r => r.map(c => ({ ...c })));
        if (cell.type === 'wall') {
          newGrid[row][col].type = 'empty';
        } else {
          newGrid[row][col].type = 'wall';
        }
        return newGrid;
      });
    }
  }, [grid]);

  const handleMouseDown = useCallback((row: number, col: number) => {
    const cell = grid[row]?.[col];
    if (!cell || cell.type === 'start' || cell.type === 'end') return;
    
    setIsDrawing(true);
    setDrawMode(cell.type === 'wall' ? 'empty' : 'wall');
    handleCellClick(row, col);
  }, [grid, handleCellClick]);

  const handleMouseEnter = useCallback((row: number, col: number) => {
    if (!isDrawing) return;
    
    const cell = grid[row]?.[col];
    if (!cell || cell.type === 'start' || cell.type === 'end') return;
    
    setGrid(prev => {
      const newGrid = prev.map(r => r.map(c => ({ ...c })));
      newGrid[row][col].type = drawMode;
      return newGrid;
    });
  }, [isDrawing, drawMode, grid]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  useImperativeHandle(ref, () => ({
    startAlgorithm,
    stopAnimation,
    resetVisualization,
    generateNewGrid,
  }));

  const getCellClasses = (cell: GridCell) => {
    let classes = 'graph-cell w-6 h-6 cursor-pointer';
    
    switch (cell.type) {
      case 'wall':
        classes += ' wall';
        break;
      case 'start':
        classes += ' start';
        break;
      case 'end':
        classes += ' end';
        break;
      default:
        break;
    }
    
    if (cell.type === 'empty') {
      switch (cell.state) {
        case 'visited':
          classes += ' visited';
          break;
        case 'path':
          classes += ' path';
          break;
        case 'current':
          classes += ' current';
          break;
        default:
          break;
      }
    }
    
    return classes;
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Graph Visualization</h3>
        <p className="text-muted-foreground text-sm">
          Click to add/remove walls. The algorithm will find a path from start (blue) to end (pink).
        </p>
      </div>
      
      <div 
        className="inline-block p-4 bg-secondary/20 rounded-lg mx-auto"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="grid gap-[1px] bg-border/50 p-1 rounded" style={{
          gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`
        }}>
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={getCellClasses(cell)}
                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                title={`${cell.type} (${rowIndex}, ${colIndex})`}
              />
            ))
          )}
        </div>
      </div>

      <div className="flex justify-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-algo-start rounded"></div>
          <span>Start ({startPos[0]}, {startPos[1]})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-algo-end rounded"></div>
          <span>End ({endPos[0]}, {endPos[1]})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-algo-wall rounded"></div>
          <span>Wall (click to toggle)</span>
        </div>
      </div>
    </div>
  );
});

GraphVisualizer.displayName = 'GraphVisualizer';

export { GraphVisualizer };