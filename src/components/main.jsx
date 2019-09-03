import React from "react";
import SceneFast from "./SceneFast";

//region: MaterialUI Components
import Grid from "@material-ui/core/Grid"; //
import GridList from "@material-ui/core/GridList"; // The 'GridList' is the MUI(Material UI), premade component used to display sliding row of snapshots.
import GridListTile from "@material-ui/core/GridListTile";
import GridListTileBar from "@material-ui/core/GridListTileBar";
import IconButton from "@material-ui/core/IconButton";
//import StarBorderIcon from '@material-ui/icons/StarBorder';

import AdderLogoAndName from "../assets/Adder_3D_Tool2/AdderLogoTransparent.png";
import UIButton from "./subcomponents/UIElements/UIButton"; // A custom class created in version 1 for handling button actions.
import MUIPopover from "./subcomponents/UIElements/MUIPopover"; // The MUIPopover is a button overlaying the babylon canvas that houses the functionality for selecting environment .
import UISideBar from "./subcomponents/UISideBar"; // The UISidebar is a component that houses all the functionailty for design name, type of model to use, etc....
import { IntersectionInfo } from "babylonjs";

import * as K from "./constants";
import UIGuiOverlay from "./subcomponents/UIGuiOverlay";
//region: Render Methods
const UIGridList = K.UIGridList;
const tileData = K.tileData;

class Main extends React.Component {
  //TODO-9-3: ad_type
  constructor(props) {
    super(props);
    this.state = {
      userSession: {
        userInfo: [],
        userModel: {
          user_id: "",
          username: ""
        },
        designs: [],
        designActions: [],
        designModel: {
          designName: "Design One A",
          adTypeFilepath: "",
          environment: "",
          environment_type: "",
          environmentFilepath: "",
          meshes: [],
          screenShots: [],
          ui_selections: {},
          ui_status: {},
          action: ""
        }
      },
      Ad_Scene: {
        name: "Advertisement Scene A"
      },
      appState: {
        scene_number: 99999,
        ad_type: "default",
        editState: "standby",
        editStateOptions: [
          "standby",
          "willEdit",
          "editing",
          "didEdit",
          "changingScene"
        ],
        editByRatio: false,
        editByMeshPick: false,

        currentRatio: "medium",
        ratioSettings: ["small", "medium", "large"],

        mesh_parent: {},
        designState: "standby",
        designStateOptions: [
          "standby",
          "designStarted",
          "designSaved",
          "designCanceled"
        ],
        ui_selections: {
          ad_type: "",
          ad_subtype: "",
          ad_detail: "",
          ad_asset: {
            name: "",
            babylonfile: ""
          },
          env_type: "",
          env_subtype: "",
          env_asset: {
            name: "",
            babylonfile: ""
          }
        },
        ui_status: {
          ad_type_active: true,
          ad_type_selected: false,
          ad_subtype_selected: false,
          ad_detail_selected: false,
          ad_asset_selected: false,
          env_type_active: true,
          env_type_selected: false
        }
      }
    };

    this.editingDesignName = this.editingDesignName.bind(this);
    this.changeDesignName = this.changeDesignName.bind(this);
    this.manageCascadingSelects_AdType = this.manageCascadingSelects_AdType.bind(
      this
    );
    this.iconDelete = this.iconDelete.bind(this);
    this.changeAdType = this.changeAdType.bind(this);
    this.saveDesignModelUI = this.saveDesignModelUI.bind(this);
    this.actionSave = this.actionSave.bind(this);
    this.setStateScene = this.setStateScene.bind(this);
  }
  setStateScene(scene) {
    console.log(typeof scene);
    console.log(scene);
    if (scene != null) {
      console.log("scene is NOT null");
      //  this.setState({
      //   scene: scene
      // });
    } else {
      console.log("scene is null...");
    }
  }
  iconDelete() {
    //TODO: when deleting a scene, lights out over landscape but mountains stilll there.

    //hide screenshots
    var gridlist_root = window.document.querySelector(".MuiGridList-root");
    gridlist_root.innerHTML = "";

    // reset name
    var design_name_element = window.document.querySelector("#filled-name");
    design_name_element.value = "";
    design_name_element.innerHTML = "";

    var data = {};
    this.changeAdType(data);
  }
  async changeAdType(data) {
    console.log("- - - - - - - - - - - ASYNC changedAdType(data):");

    var doHardReset = false;
    if (doHardReset) {
      await this.hardResetState();
    } else {
      console.log("no hard reset");
    }

    if (typeof this.state.scene !== "undefined") {
      this.state.scene.dispose();
      //this.state.scene = null;
    } else {
      console.log("changeAdType return because scene undefined");
      return;
    }

    await this.setState(prevState => ({
      ...prevState,
      appState: {
        ...prevState.appState,
        editState: "changingState"
      }
    }));

    let sceneNumber;
    let adType;
    let filepath;
    let name;
    let suffix;
    let make;
    let model;
    let uvMapping = this.state.appState.currentRatio;
    //TODO:9-3
    console.log("data.selectedOption:", data.selectedOption);
    switch (data.selectedOption) {
      case "porsche":
        sceneNumber = 0;
        adType = "vehicle";
        filepath = "http://dbdev.adder.io/assets/porsche/porsche4.0.babylon";
        name = "porsche";
        make = "porsche";
        model = "911";
        suffix = "";
        break;
      case "billboard1":
        sceneNumber = 1;
        adType = "billboard";
        filepath =
          "http://dbdev.adder.io/assets/Billboard/Billboard.v1.1.babylon";
        name = "billboard";
        make = "generic";
        model = "generic";
        suffix = "";
        break;
      case "vw_toureg":
        sceneNumber = 2;
        adType = "vehicle";
        filepath =
          "http://dbdev.adder.io/assets/vw_toureg/vw_toureg-1.5.babylon";
        name = "vw";
        suffix = "_vw";
        make = "vw";
        model = "toureg";
        break;
      default:
        //DEFAULT
        sceneNumber = 0;
        adType = "vehicle";
        filepath = "http://dbdev.adder.io/assets/porsche/porsche4.0.babylon";
        name = "porsche";
        suffix = "";
        make = "porsche";
        model = "911";

        return;
    }

    this.setState(
      prevState => ({
        ...prevState,
        userSession: {
          ...prevState.userSession,
          designModel: {
            ...prevState.userSession.designModel,
            adTypeSceneNumber: sceneNumber,
            AdType: adType,
            adTypeFilepath: filepath,
            adTypeName: name,
            adTypeSuffix: suffix,
            action: "changeAdType"
          }
        }
      }),
      () => {
        console.log("async changeAdType:step 1");
        this.setState(
          prevState => ({
            ...prevState,
            appState: {
              ...prevState.appState,
              scene_number: sceneNumber,
              ad_type: adType
            }
          }),
          () => {
            console.log("async changeAdType:step 2");
            this.setState(
              prevState => ({
                ...prevState,
                Ad_Scene: {
                  ...prevState.Ad_Scene,
                  adType: adType,
                  scene_number: sceneNumber,
                  filepath: filepath,
                  name: name,
                  suffix: suffix,
                  make: make,
                  model: model,
                  uvMapping: uvMapping
                }
              }),
              () => {
                console.log("async changeAdType:step 3");
                console.log(
                  "TODO-9-3 should call makeBabylonTool.... per version 1 anyway."
                );
                this.makeBabylonTool(sceneNumber);
              }
            );
          }
        );
      }
    );
  }
  editingDesignName() {}

  changeDesignName() {}
  /** Cascading AdType   */

  manageCascadingSelects_AdType(data) {
    console.log("manageCascadingSelects data:", data);
    this.setState(
      prevState => ({
        ...prevState,
        appState: {
          ...prevState.appState,
          ui_selections: {
            ...prevState.appState.ui_selections,
            ad_type: data.ad_type,
            ad_subtype: data.ad_subtype,
            ad_detail: data.ad_detail,
            ad_asset: data.ad_asset
          }
        }
      }),
      () => {
        console.log("async step 1");
        this.setState(
          prevState => ({
            ...prevState,
            appState: {
              ...prevState.appState,
              ui_status: {
                ...prevState.appState.ui_status,
                ad_type_selected: data.ad_type_selected,
                ad_subtype_selected: data.ad_subtype_selected,
                ad_detail_selected: data.ad_detail_selected,
                ad_asset_selected: data.ad_asset_selected
              }
            }
          }),
          () => {
            console.log("async step 2");
            var ui_selections = this.state.appState.ui_selections;
            var ui_status = this.state.appState.ui_status;
            this.saveDesignModelUI(ui_selections, ui_status);

            //SAVE CHANGE ACTION
            this.actionSave();

            /* Change scene at DETAIL LEVEL instead of asset level.*/
            if (
              this.state.appState.ui_status.ad_asset_selected &&
              this.state.appState.ui_selections.ad_asset !== ""
            ) {
              //massage data to format it is expected in.
              //? do we really want a hard reset to fire at this point ? though ?
              let data = {};
              data.selectedOption = this.state.appState.ui_selections.ad_asset;
              this.changeAdType(data);
            } else {
              console.log("NOT CHANGING AD BECAUSE:");
              console.log(
                "this.state.appState.ui_status.ad_asset_selected=",
                this.state.appState.ui_status.ad_asset_selected
              );
              console.log(
                "this.state.appState.ui_selections.ad_asset=",
                this.state.appState.ui_selections.ad_asset
              );
            }
          }
        );
      }
    );
  }
  saveDesignModelUI(ui_selections, ui_status) {
    this.setState(
      prevState => ({
        ...prevState,
        userSession: {
          ...prevState.userSession,
          designModel: {
            ...prevState.userSession.designModel,
            ui_selections: ui_selections,
            ui_status: ui_status,
            action: "saveDesignModelUI"
          }
        }
      }),
      () => {
        console.log("async saveDesignModelUI");
      }
    );

    //-------------------------------------------
  }

  actionSave() {
    //The purpose to save a history of

    var design_obj = this.state.userSession.designModel;
    //const obj = {'design': design_obj};
    const newDesignsArray = this.state.userSession.designs.slice();
    newDesignsArray.push(design_obj); // Push the object
    this.setState(
      prevState => ({
        ...prevState,
        userSession: {
          ...prevState.userSession,
          designs: newDesignsArray
        }
      }),
      () => {
        //note: saves the entire 'userSession'
        let oldDesigns = JSON.parse(localStorage.getItem("designsArray")) || [];
        let newDesign = this.state.userSession.designModel;
        //push to local storage:
        oldDesigns.push(newDesign);
        localStorage.setItem("designsArray", JSON.stringify(oldDesigns));
      }
    );
  }
  //TODO:9-3 LEFT OFF HERE: constantly having to go get missing functions and values from version one code.

  componentDidMount() {}
  render() {
    return (
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
          <Grid item xs={5} id="Spacer">
            {/** center space unoccupied */}
          </Grid>
          {/**TODO: move inline styles to style sheet. */}
          <Grid item xs={3}>
            <Grid
              container
              style={{
                backgroundColor: "#afafaf",
                marginTop: "10px",
                height: "40px",
                padding: "0px",

                borderRadius: "16px",
                boxShadow: "3px 3px 8px #2f2f2f"
              }}
            >
              <Grid item xs={3}>
                <img
                  src={K.DefaultUserImage}
                  className="UserImage"
                  style={{ height: "40px" }}
                  alt="The User Profile"
                />
              </Grid>
              <Grid item xs={3}>
                <p
                  style={{
                    fontSize: "1em",
                    color: "#2f2f2f",
                    margin: "0px",
                    lineHeight: "40px",
                    textJustify: "center",
                    textAlign: "center"
                  }}
                >
                  Ed Jellico
                </p>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid
          item
          xs={9}
          id="xxxCanvasGrid"
          style={{ border: " dotted 1px  lightblue " }}
        >
          <Grid item xs={12}>
            <div className="xxxbabylonjsCanvasContainer">
              {/** .UI- the 3D Canvas Grid*/}
              <SceneFast setStateScene={this.setStateScene} />

              {/** TODO:
              Here I ran into issues with the inner react components all being desiged to call the same onClick event.
              It felt like a brick wall. May need to re-think the UIButton class(?). re-think trying to reduce this? 
              
                    <UIGuiOverlay
                      screenshotButtonPress={this.screenshotButtonPress}
                      iconCrop={this.iconCrop}
                      iconFormatColorFill={this.iconFormatColorFill}
                      iconTextFields={this.iconTextFields}
              />
              */}
              {/** .UI- Overlaying Icons on top of 3D Canvas */}

              <div className="gui-overlay">
                <UIButton
                  title="Screen Shot"
                  buttonText="Save Image"
                  onClick={this.screenshotButtonPress}
                  iconName="camera_alt"
                  classNames="icon_btn "
                />
                <UIButton
                  title="Crop Image"
                  buttonText="Crop Image"
                  onClick={this.iconCrop}
                  iconName="crop"
                  classNames="icon_btn dev_warning"
                />
                <UIButton
                  title="XXXX"
                  buttonText="XXXX"
                  onClick={this.iconFormatColorFill}
                  iconName="format_color_fill"
                  classNames="icon_btn dev_warning"
                />
                <UIButton
                  title="XXXX"
                  buttonText="XXXX"
                  onClick={this.iconTextFields}
                  iconName="text_fields"
                  classNames="icon_btn dev_warning"
                />
              </div>

              <div className="gui-overlay-right">
                <MUIPopover callback={this.callbackEnvironment}></MUIPopover>{" "}
                {/**callback={this.callbackEnvironment} */}
              </div>
            </div>
          </Grid>

          {/** .UI- Block of Icon Actions Under the 3D Canvas */}
          <Grid
            container
            id={"iconParentContainer"}
            style={{
              marginTop: "25px",
              marginBottom: "5px",
              border: " dotted 1px  lightblue"
            }}
          >
            <Grid item xs={3} id={"iconRow1"}>
              <Grid container>
                <Grid item xs={4}>
                  <UIButton
                    title=""
                    buttonText=""
                    onClick={this.iconSave}
                    iconName="save"
                    // classNames="icon_btn "
                    style={{ backgroundColor: "#afafaf" }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <UIButton
                    title=""
                    buttonText=""
                    onClick={this.iconDelete}
                    iconName="delete"
                    classNames="icon_btn "
                  />
                </Grid>
                <Grid item xs={4}>
                  <UIButton
                    title=""
                    buttonText=""
                    onClick={this.iconRedo}
                    iconName="redo"
                    classNames="icon_btn "
                  />
                </Grid>
              </Grid>
              <Grid container style={{ marginTop: "15px" }}>
                <Grid item xs={4}>
                  <UIButton
                    title=""
                    buttonText=""
                    onClick={this.iconSave_Alt}
                    iconName="download"
                    classNames="icon_btn "
                  />
                </Grid>
                <Grid item xs={4}>
                  <UIButton
                    title=""
                    buttonText=""
                    onClick={this.iconShare}
                    iconName="share"
                    classNames="icon_btn "
                  />
                </Grid>
                <Grid item xs={4}>
                  <UIButton
                    title=""
                    buttonText=""
                    onClick={this.iconUndo}
                    iconName="undo"
                    classNames="icon_btn "
                  />
                </Grid>
              </Grid>
            </Grid>
            {/** .UI- Screenshots Grid List  */}
            <Grid item xs={9} id={"iconRow1screenshots_row"}>
              <Grid item xs={12}>
                {/**tileData={this.state.tileData} */}
                <UIGridList tileData={this.state.tileData} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {/** .UI- Sidebar TODO-9-3: */}
        <Grid
          item
          xs={3}
          id={"UISideBar"}
          style={{ border: " dotted 1px  lightblue " }}
        >
          {this.state.appState.ad_type === "default" && (
            <UISideBar
              callbackScene={this.changeAdType}
              callbackEnvironment={this.callbackEnvironment}
              callback_UISelect_Existing_Designs={
                this.callback_UISelect_Existing_Designs
              }
              iconDelete={this.iconDelete}
              appState={this.state.appState}
              name={this.state.Ad_Scene.name}
              designName={this.state.userSession.designModel.designName}
              uvProportionsCallback={this.uvProportionsCallback}
              adType={this.state.appState.ad_type}
              changeDesignName={this.changeDesignName}
              editingDesignName={this.editingDesignName}
              //pass through:
              manageCascadingSelects_AdType={this.manageCascadingSelects_AdType}
            />
          )}
          {this.state.appState.ad_type === "vehicle" && (
            <UISideBar
              callbackScene={this.changeAdType}
              callbackEnvironment={this.callbackEnvironment}
              callback_UISelect_Existing_Designs={
                this.callback_UISelect_Existing_Designs
              }
              iconDelete={this.iconDelete}
              appState={this.state.appState}
              name={this.state.Ad_Scene.name}
              designName={this.state.userSession.designModel.designName}
              uvProportionsCallback={this.uvProportionsCallback}
              adType={this.state.appState.ad_type}
              changeDesignName={this.changeDesignName}
              editingDesignName={this.editingDesignName}
              clickHood={() => this.handleOverlayMeshClicks("hood")}
              clickLeft={() => this.handleOverlayMeshClicks("left")}
              clickRoof={() => this.handleOverlayMeshClicks("roof")}
              clickRight={() => this.handleOverlayMeshClicks("right")}
              clickTrunk={() => this.handleOverlayMeshClicks("trunk")}
              //pass through:
              manageCascadingSelects_AdType={this.manageCascadingSelects_AdType}
            />
          )}
          {this.state.appState.ad_type === "billboard" && (
            <UISideBar
              callbackScene={this.changeAdType}
              callbackEnvironment={this.callbackEnvironment}
              callback_UISelect_Existing_Designs={
                this.callback_UISelect_Existing_Designs
              }
              iconDelete={this.iconDelete}
              appState={this.state.appState}
              name={this.state.Ad_Scene.name}
              designName={this.state.userSession.designModel.designName}
              uvProportionsCallback={this.uvProportionsCallback}
              adType={this.state.appState.ad_type}
              changeDesignName={this.changeDesignName}
              editingDesignName={this.editingDesignName}
              clickLeftBillboard={() =>
                this.handleSideBillboardClicks("sign_1")
              }
              clickRightBoard={() => this.handleSideBillboardClicks("sign_2")}
              //pass through
              manageCascadingSelects_AdType={this.manageCascadingSelects_AdType}
            />
          )}
        </Grid>
        <Grid item xs={12} style={{ border: " dotted 1px  lightblue " }}>
          Adder Creative Tool
        </Grid>
      </Grid>
    );
  }
}

export default Main;
/*
TODO:
BUGS:


*/

/* LIFECYCLE METHODS:
componentWillReceiveProps(){}
componentWillMount(){}
componentDidMount(){}
componentWillUpdate(){}
componentDidUpdate(){}
componentWillUnmount(){}
*/
