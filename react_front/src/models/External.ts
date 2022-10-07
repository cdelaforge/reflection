import { DisplayMode, Teammate } from "../state/AppStateProvider";

export interface GameSetup {
  mode: DisplayMode,
  gridSize: number,
  elements?: number[],
  grid?: number[][],
  solution?: number[][],
  puzzle?: string[][],
  portals?: number[],
  transformations?: number,
  keepLock?: boolean;
}

export interface WindowWithGameMethods {
  game: {
    setSmart: (s: boolean) => void;
    setRunning: (r: boolean) => void;
    setup: (p: GameSetup) => number[][];
    setAreaSize: (width: number, height: number) => void;
    setTeam: (teams: Teammate[]) => void;
    onGridChange?: (grid: number[][]) => void;
    onPuzzleChange?: (puzzle: string[][]) => void;
    onPuzzleResolve?: (grid: number[][]) => void;
    onProgression?: (progression: number) => void;
    onStandaloneStart?: (grid: number[][], puzzle: string[][]) => void;
  }
}