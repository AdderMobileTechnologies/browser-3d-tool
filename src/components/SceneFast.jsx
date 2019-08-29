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
DEV NOTES: 08-29-2019
//grab meta files first:
//index on top for all meta files...

	#create meta files 
	#download the meta files 
	parse meta files 
	IN: json file 
	(axios) 

	#create a meta file for the porsche 
	hard code the location of the file 
	#download the porsche 
	#create model with meshwrappers  for the porsche 
*(Meta Data Formatting is extremely strict, look out for commas on the last item in an object!)	 
	  
*/
const API_URL = 'http://localhost:8001';

class SceneFast extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			meta_data: {}
		}
	}


	componentDidMount() {


		let cityVectorAdjustment = new BABYLON.Vector3(70, -1, 20);
		let alternativeVector = new BABYLON.Vector3(70, 5, 20);
		let vectorZero = new BABYLON.Vector3(0, 0, 0);
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

				console.log(value.meta_data[0]);
				console.log(value.meta_data[1]);

			let dir = value.meta_data[0]['vehicle_2door_sportscar']['dir'];
			let filename = value.meta_data[0]['vehicle_2door_sportscar']['filename'];
			let position = value.meta_data[0]['vehicle_2door_sportscar']['position'];
			let rotation = value.meta_data[0]['vehicle_2door_sportscar']['rotation'];
			let scaling = value.meta_data[0]['vehicle_2door_sportscar']['scaling'];
			console.log("-----porsche:scaling:", scaling);
			addSingleModel(dir, filename, position, rotation, scaling);

			let dir_vw = value.meta_data[1]['vehicle_4door_stationwagon']['dir'];
			let filename_vw = value.meta_data[1]['vehicle_4door_stationwagon']['filename'];
			let position_vw = value.meta_data[1]['vehicle_4door_stationwagon']['position'];
			let rotation_vw = value.meta_data[1]['vehicle_4door_stationwagon']['rotation'];
			let scaling_vw = value.meta_data[1]['vehicle_4door_stationwagon']['scaling'];
			console.log("-----vw:scaling:", scaling_vw);
			 
			addSingleModel(dir_vw, filename_vw, position_vw, rotation_vw, scaling_vw);

			let dir_streetLight = value.meta_data[2]['streetLight']['dir'];
			let filename_streetLight = value.meta_data[2]['streetLight']['filename'];
			let position_streetLight = value.meta_data[2]['streetLight']['position'];
			let rotation_streetLight = value.meta_data[2]['streetLight']['rotation'];
			let scaling_streetLight = value.meta_data[2]['streetLight']['scaling'];
				
			addSingleModel(dir_streetLight, filename_streetLight, position_streetLight, rotation_streetLight, scaling_streetLight);


		});
		 
		function addSingleModel(dir, filename, position, rotation, scaling) {

			let positionVect = new BABYLON.Vector3(position.x, position.y, position.z);
			let rotationAxisVect = new BABYLON.Vector3(rotation.axis.x, rotation.axis.y, rotation.axis.z);
			var rotationAngle = parseInt(rotation.angle);
			console.log("THE ROTATION OBJECT:");
			console.log(rotation);
			console.log("ROTATION ANGLE : ");
			console.log(rotationAngle);
			//converting Degrees to Radians:
			//let rotationRadian = rotationAngle * (Math.PI/180);
			let scalingVect = new BABYLON.Vector3(scaling.x, scaling.y, scaling.z);
			let modelFile =  dir + "/" + filename + `.babylon`;
			let adderModel = new AdderModel(scene, modelFile, null, positionVect, rotationAxisVect, rotationAngle, [] , scalingVect);
			loadModelAsync(adderModel);

			// Changing The Position of a PARENT MESH of an AdderModel currently requires 'getting the parent mesh and applying the babylon method to it.ie.setPositionWithLocalVector(Vector3)
			// This is not desireable becasue we'd like to be able to do it from the model itself, I would imagine.
			/* How to change Parent Mesh Position.*/
			//Position and Rotation: applied to parent mesh.
			let adderModelParent = adderModel.getParentMesh();
			//Position:
			let adderModelPosition = adderModel.getPosition();
			adderModelParent.setPositionWithLocalVector(adderModelPosition); //new BABYLON.Vector3(7, 1, 0)
			//Rotation:
			let adderModelRotationAngle = adderModel.getRotationAngle();
			let adderModelRotationRadian = adderModel.getRotationRadian();
			let adderModelRotationAxis = adderModel.getRotationAxis();
			var quaternion = new BABYLON.Quaternion.RotationAxis(adderModelRotationAxis, adderModelRotationRadian);
			adderModelParent.rotationQuaternion = quaternion;
			//Scaling:
			let scalingFactorX = adderModel.getScaling();
			adderModelParent.scaling = scalingFactorX;




		}





		let canvas = document.getElementById("adder_3dTool_canvas");
		let engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

		let createScene = function () {
			//create the scene.
			let scene = new BABYLON.Scene(engine);
			//build the camera.
			const cameraOptions = {
				lowerAlphaLimit: -Math.PI,
				upperAlphaLimit: Math.PI,
				lowerBetaLimit: 0,
				upperBetaLimit: Math.PI / 2.2,
				lowerRadiusLimit: 5,
				upperRadiusLimit: 200,
				useAutoRotationBehavior: false,
				attachControl: true
			}
			let adderCam_arcRotate = new AdderCamera(canvas, "ArcRotateCamera", "AdderCam_One", (Math.PI / 4), (Math.PI / 4), 30, BABYLON.Vector3.Zero(), scene, true, cameraOptions)
			let camera = adderCam_arcRotate.getCamera(scene);
			camera.attachControl(canvas, true);//add camera to the scene/canvas
			//create a light
			let light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
			light.intensity = 0.7;

			return scene;
		};

		let scene = createScene();
		scene.autoClear = true;


		async function loadModelAsync(adderModel) {
			/* 
			 SceneLoader constructor()

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
			//define SceneLoader.ImportMeshAsync parameters: 
			let meshNames = "";
			let rootUrl = "http://dbdev.adder.io/assets/";
			let sceneFileName = adderModel.getModelFile();
			let onProgress = null;
			let pluginExtension = null;

			let result = await BABYLON.SceneLoader.ImportMeshAsync(meshNames, rootUrl, sceneFileName, scene, onProgress, pluginExtension);
			await callback_ImportMeshAsync(adderModel, result);
		}

		function callback_ImportMeshAsync(adderModel, result) {
			const meshWrappers = []
			//make adderModel parent mesh, the parent of all individual meshes.
			//wrap each mesh in the meshWrapper class and build the array.
			//add the array to the model.
			result.meshes.forEach(function (mesh) {
				mesh.parent = adderModel.getParentMesh()
				let newMeshWrapper = new MeshWrapper(mesh, null, null)
				meshWrappers.push(newMeshWrapper)
			});
			adderModel.setMeshWrappers(meshWrappers);
		};


		function addSingleModelv1(dir, filename) {
			console.log("addSingleModel(dir, filename)", dir, filename);
			//TODO: figure out how to create the mesh parent during the original construction of the AdderModel object.
			let generic = createParentMeshForAdderModel(dir + "/" + filename, cityVectorAdjustment, defaultLocalRotationAxis, defaultLocalRotationAngle);

			//let adderModelParentMesh = generateMeshParent(dir + filename + `ParentMesh`);
			//let adderModel = new AdderModel(scene,dir + filename + `.babylon`, adderModelParentMesh, position, rotation, angle);
			//let generic = new AdderModel(scene, dir + filename + `.babylon`, null, cityVectorAdjustment, defaultLocalRotationAxis, defaultLocalRotationAngle);

			loadModelAsync(generic);
			generic.setParentMeshPosition(new BABYLON.Vector3(7, 1, 0))

		}
		function createParentMeshForAdderModel(filename, position, rotation, angle) {
			let adderModelParentMesh = generateMeshParent(filename + `ParentMesh`);
			let adderModel = new AdderModel(scene, filename + `.babylon`, adderModelParentMesh, position, rotation, angle);
			//adderModel.setParentMesh(adderModelParentMesh);
			loadModelAsync(adderModel);

			return adderModel;
		}
		function addArrayOfMiscellaneousModels(dir, array) {
			// let dir = `porsche/`;
			// let array = [`streetLight`, `firehydrant`, `bicycle`, `block1v2`, `crane`]//FAILED MODELS: `kcpbg06`, `pobox`,
			// addArrayOfMiscellaneousModels(dir, array);
			//console.log("addArrayOfMiscellaneousModels(array):")
			for (let arr of array) {
				let generic = createParentMeshForAdderModel(dir + "/" + arr, cityVectorAdjustment, defaultLocalRotationAxis, defaultLocalRotationAngle);
				loadModelAsync(generic);
				generic.setParentMeshPosition(vectorZero)
			}
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

		let dir = `CITY`;
		let array = [`streetLight`, `firehydrant`, `bicycle`, `block1v2`, `crane`]//FAILED MODELS: `kcpbg06`, `pobox`,
		//addArrayOfMiscellaneousModels(dir, array);
		let arrayX = [ `block1v2`]
		addArrayOfMiscellaneousModels(dir, arrayX);

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
				<canvas id="adder_3dTool_canvas"
					className="adder-3dTool-canvas"
					style={{ boxShadow: "5px 5px 8px #2f2f2f" }} />
			</div>

		);
	}
}

export default SceneFast
