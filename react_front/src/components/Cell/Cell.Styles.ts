import styled from '@emotion/styled';
import { colors } from "../../helpers/Style";

export const CellContainer = styled('div') <{ size: number }>`
  position: relative;
  width:  ${(props) => `${props.size}px`};
  height:  ${(props) => `${props.size}px`};
  cursor: pointer;
`;

export const CellContainerChild = styled('div')`
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
`;

const getCellBackground = (type: "side" | "grid" | "corner" | "stock" | "locked", selected?: boolean) => {
  switch (type) {
    case "grid":
    case "stock":
      return colors.purple;
    case "corner":
      return "transparent";
    case "locked":
      return colors.light_purple;
    default:
      return selected ? colors.blue : colors.red;
  }
};

export const CellBackground = styled('div') <{ type: "side" | "grid" | "corner" | "stock" | "locked", size: number, selected?: boolean }>`
  width:  ${(props) => `${props.size}px`};
  height:  ${(props) => `${props.size}px`};
  box-sizing: border-box;
  border: ${(props) => props.selected ? "1px solid white" : (props.type === "corner" ? "1px solid transparent" : "1px solid black")};
  background: ${(props) => getCellBackground(props.type, props.selected)};
  cursor: pointer;
  position: relative;
`;

export const CellNumberBack = styled('div') <{ size: number, backColor: string, isCorrect: boolean }>`
  font-family:DS-Digital;
  font-size: ${(props) => `${props.size * 0.8}px`};
  font-weight: bold;
  color: black;
  box-sizing: border-box;
  background: ${(props) => `${props.backColor}`};
  text-align: center;
  width:  ${(props) => `${props.size}px`};
  height:  ${(props) => `${props.size}px`};
  line-height: ${(props) => `${props.size}px`};
  border-radius: ${(props) => props.isCorrect ? "0px" : `${props.size / 2}px`};
`;

export const CellIconContainer = styled('div') <{ opacity: string }>`
  opacity: ${(props) => props.opacity};
`;

export const CellIconDiv = styled('div')`
  position: absolute;
  top: 0px;
  left: 0px;
`;