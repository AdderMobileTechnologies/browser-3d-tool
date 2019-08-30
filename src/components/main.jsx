import React from "react";
import SceneFast from "./SceneFast";

//region: MaterialUI Components
import Grid from "@material-ui/core/Grid";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import GridListTileBar from "@material-ui/core/GridListTileBar";
import IconButton from "@material-ui/core/IconButton";
//import StarBorderIcon from '@material-ui/icons/StarBorder';

import AdderLogoAndName from "../assets/Adder_3D_Tool2/AdderLogoTransparent.png";
import UIButton from "./subcomponents/UIElements/UIButton";
import MUIPopover from "./subcomponents/UIElements/MUIPopover";
import UISideBar from "./subcomponents/UISideBar";
import { IntersectionInfo } from "babylonjs";

import * as K from "./constants";
import UIGuiOverlay from "./subcomponents/UIGuiOverlay";
//region: Render Methods
const UIGridList = K.UIGridList;
const tileData = K.tileData;

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userSession: {
        designModel: {
          designName: "foo"
        }
      },
      Ad_Scene: {
        name: "foo"
      },
      appState: {
        ad_type: "default",
        ui_status: {
          ad_type_active: "",
          ad_type_selected: ""
        },
        ui_selections: {
          ad_type: "",
          ad_subtype: "foo"
        }
      }
    };

    this.editingDesignName = this.editingDesignName.bind(this);
    this.changeDesignName = this.changeDesignName.bind(this);
    this.manageCascadingSelects_AdType = this.manageCascadingSelects_AdType.bind(
      this
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
            var ui_selections = this.state.appState.ui_selections;
            var ui_status = this.state.appState.ui_status;
            this.saveDesignModelUI(ui_selections, ui_status);

            //SAVE CHANGE ACTION
            this.actionSave();

            /* CHange scene at DETAIL LEVEL instaed of asset level.*/
            if (
              this.state.appState.ui_status.ad_asset_selected &&
              this.state.appState.ui_selections.ad_asset !== ""
            ) {
              //massage data to format it is expected in.
              //? do we really want a hard reset to fire at this point ? though ?
              let data = {};
              data.selectedOption = this.state.appState.ui_selections.ad_asset;
              this.changeAdType(data);
            }
          }
        );
      }
    );
  }
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

              {/**<canvas id="gui_canvas_container"
								   className="babylonjsCanvas"
						   style={{boxShadow: "5px 5px 8px #2f2f2f"}}/> */}
              <SceneFast />
              {/**
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
        {/** .UI- Sidebar  */}
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
