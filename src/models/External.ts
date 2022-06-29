export interface GameSetup {
  mode: string,
  gridSize: number,
  elements?: number[],
  grid?: number[][],
  puzzle?: string[][],
}

export interface WindowWithGameMethods {
  game: {
    setRunning: (r: boolean) => void;
    setup: (p: GameSetup) => void;
    setAreaSize: (width: number, height: number) => void;
    onGridChange?: (grid: number[][]) => void;
    onPuzzleChange?: (puzzle: string[][]) => void;
    onPuzzleResolve?: (grid: number[][]) => void;
    onProgression?: (progression: number) => void;
  }
}