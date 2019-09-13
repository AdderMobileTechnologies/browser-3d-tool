import React from "react";
import BABYLON from "babylonjs";
import SidebarSelectorBillboards from "./subcomponents/_sidebarSelectorBillboards";
import SidebarSelectorVehicles from "./subcomponents/_sidebarSelectorVehicles";
import IconControlGroup from "./subcomponents/_iconControlGroup";
import OverlayControls from "./subcomponents/_overlayControls";

// import * as GUI from "babylonjs-gui";
import Grid from "@material-ui/core/Grid"; //
//models
import AdderCamera from "../models/adderCamera";

import DraggableDialog from "./MUI_DraggableDialog";
import Designer from "./designer";
////////////////////////////////////////////
//import { Scene } from "babylonjs";
import AdderSceneWrapper from "../models/adderSceneWrapper";
//import Grid from "@material-ui/core/Grid"; //
import AdderLogoAndName from "../assets/Adder_3D_Tool2/AdderLogoTransparent.png";
import "tui-image-editor/dist/tui-image-editor.css";
import AdderImageEditor from "./AdderImageEditor";
import AdderSkyBox from "../models/adderSkybox";
import AdderMeta from "../models/adderMeta";
import AdderAsset from "../models/adderAsset";
import UIButton from "./subcomponents/elements/UIButton";
import MUI_AlertDialog from "./subcomponents/MUI_AlertDialog";
//////////////////////////////////////////

//TODO: NEED TO REMOVE GrayCar ASSET AND REPLACE WITH OUR OWN IMAGE!!!!!

import "./minimum.css";
import "./Main.css";
import GrayCar from "../assets/Adder_3D_Tool2/carMeshSelectorTransparent.png";
import Billboard from "../assets/Adder_3D_Tool2/billboardTopView.png";
import { makeStyles } from "@material-ui/core/styles";

import * as K from "../constants"; // Required for GridList ( screenshots)
import UITextInput from "./subcomponents/elements/UITextInput";
let scope;
let scp;
const UIGridList = K.UIGridList;
//region: Render Methods

class Main extends React.Component {
  constructor(props) {
    super(props);
    scp = this;

    this.state = {
      scene: {},
      sceneIsSet: false,
      engine: null,
      camera: null,
      images: [],
      adderSceneWrapper: {},
      selected_mesh_id: "",
      meta_data: {},
      startEditing: false,
      editing_mesh_id: "empty mesh",
      last_dataURL: "empty dataURL",
      selected_ad_type: -1,
      hoodMeshId: null,
      leftMeshId: null,
      roofMeshId: null,
      rightMeshId: null,
      trunkMeshId: null,
      sign1MeshId: null,
      sign2MeshId: null,
      userSession: {
        userInfo: [],
        userModel: {
          user_id: "",
          username: ""
        },
        designs: [],
        designModel: {
          designName: "Brand New Design Name",
          adTypeFilepath: "",
          environment: "",
          environment_type: "",
          environmentFilepath:
            "InDevelopmentAddDataForEnvironmemntNameOrREmove....",
          meshes: [],
          screenShots: [],
          ui_selections: {},
          ui_status: {},
          action: ""
        }
      },
      tileData: [],
      userAction: {
        deleteSure: false
      },
      actions: [],
      undos: [],
      redos: []
    };

    this.setUp = this.setUp.bind(this);
    this.getAdderSceneWrapper = this.getAdderSceneWrapper.bind(this);

    this.screenshotButtonPress = this.screenshotButtonPress.bind(this);
    this.saveScreenshot = this.saveScreenshot.bind(this);
    this.save_UIAction = this.save_UIAction.bind(this);

    scope = this;
  }

  resetUserSession() {
    this.setState({
      userSession: {
        userInfo: [],
        userModel: {
          user_id: "",
          username: ""
        },
        designs: [],
        designModel: {
          designName: "Brand New Design Name",
          adTypeFilepath: "",
          environment: "",
          environment_type: "",
          environmentFilepath:
            "InDevelopmentAddDataForEnvironmemntNameOrREmove....",
          meshes: [],
          screenShots: [],
          ui_selections: {},
          ui_status: {},
          action: ""
        }
      }
    });
  }

  iconUndo() {
    console.log("iconUndo");
    //TODO:
    /*
      - get the last action 
      - based on  what type of action it was perform the inverse action.
      - #change name 
      - ! unapply texture 
        to un apply texture: 
          - mesh_id 
          - model 
          - access to adderSceneWrapper (?)
    */
    let old_actions = JSON.parse(localStorage.getItem("actions_array")) || [];

    if (old_actions.length > 0) {
      let lastIndex = old_actions.length - 1;
      let lastAction = null;
      for (let i in old_actions) {
        if (i == lastIndex) {
          lastAction = old_actions[i];
        }
      }

      switch (lastAction.action) {
        case "change_name":
          scope.undo_UITextInput(lastAction);
          scope.setState(prevState => ({
            ...prevState,
            userSession: {
              ...prevState.userSession,
              designModel: {
                ...prevState.userSession.designModel,
                designName: lastAction.from
              }
            }
          }));

          break;
        case "applyTextureToMesh":
          scope.undo_ApplyTextureToMesh(lastAction);
          break;
        case "screenshot":
          scope.undo_screenshot(lastAction);
          break;
        default:
          console.log("no match for action: ", lastAction.action);
          break;
      }
    }
    //END IF
  }
  undo_screenshot(args) {
    console.log("undo_screenshot args:", args);
    //TODO: get id of the 'from' screenshot, then look up its image data and delete it from state if there
    // pop it off the actions localStorage...
    if (
      args.from != "" &&
      args.from != "empty dataURL" &&
      typeof args.from != "undefined"
    ) {
      //code here if a screen shot exists  to be undone...
      console.log("undo the screen shot"); //img id last on the state.. img_1568406045575 is the same as the current image to undo.
      // so pop last one of state and replace it.
      // save the popped one in an array for 'redo' of screenshots.....
      const array_image_models = scope.state.images.slice();
      console.log("the current state images ", array_image_models);
      var popped_image_model = array_image_models.pop();
      //then set back to
      scope.setState(
        prevState => ({
          ...prevState,
          images: array_image_models
        }),
        () => {
          console.log("confirm that the last one was popped off."); //img_1568406952023 from 6 to 5
          console.log(scope.state.images); // confirmed
        }
      );
      // THEN pop it off localstorage as well and save it in a redo array for images too ?...

      /////   THIS MIGHT BE REDUNDANT ..... create a single function for removing the last action ?
      let old_action_arrays =
        JSON.parse(localStorage.getItem("actions_array")) || [];
      if (old_action_arrays.length > 0) {
        // can remove it
        old_action_arrays.pop();
        //localStorage.setItem
        localStorage.setItem(
          "actions_array",
          JSON.stringify(old_action_arrays)
        );
        // WHILE it was successfully removed from state and localStorage , it STILL exists in the 'tileData'.
        const currentTileDataArray = scope.state.tileData.slice();
        currentTileDataArray.pop();
        scope.setState(
          prevState => ({
            ...prevState,
            tileData: currentTileDataArray
          }),
          () => {
            console.log(
              "confirm that screen shot was removed from tile data....still may need to save it  for REDO functionality....."
            );
          }
        );
      } else {
        // nothing to remove
        console.log(
          "no more actions to remove from within the screenshots undo code. "
        );
      }
    }
  }

  undo_ApplyTextureToMesh(args) {
    console.log("  undo_ApplyTextureToMesh(args) args:", args);
    if (
      args.from != "" &&
      args.from != "empty dataURL" &&
      typeof args.from != "undefined"
    ) {
      this.state.adderSceneWrapper.applyTextureToMesh(args.id, args.from);
      this.setState({
        startEditing: false,
        last_dataURL: args.from
      });
    }
  }

  undo_UITextInput(args) {
    let old_actions = JSON.parse(localStorage.getItem("actions_array")) || [];
    let poppedElement = old_actions.pop();
    localStorage.setItem("actions_array", JSON.stringify(old_actions));
    scope.setState(prevState => ({
      ...prevState,
      userSession: {
        ...prevState.userSession,
        designModel: {
          ...prevState.userSession.designModel,
          designName: poppedElement.from
        }
      }
    }));
  }
  save_UIAction(_id, _action, _to, _from) {
    let action_object = {};
    action_object.id = _id;
    action_object.action = _action;
    action_object.to = _to;
    action_object.from = _from;
    let old_actions = JSON.parse(localStorage.getItem("actions_array")) || [];
    //push to local storage:
    old_actions.push(action_object);
    localStorage.setItem("actions_array", JSON.stringify(old_actions));
  }
  /**
   *  NEXT SAVE THE APPLICATION OF TEXTURE TO A MESH 
   *   scope.save_UIAction("select_mesh", "toMesh", "fromMesh");
        // let newName = scope.state.userSession.designModel.designName;
        // scope.save_UIAction("change_name", newName, oldName);
        //imageEditorCallback
   */
  subCallback(args) {
    console.log("subCallback with args:", args);
  }

  getAdderSceneWrapper() {
    return this.state.adderSceneWrapper;
  }

  setUp() {
    let adderMeta = new AdderMeta(this.state.adderSceneWrapper);
    adderMeta.getEnvironment();
    let scene = this.state.scene;
    let adderSkybox = new AdderSkyBox(scene, "countrybox", 1000.0);
    adderSkybox.getSkybox();
  }
  saveScreenshot() {
    let design_obj = this.state.userSession.designModel;

    //const obj = {'design': design_obj};
    const newDesignsArray = this.state.userSession.designs.slice();
    newDesignsArray.push(design_obj); // Push the object
    this.setState(
      prevState => ({
        ...prevState,
        userSession: {
          ...prevState.userSession,
          designs: newDesignsArray
        }
      }),
      () => {
        //note: saves the entire 'userSession'
        let oldDesigns = JSON.parse(localStorage.getItem("designsArray")) || [];
        let newDesign = this.state.userSession.designModel;
        //push to local storage:
        oldDesigns.push(newDesign);
        localStorage.setItem("designsArray", JSON.stringify(oldDesigns));
        // save action here as well (?)
        //probably should just be the sreenshots not the entire state, that should be only on the 'save' disk icon.

        //let newName = scope.state.userSession.designModel.designName;
        // scope.save_UIAction("id_null", "screenshot", newName, oldName);
      }
    );
  }

  sidebarButtonClickAlt(args) {
    console.log("Main:sidebarButtonClickAlt(args):", args);
    //Purpose: save new mesh to array of meshes in state
    const obj = { mesh_name: args.name };
    const newArray = scp.state.userSession.designModel.meshes.slice(); // Create a copy
    newArray.push(obj);

    scp.setState(
      prevState => ({
        ...prevState,
        userSession: {
          ...prevState.userSession,
          designModel: {
            ...prevState.userSession.designModel,
            meshes: newArray,
            action: "sidebarButtonClickAlt"
          }
        }
      }),
      () => {
        //new_actions_array;
        // ALL THIS IS , IS the selection of a mesh and the opening of the image editor , no real change happends.
      }
    );

    scope.windowCallbackPickable(args.name);
  }

  imageEditorCallback = dataURL => {
    console.log(
      "Main:imageEditorCallback():editing_mesh_id:",
      this.state.editing_mesh_id
    );
    this.state.adderSceneWrapper.applyTextureToMesh(
      this.state.editing_mesh_id,
      dataURL
    );
    this.setState({
      startEditing: false,
      last_dataURL: dataURL
    });
    scope.save_UIAction(
      this.state.editing_mesh_id,
      "applyTextureToMesh",
      dataURL,
      this.state.last_dataURL
    );
  };

  windowCallbackPickable(mesh_id) {
    // Usage: Editing-Mesh
    this.setState(
      {
        startEditing: true,
        editing_mesh_id: mesh_id
      },
      () => {
        console.log("editing mesh id:", mesh_id);
      }
    );
  }
  // To hide or show the appropriate sidebar image and controls
  callback_designer(args = null, adderAsset = null) {
    if (args === "-1") {
      scope.setState({ selected_ad_type: "-1" }); // reset ad type
    }
    if (args === "0") {
      scope.setState({ selected_ad_type: "0" }); //vehicle
    }
    if (args === "1") {
      scope.setState({ selected_ad_type: "1" }); //billboard
    }
    if (!(adderAsset instanceof AdderAsset)) {
      console.log("NOT AN ADDER ASSET yet....");
    } else {
      let assetData = adderAsset.getBehavior();
      //strategy:SELECT:parameters:pickableMeshes
      let pickableMeshes = assetData[1]["parameters"]["pickableMeshes"];

      //USAGE: Sidebar-Selection
      let selectableMeshes = [];
      let hoodMeshId = null,
        leftMeshId = null,
        roofMeshId = null,
        rightMeshId = null,
        trunkMeshId = null;

      let sign1MeshId = null,
        sign2MeshId = null;
      for (let i in pickableMeshes) {
        let pickableMesh = pickableMeshes[i];
        let splitData = pickableMesh.split("_");
        console.log("splitData:", splitData);
        console.log("think interms of future for other ad types....");
        // ["billboard", "2sides", "angled", "sign", "1"]
        // vs
        //["vehicle", "2door", "sportscar", "leftside", "medium"]
        if (splitData[0] === "vehicle") {
          switch (splitData[3]) {
            case "leftside":
              leftMeshId = pickableMesh;
              break;
            case "rightside":
              rightMeshId = pickableMesh;
              break;
            case "hood":
              hoodMeshId = pickableMesh;
              break;
            case "roof":
              roofMeshId = pickableMesh;
              break;
            case "trunk":
              trunkMeshId = pickableMesh;
              break;

            default:
              break;
          }
        }
        if (splitData[0] === "billboard") {
          if (splitData[1] === "2sides") {
            if (splitData[2] === "angled") {
              if (splitData[3] === "sign") {
                switch (splitData[4]) {
                  case "1":
                    console.log("billbaord sign 1");
                    sign1MeshId = pickableMesh;
                    console.log(sign1MeshId);
                    break;
                  case "2":
                    console.log("billboard sign 2");
                    sign2MeshId = pickableMesh;
                    console.log(sign2MeshId);
                    break;
                  default:
                    break;
                }
              }
            }
          }
        }
      }
      scope.setState({
        hoodMeshId: hoodMeshId,
        leftMeshId: leftMeshId,
        roofMeshId: roofMeshId,
        rightMeshId: rightMeshId,
        trunkMeshId: trunkMeshId,
        sign1MeshId: sign1MeshId,
        sign2MeshId: sign2MeshId
      });

      /**
       * AdderSceneWrapper:this.applyTextureToMesh:  
         adderMeshWrapper.js:124 
         AdderMeshWrapper:applyTextureFromDataURL() line 125

       */
      // - checked that hidden uses "isVisible", - change var to let in adderMeshWrapper apply mesh code..., - tex texture appears to have _buffer with correct image data.
      // - ROADBLOCKED ! NOT able to apply Texture to rightside of porsche ?
    }
  }
  callback_withModelInfo(info) {
    //Lets me 'name' the 'model' being used by it's 'filepath' so it can be referenced when deleting a design.
    scope.setState({ modelName: info.filepath });
  }
  screenshotButtonPress(evt) {
    console.log("- - - - screenshotButtonPress :evt:", evt);
    let engine = this.state.engine; //was embedded under Ad_Scene in version 1
    let camera = this.state.camera;
    let stateScope = this.state;
    let that = this;

    function addScreenshot(src) {
      let image_uid = "img_" + Date.now();

      let image_model = {
        id: image_uid,
        name: "",
        data: src,
        url: "",
        filename: "",
        usage: "screenshot"
      };

      const array_image_models = that.state.images.slice();

      console.log("array of images from state:");
      console.log("array_image_models:", array_image_models);
      //  IF array_image_models.length > 0  DO STUFF    ELSE  do NOT UNDO.
      console.log("array_image_models length");
      console.log(array_image_models.length);
      if (array_image_models.length > 0) {
        let lastIndex = array_image_models.length - 1;
        let from_Screenshot = array_image_models[lastIndex];

        console.log("from_Screenshot:", from_Screenshot);
        scope.save_UIAction(
          image_model.id,
          "screenshot",
          image_model,
          from_Screenshot.id
        );
      } else {
        scope.save_UIAction(
          image_model.id,
          "screenshot",
          image_model,
          "empty screenshot"
        );
      }

      console.log("image_model:", image_model);
      array_image_models.push(image_model);
      that.setState(
        prevState => ({
          ...prevState,
          images: array_image_models
        }),
        () => {
          const obj = { image_id: image_uid, src: "" };
          console.log("");
          const array_image_models = that.state.userSession.designModel.screenShots.slice(); // Create a copy
          array_image_models.push(obj);

          that.setState(
            prevState => ({
              ...prevState,
              userSession: {
                ...prevState.userSession,
                designModel: {
                  ...prevState.userSession.designModel,
                  action: "screenshot",
                  screenShots: array_image_models
                }
              }
            }),
            () => {
              //SAVE CHANGE ACTION
              //======>>>>>> OLD WAY   that.saveScreenshot();
              // that.save_UIAction();
            }
          );

          // we need to get the current array of tileData  push to copy of it   and redefine it
          that.setState(prevState => ({
            ...prevState,
            tileData: {
              ...prevState.tileData
            }
          }));

          let tileDataObject = {
            id: image_uid,
            key: image_uid,
            img: src,
            title: image_uid,

            cols: 2
          };

          const newTileDataArray = that.state.tileData.slice();
          newTileDataArray.push(tileDataObject);
          that.setState(
            prevState => ({
              ...prevState,
              tileData: newTileDataArray
            }),
            () => {}
          );
        }
      );
    }

    BABYLON.Tools.CreateScreenshot(
      engine,
      camera,
      { width: 274, height: 222 },
      function(data) {
        let img = document.createElement("img");
        img.src = data;

        addScreenshot(img.src);
      }
    );
  } //
  componentDidMount() {
    let scope = this;
    let canvas = document.getElementById("adder_3dTool_canvas");
    let engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true
    });
    this.setState({ engine: engine });

    let createScene = function(scp) {
      let scene = new BABYLON.Scene(engine);
      //manifest flag for babylon.manifest files.
      BABYLON.Database.IDBStorageEnabled = true;
      //build the camera.
      const cameraOptions = {
        lowerAlphaLimit: -Math.PI,
        upperAlphaLimit: Math.PI,
        lowerBetaLimit: 0,
        upperBetaLimit: Math.PI / 2.2,
        lowerRadiusLimit: 5,
        upperRadiusLimit: 200,
        useAutoRotationBehavior: false,
        attachControl: true
      };
      let adderCam_arcRotate = new AdderCamera(
        canvas,
        "ArcRotateCamera",
        "AdderCam_One",
        Math.PI / 4,
        Math.PI / 4,
        30,
        BABYLON.Vector3.Zero(),
        scene,
        true,
        cameraOptions
      );
      let camera = adderCam_arcRotate.getCamera();

      scp.setState({ camera: camera });
      camera.attachControl(canvas, true); //add camera to the scene/canvas
      //create a light
      //let light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
      //let light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(0, 2, 5), scene);
      //let light = new BABYLON.SpotLight("spotLight", new BABYLON.Vector3(0, 10, -10), new BABYLON.Vector3(4, -1, 5), Math.PI/2, 2, scene);
      //light.intensity = 2;
      let light_main = new BABYLON.HemisphericLight(
        "light",
        new BABYLON.Vector3(0, 1, 0),
        scene
      );
      light_main.intensity = 0.8;
      let light_point = new BABYLON.PointLight(
        "pointLight",
        new BABYLON.Vector3(5, 5, -0.1),
        scene
      );
      return scene;
    };

    let scene = createScene(scope);
    // this.props.setScene(scene);
    let adderSceneWrapper = new AdderSceneWrapper(scene);
    adderSceneWrapper.getUUID();
    this.setState(
      {
        scene: scene,
        adderSceneWrapper: adderSceneWrapper
      },
      () => {
        scope.setUp();
      }
    );
    scene.autoClear = true;

    engine.runRenderLoop(function() {
      if (typeof scene === "undefined") {
        return;
      } else {
        if (scene) {
          scene.render();
        }
      }
    });

    window.addEventListener("resize", function() {
      engine.resize();
    });

    window.addEventListener("click", function() {
      //should only detect meshes where  isPickable = true;
      let pickResult = scene.pick(scene.pointerX, scene.pointerY);
      if (pickResult.pickedMesh === null) {
        return false;
      } else {
        scope.windowCallbackPickable(pickResult.pickedMesh.name);
      }
    });
  } //

  callback_UITextInput(args) {
    let oldName = scope.state.userSession.designModel.designName;
    scope.setState(
      prevState => ({
        ...prevState,
        userSession: {
          ...prevState.userSession,
          designModel: {
            ...prevState.userSession.designModel,
            designName: args.value,
            action: "design_name"
          }
        }
      }),
      () => {
        //SAVE CHANGE ACTION
        console.log(
          "Main:callback_UITextInput() chaning the design name with scope.save_UIAtion() "
        );

        let newName = scope.state.userSession.designModel.designName;
        scope.save_UIAction("id_null", "change_name", newName, oldName);
      }
    );
    //save action:
  }

  iconDelete() {
    console.log("iconDelete");
    //TODO:
    // NEED TO DELETE PAST ACTIONS AS WELL ...
    /**
     *  - are you sure? MUI_ALertDialog
     */
    let buttonAreYouSureDelete = window.document.querySelector(
      "#deleteAreYouSure button"
    );
    buttonAreYouSureDelete.click();
  }

  resetForDelete() {
    //1 clear screenshots
    scp.setState({ tileData: [] });
    //2 clear non-saved local storage
    localStorage.removeItem("designsArray");
    //3
    //dispose of meshes
    let stateModelName = scp.state.modelName;
    let asw = scp.state.adderSceneWrapper;
    asw.disposeOfMeshesForModel(stateModelName);
    //4 remove UI settings ie. design name and design selections.
    scp.setState({ selected_ad_type: -1 });
    //5 design name
    scp.resetUserSession();
    //*!* TODO: still need the selects to refresh and the design name to refresh.
    //TODO: remove actions_array from localStorage
    window.localStorage.removeItem("actions_array");
  }

  callback_DeleteYes() {
    scp.setState(
      prevState => ({
        ...prevState,
        userAction: {
          ...prevState.userAction,
          deleteSure: true
        }
      }),
      () => {
        //SAVE CHANGE ACTION
        //  scope.save_UIAction();
        scp.resetForDelete();
      }
    );
  }
  callback_DeleteNo() {
    scp.setState(
      prevState => ({
        ...prevState,
        userAction: {
          ...prevState.userAction,
          deleteSure: false
        }
      }),
      () => {
        //SAVE CHANGE ACTION
        // scope.save_UIAction();
      }
    );
  }

  iconSave_Alt() {
    console.log("iconSave_Alt");
  }

  iconRedo() {
    console.log("iconRedo");
  }
  iconShare() {
    console.log("iconShare");
  }

  iconSave_v2(newDesignsArray) {
    scope.setState(
      prevState => ({
        ...prevState,
        userSession: {
          ...prevState.userSession,
          designs: newDesignsArray,
          savedDesigns: newDesignsArray
        }
      }),
      () => {
        //note: saves the entire 'userSession'
        let oldDesigns = JSON.parse(localStorage.getItem("designsArray")) || [];
        let oldSavedDesigns =
          JSON.parse(localStorage.getItem("savedDesignsArray")) || [];
        let newDesign = scope.state.userSession.designModel;
        newDesign.image = scope.state.images;
        //loop through OR  push to local storage:
        oldDesigns.push(newDesign);
        oldSavedDesigns.push(newDesign);
        localStorage.setItem("designsArray", JSON.stringify(oldDesigns));
        localStorage.setItem(
          "savedDesignsArray",
          JSON.stringify(oldSavedDesigns)
        );
      }
    );
  }

  render() {
    return (
      <div>
        <div>Main.jsx</div>

        <Grid
          container
          spacing={0}
          id="ParentContainer"
          style={{ border: " dotted 1px  lightblue " }}
        >
          <Grid
            container
            item
            xs={12}
            id="Header"
            style={{ marginTop: "10px", border: " dotted 1px  lightblue " }}
          >
            <Grid item xs={4} id="LogoContainer">
              <img
                src={AdderLogoAndName}
                style={{ height: "auto", width: "100%" }}
                className="AdderLogoAndName"
                id={"AdderLogo"}
                alt="Adder Logo"
              />
            </Grid>
          </Grid>{" "}
          <Grid item xs={8}>
            <div className="adder-3dTool-canvas-container">
              <canvas
                id="adder_3dTool_canvas"
                className="adder-3dTool-canvas"
                style={{ boxShadow: "5px 5px 8px #2f2f2f" }}
              />

              <OverlayControls
                callback={this.subCallback}
                callback_ScreenShotButtonPress={this.screenshotButtonPress}
                data={{ key: "value" }}
              ></OverlayControls>
            </div>
          </Grid>
          <Grid item xs={4}>
            <UITextInput
              id="designName"
              label="Design Name"
              value={this.state.userSession.designModel.designName}
              callback={this.callback_UITextInput}
              placeholder="Enter a Design Name"
            />
            <Designer
              scene={this.state.scene}
              getAdderSceneWrapper={this.getAdderSceneWrapper}
              adderSceneWrapper={this.state.adderSceneWrapper}
              callback={this.callback_designer}
              callback_withModelInfo={this.callback_withModelInfo}
            ></Designer>
            {this.state.selected_ad_type == "0" && (
              <SidebarSelectorVehicles
                data={{
                  hoodMeshId: this.state.hoodMeshId,
                  leftMeshId: this.state.leftMeshId,
                  rightMeshId: this.state.rightMeshId,
                  roofMeshId: this.state.roofMeshId,
                  trunkMeshId: this.state.trunkMeshId
                }}
                callback={this.sidebarButtonClickAlt}
              ></SidebarSelectorVehicles>
            )}
            {this.state.selected_ad_type == "1" && (
              <SidebarSelectorBillboards
                data={{
                  sign1MeshId: this.state.sign1MeshId,
                  sign2MeshId: this.state.sign2MeshId
                }}
                callback={this.sidebarButtonClickAlt}
              ></SidebarSelectorBillboards>
            )}
          </Grid>
          <Grid
            container
            id={"iconParentContainer"}
            style={{
              marginTop: "25px",
              marginBottom: "5px"
            }}
          >
            <IconControlGroup
              callback_Save={this.iconSave}
              callback_Save_v2={this.iconSave_v2}
              callback_Delete={this.iconDelete}
              callback_Redo={this.iconRedo}
              callback_Save_Alt={this.iconSave_Alt}
              callback_Share={this.iconShare}
              callback_Undo={this.iconUndo}
              data={{
                designModel: scope.state.userSession.designModel,
                designs: scope.state.userSession.designs
              }}
            ></IconControlGroup>

            <Grid item xs={9} id={"iconRow1screenshots_row"}>
              <Grid item xs={12} style={{ padding: "15px" }}>
                <UIGridList tileData={this.state.tileData} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <div>
          {this.state.startEditing && (
            <div>
              <Grid>
                <DraggableDialog
                  imageEditorCallback={this.imageEditorCallback}
                  mesh_id={this.state.editing_mesh_id}
                ></DraggableDialog>
              </Grid>
            </div>
          )}
        </div>

        <MUI_AlertDialog
          callback_Yes={this.callback_DeleteYes}
          callback_No={this.callback_DeleteNo}
        ></MUI_AlertDialog>

        {/** */}
      </div>
    );
  }
}

export default Main;
