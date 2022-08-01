import { useAppState } from "../../state/AppStateProvider";
import { CellBackground } from "./Cell.Styles";
import CellIcon from "./CellIcon";

interface StockCellProps {
  index: number;
}

function StockCell({ index }: StockCellProps) {
  const { cellSize, stock, stockIndex, setStockIndex } = useAppState();

  const clickCell = () => {
    if (stock[index]) {
      setStockIndex(index);
    }
  };

  return (
    <CellBackground type="stock" size={cellSize} selected={stockIndex === index} onClick={clickCell}>
      <CellIcon index={stock[index]} stockIndex={index} />
    </CellBackground>
  );
}

export default StockCell;