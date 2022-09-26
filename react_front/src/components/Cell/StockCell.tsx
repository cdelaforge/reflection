import { useAppState } from "../../state/AppStateProvider";
import { CellBackground } from "./Cell.Styles";
import CellIcon from "./CellIcon";

interface StockCellProps {
  index: number;
  val: number;
}

function StockCell({ index, val }: StockCellProps) {
  const { cellSize, stockIndex, setStockIndex } = useAppState();

  const clickCell = () => {
    if (val) {
      setStockIndex(index);
    }
  };

  return (
    <CellBackground type="stock" size={cellSize} selected={stockIndex === index} onClick={clickCell}>
      <CellIcon val={val} stockIndex={index} />
    </CellBackground>
  );
}

export default StockCell;