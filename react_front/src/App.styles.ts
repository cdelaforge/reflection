import styled from '@emotion/styled';

export const AppArea = styled('div') <{ mode: string }>`
  display: flex;
  flex-flow: ${(props) => props.mode === "portrait" ? "column nowrap" : "row nowrap"};
  -webkit-box-flex: 0;
  flex-grow: 0;
  flex-shrink: 0;
`;