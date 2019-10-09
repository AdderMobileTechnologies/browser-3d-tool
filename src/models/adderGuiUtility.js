import React from "react";
import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";

class AdderGuiUtility extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      y_previous: 0,
      z_previous: 0,
      x_previous: 0
    };
    //this.moveX = this.moveX.bind(this);
  }
  currentX_value = 0;
  gui_create_grid2 = advancedTexture => {
    // grid container for form controls
    var grid = new GUI.Grid();
    // grid.background = "#eee";
    // grid.alpha = 0.1;
    grid.width = "50%";
    grid.height = "10%";
    grid.border = "1px solid #fff";
    grid.addColumnDefinition(1.0);
    grid.addRowDefinition(3);
    grid.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    grid.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    advancedTexture.addControl(grid);
    return grid;
  };

  panel_Grid = (advancedTexture, header, slider, panel) => {
    advancedTexture.layer.layerMask = 2;

    switch (panel) {
      case 1:
        var panel1 = new BABYLON.GUI.StackPanel();
        panel1.width = "120px";
        panel1.fontSize = "14px";

        panel1.horizontalAlignment =
          BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel1.verticalAlignment =
          BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        advancedTexture.addControl(panel1);
        panel1.addControl(header);
        panel1.addControl(slider);
        break;
      case 2:
        var panel2 = new BABYLON.GUI.StackPanel();
        panel2.width = "120px";
        panel2.fontSize = "14px";

        panel2.horizontalAlignment =
          BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        panel2.verticalAlignment =
          BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        advancedTexture.addControl(panel2);
        panel2.addControl(header);
        panel2.addControl(slider);
        break;
      case 3:
        var panel3 = new BABYLON.GUI.StackPanel();
        panel3.width = "120px";
        panel3.fontSize = "14px";

        panel3.horizontalAlignment =
          BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        panel3.verticalAlignment =
          BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        advancedTexture.addControl(panel3);
        panel3.addControl(header);
        panel3.addControl(slider);
        break;
      default:
        break;
    }
  };

  control_sliderWithHeader = (mesh, headerTitle) => {
    var header = new BABYLON.GUI.TextBlock();
    header.text = headerTitle + ":";
    header.height = "40px";
    header.color = "white";
    header.paddingLeft = "15px";
    header.textHorizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    header.paddingTop = "10px";
    // panel3.addControl(header);

    var slider = new BABYLON.GUI.Slider();
    slider.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    slider.minimum = 0;
    slider.paddingLeft = 12;
    slider.maximum = 2;
    slider.isThumbCircle = true;
    slider.thumbWidth = "15px";
    slider.color = "#222";
    slider.shadowColor = "#ccc";
    slider.borderColor = "#000";
    slider.value = 0;
    slider.height = "16px";
    slider.width = "100px";
    slider.metadata = 0;
    slider.onValueChangedObservable.add(function(value) {
      // console.log("value:", value);
      // console.log("slider.metadata:", slider.metadata);
      if (mesh) {
        //compare for direction:
        if (value > slider.metadata) {
          mesh.rotation.y = parseFloat(value * 0.1).toFixed(2);
          // console.log("+++++:", mesh.rotation.y);
        } else {
          mesh.rotation.y = parseFloat(-(value * 0.1)).toFixed(2);
          //console.log("-----:", mesh.rotation.y);
        }
      }
      //using the metadata property to store the previous slider value for comparison when sliding left or right.
      slider.metadata = value;
    });

    var results = [header, slider];

    return results;
  };
  //////////////////////////////////////////
  // GUI SELECTION PANEL
  /* to use: 
  0) let mesh_id = mesh_id
  1) let rotateGroup = make_rotateGroup()
  2) addSliderToRotateGroup :   (rotateGroup, name, method, mesh_id, angle, displayValue)
  3) let sectionPanel = gui_selection_panel( rotateGroup, width, height) 
  4) gui_add_selection_panel_to_scene = (advancedTexture, selection_panel) 
  
  advancedTexture,
  mesh_id
  let options = {
    name:"",
    method:"",
    angle:"",
    width:"",
    height:"",
    displayValue:""
  }
  make_default_selection_panel = (advancedTexture, mesh_id, options) 
  */

  make_default_selection_panel = (advancedTexture, mesh_id, options) => {
    console.log(
      "adderGUIUtility: make_default_selection_panel(): mesh_id:",
      mesh_id
    );
    /* to use: 
      0) let mesh_id = mesh_id
      1) let rotateGroup = make_rotateGroup()
      2) addSliderToRotateGroup :   (rotateGroup, name, method, mesh_id, angle, displayValue)
      3) let sectionPanel = gui_selection_panel( rotateGroup, width, height) 
      4) gui_add_selection_panel_to_scene = (advancedTexture, selection_panel) 
      */
    let rotateGroup = this.make_rotateGroup();
    console.log("rotateGroup:", rotateGroup);
    console.log(typeof rotateGroup);
    console.log(rotateGroup instanceof BABYLON.GUI.SliderGroup);
    //(mesh_id, options.angle)
    this.addSliderToRotateGroup(
      rotateGroup,
      options.name,
      this.orientateX,
      mesh_id,
      options.angle,
      options.displayValue
    );
    let sectionPanel = this.gui_selection_panel(
      rotateGroup,
      options.width,
      options.height
    );
    this.gui_add_selection_panel_to_scene(advancedTexture, sectionPanel);
  };

  gui_selection_panel = (rotateGroup, width, height) => {
    var selectBox = new BABYLON.GUI.SelectionPanel("sp", [rotateGroup]);
    selectBox.width = width; //0.25
    selectBox.height = height; //0.56
    selectBox.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    selectBox.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    return selectBox;
  };

  gui_add_selection_panel_to_scene = (advancedTexture, selection_panel) => {
    advancedTexture.addControl(selection_panel);
  };

  orientateY = function(mesh_id, angle) {
    mesh_id.rotation.y = angle;
  };

  orientateX = function(mesh_id, angle) {
    mesh_id.rotation.x = angle;
  };

  displayValue = function(value) {
    return BABYLON.Tools.ToDegrees(value) | 0;
  };
  make_rotateGroup = () => {
    let rotateGroup = new BABYLON.GUI.SliderGroup("Rotation", "S");
    return rotateGroup;
  };
  addSliderToRotateGroup = () => {
    console.log("fooey");
  };
  /*
  addSliderToRotateGroup = (
    rotateGroup,
    name,
    method,
    mesh_id,
    angle,
    displayValue
  ) => { 
    // !!!!! Unhandled Rejection (TypeError): a is not a function !!!!! 
     rotateGroup.addSlider(
      name,
      method(mesh_id, angle),
      "degs",
      0,
      2 * Math.PI,
      0,
      displayValue
    );
  };
*/
  /*
  toSize = function(mesh_id, isChecked) {
    if (isChecked) {
      mesh_id.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
    } else {
      mesh_id.scaling = new BABYLON.Vector3(1, 1, 1);
    }
  };

  toPlace = function(mesh_id, isChecked) {
    if (isChecked) {
      mesh_id.position.y = 1.5;
    } else {
      mesh_id.position.y = 0.5;
    }
  };

  make_transformGroup = (transformGroup, toSize, toPlace) => {
    transformGroup = new BABYLON.GUI.CheckboxGroup("Transformation");
    transformGroup.addCheckbox("Small", toSize);
    transformGroup.addCheckbox("High", toPlace);
  };
  make_colorGroup = (colorGroup, setColor) => {
    colorGroup = new BABYLON.GUI.RadioGroup("Color");
    colorGroup.addRadio("Blue", setColor, true);
    colorGroup.addRadio("Red", setColor);
  };
*/
  easy_selection_panel = (scene, advancedTexture, mesh) => {
    console.log("easy selection panel:");
    console.log("adderGuiUtility.js:easy_selection_panel():mesh:", mesh);
    console.log("this.state:", this.state);
    var scope = this.state;
    var toSize = function(isChecked) {
      if (isChecked) {
        mesh.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
      } else {
        mesh.scaling = new BABYLON.Vector3(1, 1, 1);
      }
    };

    var toPlace = function(isChecked) {
      if (isChecked) {
        mesh.position.y = 1.5;
      } else {
        mesh.position.y = 0.5;
      }
    };

    var orientateY = function(angle) {
      mesh.rotation.y = angle;
    };
    var orientateX = function(angle) {
      mesh.rotation.x = angle;
    };

    var displayValue = function(value) {
      return BABYLON.Tools.ToDegrees(value) | 0;
    };

    var transformGroup = new BABYLON.GUI.CheckboxGroup("Transformation");
    transformGroup.addCheckbox("Small", toSize);
    transformGroup.addCheckbox("High", toPlace);

    var rotateGroup = new BABYLON.GUI.SliderGroup("Rotation", "S");

    rotateGroup.addSlider(
      "Angle Y",
      orientateY,
      "degs",
      0,
      2 * Math.PI * 0.1,
      0,
      displayValue
    );
    /*
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(
      "UI"
    );
    */
    /*   transformGroup,
      colorGroup,
       rotateGroup,
      */

    var selectBox = new BABYLON.GUI.SelectionPanel("sp", [rotateGroup]);
    selectBox.width = 0.25;
    selectBox.height = 0.56;
    selectBox.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    selectBox.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;

    advancedTexture.addControl(selectBox);
    /*
    rotateGroup.addSlider(
      "Angle X",
      orientateX,
      "degs",
      0,
      2 * Math.PI * 0.1,
      Math.PI * 0.1,
      displayValue
    );*/
    var moveY = function(val) {
      mesh.position.y = mesh.position.y + val;
    };
    var displayValueN = function(value) {
      console.log("value:", value);

      return BABYLON.Tools.ToDegrees(value) | 0;
    };

    var moveX = function(val) {
      let degreeVal = displayValueN(val);
      console.log("degreeValue:", degreeVal);
      console.log("scope:", scope);

      if (scope.x_previous > val) {
        mesh.position.x = mesh.position.x + val;
      } else {
        mesh.position.x = mesh.position.x - val;
      }

      scope.x_previous = val;
    };
    rotateGroup.addSlider("Position X", moveX, "degs", 0, 3, 0.1, displayValue);
  };
  ////////////////////////////////////////
}
export default AdderGuiUtility;

/*
  /* ORIGINAL: 
        if (value > slider.metadata) {
          mesh.rotation.y = value * 0.1;
        } else {
          mesh.rotation.y = -(value * 0.1);
        }
        */
/*
       //attempt #1 
        // Alternative:  may need to be converted to radians:
        if (value > 1) {
          //2 - sliderValue * 360
          let meshRotationValue = (2 - value) * 360 * (Math.PI / 180);
          mesh.rotation.y = meshRotationValue;
          console.log("meshRotationValue:", meshRotationValue);
        }
        if (value < 1) {
          // sliderValue * -360
          let meshRotationValueLess = value * -360 * (Math.PI / 180) ;
          mesh.rotation.y = meshRotationValueLess;
          console.log("meshRotationValueLess:", meshRotationValueLess);
        }
        if (value === 0 || value === 1 || value === 2) {
          //slider valu e = 0
          mesh.rotation.y = 0;
        }
        //end #1
        */

/*
        
IF 2 = 360 and 1 = 0 and 0 = -360







        */
