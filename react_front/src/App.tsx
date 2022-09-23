
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import './App.css';
import { Grid, Stock } from "./components";
import { AppArea } from "./App.styles";
import { useAppState } from "./state/AppStateProvider";
import { CustomDragLayer } from "./CustomDragLayer";

const getTransform = (rotate: number, flip: number) => {
  const result: string[] = [];

  if (rotate) {
    result.push(`rotate(${rotate}deg)`);
  }

  if (flip === 1) {
    result.push("scaleX(-1)");
  } else if (flip === 2) {
    result.push("scaleY(-1)");
  }

  return result.join(' ');
};

const getReverseTransform = (rotate: number, flip: number) => {
  const result: string[] = [];

  if (flip === 1) {
    result.push("scaleX(-1)");
  } else if (flip === 2) {
    result.push("scaleY(-1)");
  }

  if (rotate) {
    result.push(`rotate(${-rotate}deg)`);
  }

  return result.join(' ');
};

function App() {
  const { displayMode, rotate, flip } = useAppState();
  const transformGrid = getTransform(rotate, flip);
  const transformNumbers = getReverseTransform(rotate, flip);

  return (
    <DndProvider backend={HTML5Backend}>
      <AppArea mode={displayMode}>
        <Stock transform={transformNumbers}></Stock>
        <Grid transformGrid={transformGrid} transformNumbers={transformNumbers}></Grid>
      </AppArea>
      <CustomDragLayer />
    </DndProvider>
  );
}

export default App;
