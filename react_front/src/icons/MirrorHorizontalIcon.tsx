import { colors } from "../helpers/Style";
import { IconProps } from "./IconProps";

export default function MirrorHorizontalIcon({ size, color }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="1 1 101 101">
      <rect x="15" y="28" rx="5" ry="5" height="10" width="70" fill={color || colors.black} stroke={colors.white} fillOpacity="1" strokeOpacity="1" strokeWidth="5" strokeLinecap="square" />
      <rect x="15" y="65" rx="5" ry="5" height="10" width="70" fill={color || colors.black} stroke={colors.white} fillOpacity="1" strokeOpacity="1" strokeWidth="5" strokeLinecap="square" />
    </svg>
  );
}