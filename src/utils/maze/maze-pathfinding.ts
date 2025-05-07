
import { Cell, Position } from './maze-types';

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

// Check if a position is valid (within grid and not a wall)
function isValidPosition(grid: Cell[][], position: Position): boolean {
  const { row, col } = position;
  return (
    row >= 0 &&
    row < grid.length &&
    col >= 0 &&
    col < grid[0].length &&
    grid[row][col].type !== 'wall'
  );
}
