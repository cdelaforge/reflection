import { useEffect } from "react";
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend'
import { isMobile } from 'react-device-detect';
import { useAppState } from "../../state/AppStateProvider";
import { MirrorSlashIcon, MirrorBackSlashIcon, MirrorVerticalIcon, MirrorHorizontalIcon, MirrorSquareIcon, BlackHoleIcon, PortalIcon } from "../../icons";
import { CellIconContainer } from "./Cell.Styles";
import { colors } from "../../helpers/Style";

interface CellIconProps {
  val: number;
  row?: number;
  col?: number;
  stockIndex?: number;
  display?: 'normal' | 'wrong' | 'solution' | 'team';
  color?: string;
  transformed?: boolean;
}

function CellIcon({ val, row, col, stockIndex, display, color, transformed }: CellIconProps) {
  const { cellSize, mode, running, won, lock, rotate, flip } = useAppState();

  if (display === 'wrong') {
    color = colors.wrong;
  } else if (display === 'solution') {
    color = colors.solution;
  } else if (display !== 'team') {
    color = colors.black;
  }

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: "item",
    item: { index: val, row, col, stockIndex },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: () => {
      return !isMobile && mode !== "empty" && mode !== "solution" && display !== "team" && (!row || !col || !lock[row][col]) && running && !won && val > 0 && val < 7;
    },
  }), [val, stockIndex, mode, running, won, lock]);

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview]);

  const transformVal = (v: number) => {
    switch (v) {
      default:
        return v;
      case 1:
        return 2;
      case 2:
        return 1;
      case 3:
        return 4;
      case 4:
        return 3;
    }
  }

  const getTransformedVal = () => {
    if (!transformed) {
      return val;
    }

    let result: number = val;

    if (rotate !== 0 && rotate !== 180) {
      result = transformVal(result);
    }

    if (flip) {
      result = transformVal(result);
    }

    return result;
  }

  const getIconCode = () => {
    switch (getTransformedVal()) {
      default:
        return <></>;
      case 1:
        return <MirrorSlashIcon size={cellSize} color={color} />
      case 2:
        return <MirrorBackSlashIcon size={cellSize} color={color} />
      case 3:
        return <MirrorVerticalIcon size={cellSize} color={color} />
      case 4:
        return <MirrorHorizontalIcon size={cellSize} color={color} />
      case 5:
        return <MirrorSquareIcon size={cellSize} color={color} />
      case 6:
        return <BlackHoleIcon size={cellSize} color={color} />
      case 7:
        return <PortalIcon size={cellSize} color={color} />
    }
  };

  const getOpacity = () => {
    if (isDragging || display === "wrong") {
      return "40%";
    }
    if (display === "team") {
      return "20%";
    }
    return "100%";
  }

  return (
    <CellIconContainer ref={drag} opacity={getOpacity()}>
      {getIconCode()}
    </CellIconContainer>
  );
}

export default CellIcon;