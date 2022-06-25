import styled from '@emotion/styled';
import { colors } from "../../helpers/Style";

export const CellContainer = styled('div') <{ size: number }>`
  position: relative;
  width:  ${(props) => `${props.size}px`};
  height:  ${(props) => `${props.size}px`};
`;

export const CellContainerChild = styled('div')`
  position: absolute;
  top: 0px;
  left: 0px;
`;

export const CellBackground = styled('div') <{ type: "side" | "grid" | "corner" | "stock", size: number, selected?: boolean }>`
  width:  ${(props) => `${props.size}px`};
  height:  ${(props) => `${props.size}px`};
  box-sizing: border-box;
  border: ${(props) => props.selected ? "1px solid white" : (props.type === "corner" ? "1px solid transparent" : "1px solid black")};
  background: ${(props) => (props.type === "grid" || props.type === "stock") ? colors.purple : (props.type === "corner" ? "transparent" : (props.selected ? colors.blue : colors.red))};
  cursor: pointer;
`;

export const CellNumberBack = styled('div') <{ size: number, backColor: string, isCorrect: boolean }>`
  font-family:digital-7, DS-Digital;
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