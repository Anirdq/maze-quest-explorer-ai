
import React from "react";
import { Button } from "@/components/ui/button";
import { Algorithm } from "@/utils/pathfindingAlgorithms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RefreshCw, Play as PlayIcon, Grid } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ControlPanelProps {
  isRunning: boolean;
  isDone: boolean;
  algorithm: Algorithm;
  mazeSize: number;
  speed: number;
  stats: {
    visitedCount: number;
    pathLength: number;
    elapsedTime: number;
  };
  onAlgorithmChange: (algorithm: Algorithm) => void;
  onMazeSizeChange: (size: number) => void;
  onSpeedChange: (speed: number) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onGenerateNewMaze: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isRunning,
  isDone,
  algorithm,
  mazeSize,
  speed,
  stats,
  onAlgorithmChange,
  onMazeSizeChange,
  onSpeedChange,
  onStart,
  onPause,
  onReset,
  onGenerateNewMaze,
}) => {
  return (
    <div className="control-panel">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Maze Quest: Explorer AI
        </h2>
        <p className="text-center text-sm text-muted-foreground mb-4">
          Watch AI algorithms navigate through the maze!
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Algorithm</label>
          <Select
            value={algorithm}
            onValueChange={(value) => onAlgorithmChange(value as Algorithm)}
            disabled={isRunning}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select algorithm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bfs">Breadth First Search</SelectItem>
              <SelectItem value="dfs">Depth First Search</SelectItem>
              <SelectItem value="astar">A* Search</SelectItem>
              <SelectItem value="dijkstra">Dijkstra's Algorithm</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Maze Size: {mazeSize}×{mazeSize}</label>
          </div>
          <Slider
            value={[mazeSize]}
            min={5}
            max={31}
            step={2}
            onValueChange={(values) => onMazeSizeChange(values[0])}
            disabled={isRunning}
            className="py-2"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Animation Speed</label>
          </div>
          <Slider
            value={[speed]}
            min={1}
            max={100}
            onValueChange={(values) => onSpeedChange(values[0])}
            className="py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="default"
            onClick={isRunning ? onPause : onStart}
            disabled={isDone}
            className="flex items-center justify-center gap-2"
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRunning ? "Pause" : "Start"}
          </Button>

          <Button
            variant="outline"
            onClick={onReset}
            className="flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>

          <Button
            variant="secondary"
            onClick={onGenerateNewMaze}
            disabled={isRunning}
            className="col-span-2 flex items-center justify-center gap-2"
          >
            <Grid className="h-4 w-4" />
            Generate New Maze
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="stat-card">
            <div className="text-xs text-muted-foreground">Visited</div>
            <div className="font-bold">{stats.visitedCount}</div>
          </div>
          <div className="stat-card">
            <div className="text-xs text-muted-foreground">Path Length</div>
            <div className="font-bold">{stats.pathLength || '-'}</div>
          </div>
          <div className="stat-card">
            <div className="text-xs text-muted-foreground">Time (ms)</div>
            <div className="font-bold">{stats.elapsedTime}</div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-xs text-center text-muted-foreground">
        <div>
          <span className="inline-block w-3 h-3 bg-maze-start rounded-sm mr-1"></span>
          Start 
          <span className="inline-block w-3 h-3 bg-maze-end rounded-sm ml-3 mr-1"></span>
          End
          <span className="inline-block w-3 h-3 bg-maze-visited rounded-sm ml-3 mr-1"></span>
          Visited
        </div>
        <div className="mt-1">
          <span className="inline-block w-3 h-3 bg-maze-visiting rounded-sm mr-1"></span>
          Visiting
          <span className="inline-block w-3 h-3 bg-maze-solution rounded-sm ml-3 mr-1"></span>
          Solution
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
