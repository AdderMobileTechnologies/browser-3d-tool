import React from "react";
//import Grid from "@material-ui/core/Grid"; //
import UIButton from "./elements/UIButton";

export default function OverlayControlsUpperRight(props) {
  // console.log("OverlayControls: props:", props);

  return (
    <div>
      <div className="gui-overlay-upper-left">
        <UIButton
          title="Screen Shot"
          buttonText="Save Image"
          onClick={props.callback_ScreenShotButtonPress}
          iconName="camera_alt"
          classNames="icon_btn overlay-button"
          style={{
            background: "none !important",
            backgroundColor: "none !important"
          }}
        ></UIButton>
        {/**

        <UIButton
          title="Screen Shot"
          buttonText="Save Image"
          onClick={props.callback_ScreenShotButtonPress}
          iconName="faLock"
          classNames=" icon_btn overlay-button"
          style={{
            background: "none !important",
            backgroundColor: "none !important"
          }}
        ></UIButton>

       
                <UIButton
                  title="Crop Image"
                  buttonText="Crop Image"
                  onClick={this.iconCrop}
                  iconName="crop"
                  classNames="icon_btn dev_warning"
                />
               
                <UIButton title="XXXX"
                          buttonText="XXXX"
                          
                          onClick={this.iconFormatColorFill}
                          iconName="format_color_fill"
                          classNames="icon_btn dev_warning"/>
                <UIButton title="XXXX"
                          buttonText="XXXX"
                          onClick={this.iconTextFields}
                          iconName="text_fields"
                          classNames="icon_btn dev_warning"/>
                */}
      </div>
    </div>
  );
}
