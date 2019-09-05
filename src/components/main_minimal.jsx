import React from "react";

import SceneFast from "./SceneFast";
import Grid from "@material-ui/core/Grid"; //
import AdderLogoAndName from "../assets/Adder_3D_Tool2/AdderLogoTransparent.png";
import UISelect from "./subcomponents/elements/UISelect";

import AdderLoader from "../models/adderLoader";
import AdderMeta from "../models/adderMeta";
import Designer from "./designer"; //handles the selects for choosing a design ad type.

class MainMinimal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scene: {}
    };

    this.setScene = this.setScene.bind(this);
  }
  setScene = scene => {
    this.setState(
      {
        scene: scene
      },
      () => {
        console.log("async setState fror scene...");
      }
    );
  };

  render() {
    return (
      <div>
        <div>main_minimal.jsx</div>
        <Grid
          container
          spacing={0}
          id="ParentContainer"
          style={{ border: " dotted 1px  lightblue " }}
        >
          {/** .UI-Header Grid */}
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
              <SceneFast
                setScene={this.setScene}
                scene={this.state.scene}
              ></SceneFast>
            </div>
          </Grid>
          <Grid item xs={4}>
            <Designer
              setScene={this.setScene}
              scene={this.state.scene}
            ></Designer>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default MainMinimal;
