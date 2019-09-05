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
  }
}
export default AdderSceneWrapper;
