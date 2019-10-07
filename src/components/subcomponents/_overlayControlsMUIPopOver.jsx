import React from "react";
//import Grid from "@material-ui/core/Grid"; //
import UIButton from "./elements/UIButton";
import MUIPopover from "./MUIPopover";
export default function OverlayControlsMUIPopOver(props) {
  // console.log("OverlayControls: props:", props);

  return (
    <div>
      <div className="gui-overlay-mui-popover">
        <MUIPopover callback={props.callback}></MUIPopover>
      </div>
    </div>
  );
}
