import React, { createContext, useContext, useState, useEffect } from 'react';
import { Checker } from "../../helpers/Checker";
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

export type DisplayMode = 'puzzleCreation' | 'play' | 'empty' | 'solution' | 'view' | 'standalone';

export interface IStateContext {
  mode: DisplayMode;

  /* config */
  squaresCount: number;
  elementsCount: number;

  /* display */
  displayMode: string;
  gridSize: number;
  cellSize: number;
  margin: number;

  /* stock state */
  stock: number[];
  stockIndex?: number;
  setStockIndex: (index?: number) => void;

  /* grid state */
  grid: number[][];
  setGridElement: (row: number, col: number) => void;
  moveGridElement: (source: Position, destination: Position) => void;
  solution?: number[][];

  lock: boolean[][];
  lockCell: (row: number, col: number, val: boolean) => void;

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

  return { ...result, gridSize: result.cellSize * squaresCount, margin: (Math.min(width, height) - result.cellSize * squaresCount) >> 1 };
};

const checker = new Checker();

const initGrid = (squaresCount: number, portals?: number[]) => {
  const iterator = new Array<number>(squaresCount).fill(0);
  const line = new Array<number>(squaresCount).fill(0);
  const grid = iterator.map((_) => [...line]);

  if (portals && portals.length === 4) {
    grid[portals[0]][portals[1]] = 7;
    grid[portals[2]][portals[3]] = 7;
  }

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
  ...getGridDimensions(10),
};

export function AppStateProvider(props: React.PropsWithChildren<{}>) {
  const [mode, setMode] = useState(initialData.mode);
  const [squaresCount, setSquaresCount] = useState(initialData.squaresCount);
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
    margin: initialData.margin
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

  useEffect(() => {
    const w: WindowWithGameMethods = window as any;
    w.game = {
      setRunning,
      setup: (p: GameSetup) => {
        setWon(false);
        setPlayerAction(false);
        setMode(p.mode);
        setSquaresCount(p.gridSize);

        const grid = p.grid || initGrid(p.gridSize, p.portals);
        setGrid(grid);
        setLock(initLock(p.gridSize));

        if (p.solution) {
          setSolution(p.solution);
        }

        const toSolve = p.puzzle || initPuzzle(p.gridSize, p.mode, p.elements, p.portals);
        setToSolve(toSolve);

        if (p.elements) {
          const elements = p.elements.sort();

          const elementsInGrid: number[] = [];
          grid.map((row) => elementsInGrid.push(...row.filter((val) => val)));
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

          setElementsCount(elements.length);
          setStock(intersection);
          setStockIndex(intersection.length === 0 ? undefined : 0);
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
    if (mode === "puzzleCreation" && w.game.onPuzzleChange) {
      const resultClone = [...result.map((row) => [...row])];
      w.game.onPuzzleChange(resultClone);
    }
  }, [mode, result]);

  useEffect(() => {
    const newResult = checker.checkGrid(grid, toSolve);
    setResult(newResult);

    if (checker.won) {
      setWon(true);

      const w: WindowWithGameMethods = window as any;
      if (w.game.onPuzzleResolve) {
        const gridClone = [...grid.map((row) => [...row])];
        w.game.onPuzzleResolve(gridClone);
      }
    }
  }, [grid, toSolve]);

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
    } else if (mode === "solution" && solution) {
      setLaserElements(checker.getLaserElements(solution, displayLaserPosition, displayLaserIndex));
    } else {
      setLaserElements(checker.getLaserElements(grid, displayLaserPosition, displayLaserIndex));
    }
  }, [grid, displayLaserPosition, displayLaserIndex, mode, solution]);

  const numberCompare = (a: number, b: number) => {
    return a === 0 ? 0 : (a < b ? -1 : 1);
  }

  const pushToStock = (elt: number) => {
    const newStock = [...stock];
    newStock.push(elt);
    newStock.sort(numberCompare);
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
    newStock.splice(index, 1);
    setStock(newStock);
    if (stockIndex !== undefined && stockIndex >= newStock.length) {
      setStockIndex(stockIndex - 1);
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
          stockClone.sort(numberCompare);
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
    if (displayLaserPosition === position && displayLaserIndex === index) {
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