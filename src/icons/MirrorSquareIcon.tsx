import { colors } from "../helpers/Colors";
import { IconProps } from "./IconProps";

export default function MirrorSquareIcon({ size }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="1 1 101 101">
      <rect x="20" y="20" rx="5" ry="5" width="60" height="60" fill={colors.black} stroke={colors.white} fillOpacity="1" strokeOpacity="1" strokeWidth="5" strokeLinecap="square" />
    </svg>
  );
}