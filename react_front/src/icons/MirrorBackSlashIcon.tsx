import { colors } from "../helpers/Style";
import { IconProps } from "./IconProps";

export default function MirrorBackSlashIcon({ size, color }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="1 1 101 101">
      <rect x="22" y="22" rx="5" ry="5" width="10" height="76" fill={color || colors.black} stroke={colors.white} fillOpacity="1" strokeOpacity="1" strokeWidth="5"
        transform="translate(-10, 28) rotate(-45)"
      />
    </svg>
  );
}