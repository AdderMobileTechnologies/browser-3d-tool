import React from "react";
//import Grid from "@material-ui/core/Grid"; //
import UIButton from "./elements/UIButton";
//icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoffee,
  faBinoculars,
  faFillDrip,
  faCamera,
  faTextsize,
  faLock,
  faCrop,
  faObjectGroup
} from "@fortawesome/free-solid-svg-icons";

const element = <FontAwesomeIcon icon={faCoffee} />;

export default function OverlayControlsLeft(props) {
  // console.log("OverlayControls: props:", props);

  return (
    <div className="gui-overlay-left">
      <UIButton
        title="Screen Shot"
        buttonText="Save Image"
        onClick={props.callback_ScreenShotButtonPress}
        iconName="camera_alt"
        classNames="icon_btn "
      ></UIButton>
      <UIButton
        title="Screen Shot"
        buttonText="Save Image"
        onClick={props.callback_ScreenShotButtonPress}
        iconName="camera_alt"
        classNames="icon_btn "
      ></UIButton>
      <UIButton
        title="Screen Shot"
        buttonText="Save Image"
        onClick={props.callback_ScreenShotButtonPress}
        iconName="camera_alt"
        classNames="icon_btn "
      ></UIButton>
      <UIButton
        title="Screen Shot"
        buttonText="Save Image"
        onClick={props.callback_ScreenShotButtonPress}
        iconName="camera_alt"
        classNames="icon_btn "
      ></UIButton>
      {/**
      style={{ border: "dotted red 1px", borderRadius: "25px" }}
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
  );
}
