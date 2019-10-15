import React from "react";
import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
//1
import { messageService } from "../_services";

import Grid from "@material-ui/core/Grid"; //
let scope;
class GuiLite extends React.Component {
  constructor(props) {
    super(props);
    //2
    this.state = {
      messages: [],
      selectionPanel: {},
      mesh: {},
      y_previous: 0,
      z_previous: 0,
      z_previous_pos: 0,
      x_previous: 0,
      group_name: ""
      //isRaining:props.isRaining,
    };
    scope = this;
    //this.moveX = this.moveX.bind(this);
    console.log("PROPS:", props);
  }
  //3
  componentDidMount() {
    console.log("does GuiLite Mount ? in its present form?");

    let scope = this;
    // subscribe to home component messages
    this.subscription = messageService.getMessage().subscribe(message => {
      if (message) {
        // add message to local state if not empty
        // this.setState({ messages: [...this.state.messages, message] });
        this.state.messages = [...this.state.messages, message];
      } else {
        // clear messages when empty message received
        // this.setState({ messages: [] });
        this.state.messages = [];
      }
    });
  }
  //4
  componentWillUnmount() {
    // unsubscribe to ensure no memory leaks: RXJS
    this.subscription.unsubscribe();
  }

  //////////////////////////////////////////
  // GUI SELECTION PANEL
  easy_selection_panel = (scene, advancedTexture, mesh, group_name) => {
    console.log("GuiLite.js:easy_selection_panel():mesh:", mesh);
    this.state.group_name = group_name;
    // RXJS: subscribe to home component messages
    this.subscription = messageService.getMessage().subscribe(message => {
      if (message) {
        // add message to local state if not empty
        //this.setState({ messages: [...this.state.messages, message] });
        this.state.messages = [...this.state.messages, message];
      } else {
        // clear messages when empty message received
        this.setState({ messages: [] });
        this.state.messages = [];
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
        mesh.rotation.y = angle / 2;
      } else if (scope.y_previous < val) {
        mesh.rotation.y = (-1 * angle) / 2;
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
      return " ";
    };

    var transformGroup = new BABYLON.GUI.CheckboxGroup("Transformation");
    transformGroup.addCheckbox("Small", toSize);

    var positionGroup = new BABYLON.GUI.SliderGroup(group_name, "S");
    console.log(
      "What is inside the positionGroup: ie. sliderGroup?",
      positionGroup
    );

    var selectionPanel = new BABYLON.GUI.SelectionPanel(group_name, [
      positionGroup
    ]);
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

    advancedTexture.addControl(this.state.selectionPanel);
    console.log("advancedTexture:", advancedTexture);

    var moveY = function(val) {
      mesh.position.y = mesh.position.y + val;
    };
    var displayValueN = function(value) {
      console.log("value:", value);
      return BABYLON.Tools.ToDegrees(value) | 0;
    };

    var moveX = function(val) {
      let x_max = 10;
      let x_min = -10;
      /* max and min must be in sync with :
    selectorx_slider.maximum = 10;
    selectorx_slider.minimum = -10;
    and parameters in 'addSlider' method.
    */
      if (scope.x_previous > val) {
        //going down
        mesh.position.x = val;
        if (val <= -10) {
          mesh.position.x = -10;
          scope.x_previous = x_min;
        } else {
          scope.x_previous = val;
          scope.x_previous_pos = mesh.position.x;
        }
      } else {
        //going up
        mesh.position.x = val;
        if (val >= 10) {
          mesh.position.x = 10;
          scope.x_previous = x_max;
        } else {
          scope.x_previous = val;
          scope.x_previous_pos = mesh.position.x;
        }
      }
    };

    var moveZ = function(val) {
      let z_max = 10;
      let z_min = -10;
      /* max and min must be in sync with :
      selectorZ_slider.maximum = 10;
      selectorZ_slider.minimum = -10;
      and parameters in 'addSlider' method.
      */
      if (scope.z_previous > val) {
        //going down
        mesh.position.z = val;
        if (val <= -10) {
          mesh.position.z = -10;
          scope.z_previous = z_min;
        } else {
          scope.z_previous = val;
          scope.z_previous_pos = mesh.position.z;
        }
      } else {
        //going up
        mesh.position.z = val;
        if (val >= 10) {
          mesh.position.z = 10;
          scope.z_previous = z_max;
        } else {
          scope.z_previous = val;
          scope.z_previous_pos = mesh.position.z;
        }
      }
    };

    positionGroup.addSlider(
      "Position X",
      moveX,
      " ",
      -10,
      10,
      0,
      onValueChange
    );
    //addSlider(label: string, func?: function, unit?: string, min?: number, max?: number, value?: number, onValueChange?: function): void
    positionGroup.addSlider(
      "Position Z",
      moveZ,
      " ",
      -10,
      10,
      0,
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

    //Position Group Styling:
    positionGroup._groupHeader.color = "White";

    let selectors = positionGroup.selectors;
    //X
    let selectorX = selectors[0];
    styleSelector(selectorX);

    //Z
    let selectorZ = selectors[1];
    styleSelector(selectorZ);

    //Y
    let selectorY = selectors[2];
    styleSelector(selectorY);

    function styleSelector(selector) {
      selector.paddingTop = 0;
      selector.paddingBottom = 0;
      selector.fontFamily = "Courier";
      selector.fontSize = 11;
      let selector_slider_label = selector.children[0];
      selector_slider_label.height = "15px";
      let selector_slider = selector.children[1];
      selector_slider.height = "18px";
      selector_slider.isThumbCircle = true;
      selector_slider.isThumbClamped = true;
      selector_slider.displayThumb = false;
      selector_slider.step = 0.01;
      selector_slider.thumbWidth = "15px";
      selector_slider.paddingTop = 0;
      selector_slider.paddingBottom = 0;
      selector_slider.color = "#222";
      selector_slider.shadowColor = "#ccc";
      selector_slider.borderColor = "#000";
    }
  };

  rxjsCallback(msg) {
    console.log("this:", this);
    console.log("this.props:", this.props);
    if (msg.text === "true") {
      //console.log("msg is true");
      // if (this.props.activePanelName === this.state.group_name) {
      this.state.selectionPanel.isVisible = true;
      console.log(this.state.group_name);
      console.log("visible");
      console.log("activate?");
      // }
    } else if (msg.text === "false") {
      // if (this.props.activePanelName === this.state.group_name) {
      // console.log("msg is false...");
      this.state.selectionPanel.isVisible = false;
      console.log(this.state.group_name);
      console.log("invisible");
      console.log("deactivate?");
      // }
    } else if (msg.text === "clear") {
      //call clear from pickableWindow method in main
      //HOW TO REMOVE A selectionPanel
      console.log(" CLEAR AND DISPOSE ???? ");
      this.state.selectionPanel.dispose();
    } else {
      console.log("getting an invalid message sent via rxjsCallback.");
    }
  }
  render() {
    const { messages } = this.state;
    return (
      <Grid>
        {messages.map((message, index) => {
          scope.rxjsCallback(message);
        })}
      </Grid>
    );
  }
}
export default GuiLite;
