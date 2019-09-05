/*
Purpose: 
The AdderAsset class is for handling the meta data before passing it on to the rest of the application.
LEFT OFF HERE: 
create an asset class to clean up the way I currently call AdderLoader.addSingleModel 
then... look into handling behavior of clicks .
*/
import { Scene } from "babylonjs";

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

    _dir = dir;
    _filename = filename;
    _postion = position;
    _rotation = rotation;
    _scaling = scaling;
    _scene = scene;

    this.getDir = () => {
      return _dir;
    };
    this.getFilename = () => {
      return _filename;
    };
    this.getPosition = () => {
      return _position;
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
