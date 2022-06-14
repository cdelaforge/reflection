import React from 'react';

import './App.css';
import { Grid, Stock } from "./components";
import { AppArea } from "./App.styles";
import { useAppState } from "./state/AppStateProvider";

function App() {
  const { displayMode } = useAppState();

  return (
    <AppArea mode={displayMode}>
      <Stock></Stock>
      <Grid></Grid>
    </AppArea>
  );
}

export default App;
