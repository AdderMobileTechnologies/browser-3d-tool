const array_texture_image_models = scope.state.texture_images.slice();
console.log("texture_image_model:", texture_image_model);
array_texture_image_models.push(texture_image_model);
scope.setState(prevState => ({
  ...prevState,
  texture_images: array_texture_image_models
}));
