import React from "react";
import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
//1
import { messageService } from '../_services'; 

import Grid from "@material-ui/core/Grid"; //
let scope;
class AdderGuiUtility extends React.Component {
  constructor(props) {
    super(props);
    //2
    this.state = {
      messages: [],
      selectionPanel: {},
      mesh: {},
      y_previous: 0,
      z_previous: 0,
      x_previous: 0,
      //isRaining:props.isRaining,
    };
    scope = this;
    //this.moveX = this.moveX.bind(this);
  }
  //3
  componentDidMount() {
    console.log("does adderGuiUtility Mount ? in its present form?")
    //DOES NOT actually mount because not called like a regular react comp
    //what if I moved this to inside the function that gets called.
    let scope = this;
    // subscribe to home component messages
    this.subscription = messageService.getMessage().subscribe(message => {
        if (message) {
            // add message to local state if not empty
            this.setState({ messages: [...this.state.messages, message] });
        } else {
            // clear messages when empty message received
            this.setState({ messages: [] });
        }
    });
}
//4
componentWillUnmount() {
  // unsubscribe to ensure no memory leaks: RXJS 
  this.subscription.unsubscribe();
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
  easy_selection_panel = (scene, advancedTexture, mesh) => {
    console.log("easy selection panel:");
    console.log("adderGuiUtility.js:easy_selection_panel():mesh:", mesh);
    console.log("this.state:", this.state);
    ///--- insert the didmount code here instead
   // let scope = this;
    // RXJS: subscribe to home component messages
    this.subscription = messageService.getMessage().subscribe(message => {
        if (message) {
            // add message to local state if not empty
            this.setState({ messages: [...this.state.messages, message] });
        } else {
            // clear messages when empty message received
            this.setState({ messages: [] });
        }
    });

    /// - end didmount code.
    var scope = this.state;
    scope.mesh = mesh;
    var toSize = function(isChecked) {
      if (isChecked) {
        mesh.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
      } else {
        mesh.scaling = new BABYLON.Vector3(1, 1, 1);
      }
    };

    var orientateY = function(angle) {
      let val = displayValueN(angle);
      if (scope.y_previous > val) {
        // mesh.position.x = mesh.position.x + val;
        mesh.rotation.y = angle/2;
      } else if (scope.y_previous < val) {
        // mesh.position.x = mesh.position.x - val;
        mesh.rotation.y = -1 * angle/2;
      }
      scope.y_previous = val;
    };
    var orientateX = function(angle) {
      mesh.rotation.x = angle;
    };

    var displayValue = function(value) {
      return BABYLON.Tools.ToDegrees(value) | 0;
    };
    var onValueChange = function(value) {
      // console.log("onValueChange value:", value);
      console.log("scope:", scope);
      
      return " ";
    };

    /*
    positionGroup.addSlider(
      "Angle Y",
      orientateY,
      "degs",
      0,
      2 * Math.PI * 0.1,
      0,
      displayValue
    );
   */
    var transformGroup = new BABYLON.GUI.CheckboxGroup("Transformation");
    transformGroup.addCheckbox("Small", toSize);

    var positionGroup = new BABYLON.GUI.SliderGroup("Rotation", "S");
    console.log(
      "What is inside the positionGroup: ie. sliderGroup?",
      positionGroup
    );

    var selectionPanel = new BABYLON.GUI.SelectionPanel("sp", [positionGroup]);
   // scope.selectionPanel = selectionPanel;
   
    selectionPanel.width = 0.25;
    selectionPanel.height = 0.56;
    selectionPanel.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    selectionPanel.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    /* selectionPanel style */
    selectionPanel.fontSize = 11;
    selectionPanel.fontWeight = 600;
    selectionPanel.paddingTop = 2;
    selectionPanel.paddingLeft = 2;
    selectionPanel.paddingRight = 2;
    selectionPanel.paddingBottom = 2;
    selectionPanel.alpha = 0.7;
    selectionPanel.background = "#222";
    selectionPanel.barColor = "#4F7DF2";
    selectionPanel.color = "#FFFFFF";
    selectionPanel.labelolor = "#FFFFFF";
    selectionPanel.cornerRadius = 8;
    selectionPanel.thickness = 0.5;
    selectionPanel.isVisible = false;
/* will not allow setState without a componentWillMount () function ...tied directly to it. 
    this.setState({
      selectionPanel: selectionPanel
    }, () => {console.log("should have set selectionPanel insto state.")})
    */
   //the error mentioned assigning it directly to state. 
   this.state.selectionPanel = selectionPanel;

    advancedTexture.addControl(selectionPanel);
   console.log("advancedTexture:",advancedTexture);

    var moveY = function(val) {
      mesh.position.y = mesh.position.y + val;
    };
    var displayValueN = function(value) {
      console.log("value:", value);
      return BABYLON.Tools.ToDegrees(value) | 0;
    };

    var moveX = function(val) {
      let degreeVal = displayValueN(val);
      console.log("mesh.position.x:", mesh.position.x);
      // console.log("scope.x_previous:", scope.x_previous);
      // console.log("val:", val);
      if (scope.x_previous > val) {
        mesh.position.x = mesh.position.x + val/2;
      } else {
        mesh.position.x = mesh.position.x - val/2;
      }
      scope.x_previous = val;
    };

    var moveZ = function(val) {
      let degreeVal = displayValueN(val);
      if (scope.z_previous > val) {
        mesh.position.z = mesh.position.z - val/2;
      } else {
        mesh.position.z = mesh.position.z + val/2;
      }
      scope.z_previous = val;
    };

    positionGroup.addSlider(
      "Position X",
      moveX,
      " ",
      0.95,
      1.45,
      0.01,
      onValueChange
    );

    positionGroup.addSlider(
      "Position Z",
      moveZ,
      " ",
      0,
      3,
      0.01,
      onValueChange
    );
    positionGroup.addSlider(
      "Rotate Y",
      orientateY,
      " ",
      0,
      2 * Math.PI * 0.1,
      0,
      onValueChange
    );

    let selectors = positionGroup.selectors;
    //X
    let selectorX = selectors[0];
    selectorX.paddingTop = 0;
    selectorX.paddingBottom = 0;
    selectorX.fontFamily = "Courier";
    selectorX.fontSize = 11;
    selectorX.height = "35px";
    let selectorX_slider_label = selectorX.children[0];
    selectorX_slider_label.height = "15px";
    let selectorX_slider = selectorX.children[1];
    selectorX_slider.height = "18px";
    selectorX_slider.isThumbCircle = true;
    selectorX_slider.paddingTop = 0;
    selectorX_slider.paddingBottom = 0;

    //Z
    let selectorZ = selectors[1];
    selectorZ.paddingTop = 0;
    selectorZ.paddingBottom = 0;
    selectorZ.fontFamily = "Courier";
    selectorZ.fontSize = 11;
    let selectorZ_slider_label = selectorZ.children[0];
    selectorZ_slider_label.height = "15px";
    let selectorZ_slider = selectorZ.children[1];
    selectorZ_slider.height = "18px";
    selectorZ_slider.isThumbCircle = true;
    selectorZ_slider.thumbWidth = "15px";
    selectorZ_slider.paddingTop = 0;
    selectorZ_slider.paddingBottom = 0;
    selectorZ_slider.color = "#222";
    selectorZ_slider.shadowColor = "#ccc";
    selectorZ_slider.borderColor = "#000";

    //Y
    let selectorY = selectors[2];
    selectorY.paddingTop = 0;
    selectorY.paddingBottom = 0;
    selectorY.fontFamily = "Courier";
    selectorY.fontSize = 11;
    let selectorY_slider_label = selectorY.children[0];
    selectorY_slider_label.height = "15px";
    let selectorY_slider = selectorY.children[1];
    selectorY_slider.height = "18px";
    selectorY_slider.isThumbCircle = true;
    selectorY_slider.thumbWidth = "15px";
    selectorY_slider.paddingTop = 0;
    selectorY_slider.paddingBottom = 0;
    selectorY_slider.color = "#222";
    selectorY_slider.shadowColor = "#ccc";
    selectorY_slider.borderColor = "#000";
  };
  rxjsCallback(msg){
    console.log("rxjsCallback: adderGuiUtility..YES...but need a flag.:msg:",msg)
    //can I show hide the selectionPanel from HERE ? 
    //this.state.selectionPanel.isVisible = false; or true
   // console.log("props:",this.props)
   console.log("this.state look for selectionPanel...:",this.state);
    //THEN I NEED A FLAG ...
    if(msg.text === 'true'){
     // this.state.selectionPanel.isVisible = true; 
      //this is NOT re-showing the selectionPanel ? 
      console.log('msg is true');
      this.state.selectionPanel.isVisible = true;
    }else{
     // this.state.selectionPanel.isVisible = false; 
     console.log('msg is false...');
     this.state.selectionPanel.isVisible = false;
    }
}
  render() {
    const { messages } = this.state; 
    console.log("render() this.state",this.state);
    console.log("render() this.scope:",this.scope)

    return( 
    <Grid>  
      {/** rxjs map function requires some kind of html 
      {messages.map((message,index) => <div></div>),scope.rxjsCallback()}  */}
      
      {messages.map((message,index) => {scope.rxjsCallback(message)})}
  </Grid>)
  }
  ////////////////////////////////////////
}
export default AdderGuiUtility;
