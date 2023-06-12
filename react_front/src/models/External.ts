import { DisplayMode, Teammate } from "../state/AppStateProvider";

export interface GameSetup {
  mode: DisplayMode,
  gridSize: number,
  elements?: number[],
  grid?: number[][],
  lockedCells?: boolean[][],
  solution?: number[][],
  puzzle?: string[][],
  portals?: number[],
  transformations?: number,
}

export interface WindowWithGameMethods {
  game: {
    setSmart: (s: boolean) => void;
    setHoverDisplay: (s: boolean) => void;
    setSimplifiedDisplay: (s: boolean) => void;
    setRunning: (r: boolean) => void;
    setup: (p: GameSetup) => number[][];
    resetLockedCells: () => void;
    setAreaSize: (width: number, height: number) => void;
    setTeam: (teams: Teammate[]) => void;
    onGridChange?: (grid: number[][]) => void;
    onLockChange?: (grid: boolean[][]) => void;
    onPuzzleChange?: (puzzle: string[][]) => void;
    onPuzzleResolve?: (grid: number[][]) => void;
    onProgression?: (progression: number) => void;
    onStandaloneStart?: (grid: number[][], puzzle: string[][]) => void;
    getSeed: (grid: number[][]) => string;
    getGrid: (seed: string) => number[][];
    resetLaser: () => void;
    setPartialSolutionAllowed: (p: boolean) => void;
  }
}