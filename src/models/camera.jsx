 /*Camera Purpose:
To create a class to use for instantiating BabylonJS cameras. There are different 'types' of cameras for example
the 'ArcRotateCamera' , and the 'Free' camera. 
The cameras may expect sliightly different sets of data, I've started with the 'ArcRotateCamera' because that is the one we currently use.
The ArcRotateCamera has a name, alpha & beta( which define the camera angle), radius(which defines distance from target), target(the object of focus).
The 'type' parameter is a string that shoudl represent exactly the name used in the babylonjs docs for the specific camera to use.
The alpha,beta,and distance parameters are all numbers that define the angle and distance of the camera in relation to the subject being filmed.
The target, is a Vector3 which defines the x,y,and z parameters in the scene where the camera will focus.
The scene is the babylonjs scene where the camera will be utilized or inserted into.

*/

import { Vector3, Scene , ArcRotateCamera} from 'babylonjs' 

class AdderCamera {
    constructor(_newType = null,_newName = null, _newAlpha = null, _newBeta = null, _newRadius = null, _newTarget = new Vector3(0,0,0),  _newScene = null, _newSetActiveOnSceneIfNoneActive = null){
        //verify 
        if(_newType === null   ){
            throw new Error(`Camera:Constructor() The constructor expects a String value for the _newType parameter. ie. ArcRotateCamera, FreeCamera, `)
        } 
        if( _newName === null  ){
            throw new Error(`Camera:Constructor() The constructor expects a String value for the _newName parameter.`)
        }
        if( _newAlpha === null  ){
            throw new Error(`Camera:Constructor() The constructor expects a Number value for the _newAlpha parameter.(https://doc.babylonjs.com/babylon101/cameras)`)
        }
        if( _newBeta === null  ){
            throw new Error(`Camera:Constructor() The constructor expects a Number value for the _newBeta parameter.(https://doc.babylonjs.com/babylon101/cameras)`)
        }
        if( _newRadius === null  ){
            throw new Error(`Camera:Constructor() The constructor expects a Number value for the _newRadius parameter. `)
        }
        if( _newTarget === null ||  !(_newTarget instanceof Vector3)){
            throw new Error(`Camera:Constructor() The constructor expects a Number value for the _newTarget parameter. `)
        }
        if( _newScene === null ||  !(_newScene instanceof Scene)){
            throw new Error(`Camera:Constructor() The constructor expects a Number value for the _newScene parameter. `)
        }
        if( _newSetActiveOnSceneIfNoneActive === null ){
             //This parameter is an optional boolean
             //It Defines whether the camera should be marked as active if not other active cameras have been defined 
        }
        //private properties
        let _type   = _newType; 
        let _name   = _newName; 
        let _alpha  = _newAlpha;
        let _beta   = _newBeta; 
        let _radius = _newRadius; 
        let _target = _newTarget;  
        let _scene  = _newScene;
        let _setActiveOnSceneIfNoneActive = _newSetActiveOnSceneIfNoneActive;

        this.getType      = () => { return _type } 
        this.getName      = () => { return _name }
        this.getAlpha     = () => { return _alpha }
        this.getBeta      = () => { return _beta }
        this.getRadius    = () => { return _radius }
        this.getTarget    = () => { return _target }
        this.getScene     = () => { return _scene }
        this.getSetActiveOnSceneIfNoneActive      = () => { return _setActiveOnSceneIfNoneActive }

       

    }
    getCamera(){
        switch (this.getType ) {
            case "ArcRotateCamera":
                let  camera = new ArcRotateCamera(this.getName,  this.getAlpha, this.getBeta
                , this.getRadius, this.getTarget, this.getScene );
               

                return camera;
                break;
        
            default:
                break;
        }
    }
    /* Qualities 
     
    
    camera.useAutoRotationBehavior = true;
    */

    setAttachControl(canvas,trueFalse){
        // check if canvas is an HTML5 canvas object 
        // check if trueFalse is a boolean value.
        this.attachControl(canvas,trueFalse);
    }
    setLowerRadiusLimit(number){
        if(!(number instanceof Number)){ 
            throw new Error(`Camera:setLowerRadiusLimit() The camera radius value has to be a Number.`)
        }else{
            this.lowerRadiusLimit(number)
        }
    }
    setUpperRadiusLimit(number){
        if(!(number instanceof Number)){ 
            throw new Error(`Camera:setUpperRadiusLimit() The camera radius value has to be a Number.`)
        }else{
            this.upperRadiusLimit(number)
        }
    }
    setUseAutoRotationBehavior(trueFalse){
        if(!(trueFalse instanceof Boolean ) ){
            throw new Error(`Camera:setUseAutoRotationBehavior() Expects either true or false boolean value.`);
        } else {

        }
    }


}

export default AdderCamera

/*
ArcRotateCamera  
    Parameters
        name: string
            Defines the name of the camera

        alpha: number
            Defines the camera rotation along the logitudinal axis

        beta: number
            Defines the camera rotation along the latitudinal axis

        radius: number
            Defines the camera distance from its target

        target: Vector3
            Defines the camera target

        scene: Scene
            Defines the scene the camera belongs to

        Optional setActiveOnSceneIfNoneActive: boolean
            Defines wheter the camera should be marked as active if not other active cameras have been defined

    *For information on 'alpha' and 'beta' parameters see illustration at https://doc.babylonjs.com/babylon101/cameras

*/

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