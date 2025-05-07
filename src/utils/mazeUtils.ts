// Cell types for the maze
export enum CellType {
  WALL = 'wall',
  PATH = 'path',
  START = 'start',
  END = 'end',
  VISITED = 'visited',
  VISITING = 'visiting',
  SOLUTION = 'solution',
  ALTERNATE_PATH = 'alternate-path',  // Add new type for alternate paths
}

// Position interface
export interface Position {
  row: number;
  col: number;
}

// Cell interface
export interface Cell {
  type: CellType;
  position: Position;
  visited: boolean;
  parent?: Position;
  isStart: boolean;
  isEnd: boolean;
  g?: number; // Cost from start to current cell
  h?: number; // Heuristic cost from current cell to end
  f?: number; // g + h
}

export interface MazeData {
  grid: Cell[][];
  startPosition: Position;
  endPosition: Position;
  width: number;
  height: number;
}

// Create an empty maze with all walls
export const createEmptyMaze = (width: number, height: number): MazeData => {
  const grid: Cell[][] = [];
  
  for (let row = 0; row < height; row++) {
    const currentRow: Cell[] = [];
    for (let col = 0; col < width; col++) {
      currentRow.push({
        type: CellType.WALL,
        position: { row, col },
        visited: false,
        isStart: false,
        isEnd: false,
      });
    }
    grid.push(currentRow);
  }

  // Default start position
  const startPosition = { row: 0, col: 0 };
  
  // Set start cell
  grid[startPosition.row][startPosition.col] = {
    type: CellType.START,
    position: startPosition,
    visited: false,
    isStart: true,
    isEnd: false,
  };

  // Initialize with a temporary end position - this will be replaced
  const endPosition = { row: height - 1, col: width - 1 };

  return {
    grid,
    startPosition,
    endPosition,
    width,
    height,
  };
};


// Generate a maze using recursive backtracking algorithm
export const generateMaze = (width: number, height: number): MazeData => {
  // Initialize with all walls
  const mazeData = createEmptyMaze(width, height);
  const { grid, startPosition, endPosition } = mazeData;
  
  // Helper function to get unvisited neighbors
  const getUnvisitedNeighbors = (position: Position): Position[] => {
    const { row, col } = position;
    const neighbors: Position[] = [];
    const directions = [
      { row: row - 2, col }, // Up
      { row: row + 2, col }, // Down
      { row, col: col - 2 }, // Left
      { row, col: col + 2 }, // Right
    ];

    for (const dir of directions) {
      if (
        dir.row >= 0 && dir.row < height &&
        dir.col >= 0 && dir.col < width &&
        grid[dir.row][dir.col].type === CellType.WALL
      ) {
        neighbors.push(dir);
      }
    }

    return neighbors;
  };

  // Recursive function to carve paths
  const carvePath = (position: Position) => {
    const { row, col } = position;
    
    // Mark current cell as path
    if (!grid[row][col].isStart && !grid[row][col].isEnd) {
      grid[row][col].type = CellType.PATH;
    }
    
    // Get unvisited neighbors
    let neighbors = getUnvisitedNeighbors(position);
    
    // Shuffle neighbors for randomness
    neighbors = neighbors.sort(() => Math.random() - 0.5);
    
    for (const neighbor of neighbors) {
      if (grid[neighbor.row][neighbor.col].type === CellType.WALL) {
        // Calculate the position of the cell between current and neighbor
        const midRow = row + (neighbor.row - row) / 2;
        const midCol = col + (neighbor.col - col) / 2;
        
        // Carve path in the middle cell
        grid[midRow][midCol].type = CellType.PATH;
        
        // Continue carving from the neighbor
        carvePath(neighbor);
      }
    }
  };

  // Start carving from the start position
  carvePath(startPosition);
  
  // Ensure end position is a path
  grid[endPosition.row][endPosition.col].type = CellType.END;
  
  return mazeData;
};

// Check if a path exists between start and end positions
export const ensurePathExists = (mazeData: MazeData): MazeData => {
  const { grid, startPosition, endPosition } = mazeData;
  const queue: Position[] = [startPosition];
  const visited: boolean[][] = Array(grid.length).fill(0).map(() => Array(grid[0].length).fill(false));
  visited[startPosition.row][startPosition.col] = true;
  
  // Simple BFS to check if end is reachable
  while (queue.length > 0) {
    const current = queue.shift()!;
    const { row, col } = current;
    
    if (row === endPosition.row && col === endPosition.col) {
      // Path exists, return maze as is
      return mazeData;
    }
    
    const directions = [
      { row: row - 1, col }, // Up
      { row, col: col + 1 }, // Right
      { row: row + 1, col }, // Down
      { row, col: col - 1 }, // Left
    ];
    
    for (const dir of directions) {
      if (
        isValidPosition(grid, dir) && 
        !visited[dir.row][dir.col]
      ) {
        visited[dir.row][dir.col] = true;
        queue.push(dir);
      }
    }
  }
  
  // If we get here, no path exists, so create one
  return createPathToEnd(mazeData);
};

// Create a direct path from start to end if none exists
const createPathToEnd = (mazeData: MazeData): MazeData => {
  const { grid, startPosition, endPosition } = cloneMazeData(mazeData);
  let current: Position = { ...startPosition };
  
  // Create a zigzag path from start to end
  while (current.row !== endPosition.row || current.col !== endPosition.col) {
    // Move horizontally first
    if (current.col < endPosition.col) {
      current.col++;
    } else if (current.col > endPosition.col) {
      current.col--;
    }
    // Then move vertically
    else if (current.row < endPosition.row) {
      current.row++;
    } else if (current.row > endPosition.row) {
      current.row--;
    }
    
    // Carve the path
    if (!grid[current.row][current.col].isStart && !grid[current.row][current.col].isEnd) {
      grid[current.row][current.col].type = CellType.PATH;
    }
  }
  
  return { ...mazeData, grid };
};

// Calculate the Manhattan distance between two positions
export const manhattanDistance = (pos1: Position, pos2: Position): number => {
  return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
};

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

// Reconstruct path from start to end
export const reconstructPath = (grid: Cell[][], end: Position): Position[] => {
  const path: Position[] = [];
  let current: Position | undefined = end;
  
  while (current) {
    path.unshift(current);
    const cell = grid[current.row][current.col];
    current = cell.parent;
  }
  
  return path;
};
