import React from "react";
import UserImage from "./assets/Adder_3D_Tool2/contact_photo.png";
import { makeStyles } from "@material-ui/core/styles";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
//import GridListTileBar from "@material-ui/core/GridListTileBar";
//import IconButton from "@material-ui/core/IconButton";
//import StarBorderIcon from "@material-ui/icons/StarBorder";
import * as E from "./environment.js";
export const DefaultUserImage = UserImage;

export const META_URL = E.META_URL;
export const API_URL = E.API_URL;
//all calls to server are redirected directly to the html/assets/ folder, so that is where the 'filenames' of a models meta data picks up.

export const ACTIONS_ARRAY = "ACTIONS_ARRAY";
export const REDOS_ARRAY = "REDOS_ARRAY";
export const SAVED_DESIGNS_ARRAY = "SAVED_DESIGNS_ARRAY";

export const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflow: "hidden",

    backgroundColor: theme.palette.background.paper
  },
  gridList: {
    flexWrap: "nowrap",
    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
    transform: "translateZ(0)",
    backgroundColor: "#eee",
    height: "auto"
  }
}));
export const UIGridList = props => {
  const classes = useStyles();
  let timestamp = Date();
  return (
    <div className={classes.root}>
      <GridList className={classes.gridList} cols={3.5}>
        {props.tileData.map(tile => (
          <GridListTile
            key={timestamp + "_" + tile.img}
            style={{
              marginRight: "10px",
              height: props.height,
              width: props.width
            }}
          >
            {/** take off max value so can resize :  maxHeight: "80px" 
          can I send dimension props in for the style={{}} to use? 
          */}
            <img src={tile.img} alt={tile.title} style={{}} />
            {/**
            <GridListTileBar
              title={tile.title}
              classes={{
                root: classes.titleBar,
                title: classes.title
              }}
              actionIcon={
                <IconButton aria-label={`star ${tile.title}`}>
                  <StarBorderIcon className={classes.title} />
                </IconButton>
              }
            />
            */}
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
};
