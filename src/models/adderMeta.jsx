/**
 * Purpose:
 * The AdderMeta class is for asynchronously retrieving the meta data from the server, and preparing it to be passed to the 'AdderLoader' scene.
 */

import AdderLoader from "./adderLoader";
import * as K from "../components/constants";
import axios from "axios";
import { Scene } from "babylonjs";

class AdderMeta {
  constructor(scene = null) {
    if (scene === null || !(scene instanceof Scene)) {
      throw new Error(
        `AdderLoader:Constructor() The argument for scene can not be null. `
      );
    }
    let _scene = scene;

    this.getScene = () => {
      return _scene;
    };

    this.getEnvironment = () => {
      //////////////////
      let scene = this.getScene();
      let thisClass = this;
      this.promise_environments = new Promise(function(resolve, reject) {
        const url = `${K.API_URL}/meta/environment`;
        axios
          .get(url)
          .then(response => response.data)
          .then(data => {
            resolve(data);
          });
      });
      //->
      this.promise_environments.then(function(value) {
        thisClass.looper(value);
      });
    };
    this.getAdTypes = () => {
      let scene = this.getScene();
      let thisClass = this;
      ///////////////////
      this.promise_adTypes = new Promise(function(resolve, reject) {
        const url = `${K.API_URL}/meta/ad_types`;
        axios
          .get(url)
          .then(response => response.data)
          .then(data => {
            resolve(data);
          });
      });
      //->
      this.promise_adTypes.then(function(value) {
        thisClass.looper(value);
      });
      /////////////////
    };
    this.looper = value => {
      let adderLoader = new AdderLoader(scene);

      for (let m = 0; m < value.meta_data.length; m++) {
        let dir = value.meta_data[m]["dir"];
        let filename = value.meta_data[m]["filename"];
        let position = value.meta_data[m]["position"];
        let rotation = value.meta_data[m]["rotation"];
        let scaling = value.meta_data[m]["scaling"];
        adderLoader.addSingleModel(
          dir,
          filename,
          position,
          rotation,
          scaling,
          scene
        );
      }
    };
  }
}

export default AdderMeta;
