import React, { useState, useEffect, useRef } from "react";
import MazeGrid from "./MazeGrid";
import ControlPanel from "./ControlPanel";
import { generateMaze, resetMazeVisitation, MazeData, cloneMazeData, ensurePathExists } from "@/utils/mazeUtils";
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
    // Generate maze with guaranteed path from start to end
    const newMazeData = generateMaze(mazeSize, mazeSize);
    // Ensure there is a valid path from start to end
    const validMaze = ensurePathExists(newMazeData);
    
    setMazeData(validMaze);
    setIsDone(false);
    setStats({
      visitedCount: 0,
      pathLength: 0,
      elapsedTime: 0,
    });
    
    toast({
      title: "New Maze Generated",
      description: `Created a ${mazeSize}×${mazeSize} maze with guaranteed solution`,
    });
  };

  const handleStart = () => {
    if (isDone) {
      handleReset();
    }
    
    if (!algorithmRef.current) {
      // Initialize algorithm
      const clonedMaze = cloneMazeData(mazeData);
      
      switch (algorithm) {
        case "bfs":
          algorithmRef.current = bfs(clonedMaze);
          break;
        case "dfs":
          algorithmRef.current = dfs(clonedMaze);
          break;
        case "astar":
          algorithmRef.current = astar(clonedMaze);
          break;
        case "dijkstra":
          algorithmRef.current = dijkstra(clonedMaze);
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
    } else if (isDone) {
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
      
      try {
        const result = algorithmRef.current.next();
        
        if (result) {
          // Important: Properly update the maze data to include the solution path
          setMazeData(prevMazeData => ({ 
            ...prevMazeData, 
            grid: result.grid 
          }));
          
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
                description: "The algorithm couldn't find a path to the end",
                variant: "destructive",
              });
              // Try regenerating a valid maze
              if (!isRunning) {
                setTimeout(() => {
                  toast({
                    title: "Generating New Maze",
                    description: "Creating a maze with a guaranteed path",
                  });
                  generateNewMaze();
                }, 2000);
              }
            }
            
            return;
          }
          
          setTimeout(() => {
            animationRef.current = requestAnimationFrame(step);
          }, delayMs);
        }
      } catch (error) {
        console.error("Error in animation step:", error);
        setIsRunning(false);
        toast({
          title: "Error",
          description: "An error occurred during pathfinding",
          variant: "destructive",
        });
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
