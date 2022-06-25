import { useAppState } from "../../state/AppStateProvider";
import { CellBackground } from "./Cell.Styles";
import CellNumber from "./CellNumber";


interface SideCellProps {
  position: "top" | "right" | "bottom" | "left";
  index: number;
}

const posIndexHelper = {
  "top": 0,
  "right": 1,
  "bottom": 2,
  "left": 3
};

function SideCell({ position, index }: SideCellProps) {
  const { mode, cellSize, toSolve, result, displayLaserPosition, displayLaserIndex, displayLaser } = useAppState();
  const posIndex = posIndexHelper[position];
  const modeCreation = mode === "puzzleCreation";
  const valCurrent = result[posIndex][index];
  const valSolution = modeCreation ? valCurrent : toSolve[posIndex][index];
  const isCellCorrect = modeCreation || valCurrent === valSolution;
  const selected = displayLaserPosition === posIndex && displayLaserIndex === index;

  return (
    <CellBackground type="side" size={cellSize} selected={selected} onClick={() => displayLaser(posIndex, index)}>
      <CellNumber valStr={selected ? valCurrent : valSolution} isCorrect={isCellCorrect} />
    </CellBackground>
  );
}

export default SideCell;