import React from "react";
import BABYLON from 'babylonjs'
import axios from 'axios';
import util from 'util';


//models
import AdderModel from '../models/model'
import MeshWrapper from '../models/meshWrapper'
import AdderCamera from '../models/camera'
import { domainToASCII } from "url";
/*
DEV NOTES: 
despite the fact that I changed the path to the city images to this... "http://dbdev.adder.io/assets/CITY/KC9_images/Roadtilecross.jpg" 
the code tries to look for it under the 'CITY' directory, so I just moved it their for now to get the images working.  not sure where the disconnnect is.
*/
const API_URL = 'http://localhost:8001';

class SceneFast extends React.Component {

	constructor(props) {
		super(props);
		this.state = {}




	}


	componentDidMount() {
		//grab meta files first:
		//index on top for all meta files...
		/*
				create meta files 
				download the meta files 
				parse meta files 
				IN: json file 
				(axios) 
	
				create a meta file for the porsche 
				hard code the location of the file 
				download the porsche 
				create model with meshwrappers  for the porsche 
				porsche.babylon 
				model , meshWrapper 
			
			*/
		let cityVectorAdjustment = new BABYLON.Vector3(70, -1, 20);
		let alternativeVector = new BABYLON.Vector3(70, 5, 20);
		let VectorZero = new BABYLON.Vector3(0, 0, 0);
		let defaultLocalRotationAxis = new BABYLON.Vector3(1, 1, 1);
		let defaultLocalRotationAngle = 0;


		
			 var promise1 = new Promise(function (resolve, reject) {
				const url = `${API_URL}/meta`;
				 axios.get(url).then(response => response.data)
					.then((data) => {
					 	resolve(data);
					})
	
			});
			promise1.then(function (value) {
				console.log("THE META DATA DATA:")
				console.log(value);
				//this.afterComponentMounted(value);


			});
		


		

		 
	
		console.log("DIRECTLTY AFTER AXIOS ")

		let canvas = document.getElementById("gui_canvas_container");
		let engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

		let createScene = function () {
			let scene = new BABYLON.Scene(engine);
			//use adderCamera class
			//const options = { lowerRadiusLimit: 5, upperRadiusLimit: 200, useAutoRotationBehavior: true, attachControl: true }
			//====>
			//===> 
			//NOTE: upper and lower are number values not 
			const options = { lowerAlphaLimit: -Math.PI, upperAlphaLimit: Math.PI, lowerBetaLimit: 0, upperBetaLimit: Math.PI / 2.2, lowerRadiusLimit: 5, upperRadiusLimit: 200, useAutoRotationBehavior: false, attachControl: true }

			/**
			 *     constructor(_newCanvas = null, _newType = null, _newName = null, _newAlpha = null, _newBeta = null,
			 *  _newRadius = null, _newTarget = new Vector3(0, 0, 0), _newScene = null, _newSetActiveOnSceneIfNoneActive = null, _newOptions = null) {
				,options
			 */
			let adderCam_arcRotate = new AdderCamera(canvas, "ArcRotateCamera", "AdderCam_One", (Math.PI / 4), (Math.PI / 4), 30, BABYLON.Vector3.Zero(), scene, true, options)
			let camera = adderCam_arcRotate.getCamera(scene);
			camera.attachControl(canvas, true);
			let light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
			light.intensity = 0.7;
			//let ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 12, height: 12 }, scene);
			//ground.position.y = 0;
			return scene;
		};

		let scene = createScene();
		scene.autoClear = true;


		async function loadModelAsync(adderModel) {

			let meshNames = "";
			let rootUrl = "http://dbdev.adder.io/assets/";
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
		 


		function minimalCubeExample() {
			//CREATE ADDER MODEL 
			let minimal_cube_mesh_parent = generateMeshParent("minimal_cube_model");
			let minimal_cube_mesh_position = new BABYLON.Vector3(0, -1, 0);
			let minimal_cube = new AdderModel("minimal_cube.babylon", minimal_cube_mesh_parent, minimal_cube_mesh_position, defaultLocalRotationAxis, defaultLocalRotationAngle);
			minimal_cube.setParentMesh(minimal_cube_mesh_parent);
			minimal_cube.setParentMeshPosition(new BABYLON.Vector3(-3, -1, 0))
			loadModelAsync(minimal_cube);
			let axis = new BABYLON.Vector3(0, 0, 1);
			let angle = 45;
			minimal_cube.setParentMeshRotation(axis, angle)
		}

		 
		function addArrayOfMiscellaneousModels(dir, array) {
			//console.log("addArrayOfMiscellaneousModels(array):")
			for (let arr of array) {
				let generic = createParentMeshForAdderModel(dir + arr, cityVectorAdjustment, defaultLocalRotationAxis, defaultLocalRotationAngle);
				loadModelAsync(generic);
				generic.setParentMeshPosition(VectorZero)
			}
		}
		let dir = `CITY/`;
		let array = [`streetLight`, `firehydrant`, `bicycle`, `block1v2`, `crane`]//FAILED MODELS: `kcpbg06`, `pobox`,
		addArrayOfMiscellaneousModels(dir, array);
		 
		/*
			let block1v2 = createParentMeshForAdderModel("block1v2",cityVectorAdjustment,defaultLocalRotationAxis,defaultLocalRotationAngle);
			block1v2.setParentMeshPosition(cityVectorAdjustment)
			loadModelAsync(block1v2);
	
			let crane = createParentMeshForAdderModel("crane",cityVectorAdjustment,defaultLocalRotationAxis,defaultLocalRotationAngle);
			loadModelAsync(crane);
			crane.setParentMeshPosition(new BABYLON.Vector3(-8,-1,0))
		*/
		function createParentMeshForAdderModel(filename, position, rotation, angle) {
			let adderModelParentMesh = generateMeshParent(filename + `ParentMesh`);
			let adderModel = new AdderModel(filename + `.babylon`, adderModelParentMesh, position, rotation, angle);
			adderModel.setParentMesh(adderModelParentMesh);
			loadModelAsync(adderModel);

			return adderModel;
		}
		function generateMeshParent(name) {
			let unitVec = new BABYLON.Vector3(1, 1, 1);
			let mesh_parentOptions = { width: 0, height: 0, depth: 0 }
			let mesh_parent = BABYLON.MeshBuilder.CreateBox(name, mesh_parentOptions, scene);
			mesh_parent.isVisible = false;
			mesh_parent.scaling = unitVec.scale(1);
			mesh_parent.setPositionWithLocalVector(new BABYLON.Vector3(0, 0, 0));
			return mesh_parent;
		}
		function handleModelAsyncResolve(adderModel, result) {
			//console.log("handleModelAsyncResolve");
			//console.log("adderModel:", adderModel);
			//console.log("result:", result);
			const arrayOfMeshWrappers = []
			result.meshes.forEach(function (mesh) {
				mesh.parent = adderModel.getParentMesh()
				let newMeshWrapper = new MeshWrapper(mesh, null, null)
				arrayOfMeshWrappers.push(newMeshWrapper)
			});
			adderModel.setMeshWrappers(arrayOfMeshWrappers);
		};



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
