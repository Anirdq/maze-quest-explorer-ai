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

// Update reconstructPath to find multiple paths
export const findMultiplePaths = (grid: Cell[][], start: Position, end: Position, maxPaths: number = 3): Position[][] => {
  const paths: Position[][] = [];
  const visited = new Set<string>();
  
  const dfs = (current: Position, path: Position[]) => {
    if (paths.length >= maxPaths) return;
    
    const key = `${current.row},${current.col}`;
    if (visited.has(key)) return;
    visited.add(key);
    
    path.push({...current});
    
    if (current.row === end.row && current.col === end.col) {
      paths.push([...path]);
      visited.delete(key); // Allow this endpoint in other paths
      return;
    }
    
    // Use different search orders for each path attempt to find diverse paths
    const directions = [
      { row: current.row - 1, col: current.col }, // Up
      { row: current.row, col: current.col + 1 }, // Right
      { row: current.row + 1, col: current.col }, // Down
      { row: current.row, col: current.col - 1 }, // Left
    ];
    
    // Shuffle the directions slightly differently based on path length
    // This helps find more diverse paths
    if (path.length % 4 === 0) {
      directions.reverse();
    } else if (path.length % 3 === 0) {
      [directions[0], directions[3]] = [directions[3], directions[0]];
    } else if (path.length % 2 === 0) {
      [directions[1], directions[2]] = [directions[2], directions[1]];
    }
    
    for (const next of directions) {
      if (isValidPosition(grid, next) && !visited.has(`${next.row},${next.col}`)) {
        dfs(next, [...path]);
      }
    }
    
    // Backtrack
    visited.delete(key);
  };
  
  dfs(start, []);
  
  // If we didn't find enough paths, try again with different heuristics
  if (paths.length < 2 && grid.length > 5 && grid[0].length > 5) {
    // Try a breadth-first approach to find some other paths
    const queue: {pos: Position, path: Position[]}[] = [{pos: start, path: [start]}];
    const bfsVisited = new Set<string>();
    bfsVisited.add(`${start.row},${start.col}`);
    
    while (queue.length > 0 && paths.length < maxPaths) {
      const {pos, path} = queue.shift()!;
      
      if (pos.row === end.row && pos.col === end.col) {
        // If this path is significantly different from existing paths, add it
        if (!paths.some(existingPath => 
            pathSimilarity(existingPath, path) > 0.7)) {
          paths.push(path);
        }
        continue;
      }
      
      const directions = [
        { row: pos.row - 1, col: pos.col }, // Up
        { row: pos.row, col: pos.col + 1 }, // Right
        { row: pos.row + 1, col: pos.col }, // Down
        { row: pos.row, col: pos.col - 1 }, // Left
      ];
      
      for (const next of directions) {
        const nextKey = `${next.row},${next.col}`;
        if (isValidPosition(grid, next) && !bfsVisited.has(nextKey)) {
          bfsVisited.add(nextKey);
          queue.push({
            pos: next,
            path: [...path, next]
          });
        }
      }
    }
  }
  
  // Sort paths by length and unique characteristics
  return paths.sort((a, b) => {
    // First by length
    if (a.length !== b.length) return a.length - b.length;
    
    // Then by how many turns they make (prefer paths with fewer turns)
    return countTurns(a) - countTurns(b);
  });
};

// Helper function to count turns in a path
const countTurns = (path: Position[]): number => {
  let turns = 0;
  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i-1];
    const curr = path[i];
    const next = path[i+1];
    
    const dx1 = curr.col - prev.col;
    const dy1 = curr.row - prev.row;
    const dx2 = next.col - curr.col;
    const dy2 = next.row - curr.row;
    
    // If direction changes, it's a turn
    if (dx1 !== dx2 || dy1 !== dy2) {
      turns++;
    }
  }
  return turns;
};

// Helper function to calculate path similarity (0-1 scale)
const pathSimilarity = (path1: Position[], path2: Position[]): number => {
  const set1 = new Set(path1.map(p => `${p.row},${p.col}`));
  const set2 = new Set(path2.map(p => `${p.row},${p.col}`));
  
  // Count common cells
  let commonCells = 0;
  for (const cell of set1) {
    if (set2.has(cell)) commonCells++;
  }
  
  // Similarity is proportion of common cells
  return commonCells / Math.max(set1.size, set2.size);
};
