import React from "react";
import * as K from "./constants";
import axios from "axios";
import SceneFast from "./SceneFast";
import Grid from "@material-ui/core/Grid"; //
import AdderLogoAndName from "../assets/Adder_3D_Tool2/AdderLogoTransparent.png";
import UISelect from "./subcomponents/elements/UISelect";

import AdderLoader from "../models/adderLoader";

class MainMinimal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scene: {},
      isOnAdType: false,
      adType_options: [],
      isOnSubType: false,
      subType_options: [],
      isOnDetail: false,
      detail_options: [],
      gotDesignMeta: false
    };

    this.setScene = this.setScene.bind(this);
    this.adType_callback = this.adType_callback.bind(this);
    this.adType_options = null;
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
  adType_callback = data => {
    console.log("adType_callback data:", data);

    var array = [];
    var element = {};
    var adTypeSelectedOption = data.selectedOption;
    var subTypeData = this.state.designChoiceMeta.children[adTypeSelectedOption]
      .children;
    for (let i in subTypeData) {
      console.log("subTypeData[i]:", subTypeData[i]);
      var sub_type = subTypeData[i].sub_type;
      element = { name: `${sub_type}`, id: i };
      array.push(element);
    }
    this.setState({
      isOnSubType: true,
      subType_options: array,
      adTypeSelectedOption: adTypeSelectedOption
    });
  };
  subType_callback = data => {
    console.log("subType_callback data:", data);
    var array = [];
    var element = {};
    var subTypeSelectedOption = data.selectedOption;
    var detailData = this.state.designChoiceMeta.children[
      this.state.adTypeSelectedOption
    ].children[subTypeSelectedOption].children;
    console.log("detailData:", detailData);
    for (let i in detailData) {
      var detail = detailData[i].detail;
      element = { name: `${detail}`, id: i };
      array.push(element);
    }
    console.log("array:", array);
    this.setState({
      isOnDetail: true,
      detail_options: array,
      subTypeSelectedOption: subTypeSelectedOption
    });

    console.log("detailData:::::", detailData);
  };
  detail_callback = data => {
    console.log("detail_callback data:", data);
    var assetSelected = data.selectedOption;
    var assetData = this.state.designChoiceMeta.children[
      this.state.adTypeSelectedOption
    ].children[this.state.subTypeSelectedOption].children[assetSelected];

    console.log("assetData:", assetData);
    ///////////////////////////////////////////////////////////////////////////////////////
    // Now Load:  assetData.metafile
    ///////////////////////////////////////////////////////////////////////////////////////
    let adderLoader = new AdderLoader(this.state.scene);
    let fooey = adderLoader.returnArg(assetData);
    console.log(fooey);
  };

  componentDidMount() {
    let scope = this;
    var promise_designChoices = new Promise(function(resolve, reject) {
      const url = `${K.API_URL}/meta/design`;
      axios
        .get(url)
        .then(response => response.data)
        .then(data => {
          resolve(data);
        });
    });
    promise_designChoices.then(function(value) {
      console.log("value from api call for design ", value);
      promise_designChoices_callback(value);
      scope.setState({
        designChoiceMeta: value
      });
    });
    function promise_designChoices_callback(value) {
      var array = [];
      var element = {};
      for (let i in value.children) {
        var ad_type = value.children[i].ad_type;
        element = { name: `${ad_type}`, id: i };
        array.push(element);
      }
      scope.setState({
        isOnAdType: true,
        adType_options: array
      });
    }
  }

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
          <Grid item xs={8}>
            <div className="babylonjsCanvasContainer">
              <SceneFast
                setScene={this.setScene}
                scene={this.state.scene}
              ></SceneFast>
            </div>
          </Grid>
          <Grid item xs={4}>
            <div>sidebar</div>
            <div>
              {this.state.isOnAdType && (
                <UISelect
                  id={"ad_type"}
                  options={this.state.adType_options}
                  callback={this.adType_callback}
                ></UISelect>
              )}
              {this.state.isOnSubType && (
                <UISelect
                  id={"sub_type"}
                  options={this.state.subType_options}
                  callback={this.subType_callback}
                ></UISelect>
              )}

              {this.state.isOnDetail && (
                <UISelect
                  id={"detail"}
                  options={this.state.detail_options}
                  callback={this.detail_callback}
                ></UISelect>
              )}
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
