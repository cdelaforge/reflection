import { LaserIcon } from "../../icons/LaserIcon";
import { useAppState } from "../../state/AppStateProvider";
import { CellBackground, CellContainer, CellContainerChild } from "./Cell.Styles";
import CellIcon from "./CellIcon";
import { useDrop } from 'react-dnd';

interface CellProps {
  row: number;
  col: number;
}

function Cell({ row, col }: CellProps) {
  const { cellSize, grid, setGridElement, moveGridElement, laserElements, mode } = useAppState();

  const [, drop] = useDrop(
    () => ({
      accept: "item",
      drop: (item: any) => moveGridElement({ row: item.row, col: item.col, stockIndex: item.stockIndex }, { row, col })
    }),
    [row, col, grid]
  );

  const getVal = () => {
    if (grid && grid[row] && grid[row][col] && mode !== "empty") {
      return grid[row][col];
    }
    return 0;
  }

  const clickCell = () => {
    if (getVal() !== 7 && mode !== "empty") {
      setGridElement(row, col);
    }
  };

  const cellLaserElements = laserElements
    .filter((elt) => elt.row === row && elt.col === col)
    .map((elt, index) => (
      <CellContainerChild key={`laser_${row}_${col}_${index}`}>
        <LaserIcon size={cellSize} type={elt.type} position={elt.position} dimension={elt.dimension} />
      </CellContainerChild>
    ));

  return (
    <CellContainer size={cellSize} onClick={clickCell} ref={drop}>
      <CellContainerChild>
        <CellBackground type="grid" size={cellSize} />
      </CellContainerChild>
      {cellLaserElements}
      <CellContainerChild>
        <CellIcon index={getVal()} row={row} col={col} />
      </CellContainerChild>
    </CellContainer>
  );
}

export default Cell;