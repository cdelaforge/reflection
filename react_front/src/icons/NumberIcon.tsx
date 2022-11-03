import styled from "@emotion/styled";
import { colors } from "../helpers/Style";
import { IconNumberProps } from "./IconProps";

const Container = styled("div") <{ size: number }>`
  display: flex;
  flex-flow: row;
  justify-content: center;
  gap: ${props => (props.size / 16)}px;
`;

const widths = [65, 29, 65, 65, 65, 65, 65, 65, 65, 65];

const numbers = [
  [
    <polygon key="0_1" points="15,90 5,100 0,95 0,45 65,45 65,95 60,100 50,90 50,60 15,60" fill={colors.black} stroke={colors.black} strokeWidth={1} />,
    <polygon key="0_2" points="15,110 5,100 0,105 0,155 65,155 65,105 60,100 50,110 50,140 15,140" fill={colors.black} stroke={colors.black} strokeWidth={1} />,
  ],
  [
    <polygon key="1_1" points="22,45 22,95 17,100 7,90 7,60" fill={colors.black} stroke={colors.black} strokeWidth={1} />,
    <polygon key="1_2" points="22,105 17,100 7,110 7,140 22,155" fill={colors.black} stroke={colors.black} strokeWidth={1} />
  ],
  [
    <polygon key="2_1" points="0,45 65,45 65,95 52,107 15,107 15,140 50,140 65,155 0,155 0,105 13,92 50,92 50,60 15,60" fill={colors.black} stroke={colors.black} strokeWidth={1} />,
  ],
  [
    <polygon key="3_1" points="0,45 65,45 65,95 60,100 65,105 65,155 0,155 15,140 50,140 50,107 15,107 8,100 15,92 50,92 50,60 15,60" fill={colors.black} stroke={colors.black} strokeWidth={1} />,
  ],
  [
    <polygon key="4_1" points="0,45 15,60 15,92 50,92 50,60 65,45 65,95 60,100 65,105 65,155 50,140 50,107 13,107 0,94" fill={colors.black} stroke={colors.black} strokeWidth={1} />,
  ],
  [
    <polygon key="5_1" points="0,45 65,45 50,60 15,60 15,92 52,92 65,105 65,155 0,155 15,140 50,140 50,107 13,107 0,94" fill={colors.black} stroke={colors.black} strokeWidth={1} />,
  ],
  [
    <polygon key="6_1" points="0,45 65,45 50,60 15,60 15,92 52,92 65,105 65,155 50,155 50,107 15,107 15,140 50,140 50,155 0,155 0,105 5,100 0,95" fill={colors.black} stroke={colors.black} strokeWidth={1} />,
  ],
  [
    <polygon key="7_1" points="0,45 65,45 65,95 60,100 50,90 50,60 15,60" fill={colors.black} stroke={colors.black} strokeWidth={1} />,
    <polygon key="7_2" points="65,105 60,100 50,110 50,140 65,155" fill={colors.black} stroke={colors.black} strokeWidth={1} />
  ],
  [
    <polygon key="8_1" points="0,45 50,45 50,60 15,60 15,92 50,92 50,45 65,45 65,95 60,100 65,105 65,155 50,155 50,107 15,107 15,140 50,140 50,155 0,155 0,105 5,100 0,95" fill={colors.black} stroke={colors.black} strokeWidth={1} />,
  ],
  [
    <polygon key="9_1" points="0,45 50,45 50,60 15,60 15,92 50,92 50,45 65,45 65,95 60,100 65,105 65,155 0,155 15,140 50,140 50,107 13,107 0,94" fill={colors.black} stroke={colors.black} strokeWidth={1} />,
  ],
];

export default function NumberIcon({ size, val }: IconNumberProps) {
  const array = Array.from(String(val), Number);

  return (
    <Container size={size}>
      {array.map((d, index) =>
        <svg key={`d_${index}`} xmlns="http://www.w3.org/2000/svg" height={size} viewBox={`0 0 ${widths[d]} 200`} >
          {numbers[d]}
        </svg >
      )}
    </Container>
  );
}