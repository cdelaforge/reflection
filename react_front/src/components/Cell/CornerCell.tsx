import { useAppState } from "../../state/AppStateProvider";
import { CellBackground } from "./Cell.Styles";

function CornerCell() {
  const { cellSize } = useAppState();

  return (
    <CellBackground type="corner" size={cellSize}></CellBackground>
  );
}

export default CornerCell;