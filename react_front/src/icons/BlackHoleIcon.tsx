import { colors } from "../helpers/Style";
import { IconProps } from "./IconProps";

export default function BlackHoleIcon({ size, color }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="25" fill={color || colors.black} />
    </svg>
  );
}