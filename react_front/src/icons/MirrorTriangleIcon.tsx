import { colors } from "../helpers/Style";
import { IconProps } from "./IconProps";

export function MirrorTriangleIcon1({ size, color }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="1 1 101 101">
      <polygon points="26,26 26,24 75,24 78,27 78,76 76,76" fill={color || colors.black} stroke={colors.white} strokeWidth={5} strokeLinejoin="round" />
    </svg>
  );
}

export function MirrorTriangleIcon2({ size, color }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="1 1 101 101">
      <polygon points="26,78 26,76 76,26 78,26 78,75 75,78" fill={color || colors.black} stroke={colors.white} strokeWidth={5} strokeLinejoin="round" />
    </svg>
  );
}

export function MirrorTriangleIcon3({ size, color }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="1 1 101 101">
      <polygon points="24,26 26,26 76,76 76,78 27,78 24,75" fill={color || colors.black} stroke={colors.white} strokeWidth={5} strokeLinejoin="round" />
    </svg>
  );
}

export function MirrorTriangleIcon4({ size, color }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="1 1 101 101">
      <polygon points="24,27 27,24 76,24 76,26 26,76 24,76" fill={color || colors.black} stroke={colors.white} strokeWidth={5} strokeLinejoin="round" />
    </svg>
  );
}