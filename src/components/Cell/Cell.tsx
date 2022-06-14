import { LaserIcon } from "../../icons/LaserIcon";
import { useAppState } from "../../state/AppStateProvider";
import { CellBackground, CellContainer, CellContainerChild } from "./Cell.Styles";
import CellIcon from "./CellIcon";

interface CellProps {
  row: number;
  col: number;
}

function Cell({ row, col }: CellProps) {
  const { cellSize, grid, setGridElement, laserElements } = useAppState();

  const getVal = () => {
    if (grid && grid[row] && grid[row][col]) {
      return grid[row][col];
    }
    return 0;
  }

  const clickCell = () => {
    setGridElement(row, col);
  };

  const cellLaserElements = laserElements
    .filter((elt) => elt.row === row && elt.col === col)
    .map((elt, index) => (
      <CellContainerChild key={`laser_${row}_${col}_${index}`}>
        <LaserIcon size={cellSize} type={elt.type} position={elt.position} dimension={elt.dimension} />
      </CellContainerChild>
    ));

  return (
    <CellContainer size={cellSize} onClick={clickCell}>
      <CellContainerChild>
        <CellBackground type="grid" size={cellSize} />
      </CellContainerChild>
      {cellLaserElements}
      <CellContainerChild>
        <CellIcon index={getVal()} />
      </CellContainerChild>
    </CellContainer>
  );
}

export default Cell;