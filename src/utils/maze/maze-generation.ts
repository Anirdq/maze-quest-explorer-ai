
import { Cell, CellType, MazeData, Position } from './maze-types';
import { cloneMazeData, isValidPosition } from './maze-core';

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

// Generate a maze using recursive backtracking algorithm with multiple paths
export const generateMaze = (width: number, height: number): MazeData => {
  // Initialize with all walls
  const mazeData = createEmptyMaze(width, height);
  const { grid, startPosition } = mazeData;
  
  // Define potential end positions (one of the corners, but not where the start is)
  const potentialEndPositions = [
    { row: 0, col: width - 1 },           // top-right
    { row: height - 1, col: 0 },          // bottom-left
    { row: height - 1, col: width - 1 },  // bottom-right
  ];
  
  // Remove the start position if it's one of these corners
  const filteredPositions = potentialEndPositions.filter(
    pos => !(pos.row === startPosition.row && pos.col === startPosition.col)
  );
  
  // Choose one of the remaining corners as the end position
  const endPosition = filteredPositions[Math.floor(Math.random() * filteredPositions.length)];
  
  // Set the end cell
  grid[endPosition.row][endPosition.col] = {
    type: CellType.END,
    position: endPosition,
    visited: false,
    isStart: false,
    isEnd: true,
  };
  
  // Update the end position in the maze data
  mazeData.endPosition = endPosition;
  
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
  
  // Add additional openings to create multiple paths - significantly increased for complexity
  const additionalPaths = Math.floor(width * height * 0.15); // Adding ~15% more openings (increased from 5%)
  
  for (let i = 0; i < additionalPaths; i++) {
    // Select a random wall
    let row = Math.floor(Math.random() * (height - 2)) + 1;
    let col = Math.floor(Math.random() * (width - 2)) + 1;
    
    // Check if it's a wall
    if (grid[row][col].type === CellType.WALL) {
      // Check if it connects two paths (horizontally or vertically)
      // This helps ensure we're creating useful connections
      const hasHorizontalPathNeighbors = 
        (col > 0 && grid[row][col-1].type === CellType.PATH) &&
        (col < width - 1 && grid[row][col+1].type === CellType.PATH);
      
      const hasVerticalPathNeighbors = 
        (row > 0 && grid[row-1][col].type === CellType.PATH) &&
        (row < height - 1 && grid[row+1][col].type === CellType.PATH);
      
      // Also consider diagonal connections to create more interesting passages
      const hasDiagonalPathNeighbors =
        (row > 0 && col > 0 && grid[row-1][col-1].type === CellType.PATH) &&
        (row < height - 1 && col < width - 1 && grid[row+1][col+1].type === CellType.PATH);
      
      if (hasHorizontalPathNeighbors || hasVerticalPathNeighbors || hasDiagonalPathNeighbors) {
        grid[row][col].type = CellType.PATH;
      }
    }
  }
  
  // Create multiple possible endpoints or branches near the exit
  const endRow = endPosition.row;
  const endCol = endPosition.col;
  const endRegion = 3; // Size of region around the end to create multiple approaches
  
  for (let i = 0; i < 3; i++) { // Create 3 additional approach paths to end
    // Pick a random cell near the end
    const rRow = Math.max(0, Math.min(endRow - endRegion + Math.floor(Math.random() * endRegion * 2), height - 1));
    const rCol = Math.max(0, Math.min(endCol - endRegion + Math.floor(Math.random() * endRegion * 2), width - 1));
    
    // Create a path from this point to the end
    if (grid[rRow][rCol].type === CellType.PATH) {
      let r = rRow;
      let c = rCol;
      
      // Create a path toward the end
      while (r !== endRow || c !== endCol) {
        if (Math.random() < 0.5) {
          r = r < endRow ? r + 1 : (r > endRow ? r - 1 : r);
        } else {
          c = c < endCol ? c + 1 : (c > endCol ? c - 1 : c);
        }
        
        if (r >= 0 && r < height && c >= 0 && c < width && !grid[r][c].isStart) {
          grid[r][c].type = CellType.PATH;
        }
      }
    }
  }
  
  // Now, make sure there's a path adjacent to the end point
  const adjacentDirections = [
    { row: endRow - 1, col: endCol },  // Up
    { row: endRow, col: endCol + 1 },  // Right
    { row: endRow + 1, col: endCol },  // Down
    { row: endRow, col: endCol - 1 },  // Left
  ];
  
  // Find valid adjacent cells (within grid bounds)
  const validAdjacents = adjacentDirections.filter(
    dir => dir.row >= 0 && dir.row < height && dir.col >= 0 && dir.col < width
  );
  
  // Ensure at least one adjacent cell is a path
  let hasAdjacentPath = false;
  for (const adjacent of validAdjacents) {
    if (grid[adjacent.row][adjacent.col].type === CellType.PATH) {
      hasAdjacentPath = true;
      break;
    }
  }
  
  // If no adjacent path exists, create one
  if (!hasAdjacentPath && validAdjacents.length > 0) {
    // Choose a random adjacent cell and make it a path
    const randomAdjacent = validAdjacents[Math.floor(Math.random() * validAdjacents.length)];
    grid[randomAdjacent.row][randomAdjacent.col].type = CellType.PATH;
  }
  
  // Ensure there's a valid path
  return ensurePathExists(mazeData);
};
