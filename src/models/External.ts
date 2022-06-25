export interface GameSetup {
  mode: string,
  elements?: number[],
  gridSize?: number,
}

export interface WindowWithGameMethods {
  game: {
    setup: (p: GameSetup) => void;
    setAreaSize: (width: number, height: number) => void;
    onGridChange?: (grid: number[][]) => void;
  }
}