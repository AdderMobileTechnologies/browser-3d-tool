/**
 * Purpose:
 * The AdderMeta class is for asynchronously retrieving the meta data from the server, and preparing it to be passed to the 'AdderLoader' scene.
 */

import AdderLoader from "./adderLoader";
import AdderSceneWrapper from "./adderSceneWrapper";
import * as K from "../constants";
import axios from "axios";
import { Scene } from "babylonjs";
import AdderAsset from "./adderAsset";
class AdderMeta {
  constructor(adderSceneWrapper = null) {
    if (
      adderSceneWrapper === null ||
      !(adderSceneWrapper instanceof AdderSceneWrapper)
    ) {
      throw new Error(
        `AdderLoader:Constructor() The argument for scene can not be null. `
      );
    }
    let _adderSceneWrapper = adderSceneWrapper;

    this.getAdderSceneWrapper = () => {
      return _adderSceneWrapper;
    };

    this.getEnvironment = () => {
      let adderSceneWrapper = this.getAdderSceneWrapper();
      let thisClass = this;
      this.promise_environments = new Promise(function(resolve, reject) {
        const url = `${K.META_URL}/meta/environment`;
        axios
          .get(url)
          .then(response => response.data)
          .then(data => {
            resolve(data);
          });
      });
      this.promise_environments.then(function(value) {
        thisClass.looper(value);
      });
    };

    this.getAdTypes = () => {
      let scene = this.getScene();
      let thisClass = this;
      this.promise_adTypes = new Promise(function(resolve, reject) {
        const url = `${K.META_URL}/meta/ad_types`;
        axios
          .get(url)
          .then(response => response.data)
          .then(data => {
            resolve(data);
          });
      });
      this.promise_adTypes.then(function(value) {
        thisClass.looper(value);
      });
    };

    this.getDesignOptions = () => {
      let scene = this.getScene();
      let thisClass = this;

      this.promise_designOptions = new Promise(function(resolve, reject) {
        const url = `${K.META_URL}/meta/design`;
        axios
          .get(url)
          .then(response => response.data)
          .then(data => {
            resolve(data);
          });
      });
      this.promise_designOptions.then(function(value) {
        thisClass.looper(value);
      });
    };

    this.looper = value => {
      let adderLoader = new AdderLoader(adderSceneWrapper);

      for (let m = 0; m < value.meta_data.length; m++) {
        let dir = value.meta_data[m]["dir"];
        let filename = value.meta_data[m]["filename"];
        let filepath = value.meta_data[m]["filepath"];
        let position = value.meta_data[m]["position"];
        let rotation = value.meta_data[m]["rotation"];
        let scaling = value.meta_data[m]["scaling"];
        let behavior = value.meta_data[m]["behavior"];
        console.log("behavior:", behavior);
        var adderAsset = new AdderAsset(
          dir,
          filename,
          filepath,
          position,
          rotation,
          scaling,
          behavior,
          adderSceneWrapper
        );

        adderLoader.addSingleModel(adderAsset);
      }
    };
  }
}

export default AdderMeta;
