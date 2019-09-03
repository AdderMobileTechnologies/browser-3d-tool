import React from "react";
import SceneFast from "./SceneFast";
import Grid from "@material-ui/core/Grid"; //
import AdderLogoAndName from "../assets/Adder_3D_Tool2/AdderLogoTransparent.png";

class MainMinimal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scene: {}
    };
    this.setScene = this.setScene.bind(this);
  }
  setScene = scene => {
    console.log("trying to set scene  :", scene);
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
        <div>MainMinimal</div>
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
          <Grid item xs={12}>
            <div className="babylonjsCanvasContainer">
              <SceneFast setScene={this.setScene}></SceneFast>
            </div>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default MainMinimal;

/* LIFECYCLE METHODS:
	componentWillReceiveProps(){ }
	componentWillMount(){ }
	componentDidMount(){ }
	componentWillUpdate(){ }
	componentDidUpdate(){ }
	componentWillUnmount(){ }
*/
