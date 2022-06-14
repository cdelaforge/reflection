import React, { createContext, useContext, ReactNode, useCallback, useState, useEffect } from 'react';
import { Checker } from "../../helpers/Checker";
import { LaserProps } from "../../models/Laser";

export interface IStateContext {
  /* config */
  squaresCount: number;
  elementsCount: number;

  /* display */
  displayMode: string;
  gridSize: number;
  cellSize: number;

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

  /* laser */
  laserElements: LaserProps[],
  displayLaserPosition?: number,
  displayLaserIndex?: number,
  displayLaser: (position: number, index: number) => void,
}

export const StateContext = createContext<IStateContext>(null!);

const getGridDimensions = (squaresCount: number) => {
  const { innerWidth: width, innerHeight: height } = window;

  const result = (width < height)
    ? { displayMode: "portrait", cellSize: Math.round((width * 0.9) / squaresCount) }
    : { displayMode: "landscape", cellSize: Math.round((height * 0.9) / squaresCount) }

  return { ...result, gridSize: result.cellSize * squaresCount };
};

const checker = new Checker();

const initGrid = (squaresCount: number) => {
  const iterator = new Array<number>(squaresCount).fill(0);
  const line = new Array<number>(squaresCount).fill(0);
  return iterator.map((_, index) => [...line]);
};

const initialData: IStateContext = {
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
  ...getGridDimensions(10),
};

export function AppStateProvider(props: React.PropsWithChildren<{}>) {
  const [squaresCount, setSquaresCount] = useState(initialData.squaresCount);
  const [elementsCount, setElementsCount] = useState(initialData.elementsCount);
  const [stock, setStock] = useState(initialData.stock);
  const [stockIndex, setStockIndex] = useState<number>();
  const [grid, setGrid] = useState(initialData.grid);
  const [toSolve, setToSolve] = useState(initialData.toSolve);
  const [result, setResult] = useState(checker.checkGrid(grid, toSolve));
  const [gridDimensions, setGridDimensions] = useState(getGridDimensions(squaresCount + 2));
  const [laserElements, setLaserElements] = useState(initialData.laserElements);
  const [displayLaserPosition, setDisplayLaserPosition] = useState<number>();
  const [displayLaserIndex, setDisplayLaserIndex] = useState<number>();

  useEffect(() => {
    function handleResize() {
      setGridDimensions(getGridDimensions(squaresCount + 2));
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [squaresCount]);

  const numberCompare = (a: number, b: number) => {
    return a === 0 ? 0 : (a < b ? -1 : 1);
  }

  const pushToStock = (elt: number) => {
    stock.push(elt);
    setStock(stock.sort(numberCompare));
    if (stockIndex === undefined) {
      setStockIndex(0);
    }
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
    setResult(checker.checkGrid(grid, toSolve));
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