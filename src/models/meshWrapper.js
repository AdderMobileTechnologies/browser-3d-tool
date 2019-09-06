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
import {
  Mesh,
  Vector3,
  Quaternion,
  Texture,
  StandardMaterial,
  Scene
} from "babylonjs";

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
  setRotation(rotation) {
    if (rotation === null || !(rotation instanceof Vector3)) {
      throw new Error(
        `MeshWrapper:setRotation(): Requires a BABYLON.Vector3 parameter.`
      );
    }
    this._rotation = rotation;
  }
  applyTextureFromDataURL(imgFileName = null, dataURL = null, scene = null) {
    if (imgFileName === null) {
      throw new Error(
        `MeshWrapper:applyTextureFromDataURL(): A file imgFileName parameter is expected .`
      );
    }
    if (dataURL === null) {
      throw new Error(
        `MeshWrapper:applyTextureFromDataURL(): A DataURL parameter is expected in the format of (data:image/png;base64,iVBORw0KGgoAAAA....)`
      );
    }
    if (scene == null || !(scene instanceof Scene)) {
      throw new Error(
        `MeshWrapper:applyTextureFromDataUrl(): A BABYLON.Scene parameter is required .`
      );
    }
    let _imgFileName = imgFileName;
    let _dataURL = dataURL;
    let _scene = scene;
    let mesh = this.getMesh();
    // var uri = "data:image/png;base64,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";
    // var tex = BABYLON.Texture.LoadFromDataString("mytexture.png", uri, scene);
    var tex = Texture.LoadFromDataString(_imgFileName, _dataURL, _scene);
    //var mat = new BABYLON.StandardMaterial("mat", scene);
    var mat = new StandardMaterial("mat", _scene);
    mat.diffuseTexture = tex;
    //self.material = mat;

    mesh.material = mat;
  }
}
export default MeshWrapper;

/*


https://www.babylonjs-playground.com/#1WQSPX#5

	var uri = "data:image/png;base64,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";
	var tex = BABYLON.Texture.LoadFromDataString("mytexture.png", uri, scene);
	var mat = new BABYLON.StandardMaterial("mat", scene);
	mat.diffuseTexture = tex;
	ground.material = mat;




*/

/*
OLD CODE FROM VERSION 1:
//--- Apply Base64 Image  ---------------
     static apply_Base64ToMesh(scene, mesh,  image_data){
         
         //ABSOLUTELY CRUCIAL TO HAVE UNIQUE ids FOR MATERIALS thus mesh.id 
         var mesh_material = new BABYLON.StandardMaterial(mesh.id, scene);
         mesh_material.diffuseColor = new BABYLON.Color3(0, 0, 0);
         mesh_material.specularTexture = BABYLON.Texture.CreateFromBase64String(image_data, mesh.id);  
         mesh_material.emissiveTexture = BABYLON.Texture.CreateFromBase64String(image_data, mesh.id);
         //mesh_material.ambientTexture = BABYLON.Texture.CreateFromBase64String(data, 'mymap');
         mesh.material = mesh_material;
         
     }// end apply_Base64ToMesh


*/
