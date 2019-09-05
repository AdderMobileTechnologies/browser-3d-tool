/**
 * Designer
 * Purpose:
 * To manage the cascading select options available to the user during the design process.
 */

import React from "react";
import AdderLoader from "../models/adderLoader";
import UISelect from "./subcomponents/elements/UISelect";
import * as K from "../constants";
import axios from "axios";
import AdderAsset from "../models/asset";

class Designer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      adderSceneWrapper: props.adderSceneWrapper,
      isOnAdType: false,
      adType_options: [],
      isOnSubType: false,
      subType_options: [],
      isOnDetail: false,
      detail_options: [],
      gotDesignMeta: false
    };
    this.setScene = props.setScene;
    this.getAdderSceneWrapper = () => {
      return this.state.adderSceneWrapper;
    };
    console.log("props:", props);
    this.detail_callback = this.detail_callback.bind(this);
  }

  resetDesign = () => {
    //clear values for levels under 'ad_type'
    this.setState({
      isOnSubType: false,
      subType_options: [],
      isOnDetail: false,
      detail_options: [],
      gotDesignMeta: false
    });
  };
  adType_callback = data => {
    console.log("adType_callback data:", data);
    if (data.selectedOption != "-1") {
      this.resetDesign();

      var array = [];
      var element = {};

      element = { name: `select`, id: -1 };
      array.push(element);

      var adTypeSelectedOption = data.selectedOption;
      var subTypeData = this.state.designChoiceMeta.children[
        adTypeSelectedOption
      ].children;
      for (let i in subTypeData) {
        var sub_type = subTypeData[i].sub_type;
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
    console.log("subType_callback data:", data);
    if (data.selectedOption != "-1") {
      var array = [];
      var element = {};

      element = { name: `select`, id: -1 };
      array.push(element);

      var subTypeSelectedOption = data.selectedOption;
      var detailData = this.state.designChoiceMeta.children[
        this.state.adTypeSelectedOption
      ].children[subTypeSelectedOption].children;
      for (let i in detailData) {
        var name = detailData[i].name;
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
    console.log("detail_callback data:", data);
    if (data.selectedOption != "-1") {
      var assetSelected = data.selectedOption;
      var assetData = this.state.designChoiceMeta.children[
        this.state.adTypeSelectedOption
      ].children[this.state.subTypeSelectedOption].children[assetSelected];

      console.log("assetData:", assetData);

      let adderAsset = new AdderAsset(
        assetData.dir,
        assetData.filename,
        assetData.position,
        assetData.rotation,
        assetData.scaling,
        assetData.behavior,
        this.state.adderSceneWrapper
      );

      this.loadScene(adderAsset);
    }
  };

  loadScene = adderAsset => {
    let adderLoader = new AdderLoader(this.props.adderSceneWrapper);
    adderLoader.addSingleModel(adderAsset);
  };

  componentDidMount() {
    let scope = this;
    //perform call to meta server for 'ad type' data.
    var promise_designChoices = new Promise(function(resolve, reject) {
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
      var array = [];
      var element = {};

      element = { name: `select`, id: -1 };
      array.push(element);

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
      <div className="designer">
        <div>designer.jsx</div>
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
    );
  }
}

export default Designer;
