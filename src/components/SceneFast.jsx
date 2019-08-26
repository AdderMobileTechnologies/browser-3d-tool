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
			let camera_Original = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene);

			//camera_Original.attachControl(canvas, true)
			//camera_Original.lowerRadiusLimit = 6;
			//camera_Original.upperRadiusLimit = 10;

			const options = {lowerRadiusLimit:6,upperRadiusLimit:10}
			//camera.useAutoRotationBehavior(true);
			/*
			//TODO: Use the new Camera Object .
			//may have to apply these additional properties to the constructor? Is there a better way
			//to handle this being that there could be tons of different properties for the more than 30 types of cameras.?
			// ! _options right? 
			let camera = new AdderCamera( "ArcRotateCamera","Camera2", Math.PI / 2, Math.PI / 2 , 10, BABYLON.Vector3.Zero(), scene)	
			camera.attachControl(canvas, true);
			camera.setAttachControl(canvas,true)
			camera.setLowerRadiusLimit(6);
			camera.setUpperRadiusLimit(10);
			camera.setUseAutoRotationBehavior(true);

			*/
			let camera = new AdderCamera( canvas, "ArcRotateCamera","Camera2", Math.PI / 2, Math.PI / 2 , 10, BABYLON.Vector3.Zero(), scene, true, options)	
			/*camera.attachControl(canvas, true);
			camera.setAttachControl(canvas,true)
			camera.setLowerRadiusLimit(6);
			camera.setUpperRadiusLimit(10);
			camera.setUseAutoRotationBehavior(true);
			*/
			camera.setAttachControl(true);


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
			let porscheModelObject = new AdderModel("porsche2.2.babylon")
			loadModelAsync(porscheModelObject);
			var myMeshes = porscheModelObject.getMeshWrappers();
			function handleModelAsyncResolve(adderModel, result) {
				//For each mesh I should create a 'mesh class instance' and set it's parent 'model'
				const arrayOfMeshWrappers = []
				result.meshes.forEach(function (mesh) {
					let newMeshWrapper = new MeshWrapper(mesh, null, null)
					arrayOfMeshWrappers.push(newMeshWrapper)
				});
				adderModel.setMeshWrappers(arrayOfMeshWrappers);

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