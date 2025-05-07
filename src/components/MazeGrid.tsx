import React from "react";
import { CellType, MazeData } from "@/utils/maze";

interface MazeGridProps {
  mazeData: MazeData;
}

const MazeGrid: React.FC<MazeGridProps> = ({ mazeData }) => {
  const { grid } = mazeData;

  return (
    <div className="w-full h-full overflow-hidden rounded-xl border border-border bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg">
      <div 
        className="grid h-full w-full" 
        style={{ 
          gridTemplateRows: `repeat(${grid.length}, 1fr)`,
          gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`,
          aspectRatio: grid[0].length / grid.length,
          gap: '1px',
          padding: '1px',
          backgroundColor: '#e2e8f0'
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                cell
                ${cell.type === CellType.WALL ? 'bg-slate-800' : 'bg-white'}
                ${cell.type === CellType.VISITED ? 'bg-blue-100' : ''}
                ${cell.type === CellType.VISITING ? 'bg-purple-100' : ''}
                ${cell.type === CellType.SOLUTION ? 'bg-yellow-200' : ''}
                ${cell.type === CellType.ALTERNATE_PATH ? 'bg-green-200' : ''}
                transition-colors duration-100
              `}
              title={`${rowIndex}, ${colIndex} - ${cell.type}`}
            >
              {cell.isStart && (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse shadow-lg"></div>
                </div>
              )}
              {cell.isEnd && (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-red-500 shadow-lg"></div>
                </div>
              )}
              {cell.type === CellType.VISITING && !cell.isStart && !cell.isEnd && (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse"></div>
                </div>
              )}
              {cell.type === CellType.SOLUTION && !cell.isStart && !cell.isEnd && (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                </div>
              )}
              {cell.type === CellType.ALTERNATE_PATH && !cell.isStart && !cell.isEnd && (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
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
