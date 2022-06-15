import { useAppState } from "../../state/AppStateProvider";
import ElapsedTime from "./ElapsedTime";
import { GameStatusArea } from "./GameStatus.Styles";

function Stock() {
  const { gridSize, cellSize, displayMode, margin } = useAppState();
  const width = (displayMode === "landscape") ? cellSize * 3 : gridSize;
  const height = (displayMode === "portrait") ? cellSize * 3 : gridSize;

  return (
    <GameStatusArea width={width} height={height} margin={margin}>
      <ElapsedTime></ElapsedTime>
    </GameStatusArea>
  );
}

export default Stock;