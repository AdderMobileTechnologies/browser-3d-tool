import React from "react";
import BABYLON from "babylonjs";

import * as K from "../constants"; // Required for GridList ( screenshots)
//models
import AdderCamera from "../models/adderCamera";
import AdderSceneWrapper from "../models/adderSceneWrapper";
import AdderSkyBox from "../models/adderSkybox";
import AdderMeta from "../models/adderMeta";
import AdderAsset from "../models/adderAsset";
import AdderLoader from "../models/adderLoader";
//components
import DraggableDialog from "./MUI_DraggableDialog";
import Designer from "./designer";
//subcomponents
import SidebarSelectorBillboards from "./subcomponents/_sidebarSelectorBillboards";
import SidebarSelectorVehicles from "./subcomponents/_sidebarSelectorVehicles";
import IconControlGroup from "./subcomponents/_iconControlGroup";
import OverlayControls from "./subcomponents/_overlayControls";
import OverlayControlsRight from "./subcomponents/_overlayControlsRight";
import OverlayControlsUpperRight from "./subcomponents/_overlayControlsUpperRight";
import MUIAlertDialog from "./subcomponents/MUIAlertDialog";
import UITextInput from "./subcomponents/elements/UITextInput";
//assets
import AdderLogoAndName from "../assets/Adder_3D_Tool2/AdderLogoTransparent.png";
import UserImage from "../assets/Adder_3D_Tool2/contact_photo.png";

//third party
import Grid from "@material-ui/core/Grid"; //
import "tui-image-editor/dist/tui-image-editor.css";
import { Resizable, ResizableBox } from "react-resizable";

//css
import "./minimum.css";
import "./Main.css";

let scope;
const UIGridList = K.UIGridList;
//region: Render Methods

class Main extends React.Component {
  constructor(props) {
    super(props);

    scope = this;

    this.state = {
      scene: {},
      canvas: {},
      last_adderAssetObject: "empty asset",
      sceneIsSet: false,
      engine: null,
      camera: null,
      images: [],
      texture_images: [],
      adderSceneWrapper: {},
      selected_mesh_id: "",
      meta_data: {},
      startEditing: false,
      finishedEditing: true,
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
          designName: "",
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
      redos: [],
      meshPicked: false,
      width: 500,
      height: 150
    };
    //methods
    this.setUp = this.setUp.bind(this);
    this.getAdderSceneWrapper = this.getAdderSceneWrapper.bind(this);
    this.screenshotButtonPress = this.screenshotButtonPress.bind(this);
    this.saveScreenshot = this.saveScreenshot.bind(this);
    this.save_UIAction = this.save_UIAction.bind(this);
    this.sidebarButtonClickAlt = this.sidebarButtonClickAlt.bind(this);
    this.windowCallbackPickable = this.windowCallbackPickable.bind(this);
  }
  // resizable functions

  onClick = () => {
    this.setState({ width: 200, height: 200 });
  };

  onResize = (event, { element, size, handle }) => {
    this.setState({ width: size.width, height: size.height });
  };
  // end resizable

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

  // UNDOs and REDOs:
  /*

- iconUndo
- iconRedo
- undo_screenshot
- undo_ApplyTextureToMesh
- redo_ApplyTextureToMesh
- undo_UITextInput
- redo_UITextInput
- reset_InsertIntoRedo
- reset_InsertIntoActions
*/

  iconUndo() {
    let old_actions = JSON.parse(localStorage.getItem("actions_array")) || [];
    if (old_actions.length > 0) {
      let lastIndex = old_actions.length - 1;
      let lastAction = {};
      for (let i in old_actions) {
        if (i == lastIndex) {
          lastAction = old_actions[i];
        }
      }
      if (lastAction !== null && typeof lastAction !== "undefined") {
        switch (lastAction.action) {
          case "change_name":
            scope.undo_UITextInput(lastAction);
            break;
          case "applyTextureToMesh":
            scope.undo_ApplyTextureToMesh(lastAction);
            break;
          case "screenshot":
            //scope.undo_screenshot(lastAction);
            break;
          case "change asset":
            scope.undo_asset(lastAction);
            break;
          default:
            console.log("no match for action: ", lastAction.action);
            break;
        }
      } else {
        console.log("welp...? something not defined.");
      }
    }
  }
  iconRedo(args) {
    // HERE we take pop the last item off the  'redo_actions_array', re-apply it with the appropriate measure.
    let redo_actions_array =
      JSON.parse(localStorage.getItem("redo_actions_array")) || [];
    if (redo_actions_array.length > 0) {
      let lastRedoAction = redo_actions_array.pop();
      //reapply the last RedoAction
      switch (lastRedoAction.action) {
        case "change_name":
          scope.redo_UITextInput(lastRedoAction);
          break;
        case "applyTextureToMesh":
          scope.redo_ApplyTextureToMesh(lastRedoAction);
          break;
        case "screenshot":
          // scope.undo_screenshot(lastAction);
          break;
        case "change asset":
          scope.redo_asset(lastRedoAction);
          break;
        default:
          console.log("no match for action: ", lastRedoAction.action);
          break;
      }

      //re-save redo_actions_array misnus the popped action.!
      localStorage.setItem(
        "redo_actions_array",
        JSON.stringify(redo_actions_array)
      );
      // put the last redo action into the actions array.....
    } else {
      console.log("there  are no more actions to be undone.");
    }
  }
  undo_screenshot(args) {
    // args.from !== "empty dataURL" &&
    if (args.from !== "" && typeof args.from != "undefined") {
      const array_image_models = scope.state.images.slice();
      var popped_image_model = array_image_models.pop();
      this.reset_InsertIntoRedo(popped_image_model);
      scope.setState(prevState => ({
        ...prevState,
        images: array_image_models
      }));
      /*
      let old_action_arrays =
        JSON.parse(localStorage.getItem("actions_array")) || [];
      if (old_action_arrays.length > 0) {
        
        old_action_arrays.pop();
        localStorage.setItem(
          "actions_array",
          JSON.stringify(old_action_arrays)
        );
        // remove from the 'tileData'.
        const currentTileDataArray = scope.state.tileData.slice();
        currentTileDataArray.pop();
        scope.setState(prevState => ({
          ...prevState,
          tileData: currentTileDataArray
        }));
      } else {
        // nothing to remove
        console.log(
          "no more actions to remove from within the screenshots undo code. "
        );
      }
      */
    }
  }

  undo_ApplyTextureToMesh(args) {
    let old_actions = JSON.parse(localStorage.getItem("actions_array")) || [];
    if (old_actions.length > 0) {
      let poppedAction = scope.popOffAction();

      if (poppedAction.from != "empty dataURL") {
        this.state.adderSceneWrapper.applyTextureToMesh(
          poppedAction.id,
          poppedAction.from
        );
      } else {
        console.log(
          "perform undo texture...but back to the original texture  HOW TO RESTORE ORIGINAL TEXTURE ? "
        );
        console.log(
          "APPLY default texture blank: ie: data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
        );
        this.state.adderSceneWrapper.applyTextureToMesh(
          poppedAction.id,
          "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
        );
      }
    } else {
      //nothing in there
    }
  }
  redo_ApplyTextureToMesh(args) {
    let old_actions = JSON.parse(localStorage.getItem("actions_array")) || [];
    old_actions.push(args);
    localStorage.setItem("actions_array", JSON.stringify(old_actions));
    this.state.adderSceneWrapper.applyTextureToMesh(args.id, args.to);
  }
  //////////////////////////////////////////////////////////////////////////////////////////////

  undo_asset(args) {
    console.log("undo_Asset args:", args);
    // pop off the 'TO' asset , move it into the redo array
    //see the delete function for reference.
    let poppedAction = scope.popOffAction(); // (?) is this getting saved into the 'redo' array every time ?

    let asw = scope.state.adderSceneWrapper;
    asw.disposeOfMeshesForModel(args.id);
    scope.setState({ selected_ad_type: -1 }); // (?) can this value refresh the selects in Designer ?
    // TODO: reset the selects in Designer ?
  }
  // LEFT OFF HERE: Thur. 9-19-2019
  // trying to redo the model/assets almost works but they get out of sync somehow...
  // *porsche is not getting added back to the actions array the 2nd redo doesn't put the object back into actions array.

  redo_asset(args) {
    console.log("... redo_Asset args:", args);
    //pop off redo, push to actions
    let poppedRedo = scope.popOffRedo();
    //should handle pushing back into actions as well...
    // so what will load it onto the canvas
    //console.log("reload with args:", args);
    //adderSceneWrapper
    //console.log("do we have a scene wrapper....");
    //console.log(scope);
    let asw = scope.getAdderSceneWrapper();
    //console.log("asw:", asw);
    //asw.getUUID();
    let adderAsset = new AdderAsset(
      args.to.dir,
      args.to.filename,
      args.to.filepath,
      args.to.position,
      args.to.rotation,
      args.to.scaling,
      args.to.behavior,
      asw
    );
    // TODO:
    // 1)
    scope.loadScene(adderAsset);
    // 2)  define which meshes will be selectable. for the UI buttons
    scope.defineSelectableMeshesForAdderAsset(adderAsset);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  popOffAction() {
    //handles popping off actions array and pushing back into redo array
    let old_actions = JSON.parse(localStorage.getItem("actions_array")) || [];
    let poppedAction = old_actions.pop();
    this.reset_InsertIntoRedo(poppedAction);
    localStorage.setItem("actions_array", JSON.stringify(old_actions));
    return poppedAction;
  }
  popOffRedo() {
    console.log("...popOffRedo() ");
    //todo:
    let old_redos =
      JSON.parse(localStorage.getItem("redo_actions_array")) || [];
    console.log("# of redos:", old_redos.length);
    let poppedRedo = old_redos.pop();
    console.log("The popped redo:", poppedRedo);
    this.reset_InsertIntoActions(poppedRedo);
    localStorage.setItem("redo_actions_array", JSON.stringify(old_redos));
    return poppedRedo;
  }
  undo_UITextInput(args) {
    let poppedAction = scope.popOffAction();
    scope.setState(prevState => ({
      ...prevState,
      userSession: {
        ...prevState.userSession,
        designModel: {
          ...prevState.userSession.designModel,
          designName: poppedAction.from
        }
      }
    }));
  }
  redo_UITextInput(args) {
    let old_actions = JSON.parse(localStorage.getItem("actions_array")) || [];
    old_actions.push(args);
    localStorage.setItem("actions_array", JSON.stringify(old_actions));
    scope.setState(prevState => ({
      ...prevState,
      userSession: {
        ...prevState.userSession,
        designModel: {
          ...prevState.userSession.designModel,
          designName: args.to
        }
      }
    }));
  }
  reset_InsertIntoRedo(args) {
    let currentRedos =
      JSON.parse(localStorage.getItem("redo_actions_array")) || [];
    currentRedos.push(args);
    localStorage.setItem("redo_actions_array", JSON.stringify(currentRedos));
  }

  reset_InsertIntoActions(args) {
    let currentActions =
      JSON.parse(localStorage.getItem("actions_array")) || [];
    currentActions.push(args);
    localStorage.setItem("actions_array", JSON.stringify(currentActions));
  }
  //////////////////////////   end undos and redos
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
      }
    );
  }

  sidebarButtonClickAlt(args) {
    // console.log("Main:sidebarButtonClickAlt(args):", args);
    //Purpose: save new mesh to array of meshes in state

    const obj = { mesh_name: args.name };
    const newArray = this.state.userSession.designModel.meshes.slice(); // Create a copy
    newArray.push(obj);

    this.setState(
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

    this.windowCallbackPickable(args.name, "sidebarButtonClickAlt");
  }

  imageEditorCallback = dataURL => {
    console.log("image editor callback ...");
    this.setState(
      {
        startEditing: false,
        // last_dataURL: dataURL,
        finishedEditing: true
        //meshPicked: false
      },
      () => {
        //need to make sure modal is set OFF in state , no async latency still does it.
        // console.log(
        //   "Main:imageEditorCallback():editing_mesh_id:",
        //   this.state.editing_mesh_id
        // );

        let texture_image_model = {};
        texture_image_model.id = this.state.editing_mesh_id;
        texture_image_model.dataURL = dataURL;

        const array_texture_image_models = scope.state.texture_images.slice();
        // console.log("texture_image_model:", texture_image_model);
        array_texture_image_models.push(texture_image_model);
        scope.setState(prevState => ({
          ...prevState,
          texture_images: array_texture_image_models
        }));

        this.state.adderSceneWrapper.applyTextureToMesh(
          this.state.editing_mesh_id,
          dataURL
        );

        scope.save_UIAction(
          this.state.editing_mesh_id,
          "applyTextureToMesh",
          dataURL,
          this.state.last_dataURL
        );
        scope.setState({
          last_dataURL: dataURL
        });
      }
    );
  };

  windowCallbackPickable(mesh_id, caller) {
    if (!this.state.startEditing) {
      this.setState(
        {
          startEditing: true,
          editing_mesh_id: mesh_id,
          finishedEditing: false
          //meshPicked: false
        },
        () => {
          //console.log("editing mesh id:", mesh_id);
        }
      );
    } else {
      //console.log("already editing ...");
    }
  }
  // To hide or show the appropriate sidebar image and controls
  callback_Designer(args = null, adderAsset = null, adderAssetObject = null) {
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
      // console.log("NOT AN ADDER ASSET yet....");
    } else {
      //HERE : we would save the 'adderAsset' that just got added to the canvas.
      // if(this.state.last_adderAssetObject != "empty asset"){

      // }
      // save_UIAction(_id, _action, _to, _from)
      scope.save_UIAction(
        adderAsset.getFilepath(),
        "change asset",
        adderAssetObject,
        scope.state.last_adderAssetObject
      );

      scope.setState({
        last_adderAssetObject: adderAssetObject
      });
      // TODO:
      // 1)
      scope.loadScene(adderAsset);
      // 2)  define which meshes will be selectable. for the UI buttons
      scope.defineSelectableMeshesForAdderAsset(adderAsset);
    }
  }
  loadScene = adderAsset => {
    this.state.adderSceneWrapper.getUUID();
    let adderLoader = new AdderLoader(this.state.adderSceneWrapper);
    adderLoader.addSingleModel(adderAsset);
  };
  defineSelectableMeshesForAdderAsset(adderAsset) {
    let assetData = adderAsset.getBehavior();
    //strategy:SELECT:parameters:pickableMeshes
    let pickableMeshes = assetData[1]["parameters"]["pickableMeshes"];

    //USAGE: Sidebar-Selection
    // let selectableMeshes = [];
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

      // ["billboard", "2sides", "angled", "sign", "1"]
      //     vs
      // ["vehicle", "2door", "sportscar", "leftside", "medium"]

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
                  sign1MeshId = pickableMesh;
                  break;
                case "2":
                  sign2MeshId = pickableMesh;
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
  }
  callback_withModelInfo(info) {
    //Lets me 'name' the 'model' being used by it's 'filepath' so it can be referenced when deleting a design.
    scope.setState({ modelName: info.filepath });
  }

  screenshotButtonPress(evt) {
    console.log("- - - - screenshotButtonPress :evt:", evt);
    let engine = this.state.engine; //was embedded under Ad_Scene in version 1
    let camera = this.state.camera;
    //let stateScope = this.state;
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
          //console.log("");
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
    {
      /**  { width: 274, height: 222 }, */
    }
    BABYLON.Tools.CreateScreenshot(
      engine,
      camera,
      { width: 400, height: 300 },
      function(data) {
        let img = document.createElement("img");
        img.src = data;

        addScreenshot(img.src);
      }
    );
  } //
  componentDidMount() {
    localStorage.removeItem("actions_array");
    localStorage.removeItem("redo_actions_array");

    let scope = this;

    let canvas = document.getElementById("adder_3dTool_canvas");

    let engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true
    });
    this.setState({ engine: engine });

    let createScene = function(scope) {
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
        Math.PI / 2.5,
        Math.PI / 3,
        30,
        BABYLON.Vector3.Zero(),
        scene,
        true,
        cameraOptions
      );
      let camera = adderCam_arcRotate.getCamera();

      scope.setState({ camera: camera });
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
    let canvasClick = null;
    canvas.addEventListener("click", () => {
      //use canvas click to compensate for babylonjs scene.pick persisting incorrect x and y positions when clicked outside of scene.
      canvasClick = true;
    });
    window.addEventListener("resize", function() {
      engine.resize();
      ///canvas dimensions need to be recalculated on window resize
    });

    window.addEventListener("click", function(e) {
      ///////////////////////////////////// have to recalculate because on component did mount was inaccurate.

      if (canvasClick) {
        //ROOT PROBLEM: all clicks outside of the canvasregister as the 'last click' made inside the canvas.
        // Is a canvas click, do work for inside babylonjs

        if (e.target.innerHTML == "Apply Image") {
          console.log("CLICK: HARD STOP !.. applied image.");
          scope.setState({
            startEditing: false,
            finishedEditing: true
          });
        } else {
          //should only detect meshes where  isPickable = true;
          console.log("CLICK: check to see if mesh or not");
          let pickResult = scene.pick(scene.pointerX, scene.pointerY);
          // console.log("scene point x:", scene.pointerX);
          // console.log("scene pointer y: ", scene.pointerY);
          if (pickResult.pickedMesh === null) {
            console.log("CLICK: not a mesh ");
            //return false;
            scope.setState({
              startEditing: false,
              finishedEditing: true
            });
          } else {
            console.log("pickResult.pickedMesh:", pickResult.pickedMesh);
            console.log("CLICK:  was a mesh refer to windowCallbackPickable ");
            scope.windowCallbackPickable(
              pickResult.pickedMesh.name,
              "eventListener"
            );
          }
        }
        //THEN RESET canvas click value back to False
        canvasClick = false;
      } else {
        //Is NOT a canvas click , do not do work for inside of babylonjs scene canvas.
      }
      ///////////////////////////////////////////
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
    scope.setState({ tileData: [] });
    //2 clear non-saved local storage
    localStorage.removeItem("designsArray");
    //3
    //dispose of meshes
    let stateModelName = scope.state.modelName;
    let asw = scope.state.adderSceneWrapper;
    asw.disposeOfMeshesForModel(stateModelName);
    //4 remove UI settings ie. design name and design selections.
    scope.setState({ selected_ad_type: -1 });
    //5 design name
    scope.resetUserSession();
    //*!* TODO: still need the selects to refresh and the design name to refresh.
    //TODO: remove actions_array from localStorage
    window.localStorage.removeItem("actions_array");
  }

  callback_DeleteYes() {
    scope.setState(
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
        scope.resetForDelete();
      }
    );
  }
  callback_DeleteNo() {
    scope.setState(
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
        newDesign.texture_images = scope.state.texture_images;
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
      <Grid container>
        <Grid container spacing={0} id="ParentContainer">
          <Grid
            container
            item
            xs={12}
            id="Header"
            style={{ marginTop: "10px" }}
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
            <Grid item xs={2} id="LogoContainer"></Grid>
            <Grid item xs={2} id="LogoContainer"></Grid>
            <Grid item xs={1} id="LogoContainer"></Grid>
            <Grid item xs={2} id="LogoContainer">
              <Grid
                container
                style={{
                  backgroundColor: "#afafaf",
                  marginTop: "10px",
                  height: "40px",
                  padding: "0px",

                  borderRadius: "16px",
                  boxShadow: "3px 3px 8px #2f2f2f"
                }}
              >
                <Grid item xs={3}>
                  <img
                    src={UserImage}
                    className="UserImage"
                    style={{ height: "40px" }}
                    alt="The User Profile"
                  />
                </Grid>
                <Grid item xs={9}>
                  <p className="user-name">Ed Jellico</p>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={1} id="LogoContainer"></Grid>
          </Grid>
          <Grid item xs={8}>
            <Grid container>
              <div className="adder-3dTool-canvas-container">
                <canvas
                  id="adder_3dTool_canvas"
                  className="adder-3dTool-canvas"
                  style={{ boxShadow: "5px 5px 8px #2f2f2f" }}
                />
                <OverlayControlsUpperRight
                  callback={this.subCallback}
                  data={{ key: "value" }}
                ></OverlayControlsUpperRight>

                <OverlayControls
                  callback={this.subCallback}
                  callback_ScreenShotButtonPress={this.screenshotButtonPress}
                  data={{ key: "value" }}
                ></OverlayControls>
                <OverlayControlsRight
                  callback={this.subCallback}
                  callback_ScreenShotButtonPress={this.screenshotButtonPress}
                  data={{ key: "value" }}
                ></OverlayControlsRight>
              </div>
            </Grid>
            <Grid container>
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
                  <Grid>
                    <div>
                      {/**
              <button onClick={this.onClick} style={{ marginBottom: "10px" }}>
              Reset first element's width/height
            </button>
             */}

                      <div className="layoutRoot">
                        <Resizable
                          className="box"
                          height={this.state.height}
                          width={this.state.width}
                          onResize={this.onResize}
                          resizeHandles={["se"]}
                          minConstraints={[600, 150]}
                          maxConstraints={[1200, 300]}
                        >
                          <div
                            className="box"
                            style={{
                              width: this.state.width + "px",
                              height: this.state.height + "px",
                              padding: "15px",
                              backgroundColor: "#eee",
                              borderRadius: "20px"
                            }}
                          >
                            <Grid item style={{ textAlign: "left" }}>
                              My Designs
                            </Grid>
                            {/**  
                          Style Notes for GridList: The slider view for screenshots.
                          styles are located in minimum.css as well as in constants.jsx
                        
                        */}
                            <Grid item>
                              <UIGridList
                                tileData={this.state.tileData}
                                width={this.state.width / 2 + "px"}
                                height={this.state.height / 1.5 + "px"}
                              />
                            </Grid>
                          </div>
                        </Resizable>
                      </div>
                    </div>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item md={4}>
            <Grid container>
              <Grid item xs={1}></Grid>
              <div
                className="design-controls"
                style={{
                  width: "80%",
                  marginLeft: "auto",
                  marginRight: "auto"
                }}
              >
                <Grid
                  item
                  md={10}
                  style={{
                    width: "100%",
                    marginTop: "30px",
                    marginLeft: "auto",
                    marginRight: "auto"
                  }}
                >
                  <div>
                    {/** extricating the Draggable Dialog from this condition was no good. */}
                    {this.state.startEditing && (
                      <div>
                        <Grid>
                          <DraggableDialog
                            imageEditorCallback={this.imageEditorCallback}
                            mesh_id={this.state.editing_mesh_id}
                            isEditing={this.state.startEditing}
                          ></DraggableDialog>
                        </Grid>
                      </div>
                    )}
                  </div>
                  <UITextInput
                    id="designName"
                    label="Design Name"
                    value={this.state.userSession.designModel.designName}
                    callback={this.callback_UITextInput}
                    placeholder="Enter Design Name"
                  />
                  <Designer
                    scene={this.state.scene}
                    getAdderSceneWrapper={this.getAdderSceneWrapper}
                    adderSceneWrapper={this.state.adderSceneWrapper}
                    callback={this.callback_Designer}
                    callback_withModelInfo={this.callback_withModelInfo}
                  ></Designer>

                  {this.state.selected_ad_type === "0" && (
                    <p className="sidebar-call-to-action">
                      Select a Component to Edit
                    </p>
                  )}

                  {this.state.selected_ad_type === "1" && (
                    <p className="sidebar-call-to-action">
                      Select a Component to Edit
                    </p>
                  )}

                  {this.state.selected_ad_type === "0" && (
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
                  {this.state.selected_ad_type === "1" && (
                    <SidebarSelectorBillboards
                      data={{
                        sign1MeshId: this.state.sign1MeshId,
                        sign2MeshId: this.state.sign2MeshId
                      }}
                      callback={this.sidebarButtonClickAlt}
                    ></SidebarSelectorBillboards>
                  )}
                </Grid>
              </div>
              <Grid item md={1}></Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={12}>
            <div style={{ height: "100px", width: "100%" }}></div>
          </Grid>
        </Grid>
        {/**   DEV : commented out while trying to debug issue with modal opening twice, 
        // HOWEVER: this is an important component of the "DELETE" design process.....
        //commenting it out did not solve the problem  */}
        <MUIAlertDialog
          callback_Yes={this.callback_DeleteYes}
          callback_No={this.callback_DeleteNo}
        ></MUIAlertDialog>
      </Grid>
    );
  }
}

export default Main;
