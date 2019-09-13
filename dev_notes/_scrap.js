save_UIAction() {
  let action_object = this.state.actions;
  action_object.action = "save_UIAction";
  action_object.to = "change to";
  action_object.from = "change from";
  action_object.other =[];
  const new_actions_array = this.state.actions.slice();
  new_actions_array.push(action_object); // Push the object
  this.setState(
    prevState => ({
      ...prevState,
      actions: new_actions_array
    }),
    () => {
  
      let old_actions = JSON.parse(localStorage.getItem("actions_array")) || [];
      let new_action = this.state.actions;
      //push to local storage:
      old_actions.push(new_action);
      localStorage.setItem("actions_array", JSON.stringify(old_actions));
    }
  );
}