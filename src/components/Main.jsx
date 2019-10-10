import React from "react";
import BABYLON from "babylonjs";

import * as K from "../constants"; // Required for GridList ( screenshots)
import axios from "axios";
//models
import AdderCamera from "../models/adderCamera";
import AdderSceneWrapper from "../models/adderSceneWrapper";
import AdderSkyBox from "../models/adderSkybox";
import AdderMeta from "../models/adderMeta";
import AdderAsset from "../models/adderAsset";
import AdderLoader from "../models/adderLoader";
import AdderUtil from "../models/util";
//components
import DraggableDialog from "./MUI_DraggableDialog";
import Designer from "./designer";
//subcomponents
import SidebarSelectorBillboards from "./subcomponents/_sidebarSelectorBillboards";
import SidebarSelectorVehicles from "./subcomponents/_sidebarSelectorVehicles";
import IconControlGroup from "./subcomponents/_iconControlGroup";
import OverlayControls from "./subcomponents/_overlayControls";
import OverlayControlsRight from "./subcomponents/_overlayControlsRight";
import OverlayControlsUpperLeft from "./subcomponents/_overlayControlsUpperLeft";
import OverlayControlsUpperRight from "./subcomponents/_overlayControlsUpperRight";
import OverlayControlsMUIPopOver from "./subcomponents/_overlayControlsMUIPopOver";
import MUIAlertDialog from "./subcomponents/MUIAlertDialog";
import UITextInput from "./subcomponents/elements/UITextInput";
import EMailer from "./subcomponents/_emailer";
//assets
//import AdderLogoAndName from "../assets/Adder_3D_Tool2/AdderLogoTransparent.png";
import AdderLogoAndName from "../assets/adder-logos_angled_work.png";
import UserImage from "../assets/Adder_3D_Tool2/contact_photo.png";

//third party
import Grid from "@material-ui/core/Grid"; //
import "tui-image-editor/dist/tui-image-editor.css";
import { Resizable, ResizableBox } from "react-resizable";

//css
import "./minimum.css";
import "./Main.css";
//Part of RxJS implementation.
import { messageService } from '../_services'; //import { messageService } from '../@/_services';
///////////////
import * as GUI from "babylonjs-gui";
import AdderGuiUtility from "../models/adderGuiUtility";

let scope;
const UIGridList = K.UIGridList;
//region: Render Methods
let util = new AdderUtil();

class Main extends React.Component {
  constructor(props) {
    super(props);

    scope = this;
    /*
  // For RXJS implementation  messages: []  */

    this.state = {
      messages: [],
      scene: {},
      canvas: {},
      last_adderAssetObject: "empty asset",
      sceneIsSet: false,
      engine: null,
      camera: null,
      camera_target: new BABYLON.Vector3(2, 0, 2),
      camera_target_y: 10,
      images: [],
      _images: [],
      adderSceneWrapper: {},
      selected_mesh_id: "",
      meta_data: {},
      startEditing: false,
      finishedEditing: true,
      editing_mesh_id: "empty mesh",
      editing_mesh_initial_load: true,
      last_imgId: null,
      selected_ad_type: -1,
      hoodMeshId: null,
      leftMeshId: null,
      roofMeshId: null,
      rightMeshId: null,
      trunkMeshId: null,
      sign1MeshId: null,
      sign2MeshId: null,
      isRaining: false,
      isVisibleSelectionPanel: true,
      userSession: {
        userInfo: [],
        userModel: {
          user_id: "",
          username: ""
        },
        designs: [],
        designModel: {
          designName: "",
          environment: "",
          environment_type: "",
          environmentFilepath:
            "InDevelopmentAddDataForEnvironmemntNameOrREmove....",
          screenShots: []
        }
      },
      tileData: [],
      userAction: {
        deleteSure: false
      },
      userAssets: [],
      userModels: [],
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
    this.imageEditorClose = this.imageEditorClose.bind(this);
    this.changeEnvironment = this.changeEnvironment.bind(this);
    this.environment_Rain = this.environment_Rain.bind(this);
    this.environment_Smoke = this.environment_Smoke.bind(this);
    /**
      this.cameraTargetY_up = this.cameraTargetY_up.bind(this);
        this.cameraTargetY_down = this.cameraTargetY_down.bind(this);
      */
    /*
    this.designer = (
      <Designer
        scene={this.state.scene}
        getAdderSceneWrapper={this.getAdderSceneWrapper}
        adderSceneWrapper={this.state.adderSceneWrapper}
        callback={this.callback_Designer}
        callback_withModelInfo={this.callback_withModelInfo}
      ></Designer>
    );*/
    this.register = this.register.bind(this); //extra
  }
  register(triggerChange) {
    console.log("Main(): register(triggerChange):");
    this.triggerChange = triggerChange;
  }
  revertChild(data) {
    //method : ad_type, sub_type, detail
    console.log("revertChild....data:", data);
    // 10-03-2019:
    //====>>>> LEFT OFF HERE: this triggers the code to reload the UI settings for the selects ... this.triggerChange(data);
  }
  componentWillUnmount() {
    this.triggerChange = null;
     // unsubscribe to ensure no memory leaks: RXJS 
     this.subscription.unsubscribe();
  }
  //Environment
  changeEnvironment = args => {
    var environment_type = null;
    switch (args.selectedOption) {
      case "location_city":
        console.log("changeEnvironment = (args) CITY:", args);
        environment_type = "CITY";

        break;
      case "landscape":
        console.log("changeEnvironment = (args) COUNTRY:", args);
        environment_type = "COUNTRY";
        break;
      default:
        break;
    }
    console.log("environment type:", environment_type);
    console.log("STATE:", scope.state.environment_type);
    console.log("LOCAL:", environment_type);
    if (scope.state.environment_type !== environment_type) {
      //NEED TO REMOVE PREVIOUS ENVIRONMENT...
      scope.resetForEnvironmentSceneChange();
      //SETUP NEW ENVIRONMENT...
      scope.setUp(environment_type);
      scope.setState({
        environment_type: environment_type
      });
    }

    //remove environment type if changed. compare to a state variable ?
  };
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
          environment: "",
          environment_type: "",
          environmentFilepath:
            "InDevelopmentAddDataForEnvironmemntNameOrREmove....",
          screenShots: []
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
 //removed by util 
- // removed by util ... reset_InsertIntoActions 
*/

  iconUndo() {
    let lastAction = util.store("get_last", K.ACTIONS_ARRAY); //1 replace 12 lines
    //if we popped off here instead of "get_last" then we could eliminate a pop for each switch statement.

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
        case "change_asset":
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

  iconRedo(args) {
    let redo_actions_array = util.store("get", K.REDOS_ARRAY); // 1 replace 2
    if (redo_actions_array.length > 0) {
      let lastRedoAction = redo_actions_array.pop();
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
        case "change_asset":
          scope.redo_asset(lastRedoAction);
          break;
        default:
          console.log("no match for action: ", lastRedoAction.action);
          break;
      }
      util.store("set", K.REDOS_ARRAY, redo_actions_array); //1 replaces 4
    } else {
      console.log("there  are no more actions to be undone.");
    }
  }
  undo_screenshot(args) {
    // args.from !== null &&
    if (args.from !== "" && typeof args.from != "undefined") {
      const array_image_models = scope.state.images.slice();
      var popped_image_model = array_image_models.pop();
      util.store("append", K.REDOS_ARRAY, popped_image_model);
      scope.setState(prevState => ({
        ...prevState,
        images: array_image_models
      }));
    }
  }

  getDataURLFromImgId = imgId => {
    console.log("Main: getDataURLFromImgId() imgId:", imgId);
    let arr = scope.state._images;
    let dataURL = null;
    for (let img of arr) {
      if (img.uuid === imgId) {
        dataURL = img.dataURL;
      }
    }
    return dataURL;
  };

  undo_ApplyTextureToMesh(args) {
    console.log("Main: undo_ApplyTextureToMesh(): args:", args);
    let old_actions = util.store("get", K.ACTIONS_ARRAY);
    if (old_actions.length > 0) {
      let poppedAction = scope.popActionsPushRedos(); //check out popActionsPushRedos
      console.log("compare args to poppedAction:", poppedAction);
      //HERE, convert poppedAction.from FROM image id to image URL
      let newDataURL = scope.getDataURLFromImgId(poppedAction.from);

      if (poppedAction.from != null) {
        this.state.adderSceneWrapper.applyTextureToMesh(
          poppedAction.id,
          newDataURL
        );
      } else {
        // `APPLY empty dataURL blank: ie: data:image/gif;base64,iVBORw0KGgo...`
        this.state.adderSceneWrapper.applyTextureToMesh(
          poppedAction.id,
          "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="
        );
      }
    }
  }
  redo_ApplyTextureToMesh(args) {
    util.store("append", K.ACTIONS_ARRAY, args); //1 replaces 3
    let newDataURL = scope.getDataURLFromImgId(args.to);
    this.state.adderSceneWrapper.applyTextureToMesh(args.id, newDataURL);
  }

  undo_asset(args) {
    console.log("undo_Asset args:", args);
    let poppedAction = scope.popActionsPushRedos();
    let asw = scope.state.adderSceneWrapper;
    asw.disposeOfMeshesForModel(args.id);
    scope.setState({ selected_ad_type: -1 });
  }

  redo_asset(args) {
    console.log("... redo_Asset args:", args);
    //pop off redo, push to actions
    let poppedRedo = scope.popRedosPushActions();
    let asw = scope.getAdderSceneWrapper();
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

    scope.loadScene(adderAsset);
    scope.defineSelectableMeshesForAdderAsset(adderAsset);
  }

  popActionsPushRedos() {
    let poppedAction = util.store("pop", K.ACTIONS_ARRAY); //1 line removes 3
    util.store("append", K.REDOS_ARRAY, poppedAction);
    return poppedAction;
  }
  popRedosPushActions() {
    let poppedRedo = util.store("pop", K.REDOS_ARRAY); // 2 lines replace 7
    util.store("append", K.ACTIONS_ARRAY, poppedRedo);
    return poppedRedo;
  }
  undo_UITextInput(args) {
    let poppedAction = scope.popActionsPushRedos();
    scope.setState_designName(poppedAction.from, scope.callback_setState);
  }
  redo_UITextInput(args) {
    util.store("append", K.ACTIONS_ARRAY, args);
    scope.setState_designName(args.to, scope.callback_setState);
  }

  totalRedo() {
    let redo_actions_array = util.store("get", "temp"); // 1 replace 2
    for (let i of redo_actions_array) {
      // console.log("i:", i);
      // console.log("i.actions:", i.actions);

      // if (redo_actions_array.length > 0) {
      let lastRedoAction = i.actions.shift(); // redo_actions_array.pop();
      // console.log("lastRedoAction:", lastRedoAction);
      for (let act of i.actions) {
        console.log("act:", act);
        switch (act.action) {
          case "change_name":
            scope.redo_UITextInput(act.action);
            break;
          case "applyTextureToMesh":
            console.log("applyTextToMesh ...... ");
            scope.redo_ApplyTextureToMesh(act.action);
            break;
          case "screenshot":
            // scope.undo_screenshot(lastAction);
            break;
          case "change_asset":
            scope.redo_asset(act.action);
            /* THROWS ERROR: 
            cannot read property 'dir' of undefined...
            Main.redo_asset
            C:/Users/Bayon/projects/3d-tool-v2/src/components/Main.jsx:327
            */
            break;
          default:
            console.log("no match for act.action: ", act.action);
            break;
        }
      }
      /*
      switch (lastRedoAction) {
        case "change_name":
          scope.redo_UITextInput(lastRedoAction);
          break;
        case "applyTextureToMesh":
          console.log("applyTextToMesh ...... ");
          scope.redo_ApplyTextureToMesh(lastRedoAction);
          break;
        case "screenshot":
          // scope.undo_screenshot(lastAction);
          break;
        case "change_asset":
          scope.redo_asset(lastRedoAction);
          break;
        default:
          console.log("no match for action: ", lastRedoAction.action);
          break;
      }
      */
    }
    /*
    if (redo_actions_array.length > 0) {
      let lastRedoAction = redo_actions_array.pop();
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
        case "change_asset":
          scope.redo_asset(lastRedoAction);
          break;
        default:
          console.log("no match for action: ", lastRedoAction.action);
          break;
      }
     
    } else {
      console.log("there  are no more actions to be undone.");
    }
    */
  }
  //////////////////////////////////////////////////////////////////
  //setState_var(x)
  // designName, images,
  setState_designName = (arg, callback) => {
    scope.setState(
      prevState => ({
        ...prevState,
        userSession: {
          ...prevState.userSession,
          designModel: {
            ...prevState.userSession.designModel,
            designName: arg
          }
        }
      }),
      () => {
        if (typeof callback === "function") {
          callback();
        }
      }
    );
  };
  callback_setState(args) {
    console.log("callback_setState:args:", args);
  }
  ///////////////////////////////////////////////////////////////////////////

  save_UIAction(_id, _action, _to, _from) {
    let action_object = {};
    action_object.id = _id;
    action_object.action = _action;
    action_object.to = _to;
    action_object.from = _from;
    util.store("append", K.ACTIONS_ARRAY, action_object);
    // //------------
    // //could the let constants get in the way ?
    // var canvas = scope.state.canvas;
    // var dataURL = canvas.toDataURL("image/png");
    // scope.setState({
    //   currentDataURL: dataURL
    // });
    // console.log("update the image RIGHT? ");
    // //----------
  }

  subCallback(args) {
    console.log("subCallback with args:", args);
  }

  getAdderSceneWrapper() {
    return this.state.adderSceneWrapper;
  }

  setUp(environment) {
    //NEED TO REMOVE PREVIOUS ENVIRONMENT...

    let adderMeta = new AdderMeta(this.state.adderSceneWrapper);
    adderMeta.getEnvironment(environment); // could call with arg ie. 'environment1', 'environment2' ,
    let scene = this.state.scene;
    let adderSkybox = new AdderSkyBox(scene, "countrybox", 1000.0);
    adderSkybox.getSkybox();

    // let arrayOfModels = this.state.adderSceneWrapper.getModels();
    // console.log("An array of Models...look for environment related models.");
    // console.log(arrayOfModels);
    // for (var i = 0; i < 5; i++) {
    //   console.log(arrayOfModels[i]);
    // }
  }

  saveScreenshot() {
    /*
    OUT OF DATE 
    let design_obj = this.state.userSession.designModel;
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
        let newDesign = this.state.userSession.designModel;
        util.store("append", "designsArray", newDesign);
      }
    );
    */
  }

  sidebarButtonClickAlt(args) {
    //Purpose: save new mesh to array of meshes in state
    // I do not need to save meshes in this manner anymore.
    this.windowCallbackPickable(args.name, "sidebarButtonClickAlt");
  }

  imageEditorClose = () => {
    this.setState({
      startEditing: false,
      finishedEditing: true
    });
  };
  imageEditorCallback = dataURL => {
    console.log("image editor callback ...with dataURL:", dataURL);
    this.setState(
      {
        startEditing: false,
        finishedEditing: true
      },
      () => {
        let _uuid = util.getUUID();
        let _img_model = {};
        //create and save an img and id key value pair
        _img_model.uuid = _uuid;
        _img_model.dataURL = dataURL;

        const array_img_models = scope.state._images.slice();
        //set defaults
        var notADuplicate = true;
        var duplicate_id = null;
        //LOOP to prevent duplicates
        for (let _img of array_img_models) {
          //then compare dataURL with given dataURL ...if dupe... notADuplicate = false;
          if (_img.dataURL === dataURL) {
            notADuplicate = false;
            duplicate_id = _img.uuid;
          }
        }
        if (notADuplicate) {
          _img_model.uuid = _uuid;
        } else {
          _img_model.uuid = duplicate_id;
        }

        /// ...
        array_img_models.push(_img_model);
        scope.setState(prevState => ({
          ...prevState,
          _images: array_img_models
        }));

        this.state.adderSceneWrapper.applyTextureToMesh(
          this.state.editing_mesh_id,
          dataURL
        );
        // ISSUE: this.state.last_dataURL in save_UIAction parameters. In the case of first adding a texture to an asset, it really did NOT have a 'from' texture.
        // There may need to be a condition to check for this. ( maybe? this.state.editing_mesh_id needs a sister variable for hasTexture or initialLoad ...)
        // OR IF editing_mesh_id === "empty mesh"
        //TODO: redo/undo image out od sync ...
        //and flag should get set to true when ever an asset is added to the screen. editing_mesh_initial_load

        if (this.state.editing_mesh_initial_load) {
          scope.save_UIAction(
            this.state.editing_mesh_id,
            "applyTextureToMesh",
            _img_model.uuid,
            null
          );
          scope.setState({
            last_imgId: _img_model.uuid,
            editing_mesh_initial_load: false
          });
        } else {
          scope.save_UIAction(
            this.state.editing_mesh_id,
            "applyTextureToMesh",
            _img_model.uuid,
            this.state.last_imgId
          );
          scope.setState({
            last_imgId: _img_model.uuid,
            editing_mesh_initial_load: false
          });
        }
      }
    );
  };

  windowCallbackPickable(mesh_id, caller) {
    console.log("WINDOW CALLBACK PICKABLE: ");
    console.log("mesh_id:", mesh_id);
    console.log("caller:", caller);
    // this.getModelForMeshId
    let asw = this.state.adderSceneWrapper;
    //use asw to
    let model = asw.getModelForMeshId(mesh_id);
    let position = model.getPosition();
    console.log("position of model:", position);

    if (position instanceof BABYLON.Vector3) {
      console.log("is vector 3");
    } else {
      console.log("is NOT a vector 3");
    }

    //get camera and change setTarget to this position.
    // position IS a BABYLON.Vector3 instantiation AND  this.state.camera IS the camera...
    // BUT using the setTarget method of camera makes most of the scene disappear.
    /*  
// TRYING TO CHANGE TARGET OF CAMERA TO SELECTED MODEL:
    let camera_new = this.state.camera;
    console.log("camera_new :", camera_new);
    camera_new.setTarget(position);
    camera_new.attachControl(this.state.canvas, true);
    this.setState({
      camera: camera_new
    });
*/

    // HOW TO define when an action is the frist time a model is selected to get a texture.??? Can I use the mesh_id to check somehow?

    if (!this.state.startEditing) {
      this.setState(
        {
          startEditing: true,
          editing_mesh_id: mesh_id,
          finishedEditing: false
        },
        () => {
          console.log("editing mesh id:", mesh_id);
        }
      );
    } else {
      //console.log("already editing ...");
    }
  }
  // To hide or show the appropriate sidebar image and controls
  callback_Designer(args = null, adderAsset = null, adderAssetObject = null) {
    console.log("Main:callback_Designer():args:", args);
    console.log("adderAsset:", adderAsset);
    console.log("adderAssetObject:", adderAssetObject);

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
      // save_UIAction(_id, _action, _to, _from)
      //save each asset into an array:
      let currentAssets = scope.state.userAssets;
      currentAssets.push(adderAsset);
      scope.setState({
        userAssets: currentAssets
      });

      scope.save_UIAction(
        adderAsset.getFilepath(),
        "change_asset",
        adderAssetObject,
        scope.state.last_adderAssetObject
      );

      scope.setState({
        last_adderAssetObject: adderAssetObject
      });
      scope.loadScene(adderAsset);
      console.log("callback_Designer:adderAsset:", adderAsset);
      scope.defineSelectableMeshesForAdderAsset(adderAsset);
    }
  }
  loadScene = adderAsset => {
    this.state.adderSceneWrapper.getUUID();
    let adderLoader = new AdderLoader(this.state.adderSceneWrapper);
    adderLoader.addSingleModel(adderAsset);
  };
  defineSelectableMeshesForAdderAsset(adderAsset) {
    console.log(
      "defineSelectableMeshesForAdderAsset(adderAsset):adderAsset",
      adderAsset
    );
    let assetData = adderAsset.getBehavior();
    console.log("assetData:", assetData);
    //strategy:SELECT:parameters:pickableMeshes
    //PROBLEM: HERE the index 2 is hard codeded. Previously it was one which meant strategy select, but after adding another strategy, the index got moved.
    //THis could be very problematic.
    //LOOP TO CHECK FOR DIFFERENT STRATEGIES applied to meta_data.
    for (let i in assetData) {
      //CHECK WHICH STRATEGY WE ARE USING:
      if (assetData[i].strategy === "select") {
        let pickableMeshes = assetData[i]["parameters"]["pickableMeshes"];

        //USAGE: Sidebar-Selection
        // let selectableMeshes = [];
        let hoodMeshId = null,
          leftMeshId = null,
          roofMeshId = null,
          rightMeshId = null,
          trunkMeshId = null;

        let sign1MeshId = null,
          sign2MeshId = null;
        //console.log("PICKABLE MESHES: ", pickableMeshes);
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
                  //console.log("switch(splitData):pickableMesh:", pickableMesh);
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
    }
    //----
  }
  callback_withModelInfo(info) {
    //"userModels" define the 3D models that were added to the scene by the user.
    //1) create object to push to the existing array
    let data_model = { modelName: info.filepath };
    //2) get the existing array
    const userModels = scope.state.userModels.slice();
    //3) push to the state array
    userModels.push(data_model);
    //4) change out the new array with the edits for the old array.
    scope.setState(prevState => ({
      ...prevState,
      userModels: userModels
    }));
  }

  screenshotButtonPress(evt) {
    console.log("- - - - screenshotButtonPress :evt:", evt);
    let engine = this.state.engine; //was embedded under Ad_Scene in version 1
    let camera = this.state.camera;
    //let stateScope = this.state;
    let that = this;

    function addScreenshot(src) {
      // console.log("addScreenShot(src) src:", src);
      //TODO: left off here : reconsider how screen shots are getting saved
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

          that.setState(prevState => ({
            ...prevState,
            userSession: {
              ...prevState.userSession,
              designModel: {
                ...prevState.userSession.designModel,
                screenShots: array_image_models
              }
            }
          }));

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
      { width: 400, height: 300 },
      function(data) {
        let img = document.createElement("img");
        img.src = data;

        addScreenshot(img.src);
      }
    );
  } //
  componentDidMount() {
    util.store("remove", K.ACTIONS_ARRAY);
    util.store("remove", K.REDOS_ARRAY);
    // -- RXJS 
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
  //---end rxjs 

    //----------------------------------------------
    const url = `${K.META_URL}/design/get`;
    console.log(" const url = `${K.META_URL}/design/get`;", url);
    //====>
    this.downloadSavedDesign();
    // in componentDidMount

    var button = document.getElementById("btn-download");
    this.setState({
      downloadButton: button
    });

    //---------------------------------------------------

    let scope = this;
    let canvas = document.getElementById("adder_3dTool_canvas");
    //var canvas = document.getElementById("gui_canvas_container");
    this.setState({
      canvas: canvas
    });
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
        lowerAlphaLimit: -0.2,
        upperAlphaLimit: Math.PI / 1.8,
        lowerBetaLimit: 0,
        upperBetaLimit: Math.PI / 2.15,
        lowerRadiusLimit: 15,
        upperRadiusLimit: 60,
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
        scope.state.camera_target,
        scene,
        true,
        cameraOptions
      );
      /*
      new BABYLON.Vector3(4, 2, 4),
      constructor(
      canvas = null,
      type = null,
      name = null,
      alpha = null,
      beta = null,
      radius = null,
      target = new Vector3(0, 0, 0),
      scene = null,
      setActiveOnSceneNoneActive = null,
      options = null
      ) 
      */
      // BABYLON.Vector3.Zero(),
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
        new BABYLON.Vector3(15, 20, 30),
        scene
      );
      return scene;
    };

    let scene = createScene(scope);
    // this.props.setScene(scene);

    //set state default environment type...
    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    let adderSceneWrapper = new AdderSceneWrapper(scene, [], advancedTexture);
    adderSceneWrapper.getUUID();

    /*  ADDER GUI UTILITY: (should advancedTexture be a property in AdderSceneWrapper constructor ? )
    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    let adderGuiUtility = new AdderGuiUtility(advancedTexture);
    let grid = adderGuiUtility.gui_create_grid2(advancedTexture);
    console.log("created grid: ", grid);
    //might need to add the advanced texture to the adderSceneWrapper 
    //create a control:  let control = adderGuiUtility.controlGroupSlider(mesh)
*/

    this.setState(
      {
        scene: scene,
        adderSceneWrapper: adderSceneWrapper,
        environment_type: "CITY"
      },
      () => {
        scope.setUp("CITY");
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
      if (canvasClick) {
        //ROOT PROBLEM: all clicks outside of the canvas, were registering as the 'last click' made inside the canvas.
        //That's why this condition was created.

        if (e.target.innerHTML === "Apply Image") {
          scope.setState({
            startEditing: false,
            finishedEditing: true
          });
        } else {
          //should only detect meshes where  isPickable = true;
          let pickResult = scene.pick(scene.pointerX, scene.pointerY);
          if (pickResult.pickedMesh === null) {
            scope.setState({
              startEditing: false,
              finishedEditing: true
            });
          } else {
            scope.windowCallbackPickable(
              pickResult.pickedMesh.name,
              "eventListener"
            );
          }
        }
        //THEN RESET canvas click value back to False
        canvasClick = false;
      } else {
        //Is NOT a canvas click , do not do any work  'inside' of babylonjs scene canvas.
      }
    });
  }

  callback_UITextInput(args) {
    //-
    let oldName = scope.state.userSession.designModel.designName;
    scope.setState_designName(args.value, scope.callback_setState_UITextInput);
    scope.setState(
      prevState => ({
        ...prevState,
        userSession: {
          ...prevState.userSession,
          designModel: {
            ...prevState.userSession.designModel,
            designName: args.value
          }
        }
      }),
      () => {
        //SAVE CHANGE ACTION
        let newName = scope.state.userSession.designModel.designName;
        scope.save_UIAction("id_null", "change_name", newName, oldName);
      }
    );
    //save action:
  }

  iconDelete() {
    /**
     *  - are you sure? MUI_ALertDialog
     */
    let buttonAreYouSureDelete = window.document.querySelector(
      "#deleteAreYouSure button"
    );
    buttonAreYouSureDelete.click();
    //THIS points to callback_Yes() --> callback_DeleteYes() --> resetForDelete()
  }

  resetForDelete() {
    //1 clear screenshots
    scope.setState({ tileData: [] });
    //2 clear non-saved local storage
    util.store("remove", "designsArray");
    //3
    //dispose of meshes
    // let stateModelName = scope.state.modelName;
    let asw = scope.state.adderSceneWrapper;
    let modelsArray = scope.state.userModels;
    for (let mx of modelsArray) {
      asw.disposeOfMeshesForModel(mx.modelName);
    }
    //4 remove UI settings ie. design name and design selections.
    scope.setState({ selected_ad_type: -1 });
    //5 design name
    scope.resetUserSession();

    util.store("remove", K.ACTIONS_ARRAY);
    util.store("remove", K.REDOS_ARRAY);
  }

  resetForEnvironmentSceneChange() {
    console.log("Main: resetForEnvironmentSceneChange():");
    //use asw
    let asw = scope.state.adderSceneWrapper;
    //get all models(*except for user models*)
    let userModels = scope.state.userModels;
    //not sending userAssets: was
    //==>> let userAssets = scope.state.userAssets;
    //may not need to pass userAssets along.
    //PROBLEM HERE : is losing the textures previously applied to the meshes of that model.
    // how to handle that?  or is there a way to do this with out first deleting the user models.?

    asw.removeEnvironmentModels(userModels);
    /*
   to reload user models if necessary: 
   for (let ua of userAssets) {
      scope.loadScene(ua);
      scope.defineSelectableMeshesForAdderAsset(ua);
    }*/
  }

  callback_DeleteYes() {
    scope.setState_deleteSure(true, scope.resetForDelete);
  }
  callback_DeleteNo() {
    scope.setState_deleteSure(false);
  }
  setState_deleteSure(args, callback) {
    scope.setState(
      prevState => ({
        ...prevState,
        userAction: {
          ...prevState.userAction,
          deleteSure: args
        }
      }),
      () => {
        if (typeof callback == "function") {
          callback();
        }
      }
    );
  }

  environment_Rain(action) {
    let scene = scope.state.scene;
    ///
console.log("action:",action);
    
    ///
    if (action === "start") {
      BABYLON.ParticleHelper.CreateAsync("rain", scene, false).then(set => {
        set.start();
      });
    } else if (action === "stop") {
      BABYLON.ParticleHelper.CreateAsync("rain", scene, false).then(set => {
        // set.dispose();
      });
    }
  }
  environment_Smoke() {
    let scene = scope.state.scene;
    BABYLON.ParticleHelper.CreateAsync("smoke", scene).then(set => {
      set.start();
    });
  }
  //iconDownload or iconSave_Alt
  iconSave_Alt() {
    console.log("iconSave_Alt");
    // here , was downloading the main canvas snapshot I think.
    // now wondering if it should be all of the saved designs.
    // how should we handle all the saved designs, should we only allow one at a time for simplicities sake.
    // we could make it so they could upload a previously saved design ?
    let canvas = scope.state.canvas;
    let dataURL = canvas.toDataURL("image/png");
    let button = scope.state.downloadButton;
    button.href = dataURL;
    //TODO: save this to the user session as well.
    button.click();
  }
iconGear(){
  // this is where we want to handle the hiding and showing of selection panels...
  if (scope.state.isVisibleSelectionPanel) {
    scope.sendMessage();
    scope.setState({
      isVisibleSelectionPanel: false
    });
  } else {
    scope.sendMessage();
    scope.setState({
      isVisibleSelectionPanel: true
    });
  }
}



  iconRain() {
    if (scope.state.isRaining) {
      scope.environment_Rain("stop");
      //scope.sendMessage();
      scope.setState({
        isRaining: false
      });
    } else {
      scope.environment_Rain("start");
      //scope.sendMessage();
      scope.setState({
        isRaining: true
      });
    }
  }
  iconShare() {
    console.log("iconShare");
    //let util = new AdderUtil();
    util.localStorageSpace();
    let _uuid = util.getUUID();
    console.log(_uuid);
    let type = "remove";
    let item = "util_array";
    let json = { sam: "hill" };

    let result = util.store(type, item, json);
    console.log("result:", result);
    // if (scope.state.isRaining) {
    //  // scope.environment_Rain("stop");
    //   //scope.setState({
    //    // isRaining: false
    //   //});
    // } else {
    //   // scope.environment_Rain("start");
    //   // scope.setState({
    //   //   isRaining: true
    //   // });
    // }
    //------------
    //could the let constants get in the way ?
    var canvas = scope.state.canvas;
    var dataURL = canvas.toDataURL("image/png");
    scope.setState({
      isReadyToEmail: true,
      currentDataURL: dataURL
    });
    console.log("update the image RIGHT? ");
    //----------

    // scope.environment_Rain();
    //scope.environment_Smoke();
  }

  iconSave(newDesignsArray) {
    let thatscope = scope;
    scope.setState(
      prevState => ({
        ...prevState,
        userSession: {
          ...prevState.userSession,

          savedDesigns: newDesignsArray
        }
      }),
      () => {
        //note: saves the entire 'userSession'
        let newDesign = scope.state.userSession.designModel;
        newDesign.image = scope.state.images;

        //MAY NEED TO APPEND ACTIONS ARRAY TO THE newDESIGN
        let actions = util.store("get", K.ACTIONS_ARRAY);
        newDesign.actions = actions;
        newDesign.images = thatscope.state._images;
        console.log("need the images:", thatscope.state._images);

        util.store("append", K.SAVED_DESIGNS_ARRAY, newDesign); //2 lines replace about 10
        //====>
        scope.uploadSavedDesign();
      }
    );
  }

  uploadSavedDesign() {
    let options = new Promise(function(resolve, reject) {
      const url = `${K.META_URL}/design/save`;
      let SAVED_DESIGNS_ARRAY = util.store("get", K.SAVED_DESIGNS_ARRAY);
      let params = {
        saved_designs_array: SAVED_DESIGNS_ARRAY
      };

      axios
        .post(url, params)
        .then(response => response.data)
        .then(data => {
          resolve(data);
        });
    });
    options.then(function(value) {
      console.log("value in promise response:", value);
    });
  }

  downloadSavedDesign() {
    let options = new Promise(function(resolve, reject) {
      const url = `${K.META_URL}/design/get`;
      axios
        .get(url)
        .then(response => response.data)
        .then(data => {
          resolve(data);
        });
    });
    options.then(function(value) {
      console.log("value in promise response:", value);
      util.store("set", "temp", value);
      //=====>>>> LEFT OFF HERE 10-02-2019 trying to load Saved Design....===> scope.totalRedo();
      if (value.data !== "empty") {
        scope.massageDesign();
      } else {
        console.log("design is currently empty.");
      }
    });
  }
  massageDesign() {
    /*
    Because of the nature of a series of async functions that are involved in updating the 'designer' selects, it might be better to gather all 
    the action steps and pass them along the entire process. Rather than a per action basis. However they all have to happen in order.



    */
    let temp_design = util.store("get", "temp");
    console.log("massageDesign(): temp_design:", temp_design);
    // console.log(temp_design[0].designName);
    let actions = temp_design[0].actions;
    let images = temp_design[0].images;
    console.log(actions);
    for (let action of actions) {
      //switch based on action.action -> apply appropriate method to re-install the design.
      switch (action.action) {
        case "change_name":
          this._changeName(action.to);
          break;
        case "change_asset":
          this._changeAsset(action.id);
          break;
        case "applyTextureToMesh":
          this._applyTextureToMesh(action, images); // will need to use both id and to. 'id' of the model, and 'to' to use as the uuid to get the dataURL from 'design.images'
          break;
        default:
          break;
      }
    }
  }
  _changeName(data) {
    console.log("_changeName():data", data);
    //TODO: take this value and apply it to the DOM element and check the blur method related to it...
  }
  _changeAsset(data) {
    console.log("_changeAsset():data", data);
    //TODO: here we need to pull down the asset via meta data ... or something....
    //should mirror functionality of this: callback_Designer(args = null, adderAsset = null, adderAssetObject = null)
    // in the Desiger file in the componentDidMount the code calls the meta server for all the design meta , saves it to state,
    // then runs a function to set state for ...  isOnAdType,  adType_options
    //(?) could I automate the dom steps instead?

    let arrFromStr = data.split("/");
    console.log("arrFromStr:", arrFromStr);
    /*
    ad_type 
     0 = vehicle, 
         sub_type 
            0 = 2Door, 
                 detail 
                    0 = sportscar
            1 = 4Door 
                  detail
                    0 = stationwagon 
     1 = billboard
         sub_type 
            0 = one-sided,
            1 = two-sided  
                 detail 
                    0 = parallel
                    1 = angled

    */
    var resetData = {};
    resetData.ad_type = arrFromStr[1];
    resetData.sub_type = arrFromStr[3];
    resetData.detail = arrFromStr[5];
    resetData.filename = arrFromStr[6];

    console.log("resetData:", resetData);
    this.revertChild(resetData);
    /*
    console.log("Designer.props:");
    //"ad_type", 1
    // HERE we have to use the model Id to define which ad_type we have....which is messy.
    var selectedOption = null;
    if (
      data ===
      "ad_type/billboard/sub_type/2sides/detail/angled/Billboard.v1.1.babylon"
    ) {
      selectedOption = 1;
    } else if (
      data ===
      "ad_type/vehicle/sub_type/2door/detail/sportscar/porsche2.2.1.babylon"
    ) {
      selectedOption = 0;
    }
    // This sets the selects appropriately for the top level of ad_type ( still need to load the model. and then set the next select...etc.)
    let revertData1 = { id: "ad_type", selectedOption: selectedOption };
    this.revertChild(revertData1);
    //now I need to load the asset, but I can not until the sub_type and detail have been defined.
    // let revertData2 = { id: "sub_type", selectedOption: selectedOption };
    // this.revertChild(revertData);
    */
  }

  _applyTextureToMesh(data, images) {
    //'id' of the model, and 'to' to use as the uuid to get the dataURL from 'design.images'
    // console.log("_applyTextureToMesh():data", data);
    var newArray = images.filter(function(el) {
      return el.uuid === data.to;
    });
    let imageToReApply = newArray[0].dataURL;
    //console.log("apply this image to that id.");
    //console.log("dataURL:", imageToReApply);
    //console.log("model id:", data.id);
  }

  /*
  camera target change in state does not appear to effect the existing scene?
  cameraTargetY_up() {
    console.log("up");
    let current = this.state.camera_target_y;
    current = current + 2;
    scope.setState({
      camera_target_y: current,
      camera_target: new BABYLON.Vector3(0, current, 0)
    });
  }
  cameraTargetY_down() {
    console.log("down...");
  }
*/
//rxjs 
sendMessage() {
  //does not appear to accept args.? 
  // send message to subscribers via observable subject
  //isRaining
  if(this.state.isVisibleSelectionPanel){
    messageService.sendMessage('true');
  }else{
    messageService.sendMessage('false');
  }
 
}

clearMessages() {
  // clear messages
  messageService.clearMessages();
}
//--end rxjs 

  render() {
    //rxjs 
    const { messages } = this.state;
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
            <Grid item sm={2} xs={12} id="LogoContainer">
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
            <Grid item xs={2} id="LogoContainer"></Grid>
            <Grid item xs={1} id="LogoContainer"></Grid>
            <Grid item sm={2} xs={12} id="LogoContainer">
              {/**
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
              */}
            </Grid>
            <Grid item xs={1} id="LogoContainer"></Grid>
          </Grid>
          <Grid item md={8} sm={12} xs={12}>
            <Grid container className="canvas-container">
              <div className="adder-3dTool-canvas-container">
                <canvas
                  id="adder_3dTool_canvas"
                  className="adder-3dTool-canvas"
                  style={{ boxShadow: "5px 5px 8px #2f2f2f" }}
                />
                <OverlayControlsUpperLeft
                  callback={this.subCallback}
                  callback_ScreenShotButtonPress={this.screenshotButtonPress}
                  data={{ key: "value" }}
                ></OverlayControlsUpperLeft>
                {/** <OverlayControls
                  callback={this.subCallback}
                  callback_ScreenShotButtonPress={this.screenshotButtonPress}
                  data={{ key: "value" }}
                ></OverlayControls> 
                */}

                <OverlayControlsRight
                  callback={this.subCallback}
                  data={{ key: "subCallback" }}
                ></OverlayControlsRight>
                <OverlayControlsUpperRight
                  callback={this.subCallback}
                  iconRain={this.iconRain}
                  iconGear={this.iconGear}
                  data={{ key: "iconGear" }}
                ></OverlayControlsUpperRight>
                <OverlayControlsMUIPopOver
                  callback={this.changeEnvironment}
                  data={{ key: "value" }}
                ></OverlayControlsMUIPopOver>
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

                <Grid item sm={9} xs={12} id={"iconRow1screenshots_row"}>
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
                          minConstraints={[300, 150]}
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
                              My Screenshots
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
          <Grid item md={4} xs={12}>
            <Grid container>
              <Grid item sm={1}></Grid>
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
                            imageEditorClose={this.imageEditorClose}
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
                  {/* this.designer  */}

                  <Designer
                    scene={this.state.scene}
                    getAdderSceneWrapper={this.getAdderSceneWrapper}
                    adderSceneWrapper={this.state.adderSceneWrapper}
                    callback={this.callback_Designer}
                    callback_withModelInfo={this.callback_withModelInfo}
                    register={this.register}
                  ></Designer>
                  {/**  */}

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
              <Grid item sm={1}></Grid>
            </Grid>
          </Grid>
        </Grid>
        {this.state.isReadyToEmail && (
          <Grid container>
            <Grid item xs={12}>
              <EMailer
                callback={this.subCallback}
                data={{ key: "value" }}
                currentDataURL={this.state.currentDataURL}
              ></EMailer>
            </Grid>
            <Grid item xs={12}>
              <div style={{ height: "100px", width: "100%" }}></div>
            </Grid>
          </Grid>
        )}

        {/**   DEV : commented out while trying to debug issue with modal opening twice, 
        // HOWEVER: this is an important component of the "DELETE" design process.....
        //commenting it out did not solve the problem  */}
        <MUIAlertDialog
          callback_Yes={this.callback_DeleteYes}
          callback_No={this.callback_DeleteNo}
        ></MUIAlertDialog>
        <a
          href="#"
          className="button"
          id="btn-download"
          download="my-file-name.png"
          style={{
            opacity: "0"
          }}
        >
          Download
        </a>
        {/**
          <button onClick={this.cameraTargetY_up}>+</button>
        <button onClick={this.cameraTargetY_down}>-</button>
        */}
        {/* <Grid>
          <p>rxjs</p>
          {messages.map((message, index) =>
                                        <div key={index} className="alert alert-success">{message.text}</div>
                                    )}
                                      <h2>React + RxJS Component Communication</h2>
                <button onClick={this.sendMessage} className="btn btn-primary">Send Message</button>
                <button onClick={this.clearMessages} className="btn btn-secondary">Clear Messages</button>                
           
        </Grid> */}
        {/** RXJS: had to include this so that the state changes would get detected. */}
        {/**NOT ABLE TO SEND PROPS: isRaining={this.state.isRaining} May Be Two Separate Instances... */}
        <Grid><AdderGuiUtility ></AdderGuiUtility></Grid>
      </Grid>
    );
  }
}

export default Main;
