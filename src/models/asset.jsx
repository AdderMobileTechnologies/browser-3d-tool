/*
Purpose: 
The AdderAsset class is for handling individual pieces of the meta data before passing it on to the rest of the application.
LEFT OFF HERE: 
create an asset class to clean up the way I currently call AdderLoader.addSingleModel 
then... look into handling behavior of clicks .
*/
import { Scene } from "babylonjs";
import * as K from "../constants";

class AdderAsset {
  constructor(
    dir = null,
    filename = null,
    position = null,
    rotation = null,
    scaling = null,
    scene = null
  ) {
    if (dir === null) {
      throw new Error(
        "AdderAsset:Constructor(): A parameter is expected for the directory that the asset is stored in."
      );
    }
    if (scene === null || !(scene instanceof Scene)) {
      throw new Error(
        "AdderAsset:Constructor(): A BABYLON.Scene object is required to build an asset."
      );
    }

    let _dir = dir;
    let _filename = filename;
    let _position = position;
    let _rotation = rotation;
    let _scaling = scaling;
    let _scene = scene;

    this.getDir = () => {
      return _dir;
    };
    this.getFilename = () => {
      return _filename;
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
    this.getScene = () => {
      return _scene;
    };
  }
}
export default AdderAsset;
