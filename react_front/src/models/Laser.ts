export enum LaserType {
  "horizontal",
  "vertical",
}

export enum LaserPosition {
  "top",
  "right",
  "bottom",
  "left",
}

export enum LaserDimension {
  "big",
  "medium",
  "short",
}

export interface LaserIconProps {
  type: LaserType,
  position?: LaserPosition,
  dimension: LaserDimension,
}

export interface LaserProps extends LaserIconProps {
  row: number,
  col: number,
}
