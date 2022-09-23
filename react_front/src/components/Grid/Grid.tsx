import { useAppState } from "../../state/AppStateProvider";
import { Line, GridArea } from "./Grid.Styles";
import { TransformContainer } from "../Misc.Styles";
import { Cell, SideCell, CornerCell } from "../";

interface GridProps {
  transformGrid: string;
  transformNumbers: string;
}

function Grid({ transformGrid, transformNumbers }: GridProps) {
  const { squaresCount, gridSize, cellSize, margin } = useAppState();
  const iterator = new Array<number>(squaresCount).fill(0);

  const getHeader = (position: "top" | "bottom") => {
    return (
      <Line key={`line_${position}`} height={cellSize}>
        <CornerCell></CornerCell>
        {iterator.map((_, col) => (
          <SideCell
            position={position}
            index={col}
            key={`side_${position}_${col}`}
            transform={transformNumbers}
          ></SideCell>
        ))}
        <CornerCell></CornerCell>
      </Line>
    );
  };

  const getLine = (row: number) => {
    return (
      <Line key={`line_${row}`} height={cellSize}>
        <SideCell position="left" index={row} transform={transformNumbers}></SideCell>
        {iterator.map((_, col) => <Cell key={`${row}_${col}`} row={row} col={col} transform={transformNumbers}></Cell>)}
        <SideCell position="right" index={row} transform={transformNumbers}></SideCell>
      </Line>
    );
  };

  return (
    <GridArea width={gridSize} margin={margin}>
      <TransformContainer transform={transformGrid}>
        {getHeader("top")}
        {iterator.map((_, row) => getLine(row))}
        {getHeader("bottom")}
      </TransformContainer>
    </GridArea>
  );
}

export default Grid;