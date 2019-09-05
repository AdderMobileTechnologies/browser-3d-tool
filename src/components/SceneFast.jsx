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

import AdderLoader from "../models/adderLoader";
import AdderMeta from "../models/adderMeta";
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
      meta_data: {},
      scene: props.scene
    };
    this.setScene = props.setScene;
    //this.scene = props.scene;
  }
  ///////////////// constructor().

  componentDidMount() {
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
      light_main.intensity = 0.1;
      var light_point = new BABYLON.PointLight(
        "pointLight",
        new BABYLON.Vector3(5, 5, -0.1),
        scene
      );
      return scene;
    };
    //////////////// createScene().

    let scene = createScene();
    this.props.setScene(scene);
    scene.autoClear = true;

    let adderMeta = new AdderMeta(scene);
    adderMeta.getEnvironment();
    // adderMeta.getAdTypes();
    let adderSkybox = new AdderSkyBox(scene, "countrybox", 1000.0);
    adderSkybox.getSkybox();

    engine.runRenderLoop(function() {
      if (typeof scene === "undefined") {
        return;
      } else {
        if (scene) {
          scene.render();
        }
      }
    });
    ///////////////////
    window.addEventListener("resize", function() {
      engine.resize();
    });
    ////////////////////
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
  ///////// componentDidMount.
  render() {
    return (
      <div>
        <div>Scene_Fast.jsx</div>
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
