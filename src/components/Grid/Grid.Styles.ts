import styled from '@emotion/styled';

export const Line = styled('div') <{ height: number }>`
  width: 100%;
  height: ${(props) => `${props.height}px`};
  display: flex;
  flex-flow: row nowrap;
  -webkit-box-flex: 0;
  flex-grow: 0;
  flex-shrink: 0;
`;

export const GridArea = styled("div") <{ width: number }>`
  width: ${(props) => `${props.width}px`};
  height: ${(props) => `${props.width}px`};
  padding: 1em;
`;
