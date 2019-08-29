import BABYLON from 'babylonjs';

class AdderSkyBox {
    constructor(scene = null, dir = null, size = null){
        if(scene === null){
            throw new Error(`AdderSkyBox:Constructor() A scene is expected as an argument.`)
        }
        if(dir === null){
            throw new Error(`AdderSkyBox:Constructor() A directory is expected as an argument.`)
        }
        if(size === null || typeof size != "number"){
            throw new Error(`AdderSkyBox:Constructor() A size parameter is expected as a number argument.`)
        }

        let _scene = scene;
        let _dir = dir;
        let _size = size; 

        this.getScene = () =>{
            return _scene;
        }
        this.getDir = () => {
            return _dir;
        }
        this.getSize = () => {
            return  _size;
        }

        this.getSkybox = () => {
            let skybox = BABYLON.Mesh.CreateBox("skyBox", this.getSize() , this.getScene());
            let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.getScene());
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.disableLighting = true;
            skybox.material = skyboxMaterial;
            //Next, we set the infiniteDistance property. This makes the skybox follow our camera's position.
            skybox.infiniteDistance = true;
            ///Now we must remove all light reflections on our box (the sun doesn't reflect on the sky!):
            skyboxMaterial.disableLighting = true;
            //Next, we apply our special sky texture to it. This texture must have been prepared to be a skybox, in a dedicated directory, named “skybox” in our example:
            skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("http://dbdev.adder.io/assets/"+dir+"/", this.getScene());
            skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        }
    }
}


export default AdderSkyBox;





/*
SceneUtility.addSkybox(scene,"countrybox","1000.0");

static addSkybox(scene,dir,size){
    //SKYBOX OPTIONS:
    let skybox = BABYLON.Mesh.CreateBox("skyBox", size , scene);
    let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    //Next, we set the infiniteDistance property. This makes the skybox follow our camera's position.
    skybox.infiniteDistance = true;
    ///Now we must remove all light reflections on our box (the sun doesn't reflect on the sky!):
    skyboxMaterial.disableLighting = true;
    //Next, we apply our special sky texture to it. This texture must have been prepared to be a skybox, in a dedicated directory, named “skybox” in our example:
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("http://dbdev.adder.io/assets/"+dir+"/", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
}
*/