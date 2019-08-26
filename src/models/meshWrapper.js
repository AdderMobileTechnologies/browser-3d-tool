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
import { Mesh, Vector3, Quaternion } from 'babylonjs';

class MeshWrapper {
    constructor(_newMesh = null, _newPosition = null, _newRotation = null) {
        //NOT SURE if Mesh Class is getting used correctly.
        if (!(_newMesh instanceof Mesh)) {
            throw new Error("MeshWrapper.Constructor(): Constructor called with unspecified _newMesh (Requires: BABYLON.Mesh )")
        }
        /* 
        I'm not sure we  really need to reject these if they are null.
        if(!(_newPosition instanceof Vector3)) {
            throw new Error("MeshWrapper.Constructor(): Constructor called with unspecified _newPosition (Requires: BABYLON.Vector3 )")
        }
        if( !(_newRotation instanceof Quaternion) ){
            throw new Error("MeshWrapper.Constructor(): Constructor called with unspecified _newRotation (Requires: BABYLON.Quaternion ")
        }
        */

        let _arrayOfListeners = []
        let _mesh = _newMesh
        let _position = _newPosition
        let _rotation = _newRotation

        this.getMesh = () => { return _mesh }
        this.getPosition = () => { return _position }
        this.getRotation = () => { return _rotation }

        this.addListener = (e) => {
            _arrayOfListeners.push(e)
        }

        this.onEvent = (e) => {
            for (let listener of _arrayOfListeners) {
                listener(e);
            }
        }
        this.removeListener = (e) => {
            for (let i = 0; i < _arrayOfListeners.length; ++i) {
                if (_arrayOfListeners[i] === e) {
                    _arrayOfListeners.splice(i, 1);
                }
            }
        }
    }

}
export default MeshWrapper



