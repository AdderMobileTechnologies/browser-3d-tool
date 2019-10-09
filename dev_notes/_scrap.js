var moveZ = function(val) {
  let degreeVal = displayValueN(val);
  if (scope.z_previous > val) {
    mesh.position.z = mesh.position.z + val;
  } else {
    mesh.position.z = mesh.position.z - val;
  }
  scope.z_previous = val;
};
rotateGroup.addSlider("position.z", moveZ, "degs", 0, 3, 0.1, displayValue);
