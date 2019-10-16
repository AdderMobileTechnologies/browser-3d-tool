import React from "react";
import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
//1
import { messageService } from "../_services";

import Grid from "@material-ui/core/Grid"; //
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
      mesh: this.props.currentModelParent,
      currentModelParent: this.props.currentModelParent,
      scene: this.props.scene,
      advancedTexture: this.props.advancedTexture,
      currentModelParentName: this.props.currentModelParentName,
      y_previous: 0,
      z_previous: 0,
      z_previous_pos: 0,
      x_previous: 0,
      group_name: ""
      //isRaining:props.isRaining,
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
    data[0].method
    data[1].currentModelParent
    data[2].currentModelParentName


    */
    console.log("WHY DOESNT THIS FAIL AS EXPECTED?");
    console.log(data.method);

    /*
    //remote function to be called from and by the Parent component.
    console.log(" in gLite: remoteFunction(data) ", data);
    console.log(
      "scope.state. has the parameters I want...for selection Panel  but the currentModelParent is out of date. "
    );
    console.log("scope:", scope);

    // CHECK if a panel already exists with that name just set it to visible instead of creating a new one.
    // -loop through existing panels get true or false, a match.

    // THIS DOES NOTE EVVEN GET CALLED WHEN THE MODEL IS CLICKED ON.ie. opening the image editor.

    console.log("lookign form match :", data.currentModelParent.name);
    let result = this.matchExistingPanels(data.currentModelParent.name);
    console.log("RESULT: ", result);
    if (result) {
      console.log("THERE WAS   MATCH WE NEED TO SHOW EXISTING.");
      //hide all then show the matching panel.
      this.showExistingMatch(data.currentModelParent.name);
    } else {
      console.log("THERE WAS NOT A MATCH WE NEED TO Make a panel.");
      let a_selection_panel = this.easy_selection_panel(
        scope.state.scene,
        scope.state.advancedTexture,
        data.currentModelParent,
        data.currentModelParent.name
      );
      this.manageSelectionPanels(a_selection_panel);
    }*/
    //dev test: only run what looks like necessary code for loading a new model and it's panel.
    //result: everything still works as expected.
    console.log("the .-.-.data:", data);
    if (data.method === "createSelectionPanel") {
      console.log(
        "Is mesh undefined: data.currentModelParent",
        data.currentModelParent
      );
      this.createSelectionPanel(data);
      // let a_selection_panel = this.easy_selection_panel(
      //   scope.state.scene,
      //   scope.state.advancedTexture,
      //   data[1].currentModelParent,
      //   data[2].currentModelParentName
      // );
    }

    if (data.method === "checkExistingPanels") {
      let match = this.matchExistingPanels(data.currentModelParentName);
      if (match) {
        //IF find MAtch for ... data[2].currentModelParentName  just  SHOW panel and hide all others.
        this.showExistingMatch(data.currentModelParentName);
      } else {
        //ELSE create a new panel.
      }
    }

    if (data.method === "clearExistingPanelsAddThisOne") {
      //1) remove all existing panels.
      //ie. loop and dispose()
      this.disposeOfExistingPanels();
      //2)  then set array to empty.
      this.clearPanelsArray();
      //3) then call 'createSelectionPanel' with the data.
      this.createSelectionPanel(data);
    }
  }
  disposeOfExistingPanels() {
    for (let p of this.state.array_selectionPanels) {
      p.dispose();
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
      data.currentModelParentName
    );
    console.log("INFINITE: manageSelectionPanels");
    //===>INFINITE LOOP: HERE:?:
    this.manageSelectionPanels(a_selection_panel);
    //this.manageModels(data);
  }

  manageModels(data) {
    console.log("MANAGE MODELS NEEDS TO GET CALLED FOR EVERY MODEL.");
    var temp_array_models = this.state.array_models;
    temp_array_models.push(data);
    scope.setState(prevState => ({
      ...prevState,
      array_models: temp_array_models
    }));
  }

  manageSelectionPanels(a_selection_panel) {
    // I THINK: the only thing that needs to happen here is to save the sp into an array to manage it.
    var temp_array_selectionPanels = this.state.array_selectionPanels;
    temp_array_selectionPanels.push(a_selection_panel);
    scope.setState(prevState => ({
      ...prevState,
      array_selectionPanels: temp_array_selectionPanels
    }));
  }
  matchExistingPanels(currentModelParentName) {
    var temp_array_selectionPanels = this.state.array_selectionPanels;
    //set all existing selection panels isVisible to false:
    console.log("currentModelParentName is:", currentModelParentName);

    for (let sp of temp_array_selectionPanels) {
      if (sp.name === currentModelParentName) {
        //console.log("a match!");

        return true;
      } else {
        //console.log("no match.");
        return false;
      }
    }
  }

  showExistingMatch(existing_name) {
    var temp_array_selectionPanels = this.state.array_selectionPanels;
    //set all existing selection panels isVisible to false:
    console.log("showExistingMatch: existing_name:", existing_name);

    // TEMP : commment out temporarily to see if the other panels ARE getting hidden.
    for (let sp of temp_array_selectionPanels) {
      if (sp.name === existing_name) {
        console.log("showExistingMatch:SHOW:  ", sp.name);
        sp.isVisible = true;
        console.log("What does the current sp look like:sp:", sp);
        // I commented out the following loop.
        /*
        for (let data of this.state.array_models) {
          console.log(
            "should be recreating a panel for the matching model.......IT IS ONLY FINDING the staion wagon. so the first model NEVER go saved into the array."
          );
          console.log("data is ", data);
          if (data.currentModelParentName === existing_name) {
            console.log("INFINITE: createSelectionPanel");
            //====>>> INFINITE:
            this.createSelectionPanel(data);
            
          }
        }
        */

        //when it was visible it was still underneath the 'should have been hidden' one.
      } else {
        console.log("showExistingMatch:HIDE:DISPOSE: POP: sp:", sp);
        sp.dispose(); //keep sp.dispose() HERE
        temp_array_selectionPanels.pop();
        //correct
      }
    }
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
      this.state.currentModelParent.name
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
  easy_selection_panel = (scene, advancedTexture, mesh, group_name) => {
    //should I call this every time a model is loaded to keep it up to date?
    // NO EFFECT: this.props.get_gLiteScope(childScope);
    //this.manageModels(data); model, and modelName
    //uh oh, infinite loop on selection of billboard mesh.
    //=>
    let data = {
      method: "manageModels",
      currentModelParent: mesh,
      currentModelParentName: mesh.name
    };
    this.manageModels(data);
    //now 1) prevent it from getting called twice ? and 2) Do I need to manage the panel array as well at this point. ?
    if (advancedTexture != "undefined" && advancedTexture != undefined) {
      console.log("GuiLite.js:easy_selection_panel():mesh:", mesh);
      console.log("WTF: advancedTexture:", advancedTexture);
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
      var toDispose = function(isChecked) {
        if (isChecked) {
          selectionPanel.dispose();
        } else {
          console.log("fooeey");
        }
      };
      // FAILS TO ADD CHECKBOX ::: ???? positionGroup.addCheckbox("close", toDispose);
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
      return selectionPanel;
    }
  };

  rxjsCallback(msg) {
    console.log("this:", this);
    console.log("rxjsCallback this.props:", this.props);
    if (msg.text === "true") {
      //console.log("msg is true");
      // if (this.props.activePanelName === this.state.group_name) {
      this.state.selectionPanel.isVisible = true;
      console.log(this.state.group_name);
      console.log("state data at rxjs callback point:");
      console.log(this.state);
      console.log("visible");
      console.log("activate?");
      //this.easy_selection_panel()
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
        <p>DO I GET PROPS OR NOT? </p>
        {console.log("render():props:", this.props)}
        {messages.map((message, index) => {
          scope.rxjsCallback(message);
        })}
      </Grid>
    );
  }
}
export default GuiLite;
