import styled from '@emotion/styled';

export const GameStatusArea = styled('div') <{ width: number, height: number, margin: number }>`
  width: ${(props) => `${props.width}px`};
  height: ${(props) => `${props.height}px`};
  display: flex;
  flex-flow: ${(props) => props.width < props.height ? "column wrap" : "row wrap"};
  -webkit-box-flex: 0;
  flex-grow: 0;
  flex-shrink: 0;
  margin-top: ${(props) => `${props.margin}px`};
  margin-left: ${(props) => `${props.margin}px`};
`;

export const ElapsedTimeArea = styled('div') <{ size: number, color: string }>`
  font-family:'digital-7-mono';
  font-size: ${(props) => `${props.size * 0.8}px`};
  font-weight: bold;
  color: ${(props) => `${props.color}`};
  line-height: ${(props) => `${props.size}px`};
  -webkit-box-flex: 0;
  flex-grow: 0;
  flex-shrink: 0;
`;