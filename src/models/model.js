//purpose: to create a class for  models or collections of meshes 


class AdderModel {
    constructor(_newModelFile= null, _newArrayOfMeshWrappers = null){

        if(_newModelFile === "" || typeof _newModelFile !== "string") {
            throw new Error("Model.getModelFile():  Constructor was sent an unspecified _newModelFile (Requires a string for file name.");
        }
        
        this.getModelFile = () => {
            return _modelFile;
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
        let  _modelFile = _newModelFile;
        let _arrayOfMeshWrappers = _newArrayOfMeshWrappers;


    }

     
    
}
export default AdderModel;