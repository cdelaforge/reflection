import { colors } from "../../helpers/Style";
import { useAppState } from "../../state/AppStateProvider";
import { ElapsedTimeArea } from "./GameStatus.Styles";

function ElapsedTime() {
  const { elapsedTime, cellSize } = useAppState();

  const total = Math.round(elapsedTime / 1000);
  const seconds = total % 60;
  const minutes = (total - seconds) / 60;
  const text = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

  return <ElapsedTimeArea color={colors.green} size={cellSize}>{text}</ElapsedTimeArea>;
}

export default ElapsedTime;