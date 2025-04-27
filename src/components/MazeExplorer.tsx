
import React, { useState, useEffect, useRef } from "react";
import MazeGrid from "./MazeGrid";
import ControlPanel from "./ControlPanel";
import { generateMaze, resetMazeVisitation, MazeData, cloneMazeData } from "@/utils/mazeUtils";
import { 
  Algorithm, 
  AlgorithmGenerator,
  astar,
  bfs,
  dfs,
  dijkstra
} from "@/utils/pathfindingAlgorithms";
import { useToast } from "@/hooks/use-toast";

const MazeExplorer: React.FC = () => {
  const [mazeData, setMazeData] = useState<MazeData>(() => generateMaze(15, 15));
  const [mazeSize, setMazeSize] = useState<number>(15);
  const [algorithm, setAlgorithm] = useState<Algorithm>("astar");
  const [speed, setSpeed] = useState<number>(30);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [stats, setStats] = useState({
    visitedCount: 0,
    pathLength: 0,
    elapsedTime: 0,
  });

  const algorithmRef = useRef<AlgorithmGenerator | null>(null);
  const animationRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Generate a new maze when maze size changes
  useEffect(() => {
    if (!isRunning) {
      generateNewMaze();
    }
  }, [mazeSize]);

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const generateNewMaze = () => {
    const newMazeData = generateMaze(mazeSize, mazeSize);
    setMazeData(newMazeData);
    setIsDone(false);
    setStats({
      visitedCount: 0,
      pathLength: 0,
      elapsedTime: 0,
    });
    
    toast({
      title: "New Maze Generated",
      description: `Created a ${mazeSize}×${mazeSize} maze`,
    });
  };

  const handleStart = () => {
    if (isDone) {
      handleReset();
    }
    
    if (!algorithmRef.current) {
      // Initialize algorithm
      switch (algorithm) {
        case "bfs":
          algorithmRef.current = bfs(cloneMazeData(mazeData));
          break;
        case "dfs":
          algorithmRef.current = dfs(cloneMazeData(mazeData));
          break;
        case "astar":
          algorithmRef.current = astar(cloneMazeData(mazeData));
          break;
        case "dijkstra":
          algorithmRef.current = dijkstra(cloneMazeData(mazeData));
          break;
      }
    }
    
    setIsRunning(true);
    runAnimation();
  };

  const handlePause = () => {
    setIsRunning(false);
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  const handleReset = () => {
    handlePause();
    algorithmRef.current = null;
    setMazeData(resetMazeVisitation(mazeData));
    setIsDone(false);
    setStats({
      visitedCount: 0,
      pathLength: 0,
      elapsedTime: 0,
    });
  };

  const handleAlgorithmChange = (newAlgorithm: Algorithm) => {
    setAlgorithm(newAlgorithm);
    if (isRunning) {
      handleReset();
    }
  };

  const handleMazeSizeChange = (newSize: number) => {
    setMazeSize(newSize);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
  };

  const runAnimation = () => {
    if (!isRunning || !algorithmRef.current) return;

    const delayMs = Math.max(1, 101 - speed);
    
    const step = () => {
      if (!algorithmRef.current || !isRunning) return;
      
      const result = algorithmRef.current.next();
      
      if (result) {
        setMazeData({ 
          ...mazeData, 
          grid: result.grid 
        });
        
        setStats({
          visitedCount: result.visitedCount,
          pathLength: result.pathLength,
          elapsedTime: result.elapsedTime,
        });
        
        if (result.isDone) {
          setIsDone(true);
          setIsRunning(false);
          
          if (result.success) {
            toast({
              title: "Path Found!",
              description: `Found path in ${result.elapsedTime}ms with ${result.pathLength} steps`,
            });
          } else {
            toast({
              title: "No Path Found",
              description: "The maze has no valid solution",
              variant: "destructive",
            });
          }
          
          return;
        }
        
        setTimeout(() => {
          animationRef.current = requestAnimationFrame(step);
        }, delayMs);
      }
    };
    
    animationRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    if (isRunning) {
      runAnimation();
    }
  }, [isRunning, speed]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-full h-full">
      <div className="w-full lg:w-2/3 h-[400px] lg:h-auto">
        <MazeGrid mazeData={mazeData} />
      </div>
      <div className="w-full lg:w-1/3">
        <ControlPanel
          isRunning={isRunning}
          isDone={isDone}
          algorithm={algorithm}
          mazeSize={mazeSize}
          speed={speed}
          stats={stats}
          onAlgorithmChange={handleAlgorithmChange}
          onMazeSizeChange={handleMazeSizeChange}
          onSpeedChange={handleSpeedChange}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          onGenerateNewMaze={generateNewMaze}
        />
      </div>
    </div>
  );
};

export default MazeExplorer;
