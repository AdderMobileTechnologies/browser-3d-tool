//Purpose: create a wrapper around a mesh to add additional control to that mesh.
// - 'The original mesh object' from babylon file.
// - position
// - rotation
// - array of listeners

// Input Types:
// - mesh                   https://doc.babylonjs.com/api/classes/babylon.mesh
// - position Vector3       https://doc.babylonjs.com/api/classes/babylon.vector3
// - rotation Quaternion    https://doc.babylonjs.com/api/classes/babylon.quaternion
//import * as BABYLON from 'babylonjs';

/* TODO:
The rotation property should be handled the same way it is handled in the AdderModel class.
ie. 
rotationAxis = null,
rotationAngle = null,
*/
import { Mesh, Vector3, Texture, StandardMaterial, Scene } from "babylonjs";
//removed:  Quaternion,

class AdderMeshWrapper {
  constructor(mesh = null, position = null, rotation = null) {
    //NOT SURE if Mesh Class is getting used correctly.
    if (!(mesh instanceof Mesh)) {
      throw new Error(
        "AdderMeshWrapper.Constructor(): Constructor called with unspecified mesh (Requires: BABYLON.Mesh )"
      );
    }
    /* 
        I'm not sure we  really need to reject these if they are null.
        if(!(position instanceof Vector3)) {
            throw new Error("AdderMeshWrapper.Constructor(): Constructor called with unspecified position (Requires: BABYLON.Vector3 )")
        }
        if( !(rotation instanceof Quaternion) ){
            throw new Error("AdderMeshWrapper.Constructor(): Constructor called with unspecified rotation (Requires: BABYLON.Quaternion ")
        }
    */

    let _arrayOfListeners = [];
    let _mesh = mesh;
    let _position = position;
    let _rotation = rotation;
    let _UUID = Date();

    this.getMesh = () => {
      return _mesh;
    };
    this.getPosition = () => {
      return _position;
    };
    this.getRotation = () => {
      return _rotation;
    };
    this.getUUID = () => {
      return _UUID;
    };
    //TODO: not sure about these event listener snippets.
    this.addListener = e => {
      _arrayOfListeners.push(e);
    };

    this.onEvent = e => {
      //terminal error:  'listener' is defined but never used    no-unused-vars
      for (let listener of _arrayOfListeners) {
        listener(e);
      }
    };
    this.removeListener = e => {
      for (let i = 0; i < _arrayOfListeners.length; ++i) {
        if (_arrayOfListeners[i] === e) {
          _arrayOfListeners.splice(i, 1);
        }
      }
    };
  }
  setMesh(mesh) {
    if (!(mesh instanceof Mesh)) {
      throw new Error(
        "AdderMeshWrapper.setMesh():  called with unspecified mesh (Requires: BABYLON.Mesh )"
      );
    }
    this._mesh = mesh;
  }
  setPosition(position) {
    if (position === null || !(position instanceof Vector3)) {
      throw new Error(
        `AdderMeshWrapper.setPosition() called with incorrect argument ( requires BABYLON.Vector3 )`
      );
    }
    this._position = position;
  }
  setRotation(rotation) {
    if (rotation === null || !(rotation instanceof Vector3)) {
      throw new Error(
        `AdderMeshWrapper:setRotation(): Requires a BABYLON.Vector3 parameter.`
      );
    }
    this._rotation = rotation;
  }

  applyTextureFromDataURL(imgFileName = null, dataURL = null, scene = null) {
    if (imgFileName === null) {
      throw new Error(
        `AdderMeshWrapper:applyTextureFromDataURL(): A file imgFileName parameter is expected .`
      );
    }
    if (dataURL === null) {
      throw new Error(
        `AdderMeshWrapper:applyTextureFromDataURL(): A DataURL parameter is expected in the format of (data:image/png;base64,iVBORw0KGgoAAAA....)`
      );
    }
    if (scene == null || !(scene instanceof Scene)) {
      throw new Error(
        `AdderMeshWrapper:applyTextureFromDataUrl(): A BABYLON.Scene parameter is required .`
      );
    }
    //(?) should we track a history of textures applied to this mesh inside the class ? ( trying to solve the bug where when last iimage removed , another image is displayed. )

    let _imgFileName = imgFileName;
    let _dataURL = dataURL;
    let _scene = scene;
    let mesh = this.getMesh(); //was let
    let tex = Texture.LoadFromDataString(_imgFileName, _dataURL, _scene);
    let mat = new StandardMaterial("mat", _scene);
    mat.diffuseTexture = tex;
    mesh.material = mat;
  }
}
export default AdderMeshWrapper;
