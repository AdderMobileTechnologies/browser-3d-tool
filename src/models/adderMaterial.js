
import { Texture, Color3 } from BABYLON
//format on save
class AdderMaterial {

    constructor(id = new Date().getTime(), specularTexture = null, diffuseTexture = null, emissiveTexture = null, ambientTexture = null, options = {}) {
        if (specularTexture !== null && !(specularTexture instanceof Texture)) {
            throw new Error("AdderMaterial.constructor(): Constructor called with specularTexture of wrong type (requires BABYLON.Texture)");
        }
        if (emissiveTexture !== null && !(emissiveTexture instanceof Texture)) {
            throw new Error("AdderMaterial.constructor(): Constructor called with  emissiveTexture of wrong type (requires BABYLON.Texture)");
        }
        if (ambientTexture !== null && !(ambientTexture instanceof Texture)) {
            throw new Error("AdderMaterial.constructor(): Constructor called with ambientTexture of wrong type (requires BABYLON.Texture)");
        }
        if (diffuseTexture !== null && !(diffuseTexture instanceof Color3)) {
            throw new Error("AdderMaterial.constructor(): Constructor called with diffuseTexture of wrong type (requires BABYLON.Color3)");
        }
        let objConstructor = {}.constuctor;
        if(options.constructor !== objConstructor){
            throw new Error(`Material:Constructor(): Constructor called with incorrect parameter. ( requires JSON object )`)
        }
      
        let _id = id;
        let _diffuseColor = diffuseTexture;
        let _specularTexture = specularTexture;
        let _emissiveTexture = emissiveTexture;
        let _ambientTexture = ambientTexture;
        let _options = options;


        this.getId = () => { return _id }
        this.getDiffuseColor = () => { return _diffuseColor }
        this.getSpecularTexture = () => { return _specularTexture }
        this.getEmissiveTexture = () => { return _emissiveTexture }
        this.getAmbientTexture = () => { return _ambientTexture }
        this.getOptions = () => {
            return _options;
        }
    }

    getBabylonMaterial(scene) {
        let mesh_material = new BABYLON.StandardMaterial(this.getId(), scene);
        mesh_material.specularTexture = this.getSpecularTexture();
        mesh_material.diffuseColor = this.getDiffuseColor();
        mesh_material.emissiveTexture = this.getEmissiveTexture();
        mesh_material.ambientTexture = this.getAmbientTexture();

        return mesh_material;

    }
    setSpecularTexture(specularTexture){
        if (specularTexture === null || !(specularTexture instanceof Texture)) {
            throw new Error("Material.setSpecularTexture():  called with specularTexture of wrong type (requires BABYLON.Texture)");
        }else{
            _specularTexture = specularTexture;
        }
    }
    setDiffuseColor(diffuseColor){
        if(diffuseColor === null || !(specularTexture instanceof Texture) ){
            throw new Error(`Material.setDiffuseColor() called with wrong type ( requires BABYLON.Texture )`);
        }
        _diffuseColor = diffuseColor;
    }
    setEmissiveTexture(emissiveTexture) {
        if(emissiveTexture === null || !(emissiveTexture instanceof Texture) ){
            throw new Error(`Material.setEmissiveColor() called with incorrect type. ( requires BABYLON.Texture )`);
        }
        _emissiveTexture = emissiveTexture;
    }
    setAmbientTexture(ambientTexture){
        if(ambientTexture === null || !(ambientTexture instanceof Texture) ){
            throw new Error(`Material.setAmbientTexture() called with incorrect arg. ( requires BABYLON.Texture )`);
        }
        _ambientTexture = ambientTexture;
    }
    setOptions(options){
        let objConstructor = {}.constuctor;
        if(options.constructor !== objConstructor){
            throw new Error(`Material:setOptions(): called with incorrect parameter. ( requires JSON object )`)
        }
        _options = options;
    }
    // getter and setter for :  ,  ,  , ambientTexture,...
}
export default AdderMaterial
