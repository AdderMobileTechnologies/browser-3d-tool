import * as K from "../components/constants";

import React from "react";
import BABYLON from "babylonjs";
import axios from "axios";
import util from "util";

//models
import AdderModel from "./model";
import MeshWrapper from "./meshWrapper";
import AdderCamera from "./camera";
import { domainToASCII } from "url";

class Test {
  constructor(scene = null) {
    if (scene === null) {
      throw new Error(
        `Test:Constructor() The argument for scene can not be null. `
      );
    }
    let _scene = scene;

    this.returnArg = arg => {
      console.log("arg:", arg);
      //TODO: Start here:
      /*
        first see if I can load the selected ad type....then if so, 
        try and set up this class as a single source of truth for these load functions.....

      */
      /*
      var promise_adTypes = new Promise(function(resolve, reject) {
        const url = `${K.API_URL}/meta/ad_types`;
        axios
          .get(url)
          .then(response => response.data)
          .then(data => {
            resolve(data);
          });
      });
      promise_adTypes.then(function(value) {
        for (let m = 0; m < value.meta_data.length; m++) {
          // console.log("k:", value.meta_data[k]);
          let dir = value.meta_data[m]["dir"];
          let filename = value.meta_data[m]["filename"];
          let position = value.meta_data[m]["position"];
          let rotation = value.meta_data[m]["rotation"];
          let scaling = value.meta_data[m]["scaling"];
          addSingleModel(dir, filename, position, rotation, scaling);
        }
      });
      */
      return arg;
    };

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
        // console.log(mesh.id);
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
  }
}
export default Test;
