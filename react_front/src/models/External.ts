import { Teammate } from "../state/AppStateProvider";

export interface GameSetup {
  mode: string,
  gridSize: number,
  elements?: number[],
  grid?: number[][],
  solution?: number[][],
  puzzle?: string[][],
  portals?: number[]
}

export interface WindowWithGameMethods {
  game: {
    setRunning: (r: boolean) => void;
    setup: (p: GameSetup) => number[][];
    setAreaSize: (width: number, height: number) => void;
    setTeammateColor: (id: string, color: string) => void;
    setTeammateGrid: (id: string, grid?: number[][]) => void;
    onGridChange?: (grid: number[][]) => void;
    onPuzzleChange?: (puzzle: string[][]) => void;
    onPuzzleResolve?: (grid: number[][]) => void;
    onProgression?: (progression: number) => void;
    onStandaloneStart?: (grid: number[][], puzzle: string[][]) => void;
  }
}