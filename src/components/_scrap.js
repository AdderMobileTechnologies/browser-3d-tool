import { ModelShape } from `babylonjs`;

            
            /*
            IN: `adderModelParentMesh`:String:name
                `CITY/adderModel.babylon`:String:modelFilePath

                `adderModel` 
            */
            
           let generic = createParentMeshForAdderModel("generic",cityVectorAdjustment,defaultLocalRotationAxis,defaultLocalRotationAngle);
			 generic.setParentMeshPosition(cityVectorAdjustment)
			 loadModelAsync(generic);
            
            function createAdderModel(filename,position,rotation,angle){

                let adderModelParentMesh = generateMeshParent(filename+`ParentMesh`);
                let adderModel = new AdderModel(`CITY/`+filename+`.babylon`, adderModelParentMesh, position, rotation, angle);
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