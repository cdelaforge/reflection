import { useAppState } from "../../state/AppStateProvider";
import { CellNumberBack } from "./Cell.Styles";
import { colors } from "../../helpers/Style";
import NumberIcon from "../../icons/NumberIcon";

enum ReflectionType { "r", "s", "a" };

const getType = (valStr: string) => {
  if (valStr) {
    if (valStr.endsWith("a")) {
      return ReflectionType.a;
    }
    if (valStr.endsWith("r")) {
      return ReflectionType.r;
    }
  }
  return ReflectionType.s;
}

const backColors = new Map<ReflectionType, string>([
  [ReflectionType.r, colors.yellow],
  [ReflectionType.s, colors.green],
  [ReflectionType.a, "grey"],
]);

interface CellNumberProps {
  valStr: string;
  isCorrect: boolean;
}

function CellNumber({ valStr, isCorrect }: CellNumberProps) {
  const { cellSize } = useAppState();
  const type = getType(valStr);
  const val = parseInt(valStr, 10) || 0;
  const backColor = backColors.get(type) || "green";

  return <CellNumberBack size={cellSize - 2} backColor={backColor} isCorrect={isCorrect}>
    <NumberIcon size={cellSize - 2} val={val} />
  </CellNumberBack>
}

export default CellNumber;