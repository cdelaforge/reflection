import styled from '@emotion/styled';

export const TransformContainer = styled('div') <{ transform: string, size?: number }>`
  transform: ${(props) => `${props.transform}`};
  width: ${(props) => props.size ? `${props.size}px` : "auto"};
  height: ${(props) => props.size ? `${props.size}px` : "auto"};
`;