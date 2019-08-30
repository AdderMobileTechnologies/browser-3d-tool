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
import { Mesh, Vector3, Quaternion } from "babylonjs";

class MeshWrapper {
  constructor(mesh = null, position = null, rotation = null) {
    //NOT SURE if Mesh Class is getting used correctly.
    if (!(mesh instanceof Mesh)) {
      throw new Error(
        "MeshWrapper.Constructor(): Constructor called with unspecified mesh (Requires: BABYLON.Mesh )"
      );
    }
    /* 
        I'm not sure we  really need to reject these if they are null.
        if(!(position instanceof Vector3)) {
            throw new Error("MeshWrapper.Constructor(): Constructor called with unspecified position (Requires: BABYLON.Vector3 )")
        }
        if( !(rotation instanceof Quaternion) ){
            throw new Error("MeshWrapper.Constructor(): Constructor called with unspecified rotation (Requires: BABYLON.Quaternion ")
        }
        */

    let _arrayOfListeners = [];
    let _mesh = mesh;
    let _position = position;
    let _rotation = rotation;

    this.getMesh = () => {
      return _mesh;
    };
    this.getPosition = () => {
      return _position;
    };
    this.getRotation = () => {
      return _rotation;
    };

    //TODO: not sure about these event listener snippets.
    this.addListener = e => {
      _arrayOfListeners.push(e);
    };

    this.onEvent = e => {
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
        "MeshWrapper.setMesh():  called with unspecified mesh (Requires: BABYLON.Mesh )"
      );
    }
    this._mesh = mesh;
  }
  setPosition(position) {
    if (position === null || !(position instanceof Vector3)) {
      throw new Error(
        `MeshWrapper.setPosition() called with incorrect argument ( requires BABYLON.Vector3 )`
      );
    }
    this._position = position;
  }
}
export default MeshWrapper;
