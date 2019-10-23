import React from "react";
import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
//1
import { messageService } from "../_services";

import Grid from "@material-ui/core/Grid"; //

/*
TODO: Now it looks as though 1st I will/may need to store each meshwrappers new value in the state
of this guiLite class. Also, I will probably need to manage an array of these meshWrappers like 
I currently manage an array of selectionPanels.

*/

let scope;
let childScope;
class GuiLite extends React.Component {
  constructor(props) {
    super(props);
    console.log("guiLite-> PROPS:", this.props);
    //2
    this.state = {
      messages: [],
      array_selectionPanels: [],
      array_models: [],
      selectionPanel: {},
      currentModelParent: this.props.currentModelParent,
      scene: this.props.scene,
      advancedTexture: this.props.advancedTexture,
      currentModelParentName: this.props.currentModelParentName,
      callback_selectionPanel : this.props.callback_selectionPanel,
      y_previous: 0,
      z_previous: 0,
      x_previous: 0,
      group_name: "",
      u_scale: 0,
      v_scale: 0,
      u_offset: 0,
      v_offset: 0
    };
    scope = this;
    childScope = this;
    this.state.advancedTexture = this.props.advancedTexture;
    this.changeParentModel = this.changeParentModel.bind(this);
    this.remoteFunction = this.remoteFunction.bind(this);
  }

  remoteFunction(data) {
    /*
    IN: requires a 'method' as one of the data parameters.
    data.method
    data.currentModelParent
    data.currentModelParentName
    */
    if (data.method === "createSelectionPanel") {
      //1) remove all existing panels.
      this.disposeOfExistingPanels();
      //2)  then set array to empty.
      this.clearPanelsArray();
      //3) create the panel
      this.createSelectionPanel(data);
    }
  }
  disposeOfExistingPanels() {
    for (let sp of this.state.array_selectionPanels) {
      sp.dispose();
    }
  }
  clearPanelsArray() {
    this.state.array_selectionPanels = [];
  }
  createSelectionPanel(data) {
    let a_selection_panel = this.easy_selection_panel(
      scope.state.scene,
      scope.state.advancedTexture,
      data.currentModelParent,
      data.currentModelParentName,
      data.currentMeshWrapper,
      data.callback_selectionPanel
    );
    this.manageSelectionPanels(a_selection_panel);
  }

  manageModels(data) {
    var temp_array_models = this.state.array_models;
    temp_array_models.push(data);
    scope.setState(prevState => ({
      ...prevState,
      array_models: temp_array_models
    }));
  }

  manageSelectionPanels(a_selection_panel) {
    var temp_array_selectionPanels = this.state.array_selectionPanels;
    temp_array_selectionPanels.push(a_selection_panel);
    scope.setState(prevState => ({
      ...prevState,
      array_selectionPanels: temp_array_selectionPanels
    }));
  }

  //3
  componentDidMount() {
    console.log(
      "gLite: does GuiLite Mount ? in its present form? props:",
      this.props
    );
    this.props.get_gLiteScope(childScope);
    let scope = this;

    // subscribe to home component messages
    this.subscription = messageService.getMessage().subscribe(message => {
      if (message) {
        // add message to local state if not empty
        this.state.messages = [...this.state.messages, message];
      } else {
        // clear messages when empty message received
        this.state.messages = [];
      }
    });
    console.log("PROPS CHECK BEFORE PANEL:", this.props);
    //JUST THE INITIAL PANEL:
    let a_selection_panel = this.easy_selection_panel(
      this.state.scene,
      this.state.advancedTexture,
      this.state.currentModelParent,
      this.state.currentModelParentName,
      this.state.currentMeshWrapper
    );
    /*
      these inputs: props,props,state,props
      remote function inputs: scope,scope,data,data
    */

    this.manageSelectionPanels(a_selection_panel);
  }
  //4
  componentWillUnmount() {
    // unsubscribe to ensure no memory leaks: RXJS
    this.subscription.unsubscribe();
  }
  changeParentModel(modelParent) {
    console.log("guiLite: changeParentModel()");
    this.state.currentModelParent = modelParent;
    console.log("modelParent: ", modelParent);
    // DO I HAVE TO RE-RUN easy_selection_panel ?
    // console.log(typeof this.state);
    console.log("changeParent : state:");
    console.log(this.state);
    console.log("changeParent : props:");
    console.log(this.props);

    console.log(typeof this.state.advancedTexture);
    console.log(this.state.advancedTexture);
    /*
    if (this.state.advancedTexture != "undefined") {
      this.easy_selection_panel(
        this.state.scene,
        this.state.advancedTexture,
        modelParent,
        this.state.currentModelParentName
      );
    }
    */
  }
  //////////////////////////////////////////
  // GUI SELECTION PANEL
  easy_selection_panel = (
    scene,
    advancedTexture,
    modelParent,
    group_name,
    currentMeshWrapper,
    callback_selectionPanel
  ) => {
    console.log(
      "guiLite:easy_selection_panel(): currentMeshWrapper:",
      currentMeshWrapper
    );
    let data = {
      method: "manageModels",
      currentModelParent: modelParent,
      currentModelParentName: group_name,
      currentMeshWrapper: currentMeshWrapper
    };
    this.manageModels(data);

    if (advancedTexture != "undefined" && advancedTexture != undefined) {
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
      scope.modelParent = modelParent;
      var toSize = function(isChecked) {
        if (isChecked) {
          modelParent.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
        } else {
          modelParent.scaling = new BABYLON.Vector3(1, 1, 1);
        }
      };

      var orientateY = function(angle) {
        let val = displayValueN(angle);
        if (scope.y_previous > val) {
          modelParent.rotation.y = angle / 2;
        } else if (scope.y_previous < val) {
          modelParent.rotation.y = (-1 * angle) / 2;
        }
        scope.y_previous = val;
      };
      var orientateX = function(angle) {
        modelParent.rotation.x = angle;
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

      selectionPanel.width = 0.15;
      selectionPanel.height = 0.9;
      selectionPanel.horizontalAlignment =
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      selectionPanel.verticalAlignment =
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
      /* selectionPanel style */
      selectionPanel.fontSize = 11;
      selectionPanel.fontWeight = 600;
      selectionPanel.paddingTop = 35;
      selectionPanel.paddingLeft = 2;
      selectionPanel.paddingRight = 2;
      selectionPanel.paddingBottom = 2;
      selectionPanel.alpha = 0.7;
      selectionPanel.background = "#222";
      selectionPanel.barColor = "#4F7DF2";
      selectionPanel.color = "#FFFFFF";
      selectionPanel.labelColor = "#FFFFFF";
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
        modelParent.position.y = modelParent.position.y + val;
       
      };
      var displayValueN = function(value) {
        console.log("value:", value);
        return BABYLON.Tools.ToDegrees(value) | 0;
      };

      var moveX = function(val) {
        let x_max = 30;
        let x_min = -30;

        if (scope.x_previous > val) {
          //going down
          modelParent.position.x = val;
          if (val <= x_min) {
            modelParent.position.x = x_min;
            scope.x_previous = x_min;
          } else {
            scope.x_previous = val;
            scope.x_previous_pos = modelParent.position.x;
          }
        } else {
          //going up
          modelParent.position.x = val;
          if (val >= x_max) {
            modelParent.position.x = x_max;
            scope.x_previous = x_max;
          } else {
            scope.x_previous = val;
            scope.x_previous_pos = modelParent.position.x;
          }
        }
        scope.callback_selectionPanel(modelParent.absolutePosition)
      };

      var moveZ = function(val) {
        let z_max = 30;
        let z_min = -30;

        if (scope.z_previous > val) {
          //going down
          modelParent.position.z = val;
          if (val <= z_min) {
            modelParent.position.z = z_min;
            scope.z_previous = z_min;
          } else {
            scope.z_previous = val;
          }
        } else {
          //going up
          modelParent.position.z = val;
          if (val >= z_max) {
            modelParent.position.z = z_max;
            scope.z_previous = z_max;
          } else {
            scope.z_previous = val;
          }
        }
        let callbackData = {
          id:modelParent.id,
          absolutePosition:modelParent.absolutePosition
        }
        scope.callback_selectionPanel(modelParent.absolutePosition)
      };

      var scaleUV = function(val) {
        let meshWrapper = currentMeshWrapper;
        if (meshWrapper) {
          meshWrapper.setUOffset(scope.u_offset);
          meshWrapper.setVOffset(scope.v_offset);
          meshWrapper.setUScale(val);
          meshWrapper.setVScale(val);
          scope.u_scale = val;
          scope.v_scale = val;
          meshWrapper.reapplyTexture();
        }
      };
      var offsetU = function(val) {
        let meshWrapper = currentMeshWrapper;
        if (meshWrapper) {
          meshWrapper.setUOffset(val);
          meshWrapper.setVOffset(scope.v_offset);
          meshWrapper.setUScale(scope.u_scale);
          meshWrapper.setVScale(scope.v_scale);
          scope.u_offset = val;
          meshWrapper.reapplyTexture();
        }
      };
      var offsetV = function(val) {
        let meshWrapper = currentMeshWrapper;
        if (meshWrapper) {
          meshWrapper.setUOffset(scope.u_offset);
          meshWrapper.setVOffset(val);
          meshWrapper.setUScale(scope.u_scale);
          meshWrapper.setVScale(scope.v_scale);
          scope.v_offset = val;
          meshWrapper.reapplyTexture();
        }
      };
      var toDispose = function(isChecked) {
        if (isChecked) {
          selectionPanel.dispose();
        } else {
          console.log("fooeey");
        }
      };

      positionGroup.addSlider(
        "Position X",
        moveX,
        " ",
        -30,
        30,
        0,
        onValueChange
      );
      //addSlider(label: string, func?: function, unit?: string, min?: number, max?: number, value?: number, onValueChange?: function): void
      positionGroup.addSlider(
        "Position Z",
        moveZ,
        " ",
        -30,
        30,
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
      positionGroup.addSlider("Scale", scaleUV, " ", 0, 3, 0, onValueChange);
      positionGroup.addSlider("Offset U", offsetU, " ", 0, 3, 0, onValueChange);
      positionGroup.addSlider("Offset V", offsetV, " ", 0, 3, 0, onValueChange);

      //Position Group Styling:
      positionGroup._groupHeader.color = "White";

      let selectors = positionGroup.selectors;
      console.log("the selectors:", selectors);
      //X
      let selectorX = selectors[0];
      styleSelector(selectorX);
      //Z
      let selectorZ = selectors[1];
      styleSelector(selectorZ);
      //Y
      let selectorY = selectors[2];
      styleSelector(selectorY);
      //uv_scale
      let selectorUVScale = selectors[3];
      styleSelector(selectorUVScale);
      //u_offset
      let selectorUOffset = selectors[4];
      styleSelector(selectorUOffset);
      //v_offset
      let selectorVOffset = selectors[5];
      styleSelector(selectorVOffset);

      function styleSelector(selector) {
        selector.paddingTop = "0px";
        selector.paddingBottom = "0px";
        selector.fontFamily = "Courier";
        selector.fontSize = 10;

        selector.height = "30px";
        let selector_slider_label = selector.children[0];
        selector_slider_label.height = "10px";
        selector_slider_label.marginTop = "0px";
        selector_slider_label.paddingTop = "0px";
        selector_slider_label.marginBottom = "0px";
        selector_slider_label.paddingBottom = "0px";
        selector_slider_label.marginLeft = "0px";
        selector_slider_label.paddingLeft = "0px";
        let selector_slider = selector.children[1];
        selector_slider.height = "13px";
        selector_slider.isThumbCircle = true;
        selector_slider.isThumbClamped = true;
        selector_slider.displayThumb = false;
        selector_slider.step = 0.01;
        selector_slider.thumbWidth = "10px";
        selector_slider.paddingTop = "0px";
        selector_slider.paddingBottom = "0px";
        selector_slider.paddingLeft = "0px";
        selector_slider.marginLeft = "0px";
        selector_slider.color = "#bbb";
        selector_slider.shadowColor = "#ccc";
        selector_slider.borderColor = "#000";
        selector_slider.width = 0.75;
      }
      return selectionPanel;
    }
  };

  rxjsCallback(msg) {
    if (msg.text === "true") {
      this.state.selectionPanel.isVisible = true;
    } else if (msg.text === "false") {
      this.state.selectionPanel.isVisible = false;
    } else if (msg.text === "clear") {
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
