import React from "react";
import Grid from "@material-ui/core/Grid"; //
import UIButton from "./elements/UIButton";

export default function IconControlGroup(props) {
  // console.log("IconControlGroup: props:", props);
  // console.log("check props data");

  const handleSaveClick = e => {
    //downsize props variables
    let _designName = props.data.designModel.designName;
    let _environmentFilepath = props.data.designModel.environmentFilepath;
    let _designs = props.data.designs;
    let _designModel = props.data.designModel;

    let design_actions =
      JSON.parse(localStorage.getItem("actions_array")) || [];
    //Check for Required fields:
    if (_designName !== "" && _designName !== "undefined") {
      if (_environmentFilepath === "" && _environmentFilepath === "undefined") {
        let envData =
          "dev_only_environment_data_see:getfilenameAndTypeOfCurrentEnvironment()";
        console.log(envData);
        alert("DESIGN: NEED DEFAULT ENVIRONMENT INFO !");
      } else {
        // was checking for significant changes to the design here with 'meshes' array in state under designModel.
        let design_obj = _designModel;

        design_obj.actions = design_actions;
        //get existing array design models
        const newDesignsArray = _designs.slice();
        //append a new one to it
        newDesignsArray.push(design_obj);
        //send new array back to be added to the state
        props.callback_Save(newDesignsArray);
      }
    } else {
      alert("DESIGN: Your Design Needs a Name.");
    }
  };

  return (
    <Grid
      item
      md={3}
      sm={12}
      xs={12}
      id={"iconRow1"}
      style={{ paddingTop: "0px" }}
    >
      <Grid container>
        <Grid item sm={4} xs={2}>
          <UIButton
            title=""
            buttonText=""
            onClick={handleSaveClick}
            iconName="save"
            callback_Save={props.iconSave}
            // classNames="icon_btn "
            style={{ backgroundColor: "#afafaf" }}
          />
        </Grid>

        <Grid item sm={4} xs={2}>
          <UIButton
            title=""
            buttonText=""
            onClick={props.callback_Delete}
            iconName="delete"
            classNames="icon_btn "
          />
        </Grid>
        <Grid item sm={4} xs={2}>
          <UIButton
            title=""
            buttonText=""
            onClick={props.callback_Redo}
            iconName="redo"
            classNames="icon_btn "
          />
        </Grid>
        {/**  */}
      </Grid>

      <Grid container style={{ marginTop: "15px" }}>
        <Grid item sm={4} xs={2}>
          <UIButton
            title=""
            buttonText=""
            onClick={props.callback_Save_Alt}
            iconName="download"
            classNames="icon_btn "
          />
        </Grid>
        <Grid item sm={4} xs={2}>
          <UIButton
            title=""
            buttonText=""
            onClick={props.callback_Share}
            iconName="share"
            classNames="icon_btn "
          />
        </Grid>
        <Grid item sm={4} xs={2}>
          <UIButton
            title=""
            buttonText=""
            onClick={props.callback_Undo}
            iconName="undo"
            classNames="icon_btn "
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
