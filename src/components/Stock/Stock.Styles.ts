import styled from '@emotion/styled';

export const StockArea = styled('div') <{ width: number, height: number }>`
  width: ${(props) => `${props.width}px`};
  height: ${(props) => `${props.height}px`};
  display: flex;
  flex-flow: ${(props) => props.width < props.height ? "column wrap" : "row wrap"};
  -webkit-box-flex: 0;
  flex-grow: 0;
  flex-shrink: 0;
  padding: 1em;
`;