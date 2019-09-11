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
//////////////////////////////////////////
import { makeStyles } from "@material-ui/core/styles";
//TODO: NEED TO REMOVE GrayCar ASSET AND REPLACE WITH OUR OWN IMAGE!!!!!
import BillBoard from "../assets/Adder_3D_Tool2/billboardTopView.png";

import "./minimum.css";
import "./Main.css";
import GrayCar from "../assets/Adder_3D_Tool2/carMeshSelectorTransparent.png";
var scope;

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scene: {},
      sceneIsSet: false,
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
      trunkMeshId: null
    };
    this.setUp = this.setUp.bind(this);
    this.getAdderSceneWrapper = this.getAdderSceneWrapper.bind(this);
    //this.setScene = props.setScene;
    console.log("SCENE CANVAS props.adderSceneWrapper?:", props);
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
      for (var i in pickableMeshes) {
        let pickableMesh = pickableMeshes[i];
        let splitData = pickableMesh.split("_");
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
      scope.setState({
        hoodMeshId: hoodMeshId,
        leftMeshId: leftMeshId,
        roofMeshId: roofMeshId,
        rightMeshId: rightMeshId,
        trunkMeshId: trunkMeshId
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
    }
  }
  callback_withModelInfo(info = null) {
    console.log("callback_withModelInfo:", info);
  }
  componentDidMount() {
    let scope = this;
    let canvas = document.getElementById("adder_3dTool_canvas");
    let engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true
    });

    let createScene = function() {
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

    let scene = createScene();
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
                  style={{ height: "300px" }}
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
              <div>same for billboards</div>
            )}
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
