//PURPOSE:
/**
 * The AdderLoader is here to import models from the server asynchronously.
 * It requires the 'scene' as a parameter during construction.
 *
 */
import BABYLON from "babylonjs";
import * as K from "../constants";
//import { Scene } from "babylonjs";
import AdderSceneWrapper from "./adderSceneWrapper";
//models
import AdderModel from "./adderModel";
import AdderMeshWrapper from "./adderMeshWrapper";
import AdderGuiUtility from "./adderGuiUtility";

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
      console.log("sceneFileName:", sceneFileName);
      if (sceneFileName === "" || sceneFileName === "undefined") {
        console.log(" ------   NULL scene File ---------------");
      }
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
      // Loop through meshes,set parent mesh, set behavior, embed in a MeshWrapper and append to model's array of MeshWrappers.
      /**
       * IN:
       *  adderModel : The instance of a model that was just asynchronously pulled down from the server.
       *  result: What is returned after a successful import, mainly the "meshes" that make up the model.
       */

      const adderMeshWrappers = [];
      //------------------------------------------------
      var applyGui = false;
      var notAlreadyApplied = true;
      const asw = adderModel.getAdderSceneWrapper();
      const advancedTexture = asw.getAdvancedTexture();
      let adderGuiUtility = new AdderGuiUtility(advancedTexture);
      // let grid = adderGuiUtility.gui_create_grid2(advancedTexture);
      const grid = asw.getGrid();
      //--------------------------------------------------
      result.meshes.forEach(function(mesh) {
        //get Behaviors via models meta data.
        mesh.parent = adderModel.getParentMesh();
        let behavior = adderModel.getBehavior();
        mesh.isPickable = false; // set all meshes to Not Clickable by default

        for (let index in behavior) {
          let currentStrategy = behavior[index]["strategy"];
          //Usage: Set-Selectable-Meshes
          if (currentStrategy === "select") {
            let selectParams = behavior[index]["parameters"];
            for (let meshIndex in selectParams["pickableMeshes"]) {
              let currentPickableMeshName =
                selectParams["pickableMeshes"][meshIndex];
              if (currentPickableMeshName === mesh.id) {
                //console.log("MATCH!");
                mesh.isPickable = true; // ONLY set meshes from the models meta data for behavior strategy select and pickableMeshes
              }
            }
          }
          //Usage: Set-Hidden-Meshes
          if (currentStrategy === "hidden") {
            let hiddenParams = behavior[index]["parameters"];
            for (let meshIndex in hiddenParams["hiddenMeshes"]) {
              let currentHiddenMeshName =
                hiddenParams["hiddenMeshes"][meshIndex];
              if (currentHiddenMeshName === mesh.id) {
                // console.log("hidden MATCH!");
                // console.log(mesh.id);
                mesh.isVisible = false; // NOT isHidden
              }
            }
          }
          // Apply Control Group to The mesh.parent to effect the entire mesh. ie. for rotating a model.
          if (currentStrategy === "gui") {
            applyGui = true;
            //can we use meta data for other gui  'conditions'  (?) maybe capture and store the entire strategy object and make it available in
            // the upcoming switch case condition.
          }
        }

        if (applyGui && notAlreadyApplied) {
          //console.log("what is the mesh.parent", mesh.parent); //"name of self"
          // var control = null;
          var results = null;
          var header = null;
          var slider = null;
          switch (mesh.parent.id) {
            case "ad_type/billboard/sub_type/2sides/detail/angled/Billboard.v1.1.babylon":
              results = adderGuiUtility.control_sliderWithHeader(
                mesh.parent,
                "billboard"
              );
              header = results[0];
              slider = results[1];
              adderGuiUtility.panel_Grid(advancedTexture, header, slider, 1);
              break;
            case "ad_type/vehicle/sub_type/2door/detail/sportscar/porsche2.2.babylon":
              results = adderGuiUtility.control_sliderWithHeader(
                mesh.parent,
                "porsche"
              );
              header = results[0];
              slider = results[1];
              adderGuiUtility.panel_Grid(advancedTexture, header, slider, 2);
              break;
            case "ad_type/vehicle/sub_type/2door/detail/sportscar/porsche2.2.1.babylon":
              results = adderGuiUtility.control_sliderWithHeader(
                mesh.parent,
                "porsche"
              );
              header = results[0];
              slider = results[1];
              adderGuiUtility.panel_Grid(advancedTexture, header, slider, 2);
              break;
            case "ad_type/vehicle/sub_type/4door/detail/stationwagon/vw_toureg-2.6.babylon":
              results = adderGuiUtility.control_sliderWithHeader(
                mesh.parent,
                "vw"
              );
              header = results[0];
              slider = results[1];
              adderGuiUtility.panel_Grid(advancedTexture, header, slider, 3);
              break;
            case "ad_type/vehicle/sub_type/4door/detail/stationwagon/vw_toureg-2.6.1.babylon":
              results = adderGuiUtility.control_sliderWithHeader(
                mesh.parent,
                "vw"
              );
              header = results[0];
              slider = results[1];
              adderGuiUtility.panel_Grid(advancedTexture, header, slider, 3);
              break;
            default:
              console.log(
                "> > > > >mesh parent id: mesh.parent.id:",
                mesh.parent.id
              );
              break;
          }

          // console.log("GOT A CONTROL: control:", control);
          //need col, and row info

          applyGui = false; //reset flag
          notAlreadyApplied = false;
        }

        let newAdderMeshWrapper = new AdderMeshWrapper(mesh, null, null);
        adderMeshWrappers.push(newAdderMeshWrapper);
      });

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
      //console.log("rotation:", rotation);
      let rotationAxisVect = new BABYLON.Vector3(
        rotation.axis.x,
        rotation.axis.y,
        rotation.axis.z
      );
      let rotationAngle = parseFloat(rotation.angle);
      //console.log("rotationAngle:", rotationAngle);
      let scaling = adderAsset.getScaling();
      let scalingVect = new BABYLON.Vector3(scaling.x, scaling.y, scaling.z);
      let behavior = adderAsset.getBehavior();

      // let filename = adderAsset.getFilename();
      let filepath = adderAsset.getFilepath();
      //////////////////////////////////////////////////////////////

      let modelFile = filepath;
      // console.log("model path to file modelFile:", modelFile);
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
      //adderLoader.modelLoader(adderModel)
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
      // let adderModelRotationAngle = adderModel.getRotationAngle();
      let adderModelRotationRadian = adderModel.getRotationRadian();
      let adderModelRotationAxis = adderModel.getRotationAxis();
      let quaternion = new BABYLON.Quaternion.RotationAxis(
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
