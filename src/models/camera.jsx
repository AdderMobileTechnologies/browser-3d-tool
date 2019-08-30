/*Camera Purpose:
To create a class to use for instantiating BabylonJS cameras. There are different 'types' of cameras for example
the 'ArcRotateCamera' , and the 'Free' camera. 
The cameras may expect slightly different sets of data, I've started with the 'ArcRotateCamera' because that is the one we currently use.
The ArcRotateCamera has a name, alpha & beta( which define the camera angle), radius(which defines distance from target), target(the object of focus).
The 'type' parameter is a string that should represent exactly the name used in the babylonjs docs for the specific camera to use.
The alpha,beta,and distance parameters are all numbers that define the angle and distance of the camera in relation to the subject being filmed.
The target, is a Vector3 which defines the x,y,and z parameters in the scene where the camera will focus.
The scene is the babylonjs scene where the camera will be utilized or inserted into.
The options is a catch-all in this case for adding additional properties that may only be specific to certain types of cameras, or at least are currently unknown. 
*/
/**
 * Camera TODO:
 * - add _options to constructor to handle unknow properties that might get applied later.
 */
import { Vector3, Scene, ArcRotateCamera } from "babylonjs";

class AdderCamera {
  constructor(
    _newCanvas = null,
    _newType = null,
    _newName = null,
    _newAlpha = null,
    _newBeta = null,
    _newRadius = null,
    _newTarget = new Vector3(0, 0, 0),
    _newScene = null,
    _newSetActiveOnSceneIfNoneActive = null,
    _newOptions = null
  ) {
    //verify
    if (_newCanvas === null || _newCanvas.tagName !== "CANVAS") {
      throw new Error(
        `Camera:Constructor() The constructor expects a canvas type element as the parameter. `
      );
    }
    if (_newType === null) {
      throw new Error(
        `Camera:Constructor() The constructor expects a String value for the _newType parameter. ie. ArcRotateCamera, FreeCamera, `
      );
    }
    if (_newName === null) {
      throw new Error(
        `Camera:Constructor() The constructor expects a String value for the _newName parameter.`
      );
    }
    if (_newAlpha === null) {
      throw new Error(
        `Camera:Constructor() The constructor expects a Number value for the _newAlpha parameter.(https://doc.babylonjs.com/babylon101/cameras)`
      );
    }
    if (_newBeta === null) {
      throw new Error(
        `Camera:Constructor() The constructor expects a Number value for the _newBeta parameter.(https://doc.babylonjs.com/babylon101/cameras)`
      );
    }
    if (_newRadius === null) {
      throw new Error(
        `Camera:Constructor() The constructor expects a Number value for the _newRadius parameter. `
      );
    }
    if (_newTarget === null || !(_newTarget instanceof Vector3)) {
      throw new Error(
        `Camera:Constructor() The constructor expects a Number value for the _newTarget parameter. `
      );
    }
    if (_newScene === null || !(_newScene instanceof Scene)) {
      throw new Error(
        `Camera:Constructor() The constructor expects a Number value for the _newScene parameter. `
      );
    }
    if (_newSetActiveOnSceneIfNoneActive === null) {
      //This parameter is an optional boolean
      //It Defines whether the camera should be marked as active if not other active cameras have been defined
    }

    if (typeof _newOptions !== "object") {
      throw new Error(
        `Camera:Constructor() The constructor expects an Array for the _newOptions parameter.`
      );
    } else {
      //console.log("_newOptions are: ", _newOptions)
    }

    //private properties

    let _canvas = _newCanvas;
    let _type = _newType;
    let _name = _newName;
    let _alpha = _newAlpha;
    let _beta = _newBeta;
    let _radius = _newRadius;
    let _target = _newTarget;
    let _scene = _newScene;
    let _setActiveOnSceneIfNoneActive = _newSetActiveOnSceneIfNoneActive;
    let _options = _newOptions;

    this.getCanvas = () => {
      return _canvas;
    };
    this.getType = () => {
      return _type;
    };
    this.getName = () => {
      return _name;
    };
    this.getAlpha = () => {
      return _alpha;
    };
    this.getBeta = () => {
      return _beta;
    };
    this.getRadius = () => {
      return _radius;
    };
    this.getTarget = () => {
      return _target;
    };
    this.getScene = () => {
      return _scene;
    };
    this.getSetActiveOnSceneIfNoneActive = () => {
      return _setActiveOnSceneIfNoneActive;
    };
    this.getOptions = () => {
      return _options;
    };
  }

  getCanvas() {
    return this._canvas;
  }
  setCanvas(_newCanvas = null) {
    if (_newCanvas === null || _newCanvas.tagName !== "CANVAS") {
      throw new Error(
        `Camera:Constructor() The constructor expects a canvas type element as the parameter. `
      );
    } else {
      this._canvas = _newCanvas;
    }
  }

  getOptions() {
    let options = this._options;
    return options;
  }
  setOptions(json) {
    let objectConstructor = {}.constructor;
    if (json.constructor !== objectConstructor) {
      throw new Error(
        `Constructor:setOptions() The setOptions method expects a JSON object for options.`
      );
    } else {
      this.setAttachControl(this.getCanvas, true);
      this.lowerBetaLimit = 0;
      this.upperBetaLimit = 10;
    }
  }

  getCamera(scene) {
    var camera = new ArcRotateCamera(
      this.getName(),
      this.getBeta(),
      this.getAlpha(),
      this.getRadius(),
      this.getTarget(),
      scene
    );
    //camera.attachControl(this.getCanvas(), true);
    //camera.setAttachControl(this.getCanvas(),true)
    let options = this.getOptions();

    if (
      options != null &&
      typeof options != "" &&
      typeof options != "undefined" &&
      typeof options != null
    ) {
      //console.log("options:",options);
      //console.log("this:",options.lowerRadiusLimit);
      //console.log("check fake options: ");
      //console.log(options.monkey);
      //console.log(typeof console.monkey);

      camera.upperRadiusLimit = options.upperRadiusLimit;
      camera.lowerBetaLimit = options.lowerBetaLimit;
      camera.upperBetaLimit = options.upperBetaLimit;
      camera.lowerAlphaLimit = options.lowerAlphaLimit;
      camera.upperAlphaLimit = options.upperAlphaLimit;

      if (typeof options.lowerRadiusLimit !== "undefined") {
        let lowerRadiusLimit = options.lowerRadiusLimit;
        camera.lowerRadiusLimit = lowerRadiusLimit;
      }

      if (typeof options.useAutoRotationBehavior !== "undefined") {
        let useAutoRotationBehavior = options.useAutoRotationBehavior;
        camera.useAutoRotationBehavior = useAutoRotationBehavior;
      }
    }

    //camera.setUpperRadiusLimit(10);
    //camera.setUseAutoRotationBehavior(true);

    //camera.setAttachControl(true);
    return camera;
  }
}

export default AdderCamera;

/*
References:
    ArcRotateCamera:
    https://doc.babylonjs.com/api/classes/babylon.arcrotatecamera
        Actual Example:
            var camera = new BABYLON.ArcRotateCamera("Camera",  Math.PI / 2, Math.PI / 2
                        , 10, BABYLON.Vector3.Zero(), scene);
                        camera.attachControl(canvas, true);
                        camera.lowerRadiusLimit = 6;
                        camera.upperRadiusLimit = 20;
                        camera.useAutoRotationBehavior = true;
What Types of Camera Do We Accept ?
    ArcRotateCamera
    ArcFollowCamera
    Camera
    TargetCamera
    FollowCamera
    FreeCamera
    ...at least 20 to 30 to choose from
What type of camera Behaviors do we want to apply?
    lowerRadiusLimit
    upperRadiusLimit
    useAutoRotationBehavior
*/
