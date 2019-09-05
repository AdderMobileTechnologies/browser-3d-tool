import React from "react";
import { Scene } from "babylonjs";

import SceneCanvas from "./SceneCanvas";
import Grid from "@material-ui/core/Grid"; //
import AdderLogoAndName from "../assets/Adder_3D_Tool2/AdderLogoTransparent.png";
import Designer from "./designer"; //handles the selects for choosing a design ad type.

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scene: {},
      sceneIsSet: false
    };

    this.setScene = this.setScene.bind(this);
  }
  setScene = scene => {
    this.setState({
      scene: scene
    });
  };

  render() {
    // Note: the 'scene' is not set until the 'SceneCanvas' callsback with the setScene function.
    var sceneIsSet = false;
    if (this.state.scene instanceof Scene) {
      sceneIsSet = true;
    }
    return (
      <div>
        <div>main.jsx</div>
        <Grid
          container
          spacing={0}
          id="ParentContainer"
          style={{ border: " dotted 1px  lightblue " }}
        >
          <Grid
            container
            item
            xs={12}
            id="Header"
            style={{ marginTop: "10px", border: " dotted 1px  lightblue " }}
          >
            <Grid item xs={4} id="LogoContainer">
              <img
                src={AdderLogoAndName}
                style={{ height: "auto", width: "100%" }}
                className="AdderLogoAndName"
                id={"AdderLogo"}
                alt="Adder Logo"
              />
            </Grid>
          </Grid>{" "}
          <Grid item xs={8}>
            <div className="babylonjsCanvasContainer">
              <SceneCanvas
                setScene={this.setScene}
                scene={this.state.scene}
              ></SceneCanvas>
            </div>
          </Grid>
          <Grid item xs={4}>
            {sceneIsSet && <Designer scene={this.state.scene}></Designer>}
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default Main;
