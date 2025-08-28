import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Play, Square, RotateCcw, Shuffle } from 'lucide-react';
import { AlgorithmType, VisualizationType, VisualizerState } from './AlgorithmVisualizer';

interface ControlPanelProps {
  selectedAlgorithm: AlgorithmType;
  onAlgorithmChange: (algorithm: AlgorithmType) => void;
  visualizationType: VisualizationType;
  state: VisualizerState;
  searchTarget: number;
  onSearchTargetChange: (target: number) => void;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onGenerateNew: () => void;
}

const algorithmOptions = {
  sorting: [
    { value: 'bubble' as const, label: 'Bubble Sort' },
    { value: 'selection' as const, label: 'Selection Sort' },
    { value: 'insertion' as const, label: 'Insertion Sort' },
    { value: 'merge' as const, label: 'Merge Sort' },
    { value: 'quick' as const, label: 'Quick Sort' },
  ],
  searching: [
    { value: 'linear' as const, label: 'Linear Search' },
    { value: 'binary' as const, label: 'Binary Search' },
    { value: 'jump' as const, label: 'Jump Search' },
    { value: 'interpolation' as const, label: 'Interpolation Search' },
    { value: 'exponential' as const, label: 'Exponential Search' },
  ],
  graph: [
    { value: 'dfs' as const, label: 'Depth-First Search (DFS)' },
    { value: 'bfs' as const, label: 'Breadth-First Search (BFS)' },
    { value: 'astar' as const, label: 'A* Pathfinding' },
  ],
};

export const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedAlgorithm,
  onAlgorithmChange,
  visualizationType,
  state,
  searchTarget,
  onSearchTargetChange,
  onStart,
  onStop,
  onReset,
  onSpeedChange,
  onGenerateNew,
}) => {
  const isSearchAlgorithm = ['linear', 'binary', 'jump', 'interpolation', 'exponential'].includes(selectedAlgorithm);

  return (
    <div className="space-y-6">
      {/* Algorithm Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label className="text-base font-semibold">Sorting Algorithms</Label>
          <Select
            value={algorithmOptions.sorting.some(opt => opt.value === selectedAlgorithm) ? selectedAlgorithm : ''}
            onValueChange={onAlgorithmChange}
          >
            <SelectTrigger className="bg-secondary/50 border-border">
              <SelectValue placeholder="Select sorting algorithm" />
            </SelectTrigger>
            <SelectContent>
              {algorithmOptions.sorting.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-base font-semibold">Searching Algorithms</Label>
          <Select
            value={algorithmOptions.searching.some(opt => opt.value === selectedAlgorithm) ? selectedAlgorithm : ''}
            onValueChange={onAlgorithmChange}
          >
            <SelectTrigger className="bg-secondary/50 border-border">
              <SelectValue placeholder="Select searching algorithm" />
            </SelectTrigger>
            <SelectContent>
              {algorithmOptions.searching.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-base font-semibold">Graph Algorithms</Label>
          <Select
            value={algorithmOptions.graph.some(opt => opt.value === selectedAlgorithm) ? selectedAlgorithm : ''}
            onValueChange={onAlgorithmChange}
          >
            <SelectTrigger className="bg-secondary/50 border-border">
              <SelectValue placeholder="Select graph algorithm" />
            </SelectTrigger>
            <SelectContent>
              {algorithmOptions.graph.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
        {/* Playback Controls */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Controls</Label>
          <div className="flex gap-2">
            <Button
              onClick={state.isAnimating ? onStop : onStart}
              variant="default"
              size="sm"
              className="flex-1"
              disabled={!selectedAlgorithm}
            >
              {state.isAnimating ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </>
              )}
            </Button>
            <Button
              onClick={onReset}
              variant="outline"
              size="sm"
              disabled={state.isAnimating}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Speed Control */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Speed: {1000 - state.speed}ms</Label>
          <Slider
            value={[state.speed]}
            onValueChange={([value]) => onSpeedChange(value)}
            min={50}
            max={950}
            step={50}
            className="w-full"
            disabled={state.isAnimating}
          />
        </div>

        {/* Search Target (for searching algorithms) */}
        {isSearchAlgorithm && (
          <div className="space-y-2">
            <Label htmlFor="searchTarget" className="text-sm font-medium">
              Search Target
            </Label>
            <Input
              id="searchTarget"
              type="number"
              value={searchTarget}
              onChange={(e) => onSearchTargetChange(Number(e.target.value))}
              min={1}
              max={100}
              className="bg-secondary/50 border-border"
              disabled={state.isAnimating}
            />
          </div>
        )}

        {/* Generate New */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Data</Label>
          <Button
            onClick={onGenerateNew}
            variant="outline"
            size="sm"
            className="w-full"
            disabled={state.isAnimating}
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Generate New {visualizationType === 'array' ? 'Array' : 'Grid'}
          </Button>
        </div>
      </div>

      {/* Progress */}
      {state.isAnimating && state.totalSteps > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">Progress</Label>
            <span className="text-sm text-muted-foreground">
              {state.currentStep} / {state.totalSteps} steps
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="gradient-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(state.currentStep / state.totalSteps) * 100}%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};