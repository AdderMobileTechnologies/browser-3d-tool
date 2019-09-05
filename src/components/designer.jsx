import React from "react";
import AdderLoader from "../models/adderLoader";
import UISelect from "./subcomponents/elements/UISelect";
import * as K from "./constants";
import axios from "axios";

class Designer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scene: props.scene,
      isOnAdType: false,
      adType_options: [],
      isOnSubType: false,
      subType_options: [],
      isOnDetail: false,
      detail_options: [],
      gotDesignMeta: false
    };
    this.setScene = props.setScene;
    this.getScene = () => {
      return this.state.scene;
    };
    console.log("this scene:", this.state.scene);
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
    console.log(typeof data.selectedOption);
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
      console.log("detailData:", detailData);
      for (let i in detailData) {
        // var detail = detailData[i].detail;
        var name = detailData[i].name;
        element = { name: `${name}`, id: i };
        array.push(element);
      }
      console.log("array:", array);
      this.setState({
        isOnDetail: true,
        detail_options: array,
        subTypeSelectedOption: subTypeSelectedOption
      });

      console.log("detailData:::::", detailData);
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
      ///////////////////////////////////////////////////////////////////////////////////////
      // Now Load:  assetData.metafile
      ///////////////////////////////////////////////////////////////////////////////////////
      this.loadScene(assetData);
      //I need a function I can pass the babylon file info to , inorder to load it.
    }
  };

  loadScene = assetData => {
    console.log("this:", this);
    // let scene = this.getScene;
    /*
 dir,
      filename,
      position,
      rotation,
      scaling,
      scene
    */
    let adderLoader = new AdderLoader(this.props.scene);
    let dir = assetData.dir;
    let filename = assetData.filename;
    let position = assetData.position;
    let rotation = assetData.rotation;
    let scaling = assetData.scaling;
    let scene = assetData.scene;

    adderLoader.addSingleModel(
      dir,
      filename,
      position,
      rotation,
      scaling,
      scene
    );
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

/* LIFECYCLE METHODS:
	componentWillReceiveProps(){ }
	componentWillMount(){ }
	componentDidMount(){ }
	componentWillUpdate(){ }
	componentDidUpdate(){ }
	componentWillUnmount(){ }
*/
