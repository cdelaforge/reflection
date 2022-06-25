import './App.css';
import { Grid, Stock, GameStatus } from "./components";
import { AppArea } from "./App.styles";
import { useAppState } from "./state/AppStateProvider";

function App() {
  const { displayMode } = useAppState();

  return (
    <AppArea mode={displayMode}>
      <Stock></Stock>
      <Grid></Grid>
      {false && <GameStatus></GameStatus>}
    </AppArea>
  );
}

export default App;
