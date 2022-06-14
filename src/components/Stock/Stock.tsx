import { useAppState } from "../../state/AppStateProvider";
import { StockArea } from "./Stock.Styles";
import { StockCell } from "../";

function Stock() {
  const { squaresCount, gridSize, cellSize, elementsCount, displayMode } = useAppState();
  const lines = Math.ceil(elementsCount / (squaresCount + 2));
  const iterator = new Array<number>(elementsCount).fill(0);
  const cells = iterator.map((_, index) => <StockCell index={index} key={`stock_${index}`}></StockCell>)
  const width = (displayMode === "landscape") ? cellSize * lines : gridSize;
  const height = (displayMode === "portrait") ? cellSize * lines : gridSize;

  return <StockArea width={width} height={height}>{cells}</StockArea>;
}

export default Stock;