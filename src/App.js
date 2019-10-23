import React from "react";
import "./components/minimum.css";

//import Main from "./components/main";
import Main from "./components/Main";
import Container from "@material-ui/core/Container";
import "babylonjs-loaders";

import Login from "./authentication/login.jsx"

//https://doc.babylonjs.com/features/npm_support#available-packages

function App() {
  return (
    <div className="App">
      <Container maxWidth="xl">
        {/** <Main /> */}
       {/** <Login />  */}
      
       
      </Container>
    </div>
  );
}

export default App;
