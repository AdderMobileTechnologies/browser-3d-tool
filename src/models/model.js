//purpose: to create a class for  models or collections of meshes 
import BABYLON from 'babylonjs'; // Mesh, Vector3, Quaternion

class AdderModel {
    constructor(modelFile = null, parentMesh = null, arrayOfMeshWrappers = null, position = null, rotation = null) {



        if (modelFile === "" || typeof modelFile !== "string") {
            throw new Error("AdderModel.getModelFile():  Constructor was sent an unspecified modelFile (Requires a string for file name.");
        }

        if (position === null || !(position instanceof BABYLON.Vector3)) {
            // throw new Error("AdderModel.Constructor(): Constructor called with unspecified position (Requires: BABYLON.Vector3 )")
            position = new BABYLON.Vector3(0, 0, 0);
        } else {
            position = position;// = new BABYLON.Vector3(0, 0, 0);
        }
        if (!(rotation instanceof BABYLON.Quaternion)) {
            //  throw new Error("AdderModel.Constructor(): Constructor called with unspecified rotation (Requires: BABYLON.Quaternion ")
            rotation = new BABYLON.Quaternion(0, 0, 0);
        } else {

        }

        if (parentMesh === null || !(parentMesh instanceof BABYLON.Mesh)) {
            throw new Error("AdderModel.Constructor(): Constructor called with unspecified _newMeshParent (Requires: BABYLON.Mesh ")
        }

        let _modelFile = modelFile;
        let _parentMesh = parentMesh;
        let _arrayOfMeshWrappers = arrayOfMeshWrappers;
        let _position = position;
        let _rotation = rotation;
       

        this.getModelFile = () => {
            return _modelFile;
        }
        this.setModelFile = (modelFile) => {
            if (modelFile === "" || typeof modelFile !== "string") {
                throw new Error("AdderModel.getModelFile():  Constructor was sent an unspecified modelFile (Requires a string for file name.");
            }
            _modelFile = modelFile;
        }
        
        this.setParentMesh = (parentMesh) => {
            _parentMesh = parentMesh;
        }
        this.getParentMesh = () => {
            return _parentMesh;
        }
        this.setParentMeshPosition = (positionVector3) => {
            
            if (!(positionVector3 instanceof BABYLON.Vector3)) {
                throw new Error(`AdderModel:setParentMeshPosition  Expects a Vector3 as a parameter.`)
            }
            _parentMesh.setPositionWithLocalVector(positionVector3)
        }
      
        // adderModel.setMeshWrappers(arrayOfMeshWrappers)
        this.setMeshWrappers = (newArrayOfMeshWrappers) => {
            //check to make sure correct object HERE ? 
            console.log("check the type of the array getting sent in to AdderModel as Array of Mesh Wrappers.....")
            console.log("SETTING meshWrappers for : ", this.getModelFile())
            console.log(typeof newArrayOfMeshWrappers);
            _arrayOfMeshWrappers = newArrayOfMeshWrappers
        }
        this.getMeshWrappers = () => {
            return _arrayOfMeshWrappers;
        }







    }// end constructor 



}
export default AdderModel;