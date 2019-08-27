import React from "react";
import BABYLON from 'babylonjs'
//models
import AdderModel from '../models/model'
import MeshWrapper from '../models/meshWrapper'
import AdderCamera from '../models/camera'

class SceneFast extends React.Component {

	constructor(props) {
		super(props);
		this.state = {

		}

	}

	componentDidMount() {

		let canvas = document.getElementById("gui_canvas_container");
		let engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });


		var createScene = function () {

			var scene = new BABYLON.Scene(engine);
			
			//use adderCamera class
			const options = { lowerRadiusLimit: 0, upperRadiusLimit: 200 , useAutoRotationBehavior:true, attachControl:true}
			let adderCam_arcRotate = new AdderCamera(canvas, "ArcRotateCamera", "AdderCam_One", Math.PI / 2, Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene, true, options)
			let camera = adderCam_arcRotate.getCamera(scene);
			camera.attachControl(canvas, true);

			 //TODO: look in into get/set for all parameters 
			const options2 = { lowerRadiusLimit: 6, upperRadiusLimit: 10 , useAutoRotationBehavior:false, attachControl:true}
			//adderCam_arcRotate.setOptions(options2)

			var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
			light.intensity = 0.7;

			var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 12, height: 12 }, scene);
			ground.position.y = -1;
			return scene;

		};



		var scene = createScene();
		scene.autoClear = true;


		function asyncLoadAScene() {

			async function loadModelAsync(adderModel) {
				let meshNames = "";
				let rootUrl = "http://dbdev.adder.io/assets/" + adderModel.getModelFile();
				let result = await BABYLON.SceneLoader.ImportMeshAsync(meshNames, rootUrl, "", scene);
				await handleModelAsyncResolve(adderModel, result);
			}
			let porscheModelObject = new AdderModel("porsche2.2.babylon");  
			console.log("porscheModelObject:",porscheModelObject);
			porscheModelObject.setPosition( new BABYLON.Vector3(0, +10, 0));
			loadModelAsync(porscheModelObject);
console.log(porscheModelObject.getModelFile());
console.log(porscheModelObject.getMeshWrappers()); 


			let importedModelObject = new AdderModel("kc9BG06.babylon");  
			loadModelAsync(importedModelObject);
			importedModelObject.setPosition( new BABYLON.Vector3(0, -10, 0));

			//let pobox = new AdderModel("CITY/street_items/misc/pobox.babylon");  
			//loadModelAsync(pobox);

			let bike = new AdderModel("bike.babylon");  
			bike.setPosition( new BABYLON.Vector3(0, 0, 0));
			loadModelAsync(bike);

			let blocks_all_4 = new AdderModel("blocks_all_4.babylon");
			console.log("blocks_all_4:",blocks_all_4)
			blocks_all_4.setPosition( new BABYLON.Vector3(0, 0, 0));
			loadModelAsync(blocks_all_4);
		






			var myMeshes = importedModelObject.getMeshWrappers();
			function handleModelAsyncResolve(adderModel, result) {
				//For each mesh I should create a 'mesh class instance' and set it's parent 'model'
				const arrayOfMeshWrappers = []
				result.meshes.forEach(function (mesh) {
					let newMeshWrapper = new MeshWrapper(mesh, null, null)
					arrayOfMeshWrappers.push(newMeshWrapper)
				});
				adderModel.setMeshWrappers(arrayOfMeshWrappers);
				// LEFT OFF HERE: wondering why setting the position of these new models seems to have no effect yet. 
				// 8-26-2019 
				
				//create an array of mewshWrapper instances and them and then use <class>.setMeshWrappers(<Array of MeshWrappers>)
				//console.log("adder model:");
				//console.log(adderModel.getMeshWrappers());
			};

		};
		asyncLoadAScene();

		engine.runRenderLoop(function () {
			if (typeof scene === 'undefined') {
				return;
			} else {
				if (scene) {
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
				<canvas id="gui_canvas_container"
					className="babylonjsCanvas"
					style={{ boxShadow: "5px 5px 8px #2f2f2f" }} />
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