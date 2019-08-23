import React from "react";
import BABYLON from 'babylonjs'

  class SceneFast extends React.Component {

			constructor(props){
				super(props);
				this.state = {

				}

				let canvas = document.getElementById("gui_canvas_container");
				 
				let  engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});

			
				//let scene =  new BABYLON.Scene(engine);
				//scene.autoClear = true;
				var createScene = function () {
					var scene = new BABYLON.Scene(engine);
					var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2,  Math.PI / 2, 5, BABYLON.Vector3.Zero(), scene);
					camera.attachControl(canvas, true);
					
					var light = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(-1, 1, 0), scene);
					light.diffuse = new BABYLON.Color3(1, 0, 0);
					
					// Skybox
					var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000.0}, scene);
					var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
					skyboxMaterial.backFaceCulling = false;
					skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox", scene);
					skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
					skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
					skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
					skybox.material = skyboxMaterial;			
						
					return scene;
				
				};
				let scene = createScene;
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

 