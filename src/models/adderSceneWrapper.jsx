/**
 * AdderSceneWrapper
 * Purpose:
 * To create a single source of data that holds not only the babylon scene object, but an array of models that get created inside the scene, as
 * well as any other global parameter that might need to be available.
 */
import { Scene } from "babylonjs";

class AdderSceneWrapper {
  constructor(scene = null, models = null) {
    if (scene === null || !(scene instanceof Scene)) {
      throw new Error("AdderSceneWrapper");
    }
    if (models === null) {
      // they might be null at first to be loaded later.
      models = [];
    }
    let _scene = scene;
    let _models = models;

    this.getScene = () => {
      return _scene;
    };
    this.getModels = () => {
      return _models;
    };
    this.setModels = models => {
      _models = models;
    };
    this.appendModels = adderModel => {
      _models.push(adderModel);
    };

    this.acceptData = data => {
      console.log("AdderSceneWrapper has accepted data:", data);
    };
    this.appendModel = adderModel => {
      console.log(
        "ready to append model to the adderSceneWrapper ....adderModel:",
        adderModel
      );
      var previousModels = this.getModels();
      previousModels.push(adderModel);
      this.setModels(previousModels);
    };
    this.hideSisterMeshesForMeshId = mesh_id => {
      console.log("adderSceneWrapper:hideSisterMeshesForMeshId()");
      let ModelsArray = this.getModels();
      for (let mIndex in ModelsArray) {
        var model = ModelsArray[mIndex];
        var meshWrappers = model.getMeshWrappers();
        for (let mwIndex in meshWrappers) {
          let meshWrapper = meshWrappers[mwIndex];
          let myMesh = meshWrapper.getMesh();
          let splitName = mesh_id.split("_");
          let currentMeshName = myMesh.name;
          let splitCurrentMesh = currentMeshName.split("_");
          if (myMesh.id !== mesh_id && splitName[0] === splitCurrentMesh[0]) {
            console.log("setting mesh to invisible: myMesh.id", myMesh.id);
            myMesh.isVisible = false;
          }
          if (myMesh.id === mesh_id) {
            console.log("Match mesh.id:", mesh_id);
            console.log("Match parent model:", model);
            console.log("Match meshWrapper:", meshWrapper);
          }
        }
      }
    };

    this.findByMeshId = mesh_id => {
      console.log("adderSceneWrapper:findByMeshId()");
      let ModelsArray = this.getModels();
      for (let mIndex in ModelsArray) {
        var model = ModelsArray[mIndex];
        var meshWrappers = model.getMeshWrappers();
        for (let mwIndex in meshWrappers) {
          let meshWrapper = meshWrappers[mwIndex];
          let myMesh = meshWrapper.getMesh();
          if (myMesh.id === mesh_id) {
            console.log("Match mesh.id:", mesh_id);
            console.log("Match parent model:", model);
            console.log("Match meshWrapper:", meshWrapper);
          }
        }
      }
    };
  }
}
export default AdderSceneWrapper;
