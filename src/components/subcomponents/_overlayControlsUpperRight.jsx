import React from "react";
//import Grid from "@material-ui/core/Grid"; //
import UIButton from "./elements/UIButton";
import MUIPopover from "./MUIPopover";
export default function OverlayControlsUpperRight(props) {
  // console.log("OverlayControls: props:", props);

  return (
    <div>
      <div className="gui-overlay-upper-right">
        <UIButton
          title="Weather"
          buttonText="weather"
          onClick={props.iconRain}
          iconName="rain"
          classNames="icon_btn overlay-button"
          style={{
            backgroundColor: "none !important",
            background: "none !important"
          }}
        ></UIButton>
        ;
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
