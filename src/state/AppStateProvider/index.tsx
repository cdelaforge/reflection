import React, { createContext, useContext, ReactNode, useCallback, useState, useEffect } from 'react';
import { Checker } from "../../helpers/Checker";
import { WindowWithGameMethods, GameSetup } from "../../models/External";
import { LaserProps } from "../../models/Laser";

export interface IStateContext {
  mode: string;

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

  /* enigme */
  toSolve: string[][];
  result: string[][];
  elapsedTime: number;
  startedTime: number;
  running: boolean;
  won: boolean;

  /* laser */
  laserElements: LaserProps[],
  displayLaserPosition?: number,
  displayLaserIndex?: number,
  displayLaser: (position: number, index: number) => void,
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

const initGrid = (squaresCount: number) => {
  const iterator = new Array<number>(squaresCount).fill(0);
  const line = new Array<number>(squaresCount).fill(0);
  return iterator.map((_) => [...line]);
};

const initialData: IStateContext = {
  mode: 'puzzleCreation',
  squaresCount: 8,
  elementsCount: 15,
  stock: [1, 1, 2, 2, 2, 2, 3, 4, 4, 5, 5, 6, 6, 7, 7],
  grid: initGrid(8),
  toSolve: [
    ["3a", "7r", "2a", "9s", "5s", "11s", "23r", "3s"],
    ["1r", "11s", "3s", "8s", "8s", "5a", "3r", "1r"],
    ["6a", "9r", "7a", "3r", "3r", "18a", "5s", "1r"],
    ["15r", "3a", "1a", "8s", "8s", "9s", "7r", "15r"],
  ],
  result: [[]],
  setStockIndex: () => { },
  setGridElement: () => { },
  laserElements: [],
  displayLaser: () => { },
  elapsedTime: 0,
  startedTime: new Date().getTime(),
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
  const [toSolve, setToSolve] = useState(initialData.toSolve);
  const [result, setResult] = useState(checker.checkGrid(grid, toSolve));
  const [gridDimensions, setGridDimensions] = useState({
    displayMode: initialData.displayMode,
    gridSize: initialData.gridSize,
    cellSize: initialData.cellSize,
    margin: initialData.margin
  });
  const [laserElements, setLaserElements] = useState(initialData.laserElements);
  const [displayLaserPosition, setDisplayLaserPosition] = useState<number>();
  const [displayLaserIndex, setDisplayLaserIndex] = useState<number>();
  const [elapsedTime, setElapsedTime] = useState(initialData.elapsedTime);
  const [startedTime, setStartedTime] = useState(initialData.startedTime);
  const [running, setRunning] = useState(initialData.running);
  const [won, setWon] = useState(initialData.won);
  const [areaWidth, setAreaWidth] = useState<number>();
  const [areaHeight, setAreaHeight] = useState<number>();

  useEffect(() => {
    const w: WindowWithGameMethods = window as any;
    w.game = {
      setup: (p: GameSetup) => {
        setMode(p.mode);
        if (p.gridSize) {
          const grid = initGrid(p.gridSize);
          const toSolve = [
            new Array<string>(p.gridSize).fill(''),
            new Array<string>(p.gridSize).fill(''),
            new Array<string>(p.gridSize).fill(''),
            new Array<string>(p.gridSize).fill('')
          ];

          setSquaresCount(p.gridSize);
          setGrid(grid);
          setToSolve(toSolve);
          setResult(checker.checkGrid(grid, toSolve));
        }
        if (p.elements) {
          setElementsCount(p.elements.length);
          setStock(p.elements);
          setStockIndex(undefined);
        }

        /*
        const squaresCount = toSolve[0].length;
        const grid = initGrid(squaresCount);

        setSquaresCount(squaresCount);
        setElementsCount(stock.length);
        setStock(stock);
        setStockIndex(undefined);
        setGrid(grid);
        setToSolve(toSolve);
        setResult(checker.checkGrid(grid, toSolve))
        */
      },
      setAreaSize: (width: number, height: number) => {
        setAreaWidth(width);
        setAreaHeight(height);
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
    const interval = setInterval(() => {
      if (running) {
        setElapsedTime(new Date().getTime() - startedTime);
      }
    });
    return () => clearInterval(interval);
  }, [running, startedTime]);

  useEffect(() => {
    const w: WindowWithGameMethods = window as any;
    if (w.game.onGridChange) {
      w.game.onGridChange(grid);
    }
  }, [grid]);



  const numberCompare = (a: number, b: number) => {
    return a === 0 ? 0 : (a < b ? -1 : 1);
  }

  const pushToStock = (elt: number) => {
    stock.push(elt);
    setStock(stock.sort(numberCompare));
    setStockIndex(stock.findIndex((s) => s === elt));
  };

  const removeFromStock = (index: number) => {
    stock[index] = 100;
    const newStock = stock.sort(numberCompare);
    newStock.pop();
    setStock(newStock);
    if (newStock.length === 0) {
      setStockIndex(undefined);
    } else if (stockIndex !== undefined && stockIndex >= newStock.length) {
      setStockIndex(stockIndex - 1);
    }
  };

  const checkGrid = () => {
    const newResult = checker.checkGrid(grid, toSolve);
    setResult(newResult);
    if (checker.won) {
      setRunning(false);
      setWon(true);
    }
  }

  const setGridElement = (row: number, col: number) => {
    const currentElement = grid[row][col];
    if (currentElement) {
      pushToStock(currentElement);
      grid[row][col] = 0;
      setGrid([...grid]);
      checkGrid();
      refreshLaser();
      return;
    }

    const stockElement = stockIndex === undefined ? 0 : stock[stockIndex];
    if (stockElement) {
      removeFromStock(stockIndex!);
      grid[row][col] = stockElement;
      setGrid([...grid]);
      checkGrid();
      refreshLaser();
    }
  };

  const refreshLaser = () => {
    if (displayLaserPosition !== undefined && displayLaserIndex !== undefined) {
      setLaserElements(checker.getLaserElements(grid, displayLaserPosition, displayLaserIndex));
    }
  };

  const displayLaser = (position: number, index: number) => {
    if (displayLaserPosition === position && displayLaserIndex === index) {
      setLaserElements([]);
      setDisplayLaserPosition(undefined);
      setDisplayLaserIndex(undefined);
    } else {
      setLaserElements(checker.getLaserElements(grid, position, index));
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
    setStockIndex,
    grid,
    setGridElement,
    toSolve,
    result,
    laserElements,
    displayLaserPosition,
    displayLaserIndex,
    displayLaser,
    elapsedTime,
    startedTime,
    running,
    won,
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