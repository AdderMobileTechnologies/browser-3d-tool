import React from "react";
import "./components/minimum.css";

import MainMinimal from "./components/main_minimal";
import Container from "@material-ui/core/Container";
import "babylonjs-loaders";
//https://doc.babylonjs.com/features/npm_support#available-packages

function App() {
  return (
    <div className="App">
      <Container maxWidth="xl">
        <MainMinimal />
      </Container>
    </div>
  );
}

export default App;
