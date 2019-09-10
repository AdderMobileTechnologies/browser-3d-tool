//PURPOSE:
/**
 * The AdderLoader is here to import models from the server asynchronously.
 * It requires the 'scene' as a parameter during construction.
 *
 */
import BABYLON from "babylonjs";
import * as K from "../constants";
import { Scene } from "babylonjs";
import AdderSceneWrapper from "./adderSceneWrapper";
//models
import AdderModel from "./adderModel";
import AdderMeshWrapper from "./adderMeshWrapper";
import Memory from "./memory";
class AdderLoader {
  constructor(adderSceneWrapper = null) {
    if (
      adderSceneWrapper === null ||
      !(adderSceneWrapper instanceof AdderSceneWrapper)
    ) {
      throw new Error(
        `AdderLoader:Constructor() The argument for scene must be an AdderSceneWrapper NOT a Babylon.Scene. `
      );
    }
    let _adderSceneWrapper = adderSceneWrapper;
    this.getAdderSceneWrapper = () => {
      return _adderSceneWrapper;
    };

    this.modelLoader = async function loadModelAsync(adderModel) {
      let adderSceneWrapper = this.getAdderSceneWrapper();
      /* 
               SceneLoader constructor()
                  SceneLoader.ImportMeshAsync(
                      meshNames: any, 
                      assets_URL: string, 
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
      let assets_URL = K.API_URL + "/assets/";
      let sceneFileName = adderModel.getModelFile();
      let onProgress = null;
      let pluginExtension = null;

      let scene = adderSceneWrapper.getScene();
      let result = await BABYLON.SceneLoader.ImportMeshAsync(
        meshNames,
        assets_URL,
        sceneFileName,
        scene,
        onProgress,
        pluginExtension
      );
      await callback_ImportMeshAsync(adderModel, result);
    };

    function callback_ImportMeshAsync(adderModel, result) {
      const adderMeshWrappers = [];
      //make adderModel parent mesh, the parent of all individual meshes.
      //wrap each mesh in the adderMeshWrapper class and build the array.
      //add the array to the model.
      var mySelectables = [];

      result.meshes.forEach(function(mesh) {
        //get Behaviors via models meta data.
        mesh.parent = adderModel.getParentMesh();
        var behavior = adderModel.getBehavior();
        mesh.isPickable = false;
        console.log("mesh.id:", mesh.id);
        console.log("BEHAVIOR:", behavior);
        var isSelectable = false;
        for (var index in behavior) {
          let currentStrategy = behavior[index]["strategy"];
          if (currentStrategy == "select") {
            var selectParams = behavior[index]["parameters"];
            for (var meshIndex in selectParams["pickableMeshes"]) {
              var currentPickableMeshName =
                selectParams["pickableMeshes"][meshIndex];
              if (currentPickableMeshName === mesh.id) {
                console.log("match!");
                mySelectables.push(mesh.id);
                isSelectable = true;
                mesh.isPickable = true;
                console.log("did the isPickable property take? mesh:", mesh);
              } else {
                isSelectable = false;
              }
            }
            // THIS shows me ALL of the meshes of a particular model.
            // but I only want one or two.

            console.log("mesh.id", mesh.id);
            console.log("selectParams", selectParams);
          }
          if (currentStrategy == "no-select") {
            isSelectable = false;
          }
        }
        console.log(
          "FINAL MESH TREATMENT BEFORE added to a Wrapper: mesh:",
          mesh
        );

        let newAdderMeshWrapper = new AdderMeshWrapper(mesh, null, null);
        adderMeshWrappers.push(newAdderMeshWrapper);
      });
      console.log("mySelectables:", mySelectables);
      // let mem = new Memory(mySelectables);
      // mem.check();
      adderModel.setMeshWrappers(adderMeshWrappers);
    }

    this.addSingleModel = function(adderAsset) {
      let position = adderAsset.getPosition();
      let positionVect = new BABYLON.Vector3(
        position.x,
        position.y,
        position.z
      );
      let rotation = adderAsset.getRotation();
      let rotationAxisVect = new BABYLON.Vector3(
        rotation.axis.x,
        rotation.axis.y,
        rotation.axis.z
      );
      var rotationAngle = parseFloat(rotation.angle);
      let scaling = adderAsset.getScaling();
      let scalingVect = new BABYLON.Vector3(scaling.x, scaling.y, scaling.z);
      let behavior = adderAsset.getBehavior();

      let dir = adderAsset.getDir();
      let filename = adderAsset.getFilename();
      let filepath = adderAsset.getFilepath();
      //////////////////////////////////////////////////////////////
      //let modelFile = dir + "/" + filename + `.babylon`;
      let modelFile = filepath;
      console.log("model path to file modelFile:", modelFile);
      ///////////////////////////////////////////////////////////////////
      let adderModel = new AdderModel(
        adderSceneWrapper,
        modelFile,
        null,
        positionVect,
        rotationAxisVect,
        rotationAngle,
        [],
        scalingVect,
        behavior
      );

      this.modelLoader(adderModel);

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
    };
  }
}
export default AdderLoader;
