import './App.css';
import { Grid, Stock } from "./components";
import { AppArea } from "./App.styles";
import { useAppState } from "./state/AppStateProvider";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CustomDragLayer } from "./CustomDragLayer";

function App() {
  const { displayMode } = useAppState();

  return (
    <DndProvider backend={HTML5Backend}>
      <AppArea mode={displayMode}>
        <Stock></Stock>
        <Grid></Grid>
      </AppArea>
      <CustomDragLayer />
    </DndProvider>
  );
}

export default App;
