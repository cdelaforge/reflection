import { StockArea } from "./Stock.Styles";
import { useAppState } from "../../state/AppStateProvider";
import { Transformations } from "../../helpers/Transformations";
import SmartStockCell from "../Cell/SmartStockCell";
import { compareData } from "../../models/Misc";

function SmartStock() {
  const { mode, squaresCount, gridSize, cellSize, displayMode, stock, transformations, stockIndex, setStockIndex } = useAppState();

  if (mode === "view" || mode === "solution") {
    return <></>;
  }

  const transfoHelper = new Transformations(transformations);
  const data = stock.map((val, index) => ({ index, val, displayedVal: transfoHelper.getDisplayedIcon(val) })).sort(compareData);
  const lines = Math.ceil(6 / (squaresCount + 2));

  const itemTypes = [1, 2, 3, 4, 5, 6];
  const cells = itemTypes.map((type, index) => {
    const indexList = data.filter(d => d.displayedVal === type).map(d => d.index);
    return (
      <SmartStockCell key={`smart_${index}`} val={type} indexList={indexList} />
    );
  });

  const width = (displayMode === "landscape") ? cellSize * lines : gridSize;
  const height = (displayMode === "portrait") ? cellSize * lines : gridSize;

  if (stockIndex === undefined && data[0]) {
    setStockIndex(data[0].index);
  }

  return <StockArea width={width} height={height} margin={10} padding={0}>{cells}</StockArea>;
}

export default SmartStock;