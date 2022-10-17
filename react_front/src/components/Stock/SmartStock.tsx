import { StockArea } from "./Stock.Styles";
import { useAppState } from "../../state/AppStateProvider";
import { Transformations } from "../../helpers/Transformations";
import SmartStockCell from "../Cell/SmartStockCell";
import { compareData } from "../../models/Misc";

function SmartStock() {
  const { mode, squaresCount, gridSize, cellSize, displayMode, stock, transformations, stockIndex, setStockIndex, elements } = useAppState();

  if (mode === "view" || mode === "solution") {
    return <></>;
  }

  const transfoHelper = new Transformations(transformations);
  const data = stock.map((val, index) => ({ index, val, displayedVal: transfoHelper.getDisplayedIcon(val) })).sort(compareData);
  const itemTypes = elements.map((val, index) => ({ index, val, displayedVal: transfoHelper.getDisplayedIcon(val) })).sort(compareData);
  const lines = Math.ceil(itemTypes.length / (squaresCount + 2));
  const cells = itemTypes.map(t => t.displayedVal).map((type, index) => {
    const indexList = data.filter(d => d.displayedVal === type).map(d => d.index);
    return (
      <SmartStockCell key={`smart_${index}`} val={type} indexList={indexList} />
    );
  });

  const width = (displayMode === "landscape") ? cellSize * lines : gridSize;
  const height = (displayMode === "portrait") ? cellSize * lines : gridSize;

  if (stockIndex === undefined && data[0]) {
    setTimeout(() => setStockIndex(data[0].index), 1);
  }

  return <StockArea width={width} height={height} margin={10} padding={0}>{cells}</StockArea>;
}

export default SmartStock;