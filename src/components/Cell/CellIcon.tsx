import { useAppState } from "../../state/AppStateProvider";
import { MirrorSlashIcon, MirrorBackSlashIcon, MirrorVerticalIcon, MirrorHorizontalIcon, MirrorSquareIcon, BlackHoleIcon, PortalIcon } from "../../icons";

interface CellIconProps {
  index: number;
}

const renderEmpty = () => {
  return <></>;
};

function CellIcon({ index }: CellIconProps) {
  const { cellSize } = useAppState();

  switch (index) {
    default:
      return renderEmpty();
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
}

export default CellIcon;