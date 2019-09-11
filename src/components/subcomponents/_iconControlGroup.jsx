import React from "react";
import Grid from "@material-ui/core/Grid"; //
import UIButton from "./elements/UIButton";
//import "./Subcomponent.css";
/**
 * Purpose:
 * This subcomponent should handle callbacks that are sent to it without choking , while not being a true React.Component.
 * I also need it to detect an 'event' and send back the e.target ...etc..
 */
/*
Call This Subcomponent Like This:
<Subcomponent
  callback={this.subCallback}
  data={{ key: "value" }}
></Subcomponent>;

...and the subCallback function looks like this...

  subCallback(args) {
    console.log("subCallback with args:", args);
  }
  
*/
export default function IconControlGroup(props) {
  console.log("SubComponent: props:", props);

  const handleSubcomponentClick = e => {
    console.log("handleSubcomponentClick .....");
    console.log("e.target.id = ", e.target.id);
    console.log("e.target.name =", e.target.name);
    console.log("props sent in during constructor:", props);
    let returnData = { id: e.target.id, name: e.target.name };
    props.callback(returnData);
  };

  return (
    <div>
      <Grid item xs={3} id={"iconRow1"} style={{ padding: "15px" }}>
        <Grid container>
          <Grid item xs={4}>
            <UIButton
              title=""
              buttonText=""
              onClick={props.callbackSave}
              iconName="save"
              // classNames="icon_btn "
              style={{ backgroundColor: "#afafaf" }}
            />
          </Grid>
          {/**
          <Grid item xs={4}>
            <UIButton
              title=""
              buttonText=""
              onClick={this.iconDelete}
              iconName="delete"
              classNames="icon_btn "
            />
          </Grid>
          <Grid item xs={4}>
            <UIButton
              title=""
              buttonText=""
              onClick={this.iconRedo}
              iconName="redo"
              classNames="icon_btn "
            />
          </Grid>
           */}
        </Grid>
        {/**
        <Grid container style={{ marginTop: "15px" }}>
          <Grid item xs={4}>
            <UIButton
              title=""
              buttonText=""
              onClick={this.iconSave_Alt}
              iconName="download"
              classNames="icon_btn "
            />
          </Grid>
          <Grid item xs={4}>
            <UIButton
              title=""
              buttonText=""
              onClick={this.iconShare}
              iconName="share"
              classNames="icon_btn "
            />
          </Grid>
          <Grid item xs={4}>
            <UIButton
              title=""
              buttonText=""
              onClick={this.iconUndo}
              iconName="undo"
              classNames="icon_btn "
            />
          </Grid>
        </Grid>
 */}
      </Grid>
      <button
        id="buttonLeft"
        name={props.data["key"]}
        onClick={handleSubcomponentClick}
      >
        Click
      </button>
    </div>
  );
}
