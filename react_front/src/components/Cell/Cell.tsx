import { LaserIcon } from "../../icons/LaserIcon";
import { useAppState } from "../../state/AppStateProvider";
import { CellBackground, CellContainer, CellContainerChild } from "./Cell.Styles";
import CellIcon from "./CellIcon";
import { useDrop } from 'react-dnd';
import { colors } from "../../helpers/Style";
import { TransformContainer } from "../Misc.Styles";
import PadLockIcon from "../../icons/PadLockIcon";

interface CellProps {
  row: number;
  col: number;
  transform: string;
}

interface TeamValue {
  color: string;
  val: number;
}

function Cell({ row, col, transform }: CellProps) {
  const { cellSize, grid, solution, team, setGridElement, moveGridElement, laserElements, mode, lock, lockCell } = useAppState();

  const [, drop] = useDrop(
    () => ({
      accept: "item",
      drop: (item: any) => moveGridElement({ row: item.row, col: item.col, stockIndex: item.stockIndex }, { row, col })
    }),
    [row, col, grid]
  );

  const getPlayerVal = () => {
    if (grid && grid[row] && grid[row][col]) {
      const val = grid[row][col];

      if (mode !== "empty" || val === 7) {
        return val;
      }
    }
    return 0;
  }

  const getSolutionVal = () => {
    if (mode === "solution" && solution && solution[row] && solution[row][col]) {
      return solution[row][col];
    }
    return 0;
  }

  const clickCell = () => {
    if (!lock[row][col] && getPlayerVal() !== 7 && mode !== "empty" && mode !== "solution") {
      setGridElement(row, col);
    }
  };

  const rightClick = (event: any) => {
    event.stopPropagation();
    event.preventDefault();

    if (getPlayerVal() !== 7 && mode !== "solution") {
      lockCell(row, col, !lock[row][col]);
    }
  };

  const cellLaserElements = laserElements
    .filter((elt) => elt.row === row && elt.col === col)
    .map((elt, index) => (
      <CellContainerChild key={`laser_${row}_${col}_${index}`}>
        <LaserIcon size={cellSize} type={elt.type} position={elt.position} dimension={elt.dimension} />
      </CellContainerChild>
    ));

  const getPlayerCellIcon = (playerVal: number, solutionVal: number) => {
    if (playerVal) {
      const disp = (mode === "solution" && playerVal !== solutionVal) ? "wrong" : "normal";
      return (
        <CellContainerChild>
          <CellIcon val={playerVal} row={row} col={col} display={disp} />
        </CellContainerChild>
      );
    }

    return <></>;
  }

  const getSolutionCellIcon = (playerVal: number, solutionVal: number) => {
    if (mode === "solution" && solutionVal && playerVal !== solutionVal) {
      return (
        <CellContainerChild>
          <CellIcon val={solutionVal} row={row} col={col} display="solution" />
        </CellContainerChild>
      );
    }

    return <></>;
  }

  const getTeamCellIcons = () => {
    if (!team || mode !== "play") {
      return <></>;
    }

    const teammates = team.filter(t => t.grid && t.grid[row][col] && t.grid[row][col] !== 7 && t.grid[row][col] !== grid[row][col]);
    if (!teammates.length) {
      return <></>;
    }

    const values = [] as TeamValue[];

    teammates.forEach(t => {
      const val = t.grid![row][col];
      const obj = values.find(v => v.val === val);

      if (obj) {
        obj.color = colors.black;
      } else {
        values.push({ color: t.color, val })
      }
    });

    return values.map((v, index) => {
      const key = `${row}_${col}_${index}`;
      return (
        <CellContainerChild key={key}>
          <CellIcon val={v.val} row={row} col={col} display="team" color={v.color} />
        </CellContainerChild>
      );
    });
  }

  const getPadLock = () => {
    if (lock[row][col]) {
      const key = `${row}_${col}_paddlock`;
      return (
        <TransformContainer transform={transform} size={cellSize}>
          <CellContainerChild key={key}>
            <PadLockIcon size={cellSize / 3} />
          </CellContainerChild >
        </TransformContainer>
      );
    }
  };

  const playerVal = getPlayerVal();
  const solutionVal = getSolutionVal();

  return (
    <CellContainer size={cellSize} onContextMenu={rightClick} onClick={clickCell} ref={drop} id={`lrf_cell_${row}_${col}`}>
      <CellContainerChild>
        <CellBackground type={lock[row][col] ? "locked" : "grid"} size={cellSize} />
      </CellContainerChild>
      {getPadLock()}
      {cellLaserElements}
      {getTeamCellIcons()}
      {getPlayerCellIcon(playerVal, solutionVal)}
      {getSolutionCellIcon(playerVal, solutionVal)}
    </CellContainer>
  );
}

export default Cell;