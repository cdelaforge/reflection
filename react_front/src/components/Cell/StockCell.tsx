import { useAppState } from "../../state/AppStateProvider";
import { TransformContainer } from "../Misc.Styles";
import { CellBackground } from "./Cell.Styles";
import CellIcon from "./CellIcon";

interface StockCellProps {
  index: number;
  transform: string;
}

function StockCell({ index, transform }: StockCellProps) {
  const { cellSize, stock, stockIndex, setStockIndex } = useAppState();

  const clickCell = () => {
    if (stock[index]) {
      setStockIndex(index);
    }
  };

  return (
    <TransformContainer transform={transform}>
      <CellBackground type="stock" size={cellSize} selected={stockIndex === index} onClick={clickCell}>
        <CellIcon val={stock[index]} stockIndex={index} />
      </CellBackground>
    </TransformContainer>
  );
}

export default StockCell;