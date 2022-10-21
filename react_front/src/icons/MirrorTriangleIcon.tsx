import { colors } from "../helpers/Style";
import { IconProps } from "./IconProps";

export function MirrorTriangleIcon1({ size, color }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="1 1 101 101">
      <polygon points="29,29 71,29 71,71" fill={colors.white} stroke={colors.white} strokeWidth={15} strokeLinejoin="round" />
      <polygon points="29,29 71,29 71,71" fill={color || colors.black} stroke={colors.black} strokeWidth={5} strokeLinejoin="round" />
    </svg>
  );
}

export function MirrorTriangleIcon2({ size, color }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="1 1 101 101">
      <polygon points="29,71 71,29 71,71" fill={colors.white} stroke={colors.white} strokeWidth={15} strokeLinejoin="round" />
      <polygon points="29,71 71,29 71,71" fill={color || colors.black} stroke={colors.black} strokeWidth={5} strokeLinejoin="round" />
    </svg>
  );
}

export function MirrorTriangleIcon3({ size, color }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="1 1 101 101">
      <polygon points="29,29 71,71 29,71" fill={colors.white} stroke={colors.white} strokeWidth={15} strokeLinejoin="round" />
      <polygon points="29,29 71,71 29,71" fill={color || colors.black} stroke={colors.black} strokeWidth={5} strokeLinejoin="round" />
    </svg>
  );
}

export function MirrorTriangleIcon4({ size, color }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="1 1 101 101">
      <polygon points="29,29 71,29 29,71" fill={colors.white} stroke={colors.white} strokeWidth={15} strokeLinejoin="round" />
      <polygon points="29,29 71,29 29,71" fill={color || colors.black} stroke={colors.black} strokeWidth={5} strokeLinejoin="round" />
    </svg>
  );
}