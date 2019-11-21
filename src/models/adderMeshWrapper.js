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
  constructor(
    mesh = null,
    position = null,
    rotation = null,
    uScale = 1,
    vScale = 1,
    uOffset = 0,
    vOffset = 0
  ) {
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

    //--UV----------------------------
    let _uScale = uScale;
    let _vScale = vScale;
    let _uOffset = uOffset;
    let _vOffset = vOffset;
    //UV - image data
    let _imgFileName = null;
    let _dataURL = null;
    let _scene = null;

    this.setImgFileName = imgFileName => {
      // console.log("setImgFileName :", imgFileName);
      this._imgFileName = imgFileName;
    };
    this.getImgFileName = () => {
      return _imgFileName;
    };
    this.setDataURL = dataURL => {
      //console.log("setDataURL:", dataURL);
      this._dataURL = dataURL;
    };
    this.getDataURL = () => {
      return _dataURL;
    };
    this.setScene = scene => {
      //console.log("setScene:", scene);
      this._scene = scene;
    };
    this.getScene = () => {
      return _scene;
    };
    //
    this.setUScale = uScale => {
      // console.log("setUScale", uScale);
      this._uScale = uScale;
    };
    this.getUScale = () => {
      return _uScale;
    };
    this.setVScale = vScale => {
      //console.log("setVScale", vScale);
      this._vScale = vScale;
    };
    this.getVScale = () => {
      return _vScale;
    };
    this.setUOffset = uOffset => {
      // console.log("setUOffset", uOffset);
      this._uOffset = uOffset;
    };
    this.getUOffset = () => {
      return _uOffset;
    };
    this.setVOffset = vOffset => {
      //console.log("setVOffset", vOffset);
      this._vOffset = vOffset;
    };
    this.getVOffset = () => {
      return _vOffset;
    };

    //-----------------

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

    this.reapplyTexture = () => {
      // console.log("AdderMeshWrapper:reapplyTexture() ");
      if (
        typeof this._dataURL != "undefined" &&
        typeof this._dataUrl != undefined
      ) {
        if (
          this._imgFileName != "undefined" &&
          this._dataURL != "undefined" &&
          this._scene != "undefined"
        ) {
          let mesh = this.getMesh();
          console.log("verify :mesh:", mesh);

          // console.log("verify file,URL,and scene parameters:");
          // console.log("this._imgFileName:", this._imgFileName);
          // console.log("this._dataURL:", this._dataURL);
          // console.log("this._scene:", this._scene);
          let tex = Texture.LoadFromDataString(
            this._imgFileName,
            this._dataURL,
            this._scene
          );
          let mat = new StandardMaterial("mat", _scene);
          mat.diffuseTexture = tex;

          // //try a single hardcoded offset change.
          // console.log("verify UV parameters:-------------------");
          // //OFFSETS
          // console.log("original _uOffset:", this.getUOffset());
          // console.log("this._uOffset:", this._uOffset);
          // console.log("original _vOffset:", this.getVOffset());
          // console.log("this._vOffset:", this._vOffset);
          // //SCALES:
          // console.log("original _uScale:", this.getUScale());
          // console.log("this._uScale:", this._uScale);
          // console.log("original _vScale:", this.getVScale());
          // console.log("this._vScale:", this._vScale);

          let commitChanges = true;
          if (commitChanges) {
            mat.diffuseTexture.uOffset = this._uOffset; // did .5 and it worked hard coded.
            mat.diffuseTexture.vOffset = this._vOffset;
            mat.diffuseTexture.uScale = this._uScale;
            mat.diffuseTexture.vScale = this._vScale;
          } else {
            console.log("NOT EXECUTING THE CHANGES ON PURPOSE.");
          }

          mesh.material = mat;
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
    //
    //When the original texture is applied, we set some of the additional parameters for UV needs.
    //console.log("AdderMeshWrapper: applyTextureFromDataURL() : this:", this);
    this.setImgFileName(imgFileName);
    this.setDataURL(dataURL);
    this.setScene(scene);

    //let _imgFileName = imgFileName;
    //let _dataURL = dataURL;
    //let _scene = scene;

    let mesh = this.getMesh(); //was let
    let tex = Texture.LoadFromDataString(
      this._imgFileName,
      this._dataURL,
      this._scene
    );
    let mat = new StandardMaterial("mat", this._scene);
    mat.diffuseTexture = tex;
    mat.diffuseTexture.uScale = this.getUScale();
    mat.diffuseTexture.vScale = this.getVScale();
    mat.diffuseTexture.uOffset = this.getUOffset();
    mat.diffuseTexture.vOffset = this.getVOffset();
    mesh.material = mat;
  }
}
export default AdderMeshWrapper;
