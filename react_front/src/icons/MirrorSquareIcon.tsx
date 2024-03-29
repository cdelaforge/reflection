import { colors } from "../helpers/Style";
import { IconProps } from "./IconProps";

export default function MirrorSquareIcon({ size, color }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="1 1 101 101">
      <rect x="24" y="24" rx="5" ry="5" width="54" height="54" fill={color || colors.black} stroke={colors.white} fillOpacity="1" strokeOpacity="1" strokeWidth="5" strokeLinecap="square" />
    </svg>
  );
}