import React from "react";
import BABYLON from "babylonjs";
import Grid from "@material-ui/core/Grid"; //
//models
import AdderCamera from "../models/camera";

/*
DEV NOTES: 08-29-2019
!(Meta Data Formatting is extremely strict, look out for commas on the last item in an object!)	 
-add the behavior section of meta data.
-TODO: how to implement the behavior.
In previous work, based on mesh id, I either did or did not apply the 'isPickable' boolean.
Then, under a general 'onPointerDown' event, I looped conditions based on mesh_id. 
*/
/*
import "tui-image-editor/dist/tui-image-editor.css";
import AdderImageEditor from "./AdderImageEditor";
*/
import DraggableDialog from "./subcomponents/MUI_DraggableDialog";
var scope;
class SceneCanvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected_mesh_id: "",
      meta_data: {},
      adderSceneWrapper: props.adderSceneWrapper,
      startEditing: false
    };
    this.setScene = props.setScene;
    console.log("SCENE CANVAS props.adderSceneWrapper?:", props);
    scope = this;
  }
  componentWillReceiveProps(newProps) {
    // console.log("SCENE CANVAS new props:", newProps);
    // console.log(newProps.adderSceneWrapper);
    let aScene = newProps.adderSceneWrapper.getScene();
    // console.log("and is there a scene from new Props :", aScene);
    this.setState({
      adderSceneWrapper: newProps.adderSceneWrapper
    });
  }
  draggableDialogCallback = data => {
    console.log("callback for draggable dialog ......data:", data);

    let someModels = this.state.adderSceneWrapper.getModels();
    for (let g in someModels) {
      var meshWrappers = someModels[g].getMeshWrappers();
      for (let h in meshWrappers) {
        let meshWrapper = meshWrappers[h];
        let myMesh = meshWrapper.getMesh();

        if (myMesh.id === data.mesh_id) {
          // NOW TO APPLY THE IMAGE TO THIS MESH .......
          //MeshWrapper.applyTextureFromDataURL(name = null, dataURL = null, scene = null)
          let scene = scope.props.adderSceneWrapper.getScene();
          meshWrapper.applyTextureFromDataURL(
            "whatever.png",
            data.dataURL,
            scene
          );
        }
      }
    }
    this.state.adderSceneWrapper.acceptData(data);
    this.setState({
      startEditing: false
    });
  };
  windowCallbackPickable(mesh_id) {
    // Consequences: startEditing is a flag for showing/hiding the Image Editor Modal.
    console.log("adderSceneWrapper is : ", this.state.adderSceneWrapper);
    //TODO: at his point, in the case of meshes that share the same responsibility with other meshes, ie. (leftside_large, leftside_small,...),
    //whichever other 'leftside_' meshes are NOT getting selected need to be set to hidden. ie. isVisible = false.
    // - get the currently selected mesh
    // - find it's sister meshes and set them to invisible.
    // - via 'adderSceneWrapper' find parent 'model' of the mesh_id, then loop through all the meshWrappers of that model and scan for matches...
    console.log("SELECTED MESH:", mesh_id);
    this.state.adderSceneWrapper.hideSisterMeshesForMeshId(mesh_id);

    this.setState({
      startEditing: true,
      editing_mesh_id: mesh_id
    });
  }
  /* windowCallbackNotPickable() {
    console.log("WINDOW CALLBACK ?");
    this.setState({
      startEditing: false
    });
  }*/
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
    this.props.setScene(scene);
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
        console.log("click() pickResult:", pickResult.pickedMesh.name);
        scope.windowCallbackPickable(pickResult.pickedMesh.name);
      }
    });
  }

  render() {
    return (
      <div>
        <div>SceneCanvas.jsx</div>
        <div>{this.state.selected_mesh_id}</div>
        <div className="adder-3dTool-canvas-container">
          <canvas
            id="adder_3dTool_canvas"
            className="adder-3dTool-canvas"
            style={{ boxShadow: "5px 5px 8px #2f2f2f" }}
          />
        </div>
        {this.state.startEditing && (
          <div>
            <Grid>
              <DraggableDialog
                callback={this.draggableDialogCallback}
                mesh_id={this.state.editing_mesh_id}
              ></DraggableDialog>
            </Grid>
          </div>
        )}
      </div>
    );
  }
}

export default SceneCanvas;
