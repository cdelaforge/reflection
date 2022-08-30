import { colors } from "../helpers/Style";
import { IconProps } from "./IconProps";

export default function MirrorHorizontalIcon({ size }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="-100 -100 800 800">
      <g transform="translate(300, -130) rotate(45)">
        <path fill={colors.black} d="M30,144.097 C96.9686,223.907,195.815,270,300,270 C404.185,270,503.031,223.907,570,144.097 V455.903 C503.031,376.093,404.185,330,300,330 C195.815,330,96.9686,376.093,30,455.903Z" />
        <path fill={colors.black} d="M455.903,30 C376.093,96.9686,330,195.815,330,300 C330,404.185,376.093,503.031,455.903,570 H144.097 C223.907,503.031,270,404.185,270,300 C270,195.815,223.907,96.9686,144.097,30Z" />
      </g>
    </svg>
  );
}