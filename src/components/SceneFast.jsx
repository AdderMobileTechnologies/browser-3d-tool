import React from "react";
import BABYLON from 'babylonjs'
//models
import AdderModel from '../models/model'
import MeshWrapper from '../models/meshWrapper'
import AdderCamera from '../models/camera'
/*
DEV NOTES: 
despite the fact that I changed the path to the city images to this... "http://dbdev.adder.io/assets/CITY/KC9_images/Roadtilecross.jpg" 
the code tries to look for it under the 'CITY' directory, so I just moved it their for now to get the images working.  not sure where the disconnnect is.
*/

class SceneFast extends React.Component {

	constructor(props) {
		super(props);
		this.state = {}
	}
	componentDidMount() {

		let canvas = document.getElementById("gui_canvas_container");
		let engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

		var createScene = function () {
			var scene = new BABYLON.Scene(engine);
			//use adderCamera class
			const options = { lowerRadiusLimit: 0, upperRadiusLimit: 200, useAutoRotationBehavior: true, attachControl: true }
			let adderCam_arcRotate = new AdderCamera(canvas, "ArcRotateCamera", "AdderCam_One", Math.PI / 2, Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene, true, options)
			let camera = adderCam_arcRotate.getCamera(scene);
			camera.attachControl(canvas, true);
			const options2 = { lowerRadiusLimit: 6, upperRadiusLimit: 10, useAutoRotationBehavior: false, attachControl: true }
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
				let rootUrl = "http://dbdev.adder.io/assets/"  ;
				let sceneFileName = adderModel.getModelFile();
				//'scene' already defined.
				let onProgress = null;
				let pluginExtension = null;
				/*  constructor()
					SceneLoader.ImportMeshAsync(
						meshNames: any, 
						rootUrl: string, 
						sceneFilename?: string | File,
						scene?: Nullable<Scene>, 
						onProgress?: Nullable<function>, 
						pluginExtension?: Nullable<string>
					)
					: Promise<object>
					https://doc.babylonjs.com/api/classes/babylon.sceneloader
				*/
				let result = await BABYLON.SceneLoader.ImportMeshAsync(meshNames, rootUrl, sceneFileName, scene);
				await handleModelAsyncResolve(adderModel, result);
			}
			///////////////////////////////////////////////////////////////////////////////
			let cityVectorAdjustment = new BABYLON.Vector3(70,-1,20);
			//CREATE ADDER MODEL 
			let minimal_cube_mesh_parent =  generateMeshParent("minimal_cube_model");
			let minimal_cube = new AdderModel("minimal_cube.babylon",minimal_cube_mesh_parent);
			minimal_cube.setParentMesh(minimal_cube_mesh_parent);
			minimal_cube.setParentMeshPosition(new BABYLON.Vector3(0,-1,0))
			loadModelAsync(minimal_cube);
			var axis = new BABYLON.Vector3(0, 0, 1);
			var angle = Math.PI/8;
			angle = 45;
			minimal_cube.setParentMeshRotation(axis, angle)


			//create a second model with a different parent for location 
			let buildingParentMesh =  generateMeshParent("bikeParentMesh");
			let building = new AdderModel("CITY/kcpbg06.babylon",buildingParentMesh);
			building.setParentMesh(buildingParentMesh);
			building.setParentMeshPosition(cityVectorAdjustment)
			loadModelAsync(building);


			//blocks_all_4.babylon
			let blocksAll4ParentMesh =  generateMeshParent("blocksAll4ParentMesh");
			let blocksAll4 = new AdderModel("CITY/blocks_all_4.babylon",blocksAll4ParentMesh);
			blocksAll4.setParentMesh(blocksAll4ParentMesh);
			blocksAll4.setParentMeshPosition(cityVectorAdjustment)
			loadModelAsync(blocksAll4);
			
			/*
			let MODEL_X_ParentMesh =  generateMeshParent("MODEL_X_ParentMesh");
			let MODEL_X_ = new AdderModel("CITY/MODEL_X_FILENAME.babylon",MODEL_X_ParentMesh);
			MODEL_X_.setParentMesh(MODEL_X_ParentMesh);
			MODEL_X_.setParentMeshPosition(cityVectorAdjustment)
			loadModelAsync(MODEL_X_);
			*/

			let poboxParentMesh =  generateMeshParent("poboxParentMesh");
			let pobox = new AdderModel("CITY/pobox.babylon",poboxParentMesh);
			pobox.setParentMesh(poboxParentMesh);
			pobox.setParentMeshPosition(cityVectorAdjustment)
			loadModelAsync(pobox);



			/////////////////////////////////////////////////////////////////////////////////////////
			 
 

			function handleModelAsyncResolve(adderModel, result) {
				console.log("handleModelAsyncResolve");
				console.log("adderModel:",adderModel);
				console.log("result:",result);
				
				const arrayOfMeshWrappers = []
				result.meshes.forEach(function (mesh) {
					mesh.parent = adderModel.getParentMesh()
					let newMeshWrapper = new MeshWrapper(mesh, null, null)
					arrayOfMeshWrappers.push(newMeshWrapper)
				});
				adderModel.setMeshWrappers(arrayOfMeshWrappers);
			};

		};

		function generateMeshParent(name){
			let unitVec = new BABYLON.Vector3(1, 1, 1);
			let mesh_parentOptions = {width: 0, height: 0, depth: 0}
			let mesh_parent = BABYLON.MeshBuilder.CreateBox(name, mesh_parentOptions, scene);
			mesh_parent.isVisible = false;
			mesh_parent.scaling = unitVec.scale(1);
			mesh_parent.setPositionWithLocalVector(new BABYLON.Vector3(0, 0, 0));
			return mesh_parent;
		}

	 

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
