import { StockArea } from "./Stock.Styles";
import { useAppState } from "../../state/AppStateProvider";
import { Transformations } from "../../helpers/Transformations";
import { StockCell } from "../";
import { compareData } from "../../models/Misc";

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
    const prevVal = data[i - 1] ? data[i - 1].displayedVal : -1;
    const id = (val > 0 && val !== prevVal) ? `lrf_stock_${val}` : undefined;

    return (
      <StockCell
        index={index}
        key={`stock_${index}`}
        val={val}
        id={id}
      />
    )
  });
  const width = (displayMode === "landscape") ? cellSize * lines : gridSize;
  const height = (displayMode === "portrait") ? cellSize * lines : gridSize;

  if (stockIndex === undefined && data[0]) {
    setTimeout(() => setStockIndex(data[0].index), 1);
  }

  return <StockArea width={width} height={height} margin={10} id="lrf_stock">{cells}</StockArea>;
}

export default Stock;