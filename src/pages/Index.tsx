
import React from "react";
import MazeExplorer from "@/components/MazeExplorer";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-maze bg-clip-text text-transparent">
            Maze Quest: Explorer AI
          </h1>
          <p className="text-muted-foreground">
            Watch algorithms solve puzzling mazes in real-time!
          </p>
        </header>
        
        <div className="h-[800px] max-h-[80vh]">
          <MazeExplorer />
        </div>
        
        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Explore different algorithms to see how they navigate through the maze. 
            Generate new mazes and control the animation speed.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
