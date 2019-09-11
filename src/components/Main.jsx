import React from "react";
import BABYLON from "babylonjs";
// import * as GUI from "babylonjs-gui";
import Grid from "@material-ui/core/Grid"; //
//models
import AdderCamera from "../models/adderCamera";

import DraggableDialog from "./MUI_DraggableDialog";
import Designer from "./designer";
////////////////////////////////////////////
//import { Scene } from "babylonjs";
import AdderSceneWrapper from "../models/adderSceneWrapper";
//import Grid from "@material-ui/core/Grid"; //
import AdderLogoAndName from "../assets/Adder_3D_Tool2/AdderLogoTransparent.png";
import "tui-image-editor/dist/tui-image-editor.css";
import AdderImageEditor from "./AdderImageEditor";
import AdderSkyBox from "../models/adderSkybox";
import AdderMeta from "../models/adderMeta";
import AdderAsset from "../models/adderAsset";
import UIButton from "./subcomponents/elements/UIButton";
//////////////////////////////////////////

//TODO: NEED TO REMOVE GrayCar ASSET AND REPLACE WITH OUR OWN IMAGE!!!!!

import "./minimum.css";
import "./Main.css";
import GrayCar from "../assets/Adder_3D_Tool2/carMeshSelectorTransparent.png";
import Billboard from "../assets/Adder_3D_Tool2/billboardTopView.png";
import { makeStyles } from "@material-ui/core/styles";

import * as K from "../constants"; // Required for GridList ( screenshots)

var scope;
var scp;
const UIGridList = K.UIGridList;
//region: Render Methods

class Main extends React.Component {
  constructor(props) {
    super(props);
    scp = this;
    this.state = {
      scene: {},
      sceneIsSet: false,
      engine: null,
      camera: null,
      images: [],
      adderSceneWrapper: {},
      selected_mesh_id: "",
      meta_data: {},
      startEditing: false,
      editing_mesh_id: "",
      selected_ad_type: -1,
      hoodMeshId: null,
      leftMeshId: null,
      roofMeshId: null,
      rightMeshId: null,
      trunkMeshId: null,
      sign1MeshId: null,
      sign2MeshId: null,
      userSession: {
        userInfo: [],
        userModel: {
          user_id: "",
          username: ""
        },
        designs: [],
        designActions: [],
        designModel: {
          designName: "InDevelopmentAddFieldForDesignName",
          adTypeFilepath: "",
          environment: "",
          environment_type: "",
          environmentFilepath:
            "InDevelopmentAddDataForEnvironmemntNameOrREmove....",
          meshes: [],
          screenShots: [],
          ui_selections: {},
          ui_status: {},
          action: ""
        }
      },
      tileData: []
    };

    this.setUp = this.setUp.bind(this);
    this.getAdderSceneWrapper = this.getAdderSceneWrapper.bind(this);

    this.screenshotButtonPress = this.screenshotButtonPress.bind(this);
    this.actionSave = this.actionSave.bind(this);
    scope = this;
  }

  getAdderSceneWrapper() {
    return this.state.adderSceneWrapper;
  }

  setUp() {
    console.log("this.state.adderSceneWrapper");
    console.log(this.state.adderSceneWrapper);

    let adderMeta = new AdderMeta(this.state.adderSceneWrapper);
    adderMeta.getEnvironment();

    // let scene = this.state.adderSceneWrapper.getScene();
    let scene = this.state.scene;
    let adderSkybox = new AdderSkyBox(scene, "countrybox", 1000.0);
    adderSkybox.getSkybox();
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

  sidebarButtonClick(e) {
    //Usage: Sidebar-Selection
    //e.target.name should be the mesh_id that was selected in the sidebar.
    scope.windowCallbackPickable(e.target.name);
  }
  imageEditorCallback = dataURL => {
    console.log(
      "Main:imageEditorCallback():editing_mesh_id:",
      this.state.editing_mesh_id
    );
    this.state.adderSceneWrapper.applyTextureToMesh(
      this.state.editing_mesh_id,
      dataURL
    );
    this.setState({
      startEditing: false,
      last_dataURL: dataURL
    });
    /*
    DEV NOTES: 
      pickResult, prior to handling (? where is this)
      -->then adderSceneWrapper.applyTextureToMesh()
    */
  };

  windowCallbackPickable(mesh_id) {
    // Usage: Editing-Mesh
    this.setState(
      {
        startEditing: true,
        editing_mesh_id: mesh_id
      },
      () => {
        console.log("editing mesh id:", mesh_id);
      }
    );
  }
  // To hide or show the appropriate sidebar image and controls
  callback_designer(args = null, adderAsset = null) {
    if (args === "-1") {
      scope.setState({ selected_ad_type: "-1" }); // reset ad type
    }
    if (args === "0") {
      scope.setState({ selected_ad_type: "0" }); //vehicle
    }
    if (args === "1") {
      scope.setState({ selected_ad_type: "1" }); //billboard
    }
    if (!(adderAsset instanceof AdderAsset)) {
      console.log("NOT AN ADDER ASSET yet....");
    } else {
      let assetData = adderAsset.getBehavior();
      //strategy:SELECT:parameters:pickableMeshes
      let pickableMeshes = assetData[1]["parameters"]["pickableMeshes"];

      //USAGE: Sidebar-Selection
      var selectableMeshes = [];
      var hoodMeshId = null,
        leftMeshId = null,
        roofMeshId = null,
        rightMeshId = null,
        trunkMeshId = null;

      var sign1MeshId = null,
        sign2MeshId = null;
      for (var i in pickableMeshes) {
        let pickableMesh = pickableMeshes[i];
        let splitData = pickableMesh.split("_");
        console.log("splitData:", splitData);
        console.log("think interms of future for other ad types....");
        // ["billboard", "2sides", "angled", "sign", "1"]
        // vs
        //["vehicle", "2door", "sportscar", "leftside", "medium"]
        if (splitData[0] === "vehicle") {
          switch (splitData[3]) {
            case "leftside":
              leftMeshId = pickableMesh;
              break;
            case "rightside":
              rightMeshId = pickableMesh;
              break;
            case "hood":
              hoodMeshId = pickableMesh;
              break;
            case "roof":
              roofMeshId = pickableMesh;
              break;
            case "trunk":
              trunkMeshId = pickableMesh;
              break;

            default:
              break;
          }
        }
        if (splitData[0] === "billboard") {
          if (splitData[1] === "2sides") {
            if (splitData[2] === "angled") {
              if (splitData[3] === "sign") {
                switch (splitData[4]) {
                  case "1":
                    console.log("billbaord sign 1");
                    sign1MeshId = pickableMesh;
                    console.log(sign1MeshId);
                    break;
                  case "2":
                    console.log("billboard sign 2");
                    sign2MeshId = pickableMesh;
                    console.log(sign2MeshId);
                    break;
                  default:
                    break;
                }
              }
            }
          }
        }
      }
      scope.setState({
        hoodMeshId: hoodMeshId,
        leftMeshId: leftMeshId,
        roofMeshId: roofMeshId,
        rightMeshId: rightMeshId,
        trunkMeshId: trunkMeshId,
        sign1MeshId: sign1MeshId,
        sign2MeshId: sign2MeshId
      });
      // once that is determined and saved in state, then the sidebar buttons can have a value that referes to it in state.
      // thus we'll have a dynamic way of setting the values in the sidebar buttons,
      // and after all of this, the point is to use the 'mesh_id' to select the mesh programatically rather than by direct click on mesh.
      // then finally we should be able to call this... scope.windowCallbackPickable(pickResult.pickedMesh.name); with the "mesh name" instead of the pickResult.data object.
      // TODO: Image not applied to rightside mesh yet! Why(?) mesh naming correct ? hidden meshes ?
      // - checked Blender file *
      // - check babylon file in server. id and name : vehicle_2door_sportscar_rightside_medium in metadata: vehicle_2door_sportscar_rightside_medium SAME!
      // - is set to selectable in meta data, other rightside meshes are hidden, - mesh id matches on selection -
      /**
       * AdderSceneWrapper:this.applyTextureToMesh:  
         adderMeshWrapper.js:124 
         AdderMeshWrapper:applyTextureFromDataURL() line 125

       */
      // - checked that hidden uses "isVisible", - change var to let in adderMeshWrapper apply mesh code..., - tex texture appears to have _buffer with correct image data.
      // - ROADBLOCKED !
      // - start on the billboard sidebar done(ish)
      // - screenshots and overlay buttons
    }
  }
  callback_withModelInfo(info = null) {
    console.log("callback_withModelInfo:", info);
  }

  screenshotButtonPress(evt) {
    var engine = this.state.engine; //was embedded under Ad_Scene in version 1
    var camera = this.state.camera;
    var stateScope = this.state;
    let that = this;

    function addScreenshot(src) {
      var image_uid = "img_" + Date.now();

      var image_model = {
        image_id: image_uid,
        image_name: "",
        image_data: src,
        image_url: "",
        image_filename: "",
        image_usage: "screenshot"
      };

      const newArray = that.state.images.slice();
      newArray.push(image_model);
      that.setState(
        prevState => ({
          ...prevState,
          images: newArray
        }),
        () => {
          const obj = { image_id: image_uid, src: "" };
          const newArray = that.state.userSession.designModel.screenShots.slice(); // Create a copy
          newArray.push(obj);

          that.setState(
            prevState => ({
              ...prevState,
              userSession: {
                ...prevState.userSession,
                designModel: {
                  ...prevState.userSession.designModel,
                  screenShots: newArray
                }
              }
            }),
            () => {
              //SAVE CHANGE ACTION
              that.actionSave();
            }
          );

          // we need to get the current array of tileData  push to copy of it   and redefine it
          that.setState(prevState => ({
            ...prevState,
            tileData: {
              ...prevState.tileData
            }
          }));

          var tileDataObject = {
            id: image_uid,
            key: image_uid,
            img: src,
            title: image_uid,

            cols: 2
          };

          const newTileDataArray = that.state.tileData.slice();
          newTileDataArray.push(tileDataObject);
          that.setState(
            prevState => ({
              ...prevState,
              tileData: newTileDataArray
            }),
            () => {}
          );
        }
      );
    }

    BABYLON.Tools.CreateScreenshot(
      engine,
      camera,
      { width: 274, height: 222 },
      function(data) {
        var img = document.createElement("img");
        img.src = data;

        addScreenshot(img.src);
      }
    );
  } //

  componentDidMount() {
    let scope = this;
    let canvas = document.getElementById("adder_3dTool_canvas");
    let engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true
    });
    this.setState({ engine: engine });

    let createScene = function(scp) {
      let scene = new BABYLON.Scene(engine);
      //manifest flag for babylon.manifest files.
      BABYLON.Database.IDBStorageEnabled = true;
      //build the camera.
      const cameraOptions = {
        lowerAlphaLimit: -Math.PI,
        upperAlphaLimit: Math.PI,
        lowerBetaLimit: 0,
        upperBetaLimit: Math.PI / 2.2,
        lowerRadiusLimit: 5,
        upperRadiusLimit: 200,
        useAutoRotationBehavior: false,
        attachControl: true
      };
      let adderCam_arcRotate = new AdderCamera(
        canvas,
        "ArcRotateCamera",
        "AdderCam_One",
        Math.PI / 4,
        Math.PI / 4,
        30,
        BABYLON.Vector3.Zero(),
        scene,
        true,
        cameraOptions
      );
      let camera = adderCam_arcRotate.getCamera();

      scp.setState({ camera: camera });
      camera.attachControl(canvas, true); //add camera to the scene/canvas
      //create a light
      //let light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
      //var light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(0, 2, 5), scene);
      //var light = new BABYLON.SpotLight("spotLight", new BABYLON.Vector3(0, 10, -10), new BABYLON.Vector3(4, -1, 5), Math.PI/2, 2, scene);
      //light.intensity = 2;
      let light_main = new BABYLON.HemisphericLight(
        "light",
        new BABYLON.Vector3(0, 1, 0),
        scene
      );
      light_main.intensity = 0.8;
      var light_point = new BABYLON.PointLight(
        "pointLight",
        new BABYLON.Vector3(5, 5, -0.1),
        scene
      );
      return scene;
    };

    let scene = createScene(scope);
    // this.props.setScene(scene);
    let adderSceneWrapper = new AdderSceneWrapper(scene);
    adderSceneWrapper.getUUID();
    this.setState(
      {
        scene: scene,
        adderSceneWrapper: adderSceneWrapper
      },
      () => {
        scope.setUp();
      }
    );
    scene.autoClear = true;

    engine.runRenderLoop(function() {
      if (typeof scene === "undefined") {
        return;
      } else {
        if (scene) {
          scene.render();
        }
      }
    });

    window.addEventListener("resize", function() {
      engine.resize();
    });

    window.addEventListener("click", function() {
      //should only detect meshes where  isPickable = true;
      var pickResult = scene.pick(scene.pointerX, scene.pointerY);
      if (pickResult.pickedMesh === null) {
        return false;
      } else {
        scope.windowCallbackPickable(pickResult.pickedMesh.name);
      }
    });
  } //

  iconSave() {
    //CHECK ONE: there is a 'design name' chosen...
    if (
      scope.state.userSession.designModel.designName !== "" &&
      scope.state.userSession.designModel.designName !== "undefined"
    ) {
      // alert('DESIGN: check that all data is collected that is needed...see

      //CHECK FOR:
      /**
       * - need a name
       * - need a mesh with some changed of texture applied to it.
       * -
       *
       */
      if (
        scope.state.userSession.designModel.environmentFilepath === "" ||
        scope.state.userSession.designModel.environmentFilepath === "undefined"
      ) {
        var envData = "fooEnvironmentDatabar"; //scope.getFilenameAndTypeOfCurrentEnvironment();

        alert("DESIGN: NEED DEFAULT ENVIRONMENT INFO !");
      }
      alert("mesh not yet saved to state.userSession......");
      /*
      if (scope.state.userSession.designModel.meshes.length <= 0) {
        alert(
          "DESIGN: NO MESH CHANGES HAVE BEEN MADE...no significant design changes.!"
        );
      }
      */

      var design_obj = scope.state.userSession.designModel;
      design_obj.action = "final_save";

      //const obj = {'design': design_obj};
      const newDesignsArray = scope.state.userSession.designs.slice();
      newDesignsArray.push(design_obj); // Push the object

      //break into two separate functions:

      scope.setState(
        prevState => ({
          ...prevState,
          userSession: {
            ...prevState.userSession,
            designs: newDesignsArray,
            savedDesigns: newDesignsArray
          }
        }),
        () => {
          //note: saves the entire 'userSession'
          let oldDesigns =
            JSON.parse(localStorage.getItem("designsArray")) || [];
          let oldSavedDesigns =
            JSON.parse(localStorage.getItem("savedDesignsArray")) || [];
          let newDesign = scope.state.userSession.designModel;
          newDesign.image = scope.state.images;
          //loop through OR  push to local storage:
          oldDesigns.push(newDesign);
          oldSavedDesigns.push(newDesign);
          localStorage.setItem("designsArray", JSON.stringify(oldDesigns));
          localStorage.setItem(
            "savedDesignsArray",
            JSON.stringify(oldSavedDesigns)
          );
        }
      );
      /* */
    } else {
      alert("DESIGN: Your design needs a name before it can be saved.");
    }
  }

  render() {
    //TODO: I need a method to periodically calll the adderSceneWrapper and get the currently selectable meshes.
    //THEN : I could apply these mesh id's to the value for the sidebar buttons
    return (
      <div>
        <div>Main.jsx</div>

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
            <div className="adder-3dTool-canvas-container">
              <canvas
                id="adder_3dTool_canvas"
                className="adder-3dTool-canvas"
                style={{ boxShadow: "5px 5px 8px #2f2f2f" }}
              />
              <div className="gui-overlay">
                <UIButton
                  title="Screen Shot"
                  buttonText="Save Image"
                  onClick={this.screenshotButtonPress}
                  iconName="camera_alt"
                  classNames="icon_btn "
                ></UIButton>
                {/**
                <UIButton
                  title="Crop Image"
                  buttonText="Crop Image"
                  onClick={this.iconCrop}
                  iconName="crop"
                  classNames="icon_btn dev_warning"
                />
               
                <UIButton title="XXXX"
                          buttonText="XXXX"
                          
                          onClick={this.iconFormatColorFill}
                          iconName="format_color_fill"
                          classNames="icon_btn dev_warning"/>
                <UIButton title="XXXX"
                          buttonText="XXXX"
                          onClick={this.iconTextFields}
                          iconName="text_fields"
                          classNames="icon_btn dev_warning"/>
                */}
              </div>
            </div>
          </Grid>
          <Grid item xs={4}>
            <Designer
              scene={this.state.scene}
              getAdderSceneWrapper={this.getAdderSceneWrapper}
              adderSceneWrapper={this.state.adderSceneWrapper}
              callback={this.callback_designer}
              callback_withModelInfo={this.callback_withModelInfo}
            ></Designer>
            {this.state.selected_ad_type == "0" && (
              <Grid
                item
                xs={12}
                style={{
                  backgroundImage: "url(" + GrayCar + ")",
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  height: "300px",
                  backgroundPosition: "center"
                }}
              >
                <div
                  className="relativeContainer car"
                  id="ButtonContainer"
                  style={{ height: "300px", position: "relative" }}
                >
                  <p>Select a Component to Edit</p>

                  {/**onClick={props.clickHood} */}
                  <button
                    className="buttonSidebar buttonHood"
                    id="buttonHood"
                    name={this.state.hoodMeshId}
                    onClick={this.sidebarButtonClick}
                  >
                    HOOD
                  </button>
                  <button
                    className="buttonSidebar buttonLeft"
                    id="buttonLeft"
                    name={this.state.leftMeshId}
                    onClick={this.sidebarButtonClick}
                  >
                    LEFT
                  </button>
                  <button
                    className="buttonSidebar buttonRoof"
                    id="buttonRoof"
                    name={this.state.roofMeshId}
                    onClick={this.sidebarButtonClick}
                  >
                    ROOF
                  </button>
                  <button
                    className="buttonSidebar buttonRight"
                    id="buttonRight"
                    name={this.state.rightMeshId}
                    onClick={this.sidebarButtonClick}
                  >
                    RIGHT
                  </button>
                  <button
                    className="buttonSidebar buttonTrunk"
                    id="buttonTrunk"
                    name={this.state.trunkMeshId}
                    onClick={this.sidebarButtonClick}
                  >
                    TRUNK
                  </button>
                </div>
              </Grid>
            )}
            {this.state.selected_ad_type == "1" && (
              <Grid
                item
                xs={12}
                style={{
                  backgroundImage: "url(" + Billboard + ")",
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  height: "300px",
                  backgroundPosition: "center"
                }}
              >
                <div
                  className="relativeContainer car"
                  id="ButtonContainer"
                  style={{ height: "300px" }}
                >
                  <p>Select a Component to Edit</p>

                  {/**onClick={props.clickHood} */}

                  <button
                    className="buttonSidebar buttonLeft"
                    id="buttonLeft"
                    name={this.state.sign1MeshId}
                    onClick={this.sidebarButtonClick}
                  >
                    One
                  </button>

                  <button
                    className="buttonSidebar buttonRight"
                    id="buttonRight"
                    name={this.state.sign2MeshId}
                    onClick={this.sidebarButtonClick}
                  >
                    Two
                  </button>
                </div>
              </Grid>
            )}
          </Grid>
          {/** .UI- Block of Icon Actions Under the 3D Canvas */}
          <Grid
            container
            id={"iconParentContainer"}
            style={{
              marginTop: "25px",
              marginBottom: "5px",
              border: "dotted green 1px "
            }}
          >
            <Grid item xs={3} id={"iconRow1"} style={{ padding: "15px" }}>
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
            <Grid item xs={9} id={"iconRow1screenshots_row"}>
              <Grid item xs={12} style={{ padding: "15px" }}>
                {/**tileData={this.state.tileData} */}
                <UIGridList tileData={this.state.tileData} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <div>
          {this.state.startEditing && (
            <div>
              <Grid>
                <DraggableDialog
                  imageEditorCallback={this.imageEditorCallback}
                  mesh_id={this.state.editing_mesh_id}
                ></DraggableDialog>
              </Grid>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Main;
