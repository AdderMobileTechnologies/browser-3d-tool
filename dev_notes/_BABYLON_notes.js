/**
 * LoadAssetContainerAsync
 * https://doc.babylonjs.com/how_to/promises
 * see if we can do this.
 */


/*
To clear the scene, there is scene.dispose(), 
to clear the engine there is engine.dispose().
*/

/* 
switch scenes:
https://doc.babylonjs.com/how_to/multi_scenes

var scene0 = new BABYLON.Scene(engine);
var scene1 = new BABYLON.Scene(engine);

engine.runRenderLoop(function () {
  scene0.render();
  scene1.render();
});

 switch (showScene) {
            case 0:                    
                advancedTexture.dispose();
                createGUI(scene0, showScene);
                scene0.render();
            break
            case 1:
                advancedTexture.dispose();
                createGUI(scene1, showScene);
                scene1.render();
            break
        }


        switch (scene_number) {
            case 0:                    
                 
            break
            case 1:
                 
            break
             case 2:
                 
            break
            default: 
                
            return false
        }

*/
/*

// POSITION : 		mesh_parent.setPositionWithLocalVector(new BABYLON.Vector3(0, 1, 0));
// ROTATE: 
/*
    var axis = new BABYLON.Vector3(0, 1, 0);
    var angle = -Math.PI/2  ; //PI/2 = back to the right
    var quaternion = new BABYLON.Quaternion.RotationAxis(axis, angle);
    mesh_parent.rotationQuaternion = quaternion;

*/
        
