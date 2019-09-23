//building array in state

//1) create object to push to the existing array
let texture_image_model = {};
texture_image_model.id = this.state.editing_mesh_id;
texture_image_model.dataURL = dataURL;
//2) get the existing array
const array_texture_image_models = scope.state.texture_images.slice();
//3) push to the state array
array_texture_image_models.push(texture_image_model);
//4) change out the new array with the edits for the old array.
scope.setState(prevState => ({
  ...prevState,
  texture_images: array_texture_image_models
}));
