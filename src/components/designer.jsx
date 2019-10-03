/**
 * Designer
 * Purpose:
 * To manage the cascading select options available to the user during the design process.
 */
//import { Scene } from "babylonjs";
import React from "react";
//import AdderLoader from "../models/adderLoader";
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
      gotDesignMeta: false,
      designChoiceMeta: {}
    };
    scope = this;
    this.getAdderSceneWrapper = props.getAdderSceneWrapper;
    this.detail_callback = this.detail_callback.bind(this);
    this.reset_adType = this.reset_adType.bind(this);
    this.reset_subType = this.reset_subType.bind(this);
    this.continue_adType_callback = this.continue_adType_callback.bind(this);
    this.triggerChange = this.triggerChange.bind(this);
    props.register(this.triggerChange);
  }

  async reset_adType(data) {
    await this.setState(
      {
        isOnSubType: false,
        subType_options: [],
        isOnDetail: false,
        detail_options: [],
        gotDesignMeta: false
      },
      () => {
        scope.continue_adType_callback(data);
      }
    );
  }
  selectElement(id, valueToSelect) {
    let element = document.getElementById(id);
    element.value = valueToSelect;
  }
  triggerChange(data) {
    console.log("designer.jsx-> triggerChange() args:", data);
    //this.selectElement("ad_type", 1);
    // this.selectElement(data.id, data.value);
    console.log("___data:", data);
    switch (data.id) {
      case "ad_type":
        console.log(data.id + " id selected....");
        this.selectElement(data.id, data.selectedOption);
        console.log("this.state:", this.state);
        //NOPE:  this.reset_adType(data); errpr: can not read children of undefined .
        /* this.setState({
          isOnSubType: true
        }); */
        /// this.reMount(data); // like componentDidMount goes and gets the meta data....for designs
        // ASYNC ISSUE: this.adType_callback(data);
        // NOPE: this.reloadDesignChoiceMeta(); // ERROR: Cannot read property 'children' of undefined ...  continue_adType_callback
        scope.reloadDesignChoiceMeta(data);
        // this.adType_callback(data); //ERROR: Cannot read property 'children' of undefined inside ... continue_adType_callback
        //somehow the desginChoiceMeta is undefined.

        break;
      case "sub_type":
        console.log(data.id + " id selected....");
        break;
      case "detail_type":
        console.log(data.id + " id selected....");
        break;
      default:
        break;
    }
  }
  reloadDesignChoiceMeta(data) {
    console.log(
      "reloadDesginChoiceMeta............................................."
    );
    let scope = this;
    this.setState({
      adderSceneWrapper: this.getAdderSceneWrapper()
    });
    //perform call to meta server for 'ad type' data.
    let promise_designChoices2 = new Promise(function(resolve, reject) {
      const url = `${K.META_URL}/meta/design`;
      axios
        .get(url)
        .then(response => response.data)
        .then(data => {
          resolve(data);
        });
    });
    promise_designChoices2.then(function(value) {
      promise_designChoices_callback2(value);
      //save meta data for later referencing
      scope.setState(
        {
          designChoiceMeta: value
        },
        () => {
          console.log("(A1)reloadDesignChoiceMeta async complete.....");
          scope.adType_callback(data);
        }
      );
    });
    function promise_designChoices_callback2(value) {
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
      scope.setState(
        {
          isOnAdType: true,
          adType_options: array
        },
        () => {
          console.log("(A2)reloadDesignChoiceMeta async complete.....");
        }
      );
    }
  }
  // callbackReMount(data, scope) {
  //   scope.adType_callback(data);
  // }
  //reset_adType needed to be an async await.

  continue_adType_callback = data => {
    //console.log("async await callback ....");
    console.log("(B)continue_adType_callback: data:", data);
    console.log("this.state:", this.state);

    if (data.selectedOption !== "-1") {
      let array = [];
      let element = {};

      element = { name: `select`, id: -1 };
      array.push(element);

      var adTypeSelectedOption = data.selectedOption;
      if (adTypeSelectedOption == "undefined") {
        console.log("ALTERNATIVE ASSIGNMENT: ");
        adTypeSelectedOption = data.selectedOption;
      }
      adTypeSelectedOption = data.selectedOption;
      console.log("this:", this);
      console.log("scope:", scope);
      console.log("scope.state:", scope.state);
      console.log("adTypeSelectedOption:", adTypeSelectedOption);
      console.log(
        "scope.state.designChoiceMeta:",
        scope.state.designChoiceMeta
      );
      console.log(
        "scope.state.designChoiceMeta.children:",
        scope.state.designChoiceMeta.children
      );
      console.log("adTypeSelectedOption:", adTypeSelectedOption);
      console.log(
        "scope.state.designChoiceMeta.children[adTypeSelectedOption]:",
        scope.state.designChoiceMeta.children[adTypeSelectedOption]
      );

      console.log("-------------------------");
      let subTypeData =
        scope.state.designChoiceMeta.children[adTypeSelectedOption].children;
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

  adType_callback = data => {
    // console.log("adType_callback data:", data);
    this.props.callback("-1");
    console.log("designer: adType_callback(): data:", data);
    this.reset_adType(data);
  };
  //-----------------------------------------------
  async reset_subType(data) {
    await this.setState(
      {
        isOnDetail: false,
        detail_options: [],
        gotDesignMeta: false
      },
      () => {
        scope.continue_subType_callback(data);
      }
    );
  }
  continue_subType_callback = data => {
    //console.log("async await callback ....");
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
  subType_callback = data => {
    console.log("subType_callback data:", data);
    //try resetSubType(data)
    this.reset_subType(data);
  };
  detail_callback = data => {
    // console.log("detail_callback data:", data);
    if (data.selectedOption !== "-1") {
      //could just return the data here
      //console.log("==>> designer:jsx: detail_callback() : data:", data);
      console.log("designer.jsx : detail_callback()");
      console.log("this.state.designChoiceMeta:", this.state.designChoiceMeta);

      let assetSelected = data.selectedOption;
      //creating the assetData with the selections made by pulling them from the designChoiceMeta
      let assetData = this.state.designChoiceMeta.children[
        this.state.adTypeSelectedOption
      ].children[this.state.subTypeSelectedOption].children[assetSelected];

      //console.log("assetSelected:", assetSelected);
      //send data to parent to name the 'model' after it's filepath property in the assetData.

      console.log(
        "==>> designer:jsx: detail_callback() : assetData:",
        assetData
      );

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

  // reMount(data) {
  //   let scope = this;
  //   let passingData = data;
  //   this.setState({
  //     adderSceneWrapper: this.getAdderSceneWrapper()
  //   });
  //   //perform call to meta server for 'ad type' data.
  //   let promise_designChoices = new Promise(function(resolve, reject) {
  //     const url = `${K.META_URL}/meta/design`;
  //     axios
  //       .get(url)
  //       .then(response => response.data)
  //       .then(data => {
  //         resolve(data);
  //       });
  //   });
  //   promise_designChoices.then(function(value) {
  //     promise_designChoices_callback(value);
  //     //save meta data for later referencing
  //     scope.setState({
  //       designChoiceMeta: value
  //     });
  //   });
  //   function promise_designChoices_callback(value) {
  //     //create the top level choices for the design process. ie. 'ad_type' Vehicle,Billboard, etc.
  //     let array = [];
  //     let element = {};

  //     element = { name: `select`, id: -1 };
  //     array.push(element);

  //     for (let i in value.children) {
  //       let ad_type = value.children[i].ad_type;
  //       element = { name: `${ad_type}`, id: i };
  //       array.push(element);
  //     }
  //     scope.setState(
  //       {
  //         isOnAdType: true,
  //         adType_options: array
  //       },
  //       () => {
  //         console.log("reMount....after async:");
  //        // scope.callbackReMount(passingData, scope);
  //       }
  //     );
  //   }
  // }
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
