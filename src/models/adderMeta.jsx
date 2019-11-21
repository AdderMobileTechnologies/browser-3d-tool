/**
 * Purpose:
 * The AdderMeta class is for asynchronously retrieving the meta data from the server, and preparing it to be passed to the 'AdderLoader' scene.
 */

import AdderLoader from "./adderLoader";
//import AdderSceneWrapper from "./adderSceneWrapper";
import * as K from "../constants";
//.env fix
import axios from "axios";
//import { Scene } from "babylonjs";
import AdderAsset from "./adderAsset";
class AdderMeta {
  constructor(adderSceneWrapper = null) {
    /*
    if (
      adderSceneWrapper === null ||
      !(adderSceneWrapper instanceof AdderSceneWrapper)
    ) {
      throw new Error(
        `AdderLoader:Constructor() The argument for scene can not be null. `
      );
    }
    */

    let _adderSceneWrapper = adderSceneWrapper;

    this.getAdderSceneWrapper = () => {
      return _adderSceneWrapper;
    };

    this.getEnvironment = environment => {
      //  let adderSceneWrapper = this.getAdderSceneWrapper(); //commented out because was not getting used.
      let thisClass = this;
      switch (environment) {
        case "CITY":
          this.promise_environments = new Promise(function (resolve, reject) {
            const url = `${K.META_URL}/v1/meta/environment`;
            axios
              .get(url)
              .then(response => response.data)
              .then(data => {
                resolve(data);
              });
          });
          this.promise_environments.then(function (value) {
            thisClass.looper(value);
          });

          break;
        case "COUNTRY":
          // console.log("AdderMeta: getEnvironment: COUNTRY");
          this.promise_environments = new Promise(function (resolve, reject) {
            const url = `${K.META_URL}/v1/meta/environment2`;
            axios
              .get(url)
              .then(response => response.data)
              .then(data => {
                resolve(data);
              });
          });
          this.promise_environments.then(function (value) {
            thisClass.looper(value);
          });
          break;
        default:
          this.promise_environments = new Promise(function (resolve, reject) {
            const url = `${K.META_URL}/v1/meta/environment`;
            axios
              .get(url)
              .then(response => response.data)
              .then(data => {
                resolve(data);
              });
          });
          this.promise_environments.then(function (value) {
            thisClass.looper(value);
          });
          break;
      }
    };

    this.getDesignOptions = () => {
      // let scene = this.getScene();
      let thisClass = this;

      this.promise_designOptions = new Promise(function (resolve, reject) {
        const url = `${K.META_URL}/v1/meta/design`;
        axios
          .get(url)
          .then(response => response.data)
          .then(data => {
            resolve(data);
          });
      });
      this.promise_designOptions.then(function (value) {
        thisClass.looper(value);
      });
    };

    this.looper = value => {
      let adderLoader = new AdderLoader(adderSceneWrapper);

      for (let m = 0; m < value.meta_data.length; m++) {
        let dir = value.meta_data[m]["dir"];
        let name = value.meta_data[m]["name"];
        let filename = value.meta_data[m]["filename"];
        let filepath = value.meta_data[m]["filepath"];
        let position = value.meta_data[m]["position"];
        let rotation = value.meta_data[m]["rotation"];
        let scaling = value.meta_data[m]["scaling"];
        let behavior = value.meta_data[m]["behavior"];
        //console.log("behavior:", behavior);

        let adderAsset = new AdderAsset(
          dir,
          name,
          filename,
          filepath,
          position,
          rotation,
          scaling,
          behavior,
          adderSceneWrapper
        );
        // console.log("adderAsset name:", adderAsset.getFilename());
        // console.log("adderAsset behavior:", adderAsset.getBehavior());
        //TODO:Environment from adderMeta to adderSceneWrapper
        // (?) Use 'adderSceneWrapper' to store an array of environment assets, so they can be used to swap out later.
        // console.log("an adder asset:", adderAsset);
        // console.log(adderAsset.getFilepath()); // example: CITY/construction_site.babylon
        // IF we stored the files like this... Environment/CITY/construction_site.babylon , then we could split on "/" knowing that [0] = Environment [1] = either 'CITY' or 'COUNTRY' , etc.
        //expected to see 'user selected models here as well but do not yet.
        adderLoader.addSingleModel(adderAsset);
      }
    };
  }
}

export default AdderMeta;
