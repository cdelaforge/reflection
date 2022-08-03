import { useEffect } from "react";
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend'
import { isMobile } from 'react-device-detect';
import { useAppState } from "../../state/AppStateProvider";
import { MirrorSlashIcon, MirrorBackSlashIcon, MirrorVerticalIcon, MirrorHorizontalIcon, MirrorSquareIcon, BlackHoleIcon, PortalIcon } from "../../icons";
import { CellIconContainer } from "./Cell.Styles";

interface CellIconProps {
  index: number;
  row?: number;
  col?: number;
  stockIndex?: number;
}

function CellIcon({ index, row, col, stockIndex }: CellIconProps) {
  const { cellSize, mode, running } = useAppState();

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: "item",
    item: { index, row, col, stockIndex },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: () => {
      return !isMobile && mode !== "empty" && running && index > 0 && index < 7;
    },
  }), [index, stockIndex, mode, running]);

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview]);

  const getIconCode = () => {
    switch (index) {
      default:
        return <></>;
      case 1:
        return <MirrorSlashIcon size={cellSize} />
      case 2:
        return <MirrorBackSlashIcon size={cellSize} />
      case 3:
        return <MirrorVerticalIcon size={cellSize} />
      case 4:
        return <MirrorHorizontalIcon size={cellSize} />
      case 5:
        return <MirrorSquareIcon size={cellSize} />
      case 6:
        return <BlackHoleIcon size={cellSize} />
      case 7:
        return <PortalIcon size={cellSize} />
    }
  };

  return (
    <CellIconContainer ref={drag} isDragging={isDragging}>
      {getIconCode()}
    </CellIconContainer>
  );

}

export default CellIcon;