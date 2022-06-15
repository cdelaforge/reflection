import { colors } from "../helpers/Style";
import { LaserDimension, LaserPosition, LaserType, LaserIconProps } from "../models/Laser";
import { IconProps } from "./IconProps";

export function LaserIcon({ size, type, position, dimension }: LaserIconProps & IconProps) {
  const getStartPos = () => {
    if (dimension === LaserDimension.big || position === LaserPosition.left || position === LaserPosition.top) {
      return 0;
    }
    if (dimension === LaserDimension.medium) {
      return 50;
    }
    return 80;
  }
  const getEndPos = () => {
    if (dimension === LaserDimension.big || position === LaserPosition.right || position === LaserPosition.bottom) {
      return 100;
    }
    if (dimension === LaserDimension.medium) {
      return 50;
    }
    return 20;
  }

  const getLaser = () => {
    if (type === LaserType.horizontal) {
      return <rect x={getStartPos()} y="45" width={getEndPos()} height="10" fill={colors.laser} fillOpacity="1" strokeOpacity="1" />;
    }
    return <rect x="45" y={getStartPos()} width="10" height={getEndPos()} fill={colors.laser} fillOpacity="1" strokeOpacity="1" />;
  };

  const getCircle = () => {
    if (dimension === LaserDimension.medium) {
      return <circle cx="50" cy="50" r="5" fill={colors.laser} />;
    }
    return <></>;
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 100 100">
      {getLaser()}
      {getCircle()}
    </svg>
  );
}