/**
 * AdderSceneWrapper
 * Purpose:
 * To create a single source of data that holds not only the babylon scene object, but an array of models that get created inside the scene, as
 * well as any other global parameter that might need to be available.
 */
import { Scene } from "babylonjs";
import * as GUI from "babylonjs-gui";
import AdderGuiUtility from "./adderGuiUtility";

class AdderSceneWrapper {
  constructor(scene = null, models = null, advancedTexture = null) {
    if (scene === null || !(scene instanceof Scene)) {
      throw new Error("AdderSceneWrapper");
    } else {
      // let grid = adderGuiUtility.gui_create_grid2(advancedTexture);
    }
    if (models === null) {
      // they might be null at first to be loaded later.
      models = [];
    }
    if (
      advancedTexture === null ||
      !(advancedTexture instanceof GUI.AdvancedDynamicTexture)
    ) {
      throw new Error(
        "AdderSceneWrapper: Constructor: Expects a Gui.AdvancedDynamicTexture as an arguement."
      );
    }

    let _scene = scene;
    let _models = models;
    let _uuid = Date();
    let _advancedTexture = advancedTexture;
    let adderGuiUtility = new AdderGuiUtility();
    let _grid = adderGuiUtility.gui_create_grid2(_advancedTexture);

    this.getUUID = () => {
      // console.log("AdderModelWrapper UUID:::", _uuid);
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
    this.getAdvancedTexture = () => {
      return _advancedTexture;
    };
    this.getGrid = () => {
      return _grid;
    };

    this.appendModels = adderModel => {
      _models.push(adderModel);
    };

    this.appendModel = adderModel => {
      // console.log(
      //   "ready to append model to the adderSceneWrapper ....adderModel:",
      //   adderModel
      // );
      let previousModels = this.getModels();
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
        let model = ModelsArray[mIndex];
        let meshWrappers = model.getMeshWrappers();
        for (let mwIndex in meshWrappers) {
          let meshWrapper = meshWrappers[mwIndex];
          let _mesh = meshWrapper.getMesh();
          let splitName = mesh_id.split("_");
          let currentMeshName = _mesh.name;
          let splitCurrentMesh = currentMeshName.split("_");
          if (_mesh.id !== mesh_id && splitName[3] === splitCurrentMesh[3]) {
            // console.log("setting mesh to invisible: _mesh.id", _mesh.id);
            _mesh.isVisible = false;
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
        let model = ModelsArray[mIndex];
        let meshWrappers = model.getMeshWrappers();
        for (let mwIndex in meshWrappers) {
          let meshWrapper = meshWrappers[mwIndex];
          let _mesh = meshWrapper.getMesh();

          if (_mesh.id === mesh_id) {
            return model;
          }
        }
      }
    };

    this.applyTextureToMesh = (mesh_id, dataURL) => {
      console.log("AdderSceneWrapper:this.applyTextureToMesh:  ");
      if (dataURL !== "empty dataURL") {
        let ModelsArray = this.getModels();
        for (let mIndex in ModelsArray) {
          let _model = ModelsArray[mIndex];
          let _meshWrappers = _model.getMeshWrappers();
          for (let mwIndex in _meshWrappers) {
            let _meshWrapper = _meshWrappers[mwIndex];
            let _mesh = _meshWrapper.getMesh();
            if (_mesh.id === mesh_id) {
              let scene = this.getScene();
              _meshWrapper.applyTextureFromDataURL(
                new Date().toTimeString() + ".png",
                dataURL,
                scene
              );
            }
          }
        }
      }
    };
  }
  disposeOfMeshesForModel(givenModelName) {
    let models = this.getModels();
    for (let x in models) {
      let modelX = models[x];
      let modelFileName = modelX.getModelFile();
      if (modelFileName === givenModelName) {
        let wrappers = modelX.getMeshWrappers();
        for (let w in wrappers) {
          let wrapperX = wrappers[w];
          let mesh = wrapperX.getMesh();
          // console.log("mesh.id:", mesh.id);
          mesh.dispose();
        }
      }
    }
  }

  removeEnvironmentModels(userModels) {
    /*
    IN: 
    userModels:  a key value array of user model names. ie. modelName:path to .babylon file
    ie.  {modelName: "ad_type/billboard/sub_type/2sides/detail/angled/Billboard.v1.1.babylon"}
    OUT: 
    void
    */
    //console.log(" removeEnvironmentModels(userModels):", userModels);
    let AllModels = this.getModels();
    let keptModels = [];
    let droppedModels = [];

    // IF userModels.length > 0 OTHERWISE remove all models
    console.log("userModels.length:", userModels.length);

    if (userModels.length > 0) {
      for (let x in AllModels) {
        let modelX = AllModels[x];
        let modelFileName = modelX.getModelFile();

        for (let um of userModels) {
          if (um.modelName !== modelFileName) {
            //prevent adding duplicates
            if (!droppedModels.includes(modelFileName)) {
              droppedModels.push(modelFileName);
            } else {
              //ignore
            }
          } else {
            keptModels.push(modelFileName);
          }
        }
      }
      //now loop through droppedModel and if NOT in kept then drop
      for (let dropper of droppedModels) {
        if (keptModels.includes(dropper)) {
          //leave it
        } else {
          //remove it
          this.disposeOfMeshesForModel(dropper);
        }
      }
    } else {
      console.log("remove previous environmenty models here.");
      for (let x in AllModels) {
        let modelX = AllModels[x];
        let modelFileName = modelX.getModelFile();
        this.disposeOfMeshesForModel(modelFileName);
      }
    }
  }
}
export default AdderSceneWrapper;
