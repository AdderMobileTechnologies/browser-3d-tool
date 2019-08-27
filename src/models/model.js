//purpose: to create a class for  models or collections of meshes 
import { Mesh, Vector3, Quaternion } from 'babylonjs';

class AdderModel {
    constructor(_newModelFile = null, _newArrayOfMeshWrappers = null, _newPosition = null, _newRotation = null) {

        if (_newModelFile === "" || typeof _newModelFile !== "string") {
            throw new Error("AdderModel.getModelFile():  Constructor was sent an unspecified _newModelFile (Requires a string for file name.");
        }
        /*
        if(!(_newPosition instanceof Vector3)) {
            throw new Error("AdderModel.Constructor(): Constructor called with unspecified _newPosition (Requires: BABYLON.Vector3 )")
        }
        if( !(_newRotation instanceof Quaternion) ){
            throw new Error("AdderModel.Constructor(): Constructor called with unspecified _newRotation (Requires: BABYLON.Quaternion ")
        }
        */

        this.getModelFile = () => {
            return _modelFile;
        }
        this.getPosition = () => {

        }
        this.getRotation = () => {

        }

        this.setPosition = (_newPosition) => {
            if(!(_newPosition instanceof Vector3)) {
                throw new Error("AdderModel.Constructor(): Constructor called with unspecified _newPosition (Requires: BABYLON.Vector3 )")
            }
            console.log("SETTING position for : ",this.getModelFile())
            console.log(_newPosition);
            this._position = _newPosition;

        }
        this.setRotation = (_newRotation) => {
            if( !(_newRotation instanceof Quaternion) ){
                throw new Error("AdderModel.Constructor(): Constructor called with unspecified _newRotation (Requires: BABYLON.Quaternion ")
            }
            _rotation = _newRotation;
        }



        // adderModel.setMeshWrappers(arrayOfMeshWrappers)
        this.setMeshWrappers = (newArrayOfMeshWrappers) => {
            //check to make sure correct object HERE ? 
            console.log("check the type of the array getting sent in to AdderModel as Array of Mesh Wrappers.....")
            console.log(typeof newArrayOfMeshWrappers);
            _arrayOfMeshWrappers = newArrayOfMeshWrappers
        }
        this.getMeshWrappers = () => {
            return _arrayOfMeshWrappers;
        }
        let _modelFile = _newModelFile;
        let _arrayOfMeshWrappers = _newArrayOfMeshWrappers;
        let _position = _newPosition
        let _rotation = _newRotation

        this.getPosition = () => { return _position }
        this.getRotation = () => { return _rotation }
        



    }



}
export default AdderModel;