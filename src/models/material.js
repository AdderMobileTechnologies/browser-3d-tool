
import { Texture, Color3 } from BABYLON
//format on save
class Material {

    constructor(_newId = new Date().getTime(), _newSpecularTexture = null, _newDiffuseColor = null, _newEmissiveTexture = null, _options = {}) {
        if (_newSpecularTexture !== null && !(_newSpecularTexture instanceof Texture)) {
            throw new Error("Material.constructor(): Constructor called with _newSpecularTexture of wrong type (requires BABYLON.Texture)")
        }
        if (_newEmissiveTexture !== null && !(_newEmissiveTexture instanceof Texture)) {
            throw new Error("Material.constructor(): Constructor called with  _newEmissiveTexture of wrong type (requires BABYLON.Texture)")
        }
        if (_newAmbientTexture !== null && !(_newAmbientTexture instanceof Texture)) {
            throw new Error("Material.constructor(): Constructor called with _newAmbientTexture of wrong type (requires BABYLON.Texture)")
        }
        if (_newDiffuseColor !== null && !(_newDiffuseColor instanceof Color3)) {
            throw new Error("Material.constructor(): Constructor called with _newDiffuseColor of wrong type (requires BABYLON.Color3)")
        }

        let _id = _newId;
        let _diffuseColor = _newDiffuseColor;
        let _specularTexture = _newSpecularTexture;
        let _emissiveTexture = _newEmissiveTexture;
        let _ambientTexture = _newAmbientTexture;


        this.getId = () => { return _id }
        this.getDiffuseColor = () => { return _diffuseColor }
        this.getSpecularTexture = () => { return _specularTexture }
        this.getEmissiveTexture = () => { return _emissiveTexture }
        this.getAmbientTexture = () => { return _ambientTexture }

    }

    getBabylonMaterial(scene) {
        let mesh_material = new BABYLON.StandardMaterial(this.getId(), scene);
        mesh_material.specularTexture = this.getSpecularTexture();
        mesh_material.diffuseColor = this.getDiffuseColor();
        mesh_material.emissiveTexture = this.getEmissiveTexture();
        mesh_material.ambientTexture = this.getAmbientTexture();

        return mesh_material;

    }
    // getter and setter for : diffuseColor, specularTexture, emiisiveTexture, ambientTexture,...
}
export default Material
