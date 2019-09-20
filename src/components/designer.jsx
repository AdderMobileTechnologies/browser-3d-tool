/**
 * Designer
 * Purpose:
 * To manage the cascading select options available to the user during the design process.
 */
//import { Scene } from "babylonjs";
import React from "react";
import AdderLoader from "../models/adderLoader";
import UISelect from "./subcomponents/elements/UISelect";
import * as K from "../constants";
import axios from "axios";
import AdderAsset from "../models/adderAsset";
//import AdderSceneWrapper from "../models/adderSceneWrapper";
import Grid from "@material-ui/core/Grid"; //

import "./minimum.css";
import "./designer.css";

let scope;
class Designer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      adderSceneWrapper: {},
      isOnAdType: false,
      adType_options: [],
      isOnSubType: false,
      subType_options: [],
      isOnDetail: false,
      detail_options: [],
      gotDesignMeta: false
    };
    scope = this;
    this.getAdderSceneWrapper = props.getAdderSceneWrapper;
    this.detail_callback = this.detail_callback.bind(this);
  }

  resetDesign = () => {
    this.setState({
      isOnSubType: false,
      subType_options: [],
      isOnDetail: false,
      detail_options: [],
      gotDesignMeta: false
    });
  };
  adType_callback = data => {
    // console.log("adType_callback data:", data);
    this.props.callback("-1");
    if (data.selectedOption !== "-1") {
      this.resetDesign();

      let array = [];
      let element = {};

      element = { name: `select`, id: -1 };
      array.push(element);

      let adTypeSelectedOption = data.selectedOption;
      let subTypeData = this.state.designChoiceMeta.children[
        adTypeSelectedOption
      ].children;
      for (let i in subTypeData) {
        let sub_type = subTypeData[i].sub_type;
        element = { name: `${sub_type}`, id: i };
        array.push(element);
      }
      this.setState({
        isOnSubType: true,
        subType_options: array,
        adTypeSelectedOption: adTypeSelectedOption
      });
    }
  };
  subType_callback = data => {
    // console.log("subType_callback data:", data);
    if (data.selectedOption !== "-1") {
      let array = [];
      let element = {};

      element = { name: `select`, id: -1 };
      array.push(element);

      let subTypeSelectedOption = data.selectedOption;
      let detailData = this.state.designChoiceMeta.children[
        this.state.adTypeSelectedOption
      ].children[subTypeSelectedOption].children;
      for (let i in detailData) {
        let name = detailData[i].name;
        element = { name: `${name}`, id: i };
        array.push(element);
      }
      this.setState({
        isOnDetail: true,
        detail_options: array,
        subTypeSelectedOption: subTypeSelectedOption
      });
    }
  };
  detail_callback = data => {
    // console.log("detail_callback data:", data);
    if (data.selectedOption !== "-1") {
      //could just return the data here

      let assetSelected = data.selectedOption;
      let assetData = this.state.designChoiceMeta.children[
        this.state.adTypeSelectedOption
      ].children[this.state.subTypeSelectedOption].children[assetSelected];

      //console.log("assetSelected:", assetSelected);
      //send data to parent to name the 'model' after it's filepath property in the assetData.
      this.props.callback_withModelInfo(assetData);
      let adderSceneWrapper = this.props.adderSceneWrapper;
      adderSceneWrapper.getUUID();
      let adderAsset = new AdderAsset(
        assetData.dir,
        assetData.filename,
        assetData.filepath,
        assetData.position,
        assetData.rotation,
        assetData.scaling,
        assetData.behavior,
        adderSceneWrapper
      );
      let adderAssetObject = {};
      adderAssetObject.dir = assetData.dir;
      adderAssetObject.filename = assetData.filename;
      adderAssetObject.filepath = assetData.filepath;
      adderAssetObject.position = assetData.position;
      adderAssetObject.rotation = assetData.rotation;
      adderAssetObject.scaling = assetData.scaling;
      adderAssetObject.behavior = assetData.behavior;

      // console.log("adderAssetObject:", adderAssetObject);

      //console.log("WHAT DOES ADDER ASSET LOOK LIKE ? ");
      //console.log(adderAsset);
      //** */ this.loadScene(adderAsset);
      //TODO: declare what was selected.
      this.props.callback(
        this.state.adTypeSelectedOption,
        adderAsset,
        adderAssetObject
      );
      //LIKE TO : callback_withModelInfo :need the mesh_ids to select from buttons
    }
  };

  // loadScene = adderAsset => {
  //   this.props.adderSceneWrapper.getUUID();
  //   let adderLoader = new AdderLoader(this.props.adderSceneWrapper);
  //   adderLoader.addSingleModel(adderAsset);
  // };

  componentDidMount() {
    let scope = this;
    this.setState({
      adderSceneWrapper: this.getAdderSceneWrapper()
    });
    //perform call to meta server for 'ad type' data.
    let promise_designChoices = new Promise(function(resolve, reject) {
      const url = `${K.META_URL}/meta/design`;
      axios
        .get(url)
        .then(response => response.data)
        .then(data => {
          resolve(data);
        });
    });
    promise_designChoices.then(function(value) {
      promise_designChoices_callback(value);
      //save meta data for later referencing
      scope.setState({
        designChoiceMeta: value
      });
    });
    function promise_designChoices_callback(value) {
      //create the top level choices for the design process. ie. 'ad_type' Vehicle,Billboard, etc.
      let array = [];
      let element = {};

      element = { name: `select`, id: -1 };
      array.push(element);

      for (let i in value.children) {
        let ad_type = value.children[i].ad_type;
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
      <div className="designer">
        <hr />
        <Grid container>
          <Grid item xs={4}>
            {this.state.isOnAdType && (
              <UISelect
                id={"ad_type"}
                options={this.state.adType_options}
                callback={this.adType_callback}
              ></UISelect>
            )}
          </Grid>
          <Grid
            item
            xs={4}
            style={{
              borderLeft: "solid 1px #ccc",
              borderRight: "solid 1px #ccc",
              paddingLeft: "5px",
              paddingRight: "5px"
            }}
          >
            {this.state.isOnSubType && (
              <UISelect
                id={"sub_type"}
                options={this.state.subType_options}
                callback={this.subType_callback}
              ></UISelect>
            )}
          </Grid>
          <Grid item xs={4}>
            {this.state.isOnDetail && (
              <UISelect
                id={"detail"}
                options={this.state.detail_options}
                callback={this.detail_callback}
              ></UISelect>
            )}
          </Grid>
        </Grid>
        <hr style={{ marginTop: "25px" }} />
      </div>
    );
  }
}

export default Designer;
