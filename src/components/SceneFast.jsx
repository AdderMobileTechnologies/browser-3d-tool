import React from "react";
import BABYLON from "babylonjs";
import axios from "axios";
import util from "util";

//models
import AdderModel from "../models/model";
import MeshWrapper from "../models/meshWrapper";
import AdderCamera from "../models/camera";
import { domainToASCII } from "url";
import AdderSkyBox from "../models/skybox";
/*
DEV NOTES: 08-29-2019
!(Meta Data Formatting is extremely strict, look out for commas on the last item in an object!)	 
-add the behavior section of meta data.
-TODO: how to implement the behavior.
In previous work, based on mesh id, I either did or did not apply the 'isPickable' boolean.
Then, under a general 'onPointerDown' event, I looped conditions based on mesh_id. 

  
*/
const API_URL = "http://localhost:8001";

class SceneFast extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected_mesh_id: "",
      meta_data: {}
    };
  }

  componentDidMount() {
    let cityVectorAdjustment = new BABYLON.Vector3(70, -1, 20);
    let alternativeVector = new BABYLON.Vector3(70, 5, 20);
    let vectorZero = new BABYLON.Vector3(0, 0, 0);
    let defaultLocalRotationAxis = new BABYLON.Vector3(1, 1, 1);
    let defaultLocalRotationAngle = 0;
    var promise1 = new Promise(function(resolve, reject) {
      const url = `${API_URL}/meta`;
      axios
        .get(url)
        .then(response => response.data)
        .then(data => {
          resolve(data);
        });
    });
    promise1.then(function(value) {
      // TODO: Think about whether this should loop through all meshes in the meta data
      // or if this should be a one at a time kind of deal ?
      /* [`streetLight`, `firehydrant`, `bicycle`, `block1v2`, `crane`] */
      // TODO: save meta_data to state(?)

      for (let k = 0; k < value.meta_data.length; k++) {
        console.log("k:", value.meta_data[k]);
        let dir = value.meta_data[k]["dir"];
        let filename = value.meta_data[k]["filename"];
        let position = value.meta_data[k]["position"];
        let rotation = value.meta_data[k]["rotation"];
        let scaling = value.meta_data[k]["scaling"];
        addSingleModel(dir, filename, position, rotation, scaling);
      }
      let adderSkybox = new AdderSkyBox(scene, "countrybox", 1000.0);
      adderSkybox.getSkybox();
    });

    function addSingleModel(dir, filename, position, rotation, scaling) {
      let positionVect = new BABYLON.Vector3(
        position.x,
        position.y,
        position.z
      );
      let rotationAxisVect = new BABYLON.Vector3(
        rotation.axis.x,
        rotation.axis.y,
        rotation.axis.z
      );
      var rotationAngle = parseFloat(rotation.angle);
      let scalingVect = new BABYLON.Vector3(scaling.x, scaling.y, scaling.z);
      let modelFile = dir + "/" + filename + `.babylon`;
      let adderModel = new AdderModel(
        scene,
        modelFile,
        null,
        positionVect,
        rotationAxisVect,
        rotationAngle,
        [],
        scalingVect
      );
      loadModelAsync(adderModel);

      // Changing The Position of a PARENT MESH of an AdderModel currently requires 'getting the parent mesh and applying the babylon method to it.ie.setPositionWithLocalVector(Vector3)
      // This is not desireable becasue we'd like to be able to do it from the model itself, I would imagine.
      /* How to change Parent Mesh Position.*/
      //Position and Rotation: applied to parent mesh.
      let adderModelParent = adderModel.getParentMesh();
      //Position:
      let adderModelPosition = adderModel.getPosition();
      adderModelParent.setPositionWithLocalVector(adderModelPosition); //new BABYLON.Vector3(7, 1, 0)
      //Rotation:
      let adderModelRotationAngle = adderModel.getRotationAngle();
      let adderModelRotationRadian = adderModel.getRotationRadian();
      let adderModelRotationAxis = adderModel.getRotationAxis();
      var quaternion = new BABYLON.Quaternion.RotationAxis(
        adderModelRotationAxis,
        adderModelRotationRadian
      );
      adderModelParent.rotationQuaternion = quaternion;
      //Scaling:
      let scalingFactorX = adderModel.getScaling();
      adderModelParent.scaling = scalingFactorX;
    }

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
      let camera = adderCam_arcRotate.getCamera(scene);
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
      light_main.intensity = 0.1;
      var light_point = new BABYLON.PointLight(
        "pointLight",
        new BABYLON.Vector3(5, 5, -0.1),
        scene
      );
      return scene;
    };

    let scene = createScene();
    scene.autoClear = true;

    async function loadModelAsync(adderModel) {
      /* 
			 SceneLoader constructor()
				SceneLoader.ImportMeshAsync(
					meshNames: any, 
					rootUrl: string, 
					sceneFilename?: string | File,
					scene?: Nullable<Scene>, 
					onProgress?: Nullable<function>, 
					pluginExtension?: Nullable<string>
				)
				: Promise<object>
				https://doc.babylonjs.com/api/classes/babylon.sceneloader
			*/
      //define SceneLoader.ImportMeshAsync parameters:
      let meshNames = "";
      let rootUrl = "http://dbdev.adder.io/assets/";
      let sceneFileName = adderModel.getModelFile();
      let onProgress = null;
      let pluginExtension = null;

      let result = await BABYLON.SceneLoader.ImportMeshAsync(
        meshNames,
        rootUrl,
        sceneFileName,
        scene,
        onProgress,
        pluginExtension
      );
      await callback_ImportMeshAsync(adderModel, result);
    }

    function callback_ImportMeshAsync(adderModel, result) {
      const meshWrappers = [];
      //make adderModel parent mesh, the parent of all individual meshes.
      //wrap each mesh in the meshWrapper class and build the array.
      //add the array to the model.
      //TODO: If we added 'isPickable' to the model meta data, and used it in the constructor, then we could use it here,
      // to add mesh specific qualities.

      result.meshes.forEach(function(mesh) {
        mesh.parent = adderModel.getParentMesh();
        console.log(mesh.id);
        //should this pickable quality be defined in the MeshWrapper class instead?
        if (
          mesh.id === "leftside_small" ||
          mesh.id === "leftside_medium" ||
          mesh.id === "leftside_large"
        ) {
          mesh.isPickable = true;
        } else {
          mesh.isPickable = false;
        }

        let newMeshWrapper = new MeshWrapper(mesh, null, null);
        meshWrappers.push(newMeshWrapper);
      });
      adderModel.setMeshWrappers(meshWrappers);
    }

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
        //TODO: how to handle the clicked mesh ie. leftside_large
        //TODO: how to set meshes to 'pickable' properly.ie. currently in callback_ImportMeshAsync()
      }
    });
  }
  render() {
    return (
      <div>
        <div>SceneFast</div>
        <div>{this.state.selected_mesh_id}</div>
        <div className="adder-3dTool-canvas-container">
          <canvas
            id="adder_3dTool_canvas"
            className="adder-3dTool-canvas"
            style={{ boxShadow: "5px 5px 8px #2f2f2f" }}
          />
        </div>
      </div>
    );
  }
}

export default SceneFast;
