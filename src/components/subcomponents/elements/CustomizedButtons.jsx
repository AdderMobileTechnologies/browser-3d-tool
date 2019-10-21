import React from "react";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Settings_Applications from "./../../../assets/icons/settings_applications.png";
const HoverButton = withStyles(theme => ({
  root: {
    color: theme.palette.getContrastText("#666"),
    backgroundColor: "#666",
    "&:hover": {
      backgroundColor: "#333"
    }
  }
}))(Button);

const useStyles = makeStyles(theme => ({
  margin: {
    // margin: theme.spacing(1)
  }
}));

export default function CustomizedButtons() {
  const classes = useStyles();

  return (
    <div>
      <HoverButton
        variant="contained"
        color="primary"
        src={Settings_Applications}
      >
        Hover
      </HoverButton>
    </div>
  );
}
/*
theme.palette.getContrastText("#000"),

 className={classes.margin}
*/
