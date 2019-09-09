import React from "react";
//import { Scene } from "babylonjs";
import AdderSceneWrapper from "../models/adderSceneWrapper";

//import SceneCanvas from "./SceneCanvas";
import Grid from "@material-ui/core/Grid"; //
import AdderLogoAndName from "../assets/Adder_3D_Tool2/AdderLogoTransparent.png";
import Designer from "./designer"; //handles the selects for choosing a design ad type.
import "tui-image-editor/dist/tui-image-editor.css";
import AdderImageEditor from "./AdderImageEditor";
import AdderSkyBox from "../models/adderSkybox";
import AdderMeta from "../models/adderMeta";

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sceneIsSet: false,
      adderSceneWrapper: {}
    };

    this.setScene = this.setScene.bind(this);
  }
  setScene = scene => {
    let adderSceneWrapper = new AdderSceneWrapper(scene);

    this.setState(
      {
        adderSceneWrapper: adderSceneWrapper
      },
      () => {
        let adderMeta = new AdderMeta(this.state.adderSceneWrapper);
        adderMeta.getEnvironment();
        let scene = this.state.adderSceneWrapper.getScene();
        let adderSkybox = new AdderSkyBox(scene, "countrybox", 1000.0);
        adderSkybox.getSkybox();
      }
    );
  };

  render() {
    // Note: the 'scene' is not set until the 'SceneCanvas' callsback with the setScene function.
    var sceneIsSet = false;
    if (this.state.adderSceneWrapper instanceof AdderSceneWrapper) {
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
              {/**
                <SceneCanvas
                setScene={this.setScene}
                adderSceneWrapper={this.state.adderSceneWrapper}
              ></SceneCanvas>
              */}
            </div>
          </Grid>
          {/**

          DEV: LEFT OFF HERE: 9-9-2019 12:08pm looking at the way that the adderSceneWrapper gets created initially and how it gets saved in state.
            <Grid item xs={4}>
            {sceneIsSet && (
              <Designer
                adderSceneWrapper={this.state.adderSceneWrapper}
              ></Designer>
            )}
          </Grid>
          */}
        </Grid>
      </div>
    );
  }
}

export default Main;
