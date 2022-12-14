import { useAppState } from "../../state/AppStateProvider";
import { CellNumberBack } from "./Cell.Styles";
import { colors } from "../../helpers/Style";
import NumberIcon from "../../icons/NumberIcon";

enum ReflectionType { "r", "s", "a", "w" };

const reflectionsTypes: Record<string, ReflectionType> = {
  "r": ReflectionType.r,
  "s": ReflectionType.s,
  "a": ReflectionType.a,
};

const getType = (valStr: string) => {
  if (valStr && valStr.length) {
    return reflectionsTypes[valStr.charAt(valStr.length - 1)];
  }
  return ReflectionType.w;
}

const backColors = new Map<ReflectionType, string>([
  [ReflectionType.r, colors.yellow],
  [ReflectionType.s, colors.green],
  [ReflectionType.w, colors.green],
  [ReflectionType.a, "grey"],
]);

const backClassNames = new Map<ReflectionType, string>([
  [ReflectionType.r, "lrf_cell_yellow"],
  [ReflectionType.s, "lrf_cell_green"],
  [ReflectionType.w, "lrf_cell_green"],
  [ReflectionType.a, "lrf_cell_grey"],
]);

interface CellNumberProps {
  valStr: string;
  isCorrect: boolean;
}

function CellNumber({ valStr, isCorrect }: CellNumberProps) {
  const { cellSize } = useAppState();
  const type = getType(valStr);
  const val = parseInt(valStr, 10) || 0;
  const backColor = backColors.get(type) || colors.green;
  const backClassName = backClassNames.get(type) || "lrf_cell_green";

  return <CellNumberBack size={cellSize - 2} className={backClassName} backColor={backColor} isCorrect={isCorrect}>
    <NumberIcon size={cellSize - 2} val={val} />
  </CellNumberBack>
}

export default CellNumber;