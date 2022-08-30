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
  display?: 'normal' | 'wrong' | 'solution';
}

function CellIcon({ val, row, col, stockIndex, display }: CellIconProps) {
  const { cellSize, mode, running, won } = useAppState();
  const color = display === "wrong" ? colors.wrong : (display === "solution" ? colors.solution : colors.black);

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: "item",
    item: { index: val, row, col, stockIndex },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: () => {
      return !isMobile && mode !== "empty" && mode !== "solution" && running && !won && val > 0 && val < 7;
    },
  }), [val, stockIndex, mode, running, won]);

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview]);

  const getIconCode = () => {
    switch (val) {
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

  return (
    <CellIconContainer ref={drag} transparent={isDragging || display === "wrong"}>
      {getIconCode()}
    </CellIconContainer>
  );
}

export default CellIcon;