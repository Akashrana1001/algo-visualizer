import React, { useState, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { ControlPanel } from './ControlPanel';
import { ArrayVisualizer } from './ArrayVisualizer';
import { GraphVisualizer } from './GraphVisualizer';

export type AlgorithmType = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick' | 'linear' | 'binary' | 'jump' | 'interpolation' | 'exponential' | 'dfs' | 'bfs' | 'astar';
export type VisualizationType = 'array' | 'graph';

export interface VisualizerState {
  isAnimating: boolean;
  speed: number;
  currentStep: number;
  totalSteps: number;
}

const AlgorithmVisualizer: React.FC = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('bubble');
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('array');
  const [state, setState] = useState<VisualizerState>({
    isAnimating: false,
    speed: 500,
    currentStep: 0,
    totalSteps: 0
  });
  const [searchTarget, setSearchTarget] = useState<number>(50);

  const arrayVisualizerRef = useRef<any>(null);
  const graphVisualizerRef = useRef<any>(null);

  const handleAlgorithmChange = useCallback((algorithm: AlgorithmType) => {
    setSelectedAlgorithm(algorithm);
    
    // Determine visualization type based on algorithm
    const graphAlgorithms: AlgorithmType[] = ['dfs', 'bfs', 'astar'];
    setVisualizationType(graphAlgorithms.includes(algorithm) ? 'graph' : 'array');
    
    // Stop any running animation
    handleStop();
  }, []);

  const handleStart = useCallback(async () => {
    if (state.isAnimating) return;

    setState(prev => ({ ...prev, isAnimating: true, currentStep: 0 }));

    try {
      if (visualizationType === 'array') {
        await arrayVisualizerRef.current?.startAlgorithm(selectedAlgorithm, searchTarget);
      } else {
        await graphVisualizerRef.current?.startAlgorithm(selectedAlgorithm);
      }
    } catch (error) {
      console.error('Algorithm execution error:', error);
    } finally {
      setState(prev => ({ ...prev, isAnimating: false }));
    }
  }, [selectedAlgorithm, searchTarget, state.isAnimating, visualizationType]);

  const handleStop = useCallback(() => {
    setState(prev => ({ ...prev, isAnimating: false }));
    
    if (visualizationType === 'array') {
      arrayVisualizerRef.current?.stopAnimation();
    } else {
      graphVisualizerRef.current?.stopAnimation();
    }
  }, [visualizationType]);

  const handleReset = useCallback(() => {
    handleStop();
    
    if (visualizationType === 'array') {
      arrayVisualizerRef.current?.resetVisualization();
    } else {
      graphVisualizerRef.current?.resetVisualization();
    }
  }, [visualizationType, handleStop]);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setState(prev => ({ ...prev, speed: newSpeed }));
  }, []);

  const handleGenerateNew = useCallback(() => {
    handleStop();
    
    if (visualizationType === 'array') {
      arrayVisualizerRef.current?.generateNewArray();
    } else {
      graphVisualizerRef.current?.generateNewGrid();
    }
  }, [visualizationType, handleStop]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent">
            Algorithm Visualizer
          </h1>
          <p className="text-muted-foreground text-lg">
            Interactive visualization of sorting, searching, and graph algorithms
          </p>
        </div>

        {/* Control Panel */}
        <Card className="control-panel p-6 border-border/50 animate-slide-up">
          <ControlPanel
            selectedAlgorithm={selectedAlgorithm}
            onAlgorithmChange={handleAlgorithmChange}
            visualizationType={visualizationType}
            state={state}
            searchTarget={searchTarget}
            onSearchTargetChange={setSearchTarget}
            onStart={handleStart}
            onStop={handleStop}
            onReset={handleReset}
            onSpeedChange={handleSpeedChange}
            onGenerateNew={handleGenerateNew}
          />
        </Card>

        {/* Visualization Area */}
        <Card className="p-6 border-border/50 min-h-[500px] animate-bounce-in">
          {visualizationType === 'array' ? (
            <ArrayVisualizer
              ref={arrayVisualizerRef}
              speed={state.speed}
              onStateChange={setState}
            />
          ) : (
            <GraphVisualizer
              ref={graphVisualizerRef}
              speed={state.speed}
              onStateChange={setState}
            />
          )}
        </Card>

        {/* Legend */}
        <Card className="p-6 border-border/50 animate-fade-in">
          <h3 className="text-lg font-semibold mb-4">Color Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded algo-bar"></div>
              <span className="text-sm">Default</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-algo-comparing"></div>
              <span className="text-sm">Comparing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-algo-visited"></div>
              <span className="text-sm">Visited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-algo-current"></div>
              <span className="text-sm">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-algo-path"></div>
              <span className="text-sm">Path/Sorted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-algo-start"></div>
              <span className="text-sm">Start Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-algo-end"></div>
              <span className="text-sm">End Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-algo-wall"></div>
              <span className="text-sm">Wall</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AlgorithmVisualizer;