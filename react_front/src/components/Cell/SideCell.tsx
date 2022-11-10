import { useAppState } from "../../state/AppStateProvider";
import { CellBackground } from "./Cell.Styles";
import { TransformContainer } from "../Misc.Styles";
import CellNumber from "./CellNumber";

interface SideCellProps {
  position: "top" | "right" | "bottom" | "left";
  index: number;
  transform: string;
}

const posIndexHelper = {
  "top": 0,
  "right": 1,
  "bottom": 2,
  "left": 3
};

const getCurrentVal = (result: string[][], posIndex: number, index: number) => {
  try {
    return result[posIndex][index];
  } catch (error) {
    return "";
  }
};

const getToSolve = (toSolve: string[][], posIndex: number, index: number) => {
  try {
    return toSolve[posIndex][index] || "";
  } catch (error) {
    return "";
  }
};

function SideCell({ position, index, transform }: SideCellProps) {
  const { mode, cellSize, toSolve, result, displayLaserPosition, displayLaserIndex, displayLaser } = useAppState();
  const posIndex = posIndexHelper[position];
  const modeCreation = mode !== "play" && mode !== "standalone" && mode !== "solution";
  const valCurrent = getCurrentVal(result, posIndex, index);
  const valSolution = modeCreation ? valCurrent : getToSolve(toSolve, posIndex, index);
  const isCellCorrect = mode === "solution" || modeCreation || valCurrent === valSolution;
  const selected = displayLaserPosition === posIndex && displayLaserIndex === index;

  return (
    <CellBackground
      type="side"
      size={cellSize}
      selected={selected}
      onClick={() => displayLaser(posIndex, index)}
      id={`lrf_sidecell_${position}_${index}`}
    >
      <TransformContainer transform={transform}>
        <CellNumber valStr={selected && mode !== "solution" ? valCurrent : valSolution} isCorrect={isCellCorrect} />
      </TransformContainer>
    </CellBackground>
  );
}

export default SideCell;