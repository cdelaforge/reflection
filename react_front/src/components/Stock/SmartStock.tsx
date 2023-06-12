import { StockArea } from "./Stock.Styles";
import { useAppState } from "../../state/AppStateProvider";
import { Transformations } from "../../helpers/Transformations";
import SmartStockCell from "../Cell/SmartStockCell";
import { compareData } from "../../models/Misc";
import { useEffect } from "react";

const direction: Record<string, number> = {
  "ArrowDown": 1,
  "ArrowRight": 1,
  "ArrowUp": -1,
  "ArrowLeft": -1,
}

function SmartStock() {
  const { mode, squaresCount, gridSize, cellSize, displayMode, stock, transformations, stockIndex, setStockIndex, elements } = useAppState();

  const incStock = (inc: number) => {
    const item = data.find((d) => d.index === stockIndex);
    let itemTypeIndex = itemTypes.findIndex((it) => it.val === item?.val);

    while (true) {
      itemTypeIndex += inc;

      if (itemTypeIndex >= itemTypes.length && inc > 0) {
        itemTypeIndex = 0;
      } else if (itemTypeIndex < 0 && inc < 0) {
        itemTypeIndex = itemTypes.length - 1;
      }

      const itemType = itemTypes[itemTypeIndex];
      if (!itemType) {
        break;
      }
      const d = data.find((d) => d.val === itemType?.val);
      if (d) {
        setStockIndex(d?.index);
        break;
      }
    }
  }

  const onKeydown = (evt: KeyboardEvent) => {
    const isTargetInput = evt.target && ["input", "textarea"].some(t => t === (evt.target as any).type);

    if (stockIndex !== undefined && !isTargetInput) {
      const inc = direction[evt.key];

      if (inc !== undefined) {
        incStock(inc);

        evt.preventDefault();
        evt.stopPropagation();
      }
    }
  };

  const onMousewheel = (evt: WheelEvent) => {
    if (stockIndex !== undefined) {
      console.log(evt.deltaY);
      const inc = evt.deltaY > 0 ? 1 : -1;

      incStock(inc);

      evt.preventDefault();
      evt.stopPropagation();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", onKeydown);
    document.getElementById('root')?.addEventListener("wheel", onMousewheel);

    return () => {
      document.removeEventListener("keydown", onKeydown);
      document.getElementById('root')?.removeEventListener("wheel", onMousewheel);
    };
  });

  if (mode === "view" || mode === "solution" || mode === "solutionOnly" || mode === "resting") {
    return <></>;
  }

  const transfoHelper = new Transformations(transformations);
  const data = stock.map((val, index) => ({ index, val, displayedVal: transfoHelper.getDisplayedIcon(val) })).sort(compareData);
  const itemTypes = elements.map((val, index) => ({ index, val, displayedVal: transfoHelper.getDisplayedIcon(val) })).sort(compareData);
  const lines = Math.ceil(itemTypes.length / (squaresCount + 2));
  const cells = itemTypes.map(t => t.displayedVal).map((type, index) => {
    const indexList = data.filter(d => d.displayedVal === type).map(d => d.index);
    return (
      <SmartStockCell key={`smart_${index}`} val={type} indexList={indexList} />
    );
  });

  const width = (displayMode === "landscape") ? cellSize * lines : gridSize;
  const height = (displayMode === "portrait") ? cellSize * lines : gridSize;

  if (stockIndex === undefined && data[0]) {
    setTimeout(() => setStockIndex(data[0].index), 1);
  }

  return <StockArea width={width} height={height} margin={10} padding={0} id="lrf_stock">{cells}</StockArea>;
}

export default SmartStock;