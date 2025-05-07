
import { Cell, Position, CellType, MazeData } from './maze-types';

// Check if a position is valid (within grid and not a wall)
export const isValidPosition = (grid: Cell[][], position: Position): boolean => {
  const { row, col } = position;
  return (
    row >= 0 &&
    row < grid.length &&
    col >= 0 &&
    col < grid[0].length &&
    grid[row][col].type !== CellType.WALL
  );
};

// Calculate the Manhattan distance between two positions
export const manhattanDistance = (pos1: Position, pos2: Position): number => {
  return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
};

// Deep clone the maze data
export const cloneMazeData = (mazeData: MazeData): MazeData => {
  const { grid, startPosition, endPosition, width, height } = mazeData;
  const newGrid: Cell[][] = [];
  
  for (let row = 0; row < grid.length; row++) {
    const currentRow: Cell[] = [];
    for (let col = 0; col < grid[row].length; col++) {
      currentRow.push({
        ...grid[row][col],
        parent: grid[row][col].parent ? { ...grid[row][col].parent } : undefined,
      });
    }
    newGrid.push(currentRow);
  }
  
  return {
    grid: newGrid,
    startPosition: { ...startPosition },
    endPosition: { ...endPosition },
    width,
    height,
  };
};

// Reset maze visitation state without affecting walls and paths
export const resetMazeVisitation = (mazeData: MazeData): MazeData => {
  const clonedData = cloneMazeData(mazeData);
  const { grid } = clonedData;
  
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const cell = grid[row][col];
      cell.visited = false;
      cell.parent = undefined;
      cell.g = undefined;
      cell.h = undefined;
      cell.f = undefined;
      
      if (cell.type === CellType.VISITED || cell.type === CellType.VISITING || cell.type === CellType.SOLUTION) {
        if (cell.isStart) {
          cell.type = CellType.START;
        } else if (cell.isEnd) {
          cell.type = CellType.END;
        } else {
          cell.type = CellType.PATH;
        }
      }
    }
  }
  
  return clonedData;
};
