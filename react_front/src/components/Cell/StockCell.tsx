import { useAppState } from "../../state/AppStateProvider";
import { CellBackground } from "./Cell.Styles";
import CellIcon from "./CellIcon";

interface StockCellProps {
  index: number;
  val: number;
  id?: string;
}

function StockCell({ index, val, id }: StockCellProps) {
  const { cellSize, stockIndex, setStockIndex } = useAppState();

  const clickCell = () => {
    if (val) {
      setStockIndex(index);
    }
  };

  return (
    <CellBackground type="stock" size={cellSize} selected={stockIndex === index} onClick={clickCell} id={id}>
      <CellIcon val={val} stockIndex={index} />
    </CellBackground>
  );
}

export default StockCell;