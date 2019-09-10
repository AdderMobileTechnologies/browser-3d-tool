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
    let _uuid = Date();

    this.getUUID = () => {
      console.log("AdderModelWrapper UUID:::", _uuid);
      return _uuid;
    };

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
      /*
      example in new format:
      vehicle_2door_sportscar_rightside_small
      vs 
      vehicle_2door_sportscar_rightside_large
      thus splitName[3]  where 3 = reightside.
      */
      let ModelsArray = this.getModels();
      for (let mIndex in ModelsArray) {
        var model = ModelsArray[mIndex];
        var meshWrappers = model.getMeshWrappers();
        for (let mwIndex in meshWrappers) {
          let meshWrapper = meshWrappers[mwIndex];
          let _mesh = meshWrapper.getMesh();
          let splitName = mesh_id.split("_");
          let currentMeshName = _mesh.name;
          let splitCurrentMesh = currentMeshName.split("_");
          if (_mesh.id !== mesh_id && splitName[3] === splitCurrentMesh[3]) {
            console.log("setting mesh to invisible: _mesh.id", _mesh.id);
            _mesh.isVisible = false;
          }
          if (_mesh.id === mesh_id) {
            console.log("Match mesh.id:", mesh_id);
            console.log("Match parent model:", model);
            console.log("Match meshWrapper:", meshWrapper);
          }
        }
      }
    };

    this.getModelForMeshId = mesh_id => {
      console.log("adderSceneWrapper:getModelForMeshId()");
      /*
      example in new format:
      vehicle_2door_sportscar_rightside_small
      vs 
      vehicle_2door_sportscar_rightside_large
      thus splitName[3]  where 3 = reightside.
      */
      let ModelsArray = this.getModels();
      for (let mIndex in ModelsArray) {
        var model = ModelsArray[mIndex];
        var meshWrappers = model.getMeshWrappers();
        for (let mwIndex in meshWrappers) {
          let meshWrapper = meshWrappers[mwIndex];
          let _mesh = meshWrapper.getMesh();

          if (_mesh.id === mesh_id) {
            console.log("Match mesh.id:", mesh_id);
            console.log("Match parent model:", model);
            console.log("Match meshWrapper:", meshWrapper);
            return model;
          }
        }
      }
    };

    this.applyTextureToMesh = (mesh_id, dataURL) => {
      console.log("AdderSceneWrapper:this.applyTextureToMesh:  ");
      console.log("mesh_id:", mesh_id);
      console.log("dataURL:", dataURL);
      let ModelsArray = this.getModels();
      console.log("ModelsArray.lenth", ModelsArray.length);
      for (let mIndex in ModelsArray) {
        var _model = ModelsArray[mIndex];
        var _meshWrappers = _model.getMeshWrappers();
        for (let mwIndex in _meshWrappers) {
          let _meshWrapper = _meshWrappers[mwIndex];
          let _mesh = _meshWrapper.getMesh();
          if (_mesh.id === mesh_id) {
            console.log("Match _mesh.id:", _mesh.id);
            console.log("Match parent _model:", _model);
            console.log("Match _meshWrapper:", _meshWrapper);
            let scene = this.getScene();
            if (!(scene instanceof Scene)) {
              console.log("NOT INSTANCEOF");
            } else {
              console.log("IS !");
            }
            // var filename = "file_".this.getUUID().".png";
            // console.log("filename:",filename);
            _meshWrapper.applyTextureFromDataURL(
              new Date().toTimeString() + ".png",
              dataURL,
              scene
            );
          }
        }
      }
    };
  }
}
export default AdderSceneWrapper;
