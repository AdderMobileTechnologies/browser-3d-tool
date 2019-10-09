var createScene = function() {
  var scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.5, 0.5, 0.5);

  var camera = new BABYLON.ArcRotateCamera(
    "camera1",
    -Math.PI / 2,
    Math.PI / 4,
    5,
    new BABYLON.Vector3(0, 0, 0),
    scene
  );
  camera.attachControl(canvas, true);

  var light = new BABYLON.HemisphericLight(
    "light1",
    new BABYLON.Vector3(1, 0.5, 0),
    scene
  );
  light.intensity = 0.8;

  var blueMat = new BABYLON.StandardMaterial("blue", scene);
  blueMat.emissiveColor = new BABYLON.Color3(0, 0, 1);

  var redMat = new BABYLON.StandardMaterial("red", scene);
  redMat.emissiveColor = new BABYLON.Color3(1, 0, 0);

  var box = BABYLON.MeshBuilder.CreateBox("box", {}, scene);
  box.position.y = 0.5;
  var ground = BABYLON.MeshBuilder.CreateGround(
    "ground",
    { width: 3, height: 3 },
    scene
  );

  var toSize = function(isChecked) {
    if (isChecked) {
      box.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
    } else {
      box.scaling = new BABYLON.Vector3(1, 1, 1);
    }
  };

  var toPlace = function(isChecked) {
    if (isChecked) {
      box.position.y = 1.5;
    } else {
      box.position.y = 0.5;
    }
  };

  var setColor = function(but) {
    switch (but) {
      case 0:
        box.material = blueMat;
        break;
      case 1:
        box.material = redMat;
        break;
    }
  };

  var orientateY = function(angle) {
    box.rotation.y = angle;
  };

  var displayValue = function(value) {
    return BABYLON.Tools.ToDegrees(value) | 0;
  };

  var transformGroup = new BABYLON.GUI.CheckboxGroup("Transformation");
  transformGroup.addCheckbox("Small", toSize);
  transformGroup.addCheckbox("High", toPlace);

  var colorGroup = new BABYLON.GUI.RadioGroup("Color");
  colorGroup.addRadio("Blue", setColor, true);
  colorGroup.addRadio("Red", setColor);

  var rotateGroup = new BABYLON.GUI.SliderGroup("Rotation", "S");

  rotateGroup.addSlider(
    "Angle Y",
    orientateY,
    "degs",
    0,
    2 * Math.PI,
    0,
    displayValue
  );

  var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(
    "UI"
  );

  var selectBox = new BABYLON.GUI.SelectionPanel("sp", [
    transformGroup,
    colorGroup,
    rotateGroup
  ]);
  selectBox.width = 0.25;
  selectBox.height = 0.56;
  selectBox.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  selectBox.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;

  advancedTexture.addControl(selectBox);

  var orientateX = function(angle) {
    box.rotation.x = angle;
  };

  rotateGroup.addSlider(
    "Angle X",
    orientateX,
    "degs",
    0,
    2 * Math.PI,
    Math.PI,
    displayValue
  );

  return scene;
};
