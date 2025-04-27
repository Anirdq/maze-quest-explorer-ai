
import React from "react";
import { CellType, MazeData } from "@/utils/mazeUtils";

interface MazeGridProps {
  mazeData: MazeData;
}

const MazeGrid: React.FC<MazeGridProps> = ({ mazeData }) => {
  const { grid } = mazeData;

  return (
    <div className="w-full h-full overflow-hidden rounded-xl border border-border bg-white shadow-lg">
      <div 
        className="grid h-full w-full" 
        style={{ 
          gridTemplateRows: `repeat(${grid.length}, 1fr)`,
          gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`,
          aspectRatio: grid[0].length / grid.length
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`cell cell-${cell.type}`}
              data-type={cell.type}
              title={`${rowIndex}, ${colIndex} - ${cell.type}`}
            >
              {cell.isStart && (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
                </div>
              )}
              {cell.isEnd && (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white"></div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MazeGrid;
