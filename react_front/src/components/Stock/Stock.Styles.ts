import styled from '@emotion/styled';

export const StockArea = styled('div') <{ width: number, height: number, margin: number, padding?: number }>`
  width: ${(props) => `${props.width}px`};
  height: ${(props) => `${props.height}px`};
  display: flex;
  flex-flow: ${(props) => props.width < props.height ? "column wrap" : "row wrap"};
  -webkit-box-flex: 0;
  flex-grow: 0;
  flex-shrink: 0;
  margin-top: ${(props) => `${props.margin}px`};
  margin-left: ${(props) => `${props.margin}px`};
  padding-right: ${(props) => `${props.padding || 0}px`};
`;