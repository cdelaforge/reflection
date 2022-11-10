import styled from "@emotion/styled";
import { useAppState } from "../../state/AppStateProvider";
import { CellBackground } from "./Cell.Styles";
import CellIcon from "./CellIcon";

const Counter = styled('div') <{ size: number, displayMode: string }>`
  width:${(props) => `${props.size}px`};
  height:${(props) => `${props.size}px`};
  border-radius: ${(props) => `${props.size / 2}px`};
  background: #F9665E;
  color: white;
  position: absolute;
  top: ${(props) => props.displayMode === 'landscape' ? `${props.size / 4}px` : `-${props.size / 2}px`};
  left: ${(props) => props.displayMode === 'landscape' ? `-${props.size / 2}px` : `${props.size / 4}px`};
  text-align: center;
  line-height: ${(props) => `${props.size}px`};
  font-size: ${(props) => `${props.size * 0.8}px`};
  font-family: Roboto,Arial,sans-serif;
`;

interface SmartStockCellProps {
  indexList: number[];
  val: number;
}

function SmartStockCell({ indexList, val }: SmartStockCellProps) {
  const { cellSize, stockIndex, setStockIndex, displayMode } = useAppState();

  const clickCell = () => {
    if (indexList.length) {
      setStockIndex(indexList[0]);
    }
  };

  if (indexList.length) {
    return (
      <CellBackground
        type="stock"
        size={cellSize}
        selected={indexList.some(i => stockIndex === i)}
        onClick={clickCell}
        id={`lrf_stock_${val}`}
      >
        <CellIcon val={val} stockIndex={indexList[0]} />
        <Counter size={cellSize / 4} displayMode={displayMode}>{indexList.length}</Counter>
      </CellBackground>
    );
  }

  return (
    <CellBackground type="stock" size={cellSize} selected={false}>
      <CellIcon val={val} display={'team'} />
      <Counter size={cellSize / 4} displayMode={displayMode}>0</Counter>
    </CellBackground>
  );
}

export default SmartStockCell;