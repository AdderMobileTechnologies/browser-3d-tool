//blocks_all_4.babylon
let poboxParentMesh =  generateMeshParent("poboxParentMesh");
let pobox = new AdderModel("CITY/pobox.babylon",poboxParentMesh);
pobox.setParentMesh(poboxParentMesh);
pobox.setParentMeshPosition(cityVectorAdjustment)
loadModelAsync(pobox);