import React from "react";
import "./components/minimum.css";

//import Main from "./components/main";
import Main from "./components/Main";
import Container from "@material-ui/core/Container";
import "babylonjs-loaders";

import Login from "./authentication/login.jsx";

//https://doc.babylonjs.com/features/npm_support#available-packages
//maxWidth="xl"
function App() {
  return (
    <div className="App">
      <Container maxWidth={"xl"} children="none"></Container>
    </div>
  );
}

export default App;
