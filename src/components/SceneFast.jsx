import React from "react";
import BABYLON from 'babylonjs'

  class SceneFast extends React.Component {

			constructor(props){
				super(props);
				this.state = {

				}

			}
		
			componentDidMount(){ 

				let canvas = document.getElementById("gui_canvas_container");
				let  engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
				 
				
				var createScene = function () {

					var scene = new BABYLON.Scene(engine);
					var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
					camera.setTarget(BABYLON.Vector3.Zero());
					camera.attachControl(canvas, true);
					var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
					light.intensity = 0.7;
					var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, scene);
					sphere.position.y = 1;
					var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 6, height: 6}, scene);
				
					return scene;
				
				};
				var  scene = createScene();
				scene.autoClear = true;
				
				engine.runRenderLoop(function () {
					if(typeof scene === 'undefined'){
						return;
					} else{
						if(scene){
							scene.render();
						}
					}
				});
		
				window.addEventListener("resize", function () {
					engine.resize();
				});
			}

			

			render() {
					return (
						
						<div>
							<div>SceneFast</div>
							<canvas id = "gui_canvas_container"
                                    className = "babylonjsCanvas"
                            		style = {{boxShadow: "5px 5px 8px #2f2f2f"}}/>
						</div>
															
					);
			}
}
 
export default SceneFast

 /* LIFECYCLE METHODS:
	componentWillReceiveProps(){ }
	componentWillMount(){ }
	componentDidMount(){ }
	componentWillUpdate(){ }
	componentDidUpdate(){ }
	componentWillUnmount(){ }
*/
/**
 * https://www.babylonjs-playground.com/
var createScene = function () {

	// This creates a basic Babylon Scene object (non-mesh)
	var scene = new BABYLON.Scene(engine);

	// This creates and positions a free camera (non-mesh)
	var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

	// This targets the camera to scene origin
	camera.setTarget(BABYLON.Vector3.Zero());

	// This attaches the camera to the canvas
	camera.attachControl(canvas, true);

	// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
	var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

	// Default intensity is 1. Let's dim the light a small amount
	light.intensity = 0.7;

	// Our built-in 'sphere' shape.
	var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, scene);

	// Move the sphere upward 1/2 its height
	sphere.position.y = 1;

	// Our built-in 'ground' shape.
	var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 6, height: 6}, scene);

	return scene;

};
 */