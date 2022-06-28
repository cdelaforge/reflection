export interface GameSetup {
  mode: string,
  gridSize: number,
  elements?: number[],
  grid?: number[][],
}

export interface WindowWithGameMethods {
  game: {
    setup: (p: GameSetup) => void;
    setAreaSize: (width: number, height: number) => void;
    onGridChange?: (grid: number[][]) => void;
  }
}