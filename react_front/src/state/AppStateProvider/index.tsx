import React, { createContext, useContext, useState, useEffect } from 'react';
import { Checker } from "../../helpers/Checker";
import { SeedHelper } from "../../helpers/Seed";
import { WindowWithGameMethods, GameSetup } from "../../models/External";
import { LaserProps } from "../../models/Laser";

export interface Position {
  row?: number,
  col?: number,
  stockIndex?: number,
}

export interface Teammate {
  id: string,
  color: string,
  grid?: number[][],
}

export type DisplayMode = 'puzzleCreation' | 'play' | 'empty' | 'solution' | 'solutionOnly' | 'view' | 'standalone' | 'resting';

export interface IStateContext {
  mode: DisplayMode;

  /* config */
  squaresCount: number;
  elementsCount: number;

  /* display */
  displayMode: string;
  gridSize: number;
  cellSize: number;

  /* stock state */
  elements: number[];
  stock: number[];
  stockIndex?: number;
  smart: boolean;
  simplifiedDisplay: boolean;
  setStockIndex: (index?: number) => void;

  /* grid state */
  grid: number[][];
  setGridElement: (row: number, col: number) => void;
  moveGridElement: (source: Position, destination: Position) => void;
  solution?: number[][];

  lock: boolean[][];
  lockCell: (row: number, col: number, val: boolean) => void;

  /* transformation */
  transformations: number;

  /* enigme */
  toSolve: string[][];
  result: string[][];
  running: boolean;
  won: boolean;

  /* laser */
  laserElements: LaserProps[],
  displayLaserPosition?: number,
  displayLaserIndex?: number,
  displayLaser: (position: number, index: number) => void,

  /* team data */
  team?: Teammate[],
}

export const StateContext = createContext<IStateContext>(null!);

const getGridDimensions = (squaresCount: number, areaWidth?: number, areaHeight?: number) => {
  const width = areaWidth || window.innerWidth;
  const height = areaHeight || window.innerHeight;

  const result = (width < height)
    ? { displayMode: "portrait", cellSize: Math.round((width * 0.96) / squaresCount) }
    : { displayMode: "landscape", cellSize: Math.round((height * 0.96) / squaresCount) }

  return { ...result, gridSize: result.cellSize * squaresCount };
};

const checker = new Checker();

const initGrid = (squaresCount: number, portals?: number[]) => {
  const iterator = new Array<number>(squaresCount).fill(0);
  const line = new Array<number>(squaresCount).fill(0);
  const grid = iterator.map((_) => [...line]);

  try {
    if (portals && portals.length === 4) {
      grid[portals[0]][portals[1]] = 7;
      grid[portals[2]][portals[3]] = 7;
    }
  }
  catch (error) { }

  return grid;
};

const initLock = (squaresCount: number) => {
  const iterator = new Array<boolean>(squaresCount).fill(false);
  const line = new Array<boolean>(squaresCount).fill(false);
  return iterator.map((_) => [...line]);
};

const initPuzzle = (squaresCount: number, mode?: string, elements?: number[], portals?: number[]) => {
  let toSolve = [
    new Array<string>(squaresCount).fill(''),
    new Array<string>(squaresCount).fill(''),
    new Array<string>(squaresCount).fill(''),
    new Array<string>(squaresCount).fill('')
  ];

  if (mode === "standalone" && elements) {
    const grid = initGrid(squaresCount, portals);

    for (let index = 0; index < elements.length;) {
      const row = Math.floor(Math.random() * squaresCount);
      const col = Math.floor(Math.random() * squaresCount);

      if (grid[row][col] === 0) {
        grid[row][col] = elements[index];
        ++index;
      }
    }

    toSolve = checker.checkGrid(grid, toSolve);

    const w: WindowWithGameMethods = window as any;
    if (w.game.onStandaloneStart) {
      w.game.onStandaloneStart(grid, toSolve);
    }
  }

  return toSolve;
};

const initialData: IStateContext = {
  mode: 'play',
  squaresCount: 8,
  elementsCount: 15,
  smart: true,
  simplifiedDisplay: false,
  elements: [],
  stock: [1, 1, 2, 2, 2, 2, 3, 4, 4, 5, 5, 6, 6, 7, 7],
  grid: initGrid(8),
  lock: initLock(8),
  toSolve: [
    ["3a", "7r", "2a", "9s", "5s", "11s", "23r", "3s"],
    ["1r", "11s", "3s", "8s", "8s", "5a", "3r", "1r"],
    ["6a", "9r", "7a", "3r", "3r", "18a", "5s", "1r"],
    ["15r", "3a", "1a", "8s", "8s", "9s", "7r", "15r"],
  ],
  result: [[]],
  setStockIndex: () => { },
  setGridElement: () => { },
  lockCell: () => { },
  moveGridElement: () => { },
  laserElements: [],
  displayLaser: () => { },
  running: true,
  won: false,
  transformations: 0,
  ...getGridDimensions(10),
};

const getElements = (grid: number[][], stock: number[]) => {
  const map = new Set<number>();
  grid.flat(2).filter(elt => elt > 0 && elt !== 7).forEach(elt => map.add(elt));
  stock.filter(elt => elt !== 7).forEach(elt => map.add(elt));
  return Array.from(map);
};

export function AppStateProvider(props: React.PropsWithChildren<{}>) {
  const [mode, setMode] = useState(initialData.mode);
  const [squaresCount, setSquaresCount] = useState(initialData.squaresCount);
  const [elements, setElements] = useState(getElements(initialData.grid, initialData.stock));
  const [elementsCount, setElementsCount] = useState(initialData.elementsCount);
  const [stock, setStock] = useState(initialData.stock);
  const [stockIndex, setStockIndex] = useState<number>();
  const [grid, setGrid] = useState(initialData.grid);
  const [lock, setLock] = useState(initialData.lock);
  const [solution, setSolution] = useState<number[][]>();
  const [toSolve, setToSolve] = useState(initialData.toSolve);
  const [result, setResult] = useState<string[][]>([[]]);
  const [gridDimensions, setGridDimensions] = useState({
    displayMode: initialData.displayMode,
    gridSize: initialData.gridSize,
    cellSize: initialData.cellSize,
  });
  const [laserElements, setLaserElements] = useState(initialData.laserElements);
  const [displayLaserPosition, setDisplayLaserPosition] = useState<number>();
  const [displayLaserIndex, setDisplayLaserIndex] = useState<number>();
  const [running, setRunning] = useState(initialData.running);
  const [won, setWon] = useState(initialData.won);
  const [areaWidth, setAreaWidth] = useState<number>();
  const [areaHeight, setAreaHeight] = useState<number>();
  const [playerAction, setPlayerAction] = useState<boolean>(false);
  const [team, setTeam] = useState<Teammate[]>();
  const [transformations, setTransformations] = useState(initialData.transformations);
  const [smart, setSmart] = useState(initialData.smart);
  const [simplifiedDisplay, setSimplifiedDisplay] = useState(initialData.simplifiedDisplay);
  const [partialSolutionAllowed, setPartialSolutionAllowed] = useState(true);

  useEffect(() => {
    const w: WindowWithGameMethods = window as any;
    const seedHelper = new SeedHelper();

    w.game = {
      setRunning,
      setSmart,
      setSimplifiedDisplay,
      setPartialSolutionAllowed,
      resetLockedCells: () => {
        setLock(initLock(squaresCount));
      },
      setup: (p: GameSetup) => {
        setWon(false);
        setPlayerAction(false);
        setMode(p.mode);
        setSquaresCount(p.gridSize);
        setTransformations(p.transformations || 0);

        const grid = p.grid || initGrid(p.gridSize, p.portals);
        setGrid(grid);
        setLock(p.lockedCells || initLock(p.gridSize));

        if (p.solution) {
          setSolution(p.solution);
        }

        let toSolve = p.puzzle;
        if (!toSolve) {
          toSolve = initPuzzle(p.gridSize, p.mode, p.elements, p.portals);
          if (p.solution) {
            toSolve = checker.checkGrid(p.solution, toSolve);
          }
        }
        toSolve = toSolve.map(l => l.map(v => v.replace('w', 's')));
        setToSolve(toSolve);

        if (p.elements) {
          const elements = p.elements.sort();

          const elementsInGrid: number[] = [];
          grid.map((row) => elementsInGrid.push(...row.filter((val) => val > 0 && val !== 7)));
          elementsInGrid.sort();

          const intersection = [];
          let j = 0;
          for (let i = 0; i < elements.length; i++) {
            if (j < elementsInGrid.length && elements[i] === elementsInGrid[j]) {
              j++;
            } else {
              intersection.push(elements[i]);
            }
          }

          setElements(Array.from(new Set<number>(elements)));
          setElementsCount(elements.length);
          setStock(intersection);
          if (p.mode !== "play") {
            setStockIndex(undefined);
          }
        }

        return grid;
      },
      setAreaSize: (width: number, height: number) => {
        setAreaWidth(width);
        setAreaHeight(height);
      },
      setTeam: (teams: Teammate[]) => {
        setTeam([...teams]);
      },
      getSeed: (grid: number[][]) => {
        return seedHelper.Encode(grid);
      },
      getGrid: (seed: string) => {
        return seedHelper.Decode(seed);
      },
      resetLaser: () => {
        setLaserElements([]);
        setDisplayLaserPosition(undefined);
        setDisplayLaserIndex(undefined);
      }
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setGridDimensions(getGridDimensions(squaresCount + 2, areaWidth, areaHeight));
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [squaresCount, areaWidth, areaHeight]);

  useEffect(() => {
    const w: WindowWithGameMethods = window as any;
    if (mode !== "view" && w.game.onGridChange && playerAction) {
      const gridClone = [...grid.map((row) => [...row])];
      w.game.onGridChange(gridClone);
      setPlayerAction(false);
    }
  }, [mode, grid, playerAction]);

  useEffect(() => {
    const w: WindowWithGameMethods = window as any;
    if (mode === "play" && w.game.onLockChange) {
      const lockClone = [...lock.map((row) => [...row])];
      w.game.onLockChange(lockClone);
    }
  }, [mode, lock]);

  useEffect(() => {
    const w: WindowWithGameMethods = window as any;
    if (mode === "puzzleCreation" && w.game.onPuzzleChange) {
      const resultClone = [...result.map((row) => [...row])];
      w.game.onPuzzleChange(resultClone);
    }
  }, [mode, result]);

  useEffect(() => {
    const newResult = checker.checkGrid(grid, toSolve);
    setResult(newResult);

    if (checker.won && (stock.length === 0 || partialSolutionAllowed)) {
      setWon(true);

      const w: WindowWithGameMethods = window as any;
      if (w.game.onPuzzleResolve) {
        const gridClone = [...grid.map((row) => [...row])];
        w.game.onPuzzleResolve(gridClone);
      }
    }
  }, [grid, toSolve, stock, partialSolutionAllowed]);

  useEffect(() => {
    try {
      const w: WindowWithGameMethods = window as any;
      if (mode === "puzzleCreation" && w.game.onProgression && elementsCount) {
        const elementsPlaced = elementsCount - stock.length;
        const progression = Math.round(elementsPlaced * 100 / elementsCount);
        w.game.onProgression(progression);
      }
    } catch (error) { } // game not ready
  }, [mode, elementsCount, stock]);

  useEffect(() => {
    try {
      const w: WindowWithGameMethods = window as any;
      if (mode === "play" && w.game.onProgression) {
        let [ok, ko] = [0, 0];

        for (let rowIndex = 0; rowIndex < toSolve.length; rowIndex++) {
          const resultRow = result[rowIndex];
          const toSolveRow = toSolve[rowIndex];

          for (let colIndex = 0; colIndex < toSolveRow.length; colIndex++) {
            if (resultRow[colIndex] === toSolveRow[colIndex]) {
              ++ok;
            } else {
              ++ko;
            }
          }
        }

        const progression = Math.round(ok * 100 / (ok + ko));
        w.game.onProgression(progression);
      }
    } catch (error) { } // game not ready
  }, [mode, result, toSolve]);

  useEffect(() => {
    if (displayLaserPosition === undefined || displayLaserIndex === undefined) {
      setLaserElements([]);
    } else if ((mode === "solution" || mode === "solutionOnly") && solution) {
      setLaserElements(checker.getLaserElements(solution, displayLaserPosition, displayLaserIndex));
    } else {
      setLaserElements(checker.getLaserElements(grid, displayLaserPosition, displayLaserIndex));
    }
  }, [grid, displayLaserPosition, displayLaserIndex, mode, solution]);

  const pushToStock = (elt: number) => {
    const newStock = [...stock];
    newStock.push(elt);
    //newStock.sort();
    setStock(newStock);
    setStockIndex(newStock.findIndex((s) => s === elt));
  };

  const removeFromStock = (index: number) => {
    if (stock.length === 1) {
      setStock([]);
      setStockIndex(undefined);
      return;
    }

    const newStock = [...stock];
    let elt = stock[index];
    newStock.splice(index, 1);
    setStock(newStock);

    let newIndex = newStock.findIndex((s) => s === elt);
    if (newIndex >= 0) {
      setStockIndex(newIndex);
    } else {
      setStockIndex(undefined);
    }
  };

  const lockCell = (row: number, col: number, val: boolean) => {
    const lockClone = [...lock.map((row) => [...row])];
    lockClone[row][col] = val;
    setLock(lockClone);

    // don't know why but the following is needed ...
    setGrid([...grid.map((row) => [...row])]);
  };

  const setGridElement = (row: number, col: number) => {
    const gridClone = [...grid.map((row) => [...row])];
    const currentElement = gridClone[row][col];

    if (currentElement) {
      pushToStock(currentElement);
      gridClone[row][col] = 0;
      setGrid(gridClone);
      return;
    }

    const stockElement = stockIndex === undefined ? 0 : stock[stockIndex];
    if (stockElement) {
      removeFromStock(stockIndex!);
      gridClone[row][col] = stockElement;
      setGrid(gridClone);
    }
  };

  const moveGridElement = (source: Position, destination: Position) => {
    const gridClone = [...grid.map((row) => [...row])];

    if (destination.row !== undefined && destination.col !== undefined) {
      const destVal = gridClone[destination.row][destination.col];
      const isDestLocked = lock[destination.row][destination.col];

      if (destVal === 7 || isDestLocked) {
        return;
      }

      if (source.stockIndex !== undefined) {
        // drag from the stock
        const newVal = stock[source.stockIndex];

        if (destVal > 0) {
          const stockClone = [...stock];
          stockClone[source.stockIndex] = destVal;
          //stockClone.sort();
          setStock(stockClone);
        } else {
          removeFromStock(source.stockIndex);
        }

        gridClone[destination.row][destination.col] = newVal;
      } else if (source.row !== undefined && source.col !== undefined) {
        // drag inside the grid
        if (source.row === destination.row && source.col === destination.col) {
          // pas de changement
          return;
        }

        const isSourceLocked = lock[source.row][source.col];
        if (isSourceLocked) {
          return;
        }

        if (destVal > 0) {
          pushToStock(destVal);
        }
        gridClone[destination.row][destination.col] = gridClone[source.row][source.col];
        gridClone[source.row][source.col] = 0;
      }
    }

    setGrid(gridClone);
  };

  const displayLaser = (position: number, index: number) => {
    if (mode === 'resting' || (displayLaserPosition === position && displayLaserIndex === index)) {
      setDisplayLaserPosition(undefined);
      setDisplayLaserIndex(undefined);
    } else {
      setDisplayLaserPosition(position);
      setDisplayLaserIndex(index);
    }
  };

  const value = {
    mode,
    squaresCount,
    elementsCount,
    elements,
    stock,
    stockIndex,
    setStockIndex: (index?: number) => { if (running && !won) { setStockIndex(index); } },
    grid,
    lock,
    lockCell: (row: number, col: number, val: boolean) => { if (running && !won) { lockCell(row, col, val); } },
    solution,
    setGridElement: (row: number, col: number) => { if (running && !won) { setGridElement(row, col); setPlayerAction(true); } },
    moveGridElement: (source: Position, destination: Position) => { if (running && !won) { moveGridElement(source, destination); setPlayerAction(true); } },
    toSolve,
    result,
    laserElements,
    displayLaserPosition,
    displayLaserIndex,
    displayLaser,
    running,
    won,
    team,
    transformations,
    smart,
    simplifiedDisplay,
    ...gridDimensions
  };

  return (
    <StateContext.Provider value={value}>
      {props.children}
    </StateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useAppState must be used within the AppStateProvider');
  }
  return context;
}