import React from "react";
//import Grid from "@material-ui/core/Grid"; //
import MUIPopover from "./MUIPopover";
export default function OverlayControlsRight(props) {
  //console.log("OverlayControls: props:", props);

  return (
    <div className="gui-overlay-right">
      <MUIPopover callback={props.callback}></MUIPopover>
    </div>
  );
}
