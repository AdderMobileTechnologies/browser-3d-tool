//building array in state

//1) create object to push to the existing array
let data_model = {};
data_model.id = this.state.editing_mesh_id;
data_model.dataURL = dataURL;
//2) get the existing array
const array_of_state_data_models = scope.state.state_array_name.slice();
//3) push to the state array
array_of_state_data_models.push(data_model);
//4) change out the new array with the edits for the old array.
scope.setState(prevState => ({
  ...prevState,
  state_array_name: array_of_state_data_models
}));
