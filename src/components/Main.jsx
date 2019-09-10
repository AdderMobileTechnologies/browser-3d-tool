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
  buttonClick(e) {
    console.log(e.target.id);
    if (e.target.id === "buttonLeft") {
      console.log("hit");
      //what is the current model and mesh in adderSceneWrapper?
      console.log(e.target);
    }
  }
  sceneCanvasCallback = dataURL => {
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
    this.setState({
      startEditing: true,
      editing_mesh_id: mesh_id
    });
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
      console.log("assetData:");
      console.log(assetData);
      //strategy:SELECT:parameters:pickableMeshes
      let pickableMeshes = assetData[1]["parameters"]["pickableMeshes"];
      console.log(pickableMeshes);

      //"vehicle_2door_sportscar_leftside_medium","vehicle_2door_sportscar_rightside_medium"
      //TODO: if I can split the items the 3rd element can determine which mesh belongs to which sidebar button.
      var selectableMeshes = [];
      var hoodMeshId = null,
        leftMeshId = null,
        roofMeshId = null,
        rightMeshId = null,
        trunkMeshId = null;
      for (var i in pickableMeshes) {
        let pickableMesh = pickableMeshes[i];
        let splitData = pickableMesh.split("_");
        if (splitData[3] == "leftside") {
          leftMeshId = pickableMesh;
        }
        if (splitData[3] == "rightside") {
          rightMeshId = pickableMesh;
        }
      }
      console.log("Some Success if leftMeshId has a value:", leftMeshId);
      scope.setState(
        {
          hoodMeshId: hoodMeshId,
          leftMeshId: leftMeshId,
          roofMeshId: roofMeshId,
          rightMeshId: rightMeshId,
          trunkMeshId: trunkMeshId
        },
        () => {
          console.log("and success ---->");
          console.log(scope.state.leftMeshId);
        }
      );
      // once that is determined and saved in state, then the sidebar buttons can have a value that referes to it in state.
      // thus we'll have a dynamic way of setting the values in the sidebar buttons,
      // and after all of this, the point is to use the 'mesh_id' to select the mesh programatically rather than by direct click on mesh.
      // then finally we should be able to call this... scope.windowCallbackPickable(pickResult.pickedMesh.name); with the "mesh name" instead of the pickResult.data object.
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
        <div>NewMain.jsx</div>

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
                    onClick={this.buttonClick}
                  >
                    HOOD
                  </button>
                  <button
                    className="buttonSidebar buttonLeft"
                    id="buttonLeft"
                    value=""
                    name={this.state.leftMeshId}
                    onClick={this.buttonClick}
                  >
                    LEFT
                  </button>
                  <button
                    className="buttonSidebar buttonRoof"
                    id="buttonRoof"
                    onClick={this.buttonClick}
                  >
                    ROOF
                  </button>
                  <button
                    className="buttonSidebar buttonRight"
                    id="buttonRight"
                    value=""
                    onClick={this.buttonClick}
                  >
                    RIGHT
                  </button>
                  <button
                    className="buttonSidebar buttonTrunk"
                    id="buttonTrunk"
                    value=""
                    onClick={this.buttonClick}
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
        {/* .UI- Mesh Selectors*/}
        {/* props.adType === 'vehicle'  && */}

        {/* */}
        <div>
          {this.state.startEditing && (
            <div>
              <Grid>
                <DraggableDialog
                  sceneCanvasCallback={this.sceneCanvasCallback}
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
