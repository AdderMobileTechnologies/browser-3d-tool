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
//////////////////////////////////////////
var scope;

class NewMain extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scene: {},
      sceneIsSet: false,
      adderSceneWrapper: {},
      selected_mesh_id: "",
      meta_data: {},
      startEditing: false,
      editing_mesh_id: ""
    };
    this.setUp = this.setUp.bind(this);
    this.getAdderSceneWrapper = this.getAdderSceneWrapper.bind(this);
    //this.setScene = props.setScene;
    console.log("SCENE CANVAS props.adderSceneWrapper?:", props);
    scope = this;
  }
  /*
  componentWillReceiveProps(newProps) {
    let aScene = newProps.adderSceneWrapper.getScene();
    this.setState({
      adderSceneWrapper: newProps.adderSceneWrapper
    });
  }
*/
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

  sceneCanvasCallback = dataURL => {
    console.log("=== DataURL ===", dataURL);
    console.log("=== PREVIOUS DataURL: ", this.state.last_dataURL);
    if (this.state.last_dataURL === dataURL) {
      console.log("THE DATA URLS ARE THE SAME !");
    } else {
      console.log("THE DATA URLS ARE DIFFERENT.");
    }
    console.log("this state editing_mesh_id is...", this.state.editing_mesh_id);
    // 100% SURE I have the new image info at this point.Bayon 9-9-2019 2:20pm

    //let adderSceneWrapper = new AdderSceneWrapper(this.state.scene);
    // this.state.adderSceneWrapper.applyTextureToMesh(
    //   this.state.editing_mesh_id,
    //   dataURL
    // );
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
    console.log("mesh id that was picked.", mesh_id);
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // hide all sister meshes for the selected mesh id.
    //TODO: hide all but one type for vehicles.ie. not using the small , medium, arge feature anymore.
    //either: make those meshes NOT pickable AND invisible , or hide them here.
    //meta data would be the place to do this. at what point would the meta data be acted upon(?)
    //= = = = = >>>   this.state.adderSceneWrapper.hideSisterMeshesForMeshId(mesh_id);
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    // Consequences: 'state.startEditing' is a flag for showing/hiding the Image Editor Modal.

    //TODO: if mesh.id belongs to a model that has select parameters match.

    //////////////////////////////////////////////

    this.setState({
      startEditing: true,
      editing_mesh_id: mesh_id
    });
  }

  componentDidMount() {
    let scope = this;
    let canvas = document.getElementById("adder_3dTool_canvas");
    let engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true
    });

    let createScene = function() {
      //create the scene.
      let scene = new BABYLON.Scene(engine);
      // let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
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
    ////////////////////////////////////////

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
      /* force it  with 3rd parameter.*/
      // , function(   mesh  ) {  return mesh.name == "billboard_2sides_angled_sign_1"; // so only this will be pickable
      // }
      console.log("pickResult, prior to handling:", pickResult);
      if (pickResult.pickedMesh === null) {
        return false;
      } else {
        //TODO: in the case of billboard sign 1 , although it is flagged as selectable, it's selection is not getting recognized.
        //(?) - something to do with the new isHidden parameter? is hideSisters still executing.
        // - action: added empty array to meta data for hidablemeshes ( same difference)
        // STRANGE:(?) Why isn't "billboard_2sides_angled_sign_1" getting detected on click.(?)
        // console.log("pickResult:", pickResult);

        //What happens after Apply Image(?) => onApplyCallback(DataURL) => props.sceneCanvasCallback(DataURL)

        //TODO: check if pickable , it would be represented within a model.

        console.log("click() pickResult:", pickResult.pickedMesh.name);
        console.log(
          "PICKED MESH: look for isPickable property",
          pickResult.pickedMesh
        );
        scope.windowCallbackPickable(pickResult.pickedMesh.name);
      }
    });
  }

  render() {
    return (
      <div>
        <div>NewMain.jsx</div>
        <div>{this.state.selected_mesh_id}</div>
        <div className="adder-3dTool-canvas-container">
          <canvas
            id="adder_3dTool_canvas"
            className="adder-3dTool-canvas"
            style={{ boxShadow: "5px 5px 8px #2f2f2f" }}
          />
        </div>
        <Grid item xs={4}>
          {/** REMOVE: param from Designer calladderSceneWrapper={this.state.adderSceneWrapper} */}
          <Designer
            scene={this.state.scene}
            getAdderSceneWrapper={this.getAdderSceneWrapper}
            adderSceneWrapper={this.state.adderSceneWrapper}
          ></Designer>
        </Grid>
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
    );
  }
}

export default NewMain;
//AdderModelWrapper UUID::: Mon Sep 09 2019 13:51:24 GMT-0400 (Eastern Daylight Time)
