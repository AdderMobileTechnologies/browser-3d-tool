//purpose: to create a class for  models or collections of meshes 
/*
An AdderModel has these arguments in its constructor:
The modelFile is the filepath to the .babylon file  that corresponds to the model.
The parentMesh is an invisible mesh that is there to provide a single point of control over the model and all it's meshes, or 'mesh wrappers.'
The postion is the vector3 space that the model is to occupy in the scene.
The rotationAxis is the Vector3 axis upon which any rotationAngle, or 'number' will be applied.
The rotaionAngle is a number that represents the angle or degress of rotation. 
The 'meshWrappers' is an array of a wrapper class that encompasses each individual mesh that makes up a model. ie. If 
the model is a car. Then the 'left door' , 'the front bumper', etc . are individual meshes. 
*/


import BABYLON from 'babylonjs'; // Mesh, Vector3, Quaternion

class AdderModel {
    constructor(scene = null, modelFile = null, parentMesh = null, position = null, rotationAxis = null, rotationAngle = null, meshWrappers = null, scaling = null) {
        if (modelFile === "" || typeof modelFile !== "string") {
            throw new Error("AdderModel.Constructor():  Constructor was sent an unspecified modelFile (Requires a string for file name.");
        }
        if (parentMesh === null || !(parentMesh instanceof BABYLON.Mesh)) {
            //  throw new Error("AdderModel.Constructor(): Constructor called with unspecified _newMeshParent (Requires: BABYLON.Mesh ");
            //parentMesh = this.generateMeshParent();
            //SET DEFAULT PARENT MESH:
            let unitVec = new BABYLON.Vector3(1, 1, 1);
            let mesh_parentOptions = { width: 0, height: 0, depth: 0 }
            let mesh_parent = BABYLON.MeshBuilder.CreateBox("name_of_self", mesh_parentOptions, scene);//this.getScene()
            mesh_parent.isVisible = false;
            mesh_parent.scaling = unitVec.scale(1);
            mesh_parent.setPositionWithLocalVector(new BABYLON.Vector3(0, 0, 0));

            parentMesh = mesh_parent;
        }
        if (position === null || !(position instanceof BABYLON.Vector3)) {
            throw new Error("AdderModel.Constructor(): Constructor called with unspecified position (Requires: BABYLON.Vector3 )");
        }

        if (rotationAxis === null || !(rotationAxis instanceof BABYLON.Vector3)) {
            throw new Error(`AdderModel:Constructor() The rotationAxis expects a Vector3 parameter.`);
        }

        if (rotationAngle === null || (typeof rotationAngle !== "number")) {
            throw new Error(`AdderModel:Constructor() The rotationAngle expects a number as a parameter.`);
        }
        
       if (scaling === null || !(scaling instanceof BABYLON.Vector3)) {
           // throw new Error("AdderModel.Constructor(): Constructor called with unspecified scaling (Requires: BABYLON.Vector3 )");
        }


        let _scene = scene;
        let _modelFile = modelFile;
        let _parentMesh = parentMesh;
        let _position = position;
        let _rotationAxis = rotationAxis;
        let _rotationAngle = rotationAngle;
        let _meshWrappers = meshWrappers;
        let _scaling = scaling; 

        /*
        Note: The 'position' and 'rotation' parameters actually need to be applied to the 'parent mesh'.

        */
        this.getScene = () => {
            return _scene;
        }
        this.getModelFile = () => {
            return _modelFile;
        }
        this.setModelFile = (modelFile) => {
            if (modelFile === "" || typeof modelFile !== "string") {
                throw new Error("AdderModel.getModelFile():  Constructor was sent an unspecified modelFile (Requires a string for file name.");
            }
            _modelFile = modelFile;
        }
        this.getParentMesh = () => {
            console.log("adderModel: getParentMesh() executed.")
            return _parentMesh;
        }
        this.setParentMesh = (parentMesh) => {
            _parentMesh = parentMesh;
        }

        this.setScaling = (scaling) => {
            //TODO: check for type Vector3
            _scaling = scaling
        }


        this.getPosition = () => {
            return _position;
        }
        this.getRotationAxis = () => {
            return _rotationAxis;
        }
        this.getRotationAngle = () => {
            return _rotationAngle;
        }
        this.getMeshWrappers = () => {
            return _meshWrappers;
        }
        this.setMeshWrappers = (meshWrappers) => {
            _meshWrappers = meshWrappers
        }
        this.getScaling = () => {
            return _scaling;
        }
       
      
         
        this.setParentMeshPosition = (positionVector3) => {

            if (!(positionVector3 instanceof BABYLON.Vector3)) {
                throw new Error(`AdderModel:setParentMeshPosition  Expects a Vector3 as a parameter.`)
            }
            console.log(this.getModelFile());
            console.log("adderModel:setParentMeshPosition() : Is the model built yet or in async land? ")
            let parentMesh = this.getParentMesh();
 

        }

        this.setParentMeshRotation = (axis, angle) => {
            if (!(axis instanceof BABYLON.Vector3) || typeof angle !== "number") {
                throw new Error(`AddeModel:setParentMeshRotation() expected both a Vector3 for axis and a number for rotation. `)
            }
            var quaternion = new BABYLON.Quaternion.RotationAxis(axis, angle);
            _parentMesh.rotationQuaternion = quaternion;
        }
        
      



    }// end constructor 


}
export default AdderModel;