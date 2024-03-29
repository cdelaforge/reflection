
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import './App.css';
import { Grid, Stock, SmartStock } from "./components";
import { AppArea } from "./App.styles";
import { useAppState } from "./state/AppStateProvider";
import { CustomDragLayer } from "./CustomDragLayer";
import { Transformations } from "./helpers/Transformations";

function App() {
  const { displayMode, transformations, smart } = useAppState();
  const transfoHelper = new Transformations(transformations);
  const transformation = transfoHelper.getTransform();
  const reverseTransformation = transfoHelper.getReverseTransform();

  return (
    <DndProvider backend={HTML5Backend}>
      <AppArea mode={displayMode}>
        {!smart && <Stock />}
        {smart && <SmartStock />}
        <Grid transformation={transformation} reverseTransformation={reverseTransformation}></Grid>
      </AppArea>
      <CustomDragLayer />
    </DndProvider>
  );
}

export default App;
