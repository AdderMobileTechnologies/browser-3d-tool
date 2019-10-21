/*
Purpose: 
The AdderAsset class is for handling individual pieces of the meta data before passing it on to the rest of the application.
LEFT OFF HERE: 
create an asset class to clean up the way I currently call AdderLoader.addSingleModel 
then... look into handling behavior of clicks .
*/
//import { Scene } from "babylonjs";
//import * as K from "../constants";
import AdderSceneWrapper from "./adderSceneWrapper";
class AdderAsset {
  constructor(
    dir = null,
    name = null,
    filename = null,
    filepath = null,
    position = null,
    rotation = null,
    scaling = null,
    behavior = null,
    adderSceneWrapper = null
  ) {
    if (dir === null) {
      throw new Error(
        "AdderAsset:Constructor(): A parameter is expected for the directory that the asset is stored in."
      );
    }
    if (name === null) {
      throw new Error("AdderAsset:Constructor() A name parameter is required.");
    }

    if (filename === null) {
      throw new Error(
        "AdderAsset:Constructor() A filename parameter is required."
      );
    }
    if (filepath === null) {
      throw new Error(
        `AdderAsset:Constructor() A filepath to the resource starting from the point of .../html/assets/ is required.`
      );
    }

    if (position === null) {
      throw new Error(
        "AdderAsset:Constructor() A position parameter is required."
      );
    }
    if (rotation === null) {
      throw new Error(
        "AdderAsset:Constructor(): A rotation parameter is required."
      );
    }
    if (scaling === null) {
      throw new Error(
        "AdderAsset:Constructor() A scaling parameter is required. "
      );
    }
    if (behavior === null) {
      throw new Error(
        "AdderAsset:Constructor() A behavior parameter is required."
      );
    }
    if (
      adderSceneWrapper === null ||
      !(adderSceneWrapper instanceof AdderSceneWrapper)
    ) {
      throw new Error(
        "AdderAsset:Constructor(): A AdderSceneWrapper object is required to build an asset."
      );
    }

    let _dir = dir;
    let _name = name;
    let _filename = filename;
    let _filepath = filepath;
    let _position = position;
    let _rotation = rotation;
    let _scaling = scaling;
    let _behavior = behavior;
    let _adderSceneWrapper = adderSceneWrapper;

    this.getDir = () => {
      return _dir;
    };
    this.getName = () => {
      return _name;
    };
    this.getFilename = () => {
      return _filename;
    };
    this.getFilepath = () => {
      return _filepath;
    };
    this.getPosition = () => {
      return _position;
    };
    this.getRotation = () => {
      return _rotation;
    };
    this.getScaling = () => {
      return _scaling;
    };
    this.getBehavior = () => {
      return _behavior;
    };
    this.getAdderSceneWrapper = () => {
      return _adderSceneWrapper;
    };
    this.getAdderAsset = () => {
      return this;
    };
  }
}
export default AdderAsset;
