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

  const onKeydown = (evt: KeyboardEvent) => {
    const isTargetInput = evt.target && ["input", "textarea"].some(t => t === (evt.target as any).type);

    if (stockIndex !== undefined && !isTargetInput) {
      const inc = direction[evt.key];

      if (inc !== undefined) {
        const item = data.find((d) => d.index === stockIndex);
        let itemTypeIndex = itemTypes.findIndex((it) => it.val === item?.val);

        while (itemTypeIndex >= 0) {
          itemTypeIndex += inc;
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

        evt.preventDefault();
        evt.stopPropagation();
      }
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", onKeydown);

    return () => {
      document.removeEventListener("keydown", onKeydown);
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