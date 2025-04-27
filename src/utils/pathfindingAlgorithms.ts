
import { Cell, CellType, MazeData, Position, isValidPosition, manhattanDistance } from "./mazeUtils";

export type Algorithm = "bfs" | "dfs" | "astar" | "dijkstra";

export interface AlgorithmStep {
  grid: Cell[][];
  visitedCount: number;
  pathLength: number;
  elapsedTime: number;
  isDone: boolean;
  success: boolean;
}

export interface AlgorithmGenerator {
  next: () => AlgorithmStep | null;
  isDone: () => boolean;
  success: () => boolean;
}

// Breadth First Search
export const bfs = (mazeData: MazeData): AlgorithmGenerator => {
  const { grid, startPosition, endPosition } = mazeData;
  const queue: Position[] = [startPosition];
  const visitedCount = 0;
  let isDone = false;
  let success = false;
  let startTime = Date.now();
  
  // Mark start position as visited
  grid[startPosition.row][startPosition.col].visited = true;
  grid[startPosition.row][startPosition.col].type = CellType.VISITING;
  
  return {
    next: () => {
      if (isDone || queue.length === 0) {
        isDone = true;
        return null;
      }
      
      const current = queue.shift()!;
      const { row, col } = current;
      
      // Check if reached the end
      if (row === endPosition.row && col === endPosition.col) {
        const path = reconstructPath();
        isDone = true;
        success = true;
        return {
          grid: [...grid], // Clone grid
          visitedCount: countVisited(),
          pathLength: path.length,
          elapsedTime: Date.now() - startTime,
          isDone,
          success
        };
      }
      
      // Mark current as visited
      if (!grid[row][col].isStart && !grid[row][col].isEnd) {
        grid[row][col].type = CellType.VISITED;
      }
      
      // Explore neighbors (up, right, down, left)
      const directions = [
        { row: row - 1, col }, // Up
        { row, col: col + 1 }, // Right
        { row: row + 1, col }, // Down
        { row, col: col - 1 }, // Left
      ];
      
      for (const dir of directions) {
        if (isValidPosition(grid, dir) && !grid[dir.row][dir.col].visited) {
          grid[dir.row][dir.col].visited = true;
          grid[dir.row][dir.col].parent = current;
          
          if (!grid[dir.row][dir.col].isEnd) {
            grid[dir.row][dir.col].type = CellType.VISITING;
          }
          
          queue.push(dir);
        }
      }
      
      return {
        grid: [...grid], // Clone grid
        visitedCount: countVisited(),
        pathLength: 0, // Path not found yet
        elapsedTime: Date.now() - startTime,
        isDone,
        success
      };
    },
    isDone: () => isDone,
    success: () => success
  };
  
  // Helper functions
  function countVisited(): number {
    let count = 0;
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c].visited) {
          count++;
        }
      }
    }
    return count;
  }
  
  function reconstructPath(): Position[] {
    const path: Position[] = [];
    let current: Position | undefined = endPosition;
    
    while (current) {
      path.unshift(current);
      const cell = grid[current.row][current.col];
      current = cell.parent;
      
      if (current && !grid[current.row][current.col].isStart && 
          !grid[current.row][current.col].isEnd) {
        grid[current.row][current.col].type = CellType.SOLUTION;
      }
    }
    
    return path;
  }
};

// Depth First Search
export const dfs = (mazeData: MazeData): AlgorithmGenerator => {
  const { grid, startPosition, endPosition } = mazeData;
  const stack: Position[] = [startPosition];
  let visitedCount = 0;
  let isDone = false;
  let success = false;
  let startTime = Date.now();
  
  // Mark start position as visited
  grid[startPosition.row][startPosition.col].visited = true;
  grid[startPosition.row][startPosition.col].type = CellType.VISITING;
  
  return {
    next: () => {
      if (isDone || stack.length === 0) {
        isDone = true;
        return null;
      }
      
      const current = stack.pop()!;
      const { row, col } = current;
      
      // Check if reached the end
      if (row === endPosition.row && col === endPosition.col) {
        const path = reconstructPath();
        isDone = true;
        success = true;
        return {
          grid: [...grid], // Clone grid
          visitedCount: countVisited(),
          pathLength: path.length,
          elapsedTime: Date.now() - startTime,
          isDone,
          success
        };
      }
      
      // Mark current as visited
      if (!grid[row][col].isStart && !grid[row][col].isEnd) {
        grid[row][col].type = CellType.VISITED;
      }
      visitedCount++;
      
      // Explore neighbors (in reverse order: left, down, right, up)
      const directions = [
        { row, col: col - 1 }, // Left
        { row: row + 1, col }, // Down
        { row, col: col + 1 }, // Right
        { row: row - 1, col }, // Up
      ];
      
      for (const dir of directions) {
        if (isValidPosition(grid, dir) && !grid[dir.row][dir.col].visited) {
          grid[dir.row][dir.col].visited = true;
          grid[dir.row][dir.col].parent = current;
          
          if (!grid[dir.row][dir.col].isEnd) {
            grid[dir.row][dir.col].type = CellType.VISITING;
          }
          
          stack.push(dir);
        }
      }
      
      return {
        grid: [...grid], // Clone grid
        visitedCount,
        pathLength: 0, // Path not found yet
        elapsedTime: Date.now() - startTime,
        isDone,
        success
      };
    },
    isDone: () => isDone,
    success: () => success
  };
  
  // Helper functions
  function countVisited(): number {
    let count = 0;
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c].visited) {
          count++;
        }
      }
    }
    return count;
  }
  
  function reconstructPath(): Position[] {
    const path: Position[] = [];
    let current: Position | undefined = endPosition;
    
    while (current) {
      path.unshift(current);
      const cell = grid[current.row][current.col];
      current = cell.parent;
      
      if (current && !grid[current.row][current.col].isStart && 
          !grid[current.row][current.col].isEnd) {
        grid[current.row][current.col].type = CellType.SOLUTION;
      }
    }
    
    return path;
  }
};

// A* Search Algorithm
export const astar = (mazeData: MazeData): AlgorithmGenerator => {
  const { grid, startPosition, endPosition } = mazeData;
  const openSet: Position[] = [startPosition];
  const closedSet: Record<string, boolean> = {};
  let visitedCount = 0;
  let isDone = false;
  let success = false;
  let startTime = Date.now();
  
  // Initialize start node
  const startCell = grid[startPosition.row][startPosition.col];
  startCell.g = 0;
  startCell.h = manhattanDistance(startPosition, endPosition);
  startCell.f = startCell.h;
  startCell.visited = true;
  startCell.type = CellType.VISITING;
  
  return {
    next: () => {
      if (isDone || openSet.length === 0) {
        isDone = true;
        return null;
      }
      
      // Find the node with the lowest f value
      let lowestIndex = 0;
      for (let i = 0; i < openSet.length; i++) {
        const { row, col } = openSet[i];
        const { row: lRow, col: lCol } = openSet[lowestIndex];
        if (grid[row][col].f! < grid[lRow][lCol].f!) {
          lowestIndex = i;
        }
      }
      
      const current = openSet[lowestIndex];
      const { row, col } = current;
      
      // Check if reached the end
      if (row === endPosition.row && col === endPosition.col) {
        const path = reconstructPath();
        isDone = true;
        success = true;
        return {
          grid: [...grid], // Clone grid
          visitedCount: countVisited(),
          pathLength: path.length,
          elapsedTime: Date.now() - startTime,
          isDone,
          success
        };
      }
      
      // Remove current from openSet
      openSet.splice(lowestIndex, 1);
      
      // Add current to closedSet
      closedSet[`${row},${col}`] = true;
      
      // Mark as visited
      if (!grid[row][col].isStart && !grid[row][col].isEnd) {
        grid[row][col].type = CellType.VISITED;
      }
      visitedCount++;
      
      // Check all neighbors
      const directions = [
        { row: row - 1, col }, // Up
        { row, col: col + 1 }, // Right
        { row: row + 1, col }, // Down
        { row, col: col - 1 }, // Left
      ];
      
      for (const dir of directions) {
        if (!isValidPosition(grid, dir) || closedSet[`${dir.row},${dir.col}`]) {
          continue;
        }
        
        const neighbor = grid[dir.row][dir.col];
        const tentativeG = grid[row][col].g! + 1;
        
        if (!openSet.some(p => p.row === dir.row && p.col === dir.col)) {
          openSet.push(dir);
          neighbor.visited = true;
          if (!neighbor.isEnd) {
            neighbor.type = CellType.VISITING;
          }
        } else if (tentativeG >= neighbor.g!) {
          continue;
        }
        
        // This path is better, record it
        neighbor.parent = current;
        neighbor.g = tentativeG;
        neighbor.h = manhattanDistance(dir, endPosition);
        neighbor.f = neighbor.g + neighbor.h;
      }
      
      return {
        grid: [...grid], // Clone grid
        visitedCount,
        pathLength: 0, // Path not found yet
        elapsedTime: Date.now() - startTime,
        isDone,
        success
      };
    },
    isDone: () => isDone,
    success: () => success
  };
  
  // Helper functions
  function countVisited(): number {
    let count = 0;
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c].visited) {
          count++;
        }
      }
    }
    return count;
  }
  
  function reconstructPath(): Position[] {
    const path: Position[] = [];
    let current: Position | undefined = endPosition;
    
    while (current) {
      path.unshift(current);
      const cell = grid[current.row][current.col];
      current = cell.parent;
      
      if (current && !grid[current.row][current.col].isStart && 
          !grid[current.row][current.col].isEnd) {
        grid[current.row][current.col].type = CellType.SOLUTION;
      }
    }
    
    return path;
  }
};

// Dijkstra's algorithm
export const dijkstra = (mazeData: MazeData): AlgorithmGenerator => {
  const { grid, startPosition, endPosition } = mazeData;
  const queue: Position[] = [startPosition];
  let visitedCount = 0;
  let isDone = false;
  let success = false;
  let startTime = Date.now();
  
  // Initialize distances
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      grid[r][c].g = Infinity;
    }
  }
  
  // Start node has distance 0
  grid[startPosition.row][startPosition.col].g = 0;
  grid[startPosition.row][startPosition.col].visited = true;
  grid[startPosition.row][startPosition.col].type = CellType.VISITING;
  
  return {
    next: () => {
      if (isDone || queue.length === 0) {
        isDone = true;
        return null;
      }
      
      // Find node with minimum distance
      let minIndex = 0;
      for (let i = 0; i < queue.length; i++) {
        const { row, col } = queue[i];
        const { row: minRow, col: minCol } = queue[minIndex];
        if (grid[row][col].g! < grid[minRow][minCol].g!) {
          minIndex = i;
        }
      }
      
      const current = queue[minIndex];
      queue.splice(minIndex, 1);
      const { row, col } = current;
      
      // Check if reached the end
      if (row === endPosition.row && col === endPosition.col) {
        const path = reconstructPath();
        isDone = true;
        success = true;
        return {
          grid: [...grid], // Clone grid
          visitedCount: countVisited(),
          pathLength: path.length,
          elapsedTime: Date.now() - startTime,
          isDone,
          success
        };
      }
      
      // Mark current as visited
      if (!grid[row][col].isStart && !grid[row][col].isEnd) {
        grid[row][col].type = CellType.VISITED;
      }
      visitedCount++;
      
      // Check neighbors
      const directions = [
        { row: row - 1, col }, // Up
        { row, col: col + 1 }, // Right
        { row: row + 1, col }, // Down
        { row, col: col - 1 }, // Left
      ];
      
      for (const dir of directions) {
        if (isValidPosition(grid, dir)) {
          const neighbor = grid[dir.row][dir.col];
          const newDist = grid[row][col].g! + 1;
          
          if (newDist < neighbor.g!) {
            neighbor.g = newDist;
            neighbor.parent = current;
            
            if (!neighbor.visited) {
              queue.push(dir);
              neighbor.visited = true;
              
              if (!neighbor.isEnd) {
                neighbor.type = CellType.VISITING;
              }
            }
          }
        }
      }
      
      return {
        grid: [...grid], // Clone grid
        visitedCount,
        pathLength: 0, // Path not found yet
        elapsedTime: Date.now() - startTime,
        isDone,
        success
      };
    },
    isDone: () => isDone,
    success: () => success
  };
  
  // Helper functions
  function countVisited(): number {
    let count = 0;
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c].visited) {
          count++;
        }
      }
    }
    return count;
  }
  
  function reconstructPath(): Position[] {
    const path: Position[] = [];
    let current: Position | undefined = endPosition;
    
    while (current) {
      path.unshift(current);
      const cell = grid[current.row][current.col];
      current = cell.parent;
      
      if (current && !grid[current.row][current.col].isStart && 
          !grid[current.row][current.col].isEnd) {
        grid[current.row][current.col].type = CellType.SOLUTION;
      }
    }
    
    return path;
  }
};
