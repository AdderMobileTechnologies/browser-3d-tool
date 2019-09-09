import React from "react";
import BABYLON from "babylonjs";
import Grid from "@material-ui/core/Grid"; //
//models
import AdderCamera from "../models/adderCamera";

/*
DEV NOTES: 08-29-2019
!(Meta Data Formatting is extremely strict, look out for commas on the last item in an object!)	 
*/
/*
import "tui-image-editor/dist/tui-image-editor.css";
import AdderImageEditor from "./AdderImageEditor";
*/
import DraggableDialog from "./MUI_DraggableDialog";
import Designer from "./designer";
var scope;

class SceneCanvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected_mesh_id: "",
      meta_data: {},
      adderSceneWrapper: props.adderSceneWrapper,
      startEditing: false,
      editing_mesh_id: ""
    };
    this.setScene = props.setScene;
    console.log("SCENE CANVAS props.adderSceneWrapper?:", props);
    scope = this;
  }

  componentWillReceiveProps(newProps) {
    let aScene = newProps.adderSceneWrapper.getScene();
    this.setState({
      adderSceneWrapper: newProps.adderSceneWrapper
    });
  }

  sceneCanvasCallback = dataURL => {
    console.log("=== DataURL ===", dataURL);
    if (this.state.last_dataURL === dataURL) {
      console.log("THE DATA URLS ARE THE SAME !");
    } else {
      console.log("THE DATA URLS ARE DIFFERENT.");
    }
    console.log("this state editing_mesh_id is...", this.state.editing_mesh_id);
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
        <Grid item xs={4}>
          <Designer adderSceneWrapper={this.state.adderSceneWrapper}></Designer>
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

export default SceneCanvas;
