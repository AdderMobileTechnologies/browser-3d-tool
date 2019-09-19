import React from "react";
//import { makeStyles } from '@material-ui/core/styles';
import Popover from "@material-ui/core/Popover";
//import Typography from '@material-ui/core/Typography';
import Button from "@material-ui/core/Button";

import UIButton from "./elements/UIButton";
//import MUI_IconButtons from './MUI_IconButtons'
/*
const useStyles = makeStyles(theme => ({
  typography: {
    padding: theme.spacing(2),
  },
}));
*/
export default function SimplePopover(props) {
  // const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose(e) {
    setAnchorEl(null);

    if (typeof e.target.getAttribute("alt") === "object") {
      // gurad against crash
      return false;
    } else {
      let textValue = e.target.getAttribute("alt").toLowerCase();
      var data = {};
      data.selectedOption = textValue;
      // props.callback(data);
      // props.callback();
      console.log("data:", data);
    }
  }

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div>
      <UIButton
        aria-describedby={id}
        variant="contained"
        onClick={handleClick}
        iconName="faBinoculars"
      ></UIButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "center",
          horizontal: "center"
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "center"
        }}
      >
        <UIButton
          title="mountain"
          buttonText="landscape"
          onClick={handleClose}
          iconName="landscape"
          classNames="icon_btn "
        ></UIButton>
        <UIButton
          title="city"
          buttonText="city"
          onClick={handleClose}
          iconName="location_city"
          classNames="icon_btn "
        ></UIButton>

        {/**  <MUI_IconButtons></MUI_IconButtons>*/}
      </Popover>
    </div>
  );
}
/*
 <Button 
        aria-describedby={id} 
        variant="contained" 
        onClick={handleClick}>
        scene
      </Button>
      */
