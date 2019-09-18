import React from "react";
//import Grid from "@material-ui/core/Grid"; //
import UIButton from "./elements/UIButton";

export default function OverlayControls(props) {
  console.log("OverlayControls: props:", props);

  return (
    <div>
      <div className="gui-overlay">
        <UIButton
          title="Screen Shot"
          buttonText="Save Image"
          onClick={props.callback_ScreenShotButtonPress}
          iconName="camera_alt"
          classNames="icon_btn "
        ></UIButton>
        <UIButton
          title="crop"
          buttonText="Crop Image"
          onClick={props.callback}
          iconName="faCrop"
          classNames="icon_btn "
        ></UIButton>
        <UIButton
          title="fill"
          buttonText="Fill Color"
          onClick={props.callback}
          iconName="faFillDrip"
          classNames="icon_btn "
        ></UIButton>
        <UIButton
          title="text format"
          buttonText="text format"
          onClick={props.callback}
          iconName="faTextHeight"
          classNames="icon_btn "
        ></UIButton>

        {/**
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
