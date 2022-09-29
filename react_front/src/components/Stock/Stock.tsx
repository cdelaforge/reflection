import { useAppState } from "../../state/AppStateProvider";
import { Transformations } from "../../helpers/Transformations";
import { StockArea } from "./Stock.Styles";
import { StockCell } from "../";

const compareData = (d1: StockCellData, d2: StockCellData) => {
  if (d1.displayedVal === d2.displayedVal) {
    return 0;
  }

  return d1.displayedVal < d2.displayedVal ? -1 : 1;
}

interface StockCellData {
  index: number;
  val: number;
  displayedVal: number;
}

function Stock() {
  const { mode, squaresCount, gridSize, cellSize, elementsCount, displayMode, stock, transformations, stockIndex, setStockIndex } = useAppState();

  if (mode === "view" || mode === "solution") {
    return <></>;
  }

  const transfoHelper = new Transformations(transformations);
  const data = stock.map((val, index) => ({ index, val, displayedVal: transfoHelper.getDisplayedIcon(val) })).sort(compareData);
  const lines = Math.ceil(elementsCount / (squaresCount + 2));
  const iterator = new Array<number>(elementsCount).fill(0);
  const cells = iterator.map((_, i) => {
    const index = data[i] ? data[i].index : i;
    const val = data[i] ? data[i].displayedVal : 0;

    return (
      <StockCell
        index={index}
        key={`stock_${index}`}
        val={val}
      />
    )
  });
  const width = (displayMode === "landscape") ? cellSize * lines : gridSize;
  const height = (displayMode === "portrait") ? cellSize * lines : gridSize;

  if (stockIndex === undefined && data[0]) {
    setStockIndex(data[0].index);
  }

  return <StockArea width={width} height={height} margin={10}>{cells}</StockArea>;
}

export default Stock;