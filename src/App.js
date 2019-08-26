import React from 'react';
import './components/minimum.css'
import Main from './components/main';
import Container from '@material-ui/core/Container';
import 'babylonjs-loaders';
//https://doc.babylonjs.com/features/npm_support#available-packages

function App() {
  return (
    <div className="App">
      <Container maxWidth="xl">
        <Main />
      </Container>
    </div>
  );
}

export default App;