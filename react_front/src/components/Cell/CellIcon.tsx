import { useEffect } from "react";
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend'
import { isMobile } from 'react-device-detect';
import { useAppState } from "../../state/AppStateProvider";
import { MirrorSlashIcon, MirrorBackSlashIcon, MirrorVerticalIcon, MirrorHorizontalIcon, MirrorSquareIcon, BlackHoleIcon, PortalIcon, MirrorTriangleIcon1, MirrorTriangleIcon2, MirrorTriangleIcon3, MirrorTriangleIcon4 } from "../../icons";
import { CellIconContainer } from "./Cell.Styles";
import { colors } from "../../helpers/Style";
import { Transformations } from "../../helpers/Transformations";

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
  const { cellSize, mode, running, won, lock, transformations } = useAppState();
  const transfoHelper = new Transformations(transformations);

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
      return !isMobile && mode !== "empty" && mode !== "solution" && display !== "team" && (!row || !col || !lock[row][col]) && running && !won && val > 0 && val !== 7;
    },
  }), [val, stockIndex, mode, running, won, lock]);

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview]);

  const getDisplayedVal = () => {
    return transformed ? transfoHelper.getDisplayedIcon(val) : val;
  }

  const getIconCode = () => {
    switch (getDisplayedVal()) {
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
      case 8:
        return <MirrorTriangleIcon3 size={cellSize} color={color} />
      case 9:
        return <MirrorTriangleIcon1 size={cellSize} color={color} />
      case 10:
        return <MirrorTriangleIcon2 size={cellSize} color={color} />
      case 11:
        return <MirrorTriangleIcon4 size={cellSize} color={color} />
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