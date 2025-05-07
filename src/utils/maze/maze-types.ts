
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
