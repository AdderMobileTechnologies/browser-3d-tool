/*Camera Purpose:
To create a class to use for instantiating BabylonJS cameras. There are different 'types' of cameras for example
the 'ArcRotateCamera' , and the 'Free' camera. 
The cameras may expect slightly different sets of data, I've started with the 'ArcRotateCamera' because that is the one we currently use.
The ArcRotateCamera has a name, alpha & beta( which define the camera angle), radius(which defines distance from target), target(the object of focus).
The 'type' parameter is a string that should represent exactly the name used in the babylonjs docs for the specific camera to use.
The alpha,beta,and radius parameters are all numbers that define the angle and distance of the camera in relation to the subject being filmed.
The target, is a Vector3 which defines the x,y,and z parameters in the scene where the camera will focus.
The scene is the babylonjs scene where the camera will be utilized or inserted into.
The setActiveOnSceneNoneActive parameter is optional, adn it defines whether the camera should be marked as active if not other active cameras have been defined
The options is a catch-all in this case for adding additional properties that may only be specific to certain types of cameras, or at least are currently unknown. 
*/
/**
 * Camera TODO:
 *  - handle options during the constructor.
 * - setOptions function
 */
import { Vector3, Scene, ArcRotateCamera } from "babylonjs";

class AdderCamera {
  constructor(
    canvas = null,
    type = null,
    name = null,
    alpha = null,
    beta = null,
    radius = null,
    target = new Vector3(0, 0, 0),
    scene = null,
    setActiveOnSceneNoneActive = null,
    options = null
  ) {
    //verify
    if (canvas === null || canvas.tagName !== "CANVAS") {
      throw new Error(
        `Camera:Constructor() The constructor expects a canvas type element as the parameter. `
      );
    }
    if (type === null) {
      throw new Error(
        `Camera:Constructor() The constructor expects a String value for the type parameter. ie. ArcRotateCamera, FreeCamera, `
      );
    }
    if (name === null) {
      throw new Error(
        `Camera:Constructor() The constructor expects a String value for the name parameter.`
      );
    }
    if (alpha === null) {
      throw new Error(
        `Camera:Constructor() The constructor expects a Number value for the alpha parameter.(https://doc.babylonjs.com/babylon101/cameras)`
      );
    }
    if (beta === null) {
      throw new Error(
        `Camera:Constructor() The constructor expects a Number value for the beta parameter.(https://doc.babylonjs.com/babylon101/cameras)`
      );
    }
    if (radius === null) {
      throw new Error(
        `Camera:Constructor() The constructor expects a Number value for the radius parameter. `
      );
    }
    if (target === null || !(target instanceof Vector3)) {
      throw new Error(
        `Camera:Constructor() The constructor expects a Number value for the target parameter. `
      );
    }
    if (scene === null || !(scene instanceof Scene)) {
      throw new Error(
        `Camera:Constructor() The constructor expects a Number value for the scene parameter. `
      );
    }
    if (setActiveOnSceneNoneActive === null) {
      //This parameter is an optional boolean
    }

    if (typeof options !== "object") {
      throw new Error(
        `Camera:Constructor() The constructor expects an Array for the options parameter.`
      );
    } else {
      //TODO: handle options during the constructor.
      //console.log("options are: ", options)
    }

    //private properties
    let _canvas = canvas;
    let _type = type;
    let _name = name;
    let _alpha = alpha;
    let _beta = beta;
    let _radius = radius;
    let _target = target;
    let _scene = scene;
    let _setActiveOnSceneIfNoneActive = setActiveOnSceneNoneActive;
    let _options = options;

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
  setCanvas(canvas = null) {
    if (canvas === null || canvas.tagName !== "CANVAS") {
      throw new Error(
        `Camera:Constructor() The constructor expects a canvas type element as the parameter. `
      );
    } else {
      this._canvas = canvas;
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
      //TODO: change this default code to function as it should, using the inputted json.
      this.setAttachControl(this.getCanvas, true);
      this.lowerBetaLimit = 0;
      this.upperBetaLimit = 10;
    }
  }

  getCamera() {
    let scene = this.getScene();
    let camera = new ArcRotateCamera(
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

    if (options != null && typeof options !== "undefined") {
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
    return camera;
  }
}

export default AdderCamera;

/*
References:
    ArcRotateCamera:
    https://doc.babylonjs.com/api/classes/babylon.arcrotatecamera
        Actual Example:
            let camera = new BABYLON.ArcRotateCamera("Camera",  Math.PI / 2, Math.PI / 2
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
